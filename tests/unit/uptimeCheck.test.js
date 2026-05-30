//vitest imports
import { describe, it, expect } from "vitest";

import {
  attemptSuccess,
  UptimeCheckAttempt,
  UptimeCheck,
} from "../../src/prototype/server/assets/UptimeCheck.js";

const BASE_TIME = 1_700_000_000_000;
const mkAttempt = (offsetMs, status, error = null) => ({
  timestamp: new Date(BASE_TIME + offsetMs).toISOString(),
  status,
  latency: 100,
  error,
});

describe("attemptSuccess", () => {
  it("Handles inclusive lower bound successfully", () => {
    expect(attemptSuccess({ status: 200 })).toBe(true);
  });
  it("Handles exclusive upper bound successfully", () => {
    expect(attemptSuccess({ status: 299 })).toBe(true);
  });
  it("Handles non-number status", () => {
    expect(attemptSuccess({ status: "200" })).toBe(false);
  });
  it("Handles attempt with status beyond upper bound", () => {
    expect(attemptSuccess({ status: 600 })).toBe(false);
  });
  it("Handles attempt with status less than lower bound", () => {
    expect(attemptSuccess({ status: 199 })).toBe(false);
  });
  it("Handles null attempt status", () => {
    expect(attemptSuccess({ status: null })).toBe(false);
  });
  it("Handles status exactly at upper bound exclusion", () => {
    expect(attemptSuccess({ status: 300 })).toBe(false);
  });
  it("Handles undefined status", () => {
    expect(attemptSuccess({ status: undefined })).toBe(false);
  });
  it("Handles missing status property", () => {
    expect(attemptSuccess({})).toBe(false);
  });
});

describe("UptimeCheckAttempt", () => {
  it("Test attempt for timestamp ISO string conversion and latency calculation", () => {
    const start = new Date("2026-05-22T12:00:00.000Z");
    const end = new Date("2026-05-22T12:00:00.100Z");
    const attempt = new UptimeCheckAttempt(start, end, 200, null);
    expect(attempt.timestamp).toBe("2026-05-22T12:00:00.000Z");
    expect(attempt.latency).toBe(100);
  });
  it("Tests attempt with null status and error", () => {
    const start = new Date("2026-05-22T12:00:00.000Z");
    const end = new Date("2026-05-22T12:00:00.050Z");
    const error = new Error("timeout");
    const attempt = new UptimeCheckAttempt(start, end, null, error);
    expect(attempt.timestamp).toBe("2026-05-22T12:00:00.000Z");
    expect(attempt.status).toBe(null);
    expect(attempt.latency).toBe(50);
    expect(attempt.error).toBe(error);
  });
  it("Tests attempt with non-2xx HTTP status with no error", () => {
    const start = new Date("2026-05-22T12:00:00.000Z");
    const end = new Date("2026-05-22T12:00:00.025Z");
    const attempt = new UptimeCheckAttempt(start, end, 503, null);
    expect(attempt.status).toBe(503);
    expect(attempt.error).toBe(null);
    expect(attempt.latency).toBe(25);
  });
  it("Tests attempt with zero latency", () => {
    const time = new Date("2026-05-22T12:00:00.000Z");
    const attempt = new UptimeCheckAttempt(time, time, 200, null);
    expect(attempt.latency).toBe(0);
  });
});

describe("UptimeCheck", () => {
  it("Preserves the attempts array", () => {
    const attempts = [mkAttempt(0, 503), mkAttempt(1000, 200)];
    const check = new UptimeCheck("https://example.com", attempts);
    expect(check.attempts).toBe(attempts);
    expect(check.attempts).toHaveLength(2);
  });
  it("Marks check as up for a single successful attempt", () => {
    const attempts = [mkAttempt(0, 200)];
    const check = new UptimeCheck("https://example.com", attempts);
    expect(check.is_up).toBe(true);
    expect(check.status).toBe(200);
    expect(check.timestamp).toBe(attempts[0].timestamp);
    expect(check.latency).toBe(100);
    expect(check.url).toBe("https://example.com");
  });
  it("Marks check as down for a single failed attempt", () => {
    const attempts = [mkAttempt(0, 503)];
    const check = new UptimeCheck("https://example.com", attempts);
    expect(check.is_up).toBe(false);
    expect(check.status).toBe(503);
    expect(check.timestamp).toBe(attempts[0].timestamp);
    expect(check.latency).toBe(100);
  });
  it("Marks check as up when last attempt of multiple succeeds", () => {
    const attempts = [mkAttempt(0, 503), mkAttempt(1000, 200)];
    const check = new UptimeCheck("https://example.com", attempts);
    expect(check.is_up).toBe(true);
    expect(check.status).toBe(200);
    expect(check.timestamp).toBe(attempts[0].timestamp);
    expect(check.latency).toBe(100);
  });
  it("Marks check as down when last attempt fails after earlier success", () => {
    const attempts = [mkAttempt(0, 200), mkAttempt(1000, 503)];
    const check = new UptimeCheck("https://example.com", attempts);
    expect(check.is_up).toBe(false);
    expect(check.status).toBe(503);
    expect(check.timestamp).toBe(attempts[0].timestamp);
    expect(check.latency).toBe(100);
  });
  it("Uses timestamp from first attempt and status/latency from last attempt", () => {
    const attempts = [
      { ...mkAttempt(0, 503), latency: 50 },
      { ...mkAttempt(5000, 200), latency: 250 },
    ];
    const check = new UptimeCheck("https://example.com", attempts);
    expect(check.timestamp).toBe(attempts[0].timestamp);
    expect(check.status).toBe(200);
    expect(check.latency).toBe(250);
  });
  it("Marks check as down when last attempt has null status (fetch error)", () => {
    const attempts = [
      mkAttempt(0, 200),
      mkAttempt(1000, null, new Error("network error")),
    ];
    const check = new UptimeCheck("https://example.com", attempts);
    expect(check.is_up).toBe(false);
    expect(check.status).toBe(null);
    expect(check.attempts[1].error).toBeInstanceOf(Error);
  });
});
