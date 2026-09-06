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
  { id: '1-lugar',    label: '1 Lugar',    cleaningPrice: 49, waterproofingPrice: 59, bothPrice: 99,  originalBothPrice: 108, waterproofingPremiumPrice: 89 },
  { id: '2-lugares',  label: '2 Lugares',  cleaningPrice: 69, waterproofingPrice: 79, bothPrice: 145, originalBothPrice: 148, waterproofingPremiumPrice: 109 },
  { id: '3-lugares',  label: '3 Lugares',  cleaningPrice: 79, waterproofingPrice: 99, bothPrice: 159, originalBothPrice: 178, waterproofingPremiumPrice: 139, packPremiumDelta: 20 },
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
  { id: 'solteiro', label: 'Solteiro',     cleaningPrice: 59, waterproofingPrice: 35, bothPrice: 84,  originalBothPrice: 94 },
  { id: 'casal',    label: 'Casal',        cleaningPrice: 69, waterproofingPrice: 40, bothPrice: 99,  originalBothPrice: 109 },
  { id: 'king',     label: 'King / Queen', cleaningPrice: 79, waterproofingPrice: 45, bothPrice: 114, originalBothPrice: 124 },
];

// Sem zona grátis: mínimo 10€ sempre em todo o site, sobe com a distância ao centro de cada equipa.
// Antigas zonas 0€/5€ subiram para 10€ (mínimo sitewide) — todas as outras zonas mantêm o preço original.
export const locationPrices: Record<string, number> = {
  // ═══ Porto/Norte (equipa Porto) ═══
  // Zona 0 — Porto metropolitan core
  'Porto': 10,
  'Matosinhos': 10,
  // Zona 1 — Subúrbios imediatos, ~10-20 min
  'Vila Nova de Gaia': 10,
  'Maia': 10,
  'Gondomar': 10,
  // Zona 2 — Grande Porto, ~20-30 min
  'Valongo': 10,
  'Espinho': 10,
  'Póvoa de Varzim': 10,
  'Vila do Conde': 10,
  'Santo Tirso': 10,
  'Trofa': 10,
  'Paredes': 10,
  // Zona 3 — Interior norte, ~35-45 min
  'Penafiel': 15,
  'Paços de Ferreira': 15,
  'Felgueiras': 15,
  'Lousada': 15,
  // Zona 4 — Mais afastado, ~45-55 min
  'Arouca': 20,
  'Braga': 20,
  'Aveiro': 20,
  // Zona 5 — Minho, ~55-70 min
  'Guimarães': 20,
  // Zona 6 — Braga/Minho, equipa local Braga, preço por distância a Braga, nunca acima de 20€
  'Vila Nova de Famalicão': 10,
  'Barcelos': 10,
  'Viana do Castelo': 20,
  'Póvoa de Lanhoso': 10,
  'Fafe': 15,
  'Esposende': 15,

  // ═══ Lisboa / Área Metropolitana (equipa local) ═══
  // Regra: mínimo 10€, máximo 15€ (nunca 5€ nem 20€ em Lisboa/Algarve).
  // Zona 0 — Lisboa
  'Lisboa': 10,
  // Zona 1 — Vizinhos imediatos, ~10-15 min
  'Amadora': 10,
  'Odivelas': 10,
  'Oeiras': 10,
  // Zona 2 — Grande Lisboa, ~20-30 min
  'Cascais': 10,
  'Sintra': 10,
  'Loures': 10,
  'Almada': 10,
  'Seixal': 10,
  // Zona 3 — Mais afastado, ~30-40 min
  'Vila Franca de Xira': 15,
  'Barreiro': 15,
  'Moita': 15,
  'Mafra': 15,
  // Zona 4 — Extremos da AML, ~40-50 min
  'Setúbal': 15,
  'Montijo': 15,
  'Alcochete': 15,
  'Palmela': 15,
  'Sesimbra': 15,

  // ═══ Algarve (equipa local) ═══
  // Regra: mínimo 10€, máximo 15€ (nunca 5€ nem 20€ em Lisboa/Algarve).
  // Zona 0 — Faro/Loulé
  'Faro': 10,
  'Loulé': 10,
  // Zona 1 — Vizinhos imediatos, ~10-15 min
  'Albufeira': 10,
  'São Brás de Alportel': 10,
  'Olhão': 10,
  // Zona 2 — Algarve central, ~20-30 min
  'Silves': 10,
  'Lagoa': 10,
  'Tavira': 10,
  // Zona 3 — Algarve ocidental, ~30-40 min
  'Portimão': 15,
  'Lagos': 15,
  // Zona 4 — Extremos, ~40-55 min
  'Vila Real de Santo António': 15,
  'Castro Marim': 15,
  'Monchique': 15,
  // Zona 5 — Interior/Costa Vicentina, ~55-70 min
  'Aljezur': 15,
  'Vila do Bispo': 15,
  'Alcoutim': 15,
};

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
  chairQty?: string;
  qty?: number;
  price: number;
  label: string;
  waterproof?: boolean;
  waterproofPrice?: number;
  chaiseLongue?: boolean;
}
