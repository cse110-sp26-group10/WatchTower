/**
 * Mock event source for the dashboard prototype.
 *
 * Events conform to the trimmed log shape:
 *   { event_type, timestamp, created_at,
 *     deployment: { id, version, commit_hash },
 *     ip, pathname,
 *     metadata: { severity, message, rating, comment, pageUrl } }
 */

const NOW = Date.now();
const minutesAgo = (m) => new Date(NOW - m * 60 * 1000).toISOString();
const DATA_UPDATE_INTERVAL = 10;

/**
 * Known deployments. Events reference one of these by id; only id/version/
 * commit_hash are attached to each event to match the trimmed schema.
 * The extra fields (deployed_at, author) live only on the catalog.
 */
let DEPLOYMENTS = [
  { id: 'dep_8f2c', version: '0.2.0', commit_hash: 'a1b2c3d', deployed_at: minutesAgo(45),  author: 'kevin'  },
  { id: 'dep_7e1b', version: '0.1.3', commit_hash: '9f0e2bd', deployed_at: minutesAgo(180), author: 'kevin2' },
  { id: 'dep_6c0a', version: '0.1.2', commit_hash: '4d5c1aa', deployed_at: minutesAgo(720), author: 'kevin'  },
];

const deploymentById = (id) => DEPLOYMENTS.find((d) => d.id === id);

/**
 * Build one event in the trimmed shape.
 * @param {Object} p
 * @param {string} p.deployment_id
 * @param {string} p.event_type
 * @param {number} p.minsAgo
 * @param {string} p.pathname
 * @param {Object} [p.meta] partial metadata override
 */
function makeEvent({ deployment_id, event_type, minsAgo, pathname, meta }) {
  const d = deploymentById(deployment_id);
  return {
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
  makeEvent({ deployment_id: 'dep_8f2c', event_type: 'page_load', minsAgo: 1,  pathname: '/' }),
  makeEvent({ deployment_id: 'dep_8f2c', event_type: 'page_load', minsAgo: 3,  pathname: '/checkout' }),
  makeEvent({ deployment_id: 'dep_8f2c', event_type: 'page_load', minsAgo: 6,  pathname: '/cart' }),
  makeEvent({ deployment_id: 'dep_7e1b', event_type: 'page_load', minsAgo: 9,  pathname: '/' }),
  makeEvent({ deployment_id: 'dep_7e1b', event_type: 'page_load', minsAgo: 15, pathname: '/profile' }),
  makeEvent({ deployment_id: 'dep_6c0a', event_type: 'page_load', minsAgo: 22, pathname: '/checkout' }),

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

/**
 * Returns the current set of mock events, optionally filtered by deployment.
 * @param {{ deploymentId?: string }} [opts]
 * @returns {Array<Object>}
 */
function getEvents(opts = {}) {
  const { deploymentId } = opts;
  if (!deploymentId || deploymentId === 'all') return EVENTS.slice();
  return EVENTS.filter((e) => e.deployment && e.deployment.id === deploymentId);
}

/**
 * Returns the list of known deployments (newest first).
 * @returns {Array<Object>}
 */
function getDeployments() {
  return DEPLOYMENTS.slice();
}

/**
 * Look up a single deployment by id.
 * @param {string} id
 * @returns {Object|undefined}
 */
function getDeployment(id) {
  return deploymentById(id);
}

/**
 * Get the event log from the server.
 * @returns {Array}
 */
async function getDataFromServer() {
  let response = await fetch("http://localhost:8080/api/data");
  if (!response.ok) {
      throw new Error("Network response failed")
  }
  let data = await response.json();
  console.log("Response:", data);
  return data;
}

/**
 * Get a list of deployments from the event log.
 * @returns {Array}
 */
function getDeploymentsFromEvents() {
  let deploymentIds = new Set();
  let deployments = [];
  EVENTS.forEach((event) => {
    if (deploymentIds.has(event.deployment.id)) return;
    deploymentIds.add(event.deployment.id);
    deployments.push(event.deployment);
  })
  return deployments;
}

/**
 * Update the events and deployments.
 */
async function updateEvents() {
  try {
    EVENTS = await getDataFromServer();
    DEPLOYMENTS = getDeploymentsFromEvents();
  } catch (error) {
    console.log("Event update failed:", error);
  }
}

window.WatchTowerData = { getEvents, getDeployments, getDeployment, updateEvents };