// Guarda contra a regressão que esta família já teve: 1.154 páginas com 94% do
// texto repetido, iguais tirando o nome da cidade.
import { describe, expect, it } from 'vitest';
import { getAllProblemCityRoutes } from './problemCitySeoData';
import { getProblemBySlug } from './problemSeoData';
import { cities } from './serviceCatalog';
import { getProblemCityFaqs, getProblemCityReviews, getProblemCityCoverage } from './problemCityContent';

function contextFor(path: string) {
  const route = getAllProblemCityRoutes().find(r => r.path === path)!;
  const problem = getProblemBySlug(route.problemSlug)!;
  const city = cities.find(c => c.slug === route.citySlug)!;
  return { route, problem, city };
}

describe('conteúdo por cidade das páginas de problema', () => {
  it('dá perguntas diferentes ao mesmo problema em cidades diferentes', () => {
    const perguntasPorCidade = ['porto', 'lisboa', 'braga', 'guimaraes'].map(slug => {
      const { route, problem, city } = contextFor(`/manchas-sofa-${slug}`);
      return getProblemCityFaqs(problem, city.name, route.path).map(f => f.question).join('|');
    });
    expect(new Set(perguntasPorCidade).size).toBeGreaterThan(1);
  });

  it('mantém exatamente quatro perguntas e é estável para a mesma rota', () => {
    const { route, problem, city } = contextFor('/manchas-sofa-porto');
    const uma = getProblemCityFaqs(problem, city.name, route.path);
    const outra = getProblemCityFaqs(problem, city.name, route.path);
    expect(uma).toHaveLength(4);
    expect(outra).toEqual(uma);
  });

  it('usa a taxa de deslocação real de cada cidade', () => {
    expect(getProblemCityCoverage('Porto')).toContain('+10€');
    expect(getProblemCityCoverage('Guimarães')).toContain('+20€');
    expect(getProblemCityCoverage('Porto')).not.toEqual(getProblemCityCoverage('Guimarães'));
  });

  it('dá seis avaliações, estáveis por cidade', () => {
    const { problem } = contextFor('/manchas-sofa-porto');
    const porto = getProblemCityReviews(problem, 'porto');
    expect(porto).toHaveLength(6);
    expect(getProblemCityReviews(problem, 'porto')).toEqual(porto);
  });

  it('nenhuma rota real fica sem perguntas', () => {
    for (const route of getAllProblemCityRoutes()) {
      const problem = getProblemBySlug(route.problemSlug);
      const city = cities.find(c => c.slug === route.citySlug);
      if (!problem || !city) continue;
      expect(getProblemCityFaqs(problem, city.name, route.path)).toHaveLength(4);
    }
  });
});
