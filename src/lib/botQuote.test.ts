import { describe, expect, it } from 'vitest';
import { botQuote, listBotCities, resolveBotCity } from './botQuote';
import { locationPrices } from '../constants/travel';

const ok = (input: unknown) => {
  const r = botQuote(input);
  if (!r.ok) throw new Error(r.error);
  return r;
};

describe('botQuote: the numbers the bot replies with come from the site engine', () => {
  it('sofa 3 seats in Oeiras: 79€ + 10€ travel (reply 2.1)', () => {
    const r = ok({ items: [{ kind: 'sofa', size: '3-lugares' }], city: 'Oeiras' });
    expect([r.subtotal, r.travel, r.total, r.handToOwner]).toEqual([79, 10, 89, false]);
  });
  it('the same sofa with Essencial is 159€ and travel is on us (reply 2.1)', () => {
    const r = ok({ items: [{ kind: 'sofa', size: '3-lugares', treatment: 'clean+essencial' }], city: 'Oeiras' });
    expect([r.subtotal, r.travel, r.total]).toEqual([159, 0, 159]);
  });
  it('waterproofing alone: Essencial 59/79/99/119, Premium 89/109/139/169 (reply 3.2)', () => {
    const price = (size: string, treatment: string) => ok({ items: [{ kind: 'sofa', size, treatment }], city: 'Porto' }).subtotal;
    expect(['1-lugar', '2-lugares', '3-lugares', '4-lugares'].map(s => price(s, 'essencial'))).toEqual([59, 79, 99, 119]);
    expect(['1-lugar', '2-lugares', '3-lugares', '4-lugares'].map(s => price(s, 'premium'))).toEqual([89, 109, 139, 169]);
  });
  it('sofa 4 seats (owner, 2026-10-06): 99€ cleaning, 199€ with Essencial, 159€ with anti-ácaros, 79€ as an added pack item', () => {
    const sub = (treatment: string) => ok({ items: [{ kind: 'sofa', size: '4-lugares', treatment }], city: 'Porto' }).subtotal;
    expect([sub('clean'), sub('clean+essencial'), sub('clean+premium'), sub('clean+anti-acaros')]).toEqual([99, 199, 229, 159]);
    expect(ok({ items: [{ kind: 'sofa', size: '4-lugares' }], city: 'Porto' }).handToOwner).toBe(false);
    const pack = ok({ items: [{ kind: 'mattress', size: 'casal' }, { kind: 'sofa', size: '4-lugares' }], city: 'Porto' });
    expect(pack.lines.map(l => l.amount)).toEqual([69, 79]);
  });
  it('chairs: cleaning by tier, waterproofing alone per chair (reply 1)', () => {
    expect(ok({ items: [{ kind: 'chairs', qty: 6 }], city: 'Porto' }).subtotal).toBe(110);
    expect(ok({ items: [{ kind: 'chairs', qty: 1, treatment: 'essencial' }], city: 'Porto' }).subtotal).toBe(18);
    expect(ok({ items: [{ kind: 'chairs', qty: 1, treatment: 'premium' }], city: 'Porto' }).subtotal).toBe(25);
  });
  it('mattress with anti-ácaros (reply 3.4)', () => {
    expect(ok({ items: [{ kind: 'mattress', size: 'casal', treatment: 'clean+anti-acaros' }], city: 'Braga' }).subtotal).toBe(89);
  });
  it('pack condition: sofa 3 seats + double mattress is 79 + 55, the configurator total', () => {
    const r = ok({ items: [{ kind: 'sofa', size: '3-lugares' }, { kind: 'mattress', size: 'casal' }], city: 'Porto' });
    expect(r.lines.map(l => l.amount)).toEqual([79, 55]);
    expect([r.subtotal, r.savings, r.travel, r.total]).toEqual([134, 14, 0, 134]);
  });
  it('hands to the owner: rugs, 5+ seats or U-shaped (id 4+-lugares), 10+ chairs, unknown or case-by-case localities', () => {
    expect(ok({ items: [{ kind: 'rug', width: 2, length: 3 }], city: 'Porto' }).handToOwner).toBe(true);
    expect(ok({ items: [{ kind: 'sofa', size: '4+-lugares' }], city: 'Porto' }).handToOwner).toBe(true);
    expect(ok({ items: [{ kind: 'chairs', qty: 10 }], city: 'Porto' }).handToOwner).toBe(true);
    const unknown = ok({ items: [{ kind: 'sofa', size: '1-lugar' }], city: 'Madrid' });
    expect([unknown.cityKnown, unknown.travel, unknown.handToOwner]).toEqual([false, null, true]);
    const aveiro = ok({ items: [{ kind: 'sofa', size: '1-lugar' }], city: 'Aveiro' });
    expect([aveiro.extendedTrip, aveiro.handToOwner]).toEqual([true, true]);
  });
  it('matches localities without accents or capitals', () => {
    expect(resolveBotCity('vila nova de gaia')).toBe('Vila Nova de Gaia');
    expect(resolveBotCity('  SETUBAL ')).toBe('Setúbal');
    expect(resolveBotCity(42)).toBeNull();
    expect(listBotCities()).toHaveLength(Object.keys(locationPrices).length);
  });
  it('rejects what the engine does not sell, with a message the bot developer can read', () => {
    const errors = [
      { items: [{ kind: 'mattress', size: 'casal', treatment: 'premium' }], city: 'Porto' },
      { items: [{ kind: 'rug', width: 2, length: 3, treatment: 'clean+anti-acaros' }], city: 'Porto' },
      { items: [{ kind: 'sofa', size: '5-lugares' }], city: 'Porto' },
      { items: [{ kind: 'sofa', size: '1-lugar', qty: 0 }], city: 'Porto' },
      { items: [{ kind: 'rug' }], city: 'Porto' },
      { items: [{ kind: 'bed' }], city: 'Porto' },
      { items: [], city: 'Porto' },
      'sofa',
    ].map(botQuote);
    for (const r of errors) {
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.length).toBeGreaterThan(5);
    }
  });
});
