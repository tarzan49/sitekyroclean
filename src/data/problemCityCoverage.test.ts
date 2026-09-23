import { describe, it, expect } from 'vitest';
import { coverageWindow } from './landingPageModel';
import { getAllProblemCityRoutes, getProblemCities } from './problemCitySeoData';

// Reproduz exatamente o bloco de ligações que o `scripts/prerender.ts` emite
// nas páginas problema × cidade. Fixa as duas invariantes que se partiram lá:
// nenhuma ligação para uma página que não existe, e nenhuma cidade da família
// sem ligação nenhuma. É o mesmo par de invariantes que o
// `landingDirectoryCoverage.test.ts` já fixa para as páginas de serviço.
const SIZE = 6;

function emittedLinks(problemSlug: string, citySlug: string) {
  const withPage = getProblemCities(problemSlug);
  const others = withPage.filter(c => c.slug !== citySlug);
  const start = withPage.findIndex(c => c.slug === citySlug);
  return coverageWindow(others, start < 0 ? 0 : start, SIZE).map(c => `/${problemSlug}-${c.slug}`);
}

describe('ligações das páginas problema × cidade', () => {
  it('nunca liga a uma página que não é gerada', () => {
    const real = new Set(getAllProblemCityRoutes().map(route => route.path));
    const dead: string[] = [];
    for (const route of getAllProblemCityRoutes()) {
      for (const href of emittedLinks(route.problemSlug, route.citySlug)) {
        if (!real.has(href)) dead.push(`${route.path} -> ${href}`);
      }
    }
    expect(dead).toEqual([]);
  });

  it('acaba por ligar a todas as cidades de cada problema', () => {
    const semLigacao: string[] = [];
    for (const problem of new Set(getAllProblemCityRoutes().map(route => route.problemSlug))) {
      const cidades = getProblemCities(problem);
      const ligadas = new Set(cidades.flatMap(city => emittedLinks(problem, city.slug)));
      for (const city of cidades) {
        const href = `/${problem}-${city.slug}`;
        // Uma cidade só é alcançada a partir das irmãs, nunca da própria página.
        if (cidades.length > 1 && !ligadas.has(href)) semLigacao.push(href);
      }
    }
    expect(semLigacao).toEqual([]);
  });

  it('mantém o mesmo número de ligações por página', () => {
    for (const route of getAllProblemCityRoutes()) {
      const esperado = Math.min(SIZE, getProblemCities(route.problemSlug).length - 1);
      expect(emittedLinks(route.problemSlug, route.citySlug), route.path).toHaveLength(Math.max(0, esperado));
    }
  });
});
