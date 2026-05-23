# WatchTower Server — Setup

How to get the server running with Supabase.

## Prerequisites

- **Node.js 20+**
- **Docker Desktop** (for running Supabase locally — it must be running before you start)

## 1. Install dependencies

```bash
# from the repo root (installs the Supabase CLI)
npm install

# from the server folder
cd src/prototype/server
npm install
```

## 2. Create your `.env`

In `src/prototype/server/`, copy `.env.example` to `.env`. You'll set up **both**
local and remote below, then switch between them by commenting one out.

Always use the **secret / service_role** key (not the anon/publishable key).

## 3. Set up Supabase (both local and remote)

### Get the local values

```bash
# from the repo root
npx supabase start      # first run downloads images (a few minutes)
npx supabase status     # shows the local URL and keys
```

Browse your local data at http://127.0.0.1:54323.
Stop it later with `npx supabase stop`; reset the DB with `npx supabase db reset`.

### Get the remote values

In the Supabase dashboard → **Settings → API**, copy the **Project URL**
(`https://<project-ref>.supabase.co`, not the dashboard URL) and the
**service_role** key.

### Put both in `.env`

Keep both pairs, with the one you're using active and the other commented out.
For example, set up for local (flip the comments to use remote):

```
# Local
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=<the "Secret" sb_secret_… key from `supabase status`>

# Remote
# SUPABASE_URL=https://<project-ref>.supabase.co
# SUPABASE_SERVICE_ROLE_KEY=<service_role key, starts with eyJ…>
```

**Only one pair active at a time**, and **restart the server** after switching.

## 4. Run the server

```bash
cd src/prototype/server
npm start
```

You should see `Server running` and it should stay running. Test it:

```bash
curl http://localhost:8080/api/events
```

Then open the dashboard.

## Making database changes

**Never change the remote database directly** — don't run `db push` from your own
branch, and don't edit the schema in the hosted dashboard. The remote only changes
through migrations that have been reviewed and merged.

To make a schema change:

1. Start local and bring it up to date:
   ```bash
   npx supabase start
   npx supabase db reset      # applies all current migrations + seed
   ```
2. Create a migration — either:
   - write it by hand: `npx supabase migration new <name>`, then edit the new file
     in `supabase/migrations/`, **or**
   - change the schema in local Studio, then capture it: `npx supabase db diff -f <name>`
3. Verify it applies cleanly from scratch (and reseeds):
   ```bash
   npx supabase db reset
   ```
4. Commit the new file(s) under `supabase/migrations/`, push to your branch, open a PR.
5. After review and merge, someone in the team pushes it to the remote:
   ```bash
   npx supabase link --project-ref <project-ref>   # one-time
   npx supabase db push
   ```

Rules:
- One schema change = one new migration file. **Don't edit a migration that's
  already merged** — add a new one instead.
- Need seed/sample data? Put it in `supabase/seed.sql` (runs on `db reset` locally).

---

### Common issues

- **`Invalid supabaseUrl`** → check `SUPABASE_URL` (no spaces, correct format).
- **Queries return empty** → you used the anon/publishable key; use the secret key.
- **Both pairs uncommented** → comment one out; only one active at a time.
- **Changed `.env` but nothing happened** → restart the server.
