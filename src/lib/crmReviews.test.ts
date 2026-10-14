import { describe, expect, it } from 'vitest';
import { goalProgress, monthlyReviewStats, serviceReviews, unlinkedReviews, type GoogleReview, type ReviewService } from './crmReviews';

const review = (over: Partial<GoogleReview>): GoogleReview => ({
  review_id: Math.random().toString(36),
  profile: 'porto',
  author: 'Cliente',
  stars: 5,
  reviewed_at: '2026-09-10T10:00:00Z',
  service_request_id: null,
  excluded: null,
  ...over,
});

const service = (over: Partial<ReviewService>): ReviewService => ({
  id: Math.random().toString(36),
  request_date: '2026-09-10',
  client_name: 'Cliente',
  city: 'Porto',
  locality: 'Porto',
  billed_value: 89,
  ...over,
});

describe('monthlyReviewStats', () => {
  it('counts per month in Lisbon time, fills empty months and keeps a running total', () => {
    const stats = monthlyReviewStats([
      review({ reviewed_at: '2026-08-31T23:30:00Z' }), // 1 Sep in Lisbon
      review({ reviewed_at: '2026-09-15T10:00:00Z', profile: 'lisboa', stars: 4 }),
      review({ reviewed_at: '2026-11-02T10:00:00Z', stars: 3 }),
    ], '2026-11');
    expect(stats.map(s => [s.month, s.count, s.cumulative, s.change])).toEqual([
      ['2026-09', 2, 2, null],
      ['2026-10', 0, 2, -2],
      ['2026-11', 1, 3, 1],
    ]);
    expect(stats[0]).toMatchObject({ porto: 1, lisboa: 1, five: 1, four: 1, low: 0, average: 4.5 });
    expect(stats[1].average).toBeNull();
    expect(stats[2].low).toBe(1);
  });

  it('leaves out reviews from the team or family', () => {
    const stats = monthlyReviewStats([review({}), review({ excluded: 'equipa' })], '2026-09');
    expect(stats[0].count).toBe(1);
  });
});

describe('serviceReviews', () => {
  it('a 4 or 5 star review counts, below 4 does not, and 0€ revisits are not services', () => {
    const a = service({ id: 'a' });
    const b = service({ id: 'b' });
    const c = service({ id: 'c' });
    const revisit = service({ id: 'r', billed_value: 0 });
    const other = service({ id: 'o', request_date: '2026-10-01' });
    const sum = serviceReviews([a, b, c, revisit, other], [
      review({ service_request_id: 'a', stars: 4 }),
      review({ service_request_id: 'b', stars: 2 }),
    ], '2026-09');
    expect(sum.services).toBe(3);
    expect(sum.withReview).toBe(1);
    expect(sum.lowReview).toBe(1);
    expect(sum.rate).toBe(33.3);
    expect(sum.rows.find(r => r.service.id === 'c')?.review).toBeNull();
  });

  it('an excluded review does not count for the service', () => {
    const sum = serviceReviews([service({ id: 'a' })], [review({ service_request_id: 'a', excluded: 'família' })], '2026-09');
    expect(sum.withReview).toBe(0);
  });
});

describe('unlinkedReviews', () => {
  it('lists the month reviews with no service, without excluded ones', () => {
    const list = unlinkedReviews([
      review({ author: 'A' }),
      review({ author: 'B', service_request_id: 'x' }),
      review({ author: 'C', excluded: 'equipa' }),
      review({ author: 'D', reviewed_at: '2026-10-02T10:00:00Z' }),
    ], '2026-09');
    expect(list.map(r => r.author)).toEqual(['A']);
  });
});

describe('goalProgress', () => {
  it('counts every review of the profile up to the month, excluded ones too', () => {
    const [porto, lisboa] = goalProgress([
      review({ reviewed_at: '2026-01-10T10:00:00Z' }),
      review({ reviewed_at: '2026-10-05T10:00:00Z', excluded: 'equipa' }),
      review({ reviewed_at: '2026-11-05T10:00:00Z' }),
      review({ profile: 'lisboa', reviewed_at: '2026-10-05T10:00:00Z' }),
    ], '2026-10');
    expect(porto).toMatchObject({ total: 170, current: 2, missing: 168 });
    expect(lisboa).toMatchObject({ total: 60, current: 1, missing: 59 });
    expect(goalProgress([], '2026-11')).toEqual([]);
  });
});
