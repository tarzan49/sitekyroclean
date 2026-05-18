import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputDir = './public/images';
const outputDir = './public/images-optimized';

function processDir(srcDir, destDir) {
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  fs.readdirSync(srcDir).forEach(file => {
    const inputPath = path.join(srcDir, file);
    const stat = fs.statSync(inputPath);

    if (stat.isDirectory()) {
      processDir(inputPath, path.join(destDir, file));
      return;
    }

    if (!/\.(jpg|jpeg|png)$/i.test(file)) return;

    const outputPath = path.join(destDir, file.replace(/\.(jpg|jpeg|png)$/i, '.webp'));

    sharp(inputPath)
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(outputPath)
      .then(info => console.log(`✔ ${file} → ${Math.round(info.size / 1024)}KB`))
      .catch(err => console.error(`✗ ${file}: ${err.message}`));
  });
}

processDir(inputDir, outputDir);
