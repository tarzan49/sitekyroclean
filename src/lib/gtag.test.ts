import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  vi.unstubAllEnvs();
  localStorage.clear();
  sessionStorage.clear();
  document.head.innerHTML = '';
  window.gtag = vi.fn();
  // Fora de produção só se envia com autorização **explícita** e para
  // identificadores que não sejam os reais. As duas condições, sempre. O modo
  // de depuração já não serve para isto: só escreve no console.
  vi.stubEnv('VITE_TRACKING_ALLOW_NON_PRODUCTION', 'true');
  vi.stubEnv('VITE_GA4_MEASUREMENT_ID', 'G-TESTE00000');
  vi.stubEnv('VITE_GOOGLE_ADS_ID', 'AW-000000000');
  // As portas de consentimento abaixo são as do modo básico, que continua a
  // existir (`VITE_CONSENT_MODE=basic`). O modo em vigor, o avançado, tem o seu
  // próprio bloco no fim do ficheiro.
  vi.stubEnv('VITE_CONSENT_MODE', 'basic');
  localStorage.setItem('kyro_cookie_consent', 'accepted');
});

afterEach(() => vi.unstubAllEnvs());

describe('ambiente: o que impede o localhost de escrever na conta a sério', () => {
  /**
   * A regra que o utilizador pediu: `?kyro_debug=1` é diagnóstico, não
   * autorização. Na primeira versão abria a porta do ambiente, o que queria
   * dizer que qualquer pessoa com o localhost aberto e esse parâmetro no URL
   * escrevia na propriedade GA4 real.
   */
  it('o modo de depuração sozinho não autoriza envio nenhum', async () => {
    vi.unstubAllEnvs();
    sessionStorage.setItem('kyro_tracking_debug', '1');
    const { loadGoogleTags, sendGtagEvent } = await import('./gtag');
    loadGoogleTags();
    expect(sendGtagEvent('teste')).toBe(false);
    expect(document.querySelector('script[src*="gtag/js"]')).toBeNull();
    expect(window.gtag).not.toHaveBeenCalled();
  });

  /**
   * A segunda condição, que é a que importa: mesmo com a autorização ligada por
   * engano num build, não se envia enquanto os identificadores forem os de
   * produção.
   */
  it('recusa enviar com os identificadores reais fora de produção', async () => {
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_TRACKING_ALLOW_NON_PRODUCTION', 'true');
    const { nonProductionSendingAllowed } = await import('@/constants/tracking');
    expect(nonProductionSendingAllowed()).toBe(false);
  });

  it('autoriza com a variável ligada e identificadores de teste', async () => {
    const { nonProductionSendingAllowed, trackingConfigSummary } = await import('@/constants/tracking');
    expect(nonProductionSendingAllowed()).toBe(true);
    expect(trackingConfigSummary().usingProductionIds).toBe(false);
  });
});

