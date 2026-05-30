import Event from "./assets/Event.js";
import {
  attemptSuccess,
  UptimeCheckAttempt,
  UptimeCheck,
} from "./assets/UptimeCheck.js";
import http from "http";
import { supabase, newClient } from "./assets/db.js";   // was: import { pool }

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const UPTIME_MONITOR_INTERVAL = 60; // seconds
const TIMEOUT_THRESHOLD = 5; // seconds
const MAX_TRIES = 3; // attempts
const RETRY_INTERVAL = 5; // seconds
const PORT = 8080;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const ALLOWED_ORIGINS = new Set([
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "https://cse110-sp26-group10.github.io/WatchTower/src/test-app/"
]);

function isUUID(uuid) {
    return typeof uuid === "string" && UUID_REGEX.test(uuid);
}

function isEmail(email) {
    return typeof email === "string" && EMAIL_REGEX.test(email);
}

function getCookie(req, name) {
    const cookie = req.headers.cookie;
    if (!cookie) return null;
    const match = cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
}

async function getAuthUserFromToken(accessToken) {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return [null, error];
    return [user, null];
}

async function getUserFromToken(accessToken) {
    const [authUser, authError] = await getAuthUserFromToken(accessToken);
    if (authError || !authUser) return [null, authError];
    const { data: user, error } = await supabase.from("users").select("*").eq("auth_id", authUser.id).limit(1).maybeSingle();
    // const { data, error } = await supabase.from("users").select("*").eq("id", 1).limit(1).maybeSingle(); // Mock data
    if (error || !user) return [null, error];
    return [user, null];
}

async function getProjectIdFromAPIKey(apiKey) {
    if (!isUUID(apiKey)) return null;
    const { data: project, error } = await supabase
        .from("projects").select("id")
        .eq("api_key", apiKey)
        .limit(1)
        .maybeSingle();
    if (error || !project) { console.error("Query failed: ", error); return null; }
    return project.id || null;
}

// Returns all events from all projects associated with the user
async function getEvents(user) {
    const { data, error } = await supabase
        .from("projects").select(`
            users_projects!inner(user_id),
            events (*)
        `)
        .eq("users_projects.user_id", user.id)
        .order("timestamp", { referencedTable: 'events', ascending: false });
    if (error) { console.error("Query failed: ", error); return []; }
    const events = data?.flatMap(item => item.events || []) || [];
    return events;
}

// Returns all uptime checks from all projects associated with the user
async function getUptimeLog(user) {
<<<<<<< HEAD
    const { data, error } = await supabase
        .from("projects").select(`
            users_projects!inner(user_id),
            website_url,
            uptime_log (*)
        `)
        .eq("users_projects.user_id", user.id)
        .order("timestamp", { referencedTable: 'uptime_log', ascending: false });
    if (error) { console.error("Query failed: ", error); return []; }
    const hostnames = new Set(data?.flatMap(item => URL.canParse(item.website_url) && new URL(item.website_url).hostname || []) || []);
    const uptimeLog = data?.flatMap(item => item.uptime_log || []) || [];
    return uptimeLog.filter((row) => hostnames.has(new URL(row.url).hostname));  // see gotcha #3
}

async function getUptimeLogForProject(project) {
    const { data, error } = await supabase
        .from("uptime_log").select("*")
        .eq("project_id", project.id)
        .order("timestamp", { ascending: false });
    if (error) { console.error("Query failed: ", error); return null; }
    return data;
}

async function logEvent(eventObject) {
    const e = eventObject.event;
    const { error } = await supabase.from("events").insert({
        event_type: e.event_type, timestamp: e.timestamp, created_at: e.created_at,
        deployment: e.deployment, ip: e.ip, project_id: e.project_id,
        current_url: e.current_url, host: e.host, pathname: e.pathname,
        referrer: e.referrer, referring_domain: e.referring_domain,
        metadata: e.metadata,
    });
    if (error) { console.error("Query failed: ", error); return; }
    console.log("Event logged");
}

async function logUptime(c) {
    const { error } = await supabase.from("uptime_log").insert({
        url: c.url, timestamp: c.timestamp, is_up: c.is_up,
        status: c.status, latency: c.latency, attempts: c.attempts,
        project_id: c.project_id
    });
    if (error) { console.error("Query failed: ", error); return; }
    console.log("Uptime logged");
}

