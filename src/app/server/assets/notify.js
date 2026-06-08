import "dotenv/config";
import { supabase, dbHelper } from "./db.js";
import nodemailer from "nodemailer";

// Public ntfy server by default. Override with NTFY_BASE_URL to self-host.
const NTFY_BASE_URL = process.env.NTFY_BASE_URL || "https://ntfy.sh";
const NTFY_PREFIX = "WatchTower_";
const NTFY_STORAGE_SUFFIX = "_Storage";
const MAX_TRIES = 3;
const RETRY_INTERVAL = 5; // seconds

// Suppress repeat notifications for identical errors. An error is "identical"
// when its project + severity + message + path match. After notifying, further
// matches are skipped until the cooldown elapses. State is in-memory, so it
// resets on server restart.
const ERROR_NOTIFY_COOLDOWN = 10 * 60 * 1000; // 10 minutes, in ms
const errorNotifyCooldowns = new Map(); // key -> last-notified timestamp (ms)

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// HTML-escapes a value for safe interpolation into HTML text or attribute content.
const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const safeUrl = (u) => {
  try {
    const p = new URL(String(u ?? ""));
    return p.protocol === "http:" || p.protocol === "https:"
      ? esc(p.href)
      : "#";
  } catch {
    return "#";
  }
};

/**
 * Looks up the email address tied to a WatchTower user via Supabase Auth.
 * The email is not stored in public.users, so we read it from auth.users
 * using the service-role client.
 * @param {Object} user A row from the public.users table (needs auth_id).
 * @returns {Promise<string|null>} The user's email, or null if unavailable.
 */
async function getUserEmail(user) {
  if (!user || !user.auth_id) return null;
  const { data, error } = await supabase.auth.admin.getUserById(user.auth_id);
  if (error || !data || !data.user) {
    console.error("Email lookup failed: ", error || "No auth user");
    return null;
  }
  return data.user.email || null;
}

/**
 * Publishes a push notification to an ntfy topic.
 * @param {string} topic The ntfy topic (we use the user's alert_id).
 * @param {Object} payload Notification fields.
 * @param {string} payload.title Short notification title (ASCII only).
 * @param {string} payload.message Notification body.
 * @param {string} [payload.html] HTML report to upload as an attachment.
 * @param {string} [payload.priority] ntfy priority: min|low|default|high|max.
 * @param {string[]} [payload.tags] ntfy tags/emoji shortcodes.
 * @returns {Promise<void>} Resolves on success, throws on a non-OK response.
 */
async function publishNtfy(
  topic,
  { title, message, html, priority = "default", tags = [] },
) {
  const uploadHeaders = {
    "X-Filename": `WTReport_${new Date().toISOString().replace(/\D/g, "").slice(0, 14)}.html`,
  };
  const uploadResponse = await fetch(
    `${NTFY_BASE_URL}/${encodeURIComponent(NTFY_PREFIX + topic + NTFY_STORAGE_SUFFIX)}`,
    {
      method: "POST",
      headers: uploadHeaders,
      body: html,
    },
  );
  if (!uploadResponse.ok)
    throw new Error(`ntfy responded ${uploadResponse.status}`);
  const uploadResult = await uploadResponse.json();
  if (!uploadResult?.attachment?.url)
    throw new Error(`ntfy attachment url not found`);
  const headers = {
    "Content-Type": "application/json",
    "X-Markdown": "yes",
    "X-Priority": String(priority),
  };
  const payload = {
    topic: NTFY_PREFIX + topic,
    title: title,
    message: `${message}\n\nPlease review the full report:`,
    actions: [
      {
        action: "view",
        label: "📋 Download HTML Report",
        url: uploadResult.attachment.url,
      },
    ],
  };
  if (tags.length) headers["X-Tags"] = tags.join(",");
  const response = await fetch(`${NTFY_BASE_URL}`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`ntfy responded ${response.status}`);
}

let transporter = null;

// Builds (once) a Gmail SMTP transporter from env, or null if unconfigured.
function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
}

/**
 * Sends an email copy of an alert via Gmail SMTP. Kept separate from the push
 * so an email outage never blocks the ntfy notification.
 * @param {string} to Recipient email address.
 * @param {Object} payload Notification fields (title, html).
 * @returns {Promise<boolean>} True if the email was sent.
 */
