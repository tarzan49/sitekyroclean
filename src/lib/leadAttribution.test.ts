import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { captureLeadAttribution, leadAttributionNote } from './leadAttribution';
beforeEach(() => { sessionStorage.clear(); localStorage.clear(); vi.stubGlobal('location', new URL('https://cleansolutions.com.pt/limpeza-sofas-lisboa?utm_source=google&utm_content=video1&gclid=click123&phone=private')); });
afterEach(() => vi.unstubAllGlobals());
/** Referrer que o jsdom nao deixa definir por atribuicao simples. */
const withReferrer = (value: string) =>
  Object.defineProperty(document, 'referrer', { value, configurable: true });

describe('atribuicao por assistente de IA', () => {
  beforeEach(() => {
    localStorage.setItem('kyro_cookie_consent', 'accepted');
    vi.stubGlobal('location', new URL('https://cleansolutions.com.pt/limpeza-sofas-porto'));
  });

  it('nomeia o assistente e poe-no numa linha propria da nota', () => {
    withReferrer('https://chatgpt.com/c/abc123');
    expect(captureLeadAttribution()).toMatchObject({ referrer: 'chatgpt.com', referrer_source: 'ChatGPT' });
    expect(leadAttributionNote().split('\n')[0]).toBe('Chegou por ChatGPT.');
  });

  it('guarda o dominio de uma origem desconhecida sem lhe inventar um nome', () => {
    withReferrer('https://www.exemplo.pt/artigo');
    const attribution = captureLeadAttribution();
    expect(attribution).toMatchObject({ referrer: 'exemplo.pt' });
    expect(attribution).not.toHaveProperty('referrer_source');
    expect(leadAttributionNote()).not.toContain('Chegou por');
  });

  it('ignora navegacao dentro do proprio site e visitas sem referrer', () => {
    withReferrer('https://cleansolutions.com.pt/packs');
    expect(captureLeadAttribution()).not.toHaveProperty('referrer');
    sessionStorage.clear();
    withReferrer('');
    expect(captureLeadAttribution()).not.toHaveProperty('referrer');
  });

  it('nao regista nada sem consentimento', () => {
    localStorage.setItem('kyro_cookie_consent', 'declined');
    withReferrer('https://www.perplexity.ai/search/xyz');
    expect(captureLeadAttribution()).toBeNull();
    expect(leadAttributionNote()).toBe('');
  });
});

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
