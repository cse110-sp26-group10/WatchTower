async function log_event(event) {
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

function get_user_id() {
    let user_id = localStorage.getItem("watchtower_user_id");
    if (user_id === null) {
        user_id = crypto.randomUUID(); // Generate new user_id
        localStorage.setItem("watchtower_user_id", user_id);
    }
    return user_id;
}

function event_template() {
    let event = {};
    event.timestamp = new Date().toISOString();
    event.deployment = {
        "id": "test_deployment",
        "version": "v0",
        "commit_hash": "abcdef"
    };
    event.user_id = get_user_id();
    event.current_url = window.location.href;
    event.referrer = document.referrer;
    return event;
}

let load_time_observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
        let page_load = event_template();
        page_load.event_type = "page_load";
        page_load.metadata = {
            "load_time": entry.loadEventEnd - entry.startTime
        }
        log_event(page_load);
    });
});
load_time_observer.observe({ type: "navigation", buffered: true });

window.onerror = function(message, source, lineno, colno, error) {
    let error_event = event_template();
    error_event.event_type = "error";
    error_event.metadata = {
        "severity": "critical",
        "message": message
    }
    log_event(error_event);
};

let originalWarn = console.warn;
console.warn = function(...args) {
    originalWarn.apply(console, args);
    let error_event = event_template();
    error_event.event_type = "error";
    error_event.metadata = {
        "severity": "warning",
        "message": args[0]
    }
    log_event(error_event);
}

window.addEventListener("click", (event) => {
    let click = event_template();
    click.event_type = "click";
    click.metadata = {
        "element_id": event.target.id,
        "element_class": event.target.className,
        "input_delay": performance.now() - event.timeStamp
    }
    log_event(click);
});

// Sample survey
let survey = event_template();
survey.event_type = "survey";
survey.metadata = {
    "rating": 5,
    "message": "This is a test."
};
console.log(survey);
await log_event(survey);