async function sendEmail(to, { title, html }) {
  const mailer = getTransporter();
  if (!mailer) {
    console.warn(`Email skipped (SMTP not configured): would email ${to}`);
    return false;
  }
  await mailer.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: title,
    html,
  });
  console.log("Email sent");
  return true;
}

// Channels used when the notify_methods column was not loaded onto the user
const DEFAULT_NOTIFY_METHODS = ["push", "email"];

/**
 * Notifies a single user over the channels listed in their notify_methods
 * (e.g. ["push", "email"]). Channels are sent independently; the push is
 * retried a few times before giving up. Falls back to all channels when the
 * preference is unset.
 * @param {Object} user A row from public.users (needs alert_id and auth_id).
 * @param {Object} payload See publishNtfy payload.
 * @returns {Promise<boolean>} True if a push was delivered, false otherwise.
 */
export async function notify(user, payload) {
  if (!user || !user.alert_id) {
    console.error("Cannot notify: user has no alert_id");
    return false;
  }
  // notify_methods: an array => exactly those channels (incl. [] for none);
  // null => the user opted out of everything; undefined => the caller did not
  // load the column, so fall back to all channels.
  const methods =
    user.notify_methods === undefined
      ? DEFAULT_NOTIFY_METHODS
      : user.notify_methods || [];

  let pushed = false;
  if (methods.includes("push")) {
    for (let tries = 1; tries <= MAX_TRIES; tries++) {
      try {
        await publishNtfy(user.alert_id, payload);
        console.log("Push sent");
        pushed = true;
        break;
      } catch (error) {
        console.error("Push error: ", error);
      }
      await sleep(RETRY_INTERVAL * 1000);
    }
  }
  if (methods.includes("email")) {
    const email = await getUserEmail(user);
    if (email)
      await sendEmail(email, payload).catch((error) =>
        console.error("Email error: ", error),
      );
  }
  return pushed;
}

/**
 * Notifies every user attached to a project that a website went down.
 * @param {Object} project The project row that failed its uptime check.
 * @param {Object} uptimeCheck The failing UptimeCheck.
 * @returns {Promise<void>}
 */
export async function notifyDowntime(project, uptimeCheck) {
  const users = await getProjectUsers(project.id);
  const detail = `${project.name} appears to be offline.`;
  const urlInfo = `URL: ${project.website_url}`;
  const timestampInfo = `Timestamp: ${uptimeCheck.timestamp}`;
  const errorInfo = `Error: ${uptimeCheck.attempts?.at(-1)?.error?.cause?.code || "UNKNOWN_ERROR"}`;
  const statusInfo = `HTTP Status: ${uptimeCheck.status || "N/A"}`;
  const latencyInfo = `Latency: ${uptimeCheck.latency} ms`;
  await Promise.allSettled(
    users.map((user) =>
      notify(user, {
        title: `${project.name} is down`,
        message: `[CRITICAL] ${detail}\n\n${urlInfo}\n${timestampInfo}\n${errorInfo}\n${statusInfo}\n${latencyInfo}`,
        html: generateDowntimeHtml(project, uptimeCheck),
        priority: "high",
        tags: ["rotating_light"],
      }),
    ),
  );
}

/**
 * Notifies every user attached to a project about a logged error event.
 * @param {Object} event A logged event row with event_type === "error".
 * @returns {Promise<void>}
 */
