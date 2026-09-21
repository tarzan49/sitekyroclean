import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { captureLeadAttribution, getAttributionSnapshot } from './leadAttribution';
import { __testing } from './enhancedConversions';

const at = (url: string) => vi.stubGlobal('location', new URL(url));

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  localStorage.setItem('kyro_cookie_consent', 'accepted');
  Object.defineProperty(document, 'referrer', { value: '', configurable: true });
});
afterEach(() => vi.unstubAllGlobals());

describe('atribuição de Google Ads', () => {
  it('lê gclid e todos os ValueTrack oficiais do URL de entrada', () => {
    at('https://cleansolutions.com.pt/limpeza-sofas-lisboa?gclid=Cj0ABC&utm_source=google&utm_medium=cpc'
      + '&campaignid=221&adgroupid=33&keyword=limpeza%20sofas&matchtype=e&creative=7788&device=m&network=g');
    const snapshot = getAttributionSnapshot()!;
    expect(snapshot).toMatchObject({
      gclid: 'Cj0ABC', last_source: 'google', last_medium: 'cpc',
      campaign_id: '221', ad_group_id: '33', keyword: 'limpeza sofas',
      match_type: 'e', creative_id: '7788', ads_device: 'm', network: 'g',
      landing_page: '/limpeza-sofas-lisboa', is_paid: true,
    });
  });

  /**
   * O auto-tagging do Google Ads está ligado por omissão e o "Final URL suffix"
   * pode estar vazio. Nesse estado só chega o `gclid`, e um lead assim continua
   * a ser tráfego pago — tratá-lo como direto perdia a campanha inteira.
   */
  it('reconhece tráfego pago só pelo gclid, sem UTMs nenhuns', () => {
    at('https://cleansolutions.com.pt/limpeza-sofas-lisboa?gclid=Cj0XYZ');
    expect(getAttributionSnapshot()).toMatchObject({ last_source: 'google', last_medium: 'cpc', is_paid: true });
  });

  it('reconhece gbraid e wbraid, que substituem o gclid em iOS e em apps', () => {
    at('https://cleansolutions.com.pt/?gbraid=GB1');
    expect(getAttributionSnapshot()).toMatchObject({ gbraid: 'GB1', is_paid: true });
    sessionStorage.clear();
    at('https://cleansolutions.com.pt/?wbraid=WB1');
    expect(getAttributionSnapshot()).toMatchObject({ wbraid: 'WB1', is_paid: true });
  });

  it('não marca tráfego orgânico como pago', () => {
    at('https://cleansolutions.com.pt/limpeza-sofas-porto');
    Object.defineProperty(document, 'referrer', { value: 'https://www.google.com/search', configurable: true });
    expect(getAttributionSnapshot()).toMatchObject({ last_source: 'google.com', last_medium: 'organic', is_paid: false });
  });

  it('trata uma visita sem referrer nem parâmetros como direta, sem inventar origem', () => {
    at('https://cleansolutions.com.pt/');
    expect(getAttributionSnapshot()).toMatchObject({ last_source: '(direct)', last_medium: '(none)', is_paid: false });
  });
});

describe('first touch e last touch', () => {
  /** A regra que dá sentido às duas colunas: a primeira visita não é reescrita. */
  it('mantém a primeira campanha e atualiza a última', () => {
    at('https://cleansolutions.com.pt/limpeza-sofas-lisboa?utm_source=google&utm_medium=cpc&utm_campaign=lancamento');
    getAttributionSnapshot();

    at('https://cleansolutions.com.pt/packs?utm_source=facebook&utm_medium=paid_social&utm_campaign=retargeting');
    const snapshot = getAttributionSnapshot()!;
    expect(snapshot.first_source).toBe('google');
    expect(snapshot.first_campaign).toBe('lancamento');
    expect(snapshot.first_landing_page).toBe('/limpeza-sofas-lisboa');
    expect(snapshot.last_source).toBe('facebook');
    expect(snapshot.last_campaign).toBe('retargeting');
  });

  /**
   * O caso que a atribuição existe para resolver: a pessoa entra por um
   * anúncio e só pede orçamento três páginas depois, num URL já sem parâmetros.
   */
  it('sobrevive à navegação interna e regista a página onde o pedido foi feito', () => {
    at('https://cleansolutions.com.pt/limpeza-sofas-lisboa?gclid=Cj0ABC&campaignid=221');
    captureLeadAttribution();
    at('https://cleansolutions.com.pt/precos');
    captureLeadAttribution();
    at('https://cleansolutions.com.pt/obrigado');
    const snapshot = getAttributionSnapshot()!;
    expect(snapshot.gclid).toBe('Cj0ABC');
    expect(snapshot.campaign_id).toBe('221');
    expect(snapshot.landing_page).toBe('/limpeza-sofas-lisboa');
    expect(snapshot.conversion_page).toBe('/obrigado');
  });

  it('não guarda nem devolve nada sem consentimento', () => {
    at('https://cleansolutions.com.pt/?gclid=Cj0ABC');
    localStorage.setItem('kyro_cookie_consent', 'declined');
    expect(getAttributionSnapshot()).toBeNull();
    expect(sessionStorage.length).toBe(0);
    expect(localStorage.getItem('kyro_first_touch_v1')).toBeNull();
  });

  /** Nada de pessoal entra na atribuição, venha o que vier no URL. */
  it('ignora parâmetros que não sejam de campanha', () => {
    at('https://cleansolutions.com.pt/?gclid=Cj0&email=alguem@exemplo.pt&phone=912345678');
    const snapshot = getAttributionSnapshot()!;
    expect(JSON.stringify(snapshot)).not.toContain('alguem@exemplo.pt');
    expect(JSON.stringify(snapshot)).not.toContain('912345678');
  });
});

