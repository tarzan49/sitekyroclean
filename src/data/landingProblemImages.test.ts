import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { SOFA_PROBLEM_IMAGES, selectLandingProblemImage } from './landingProblemImages';
import { getLandingPageModel } from './landingPageModel';
import { getLandingFaqRoutes } from '../../scripts/landing-faq-routes';
import { renderLandingPageHtml } from '../../scripts/landing-page-html';

describe('public sofa problem image selection', () => {
  it('keeps twenty real team photos of dirty sofas, with unique descriptions', () => {
    expect(SOFA_PROBLEM_IMAGES).toHaveLength(SOFA_PROBLEM_IMAGES.length);
    expect(new Set(SOFA_PROBLEM_IMAGES.map(image => image.alt)).size).toBe(SOFA_PROBLEM_IMAGES.length);
    for (const image of SOFA_PROBLEM_IMAGES) expect(existsSync(`public${image.src}`)).toBe(true);
  });
  it('selects only relevant images on all sofa routes, with identical initial HTML and full pool coverage', () => {
    const used = new Set<string>();
    const families = new Set<string>();
    let pages = 0;
    for (const record of getLandingFaqRoutes()) {
      if (record.context.serviceSlug !== 'limpeza-sofas') continue;
      const model = getLandingPageModel(record.path)!;
      families.add(model.family);
      pages++;
      expect(model.problems).toHaveLength(4);
      const html = renderLandingPageHtml(model);
      for (const card of model.problems) {
        expect(card.image?.problemId).toBe(card.id);
        expect(existsSync(`public${card.image!.src}`)).toBe(true);
        expect(html).toContain(`src="${card.image!.src}"`);
        expect(selectLandingProblemImage('limpeza-sofas', card.id, `${record.path}/?ads=1#problemas`)).toEqual(card.image);
        used.add(card.image!.id);
      }
      expect((html.match(/<figcaption>Imagem ilustrativa<\/figcaption>/g) || []).length).toBe(model.problems.filter(p => p.image!.alt.startsWith('Imagem ilustrativa')).length);
    }
    expect(pages).toBe(2736);
    expect(families.size).toBe(4);
    expect(used.size).toBe(SOFA_PROBLEM_IMAGES.length);
  });
  it('does not introduce sofa images on other services or standalone page families', () => {
    expect(selectLandingProblemImage('limpeza-colchoes', 'limpeza-sofas-1', '/example')).toBeUndefined();
    expect(selectLandingProblemImage('limpeza-sofas', 'unknown', '/example')).toBeUndefined();
    expect(getLandingPageModel('/impermeabilizacao-sofa-lisboa')!.problems.every(p => p.image?.src.startsWith('/images/landing-problems/impermeabilizacao/'))).toBe(true);
    expect(getLandingPageModel('/problemas/manchas-sofa')).toBeNull();
  });
});
