/**
 * Static prerender for Kyro Clean Solutions
 * Generates dist/{route}.html with correct title/description/canonical
 * for all ~3,500 programmatic SEO routes so Googlebot sees real meta tags.
 *
 * IMPORTANT: must emit flat {route}.html files, NOT {route}/index.html.
 * Cloudflare Pages serves {route}.html directly for /{route} with no
 * redirect, matching React Router's exact (no-trailing-slash) routes.
 * A {route}/index.html directory instead triggers an automatic 308
 * redirect to /{route}/, which React Router's routes don't match
 * (causes a "Página não encontrada" / NotFound on every prerendered page).
 *
 * Runs as a Vite closeBundle plugin step (see vite.config.ts).
 * Can also run standalone: npx tsx scripts/prerender.ts
 */

import fs from 'fs';
import path from 'path';

import { getLocationServiceData, getAllLocationRoutes, services, cities } from '../src/data/locationSeoData';
import { getAllFreguesiaRoutes, getFreguesia, generateFreguesiaContent } from '../src/data/freguesiaSeoData';
import { getAllKeywordVariantRoutes, getKeywordVariantData } from '../src/data/keywordVariantData';
import { getAllProblems, getProblemBySlug } from '../src/data/problemSeoData';
import { getAllProblemCityRoutes } from '../src/data/problemCitySeoData';
import { getAllMaterials, getAllMaterialCityRoutes, getMaterialCityData } from '../src/data/materialSeoData';
import { getAllPriceRoutes, getPricePageData } from '../src/data/priceSeoData';
import { getAllPackComboRoutes, getPackByCityAndId, getFromPrice } from '../src/data/packComboData';
import { getAllMarcaSofaRoutes, getMarcaByCityAndSlug } from '../src/data/marcaSofaData';

const BASE_URL = 'https://cleansolutions.com.pt';

// ─── HTML helpers ──────────────────────────────────────────────────────────

function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function injectMeta(template: string, title: string, desc: string, canonical: string): string {
  let html = template;
  const t = escHtml(title);
  const d = escHtml(desc);
  html = html.replace(/<title>[^<]*<\/title>/,                                     `<title>${t}</title>`);
  html = html.replace(/(<meta\s+name="description"\s+content=")[^"]*(")/,          `$1${d}$2`);
  html = html.replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/,                `$1${canonical}$2`);
  html = html.replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/,           `$1${canonical}$2`);
  html = html.replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/,         `$1${t}$2`);
  html = html.replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/,   `$1${d}$2`);
  html = html.replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/,        `$1${t}$2`);
  html = html.replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/,  `$1${d}$2`);
  return html;
}

function writeRoute(outDir: string, routePath: string, html: string): void {
  const rel = routePath.replace(/^\//, '');
  const filePath = path.join(outDir, `${rel}.html`);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, html, 'utf-8');
}

// ─── Main ─────────────────────────────────────────────────────────────────

