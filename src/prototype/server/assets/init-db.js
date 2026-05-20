import { DB_NAME, client, pool } from "./db.js";

const terminateSql = `
SELECT pg_terminate_backend(pg_stat_activity.pid)
    FROM pg_stat_activity
    WHERE pg_stat_activity.datname = '${DB_NAME}'
    AND pid <> pg_backend_pid();
`;
const dropSql = `
DROP DATABASE IF EXISTS "${DB_NAME}";
`;
const createSql = `
CREATE DATABASE "${DB_NAME}";
`;
const sql = `
DROP TABLE IF EXISTS uptime_log CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    website_url TEXT NOT NULL UNIQUE
);

CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    event_type TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deployment JSONB NOT NULL,
    ip TEXT,
    user_id UUID NOT NULL,
    current_url TEXT NOT NULL,
    host TEXT NOT NULL,
    pathname TEXT NOT NULL,
    referrer TEXT,
    referring_domain TEXT,
    metadata JSONB NOT NULL
);

CREATE TABLE uptime_log (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    is_up BOOLEAN NOT NULL,
    status INT,
    latency INT NOT NULL,
    attempts JSONB NOT NULL
);
`;
const mockSql = `
INSERT INTO users (website_url) VALUES ('http://localhost:8080');
INSERT INTO users (website_url) VALUES ('https://github.com');
`

async function init() {
    try {
        await client.connect();
        console.log("Teminating connections...");
        await client.query(terminateSql);
        console.log("Connections terminated successfully");
        console.log("Initializing database...");
        await client.query(dropSql);
        await client.query(createSql);
        console.log("Database initialized successfully");
        await client.end();
        console.log("Initializing tables...");
        await pool.query(sql);
        console.log("Tables initialized successfully");
        console.log("Initializing mock data...");
        await pool.query(mockSql);
        console.log("Mock data initialized successfully");
    } catch (err) {
        console.error("Error initializing database:", err);
    } finally {
        await pool.end();
    }
}

init();