async function getProjectStatus(project) {
    const attempts = [];
    for (let tries = 1; tries <= MAX_TRIES; tries++) {
        const startTime = new Date();
        let attempt;
        try {
            const response = await fetch(project.website_url, { mode: "no-cors", signal: AbortSignal.timeout(TIMEOUT_THRESHOLD * 1000) });
            const endTime = new Date();
            attempt = new UptimeCheckAttempt(startTime, endTime, response.status, null);
        } catch (error) {
            const endTime = new Date();
            attempt = new UptimeCheckAttempt(startTime, endTime, null, error);
        }
        attempts.push(attempt);
        if (attemptSuccess(attempt)) break;
        await sleep(RETRY_INTERVAL * 1000);
    }
    return new UptimeCheck(project.id, project.website_url, attempts);
=======
  const { data: u, error: uErr } = await supabase
    .from("users")
    .select("website_url")
    .eq("id", user.id)
    .single();
  if (uErr || !u) {
    console.error("Query failed: ", uErr);
    return [];
  }
  const hostname = new URL(u.website_url).hostname;
  const { data, error } = await supabase
    .from("uptime_log")
    .select("*")
    .order("timestamp", { ascending: false });
  if (error) {
    console.error("Query failed: ", error);
    return [];
  }
  return data.filter((row) => new URL(row.url).hostname === hostname); // see gotcha #3
}

async function logEvent(eventObject) {
  const e = eventObject.event;
  const { error } = await supabase.from("events").insert({
    event_type: e.event_type,
    timestamp: e.timestamp,
    created_at: e.created_at,
    deployment: e.deployment,
    ip: e.ip,
    user_id: e.user_id,
    current_url: e.current_url,
    host: e.host,
    pathname: e.pathname,
    referrer: e.referrer,
    referring_domain: e.referring_domain,
    metadata: e.metadata,
  });
  if (error) {
    console.error("Query failed: ", error);
    return;
  }
  console.log("Event logged");
}

async function logUptime(c) {
  const { error } = await supabase.from("uptime_log").insert({
    url: c.url,
    timestamp: c.timestamp,
    is_up: c.is_up,
    status: c.status,
    latency: c.latency,
    attempts: c.attempts,
  });
  if (error) {
    console.error("Query failed: ", error);
    return;
  }
  console.log("Uptime logged");
}

async function getWebsiteStatus(url) {
  const attempts = [];
  for (let tries = 1; tries <= MAX_TRIES; tries++) {
    const startTime = new Date();
    let attempt;
    try {
      const response = await fetch(url, {
        mode: "no-cors",
        signal: AbortSignal.timeout(TIMEOUT_THRESHOLD * 1000),
      });
      const endTime = new Date();
      attempt = new UptimeCheckAttempt(
        startTime,
        endTime,
        response.status,
        null,
      );
    } catch (error) {
      const endTime = new Date();
      attempt = new UptimeCheckAttempt(startTime, endTime, null, error);
    }
    attempts.push(attempt);
    if (attemptSuccess(attempt)) break;
    await sleep(RETRY_INTERVAL * 1000);
  }
  return new UptimeCheck(url, attempts);
>>>>>>> 614c9ed06fd99d8dae2767c77855a2adc2f9d235
}

async function sendAlert(user, uptimeCheck) {
  for (let tries = 1; tries <= MAX_TRIES; tries++) {
    try {
      console.log("Placeholder", user, uptimeCheck);
      return true;
    } catch (error) {
      console.error("Alert error: ", error);
    }
    await sleep(RETRY_INTERVAL * 1000);
  }
  console.error("Alert failed");
  return false;
}

