/**
 * @file mockData.js
 * Mock frontend telemetry data for the WatchTower MVP prototype.
 *
 * Story:
 * dep-003 introduces a checkout regression →
 * errors + performance degradation appear →
 * rollback deployment restores healthy state.
 */

/* -------------------------------------------------------------------------- */
/* TYPE DEFINITIONS                                                           */
/* -------------------------------------------------------------------------- */

/**
 * @typedef {Object} Deployment
 * @property {string} id
 * @property {string} name
 * @property {string} version
 * @property {string} commitHash
 * @property {string} timestamp
 * @property {string} branch
 * @property {"production"|"staging"} environment
 * @property {"passed"|"failed"} buildStatus
 * @property {"healthy"|"degraded"|"down"|"rolled_back"} status
 * @property {string} notes
 */

/**
 * @typedef {Object} DeploymentRef
 * @property {string} id
 * @property {string} version
 * @property {string} commitHash
 */

/**
 * @typedef {Object} SessionEvent
 * @property {"error"|"survey"} eventType
 * @property {string} timestamp
 * @property {DeploymentRef} deployment
 * @property {string} pathname
 * @property {{
 *   severity:string,
 *   message:string,
 *   rating:number|null,
 *   comment:string|null,
 *   pageUrl:string
 * }} metadata
 */

/**
 * @typedef {Object} PerformanceEvent
 * @property {string} id
 * @property {string} metric
 * @property {number} value
 * @property {string} unit
 * @property {number} threshold
 * @property {"low"|"medium"|"high"|"critical"} severity
 * @property {string} timestamp
 * @property {string} deploymentId
 * @property {string} service
 */

const APPLICATION_URL = "https://shop.example.com";

/* -------------------------------------------------------------------------- */
/* TIME HELPERS                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Returns an ISO timestamp relative to the current time.
 *
 * @param {number} minutesAgo
 * @returns {string}
 */
function createTimestamp(minutesAgo) {
  const date = new Date();

  date.setMinutes(date.getMinutes() - minutesAgo);

  return date.toISOString();
}

/**
 * Creates a lightweight deployment reference object.
 *
 * @param {Deployment} deployment
 * @returns {DeploymentRef}
 */
function createDeploymentReference(deployment) {
  return {
    id: deployment.id,
    version: deployment.version,
    commitHash: deployment.commitHash,
  };
}

/* -------------------------------------------------------------------------- */
/* DEPLOYMENTS                                                                */
/* -------------------------------------------------------------------------- */

export const deployments = [
  {
    id: "dep-001",
    name: "initial-release",
    version: "1.0.0",
    commitHash: "a1b2c3d",
    timestamp: createTimestamp(300),
    branch: "main",
    environment: "production",
    buildStatus: "passed",
    status: "healthy",
    notes: "Initial release. All systems healthy.",
  },

  {
    id: "dep-002",
    name: "feature-user-profiles",
    version: "1.1.0",
    commitHash: "e4f5a6b",
    timestamp: createTimestamp(180),
    branch: "main",
    environment: "production",
    buildStatus: "passed",
    status: "degraded",
    notes: "Minor frontend image loading regressions detected.",
  },

  {
    id: "dep-003",
    name: "hotfix-checkout",
    version: "1.1.1",
    commitHash: "c7d8e9f",
    timestamp: createTimestamp(90),
    branch: "hotfix/checkout-null-ref",
    environment: "production",
    buildStatus: "failed",
    status: "rolled_back",
    notes:
      "Checkout hotfix introduced API regression. Deployment rolled back.",
  },

  {
    id: "dep-004",
    name: "rollback-to-stable",
    version: "1.1.0",
    commitHash: "e4f5a6b",
    timestamp: createTimestamp(60),
    branch: "main",
    environment: "production",
    buildStatus: "passed",
    status: "healthy",
    notes: "Rollback successful. Service restored.",
  },
];

/* -------------------------------------------------------------------------- */
/* ERROR EVENTS                                                               */
/* -------------------------------------------------------------------------- */

const checkoutRegressionDeployment =
  createDeploymentReference(deployments[2]);

const userProfileDeployment =
  createDeploymentReference(deployments[1]);

/**
 * Creates an error telemetry event.
 *
 * @param {number} minutesAgo
 * @param {DeploymentRef} deployment
 * @param {string} pathname
 * @param {"low"|"medium"|"high"|"critical"} severity
 * @param {string} message
 *
 * @returns {SessionEvent}
 */
function createErrorEvent(
  minutesAgo,
  deployment,
  pathname,
  severity,
  message
) {
  return {
    eventType: "error",

    timestamp: createTimestamp(minutesAgo),

    deployment,

    pathname,

    metadata: {
      severity,
      message,
      rating: null,
      comment: null,
      pageUrl: `${APPLICATION_URL}${pathname}`,
    },
  };
}

export const errors = [
  createErrorEvent(
    88,
    checkoutRegressionDeployment,
    "/checkout",
    "critical",
    "Null pointer exception in checkout flow"
  ),

  createErrorEvent(
    85,
    checkoutRegressionDeployment,
    "/checkout",
    "critical",
    "Checkout request failed with 500 response"
  ),

  createErrorEvent(
    82,
    checkoutRegressionDeployment,
    "/api/user/profile",
    "high",
    "503 Service Unavailable"
  ),

  createErrorEvent(
    170,
    userProfileDeployment,
    "/home",
    "low",
    "Hero image failed to load"
  ),
];

/* -------------------------------------------------------------------------- */
/* PERFORMANCE EVENTS                                                         */
/* -------------------------------------------------------------------------- */