export function prerenderRoutes(outDir: string): number {
  const templatePath = path.join(outDir, 'index.html');
  if (!fs.existsSync(templatePath)) {
    console.warn('  ⚠️  dist/index.html not found — skipping prerender');
    return 0;
  }

  const template = fs.readFileSync(templatePath, 'utf-8');
  let count = 0;

  function emit(routePath: string, title: string, desc: string) {
    const canonical = `${BASE_URL}${routePath}`;
    writeRoute(outDir, routePath, injectMeta(template, title, desc, canonical));
    count++;
  }

  // ── 1. Location × Service pages (6 × 25 = 150) ─────────────────────────
  {
    const prev = count;
    for (const route of getAllLocationRoutes()) {
      const data = getLocationServiceData(route.serviceSlug, route.citySlug);
      if (data) emit(route.path, data.title, data.metaDescription);
    }
    console.log(`  Location pages:          ${count - prev}`);
  }

  // ── 2. Freguesia × Service pages (~6 × 140 = ~840) ─────────────────────
  {
    const prev = count;
    const svcMap = new Map(services.map(s => [s.slug, s]));
    for (const route of getAllFreguesiaRoutes()) {
      const freg = getFreguesia(route.citySlug, route.freguesiaSlug);
      const svc = svcMap.get(route.serviceSlug);
      if (!freg || !svc) continue;
      const content = generateFreguesiaContent(
        svc.name, svc.slug, svc.priceFrom,
        freg.name, freg.slug, freg.municipio,
      );
      emit(route.path, content.title, content.metaDescription);
    }
    console.log(`  Freguesia pages:         ${count - prev}`);
  }

  // ── 3. Keyword variant pages (higienizacao / lavagem / impermeabilizacao) ─
  {
    const prev = count;
    for (const route of getAllKeywordVariantRoutes()) {
      const data = getKeywordVariantData(route.variantKey, route.serviceKey, route.locationPart);
      if (data) emit(route.path, data.title, data.metaDescription);
    }
    console.log(`  Keyword variant pages:   ${count - prev}`);
  }

  // ── 4. Problem pages (~56) ──────────────────────────────────────────────
  {
    const prev = count;
    for (const p of getAllProblems()) {
      emit(`/problemas/${p.slug}`, p.title, p.metaDescription);
    }
    console.log(`  Problem pages:           ${count - prev}`);
  }

  // ── 5. Problem × City pages (~350) ──────────────────────────────────────
  {
    const prev = count;
    for (const route of getAllProblemCityRoutes()) {
      const problem = getProblemBySlug(route.problemSlug);
      const city = cities.find(c => c.slug === route.citySlug);
      if (!problem || !city) continue;
      const title = `${problem.h1} em ${city.name} | Kyro Clean Solutions`;
      const desc = `${problem.h1} em ${city.name}: serviço profissional ao domicílio. ${problem.metaDescription.split('.')[0]}. Orçamento grátis em menos de 2 horas.`;
      emit(route.path, title, desc);
    }
    console.log(`  Problem × City pages:    ${count - prev}`);
  }

  // ── 6. Material pages + Material × City (11 + 275) ─────────────────────
  {
    const prev = count;
    for (const mat of getAllMaterials()) {
      emit(`/${mat.slug}`, mat.title, mat.metaDescription);
    }
    for (const route of getAllMaterialCityRoutes()) {
      const data = getMaterialCityData(route.materialSlug, route.citySlug);
      if (data) emit(route.path, data.title, data.metaDescription);
    }
    console.log(`  Material pages:          ${count - prev}`);
  }

  // ── 7. Price pages (6 × 25 = 150) ───────────────────────────────────────
  {
    const prev = count;
    for (const route of getAllPriceRoutes()) {
      const data = getPricePageData(route.serviceSlug, route.citySlug);
      if (data) emit(route.path, data.title, data.metaDescription);
    }
    console.log(`  Price pages:             ${count - prev}`);
  }

  // ── 8. Pack / Combo pages (4 × 5 = 20) ──────────────────────────────────
  {
    const prev = count;
    for (const route of getAllPackComboRoutes()) {
      const data = getPackByCityAndId(route.packId, route.citySlug);
      if (!data) continue;
      const fromPrice = getFromPrice(data.pack);
      const title = `${data.pack.name} em ${data.city.name}, Desde ${fromPrice}€ | Kyro Clean`;
      const desc = `${data.pack.description} Poupe até 20% em relação ao preço individual. Serviço ao domicílio em ${data.city.name}.`;
      emit(route.path, title, desc);
    }
    console.log(`  Pack pages:              ${count - prev}`);
  }

  // ── 9. Marca Sofá pages (8 × 10 = 80) ───────────────────────────────────
  {
    const prev = count;
    for (const route of getAllMarcaSofaRoutes()) {
      const data = getMarcaByCityAndSlug(route.marcaSlug, route.citySlug);
      if (!data) continue;
      const title = `Limpeza Sofá ${data.marca.name} em ${data.city.name}, Especialistas | Kyro Clean`;
      const desc = `Especialistas em limpeza de sofás ${data.marca.name} em ${data.city.name}. ${data.marca.material}. ${data.marca.estimatedPriceRange}. Serviço ao domicílio.`;
      emit(route.path, title, desc);
    }
    console.log(`  Marca pages:             ${count - prev}`);
  }

  return count;
}

// ─── CLI entry point ───────────────────────────────────────────────────────
const isMain = process.argv[1]?.endsWith('prerender.ts') || process.argv[1]?.endsWith('prerender.js');
if (isMain) {
  const outDir = path.resolve(process.cwd(), 'dist');
  console.log('🔧 Prerendering routes...\n');
  const n = prerenderRoutes(outDir);
  console.log(`\n✅ Prerendered ${n} routes`);
}