<<<<<<< HEAD
async function monitorProject(user, project) {
    if (new URL(project.website_url).hostname === "localhost") {
        console.warn("Monitoring skipped for localhost");
        return;
    }
    while (true) {
        const uptimeCheck = await getProjectStatus(project);
        if (!uptimeCheck.is_up) {
            const uptimeLog = await getUptimeLogForProject(project);
            if (uptimeLog && (uptimeLog.length == 0 || uptimeLog[0].is_up)) { // Only sends alert once each time the website goes down
                sendAlert(user, uptimeCheck); // Runs asynchronously
            }
        }
        await logUptime(uptimeCheck);
        await sleep(UPTIME_MONITOR_INTERVAL * 1000);
=======
async function monitorWebsite(user) {
  while (true) {
    const uptimeCheck = await getWebsiteStatus(user.website_url);
    if (!uptimeCheck.is_up) {
      const uptimeLog = await getUptimeLog(user);
      if (uptimeLog.length == 0 || uptimeLog.at(-1).is_up) {
        // Only sends alert once each time the website goes down
        sendAlert(user, uptimeCheck); // Runs asynchronously
      }
>>>>>>> 614c9ed06fd99d8dae2767c77855a2adc2f9d235
    }
    await logUptime(uptimeCheck);
    await sleep(UPTIME_MONITOR_INTERVAL * 1000);
  }
}

<<<<<<< HEAD
async function initUser(user) {
    const { data, error } = await supabase.from("users_projects").select("projects(*)").eq("user_id", user.id);
    if (error) { console.error("Failed to load projects: ", error); return; }
    for (const entry of data) monitorProject(user, entry.projects);
=======
function initUser(user) {
  if (new URL(user.website_url).hostname === "localhost") {
    console.warn("Monitoring skipped for localhost");
    return;
  }
  monitorWebsite(user);
>>>>>>> 614c9ed06fd99d8dae2767c77855a2adc2f9d235
}

async function initUsers() {
  const { data, error } = await supabase.from("users").select("*");
  if (error) {
    console.error("Failed to load users: ", error);
    return;
  }
  for (const user of data) initUser(user);
}

function invalidateRequest(res, msg) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({error: msg || "Invalid request"}));
}

function unauthorizedRequest(res, msg) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({error: msg || "Unauthorized"}));
}

function validateSession(res, session) {
    res.setHeader("Set-Cookie", [
        `access_token=${session.access_token}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=3600`,
        `refresh_token=${session.refresh_token}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=2592000`
    ]);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "success" }));
}

function invalidateSession(res) {
    res.writeHead(200, {
        "Set-Cookie": [
            "access_token=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0",
            "refresh_token=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0"
        ],
        "Content-Type": "application/json"
    });
    res.end(JSON.stringify({ status: "success" }));
}

const server = http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*"); // Allow any site
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");

