import { describe, expect, it } from 'vitest';
import { bigOrderPrice, botQuote, listBotCities, resolveBotCity } from './botQuote';
import { locationPrices } from '../constants/travel';
import { askedDiscountFor, ASKED_DISCOUNT_PCT } from './botAskedDiscount';

const ok = (input: unknown) => {
  const r = botQuote(input);
  if (!r.ok) throw new Error(r.error);
  return r;
};

describe('botQuote: the numbers the bot replies with come from the site engine', () => {
  it('a U sofa is priced by the seats counted in the photo: up to 4 as 4 lugares, 5+ as 5+; waterproofing = cleaning + 150€ Premium / + 90€ Essencial; alone 179€ / 129€ with travel (25 Oct 2026)', () => {
    const u = (seats: number, treatment = 'clean') => ok({ items: [{ kind: 'sofa', size: 'u', seats, treatment }], city: 'Porto' });
    expect([u(4).subtotal, u(4).handToOwner]).toEqual([99, false]);
    expect([u(5).subtotal, u(5).handToOwner]).toEqual([119, false]);
    const p = u(5, 'clean+premium');
    expect([p.total, p.handToOwner, p.waterproofingTiers]).toEqual([279, false, { travel: 10, premium: 279, essencial: 219 }]);
    const a = u(6, 'premium');
    expect([a.total, a.handToOwner, a.waterproofingTiers]).toEqual([179, false, { travel: 0, premium: 179, essencial: 129 }]);
    expect(u(3, 'essencial').total).toBe(129);
    expect(botQuote({ items: [{ kind: 'sofa', size: 'u' }], city: 'Porto' }).ok).toBe(false);
    expect(ok({ items: [{ kind: 'sofa', size: 'u', seats: 6, look: 'grande', treatment: 'clean+premium' }], city: 'Porto' }).waterproofingTiers).toEqual({ travel: 0, premium: 299, essencial: 239 });
  });
  it('sofa 3 seats in Oeiras: 79€ + 10€ travel (reply 2.1)', () => {
    const r = ok({ items: [{ kind: 'sofa', size: '3-lugares' }], city: 'Oeiras' });
    expect([r.subtotal, r.travel, r.total, r.handToOwner]).toEqual([79, 10, 89, false]);
  });
  it('the same sofa with Essencial is 158€ and travel is on us (reply 2.1)', () => {
    const r = ok({ items: [{ kind: 'sofa', size: '3-lugares', treatment: 'clean+essencial' }], city: 'Oeiras' });
    expect([r.subtotal, r.travel, r.total]).toEqual([159, 0, 159]);
  });
  it('waterproofing alone: Essencial 39/69/89/109, Premium 79/119/149/179 (reply 3.2)', () => {
    const price = (size: string, treatment: string) => ok({ items: [{ kind: 'sofa', size, treatment }], city: 'Porto' }).subtotal;
    expect(['1-lugar', '2-lugares', '3-lugares', '4-lugares'].map(s => price(s, 'essencial'))).toEqual([39, 69, 89, 119]);
    expect(['1-lugar', '2-lugares', '3-lugares', '4-lugares'].map(s => price(s, 'premium'))).toEqual([79, 119, 149, 179]);
  });
  it('waterproofing: the same travel on both versions, never more than 10€ (owner, 15 Oct 2026: 139/114 in Setúbal)', () => {
    const q = (size: string, treatment: string, city: string) => ok({ items: [{ kind: 'sofa', size, treatment }], city });
    // Setúbal (15€): the bot sent Premium 139€ / Essencial 114€; farther towns carry 10€ on both: 149/99 (Essencial menos 10€ desde 25/10).
    for (const t of ['premium', 'essencial']) {
      const r = q('3-lugares', t, 'Setúbal');
      expect(r.waterproofingTiers).toEqual({ travel: 10, premium: 159, essencial: 99 });
      expect(r.travel).toBe(10);
    }
    expect(q('3-lugares', 'essencial', 'Setúbal').total).toBe(99);
    // 10€ towns: never the waiver (owner, 30 Oct 2026, Rio Meão: "159€ e a outra 99€").
    expect(q('3-lugares', 'essencial', 'Porto').waterproofingTiers).toEqual({ travel: 10, premium: 159, essencial: 99 });
    expect(q('3-lugares', 'premium', 'Santa Maria da Feira').waterproofingTiers).toEqual({ travel: 10, premium: 159, essencial: 99 });
    // Several pieces waterproofed in a 10€ town: never travel (owner, 18 Nov 2026, Altieres).
    const multi = ok({ items: [{ kind: 'sofa', size: '2-lugares', treatment: 'essencial' }, { kind: 'chairs', qty: 2, treatment: 'essencial' }], city: 'Lisboa' });
    expect(multi.waterproofingTiers.travel).toBe(0);
    // Chairs waterproofed with another piece: 25/18€ each at any count (owner, 19 Nov 2026, Hugo: 269€ should be 249€).
    const hugo = ok({ items: [{ kind: 'sofa', size: '3-lugares', treatment: 'premium' }, { kind: 'chairs', qty: 4, treatment: 'premium' }], city: 'Lisboa' });
    expect(hugo.waterproofingTiers).toEqual({ travel: 0, premium: 249, essencial: 161 });
    // When travel is charged, both versions carry it, capped at 10€ even in a 20€ town.
    expect(q('2-lugares', 'essencial', 'Porto').waterproofingTiers).toEqual({ travel: 10, premium: 129, essencial: 79 });
    expect(q('1-lugar', 'premium', 'Sines').waterproofingTiers).toEqual({ travel: 10, premium: 89, essencial: 49 });
    expect(q('1-lugar', 'essencial', 'Sines').total).toBe(49);
    // Cleaning with waterproofing follows the same rule.
    const pack = q('1-lugar', 'clean+essencial', 'Setúbal').waterproofingTiers;
    expect(pack?.travel).toBeLessThanOrEqual(10);
    expect(ok({ items: [{ kind: 'sofa', size: '1-lugar' }], city: 'Sines' }).travel).toBe(20);
  });
  it('sofa 4 seats (owner, 2026-10-06): 99€ cleaning, 198€ with Essencial, 159€ with anti-ácaros, 79€ as an added pack item', () => {
    const sub = (treatment: string) => ok({ items: [{ kind: 'sofa', size: '4-lugares', treatment }], city: 'Porto' }).subtotal;
    expect([sub('clean'), sub('clean+essencial'), sub('clean+premium'), sub('clean+anti-acaros')]).toEqual([99, 209, 269, 159]);
    expect(ok({ items: [{ kind: 'sofa', size: '4-lugares' }], city: 'Porto' }).handToOwner).toBe(false);
    const pack = ok({ items: [{ kind: 'mattress', size: 'casal' }, { kind: 'sofa', size: '4-lugares' }], city: 'Porto' });
    expect(pack.lines.map(l => l.amount)).toEqual([69, 79]);
  });
  it('chairs: cleaning by tier, waterproofing alone per chair (reply 1)', () => {
    // WhatsApp (owner, 12 Nov 2026): 25€ each up to 3, 20€ from 4, 18€ from 8; the site's tiers only with site: true.
    expect(ok({ items: [{ kind: 'chairs', qty: 6 }], city: 'Porto' }).subtotal).toBe(120);
    expect(ok({ items: [{ kind: 'chairs', qty: 6 }], city: 'Porto', site: true }).subtotal).toBe(110);
    // From 9 (owner, 19 Nov 2026): 15€ each, never below 8 chairs (9 chairs = 144€).
    expect([1, 3, 4, 7, 8, 9, 10, 12].map(qty => ok({ items: [{ kind: 'chairs', qty }], city: 'Porto' }).subtotal)).toEqual([25, 75, 80, 140, 144, 144, 150, 180]);
    expect(ok({ items: [{ kind: 'chairs', qty: 2 }, { kind: 'chairs', qty: 2 }], city: 'Porto' }).subtotal).toBe(80);
    expect(ok({ items: [{ kind: 'chairs', qty: 2 }], city: 'Braga' }).travel).toBeGreaterThan(0);
    expect(ok({ items: [{ kind: 'chairs', qty: 1, treatment: 'essencial' }], city: 'Porto' }).subtotal).toBe(23);
    expect(ok({ items: [{ kind: 'chairs', qty: 1, treatment: 'premium' }], city: 'Porto' }).subtotal).toBe(30);
    expect(ok({ items: [{ kind: 'chairs', qty: 4, treatment: 'premium' }], city: 'Porto' }).subtotal).toBe(120);
    expect(ok({ items: [{ kind: 'chairs', qty: 6, treatment: 'essencial' }], city: 'Porto' }).subtotal).toBe(108);
  });
  it('mattress with anti-ácaros (reply 3.4)', () => {
    expect(ok({ items: [{ kind: 'mattress', size: 'casal', treatment: 'clean+anti-acaros' }], city: 'Braga' }).subtotal).toBe(89);
  });
  it('5+ seats: cleaning is 119 (owner, 2026-10-06), also as an item added to another order', () => {
    const alone = ok({ items: [{ kind: 'sofa', size: '5-lugares' }], city: 'Porto' });
    expect([alone.total, alone.quote, alone.handToOwner]).toEqual([119, false, false]); // final com deslocação (dono, 22 Nov 2026, Rosângela)
    const added = ok({ items: [{ kind: 'mattress', size: 'casal' }, { kind: 'sofa', size: '5-lugares' }], city: 'Porto' });
    expect(added.lines.map(l => l.amount)).toEqual([69, 119]);
  });
  it('pack condition: sofa 3 seats + double mattress is 79 + 55, the configurator total', () => {
    const r = ok({ items: [{ kind: 'sofa', size: '3-lugares' }, { kind: 'mattress', size: 'casal' }], city: 'Porto' });
    expect(r.lines.map(l => l.amount)).toEqual([79, 55]);
    expect([r.subtotal, r.savings, r.travel, r.total]).toEqual([134, 14, 0, 134]);
  });
  it('returns the rug pickup fee from the site rule, by the summed area of the rugs', () => {
    const fee = (items: unknown[]) => ok({ items, city: 'Porto' }).rugPickup?.fee;
    expect(fee([{ kind: 'rug', width: 1, length: 2 }])).toBeNull();
    expect(fee([{ kind: 'rug', width: 1, length: 2, qty: 2 }])).toBe(20);
    expect(fee([{ kind: 'rug', width: 2, length: 4 }])).toBe(20);
    expect(fee([{ kind: 'rug', width: 2, length: 3 }, { kind: 'rug', width: 2, length: 2 }])).toBe(20);
    expect(fee([{ kind: 'rug', width: 3, length: 4 }])).toBe(20);
    expect(fee([{ kind: 'rug', width: 4, length: 5 }])).toBeNull();
    expect(fee([{ kind: 'rug', width: 2, length: 3 }, { kind: 'rug', width: 2, length: 3.5 }])).toBeNull();
    expect(ok({ items: [{ kind: 'carpet', width: 4, length: 5 }], city: 'Porto' }).rugPickup).toBeNull();
    expect(ok({ items: [{ kind: 'sofa', size: '3-lugares' }], city: 'Porto' }).rugPickup).toBeNull();
  });

  it('hands to the owner: delicate rugs, corner/U-shaped/modular (id 4+-lugares), treatments on 5+ seats, 10+ chairs from the site, unknown or case-by-case localities', () => {
    expect(ok({ items: [{ kind: 'rug', width: 2, length: 3, material: 'seda' }], city: 'Porto' }).handToOwner).toBe(true);
    expect(ok({ items: [{ kind: 'sofa', size: '4+-lugares' }], city: 'Porto' }).handToOwner).toBe(true);
    // 5 seats with waterproofing are priced since 22 Nov 2026 (Rosângela); the anti-mites stays with the owner.
    for (const treatment of ['clean+anti-acaros']) {
      const r = ok({ items: [{ kind: 'sofa', size: '5-lugares', treatment }], city: 'Porto' });
      expect([r.lines[0].amount, r.quote, r.handToOwner], treatment).toEqual([null, true, true]);
    }
    // 10+ chairs: priced on WhatsApp (18€ each, owner 12 Nov 2026); sob orçamento only for a site order.
    expect([ok({ items: [{ kind: 'chairs', qty: 10 }], city: 'Porto' }).subtotal, ok({ items: [{ kind: 'chairs', qty: 10 }], city: 'Porto' }).handToOwner]).toEqual([150, false]); // 15€ each from 9 (owner, 19 Nov 2026)
    expect(ok({ items: [{ kind: 'chairs', qty: 10 }], city: 'Porto', site: true }).handToOwner).toBe(true);
    const unknown = ok({ items: [{ kind: 'sofa', size: '1-lugar' }], city: 'Madrid' });
    expect([unknown.cityKnown, unknown.travel, unknown.handToOwner]).toEqual([false, null, true]);
    const aveiro = ok({ items: [{ kind: 'sofa', size: '1-lugar' }], city: 'Aveiro' });
    expect([aveiro.extendedTrip, aveiro.handToOwner]).toEqual([true, true]);
  });
  it('prices chair waterproofing alone for any number of chairs (owner, 2026-10-09: 10 chairs, 25€ Premium / 18€ Essencial)', () => {
    const premium = ok({ items: [{ kind: 'chairs', qty: 10, treatment: 'premium' }], city: 'Póvoa de Varzim' });
    // From 9 chairs: 22,50€ Premium / 15€ Essencial each (owner, 19 Nov 2026).
    expect([premium.lines[0].amount, premium.travel, premium.total, premium.handToOwner]).toEqual([225, 0, 225, false]);
    const essencial = ok({ items: [{ kind: 'chairs', qty: 12, treatment: 'essencial' }], city: 'Porto' });
    expect([essencial.lines[0].amount, essencial.travel, essencial.total, essencial.handToOwner]).toEqual([180, 0, 180, false]);
    // Waterproofed-only chairs do not push the cleaned ones over the 10-chair quote limit.
    const mixed = ok({ items: [{ kind: 'chairs', qty: 10, treatment: 'essencial' }, { kind: 'chairs', qty: 4 }], city: 'Porto' });
    expect([mixed.lines[1].amount, mixed.handToOwner]).toEqual([80, false]);
  });
  it('9 or more chairs cleaned and waterproofed: cleaning 12,50€ + 22,50€ Premium / 15€ Essencial each (owner, 19 Nov 2026)', () => {
    const r = ok({ items: [{ kind: 'chairs', qty: 12, treatment: 'clean+premium' }], city: 'Cruz Quebrada' });
    expect([r.total, r.waterproofingTiers?.premium, r.waterproofingTiers?.essencial]).toEqual([420, 420, 330]);
    // Cleaning alone: 15€ each from 9 (owner, 19 Nov 2026).
    expect(ok({ items: [{ kind: 'chairs', qty: 12 }], city: 'Cruz Quebrada' }).total).toBe(180);
    // 9 never costs less than 8.
    const p8 = ok({ items: [{ kind: 'chairs', qty: 8, treatment: 'clean+premium' }], city: 'Cruz Quebrada' }).waterproofingTiers!;
    const p9 = ok({ items: [{ kind: 'chairs', qty: 9, treatment: 'clean+premium' }], city: 'Cruz Quebrada' }).waterproofingTiers!;
    expect(p9.premium!).toBeGreaterThanOrEqual(p8.premium!);
    expect(p9.essencial!).toBeGreaterThanOrEqual(p8.essencial!);
  });
  it('matches localities without accents or capitals', () => {
    expect(resolveBotCity('vila nova de gaia')).toBe('Vila Nova de Gaia');
    expect(resolveBotCity('  SETUBAL ')).toBe('Setúbal');
    expect(resolveBotCity(42)).toBeNull();
    expect(listBotCities()).toHaveLength(Object.keys(locationPrices).length);
  });
  it('resolves a freguesia to its municipality, like the quiz (Ericeira, 16 Oct 2026)', () => {
    expect(resolveBotCity('Ericeira')).toBe('Mafra');
    // Part of a union parish (Cascais e Estoril), 22 Oct 2026.
    expect(resolveBotCity('Estoril')).toBe('Cascais');
    // Parish of Mafra with no page on the site, 30 Oct 2026.
    expect(resolveBotCity('Santo Isidoro')).toBe('Mafra');
    expect(resolveBotCity('Parede')).toBe('Cascais');
    expect(resolveBotCity('ericeira, mafra')).toBe('Mafra');
    expect(resolveBotCity('Paranhos (Porto)')).toBe('Porto');
    // A name shared by two served municipalities decides nothing on its own.
    expect(resolveBotCity('Santa Clara')).toBeNull();
    expect(resolveBotCity('Santa Clara, Coimbra')).toBe('Coimbra');
    expect(resolveBotCity('Madrid')).toBeNull();
    const chairs = ok({ items: [{ kind: 'chairs', qty: 4, treatment: 'clean+essencial' }], city: 'Ericeira' });
    expect([chairs.city, chairs.lines[0].amount, chairs.travel, chairs.handToOwner]).toEqual(['Mafra', 172, 10, false]);
  });
  it('rejects what the engine does not sell, with a message the bot developer can read', () => {
    const errors = [
      { items: [{ kind: 'mattress', size: 'casal', treatment: 'premium' }], city: 'Porto' },
      { items: [{ kind: 'rug', width: 2, length: 3, treatment: 'clean+anti-acaros' }], city: 'Porto' },
      { items: [{ kind: 'sofa', size: '6-lugares' }], city: 'Porto' },
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

describe('puffs (owner, 21 Oct 2026)', () => {
  it('25€ alone plus travel, 20€ on the same visit', () => {
    const alone = botQuote({ items: [], city: 'Porto', puffs: 1 });
    expect(alone.ok && alone.puff?.unitPrice).toBe(25);
    expect(alone.ok && alone.total).toBe(35);
    const mixed = botQuote({ items: [{ kind: 'sofa', size: '2-lugares' }], city: 'Porto', puffs: 1 });
    expect(mixed.ok && mixed.puff?.unitPrice).toBe(20);
    expect(mixed.ok && mixed.puff?.total).toBe((mixed.ok ? mixed.total : 0) + 20);
  });
  it('armchairs (cadeirões): 39€ alone plus travel, 29€ on the same visit, never the 1-seater sofa price (owner, 1 Nov 2026)', () => {
    const alone = botQuote({ items: [], city: 'Porto', armchairs: 1 });
    expect(alone.ok && alone.armchair?.unitPrice).toBe(39);
    expect(alone.ok && alone.total).toBe(49);
    const mixed = botQuote({ items: [{ kind: 'sofa', size: '2-lugares' }], city: 'Vila do Conde', armchairs: 1 });
    expect(mixed.ok && mixed.armchair?.unitPrice).toBe(29);
    expect(mixed.ok && mixed.armchair?.total).toBe((mixed.ok ? mixed.total : 0) + 29);
    expect(botQuote({ items: [], city: 'Porto', armchairs: 1, puffs: 1 }).ok).toBe(false);
  });
  it('headboards (cabeceiras): solteiro 29€, casal 39€, queen/king 45€, travel only when alone (owner, 4 Nov 2026)', () => {
    const alone = botQuote({ items: [], city: 'Lisboa', headboards: ['casal'] });
    expect(alone.ok && alone.headboard?.amount).toBe(39);
    expect(alone.ok && alone.total).toBe(39 + (alone.ok ? alone.travel : 0));
    const two = botQuote({ items: [], city: 'Lisboa', headboards: ['solteiro', 'king'] });
    expect(two.ok && two.headboard?.amount).toBe(74);
    const mixed = botQuote({ items: [{ kind: 'sofa', size: '2-lugares' }], city: 'Vila do Conde', headboards: ['queen'] });
    expect(mixed.ok && mixed.headboard?.amount).toBe(45);
    expect(mixed.ok && mixed.headboard?.total).toBe((mixed.ok ? mixed.total : 0) + 45);
    expect(botQuote({ items: [], city: 'Lisboa', headboards: ['gigante'] }).ok).toBe(false);
    expect(botQuote({ items: [], city: 'Lisboa', headboards: ['casal'], puffs: 1 }).ok).toBe(false);
  });
  it('orders above 300€ carry the owner\'s special condition: travel off, 7% off cleaning (4% with waterproofing), ending in 9, at least 20€ (25 Oct 2026)', () => {
    expect(bigOrderPrice(415, 0, false)).toBe(379);
    expect(bigOrderPrice(441, 15, true)).toBe(399);
    expect(bigOrderPrice(305, 0, true)).toBe(279);
    const r = ok({ items: [{ kind: 'sofa', size: '3-lugares' }, { kind: 'mattress', size: 'casal', qty: 2 }, { kind: 'chairs', qty: 6 }], city: 'Porto' });
    if (r.total > 300) expect(r.bigOrder?.special).toBeLessThan(r.total);
    else expect(r.bigOrder).toBeNull();
    expect(ok({ items: [{ kind: 'sofa', size: '3-lugares' }], city: 'Porto' }).bigOrder).toBeNull();
  });

  it('a corner sofa is waterproofed as a 5-seat sofa, the U rule (owner, 20 Nov 2026, Ana Marques)', () => {
    const l = (treatment: string) => ok({ items: [{ kind: 'sofa', size: 'canto', treatment }], city: 'Porto' });
    expect(l('premium')).toMatchObject({ quote: false, total: 199 });
    expect(l('essencial')).toMatchObject({ quote: false, total: 139 });
    expect(l('clean+premium').subtotal).toBe(119 + 150);
    expect(l('clean+essencial').subtotal).toBe(119 + 90);
    expect(l('clean+premium').waterproofingTiers).toMatchObject({ premium: 269, essencial: 209 });
    expect(l('clean').subtotal).toBe(119);
  });
});

describe('sofa of 6 or 7 seats judged on the photo (owner, 9 Nov 2026)', () => {
  const sub = (item: Record<string, unknown>) => ok({ items: [{ kind: 'sofa', ...item }], city: 'Porto' }).subtotal;
  it('cleaning is 129/139/149 by look, U or not; waterproofing +170/+110', () => {
    expect(sub({ size: '5-lugares', seats: 6, look: 'compacto' })).toBe(129);
    expect(sub({ size: '5-lugares', seats: 7, look: 'medio' })).toBe(139);
    expect(sub({ size: 'u', seats: 6, look: 'grande' })).toBe(149);
    expect(sub({ size: '5-lugares', seats: 6, look: 'grande', treatment: 'clean+premium' })).toBe(369);
    expect(sub({ size: '5-lugares', seats: 6, look: 'grande', treatment: 'clean+essencial' })).toBe(309); // +220/+160 (dono, 22 Nov 2026, Rosângela)
  });
  it('needs the look, keeps 5 seats at 119 and sends 8+ to the owner', () => {
    expect(botQuote({ items: [{ kind: 'sofa', size: '5-lugares', seats: 6 }], city: 'Porto' }).ok).toBe(false);
    expect(ok({ items: [{ kind: 'sofa', size: '5-lugares', seats: 5 }], city: 'Porto' }).total).toBe(119);
    expect(ok({ items: [{ kind: 'sofa', size: '5-lugares', seats: 8 }], city: 'Porto' }).quote).toBe(true);
  });
});

describe('anti-odor em tapetes (dono, 12 Nov 2026: +15€, 5€ o m²)', () => {
  it('máx(15€, 5€ × m², para baixo), numa linha própria, somado ao preço do tapete', () => {
    const plain = ok({ items: [{ kind: 'rug', width: 2, length: 3 }], city: 'Lisboa' });
    const smelly = ok({ items: [{ kind: 'rug', width: 2, length: 3, odor: true }], city: 'Lisboa' });
    expect(smelly.rugOdor).toMatchObject({ amount: 30, min: 15, perM2: 5 });
    expect(smelly.lines.at(-1)).toMatchObject({ label: 'Tratamento anti-odor tapete 2 x 3 m', amount: 30 });
    expect(smelly.rugEstimate?.ok && plain.rugEstimate?.ok && smelly.rugEstimate.homePrice - plain.rugEstimate.homePrice).toBe(30);
    // A small rug pays the 15€ floor; 1,55 x 2,35 = 3,64 m² → 18€.
    expect(ok({ items: [{ kind: 'rug', width: 1.2, length: 1.7, odor: true }], city: 'Lisboa' }).rugOdor?.amount).toBe(15);
    expect(ok({ items: [{ kind: 'rug', width: 1.55, length: 2.35, odor: true }], city: 'Lisboa' }).rugOdor?.amount).toBe(18);
    // With a sofa in the same visit: on the combo price.
    const combo = ok({ items: [{ kind: 'sofa', size: '3-lugares' }, { kind: 'rug', width: 2, length: 3 }], city: 'Lisboa' });
    const comboOdor = ok({ items: [{ kind: 'sofa', size: '3-lugares' }, { kind: 'rug', width: 2, length: 3, odor: true }], city: 'Lisboa' });
    expect(comboOdor.rugCombo?.ok && combo.rugCombo?.ok && comboOdor.rugCombo.comboPrice - combo.rugCombo.comboPrice).toBe(30);
    expect(plain.rugOdor).toBeNull();
    // Carpet: sob orçamento, the line is there for the owner.
    expect(ok({ items: [{ kind: 'carpet', width: 4, length: 5, odor: true }], city: 'Lisboa' }).lines.at(-1)).toMatchObject({ label: 'Tratamento anti-odor alcatifa 4 x 5 m', amount: 100 });
    expect(botQuote({ items: [{ kind: 'sofa', size: '3-lugares', odor: true }], city: 'Lisboa' }).ok).toBe(false);
    expect(botQuote({ items: [{ kind: 'rug', width: 2, length: 3, odor: 'sim' }], city: 'Lisboa' }).ok).toBe(false);
  });
});

describe('descida de preço a pedido do cliente (dono, 12 Nov 2026)', () => {
  it('limpeza 10%; com impermeabilização 5% até 500€ e 10% acima; arredondado para baixo', () => {
    expect(ASKED_DISCOUNT_PCT).toEqual({ cleaning: 10, waterproofing: 5, waterproofingAbove: 10 });
    expect(askedDiscountFor(79, false)).toMatchObject({ pct: 10, total: 71, saving: 8 });
    expect(askedDiscountFor(218, true)).toMatchObject({ pct: 5, total: 207, saving: 11 });
    expect(askedDiscountFor(500, true)).toMatchObject({ pct: 5, total: 475 });
    expect(askedDiscountFor(900, true)).toMatchObject({ pct: 10, total: 810, saving: 90 });
    expect(askedDiscountFor(900, false)).toMatchObject({ pct: 10, total: 810 });
    // Never below the engine's minimum travel.
    expect(askedDiscountFor(11, false)?.total).toBe(10);
    expect(askedDiscountFor(10, false)).toBeNull();
    expect(askedDiscountFor(79, false)?.rule).toMatch(/condição especial/);
  });
  it('no quote: sofá 3L Oeiras 89€ → 80€; pack 3L Premium 218€ → 207€; tapete pelo preço em casa', () => {
    expect(ok({ items: [{ kind: 'sofa', size: '3-lugares' }], city: 'Oeiras' }).askedDiscount).toMatchObject({ pct: 10, total: 80, saving: 9 });
    const pack = ok({ items: [{ kind: 'sofa', size: '3-lugares', treatment: 'clean+premium' }], city: 'Porto' });
    expect(pack.total).toBe(219);
    expect(pack.askedDiscount).toMatchObject({ pct: 5, total: 208, saving: 11 });
    const rug = ok({ items: [{ kind: 'rug', width: 2, length: 3 }], city: 'Lisboa' });
    expect(rug.rugEstimate?.ok && rug.askedDiscount?.total).toBe(rug.rugEstimate?.ok ? Math.floor(rug.rugEstimate.homePrice * 0.9) : -1);
  });
  it('null quando é sob orçamento, vai ao dono ou já leva condição especial (pedido grande)', () => {
    expect(ok({ items: [{ kind: 'carpet', width: 4, length: 5 }], city: 'Lisboa' }).askedDiscount).toBeNull();
    expect(ok({ items: [{ kind: 'sofa', size: '3-lugares' }], city: 'Madrid' }).askedDiscount).toBeNull();
    const big = ok({ items: [{ kind: 'chairs', qty: 12, treatment: 'clean+premium' }], city: 'Porto' });
    expect(big.bigOrder).not.toBeNull();
    expect(big.askedDiscount).toBeNull();
    const several = ok({ items: [{ kind: 'sofa', size: '4-lugares', treatment: 'clean+premium' }, { kind: 'sofa', size: '3-lugares', treatment: 'clean+premium' }, { kind: 'mattress', size: 'casal' }], city: 'Porto' });
    expect(several.sameVisitSpecial).not.toBeNull();
    expect(several.bigOrder).toBeNull();
    expect(several.askedDiscount).toBeNull();
  });
});

describe('sofá de pele (dono, 20 Nov 2026: tratamento da pele +40€, +60€ em 5 ou 6 lugares, nunca impermeabilização)', () => {
  it('soma 40€ por sofá de pele, numa linha própria, sem versões de impermeabilização', () => {
    const plain = ok({ items: [{ kind: 'sofa', size: '3-lugares' }], city: 'Lisboa' });
    const leather = ok({ items: [{ kind: 'sofa', size: '3-lugares', leather: true }], city: 'Lisboa' });
    expect(leather.total).toBe((plain.total as number) + 40);
    expect(leather.lines.at(-1)).toMatchObject({ label: 'Tratamento da pele (limpeza e hidratação)', amount: 40 });
    expect(leather.waterproofingTiers).toBeNull();
  });
  it('soma 60€ num sofá de pele de 5 ou 6 lugares', () => {
    const plain5 = ok({ items: [{ kind: 'sofa', size: '5-lugares' }], city: 'Lisboa' });
    const leather5 = ok({ items: [{ kind: 'sofa', size: '5-lugares', leather: true }], city: 'Lisboa' });
    expect(leather5.total).toBe((plain5.total as number) + 60);
    const plain6 = ok({ items: [{ kind: 'sofa', size: '5-lugares', seats: 6, look: 'medio' }], city: 'Lisboa' });
    const leather6 = ok({ items: [{ kind: 'sofa', size: '5-lugares', seats: 6, look: 'medio', leather: true }], city: 'Lisboa' });
    expect(leather6.total).toBe((plain6.total as number) + 60);
  });
  it('recusa impermeabilização num sofá de pele', () => {
    expect(botQuote({ items: [{ kind: 'sofa', size: '3-lugares', treatment: 'clean+premium', leather: true }], city: 'Lisboa' }).ok).toBe(false);
  });
});

describe('condição especial na mesma visita, no total final (dono, 20 Nov 2026, Ana Marques)', () => {
  const ana = (treatment: string) => ok({ city: 'Armação de Pêra', items: [{ kind: 'sofa', size: 'canto', treatment }, { kind: 'rug', width: 2.5, length: 3.5 }], headboards: ['casal'] });
  it('cada peça ao preço de tabela, o total × 0,9 a acabar em 9, em cada opção', () => {
    expect(ana('clean').sameVisitSpecial).toMatchObject({ normal: 247, total: 219 });
    expect(ana('clean+premium').sameVisitSpecial).toMatchObject({ normal: 397, total: 349 });
    expect(ana('clean+essencial').sameVisitSpecial).toMatchObject({ normal: 337, total: 299 });
    expect(ana('clean+premium').sameVisitSpecial.options).toEqual({ cleaning: { normal: 247, total: 219 }, premium: { normal: 397, total: 349 }, essencial: { normal: 337, total: 299 } });
    expect(ana('clean').rugCombo.comboPrice).toBe(208);
    expect(ana('clean').askedDiscount).toBeNull();
  });
  it('uma peça só não leva; com os preços Black Friday não leva', () => {
    expect(ok({ items: [{ kind: 'sofa', size: 'canto' }], city: 'Porto' }).sameVisitSpecial).toBeNull();
    const bf = ok({ items: [{ kind: 'sofa', size: '3-lugares' }, { kind: 'mattress', size: 'casal' }], city: 'Porto', campaign: 'BFGTA' });
    if (bf.blackFriday) expect(bf.sameVisitSpecial).toBeNull();
  });
});
