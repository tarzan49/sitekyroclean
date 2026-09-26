import { describe, expect, it } from 'vitest';
import { getLandingFaqRoutes } from '../../scripts/landing-faq-routes';
import { escapeLandingHtml, renderLandingPageHtml } from '../../scripts/landing-page-html';
import { getLandingPageModel } from './landingPageModel';
import { LANDING_SECTION_ORDER } from './landingServiceCopy';
import { PROBLEM_IMAGES } from '../constants/problemCardHelpers';
import { locationPrices } from '../constants/travel';

describe('shared landing composition', () => {
  it('covers all four families with the right service, four problems and the original four FAQs', () => {
    const records = getLandingFaqRoutes();
    expect(records).toHaveLength(13734);
    for (const record of records) {
      const model = getLandingPageModel(record.path);
      expect(model, record.path).not.toBeNull();
      expect(model!.family, record.path).toBe(record.context.family);
      expect(model!.serviceSlug, record.path).toBe(record.context.serviceSlug);
      expect(model!.municipalityName, record.path).toBe(record.context.municipality);
      expect(model!.faqs, record.path).toEqual(record.faqs);
      expect(model!.problems).toHaveLength(4);
      expect(model!.problems.map(problem => problem.imageIndex)).toEqual([0, 1, 2, 3]);
      expect(model!.problems.every(problem => PROBLEM_IMAGES[model!.serviceSlug][problem.imageIndex])).toBe(true);
      expect(model!.processSteps).toHaveLength(5);
      expect(model!.reviews.length).toBeGreaterThan(0);
      expect(model!.directory.length).toBeGreaterThan(0);
      expect(model!.packLinks.length).toBeGreaterThan(0);
      const fee = locationPrices[model!.municipalityName];
      if (fee !== undefined) expect(model!.pricingDescription).toContain(`+${fee}€`);
    }
  });
  it('emits the same seven sections and service-specific content without JavaScript', () => {
    for (const route of ['/limpeza-sofas-lisboa', '/limpeza-alcatifas-porto-paranhos', '/preco-limpeza-tapetes-lisboa', '/impermeabilizacao-cadeiras-porto']) {
      const model = getLandingPageModel(route)!;
      const html = renderLandingPageHtml(model);
      expect([...html.matchAll(/data-landing-section="([^"]+)"/g)].map(match => match[1])).toEqual(LANDING_SECTION_ORDER);
      for (const item of [...model.problems, ...model.processSteps]) expect(html).toContain(escapeLandingHtml(item.description));
      for (const faq of model.faqs) expect(html).toContain(escapeLandingHtml(faq.answer));
    }
  });
  it('does not capture materials, problems, brands, base pages or invalid locations', () => {
    for (const route of ['/limpeza-sofas', '/limpeza-sofa-veludo-lisboa', '/manchas-sofa-lisboa', '/limpeza-sofa-ikea-porto', '/preco-limpeza-sofas-porto-paranhos', '/limpeza-sofas-inexistente', '/impermeabilizacao-tapetes-lisboa']) expect(getLandingPageModel(route), route).toBeNull();
  });
  it('keeps a stable selection with advertising parameters and separates alcatifas from tapetes', () => {
    expect(getLandingPageModel('/higienizacao-sofa-porto-paranhos?ads=1')).toEqual(getLandingPageModel('/higienizacao-sofa-porto-paranhos'));
    expect(getLandingPageModel('/preco-limpeza-alcatifas-lisboa')!.problems).not.toEqual(getLandingPageModel('/preco-limpeza-tapetes-lisboa')!.problems);
    expect(getLandingPageModel('/impermeabilizacao-cadeiras-porto')!.priceHeading).toContain('impermeabilizar cadeiras');
  });
});
