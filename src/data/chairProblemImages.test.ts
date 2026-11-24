import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { CHAIR_PROBLEM_IMAGES } from './chairProblemImages';
import { selectLandingProblemImage } from './landingProblemImages';
import { getLandingPageModel } from './landingPageModel';
import { getLandingFaqRoutes } from '../../scripts/landing-faq-routes';
import { renderLandingPageHtml } from '../../scripts/landing-page-html';

describe('chair problem image library', () => {
  it('keeps forty distinct, documented images and ten relevant choices per problem', () => {
    expect(CHAIR_PROBLEM_IMAGES).toHaveLength(17);
    expect(new Set(CHAIR_PROBLEM_IMAGES.map(image => image.id)).size).toBe(17);
    expect(new Set(CHAIR_PROBLEM_IMAGES.map(image => image.alt)).size).toBe(17);
    for (let index = 1; index <= 4; index++) {
      expect(CHAIR_PROBLEM_IMAGES.filter(image => image.problemId === `limpeza-cadeiras-${index}`).length).toBeGreaterThanOrEqual(3);
    }
    for (const image of CHAIR_PROBLEM_IMAGES) {
      expect(existsSync(`public${image.src}`)).toBe(true);
    }
  });
  it('covers every chair route with stable selections and matching initial HTML', () => {
    const used = new Set<string>();
    const families = new Set<string>();
    const routes = getLandingFaqRoutes().filter(record => record.context.serviceSlug === 'limpeza-cadeiras');
    expect(routes).toHaveLength(2736);
    for (const record of routes) {
      const model = getLandingPageModel(record.path)!;
      families.add(model.family);
      const html = renderLandingPageHtml(model);
      expect(model.problems).toHaveLength(4);
      expect(model.faqs).toHaveLength(4);
      for (const problem of model.problems) {
        expect(problem.image?.problemId).toBe(problem.id);
        expect(problem.image?.src).toMatch(/^\/images\/landing-problems\/cadeiras\//);
        expect(html).toContain(`src="${problem.image!.src}"`);
        expect(selectLandingProblemImage('limpeza-cadeiras', problem.id, `${record.path}/?utm_medium=cpc#problemas`)).toEqual(problem.image);
        used.add(problem.image!.id);
      }
      expect((html.match(/<figcaption>Imagem ilustrativa<\/figcaption>/g) || []).length).toBe(0);
    }
    expect(families.size).toBe(4);
    expect(used.size).toBe(17);
  });
  it('does not mix services, problem groups or standalone families', () => {
    expect(selectLandingProblemImage('limpeza-sofas', 'limpeza-cadeiras-1', '/example')).toBeUndefined();
    expect(selectLandingProblemImage('limpeza-cadeiras', 'limpeza-sofas-1', '/example')).toBeUndefined();
    expect(selectLandingProblemImage('limpeza-cadeiras', 'unknown', '/example')).toBeUndefined();
    expect(selectLandingProblemImage('limpeza-alcatifas', 'limpeza-cadeiras-1', '/example')).toBeUndefined();
    expect(getLandingPageModel('/problemas/cadeira-manchada')).toBeNull();
  });
});
