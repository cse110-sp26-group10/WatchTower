import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import Event from '../../src/prototype/server/assets/Event.js';

const FIXED_NOW = '2026-05-19T12:00:00.000Z';
const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(FIXED_NOW));
});

afterAll(() => {
  vi.useRealTimers();
});

function secsAgo(s) {
  return new Date(new Date(FIXED_NOW).getTime() - s * 1000).toISOString();
}

function validBase(eventType = 'page_load', metadata = { load_time: 100 }) {
  return {
    event_type: eventType,
    timestamp: secsAgo(10),
    deployment: {
      id: 'dep_001',
      version: '1.0.0',
      commit_hash: 'abc1234',
      deployed_at: '2026-01-01T00:00:00.000Z',
      author: 'evan',
    },
    user_id: VALID_UUID,
    current_url: 'https://example.com/page',
    referrer: '',
    metadata,
  };
}

describe('Event — valid construction', () => {
  it('constructs a valid page_load event', () => {
    const e = new Event(JSON.stringify(validBase('page_load', { load_time: 150 })));
    expect(e.valid).toBe(true);
    expect(e.event.event_type).toBe('page_load');
    expect(e.event.pathname).toBe('/page');
    expect(e.event.host).toBe('example.com');
    expect(e.event.created_at).toBeDefined();
    expect(e.event.referring_domain).toBe('');
  });

  it('constructs a valid error event', () => {
    const e = new Event(JSON.stringify(validBase('error', { severity: 'critical', message: 'boom' })));
    expect(e.valid).toBe(true);
    expect(e.event.event_type).toBe('error');
  });

  it('constructs a valid survey event', () => {
    const e = new Event(JSON.stringify(validBase('survey', { rating: 4, message: 'nice' })));
    expect(e.valid).toBe(true);
  });

  it('constructs a valid click event', () => {
    const e = new Event(JSON.stringify(validBase('click', { element_id: 'btn', element_class: 'primary', input_delay: 12 })));
    expect(e.valid).toBe(true);
  });

  it('strips extra top-level fields', () => {
    const data = { ...validBase(), extraField: 'remove me' };
    const e = new Event(JSON.stringify(data));
    expect(e.valid).toBe(true);
    expect(e.event.extraField).toBeUndefined();
  });

  it('strips extra metadata fields', () => {
    const data = validBase('page_load', { load_time: 50, sneaky: 'remove me' });
    const e = new Event(JSON.stringify(data));
    expect(e.valid).toBe(true);
    expect(e.event.metadata.sneaky).toBeUndefined();
  });

  it('parses referring_domain from a valid referrer', () => {
    const data = { ...validBase(), referrer: 'https://google.com/search?q=test' };
    const e = new Event(JSON.stringify(data));
    expect(e.valid).toBe(true);
    expect(e.event.referring_domain).toBe('google.com');
  });
});

describe('Event — JSON validation', () => {
  it('rejects invalid JSON', () => {
    expect(new Event('not json').valid).toBe(false);
  });

  it('rejects a non-object JSON value', () => {
    expect(new Event('"just a string"').valid).toBe(false);
  });
});

describe('Event — event_type validation', () => {
  it('rejects an unknown event_type', () => {
    expect(new Event(JSON.stringify({ ...validBase(), event_type: 'unknown' })).valid).toBe(false);
  });

  it('rejects a numeric event_type', () => {
    expect(new Event(JSON.stringify({ ...validBase(), event_type: 42 })).valid).toBe(false);
  });
});

describe('Event — timestamp validation', () => {
  it('rejects a timestamp more than 300 seconds in the past', () => {
    expect(new Event(JSON.stringify({ ...validBase(), timestamp: secsAgo(400) })).valid).toBe(false);
  });

  it('rejects a future timestamp', () => {
    const future = new Date(new Date(FIXED_NOW).getTime() + 5000).toISOString();
    expect(new Event(JSON.stringify({ ...validBase(), timestamp: future })).valid).toBe(false);
  });

  it('rejects a non-ISO date string', () => {
    expect(new Event(JSON.stringify({ ...validBase(), timestamp: '2026-05-19' })).valid).toBe(false);
  });
});

describe('Event — deployment validation', () => {
  it('rejects missing author field', () => {
    const d = validBase();
    delete d.deployment.author;
    expect(new Event(JSON.stringify(d)).valid).toBe(false);
  });

  it('rejects a future deployed_at', () => {
    const future = new Date(new Date(FIXED_NOW).getTime() + 5000).toISOString();
    const data = { ...validBase(), deployment: { ...validBase().deployment, deployed_at: future } };
    expect(new Event(JSON.stringify(data)).valid).toBe(false);
  });

  it('rejects deployment that is not an object', () => {
    expect(new Event(JSON.stringify({ ...validBase(), deployment: 'dep_001' })).valid).toBe(false);
  });
});

describe('Event — user_id validation', () => {
  it('rejects a malformed UUID', () => {
    expect(new Event(JSON.stringify({ ...validBase(), user_id: 'not-a-uuid' })).valid).toBe(false);
  });

  it('rejects a numeric user_id', () => {
    expect(new Event(JSON.stringify({ ...validBase(), user_id: 12345 })).valid).toBe(false);
  });
});

describe('Event — URL validation', () => {
  it('rejects an invalid current_url', () => {
    expect(new Event(JSON.stringify({ ...validBase(), current_url: 'not a url' })).valid).toBe(false);
  });

  it('rejects a non-empty invalid referrer', () => {
    expect(new Event(JSON.stringify({ ...validBase(), referrer: 'not a url' })).valid).toBe(false);
  });

  it('accepts an empty referrer', () => {
    expect(new Event(JSON.stringify({ ...validBase(), referrer: '' })).valid).toBe(true);
  });
});

describe('Event — metadata validation', () => {
  it('rejects page_load with missing load_time', () => {
    expect(new Event(JSON.stringify(validBase('page_load', {}))).valid).toBe(false);
  });

  it('rejects error with missing severity', () => {
    expect(new Event(JSON.stringify(validBase('error', { message: 'oops' }))).valid).toBe(false);
  });

  it('rejects error with missing message', () => {
    expect(new Event(JSON.stringify(validBase('error', { severity: 'critical' }))).valid).toBe(false);
  });

  it('rejects survey with missing rating', () => {
    expect(new Event(JSON.stringify(validBase('survey', { message: 'nice' }))).valid).toBe(false);
  });

  it('rejects click with missing element_id', () => {
    expect(new Event(JSON.stringify(validBase('click', { element_class: 'btn', input_delay: 5 }))).valid).toBe(false);
  });
});

describe('Event — set_field', () => {
  it('updates a recognised field', () => {
    const e = new Event(JSON.stringify(validBase()));
    expect(e.set_field('ip', '1.2.3.4')).toBe(true);
    expect(e.event.ip).toBe('1.2.3.4');
  });

  it('rejects an unrecognised field', () => {
    const e = new Event(JSON.stringify(validBase()));
    expect(e.set_field('notAField', 'value')).toBe(false);
  });
});
