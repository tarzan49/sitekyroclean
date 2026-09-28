import { afterEach, describe, expect, it } from 'vitest';
import { WHATSAPP_BASE } from '@/constants/business';
import { buildGeneralWaMessage, buildServiceWaMessage, buildSubmittedWaMessage } from './whatsappMessages';
import { ADS_WHATSAPP_MARK, FACEBOOK_ADS_WHATSAPP_MARK, INSTAGRAM_ADS_WHATSAPP_MARK, adsWhatsAppMark, initAdsWhatsAppMessage, pageWhatsAppText, isGoogleAdsVisit, markAdsWhatsAppHref, markAdsWhatsAppText } from './adsWhatsAppMessage';

const waHref = (text: string) => `${WHATSAPP_BASE}?text=${encodeURIComponent(text)}`;
const textOf = (href: string) => new URL(href).searchParams.get('text');

// O sufixo de URL final da conta, tal como o Google Ads o resolve.
const AD_ENTRY = '?ads=1&utm_source=google&utm_medium=cpc&utm_campaign=24275823960&gclid=test';

describe('isGoogleAdsVisit', () => {
  it('recognises the Google Ads entry and nothing else', () => {
    expect(isGoogleAdsVisit(AD_ENTRY)).toBe(true);
    for (const search of ['?gclid=x', '?gbraid=x', '?wbraid=x', '?utm_source=google&utm_medium=cpc', '?utm_source=google&ads=1']) {
      expect(isGoogleAdsVisit(search)).toBe(true);
    }
    // Orgânico, direto, outra rede paga, ou o `ads=1` sozinho de um teste à mão.
    for (const search of ['', '?utm_source=google&utm_medium=organic', '?utm_source=facebook&utm_medium=cpc', '?fbclid=x', '?ads=1']) {
      expect(isGoogleAdsVisit(search)).toBe(false);
    }
  });
});

