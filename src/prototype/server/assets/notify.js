import "dotenv/config";
import { supabase } from "./db.js";
import nodemailer from "nodemailer";

// Public ntfy server by default. Override with NTFY_BASE_URL to self-host.
const NTFY_BASE_URL = process.env.NTFY_BASE_URL || "https://ntfy.sh";
const MAX_TRIES = 3;
const RETRY_INTERVAL = 5; // seconds

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
 * @param {string} [payload.priority] ntfy priority: min|low|default|high|max.
 * @param {string[]} [payload.tags] ntfy tags/emoji shortcodes.
 * @returns {Promise<void>} Resolves on success, throws on a non-OK response.
 */
async function publishNtfy(topic, { title, message, priority = "default", tags = [] }) {
    const headers = {
        "Content-Type": "text/plain",
        "X-Title": title,
        "X-Priority": String(priority)
    };
    if (tags.length) headers["X-Tags"] = tags.join(",");
    const response = await fetch(`${NTFY_BASE_URL}/${encodeURIComponent(topic)}`, {
        method: "POST",
        headers,
        body: message
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
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    return transporter;
}

/**
 * Sends an email copy of an alert via Gmail SMTP. Kept separate from the push
 * so an email outage never blocks the ntfy notification.
 * @param {string} to Recipient email address.
 * @param {Object} payload Notification fields (title, message).
 * @returns {Promise<boolean>} True if the email was sent.
 */
async function sendEmail(to, { title, message }) {
    const mailer = getTransporter();
    if (!mailer) {
        console.warn(`Email skipped (SMTP not configured): would email ${to}`);
        return false;
    }
    await mailer.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject: title,
        text: message
    });
    console.log("Email sent");
    return true;
}


/**
 * Notifies a single user over ntfy (push) and email. Push and email are sent
 * independently; the push is retried a few times before giving up.
 * @param {Object} user A row from public.users (needs alert_id and auth_id).
 * @param {Object} payload See publishNtfy payload.
 * @returns {Promise<boolean>} True if the push was delivered, false otherwise.
 */
export async function notify(user, payload) {
    if (!user || !user.alert_id) {
        console.error("Cannot notify: user has no alert_id");
        return false;
    }
    let pushed = false;
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
    const email = await getUserEmail(user);
    if (email) await sendEmail(email, payload).catch((error) => console.error("Email error: ", error));
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
    await Promise.allSettled(users.map((user) => notify(user, {
        title: `${project.name} is down`,
        message: `${project.website_url} appears to be offline.`,
        priority: "high",
        tags: ["warning"]
    })));
}

/**
 * Notifies every user attached to a project about a logged error event.
 * @param {Object} event A logged event row with event_type === "error".
 * @returns {Promise<void>}
 */
export async function notifyError(event) {
    if (!event || event.event_type !== "error") return;
    const severity = event.metadata && event.metadata.severity;
    const detail = (event.metadata && event.metadata.message) || "An error was reported.";
    const users = await getProjectUsers(event.project_id);
    await Promise.allSettled(users.map((user) => notify(user, {
        title: `Error on ${event.host}`,
        message: `${severity ? `[${severity}] ` : ""}${detail}\n${event.current_url}`,
        priority: severity === "high" ? "high" : "default",
        tags: ["rotating_light"]
    })));
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

