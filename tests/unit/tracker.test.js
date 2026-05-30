// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const FIXED_NOW = '2026-05-19T12:00:00.000Z';
const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440000';
const LOG_ENDPOINT = 'http://localhost:8080/api/log?apikey=';

async function loadTracker() {
  await import('../../src/prototype/tracker/assets/tracker.js');
}

function jsonResponse(body = { ok: true }, ok = true) {
  return {
    ok,
    status: ok ? 200 : 500,
    url: LOG_ENDPOINT,
    json: () => Promise.resolve(body),
  };
}

function lastLoggedEvent() {
  const call = fetchMock.mock.calls.find(
    ([url, init]) => url === LOG_ENDPOINT && init?.method === 'POST',
  );
  if (!call) throw new Error('No POST request was made to the log endpoint');
  return JSON.parse(call[1].body);
}

let fetchMock;
let logSpy;
let warnSpy;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(FIXED_NOW));

  localStorage.clear();
  localStorage.setItem('watchtower_user_id', TEST_USER_ID);

  vi.stubGlobal('crypto', {
    randomUUID: vi.fn(() => 'newly-generated-uuid'),
  });

  vi.stubGlobal('PromiseRejectionEvent', class extends Event {
  constructor(type, options) {
    super(type);
    this.reason = options?.reason;
  }
});

  logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

  fetchMock = vi.fn(async (url, init) => {
    if (url === LOG_ENDPOINT && init?.method === 'POST') {
      return jsonResponse();
    }
    return jsonResponse({ data: 'app' });
  });
  vi.stubGlobal('fetch', fetchMock);

  vi.stubGlobal('PerformanceObserver', class {
    static _lastInstance = null;
    constructor(cb) {
      this._cb = cb;
      PerformanceObserver._lastInstance = this;
    }
    observe() {}
    disconnect() {}
    emitNavigationEntry({ startTime = 0, loadEventEnd = 1200 } = {}) {
      this._cb({
        getEntries: () => [{ startTime, loadEventEnd }],
      });
    }
  });

  Object.defineProperty(window, 'location', {
    value: { href: 'https://app.example/checkout', hostname: 'app.example' },
    writable: true,
  });
  Object.defineProperty(document, 'referrer', {
    value: 'https://google.com/',
    writable: true,
  });

  delete window.WatchTower;
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
  vi.resetModules();
});

