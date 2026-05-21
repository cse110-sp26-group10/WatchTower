import Event from "./assets/Event.js";
import {attemptSuccess, UptimeCheckAttempt, UptimeCheck} from "./assets/UptimeCheck.js";
import http from "http";
import { pool } from "./assets/db.js";

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
    try {
        // Uncomment when user system is implemented. Will query all events for now.
        /*
        const userRes = await pool.query("SELECT website_url FROM users WHERE id = $1", [user.id]);
        if (userRes.rows.length === 0)
            return [];
        const hostname = new URL(userRes.rows[0].website_url).hostname;
        const res = await pool.query( // Query events where the hostname matches the website's hostname
            "SELECT * FROM events WHERE substring(current_url from '.*://([^/:]*)') = $1 ORDER BY timestamp DESC", 
            [hostname]
        );
        */
        const res = await pool.query("SELECT * FROM events ORDER BY timestamp DESC"); // Query all events
        return res.rows;
    } catch (error) {
        console.error("Query failed: ", error);
        return [];
    }
}

async function getUptimeLog(user) {
    try {
        const userRes = await pool.query("SELECT website_url FROM users WHERE id = $1", [user.id]);
        if (userRes.rows.length === 0)
            return [];
        const hostname = new URL(userRes.rows[0].website_url).hostname;
        const res = await pool.query( // Query uptime checks where the hostname matches the website's hostname
            "SELECT * FROM uptime_log WHERE substring(url from '.*://([^/:]*)') = $1 ORDER BY timestamp DESC", 
            [hostname]
        );
        return res.rows;
    } catch (error) {
        console.error("Query failed: ", error);
        return [];
    }
}

async function logEvent(eventObject) {
    const event = eventObject.event;
    const query = `
        INSERT INTO events (
            event_type, timestamp, created_at, deployment, ip, 
            user_id, current_url, host, pathname, referrer, 
            referring_domain, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `;
    const values = [
        event.event_type, event.timestamp, event.created_at, JSON.stringify(event.deployment), event.ip,
        event.user_id, event.current_url, event.host, event.pathname, event.referrer,
        event.referring_domain, JSON.stringify(event.metadata)
    ];
    console.log("\nLogging event...");
    try {
        await pool.query(query, values);
        console.log("Event logged");
        console.log(JSON.stringify(eventObject, null, 2));
    } catch (error) {
        console.error("Query failed: ", error);
    }
}

async function logUptime(uptimeCheck) {
    const query = `
        INSERT INTO uptime_log (url, timestamp, is_up, status, latency, attempts)
        VALUES ($1, $2, $3, $4, $5, $6)
    `;
    const values = [
        uptimeCheck.url, uptimeCheck.timestamp, uptimeCheck.is_up, 
        uptimeCheck.status, uptimeCheck.latency, JSON.stringify(uptimeCheck.attempts)
    ];
    console.log("\nLogging uptime...");
    try {
        await pool.query(query, values);
        console.log("Uptime logged");
        console.log(JSON.stringify(uptimeCheck, null, 2));
    } catch (error) {
        console.error("Query failed: ", error);
    }
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

async function monitorWebsite(url) {
    while (true) {
        const uptimeCheck = await getWebsiteStatus(url);
        if (!uptimeCheck.is_up) {
            // Send alert to developer
        }
        await logUptime(uptimeCheck);
        await sleep(UPTIME_MONITOR_INTERVAL * 1000);
    }
}

function initUser(user) {
    if (new URL(user.website_url).hostname === "localhost") {
        console.log("Monitoring skipped for localhost");
        return;
    }
    monitorWebsite(user.website_url);
}

async function initUsers() {
    try {
        const res = await pool.query("SELECT * FROM users");
        for (const user of res.rows) {
            initUser(user);
        }
    } catch (error) {
        console.error("Failed to load users: ", error);
    }
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
                console.log("\nInvalid event");
            }
        });
    }
});

server.listen(8080, () => {
    console.log("Server running");
    initUsers();
});