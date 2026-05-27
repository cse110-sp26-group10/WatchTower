import { describe, it, expect } from 'vitest';
import { parseBrowser } from '../../src/prototype/tracker/assets/tracker.js';

const CHROME_UA  = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const EDGE_UA    = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0';
const FIREFOX_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0';
const SAFARI_UA  = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15';
const OPERA_UA   = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 OPR/110.0.0.0';
const WEIRD_UA   = 'MyCustomBot/1.0';

describe('parseBrowser — userAgentData path', () => {
  it('uses userAgentData when brands are present', () => {
    const uaData = { brands: [{ brand: 'Chromium', version: '124' }, { brand: 'Google Chrome', version: '124' }] };
    expect(parseBrowser(CHROME_UA, uaData)).toEqual({ name: 'Google Chrome', version: '124' });
  });

  it('skips placeholder brands containing "Not"', () => {
    const uaData = { brands: [{ brand: 'Not A Brand', version: '99' }, { brand: 'Google Chrome', version: '124' }] };
    expect(parseBrowser(CHROME_UA, uaData)).toEqual({ name: 'Google Chrome', version: '124' });
  });

  it('picks the most-specific brand from a three-brand array', () => {
    const uaData = { brands: [
      { brand: 'Not A Brand', version: '99' },
      { brand: 'Chromium', version: '124' },
      { brand: 'Google Chrome', version: '124' },
    ]};
    expect(parseBrowser(CHROME_UA, uaData)).toEqual({ name: 'Google Chrome', version: '124' });
  });

  it('falls through to regex when all brands contain "Not"', () => {
    const uaData = { brands: [{ brand: 'Not A Brand', version: '99' }] };
    expect(parseBrowser(CHROME_UA, uaData)).toEqual({ name: 'Chrome', version: '124' });
  });

  it('falls through to regex when uaData is undefined', () => {
    expect(parseBrowser(FIREFOX_UA, undefined)).toEqual({ name: 'Firefox', version: '125' });
  });
});

describe('parseBrowser — regex path', () => {
  it('detects Chrome', () => {
    expect(parseBrowser(CHROME_UA, undefined)).toEqual({ name: 'Chrome', version: '124' });
  });

  it('detects Edge (not misidentified as Chrome)', () => {
    expect(parseBrowser(EDGE_UA, undefined)).toEqual({ name: 'Edge', version: '124' });
  });

  it('detects Firefox', () => {
    expect(parseBrowser(FIREFOX_UA, undefined)).toEqual({ name: 'Firefox', version: '125' });
  });

  it('detects Safari (not misidentified as Chrome)', () => {
    expect(parseBrowser(SAFARI_UA, undefined)).toEqual({ name: 'Safari', version: '17' });
  });

  it('detects Opera (not misidentified as Chrome)', () => {
    expect(parseBrowser(OPERA_UA, undefined)).toEqual({ name: 'Opera', version: '110' });
  });
});

describe('parseBrowser — fallback path', () => {
  it('returns a truncated UA string for completely unrecognised agents', () => {
    const result = parseBrowser(WEIRD_UA, undefined);
    expect(result.name).toBe('MyCustomBot/1.0');
    expect(result.version).toBe('');
  });

  it('returns "Unknown" when the UA string is empty', () => {
    expect(parseBrowser('', undefined)).toEqual({ name: 'Unknown', version: '' });
  });
});
