// As promessas usam srcset 400/800: se a de 400 falta, o computador mostra uma imagem partida (aconteceu, 24 Nov 2026).
import { existsSync, readdirSync } from 'node:fs';
import { expect, it } from 'vitest';

it.each(['service-promises', 'pack-perks'])('%s: cada imagem -800 tem a sua -400', dir => {
  const root = `public/images/${dir}`;
  const missing = readdirSync(root).filter(f => f.endsWith('-800.webp') && !existsSync(`${root}/${f.replace('-800', '-400')}`));
  expect(missing).toEqual([]);
});
