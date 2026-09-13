// Rebuild display derivatives; licensed fonts and original photographs are preserved.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
const derivatives = [
 ['public/images/services/sofa-cleaning-process-guide.png', null],
 ['public/images/services/quote-sofa-sizes.png', 512],
 ['public/images/services/quote-mattress-sizes.png', 768],
 ['public/images/services/quote-furniture.png', 512],
 ['public/images/hero-sofa-v1.jpeg', 1600],
 ['src/assets/hero-sofa-v4.jpeg', 900],
 ['src/assets/hero-alcatifa-hero.jpeg', 900],
];
for (const [file, width] of derivatives) {
 let image = sharp(file);
 if (width) image = image.resize({ width, withoutEnlargement: true });
 await image.webp({ quality: file.startsWith('src/') ? 78 : 82 }).toFile(file.replace(/\.(png|jpeg)$/, '.webp'));
}
const pool = 'src/assets/before-after-pool';
for (const file of fs.readdirSync(pool).filter(file => /(?:-depois|-unico-sem-par)\.webp$/.test(file))) {
 await sharp(path.join(pool, file)).resize(160, 120, { fit: 'cover' }).webp({ quality: 72 }).toFile(path.join(pool, file.replace('.webp', '-thumb.webp')));
}
const root = 'public/images/landing-problems';
for (const service of fs.readdirSync(root)) {
 const dir = path.join(root, service);
 if (!fs.statSync(dir).isDirectory()) continue;
 fs.mkdirSync(path.join(dir, 'responsive'), { recursive: true });
 for (const file of fs.readdirSync(dir).filter(file => file.endsWith('.webp'))) {
  await sharp(path.join(dir, file)).resize({ width: 600 }).webp({ quality: 76 }).toFile(path.join(dir, 'responsive', file));
 }
}
console.log('Performance image derivatives updated. Originals preserved.');
