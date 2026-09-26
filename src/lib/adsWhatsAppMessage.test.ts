import { afterEach, describe, expect, it } from 'vitest';
import { WHATSAPP_BASE } from '@/constants/business';
import { buildGeneralWaMessage, buildServiceWaMessage, buildSubmittedWaMessage } from './whatsappMessages';
import { ADS_WHATSAPP_MARK, initAdsWhatsAppMessage, isGoogleAdsVisit, markAdsWhatsAppHref, markAdsWhatsAppText } from './adsWhatsAppMessage';

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
      .toBe('Olá! Vi o vosso anúncio no Google e gostaria de saber o preço e a próxima disponibilidade para limpar o meu sofá em Lisboa. Posso enviar fotografias e indicar a minha localidade para confirmarem o orçamento.');
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

  it('does nothing on an organic visit', () => {
    cleanup = initAdsWhatsAppMessage('?utm_source=google&utm_medium=organic');
    const href = waHref(buildServiceWaMessage('limpeza-sofas', 'Porto'));
    expect(clickLink(href).href).toBe(href);
  });
});
