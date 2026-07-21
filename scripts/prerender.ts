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
  const price = priceFrom.replace(',', '.').replace(/[^0-9.]/g, '') || '0';
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
          localSection: data.whatIs,
          problems: data.problems,
          processSteps: data.processSteps,
          benefits: data.benefits,
          faqs: data.faqs,
        },
        data.faqs?.length ? [buildFaqSchema(data.faqs)] : [],
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
      const matPriceFrom = services.find(s => s.slug === mat.serviceSlug)?.priceFrom ?? '49€';
      const schemas: object[] = [
        buildServiceSchema(mat.serviceName, 'Portugal', matPriceFrom),
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
      const dataPriceFrom = services.find(s => s.slug === data.serviceSlug)?.priceFrom ?? '49€';
      const schemas: object[] = [
        buildServiceSchema(data.serviceName, data.city, dataPriceFrom),
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

  // ── 10. Core static pages (service hubs, editorial, packs) ─────────────
  {
    const prev = count;

    const faqs = (pairs: { q: string; a: string }[]) =>
      pairs.map(p => ({ question: p.q, answer: p.a }));

    type CorePage = {
      path: string;
      title: string;
      desc: string;
      content: PageContent;
      extraSchemas?: object[];
    };

    const CORE: CorePage[] = [
      {
        path: '/limpeza-sofas',
        title: 'Limpeza de Sofás ao Domicílio | Desde 49€ | Kyro Clean Solutions',
        desc: 'Limpeza profissional de sofás ao domicílio. Remoção de manchas, ácaros e odores com extração profissional. Resultados visíveis no momento. Porto, Lisboa e todo o país.',
        content: {
          h1: 'Limpeza de Sofás ao Domicílio',
          intro: 'Serviço profissional de limpeza de sofás ao domicílio em todo o país. Removemos manchas, ácaros e odores com equipamento de extração profissional. Resultados visíveis no momento, sem necessidade de sair de casa.',
          processSteps: [
            { step: 1, title: 'Diagnóstico gratuito', description: 'Avaliamos o material e o estado do estofo no local.' },
            { step: 2, title: 'Pré-tratamento', description: 'Aplicamos produto específico nas manchas e zonas críticas.' },
            { step: 3, title: 'Extração profissional', description: 'Máquina de extração a vapor remove sujidade em profundidade.' },
            { step: 4, title: 'Resultado garantido', description: 'Sofá limpo e seco em 4 a 6 horas, pronto a usar.' },
          ],
          benefits: [
            'Remoção de ácaros, bactérias e alergénios',
            'Eliminação de manchas de vinho, café, gordura e sangue',
            'Eliminação de odores de animais domésticos e fumo',
            'Secagem rápida em 4 a 6 horas',
            'Técnicos certificados com produtos eco-friendly',
            'Serviço ao domicílio sem custos ocultos',
          ],
          faqs: faqs([
            { q: 'Quanto custa a limpeza de sofá?', a: 'A limpeza de sofá começa a partir de 49€ para sofás de 1 lugar, 69€ para 2 lugares e 79€ para 3 lugares. Peça orçamento gratuito sem compromisso.' },
            { q: 'Quanto tempo demora a limpeza de sofá?', a: 'O serviço demora entre 1 a 3 horas conforme o tamanho e estado do sofá. O sofá fica pronto a usar em 4 a 6 horas após a limpeza.' },
            { q: 'A limpeza remove manchas antigas do sofá?', a: 'Sim. Tratamos manchas de vinho, café, gordura e sangue com pré-tratamento específico. Manchas muito antigas podem não sair completamente, mas apresentamos sempre o melhor resultado possível.' },
            { q: 'Fazem limpeza de sofás ao domicílio em todo o país?', a: 'Sim. O nosso serviço cobre todo o país: Porto, Lisboa, Braga, Coimbra e arredores.' },
          ]),
        },
        extraSchemas: [
          buildServiceSchema('Limpeza de Sofás', 'Portugal', '49€'),
          buildBreadcrumbSchema([
            { name: 'Início', url: BASE_URL + '/' },
            { name: 'Limpeza de Sofás', url: BASE_URL + '/limpeza-sofas' },
          ]),
        ],
      },
      {
        path: '/limpeza-colchoes',
        title: 'Limpeza e Higienização de Colchões | Desde 49€ | Kyro Clean Solutions',
        desc: 'Higienização profissional de colchões ao domicílio. Eliminamos ácaros, bactérias e odores para noites mais saudáveis. Desde 49€. Porto, Lisboa e todo o país.',
        content: {
          h1: 'Limpeza e Higienização de Colchões ao Domicílio',
          intro: 'Serviço de higienização profunda de colchões ao domicílio. Eliminamos até 99% dos ácaros, bactérias e fungos com extração profissional. Noites mais saudáveis a partir de 49€.',
          processSteps: [
            { step: 1, title: 'Aspiração profunda', description: 'Remoção de ácaros e partículas superficiais com aspirador HEPA.' },
            { step: 2, title: 'Tratamento antimicrobiano', description: 'Aplicação de produto específico contra fungos, bactérias e ácaros.' },
            { step: 3, title: 'Extração e higienização', description: 'Lavagem em profundidade com extração de vapor profissional.' },
            { step: 4, title: 'Secagem controlada', description: 'Colchão pronto a usar em 4 a 8 horas.' },
          ],
          benefits: [
            'Eliminação de até 99% dos ácaros e alergénios',
            'Remoção de manchas de suor, líquidos e acidentes',
            'Eliminação de odores e fungos',
            'Redução de alergias e problemas respiratórios',
            'Secagem em 4 a 8 horas',
            'Produto certificado e seguro para crianças e animais',
          ],
          faqs: faqs([
            { q: 'Quanto custa a limpeza de colchão?', a: 'A limpeza de colchão começa a partir de 49€ para solteiro, 69€ para casal e 79€ para king. Peça orçamento gratuito.' },
            { q: 'Com que frequência devo limpar o colchão?', a: 'Recomendamos higienização profissional a cada 6 a 12 meses. Em casos de alergias, gravidez ou crianças pequenas, idealmente cada 6 meses.' },
            { q: 'A limpeza elimina os ácaros do colchão?', a: 'Sim. O nosso processo elimina até 99% dos ácaros, ovos e alergénios presentes no colchão, com tratamento antimicrobiano de duração até 6 meses.' },
            { q: 'Fazem limpeza de colchões ao domicílio?', a: 'Sim. O técnico desloca-se a sua casa com todo o equipamento. Não precisa de retirar o colchão nem de se deslocar.' },
          ]),
        },
        extraSchemas: [
          buildServiceSchema('Limpeza de Colchões', 'Portugal', '49€'),
          buildBreadcrumbSchema([
            { name: 'Início', url: BASE_URL + '/' },
            { name: 'Limpeza de Colchões', url: BASE_URL + '/limpeza-colchoes' },
          ]),
        ],
      },
      {
        path: '/limpeza-tapetes',
        title: 'Limpeza e Lavagem de Tapetes | Desde 12€/m² | Kyro Clean Solutions',
        desc: 'Lavagem profissional de tapetes com extração profunda. Removemos sujidade, manchas e alergénios. Serviço ao domicílio em todo o país. Desde 12€/m².',
        content: {
          h1: 'Limpeza e Lavagem de Tapetes ao Domicílio',
          intro: 'Limpeza profissional de tapetes ao domicílio com extração profunda. Removemos sujidade acumulada, manchas difíceis e alergénios. Tapetes persas, shaggy, sisal e todos os tipos tratados com produto específico ao material.',
          benefits: [
            'Remoção de manchas de vinho, café, gordura e tinta',
            'Eliminação de ácaros e alergénios das fibras',
            'Recuperação das cores e textura original',
            'Tratamento específico por tipo de fibra',
            'Secagem em 4 a 8 horas',
            'Serviço ao domicílio sem necessidade de recolha',
          ],
          faqs: faqs([
            { q: 'Quanto custa a limpeza de tapete?', a: 'O preço depende da área: até 5m² é 12€/m², de 5 a 10m² é 10€/m² e de 10 a 15m² é 9€/m². Para áreas maiores peça orçamento.' },
            { q: 'Quanto tempo demora a limpeza de tapete?', a: 'O serviço demora 1 a 2 horas. O tapete fica seco em 4 a 8 horas, dependendo da espessura e material.' },
            { q: 'Que tipos de tapete limpam?', a: 'Limpamos todos os tipos: persas, shaggy, sisal, juta, lã, acrílico, polipropileno e fibras naturais. O produto é sempre adaptado ao material.' },
            { q: 'Fazem limpeza de tapetes ao domicílio?', a: 'Sim. O técnico desloca-se a sua casa com equipamento de extração profissional. Não precisa de entregar o tapete.' },
          ]),
        },
        extraSchemas: [
          buildServiceSchema('Limpeza de Tapetes', 'Portugal', '12€'),
          buildBreadcrumbSchema([
            { name: 'Início', url: BASE_URL + '/' },
            { name: 'Limpeza de Tapetes', url: BASE_URL + '/limpeza-tapetes' },
          ]),
        ],
      },
      {
        path: '/limpeza-cadeiras',
        title: 'Limpeza de Cadeiras Estofadas | Desde 20€ | Kyro Clean Solutions',
        desc: 'Limpeza profissional de cadeiras estofadas ao domicílio. Ideal para residências, escritórios e restaurantes. Resultados visíveis no momento. Desde 20€/cadeira.',
        content: {
          h1: 'Limpeza de Cadeiras Estofadas ao Domicílio',
          intro: 'Serviço profissional de limpeza de cadeiras estofadas ao domicílio. Removemos sujidade de uso diário, manchas de comida e odores com extração profissional. Ideal para residências, escritórios e restaurantes.',
          benefits: [
            'Remoção de manchas de comida, bebida e gordura',
            'Eliminação de bactérias e germes de superfície',
            'Eliminação de odores de cozinha e uso intenso',
            'Tratamento específico por tipo de tecido',
            'Secagem rápida em 2 a 4 horas',
            'Preço por volume: quanto mais cadeiras, menor o preço unitário',
          ],
          faqs: faqs([
            { q: 'Quanto custa a limpeza de cadeiras?', a: 'O preço por cadeira diminui com a quantidade: até 4 cadeiras é 20€/unid., de 5 a 6 é 15€/unid., de 7 a 10 é 12,50€/unid. e a partir de 11 cadeiras por orçamento.' },
            { q: 'Limpam cadeiras de escritório?', a: 'Sim. Limpamos cadeiras de escritório, sala de jantar, poltronas e bancos. O serviço é ao domicílio ou no local de trabalho.' },
            { q: 'Quanto tempo demora a limpeza de cadeiras?', a: 'Cada cadeira demora 15 a 30 minutos. Um conjunto de 6 cadeiras leva cerca de 2 horas. As cadeiras ficam secas em 2 a 4 horas.' },
            { q: 'Fazem limpeza de cadeiras em quantidade para restaurantes?', a: 'Sim. Para restaurantes, hotéis e escritórios temos condições especiais. Contacte-nos para orçamento personalizado.' },
          ]),
        },
        extraSchemas: [
          buildServiceSchema('Limpeza de Cadeiras', 'Portugal', '20€'),
          buildBreadcrumbSchema([
            { name: 'Início', url: BASE_URL + '/' },
            { name: 'Limpeza de Cadeiras', url: BASE_URL + '/limpeza-cadeiras' },
          ]),
        ],
      },
      {
        path: '/limpeza-alcatifas',
        title: 'Limpeza de Alcatifas | Desde 3€/m² | Kyro Clean Solutions',
        desc: 'Limpeza profissional de alcatifas com extração profunda. Removemos sujidade acumulada, manchas e alergénios. Secagem rápida. Porto, Lisboa e todo o país.',
        content: {
          h1: 'Limpeza de Alcatifas ao Domicílio',
          intro: 'Serviço profissional de limpeza de alcatifas ao domicílio com extração profunda. Tratamos alcatifas residenciais e comerciais, removendo sujidade acumulada nas fibras, manchas de passagem e alergénios em profundidade.',
          benefits: [
            'Limpeza em profundidade das fibras compactadas',
            'Remoção de manchas de zonas de passagem intensa',
            'Eliminação de ácaros e alergénios',
            'Recuperação da textura e cor original',
            'Ideal para escritórios, hotéis e grandes superfícies',
            'Secagem em 4 a 8 horas',
          ],
          faqs: faqs([
            { q: 'Quanto custa a limpeza de alcatifa?', a: 'A limpeza de alcatifa começa a partir de 3€/m². Para grandes superfícies o preço é calculado por orçamento.' },
            { q: 'Qual a diferença entre tapete e alcatifa?', a: 'Tapetes são peças soltas; alcatifas são revestimentos fixos que cobrem toda a divisão. Tratamos ambos ao domicílio com equipamento profissional.' },
            { q: 'Limpam alcatifas de escritório?', a: 'Sim. Temos disponibilidade para escritórios, hotéis, clínicas e outros espaços comerciais, incluindo fora do horário comercial.' },
            { q: 'A alcatifa fica molhada muito tempo?', a: 'Com o nosso equipamento de extração profissional, a alcatifa fica seca em 4 a 8 horas dependendo da espessura e ventilação.' },
          ]),
        },
        extraSchemas: [
          buildServiceSchema('Limpeza de Alcatifas', 'Portugal', '3€'),
          buildBreadcrumbSchema([
            { name: 'Início', url: BASE_URL + '/' },
            { name: 'Limpeza de Alcatifas', url: BASE_URL + '/limpeza-alcatifas' },
          ]),
        ],
      },
      {
        path: '/impermeabilizacao',
        title: 'Impermeabilização de Estofos | Proteção até 10 anos | Kyro Clean Solutions',
        desc: 'Impermeabilização profissional de sofás, cadeiras e tapetes. Proteção invisível contra manchas e líquidos. Duração até 10 anos. Desde 69€. Serviço ao domicílio.',
        content: {
          h1: 'Impermeabilização de Estofos e Tapetes',
          intro: 'Proteja os seus estofos com impermeabilização profissional ao domicílio. Barreira invisível contra manchas, líquidos e desgaste com duração até 10 anos. Ideal após limpeza ou em estofos novos.',
          benefits: [
            'Proteção invisível que não altera a textura nem a cor',
            'Repelência a líquidos, manchas de vinho e gordura',
            'Duração até 10 anos com manutenção adequada',
            'Reduz a frequência de limpezas necessárias',
            'Ideal para famílias com crianças e animais domésticos',
            'Produto certificado e eco-friendly',
          ],
          faqs: faqs([
            { q: 'O que é a impermeabilização de estofos?', a: 'A impermeabilização cria uma barreira nano-tecnológica invisível na fibra do estofo que repele líquidos e dificulta a penetração de manchas. O tecido mantém a aparência e textura originais.' },
            { q: 'Quanto custa a impermeabilização?', a: 'A impermeabilização de sofá começa a partir de 69€ para 1 lugar. Para cadeiras o preço parte de 25€ por unidade. Peça orçamento gratuito.' },
            { q: 'Quanto tempo dura a impermeabilização?', a: 'A duração é de 2 a 10 anos dependendo do uso, tipo de tecido e produto aplicado. Recomendamos renovação após limpeza profissional.' },
            { q: 'Posso fazer impermeabilização sem limpeza prévia?', a: 'Recomendamos sempre limpeza prévia para maior eficácia. Temos packs combinados de limpeza e impermeabilização com desconto.' },
          ]),
        },
        extraSchemas: [
          buildServiceSchema('Impermeabilização de Estofos', 'Portugal', '69€'),
          buildBreadcrumbSchema([
            { name: 'Início', url: BASE_URL + '/' },
            { name: 'Impermeabilização', url: BASE_URL + '/impermeabilizacao' },
          ]),
        ],
      },
      {
        path: '/packs',
        title: 'Packs Limpeza + Impermeabilização | Até 10% Desconto | Kyro Clean Solutions',
        desc: 'Packs exclusivos de limpeza e impermeabilização com até 10% de desconto. Sofá + Colchão, Sala Completa e mais. Serviço ao domicílio. Peça orçamento grátis.',
        content: {
          h1: 'Packs de Limpeza e Impermeabilização',
          intro: 'Packs exclusivos que combinam limpeza e impermeabilização com até 10% de desconto. Numa só visita, o técnico trata todos os seus estofos com o melhor preço.',
          benefits: [
            'Pack Sofá + Colchão — tratamento completo em uma visita',
            'Pack Sala Completa — sofá, tapete e cadeiras',
            'Pack Quarto Completo — colchão e almofadas',
            'Pack Sofá + Impermeabilização — proteção duradoura',
            'Poupança até 10% vs serviços individuais',
            'Agendamento flexível, incluindo fins de semana',
          ],
        },
        extraSchemas: [
          buildBreadcrumbSchema([
            { name: 'Início', url: BASE_URL + '/' },
            { name: 'Packs', url: BASE_URL + '/packs' },
          ]),
        ],
      },
      {
        path: '/pack-sofa-colchao',
        title: 'Pack Sofá + Colchão | Limpeza Combinada com 10% Desconto | Kyro Clean',
        desc: 'Pack exclusivo de limpeza de sofá e colchão numa só visita. 10% de desconto. Porto, Lisboa e todo o país. Orçamento grátis.',
        content: {
          h1: 'Pack Sofá + Colchão',
          intro: 'Limpe o sofá e o colchão numa só visita com 10% de desconto vs preços individuais. O técnico trata ambos com equipamento profissional, poupando tempo e dinheiro.',
        },
        extraSchemas: [
          buildBreadcrumbSchema([
            { name: 'Início', url: BASE_URL + '/' },
            { name: 'Packs', url: BASE_URL + '/packs' },
            { name: 'Pack Sofá + Colchão', url: BASE_URL + '/pack-sofa-colchao' },
          ]),
        ],
      },
      {
        path: '/pack-sofa-impermeabilizacao',
        title: 'Pack Sofá + Impermeabilização | Limpeza e Proteção | Kyro Clean',
        desc: 'Limpe e impermeabilize o seu sofá na mesma visita com desconto. Limpeza profissional + proteção contra manchas. Orçamento grátis.',
        content: {
          h1: 'Pack Sofá + Impermeabilização',
          intro: 'Combine a limpeza profissional do sofá com impermeabilização numa só visita. Resultado imediato e proteção duradoura contra manchas e líquidos.',
        },
        extraSchemas: [
          buildBreadcrumbSchema([
            { name: 'Início', url: BASE_URL + '/' },
            { name: 'Packs', url: BASE_URL + '/packs' },
            { name: 'Pack Sofá + Impermeabilização', url: BASE_URL + '/pack-sofa-impermeabilizacao' },
          ]),
        ],
      },
      {
        path: '/guia-de-packs',
        title: 'Guia de Packs de Limpeza | Kyro Clean Solutions',
        desc: 'Escolha o pack de limpeza ideal para a sua casa. Packs com desconto para sofá, colchão, tapetes e mais. Orçamento grátis.',
        content: {
          h1: 'Guia de Packs de Limpeza',
          intro: 'Escolha o pack de limpeza profissional mais adequado para a sua casa. Compare todos os packs disponíveis, poupanças e o que cada um inclui.',
        },
      },
      {
        path: '/blog',
        title: 'Blog Limpeza de Estofos | Dicas, Guias e Preços | Kyro Clean',
        desc: 'Artigos especializados sobre limpeza de sofás, tapetes e colchões. Dicas profissionais, guias de manutenção e preços reais.',
        content: {
          h1: 'Blog Kyro Clean Solutions',
          intro: 'Artigos especializados sobre limpeza profissional de estofos. Dicas de manutenção, guias de preços, comparações de materiais e conselhos do técnico.',
        },
      },
      {
        path: '/antes-depois-limpeza',
        title: 'Antes e Depois | Resultados Reais de Limpeza Profissional | Kyro Clean',
        desc: 'Veja os resultados reais da limpeza profissional de sofás, colchões, tapetes e cadeiras. Antes e depois de cada serviço. Sem filtros, sem retoques.',
        content: {
          h1: 'Antes e Depois — Resultados Reais',
          intro: 'Galeria com fotografias reais de trabalhos realizados pela Kyro Clean Solutions. Resultados antes e depois de limpeza de sofás, colchões, tapetes e cadeiras. Sem filtros nem retoques.',
        },
      },
      {
        path: '/testemunhos',
        title: 'Testemunhos de Clientes | Kyro Clean Solutions | 5.0 Google',
        desc: 'Veja o que dizem os nossos clientes. Avaliação 5.0 no Google com mais de 1000 clientes satisfeitos em todo o país.',
        content: {
          h1: 'Testemunhos de Clientes',
          intro: 'Mais de 1000 clientes em todo o país confiaram os seus estofos à Kyro Clean Solutions. Avaliação 5.0 estrelas no Google. Leia as histórias dos nossos clientes.',
        },
      },
      {
        path: '/areas-de-servico',
        title: 'Áreas de Serviço | Porto, Lisboa e Todo o País | Kyro Clean Solutions',
        desc: 'Serviços de limpeza profissional de estofos disponíveis em todo o país. Porto, Gaia, Matosinhos, Lisboa, Braga e muito mais.',
        content: {
          h1: 'Áreas de Serviço',
          intro: 'A Kyro Clean Solutions presta serviços de limpeza profissional de estofos em todo o país: Porto, Vila Nova de Gaia, Matosinhos, Maia, Lisboa, Braga, Guimarães, Coimbra e muito mais.',
          benefits: [
            'Porto e Grande Porto — sem custo de deslocação',
            'Braga e Guimarães — disponível todos os dias',
            'Lisboa e área metropolitana — agendamento em 48h',
            'Aveiro e Coimbra — serviço disponível',
            'Todo o território continental — por orçamento',
          ],
        },
      },
      {
        path: '/nosso-processo',
        title: 'O Nosso Processo | Kyro Clean Solutions',
        desc: 'Conheça o processo de limpeza profissional da Kyro Clean Solutions. Tecnologia avançada, produtos certificados e resultados garantidos.',
        content: {
          h1: 'O Nosso Processo de Limpeza',
          intro: 'O processo de limpeza profissional da Kyro Clean Solutions combina diagnóstico, pré-tratamento, extração profissional e secagem controlada para resultados garantidos.',
          processSteps: [
            { step: 1, title: 'Diagnóstico', description: 'Avaliamos o material, manchas e estado geral do estofo.' },
            { step: 2, title: 'Pré-tratamento', description: 'Aplicamos produtos específicos por tipo de mancha e tecido.' },
            { step: 3, title: 'Extração profissional', description: 'Equipamento de vapor profissional limpa em profundidade.' },
            { step: 4, title: 'Resultado garantido', description: 'Estofo limpo, seco e como novo. Resultados visíveis no momento.' },
          ],
        },
      },
      {
        path: '/perguntas-frequentes-limpeza-estofos',
        title: 'Perguntas Frequentes | Limpeza de Estofos | Kyro Clean Solutions',
        desc: 'Respostas às perguntas mais comuns sobre limpeza profissional de sofás, colchões e tapetes. Preços, duração, materiais e mais.',
        content: {
          h1: 'Perguntas Frequentes sobre Limpeza de Estofos',
          intro: 'Encontre respostas às dúvidas mais comuns sobre limpeza profissional de sofás, colchões, tapetes e cadeiras.',
          faqs: faqs([
            { q: 'Qual o preço da limpeza de sofá?', a: 'A limpeza de sofá começa a partir de 49€ para 1 lugar, 69€ para 2 lugares e 79€ para 3 lugares. Peça orçamento grátis.' },
            { q: 'Fazem serviço ao domicílio?', a: 'Sim, todos os serviços são realizados ao domicílio. O técnico desloca-se até si com todo o equipamento.' },
            { q: 'Quanto tempo demora o serviço?', a: 'Um sofá demora 1 a 3 horas. Um colchão 1 a 2 horas. O estofo fica seco em 4 a 8 horas.' },
            { q: 'Os produtos são seguros para crianças e animais?', a: 'Sim. Usamos apenas produtos certificados, biodegradáveis e seguros para pessoas, crianças e animais domésticos.' },
          ]),
        },
      },
      {
        path: '/glossario-limpeza-estofos',
        title: 'Glossário de Limpeza de Estofos | Termos Técnicos | Kyro Clean',
        desc: 'Dicionário completo com termos técnicos de limpeza profissional de estofos. Saiba o que significa extração, impermeabilização e muito mais.',
        content: {
          h1: 'Glossário de Limpeza de Estofos',
          intro: 'Dicionário com os principais termos técnicos de limpeza profissional de estofos. Perceba o que significam extração, higienização, impermeabilização e outros conceitos.',
        },
      },
    ];

    for (const page of CORE) {
      const schemas = [...(page.extraSchemas ?? [])];
      if (page.content.faqs?.length) schemas.push(buildFaqSchema(page.content.faqs));
      emit(page.path, page.title, page.desc, page.content, schemas);
    }
    console.log(`  Core static pages:       ${count - prev}`);
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
