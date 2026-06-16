/**
 * Static prerender for Kyro Clean Solutions
 *
 * Generates dist/{route}.html with:
 *  - Correct title / description / canonical in <head>
 *  - Full page content injected into <div id="root"> so Googlebot sees
 *    real H1, body text, FAQs and benefits without waiting for JS hydration
 *  - LocalBusiness JSON-LD on every page (local pack ranking signal)
 *  - Service + BreadcrumbList JSON-LD on service/material/price pages
 *  - FAQ JSON-LD on pages with FAQ content (rich results eligibility)
 *
 * IMPORTANT: must emit flat {route}.html files, NOT {route}/index.html.
 * Cloudflare Pages serves {route}.html directly for /{route} with no
 * redirect, matching React Router's exact (no-trailing-slash) routes.
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

// ─── Business constants (mirrors src/constants/business.ts) ────────────────
const BIZ_PHONE   = '+351925530647';
const BIZ_EMAIL   = 'cleansolutions.pt25@gmail.com';
const BIZ_RATING  = '5.0';
const BIZ_REVIEWS = '60';

// ─── HTML helpers ──────────────────────────────────────────────────────────

function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Replace <title>, meta description, canonical and OG tags in <head>. */
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

/**
 * Inject semantic HTML content into <div id="root"> so Googlebot reads real
 * body text on the first (no-JS) crawl pass.
 * React's createRoot().render() replaces this content when JS hydrates —
 * no hydration mismatch warnings, just a full DOM swap on load.
 */
function injectContent(html: string, bodyHtml: string): string {
  return html.replace('<div id="root"></div>', `<div id="root">${bodyHtml}</div>`);
}

/** Append a JSON-LD <script> just before </head>. */
function injectJsonLd(html: string, data: object): string {
  const script = `  <script type="application/ld+json">${JSON.stringify(data)}</script>`;
  return html.replace('</head>', `${script}\n</head>`);
}

// ─── JSON-LD schema builders ────────────────────────────────────────────────

/** LocalBusiness — injected on every page for local pack ranking. */
function buildLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Kyro Clean Solutions',
    url: BASE_URL,
    telephone: BIZ_PHONE,
    email: BIZ_EMAIL,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'R. de António Cardoso 263',
      addressLocality: 'Porto',
      postalCode: '4150-081',
      addressCountry: 'PT',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 41.1496,
      longitude: -8.6109,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: BIZ_RATING,
      reviewCount: BIZ_REVIEWS,
      bestRating: '5',
    },
    priceRange: '€€',
  };
}

/** BreadcrumbList — rich results in SERPs, helps Google understand site hierarchy. */
function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** Service — signals what's offered, where, at what price, with ratings. */
function buildServiceSchema(serviceName: string, cityName: string, priceFrom: string) {
  const price = priceFrom.replace(/[^0-9]/g, '') || '0';
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: serviceName,
    provider: {
      '@type': 'LocalBusiness',
      name: 'Kyro Clean Solutions',
      url: BASE_URL,
    },
    areaServed: {
      '@type': 'City',
      name: cityName,
    },
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: BIZ_RATING,
      reviewCount: BIZ_REVIEWS,
      bestRating: '5',
    },
  };
}

/** FAQPage — eligible for Google FAQ rich results (expandable Q&A in SERPs). */
function buildFaqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

// ─── Content HTML generators ───────────────────────────────────────────────

interface PageContent {
  h1: string;
  intro: string;
  localSection?: string;
  problems?: { title: string; description: string }[];
  howItWorks?: string;
  benefits?: string[];
  faqs?: { question: string; answer: string }[];
  processSteps?: { step: number; title: string; description: string }[];
  priceTable?: { item: string; price: string; note?: string }[];
}

