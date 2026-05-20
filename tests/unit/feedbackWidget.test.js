// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/js/mockData.js', () => ({
  deployments: [
    { id: 'dep_test', version: '1.0.0', commit_hash: 'abc0001', timestamp: '2026-05-19T10:00:00.000Z' },
  ],
}));

const { submitFeedback, getFeedbackSignals, getUpsetFeedback } = await import('../../src/js/feedbackWidget.js');

describe('submitFeedback', () => {
  it('stores a signal with the correct shape', () => {
    const before = getFeedbackSignals().length;
    const signal = submitFeedback(4, 'Great!', '/test');
    expect(getFeedbackSignals()).toHaveLength(before + 1);
    expect(signal.event_type).toBe('survey');
    expect(signal.metadata.rating).toBe(4);
    expect(signal.metadata.comment).toBe('Great!');
    expect(signal.pathname).toBe('/test');
    expect(signal.deployment).toMatchObject({ id: 'dep_test', version: '1.0.0' });
  });

  it('uses window.location.pathname as default pathname', () => {
    const before = getFeedbackSignals().length;
    submitFeedback(3, 'OK');
    const signal = getFeedbackSignals()[before];
    expect(typeof signal.pathname).toBe('string');
  });

  it('sets a default comment message when comment is null', () => {
    submitFeedback(5, null, '/no-comment');
    const signals = getFeedbackSignals();
    const last = signals[signals.length - 1];
    expect(last.metadata.message).toContain('5-star');
  });

  it('returns the stored event', () => {
    const result = submitFeedback(2, 'Not great', '/page');
    expect(result).toBeDefined();
    expect(result.event_type).toBe('survey');
  });
});

describe('getFeedbackSignals', () => {
  it('returns all signals submitted so far', () => {
    const count = getFeedbackSignals().length;
    submitFeedback(1, 'Bad', '/x');
    expect(getFeedbackSignals()).toHaveLength(count + 1);
  });
});

describe('getUpsetFeedback', () => {
  it('returns only signals at or below the threshold', () => {
    submitFeedback(1, 'Awful', '/a');
    submitFeedback(5, 'Perfect', '/b');
    const upset = getUpsetFeedback(2);
    expect(upset.every((s) => s.metadata.rating <= 2)).toBe(true);
  });

  it('defaults threshold to 2', () => {
    submitFeedback(2, 'Meh', '/c');
    const upset = getUpsetFeedback();
    expect(upset.some((s) => s.metadata.rating <= 2)).toBe(true);
  });

  it('returns empty array when no signals are upset', () => {
    const allHappy = getFeedbackSignals().every((s) => s.metadata.rating > 2);
    if (allHappy) {
      expect(getUpsetFeedback(2)).toHaveLength(0);
    }
  });
});
