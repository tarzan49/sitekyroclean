import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { AdsLandingHeader, isAdsVisit } from './AdsLandingNavigation';
import { getKeywordVariantData } from '../data/keywordVariantData';
import { getLocationServiceData } from '../data/locationSeoData';
import { getLandingFaqPool } from '../data/landingFaqPool';

describe('ads landing entry and sofa information', () => {
  it('keeps ordinary visits separate and accepts explicit ad entry parameters', () => {
    expect(isAdsVisit('')).toBe(false);
    expect(isAdsVisit('?utm_medium=organic')).toBe(false);
    for (const search of ['?ads=1', '?gclid=test', '?wbraid=test', '?gbraid=test', '?utm_medium=cpc']) expect(isAdsVisit(search)).toBe(true);
  });
  it('uses consistent drying information and explicit pricing conditions in both cities', () => {
    // FAQs now vary by intent and URL; policy must not depend on a fixed FAQ index.
    expect(getLandingFaqPool('limpeza-sofas').find(faq => faq.id === 'sofa-secagem')?.answer).toContain('2 a 5 horas');
    for (const city of ['porto', 'lisboa']) {
      const hygiene = getKeywordVariantData('higienizacao', 'sofa', city)!;
      expect(hygiene.faqs).toHaveLength(4);
      expect(JSON.stringify(hygiene)).not.toMatch(/99%|100%|sanitização certificada|2 a 4 horas/);
      const cleaning = getLocationServiceData('limpeza-sofas', city)!;
      expect(cleaning.localSection).toContain('taxa de deslocação de 10€');
      expect(cleaning.faqs).toHaveLength(4);
    }
  });
  it('gives the ads header a WhatsApp link with the page message and its own tracking source', () => {
    const href = 'https://wa.me/351925530647?text=Ol%C3%A1';
    const { container } = render(<AdsLandingHeader whatsappHref={href} />);
    const link = container.querySelector('a[data-tracking-source="header_ads"]')!;
    expect(link.getAttribute('href')).toBe(href);
    expect(link.getAttribute('aria-label')).toBe('Pedir orçamento por WhatsApp');
  });
});
