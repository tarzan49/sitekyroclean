export interface QuizFormData {
  service: string;
  serviceType: 'cleaning' | 'waterproofing' | 'both' | '';
  // Só relevante quando serviceType === 'waterproofing' e o serviço é sofá/cadeiras.
  // "essencial" = à base de água (produto atual, aguenta ~2 lavagens). "premium" =
  // à base de diluente (novo, 2026-08-30, dura até 10 anos/5 lavagens, preço mais alto).
  waterproofingTier: 'essencial' | 'premium';
  sofaSize: string;
  sofaHasChaise: boolean;
  carpetArea: string;
  carpetKind?: 'tapete' | 'alcatifa';
  mattressSize: string;
  chairType: string;
  chairQuantity: string;
  chairWaterproofing: boolean;
  chairWaterproofQty: number;
  // Anti Ácaros das cadeiras: serviço próprio, mutuamente exclusivo com a
  // impermeabilização addon acima (decisão feita no upsell pós-quantidade).
  chairAntiAcaros: boolean;
  location: string;
  otherLocation: string;
  timing: string;
  contactMethod: string;
  description: string;
  name: string;
  phone: string;
  email: string;
  photos: File[];
  selectedSlot: string;
}

export const initialFormData: QuizFormData = {
  service: '',
  serviceType: '',
  // Default de negócio: Premium é o tier de maior margem e a Kyro quer vendê-lo
  // primeiro. Nunca reverter para 'essencial' aqui sem pedido explícito.
  waterproofingTier: 'premium',
  sofaSize: '',
  sofaHasChaise: false,
  carpetArea: '',
  mattressSize: '',
  chairType: '',
  chairQuantity: '',
  chairWaterproofing: false,
  chairWaterproofQty: 0,
  chairAntiAcaros: false,
  location: '',
  otherLocation: '',
  timing: '',
  contactMethod: '',
  description: '',
  name: '',
  phone: '',
  email: '',
  photos: [],
  selectedSlot: '',
};

export interface PriceOption {
  id: string;
  label: string;
  cleaningPrice: number | string;
  waterproofingPrice: number | string;
  bothPrice: number | string;
  originalBothPrice?: number | string;
  // Impermeabilização Premium (à base de diluente), só existe para sofá por agora
  // (adicionado 2026-08-30). "both" (Pack Proteção Total) continua sempre Essencial,
  // não há combo Premium+limpeza com desconto definido.
  waterproofingPremiumPrice?: number | string;
  // Override do delta Premium dentro do Pack (limpeza+impermeabilização), quando o
  // valor derivado (waterproofingPremiumPrice - waterproofingPrice) não é o desejado
  // só para o combo. Omitido = deriva-se automaticamente como antes.
  packPremiumDelta?: number;
}

// Sofa pack pricing: limpeza + impermeabilização com desconto
// originalBothPrice = soma separada (preço riscado no UI)
// delta (upsell text) = bothPrice - cleaningPrice
export const sofaPrices: PriceOption[] = [
  // Pack (limpeza + impermeabilização) corrigido 2026-09-08 para valores fixos
  // aprovados — Essencial: 1L=99€, 2L=149€, 3L=159€. Premium = Essencial + 30€
  // em todos os tamanhos (regra consistente confirmada pelo dono). bothPrice é
  // o total Essencial; packPremiumDelta é o que falta somar a esse total para
  // chegar ao Premium. originalBothPrice (preço riscado) subiu com o 2L para
  // continuar acima do novo bothPrice — nunca pode ficar abaixo, senão o
  // "desconto" mostrado no UI fica ao contrário (bug já visto antes).
  { id: '1-lugar',    label: '1 Lugar',    cleaningPrice: 49, waterproofingPrice: 59, bothPrice: 99,  originalBothPrice: 108, waterproofingPremiumPrice: 89 },
  { id: '2-lugares',  label: '2 Lugares',  cleaningPrice: 69, waterproofingPrice: 79, bothPrice: 139, originalBothPrice: 148, waterproofingPremiumPrice: 109, packPremiumDelta: 30 },
  { id: '3-lugares',  label: '3 Lugares',  cleaningPrice: 79, waterproofingPrice: 99, bothPrice: 169, originalBothPrice: 178, waterproofingPremiumPrice: 139, packPremiumDelta: 30 },
  { id: '4+-lugares', label: '4+ Lugares', cleaningPrice: 'Sob orçamento', waterproofingPrice: 'Sob orçamento', bothPrice: 'Sob orçamento', waterproofingPremiumPrice: 'Sob orçamento' },
];

// Chaise longue: preço fixo (limpeza ou pack)
export const sofaChaisePrice = { cleaning: 10, waterproofing: 25 };

// Mattress pricing (2026-08-30: waterproofingPrice/bothPrice/originalBothPrice
// reaproveitados para "Anti Ácaros" — mesmo motor de preços da impermeabilização do
// sofá (standalone + pack com desconto), só o rótulo na UI é que muda. Não confundir
// com impermeabilização real: colchões não têm essa opção, só anti-ácaros.
// Anti Ácaros sozinho: 35 / 40 / 45 (varia por tamanho, ao contrário do sofá)
// Limpeza:             59 / 69 / 79
// Pack Total:          84 / 99 / 114 (2026-08-31: king corrigido de 104 para 114 —
// o delta do pack tem de subir com o tamanho: solteiro +25, casal +30, king +35;
// 104 dava só +25, abaixo do casal, o que não fazia sentido)
// originalBothPrice = soma sem desconto (limpeza + anti-ácaros sozinho, preço riscado)
export const mattressPrices: PriceOption[] = [
  // bothPrice (= preço do upsell Anti Ácaros) baixado em 10€ em cada tamanho
  // 2026-09-08, teste explícito do dono para ver se um preço mais atrativo
  // melhora a conversão deste upsell — reverter se não compensar.
  { id: 'solteiro', label: 'Solteiro',     cleaningPrice: 59, waterproofingPrice: 35, bothPrice: 74,  originalBothPrice: 94 },
  { id: 'casal',    label: 'Casal',        cleaningPrice: 69, waterproofingPrice: 40, bothPrice: 89,  originalBothPrice: 109 },
  { id: 'king',     label: 'King / Queen', cleaningPrice: 79, waterproofingPrice: 45, bothPrice: 104, originalBothPrice: 124 },
];

// Sem zona grátis: mínimo 10€ sempre em todo o site, sobe com a distância ao centro de cada equipa.
// Antigas zonas 0€/5€ subiram para 10€ (mínimo sitewide) — todas as outras zonas mantêm o preço original.
export { locationPrices } from '../../constants/travel';

export interface SofaItem     { sizeId: string; qty: number; packEnabled: boolean; }
export interface MattressItem { sizeId: string; qty: number; packEnabled: boolean; }
// Tapetes: sem preço fixo (sempre sob orçamento), por isso o simulador só
// guarda as dimensões medidas, uma linha por tapete (2026-09-06).
export interface CarpetItem   { id: string; largura: string; comprimento: string; }

export interface UpsellItemConfig {
  id: string;
  sofaSize?: string;
  mattressSize?: string;
  carpetArea?: string;
  carpetItems?: CarpetItem[];
  chairQty?: string;
  qty?: number;
  price: number;
  label: string;
  waterproof?: boolean;
  waterproofingTier?: 'essencial' | 'premium';
  waterproofPrice?: number;
  chaiseLongue?: boolean;
}
