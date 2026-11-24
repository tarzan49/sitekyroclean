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
