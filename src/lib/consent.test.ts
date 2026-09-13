import { beforeEach, describe, expect, it, vi } from 'vitest';
beforeEach(() => { vi.resetModules(); localStorage.clear(); document.head.innerHTML = ''; window.gtag = vi.fn(); });
describe('consent-gated Google tags', () => {
  it('does not load tags before a decision or after refusal', async () => {
    const consent = await import('./consent'); consent.restoreConsent();
    expect(document.querySelector('script[src]')).toBeNull();
    consent.setConsent('declined'); expect(document.querySelector('script[src]')).toBeNull();
  });
  it('loads once after acceptance and restores a prior acceptance', async () => {
    localStorage.setItem('kyro_cookie_consent', 'accepted');
    const consent = await import('./consent'); consent.restoreConsent(); consent.setConsent('accepted');
    expect(document.querySelectorAll('script[src*="googletagmanager.com"]')).toHaveLength(1);
    expect(window.gtag).toHaveBeenCalledWith('config', 'G-T45T5FBNC3');
    expect(window.gtag).toHaveBeenCalledWith('config', 'AW-17779872363');
  });
  it('revokes analytics and advertising storage without clearing the quote', async () => {
    const consent = await import('./consent'); sessionStorage.setItem('quote', 'kept');
    consent.setConsent('accepted'); consent.setConsent('declined');
    expect(window.gtag).toHaveBeenLastCalledWith('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    expect(sessionStorage.getItem('quote')).toBe('kept');
  });
});