describe('logEvent transport', () => {
  it('Posts JSON to log endpoint', async () => {
    await loadTracker();
    window.logSurvey(5, 'great');

    expect(fetchMock).toHaveBeenCalledWith(
      LOG_ENDPOINT,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const body = lastLoggedEvent();
    expect(body.event_type).toBe('survey');
    expect(body.metadata).toEqual({ rating: 5, message: 'great' });
  });

  it('Logs response JSON on success', async () => {
    fetchMock.mockImplementation(async (url, init) => {
      if (url === LOG_ENDPOINT) return jsonResponse({ received: true });
      return jsonResponse();
    });

    await loadTracker();
    window.logSurvey(3, 'ok');
    await vi.waitFor(() => expect(logSpy).toHaveBeenCalledWith('Response:', { received: true }));
  });

  it('Swallows non-OK responses and logs failure', async () => {
    fetchMock.mockImplementation(async (url) => {
      if (url === LOG_ENDPOINT) return jsonResponse({}, false);
      return jsonResponse();
    });

    await loadTracker();
    window.logSurvey(1, 'bad');
    await vi.waitFor(() => expect(logSpy).toHaveBeenCalledWith('Logging failed:', expect.any(Error)));
  });

  it('Swallows network errors', async () => {
    fetchMock.mockImplementation(async (url) => {
      if (url === LOG_ENDPOINT) throw new Error('offline');
      return jsonResponse();
    });

    await loadTracker();
    window.logSurvey(2, 'x');
    await vi.waitFor(() => expect(logSpy).toHaveBeenCalledWith('Logging failed:', expect.objectContaining({ message: 'offline' })));
  });
});

describe('event envelope', () => {
  it('Includes timestamp, deployment, user_id, url, referrer', async () => {
    await loadTracker();
    window.logSurvey(4, 'hi');

    const event = lastLoggedEvent();
    expect(event.timestamp).toBe(FIXED_NOW);
    expect(event.user_id).toBe(TEST_USER_ID);
    expect(event.current_url).toBe('https://app.example/checkout');
    expect(event.referrer).toBe('https://google.com/');
    expect(event.deployment).toMatchObject({
      id: 'dep_abcd',
      version: '0.0.0',
      commit_hash: 'a1b2c3d',
      author: 'kevin',
    });
    expect(window.WatchTower.deployment).toEqual(event.deployment);
  });

  it('Creates and persists user id when missing', async () => {
    localStorage.removeItem('watchtower_user_id');
    await loadTracker();
    window.logSurvey(5, 'first visit');

    expect(localStorage.getItem('watchtower_user_id')).toBe('newly-generated-uuid');
    expect(lastLoggedEvent().user_id).toBe('newly-generated-uuid');

    fetchMock.mockClear();
    window.logSurvey(5, 'second');

    expect(lastLoggedEvent().user_id).toBe('newly-generated-uuid');
    expect(crypto.randomUUID).toHaveBeenCalledTimes(1);
  });
});

describe('logSurvey', () => {
  it('Exposes window.logSurvey', async () => {
    await loadTracker();
    expect(typeof window.logSurvey).toBe('function');
  });

  it('Sends survey event_type and metadata', async () => {
    await loadTracker();
    window.logSurvey(3, 'comment');

    const event = lastLoggedEvent();
    expect(event.event_type).toBe('survey');
    expect(event.metadata).toEqual({ rating: 3, message: 'comment' });
  });
});

describe('page load observer', () => {
  it('Logs page_load when navigation entry has loadEventEnd > 0', async () => {
    await loadTracker();
    fetchMock.mockClear();

    const po = PerformanceObserver._lastInstance;
    po.emitNavigationEntry({ startTime: 100, loadEventEnd: 900 });

    const event = lastLoggedEvent();
    expect(event.event_type).toBe('page_load');
    expect(event.metadata.load_time).toBe(800);
  });

  it('Does not log when loadEventEnd is 0', async () => {
    await loadTracker();
    fetchMock.mockClear();

    PerformanceObserver._lastInstance.emitNavigationEntry({
      startTime: 0,
      loadEventEnd: 0,
    });

    const loggingPosts = fetchMock.mock.calls.filter(
      ([url, init]) => url === LOG_ENDPOINT && init?.method === 'POST',
    );
    expect(loggingPosts).toHaveLength(0);
  });
});

describe('window error handler', () => {
  it('Logs critical error with message', async () => {
    await loadTracker();
    fetchMock.mockClear();

    window.dispatchEvent(new ErrorEvent('error', { message: 'script blew up' }));

    const event = lastLoggedEvent();
    expect(event.event_type).toBe('error');
    expect(event.metadata).toEqual({
      severity: 'critical',
      message: 'script blew up',
    });
  });
});

describe('console.warn override', () => {
  it('Calls original warn and logs warning severity', async () => {
    await loadTracker();
    fetchMock.mockClear();

    console.warn('deprecation notice');

    expect(warnSpy).toHaveBeenCalledWith('deprecation notice');

    const event = lastLoggedEvent();
    expect(event.metadata).toEqual({
      severity: 'warning',
      message: 'deprecation notice',
    });
  });
});

describe('unhandledrejection handler', () => {
  it('Logs critical error from reason.message', async () => {
    await loadTracker();
    fetchMock.mockClear();

    window.dispatchEvent(
      new PromiseRejectionEvent('unhandledrejection', {
        reason: new Error('promise failed'),
      }),
    );

    const event = lastLoggedEvent();
    expect(event.metadata.message).toBe('promise failed');
    expect(event.metadata.severity).toBe('critical');
  });
});

describe('fetch wrapper', () => {
  it('Returns the response even when not ok', async () => {
    await loadTracker();

    fetchMock.mockImplementationOnce(async () =>
      jsonResponse({}, false),
    );

    const res = await fetch('https://api.example/items');
    expect(res.ok).toBe(false);
  });

  it('Logs critical error for failed app fetch', async () => {
    await loadTracker();
    fetchMock.mockClear();

    fetchMock.mockImplementationOnce(async () => ({
      ok: false,
      status: 404,
      url: 'https://api.example/missing',
      json: () => Promise.resolve({}),
    }));

    await fetch('https://api.example/missing', { method: 'DELETE' });

    const event = lastLoggedEvent();
    expect(event.metadata.message).toBe('DELETE https://api.example/missing 404');
  });
});