describe('envio de eventos', () => {
  it('não envia nada antes de a tag estar carregada', async () => {
    const { sendGtagEvent } = await import('./gtag');
    expect(sendGtagEvent('teste')).toBe(false);
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it('envia depois de a tag carregar, e sem os parâmetros vazios', async () => {
    const { loadGoogleTags, sendGtagEvent } = await import('./gtag');
    loadGoogleTags();
    vi.mocked(window.gtag!).mockClear();
    // Um `undefined` enviado para o GA4 fica registado como a string
    // "undefined", que depois aparece nos relatórios como se fosse um valor.
    expect(sendGtagEvent('teste', { a: 'x', b: undefined, c: '' })).toBe(true);
    expect(window.gtag).toHaveBeenCalledWith('event', 'teste', { a: 'x' });
  });

  it('carrega uma só biblioteca por mais vezes que seja chamada', async () => {
    const { loadGoogleTags } = await import('./gtag');
    loadGoogleTags(); loadGoogleTags(); loadGoogleTags();
    expect(document.querySelectorAll('script[src*="gtag/js"]')).toHaveLength(1);
  });
});

describe('conversões do Google Ads', () => {
  it('não envia conversão sem etiqueta configurada, em vez de enviar para o vazio', async () => {
    const { loadGoogleTags, sendAdsConversion } = await import('./gtag');
    loadGoogleTags();
    vi.mocked(window.gtag!).mockClear();
    expect(sendAdsConversion({ label: undefined, value: 50 })).toBe(false);
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it('envia com send_to completo e o lead_id como transaction_id', async () => {
    const { loadGoogleTags, sendAdsConversion } = await import('./gtag');
    loadGoogleTags();
    vi.mocked(window.gtag!).mockClear();
    sendAdsConversion({ label: 'AbC-D_efGh', value: 89, transactionId: 'L-20260918-abc' });
    expect(window.gtag).toHaveBeenCalledWith('event', 'conversion', {
      send_to: 'AW-000000000/AbC-D_efGh',
      value: 89,
      currency: 'EUR',
      transaction_id: 'L-20260918-abc',
    });
  });
});

describe('deduplicação', () => {
  it('deixa passar a primeira vez e bloqueia as seguintes', async () => {
    const { markFiredOnce } = await import('./gtag');
    expect(markFiredOnce('lead:L-1')).toBe(true);
    expect(markFiredOnce('lead:L-1')).toBe(false);
    expect(markFiredOnce('lead:L-2')).toBe(true);
  });

  it('sobrevive a um refresh da página, que é o caso que interessa', async () => {
    const first = await import('./gtag');
    expect(first.markFiredOnce('lead:L-9')).toBe(true);
    // Recarregar a página é um módulo novo com o mesmo localStorage.
    vi.resetModules();
    const second = await import('./gtag');
    expect(second.markFiredOnce('lead:L-9')).toBe(false);
  });

  it('esquece marcas com mais de sete dias', async () => {
    const oito = Date.now() - 8 * 86400000;
    localStorage.setItem('kyro_fired_events_v1', JSON.stringify({ 'lead:antigo': oito }));
    const { markFiredOnce } = await import('./gtag');
    expect(markFiredOnce('lead:antigo')).toBe(true);
  });

  /**
   * Num browser em modo privado o `localStorage` pode rebentar. Perder uma
   * conversão real por causa disso é pior do que contar uma a dobrar num caso
   * raro — e o `transaction_id` ainda apanha a duplicação do lado da Google.
   */
  it('deixa passar quando o armazenamento está bloqueado', async () => {
    const original = Storage.prototype.getItem;
    Storage.prototype.getItem = () => { throw new Error('bloqueado'); };
    try {
      const { markFiredOnce } = await import('./gtag');
      expect(markFiredOnce('lead:L-1')).toBe(true);
      expect(markFiredOnce('lead:L-1')).toBe(true);
    } finally {
      Storage.prototype.getItem = original;
    }
  });
});

describe('consentimento retirado a meio da visita', () => {
  /**
   * A tag não se desinstala. Quem aceita e depois muda de ideias deixa a
   * biblioteca na página, e sem esta porta os nossos eventos continuavam a sair
   * — foi o que a primeira verificação em browser apanhou: recusar as cookies e
   * uma `page_view` e uma conversão do Ads saírem logo a seguir.
   */
  it('deixa de enviar assim que a pessoa recusa, com a tag já carregada', async () => {
    const { loadGoogleTags, sendGtagEvent, sendAdsConversion } = await import('./gtag');
    loadGoogleTags();
    expect(sendGtagEvent('antes')).toBe(true);

    localStorage.setItem('kyro_cookie_consent', 'declined');
    vi.mocked(window.gtag!).mockClear();
    expect(sendGtagEvent('depois')).toBe(false);
    expect(sendAdsConversion({ label: 'AbC', value: 50 })).toBe(false);
    expect(window.gtag).not.toHaveBeenCalled();
  });

  it('também não envia antes de haver decisão nenhuma', async () => {
    localStorage.removeItem('kyro_cookie_consent');
    const { loadGoogleTags, sendGtagEvent } = await import('./gtag');
    loadGoogleTags();
    expect(sendGtagEvent('sem decisão')).toBe(false);
  });

  /** O modo de depuração abre a porta do ambiente. Nunca a do consentimento. */
  it('o modo de depuração não contorna o consentimento', async () => {
    localStorage.setItem('kyro_cookie_consent', 'declined');
    sessionStorage.setItem('kyro_tracking_debug', '1');
    const { loadGoogleTags, sendGtagEvent } = await import('./gtag');
    loadGoogleTags();
    expect(sendGtagEvent('depuração')).toBe(false);
  });
});

describe('sinais de consentimento', () => {
  it('produz os quatro sinais do Consent Mode v2, nunca um subconjunto', async () => {
    const { consentSignals } = await import('./gtag');
    expect(Object.keys(consentSignals(true)).sort()).toEqual(
      ['ad_personalization', 'ad_storage', 'ad_user_data', 'analytics_storage'],
    );
    expect(Object.values(consentSignals(false)).every(value => value === 'denied')).toBe(true);
  });

  /**
   * A regra explícita: aceitar análise **não** autoriza publicidade. Hoje o
   * banner pergunta as duas coisas numa frase só e as respostas coincidem
   * sempre, mas o caminho do código tem de as manter separadas — senão, no dia
   * em que o banner se dividir, ninguém se lembra de onde está o mapeamento.
   */
  it('análise concedida e publicidade negada não liga os sinais de publicidade', async () => {
    const { consentSignals } = await import('./gtag');
    expect(consentSignals({ analytics: true, ads: false, decidedAt: null })).toEqual({
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
  });

  it('com publicidade negada, uma conversão do Ads não sai mas um evento de análise sai', async () => {
    const { writeDecision } = await import('./consentStorage');
    writeDecision({ analytics: true, ads: false });
    const { loadGoogleTags, sendGtagEvent, sendAdsConversion } = await import('./gtag');
    loadGoogleTags();
    expect(sendGtagEvent('page_view', {}, 'analytics')).toBe(true);
    expect(sendGtagEvent('generate_lead', {}, 'ads')).toBe(false);
    expect(sendAdsConversion({ label: 'AbC', value: 10 })).toBe(false);
  });
});

/**
 * Modo avançado, em vigor desde 26/09/2026 (decisão do dono). A tag carrega
 * sem esperar pelo banner e os eventos saem com os quatro sinais negados: a
 * Google recebe pings sem cookies e usa-os para modelar conversões. O que
 * este bloco fixa é o que **não** pode mudar com isso: nenhum sinal passa a
 * `granted` sem a pessoa aceitar.
 */
describe('modo avançado (em vigor)', () => {
  beforeEach(() => { vi.stubEnv('VITE_CONSENT_MODE', ''); });

  it('é o modo por omissão', async () => {
    const { CONSENT_MODE } = await import('@/constants/tracking');
    expect(CONSENT_MODE).toBe('advanced');
  });

  it('envia sem decisão e depois de recusar, sem nunca conceder um sinal', async () => {
    localStorage.removeItem('kyro_cookie_consent');
    const { loadGoogleTags, sendGtagEvent, sendAdsConversion } = await import('./gtag');
    loadGoogleTags();
    expect(sendGtagEvent('page_view')).toBe(true);
    localStorage.setItem('kyro_cookie_consent', 'declined');
    expect(sendAdsConversion({ label: 'AbC', value: 50 })).toBe(true);
    const granted = vi.mocked(window.gtag!).mock.calls
      .filter(call => call[0] === 'consent')
      .some(call => Object.values(call[2] as Record<string, string>).includes('granted'));
    expect(granted).toBe(false);
  });
});
