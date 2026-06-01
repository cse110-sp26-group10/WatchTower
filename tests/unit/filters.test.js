import { describe, it, expect } from 'vitest';
import {
  filterByEventType,
  filterByDeployment,
  filterBySeverity,
  filterByStatus,
  filterByRecency,
  filterByDateRange,
  applyFilters,
} from '../../src/js/filters.js';

const now = Date.now();
const minsAgo = (m) => new Date(now - m * 60 * 1000).toISOString();

describe('filterByEventType', () => {
  it('returns only events matching the given type', () => {
    const events = [{ eventType: 'error' }, { eventType: 'survey' }, { eventType: 'error' }];
    expect(filterByEventType(events, 'error')).toHaveLength(2);
    expect(filterByEventType(events, 'survey')).toHaveLength(1);
  });

  it('returns empty array when no events match', () => {
    const events = [{ eventType: 'error' }];
    expect(filterByEventType(events, 'click')).toHaveLength(0);
  });

  it('returns empty array for empty input', () => {
    expect(filterByEventType([], 'error')).toHaveLength(0);
  });
});

describe('filterByDeployment', () => {
  it('returns only events for the given deployment id', () => {
    const events = [
      { deployment: { id: 'dep_1' } },
      { deployment: { id: 'dep_2' } },
      { deployment: { id: 'dep_1' } },
    ];
    expect(filterByDeployment(events, 'dep_1')).toHaveLength(2);
    expect(filterByDeployment(events, 'dep_2')).toHaveLength(1);
  });

  it('returns empty array when deployment id is not found', () => {
    const events = [{ deployment: { id: 'dep_1' } }];
    expect(filterByDeployment(events, 'dep_999')).toHaveLength(0);
  });
});

describe('filterBySeverity', () => {
  it('matches severity from metadata field', () => {
    const events = [
      { metadata: { severity: 'critical' } },
      { metadata: { severity: 'warning' } },
      { metadata: { severity: 'critical' } },
    ];
    expect(filterBySeverity(events, 'critical')).toHaveLength(2);
    expect(filterBySeverity(events, 'warning')).toHaveLength(1);
  });

  it('falls back to top-level severity when metadata is absent', () => {
    const events = [{ severity: 'critical' }, { severity: 'signal' }];
    expect(filterBySeverity(events, 'critical')).toHaveLength(1);
  });

  it('returns empty array when no events match', () => {
    const events = [{ metadata: { severity: 'signal' } }];
    expect(filterBySeverity(events, 'critical')).toHaveLength(0);
  });
});

describe('filterByStatus', () => {
  it('returns only issues matching the given status', () => {
    const issues = [{ status: 'open' }, { status: 'resolved' }, { status: 'open' }];
    expect(filterByStatus(issues, 'open')).toHaveLength(2);
    expect(filterByStatus(issues, 'resolved')).toHaveLength(1);
  });

  it('returns empty array when no issues match', () => {
    expect(filterByStatus([{ status: 'open' }], 'resolved')).toHaveLength(0);
  });
});

describe('filterByRecency', () => {
  it('returns events within the time window', () => {
    const events = [
      { timestamp: minsAgo(5) },
      { timestamp: minsAgo(15) },
      { timestamp: minsAgo(45) },
    ];
    expect(filterByRecency(events, 10)).toHaveLength(1);
    expect(filterByRecency(events, 20)).toHaveLength(2);
    expect(filterByRecency(events, 60)).toHaveLength(3);
  });

  it('returns empty array when all events are outside window', () => {
    const events = [{ timestamp: minsAgo(120) }];
    expect(filterByRecency(events, 30)).toHaveLength(0);
  });
});

describe('filterByDateRange', () => {
  it('returns events within the inclusive date range', () => {
    const events = [
      { timestamp: '2026-05-01T00:00:00.000Z' },
      { timestamp: '2026-05-10T00:00:00.000Z' },
      { timestamp: '2026-05-20T00:00:00.000Z' },
    ];
    expect(
      filterByDateRange(events, '2026-05-05T00:00:00.000Z', '2026-05-15T00:00:00.000Z')
    ).toHaveLength(1);
    expect(
      filterByDateRange(events, '2026-05-01T00:00:00.000Z', '2026-05-20T00:00:00.000Z')
    ).toHaveLength(3);
  });

  it('returns empty array when no events fall in range', () => {
    const events = [{ timestamp: '2026-06-01T00:00:00.000Z' }];
    expect(
      filterByDateRange(events, '2026-05-01T00:00:00.000Z', '2026-05-31T00:00:00.000Z')
    ).toHaveLength(0);
  });
});

describe('applyFilters', () => {
  it('returns all events when criteria is empty', () => {
    const events = [
      { eventType: 'error', deployment: { id: 'dep_1' }, metadata: { severity: 'critical' }, status: 'open', timestamp: minsAgo(5) },
      { eventType: 'survey', deployment: { id: 'dep_2' }, metadata: { severity: 'signal' }, status: 'resolved', timestamp: minsAgo(60) },
    ];
    expect(applyFilters(events, {})).toHaveLength(2);
  });

  it('applies eventType filter', () => {
    const events = [
      { eventType: 'error', deployment: { id: 'dep_1' }, metadata: { severity: 'critical' }, status: 'open', timestamp: minsAgo(5) },
      { eventType: 'survey', deployment: { id: 'dep_2' }, metadata: { severity: 'signal' }, status: 'resolved', timestamp: minsAgo(60) },
    ];
    expect(applyFilters(events, { eventType: 'error' })).toHaveLength(1);
    expect(applyFilters(events, { eventType: 'error' })[0].eventType).toBe('error');
  });

  it('applies deploymentId filter', () => {
    const events = [
      { eventType: 'error', deployment: { id: 'dep_1' }, metadata: { severity: 'critical' }, status: 'open', timestamp: minsAgo(5) },
      { eventType: 'survey', deployment: { id: 'dep_2' }, metadata: { severity: 'signal' }, status: 'resolved', timestamp: minsAgo(60) },
    ];
    expect(applyFilters(events, { deploymentId: 'dep_1' })).toHaveLength(1);
  });

  it('applies recentMinutes filter', () => {
    const events = [
      { eventType: 'error', deployment: { id: 'dep_1' }, metadata: { severity: 'critical' }, status: 'open', timestamp: minsAgo(5) },
      { eventType: 'survey', deployment: { id: 'dep_2' }, metadata: { severity: 'signal' }, status: 'resolved', timestamp: minsAgo(60) },
    ];
    expect(applyFilters(events, { recentMinutes: 30 })).toHaveLength(1);
  });

  it('chains multiple criteria', () => {
    const events = [
      { eventType: 'error', deployment: { id: 'dep_1' }, metadata: { severity: 'critical' }, status: 'open', timestamp: minsAgo(5) },
      { eventType: 'error', deployment: { id: 'dep_2' }, metadata: { severity: 'critical' }, status: 'open', timestamp: minsAgo(5) },
    ];
    expect(applyFilters(events, { eventType: 'error', deploymentId: 'dep_1' })).toHaveLength(1);
  });

  it('returns empty array for empty input', () => {
    expect(applyFilters([], { eventType: 'error' })).toHaveLength(0);
  });
});
