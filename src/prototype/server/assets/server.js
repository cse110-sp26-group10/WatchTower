import Event from "./Event.js";
import http from "http";

const server = http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*"); // Allow any site
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === "POST") {
        let body = "";
        req.on("data", chunk => {
            body += chunk.toString();
            if (body.length > 1e6) { // Kill the connection if the log is over 1 MB
                req.destroy();
            }
        });
        req.on("end", () => {
            try {
                let event = new Event(body);
                console.log(JSON.stringify(event, null, 2));
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ status: "success" }));
            } catch (error) {
                console.log("Invalid log");
                res.writeHead(400);
                res.end("Invalid log");
            }
        });
    }
});

server.listen(8080, () => {
    console.log("Server running");
});