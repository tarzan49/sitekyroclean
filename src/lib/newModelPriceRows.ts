// Os preços que as páginas do modelo novo mostram no widget (WaterproofPackPicker, TreatmentPackPicker,
// CarpetPricePicker, ImperPricePicker), em linhas de tabela para o HTML estático (anti-cloaking:
// o Google lê os mesmos totais do bot que o cliente vê; dono, 24 Nov). Tudo pelo motor: o preço do
// serviço, sem a deslocação (dono, 25 Nov); nunca valores escritos à mão.
import { priceSplit, type EngineItem } from './servicePrice';
import { formatEuro } from '../data/enginePrices';

export interface PriceRow { item: string; price: string }

const SOFA_SIZES = [1, 2, 3, 4, 5, 6];
const CHAIR_QTYS = [1, 4, 6, 8, 12];
const MATTRESSES = [{ id: 'solteiro', label: 'Colchão de solteiro' }, { id: 'casal', label: 'Colchão de casal' }, { id: 'king', label: 'Colchão king / queen' }];
const RUGS = [[1.6, 2.3], [2, 3]] as const;
const CARPETS = [20, 50, 120];

const sofaItem = (seats: number, treatment: string) => seats === 6
  ? { kind: 'sofa', size: '5-lugares', seats: 6, look: 'compacto', treatment }
  : { kind: 'sofa', size: seats === 1 ? '1-lugar' : `${seats}-lugares`, treatment };
const seatsLabel = (n: number) => `Sofá de ${n} ${n === 1 ? 'lugar' : 'lugares'}`;
const chairsLabel = (n: number) => `${n} ${n === 1 ? 'cadeira' : 'cadeiras'}`;
const m = (v: number) => String(v).replace('.', ',');

function total(city: string, items: unknown[]): number | null {
  return priceSplit(city, items as EngineItem[])?.service ?? null;
}
const eur = (v: number | null) => (v === null ? 'pelo WhatsApp' : formatEuro(v));
const packs = (city: string, mk: (t: string) => unknown) =>
  `Blindado ${eur(total(city, [mk('clean+premium')]))}, Protegido ${eur(total(city, [mk('clean+essencial')]))}, Renovado ${eur(total(city, [mk('clean')]))}`;

const cache = new Map<string, PriceRow[]>();

/** As linhas de preço do widget da página, para a cidade dada (o mesmo que o React mostra). */
export function newModelPriceRows(serviceSlug: string, serviceKey: string | undefined, city: string): PriceRow[] {
  const key = `${serviceSlug}|${serviceKey ?? ''}|${city}`;
  const hit = cache.get(key);
  if (hit) return hit;
  let rows: PriceRow[];
  if (serviceSlug === 'impermeabilizacao') {
    rows = serviceKey === 'cadeiras'
      ? CHAIR_QTYS.map(n => ({ item: chairsLabel(n), price: `Premium ${eur(total(city, [{ kind: 'chairs', qty: n, treatment: 'premium' }]))}, Essencial ${eur(total(city, [{ kind: 'chairs', qty: n, treatment: 'essencial' }]))}` }))
      : SOFA_SIZES.map(n => ({ item: seatsLabel(n), price: `Premium ${eur(total(city, [sofaItem(n, 'premium')]))}, Essencial ${eur(total(city, [sofaItem(n, 'essencial')]))}` }));
  } else if (serviceSlug === 'limpeza-alcatifas') {
    rows = CARPETS.map(a => { const w = a === 20 ? 4 : a === 50 ? 5 : 10; const l = a / w; return { item: `Alcatifa de ${a} m²`, price: eur(total(city, [{ kind: 'carpet', width: w, length: l, treatment: 'clean' }])) }; });
  } else if (serviceSlug === 'limpeza-tapetes') {
    rows = RUGS.map(([w, l]) => ({ item: `Tapete de ${m(w)} x ${m(l)} m`, price: `Lavagem ${eur(total(city, [{ kind: 'rug', width: w, length: l, treatment: 'clean', odor: false }]))}, com anti-odor ${eur(total(city, [{ kind: 'rug', width: w, length: l, treatment: 'clean', odor: true }]))}` }));
  } else if (serviceSlug === 'limpeza-colchoes') {
    rows = MATTRESSES.map(x => ({ item: x.label, price: `Com anti-ácaros ${eur(total(city, [{ kind: 'mattress', size: x.id, treatment: 'clean+anti-acaros' }]))}, só a limpeza ${eur(total(city, [{ kind: 'mattress', size: x.id, treatment: 'clean' }]))}` }));
  } else if (serviceSlug === 'limpeza-cadeiras') {
    rows = CHAIR_QTYS.map(n => ({ item: chairsLabel(n), price: packs(city, t => ({ kind: 'chairs', qty: n, treatment: t })) }));
  } else {
    rows = SOFA_SIZES.map(n => ({ item: seatsLabel(n), price: packs(city, t => sofaItem(n, t)) }));
  }
  cache.set(key, rows);
  return rows;
}
