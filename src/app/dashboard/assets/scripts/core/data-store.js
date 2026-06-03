// ==========================================================================
// PORTED PROTOTYPE DATA ENGINE — SELF CONTAINED MOCK ENVIRONMENT
// ==========================================================================

const SERVER_URL = "http://localhost:8080";

const NOW = Date.now();
const minutesAgo = (m) => new Date(NOW - m * 60 * 1000).toISOString();

let DEPLOYMENTS = [
  { id: 'dep_8f2c', name: 'Drape App',    version: '0.2.0', commit_hash: 'a1b2c3d', deployed_at: minutesAgo(45),  author: 'kevin'  },
  { id: 'dep_7e1b', name: 'Core API',     version: '0.1.3', commit_hash: '9f0e2bd', deployed_at: minutesAgo(180), author: 'kevin2' },
  { id: 'dep_6c0a', name: 'Auth Service', version: '0.1.2', commit_hash: '4d5c1aa', deployed_at: minutesAgo(720), author: 'kevin'  },
];

const deploymentById = (id) => DEPLOYMENTS.find((d) => d.id === id);

let __eventCounter = 0;

function makeEvent({ project_id, deployment_id, event_type, minsAgo, pathname, meta }) {
  const d = deploymentById(deployment_id);
  __eventCounter += 1;
  return {
    id: `evt_${String(__eventCounter).padStart(3, '0')}`,
    event_type,
    timestamp: minutesAgo(minsAgo),
    created_at: minutesAgo(minsAgo),
    project_id,
    deployment: d ? { id: d.id, version: d.version, commit_hash: d.commit_hash } : null,
    ip: '192.0.2.14',
    pathname,
    metadata: {
      severity: 'signal',
      message: '',
      rating: null,
      pageUrl: `https://demo.watchtower.local${pathname}`,
      ...(meta || {}),
    },
  };
}

let EVENTS = [
  // ---- Errors ----
  makeEvent({ project_id: 1, deployment_id: 'dep_8f2c', event_type: 'error', minsAgo: 2,  pathname: '/checkout',   meta: { severity: 'critical', message: 'TypeError: cannot read property "id" of undefined' } }),
  makeEvent({ project_id: 2, deployment_id: 'dep_8f2c', event_type: 'error', minsAgo: 11, pathname: '/api/orders', meta: { severity: 'critical', message: '500 Internal Server Error on POST /api/orders' } }),
  makeEvent({ project_id: 2, deployment_id: 'dep_7e1b', event_type: 'error', minsAgo: 34, pathname: '/profile',    meta: { severity: 'warning',  message: 'Image asset failed to load: avatar.png' } }),

  // ---- Page loads ----
  makeEvent({ project_id: 1, deployment_id: 'dep_8f2c', event_type: 'page_load', minsAgo: 1,  pathname: '/',         meta: { load_time: 420 } }),
  makeEvent({ project_id: 2, deployment_id: 'dep_8f2c', event_type: 'page_load', minsAgo: 3,  pathname: '/checkout', meta: { load_time: 2180 } }),
  makeEvent({ project_id: 1, deployment_id: 'dep_8f2c', event_type: 'page_load', minsAgo: 6,  pathname: '/cart',     meta: { load_time: 760 } }),
  makeEvent({ project_id: 1, deployment_id: 'dep_7e1b', event_type: 'page_load', minsAgo: 9,  pathname: '/',         meta: { load_time: 380 } }),
  makeEvent({ project_id: 2, deployment_id: 'dep_7e1b', event_type: 'page_load', minsAgo: 15, pathname: '/profile',  meta: { load_time: 1450 } }),
  makeEvent({ project_id: 2, deployment_id: 'dep_6c0a', event_type: 'page_load', minsAgo: 22, pathname: '/checkout', meta: { load_time: 2640 } }),

  // ---- Surveys ----
  makeEvent({ project_id: 1, deployment_id: 'dep_8f2c', event_type: 'survey', minsAgo: 4,  pathname: '/checkout', meta: { rating: 2, message: 'Checkout button felt unresponsive.' } }),
  makeEvent({ project_id: 1, deployment_id: 'dep_7e1b', event_type: 'survey', minsAgo: 18, pathname: '/',         meta: { rating: 5, message: 'Fast and easy, thanks!' } }),
  makeEvent({ project_id: 1, deployment_id: 'dep_7e1b', event_type: 'survey', minsAgo: 40, pathname: '/checkout', meta: { rating: 1, message: 'Crashed when I tried to pay.' } }),
  makeEvent({ project_id: 1, deployment_id: 'dep_6c0a', event_type: 'survey', minsAgo: 55, pathname: '/profile',  meta: { rating: 4, message: '' } }),

  // ---- Clicks ----
  makeEvent({ project_id: 1, deployment_id: 'dep_8f2c', event_type: 'click', minsAgo: 1,  pathname: '/checkout' }),
  makeEvent({ project_id: 2, deployment_id: 'dep_8f2c', event_type: 'click', minsAgo: 2,  pathname: '/checkout' }),
  makeEvent({ project_id: 1, deployment_id: 'dep_8f2c', event_type: 'click', minsAgo: 5,  pathname: '/cart' }),
  makeEvent({ project_id: 2, deployment_id: 'dep_7e1b', event_type: 'click', minsAgo: 12, pathname: '/' }),
  makeEvent({ project_id: 1, deployment_id: 'dep_6c0a', event_type: 'click', minsAgo: 25, pathname: '/profile' }),
];

