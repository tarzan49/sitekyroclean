import { describe, expect, it } from 'vitest';
import { getLandingFaqRoutes } from '../../scripts/landing-faq-routes';
import { renderLandingPageHtml, escapeLandingHtml } from '../../scripts/landing-page-html';
import { getLandingPageModel } from './landingPageModel';
import { getAllKeywordVariantRoutes, getKeywordVariantData } from './keywordVariantData';
import { locationPrices } from '../constants/travel';

describe('final landing SEO regression coverage', () => {
  it('preserves explicit municipality context for every keyword route', () => {
    for (const route of getAllKeywordVariantRoutes()) {
      const data = getKeywordVariantData(route.variantKey, route.serviceKey, route.locationPart)!;
      const model = getLandingPageModel(route.path)!;
      expect(data.municipality).toBe(model.municipalityName);
      expect(locationPrices[data.municipality]).toBeDefined();
    }
  });
  it('keeps unambiguous headings, useful editorial copy and audited trust text in all initial pages', () => {
    const headings = new Set<string>();
    for (const route of getLandingFaqRoutes()) {
      const model = getLandingPageModel(route.path)!;
      expect(headings.has(model.h1), route.path).toBe(false);
      headings.add(model.h1);
      expect(model.editorialIntro).toContain(model.locationName);
      expect(model.editorialIntro).not.toBe(model.intro);
      expect(model.editorialIntro.length).toBeLessThan(600);
      const html = renderLandingPageHtml(model);
      expect(html).toContain(escapeLandingHtml(model.editorialIntro));
      expect(model.faqs).toHaveLength(4);
      expect(model.trustPoints).toHaveLength(3);
      for (const point of model.trustPoints) {
        expect(html).toContain(escapeLandingHtml(point.desc));
        expect(JSON.stringify(point)).not.toMatch(/70%|90%|85%|30 segundos|18 meses|2 kg|kg\/m²|[0-9]×|nunca mais temer|aplica-se a tudo|desconto de pack incluído|como novos|recuperam.*tonalidade|do cadeira|seu cadeira/);
      }
      if (['Aveiro', 'Coimbra'].includes(model.municipalityName)) expect(model.editorialIntro).toContain('Disponibilidade sob consulta.');
    }
  });
  it('uses well-distributed images without changing them on reload, tracking parameters or anchors', () => {
    const usage = new Map<string, number>();
    const combinations = new Map<string, Set<string>>();
    for (const route of getLandingFaqRoutes()) {
      const model = getLandingPageModel(route.path)!;
      const set = combinations.get(model.serviceSlug) ?? new Set<string>();
      set.add(model.problems.map(p => p.image!.id).join('|'));
      combinations.set(model.serviceSlug, set);
      for (const problem of model.problems) usage.set(problem.image!.id, (usage.get(problem.image!.id) ?? 0) + 1);
      expect(getLandingPageModel(route.path + '?utm_medium=cpc#problemas')!.problems).toEqual(model.problems);
    }
    expect(usage.size).toBe(240);
    // Statistical regression guard for the current 2,152-page inventory, not a ranking target.
    for (const [id, count] of usage) { expect(count, id).toBeGreaterThan(140); expect(count, id).toBeLessThan(300); }
    for (const set of combinations.values()) expect(set.size).toBeGreaterThan(1750);
  });
});
