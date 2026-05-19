import Event from "./assets/Event.js";
import {attemptSuccess, UptimeCheckAttempt, UptimeCheck} from "./assets/UptimeCheck.js";
import http from "http";

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const USERS = [
    {"website_url": "https://github.com"}
];
const EVENTS = [];
const UPTIME_LOG = [];
const UPTIME_MONITOR_INTERVAL = 60; // seconds
const TIMEOUT_THRESHOLD = 5; // seconds
const MAX_TRIES = 3; // attempts
const RETRY_INTERVAL = 5; // seconds

function getUserFromRequest(req) {
    return null; // TODO
}

function getEvents(user) {
    return EVENTS; // TODO
}

function getUptimeLog(user) {
    return UPTIME_LOG; // TODO
}

function logEvent(eventObject) {
    EVENTS.push(eventObject.event);
    console.log("\nEvent logged");
    console.log(JSON.stringify(eventObject, null, 2));
}

function logUptime(uptimeCheck) {
    UPTIME_LOG.push(uptimeCheck);
    console.log("\nUptime logged");
    console.log(JSON.stringify(uptimeCheck, null, 2));
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
        logUptime(uptimeCheck);
        await sleep(UPTIME_MONITOR_INTERVAL * 1000);
    }
}

function initUser(user) {
    monitorWebsite(user.website_url);
}

const server = http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*"); // Allow any site
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
    } else if (req.method === "GET") {
        const user = getUserFromRequest(req);
        if (req.url === "/api/events") {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(getEvents(user)));
            console.log("\nEvent log sent");
        } else if (req.url === "/api/uptime") {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(getUptimeLog(user)));
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
                eventObject.set_field("ip", req.socket.remoteAddress);
                logEvent(eventObject);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ status: "success" }));
            } catch (error) {
                res.writeHead(400);
                res.end("Invalid event");
                console.log("\nInvalid event");
            }
        });
    }
});

server.listen(8080, () => {
    console.log("Server running");
});

for (const user of USERS) {
    initUser(user);
}