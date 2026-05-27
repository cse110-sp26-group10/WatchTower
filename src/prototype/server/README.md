# WatchTower Server — Supabase Setup & Development

How to set up the WatchTower server with Supabase, and how to make database
changes safely. Assumes a basic understanding of **Supabase**, **PostgreSQL**,
and **SQL**.

The server is a Node service that receives tracker events and serves the
dashboard. Data lives in Supabase; the server talks to it with
`@supabase/supabase-js`, so switching between **local** and **remote** is just an
`.env` change — no code changes.

## 1. Setup

### 1.1 Prerequisites

- **Node.js 20+**
- **Docker Desktop** — installed and running (required for local Supabase). Get it [here](https://docs.docker.com/desktop/setup/install).
- The **Supabase CLI** is a repo dev-dependency, so you don't install it globally — run it with `npx supabase …`.

### 1.2 Install dependencies

```bash
npm install                              # repo root — installs the Supabase CLI
cd src/prototype/server && npm install   # server — supabase-js, dotenv, ws
```

### 1.3 Start local Supabase

```bash
# from the repo root
npx supabase start      # first run downloads Docker images (a few minutes)
npx supabase status     # prints the local URLs + keys
```

Local URLs: **Studio** (dashboard UI) http://127.0.0.1:54323 ·
**API** http://127.0.0.1:54321 · **Mailpit** (test emails) http://127.0.0.1:54324.

### 1.4 Configure `.env`

Copy `.env.example` to `.env` in `src/prototype/server/`. Set up **both** local
and remote, and keep the one you're using active (comment the other out).

```
# Local (values from `npx supabase status`)
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=<the "Secret" sb_secret_… key>

# Remote (Supabase dashboard → Settings → API)
# SUPABASE_URL=https://ghlddzvbhbztilheeuai.supabase.co
# SUPABASE_SERVICE_ROLE_KEY=<service_role key, starts with eyJ…>
```

- Use the **secret / service_role** key, **not** the anon/publishable key — all
  tables have RLS enabled, so the anon key would be blocked.
- **Only one pair active at a time**, and **restart the server** after switching
  (`.env` is read once at startup).

### 1.5 Run the server

```bash
cd src/prototype/server && npm start     # expect "Server running" on :8080
curl http://localhost:8080/api/events    # quick check — returns [] until events exist
```

## 2. Making database changes

Always work **locally**, capture changes as a migration file, and let them reach
remote through a reviewed PR. **Never edit the remote database directly.**

1. **Sync your local DB with the latest schema first** (so you build on top of
   what's already merged):
   ```bash
   git fetch origin main
   git merge origin/main
   npx supabase db reset      # rebuilds local DB from all migrations + seed
   ```
2. **Make your changes** — in Studio (http://127.0.0.1:54323) create/modify
   tables, columns, policies, or functions; or write SQL directly.
3. **Export your changes to a migration file:**
   ```bash
   npx supabase db diff -f
   ```
   This writes `supabase/migrations/<timestamp>.sql` with the SQL for the
   changes you made.
4. **Review** the generated file under `supabase/migrations/` — confirm it
   contains only your intended changes.
5. **Verify from a cold start:**
   ```bash
   npx supabase db reset      # wipes local, re-applies every migration + seed
   ```
6. **Commit** the new migration, push to your feature branch, and open a PR.

> [!IMPORTANT]
> Don't change the remote database directly — no editing the hosted dashboard,
> and **don't run `supabase db push` from your feature branch**. Remote changes
> are applied only from reviewed, merged migrations (by a designated maintainer
> after merge, or by CI/CD if configured). This keeps remote in sync with the
> migration history in git.

## 3. Checklist before PR

- [ ] Did **not** touch the remote Supabase dashboard — all changes made locally.
- [ ] Synced local with the latest `main` (`git fetch origin main` + `git merge origin/main`) before starting.
- [ ] Ran `npx supabase db diff -f <name>` to capture changes into a migration.
- [ ] Ran `npx supabase db reset` to preview your changes from a cold start (no errors).
- [ ] Reviewed the new file(s) under `supabase/migrations/` — everything looks correct.
- [ ] `.env` is not committed (it's git-ignored) and no keys are hard-coded.

## 4. Test end-to-end with the monitored app

To watch real data flow in: with the server running, serve the test-app — VS Code
**Live Server** on `src/test-app/index.html`, or `npx serve src` then open
`/test-app/index.html` (serve `src`, not `src/test-app`, so the tracker path
resolves). Browse the store (add to cart, checkout, trigger the survey/error),
then watch events appear in Studio → `events`, or via `curl http://localhost:8080/api/events`.

## 5. Common issues

- **`Invalid supabaseUrl`** → check `SUPABASE_URL` (no spaces, correct format).
- **`Node.js 20 detected without native WebSocket`** → run `npm install` in the server folder (`ws` is a dependency).
- **Queries return empty / permission errors** → you used the anon/publishable key; use the secret/service_role key.
- **Changed `.env` but nothing happened** → restart the server.

# WatchTower Server — Twilio Setup

How to set up the WatchTower's SMS feature with Twilio.

## 1. Setup

### 1.1 Prerequisites

- A trial Twilio account. Register [here](https://www.twilio.com/try-twilio).

### 1.2 Install dependencies

```bash
cd src/prototype/server && npm install   # server — twilio
```

### 1.3 Buy phone number

1. Go to https://console.twilio.com/ → Develop → Phone Numbers → Manage → Buy a number.
2. Find a phone number.
3. Click Buy → Buy <phone_number, starts with +1>.
4. Go to https://console.twilio.com/ → Develop → Phone Numbers → Manage → Active numbers.
5. Verify that the number has been purchased.

### 1.4 Configure `.env`

Copy `.env.example` to `.env` in `src/prototype/server/`. Follow the instructions to fill out the fields.

```
# Twilio Authentication (https://console.twilio.com/ → scroll down → Account Info)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
# Target Phone Number (https://console.twilio.com/ → Develop → Message → Virtual Phone → Copy Virtual Phone's Number)
TARGET_PHONE_NUMBER=
# Source Phone Number (https://console.twilio.com/ → Develop → Phone Numbers → Manage → Active numbers)
SOURCE_PHONE_NUMBER=
```

### 1.5 Monitoring messages

As of the current setup, regardless of the phone number used when registering for WatchTower, the server will only send alerts to the virtual phone number provided by Twilio. To check messages sent to your virtual phone number:
1. Go to https://console.twilio.com/ → Develop → Message → Virtual Phone.
2. Select "Phone number" as the **Sender type**.
3. Select the source phone number as the **Phone number**.
4. Messages will be shown on a mock phone display.

Alternatively, to see the full message log to your virtual phone number:
1. Go to https://console.twilio.com/ → Develop → Message → Virtual Phone.
2. Click on "Messaging Logs".
3. Select "Phone number" as the **Sender type**.
4. Select the source phone number as the **Phone number**.
5. Messages will be shown as a log with the fields "Timestamp", "From", and "Status".

And to see the complete message log associated with your Twilio account, go to https://console.twilio.com/ → Monitor → Logs → Messaging.

### 1.6 Additional notes

Due to being on a trial account, there are these following limits:
- The trial account will expire after 30 days (not a problem since the project ends before this).
- SMS messages can only be sent to the given virtual phone number. Even though the phone number you use when registering is automatically verified by Twilio (https://console.twilio.com/ → Develop → Phone Numbers → Manage → Verified Caller IDs), Toll Free verification is still required for US phone numbers.
- A maximum of 50 messages can be sent per day, in addition to a limit on the number of message segments per message.
- Messages sent will be prepended with "Sent from a Twilio Trial account".

For more information, check out this [article] (https://help.twilio.com/articles/360036052753-Twilio-Free-Trial-Limitations).