function generatePageBody(c: PageContent): string {
  let html = `<main>\n<h1>${escHtml(c.h1)}</h1>\n<p>${escHtml(c.intro)}</p>\n`;

  if (c.localSection) {
    html += `<p>${escHtml(c.localSection)}</p>\n`;
  }

  if (c.problems?.length) {
    html += `<section>\n`;
    for (const p of c.problems) {
      html += `<div><h2>${escHtml(p.title)}</h2><p>${escHtml(p.description)}</p></div>\n`;
    }
    html += `</section>\n`;
  }

  if (c.processSteps?.length) {
    html += `<section><ol>\n`;
    for (const s of c.processSteps) {
      const desc = s.description ? ` ${escHtml(s.description)}` : '';
      html += `<li><strong>${escHtml(s.title)}</strong>${desc}</li>\n`;
    }
    html += `</ol></section>\n`;
  }

  if (c.priceTable?.length) {
    html += `<section><ul>\n`;
    for (const row of c.priceTable) {
      const note = row.note ? ` (${row.note})` : '';
      html += `<li>${escHtml(row.item)}: ${escHtml(row.price)}${escHtml(note)}</li>\n`;
    }
    html += `</ul></section>\n`;
  }

  if (c.howItWorks) {
    html += `<section><p>${escHtml(c.howItWorks)}</p></section>\n`;
  }

  if (c.benefits?.length) {
    html += `<section><ul>\n`;
    for (const b of c.benefits) html += `<li>${escHtml(b)}</li>\n`;
    html += `</ul></section>\n`;
  }

  if (c.faqs?.length) {
    html += `<section>\n`;
    for (const f of c.faqs) {
      html += `<div><h2>${escHtml(f.question)}</h2><p>${escHtml(f.answer)}</p></div>\n`;
    }
    html += `</section>\n`;
  }

  html += `</main>`;
  return html;
}

