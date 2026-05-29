/**
 * Returns true if the attempt's HTTP status indicates success.
 * @param {object} attempt
 * @returns {boolean}
 */
export function attemptSuccess(attempt) {
  return (
    typeof attempt.status === "number" &&
    attempt.status >= 200 &&
    attempt.status < 300
  );
}

export class UptimeCheckAttempt {
  constructor(startTime, endTime, status, error) {
    return {
      timestamp: startTime.toISOString(),
      status,
      latency: endTime - startTime,
      error,
    };
  }
}

export class UptimeCheck {
<<<<<<< HEAD
    constructor(project_id, url, attempts) {
        const lastAttempt = attempts[attempts.length - 1];
        return {
            project_id,
            url,
            "timestamp": attempts[0].timestamp,
            "is_up": attemptSuccess(lastAttempt),
            "status": lastAttempt.status,
            "latency": lastAttempt.latency,
            attempts
        };
    }
}
=======
  constructor(url, attempts) {
    const lastAttempt = attempts[attempts.length - 1];
    return {
      url,
      timestamp: attempts[0].timestamp,
      is_up: attemptSuccess(lastAttempt),
      status: lastAttempt.status,
      latency: lastAttempt.latency,
      attempts,
    };
  }
}
>>>>>>> 614c9ed06fd99d8dae2767c77855a2adc2f9d235
