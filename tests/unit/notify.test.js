import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const sendMail = vi.fn().mockResolvedValue({});
const createTransport = vi.fn(() => ({ sendMail }));

const mockDbHelper = {
  getProjectFromId: vi.fn(),
};

const mockSupabase = {
  auth: {
    admin: {
      getUserById: vi.fn(),
    },
  },
  from: vi.fn(),
};

function chain(result) {
  const promise = Promise.resolve(result);
  const builder = Object.assign(promise, {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
  });
  return builder;
}

function mockProjectUsers(rows, error = null) {
  mockSupabase.from.mockImplementation((table) => {
    if (table !== "users_projects") {
      throw new Error(`Unexpected table: ${table}`);
    }
    return chain({ data: rows, error });
  });
}

vi.mock("dotenv/config", () => ({}));
vi.mock("nodemailer", () => ({
  default: { createTransport },
}));
vi.mock("../../src/app/server/assets/db.js", () => ({
  supabase: mockSupabase,
  dbHelper: mockDbHelper,
}));

let notify;
let notifyDowntime;
let notifyError;

const payload = {
  title: "Test alert",
  message: "Something happened",
  html: "<p>Test report</p>",
};
const baseUser = {
  alert_id: "topic-abc",
  auth_id: "auth-uuid-1",
  notify_methods: ["push"],
};
const project = {
  id: 10,
  name: "My Site",
  website_url: "https://example.com",
};
const uptimeCheck = {
  url: "https://example.com",
  timestamp: "2026-05-19T12:00:00.000Z",
  status: 503,
  latency: 0,
  attempts: [
    {
      error: { cause: { code: "ECONNREFUSED" } },
      timestamp: "2026-05-19T12:00:00.000Z",
      status: null,
      latency: 0,
    },
  ],
};
const errorEvent = {
  event_type: "error",
  project_id: 10,
  host: "example.com",
  current_url: "https://example.com/checkout",
  pathname: "/checkout",
  timestamp: "2026-05-19T12:00:00.000Z",
  ip: "127.0.0.1",
  deployment: {
    id: "dep_001",
    version: "1.0.0",
    commit_hash: "abc",
    author: "evan",
  },
  browser: { name: "Chrome", version: "120" },
  referrer: "",
  metadata: { severity: "critical", message: "boom" },
};

