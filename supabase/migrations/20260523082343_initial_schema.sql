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

-- Enable Row-Level Security on all tables. No policies are defined, so these
-- tables are reachable only via the service_role key (which bypasses RLS) used
-- by the Node server. The anon/authenticated keys get no access until policies
-- are added (e.g. when dashboard auth is introduced).
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE uptime_log ENABLE ROW LEVEL SECURITY;
