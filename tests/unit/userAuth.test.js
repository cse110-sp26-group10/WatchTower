import { describe, it, expect, vi, beforeEach } from "vitest";

const mockAuth = {
  getUser: vi.fn(),
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  refreshSession: vi.fn(),
};
function chain(result) {
  const promise = Promise.resolve(result);
  const builder = Object.assign(promise, {
    select: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    update: vi.fn(() => builder),
    delete: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    order: vi.fn(() => builder),
    single: vi.fn(() => Promise.resolve(result)),
    maybeSingle: vi.fn(() => Promise.resolve(result)),
  });
  return builder;
}
const mockSupabase = {
  auth: mockAuth,
  from: vi.fn(),
};
function mockFrom(handler) {
  mockSupabase.from.mockImplementation((table) => {
    mockSupabase._lastTable = table;
    return handler(table);
  });
}
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => mockSupabase),
}));
vi.mock("ws", () => ({ default: class {} }));
vi.mock("dotenv/config", () => ({}));
const { dbHelper } = await import("../../src/app/server/assets/db.js");
const authUser = {
  id: "43ec5a9a-74bb-460a-b368-4767846455e0",
  email: "test123@ucsd.edu",
  created_at: "2026-01-01T00:00:00.000Z",
};
const appUser = {
  id: 1,
  auth_id: authUser.id,
  alert_id: "7a5c08e9-b869-49f1-89be-57a619363448",
  notify_methods: ["push", "email"],
};
const session = {
  access_token: "access-token-abc",
  refresh_token: "refresh-token-xyz",
};
const project = {
  id: 10,
  name: "project123",
  website_url: "https://example.com",
  api_key: "b23b3210-3597-45ad-8484-14936a967760",
};
const eventObject = {
  event: {
    event_type: "error",
    timestamp: "2026-05-19T12:00:00.000Z",
    created_at: "2026-05-19T12:00:00.000Z",
    deployment: {
      id: "dep_001",
      version: "1.0.0",
      commit_hash: "abc",
      deployed_at: "2026-01-01T00:00:00.000Z",
      author: "aron",
    },
    ip: "127.0.0.1",
    project_id: 10,
    current_url: "https://example.com/page",
    host: "example.com",
    pathname: "/page",
    referrer: "",
    referring_domain: "",
    metadata: { severity: "critical", message: "boom" },
  },
};
const uptimeCheck = {
  url: "https://example.com",
  timestamp: "2026-05-19T12:00:00.000Z",
  is_up: true,
  status: 200,
  latency: 120,
  attempts: [],
  project_id: 10,
};
beforeEach(() => {
  vi.clearAllMocks();
  mockSupabase._lastTable = null;
  mockFrom(() => chain({ data: null, error: null }));
});

