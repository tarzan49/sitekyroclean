import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { coverageWindow } from './landingPageModel';
import { getAllProblemCityRoutes, getProblemCities, problemCityMeta, problemCityNeighbours, PROBLEM_CITY_NEIGHBOURS } from './problemCitySeoData';
import { getAllProblems, getProblemBySlug } from './problemSeoData';
import { getProblemHero } from './problemHero';
import { cities } from './serviceCatalog';

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

  it('numa pergunta, a cidade entra antes do ponto de interrogação', () => {
    // Visto em produção: "Quanto Custa a Lavagem Profissional de Tapetes? no Porto | Kyro Clean Solutions".
    const tapete = getProblemBySlug('preco-limpeza-tapete')!;
    expect(problemCityMeta(tapete, 'Porto').title).toBe('Quanto Custa a Lavagem Profissional de Tapetes no Porto? | Kyro Clean Solutions');
    expect(problemCityMeta(tapete, 'Amadora').description).toMatch(/^Quanto Custa a Lavagem Profissional de Tapetes na Amadora\? Serviço profissional ao domicílio\. /);
    for (const route of getAllProblemCityRoutes()) {
      const city = cities.find(c => c.slug === route.citySlug)!;
      const { title, description } = problemCityMeta(getProblemBySlug(route.problemSlug)!, city.name);
      expect(title, route.path).not.toMatch(/\?(?! \| Kyro Clean Solutions$)/);
      expect(description, route.path).not.toMatch(/\?\s*(no|na|em)\s|\?:/);
    }
  });
});

describe('páginas problema × cidade: só nomeiam a sua cidade', () => {
  // Visto em produção: "Limpeza de Sofá ao Domicílio no Porto e Arredores em
  // Lisboa" (e "... no Porto e Arredores no Porto") no título e no H1 das 31
  // páginas, e descrições de Lisboa e Faro com "Limpeza urgente de sofá no
  // Porto" ou "empresa profissional de limpeza de estofos no Porto". O que um
  // problema escreve e sai em todas as suas cidades tem de servir a qualquer uma.
  const PLACES = [...cities.map(city => city.name), 'Algarve', 'Alentejo', 'Minho', 'Norte de Portugal']
    .sort((a, b) => b.length - a.length);
  const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  /** Os sítios que um texto nomeia, fora a cidade da própria página. */
  function otherPlaces(text: string, ownCity = ''): string[] {
    let rest = ownCity ? text.split(ownCity).join(' ') : text;
    const found: string[] = [];
    for (const place of PLACES) {
      const next = rest.replace(new RegExp(`(?<!\\p{L})${escape(place)}(?!\\p{L})`, 'gu'), ' ');
      if (next !== rest) found.push(place);
      rest = next;
    }
    const vague = rest.match(/arredores|área metropolitana/i);
    return vague ? [...found, vague[0]] : found;
  }

  it('o título, o H1 e a descrição de cada página só nomeiam a cidade dela', () => {
    expect(otherPlaces('Limpeza de Sofá ao Domicílio no Porto e Arredores em Lisboa', 'Lisboa')).toEqual(['Porto', 'Arredores']);
    expect(otherPlaces('Limpeza de Sofá ao Domicílio no Porto e Arredores no Porto', 'Porto')).toEqual(['Arredores']);
    const offending: string[] = [];
    for (const route of getAllProblemCityRoutes()) {
      const problem = getProblemBySlug(route.problemSlug)!;
      const city = cities.find(c => c.slug === route.citySlug)!;
      const { title, description } = problemCityMeta(problem, city.name);
      const h1 = getProblemHero(problem, city.name).heading;
      for (const [field, text] of Object.entries({ title, h1, description })) {
        const places = otherPlaces(text, city.name);
        if (places.length) offending.push(`${route.path} (${field}): ${places.join(', ')}`);
      }
    }
    expect(offending).toEqual([]);
  });

  it('o h1 e os benefícios, que saem em todas as cidades, não nomeiam nenhuma', () => {
    // O h1 é o nome da página nacional na migalha (React, estático e JSON-LD),
    // na ligação "(página nacional)" e em "Problemas relacionados", e as
    // cidades vizinhas do HTML estático levam `headingWithCity(problem.h1, …)`.
    // Os benefícios saem tal e qual nas páginas de todas as cidades.
    expect(read('../../scripts/prerender.ts')).toContain('headingWithCity(problem.h1, c.name)');
    const offending = getAllProblems().flatMap(problem => [problem.h1, ...problem.benefits]
      .filter(text => otherPlaces(text).length)
      .map(text => `${problem.slug}: "${text}"`));
    expect(offending).toEqual([]);
  });

  it('a limpeza de sofá ao domicílio lê-se com a cidade de cada página', () => {
    const problem = getProblemBySlug('limpeza-sofa-domicilio')!;
    expect(getProblemHero(problem, 'Lisboa').heading).toBe('Limpeza de Sofá ao Domicílio em Lisboa');
    expect(getProblemHero(problem, 'Porto').heading).toBe('Limpeza de Sofá ao Domicílio no Porto');
    expect(problemCityMeta(problem, 'Faro').title).toBe('Limpeza de Sofá ao Domicílio em Faro | Kyro Clean Solutions');
    // A página nacional liga às 31 cidades: deixou de ser "Porto e Arredores".
    expect(otherPlaces(`${problem.title} ${problem.metaDescription}`)).toEqual([]);
    // Sem um segundo "ao domicílio" logo a seguir ao do título.
    expect(problemCityMeta(problem, 'Lisboa').description).toMatch(/^Limpeza de Sofá ao Domicílio em Lisboa: serviço profissional\. [^.]+\. Resposta em menos de 10 minutos\.$/);
    expect(problemCityMeta(getProblemBySlug('manchas-sofa')!, 'Lisboa').description).toContain('em Lisboa: serviço profissional ao domicílio. ');
  });
});
