export interface QuizFormData {
  service: string;
  serviceType: 'cleaning' | 'waterproofing' | 'both' | '';
  sofaSize: string;
  sofaHasChaise: boolean;
  carpetArea: string;
  mattressSize: string;
  chairType: string;
  chairQuantity: string;
  chairWaterproofing: boolean;
  chairWaterproofQty: number;
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
  sofaSize: '',
  sofaHasChaise: false,
  carpetArea: '',
  mattressSize: '',
  chairType: '',
  chairQuantity: '',
  chairWaterproofing: false,
  chairWaterproofQty: 0,
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
}

// Sofa pack pricing: limpeza + impermeabilização com desconto
// originalBothPrice = soma separada (preço riscado no UI)
// delta (upsell text) = bothPrice - cleaningPrice
export const sofaPrices: PriceOption[] = [
  { id: '1-lugar',    label: '1 Lugar',    cleaningPrice: 49, waterproofingPrice: 59, bothPrice: 99,  originalBothPrice: 108 },
  { id: '2-lugares',  label: '2 Lugares',  cleaningPrice: 69, waterproofingPrice: 79, bothPrice: 145, originalBothPrice: 148 },
  { id: '3-lugares',  label: '3 Lugares',  cleaningPrice: 79, waterproofingPrice: 99, bothPrice: 169, originalBothPrice: 178 },
  { id: '4+-lugares', label: '4+ Lugares', cleaningPrice: 'Sob orçamento', waterproofingPrice: 'Sob orçamento', bothPrice: 'Sob orçamento' },
];

// Chaise longue: preço fixo (limpeza ou pack)
export const sofaChaisePrice = { cleaning: 10, waterproofing: 25 };

// Mattress pricing
// Limpeza:           59 / 69 / 79
// Impermeabilização: 55 / 60 / 65
// Pack Total: 88 / 101 / 114 (poupa 26/28/30€ vs. separado)
// originalBothPrice = soma sem desconto (preço riscado no UI)
export const mattressPrices: PriceOption[] = [
  { id: 'solteiro', label: 'Solteiro',     cleaningPrice: 59, waterproofingPrice: 55, bothPrice: 88,  originalBothPrice: 114 },
  { id: 'casal',    label: 'Casal',        cleaningPrice: 69, waterproofingPrice: 60, bothPrice: 101, originalBothPrice: 129 },
  { id: 'king',     label: 'King / Queen', cleaningPrice: 79, waterproofingPrice: 65, bothPrice: 114, originalBothPrice: 144 },
];

export const chairPrices = {
  cleaning: {
    single_top: { label: '1 cadeira (tampo)', price: 15 },
    single_full: { label: '1 cadeira completa', price: 20 },
    bulk_top: { label: '6+ cadeiras (tampo)', price: 10, perUnit: true },
    bulk_full: { label: '6+ cadeiras completas', price: 15, perUnit: true },
    other: { label: 'Outro', price: 0 },
  },
  waterproofing: {
    single_top: { label: '1 cadeira (tampo)', price: 15 },
    single_full: { label: '1 cadeira completa', price: 20 },
    bulk_top: { label: '6+ cadeiras (tampo)', price: 10, perUnit: true },
    bulk_full: { label: '6+ cadeiras completas', price: 15, perUnit: true },
    other: { label: 'Outro', price: 0 },
  },
};

// Sem zona grátis: mínimo 5€ sempre, sobe com a distância ao centro de cada equipa.
// Só as antigas zonas 0€ subiram para 5€ — todas as outras zonas mantêm o preço original.
export const locationPrices: Record<string, number> = {
  // ═══ Porto/Norte (equipa Porto) ═══
  // Zona 0 — Porto metropolitan core
  'Porto': 5,
  'Matosinhos': 5,
  // Zona 1 — Subúrbios imediatos, ~10-20 min
  'Vila Nova de Gaia': 5,
  'Maia': 5,
  'Gondomar': 5,
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

  // ═══ Lisboa / Área Metropolitana (equipa local) ═══
  // Zona 0 — Lisboa
  'Lisboa': 5,
  // Zona 1 — Vizinhos imediatos, ~10-15 min
  'Amadora': 5,
  'Odivelas': 5,
  'Oeiras': 5,
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
  'Setúbal': 20,
  'Montijo': 20,
  'Alcochete': 20,
  'Palmela': 20,
  'Sesimbra': 20,

  // ═══ Algarve (equipa local) ═══
  // Zona 0 — Faro/Loulé
  'Faro': 5,
  'Loulé': 5,
  // Zona 1 — Vizinhos imediatos, ~10-15 min
  'Albufeira': 5,
  'São Brás de Alportel': 5,
  'Olhão': 5,
  // Zona 2 — Algarve central, ~20-30 min
  'Silves': 10,
  'Lagoa': 10,
  'Tavira': 10,
  // Zona 3 — Algarve ocidental, ~30-40 min
  'Portimão': 15,
  'Lagos': 15,
  // Zona 4 — Extremos, ~40-55 min
  'Vila Real de Santo António': 20,
  'Castro Marim': 20,
  'Monchique': 20,
  // Zona 5 — Interior/Costa Vicentina, ~55-70 min
  'Aljezur': 20,
  'Vila do Bispo': 20,
  'Alcoutim': 20,
};

export const carpetWaterproofingPrices = [
  { id: 'ate-5m2',   label: 'Até 5 m²',  price: '10€/m²' },
  { id: 'ate-10m2',  label: 'Até 10 m²', price: '9€/m²' },
  { id: 'ate-20m2',  label: 'Até 20 m²', price: '7€/m²' },
  { id: 'mais-20m2', label: '+20 m²',     price: 'Sob orçamento' },
];

export interface SofaItem     { sizeId: string; qty: number; packEnabled: boolean; }
export interface MattressItem { sizeId: string; qty: number; packEnabled: boolean; }

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