describe('normalização para enhanced conversions', () => {
  it('normaliza email para minúsculas e rejeita o que não é email', () => {
    expect(__testing.normalizeEmail('  Alguem@Exemplo.PT ')).toBe('alguem@exemplo.pt');
    expect(__testing.normalizeEmail('nao-e-email')).toBeNull();
  });

  /**
   * Um indicativo errado produz um hash válido de um número que não existe.
   * Não dá erro em lado nenhum — só nunca corresponde a ninguém.
   */
  it('põe números portugueses em E.164 e descarta o que não consegue resolver', () => {
    expect(__testing.normalizePhone('912 345 678')).toBe('+351912345678');
    expect(__testing.normalizePhone('+351 912345678')).toBe('+351912345678');
    expect(__testing.normalizePhone('00351912345678')).toBe('+351912345678');
    expect(__testing.normalizePhone('220123456')).toBe('+351220123456');
    expect(__testing.normalizePhone('12345')).toBeNull();
    expect(__testing.normalizePhone('não é um número')).toBeNull();
  });
});

describe('janela de 30 minutos do last touch', () => {
  /**
   * A regra, escrita para poder ser verificada: o last touch expira ao fim de
   * 30 minutos de inatividade. Um regresso **direto** depois disso perde a
   * campanha — não fica a apontar para um anúncio que já não foi o motivo da
   * visita. O first touch, esse, sobrevive 90 dias.
   */
  it('um regresso direto depois de 30 minutos perde a campanha e mantém a primeira visita', () => {
    at('https://cleansolutions.com.pt/limpeza-sofas-lisboa?gclid=Cj0ABC&utm_campaign=lancamento');
    const inicial = getAttributionSnapshot()!;
    expect(inicial.gclid).toBe('Cj0ABC');

    // Envelhecer a sessão em 31 minutos, sem mexer no first touch.
    const guardado = JSON.parse(sessionStorage.getItem('kyro_lead_attribution_v1')!);
    guardado.captured_at = Date.now() - 31 * 60000;
    sessionStorage.setItem('kyro_lead_attribution_v1', JSON.stringify(guardado));

    at('https://cleansolutions.com.pt/precos');
    const depois = getAttributionSnapshot()!;
    expect(depois.gclid).toBeUndefined();
    expect(depois.last_source).toBe('(direct)');
    // Mas a primeira visita continua a creditar a campanha.
    expect(depois.first_source).toBe('google');
    expect(depois.first_campaign).toBe('lancamento');
    expect(depois.first_landing_page).toBe('/limpeza-sofas-lisboa');
  });

  it('dentro dos 30 minutos a campanha sobrevive à navegação interna', () => {
    at('https://cleansolutions.com.pt/limpeza-sofas-lisboa?gclid=Cj0ABC');
    getAttributionSnapshot();
    at('https://cleansolutions.com.pt/precos');
    expect(getAttributionSnapshot()!.gclid).toBe('Cj0ABC');
  });

  /** Uma campanha nova substitui a anterior mesmo dentro da janela. */
  it('uma entrada etiquetada nova substitui o last touch e não o first', () => {
    at('https://cleansolutions.com.pt/a?utm_source=google&utm_medium=cpc&utm_campaign=um');
    getAttributionSnapshot();
    at('https://cleansolutions.com.pt/b?utm_source=bing&utm_medium=cpc&utm_campaign=dois');
    const depois = getAttributionSnapshot()!;
    expect(depois.last_source).toBe('bing');
    expect(depois.last_campaign).toBe('dois');
    expect(depois.first_source).toBe('google');
    expect(depois.first_campaign).toBe('um');
  });
});

describe('Meta', () => {
  it('preserva campanha/conjunto/anúncio e não declara uma partilha orgânica como paga', () => {
    at('https://cleansolutions.com.pt/?fbclid=organic');
    expect(getAttributionSnapshot()).toMatchObject({last_source:'facebook',last_medium:'social',is_paid:false,fbclid:'organic'});
    at('https://cleansolutions.com.pt/?utm_source=ig&utm_medium=paid_social&utm_campaign=Sofas&meta_campaign_id=111&meta_adset_id=222&meta_ad_id=333&meta_placement=feed');
    expect(getAttributionSnapshot()).toMatchObject({last_source:'ig',is_paid:true,meta_campaign_id:'111',meta_adset_id:'222',meta_ad_id:'333',meta_placement:'feed',attribution_method:'website'});
  });
});


it('preserva o sufixo UTM efetivamente configurado na campanha Google', () => {
  at('https://cleansolutions.com.pt/limpeza-sofas-lisboa?ads=1&utm_source=google&utm_medium=cpc&utm_campaign=lisboa_sofas&utm_id=2426&utm_content=123&utm_term=limpeza%20sofas');
  expect(getAttributionSnapshot()).toMatchObject({campaign_id:'2426',creative_id:'123',keyword:'limpeza sofas',last_campaign:'lisboa_sofas',is_paid:true});
});
it('não interpreta UTM de um anúncio Meta como identificador Google', () => {
  at('https://cleansolutions.com.pt/?utm_source=facebook&utm_medium=paid_social&utm_id=meta&utm_content=video&utm_term=audience');
  const a=getAttributionSnapshot()!;
  expect(a.campaign_id).toBeUndefined(); expect(a.creative_id).toBeUndefined(); expect(a.keyword).toBeUndefined();
});
