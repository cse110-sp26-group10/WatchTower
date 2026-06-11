# WatchTower

## Event Signal Structure

Raw Data (Browser):

```
{
    "event_type": string,
    "timestamp": string (ISO 8601),
    "current_url": string,
    "referrer": string,
    "browser": object (Browser),
    "deployment": object (Deployment),
    "metadata": object (content depends on event_type)
}
```

Processed Data (Server):

```
{
    "event_type": string,
    "timestamp": string (ISO 8601),
    "created_at": string (ISO 8601),
    "deployment": object (Deployment),
    "ip": string (IPv4 or IPv6),
    "project_id": number,
    "current_url": string,
    "host": string,
    "pathname": string,
    "referrer": string,
    "referring_domain": string,
    "browser": object (Browser),
    "metadata": object (content depends on event_type)
}
```

Browser:

```
{
    "name": string,
    "version": string
}
```

Deployment:

```
{
    "id": string,
    "version": string,
    "commit_hash": string,
    "deployed_at": string (ISO 8601),
    "author": string
}
```

Metadata – page_load:

```
{
    "load_time": number (ms)
}
```

Metadata – error:

```
{
    "severity": string (either "critical" or "warning" for now),
    "message": string
}
```

Metadata – click:

```
{
    "element_id": string,
    "element_class": string,
    "input_delay": number (ms)
}
```

Metadata – survey:

```
{
    "rating": number,
    "message": string
}
```

## Website Uptime Signal Structure

Uptime Check:

```
{
    "url": string,
    "timestamp": string (ISO 8601),
    "is_up": boolean,
    "status": number (HTTP status code),
    "latency": number (ms),
    "attempts": array (Uptime Check Attempts)
}
```

Uptime Check Attempt:

```
{
    "timestamp": string (ISO 8601),
    "status": number (HTTP status code),
    "latency": number (ms),
    "error": string
}
```

## File Structure

```
src/app/
├── dashboard/               # SPA dashboard frontend
│   ├── assets/
│   │   ├── scripts/
│   │   │   ├── components/  # Reusable web components (sidebar, topbar, uptime card, error list, etc.)
│   │   │   ├── core/        # Data fetching, filtering, formatting, and scoping utilities
│   │   │   ├── pages/       # Per-page JS modules (home, errors, activity, feedback, projects, settings, etc.)
│   │   │   ├── main.js      # App entry point — auth gate and initial render
│   │   │   └── router.js    # Hash-based SPA router
│   │   └── styles/
│   │       └── styles.css
│   ├── public/              # Static assets (logo, favicon)
│   └── index.html
├── server/                  # Node.js backend
│   ├── assets/
│   │   ├── Event.js         # Event validation and sanitization
│   │   ├── UptimeCheck.js   # Uptime check data structures
│   │   ├── db.js            # Supabase client and database helpers
│   │   └── notify.js        # Email (NodeMailer) and push (ntfy) notifications
│   ├── server.js            # HTTP server and route handlers
│   └── .env.example         # Environment variable template
└── tracker/                 # Lightweight browser tracker
    ├── assets/
    │   └── tracker.js       # Event capture logic (page load, errors, clicks, surveys)
    └── watchtower.js        # Script loader — embed this in monitored pages
```