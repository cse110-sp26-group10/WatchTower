const SEVERITY_RANK = { critical: 0, warning: 1, info: 2 };

/**
 * Groups identical signals to the same panel
 * @param {*} signals Input signals to render
 * @returns Grouped signal array
 */
export function groupErrors(signals) {
  const groups = new Map();

  for (const signal of signals) {
    const message = signal.metadata?.message || '(unknown error)';
    const group = groups.get(message) || {
      message,
      count: 0,
      severity: signal.metadata?.severity,
      latestSignal: signal,
      firstTimestamp: signal.timestamp,
      signals: [],
    };

    group.count += 1;
    group.signals.push(signal);

    if ((SEVERITY_RANK[signal.metadata?.severity] ?? 99) < (SEVERITY_RANK[group.severity] ?? 99)) {
      group.severity = signal.metadata?.severity;
    }
    if (new Date(signal.timestamp) > new Date(group.latestSignal.timestamp)) {
      group.latestSignal = signal;
    }
    if (new Date(signal.timestamp) < new Date(group.firstTimestamp)) {
      group.firstTimestamp = signal.timestamp;
    }

    groups.set(message, group);
  }

  return Array.from(groups.values()).sort((a, b) => {
    const sevDiff = (SEVERITY_RANK[a.severity] ?? 99) - (SEVERITY_RANK[b.severity] ?? 99);
    return sevDiff !== 0 ? sevDiff : b.count - a.count;
  });
}
