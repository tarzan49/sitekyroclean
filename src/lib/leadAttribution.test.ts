import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { captureLeadAttribution, leadAttributionNote } from './leadAttribution';
beforeEach(() => { sessionStorage.clear(); localStorage.clear(); vi.stubGlobal('location', new URL('https://cleansolutions.com.pt/limpeza-sofas-lisboa?utm_source=google&utm_content=video1&gclid=click123&phone=private')); });
afterEach(() => vi.unstubAllGlobals());
describe('lead campaign attribution', () => {
  it('does not retain or attach marketing parameters without consent', () => {
    expect(captureLeadAttribution()).toBeNull(); expect(sessionStorage.length).toBe(0);
    localStorage.setItem('kyro_cookie_consent', 'declined'); expect(leadAttributionNote()).toBe('');
  });
  it('preserves the entry across untagged navigation, with only permitted campaign fields', () => {
    localStorage.setItem('kyro_cookie_consent', 'accepted');
    const first = captureLeadAttribution();
    vi.stubGlobal('location', new URL('https://cleansolutions.com.pt/packs'));
    expect(captureLeadAttribution()).toEqual(first);
    expect(leadAttributionNote()).toContain('video1'); expect(leadAttributionNote()).not.toContain('private');
  });
  it('replaces a campaign on a new tagged entry and discards it on withdrawal', () => {
    localStorage.setItem('kyro_cookie_consent', 'accepted'); captureLeadAttribution();
    vi.stubGlobal('location', new URL('https://cleansolutions.com.pt/packs?utm_source=facebook&fbclid=second'));
    expect(captureLeadAttribution()).toMatchObject({ utm_source: 'facebook', fbclid: 'second' });
    expect(captureLeadAttribution()).not.toHaveProperty('gclid');
    localStorage.setItem('kyro_cookie_consent', 'declined'); expect(captureLeadAttribution()).toBeNull(); expect(sessionStorage.length).toBe(0);
  });
});
