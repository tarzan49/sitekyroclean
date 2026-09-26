import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Deduplicação de `page_view` sem envolver o React.
 *
 * O hook `use-page-tracking` só chama `trackPageView`; toda a decisão de
 * enviar ou não está aqui. Testar a função diretamente cobre os casos que
 * interessam — incluindo o duplo disparo do `<StrictMode>`, que é
 * indistinguível de duas chamadas seguidas com o mesmo caminho.
 */
beforeEach(() => {
  vi.resetModules();
  vi.unstubAllEnvs();
  localStorage.clear();
  sessionStorage.clear();
  document.head.innerHTML = '';
  window.gtag = vi.fn();
  vi.stubEnv('VITE_TRACKING_ALLOW_NON_PRODUCTION', 'true');
  vi.stubEnv('VITE_GA4_MEASUREMENT_ID', 'G-TESTE00000');
  vi.stubEnv('VITE_GOOGLE_ADS_ID', 'AW-000000000');
  // A deduplicação é igual nos dois modos; a porta de consentimento testada
  // aqui é a do básico. O avançado está em `gtag.test.ts`.
  vi.stubEnv('VITE_CONSENT_MODE', 'basic');
  localStorage.setItem('kyro_cookie_consent', 'accepted');
  vi.stubGlobal('location', new URL('https://cleansolutions.com.pt/limpeza-sofas-lisboa'));
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

async function setup() {
  const { loadGoogleTags } = await import('./gtag');
  loadGoogleTags();
  const analytics = await import('./analytics');
  vi.mocked(window.gtag!).mockClear();
  const sent = () => (window.gtag as ReturnType<typeof vi.fn>).mock.calls
    .filter(call => call[0] === 'event' && call[1] === 'page_view')
    .map(call => (call[2] as { page_path: string }).page_path);
  return { ...analytics, sent };
}

describe('page_view numa SPA', () => {
  it('envia um por rota em A → B → A, incluindo o regresso a A', async () => {
    const { trackPageView, sent } = await setup();
    trackPageView('/a');
    trackPageView('/b');
    trackPageView('/a');
    // O regresso a A é uma visita nova e legítima: suprimi-la seria uma
    // deduplicação demasiado agressiva, e perdia-se metade do tráfego de quem
    // navega para trás e para a frente.
    expect(sent()).toEqual(['/a', '/b', '/a']);
  });

  it('ignora a repetição imediata do mesmo caminho (re-render, StrictMode)', async () => {
    const { trackPageView, sent } = await setup();
    trackPageView('/a');
    trackPageView('/a');
    trackPageView('/a');
    expect(sent()).toEqual(['/a']);
  });

  /**
   * Um refresh é um carregamento novo: os módulos voltam a ser avaliados e o
   * guarda nasce vazio. Tem de haver `page_view`, senão uma visita que começa
   * com F5 não existia em lado nenhum.
   */
  it('volta a enviar depois de um recarregamento da página', async () => {
    const first = await setup();
    first.trackPageView('/a');
    expect(first.sent()).toEqual(['/a']);

    vi.resetModules();
    const second = await setup();
    second.trackPageView('/a');
    expect(second.sent()).toEqual(['/a']);
  });

  /**
   * Quem aceita as cookies na terceira página só tem a tag a partir daí. Sem
   * repor o guarda, a primeira `page_view` dessa pessoa seria a página
   * *seguinte*, e a sessão ficava sem página de entrada.
   */
  it('reenvia a página atual quando o consentimento chega a meio da visita', async () => {
    const { trackPageView, resetPageViewGuard, sent } = await setup();
    trackPageView('/a');
    resetPageViewGuard();
    trackPageView('/a');
    expect(sent()).toEqual(['/a', '/a']);
  });

  /** A query string não entra: é onde os parâmetros de campanha vivem. */
  it('não põe a query string no page_location', async () => {
    vi.stubGlobal('location', new URL('https://cleansolutions.com.pt/limpeza-sofas-lisboa?gclid=Cj0&email=alguem@exemplo.pt'));
    const { trackPageView } = await setup();
    trackPageView('/limpeza-sofas-lisboa');
    const call = (window.gtag as ReturnType<typeof vi.fn>).mock.calls.find(c => c[1] === 'page_view')!;
    const params = call[2] as { page_location: string };
    expect(params.page_location).toBe('https://cleansolutions.com.pt/limpeza-sofas-lisboa');
    expect(params.page_location).not.toContain('gclid');
    expect(params.page_location).not.toContain('exemplo.pt');
  });

  it('não envia page_view nenhum sem consentimento de análise', async () => {
    const { writeDecision } = await import('./consentStorage');
    writeDecision({ analytics: false, ads: false });
    const { trackPageView, sent } = await setup();
    trackPageView('/a');
    expect(sent()).toEqual([]);
  });
});
