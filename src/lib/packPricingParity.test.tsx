import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { calculateCustomPack, makePackItem, type CustomPackItem, type PackExtra } from './customPack';
import { useQuizPricing } from '@/hooks/use-quiz-pricing';
import { initialFormData, type QuizFormData, type SofaItem, type MattressItem, type UpsellItemConfig } from '@/components/quiz/QuizTypes';
import { priceComboExtras } from '@/components/quiz/quizHelpers';
import QuizComboUpsellScreen from '@/components/quiz/steps/QuizComboUpsellScreen';

afterEach(cleanup);

// O mesmo pedido tem de custar o mesmo no quiz e no configurador das páginas
// de pack. Até 2026-09-26 não custava: sofá 3 lugares + sofá 2 lugares dava
// 148€ no quiz e 134€ no configurador, que dava preço de pack a tudo o que
// viesse depois da primeira linha.
//
// Cada cesto: o serviço principal (o que o quiz pergunta nos passos 1 a 3,
// com o tratamento do ecrã seguinte) e os extras do ecrã "Aproveite a mesma
// visita", que são sempre de outro tipo.

type Main =
  | { service: 'sofa'; items: SofaItem[]; sofaAntiAcaros?: boolean; tier?: 'essencial' | 'premium' }
  | { service: 'mattress'; items: MattressItem[] }
  | { service: 'chairs'; qty: number; treatment?: 'anti' | 'essencial' | 'premium' };
interface Basket { name: string; main: Main; extras?: { mattress?: Record<string, number>; sofa?: Record<string, number>; chairs?: number } }

function quizTotal({ main, extras = {} }: Basket): number {
  const form: QuizFormData = { ...initialFormData, service: main.service, serviceType: 'cleaning' };
  let sofas: SofaItem[] = [];
  let mattresses: MattressItem[] = [];
  if (main.service === 'sofa') { sofas = main.items; form.sofaAntiAcaros = Boolean(main.sofaAntiAcaros); form.waterproofingTier = main.tier ?? 'essencial'; }
  if (main.service === 'mattress') mattresses = main.items;
  if (main.service === 'chairs') {
    form.chairQuantity = String(main.qty);
    if (main.treatment === 'anti') form.chairAntiAcaros = true;
    if (main.treatment === 'essencial' || main.treatment === 'premium') Object.assign(form, { chairWaterproofing: true, chairWaterproofQty: main.qty, waterproofingTier: main.treatment });
  }
  const primary = renderHook(() => useQuizPricing(form, sofas, mattresses, [], [])).result.current.calculateServicePrice;
  const priced = priceComboExtras({ primaryService: main.service, primaryTablePrice: primary, mattressQty: extras.mattress ?? {}, sofaQty: extras.sofa ?? {}, chairsQty: extras.chairs ?? 0, rugCount: 0 });
  const extrasTotal = Object.values(priced.mattress).reduce((sum, line) => sum + line.amount, 0)
    + Object.values(priced.sofa).reduce((sum, line) => sum + (line.amount ?? 0), 0)
    + (priced.chairs.amount ?? 0);
  return primary + extrasTotal;
}

function configuratorItems({ main, extras = {} }: Basket): CustomPackItem[] {
  const items: CustomPackItem[] = [];
  const extraOf = (packEnabled: boolean, kind: 'sofa' | 'mattress'): PackExtra => {
    if (!packEnabled) return 'none';
    if (kind === 'mattress') return 'anti-acaros';
    return main.service === 'sofa' && main.sofaAntiAcaros ? 'anti-acaros' : main.service === 'sofa' && main.tier === 'premium' ? 'premium' : 'essencial';
  };
  if (main.service === 'sofa' || main.service === 'mattress') {
    for (const item of main.items) {
      const treated = item.packEnabled ? (item.packQty ?? item.qty) : 0;
      if (treated > 0) items.push({ ...makePackItem(main.service, `${item.sizeId}-t`), size: item.sizeId, qty: treated, extra: extraOf(true, main.service) });
      if (item.qty - treated > 0) items.push({ ...makePackItem(main.service, item.sizeId), size: item.sizeId, qty: item.qty - treated });
    }
  }
  if (main.service === 'chairs') items.push({ ...makePackItem('chairs', 'c'), qty: main.qty, extra: main.treatment === 'anti' ? 'anti-acaros' : main.treatment ?? 'none' });
  for (const [size, qty] of Object.entries(extras.mattress ?? {})) items.push({ ...makePackItem('mattress', `m-${size}`), size, qty });
  for (const [size, qty] of Object.entries(extras.sofa ?? {})) items.push({ ...makePackItem('sofa', `s-${size}`), size, qty });
  if (extras.chairs) items.push({ ...makePackItem('chairs', 'extra-chairs'), qty: extras.chairs });
  return items;
}

