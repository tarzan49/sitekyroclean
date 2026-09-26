import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
beforeEach(() => { vi.resetModules(); vi.stubEnv('VITE_TRACKING_ALLOW_NON_PRODUCTION', 'true'); vi.stubEnv('VITE_GA4_MEASUREMENT_ID', 'G-TESTE00000'); vi.stubEnv('VITE_GOOGLE_ADS_ID', 'AW-000000000'); vi.stubEnv('VITE_CONSENT_MODE', 'basic'); localStorage.clear(); sessionStorage.clear(); document.head.innerHTML = ''; window.gtag = vi.fn(); });

afterEach(() => vi.unstubAllEnvs());

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
    expect(window.gtag).toHaveBeenCalledWith('config', 'G-TESTE00000', { send_page_view: false });
    expect(window.gtag).toHaveBeenCalledWith('config', 'AW-000000000', { allow_enhanced_conversions: true });
  });

  /**
   * O `GT-` e o `G-` da mesma propriedade são o mesmo contentor: carregar os
   * dois punha duas cópias da biblioteca na página e duplicava cada page_view.
   */
  it('never loads the GT- container as a second library', async () => {
    localStorage.setItem('kyro_cookie_consent', 'accepted');
    const consent = await import('./consent'); consent.setConsent('accepted');
    const sources = [...document.querySelectorAll('script[src]')].map(s => s.getAttribute('src') ?? '');
    expect(sources.filter(src => src.includes('gtag/js'))).toHaveLength(1);
    expect(sources.join(' ')).not.toContain('GT-');
  });

  /** A conta de Ads antiga ficou configurada meses depois de deixar de ser usada. */
  it('no longer configures the retired Google Ads account', async () => {
    localStorage.setItem('kyro_cookie_consent', 'accepted');
    const consent = await import('./consent'); consent.setConsent('accepted');
    const calls = (window.gtag as ReturnType<typeof vi.fn>).mock.calls.flat().join(' ');
    expect(calls).not.toContain('AW-17779872363');
  });

  it('revokes analytics and advertising storage without clearing the quote', async () => {
    const consent = await import('./consent'); sessionStorage.setItem('quote', 'kept');
    consent.setConsent('accepted'); consent.setConsent('declined');
    expect(window.gtag).toHaveBeenLastCalledWith('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    expect(sessionStorage.getItem('quote')).toBe('kept');
  });

  /** Os quatro sinais do Consent Mode v2 andam juntos — nenhum pode ficar para trás. */
  it('grants all four v2 signals on acceptance', async () => {
    const consent = await import('./consent'); consent.setConsent('accepted');
    expect(window.gtag).toHaveBeenCalledWith('consent', 'update', {
      analytics_storage: 'granted', ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted',
    });
  });
});

/**
 * Modo avançado (em vigor desde 26/09/2026): a Google tag carrega sem decisão,
 * com tudo negado. O Pixel da Meta não tem modo avançado e continua a exigir a
 * aceitação — é isso que a política de privacidade promete.
 */
describe('advanced consent mode', () => {
  beforeEach(() => { vi.stubEnv('VITE_CONSENT_MODE', ''); vi.stubEnv('VITE_META_PIXEL_ID', '0000000000'); });

  it('loads the Google tag once without a decision, never the Meta Pixel', async () => {
    const consent = await import('./consent'); consent.restoreConsent();
    const sources = [...document.querySelectorAll('script[src]')].map(s => s.getAttribute('src') ?? '');
    expect(sources.filter(src => src.includes('googletagmanager.com'))).toHaveLength(1);
    expect(sources.join(' ')).not.toContain('fbevents');
    consent.setConsent('declined');
    expect([...document.querySelectorAll('script[src]')].map(s => s.getAttribute('src')).join(' ')).not.toContain('fbevents');
    expect(window.gtag).toHaveBeenLastCalledWith('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  });
});
