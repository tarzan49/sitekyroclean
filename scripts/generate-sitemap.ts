/**
 * Sitemap Generator for Kyro Clean Solutions
 * Generates a Sitemap Index + sub-sitemaps covering all ~1700+ URLs
 * 
 * Can be run standalone: npx tsx scripts/generate-sitemap.ts
 * Also integrated as Vite post-build plugin
 */

import fs from 'fs';
import path from 'path';
import { cities, services } from '../src/data/locationSeoData';
import { municipiosComFreguesias } from '../src/data/freguesiaSeoData';
import { getVisibleProblems } from '../src/data/problemSeoData';
import { getAllProblemCityRoutes } from '../src/data/problemCitySeoData';
import { getAllMaterialRoutes, getAllMaterialCityRoutes } from '../src/data/materialSeoData';
import { getAllKeywordVariantRoutes } from '../src/data/keywordVariantData';
import { getAllEnRoutes } from '../src/data/enTouristSeoData';
import { getAllCommercialRoutes } from '../src/data/commercialSeoData';
import { packs, packCities } from '../src/data/packComboData';
import { MARCA_CITY_SLUGS } from '../src/data/marcaCities';

const BASE_URL = 'https://cleansolutions.com.pt';
const TODAY = new Date().toISOString().split('T')[0];

// cities/services/municipiosComFreguesias imported directly from src/data/
// above (2026-08-25) — this file used to keep a hand-maintained duplicate of
// all ~53 cities and ~300 freguesias, independent of the real source. Adding
// a new city/freguesia to the real data without also updating this file's
// copy meant the new pages existed and were navigable, but silently missing
// from the sitemap. Both locationSeoData.ts and freguesiaSeoData.ts have zero
// `@/` alias imports internally, so importing them here (Node, no Vite alias
// resolution) works the same way scripts/prerender.ts already does for its
// own data imports.

// Mirrors src/data/problemSeoData.ts exactly (imported, not duplicated) so this
// sitemap can never drift into emitting slugs that don't have a real page.
const problemSlugs = getVisibleProblems().map(p => p.slug);

// Problem × City, Material (+City) and Keyword Variant routes are all
// imported directly from src/data/ below (see generateSitemaps()) instead of
// duplicated here — mirroring the exact same logic scripts/prerender.ts uses
// to build these pages means the sitemap can never list a URL without a
// matching real page, or omit a real page from the sitemap.

// ─── XML Helpers ─────────────────────────────────────────────────

function xmlUrl(loc: string, changefreq: string, priority: string): string {
  return `  <url>
    <loc>${BASE_URL}${loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function wrapUrlset(urls: string[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
}

function wrapSitemapIndex(sitemaps: string[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(s => `  <sitemap>
    <loc>${BASE_URL}/${s}</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;
}

// ─── Generate Sitemaps ───────────────────────────────────────────

