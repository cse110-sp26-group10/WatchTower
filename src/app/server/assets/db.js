import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import "dotenv/config";

// A one-time client will be created when dealing with sign-ups, sign-ins, and sign-outs
const newClient = () => {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { realtime: { transport: ws } },
  );
};

// Node 20 has no native WebSocket; supabase-js builds a Realtime client at
// startup, so provide `ws` as the transport. (Not needed on Node 22+.)
export const supabase = newClient();

export const dbHelper = {
  async getAuthUserFromToken(accessToken) {
    const { data, error } = await supabase.auth.getUser(accessToken);
    if (error) {
      console.error("Query failed:", error);
      return { user: null, error: error };
    }
    if (!data || !data.user)
      return { user: null, error: "Invalid access token" };
    return { user: data.user, error: null };
  },
  async getUserFromToken(accessToken) {
    const { user: authUser, error: authError } =
      await this.getAuthUserFromToken(accessToken);
    if (authError) return { user: null, authUser: null, error: authError };
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", authUser.id)
      .limit(1)
      .maybeSingle();
    if (error) {
      console.error("Query failed:", error);
      return { user: null, authUser: null, error: error };
    }
    if (!user) return { user: null, authUser: null, error: "Missing user" };
    return { user: user, authUser: authUser, error: null };
  },
  async getProjectFromAPIKey(apiKey) {
    const { data: project, error } = await supabase
      .from("projects")
      .select("*")
      .eq("api_key", apiKey)
      .limit(1)
      .maybeSingle();
    if (error) {
      console.error("Query failed:", error);
      return { project: null, error: error };
    }
    if (!project) return { project: null, error: "Invalid API key" };
    return { project: project, error: null };
  },
  // Returns all events from all projects associated with the user
  async getEvents(user) {
    const { data, error } = await supabase
      .from("projects")
      .select(
        `
                users_projects!inner(user_id),
                events (*)
            `,
      )
      .eq("users_projects.user_id", user.id)
      .order("timestamp", { referencedTable: "events", ascending: false });
    if (error || !data) {
      console.error("Query failed:", error);
      return { events: null, error: error };
    }
    const events = data.flatMap((item) => item.events || []) || [];
    return { events: events.filter((event) => !event.resolved), error: null };
  },
  // Soft-deletes events by marking them resolved. Scoped to the user's own
  // projects so a user cannot resolve another team's events.
  async resolveEvents(user, ids) {
    const { data: links, error } = await supabase
      .from("users_projects")
      .select("project_id")
      .eq("user_id", user.id);
    if (error) {
      console.error("Query error:", error);
      return error;
    }
    const projectIds = links.map((link) => link.project_id);
    const { error: updateError } = await supabase
      .from("events")
      .update({ resolved: true })
      .in("id", ids)
      .in("project_id", projectIds);
    if (updateError) {
      console.error("Failed to resolve events:", updateError);
      return updateError;
    }
    console.log("Events resolved");
    return null;
  },
  // Returns all uptime checks from all projects associated with the user
  async getUptimeLog(user) {
    const { data, error } = await supabase
      .from("projects")
      .select(
        `
                users_projects!inner(user_id),
                website_url,
                uptime_log (*)
            `,
      )
      .eq("users_projects.user_id", user.id)
      .order("timestamp", { referencedTable: "uptime_log", ascending: false });
    if (error || !data) {
      console.error("Query failed:", error);
      return { uptimeLog: null, error: error };
    }
    const hostnames = new Set(
      data?.flatMap(
        (item) =>
          (URL.canParse(item.website_url) &&
            new URL(item.website_url).hostname) ||
          [],
      ) || [],
    );
    const uptimeLog = data.flatMap((item) => item.uptime_log || []) || [];
    return {
      uptimeLog: uptimeLog.filter((row) =>
        hostnames.has(new URL(row.url).hostname),
      ),
      error: null,
    }; // see gotcha #3
  },
  async getUptimeLogFromProject(project) {
    const { data, error } = await supabase
      .from("uptime_log")
      .select("*")
      .eq("project_id", project.id)
      .order("timestamp", { ascending: false });
    if (error || !data) {
      console.error("Query failed:", error);
      return { uptimeLog: null, error: error };
    }
    return { uptimeLog: data, error: null };
  },
  async logEvent(eventObject) {
    const e = eventObject.event;
    const { error } = await supabase.from("events").insert({
      event_type: e.event_type,
      timestamp: e.timestamp,
      created_at: e.created_at,
      deployment: e.deployment,
      ip: e.ip,
      project_id: e.project_id,
      current_url: e.current_url,
      host: e.host,
      pathname: e.pathname,
      referrer: e.referrer,
      referring_domain: e.referring_domain,
      browser: e.browser,
      metadata: e.metadata,
    });
    if (error) {
      console.error("Event logging failed:", error);
      return error;
    }
    console.log("Event logged");
    return null;
  },
  async logUptime(c) {
    const { error } = await supabase.from("uptime_log").insert({
      url: c.url,
      timestamp: c.timestamp,
      is_up: c.is_up,
      status: c.status,
      latency: c.latency,
      attempts: c.attempts,
      project_id: c.project_id,
    });
    if (error) {
      console.error("Failed to log uptime:", error);
      return error;
    }
    console.log("Uptime logged");
    return null;
  },
  async signUp(email, password) {
    const { data, error } = await newClient().auth.signUp({ email, password });
    const invalidMessage = "Invalid credentials";
    if (error || !data || !data.session || !data.user) {
      console.error("Sign up failed:", error || invalidMessage);
      return { data: null, user: null, error: error || invalidMessage };
    }
    const { data: user, error: creationError } = await supabase
      .from("users")
      .insert({ auth_id: data.user.id })
      .select()
      .single();
    if (creationError) {
      console.error("User creation failed:", error);
      return { data: null, user: null, error: error };
    }
    console.log("Signed up successfully");
    return { data: data, user: user, error: null };
  },
  async logIn(email, password) {
    const { data, error } = await newClient().auth.signInWithPassword({
      email,
      password,
    });
    const invalidMessage = "Invalid credentials";
    if (error || !data || !data.session) {
      console.error("Login failed:", error || invalidMessage);
      return { data: null, error: error || invalidMessage };
    }
    console.log("Logged in successfully");
    return { data: data, error: null };
  },
  async logOut(accessToken) {
    const { error } = await newClient().auth.signOut(accessToken);
    if (error) {
      console.error("Logout failed:", error);
      return error;
    }
    console.log("Logged out successfully");
    return null;
  },
  async refreshSession(refreshToken) {
    const { data, error } = await newClient().auth.refreshSession({
      refresh_token: refreshToken,
    });
    const invalidMessage = "Invalid credentials";
    if (error || !data || !data.session) {
      console.error("Session refresh failed:", error || invalidMessage);
      return { data: null, error: error || invalidMessage };
    }
    console.log("Session refreshed successfully");
    return { data: data, error: null };
  },
  async createProject(user, name, websiteUrl) {
    // Create project
    const { data: project, error } = await supabase
      .from("projects")
      .insert({ name: name, website_url: websiteUrl })
      .select()
      .single();
    if (error || !project) {
      console.error("Failed to create project:", error);
      return { project: null, error: error };
    }
    // Link project to user
    let { error: relationError } = await supabase
      .from("users_projects")
      .insert({
        user_id: user.id,
        project_id: project.id,
        permission_level: "Owner",
      });
    if (isMissingPermissionLevelError(relationError)) {
      const { error } = await supabase.from("users_projects").insert({
        user_id: user.id,
        project_id: project.id,
      });
      relationError = error;
    }
    if (relationError) {
      await supabase.from("projects").delete().eq("id", project.id); // Delete project if not linked to user successfully
      console.error("Failed to link project to user:", relationError);
      return { project: null, error: relationError };
    }
    console.log("Project created");
    return { project: project, error: null };
  },
  async deleteProject(user, projectId) {
    const { data: user_project, error } = await supabase
      .from("users_projects")
      .select("*")
      .eq("user_id", user.id)
      .eq("project_id", projectId)
      .limit(1)
      .maybeSingle();
    if (error) {
      console.error("Query error:", error);
      return error;
    }
    const notFoundMessage = "Project not found for user";
    if (!user_project) {
      console.error("Failed to delete project:", notFoundMessage);
      return notFoundMessage;
    }
    const permissionLevel = user_project.permission_level || "Owner";
    if (permissionLevel === "Owner" || permissionLevel === "Co-Owner") {
      // Delete project
      const { error: deletionError } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);
      if (deletionError) {
        console.error("Failed to delete project:", deletionError);
        return deletionError;
      }
      console.log("Project deleted");
    } else {
      // Remove link between user and project
      const { error: deletionError } = await supabase
        .from("users_projects")
        .delete()
        .eq("user_id", user.id)
        .eq("project_id", projectId);
      if (deletionError) {
        console.error("Failed to unlink project:", deletionError);
        return deletionError;
      }
      console.log("Project unlinked");
    }
    return null;
  },
  async shareProject(user, projectId, sharedUser, permissionLevel) {
    const { data: user_project, error } = await supabase
      .from("users_projects")
      .select("*")
      .eq("user_id", user.id)
      .eq("project_id", projectId)
      .limit(1)
      .maybeSingle();
    if (error) {
      console.error("Query error:", error);
      return error;
    }
    const notFoundMessage = "Project not found for user";
    if (!user_project) {
      console.error("Failed to share project:", notFoundMessage);
      return notFoundMessage;
    }
    const noPermissionMessage = "Insufficient permission";
    if (
      user_project.permission_level !== "Owner" &&
      user_project.permission_level !== "Co-Owner"
    ) {
      console.error("Failed to share project:", noPermissionMessage);
      return noPermissionMessage;
    }
    const { data: shared_user_project, sharedUserError } = await supabase
      .from("users_projects")
      .select("*")
      .eq("user_id", sharedUser.id)
      .eq("project_id", projectId)
      .limit(1)
      .maybeSingle();
    if (sharedUserError) {
      console.error("Query error:", sharedUserError);
      return sharedUserError;
    }
    if (!shared_user_project) {
      // Share with user
      const { error: shareError } = await supabase
        .from("users_projects")
        .insert({
          user_id: sharedUser.id,
          project_id: projectId,
          permission_level: permissionLevel,
        });
      if (shareError) {
        console.error("Failed to share project:", shareError);
        return shareError;
      }
      console.log("Project shared");
    } else {
      // Update shared user's project permissions
      if (
        shared_user_project.permission_level === "Owner" ||
        (user_project.permission_level !== "Owner" &&
          shared_user_project.permission_level === "Co-Owner")
      ) {
        console.error(
          "Failed to update project share permissions:",
          noPermissionMessage,
        );
        return noPermissionMessage;
      }
      const { error: shareError } = await supabase
        .from("users_projects")
        .update({ permission_level: permissionLevel })
        .eq("user_id", sharedUser.id)
        .eq("project_id", projectId);
      if (shareError) {
        console.error(
          "Failed to update project share permissions:",
          shareError,
        );
        return shareError;
      }
      console.log("Project share permissions updated");
    }
    return null;
  },
  async unshareProject(user, projectId, sharedUser) {
    const { data: user_project, error } = await supabase
      .from("users_projects")
      .select("*")
      .eq("user_id", user.id)
      .eq("project_id", projectId)
      .limit(1)
      .maybeSingle();
    if (error) {
      console.error("Query error:", error);
      return error;
    }
    const notFoundMessage = "Project not found for user";
    if (!user_project) {
      console.error("Failed to unshare project:", notFoundMessage);
      return notFoundMessage;
    }
    const noPermissionMessage = "Insufficient permission";
    if (
      !user_project.permission_level === "Owner" &&
      user_project.permission_level !== "Co-Owner"
    ) {
      console.error("Failed to unshare project:", noPermissionMessage);
      return noPermissionMessage;
    }
    const { data: shared_user_project, sharedUserError } = await supabase
      .from("users_projects")
      .select("*")
      .eq("user_id", sharedUser.id)
      .eq("project_id", projectId)
      .limit(1)
      .maybeSingle();
    if (sharedUserError) {
      console.error("Query error:", sharedUserError);
      return sharedUserError;
    }
    const notSharedMessage = "Project wasn't shared with user initially";
    if (!shared_user_project) {
      console.error("Failed to unshare project:", notSharedMessage);
      return notSharedMessage;
    }
    if (
      shared_user_project.permission_level === "Owner" ||
      (user_project.permission_level !== "Owner" &&
        shared_user_project.permission_level === "Co-Owner")
    ) {
      console.error("Failed to unshare project:", noPermissionMessage);
      return noPermissionMessage;
    }
    const { error: unshareError } = await supabase
      .from("users_projects")
      .delete()
      .eq("user_id", sharedUser.id)
      .eq("project_id", projectId);
    if (unshareError) {
      console.error("Failed to unshare project:", unshareError);
      return unshareError;
    }
    console.log("Project unshared");
    return null;
  },
  async getProjects(user, permissionLevel) {
    let { data, error } = await (permissionLevel
      ? supabase
          .from("users_projects")
          .select("projects(*)")
          .eq("user_id", user.id)
          .eq("permission_level", permissionLevel)
      : supabase
          .from("users_projects")
          .select("projects(*), permission_level")
          .eq("user_id", user.id));
    if (isMissingPermissionLevelError(error)) {
      const fallback = await supabase
        .from("users_projects")
        .select("projects(*)")
        .eq("user_id", user.id);
      data = fallback.data;
      error = fallback.error;
    }
    if (error || !data) {
      console.error("Query error:", error);
      return { projects: null, error: error };
    }
    return {
      projects: data
        .map((entry) => ({
          ...entry.projects,
          permission_level:
            entry.permission_level || permissionLevel || "Owner",
        }))
        .filter(
          (project) =>
            !permissionLevel || project.permission_level === permissionLevel,
        ),
      error: null,
    };
  },
  async getUsers() {
    const { data: users, error } = await supabase.from("users").select("*");
    if (error || !users) {
      console.error("Query error:", error);
      return { users: null, error: error };
    }
    return { users: users, error: null };
  },
  async getUserFromId(userId) {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .limit(1)
      .maybeSingle();
    if (error || !user) {
      console.error("Query error:", error);
      return { user: null, error: error };
    }
    return { user: user, error: null };
  },
  async getProjectFromId(projectId) {
    const { data: project, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .limit(1)
      .maybeSingle();
    if (error) console.error("Query failed:", error);
    return { project, error };
  },
  // methods: an array of channels (e.g. ["push", "email"]), [] for none, or null to opt out
  async updateNotifyMethods(user, methods) {
    const { error } = await supabase
      .from("users")
      .update({ notify_methods: methods })
      .eq("id", user.id);
    if (error) {
      console.error("Failed to update notify methods:", error);
      return error;
    }
    console.log("Notify methods updated");
    return null;
  },
};

function isMissingPermissionLevelError(error) {
  return (
    (error?.code === "42703" || error?.code === "PGRST204") &&
    String(error.message || "").includes("permission_level")
  );
}
