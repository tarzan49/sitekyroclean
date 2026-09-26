import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { coverageWindow } from './landingPageModel';
import { getAllProblemCityRoutes, getProblemCities, problemCityMeta, problemCityNeighbours, PROBLEM_CITY_NEIGHBOURS } from './problemCitySeoData';
import { getProblemBySlug } from './problemSeoData';

// O bloco "Este problema noutras cidades" das páginas problema × cidade, tal
// como o `scripts/prerender.ts` e o `ProblemCityPage.tsx` o emitem (os dois
// chamam `problemCityNeighbours`). Fixa as duas invariantes que se partiram:
// nenhuma ligação para uma página que não existe, e nenhuma cidade da família
// sem ligação nenhuma. É o mesmo par de invariantes que o
// `landingDirectoryCoverage.test.ts` já fixa para as páginas de serviço.
const SIZE = PROBLEM_CITY_NEIGHBOURS;

function emittedLinks(problemSlug: string, citySlug: string) {
  return problemCityNeighbours(problemSlug, citySlug).map(c => `/${problemSlug}-${c.slug}`);
}

const read = (relative: string) => fs.readFileSync(path.resolve(__dirname, relative), 'utf-8');

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

  it('segue a mesma janela que as páginas landing (coverageWindow)', () => {
    for (const route of getAllProblemCityRoutes().slice(0, 300)) {
      const withPage = getProblemCities(route.problemSlug);
      const others = withPage.filter(c => c.slug !== route.citySlug);
      const start = withPage.findIndex(c => c.slug === route.citySlug);
      expect(problemCityNeighbours(route.problemSlug, route.citySlug)).toEqual(coverageWindow(others, start < 0 ? 0 : start, SIZE));
    }
  });
});

describe('páginas problema × cidade: o React e o HTML estático dizem o mesmo', () => {
  it('os dois leem o título, a descrição e as cidades vizinhas das mesmas funções', () => {
    for (const file of ['../pages/ProblemCityPage.tsx', '../../scripts/prerender.ts']) {
      const source = read(file);
      expect(source, file).toContain('problemCityMeta(problem, city.name)');
      expect(source, file).toMatch(/problemCityNeighbours\((problem\.slug|route\.problemSlug), city\.slug\)/);
    }
    expect(read('../pages/ProblemCityPage.tsx')).not.toMatch(/\.slice\(0, 8\)/);
  });

  it('usa a preposição certa de cada cidade', () => {
    const problem = getProblemBySlug(getAllProblemCityRoutes()[0].problemSlug)!;
    expect(problemCityMeta(problem, 'Porto').title).toBe(`${problem.h1} no Porto | Kyro Clean Solutions`);
    expect(problemCityMeta(problem, 'Amadora').title).toContain(' na Amadora ');
    expect(problemCityMeta(problem, 'Braga').description).toContain(`${problem.h1} em Braga:`);
    expect(problemCityMeta(problem, 'Braga').description).toMatch(/Resposta em menos de 10 minutos\.$/);
  });
});