let UPTIME_LOG = [
  { project_id: 1, timestamp: minutesAgo(180), is_up: true, status: 200,  latency: 142, attempts: [{timestamp: minutesAgo(180), status: 200, latency: 142, error: null}] },
  { project_id: 1, timestamp: minutesAgo(120), is_up: false, status: 404, latency: 0,   attempts: [{timestamp: minutesAgo(180), status: 404, latency: 0, error: null}]   },
  { project_id: 2, timestamp: minutesAgo(118), is_up: true, status: 200,  latency: 168, attempts: [{timestamp: minutesAgo(180), status: 200, latency: 168, error: null}] },
  { project_id: 1, timestamp: minutesAgo(60),  is_up: true, status: 200,  latency: 155, attempts: [{timestamp: minutesAgo(180), status: 200, latency: 155, error: null}] },
  { project_id: 1, timestamp: minutesAgo(30),  is_up: true, status: 200,  latency: 138, attempts: [{timestamp: minutesAgo(180), status: 200, latency: 138, error: null}] },
  { project_id: 2, timestamp: minutesAgo(5),   is_up: true, status: 200,  latency: 129, attempts: [{timestamp: minutesAgo(180), status: 200, latency: 129, error: null}] },
  { project_id: 1, timestamp: minutesAgo(1),   is_up: true, status: 200,  latency: 134, attempts: [{timestamp: minutesAgo(180), status: 200, latency: 134, error: null}] },
];

let PROJECTS = [
  {
    id: 1,
    name: 'Drape Storefront',
    website_url: 'https://drape.example.com',
    created_at: '2026-05-30T09:00:00.000Z',
  },
  {
    id: 2,
    name: 'Core API',
    website_url: 'https://api.drape.example.com',
    created_at: '2026-05-29T16:30:00.000Z',
  },
];

const projectById = (id) => PROJECTS.find((p) => p.id === id);

let PROFILE = {
  email: "test@gmail.com",
  created_at: NOW,
  alert_id: "00000000-0000-0000-0000-000000000000",
  notify_methods: ["push", "email"]
};

async function getFromServer(path) {
  try {
    const response = await fetch(`${SERVER_URL}${path}`, { credentials: "include" });
    const data = await response.json();
    console.log("Response:", data);
    if (!response.ok) {
      return { data, error: response.status };
    }
    return { data };
  } catch (error) {
    console.log("Network response failed:", error);
    return { error };
  }
}

