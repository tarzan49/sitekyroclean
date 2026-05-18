/**
 * Sitemap Generator for Kyro Clean Solutions
 * Generates a Sitemap Index + sub-sitemaps covering all ~1700+ URLs
 * 
 * Can be run standalone: npx tsx scripts/generate-sitemap.ts
 * Also integrated as Vite post-build plugin
 */

import fs from 'fs';
import path from 'path';

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
  { slug: "cascais", region: "secondary" },
  { slug: "oeiras", region: "secondary" },
  { slug: "sintra", region: "secondary" },
  { slug: "almada", region: "secondary" },
  { slug: "setubal", region: "secondary" },
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
];

const problemSlugs = [
  "manchas-sofa","manchas-vinho-sofa","manchas-cafe-sofa","manchas-gordura-sofa",
  "manchas-colchao","manchas-tapete","cheiro-sofa","cheiro-urina-sofa",
  "cheiro-colchao","urina-colchao","cheiro-tapete","acaros-colchao",
  "acaros-sofa","alergias-sofa","alergias-colchao","pelos-animais-sofa",
  "pelos-animais-tapete","limpeza-sofa-tecido","limpeza-sofa-pele",
  "limpeza-sofa-veludo","tapete-persa","tapete-la","mofo-tapete",
  "mofo-alcatifa","impermeabilizar-sofa","preco-limpeza-sofa",
  "preco-limpeza-colchao","preco-limpeza-tapete","limpeza-profunda-sofa",
  "limpeza-sofa-domicilio","limpeza-sofa-urgente","limpeza-colchao-urgente",
  "empresa-limpeza-estofos","limpeza-sofa-profissional","higienizacao-colchao",
  "lavagem-tapetes","limpeza-cadeiras-escritorio","limpeza-alcatifas-empresa",
  "manchas-sangue-colchao","limpeza-sofa-bebe","limpeza-estofos-automovel",
  "manchas-tinta-sofa","sofa-amarelado","limpeza-sofa-microfibra",
  "limpeza-cabeceira-cama","limpeza-sofa-chenille","limpeza-puff",
  "manchas-suor-sofa","limpeza-colchao-bebe","limpeza-sofa-hotel",
  "limpeza-cortinas","acaros-tapete",
  "limpeza-sofa-perto-de-mim","limpeza-sofa-antes-depois",
  "impermeabilizar-tapete","limpeza-sofa-seco"
];

// Problem × City: mirrors problemCitySeoData logic
const problemRelatedCities: Record<string, string[]> = {
  "manchas-sofa": ["porto","matosinhos","maia","vila-nova-de-gaia"],
  "manchas-vinho-sofa": ["porto","braga","guimaraes"],
  "manchas-cafe-sofa": ["porto","maia","matosinhos"],
  "manchas-gordura-sofa": ["porto","vila-nova-de-gaia","gondomar"],
  "manchas-colchao": ["porto","braga","matosinhos"],
  "manchas-tapete": ["porto","vila-nova-de-gaia","braga"],
  "cheiro-sofa": ["porto","maia","gondomar"],
  "cheiro-urina-sofa": ["porto","matosinhos","valongo"],
  "cheiro-colchao": ["porto","braga","maia"],
  "urina-colchao": ["porto","gondomar","valongo"],
  "cheiro-tapete": ["porto","maia","vila-nova-de-gaia"],
  "acaros-colchao": ["porto","braga","matosinhos"],
  "acaros-sofa": ["porto","gondomar","maia"],
  "alergias-sofa": ["porto","matosinhos","braga"],
  "alergias-colchao": ["porto","maia","vila-nova-de-gaia"],
  "pelos-animais-sofa": ["porto","gondomar","valongo"],
  "pelos-animais-tapete": ["porto","maia","matosinhos"],
  "limpeza-sofa-tecido": ["porto","matosinhos","braga"],
  "limpeza-sofa-pele": ["porto","vila-nova-de-gaia","guimaraes"],
  "limpeza-sofa-veludo": ["porto","braga","matosinhos"],
  "tapete-persa": ["porto","vila-nova-de-gaia","cascais"],
  "tapete-la": ["porto","braga","guimaraes"],
  "mofo-tapete": ["porto","maia","gondomar"],
  "mofo-alcatifa": ["porto","matosinhos","maia"],
  "impermeabilizar-sofa": ["porto","matosinhos","braga"],
  "preco-limpeza-sofa": ["porto","matosinhos","lisboa"],
  "preco-limpeza-colchao": ["porto","braga","maia"],
  "preco-limpeza-tapete": ["porto","vila-nova-de-gaia","braga"],
  "limpeza-profunda-sofa": ["porto","matosinhos","gondomar"],
  "limpeza-sofa-domicilio": ["porto","maia","vila-nova-de-gaia"],
  "limpeza-sofa-urgente": ["porto","matosinhos","braga"],
  "limpeza-colchao-urgente": ["porto","maia","gondomar"],
  "empresa-limpeza-estofos": ["porto","matosinhos","vila-nova-de-gaia"],
  "limpeza-sofa-profissional": ["porto","braga","guimaraes"],
  "higienizacao-colchao": ["porto","matosinhos","maia"],
  "lavagem-tapetes": ["porto","vila-nova-de-gaia","braga"],
  "limpeza-cadeiras-escritorio": ["porto","matosinhos","maia"],
  "limpeza-alcatifas-empresa": ["porto","matosinhos","vila-nova-de-gaia"],
  "manchas-sangue-colchao": ["porto","braga","maia"],
  "limpeza-sofa-bebe": ["porto","matosinhos","gondomar"],
  "limpeza-estofos-automovel": ["porto","maia","vila-nova-de-gaia"],
  "manchas-tinta-sofa": ["porto","braga","matosinhos"],
  "sofa-amarelado": ["porto","maia","gondomar"],
  "limpeza-sofa-microfibra": ["porto","matosinhos","braga"],
  "limpeza-cabeceira-cama": ["porto","maia","vila-nova-de-gaia"],
  "limpeza-sofa-chenille": ["porto","braga","matosinhos"],
  "limpeza-puff": ["porto","maia","matosinhos"],
  "manchas-suor-sofa": ["porto","gondomar","valongo"],
  "limpeza-colchao-bebe": ["porto","matosinhos","maia"],
  "limpeza-sofa-hotel": ["porto","braga","lisboa"],
  "limpeza-cortinas": ["porto","matosinhos","maia"],
  "acaros-tapete": ["porto","maia","braga"],
  "limpeza-sofa-perto-de-mim": ["porto","matosinhos","maia"],
  "limpeza-sofa-antes-depois": ["porto","vila-nova-de-gaia","braga"],
  "impermeabilizar-tapete": ["porto","maia","matosinhos"],
  "limpeza-sofa-seco": ["porto","braga","matosinhos"],
};

