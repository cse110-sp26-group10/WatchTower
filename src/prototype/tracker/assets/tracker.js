const originalWarn = console.warn;
const originalFetch = window.fetch;

async function logEvent(event) {
    try {
        const response = await originalFetch("http://localhost:8080", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(event)
        });
        if (!response.ok) {
            throw new Error("Network response failed");
        }
        const data = await response.json();
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
    return userId;
}

function eventTemplate() {
    const event = {};
    event.timestamp = new Date().toISOString();
    event.deployment = (window.WatchTower = {}).deployment = { // Mock data
        "id": "dep_abcd",
        "version": "0.0.0",
        "commit_hash": "a1b2c3d",
        "deployed_at": "2026-03-25T00:00:00.000Z",
        "author": "kevin"
    };
    event.user_id = getUserId();
    event.current_url = window.location.href;
    event.referrer = document.referrer;
    return event;
}

function logPageLoad(load_time) {
    const pageLoad = eventTemplate();
    pageLoad.event_type = "page_load";
    pageLoad.metadata = {load_time};
    logEvent(pageLoad);
}

function logError(severity, message) {
    const errorEvent = eventTemplate();
    errorEvent.event_type = "error";
    errorEvent.metadata = {severity, message};
    logEvent(errorEvent);
}

function logSurvey(rating, message) {
    const surveyEvent = eventTemplate();
    surveyEvent.event_type = "survey";
    surveyEvent.metadata = {rating, message};
    logEvent(surveyEvent);
}

function logClick(element_id, element_class, input_delay) {
    const clickEvent = eventTemplate();
    clickEvent.event_type = "click";
    clickEvent.metadata = {element_id, element_class, input_delay};
    logEvent(clickEvent);
}

const loadTimeObserver = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
        logPageLoad(entry.loadEventEnd - entry.startTime);
    });
});
loadTimeObserver.observe({ type: "navigation", buffered: true });

window.addEventListener("error", (event) => {
    logError("critical", event.message);
})

console.warn = function(...args) {
    originalWarn.apply(console, args);
    logError("warning", args[0]);
}

window.addEventListener("unhandledrejection", (event) => {
    logError("critical", event.reason.message);
});

window.fetch = async function(...args) {
    try {
        const response = await originalFetch(...args);
        if (!response.ok) {
            const method = args[1]?.method ?? "GET";
            logError("critical", `${method} ${response.url} ${response.status}`);
        }
        return response;
    } catch (error) {
        throw error; // Will be caught by unhandledrejection
    }
}

window.addEventListener("click", (event) => {
    logClick(event.target.id, event.target.className.toString(), performance.now() - event.timeStamp);
});