describe("getAuthUserFromToken", () => {
  it("Returns auth user successfully", async () => {
    mockAuth.getUser.mockResolvedValue({
      data: { user: authUser },
      error: null,
    });
    expect(await dbHelper.getAuthUserFromToken("token")).toEqual({
      user: authUser,
      error: null,
    });
  });
  it("Returns error for Supabase error", async () => {
    const err = { message: "JWT expired" };
    mockAuth.getUser.mockResolvedValue({ data: { user: null }, error: err });
    expect(await dbHelper.getAuthUserFromToken("bad")).toEqual({
      user: null,
      error: err,
    });
  });
  it("Returns invalid if user is not found", async () => {
    mockAuth.getUser.mockResolvedValue({ data: {}, error: null });
    expect(await dbHelper.getAuthUserFromToken("bad")).toEqual({
      user: null,
      error: "Invalid access token",
    });
  });
});
describe("getUserFromToken", () => {
  it("Returns user and authUser successfully", async () => {
    mockAuth.getUser.mockResolvedValue({
      data: { user: authUser },
      error: null,
    });
    mockFrom((t) =>
      t === "users"
        ? chain({ data: appUser, error: null })
        : chain({ data: null, error: null }),
    );
    expect(await dbHelper.getUserFromToken("token")).toEqual({
      user: appUser,
      authUser,
      error: null,
    });
  });
  it("Returns auth error when validation fails", async () => {
    const err = { message: "invalid JWT" };
    mockAuth.getUser.mockResolvedValue({ data: { user: null }, error: err });
    expect(await dbHelper.getUserFromToken("bad")).toEqual({
      user: null,
      authUser: null,
      error: err,
    });
    expect(mockSupabase.from).not.toHaveBeenCalled();
  });
  it("Returns db error when query fails", async () => {
    const err = { message: "db fail" };
    mockAuth.getUser.mockResolvedValue({
      data: { user: authUser },
      error: null,
    });
    mockFrom((t) =>
      t === "users"
        ? chain({ data: null, error: err })
        : chain({ data: null, error: null }),
    );
    expect(await dbHelper.getUserFromToken("token")).toEqual({
      user: null,
      authUser: null,
      error: err,
    });
  });
  it("Returns missing user when row is absent", async () => {
    mockAuth.getUser.mockResolvedValue({
      data: { user: authUser },
      error: null,
    });
    mockFrom((t) =>
      t === "users"
        ? chain({ data: null, error: null })
        : chain({ data: null, error: null }),
    );
    expect(await dbHelper.getUserFromToken("token")).toEqual({
      user: null,
      authUser: null,
      error: "Missing user",
    });
  });
});
describe("signUp", () => {
  it("Returns session and user successfully", async () => {
    mockAuth.signUp.mockResolvedValue({
      data: { session, user: authUser },
      error: null,
    });
    mockFrom((t) =>
      t === "users"
        ? chain({ data: appUser, error: null })
        : chain({ data: null, error: null }),
    );
    const result = await dbHelper.signUp("new@example.com", "password123");
    expect(result.error).toBeNull();
    expect(result.data.session).toEqual(session);
    expect(result.user).toEqual(appUser);
  });
  it("Returns error when signUp fails", async () => {
    const err = { message: "already registered" };
    mockAuth.signUp.mockResolvedValue({ data: null, error: err });
    expect(await dbHelper.signUp("new@example.com", "pw")).toEqual({
      data: null,
      user: null,
      error: err,
    });
  });
  it("Returns appropriately when session is missing", async () => {
    mockAuth.signUp.mockResolvedValue({
      data: { user: authUser, session: null },
      error: null,
    });
    expect(await dbHelper.signUp("new@example.com", "pw")).toEqual({
      data: null,
      user: null,
      error: "Invalid credentials",
    });
  });
  it("Returns error when user insert fails", async () => {
    mockAuth.signUp.mockResolvedValue({
      data: { session, user: authUser },
      error: null,
    });
    mockFrom((t) =>
      t === "users"
        ? chain({ data: null, error: { message: "dup" } })
        : chain({ data: null, error: null }),
    );
    const result = await dbHelper.signUp("new@example.com", "pw");
    expect(result.data).toBeNull();
    expect(result.user).toBeNull();
  });
});
describe("logIn", () => {
  it("Returns session successfully", async () => {
    mockAuth.signInWithPassword.mockResolvedValue({
      data: { session },
      error: null,
    });
    expect(await dbHelper.logIn("a@b.com", "pw")).toEqual({
      data: { session },
      error: null,
    });
  });
  it("Returns error on bad credentials", async () => {
    const err = { message: "Invalid login credentials" };
    mockAuth.signInWithPassword.mockResolvedValue({ data: null, error: err });
    expect(await dbHelper.logIn("a@b.com", "wrong")).toEqual({
      data: null,
      error: err,
    });
  });
  it("Returns appropriately when session is missing", async () => {
    mockAuth.signInWithPassword.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    expect(await dbHelper.logIn("a@b.com", "pw")).toEqual({
      data: null,
      error: "Invalid credentials",
    });
  });
});
describe("logOut", () => {
  it("Returns null successfully", async () => {
    mockAuth.signOut.mockResolvedValue({ error: null });
    expect(await dbHelper.logOut("token")).toBeNull();
  });
  it("Returns error when signOut fails", async () => {
    const err = { message: "fail" };
    mockAuth.signOut.mockResolvedValue({ error: err });
    expect(await dbHelper.logOut("token")).toEqual(err);
  });
});
describe("refreshSession", () => {
  it("Returns session successfully", async () => {
    mockAuth.refreshSession.mockResolvedValue({
      data: { session },
      error: null,
    });
    expect(await dbHelper.refreshSession("refresh")).toEqual({
      data: { session },
      error: null,
    });
  });
  it("Returns error when refresh fails", async () => {
    const err = { message: "invalid refresh" };
    mockAuth.refreshSession.mockResolvedValue({ data: null, error: err });
    expect(await dbHelper.refreshSession("bad")).toEqual({
      data: null,
      error: err,
    });
  });
  it("Returns appropriately when session is missing", async () => {
    mockAuth.refreshSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    expect(await dbHelper.refreshSession("refresh")).toEqual({
      data: null,
      error: "Invalid credentials",
    });
  });
});
describe("getProjectFromAPIKey", () => {
  it("Returns project successfully", async () => {
    mockFrom((t) =>
      t === "projects"
        ? chain({ data: project, error: null })
        : chain({ data: null, error: null }),
    );
    expect(await dbHelper.getProjectFromAPIKey(project.api_key)).toEqual({
      project,
      error: null,
    });
  });
  it("Returns error when query fails", async () => {
    const err = { message: "fail" };
    mockFrom((t) =>
      t === "projects"
        ? chain({ data: null, error: err })
        : chain({ data: null, error: null }),
    );
    expect(await dbHelper.getProjectFromAPIKey(project.api_key)).toEqual({
      project: null,
      error: err,
    });
  });
  it("Returns invalid API key when not found", async () => {
    mockFrom((t) =>
      t === "projects"
        ? chain({ data: null, error: null })
        : chain({ data: null, error: null }),
    );
    expect(await dbHelper.getProjectFromAPIKey(project.api_key)).toEqual({
      project: null,
      error: "Invalid API key",
    });
  });
});
describe("getProjectFromId", () => {
  it("Returns project on success", async () => {
    mockFrom((t) =>
      t === "projects"
        ? chain({ data: project, error: null })
        : chain({ data: null, error: null }),
    );
    expect(await dbHelper.getProjectFromId(10)).toEqual({
      project,
      error: null,
    });
  });
  it("Returns null project when not found", async () => {
    mockFrom((t) =>
      t === "projects"
        ? chain({ data: null, error: null })
        : chain({ data: null, error: null }),
    );
    expect(await dbHelper.getProjectFromId(999)).toEqual({
      project: null,
      error: null,
    });
  });
  it("Returns error when query fails", async () => {
    const err = { message: "fail" };
    mockFrom((t) =>
      t === "projects"
        ? chain({ data: null, error: err })
        : chain({ data: null, error: null }),
    );
    expect(await dbHelper.getProjectFromId(10)).toEqual({
      project: null,
      error: err,
    });
  });
});
describe("getProjects", () => {
  it("Returns mapped projects successfully", async () => {
    mockFrom((t) =>
      t === "users_projects"
        ? chain({
            data: [{ projects: { id: 10 } }, { projects: { id: 11 } }],
            error: null,
          })
        : chain({ data: null, error: null }),
    );
    expect(await dbHelper.getProjects(appUser)).toEqual({
      projects: [
        { id: 10, permission_level: "Owner" },
        { id: 11, permission_level: "Owner" },
      ],
      error: null,
    });
  });
  it("Returns empty array when user has no projects", async () => {
    mockFrom((t) =>
      t === "users_projects"
        ? chain({ data: [], error: null })
        : chain({ data: null, error: null }),
    );
    expect(await dbHelper.getProjects(appUser)).toEqual({
      projects: [],
      error: null,
    });
  });
  it("Returns error when query fails", async () => {
    const err = { message: "fail" };
    mockFrom((t) =>
      t === "users_projects"
        ? chain({ data: null, error: err })
        : chain({ data: null, error: null }),
    );
    expect(await dbHelper.getProjects(appUser)).toEqual({
      projects: null,
      error: err,
    });
  });
});
describe("createProject", () => {
  it("Creates and links project successfully", async () => {
    mockFrom((t) => {
      if (t === "projects") return chain({ data: project, error: null });
      if (t === "users_projects") return chain({ data: null, error: null });
      return chain({ data: null, error: null });
    });
    expect(
      await dbHelper.createProject(appUser, project.name, project.website_url),
    ).toEqual({ project, error: null });
  });
  it("Returns error when project insert fails", async () => {
    const err = { message: "insert fail" };
    mockFrom((t) =>
      t === "projects"
        ? chain({ data: null, error: err })
        : chain({ data: null, error: null }),
    );
    expect(await dbHelper.createProject(appUser, "x", "https://x.com")).toEqual(
      { project: null, error: err },
    );
  });
  it("Returns error when link fails", async () => {
    const err = { message: "link fail" };
    mockFrom((t) => {
      if (t === "projects") return chain({ data: project, error: null });
      if (t === "users_projects") return chain({ data: null, error: err });
      return chain({ data: null, error: null });
    });
    expect(await dbHelper.createProject(appUser, "x", "https://x.com")).toEqual(
      { project: null, error: err },
    );
  });
});
describe("deleteProject", () => {
  it("Returns null successfully", async () => {
    mockFrom((t) => {
      if (t === "users_projects")
        return chain({ data: [{ user_id: 1, project_id: 10 }], error: null });
      if (t === "projects") return chain({ data: null, error: null });
      return chain({ data: null, error: null });
    });
    expect(await dbHelper.deleteProject(appUser, 10)).toBeNull();
  });
  it("Returns error when ownership query fails", async () => {
    const err = { message: "fail" };
    mockFrom((t) =>
      t === "users_projects"
        ? chain({ data: null, error: err })
        : chain({ data: null, error: null }),
    );
    expect(await dbHelper.deleteProject(appUser, 10)).toEqual(err);
  });
  it("Returns message when project not owned", async () => {
    mockFrom((t) =>
      t === "users_projects"
        ? chain({ data: null, error: null })
        : chain({ data: null, error: null }),
    );
    expect(await dbHelper.deleteProject(appUser, 10)).toBe(
      "Project not found for user",
    );
  });
  it("Returns error when delete fails", async () => {
    const err = { message: "delete fail" };
    mockFrom((t) => {
      if (t === "users_projects")
        return chain({ data: [{ user_id: 1, project_id: 10 }], error: null });
      if (t === "projects") return chain({ data: null, error: err });
      return chain({ data: null, error: null });
    });
    expect(await dbHelper.deleteProject(appUser, 10)).toEqual(err);
  });
});
describe("getEvents", () => {
  it("Returns flattened events successfully", async () => {
    mockFrom((t) =>
      t === "projects"
        ? chain({
            data: [{ events: [{ id: 1 }] }, { events: [{ id: 2 }] }],
            error: null,
          })
        : chain({ data: null, error: null }),
    );
    const result = await dbHelper.getEvents(appUser);
    expect(result.error).toBeNull();
    expect(result.events).toHaveLength(2);
  });
  it("Returns empty array when no events", async () => {
    mockFrom((t) =>
      t === "projects"
        ? chain({ data: [], error: null })
        : chain({ data: null, error: null }),
    );
    expect(await dbHelper.getEvents(appUser)).toEqual({
      events: [],
      error: null,
    });
  });
  it("Returns error when query fails", async () => {
    const err = { message: "fail" };
    mockFrom((t) =>
      t === "projects"
        ? chain({ data: null, error: err })
        : chain({ data: null, error: null }),
    );
    expect(await dbHelper.getEvents(appUser)).toEqual({
      events: null,
      error: err,
    });
  });
});
describe("getUptimeLog", () => {
  it("Filters uptime rows by hostname", async () => {
    mockFrom((t) =>
      t === "projects"
        ? chain({
            data: [
              {
                website_url: "https://example.com",
                uptime_log: [
                  { url: "https://example.com/a" },
                  { url: "https://other.com/b" },
                ],
              },
            ],
            error: null,
          })
        : chain({ data: null, error: null }),
    );
    const result = await dbHelper.getUptimeLog(appUser);
    expect(result.uptimeLog).toHaveLength(1);
    expect(result.uptimeLog[0].url).toBe("https://example.com/a");
  });
  it("Returns empty array when no data", async () => {
    mockFrom((t) =>
      t === "projects"
        ? chain({ data: [], error: null })
        : chain({ data: null, error: null }),
    );
    expect(await dbHelper.getUptimeLog(appUser)).toEqual({
      uptimeLog: [],
      error: null,
    });
  });
  it("Returns error when query fails", async () => {
    const err = { message: "fail" };
    mockFrom((t) =>
      t === "projects"
        ? chain({ data: null, error: err })
        : chain({ data: null, error: null }),
    );
    expect(await dbHelper.getUptimeLog(appUser)).toEqual({
      uptimeLog: null,
      error: err,
    });
  });
});
describe("getUptimeLogFromProject", () => {
  it("Returns rows successfully", async () => {
    const rows = [{ url: "https://example.com" }];
    mockFrom((t) =>
      t === "uptime_log"
        ? chain({ data: rows, error: null })
        : chain({ data: null, error: null }),
    );
    expect(await dbHelper.getUptimeLogFromProject(project)).toEqual({
      uptimeLog: rows,
      error: null,
    });
  });
  it("Returns error when query fails", async () => {
    const err = { message: "fail" };
    mockFrom((t) =>
      t === "uptime_log"
        ? chain({ data: null, error: err })
        : chain({ data: null, error: null }),
    );
    expect(await dbHelper.getUptimeLogFromProject(project)).toEqual({
      uptimeLog: null,
      error: err,
    });
  });
});
describe("logEvent", () => {
  it("Returns null successfully", async () => {
    mockFrom((t) =>
      t === "events"
        ? chain({ data: null, error: null })
        : chain({ data: null, error: null }),
    );
    expect(await dbHelper.logEvent(eventObject)).toBeNull();
    expect(mockSupabase.from).toHaveBeenCalledWith("events");
  });
  it("Returns error when insert fails", async () => {
    const err = { message: "insert fail" };
    mockFrom((t) =>
      t === "events"
        ? chain({ data: null, error: err })
        : chain({ data: null, error: null }),
    );
    expect(await dbHelper.logEvent(eventObject)).toEqual(err);
  });
});
describe("logUptime", () => {
  it("Returns null successfully", async () => {
    mockFrom((t) =>
      t === "uptime_log"
        ? chain({ data: null, error: null })
        : chain({ data: null, error: null }),
    );
    expect(await dbHelper.logUptime(uptimeCheck)).toBeNull();
  });
  it("Returns error when insert fails", async () => {
    const err = { message: "insert fail" };
    mockFrom((t) =>
      t === "uptime_log"
        ? chain({ data: null, error: err })
        : chain({ data: null, error: null }),
    );
    expect(await dbHelper.logUptime(uptimeCheck)).toEqual(err);
  });
});