export const performanceEvents = [
  {
    id: "perf-001",
    metric: "API response time",
    value: 4200,
    unit: "ms",
    threshold: 500,
    severity: "critical",
    timestamp: createTimestamp(87),
    deploymentId: deployments[2].id,
    service: "api-gateway",
  },

  {
    id: "perf-002",
    metric: "Error rate",
    value: 22,
    unit: "%",
    threshold: 5,
    severity: "critical",
    timestamp: createTimestamp(86),
    deploymentId: deployments[2].id,
    service: "checkout-service",
  },

  {
    id: "perf-003",
    metric: "Memory usage",
    value: 450,
    unit: "MB",
    threshold: 350,
    severity: "medium",
    timestamp: createTimestamp(165),
    deploymentId: deployments[1].id,
    service: "user-service",
  },
];

/* -------------------------------------------------------------------------- */
/* USER FEEDBACK SIGNALS                                                      */
/* -------------------------------------------------------------------------- */

const [
  initialReleaseDeployment,
  userProfilesDeployment,
  checkoutFailureDeployment,
  rollbackDeployment,
] = deployments.map(createDeploymentReference);

/**
 * Creates a user feedback signal event.
 *
 * @param {number} minutesAgo
 * @param {DeploymentRef} deployment
 * @param {string} pathname
 * @param {1|2|3|4|5} rating
 * @param {string} comment
 *
 * @returns {SessionEvent}
 */
function createFeedbackSignal(
  minutesAgo,
  deployment,
  pathname,
  rating,
  comment
) {
  return {
    eventType: "survey",

    timestamp: createTimestamp(minutesAgo),

    deployment,

    pathname,

    metadata: {
      severity: "signal",
      message: comment,
      rating,
      comment,
      pageUrl: `${APPLICATION_URL}${pathname}`,
    },
  };
}

export const userSignals = [
  createFeedbackSignal(
    280,
    initialReleaseDeployment,
    "/dashboard",
    5,
    "Everything is smooth and fast."
  ),

  createFeedbackSignal(
    260,
    initialReleaseDeployment,
    "/home",
    4,
    "Really easy to use."
  ),

  createFeedbackSignal(
    165,
    userProfilesDeployment,
    "/home",
    3,
    "Images sometimes glitch."
  ),

  createFeedbackSignal(
    84,
    checkoutFailureDeployment,
    "/checkout",
    1,
    "Checkout keeps crashing."
  ),

  createFeedbackSignal(
    80,
    checkoutFailureDeployment,
    "/checkout",
    1,
    "Could not complete purchase."
  ),

  createFeedbackSignal(
    75,
    checkoutFailureDeployment,
    "/dashboard",
    2,
    "App became very slow."
  ),

  createFeedbackSignal(
    45,
    rollbackDeployment,
    "/checkout",
    4,
    "Checkout is working again."
  ),

  createFeedbackSignal(
    30,
    rollbackDeployment,
    "/home",
    5,
    "Everything looks fixed now."
  ),
];

/* -------------------------------------------------------------------------- */
/* UI HELPERS                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Returns the latest deployment system status.
 *
 * @returns {"healthy"|"degraded"|"down"|"rolled_back"}
 */
export function getSystemStatus() {
  const latestDeployment =
    deployments[deployments.length - 1];

  return latestDeployment.status;
}

/**
 * Returns the average user rating.
 *
 * @returns {number}
 */
export function getOverallRating() {
  const ratedSignals = userSignals.filter(
    (signal) => signal.metadata.rating !== null
  );

  if (!ratedSignals.length) {
    return 0;
  }

  const totalRating = ratedSignals.reduce(
    (sum, signal) => sum + signal.metadata.rating,
    0
  );

  const averageRating =
    totalRating / ratedSignals.length;

  return Math.round(averageRating * 10) / 10;
}

/**
 * Returns negative feedback signals.
 *
 * @param {number} [maxRating=2]
 * @returns {SessionEvent[]}
 */
export function getUpsetSignals(maxRating = 2) {
  return userSignals.filter(
    (signal) =>
      signal.metadata.rating !== null &&
      signal.metadata.rating <= maxRating
  );
}

/* -------------------------------------------------------------------------- */
/* DEPLOYMENT ASSOCIATION HELPERS                                             */
/* -------------------------------------------------------------------------- */

/**
 * Returns all errors associated with a deployment.
 *
 * @param {string} deploymentId
 * @returns {SessionEvent[]}
 */
export const getErrorsByDeployment = (deploymentId) =>
  errors.filter(
    (error) => error.deployment.id === deploymentId
  );

/**
 * Returns all performance warnings associated with a deployment.
 *
 * @param {string} deploymentId
 * @returns {PerformanceEvent[]}
 */
export const getPerformanceByDeployment = (
  deploymentId
) =>
  performanceEvents.filter(
    (event) => event.deploymentId === deploymentId
  );

/**
 * Returns all user feedback signals associated with a deployment.
 *
 * @param {string} deploymentId
 * @returns {SessionEvent[]}
 */
export const getSignalsByDeployment = (
  deploymentId
) =>
  userSignals.filter(
    (signal) => signal.deployment.id === deploymentId
  );

/**
 * Returns all telemetry associated with a deployment.
 * Used by deployment detail views in the prototype.
 *
 * @param {string} deploymentId
 * @returns {{
 *   deployment: Deployment | undefined,
 *   errors: SessionEvent[],
 *   performance: PerformanceEvent[],
 *   signals: SessionEvent[]
 * }}
 */
export const getDeploymentTelemetry = (
  deploymentId
) => ({
  deployment: deployments.find(
    (deployment) => deployment.id === deploymentId
  ),

  errors: getErrorsByDeployment(deploymentId),

  performance:
    getPerformanceByDeployment(deploymentId),

  signals: getSignalsByDeployment(deploymentId),
});