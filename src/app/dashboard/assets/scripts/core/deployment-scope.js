import { dataStore } from './data-store.js';

let activeDeploymentId = 'all';
const listeners = new Set();

function notify() {
  for (const listener of listeners) {
    listener(activeDeploymentId);
  }
}

/**
 * Keeps track of the current selected deployment
 */
export const deploymentScope = {
  get id() {
    return activeDeploymentId;
  },

  get deployment() {
    return activeDeploymentId === 'all' ? null : dataStore.getDeployment(activeDeploymentId);
  },

  set(id) {
    activeDeploymentId = id || 'all';
    notify();
  },

  subscribe(listener) {
    listeners.add(listener);
    listener(activeDeploymentId);
    return () => listeners.delete(listener);
  },
};
