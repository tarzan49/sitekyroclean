import fs from 'node:fs';
import path from 'node:path';
import { hasOldResponsePromise } from './response-policy.mjs';
const root = path.resolve('dist');
const patterns = {
  deslocacaoIncluida: /deslocação incluída/i,
  tabelaPackAntiga: /99€\/145€\/159€/,

  avaliacaoAntiga: /Avaliação 5\.0/,
  eficacia99: /99(?:[.,]9)?%/,
  precoAlcatifa: /3€\/m²/,
};
const report = { html: 0, missingHeading: [], contradictions: {}, missingRoutes: [], sitemapEntries: 0, uniqueSitemapUrls: 0 };
function walk(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir,e.name)) : [path.join(dir,e.name)]); }
for (const file of walk(root).filter(f => f.endsWith('.html') && !f.endsWith('/404.html'))) {
  report.html++;
  const html = fs.readFileSync(file,'utf8');
  const body = (html.match(/<body[^>]*>([\s\S]*?)<\/body>/)?.[1] ?? '').replace(/<script[\s\S]*?<\/script>/g,'');
  if (hasOldResponsePromise(html)) (report.contradictions.respostaAntiga ??= []).push(path.relative(root,file));
  const text = body.replace(/<[^>]*>/g,' ');
  if (!/<h1(?:\s|>)/.test(body) && !html.includes('noindex')) report.missingHeading.push(path.relative(root,file));
  for (const [name, pattern] of Object.entries(patterns)) if (pattern.test(text)) (report.contradictions[name] ??= []).push(path.relative(root,file));
}
const urls = new Set();
for (const file of fs.readdirSync(root).filter(f => /^sitemap-.+\.xml$/.test(f))) {
  for (const match of fs.readFileSync(path.join(root,file),'utf8').matchAll(/<loc>https:\/\/cleansolutions\.com\.pt([^<]*)<\/loc>/g)) {
    report.sitemapEntries++; urls.add(match[1]);
    const file = path.join(root, match[1] === '/' ? 'index.html' : match[1].replace(/^\//,'')+'.html');
    if (!fs.existsSync(file)) report.missingRoutes.push(match[1]);
  }
}
report.uniqueSitemapUrls = urls.size;
fs.writeFileSync('dist/commercial-audit.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({ ...report, contradictions: Object.fromEntries(Object.entries(report.contradictions).map(([key,list]) => [key,list.length])) },null,2));
if (report.missingHeading.length || report.missingRoutes.length || Object.keys(report.contradictions).length) process.exitCode=1;
