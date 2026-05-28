const RESOLVED_IDS_KEY = 'wt_resolved_ids';
const RESOLVED_GROUPS_KEY = 'wt_resolved_groups';

function loadSet(key) {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) || '[]'));
  } catch {
    return new Set();
  }
}

function loadMap(key) {
  try {
    return new Map(Object.entries(JSON.parse(localStorage.getItem(key) || '{}')));
  } catch {
    return new Map();
  }
}

export const resolvedSignals = {
  isResolved(event) {
    const ids = loadSet(RESOLVED_IDS_KEY);
    if (ids.has(event.id)) return true;

    const groups = loadMap(RESOLVED_GROUPS_KEY);
    const resolvedAt = groups.get(event.metadata?.message || '');
    return resolvedAt != null && new Date(event.timestamp) <= new Date(resolvedAt);
  },

  resolveId(id) {
    const ids = loadSet(RESOLVED_IDS_KEY);
    ids.add(id);
    localStorage.setItem(RESOLVED_IDS_KEY, JSON.stringify([...ids]));
  },

  resolveGroup(message) {
    const groups = loadMap(RESOLVED_GROUPS_KEY);
    groups.set(message, new Date().toISOString());
    localStorage.setItem(RESOLVED_GROUPS_KEY, JSON.stringify(Object.fromEntries(groups)));
  },
};
