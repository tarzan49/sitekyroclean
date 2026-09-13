import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import sharp from 'sharp';

const entries = JSON.parse(fs.readFileSync('docs/mattress-image-library/prompts.json', 'utf8'));
assert.equal(entries.length, 40);
const hashes = new Set();
let bytes = 0;
for (const entry of entries) {
  assert.match(entry.file, /^colchao-(residuos|manchas|odores|cuidados)-(0[1-9]|10)\.webp$/);
  assert.equal(entry.file, `${entry.id}.webp`);
  const groups = ['residuos', 'manchas', 'odores', 'cuidados'];
  assert.equal(entry.problemId, `limpeza-colchoes-${groups.indexOf(entry.id.split('-')[1]) + 1}`);
  assert.equal(entry.origin, 'ai-generated');
  assert.ok(entry.prompt.startsWith('Use case: photorealistic-natural'));
  assert.ok(entry.alt.startsWith('Imagem ilustrativa: '));
  const buffer = fs.readFileSync(`public/images/landing-problems/colchoes/${entry.file}`);
  assert.ok(buffer.length > 10000 && buffer.length < 300000, `${entry.id}: file size`);
  bytes += buffer.length;
  hashes.add(crypto.createHash('sha256').update(buffer).digest('hex'));
  const metadata = await sharp(buffer).metadata();
  assert.equal(metadata.format, 'webp');
  assert.equal(metadata.width, 1200);
  assert.equal(metadata.height, 675);
}
assert.equal(hashes.size, 40);
for (let index = 1; index <= 4; index++) assert.equal(entries.filter(entry => entry.problemId === `limpeza-colchoes-${index}`).length, 10);
console.log(JSON.stringify({ images: entries.length, distinctFiles: hashes.size, perProblem: 10, bytes, dimensions: '1200 × 675' }));
