import { describe, expect, it } from 'vitest';
import { EN_PAGES } from './enTouristSeoData';
import { EN_AVAILABILITY_PROMISE, EN_RESPONSE_PROMISE, EN_COVERAGE_PROMISE } from '../constants/commercialPolicy';
import { PUBLISHED_REVIEWS, LISBON_REVIEWS } from './reviewsPool';
import fs from 'node:fs';

describe('commercial completion regressions', () => {
  it('gives every English page the same availability, response and regional coverage', () => {
    for (const page of EN_PAGES) {
      expect(page.intro).toContain(EN_AVAILABILITY_PROMISE);
      expect(page.whyUs).toContain(EN_RESPONSE_PROMISE);
      expect(page.whyUs).toContain(EN_COVERAGE_PROMISE);
      expect(JSON.stringify(page)).not.toMatch(/hospital-grade|We come out the same day/);
    }
  });
  it('does not publish filler reviews or unconfirmed city labels on the homepage', () => {
    expect(PUBLISHED_REVIEWS.length).toBeGreaterThan(20);
    expect(PUBLISHED_REVIEWS.some(r => ['Isabel N.', 'Marta C.', 'Beatriz N.', 'Ricardo A.'].includes(r.name))).toBe(false);
    for (const review of PUBLISHED_REVIEWS.filter(r => r.city)) {
      expect(LISBON_REVIEWS.some(r => r.name === review.name && r.text === review.text)).toBe(true);
    }
  });
  it('keeps old availability, drying and germ-inclusion claims out of shared generators', () => {
    for (const file of ['scripts/prerender.ts', 'src/data/keywordVariantData.ts', 'src/data/marcaColchaoData.ts']) {
      const source = fs.readFileSync(file, 'utf8');
      expect(source).not.toMatch(/agendamento em 48h|3 a 5 horas|Bactericida certificado|Eliminação de bactérias e germes/);
    }
  });
  it('does not let pre-existing stains exclude the promised repeat intervention', () => {
    const source = fs.readFileSync('src/pages/PoliticaDevolucoes.tsx','utf8');
    expect(source).not.toContain('independentemente de terem sido reportados');
    expect(source).toContain('não retira o acesso à repetição gratuita');
  });
});