// ─── File writer ───────────────────────────────────────────────────────────

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

  // Pre-built constant — injected into every single page for local pack ranking.
  const LOCAL_BIZ = buildLocalBusinessSchema();

  /**
   * Emit a page: inject meta + optional body content + LocalBusiness on all
   * pages + any caller-provided schemas (FAQ, Service, BreadcrumbList, etc.).
   */
  function emit(
    routePath: string,
    title: string,
    desc: string,
    content?: PageContent,
    schemas?: object[],
  ): void {
    const canonical = `${BASE_URL}${routePath}`;
    let html = injectMeta(template, title, desc, canonical);
    if (content) html = injectContent(html, generatePageBody(content));
    // LocalBusiness on every page
    html = injectJsonLd(html, LOCAL_BIZ);
    // Caller-provided schemas (FAQ, Service, BreadcrumbList, etc.)
    for (const schema of schemas ?? []) {
      html = injectJsonLd(html, schema);
    }
    writeRoute(outDir, routePath, html);
    count++;
  }

  // ── 1. Location × Service pages (6 × 25 = 150) ─────────────────────────
  {
    const prev = count;
    for (const route of getAllLocationRoutes()) {
      const data = getLocationServiceData(route.serviceSlug, route.citySlug);
      if (!data) continue;
      const svc  = services.find(s => s.slug === route.serviceSlug)!;
      const city = cities.find(c => c.slug === route.citySlug)!;
      const schemas: object[] = [
        buildServiceSchema(svc.name, city.name, svc.priceFrom),
        buildBreadcrumbSchema([
          { name: 'Início',    url: BASE_URL + '/' },
          { name: svc.name,   url: `${BASE_URL}/${svc.slug}` },
          { name: city.name,  url: `${BASE_URL}${route.path}` },
        ]),
      ];
      if (data.faqs?.length) schemas.push(buildFaqSchema(data.faqs));
      emit(
        route.path,
        data.title,
        data.metaDescription,
        {
          h1: data.h1,
          intro: data.intro,
          localSection: data.localSection,
          problems: data.problems,
          howItWorks: data.howItWorks,
          benefits: data.benefits,
          faqs: data.faqs,
        },
        schemas,
      );
    }
    console.log(`  Location pages:          ${count - prev}`);
  }

  // ── 2. Freguesia × Service pages (~6 × 132 = ~792) ─────────────────────
  {
    const prev = count;
    const svcMap = new Map(services.map(s => [s.slug, s]));
    for (const route of getAllFreguesiaRoutes()) {
      const freg = getFreguesia(route.citySlug, route.freguesiaSlug);
      const svc  = svcMap.get(route.serviceSlug);
      if (!freg || !svc) continue;
      const content  = generateFreguesiaContent(
        svc.name, svc.slug, svc.priceFrom,
        freg.name, freg.slug, freg.municipio,
      );
      const cityObj  = cities.find(c => c.slug === route.citySlug);
      const cityName = cityObj?.name ?? route.citySlug;
      const schemas: object[] = [
        buildServiceSchema(svc.name, freg.name, svc.priceFrom),
        buildBreadcrumbSchema([
          { name: 'Início',   url: BASE_URL + '/' },
          { name: svc.name,  url: `${BASE_URL}/${svc.slug}` },
          { name: cityName,  url: `${BASE_URL}/${svc.slug}-${route.citySlug}` },
          { name: freg.name, url: `${BASE_URL}${route.path}` },
        ]),
      ];
      if (content.faqs?.length) schemas.push(buildFaqSchema(content.faqs));
      emit(
        route.path,
        content.title,
        content.metaDescription,
        {
          // content.intro already includes localSection
          h1: content.h1,
          intro: content.intro,
          problems: content.problems,
          howItWorks: content.howItWorks,
          benefits: content.benefits,
          faqs: content.faqs,
        },
        schemas,
      );
    }
    console.log(`  Freguesia pages:         ${count - prev}`);
  }

  // ── 3. Keyword variant pages (higienizacao / lavagem / impermeabilizacao) ─
  {
    const prev = count;
    for (const route of getAllKeywordVariantRoutes()) {
      const data = getKeywordVariantData(route.variantKey, route.serviceKey, route.locationPart);
      if (!data) continue;
      emit(
        route.path,
        data.title,
        data.metaDescription,
        {
          h1: data.h1,
          intro: data.intro,
          processSteps: data.processSteps,
        },
      );
    }
    console.log(`  Keyword variant pages:   ${count - prev}`);
  }

  // ── 4. Problem pages (~52) ──────────────────────────────────────────────
  {
    const prev = count;
    for (const p of getAllProblems()) {
      emit(
        `/problemas/${p.slug}`,
        p.title,
        p.metaDescription,
        { h1: p.h1 ?? p.title, intro: p.metaDescription },
      );
    }
    console.log(`  Problem pages:           ${count - prev}`);
  }

  // ── 5. Problem × City pages (~375) ──────────────────────────────────────
  {
    const prev = count;
    for (const route of getAllProblemCityRoutes()) {
      const problem = getProblemBySlug(route.problemSlug);
      const city    = cities.find(c => c.slug === route.citySlug);
      if (!problem || !city) continue;
      const title = `${problem.h1} em ${city.name} | Kyro Clean Solutions`;
      const desc  = `${problem.h1} em ${city.name}: serviço profissional ao domicílio. ${problem.metaDescription.split('.')[0]}. Orçamento grátis em menos de 2 horas.`;
      const schemas: object[] = [
        buildBreadcrumbSchema([
          { name: 'Início',      url: BASE_URL + '/' },
          { name: problem.h1,   url: `${BASE_URL}/problemas/${route.problemSlug}` },
          { name: city.name,    url: `${BASE_URL}${route.path}` },
        ]),
      ];
      emit(
        route.path,
        title,
        desc,
        { h1: `${problem.h1} em ${city.name}`, intro: desc },
        schemas,
      );
    }
    console.log(`  Problem × City pages:    ${count - prev}`);
  }

  // ── 6. Material pages + Material × City (11 + 275) ─────────────────────
  {
    const prev = count;

    // Material base pages (no city)
    for (const mat of getAllMaterials()) {
      const schemas: object[] = [
        buildServiceSchema(mat.serviceName, 'Portugal', '39€'),
        buildBreadcrumbSchema([
          { name: 'Início',        url: BASE_URL + '/' },
          { name: mat.serviceName, url: `${BASE_URL}/${mat.serviceSlug}` },
          { name: mat.name,        url: `${BASE_URL}/${mat.slug}` },
        ]),
      ];
      if (mat.faqs?.length) schemas.push(buildFaqSchema(mat.faqs));
      emit(
        `/${mat.slug}`,
        mat.title,
        mat.metaDescription,
        {
          h1: mat.h1,
          intro: mat.intro,
          // characteristics → benefits ul list
          benefits: mat.characteristics,
          // cleaningProcess → ordered process steps
          processSteps: mat.cleaningProcess.map((step, i) => ({
            step: i + 1,
            title: step,
            description: '',
          })),
          faqs: mat.faqs,
        },
        schemas,
      );
    }

    // Material × City pages
    for (const route of getAllMaterialCityRoutes()) {
      const data = getMaterialCityData(route.materialSlug, route.citySlug);
      if (!data) continue;
      const schemas: object[] = [
        buildServiceSchema(data.serviceName, data.city, '39€'),
        buildBreadcrumbSchema([
          { name: 'Início',        url: BASE_URL + '/' },
          { name: data.serviceName, url: `${BASE_URL}/${data.serviceSlug}` },
          { name: data.name,       url: `${BASE_URL}/${data.slug}` },
          { name: data.city,       url: `${BASE_URL}${route.path}` },
        ]),
      ];
      if (data.faqs?.length) schemas.push(buildFaqSchema(data.faqs));
      emit(
        route.path,
        data.title,
        data.metaDescription,
        {
          h1: data.h1,
          intro: data.intro,
          benefits: data.characteristics,
          processSteps: data.cleaningProcess.map((step, i) => ({
            step: i + 1,
            title: step,
            description: '',
          })),
          faqs: data.faqs,
        },
        schemas,
      );
    }
    console.log(`  Material pages:          ${count - prev}`);
  }

  // ── 7. Price pages (6 × 25 = 150) ───────────────────────────────────────
  {
    const prev = count;
    for (const route of getAllPriceRoutes()) {
      const data = getPricePageData(route.serviceSlug, route.citySlug);
      if (!data) continue;
      const svc = services.find(s => s.slug === route.serviceSlug);
      const schemas: object[] = [
        buildServiceSchema(data.serviceName, data.cityName, svc?.priceFrom ?? '49€'),
        buildBreadcrumbSchema([
          { name: 'Início',                     url: BASE_URL + '/' },
          { name: data.serviceName,             url: `${BASE_URL}/${route.serviceSlug}` },
          { name: `Preço em ${data.cityName}`,  url: `${BASE_URL}${route.path}` },
        ]),
      ];
      if (data.faqs?.length) schemas.push(buildFaqSchema(data.faqs));
      emit(
        route.path,
        data.title,
        data.metaDescription,
        {
          h1: data.h1,
          intro: data.intro,
          // Price table as a structured list (Googlebot reads it clearly)
          priceTable: data.priceTable,
          // Factors that influence price as a ul list
          benefits: data.factors,
          faqs: data.faqs,
        },
        schemas,
      );
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
      const desc  = `${data.pack.description} Poupe até 10% em relação ao preço individual. Serviço ao domicílio em ${data.city.name}.`;
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
      const desc  = `Especialistas em limpeza de sofás ${data.marca.name} em ${data.city.name}. ${data.marca.material}. ${data.marca.estimatedPriceRange}. Serviço ao domicílio.`;
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