describe('markAdsWhatsAppText', () => {
  it('turns the landing page opening into a natural sentence', () => {
    expect(markAdsWhatsAppText(buildServiceWaMessage('limpeza-sofas', 'Lisboa')))
      .toBe('Olá! Vi o vosso anúncio no Google e gostaria de saber o preço e a disponibilidade para limpar o meu sofá em Lisboa.\n\nÉ um sofá de ');
  });

  it('puts the mark in front of every other Portuguese opening', () => {
    expect(markAdsWhatsAppText('Olá! Tenho um sofá de pele para limpar.')).toBe(`Olá! ${ADS_WHATSAPP_MARK}. Tenho um sofá de pele para limpar.`);
    expect(markAdsWhatsAppText('Olá, tenho cadeiras de um tipo diferente.')).toBe(`Olá! ${ADS_WHATSAPP_MARK}. Tenho cadeiras de um tipo diferente.`);
    expect(markAdsWhatsAppText(buildSubmittedWaMessage('ABC123'))).toMatch(/^Olá! Vi o vosso anúncio no Google\. Acabei de enviar o pedido #ABC123\./);
    expect(markAdsWhatsAppText('')).toBe(`Olá! ${ADS_WHATSAPP_MARK}.`);
  });

  it('is idempotent and leaves other languages alone', () => {
    const once = markAdsWhatsAppText(buildGeneralWaMessage());
    expect(markAdsWhatsAppText(once)).toBe(once);
    expect(markAdsWhatsAppText(buildGeneralWaMessage(true))).toBe(buildGeneralWaMessage(true));
  });
});

describe('markAdsWhatsAppHref', () => {
  it('rewrites only the text of links to the business number, with %20 spaces', () => {
    const marked = markAdsWhatsAppHref(waHref('Olá! Gostaria de saber o preço.'));
    expect(marked.startsWith(`${WHATSAPP_BASE}?text=`)).toBe(true);
    expect(marked).not.toContain('+');
    expect(textOf(marked)).toBe(`Olá! ${ADS_WHATSAPP_MARK} e gostaria de saber o preço.`);
    expect(textOf(markAdsWhatsAppHref(WHATSAPP_BASE))).toBe(`Olá! ${ADS_WHATSAPP_MARK}.`);
  });

  it('never touches other numbers, other sites or phone links', () => {
    for (const href of ['https://wa.me/351912345678?text=Ol%C3%A1%20Ana', 'https://cleansolutions.com.pt/limpeza-sofas', 'tel:+351925530647', 'not a url']) {
      expect(markAdsWhatsAppHref(href)).toBe(href);
    }
  });
});

describe('initAdsWhatsAppMessage', () => {
  let cleanup: (() => void) | undefined;
  afterEach(() => { cleanup?.(); cleanup = undefined; document.body.innerHTML = ''; });

  const clickLink = (href: string) => {
    document.body.innerHTML = `<a href="${href}" target="_blank"><span>WhatsApp</span></a>`;
    const link = document.querySelector('a')!;
    // O alvo é o `<span>` de dentro, como num clique real no ícone ou no texto.
    link.querySelector('span')!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return link;
  };

  it('marks the link before the browser follows it on a Google Ads visit', () => {
    cleanup = initAdsWhatsAppMessage(AD_ENTRY);
    const link = clickLink(waHref(buildServiceWaMessage('limpeza-sofas', 'Porto')));
    expect(textOf(link.href)).toMatch(/^Olá! Vi o vosso anúncio no Google e gostaria/);
    // Segundo clique na mesma âncora: não duplica a frase.
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(textOf(link.href)!.split(ADS_WHATSAPP_MARK)).toHaveLength(2);
  });

  // A página de um anúncio: cabeçalho e barra fixa genéricos, hero com serviço e cidade.
  const adLandingPage = (hero: string) => {
    document.body.innerHTML = `
      <header><a target="_blank" id="header" href="${waHref(buildGeneralWaMessage())}">WhatsApp</a></header>
      <main><a target="_blank" id="hero" href="${waHref(hero)}">Pedir orçamento</a></main>
      <div><a target="_blank" id="sticky" data-tracking-source="sticky_bar" href="${waHref(buildGeneralWaMessage())}"><span>WhatsApp</span></a></div>`;
    return (id: string) => {
      const link = document.getElementById(id) as HTMLAnchorElement;
      (link.querySelector('span') ?? link).dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      return textOf(link.href);
    };
  };

  it('gives the sticky bar and the header the service and city of the page', () => {
    cleanup = initAdsWhatsAppMessage(AD_ENTRY);
    const click = adLandingPage(buildServiceWaMessage('impermeabilizacao', 'Porto'));
    const expected = markAdsWhatsAppText(buildServiceWaMessage('impermeabilizacao', 'Porto'));
    expect(click('sticky')).toBe(expected);
    expect(click('header')).toBe(expected);
    expect(expected).toContain('impermeabilizar o meu sofá no Porto');
  });

  it('still finds the page message after the hero was clicked, and on a second click', () => {
    cleanup = initAdsWhatsAppMessage(AD_ENTRY);
    const click = adLandingPage(buildServiceWaMessage('limpeza-sofas', 'Lisboa'));
    const expected = markAdsWhatsAppText(buildServiceWaMessage('limpeza-sofas', 'Lisboa'));
    expect(click('hero')).toBe(expected);
    expect(click('sticky')).toBe(expected);
    expect(click('sticky')).toBe(expected);
  });

  it('keeps the general message on a page without its own, and never swaps it on organic visits', () => {
    cleanup = initAdsWhatsAppMessage(AD_ENTRY);
    document.body.innerHTML = `<a href="${waHref(buildGeneralWaMessage())}">WhatsApp</a>`;
    expect(pageWhatsAppText()).toBeNull();
    cleanup();
    cleanup = initAdsWhatsAppMessage('');
    const click = adLandingPage(buildServiceWaMessage('limpeza-sofas', 'Lisboa'));
    expect(click('sticky')).toBe(buildGeneralWaMessage());
  });

  it('does nothing on an organic visit', () => {
    cleanup = initAdsWhatsAppMessage('?utm_source=google&utm_medium=organic');
    const href = waHref(buildServiceWaMessage('limpeza-sofas', 'Porto'));
    expect(clickLink(href).href).toBe(href);
  });
});

// Os parâmetros de URL da campanha da Meta (`META_URL_PARAMETERS`), já resolvidos.
const metaEntry = (source: string) => `?utm_source=${source}&utm_medium=paid_social&utm_campaign=Sofas%20Porto&meta_campaign_id=1&meta_adset_id=2&meta_ad_id=3&fbclid=x`;

describe('adsWhatsAppMark (Meta)', () => {
  it('names Instagram or Facebook from the placement source', () => {
    expect(adsWhatsAppMark(metaEntry('ig'))).toBe(INSTAGRAM_ADS_WHATSAPP_MARK);
    for (const source of ['fb', 'msg', 'an']) expect(adsWhatsAppMark(metaEntry(source))).toBe(FACEBOOK_ADS_WHATSAPP_MARK);
    expect(adsWhatsAppMark('?utm_source=facebook&utm_medium=paid_social')).toBe(FACEBOOK_ADS_WHATSAPP_MARK);
    expect(adsWhatsAppMark(AD_ENTRY)).toBe(ADS_WHATSAPP_MARK);
  });

  it('does not mark an organic Facebook share or a Google visit as Meta', () => {
    expect(adsWhatsAppMark('?fbclid=abc')).toBeNull();
    expect(adsWhatsAppMark('?utm_source=facebook&utm_medium=social')).toBeNull();
    expect(adsWhatsAppMark('')).toBeNull();
  });

  it('marks the page message on a Meta ad visit, with the same rules as Google', () => {
    const cleanup = initAdsWhatsAppMessage(metaEntry('ig'));
    try {
      document.body.innerHTML = `
        <main><a id="hero" href="${waHref(buildServiceWaMessage('limpeza-sofas', 'Porto'))}">Pedir</a></main>
        <a id="sticky" href="${waHref(buildGeneralWaMessage())}"><span>WhatsApp</span></a>`;
      const sticky = document.getElementById('sticky') as HTMLAnchorElement;
      sticky.querySelector('span')!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      const expected = markAdsWhatsAppText(buildServiceWaMessage('limpeza-sofas', 'Porto'), INSTAGRAM_ADS_WHATSAPP_MARK);
      expect(textOf(sticky.href)).toBe(expected);
      expect(expected).toMatch(/^Olá! Vi o vosso anúncio no Instagram e gostaria/);
      expect(expected).not.toContain('Google');
    } finally {
      cleanup();
      document.body.innerHTML = '';
    }
  });
});
