import { deployments } from './mockData.js';

const signals = [];

/**
 * Submits a feedback signal and stores it.
 * @param {number} rating - Star rating (1-5).
 * @param {string|null} comment - User comment, or null for a default message.
 * @param {string} [pathname] - Page path; defaults to window.location.pathname.
 * @returns {Object} The stored signal.
 */
export function submitFeedback(rating, comment, pathname) {
    const deployment = deployments[0] ?? {};
    const message = comment !== null && comment !== undefined
        ? comment
        : `${rating}-star rating`;
    const signal = {
        event_type: 'survey',
        pathname: pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '/'),
        deployment,
        metadata: {
            rating,
            comment: message,
            message,
        },
    };
    signals.push(signal);
    return signal;
}

/**
 * Returns all stored feedback signals.
 * @returns {Object[]}
 */
export function getFeedbackSignals() {
    return signals;
}

/**
 * Returns signals at or below the given rating threshold.
 * @param {number} [threshold=2]
 * @returns {Object[]}
 */
export function getUpsetFeedback(threshold = 2) {
    return signals.filter((s) => s.metadata.rating <= threshold);
}
