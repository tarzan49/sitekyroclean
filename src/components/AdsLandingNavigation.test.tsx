import { describe, expect, it } from 'vitest';
import { isAdsVisit } from './AdsLandingNavigation';
import { getKeywordVariantData } from '../data/keywordVariantData';
import { getLocationServiceData } from '../data/locationSeoData';

describe('ads landing entry and sofa information', () => {
  it('keeps ordinary visits separate and accepts explicit ad entry parameters', () => {
    expect(isAdsVisit('')).toBe(false);
    expect(isAdsVisit('?utm_medium=organic')).toBe(false);
    for (const search of ['?ads=1', '?gclid=test', '?wbraid=test', '?gbraid=test', '?utm_medium=cpc']) expect(isAdsVisit(search)).toBe(true);
  });
  it('uses consistent drying information and explicit pricing conditions in both cities', () => {
    for (const city of ['porto', 'lisboa']) {
      const hygiene = getKeywordVariantData('higienizacao', 'sofa', city)!;
      expect(hygiene.faqs[0].answer).toContain('4 a 6 horas');
      expect(JSON.stringify(hygiene)).not.toMatch(/99%|100%|sanitização certificada|2 a 4 horas/);
      const cleaning = getLocationServiceData('limpeza-sofas', city)!;
      expect(cleaning.faqs[0].answer).toContain('deslocação é cobrada à parte');
      expect(cleaning.faqs[1].answer).toContain('4 a 6 horas');
    }
  });
});
