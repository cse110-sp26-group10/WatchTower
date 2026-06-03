import { dataStore } from './data-store.js';

let activeProjectId = 'all';
const listeners = new Set();

function notify() {
  for (const listener of listeners) {
    listener(activeProjectId);
  }
}

export const projectScope = {
  get id() {
    return activeProjectId;
  },

  get project() {
    return activeProjectId === 'all' ? null : dataStore.getProject(activeProjectId);
  },

  set(id) {
    activeProjectId = id || 'all';
    notify();
  },

  subscribe(listener) {
    listeners.add(listener);
    listener(activeProjectId);
    return () => listeners.delete(listener);
  },
};
