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
* **Supabase Auth provides user login/signup** out of the box. The server uses its email/password auth for sessions instead of us building and maintaining a separate auth service, and our `users` table links to `auth.users` via `auth_id`.

### Consequences

* Good, because every developer gets an identical local stack with one command, eliminating database drift.
* Good, because the schema is versioned and reviewable as migration files in git.
* Good, because switching between local and remote is only an `.env` change.
* Good, because its built-in authentication system gives us user login/signup without building or maintaining a separate auth service, which we now rely on for sessions.
* Good, because it opens a native path to storage and realtime as well.
* Neutral, because remote schema changes must go through the migration and PR workflow, with no ad-hoc `supabase db push`.

---

## Amendment: Use Supabase Built-In Auth for User Authentication

### Context and Problem Statement

WatchTower needs to gate the dashboard behind a login so that event data is private to the team that owns a project. Once Supabase was adopted as the database layer (see above), the question became whether to build custom authentication (session tokens, password hashing, JWT signing) or leverage the auth system that Supabase already provides.

### Considered Options

* **Supabase built-in auth (GoTrue)** — email/password sign-up and sign-in via `supabase.auth.signUp()` / `supabase.auth.signInWithPassword()`, sessions managed automatically by the JS client.
* **Custom JWT auth** — build our own registration/login endpoints, hash passwords with bcrypt or argon2, issue and verify JWTs manually, manage refresh token rotation.
* **Third-party auth provider** — Auth0, Clerk, or similar SaaS identity platform.

### Decision Outcome

Chosen option: **Supabase built-in auth**. Since we were already using `@supabase/supabase-js` for all database access, auth required zero new dependencies — `supabase.auth.*` methods were already available. It also integrates directly with Row-Level Security: policies can be written against `auth.uid()`, so the database itself enforces that users only read data belonging to their own projects.

How we adopted it:

* Users register and log in through the `/login` and `/signup` pages; the Supabase JS client stores the session in `localStorage` and refreshes it automatically.
* The server uses the `service_role` key for all backend writes (bypassing RLS), while the frontend session token is used only to identify the current user.
* Project rows include a `user_id` foreign key referencing `auth.users`, so each user's projects are isolated at the database level.
* On logout, `supabase.auth.signOut()` clears the session and redirects to the login page.

### Consequences

* Good, because auth required no new libraries, no custom token logic, and no additional infrastructure — the full implementation fit within the existing Supabase setup.
* Good, because session management (refresh tokens, expiry, persistence) is handled entirely by the Supabase client, eliminating a common source of security bugs in custom auth.
* Good, because RLS policies tied to `auth.uid()` enforce data isolation at the database layer rather than relying solely on application-level checks.
* Neutral, because users must sign up with an email address; social OAuth (GitHub, Google) is supported by Supabase but was not wired up within the project timeline.
* Bad, because the project currently uses a single `service_role` key on the server, which bypasses RLS for all server-side writes — acceptable for the current scope but would need tighter scoping for a production deployment.
