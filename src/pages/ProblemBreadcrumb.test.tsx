import { cleanup, render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { SITE_URL } from '@/constants/business';
import { getAllProblems, getProblemBySlug } from '@/data/problemSeoData';
import { getAllProblemCityRoutes, problemCityName } from '@/data/problemCitySeoData';
import { problemBreadcrumb } from '@/data/problemHero';
import { PILLAR_PAGES } from '@/data/pillarPages';
import { cities, services } from '@/data/serviceCatalog';
import ProblemCityPage from './ProblemCityPage';
import ProblemPage from './ProblemPage';

// A migalha das páginas de problema, tal como a pessoa a vê depois de o React
// montar (a <nav> do hero) e tal como a página a declara (o BreadcrumbList do
// JSON-LD). O hero e o schema são os verdadeiros; as secções sem relação com
// isto ficam simuladas.
vi.mock('@/components/Header', () => ({ default: () => null }));
vi.mock('@/components/Footer', () => ({ default: () => null }));
vi.mock('@/components/HeroBeforeAfterPool', () => ({ default: () => null }));
vi.mock('@/components/ServicePriceSection', () => ({ default: () => null }));
vi.mock('@/components/ServiceReviewsGrid', () => ({ default: () => null }));
vi.mock('@/components/ProblemExamplesGallery', () => ({ default: () => null }));
vi.mock('@/components/ProblemTreatmentGuide', () => ({ default: () => null }));
vi.mock('@/components/ServiceAutoCarousel', () => ({ default: () => null }));
vi.mock('@/components/ServicePackBanner', () => ({ default: () => null }));
vi.mock('@/components/ServiceFAQ', () => ({ default: () => null }));

afterEach(() => cleanup());

interface Step { name: string | null; href: string | null }

/** A migalha desenhada: cada passo com o seu texto e, se for ligação, o destino. */
function visibleTrail(container: HTMLElement): Step[] {
  const navs = container.querySelectorAll('nav[aria-label="Breadcrumb"]');
  expect(navs).toHaveLength(1);
  return [...navs[0].children]
    .filter(node => node.getAttribute('aria-hidden') !== 'true')
    .map(node => ({ name: node.textContent, href: node.getAttribute('href') }));
}

/** A migalha declarada, com os URLs relativos como os da <nav>. */
function declaredTrail(container: HTMLElement): Step[] {
  const nodes = [...container.querySelectorAll('script[type="application/ld+json"]')]
    .map(script => JSON.parse(script.textContent || '{}'))
    .flatMap(block => block['@graph'] ?? [block]);
  const lists = nodes.filter(node => node['@type'] === 'BreadcrumbList');
  expect(lists).toHaveLength(1);
  return [...lists[0].itemListElement]
    .sort((a, b) => a.position - b.position)
    .map((entry: { name: string; item: string }) => ({
      name: entry.name,
      href: entry.item.startsWith(SITE_URL) ? entry.item.slice(SITE_URL.length) || '/' : entry.item,
    }));
}

/**
 * O que se vê e o que se declara são a mesma migalha: os mesmos passos, pela
 * mesma ordem, com as mesmas ligações. O último passo é a própria página, em
 * texto na <nav> (como no PageBreadcrumb e no HTML estático) e com o URL da
 * página no JSON-LD.
 */
function expectSameTrail(container: HTMLElement, pagePath: string) {
  const visible = visibleTrail(container);
  const declared = declaredTrail(container);
  expect(visible.map(step => step.name), pagePath).toEqual(declared.map(step => step.name));
  expect(visible.slice(0, -1).map(step => step.href), pagePath).toEqual(declared.slice(0, -1).map(step => step.href));
  expect(visible.at(-1)?.href, pagePath).toBeNull();
  expect(declared.at(-1)?.href, pagePath).toBe(pagePath);
  return declared;
}

describe('páginas de problema: a migalha que se vê é a que se declara', () => {
  it('problema × cidade', () => {
    // Uma cidade por problema: passam todos os títulos, incluindo as perguntas.
    const seen = new Set<string>();
    for (const route of getAllProblemCityRoutes()) {
      if (seen.has(route.problemSlug)) continue;
      seen.add(route.problemSlug);
      const { container } = render(<MemoryRouter initialEntries={[route.path]}><ProblemCityPage /></MemoryRouter>);
      expectSameTrail(container, route.path);
      cleanup();
    }
    expect(seen.size).toBe(getAllProblems().length);
  });

  it('página nacional do problema', () => {
    for (const problem of getAllProblems()) {
      const pagePath = `/problemas/${problem.slug}`;
      const { container } = render(
        <MemoryRouter initialEntries={[pagePath]}>
          <Routes><Route path="/problemas/:slug" element={<ProblemPage />} /></Routes>
        </MemoryRouter>,
      );
      expectSameTrail(container, pagePath);
      cleanup();
    }
  });
});

describe('páginas de problema: cada passo da migalha é uma página que existe', () => {
  // As páginas que o scripts/prerender.ts gera a partir destas mesmas listas.
  const pages = new Set([
    '/',
    ...PILLAR_PAGES.map(page => page.path),
    ...getAllProblems().map(problem => `/problemas/${problem.slug}`),
    ...getAllProblemCityRoutes().map(route => route.path),
  ]);

  it('página nacional: Início › serviço › problema', () => {
    for (const problem of getAllProblems()) {
      const trail = problemBreadcrumb(problem);
      const service = services.find(item => item.slug === problem.relatedServices[0])!;
      expect(trail.map(step => step.name), problem.slug).toEqual(['Início', service.name, problem.h1]);
      expect(trail.map(step => step.path), problem.slug).toEqual(['/', service.baseRoute, `/problemas/${problem.slug}`]);
      for (const step of trail) expect(pages.has(step.path), `${problem.slug}: ${step.path}`).toBe(true);
    }
  });

  it('problema × cidade: Início › problema › cidade, em todas as páginas', () => {
    const routes = getAllProblemCityRoutes();
    expect(routes.length).toBeGreaterThan(1000);
    for (const route of routes) {
      const problem = getProblemBySlug(route.problemSlug)!;
      const city = cities.find(item => item.slug === route.citySlug)!;
      const trail = problemBreadcrumb(problem, city);
      // O passo da página nacional leva o nome sem localidade, o do H1 da página.
      expect(trail.map(step => step.name), route.path).toEqual(['Início', problemCityName(problem), city.name]);
      expect(trail.map(step => step.path), route.path).toEqual(['/', `/problemas/${problem.slug}`, route.path]);
      for (const step of trail) expect(pages.has(step.path), `${route.path}: ${step.path}`).toBe(true);
    }
  });
});

describe('páginas de problema: o HTML estático declara a mesma migalha', () => {
  // O `emit()` desenha a migalha do HTML estático a partir do BreadcrumbList
  // que recebe, por isso basta que as duas famílias o construam com a mesma
  // função que o React usa, e não com passos escritos à mão.
  const read = (relative: string) => fs.readFileSync(path.resolve(__dirname, relative), 'utf-8');

  it('o prerender constrói as duas migalhas com problemBreadcrumb', () => {
    const prerender = read('../../scripts/prerender.ts');
    const start = prerender.indexOf('// ── 4. Problem pages');
    const end = prerender.indexOf('// ── 6. Material pages');
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    const sections = prerender.slice(start, end);
    expect(sections).toContain('buildBreadcrumbSchema(problemBreadcrumb(p).map(');
    expect(sections).toContain('buildBreadcrumbSchema(problemBreadcrumb(problem, city).map(');
    // Nenhum passo escrito à mão nas duas famílias.
    expect(sections).not.toContain('buildBreadcrumbSchema([');
  });
});
