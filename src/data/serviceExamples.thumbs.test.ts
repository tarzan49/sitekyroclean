// As miniaturas da galeria de exemplos (400 e 800) têm de existir para cada fotografia escolhida.
// 24 Nov: trocar as fotografias de problema sem gerar as miniaturas deixou 21 imagens partidas no site.
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getServiceExamples } from './serviceExamples';
import type { LandingService } from './landingFaqPool';

const SERVICES: LandingService[] = ['limpeza-sofas', 'limpeza-colchoes', 'limpeza-cadeiras', 'limpeza-tapetes', 'limpeza-alcatifas', 'impermeabilizacao'];

describe('miniaturas da galeria de exemplos', () => {
  it.each(SERVICES)('%s: cada exemplo tem as miniaturas 400 e 800 em public/', service => {
    for (const ex of getServiceExamples(service)) {
      for (const url of ex.thumbnailSrcSet.split(',').map(part => part.trim().split(' ')[0])) {
        expect(existsSync(resolve('public' + url)), `${url} (gerar a partir de ${ex.src})`).toBe(true);
      }
    }
  });
});

// Todas as fotografias de problema que as páginas podem escolher (cidades e freguesias rodam entre elas),
// não só as das páginas nacionais: 24 Nov, as fotografias novas da impermeabilização ficaram sem miniatura.
import { readdirSync, readFileSync } from 'node:fs';

describe('miniaturas de todas as fotografias de problema', () => {
  const files = readdirSync(resolve('src/data')).filter(f => /ProblemImages\.ts$/.test(f));
  const ids = files.flatMap(f => [...readFileSync(resolve('src/data', f), 'utf8').matchAll(/"id":\s*"([^"]+)",[\s\S]{0,120}?"src":\s*"\/images\/landing-problems\//g)].map(m => m[1]));
  it('encontra as fotografias', () => expect(ids.length).toBeGreaterThan(20));
  it.each(ids)('%s tem miniaturas 400 e 800', id => {
    for (const w of [400, 800]) expect(existsSync(resolve(`public/images/service-examples/${id}-${w}.webp`)), `${id}-${w}.webp`).toBe(true);
  });
});
