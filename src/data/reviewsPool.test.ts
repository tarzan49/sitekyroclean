import { afterEach, describe, expect, it } from 'vitest';
import { CONFIRMED_REVIEW_LOCATIONS, pickReviewSubset, reviewRegion } from './reviewsPool';

const originalLocations = { ...CONFIRMED_REVIEW_LOCATIONS };
afterEach(() => {
  for (const name of Object.keys(CONFIRMED_REVIEW_LOCATIONS)) delete CONFIRMED_REVIEW_LOCATIONS[name];
  Object.assign(CONFIRMED_REVIEW_LOCATIONS, originalLocations);
});

describe('regional service reviews', () => {
  it('does not reuse unconfirmed cities or filler testimonials', () => {
    const reviews = pickReviewSubset('limpeza-cadeiras', 'porto', 100);
    expect(reviews.length).toBeGreaterThan(0);
    expect(reviews.every(review => !review.city)).toBe(true);
    expect(reviews.some(review => ['Teresa F.', 'Beatriz N.'].includes(review.name))).toBe(false);
  });

  it('uses only confirmed Lisbon reviews and leads with the relevant service', () => {
    for (const [service, author] of [['limpeza-sofas', 'Cláudio Ferreira'], ['limpeza-colchoes', 'Rute Ribeiro'], ['limpeza-alcatifas', 'José Miguel Silva']]) {
      const reviews = pickReviewSubset(service, '/higienizacao-sofa-lisboa');
      expect(reviews).toHaveLength(6);
      expect(reviews.every(review => review.city === 'Lisboa')).toBe(true);
      expect(reviews[0].name).toBe(author);
    }
    expect(pickReviewSubset('limpeza-cadeiras', 'cascais').every(review => review.city === 'Lisboa')).toBe(true);
  });

  it('prioritizes confirmed local reviews and excludes another region', () => {
    CONFIRMED_REVIEW_LOCATIONS['Beatriz Lança'] = { city: 'Oeiras', region: 'lisboa', source: 'test fixture' };
    CONFIRMED_REVIEW_LOCATIONS['Lucas Costa'] = { city: 'Porto', region: 'porto', source: 'test fixture' };
    const reviews = pickReviewSubset('limpeza-sofas', '/higienizacao-sofa-lisboa', 100);
    expect(reviews.find(review => review.name === 'Beatriz Lança')?.city).toBe('Oeiras');
    expect(reviews.some(review => review.name === 'Lucas Costa')).toBe(false);
  });

  it('keeps service relevance and deterministic selection across parish pages', () => {
    expect(reviewRegion('/limpeza-sofas-lisboa-alvalade')).toBe('lisboa');
    expect(reviewRegion('Vila Nova de Gaia')).toBe('porto');
    const reviews = pickReviewSubset('limpeza-tapetes', 'porto');
    expect(reviews).toEqual(pickReviewSubset('limpeza-tapetes', 'porto'));
    expect(reviews.some(review => review.name === 'Miriam Salomão')).toBe(true);
    expect(reviews.some(review => review.name === 'Beatriz Lança')).toBe(false);
  });
});