// Returns a fetch mock that handles both the HTML upload (returns attachment URL)
// and the notification send (returns ok).
function makeFetchSuccess() {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: vi.fn().mockResolvedValue({
      attachment: { url: "https://ntfy.sh/attachment/report.html" },
    }),
  });
}

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.useRealTimers();
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASS;
  global.fetch = makeFetchSuccess();
  mockSupabase.auth.admin.getUserById.mockResolvedValue({
    data: { user: { email: "user@example.com" } },
    error: null,
  });
  mockDbHelper.getProjectFromId.mockResolvedValue({ project, error: null });
  mockProjectUsers([]);

  ({ notify, notifyDowntime, notifyError } =
    await import("../../src/app/server/assets/notify.js"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("notify", () => {
  it("Returns false when user has no alert_id", async () => {
    expect(await notify({ auth_id: "x" }, payload)).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("Returns false when user is null", async () => {
    expect(await notify(null, payload)).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("Sends nothing when notify_methods is null", async () => {
    expect(await notify({ ...baseUser, notify_methods: null }, payload)).toBe(
      false,
    );
    expect(global.fetch).not.toHaveBeenCalled();
    expect(mockSupabase.auth.admin.getUserById).not.toHaveBeenCalled();
  });

  it("Sends nothing when notify_methods is an empty array", async () => {
    expect(await notify({ ...baseUser, notify_methods: [] }, payload)).toBe(
      false,
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("Uses default channels when notify_methods is undefined", async () => {
    process.env.SMTP_USER = "smtp@gmail.com";
    process.env.SMTP_PASS = "secret";

    expect(
      await notify({ ...baseUser, notify_methods: undefined }, payload),
    ).toBe(true);

    // 2 fetch calls: upload HTML report + send ntfy notification
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(mockSupabase.auth.admin.getUserById).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenCalledTimes(1);
  });

  it("Sends push only when notify_methods is ['push']", async () => {
    expect(await notify(baseUser, payload)).toBe(true);
    // 2 fetch calls: upload HTML report + send ntfy notification
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(mockSupabase.auth.admin.getUserById).not.toHaveBeenCalled();
  });

  it("Sends email only when notify_methods is ['email']", async () => {
    process.env.SMTP_USER = "smtp@gmail.com";
    process.env.SMTP_PASS = "secret";

    expect(
      await notify({ ...baseUser, notify_methods: ["email"] }, payload),
    ).toBe(false);

    expect(global.fetch).not.toHaveBeenCalled();
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "user@example.com",
        subject: payload.title,
        html: payload.html,
      }),
    );
  });

  it("Returns true when push succeeds on the first try", async () => {
    expect(await notify(baseUser, payload)).toBe(true);
    // First call: upload HTML to storage topic (URL contains alert_id)
    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining(baseUser.alert_id),
      expect.objectContaining({ method: "POST" }),
    );
    // Second call: send notification as JSON to NTFY_BASE_URL
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      expect.any(String),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "X-Priority": "default",
        }),
      }),
    );
  });

  it("Returns false when push fails all retries", async () => {
    vi.useFakeTimers();
    global.fetch = vi.fn().mockResolvedValue({ ok: false });

    const promise = notify(baseUser, payload);
    await vi.runAllTimersAsync();

    expect(await promise).toBe(false);
    // Upload fails each retry — one fetch call per attempt, no second call
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it("Returns true when push fails once then succeeds", async () => {
    vi.useFakeTimers();
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          attachment: { url: "https://ntfy.sh/attachment/report.html" },
        }),
      });

    const promise = notify(baseUser, payload);
    await vi.runAllTimersAsync();

    expect(await promise).toBe(true);
    // Attempt 1: upload fails (1 call). Attempt 2: upload + notification (2 calls).
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it("Skips email when auth lookup returns no email", async () => {
    process.env.SMTP_USER = "smtp@gmail.com";
    process.env.SMTP_PASS = "secret";
    mockSupabase.auth.admin.getUserById.mockResolvedValue({
      data: { user: {} },
      error: null,
    });

    expect(
      await notify({ ...baseUser, notify_methods: ["email"] }, payload),
    ).toBe(false);

    expect(sendMail).not.toHaveBeenCalled();
  });

  it("Skips email when SMTP is not configured", async () => {
    expect(
      await notify({ ...baseUser, notify_methods: ["email"] }, payload),
    ).toBe(false);
    expect(createTransport).not.toHaveBeenCalled();
    expect(sendMail).not.toHaveBeenCalled();
  });
});

describe("notifyDowntime", () => {
  it("Notifies each user attached to the project", async () => {
    mockProjectUsers([
      { users: { ...baseUser, alert_id: "topic-1" } },
      { users: { ...baseUser, alert_id: "topic-2" } },
    ]);

    await notifyDowntime(project, uptimeCheck);

    // 2 users × 2 fetch calls each (upload + notification) = 4 calls
    expect(global.fetch).toHaveBeenCalledTimes(4);
    // Notification calls have X-Priority and X-Tags headers
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-Priority": "high",
          "X-Tags": "rotating_light",
        }),
      }),
    );
  });

  it("Does nothing when the project has no users", async () => {
    await notifyDowntime(project, uptimeCheck);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("Does nothing when loading project users fails", async () => {
    mockProjectUsers(null, { message: "db fail" });

    await notifyDowntime(project, uptimeCheck);

    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe("notifyError", () => {
  it("Returns early for non-error events", async () => {
    await notifyError({ ...errorEvent, event_type: "page_load" });

    expect(mockSupabase.from).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("Returns early when event is null", async () => {
    await notifyError(null);

    expect(mockSupabase.from).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("Notifies each project user for a valid critical error event", async () => {
    mockProjectUsers([{ users: baseUser }]);

    await notifyError(errorEvent);

    // 2 fetch calls: upload HTML report + send notification
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-Priority": "high",
          "X-Tags": "rotating_light",
        }),
      }),
    );
  });

  it("Uses default priority and warning tag when severity is not critical", async () => {
    mockProjectUsers([{ users: baseUser }]);

    await notifyError({
      ...errorEvent,
      metadata: { severity: "warning", message: "minor issue" },
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-Priority": "default",
          "X-Tags": "warning",
        }),
      }),
    );
  });

  it("Uses fallback message when metadata.message is missing", async () => {
    mockProjectUsers([{ users: baseUser }]);

    await notifyError({
      ...errorEvent,
      metadata: { severity: "critical" },
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("Does nothing when loading project users fails", async () => {
    mockProjectUsers(null, { message: "db fail" });

    await notifyError(errorEvent);

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