export async function notifyError(event) {
  if (!event || event.event_type !== "error") return;
  const severity = event.metadata && event.metadata.severity;
  const detail =
    (event.metadata && event.metadata.message) || "An error was reported.";
  const urlInfo = `URL: ${event.current_url}`;
  const timestampInfo = `Timestamp: ${event.timestamp}`;
  const deploymentInfo = `Deployment ID: ${event.deployment?.id || "N/A"}\nVersion: ${event.deployment?.version || "N/A"}\nCommit: ${event.deployment?.commit_hash || "N/A"}`;
  const browserInfo = `Browser: ${event.browser?.name || "N/A"} ${event.browser?.version || ""}`;

  // Skip if an identical error was already notified within the cooldown window.
  if (isErrorOnCooldown(event, severity, detail)) {
    console.log("Error notification suppressed (cooldown):", detail);
    return;
  }

  const { project } = await dbHelper.getProjectFromId(event.project_id);
  const users = await getProjectUsers(event.project_id);
  await Promise.allSettled(
    users.map((user) =>
      notify(user, {
        title: `Error on ${project?.name || event.host}`,
        message: `${severity ? `[${severity.toUpperCase()}] ` : ""}${detail}\n\n${urlInfo}\n${timestampInfo}\n${deploymentInfo}\n${browserInfo}`,
        html: generateErrorHtml(project, event),
        priority: severity === "critical" ? "high" : "default",
        tags: [severity === "critical" ? "rotating_light" : "warning"],
      }),
    ),
  );
}

/**
 * Tracks per-error cooldowns to avoid notifying repeatedly for identical errors.
 * Returns true if an identical error (same project + severity + message + path)
 * was notified within ERROR_NOTIFY_COOLDOWN; otherwise records the current time
 * and returns false so the caller proceeds to notify.
 * @param {Object} event A logged error event row.
 * @param {string} [severity] The error severity from metadata.
 * @param {string} message The error message used as part of the identity key.
 * @returns {boolean} Whether the notification should be suppressed.
 */
function isErrorOnCooldown(event, severity, message) {
  const now = Date.now();
  const key = `${event.project_id}|${severity || ""}|${message}|${event.pathname || ""}`;

  const last = errorNotifyCooldowns.get(key);
  if (last !== undefined && now - last < ERROR_NOTIFY_COOLDOWN) return true;

  errorNotifyCooldowns.set(key, now);

  // Opportunistically drop expired entries so the map doesn't grow unbounded.
  for (const [k, ts] of errorNotifyCooldowns) {
    if (now - ts >= ERROR_NOTIFY_COOLDOWN) errorNotifyCooldowns.delete(k);
  }
  return false;
}

/**
 * Returns all users associated with a given project.
 * @param {number} projectId The project id.
 * @returns {Promise<Object[]>} Array of public.users rows.
 */
async function getProjectUsers(projectId) {
  const { data, error } = await supabase
    .from("users_projects")
    .select("users(*)")
    .eq("project_id", projectId);
  if (error) {
    console.error("Failed to load project users: ", error);
    return [];
  }
  return (data || []).flatMap((row) => row.users || []);
}

