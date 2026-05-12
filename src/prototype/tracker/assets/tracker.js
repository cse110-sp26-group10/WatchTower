async function logEvent(event) {
    try {
        let response = await fetch("http://localhost:8080", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(event)
        });
        if (!response.ok) {
            throw new Error("Network response failed");
        }
        let data = await response.json();
        console.log("Response:", data);
    } catch (error) {
        console.log("Logging failed:", error);
    }
}

function getUserId() {
    let userId = localStorage.getItem("watchtower_user_id");
    if (userId === null) {
        userId = crypto.randomUUID(); // Generate new user_id
        localStorage.setItem("watchtower_user_id", userId);
    }
    return user_id;
}

function eventTemplate() {
    let event = {};
    event.timestamp = new Date().toISOString();
    event.deployment = {
        "id": "dep_abcd",
        "version": "0.0.0",
        "commit_hash": "a1b2c3d",
        "deployed_at": "2026-03-25T00:00:00Z"
    };
    event.user_id = getUserId();
    event.current_url = window.location.href;
    event.referrer = document.referrer;
    return event;
}

let loadTimeObserver = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
        let pageLoad = eventTemplate();
        pageLoad.event_type = "page_load";
        pageLoad.metadata = {
            "load_time": entry.loadEventEnd - entry.startTime
        }
        logEvent(pageLoad);
    });
});
loadTimeObserver.observe({ type: "navigation", buffered: true });

window.onerror = function(message, source, lineno, colno, error) {
    let errorEvent = eventTemplate();
    errorEvent.event_type = "error";
    errorEvent.metadata = {
        "severity": "critical",
        "message": message
    }
    logEvent(errorEvent);
};

let originalWarn = console.warn;
console.warn = function(...args) {
    originalWarn.apply(console, args);
    let errorEvent = eventTemplate();
    errorEvent.event_type = "error";
    errorEvent.metadata = {
        "severity": "warning",
        "message": args[0]
    }
    logEvent(errorEvent);
}

window.addEventListener("click", (event) => {
    let click = eventTemplate();
    click.event_type = "click";
    click.metadata = {
        "element_id": event.target.id,
        "element_class": event.target.className,
        "input_delay": performance.now() - event.timeStamp
    }
    logEvent(click);
});

// Sample survey
let survey = eventTemplate();
survey.event_type = "survey";
survey.metadata = {
    "rating": 5,
    "message": "This is a test."
};
console.log(survey);
await logEvent(survey);