// Final read-only audit of the four landing families. Run after npm run build.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
const require = createRequire(import.meta.url);
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, file);
const { getLandingFaqRoutes } = require('./landing-faq-routes.ts');
const { getLandingPageModel } = require('../src/data/landingPageModel.ts');
const { escapeLandingHtml: e } = require('./landing-page-html.ts');
const { getAllKeywordVariantRoutes, getKeywordVariantData } = require('../src/data/keywordVariantData.ts');
const { locationPrices, EXTENDED_TRIP_CITIES } = require('../src/constants/travel.ts');
const failures = [], titles = new Set(), descriptions = new Set(), headings = new Set(), imageUse = new Map(), combinations = new Map();
const routes = getLandingFaqRoutes();
for (const { path } of routes) {
  const model = getLandingPageModel(path);
  const html = fs.readFileSync('dist' + path + '.html', 'utf8');
  const check = (ok, why) => { if (!ok) failures.push(path + ': ' + why); };
  for (const [set, value, label] of [[titles, model.title, 'title'], [descriptions, model.metaDescription, 'description'], [headings, model.h1, 'h1']]) {
    check(!set.has(value), 'duplicate ' + label); set.add(value);
  }
  check(html.includes('<h1>' + e(model.h1) + '</h1>'), 'heading differs from model');
  // O paragrafo editorial deixou de ser emitido no HTML em 3e4c04e (2026-09-15),
  // por decisao do dono: as duas frases fixas do bloco de precos ("Estimativa
  // confirmada..." e a introducao editorial) foram consideradas irrelevantes.
  // Este audit continuou a exigi-lo e passou a falhar nas 12.912 paginas, ou
  // seja, deixou de conseguir sinalizar qualquer regressao verdadeira nas
  // restantes verificacoes. A verificacao sai daqui para acompanhar a decisao.
  // model.editorialIntro continua a existir e a ser coberto por
  // landingSeoRegression.test.ts, mas ja nao chega a nenhuma pagina.
  check(model.editorialIntro !== model.intro, 'editorial replaced by hero subtitle');
  check(model.faqs.length === 4, 'FAQ count');
  const canonical = [...html.matchAll(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/g)].map(x => x[1]);
  check(canonical.length === 1 && canonical[0] === 'https://cleansolutions.com.pt' + path, 'canonical');
  for (const point of model.trustPoints) {
    check(html.includes(e(point.desc)), 'missing trust description');
    check(!/70%|90%|85%|30 segundos|18 meses|2 kg|kg\/m²|[0-9]×|nunca mais temer|aplica-se a tudo|desconto de pack incluído|como novos|do cadeira|seu cadeira/.test(JSON.stringify(point)), 'legacy trust claim');
  }
  const set = combinations.get(model.serviceSlug) ?? new Set();
  set.add(model.problems.map(p => p.image.id).join('|')); combinations.set(model.serviceSlug, set);
  for (const problem of model.problems) imageUse.set(problem.image.id, (imageUse.get(problem.image.id) ?? 0) + 1);
}
let consultationVariants = 0, higherTravelVariants = 0;
for (const route of getAllKeywordVariantRoutes()) {
  const data = getKeywordVariantData(route.variantKey, route.serviceKey, route.locationPart);
  const model = getLandingPageModel(route.path);
  if (data.municipality !== model.municipalityName || locationPrices[data.municipality] === undefined) failures.push(route.path + ': invalid municipality');
  if (data.locationName !== data.municipality) {
    if (EXTENDED_TRIP_CITIES.has(data.municipality)) consultationVariants++;
    if (locationPrices[data.municipality] > 10) higherTravelVariants++;
  }
}
for (const [id, count] of imageUse) if (count <= 140 || count >= 300) failures.push(id + ': image imbalance ' + count);
for (const [service, set] of combinations) if (set.size <= 1750) failures.push(service + ': low image variety ' + set.size);
console.log(JSON.stringify({
  pages: routes.length, uniqueTitles: titles.size, uniqueDescriptions: descriptions.size, uniqueHeadings: headings.size,
  consultationVariants, higherTravelVariants, images: imageUse.size,
  imageUsage: { min: Math.min(...imageUse.values()), max: Math.max(...imageUse.values()) },
  imageCombinations: Object.fromEntries([...combinations].map(([k,v]) => [k,v.size])),
  totalFailures: failures.length, failures: failures.slice(0,20),
}, null, 2));
if (failures.length) process.exitCode = 1;
