/**
 * Sitemap Generator for Kyro Clean Solutions
 * Generates a Sitemap Index + sub-sitemaps covering all ~1700+ URLs
 * 
 * Can be run standalone: npx tsx scripts/generate-sitemap.ts
 * Also integrated as Vite post-build plugin
 */

import fs from 'fs';
import path from 'path';
import { getVisibleProblems } from '../src/data/problemSeoData';
import { getAllProblemCityRoutes } from '../src/data/problemCitySeoData';
import { getAllMaterialRoutes, getAllMaterialCityRoutes } from '../src/data/materialSeoData';
import { getAllKeywordVariantRoutes } from '../src/data/keywordVariantData';
import { getAllEnRoutes } from '../src/data/enTouristSeoData';
import { getAllCommercialRoutes } from '../src/data/commercialSeoData';

const BASE_URL = 'https://cleansolutions.com.pt';
const TODAY = new Date().toISOString().split('T')[0];

// ─── Data (mirrors src/data/) ────────────────────────────────────

const cities = [
  { slug: "porto", region: "primary" },
  { slug: "matosinhos", region: "secondary" },
  { slug: "maia", region: "secondary" },
  { slug: "vila-nova-de-gaia", region: "secondary" },
  { slug: "gondomar", region: "secondary" },
  { slug: "valongo", region: "secondary" },
  { slug: "povoa-de-varzim", region: "secondary" },
  { slug: "vila-do-conde", region: "secondary" },
  { slug: "paredes", region: "secondary" },
  { slug: "penafiel", region: "secondary" },
  { slug: "lousada", region: "secondary" },
  { slug: "pacos-de-ferreira", region: "secondary" },
  { slug: "felgueiras", region: "secondary" },
  { slug: "santo-tirso", region: "secondary" },
  { slug: "trofa", region: "secondary" },
  { slug: "espinho", region: "secondary" },
  { slug: "arouca", region: "secondary" },
  { slug: "braga", region: "secondary" },
  { slug: "guimaraes", region: "secondary" },
  { slug: "lisboa", region: "primary" },
  { slug: "amadora", region: "secondary" },
  { slug: "odivelas", region: "secondary" },
  { slug: "oeiras", region: "secondary" },
  { slug: "cascais", region: "secondary" },
  { slug: "sintra", region: "secondary" },
  { slug: "loures", region: "secondary" },
  { slug: "almada", region: "secondary" },
  { slug: "seixal", region: "secondary" },
  { slug: "vila-franca-de-xira", region: "secondary" },
  { slug: "barreiro", region: "secondary" },
  { slug: "moita", region: "secondary" },
  { slug: "mafra", region: "secondary" },
  { slug: "setubal", region: "secondary" },
  { slug: "montijo", region: "secondary" },
  { slug: "alcochete", region: "secondary" },
  { slug: "palmela", region: "secondary" },
  { slug: "sesimbra", region: "secondary" },
  { slug: "faro", region: "primary" },
  { slug: "loule", region: "secondary" },
  { slug: "albufeira", region: "secondary" },
  { slug: "olhao", region: "secondary" },
  { slug: "sao-bras-de-alportel", region: "secondary" },
  { slug: "silves", region: "secondary" },
  { slug: "lagoa-algarve", region: "secondary" },
  { slug: "tavira", region: "secondary" },
  { slug: "portimao", region: "secondary" },
  { slug: "lagos", region: "secondary" },
  { slug: "vila-real-de-santo-antonio", region: "secondary" },
  { slug: "castro-marim", region: "secondary" },
  { slug: "monchique", region: "secondary" },
  { slug: "aljezur", region: "secondary" },
  { slug: "vila-do-bispo", region: "secondary" },
  { slug: "alcoutim", region: "secondary" },
];

const services = [
  { slug: "limpeza-sofas" },
  { slug: "limpeza-colchoes" },
  { slug: "limpeza-tapetes" },
  { slug: "limpeza-cadeiras" },
  { slug: "limpeza-alcatifas" },
  { slug: "impermeabilizacao" },
];

