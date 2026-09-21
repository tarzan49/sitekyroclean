import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { JSDOM } from 'jsdom';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kyro-resources-'));
try {
  const modulePath = path.join(tmp, 'data.mjs');
  await build({stdin:{contents:`export {getAllPosts} from './src/data/blogData'; export {glossaryTerms} from './src/data/glossaryTerms'; export * from './src/data/resourceContent';`,resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',outfile:modulePath});
  const data = await import(pathToFileURL(modulePath));
  const sitemap = new JSDOM(fs.readFileSync('dist/sitemap-resources.xml','utf8'),{contentType:'text/xml'}).window.document;
  const urls = [...sitemap.querySelectorAll('loc')].map(el=>new URL(el.textContent).pathname);
  const expected = ['/blog','/perguntas-frequentes-limpeza-estofos','/glossario-limpeza-estofos',...data.getAllPosts().map(p=>`/blog/${p.slug}`)];
  assert.deepEqual([...urls].sort(),[...expected].sort(),'Resource sitemap must expose all 29 existing pages');
  for(const route of expected) {
    const doc = new JSDOM(fs.readFileSync(`dist${route}.html`,'utf8')).window.document;
    assert.equal(doc.querySelectorAll('h1').length,1,route);
    assert.equal(new URL(doc.querySelector('link[rel="canonical"]').href).pathname,route);
    const schemas=[...doc.querySelectorAll('script[type="application/ld+json"]')].flatMap(el=>{const s=JSON.parse(el.textContent);return s['@graph']??[s];});
    const post = data.getAllPosts().find(p=>route===`/blog/${p.slug}`);
    const faqs = post?.faq.map(f=>({question:f.q,answer:f.a})) ?? (route.includes('perguntas-frequentes')?data.RESOURCE_FAQS:null);
    if(faqs) {
      const nodes=schemas.filter(s=>s['@type']==='FAQPage');assert.equal(nodes.length,1,`One FAQ schema: ${route}`);
      assert.deepEqual(nodes[0].mainEntity.map(f=>[f.name,f.acceptedAnswer.text]),faqs.map(f=>[f.question,f.answer]),route);
      assert.equal(faqs.length,4,route);
      for(const faq of faqs) assert.ok(doc.querySelector('main').textContent.includes(faq.answer),`Visible FAQ ${route}`);
    }
    if(post) {
      assert.equal(doc.querySelector('h1').textContent,post.title);
      assert.equal(doc.querySelector('meta[name="description"]').content,post.metaDescription);
      assert.ok(doc.querySelector('main').textContent.includes(data.resourceHeroSubtitle(post)),route);
      assert.ok(doc.querySelector('#precos'),`Budget anchor ${route}`);
      for(const section of post.sections) assert.ok(doc.querySelector('main').textContent.includes(section.heading),`Section ${route}`);
      for(const review of data.getResourceCommercial(post).reviews) assert.ok(doc.querySelector('main').textContent.includes(review.text),`Review parity ${route}`);
      for(const slug of post.relatedPosts) assert.ok(fs.existsSync(`dist/blog/${slug}.html`),`Related URL ${slug}`);
    }
    if(route.includes('glossario')) {
      assert.equal(schemas.find(s=>s['@type']==='DefinedTermSet').hasDefinedTerm.length,100);
      for(const term of data.glossaryTerms) { assert.ok(doc.getElementById(term.id),term.id); assert.ok(doc.querySelector('main').textContent.includes(term.definition),term.id); }
    }
    assert.ok(!/Preços 2025|devolvemos o dinheiro|80 a 100ºC/.test(doc.querySelector('main').textContent),route);
  }
  console.log('PASS: 29 resource URLs, 26 articles, 100 glossary anchors, four FAQs per page, canonical/metadata, reviews and commercial content parity.');
} finally { fs.rmSync(tmp,{recursive:true,force:true}); }
