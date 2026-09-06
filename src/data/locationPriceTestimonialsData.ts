// Maps each PRICE_TABLE row (same serviceSlug + index) to a quiz prefill
// config so clicking the row jumps straight to the quiz's Config step (3)
// with that item pre-selected. `null` = row is not directly selectable
// (e.g. add-ons, or items with no exact quiz equivalent).
export type PriceRowQuizConfig = {
  service: 'sofa' | 'mattress' | 'carpet' | 'chairs';
  serviceType: 'cleaning' | 'waterproofing';
  sofaSizeId?: string;
  mattressSizeId?: string;
  carpetArea?: string;
  chairQty?: string;
  chairWaterproofing?: boolean;
  sofaQty?: number;
  mattressQty?: number;
  sofaItems?: { sizeId: string; qty: number; chaiseLongue?: boolean; packEnabled?: boolean }[];
  mattressItems?: { sizeId: string; qty: number; packEnabled?: boolean }[];
  waterproofingTier?: 'essencial' | 'premium';
  initialUpsellItems?: import('@/components/quiz/QuizTypes').UpsellItemConfig[];
};

export const PRICE_TABLE_QUIZ_CONFIG: Record<string, (PriceRowQuizConfig | null)[]> = {
  'limpeza-sofas': [
    { service: 'sofa', serviceType: 'cleaning', sofaSizeId: '1-lugar' },
    { service: 'sofa', serviceType: 'cleaning', sofaSizeId: '2-lugares' },
    { service: 'sofa', serviceType: 'cleaning', sofaSizeId: '3-lugares' },
    null,
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
    null, // chaise longue add-on
    { service: 'chairs', serviceType: 'waterproofing', chairQty: '1' },
  ],
};

export const PRICE_TABLE: Record<string, { item: string; price: string }[]> = {
  'limpeza-sofas': [
    { item: 'Sofá 1 lugar',            price: '49€' },
    { item: 'Sofá 2 lugares',          price: '69€' },
    { item: 'Sofá 3 lugares',          price: '79€' },
    { item: 'Chaise longue (add-on)',  price: '+10€' },
    { item: 'Sofá de 4+ lugares',        price: 'Sob orçamento' },
  ],
  'limpeza-colchoes': [
    { item: 'Colchão solteiro',        price: '59€' },
    { item: 'Colchão casal',           price: '69€' },
    { item: 'Colchão king / queen',    price: '79€' },
  ],
  'limpeza-tapetes': [
    { item: 'Tapetes (m²)',             price: 'Sob orçamento' },
  ],
  'limpeza-cadeiras': [
    { item: 'Cadeiras',                 price: '20€/cad' },
  ],
  'limpeza-alcatifas': [
    { item: 'Alcatifas (m²)',           price: '3€/m²' },
  ],
  'impermeabilizacao': [
    { item: 'Sofá 1 lugar',            price: '59€' },
    { item: 'Sofá 2 lugares',          price: '79€' },
    { item: 'Sofá 3 lugares',          price: '99€' },
    { item: 'Sofá de 4+ lugares',        price: 'Sob orçamento' },
    { item: 'Chaise longue (add-on)',  price: '+25€' },
    { item: 'Cadeiras',               price: '20€/cad' },
  ],
};