const municipiosComFreguesias = [
  { slug: "porto", freguesias: ["paranhos","ramalde","bonfim","campanha","cedofeita","lordelo-do-ouro","aldoar","foz-do-douro","nevogilde","massarelos","miragaia","santo-ildefonso","se","sao-nicolau","vitoria"] },
  { slug: "matosinhos", freguesias: ["matosinhos-centro","leca-da-palmeira","sao-mamede-de-infesta","senhora-da-hora","custoias","leca-do-balio","guifoes","perafita","lavra","santa-cruz-do-bispo"] },
  { slug: "maia", freguesias: ["cidade-da-maia","aguas-santas","castelo-da-maia","moreira-maia","nogueira-maia","silva-escura","folgosa-maia","vila-nova-da-telha","milheiros","vermoim"] },
  { slug: "vila-nova-de-gaia", freguesias: ["mafamude","santa-marinha","afurada","canidelo","madalena","valadares","gulpilhares","arcozelo","sao-felix-da-marinha","oliveira-do-douro","vilar-do-paraiso","vilar-de-andorinho","avintes","canelas","pedroso","serzedo","perosinho","grijo","sermonde"] },
  { slug: "gondomar", freguesias: ["rio-tinto","baguim-do-monte","fanzeres","sao-pedro-da-cova","valbom","gondomar-centro","jovim","foz-do-sousa","lomba","covelo","melres","medas"] },
  { slug: "valongo", freguesias: ["valongo-centro","ermesinde","alfena","campo-valongo","sobrado-valongo"] },
  { slug: "paredes", freguesias: ["paredes-centro","rebordosa","gandra","baltar","lordelo-paredes","aguiar-de-sousa","cete","paco-de-sousa"] },
  { slug: "penafiel", freguesias: ["penafiel-centro","paco-de-sousa-penafiel","bustelo","guilhufe","marecos","rio-de-moinhos"] },
  { slug: "lousada", freguesias: ["lousada-centro","silvares","lustosa","caide-de-rei","nespereira-lousada"] },
  { slug: "pacos-de-ferreira", freguesias: ["pacos-de-ferreira-centro","freamunde","frazao","carvalhosa","seroa"] },
  { slug: "felgueiras", freguesias: ["felgueiras-centro","margaride","lixa","barrosas","idaes"] },
  { slug: "santo-tirso", freguesias: ["santo-tirso-centro","sao-tome-de-negrelos","vilarinho-santo-tirso","areias-santo-tirso","negrelos"] },
  { slug: "trofa", freguesias: ["trofa-centro","sao-romao-do-coronado","sao-martinho-de-bougado","guidoes","alvarelhos"] },
  { slug: "povoa-de-varzim", freguesias: ["povoa-de-varzim-centro","aver-o-mar","agucadoura","navais","beiriz","argivai"] },
  { slug: "vila-do-conde", freguesias: ["vila-do-conde-centro","azurara","mindelo","vila-cha","labruge","modivas"] },
  { slug: "espinho", freguesias: ["espinho-centro","silvalde","anta-espinho","paramos","guetim"] },
  { slug: "arouca", freguesias: ["arouca-centro","escariz","urro","alvarenga","moldes"] },
  // ─── Lisboa / Área Metropolitana ───
  { slug: "lisboa", freguesias: ["santa-maria-maior","misericordia","santo-antonio","sao-vicente","arroios","penha-de-franca","beato","marvila","parque-das-nacoes","areeiro","alvalade","avenidas-novas","campo-de-ourique","estrela","campolide","alcantara","belem","ajuda","benfica","sao-domingos-de-benfica","carnide","lumiar","santa-clara","olivais"] },
  { slug: "cascais", freguesias: ["cascais-estoril","alcabideche","carcavelos-e-parede","sao-domingos-de-rana"] },
  { slug: "oeiras", freguesias: ["oeiras-e-sao-juliao-da-barra","alges-linda-a-velha","carnaxide-e-queijas","barcarena","porto-salvo"] },
  { slug: "sintra", freguesias: ["sintra-vila","agualva-e-mira-sintra","algueirao-mem-martins","casal-de-cambra","cacem-e-sao-marcos","massama-e-monte-abraao","queluz-e-belas","rio-de-mouro","sao-joao-das-lampas-e-terrugem","colares","almargem-do-bispo"] },
  { slug: "almada", freguesias: ["almada-cova-da-piedade","caparica-e-trafaria","costa-da-caparica","charneca-de-caparica","laranjeiro-e-feijo"] },
  { slug: "setubal", freguesias: ["setubal-centro","sao-sebastiao-setubal","sado","gambia-pontes","azeitao"] },
  { slug: "amadora", freguesias: ["aguas-livres","alfragide","encosta-do-sol","falagueira-venda-nova","mina-de-agua","venteira"] },
  { slug: "odivelas", freguesias: ["odivelas-centro","povoa-de-santo-adriao","ramada-e-canecas","pontinha-e-famoes"] },
  { slug: "loures", freguesias: ["loures-centro","sacavem-e-prior-velho","santa-iria-de-azoia","camarate-unhos-apelacao","santo-antonio-dos-cavaleiros","bucelas","fanhoes","lousa-loures","moscavide-e-portela"] },
  { slug: "vila-franca-de-xira", freguesias: ["vila-franca-de-xira-centro","alverca-do-ribatejo","povoa-de-santa-iria","alhandra","vialonga","castanheira-do-ribatejo"] },
  { slug: "barreiro", freguesias: ["barreiro-e-lavradio","alto-do-seixalinho","palhais-e-coina"] },
  { slug: "moita", freguesias: ["moita-centro","baixa-da-banheira","alhos-vedros","gaio-rosario"] },
  { slug: "mafra", freguesias: ["mafra-centro","ericeira","malveira","venda-do-pinheiro"] },
  { slug: "seixal", freguesias: ["seixal-centro","amora","corroios","fernao-ferro"] },
  { slug: "montijo", freguesias: ["montijo-centro","alto-estanqueiro","canha","pegoes","sarilhos-grandes"] },
  { slug: "alcochete", freguesias: ["alcochete-centro","samouco","sao-francisco-alcochete"] },
  { slug: "palmela", freguesias: ["palmela-centro","pinhal-novo","poceirao-e-marateca","quinta-do-anjo"] },
  { slug: "sesimbra", freguesias: ["sesimbra-castelo","santiago-sesimbra"] },
  // ─── Algarve ───
  { slug: "faro", freguesias: ["faro-centro","conceicao-de-faro","estoi","montenegro","santa-barbara-de-nexe"] },
  { slug: "loule", freguesias: ["loule-centro","quarteira","vilamoura","almancil","quinta-do-lago","vale-do-lobo","boliqueime","alte-e-salir"] },
  { slug: "albufeira", freguesias: ["albufeira-centro","ferreiras","guia","paderne"] },
  { slug: "olhao", freguesias: ["olhao-centro","quelfes","moncarapacho-e-fuseta","pechao"] },
  { slug: "sao-bras-de-alportel", freguesias: ["sao-bras-de-alportel-centro"] },
  { slug: "silves", freguesias: ["silves-centro","algoz-e-tunes","armacao-de-pera","pera","sao-bartolomeu-de-messines","sao-marcos-da-serra"] },
  { slug: "lagoa-algarve", freguesias: ["lagoa-e-carvoeiro","estombar-e-parchal","ferragudo","porches"] },
  { slug: "tavira", freguesias: ["tavira-centro","conceicao-e-cabanas","luz-de-tavira","santa-catarina-da-fonte-do-bispo","santa-luzia-tavira","cachopo"] },
  { slug: "portimao", freguesias: ["portimao-centro","alvor","mexilhoeira-grande"] },
  { slug: "lagos", freguesias: ["lagos-centro","luz-lagos","odiaxere","bensafrim"] },
  { slug: "vila-real-de-santo-antonio", freguesias: ["vila-real-de-santo-antonio-centro","monte-gordo"] },
  { slug: "castro-marim", freguesias: ["castro-marim-centro","odeleite","azinhal"] },
  { slug: "monchique", freguesias: ["monchique-centro","alferce","marmelete"] },
  { slug: "aljezur", freguesias: ["aljezur-centro","bordeira","odeceixe","rogil"] },
  { slug: "vila-do-bispo", freguesias: ["vila-do-bispo-centro","budens","sagres"] },
  { slug: "alcoutim", freguesias: ["alcoutim-centro","gioes","martim-longo","vaqueiros"] },
];

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
        freguesiaUrls.push(xmlUrl(`/${svc.slug}-${mun.slug}-${freg}`, 'monthly', '0.5'));
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

  // 9. Pack/Combo pages (4 packs × 22 cidades principais = 88 pages)
  // Manter sincronizado com PACK_CITY_SLUGS em src/data/packComboData.ts
  const packSlugs = ['pack-sofa-e-colchao', 'pack-sofa-impermeabilizacao', 'pack-sala-completa', 'pack-quarto-completo'];
  const packCities = [
    'porto', 'vila-nova-de-gaia', 'matosinhos', 'maia', 'gondomar', 'povoa-de-varzim', 'braga', 'guimaraes',
    'lisboa', 'sintra', 'cascais', 'oeiras', 'almada', 'amadora', 'odivelas', 'setubal',
    'faro', 'loule', 'albufeira', 'portimao', 'lagos', 'tavira',
  ];
  const packUrls: string[] = [];
  for (const pack of packSlugs) {
    for (const city of packCities) {
      packUrls.push(xmlUrl(`/${pack}-${city}`, 'monthly', '0.7'));
    }
  }

  // Cidades mais povoadas do país que o site já cobre (mesma lista para
  // sofá/colchão/cadeiras/tapetes — ver src/data/marcaCities.ts)
  const marcaCities = [
    'porto', 'vila-nova-de-gaia', 'braga', 'matosinhos', 'gondomar', 'guimaraes', 'maia', 'valongo',
    'paredes', 'vila-do-conde', 'povoa-de-varzim', 'penafiel', 'santo-tirso',
    'lisboa', 'sintra', 'cascais', 'loures', 'amadora', 'almada', 'seixal', 'oeiras', 'odivelas',
    'vila-franca-de-xira', 'setubal', 'mafra', 'barreiro', 'moita', 'montijo', 'palmela', 'sesimbra',
    'faro', 'loule', 'portimao', 'albufeira',
  ];

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