const topMetroCities = ["porto","matosinhos","maia","vila-nova-de-gaia","gondomar","braga","lisboa"];

const materialSlugs = [
  "limpeza-sofa-tecido","limpeza-sofa-veludo","limpeza-sofa-pele",
  "limpeza-sofa-microfibra","limpeza-sofa-linho","limpeza-sofa-camurca",
  "limpeza-sofa-sintetico","limpeza-tapete-la","limpeza-tapete-persa",
  "limpeza-tapete-sintetico","limpeza-tapete-sisal"
];

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
    xmlUrl('/faq', 'monthly', '0.7'),
    xmlUrl('/testemunhos', 'monthly', '0.7'),
    xmlUrl('/nosso-processo', 'monthly', '0.6'),
    xmlUrl('/promocoes', 'weekly', '0.7'),
    xmlUrl('/areas-de-servico', 'monthly', '0.7'),
    xmlUrl('/antes-depois', 'monthly', '0.7'),
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

  // 4. Problem pages (standalone + city combos)
  const problemUrls: string[] = [];
  for (const slug of problemSlugs) {
    problemUrls.push(xmlUrl(`/problemas/${slug}`, 'monthly', '0.7'));
  }
  // Problem × City combos
  for (const slug of problemSlugs) {
    const related = problemRelatedCities[slug] || [];
    const targetCities = new Set([...related, ...topMetroCities]);
    for (const citySlug of targetCities) {
      if (cities.some(c => c.slug === citySlug)) {
        problemUrls.push(xmlUrl(`/${slug}-${citySlug}`, 'monthly', '0.6'));
      }
    }
  }

  // 5. Material pages (standalone + city combos)
  const materialUrls: string[] = [];
  for (const mat of materialSlugs) {
    materialUrls.push(xmlUrl(`/${mat}`, 'monthly', '0.7'));
  }
  for (const mat of materialSlugs) {
    for (const city of cities) {
      materialUrls.push(xmlUrl(`/${mat}-${city.slug}`, 'monthly', '0.6'));
    }
  }

  // 6. Keyword variant pages: higienização/lavagem × 5 services × cities + parishes
  const kvVariants  = ['higienizacao', 'lavagem'];
  const kvServices  = ['sofa', 'colchao', 'tapetes', 'cadeiras', 'alcatifas'];
  const keywordVariantUrls: string[] = [];
  for (const v of kvVariants) {
    for (const s of kvServices) {
      for (const city of cities) {
        keywordVariantUrls.push(xmlUrl(`/${v}-${s}-${city.slug}`, 'monthly', '0.6'));
      }
      for (const mun of municipiosComFreguesias) {
        for (const freg of mun.freguesias) {
          keywordVariantUrls.push(xmlUrl(`/${v}-${s}-${mun.slug}-${freg}`, 'monthly', '0.6'));
        }
      }
    }
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
    'como-preparar-casa-visita-tecnico',
  ];
  const resourceUrls: string[] = [
    xmlUrl('/perguntas-frequentes-limpeza-estofos', 'monthly', '0.8'),
    xmlUrl('/glossario-limpeza-estofos', 'monthly', '0.7'),
    xmlUrl('/blog', 'weekly', '0.8'),
    ...blogSlugs.map(s => xmlUrl(`/blog/${s}`, 'monthly', '0.8')),
  ];

  // 9. Pack/Combo pages (4 packs × 5 cities = 20 pages)
  const packSlugs = ['pack-sofa-e-colchao', 'pack-sofa-impermeabilizacao', 'pack-sala-completa', 'pack-quarto-completo'];
  const packCities = ['porto', 'lisboa', 'braga', 'aveiro', 'coimbra'];
  const packUrls: string[] = [];
  for (const pack of packSlugs) {
    for (const city of packCities) {
      packUrls.push(xmlUrl(`/${pack}-${city}`, 'monthly', '0.7'));
    }
  }

  // 10. Marca Sofá pages (8 brands × 10 cities = 80 pages)
  const marcaSlugs = ['ikea', 'natuzzi', 'roche-bobois', 'conforama', 'el-corte-ingles', 'kave-home', 'leroy-merlin', 'moviflor'];
  const marcaCities = ['porto', 'lisboa', 'braga', 'aveiro', 'coimbra', 'guimaraes', 'matosinhos', 'vila-nova-de-gaia', 'maia', 'barcelos'];
  const marcaUrls: string[] = [];
  for (const marca of marcaSlugs) {
    for (const city of marcaCities) {
      marcaUrls.push(xmlUrl(`/limpeza-sofa-${marca}-${city}`, 'monthly', '0.7'));
    }
  }

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