const baskets: Basket[] = [
  { name: 'sofá 3 lugares + sofá 2 lugares', main: { service: 'sofa', items: [{ sizeId: '3-lugares', qty: 1, packEnabled: false }, { sizeId: '2-lugares', qty: 1, packEnabled: false }] } },
  { name: 'dois sofás de 2 lugares', main: { service: 'sofa', items: [{ sizeId: '2-lugares', qty: 2, packEnabled: false }] } },
  { name: 'sofá 3 lugares + colchão casal', main: { service: 'sofa', items: [{ sizeId: '3-lugares', qty: 1, packEnabled: false }] }, extras: { mattress: { casal: 1 } } },
  { name: 'sofá 2 lugares + colchão casal (o bug dos 69€)', main: { service: 'sofa', items: [{ sizeId: '2-lugares', qty: 1, packEnabled: false }] }, extras: { mattress: { casal: 1 } } },
  { name: 'sofá 1 lugar + colchão solteiro', main: { service: 'sofa', items: [{ sizeId: '1-lugar', qty: 1, packEnabled: false }] }, extras: { mattress: { solteiro: 1 } } },
  { name: 'sofá 1 lugar + 4 cadeiras', main: { service: 'sofa', items: [{ sizeId: '1-lugar', qty: 1, packEnabled: false }] }, extras: { chairs: 4 } },
  { name: 'colchão casal + sofá 3 lugares + sofá 1 lugar', main: { service: 'mattress', items: [{ sizeId: 'casal', qty: 1, packEnabled: false }] }, extras: { sofa: { '3-lugares': 1, '1-lugar': 1 } } },
  { name: 'dois colchões de tamanhos diferentes + sofá', main: { service: 'mattress', items: [{ sizeId: 'casal', qty: 1, packEnabled: false }, { sizeId: 'king', qty: 1, packEnabled: false }] }, extras: { sofa: { '2-lugares': 1 } } },
  { name: 'colchão com anti-ácaros + cadeiras', main: { service: 'mattress', items: [{ sizeId: 'king', qty: 1, packEnabled: true }] }, extras: { chairs: 5 } },
  { name: 'sofá com anti-ácaros + colchão', main: { service: 'sofa', items: [{ sizeId: '3-lugares', qty: 1, packEnabled: true }], sofaAntiAcaros: true }, extras: { mattress: { casal: 2 } } },
  { name: 'sofá com impermeabilização Premium + colchões', main: { service: 'sofa', items: [{ sizeId: '2-lugares', qty: 2, packEnabled: true, packQty: 1 }], tier: 'premium' }, extras: { mattress: { solteiro: 1, king: 1 } } },
  { name: 'cadeiras com anti-ácaros + colchão', main: { service: 'chairs', qty: 6, treatment: 'anti' }, extras: { mattress: { casal: 1 } } },
  { name: 'cadeiras abaixo do mínimo + colchão', main: { service: 'chairs', qty: 1 }, extras: { mattress: { solteiro: 1 } } },
  { name: 'cadeiras com impermeabilização + sofá', main: { service: 'chairs', qty: 4, treatment: 'essencial' }, extras: { sofa: { '3-lugares': 1 } } },
];

describe('o quiz e o configurador cobram o mesmo pelo mesmo cesto', () => {
  it.each(baskets.map(basket => [basket.name, basket] as const))('%s', (_, basket) => {
    expect(calculateCustomPack(configuratorItems(basket), 'Braga').subtotal).toBe(quizTotal(basket));
  });

  it('fixes the known totals', () => {
    expect(quizTotal(baskets[0])).toBe(148);
    expect(quizTotal(baskets[2])).toBe(134);
    expect(quizTotal(baskets[3])).toBe(124);
  });
});

// O ecrã de extras usa priceComboExtras; aqui confirma-se que o que o ecrã
// grava no pedido é mesmo isso, para um cesto real.
it('the extras screen saves the same amounts the configurator charges', () => {
  function Harness() {
    const [items, setItems] = useState<UpsellItemConfig[]>([]);
    return <>
      <output data-testid="items">{JSON.stringify(items)}</output>
      <QuizComboUpsellScreen primaryService="sofa" primaryTablePrice={69} upsellItems={items} setUpsellItems={setItems} onContinue={() => {}} onBack={() => {}} />
    </>;
  }
  render(<Harness />);
  fireEvent.click(screen.getByRole('button', { name: /^Colchão/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
  const saved: UpsellItemConfig[] = JSON.parse(screen.getByTestId('items').textContent!);
  const configurator = calculateCustomPack([{ ...makePackItem('sofa', 's'), size: '2-lugares' }, { ...makePackItem('mattress', 'm'), size: 'casal' }], 'Braga');
  expect(69 + saved.reduce((sum, item) => sum + item.price, 0)).toBe(configurator.subtotal);
});
