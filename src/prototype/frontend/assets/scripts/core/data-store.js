export const dataStore = {
  getEvents(options) {
    return window.WatchTowerData?.getEvents(options) || [];
  },

  getEvent(id) {
    return window.WatchTowerData?.getEvent(id) || null;
  },

  getDeployments() {
    return window.WatchTowerData?.getDeployments() || [];
  },

  getDeployment(id) {
    return window.WatchTowerData?.getDeployment(id) || null;
  },

  async update() {
    await window.WatchTowerData?.updateEvents?.();
    await window.WatchTowerData?.updateUptimeLog?.();
  },
};