function generateDowntimeHtml(project, uptimeCheck) {
  const logoUrl =
    "https://cdn.jsdelivr.net/gh/cse110-sp26-group10/WatchTower@main/src/app/dashboard/public/logo.svg";
  const latestError =
    uptimeCheck.attempts?.at(-1)?.error?.cause?.code || "UNKNOWN_ERROR";
  const badgeBg = "#fef2f2";
  const badgeBorder = "#fecaca";
  const badgeTextColor = "#dc2626";
  const indicatorStrip = "#ef4444";
  const emoji = "🚨";
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>WatchTower Alert: Website Down</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f5f7; padding: 20px 0;">
        <tr>
          <td align="center">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e1e4e8;">

              <!-- Header Section -->
              <tr>
                <td style="background-color: #1a1f2c; padding: 24px; text-align: center; border-bottom: 4px solid ${indicatorStrip};">
                  <img src="${logoUrl}" alt="WatchTower Logo" width="40" style="display: block; margin: 0 auto 12px auto; max-width: 40px; height: auto; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.2));" />
                  <span style="color: #ffffff; font-size: 14px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">WatchTower Incident Alert</span>
                </td>
              </tr>

              <!-- Alert Status Panel -->
              <tr>
                <td style="padding: 32px 32px 20px 32px; text-align: center;">
                  <div style="display: inline-block; background-color: ${badgeBg}; border: 1px solid ${badgeBorder}; border-radius: 20px; padding: 6px 16px; margin-bottom: 16px;">
                    <span style="color: ${badgeTextColor}; font-size: 14px; font-weight: 700; text-transform: uppercase;">${emoji} DOWNTIME DETECTED</span>
                  </div>
                  <h1 style="color: #0f172a; font-size: 24px; font-weight: 700; margin: 0 0 8px 0; line-height: 1.3;">Your website is currently down</h1>
                  <p style="color: #64748b; font-size: 16px; margin: 0; line-height: 1.5;">WatchTower monitors detected a critical outage for your project.</p>
                </td>
              </tr>

              <!-- Target URL Details Box -->
              <tr>
                <td style="padding: 0 32px 24px 32px;">
                  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; text-align: left;">
                    <div style="font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px;">Target URL</div>
                    <div style="font-size: 15px; font-weight: 500; color: #0f172a; word-break: break-all;"><a href="${safeUrl(uptimeCheck.url)}" target="_blank" style="color: #2563eb; text-decoration: none;">${esc(uptimeCheck.url)}</a></div>
                  </div>
                </td>
              </tr>

              <!-- Incident Properties Table -->
              <tr>
                <td style="padding: 0 32px 24px 32px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                      <td style="padding: 10px 0; color: #64748b; font-weight: 500; width: 35%;">Project Name</td>
                      <td style="padding: 10px 0; color: #0f172a; font-weight: 600;">${esc(project.name)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                      <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Detected At</td>
                      <td style="padding: 10px 0; color: #0f172a;">${esc(uptimeCheck.timestamp)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                      <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Error Code</td>
                      <td style="padding: 10px 0; color: #ef4444; font-weight: bold; font-family: monospace;">${esc(latestError)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                      <td style="padding: 10px 0; color: #64748b; font-weight: 500;">HTTP Status</td>
                      <td style="padding: 10px 0; color: #0f172a; font-weight: bold; font-family: monospace;">${esc(uptimeCheck.status || "N/A")}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                      <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Latency Check</td>
                      <td style="padding: 10px 0; color: #0f172a;">${esc(uptimeCheck.latency)} ms</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Failed Attempts</td>
                      <td style="padding: 10px 0; color: #0f172a;">${uptimeCheck.attempts?.length || 0} sequential retries</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Dynamic CTA Button Box -->
              <tr>
                <td align="center" style="padding: 8px 32px 36px 32px;">
                  <table border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" bgcolor="#1a1f2c" style="border-radius: 6px;">
                        <a href="${safeUrl(project?.website_url)}" target="_blank" style="display: inline-block; padding: 12px 28px; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 6px;">Go to Project Root</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer Metadata Block -->
              <tr>
                <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 32px; text-align: center;">
                  <p style="margin: 0 0 4px 0; font-size: 12px; color: #94a3b8;">This automated incident dispatch was sent by your configured WatchTower Agent.</p>
                  <p style="margin: 0; font-size: 11px; color: #cbd5e1; font-family: monospace;">Project: ${esc(project?.id)}</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function generateErrorHtml(project, event) {
  const logoUrl =
    "https://cdn.jsdelivr.net/gh/cse110-sp26-group10/WatchTower@main/src/app/dashboard/public/logo.svg";
  const errorMessage =
    event.metadata?.message ||
    "Unknown exceptions caught in target application execution context.";
  const severity = (event.metadata?.severity || "error").toUpperCase();

  // Decide contextual tint borders dynamically
  const badgeBg = severity === "CRITICAL" ? "#fef2f2" : "#fffbeb";
  const badgeBorder = severity === "CRITICAL" ? "#fecaca" : "#fef3c7";
  const badgeTextColor = severity === "CRITICAL" ? "#dc2626" : "#d97706";
  const indicatorStrip = severity === "CRITICAL" ? "#ef4444" : "#f59e0b";
  const emoji = severity === "CRITICAL" ? "🚨" : "⚠️";
  const referrerHref = event.referrer
    ? `href="${safeUrl(event.referrer)}"`
    : "";
  const referrerColor = event.referrer ? "#2563eb" : "#334155";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>WatchTower Telemetry: App Exception Trace</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f5f7; padding: 20px 0;">
        <tr>
          <td align="center">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e1e4e8;">

              <!-- Header Section -->
              <tr>
                <td style="background-color: #1a1f2c; padding: 24px; text-align: center; border-bottom: 4px solid ${indicatorStrip};">
                  <img src="${logoUrl}" alt="WatchTower Logo" width="40" style="display: block; margin: 0 auto 12px auto; max-width: 40px; height: auto; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.2));" />
                  <span style="color: #ffffff; font-size: 14px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">WatchTower Incident Alert</span>
                </td>
              </tr>

              <!-- Alert Status Panel -->
              <tr>
                <td style="padding: 32px 32px 20px 32px; text-align: center;">
                  <div style="display: inline-block; background-color: ${badgeBg}; border: 1px solid ${badgeBorder}; border-radius: 20px; padding: 6px 16px; margin-bottom: 16px;">
                    <span style="color: ${badgeTextColor}; font-size: 14px; font-weight: 700; text-transform: uppercase;">${emoji} RUNTIME CRASH [${esc(severity)}]</span>
                  </div>
                  <h1 style="color: #0f172a; font-size: 24px; font-weight: 700; margin: 0 0 8px 0; line-height: 1.3;">New event exception captured</h1>
                  <p style="color: #64748b; font-size: 16px; margin: 0; line-height: 1.5;">WatchTower tracker detected an unhandled client error inside production builds.</p>
                </td>
              </tr>

              <!-- Error Code Display Block -->
              <tr>
                <td style="padding: 0 32px 24px 32px;">
                  <div style="background-color: #0f172a; border-radius: 6px; padding: 20px; text-align: left; box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);">
                    <div style="font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">Exception Payload Message</div>
                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 14px; color: #f8fafc; line-height: 1.6; word-break: break-word;">${esc(errorMessage)}</div>
                  </div>
                </td>
              </tr>

              <!-- Metadata Metrics Details -->
              <tr>
                <td style="padding: 0 32px 24px 32px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 14px; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                      <td style="padding: 10px 0; color: #64748b; font-weight: 500; width: 35%;">Project Name</td>
                      <td style="padding: 10px 0; color: #0f172a; font-weight: 600;">${esc(project?.name || "Unknown")}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                      <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Incident Route</td>
                      <td style="padding: 10px 0; color: #2563eb; word-break: break-all;">
                        <a href="${safeUrl(event.current_url)}" target="_blank" style="color: #2563eb; text-decoration: none;">${esc(event.pathname || event.current_url)}</a>
                      </td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                      <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Referrer Origin</td>
                      <td style="padding: 10px 0; color: #2563eb; word-break: break-all;">
                        <a ${referrerHref} target="_blank" style="color: ${referrerColor}; text-decoration: none;">${esc(event.referrer || "N/A")}</a>
                      </td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                      <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Deployment ID</td>
                      <td style="padding: 10px 0; color: #334155; font-family: monospace; font-weight: bold;">
                        ${esc(event.deployment?.id || "N/A")} (${esc(event.deployment?.version || "system")})
                      </td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                      <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Commit Hash</td>
                      <td style="padding: 10px 0; color: #334155; font-family: monospace; font-weight: bold;">
                        ${esc(event.deployment?.commit_hash || "N/A")} (${esc(event.deployment?.author || "System")})
                      </td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                      <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Captured At</td>
                      <td style="padding: 10px 0; color: #0f172a;">${esc(event.timestamp)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                      <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Origin Client IP</td>
                      <td style="padding: 10px 0; color: #0f172a; font-family: monospace;">${esc(event.ip)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Client Browser</td>
                      <td style="padding: 10px 0; color: #0f172a; font-family: monospace;">
                        ${esc(event.browser?.name || "N/A")} ${esc(event.browser?.version || "")}</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Dynamic CTA Button Box -->
              <tr>
                <td align="center" style="padding: 8px 32px 36px 32px;">
                  <table border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" bgcolor="#1a1f2c" style="border-radius: 6px;">
                        <a href="${safeUrl(project?.website_url)}" target="_blank" style="display: inline-block; padding: 12px 28px; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 6px;">Go to Project Root</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer Metadata Block -->
              <tr>
                <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 32px; text-align: center;">
                  <p style="margin: 0 0 4px 0; font-size: 12px; color: #94a3b8;">This automated incident dispatch was sent by your configured WatchTower Agent.</p>
                  <p style="margin: 0; font-size: 11px; color: #cbd5e1; font-family: monospace;">Project: ${esc(project?.id)}</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
