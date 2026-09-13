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
    const sequence = [
      '<ServiceExamplesGallery',
      file === 'LimpezaSofas.tsx' ? '<SofaProcessGuide' : '<ServiceProcessGuide',
      '<ServiceEliteGuarantee',
      'variant="dark"',
      '<ServiceFAQ',
      'variant="light"',
      '<ServiceExpertTips',
      'variant="dark"',
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
