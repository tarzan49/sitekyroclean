import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { RUG_PROBLEM_IMAGES } from './rugProblemImages';
import { selectLandingProblemImage } from './landingProblemImages';
import { getLandingPageModel } from './landingPageModel';
import { getLandingFaqRoutes } from '../../scripts/landing-faq-routes';
import { renderLandingPageHtml } from '../../scripts/landing-page-html';

describe('rug problem image library', () => {
  it('keeps distinct, documented images: real team photos where they exist, illustrative where not (dono, 24 Nov)', () => {
    expect(new Set(RUG_PROBLEM_IMAGES.map(image => image.id)).size).toBe(RUG_PROBLEM_IMAGES.length);
    expect(new Set(RUG_PROBLEM_IMAGES.map(image => image.alt)).size).toBe(RUG_PROBLEM_IMAGES.length);
    for (const image of RUG_PROBLEM_IMAGES) expect(existsSync(`public${image.src}`)).toBe(true);
  });
  it('covers every rug route with stable selections and matching initial HTML', () => {
    const used = new Set<string>();
    const families = new Set<string>();
    const routes = getLandingFaqRoutes().filter(record => record.context.serviceSlug === 'limpeza-tapetes');
    expect(routes).toHaveLength(2736);
    for (const record of routes) {
      const model = getLandingPageModel(record.path)!;
      families.add(model.family);
      const html = renderLandingPageHtml(model);
      expect(model.problems).toHaveLength(4);
      expect(model.faqs).toHaveLength(4);
      for (const problem of model.problems) {
        expect(problem.image?.problemId).toBe(problem.id);
        expect(problem.image?.src).toMatch(/^\/images\/landing-problems\/tapetes\//);
        expect(html).toContain(`src="${problem.image!.src}"`);
        expect(selectLandingProblemImage('limpeza-tapetes', problem.id, `${record.path}/?utm_medium=cpc#problemas`)).toEqual(problem.image);
        used.add(problem.image!.id);
      }
      expect((html.match(/<figcaption>Imagem ilustrativa<\/figcaption>/g) || []).length).toBe(model.problems.filter(p => p.image!.alt.startsWith('Imagem ilustrativa')).length);
    }
    expect(families.size).toBe(4);
    expect(used.size).toBe(RUG_PROBLEM_IMAGES.length);
  });
  it('does not mix services, problem groups or standalone families', () => {
    expect(selectLandingProblemImage('limpeza-sofas', 'limpeza-tapetes-1', '/example')).toBeUndefined();
    expect(selectLandingProblemImage('limpeza-tapetes', 'limpeza-sofas-1', '/example')).toBeUndefined();
    expect(selectLandingProblemImage('limpeza-tapetes', 'unknown', '/example')).toBeUndefined();
    expect(selectLandingProblemImage('limpeza-cadeiras', 'limpeza-tapetes-1', '/example')).toBeUndefined();
    expect(getLandingPageModel('/problemas/manchas-tapete')).toBeNull();
  });
});
