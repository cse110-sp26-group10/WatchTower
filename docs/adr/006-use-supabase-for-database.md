# Use Supabase for the Database

## Context and Problem Statement

WatchTower stores events, uptime logs, and users in PostgreSQL (see [ADR 004](004-use-postgre-sql-for-database.md)). The original setup used a raw, self-managed instance through the `pg` driver, with the schema created by a hand-written `init-db.js` script. This made onboarding inconsistent (each developer provisioned their own database), left us with no versioned schema history, and gave no path to features we expect to need soon (auth, storage, realtime).

Should we keep managing PostgreSQL ourselves, or move to a managed platform that standardizes setup and schema management while staying on PostgreSQL?

## Considered Options

* Self-managed / raw PostgreSQL (status quo: `pg` driver plus `init-db.js`)
* Supabase (managed PostgreSQL with a JS client, CLI migrations, local stack, and built-in auth/storage/realtime)
* Another managed Postgres host (e.g., Neon, Amazon RDS)

## Decision Outcome

Chosen option: **"Supabase"**. It is still PostgreSQL underneath, so the reasoning in [ADR 004](004-use-postgre-sql-for-database.md) holds, while it fixes the operational gaps with a hosted instance, a versioned schema via CLI migrations, an identical local stack for every developer (`supabase start`), and a growth path to auth, storage, and realtime.

How we adopted it:

* The Node server accesses data through `@supabase/supabase-js` (not the `pg` driver), using the **service_role** key server-side.
* **Row-Level Security is enabled** on all tables, so only the service_role key can read or write until dashboard auth and policies are added.
* Schema lives in `supabase/migrations/` with seed data in `supabase/seed.sql`, managed by the Supabase CLI. The old `init-db.js` is removed.

### Consequences

* Good, because every developer gets an identical local stack with one command, eliminating database drift.
* Good, because the schema is versioned and reviewable as migration files in git.
* Good, because switching between local and remote is only an `.env` change.
* Good, because it opens a native path to auth, storage, and realtime.
* Neutral, because remote schema changes must go through the migration and PR workflow, with no ad-hoc `supabase db push`.
