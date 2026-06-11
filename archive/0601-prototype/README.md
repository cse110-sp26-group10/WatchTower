# WatchTower Prototype

## Event Signal Structure

Raw Data (Browser):

```
{
    "event_type": string,
    "timestamp": string (ISO 8601),
    "user_id": string (UUID),
    "current_url": string,
    "referrer": string,
    "metadata": object (content depends on event_type)
}
```

Processed Data (Server):

```
{
    "event_type": string,
    "timestamp": string (ISO 8601),
    "created_at": string (ISO 8601),
    "deployment": string (deployment id),
    "ip": string (IPv4 or IPv6),
    "user_id": string (UUID),
    "current_url": string,
    "host": string,
    "pathname": string,
    "referrer": string,
    "referring_domain": string,
    "metadata": object (content depends on event_type)
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
prototype/
├── dashboard/               # Display data in the dashboard
│   ├── assets/              # JS, CSS, images
│   │   ├── images
│   │   ├── scripts
│   │   │   ├── app.js       # Primary dashboard logic
│   │   │   └── data.js      # Retrieve data from the server
│   │   └── styles
│   │       └── styles.css
│   └── index.html
├── server/                  # Receive and validate payloads
│   ├── assets/              # JS
│   │   └── Event.js         # Contains the Event class
│   └── server.js            # Core server logic
├── tracker/                 # Tracks events in browser
│   ├── assets/              # JS
│   │   └── tracker.js       # Core tracking logic
│   └── watchtower.js        # Loads in other necessary scripts
└── README.md                # You are here
```