describe("getUsers", () => {
  it("Returns users successfully", async () => {
    mockFrom((t) =>
      t === "users"
        ? chain({ data: [appUser], error: null })
        : chain({ data: null, error: null }),
    );
    expect(await dbHelper.getUsers()).toEqual({
      users: [appUser],
      error: null,
    });
  });
  it("Returns error when query fails", async () => {
    const err = { message: "fail" };
    mockFrom((t) =>
      t === "users"
        ? chain({ data: null, error: err })
        : chain({ data: null, error: null }),
    );
    expect(await dbHelper.getUsers()).toEqual({ users: null, error: err });
  });
});
describe("updateNotifyMethods", () => {
  it("Returns null successfully", async () => {
    mockFrom((t) =>
      t === "users"
        ? chain({ data: null, error: null })
        : chain({ data: null, error: null }),
    );
    expect(await dbHelper.updateNotifyMethods(appUser, ["email"])).toBeNull();
  });
  it("Allows opt-out with null", async () => {
    mockFrom((t) =>
      t === "users"
        ? chain({ data: null, error: null })
        : chain({ data: null, error: null }),
    );
    expect(await dbHelper.updateNotifyMethods(appUser, null)).toBeNull();
  });
  it("Returns error when update fails", async () => {
    const err = { message: "fail" };
    mockFrom((t) =>
      t === "users"
        ? chain({ data: null, error: err })
        : chain({ data: null, error: null }),
    );
    expect(await dbHelper.updateNotifyMethods(appUser, ["push"])).toEqual(err);
  });
});
