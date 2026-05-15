/**
 * @file feedbackWidget.js
 * Build simple feedback signal prototype
 *
 * Usage by frontend:
 *   import { submitFeedback, getFeedbackSignals, getUpsetFeedbackSignals, } from './feedbackWidget.js';
 *   submitFeedback(4, "Works great!", "/checkout");
 *
 * @module feedbackWidget
 * @version 1.0.0
 */

import { deployments } from './mockData.js';

/**
 * In-memory store of submitted feedback events.
 * In the real system this would be POSTed to an API endpoint.
 * @type {import('./mockData.js').SessionEvent[]}
 */
const feedbackSignals = [];

/**
 * Returns the most recent deployment to attach to new feedback events.
 * In the real system this would come from a config file or environment variable
 * set by the developer's CI/CD pipeline (e.g. a GitHub Action).
 * @returns {import('./mockData.js').DeploymentRef}
 */
function getActiveDeployment() {
  const deployments = generateDeployments();
  const latest = [...deployments].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
  return { id: latest.id, version: latest.version, commit_hash: latest.commit_hash };
}

/**
 * Builds and stores a survey SessionEvent from widget input.
 * Call this when the user submits the feedback form.
 *
 * @param {1|2|3|4|5} rating     - Star rating selected by the user
 * @param {string}    [comment]  - Optional free-text comment
 * @param {string}    [pathname] - Current page path; defaults to window.location.pathname
 * @returns {import('./mockData.js').SessionEvent} The event that was stored
 */
export function submitFeedback(rating, comment = null, pathname = window.location.pathname) {
  const now = new Date().toISOString();

  /** @type {import('./mockData.js').SessionEvent} */
  const event = {
    event_type: "survey",
    timestamp: now,
    created_at: now,
    deployment: getActiveDeployment(),
    ip: "0.0.0.0", // anonymized; real value would be set server-side
    pathname,
    metadata: {
      severity: "signal",
      message: comment ?? `User submitted a ${rating}-star rating`,
      rating,
      comment,
      pageUrl: typeof window !== "undefined" ? window.location.href : pathname,
    },
  };

  feedbackSignals.push(event);
  console.log("[WatchTower] Feedback signal recorded:", event);
  return event;
}

/**
 * Returns all feedback signals submitted this session.
 * Frontend can call this to update the dashboard without a page reload.
 * @returns {import('./mockData.js').SessionEvent[]}
 */
export function getFeedbackSignals() {
  return feedbackSignals;
}

/**
 * Returns only upset signals (rating at or below threshold).
 * @param {number} [maxRating=2]
 * @returns {import('./mockData.js').SessionEvent[]}
 */
export function getUpsetFeedback(maxRating = 2) {
  return feedbackSignals.filter((s) => s.metadata.rating <= maxRating);
}