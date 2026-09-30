import { cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { getAllFreguesiaRoutes, municipiosComFreguesias } from '@/data/freguesiaSeoData';
import { getAllKeywordVariantRoutes } from '@/data/keywordVariantData';
import { getAllLocationRoutes } from '@/data/locationSeoData';
import { getLandingPageModel } from '@/data/landingPageModel';
import { landingBreadcrumb } from '@/data/breadcrumb';
import { PILLAR_PAGES } from '@/data/pillarPages';
import { services } from '@/data/serviceCatalog';
import { renderLandingPageHtml } from '../../scripts/landing-page-html';
import { clearLandingModel, renderAtRoute } from '@/test/landingModelDom';
import { expectSameSteps, expectSameTrail, staticTrail, stepsTrail } from '@/test/breadcrumbTrail';
import FreguesiaServicePage from './FreguesiaServicePage';

// A migalha das páginas de freguesia (/{serviço}-{município}-{freguesia}) nos
// quatro sítios onde aparece: o hero e o JSON-LD do React, e a <nav> e o
// BreadcrumbList do HTML estático. Até 30/09/2026 as 4.170 páginas mostravam
// "Início › serviço › Paranhos" e o HTML estático declarava "… › Porto ›
// Paranhos"; depois do React, o ServiceLocationSchema voltava a declarar três
// passos. O dono escolheu os quatro. O hero e o schema são os verdadeiros; as
// secções sem relação com isto ficam simuladas.
vi.mock('@/components/Header', () => ({ default: () => null }));
vi.mock('@/components/Footer', () => ({ default: () => null }));
vi.mock('@/components/HeroBeforeAfterPool', () => ({ default: () => null }));
vi.mock('@/components/LazyLandingServiceSections', () => ({ default: () => null }));

afterEach(() => { cleanup(); clearLandingModel(); });

const routes = getAllFreguesiaRoutes();
const model = (route: string) => {
  const resolved = getLandingPageModel(route);
  expect(resolved?.family, route).toBe('freguesia');
  return resolved!;
};

// Desenhar as 4.170 no React não acrescenta nada: é a mesma página com outro
// modelo. A amostra leva, em cada um dos 69 municípios, a primeira e a última
// freguesia, com o serviço a rodar pelos seis, e todas as freguesias com o
// mesmo nome noutro município (Santa Clara, em Coimbra e em Lisboa), que são
// as que o passo do município distingue.
const parishOwners = new Map<string, number>();
for (const municipality of municipiosComFreguesias) {
  for (const parish of municipality.freguesias) parishOwners.set(parish.name, (parishOwners.get(parish.name) ?? 0) + 1);
}
const samplePaths = new Set(municipiosComFreguesias.flatMap((municipality, index) => [
  municipality.freguesias[0],
  municipality.freguesias[municipality.freguesias.length - 1],
  ...municipality.freguesias.filter(parish => parishOwners.get(parish.name)! > 1),
].map((parish, offset) => `/${services[(index + offset) % services.length].slug}-${municipality.slug}-${parish.slug}`)));
const sample = routes.filter(route => samplePaths.has(route.path));

describe('páginas de freguesia: a migalha que se vê é a que se declara', () => {
  it('a amostra existe e cobre os municípios, os serviços e os nomes repetidos', () => {
    expect(sample).toHaveLength(samplePaths.size);
    expect(new Set(sample.map(route => route.citySlug)).size).toBe(municipiosComFreguesias.length);
    expect(new Set(sample.map(route => route.serviceSlug)).size).toBe(services.length);
    const repeated = municipiosComFreguesias.flatMap(municipality => municipality.freguesias
      .filter(parish => parishOwners.get(parish.name)! > 1)
      .map(parish => `${municipality.slug}-${parish.slug}`));
    expect(repeated.length).toBeGreaterThan(0);
    const sampled = new Set(sample.map(route => `${route.citySlug}-${route.freguesiaSlug}`));
    for (const parish of repeated) expect(sampled.has(parish), parish).toBe(true);
  });

  it('React: o hero desenha a migalha que o JSON-LD declara', () => {
    for (const route of sample) {
      // O modelo entra pelo HTML, como na entrada normal vinda da pesquisa.
      const { container, model: installed } = renderAtRoute(route.path, <FreguesiaServicePage />);
      const declared = expectSameTrail(container, route.path);
      // E é a do HTML estático: a mesma função, sobre o mesmo modelo.
      expect(declared, route.path).toEqual(stepsTrail(landingBreadcrumb(installed!)));
      cleanup();
    }
  });

  it('HTML estático: a <nav> desenha a migalha que o emit() declara', () => {
    for (const route of sample) {
      const landing = model(route.path);
      expectSameSteps(staticTrail(renderLandingPageHtml(landing)), stepsTrail(landingBreadcrumb(landing)), route.path);
    }
  });

  it('o prerender declara a migalha das freguesias a partir do modelo', () => {
    const prerender = fs.readFileSync(path.resolve(__dirname, '../../scripts/prerender.ts'), 'utf-8');
    // O `emit()` declara o BreadcrumbList das páginas landing com a mesma
    // função que desenha a <nav>, sempre que a família não passa o seu…
    expect(prerender).toContain('buildBreadcrumbSchema(landingBreadcrumb(landing).map(');
    // …e a família de freguesia já não passa o seu, escrito à mão.
    const start = prerender.indexOf('// ── 2. Freguesia × Service pages');
    const end = prerender.indexOf('Freguesia pages:', start);
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    expect(prerender.slice(start, end)).not.toContain('buildBreadcrumbSchema(');
  });
});

describe('páginas de freguesia: cada passo da migalha é uma página que existe', () => {
  // As páginas que o scripts/prerender.ts gera a partir destas mesmas listas.
  const locationRoutes = getAllLocationRoutes();
  const pages = new Set(['/', ...PILLAR_PAGES.map(page => page.path), ...locationRoutes.map(route => route.path), ...routes.map(route => route.path)]);

  it('Início › serviço › município › freguesia, nas 4.170 páginas', () => {
    expect(routes).toHaveLength(4170);
    for (const route of routes) {
      const service = services.find(item => item.slug === route.serviceSlug)!;
      const municipality = municipiosComFreguesias.find(item => item.slug === route.citySlug)!;
      const parish = municipality.freguesias.find(item => item.slug === route.freguesiaSlug)!;
      const trail = landingBreadcrumb(model(route.path));
      expect(trail.map(step => step.name), route.path).toEqual(['Início', service.name, municipality.name, parish.name]);
      expect(trail.map(step => step.path), route.path).toEqual(['/', service.baseRoute, `/${service.slug}-${municipality.slug}`, route.path]);
      for (const step of trail) {
        expect(pages.has(step.path), `${route.path}: ${step.path}`).toBe(true);
        expect(step.name, route.path).not.toContain('—');
      }
    }
  });

  it('os três primeiros passos são a migalha da página do município', () => {
    // "Início › Limpeza de Sofás › Porto" é a migalha de /limpeza-sofas-porto:
    // a freguesia acrescenta-lhe o seu nome, não conta outro caminho.
    const municipalityTrails = new Map(locationRoutes.map(route => [route.path, landingBreadcrumb(getLandingPageModel(route.path)!)]));
    for (const route of routes) {
      const trail = landingBreadcrumb(model(route.path));
      expect(trail.slice(0, -1), route.path).toEqual(municipalityTrails.get(trail[2].path));
    }
  });

  it('as variantes de keyword com freguesia continuam com três passos (dono, 30/09/2026)', () => {
    // "Início › Limpeza de Sofás › Paranhos, Porto": o último passo já diz o
    // município, e o dono quis deixá-las como estavam.
    const variants = getAllKeywordVariantRoutes().map(route => getLandingPageModel(route.path)!).filter(variant => variant.parishSlug);
    expect(variants.length).toBeGreaterThan(8000);
    for (const variant of variants) {
      expect(variant.family, variant.path).toBe('variante');
      expect(landingBreadcrumb(variant).map(step => step.name), variant.path).toEqual(['Início', variant.serviceName, variant.heroLocationName]);
    }
  });
});