export function generateSitemaps(outDir: string) {
  // 1. Core pages
  const coreUrls = [
    xmlUrl('/', 'weekly', '1.0'),
    xmlUrl('/limpeza-sofas', 'weekly', '0.9'),
    xmlUrl('/limpeza-colchoes', 'weekly', '0.9'),
    xmlUrl('/limpeza-tapetes', 'weekly', '0.9'),
    xmlUrl('/limpeza-cadeiras', 'weekly', '0.9'),
    xmlUrl('/limpeza-alcatifas', 'weekly', '0.9'),
    xmlUrl('/impermeabilizacao', 'weekly', '0.9'),
    xmlUrl('/packs', 'weekly', '0.8'),
    xmlUrl('/guia-de-packs', 'monthly', '0.7'),
    xmlUrl('/blog', 'weekly', '0.8'),
    xmlUrl('/perguntas-frequentes-limpeza-estofos', 'monthly', '0.7'),
    xmlUrl('/glossario-limpeza-estofos', 'monthly', '0.6'),
    xmlUrl('/areas-de-servico', 'monthly', '0.7'),
    xmlUrl('/antes-depois-limpeza', 'monthly', '0.7'),
  ];

  // 2. Location pages (service × city)
  const locationUrls: string[] = [];
  for (const svc of services) {
    for (const city of cities) {
      const priority = city.region === 'primary' ? '0.8' : '0.7';
      locationUrls.push(xmlUrl(`/${svc.slug}-${city.slug}`, 'monthly', priority));
    }
  }

  // 3. Freguesia pages (service × city × freguesia)
  const freguesiaUrls: string[] = [];
  for (const mun of municipiosComFreguesias) {
    for (const freg of mun.freguesias) {
      for (const svc of services) {
        freguesiaUrls.push(xmlUrl(`/${svc.slug}-${mun.slug}-${freg.slug}`, 'monthly', '0.5'));
      }
    }
  }

  // 4. Problem pages (standalone + city combos) — imported, mirrors prerender.ts exactly
  const problemUrls: string[] = [];
  for (const slug of problemSlugs) {
    problemUrls.push(xmlUrl(`/problemas/${slug}`, 'monthly', '0.7'));
  }
  for (const route of getAllProblemCityRoutes()) {
    problemUrls.push(xmlUrl(route.path, 'monthly', '0.6'));
  }

  // 5. Material pages (standalone + city combos) — imported, mirrors prerender.ts exactly
  const materialUrls: string[] = [];
  for (const route of getAllMaterialRoutes()) {
    materialUrls.push(xmlUrl(route.path, 'monthly', '0.7'));
  }
  for (const route of getAllMaterialCityRoutes()) {
    materialUrls.push(xmlUrl(route.path, 'monthly', '0.6'));
  }

  // 6. Keyword variant pages: higienização/lavagem/impermeabilização × services × cities + parishes
  // Imported, mirrors prerender.ts exactly (previously hand-duplicated here and
  // missing the impermeabilizacao variant entirely — ~700 real pages weren't
  // being submitted to Google via sitemap).
  const keywordVariantUrls: string[] = [];
  for (const route of getAllKeywordVariantRoutes()) {
    keywordVariantUrls.push(xmlUrl(route.path, 'monthly', '0.6'));
  }

  // 7. Price pages (service × city)
  const priceUrls: string[] = [];
  for (const svc of services) {
    for (const city of cities) {
      priceUrls.push(xmlUrl(`/preco-${svc.slug}-${city.slug}`, 'monthly', '0.6'));
    }
  }

  // 8. Resource pages (FAQ + Glossário + Blog)
  const blogSlugs = [
    'quanto-custa-limpar-sofa-profissional',
    'como-tirar-manchas-sofa-tecido',
    'impermeabilizacao-sofa-vale-pena',
    'acaros-sofas-colchoes-riscos-saude',
    'quanto-custa-limpar-colchao-profissional',
    'limpeza-tapetes-profissional-guia-completo',
    'limpeza-cadeiras-estofadas-precos-guia',
    'doencas-causadas-estofos-sujos',
    'como-preparar-casa-visita-tecnico',
    'como-limpar-sofa-veludo',
    'como-tirar-cheiro-sofa',
    'limpeza-alcatifa-escritorio',
    'guia-acaros-em-casa',
    'limpeza-sofa-animais-domesticos',
    'como-manter-sofa-limpo-entre-limpezas',
    'higienizacao-vs-impermeabilizacao-sofa',
    'com-que-frequencia-limpar-sofa',
    'sinais-sofa-precisa-limpeza-profissional',
    'como-limpar-sofa-microfibra',
    'limpeza-sofa-bebe-crianca',
    'limpeza-colchao-bebe-crianca',
    'o-que-e-extracao-a-vapor-estofos',
    'mitos-limpeza-estofos',
    'limpeza-sofa-couro',
    'como-tirar-manchas-urina-colchao',
    'quanto-custa-limpar-alcatifa',
  ];
  const resourceUrls: string[] = [
    xmlUrl('/perguntas-frequentes-limpeza-estofos', 'monthly', '0.8'),
    xmlUrl('/glossario-limpeza-estofos', 'monthly', '0.7'),
    xmlUrl('/blog', 'weekly', '0.8'),
    ...blogSlugs.map(s => xmlUrl(`/blog/${s}`, 'monthly', '0.8')),
  ];

  // 9. Pack/Combo pages — packs + packCities imported directly from
  // src/data/packComboData.ts (2026-08-25) so this sitemap can never drift
  // from the real PACK_CITY_SLUGS list (this file used to keep its own stale
  // hand-copied city list here, which silently undercounted after every
  // expansion).
  const packUrls: string[] = [];
  for (const pack of packs) {
    for (const city of packCities) {
      packUrls.push(xmlUrl(`/${pack.slug}-${city.slug}`, 'monthly', '0.7'));
    }
  }

  // Cidades para as páginas Marca × Item × Cidade — importadas diretamente de
  // src/data/marcaCities.ts (2026-08-25), mesmo motivo do fix acima para Packs.
  const marcaCities = MARCA_CITY_SLUGS;

  // 10. Marca Sofá pages (8 brands × 34 cities = 272 pages)
  const marcaSlugs = ['ikea', 'natuzzi', 'roche-bobois', 'conforama', 'el-corte-ingles', 'kave-home', 'leroy-merlin', 'moviflor'];
  const marcaUrls: string[] = [];
  for (const marca of marcaSlugs) {
    for (const city of marcaCities) {
      marcaUrls.push(xmlUrl(`/limpeza-sofa-${marca}-${city}`, 'monthly', '0.7'));
    }
  }

  // 11. Marca Colchão pages (6 brands × 34 cities = 204 pages)
  const marcaColchaoSlugs = ['ikea', 'conforama', 'molaflex', 'pikolin', 'colmol', 'mindol'];
  for (const marca of marcaColchaoSlugs) {
    for (const city of marcaCities) {
      marcaUrls.push(xmlUrl(`/limpeza-colchao-${marca}-${city}`, 'monthly', '0.7'));
    }
  }

  // 12. Marca Cadeiras pages (6 brands × 34 cities = 204 pages)
  const marcaCadeirasSlugs = ['ikea', 'conforama', 'leroy-merlin', 'herman-miller', 'moviflor', 'el-corte-ingles'];
  for (const marca of marcaCadeirasSlugs) {
    for (const city of marcaCities) {
      marcaUrls.push(xmlUrl(`/limpeza-cadeiras-${marca}-${city}`, 'monthly', '0.7'));
    }
  }

  // 13. EN tourist pages (isolated /en/ namespace) — own dedicated sitemap,
  // kept separate from all PT sitemaps above so it can be reviewed/analysed
  // on its own.
  const enUrls: string[] = [
    ...getAllEnRoutes().map(r => xmlUrl(r.path, 'monthly', '0.6')),
    xmlUrl('/en/airbnb-portugal-cleaning-guide', 'monthly', '0.7'),
  ];

  // 14. Commercial B2B pages (restaurantes/hotéis/escritórios × cidade) — own
  // dedicated sitemap, separate from the consumer-facing sitemaps above.
  const commercialUrls: string[] = getAllCommercialRoutes().map(r => xmlUrl(r.path, 'monthly', '0.6'));

  // Write sub-sitemaps
  const sitemapFiles = [
    { name: 'sitemap-core.xml', urls: coreUrls },
    { name: 'sitemap-location.xml', urls: locationUrls },
    { name: 'sitemap-freguesia.xml', urls: freguesiaUrls },
    { name: 'sitemap-problem.xml', urls: problemUrls },
    { name: 'sitemap-material.xml', urls: materialUrls },
    { name: 'sitemap-keyword-variants.xml', urls: keywordVariantUrls },
    { name: 'sitemap-price.xml', urls: priceUrls },
    { name: 'sitemap-resources.xml', urls: resourceUrls },
    { name: 'sitemap-packs.xml', urls: packUrls },
    { name: 'sitemap-marcas.xml', urls: marcaUrls },
    { name: 'sitemap-en.xml', urls: enUrls },
    { name: 'sitemap-comercial.xml', urls: commercialUrls },
  ];

  let totalUrls = 0;
  for (const sm of sitemapFiles) {
    const filePath = path.join(outDir, sm.name);
    fs.writeFileSync(filePath, wrapUrlset(sm.urls), 'utf-8');
    totalUrls += sm.urls.length;
    console.log(`  ✅ ${sm.name}: ${sm.urls.length} URLs`);
  }

  // Write sitemap index
  const indexPath = path.join(outDir, 'sitemap.xml');
  fs.writeFileSync(indexPath, wrapSitemapIndex(sitemapFiles.map(s => s.name)), 'utf-8');

  console.log(`\n🗺️  Sitemap Index generated: ${sitemapFiles.length} sub-sitemaps, ${totalUrls} total URLs`);
  return totalUrls;
}

// ─── CLI Entry Point ─────────────────────────────────────────────
const isMainModule = process.argv[1]?.includes('generate-sitemap');
if (isMainModule) {
  const outDir = path.resolve(process.cwd(), 'public');
  console.log('🔧 Generating sitemaps...\n');
  generateSitemaps(outDir);
}
