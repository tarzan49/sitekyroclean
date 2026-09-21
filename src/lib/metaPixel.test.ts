import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('VITE_TRACKING_ALLOW_NON_PRODUCTION', 'true');
  vi.stubEnv('VITE_META_PIXEL_ID', 'TEST-PIXEL');
  localStorage.clear();
  document.head.innerHTML = '';
  delete window.fbq;
  delete window._fbq;
});

afterEach(() => vi.unstubAllEnvs());

describe('Meta Pixel', () => {
  it('does not load before consent or after refusal', async () => {
    const pixel = await import('./metaPixel');
    pixel.loadMetaPixel();
    expect(document.querySelector('script[src*="fbevents.js"]')).toBeNull();

    localStorage.setItem('kyro_cookie_consent', 'declined');
    pixel.loadMetaPixel();
    expect(document.querySelector('script[src*="fbevents.js"]')).toBeNull();
  });

  it('loads once and tracks each route once after advertising consent', async () => {
    localStorage.setItem('kyro_cookie_consent', 'accepted');
    const pixel = await import('./metaPixel');
    pixel.loadMetaPixel();
    pixel.loadMetaPixel();

    expect(document.querySelectorAll('script[src*="fbevents.js"]')).toHaveLength(1);
    expect(window.fbq?.queue).toContainEqual(['init', 'TEST-PIXEL']);
    expect(pixel.trackMetaPageView('/a')).toBe(true);
    expect(pixel.trackMetaPageView('/a')).toBe(false);
    expect(pixel.trackMetaPageView('/b')).toBe(true);
    expect(window.fbq?.queue.filter(call => call[0] === 'track')).toHaveLength(2);
  });

  it('stops tracking after consent is withdrawn', async () => {
    localStorage.setItem('kyro_cookie_consent', 'accepted');
    const pixel = await import('./metaPixel');
    pixel.loadMetaPixel();
    localStorage.setItem('kyro_cookie_consent', 'declined');
    expect(pixel.trackMetaPageView('/private')).toBe(false);
  });
});

describe('conversões Meta', () => {
  it('clique não cria Lead; pedido confirmado tem ID estável e não tem valor de venda', async () => {
    localStorage.setItem('kyro_cookie_consent', 'accepted');
    const p = await import('./metaPixel'); p.loadMetaPixel();
    p.trackMetaContactClick('whatsapp_click');
    expect(window.fbq?.queue).toContainEqual(['trackCustom', 'WhatsAppClick']);
    expect(p.trackMetaLead('L-test-123')).toBe(true);
    expect(p.trackMetaLead('L-test-123')).toBe(false);
    expect(window.fbq?.queue).toContainEqual(['track', 'Lead', {}, { eventID:'lead:L-test-123' }]);
  });
  it('não consome ID sem consentimento e bloqueia revogação', async () => {
    const p = await import('./metaPixel');
    expect(p.trackMetaLead('L-test-456')).toBe(false);
    localStorage.setItem('kyro_cookie_consent','accepted'); p.loadMetaPixel();
    expect(p.trackMetaLead('L-test-456')).toBe(true);
    localStorage.setItem('kyro_cookie_consent','declined');
    expect(p.trackMetaContactClick('call_click')).toBe(false);
    expect(p.trackMetaLead('L-test-789')).toBe(false);
  });
});
