# WatchTower Prototype

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
│   └── assets/              # JS
│       └── server.js        # Core server logic
├── tracker/                 # Tracks events in browser
│   ├── assets/              # JS
│   │   └── tracker.js       # Core tracking logic
│   └── watchtower.js        # Loads in other necessary scripts
└── README.md                # You are here

```