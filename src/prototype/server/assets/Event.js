const EVENT_FIELDS = new Set([
    "event_type",
    "timestamp",
    "created_at",
    "deployment",
    "ip",
    "user_id",
    "current_url",
    "host",
    "pathname",
    "referrer",
    "referring_domain",
    "metadata"
]);
const DEPLOYMENT_FIELDS = new Set([
    "id",
    "version",
    "commit_hash"
]);
const METADATA_FIELDS = {
    "page_load": new Set(["load_time"]),
    "error": new Set(["severity", "message"]),
    "survey": new Set(["rating", "message"]),
    "click": new Set(["element_id", "element_class", "input_delay"])
}
const MAX_CLOCK_SKEW_SECONDS = 300;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Converts a JSON string into an Object. Return null if the JSON string is invalid.
 * @param {string} json A valid JSON string.
 * @returns The Object, Array, string, boolean, or null value corresponding to the given JSON text.
 */
function parse_json(json) {
    try {
        return JSON.parse(json);
    } catch (error) {
        return null;
    }
}

function validate_event_type(event) {
    let event_type = event.event_type;
    if (typeof event_type !== "string") return false;
    if (event_type in METADATA_FIELDS) {
        return true;
    }
    return false;
}

function validate_timestamp(event) {
    let timestamp = event.timestamp;
    if (typeof timestamp !== "string") return false;
    let date = new Date(timestamp);
    if (isNaN(date)) return false;
    if (date.toISOString() !== timestamp) return false;
    let now = new Date();
    if (date <= now - MAX_CLOCK_SKEW_SECONDS * 1000) return false; // Timestamp too far back
    if (date > now) return false; // Timestamp in the future
    return true;
}

function validate_deployment(event) {
    let deployment = event.deployment;
    if (deployment === null) return false;
    if (typeof deployment !== "object") return false;
    if (typeof deployment.id !== "string") return false;
    if (typeof deployment.version !== "string") return false;
    if (typeof deployment.commit_hash !== "string") return false;
    return true;
}

function validate_user(event) {
    let user_id = event.user_id;
    if (typeof user_id !== "string") return false;
    if (!UUID_REGEX.test(user_id)) return false;
    return true;
}

function validate_url(event) {
    let current_url = event.current_url;
    if (typeof current_url !== "string") return false;
    if (!URL.canParse(current_url)) return false;
    return true;
}

function validate_referrer(event) {
    let referrer = event.referrer;
    if (typeof referrer !== "string") return false;
    if (referrer !== "" && !URL.canParse(referrer)) return false;
    return true;
}

function validate_metadata(event) {
    let metadata = event.metadata;
    if (metadata === null) return false;
    if (typeof metadata !== "object") return false;
    switch (event.event_type) {
        case "page_load":
            if (typeof metadata.load_time !== "number") return false;
            break;
        case "error":
            if (typeof metadata.severity !== "string") return false;
            if (typeof metadata.message !== "string") return false;
            break;
        case "survey":
            if (typeof metadata.rating !== "number") return false;
            if (typeof metadata.message !== "string") return false;
            break;
        case "click":
            if (typeof metadata.element_id !== "string") return false;
            if (typeof metadata.element_class !== "string") return false;
            if (typeof metadata.input_delay !== "number") return false;
            break;
    }
    return true;
}

function validateEvent(event) {
    if (event === null) return false;
    if (typeof event !== "object") return false;
    if (!validateEventType(event)) return false;
    if (!validateTimestamp(event)) return false;
    if (!validateDeployment(event)) return false;
    if (!validateUser(event)) return false;
    if (!validateURL(event)) return false;
    if (!validateReferrer(event)) return false;
    if (!validateMetadata(event)) return false;
    return true;
}

function cleanupExtraFields(object, fields) {
    Object.keys(object).forEach(key => {
        if (!fields.has(key)) {
            delete object[key];
        }
    });
}

export default class Event {
    constructor(json) {
        this.valid = false;
        let event = parseJSON(json);
        if (!validateEvent(event)) return null;
        event.created_at = new Date().toISOString();
        let urlObject = new URL(event.current_url);
        event.host = urlObject.host;
        event.pathname = urlObject.pathname;
        if (event.referrer !== "") {
            event.referring_domain = new URL(event.referrer).hostname;
        } else {
            event.referring_domain = "";
        }
        cleanup_extra_fields(event.deployment, DEPLOYMENT_FIELDS);
        cleanup_extra_fields(event.metadata, METADATA_FIELDS[event.event_type]);
        cleanup_extra_fields(event, EVENT_FIELDS);
        this.event = event;
        this.valid = true;
    }

    set_field(field, value) {
        if (!EVENT_FIELDS.has(field)) return false;
        this.event[field] = value;
        return true;
    }

    set_metadata_field(field, value) {
        if (!METADATA_FIELDS.has(field)) return false;
        this.event.metadata[field] = value;
        return true;
    }
}