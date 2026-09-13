// Run after npm run build: node scripts/audit-landing-faqs.mjs
// Reads generated HTML; never writes or changes pages, routing or indexation.
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
const records = getLandingFaqRoutes();
const summary = {};
const failures = [];
const escapeHtml = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
for (const record of records) {
  const key = `${record.context.family}/${record.context.serviceSlug}`;
  summary[key] ??= { pages: 0, questionSets: new Set() };
  summary[key].pages++;
  summary[key].questionSets.add(record.faqs.map(faq => faq.question).sort().join('|'));
  if (process.argv.includes('--inventory-only')) continue;
  const file = path.resolve('dist', `${record.path.slice(1)}.html`);
  if (!fs.existsSync(file)) { failures.push(`${record.path}: missing HTML`); continue; }
  const html = fs.readFileSync(file, 'utf8');
  const schemas = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
  const nodes = schemas.flatMap(schema => schema['@graph'] ?? [schema]);
  const faqNodes = nodes.filter(node => node['@type'] === 'FAQPage');
  const expected = record.faqs.map(faq => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } }));
  if (faqNodes.length !== 1 || JSON.stringify(faqNodes[0].mainEntity) !== JSON.stringify(expected)) failures.push(`${record.path}: FAQ schema differs from page data`);
  const main = html.match(/<main>[\s\S]*?<\/main>/)?.[0] ?? '';
  if (record.faqs.length !== 4 || record.faqs.some(faq => !main.includes(escapeHtml(faq.question)) || !main.includes(escapeHtml(faq.answer)))) failures.push(`${record.path}: visible HTML differs from page data`);
}
console.log(JSON.stringify({ pages: records.length, mode: process.argv.includes('--inventory-only') ? 'data only' : 'generated HTML and schemas', groups: Object.fromEntries(Object.entries(summary).map(([key, value]) => [key, { pages: value.pages, distinctQuestionSets: value.questionSets.size }])), failures: failures.slice(0, 20), totalFailures: failures.length }, null, 2));
if (failures.length) process.exitCode = 1;
