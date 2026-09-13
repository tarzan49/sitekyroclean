import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import sharp from 'sharp';

const root = path.resolve('docs/sofa-image-pilot');
const library = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
assert.equal(library.length, 40);
assert.equal(new Set(library.map(image => image.id)).size, 40);
const hashes = new Set();
let bytes = 0;
for (let group = 1; group <= 4; group++) {
  assert.equal(library.filter(image => image.problemId === `limpeza-sofas-${group}`).length, 10);
}
for (const image of library) {
  assert.match(image.file, /^sofa-(manchas|residuos|odores|desgaste)-(0[1-9]|10)\.webp$/);
  assert.equal(image.file, `${image.id}.webp`);
  const types = ['manchas', 'residuos', 'odores', 'desgaste'];
  assert.equal(image.problemId, `limpeza-sofas-${types.indexOf(image.id.split('-')[1]) + 1}`);
  assert.equal(image.origin, 'ai-generated');
  assert.ok(image.prompt.startsWith('Use case: photorealistic-natural.'));
  assert.ok(image.alt.startsWith('Imagem ilustrativa: '));
  const buffer = fs.readFileSync(path.join(root, 'assets', image.file));
  assert.ok(buffer.length > 10000 && buffer.length < 300000, `${image.file}: file weight`);
  bytes += buffer.length;
  hashes.add(crypto.createHash('sha256').update(buffer).digest('hex'));
  const metadata = await sharp(buffer).metadata();
  assert.equal(metadata.format, 'webp');
  assert.equal(metadata.width, 1200);
  assert.equal(metadata.height, 675);
}
assert.equal(hashes.size, 40, 'duplicate image bytes');
const context = {};
vm.runInNewContext(fs.readFileSync(path.join(root, 'library-data.js'), 'utf8'), context);
assert.equal(JSON.stringify(context.SOFA_IMAGE_LIBRARY), JSON.stringify(library.map(({ id, problemId, file, alt }) => ({ id, problemId, file, alt }))));
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.equal((html.match(/<figcaption>Imagem ilustrativa<\/figcaption>/g) || []).length, 4);
assert.ok(!html.includes('gerada por IA'));
console.log(JSON.stringify({ images: library.length, perProblem: 10, distinctFiles: hashes.size, dimensions: '1200 × 675', bytes, scope: 'standalone library, not public landing pages' }));
