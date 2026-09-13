// Read-only check of every generated landing page. Run after npm run build.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';
const require = createRequire(import.meta.url);
require.extensions['.ts'] = (module, file) => {
  module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, file);
};
const { getLandingFaqRoutes } = require('./landing-faq-routes.ts');
const { getLandingPageModel } = require('../src/data/landingPageModel.ts');
const { LANDING_SECTION_ORDER } = require('../src/data/landingServiceCopy.ts');
const { renderLandingPageHtml } = require('./landing-page-html.ts');
const failures = [];
const missingLinks = new Set();
const records = getLandingFaqRoutes();
const sitemapUrls = new Set(fs.readdirSync('dist').filter(file => /^sitemap.*\.xml$/.test(file)).flatMap(file => [...fs.readFileSync(path.join('dist', file), 'utf8').matchAll(/<loc>https:\/\/cleansolutions\.com\.pt([^<]*)<\/loc>/g)].map(match => match[1])));
for (const record of records) {
  const model = getLandingPageModel(record.path);
  const file = path.resolve('dist', `${record.path.slice(1)}.html`);
  if (!model || !fs.existsSync(file)) { failures.push(`${record.path}: missing model/HTML`); continue; }
  const html = fs.readFileSync(file, 'utf8');
  const main = html.match(/<main>[\s\S]*?<\/main>/)?.[0];
  const order = [...html.matchAll(/data-landing-section="([^"]+)"/g)].map(match => match[1]);
  if (JSON.stringify(order) !== JSON.stringify(LANDING_SECTION_ORDER)) failures.push(`${record.path}: wrong section order`);
  if (main !== renderLandingPageHtml(model)) failures.push(`${record.path}: HTML/model mismatch`);
  if ([...html.matchAll(/data-problem-id=/g)].length !== 4 || model.faqs.length !== 4 || model.processSteps.length !== 5) failures.push(`${record.path}: wrong card/FAQ/process count`);
  for (const link of [...model.packLinks, ...model.directory.flatMap(group => group.links)]) {
    if (!fs.existsSync(path.resolve('dist', `${link.href.slice(1)}.html`)) || !sitemapUrls.has(link.href)) missingLinks.add(link.href);
  }
}
console.log(JSON.stringify({ pages: records.length, sections: LANDING_SECTION_ORDER, failures: failures.slice(0, 20), totalFailures: failures.length, missingLinks: [...missingLinks].slice(0, 30), totalMissingLinks: missingLinks.size }, null, 2));
if (failures.length || missingLinks.size) process.exitCode = 1;
