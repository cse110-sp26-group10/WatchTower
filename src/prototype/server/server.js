import Event from "./assets/Event.js";
import {
    attemptSuccess,
    UptimeCheckAttempt,
    UptimeCheck,
} from "./assets/UptimeCheck.js";
import http from "http";
import { dbHelper } from "./assets/db.js"; // was: import { pool }
import { notifyDowntime, notifyError } from "./assets/notify.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const UPTIME_MONITOR_INTERVAL = 60; // seconds
const TIMEOUT_THRESHOLD = 5; // seconds
const MAX_TRIES = 3; // attempts
const RETRY_INTERVAL = 5; // seconds
const PORT = 8080;
const NOTIFY_METHODS = new Set(["push", "email"]); // valid notification channels
const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const ALLOWED_ORIGINS = new Set([
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "https://cse110-sp26-group10.github.io/WatchTower/src/test-app/",
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

async function getUserFromRequest(req) {
    const accessToken = getCookie(req, "access_token");
    if (!accessToken)
        return { user: null, authUser: null, error: "Missing access token" };
    return await dbHelper.getUserFromToken(accessToken);
}

async function getProjectFromRequest(req) {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer "))
        return { project: null, error: "Missing API key" };
    const apiKey = authHeader.split(" ")[1];
    if (!isUUID(apiKey)) return { project: null, error: "Invalid API key" };
    return await dbHelper.getProjectFromAPIKey(apiKey);
}

async function getProjectStatus(project) {
    const attempts = [];
    for (let tries = 1; tries <= MAX_TRIES; tries++) {
        const startTime = new Date();
        let attempt;
        try {
            const response = await fetch(project.website_url, {
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
    return new UptimeCheck(project.id, project.website_url, attempts);
}

async function sendAlert(project, uptimeCheck) {
    return notifyDowntime(project, uptimeCheck);
}

async function monitorProject(user, project) {
    if (new URL(project.website_url).hostname === "localhost") {
        console.warn("Monitoring skipped for localhost");
        return;
    }
    while (true) {
        const uptimeCheck = await getProjectStatus(project);
        if (!uptimeCheck.is_up) {
            const uptimeLog = await dbHelper.getUptimeLogFromProject(project);
            if (uptimeLog && (uptimeLog.length == 0 || uptimeLog[0].is_up)) {
                // Only sends alert once each time the website goes down
                sendAlert(project, uptimeCheck); // Runs asynchronously
            }
        }
        const error = await dbHelper.logUptime(uptimeCheck);
        if (error) {
            const { data: checkProject, error: checkError } =
                await dbHelper.getProjectFromId(project.id);
            if (!checkError && !checkProject) {
                console.log(`Stopped monitoring project ${project.id}`);
                break;
            } // Project no longer exists
        }
        await sleep(UPTIME_MONITOR_INTERVAL * 1000);
    }
}

async function initUser(user) {
    const { projects, error } = await dbHelper.getProjects(user);
    if (error) {
        console.error("Failed to load projects:", error);
        return;
    }
    for (const project of projects) monitorProject(user, project);
}

async function initUsers() {
    const { users, error } = await dbHelper.getUsers();
    if (error) {
        console.error("Failed to load users:", error);
        return;
    }
    for (const user of users) initUser(user);
}

function invalidateRequest(res, msg) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: msg || "Invalid request" }));
}

function unauthorizedRequest(res, msg) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: msg || "Unauthorized" }));
}

function validateSession(res, session) {
    res.setHeader("Set-Cookie", [
        `access_token=${session.access_token}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=3600`,
        `refresh_token=${session.refresh_token}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=2592000`,
    ]);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "success" }));
    console.log("Browser cookies updated");
}

function invalidateSession(res) {
    res.writeHead(200, {
        "Set-Cookie": [
            "access_token=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0",
            "refresh_token=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0",
        ],
        "Content-Type": "application/json",
    });
    res.end(JSON.stringify({ status: "success" }));
    console.log("Browser cookies cleared");
}

