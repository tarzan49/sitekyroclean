// Deslocação à parte (dono, 25 Nov 2026): serviço + deslocação = total do motor, em todas as peças e localidades.
import { describe, expect, it } from 'vitest';
import { botQuote } from './botQuote';
import { priceSplit, serviceLines, travelLabel, type EngineItem } from './servicePrice';
import { calculateTravelFee, TRAVEL_FREE_ABOVE } from '../constants/travel';

const engineTotal = (city: string, items: EngineItem[]) => {
  const r = botQuote({ city, items }) as unknown as { total?: number | null; rugEstimate?: { homePrice: number } | null; rugCombo?: { comboPrice: number } | null };
  const rugs = items.filter(i => i.kind === 'rug' || i.kind === 'carpet').length;
  return rugs === items.length ? r.rugEstimate!.homePrice : rugs ? r.rugCombo!.comboPrice : r.total;
};
const pieces: EngineItem[] = [
  ...['1-lugar', '2-lugares', '3-lugares', '4-lugares', '5-lugares'].flatMap(size => ['clean', 'clean+premium', 'clean+essencial', 'premium', 'essencial'].map(treatment => ({ kind: 'sofa', size, treatment }))),
  { kind: 'sofa', size: '5-lugares', seats: 6, look: 'compacto', treatment: 'clean+premium' }, { kind: 'sofa', size: '3-lugares', treatment: 'clean', leather: true }, { kind: 'sofa', size: '3-lugares', treatment: 'clean+anti-acaros' }, { kind: 'sofa', size: '3-lugares', qty: 2, treatment: 'clean' },
  ...['solteiro', 'casal', 'king'].flatMap(size => ['clean', 'clean+anti-acaros'].map(treatment => ({ kind: 'mattress', size, treatment }))),
  ...[1, 2, 4, 6, 12].flatMap(qty => ['clean', 'clean+premium', 'essencial'].map(treatment => ({ kind: 'chairs', qty, treatment }))),
  ...[[0.5, 0.5], [1.2, 1.7], [2, 3]].map(([width, length]) => ({ kind: 'rug', width, length, treatment: 'clean', material: 'lã' })),
  { kind: 'rug', width: 2, length: 3, treatment: 'clean', material: 'sisal', odor: true }, { kind: 'carpet', width: 4, length: 6, treatment: 'clean' },
];
const visits: EngineItem[][] = [...pieces.map(p => [p]), ...pieces.flatMap((a, i) => pieces.filter((_, j) => (i + j) % 7 === 0).map(b => [a, b]))];

describe('serviço + deslocação = total do motor', () => {
  for (const city of ['Lisboa', 'Porto', 'Cascais', 'Braga', 'Guimarães', 'Arouca', 'Aveiro', 'Vila do Bispo', 'Funchal']) it(city, () => {
    let checked = 0;
    for (const items of visits) {
      const s = priceSplit(city, items), where = `${city} ${JSON.stringify(items)}`;
      if (!s) continue;
      checked++;
      expect(s.total, where).toBe(engineTotal(city, items));
      expect(s.service + s.travel, where).toBeCloseTo(s.total, 2);
      expect(s.service, where).toBeGreaterThan(0);
      expect(s.travel, where).toBeGreaterThanOrEqual(0);
      expect(serviceLines(city, items)!.reduce((t, v) => t + v, 0), where).toBeCloseTo(s.service, 2);
      if (s.struck !== null) expect(s.struck - s.service, where).toBeGreaterThanOrEqual(5);
    }
    expect(checked).toBeGreaterThan(pieces.length * 0.8);
  }, 120_000);
});

describe('casos conhecidos', () => {
  const sofa = (treatment: string) => ({ kind: 'sofa', size: '3-lugares', treatment });
  it('3 lugares, Lisboa: 79€ + 10€; Blindado 219€ sem deslocação, riscado 249€ (o do motor, em separado)', () => {
    expect(priceSplit('Lisboa', [sofa('clean')])).toMatchObject({ service: 79, travel: 10, total: 89, struck: null });
    expect(priceSplit('Lisboa', [sofa('clean+premium')])).toMatchObject({ service: 219, travel: 0, total: 219, struck: 249 });
  });
  it('colchão de casal com anti-ácaros: a poupança é a do motor', () => {
    const items = [{ kind: 'mattress', size: 'casal', treatment: 'clean+anti-acaros' }], x = priceSplit('Lisboa', items)!, m = (botQuote({ city: 'Lisboa', items }) as unknown as { mattressMitePack: { separate: number; total: number } }).mattressMitePack;
    expect(x.struck! - x.service).toBe(m.separate - m.total);
  });
  it('serviço pequeno longe de Odivelas: o acréscimo é deslocação, o serviço fica 20€ por cadeira', () => expect(priceSplit('Cascais', [{ kind: 'chairs', qty: 2, treatment: 'clean' }])).toMatchObject({ service: 40, travel: 20, total: 60 }));
  it('visita (dono, 25 Nov): 3L + colchão = 149€ (riscado 209€) com o anti-ácaros oferecido e deslocação grátis', () => {
    const g = [sofa('clean'), { kind: 'mattress', size: 'casal', treatment: 'clean' }], s = priceSplit('Lisboa', g)!;
    expect(s).toMatchObject({ service: 149, travel: 0, total: 149, struck: 209 });
    expect(travelLabel(s)).toBe('deslocação grátis');
    expect(serviceLines('Lisboa', g)).toEqual([79, 70]);
    expect(priceSplit('Lisboa', [{ ...sofa('clean'), qty: 2 }])).toMatchObject({ service: 159, travel: 0, total: 159 });
  });
  it('uma só deslocação por visita, à tabela, e o total nunca desce ao juntar uma peça', () => {
    const add = [sofa('clean'), { kind: 'mattress', size: 'solteiro', treatment: 'clean' }, { kind: 'chairs', qty: 2, treatment: 'clean' }, { kind: 'rug', width: 1.2, length: 1.7, treatment: 'clean', material: 'lã' }, { kind: 'sofa', size: '1-lugar', treatment: 'clean' }];
    for (const [city, fee] of [['Lisboa', 10], ['Guimarães', 15], ['Pombal', 20], ['Vila do Bispo', 25]] as const) for (let m = 1; m < 32; m++) {
      const g = add.filter((_, k) => m & (1 << k)), s = priceSplit(city, g)!;
      expect(s.travel, `${city} ${m}`).toBeLessThanOrEqual(fee);
      for (let k = 0; k < add.length; k++) if (!(m & (1 << k))) expect(priceSplit(city, add.filter((_, n) => (m | (1 << k)) & (1 << n)))!.total, `${city} ${m} + ${k}`).toBeGreaterThanOrEqual(s.total);
    }
  });
  it('tapete minúsculo: nunca um serviço negativo; localidade desconhecida: sem preço separado', () => {
    expect(priceSplit('Lisboa', [{ kind: 'rug', width: 0.5, length: 0.5, treatment: 'clean', material: 'lã' }])).toMatchObject({ service: 9, travel: 0 });
    expect(priceSplit('Xpto', [sofa('clean')])).toBeNull();
  });
});

it('os limites ditos no texto são os do motor', () => {
  for (const [fee, limit] of Object.entries(TRAVEL_FREE_ABOVE)) {
    expect(calculateTravelFee(Number(fee), limit - 1)).toBe(Number(fee));
    expect(calculateTravelFee(Number(fee), limit + 1)).toBe(0);
  }
});
