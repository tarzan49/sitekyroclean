import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { coverageWindow } from './landingPageModel';
import { getAllProblemCityRoutes, getProblemCities, problemCityBenefits, problemCityMeta, problemCityName, problemCityNeighbours, PROBLEM_CITY_NEIGHBOURS } from './problemCitySeoData';
import { getProblemBySlug } from './problemSeoData';
import { getProblemHero, problemBreadcrumb } from './problemHero';
import { cities, headingWithCity } from './serviceCatalog';

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

  it('os dois leem o nome e os benefícios da página de cidade das mesmas funções', () => {
    // O h1 e os benefícios da página nacional podem falar de uma cidade (a de
    // limpeza-sofa-domicilio é sobre o Porto): uma página de cidade lê-os
    // sempre através de problemCityName/problemCityBenefits, nunca direto.
    const prerender = read('../../scripts/prerender.ts');
    const start = prerender.indexOf('// ── 5. Problem × City pages');
    const end = prerender.indexOf('// ── 6. Material pages');
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    const sources = { 'ProblemCityPage.tsx': read('../pages/ProblemCityPage.tsx'), 'prerender.ts (problema × cidade)': prerender.slice(start, end) };
    for (const [file, source] of Object.entries(sources)) {
      expect(source, file).toContain('problemCityBenefits(problem, city.name)');
      expect(source, file).toContain('problemCityName(problem)');
      expect(source, file).not.toMatch(/problem\.(h1|benefits)\b/);
    }
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

/** Os nomes das localidades servidas, menos a da página. */
function otherCityPattern(own: string) {
  const names = cities.map(c => c.name).filter(name => name !== own)
    .sort((a, b) => b.length - a.length)
    .map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`(?<!\\p{L})(${names.join('|')})(?!\\p{L})`, 'u');
}

describe('páginas problema × cidade: cada uma só fala da sua cidade', () => {
  // Até 30/09/2026 a página de Lisboa de limpeza-sofa-domicilio tinha o H1
  // "Limpeza de Sofá ao Domicílio no Porto e Arredores em Lisboa": o h1 da
  // página nacional, que é sobre o Porto, com a cidade acrescentada no fim. O
  // mesmo no título, na descrição, na migalha e no JSON-LD.
  it('o nome do problema nas páginas de cidade não nomeia cidade nenhuma', () => {
    // Dá o H1, o título, a migalha, o nome no JSON-LD e os rótulos das
    // ligações para as outras cidades e para a página nacional.
    for (const slug of new Set(getAllProblemCityRoutes().map(route => route.problemSlug))) {
      const name = problemCityName(getProblemBySlug(slug)!);
      expect(name, slug).not.toMatch(otherCityPattern(''));
    }
  });

  it('o H1, o título e a migalha só nomeiam a cidade da página', () => {
    const found: string[] = [];
    for (const route of getAllProblemCityRoutes()) {
      const problem = getProblemBySlug(route.problemSlug)!;
      const city = cities.find(c => c.slug === route.citySlug)!;
      const other = otherCityPattern(city.name);
      const texts = [
        getProblemHero(problem, city.name).heading,
        problemCityMeta(problem, city.name).title,
        ...problemBreadcrumb(problem, city).map(step => step.name),
      ];
      for (const text of texts) {
        const match = text.match(other);
        if (match) found.push(`${route.path}: "${match[0]}" em "${text}"`);
      }
    }
    expect(found).toEqual([]);
  });

  it('limpeza-sofa-domicilio: a página nacional fica no Porto, as de cidade não', () => {
    const domicilio = getProblemBySlug('limpeza-sofa-domicilio')!;
    const routes = getAllProblemCityRoutes().filter(route => route.problemSlug === domicilio.slug);
    expect(routes).toHaveLength(31);
    for (const route of routes) {
      const city = cities.find(c => c.slug === route.citySlug)!;
      const { title, description } = problemCityMeta(domicilio, city.name);
      const texts = [
        getProblemHero(domicilio, city.name).heading, title, description,
        ...problemBreadcrumb(domicilio, city).map(step => step.name),
        ...problemCityBenefits(domicilio, city.name),
      ];
      for (const text of texts) expect(text, route.path).not.toMatch(otherCityPattern(city.name));
    }

    // Texto escolhido pelo dono a 30/09/2026.
    expect(problemCityMeta(domicilio, 'Lisboa')).toEqual({
      title: 'Limpeza de Sofá ao Domicílio em Lisboa | Kyro Clean Solutions',
      description: 'Limpeza de Sofá ao Domicílio em Lisboa: serviço profissional ao domicílio. Levamos o equipamento de extração profissional à sua casa. Resposta em menos de 10 minutos.',
    });
    expect(problemCityMeta(domicilio, 'Porto').title).toBe('Limpeza de Sofá ao Domicílio no Porto | Kyro Clean Solutions');
    const lisboa = cities.find(c => c.slug === 'lisboa')!;
    expect(problemBreadcrumb(domicilio, lisboa).map(step => step.name)).toEqual(['Início', 'Limpeza de Sofá ao Domicílio', 'Lisboa']);
    expect(problemCityNeighbours(domicilio.slug, lisboa.slug).map(c => headingWithCity(problemCityName(domicilio), c.name))[0])
      .toBe('Limpeza de Sofá ao Domicílio na Amadora');

    // O quarto benefício é a zona: a própria cidade, e o Porto na página nacional.
    expect(problemCityBenefits(domicilio, 'Lisboa')).toEqual(domicilio.benefits.map(benefit =>
      benefit === 'Porto e toda a área metropolitana' ? 'Lisboa e arredores' : benefit));
    expect(problemCityBenefits(domicilio, 'Porto')).toContain('Porto e arredores');
    expect(domicilio.benefits).toContain('Porto e toda a área metropolitana');
    expect(domicilio.h1).toBe('Limpeza de Sofá ao Domicílio no Porto e Arredores');
  });

  it('os outros problemas usam o texto da página nacional', () => {
    const manchas = getProblemBySlug('manchas-sofa')!;
    expect(problemCityName(manchas)).toBe(manchas.h1);
    expect(problemCityBenefits(manchas, 'Lisboa')).toBe(manchas.benefits);
    expect(problemCityMeta(manchas, 'Lisboa').description).toContain(`${manchas.metaDescription.split('.')[0]}.`);
  });
});
