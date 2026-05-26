import Event from "./assets/Event.js";
import {attemptSuccess, UptimeCheckAttempt, UptimeCheck} from "./assets/UptimeCheck.js";
import http from "http";
import { supabase } from "./assets/db.js";   // was: import { pool }
import twilio from "twilio";

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const UPTIME_MONITOR_INTERVAL = 60; // seconds
const TIMEOUT_THRESHOLD = 5; // seconds
const MAX_TRIES = 3; // attempts
const RETRY_INTERVAL = 5; // seconds

function getUserFromRequest() {
    // TODO
    return { "id": 2 }; // Mock data
}

async function getEvents() {
    const { data, error } = await supabase
        .from("events").select("*")
        .order("timestamp", { ascending: false });
    if (error) { console.error("Query failed: ", error); return []; }
    return data;
}

async function getUptimeLog(user) {
    const { data: u, error: uErr } = await supabase
        .from("users").select("website_url").eq("id", user.id).single();
    if (uErr || !u) { console.error("Query failed: ", uErr); return []; }
    const hostname = new URL(u.website_url).hostname;
    const { data, error } = await supabase
        .from("uptime_log").select("*")
        .order("timestamp", { ascending: false });
    if (error) { console.error("Query failed: ", error); return []; }
    return data.filter((row) => new URL(row.url).hostname === hostname);  // see gotcha #3
}

async function logEvent(eventObject) {
    const e = eventObject.event;
    const { error } = await supabase.from("events").insert({
        event_type: e.event_type, timestamp: e.timestamp, created_at: e.created_at,
        deployment: e.deployment, ip: e.ip, user_id: e.user_id,
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
    });
    if (error) { console.error("Query failed: ", error); return; }
    console.log("Uptime logged");
}

async function getWebsiteStatus(url) {
    const attempts = [];
    for (let tries = 1; tries <= MAX_TRIES; tries++) {
        const startTime = new Date();
        let attempt;
        try {
            const response = await fetch(url, { mode: "no-cors", signal: AbortSignal.timeout(TIMEOUT_THRESHOLD * 1000) });
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
    return new UptimeCheck(url, attempts);
}

async function sendAlert(user, uptimeCheck) {
    for (let tries = 1; tries <= MAX_TRIES; tries++) {
        try {
            const message = await twilioClient.messages.create({
                body: `WatchTower Alert - Website ${user.website_url} is down with error code ${uptimeCheck.status}. Detected at ${uptimeCheck.timestamp}. Please check dashboard immediately.`,
                to: process.env.TARGET_PHONE_NUMBER, // Mock data
                from: process.env.SOURCE_PHONE_NUMBER
            });
            if (message.status === "queued" || message.status === "sent") {
                console.log("Alert sent");
                return true;
            }
        } catch (error) {
            console.error("Alert error: ", error);
        }
        await sleep(RETRY_INTERVAL * 1000);
    }
    console.error("Alert failed");
    return false;
}

async function monitorWebsite(user) {
    while (true) {
        const uptimeCheck = await getWebsiteStatus(user.website_url);
        if (!uptimeCheck.is_up) {
            const uptimeLog = await getUptimeLog(user);
            if (uptimeLog.length == 0 || uptimeLog.at(-1).is_up) { // Only sends alert once each time the website goes down
                sendAlert(user, uptimeCheck); // Runs asynchronously
            }
        }
        await logUptime(uptimeCheck);
        await sleep(UPTIME_MONITOR_INTERVAL * 1000);
    }
}

function initUser(user) {
    if (new URL(user.website_url).hostname === "localhost") {
        console.warn("Monitoring skipped for localhost");
        return;
    }
    monitorWebsite(user);
}

async function initUsers() {
    const { data, error } = await supabase.from("users").select("*");
    if (error) { console.error("Failed to load users: ", error); return; }
    for (const user of data) initUser(user);
}

const server = http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*"); // Allow any site
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

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
        }
    } else if (req.method === "POST") {
        let body = "";
        req.on("data", chunk => {
            body += chunk.toString();
            if (body.length > 1e6) { // Kill the connection if the log is over 1 MB
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

server.listen(8080, () => {
    console.log("Server running");
    initUsers();
});
