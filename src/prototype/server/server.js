import Event from "./assets/Event.js";
import {attemptSuccess, UptimeCheckAttempt, UptimeCheck} from "./assets/UptimeCheck.js";
import http from "http";
import { supabase } from "./assets/db.js";   // was: import { pool }

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const UPTIME_MONITOR_INTERVAL = 60; // seconds
const TIMEOUT_THRESHOLD = 5; // seconds
const MAX_TRIES = 3; // attempts
const RETRY_INTERVAL = 5; // seconds
const PORT = 8080;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i; // Uncomment later

function isUUID(uuid) { // Uncomment later
    return typeof uuid === "string" && UUID_REGEX.test(uuid);
}

async function getUserFromRequest() {
    // TODO
    const { data, error } = await supabase.from("users").select("*").eq("id", 1).maybeSingle(); // Mock data
    if (error) { console.error("Query failed: ", error); return null; }
    return data || null;
}

async function getProjectIdFromAPIKey(apiKey) {
    if (!isUUID(apiKey)) return null;
    const { data, error } = await supabase
        .from("projects").select("id")
        .eq("api_key", apiKey)
        .maybeSingle();
    if (error) { console.error("Query failed: ", error); return null; }
    return data.id || null;
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
    const { data, error } = await supabase
        .from("projects").select(`
            users_projects!inner(user_id),
            website_url,
            uptime_log (*)
        `)
        .eq("users_projects.user_id", user.id)
        .order("timestamp", { referencedTable: 'uptime_log', ascending: false });
    if (error) { console.error("Query failed: ", error); return []; }
    const hostnames = new Set(data?.flatMap(item => {
        try {
            const url = item.website_url;
            if (!url) return [];
            return new URL(url).hostname;
        } catch (error) {
            console.error("URL failed: ", error);
            return [];
        }
    }) || []);
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
    }
}

async function initUser(user) {
    const { data, error } = await supabase.from("users_projects").select("projects(*)").eq("user_id", user.id);
    if (error) { console.error("Failed to load projects: ", error); return; }
    for (const entry of data) monitorProject(user, entry.projects);
}

async function initUsers() {
    const { data, error } = await supabase.from("users").select("*");
    if (error) { console.error("Failed to load users: ", error); return; }
    for (const user of data) initUser(user);
}

function invalidateRequest(res) {
    res.writeHead(400);
    res.end("Invalid request");
}

const server = http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*"); // Allow any site
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    const requestUrl = new URL(req.url, `http://${req.headers.host || `localhost:${PORT}`}`);
    const requestPath = requestUrl.pathname;
    // const searchParams = requestUrl.searchParams; // Not currently in use

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
    } else if (req.method === "GET") {
        const user = await getUserFromRequest(req);
        if (!user) { invalidateRequest(); return; }
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
                    if (!authHeader || !authHeader.startsWith("Bearer ")) { invalidateRequest(); return; }
                    const apiKey = authHeader.split(" ")[1];
                    const projectId = await getProjectIdFromAPIKey(apiKey);
                    if (projectId === null) throw new Error("Invalid API key");
                    const eventObject = new Event(body);
                    if (!eventObject.valid) throw new Error("Invalid event");
                    eventObject.setField("project_id", projectId);
                    eventObject.setField("ip", req.socket.remoteAddress);
                    logEvent(eventObject);
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ status: "success" }));
                } catch (error) {
                    res.writeHead(400);
                    res.end("Invalid event");
                    console.error("\nEvent log failed: ", error);
                }
            } else {
                invalidateRequest(res);
            }
        });
    }
});

server.listen(PORT, () => {
    console.log("Server running");
    initUsers();
});
