import { describe, it, expect } from 'vitest';
import { advertisingPlatform, coveredSpend, lisbonMidnight, periodDates, platformEvents } from './marketingPlatforms';

describe('separação de plataformas', () => {
  it('não confunde partilhas orgânicas Meta com anúncios', () => {
    expect(advertisingPlatform({ last_source: 'facebook', last_medium: 'social', is_paid: true, fbclid: 'shared-link' })).toBeNull();
    expect(advertisingPlatform({ last_source: 'ig', last_medium: 'paid_social' })).toBe('meta');
    expect(advertisingPlatform({ last_source: 'meta', attribution_method: 'manual' })).toBe('meta');
    expect(advertisingPlatform({ last_source: 'google', last_medium: 'organic' })).toBeNull();
  });
  it('não credita o mesmo pedido a Google e Meta', () => {
    expect(advertisingPlatform({ last_source: 'facebook', last_medium: 'paid_social', gclid: 'older-touch' })).toBe('meta');
    expect(advertisingPlatform({ gclid: 'google-touch' })).toBe('google');
    expect(advertisingPlatform({ last_source: 'bing', last_medium: 'cpc' })).toBeNull();
  });
  it('não inclui sessões antigas sem origem só por terem is_paid', () => {
    expect(platformEvents([{ session_id:'a', action:'page_view', created_at:'', page_path:'/', landing_page:'/', is_paid:true, campaign_id:null }], 'google')).toHaveLength(0);
  });
});
describe('gasto completo por dia', () => {
  const rows = [{ platform:'meta' as const, spend_date:'2026-09-20', amount:10 }, { platform:'meta' as const, spend_date:'2026-09-22', amount:20 }];
  it('bloqueia taxas quando falta um dia intermédio', () => {
    expect(coveredSpend(rows,'meta','2026-09-20','2026-09-22')).toEqual({ rows:null, missing:1,total:30 });
  });
  it('aceita zero explícito e não mistura outra plataforma', () => {
    const result = coveredSpend([...rows,{platform:'meta',spend_date:'2026-09-21',amount:0},{platform:'google',spend_date:'2026-09-21',amount:100}], 'meta','2026-09-20','2026-09-22');
    expect(result.missing).toBe(0); expect(result.total).toBe(30); expect(result.rows).toHaveLength(3);
  });
  it('usa calendário português e preserva mudanças de hora', () => {
    expect(periodDates(7,new Date('2026-09-21T23:30:00Z'))).toEqual({start:'2026-09-16',end:'2026-09-22'});
    expect(lisbonMidnight('2026-09-22')).toBe('2026-09-21T23:00:00.000Z');
    expect(lisbonMidnight('2026-03-29')).toBe('2026-03-29T00:00:00.000Z');
    expect(lisbonMidnight('2026-10-25')).toBe('2026-10-24T23:00:00.000Z');
  });
});
