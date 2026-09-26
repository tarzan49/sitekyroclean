import { CHAIR_WATERPROOF_ESSENTIAL } from '../constants/chairPricing';
import { sofaPrices, mattressPrices } from '../components/quiz/QuizTypes';
import { calcChairClean } from '../components/quiz/quizHelpers';

// Os preços da tabela saem das mesmas tabelas que o quiz cobra, para a
// tabela de uma página nunca anunciar um número que o orçamento não pratica.
const tablePrice = (value: number | string | undefined) => (typeof value === 'number' ? `${value}€` : 'Sob orçamento');
const sofa = (id: string) => sofaPrices.find(option => option.id === id);
const mattress = (id: string) => mattressPrices.find(option => option.id === id);
// Maps each PRICE_TABLE row (same serviceSlug + index) to a quiz prefill
// config so clicking the row jumps straight to the quiz's Config step (3)
// with that item pre-selected. `null` = row is not directly selectable.
// Every row is something the quiz can price: the chaise longue add-on rows
// (+10€ / +25€) were removed on 2026-09-26 because the quiz never asked for
// nor charged a chaise, so the table advertised a price nobody paid.
export type PriceRowQuizConfig = {
  service: 'sofa' | 'mattress' | 'carpet' | 'chairs';
  serviceType: 'cleaning' | 'waterproofing';
  sofaSizeId?: string;
  mattressSizeId?: string;
  carpetArea?: string;
  carpetItems?: import('@/components/quiz/QuizTypes').CarpetItem[];
  chairQty?: string;
  chairWaterproofing?: boolean;
  sofaQty?: number;
  mattressQty?: number;
  sofaItems?: { sizeId: string; qty: number; packEnabled?: boolean }[];
  mattressItems?: { sizeId: string; qty: number; packEnabled?: boolean }[];
  waterproofingTier?: 'essencial' | 'premium';
  initialUpsellItems?: import('@/components/quiz/QuizTypes').UpsellItemConfig[];
};

export const PRICE_TABLE_QUIZ_CONFIG: Record<string, (PriceRowQuizConfig | null)[]> = {
  'limpeza-sofas': [
    { service: 'sofa', serviceType: 'cleaning', sofaSizeId: '1-lugar' },
    { service: 'sofa', serviceType: 'cleaning', sofaSizeId: '2-lugares' },
    { service: 'sofa', serviceType: 'cleaning', sofaSizeId: '3-lugares' },
    { service: 'sofa', serviceType: 'cleaning', sofaSizeId: '4+-lugares' },
  ],
  'limpeza-colchoes': [
    { service: 'mattress', serviceType: 'cleaning', mattressSizeId: 'solteiro' },
    { service: 'mattress', serviceType: 'cleaning', mattressSizeId: 'casal' },
    { service: 'mattress', serviceType: 'cleaning', mattressSizeId: 'king' },
  ],
  'limpeza-tapetes': [
    { service: 'carpet', serviceType: 'cleaning', carpetArea: '5' },
  ],
  'limpeza-cadeiras': [
    { service: 'chairs', serviceType: 'cleaning', chairQty: '1' },
  ],
  'limpeza-alcatifas': [
    { service: 'carpet', serviceType: 'cleaning', carpetArea: '15' },
  ],
  'impermeabilizacao': [
    { service: 'sofa', serviceType: 'waterproofing', sofaSizeId: '1-lugar' },
    { service: 'sofa', serviceType: 'waterproofing', sofaSizeId: '2-lugares' },
    { service: 'sofa', serviceType: 'waterproofing', sofaSizeId: '3-lugares' },
    { service: 'sofa', serviceType: 'waterproofing', sofaSizeId: '4+-lugares' },
    { service: 'chairs', serviceType: 'waterproofing', chairQty: '1' },
  ],
};

export const PRICE_TABLE: Record<string, { item: string; price: string }[]> = {
  'limpeza-sofas': [
    { item: 'Sofá 1 lugar',            price: tablePrice(sofa('1-lugar')?.cleaningPrice) },
    { item: 'Sofá 2 lugares',          price: tablePrice(sofa('2-lugares')?.cleaningPrice) },
    { item: 'Sofá 3 lugares',          price: tablePrice(sofa('3-lugares')?.cleaningPrice) },
    { item: 'Sofá de 4+ lugares',        price: 'Sob orçamento' },
  ],
  'limpeza-colchoes': [
    { item: 'Colchão solteiro',        price: tablePrice(mattress('solteiro')?.cleaningPrice) },
    { item: 'Colchão casal',           price: tablePrice(mattress('casal')?.cleaningPrice) },
    { item: 'Colchão king / queen',    price: tablePrice(mattress('king')?.cleaningPrice) },
  ],
  'limpeza-tapetes': [
    { item: 'Tapetes (m²)',             price: 'Sob orçamento' },
  ],
  'limpeza-cadeiras': [
    { item: 'Cadeiras',                 price: `${calcChairClean(1)}€/cad` },
  ],
  'limpeza-alcatifas': [
    { item: 'Alcatifas (m²)',           price: 'Sob orçamento' },
  ],
  'impermeabilizacao': [
    { item: 'Sofá 1 lugar',            price: tablePrice(sofa('1-lugar')?.waterproofingPrice) },
    { item: 'Sofá 2 lugares',          price: tablePrice(sofa('2-lugares')?.waterproofingPrice) },
    { item: 'Sofá 3 lugares',          price: tablePrice(sofa('3-lugares')?.waterproofingPrice) },
    { item: 'Sofá de 4+ lugares',        price: 'Sob orçamento' },
    { item: 'Cadeiras',               price: `${CHAIR_WATERPROOF_ESSENTIAL}€/cad` },
  ],
};
