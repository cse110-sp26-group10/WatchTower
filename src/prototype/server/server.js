import Event from "./assets/Event.js";
import http from "http";

let logs = [];

const server = http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*"); // Allow any site
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
    } else if (req.method === "GET") {
        if (req.url === "/api/data") {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(logs));
            console.log("\nLogs sent");
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
                let eventObject = new Event(body);
                if (!eventObject.valid) throw new Error("Invalid event");
                eventObject.set_field("ip", req.socket.remoteAddress);
                logs.push(eventObject.event);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ status: "success" }));
                console.log("\nEvent logged");
                console.log(JSON.stringify(eventObject, null, 2));
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
});