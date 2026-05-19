export function attemptSuccess(attempt) {
    return typeof attempt.status === "number" && attempt.status >= 200 && attempt.status < 300;
}

export class UptimeCheckAttempt {
    constructor(startTime, endTime, status, error) {
        return {
            "timestamp": startTime.toISOString(),
            status,
            "latency": endTime - startTime,
            error
        };
    }
}

export class UptimeCheck {
    constructor(url, attempts) {
        const lastAttempt = attempts[attempts.length - 1];
        return {
            url,
            "timestamp": attempts[0].timestamp,
            "is_up": attemptSuccess(lastAttempt),
            "status": lastAttempt.status,
            "latency": lastAttempt.latency,
            attempts
        };
    }
}