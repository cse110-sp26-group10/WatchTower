import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const sendMail = vi.fn().mockResolvedValue({});
const createTransport = vi.fn(() => ({ sendMail }));

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
vi.mock("../../src/prototype/server/assets/db.js", () => ({
  supabase: mockSupabase,
}));

let notify;
let notifyDowntime;
let notifyError;

const payload = { title: "Test alert", message: "Something happened" };
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
const errorEvent = {
  event_type: "error",
  project_id: 10,
  host: "example.com",
  current_url: "https://example.com/checkout",
  metadata: { severity: "high", message: "boom" },
};

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.useRealTimers();
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASS;
  global.fetch = vi.fn().mockResolvedValue({ ok: true });
  mockSupabase.auth.admin.getUserById.mockResolvedValue({
    data: { user: { email: "user@example.com" } },
    error: null,
  });
  mockProjectUsers([]);

  ({ notify, notifyDowntime, notifyError } = await import(
    "../../src/prototype/server/assets/notify.js"
  ));
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

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(mockSupabase.auth.admin.getUserById).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenCalledTimes(1);
  });

  it("Sends push only when notify_methods is ['push']", async () => {
    expect(await notify(baseUser, payload)).toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(1);
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
        text: payload.message,
      }),
    );
  });

  it("Returns true when push succeeds on the first try", async () => {
    expect(await notify(baseUser, payload)).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(baseUser.alert_id),
      expect.objectContaining({
        method: "POST",
        body: payload.message,
        headers: expect.objectContaining({
          "X-Title": payload.title,
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
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it("Returns true when push fails once then succeeds", async () => {
    vi.useFakeTimers();
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true });

    const promise = notify(baseUser, payload);
    await vi.runAllTimersAsync();

    expect(await promise).toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(2);
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

    await notifyDowntime(project);

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("topic-1"),
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-Title": `${project.name} is down`,
          "X-Priority": "high",
          "X-Tags": "warning",
        }),
        body: `${project.website_url} appears to be offline.`,
      }),
    );
  });

  it("Does nothing when the project has no users", async () => {
    await notifyDowntime(project);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("Does nothing when loading project users fails", async () => {
    mockProjectUsers(null, { message: "db fail" });

    await notifyDowntime(project);

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

  it("Notifies each project user for a valid error event", async () => {
    mockProjectUsers([{ users: baseUser }]);

    await notifyError(errorEvent);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(baseUser.alert_id),
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-Title": `Error on ${errorEvent.host}`,
          "X-Priority": "high",
          "X-Tags": "rotating_light",
        }),
        body: `[high] boom\n${errorEvent.current_url}`,
      }),
    );
  });

  it("Uses default priority when severity is not high", async () => {
    mockProjectUsers([{ users: baseUser }]);

    await notifyError({
      ...errorEvent,
      metadata: { severity: "critical", message: "boom" },
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ "X-Priority": "default" }),
      }),
    );
  });

  it("Uses fallback message when metadata.message is missing", async () => {
    mockProjectUsers([{ users: baseUser }]);

    await notifyError({
      ...errorEvent,
      metadata: { severity: "high" },
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: `[high] An error was reported.\n${errorEvent.current_url}`,
      }),
    );
  });

  it("Does nothing when loading project users fails", async () => {
    mockProjectUsers(null, { message: "db fail" });

    await notifyError(errorEvent);

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