const server = http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*"); // Allow any site
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    const requestUrl = new URL(
        req.url,
        `http://${req.headers.host || `localhost:${PORT}`}`,
    );
    const requestPath = requestUrl.pathname;
    // const searchParams = requestUrl.searchParams; // Not currently in use

    // Allow requests with credentials to work when they are sent from an allowed origin
    const origin = req.headers.origin;
    if (ALLOWED_ORIGINS.has(origin))
        res.setHeader("Access-Control-Allow-Origin", origin);

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
    } else if (req.method === "GET") {
        const {
            user,
            authUser,
            error: accessError,
        } = await getUserFromRequest(req);
        if (accessError) {
            unauthorizedRequest(res);
            console.error("Unauthorized:", accessError);
            return;
        }
        if (requestPath === "/profile") {
            const profile = {
                email: authUser.email,
                created_at: authUser.created_at,
                alert_id: user.alert_id,
                notify_methods: user.notify_methods,
            };
            res.writeHead(200, { "Content-Type": "application/json" });
            console.log("Profile sent");
            res.end(JSON.stringify(profile));
        } else if (requestPath === "/api/events") {
            const { events, error } = await dbHelper.getEvents(user);
            if (error) {
                invalidateRequest(res);
                return;
            }
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(events));
            console.log("Event log sent");
        } else if (requestPath === "/api/uptime") {
            const { uptimeLog, error } = await dbHelper.getUptimeLog(user);
            if (error) {
                invalidateRequest(res);
                return;
            }
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(uptimeLog));
            console.log("Uptime log sent");
        } else if (requestPath === "/api/projects") {
            const { projects, error } = await dbHelper.getProjects(user);
            if (error) {
                invalidateRequest(res);
                return;
            }
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(projects));
            console.log("Projects sent");
        } else {
            invalidateRequest(res);
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
        req.on("end", async () => {
            if (requestPath === "/api/log") {
                try {
                    const { project, error: accessError } =
                        await getProjectFromRequest(req);
                    if (accessError) {
                        unauthorizedRequest(res);
                        console.error("Unauthorized:", accessError);
                        return;
                    }
                    if (
                        new URL(project.website_url).hostname !== new URL(origin).hostname
                    ) {
                        unauthorizedRequest(res);
                        console.error(
                            "Unauthorized:",
                            "Request origin does not match project URL",
                        );
                        return;
                    }
                    const eventObject = new Event(body);
                    if (!eventObject.valid) throw new Error("Invalid event");
                    eventObject.setField("project_id", project.id);
                    eventObject.setField("ip", req.socket.remoteAddress);
                    const error = await dbHelper.logEvent(eventObject);
                    if (error) {
                        invalidateRequest(res);
                        return;
                    }
                    if (eventObject.event.event_type === "error") notifyError(eventObject.event); // Runs asynchronously
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ status: "success" }));
                } catch (error) {
                    invalidateRequest(res, "Invalid event");
                    console.error("Event log failed:", error);
                }
            } else if (requestPath === "/signup") {
                try {
                    const { email, password } = JSON.parse(body);
                    if (!email || !password) throw new Error("Missing email or password");
                    if (!isEmail(email)) throw new Error("Invalid email");
                    const { data, user, error } = await dbHelper.signUp(email, password);
                    if (error) {
                        invalidateRequest(res);
                        return;
                    }
                    initUser(user);
                    validateSession(res, data.session);
                    console.log("Signed up successfully");
                } catch (error) {
                    invalidateRequest(res);
                    console.error("Sign up failed:", error);
                }
            } else if (requestPath === "/login") {
                try {
                    const { email, password } = JSON.parse(body);
                    if (!email || !password) throw new Error("Missing email or password");
                    const { data, error } = await dbHelper.logIn(email, password);
                    if (error) {
                        invalidateRequest(res);
                        return;
                    }
                    validateSession(res, data.session);
                    console.log("Logged in successfully");
                } catch (error) {
                    invalidateRequest(res);
                    console.error("Login failed:", error);
                }
            } else if (requestPath === "/logout") {
                const accessToken = getCookie(req, "access_token");
                if (accessToken) await dbHelper.logOut(accessToken);
                invalidateSession(res);
            } else if (requestPath === "/auth/refresh") {
                const refreshToken = getCookie(req, "refresh_token");
                if (!refreshToken) {
                    unauthorizedRequest(res, "Missing refresh token");
                    console.error("Missing refresh token");
                    return;
                }
                const { data, error } = await dbHelper.refreshSession(refreshToken);
                if (error) {
                    unauthorizedRequest(res);
                    return;
                }
                validateSession(res, data.session);
            } else if (requestPath === "/api/projects/create") {
                const { user, error: accessError } = await getUserFromRequest(req);
                if (accessError) {
                    unauthorizedRequest(res);
                    console.error("Unauthorized:", accessError);
                    return;
                }
                try {
                    const { name, website_url: websiteUrl } = JSON.parse(body);
                    if (!name || !websiteUrl)
                        throw new Error("Missing project name or website URL");
                    if (!URL.canParse(websiteUrl)) throw new Error("Invalid website URL");
                    const { project, error } = await dbHelper.createProject(
                        user,
                        name,
                        websiteUrl,
                    );
                    if (error) {
                        invalidateRequest(res);
                        return;
                    }
                    monitorProject(user, project); // Start monitoring the website
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify(project));
                } catch (error) {
                    invalidateRequest(res);
                    console.error("Project creation failed:", error);
                }
            } else if (requestPath === "/api/projects/delete") {
                const { user, error: accessError } = await getUserFromRequest(req);
                if (accessError) {
                    unauthorizedRequest(res);
                    console.error("Unauthorized:", accessError);
                    return;
                }
                try {
                    const { id: projectId } = JSON.parse(body);
                    if (!projectId) throw new Error("Missing project id");
                    if (typeof projectId !== "number")
                        throw new Error("Invalid project id");
                    const error = await dbHelper.deleteProject(user, projectId);
                    if (error) {
                        invalidateRequest(res);
                        return;
                    }
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ status: "success" }));
                } catch (error) {
                    invalidateRequest(res);
                    console.error("Project deletion failed:", error);
                }
            } else if (requestPath === "/api/notifications/methods") {
                const { user, error: accessError } = await getUserFromRequest(req);
                if (accessError) {
                    unauthorizedRequest(res);
                    console.error("Unauthorized:", accessError);
                    return;
                }
                try {
                    const { methods } = JSON.parse(body);
                    // null = opt out of everything; otherwise an array of allowed channels
                    if (methods !== null) {
                        if (!Array.isArray(methods)) throw new Error("methods must be an array or null");
                        if (!methods.every((m) => NOTIFY_METHODS.has(m))) throw new Error("Invalid notification method");
                    }
                    const cleaned = methods === null ? null : [...new Set(methods)]; // dedupe
                    const error = await dbHelper.updateNotifyMethods(user, cleaned);
                    if (error) {
                        invalidateRequest(res);
                        return;
                    }
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ status: "success", notify_methods: cleaned }));
                } catch (error) {
                    invalidateRequest(res);
                    console.error("Notification methods update failed:", error);
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
