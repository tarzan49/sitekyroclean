import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const pages = [
  'LimpezaSofas.tsx',
  'LimpezaColchoes.tsx',
  'LimpezaCadeiras.tsx',
  'LimpezaTapetes.tsx',
  'LimpezaAlcatifas.tsx',
  'Impermeabilizacao.tsx',
];

describe('main service section pattern', () => {
  it.each(pages)('%s alternates the shared sections after the examples gallery', file => {
    const source = readFileSync(new URL(file, import.meta.url), 'utf8');
    // Modelo novo (dono, 24 Nov): o passo a passo é a história com vídeos reais de cada peça e as
    // perguntas são compactas (CompactFAQ); a ordem das secções mantém-se.
    const process = file === 'LimpezaSofas.tsx' ? '<SofaProcessGuide' : ['LimpezaColchoes.tsx', 'LimpezaCadeiras.tsx'].includes(file) ? '<ChairProcessStory' : '<ServiceProcessStory';
    const sequence = [
      '<ServiceExamplesGallery',
      process,
      '<ServiceEliteGuarantee',
      '<CompactFAQ',
      '<ServiceExpertTips',
      '<ServiceCityLinks',
    ];

    let cursor = 0;
    for (const token of sequence) {
      const position = source.indexOf(token, cursor);
      expect(position, `${token} is missing or out of order`).toBeGreaterThanOrEqual(cursor);
      cursor = position + token.length;
    }
  });
});
