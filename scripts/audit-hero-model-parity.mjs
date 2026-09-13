// Compara, rota a rota, os valores que os heroes liam do catalogo com os que
// passam a ler do modelo. Qualquer diferenca e uma mudanca de conteudo.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
const require = createRequire(import.meta.url);
require.extensions['.ts'] = (m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);

const { getLandingPageModel } = require('../src/data/landingPageModel.ts');
const { getAllLocationRoutes, getLocationServiceData } = require('../src/data/locationSeoData.ts');
const { services } = require('../src/data/serviceCatalog.ts');
const { getAllFreguesiaRoutes, getFreguesia, generateFreguesiaContent } = require('../src/data/freguesiaSeoData.ts');
const { getAllPriceRoutes, getPricePageData } = require('../src/data/priceSeoData.ts');
const { getAllKeywordVariantRoutes, getKeywordVariantData } = require('../src/data/keywordVariantData.ts');

const fails = [];
const cmp = (route, field, a, b) => { if (a !== b) fails.push({ route, field, catalogo: a, modelo: b }); };
let n = 0;

for (const r of getAllLocationRoutes()) {
  const m = getLandingPageModel(r.path); if (!m) { fails.push({route:r.path, field:'modelo', catalogo:'existe', modelo:'null'}); continue; }
  const d = getLocationServiceData(r.serviceSlug, r.citySlug); n++;
  cmp(r.path,'title',d.title,m.title); cmp(r.path,'metaDescription',d.metaDescription,m.metaDescription);
  cmp(r.path,'h1',d.h1,m.h1); cmp(r.path,'city',d.city,m.municipalityName);
  cmp(r.path,'citySlug',d.citySlug,m.municipalitySlug); cmp(r.path,'service',d.service,m.serviceName);
  cmp(r.path,'priceFrom',d.priceFrom,m.priceFrom);
  cmp(r.path,'baseRoute',services.find(s=>s.slug===d.serviceSlug)?.baseRoute,m.serviceBaseRoute);
}
for (const r of getAllFreguesiaRoutes()) {
  const m = getLandingPageModel(r.path); if (!m) { fails.push({route:r.path, field:'modelo', catalogo:'existe', modelo:'null'}); continue; }
  const f = getFreguesia(r.municipioSlug ?? r.citySlug, r.freguesiaSlug ?? r.slug);
  const svc = services.find(s=>s.slug===r.serviceSlug); if (!f || !svc) continue; n++;
  const c = generateFreguesiaContent(svc.name, svc.slug, svc.priceFrom, f.name, f.slug, f.municipio);
  cmp(r.path,'title',c.title,m.title); cmp(r.path,'metaDescription',c.metaDescription,m.metaDescription);
  cmp(r.path,'h1',c.h1,m.h1); cmp(r.path,'name',f.name,m.locationName);
  cmp(r.path,'slug',f.slug,m.parishSlug); cmp(r.path,'municipio',f.municipio,m.municipalityName);
  cmp(r.path,'service',svc.name,m.serviceName); cmp(r.path,'priceFrom',svc.priceFrom,m.priceFrom);
}
for (const r of getAllPriceRoutes()) {
  const m = getLandingPageModel(r.path); if (!m) { fails.push({route:r.path, field:'modelo', catalogo:'existe', modelo:'null'}); continue; }
  const d = getPricePageData(r.serviceSlug, r.citySlug); if (!d) continue; n++;
  cmp(r.path,'title',d.title,m.title); cmp(r.path,'metaDescription',d.metaDescription,m.metaDescription);
  cmp(r.path,'cityName',d.cityName,m.municipalityName); cmp(r.path,'citySlug',d.citySlug,m.municipalitySlug);
  cmp(r.path,'serviceName',d.serviceName,m.serviceName);
}
for (const r of getAllKeywordVariantRoutes()) {
  const m = getLandingPageModel(r.path); if (!m) { fails.push({route:r.path, field:'modelo', catalogo:'existe', modelo:'null'}); continue; }
  const d = getKeywordVariantData(r.variantKey, r.serviceKey, r.locationPart); if (!d) continue; n++;
  cmp(r.path,'title',d.title,m.title); cmp(r.path,'metaDescription',d.metaDescription,m.metaDescription);
  cmp(r.path,'h1',d.h1,m.h1); cmp(r.path,'locationName',d.locationName,m.heroLocationName);
  cmp(r.path,'municipality',d.municipality,m.municipalityName); cmp(r.path,'priceFrom',d.priceFrom,m.priceFrom);
  cmp(r.path,'locationPart',d.locationPart,m.locationPart);
  cmp(r.path,'serviceKey',d.serviceKey,m.serviceKey); cmp(r.path,'variantKey',d.variantKey,m.variantKey);
}
console.log(`rotas comparadas: ${n}`);
console.log(`divergencias: ${fails.length}`);
for (const f of fails.slice(0,12)) console.log('  ', JSON.stringify(f));
process.exit(fails.length ? 1 : 0);
