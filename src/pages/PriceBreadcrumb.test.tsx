import { cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { getAllPriceRoutes } from '@/data/priceSeoData';
import { getLandingPageModel } from '@/data/landingPageModel';
import { landingBreadcrumb } from '@/data/breadcrumb';
import { PILLAR_PAGES } from '@/data/pillarPages';
import { cities, cityPrep, services } from '@/data/serviceCatalog';
import { renderLandingPageHtml } from '../../scripts/landing-page-html';
import { clearLandingModel, renderAtRoute } from '@/test/landingModelDom';
import { expectSameSteps, expectSameTrail, staticTrail, stepsTrail } from '@/test/breadcrumbTrail';
import PricePage from './PricePage';

// A migalha das páginas de preço (/preco-{serviço}-{cidade}) nos quatro sítios
// onde aparece: o hero e o JSON-LD do React, e a <nav> e o BreadcrumbList do
// HTML estático. Até 30/09/2026 as 420 páginas mostravam "… › Porto" nos dois
// lados e declaravam "… › Preços no Porto" nos dois lados. O hero e o schema
// são os verdadeiros; as secções sem relação com isto ficam simuladas.
vi.mock('@/components/Header', () => ({ default: () => null }));
vi.mock('@/components/Footer', () => ({ default: () => null }));
vi.mock('@/components/HeroBeforeAfterPool', () => ({ default: () => null }));
vi.mock('@/components/LazyLandingServiceSections', () => ({ default: () => null }));

afterEach(() => { cleanup(); clearLandingModel(); });

const routes = getAllPriceRoutes();
const model = (route: string) => {
  const resolved = getLandingPageModel(route);
  expect(resolved?.family, route).toBe('preco');
  return resolved!;
};

describe('páginas de preço: a migalha que se vê é a que se declara', () => {
  it('React: o hero desenha a migalha que o JSON-LD declara', () => {
    for (const route of routes) {
      // O modelo entra pelo HTML, como na entrada normal vinda da pesquisa.
      const { container, model: installed } = renderAtRoute(route.path, <PricePage />);
      const declared = expectSameTrail(container, route.path);
      // E é a do HTML estático: a mesma função, sobre o mesmo modelo.
      expect(declared, route.path).toEqual(stepsTrail(landingBreadcrumb(installed!)));
      cleanup();
    }
  });

  it('HTML estático: a <nav> desenha a migalha que o emit() declara', () => {
    for (const route of routes) {
      const landing = model(route.path);
      expectSameSteps(staticTrail(renderLandingPageHtml(landing)), stepsTrail(landingBreadcrumb(landing)), route.path);
    }
  });

  it('o prerender declara a migalha das páginas de preço a partir do modelo', () => {
    const prerender = fs.readFileSync(path.resolve(__dirname, '../../scripts/prerender.ts'), 'utf-8');
    // O `emit()` declara o BreadcrumbList das páginas landing com a mesma
    // função que desenha a <nav>, sempre que a família não passa o seu…
    expect(prerender).toContain('buildBreadcrumbSchema(landingBreadcrumb(landing).map(');
    // …e a família de preço já não passa o seu, escrito à mão.
    const start = prerender.indexOf('// ── 7. Price pages');
    const end = prerender.indexOf('Price pages:', start);
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    expect(prerender.slice(start, end)).not.toContain('buildBreadcrumbSchema(');
  });
});

describe('páginas de preço: cada passo da migalha é uma página que existe', () => {
  // As páginas que o scripts/prerender.ts gera a partir destas mesmas listas.
  const pages = new Set(['/', ...PILLAR_PAGES.map(page => page.path), ...routes.map(route => route.path)]);

  it('Início › serviço › Preços na cidade, em todas as páginas', () => {
    expect(routes.length).toBeGreaterThan(400);
    for (const route of routes) {
      const service = services.find(item => item.slug === route.serviceSlug)!;
      const city = cities.find(item => item.slug === route.citySlug)!;
      const trail = landingBreadcrumb(model(route.path));
      expect(trail.map(step => step.name), route.path).toEqual(['Início', service.name, `Preços ${cityPrep(city.name)} ${city.name}`]);
      expect(trail.map(step => step.path), route.path).toEqual(['/', service.baseRoute, route.path]);
      for (const step of trail) {
        expect(pages.has(step.path), `${route.path}: ${step.path}`).toBe(true);
        expect(step.name, route.path).not.toContain('—');
      }
    }
  });
});