<<<<<<< HEAD
    const requestUrl = new URL(req.url, `http://${req.headers.host || `localhost:${PORT}`}`);
    const requestPath = requestUrl.pathname;
    // const searchParams = requestUrl.searchParams; // Not currently in use
    
    // Allow requests with credentials to work when they are sent from an allowed origin
    const origin = req.headers.origin;
    if (ALLOWED_ORIGINS.has(origin)) res.setHeader("Access-Control-Allow-Origin", origin);

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
    } else if (req.method === "GET") {
        const accessToken = getCookie(req, "access_token");
        if (!accessToken) {
            unauthorizedRequest(res, "Missing access token");
            console.error("Missing access token");
            return;
        }
        const [user, error] = await getUserFromToken(accessToken);
        if (error || !user) {
            unauthorizedRequest(res);
            console.error("Invalid access token: ", error || "Invalid credentials");
            return;
        }
        if (requestPath === "/api/events") {
            const events = await getEvents(user);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(events));
            console.log("Event log sent");
        } else if (requestPath === "/api/uptime") {
            const uptimeLog = await getUptimeLog(user);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(uptimeLog));
            console.log("Uptime log sent");
        } else {
            invalidateRequest(res);
        }
    } else if (req.method === "POST") {
        let body = "";
        req.on("data", chunk => {
            body += chunk.toString();
            if (body.length > 1e6) { // Kill the connection if the log is over 1 MB
                req.destroy();
            }
        });
        req.on("end", async () => {
            if (requestPath === "/api/log") {
                try {
                    const authHeader = req.headers["authorization"];
                    if (!authHeader || !authHeader.startsWith("Bearer ")) {
                        unauthorizedRequest(res);
                        console.error("No API key provided");
                        return;
                    }
                    const apiKey = authHeader.split(" ")[1];
                    const projectId = await getProjectIdFromAPIKey(apiKey);
                    if (projectId === null) {
                        unauthorizedRequest(res);
                        console.error("API key invalid");
                        return;
                    };
                    const eventObject = new Event(body);
                    if (!eventObject.valid) throw new Error("Invalid event");
                    eventObject.setField("project_id", projectId);
                    eventObject.setField("ip", req.socket.remoteAddress);
                    logEvent(eventObject);
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ status: "success" }));
                } catch (error) {
                    invalidateRequest(res, "Invalid event");
                    console.error("Event log failed: ", error);
                }
            } else if (requestPath === "/signup") {
                try {
                    const { email, password } = JSON.parse(body);
                    if (!email || !password) {
                        invalidateRequest(res, "Missing email or password");
                        console.error("Missing email or password");
                        return;
                    }
                    if (!isEmail(email)) {
                        invalidateRequest(res, "Invalid email");
                        console.error("Invalid email");
                        return;
                    }
                    const { data, error } = await newClient().auth.signUp({email, password});
                    if (error || !data.session || !data.user) throw new Error(error || "Invalid credentials");
                    const { error: creationError } = await supabase.from("users").insert({ auth_id: data.user.id });
                    if (!creationError) {
                        console.log("User creation success");
                    } else {
                        console.error("User creation failed: ", creationError);
                    }
                    validateSession(res, data.session);
                    console.log("Signed up successfully");
                } catch (error) {
                    invalidateRequest(res);
                    console.error("Sign up failed: ", error);
                }
            } else if (requestPath === "/login") {
                try {
                    const { email, password } = JSON.parse(body);
                    if (!email || !password) {
                        invalidateRequest(res, "Missing email or password");
                        console.error("Missing email or password");
                        return;
                    }
                    const { data, error } = await newClient().auth.signInWithPassword({email, password});
                    if (error || !data.session) throw new Error(error || "Invalid credentials");
                    validateSession(res, data.session);
                    console.log("Logged in successfully");
                } catch (error) {
                    invalidateRequest(res);
                    console.error("Login failed: ", error);
                }
            } else if (requestPath === "/logout") {
                const accessToken = getCookie(req, "access_token");
                if (accessToken) {
                    await newClient().auth.signOut(accessToken).catch((error) => {
                        console.error("Sign out failed: ", error);
                    });
                }
                invalidateSession(res);
                console.log("Logged out successfully");
            } else if (requestPath === "/auth/refresh") {
                const refreshToken = getCookie(req, "refresh_token");
                if (!refreshToken) {
                    unauthorizedRequest(res, "Missing refresh token");
                    console.error("Missing refresh token");
                    return;
                }
                const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
                if (error || !data.session) {
                    unauthorizedRequest(res);
                    console.error("Invalid refresh token: ", error || "Invalid credentials");
                    return;
                }
                validateSession(res, data.session);
            } else if (requestPath === "/projects/add") {
                const accessToken = getCookie(req, "access_token");
                if (!accessToken) {
                    unauthorizedRequest(res, "Missing access token");
                    console.error("Missing access token");
                    return;
                }
                const [user, userError] = await getUserFromToken(accessToken);
                if (userError || !user) {
                    unauthorizedRequest(res);
                    console.error("Invalid access token: ", userError || "Invalid credentials");
                    return;
                }
                try {
                    const { name, website_url } = JSON.parse(body);
                    if (!name || !website_url) {
                        invalidateRequest(res, "Missing name or website URL");
                        console.error("Missing name or website URL");
                        return;
                    }
                    if (!URL.canParse(website_url)) {
                        invalidateRequest(res, "Invalid website URL");
                        console.error("Invalid website URL");
                        return;
                    }
                    const { data: project, error } = await supabase.from("projects").insert({name, website_url}).select().single();
                    if (error) throw new Error(error);
                    const { error : relationError } = await supabase.from("users_projects").insert({user_id: user.id, project_id: project.id});
                    if (relationError) throw new Error(relationError);
                    monitorProject(user, project); // Start monitoring the website
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ status: "success" }));
                } catch (error) {
                    invalidateRequest(res);
                    console.error("Project creation failed: ", error);
                }
            } else {
                invalidateRequest(res);
            }
        });
=======
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
  } else if (req.method === "GET") {
    const user = getUserFromRequest(req);
    if (req.url === "/api/events") {
      const events = await getEvents(user);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(events));
      console.log("Event log sent");
    } else if (req.url === "/api/uptime") {
      const uptimeLog = await getUptimeLog(user);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(uptimeLog));
      console.log("Uptime log sent");
>>>>>>> 614c9ed06fd99d8dae2767c77855a2adc2f9d235
    }
  } else if (req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
      if (body.length > 1e6) {
        // Kill the connection if the log is over 1 MB
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        const eventObject = new Event(body);
        if (!eventObject.valid) throw new Error("Invalid event");
        eventObject.setField("ip", req.socket.remoteAddress);
        logEvent(eventObject);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "success" }));
      } catch {
        res.writeHead(400);
        res.end("Invalid event");
        console.error("\nInvalid event");
      }
    });
  }
});

<<<<<<< HEAD
server.listen(PORT, () => {
    console.log("Server running");
    initUsers();
=======
server.listen(8080, () => {
  console.log("Server running");
  initUsers();
>>>>>>> 614c9ed06fd99d8dae2767c77855a2adc2f9d235
});
