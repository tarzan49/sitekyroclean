import { describe, expect, it } from 'vitest';
import { PUBLISHED_REVIEWS, formatReviewDate, pickReviewSubset, reviewRegion } from './reviewsPool';

const SERVICES = ['limpeza-sofas', 'limpeza-colchoes', 'limpeza-tapetes', 'limpeza-cadeiras', 'limpeza-alcatifas', 'impermeabilizacao'];

describe('Google reviews on service pages', () => {
  it('only carries real Google reviews with stars and a date', () => {
    for (const r of PUBLISHED_REVIEWS) {
      expect(r.rating).toBeGreaterThanOrEqual(4);
      expect(r.date).toMatch(/^\d{4}(-\d{2})?$/);
      expect(r.text.trim().length).toBeGreaterThan(0);
    }
    // Filler testimonials written in 2026-08 must never come back.
    expect(PUBLISHED_REVIEWS.some(r => ['Isabel N.', 'Marta C.', 'Beatriz N.', 'Ricardo A.', 'Teresa F.', 'Maria S.', 'Rui T.'].includes(r.name))).toBe(false);
    expect(formatReviewDate('2026-09')).toBe('setembro de 2026');
    expect(formatReviewDate('2025')).toBe('2025');
  });

  it('has every 4 and 5 star Google review with text, once (dono, 25 Nov)', () => {
    expect(PUBLISHED_REVIEWS.length).toBeGreaterThanOrEqual(145);
    const texts = PUBLISHED_REVIEWS.map(r => `${r.name}|${r.city ?? ''}|${r.text}`);
    expect(new Set(texts).size).toBe(texts.length);
    expect(PUBLISHED_REVIEWS.some(r => /Traduzido pelo Google|\(Original\)/.test(r.text))).toBe(false);
  });

  it('shows six reviews, leads with the page service and mixes other services', () => {
    for (const service of SERVICES) {
      for (const page of ['/x-porto', '/x-braga', '/x-lisboa', '/x-faro']) {
        const reviews = pickReviewSubset(service, `${service}${page}`);
        expect(reviews).toHaveLength(6);
        expect(new Set(reviews).size).toBe(6);
      }
    }
    const sofa = pickReviewSubset('limpeza-sofas', '/limpeza-sofas-porto');
    expect(sofa[0].text).toMatch(/sof[áa]|poltrona|chaise|estofo|upholstery/i);
    // Dono, 14 Nov: só 5 estrelas e nunca avaliações de outro serviço.
    for (const service of SERVICES) {
      for (const r of pickReviewSubset(service, `${service}/x-porto`, 20)) {
        expect(r.rating).toBe(5);
        const others = Object.entries({ 'limpeza-sofas': /sof[áa]|chaise|poltrona|estofo|upholstery/i, 'limpeza-colchoes': /colch|mattress/i, 'limpeza-tapetes': /tapete|carpete|\brug\b|carpet/i }).filter(([s]) => s !== service);
        const own = { 'limpeza-sofas': /sof[áa]|chaise|poltrona|estofo|upholstery/i, 'limpeza-colchoes': /colch|mattress/i, 'limpeza-tapetes': /tapete|carpete|\brug\b|carpet/i }[service as 'limpeza-sofas'];
        if (own && !own.test(r.text)) for (const [, re] of others) expect(r.text).not.toMatch(re);
      }
    }
    expect(pickReviewSubset('impermeabilizacao', '/impermeabilizacao-lisboa')[0].text).toMatch(/impermeabiliz/i);
  });

  it('labels only Lisbon-profile reviews with a city and keeps them off other regions', () => {
    expect(reviewRegion('/limpeza-sofas-lisboa-alvalade')).toBe('lisboa');
    expect(reviewRegion('Vila Nova de Gaia')).toBe('porto');
    expect(pickReviewSubset('limpeza-sofas', '/limpeza-sofas-lisboa')[0].city).toBe('Lisboa');
    for (const page of ['/limpeza-sofas-porto', '/limpeza-sofas-braga']) {
      expect(pickReviewSubset('limpeza-sofas', page).every(r => !r.city)).toBe(true);
    }
    // Manuel Reis avaliou as duas fichas: só a de Lisboa leva a cidade.
    const lisbon = PUBLISHED_REVIEWS.filter(r => r.city === 'Lisboa');
    for (const page of ['/limpeza-sofas-lisboa', '/limpeza-colchoes-cascais']) {
      for (const r of pickReviewSubset('limpeza-sofas', page, 20)) if (r.city) expect(lisbon).toContainEqual(r);
    }
    expect(pickReviewSubset('limpeza-tapetes', 'porto')).toEqual(pickReviewSubset('limpeza-tapetes', 'porto'));
  });
});