async function postToServer(path, body) {
  try {
    const response = await fetch(`${SERVER_URL}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: (body && JSON.stringify(body)) || undefined,
        credentials: "include"
    });
    const data = await response.json();
    console.log("Response:", data);
    if (!response.ok) {
        return { data, error: response.status };
    }
    return { data };
  } catch (error) {
    console.log("Network response failed:", error);
    return { error };
  }
}

async function getEventsFromServer() {
  return await getFromServer("/api/events");
}

function getDeploymentsFromEvents() {
  const deploymentIds = new Set();
  const deployments = [];
  EVENTS.forEach((event) => {
    if (deploymentIds.has(event.deployment.id)) return;
    deploymentIds.add(event.deployment.id);
    deployments.push(event.deployment);
  });
  return deployments;
}

async function getUptimeLogFromServer() {
  return await getFromServer("/api/uptime");
}

async function getProfileFromServer() {
  return await getFromServer("/profile");
}

async function getProjectsFromServer() {
  return await getFromServer("/api/projects");
}

export const dataStore = {
  getDeployments() {
    return DEPLOYMENTS.slice();
  },

  getDeployment(id) {
    return deploymentById(id) || null;
  },

  getEvents(options = {}) {
    // FIXED: Accept both deploymentId and deployment_id variations cleanly
    const projectTargetId = typeof options === 'string' 
      ? options 
      : (options.projectId || options.project_id);
    const deploymentTargetId = typeof options === 'string' 
      ? options 
      : (options.deploymentId || options.deployment_id);
      
    return EVENTS.filter((e) => {
      const projectIdFromObj = e.project_id;
      const deploymentIdFromObj = e.deployment && e.deployment.id;
      return (!projectTargetId || projectTargetId === 'all' || projectIdFromObj === projectTargetId)
        && (!deploymentTargetId || deploymentTargetId === 'all' || deploymentIdFromObj === deploymentTargetId);
    });
  },

  getEvent(id) {
    return EVENTS.find((e) => e.id === id) || null;
  },

  getUptimeLog() {
    return UPTIME_LOG.slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  getProjects() {
    return PROJECTS;
  },

  getProject(id) {
    return projectById(id) || null;
  },

  getProfile() {
    return PROFILE;
  },

  async signUp(email, password) {
    const { error } = await postToServer("/signup", { email, password });
    if (error) { console.log("Sign up failed:", error); return error; }
    console.log("Signed up successfully");
    return null;
  },

  async logIn(email, password) {
    const { error } = await postToServer("/login", { email, password });
    if (error) { console.log("Login failed:", error); return error; }
    console.log("Logged in successfully");
    return null;
  },

  async logOut() {
    const { error } = await postToServer("/logout");
    if (error) { console.log("Logout failed:", error); return error; }
    console.log("Logged out successfully");
    return null;
  },

  async refreshSession() {
    const { error } = await postToServer("/auth/refresh");
    if (error) { console.log("Session refresh failed:", error); return error; }
    console.log("Session refreshed successfully");
    return null;
  },

  async createProject(name, website_url) {
    const { error } = await postToServer("/api/projects/create", { name, website_url });
    if (error) { console.log("Project creation failed:", error); return error; }
    console.log("Project created successfully");
    await this.updateProjects();
    document.dispatchEvent(new CustomEvent("watchtower:data-update"));
    return null;
  },

  async deleteProject(id) {
    const { error } = await postToServer("/api/projects/delete", { id });
    if (error) { console.log("Project deletion failed:", error); return error; }
    console.log("Project deleted successfully");
    await this.updateProjects();
    document.dispatchEvent(new CustomEvent("watchtower:data-update"));
    return null;
  },

  async updateNotifyMethods(methods) {
    const { error } = await postToServer("/api/notifications/methods", { methods });
    if (error) { console.log("Notification methods update failed:", error); return error; }
    console.log("Notification methods updated successfully");
    await this.updateProfile();
    return null;
  },

  async updateEvents() {
    const { data: events, error } = await getEventsFromServer();
    if (error) {
      console.log("Event update failed:", error);
      return error;
    }
    EVENTS = events;
    DEPLOYMENTS = getDeploymentsFromEvents();
    return null;
  },

  async updateUptimeLog() {
    const { data: uptimeLog, error } = await getUptimeLogFromServer();
    if (error) {
      console.log("Uptime log update failed:", error);
      return error;
    }
    UPTIME_LOG = uptimeLog;
    return null;
  },

  async updateProfile() {
    const { data: profile, error } = await getProfileFromServer();
    if (error) {
      console.log("Profile update failed:", error);
      return error;
    }
    PROFILE = profile;
    return null;
  },

  async updateProjects() {
    const { data: projects, error } = await getProjectsFromServer();
    if (error) {
      console.log("Project update failed:", error);
      return error;
    }
    PROJECTS = projects;
    return null;
  },

  async update() {
    // Kept for structural consistency with router cycles
    const error1 = await this.updateEvents();
    if (error1) return error1;
    const error2 = await this.updateUptimeLog();
    if (error2) return error2;
    const error3 = await this.updateProfile();
    if (error3) return error3;
    const error4 = await this.updateProjects();
    if (error4) return error4;
    return null;
  }
};