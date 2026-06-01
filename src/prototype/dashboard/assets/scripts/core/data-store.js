// ==========================================================================
// PORTED PROTOTYPE DATA ENGINE — SELF CONTAINED MOCK ENVIRONMENT
// ==========================================================================

const NOW = Date.now();
const minutesAgo = (m) => new Date(NOW - m * 60 * 1000).toISOString();

let DEPLOYMENTS = [
  { id: 'dep_8f2c', name: 'Drape App',    version: '0.2.0', commit_hash: 'a1b2c3d', deployed_at: minutesAgo(45),  author: 'kevin'  },
  { id: 'dep_7e1b', name: 'Core API',     version: '0.1.3', commit_hash: '9f0e2bd', deployed_at: minutesAgo(180), author: 'kevin2' },
  { id: 'dep_6c0a', name: 'Auth Service', version: '0.1.2', commit_hash: '4d5c1aa', deployed_at: minutesAgo(720), author: 'kevin'  },
];

const deploymentById = (id) => DEPLOYMENTS.find((d) => d.id === id);

let __eventCounter = 0;

function makeEvent({ deployment_id, event_type, minsAgo, pathname, meta }) {
  const d = deploymentById(deployment_id);
  __eventCounter += 1;
  return {
    id: `evt_${String(__eventCounter).padStart(3, '0')}`,
    event_type,
    timestamp: minutesAgo(minsAgo),
    created_at: minutesAgo(minsAgo),
    deployment: d ? { id: d.id, version: d.version, commit_hash: d.commit_hash } : null,
    ip: '192.0.2.14',
    pathname,
    metadata: {
      severity: 'signal',
      message: '',
      rating: null,
      comment: null,
      pageUrl: `https://demo.watchtower.local${pathname}`,
      ...(meta || {}),
    },
  };
}

let EVENTS = [
  // ---- Errors ----
  makeEvent({ deployment_id: 'dep_8f2c', event_type: 'error', minsAgo: 2,  pathname: '/checkout',   meta: { severity: 'critical', message: 'TypeError: cannot read property "id" of undefined' } }),
  makeEvent({ deployment_id: 'dep_8f2c', event_type: 'error', minsAgo: 11, pathname: '/api/orders', meta: { severity: 'critical', message: '500 Internal Server Error on POST /api/orders' } }),
  makeEvent({ deployment_id: 'dep_7e1b', event_type: 'error', minsAgo: 34, pathname: '/profile',    meta: { severity: 'warning',  message: 'Image asset failed to load: avatar.png' } }),

  // ---- Page loads ----
  makeEvent({ deployment_id: 'dep_8f2c', event_type: 'page_load', minsAgo: 1,  pathname: '/',         meta: { load_time: 420 } }),
  makeEvent({ deployment_id: 'dep_8f2c', event_type: 'page_load', minsAgo: 3,  pathname: '/checkout', meta: { load_time: 2180 } }),
  makeEvent({ deployment_id: 'dep_8f2c', event_type: 'page_load', minsAgo: 6,  pathname: '/cart',     meta: { load_time: 760 } }),
  makeEvent({ deployment_id: 'dep_7e1b', event_type: 'page_load', minsAgo: 9,  pathname: '/',         meta: { load_time: 380 } }),
  makeEvent({ deployment_id: 'dep_7e1b', event_type: 'page_load', minsAgo: 15, pathname: '/profile',  meta: { load_time: 1450 } }),
  makeEvent({ deployment_id: 'dep_6c0a', event_type: 'page_load', minsAgo: 22, pathname: '/checkout', meta: { load_time: 2640 } }),

  // ---- Surveys ----
  makeEvent({ deployment_id: 'dep_8f2c', event_type: 'survey', minsAgo: 4,  pathname: '/checkout', meta: { rating: 2, comment: 'Checkout button felt unresponsive.' } }),
  makeEvent({ deployment_id: 'dep_7e1b', event_type: 'survey', minsAgo: 18, pathname: '/',         meta: { rating: 5, comment: 'Fast and easy, thanks!' } }),
  makeEvent({ deployment_id: 'dep_7e1b', event_type: 'survey', minsAgo: 40, pathname: '/checkout', meta: { rating: 1, comment: 'Crashed when I tried to pay.' } }),
  makeEvent({ deployment_id: 'dep_6c0a', event_type: 'survey', minsAgo: 55, pathname: '/profile',  meta: { rating: 4, comment: '' } }),

  // ---- Clicks ----
  makeEvent({ deployment_id: 'dep_8f2c', event_type: 'click', minsAgo: 1,  pathname: '/checkout' }),
  makeEvent({ deployment_id: 'dep_8f2c', event_type: 'click', minsAgo: 2,  pathname: '/checkout' }),
  makeEvent({ deployment_id: 'dep_8f2c', event_type: 'click', minsAgo: 5,  pathname: '/cart' }),
  makeEvent({ deployment_id: 'dep_7e1b', event_type: 'click', minsAgo: 12, pathname: '/' }),
  makeEvent({ deployment_id: 'dep_6c0a', event_type: 'click', minsAgo: 25, pathname: '/profile' }),
];

let UPTIME_LOG = [
  { timestamp: minutesAgo(180), is_up: true, status: 200,  latency: 142, attempts: [{timestamp: minutesAgo(180), status: 200, latency: 142, error: null}] },
  { timestamp: minutesAgo(120), is_up: false, status: 404, latency: 0,   attempts: [{timestamp: minutesAgo(180), status: 404, latency: 0, error: null}]   },
  { timestamp: minutesAgo(118), is_up: true, status: 200,  latency: 168, attempts: [{timestamp: minutesAgo(180), status: 200, latency: 168, error: null}] },
  { timestamp: minutesAgo(60),  is_up: true, status: 200,  latency: 155, attempts: [{timestamp: minutesAgo(180), status: 200, latency: 155, error: null}] },
  { timestamp: minutesAgo(30),  is_up: true, status: 200,  latency: 138, attempts: [{timestamp: minutesAgo(180), status: 200, latency: 138, error: null}] },
  { timestamp: minutesAgo(5),   is_up: true, status: 200,  latency: 129, attempts: [{timestamp: minutesAgo(180), status: 200, latency: 129, error: null}] },
  { timestamp: minutesAgo(1),   is_up: true, status: 200,  latency: 134, attempts: [{timestamp: minutesAgo(180), status: 200, latency: 134, error: null}] },
];

export const dataStore = {
  getDeployments() {
    return DEPLOYMENTS.slice();
  },

  getDeployment(id) {
    return deploymentById(id) || null;
  },

  getEvents(options = {}) {
    // FIXED: Accept both deploymentId and deployment_id variations cleanly
    const targetId = typeof options === 'string' 
      ? options 
      : (options.deploymentId || options.deployment_id);
      
    if (!targetId || targetId === 'all') {
      return EVENTS.slice();
    }
    
    return EVENTS.filter((e) => {
      const idFromObj = e.deployment && e.deployment.id;
      return idFromObj === targetId;
    });
  },

  getEvent(id) {
    return EVENTS.find((e) => e.id === id) || null;
  },

  getUptimeLog() {
    return UPTIME_LOG.slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  async update() {
    // Kept for structural consistency with router cycles
  }
};