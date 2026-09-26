import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { WATERPROOFING_PROBLEM_IMAGES } from './waterproofingProblemImages';
import { selectLandingProblemImage } from './landingProblemImages';
import { getLandingPageModel } from './landingPageModel';
import { getLandingFaqRoutes } from '../../scripts/landing-faq-routes';
import { renderLandingPageHtml } from '../../scripts/landing-page-html';

describe('waterproofing problem image library', () => {
  it('keeps forty distinct, documented images and ten relevant choices per problem', () => {
    const prompts = JSON.parse(readFileSync('docs/waterproofing-image-library/prompts.json', 'utf8'));
    expect(WATERPROOFING_PROBLEM_IMAGES).toHaveLength(40);
    expect(new Set(WATERPROOFING_PROBLEM_IMAGES.map(image => image.id)).size).toBe(40);
    expect(new Set(WATERPROOFING_PROBLEM_IMAGES.map(image => image.alt)).size).toBe(40);
    for (let index = 1; index <= 4; index++) {
      expect(WATERPROOFING_PROBLEM_IMAGES.filter(image => image.problemId === `impermeabilizacao-${index}`)).toHaveLength(10);
    }
    for (const image of WATERPROOFING_PROBLEM_IMAGES) {
      const prompt = prompts.find((entry: { id: string }) => entry.id === image.id);
      expect(prompt.problemId).toBe(image.problemId);
      expect(prompt.alt).toBe(image.alt);
      expect(prompt.origin).toBe('ai-generated');
      expect(existsSync(`public${image.src}`)).toBe(true);
    }
  });
  it('covers every waterproofing route with stable selections and matching initial HTML', () => {
    const used = new Set<string>();
    const families = new Set<string>();
    const routes = getLandingFaqRoutes().filter(record => record.context.serviceSlug === 'impermeabilizacao');
    expect(routes).toHaveLength(2289);
    for (const record of routes) {
      const model = getLandingPageModel(record.path)!;
      families.add(model.family);
      const html = renderLandingPageHtml(model);
      expect(model.problems).toHaveLength(4);
      expect(model.faqs).toHaveLength(4);
      for (const problem of model.problems) {
        expect(problem.image?.problemId).toBe(problem.id);
        expect(problem.image?.src).toMatch(/^\/images\/landing-problems\/impermeabilizacao\//);
        expect(html).toContain(`src="${problem.image!.src}"`);
        expect(selectLandingProblemImage('impermeabilizacao', problem.id, `${record.path}/?utm_medium=cpc#problemas`)).toEqual(problem.image);
        used.add(problem.image!.id);
      }
      expect((html.match(/<figcaption>Imagem ilustrativa<\/figcaption>/g) || []).length).toBe(4);
    }
    expect(families.size).toBe(4);
    expect(used.size).toBe(40);
  });
  it('does not mix services, problem groups or standalone families', () => {
    expect(selectLandingProblemImage('limpeza-sofas', 'impermeabilizacao-1', '/example')).toBeUndefined();
    expect(selectLandingProblemImage('impermeabilizacao', 'limpeza-sofas-1', '/example')).toBeUndefined();
    expect(selectLandingProblemImage('impermeabilizacao', 'unknown', '/example')).toBeUndefined();
    expect(selectLandingProblemImage('limpeza-alcatifas', 'impermeabilizacao-1', '/example')).toBeUndefined();
    expect(getLandingPageModel('/problemas/cadeira-manchada')).toBeNull();
  });
});
