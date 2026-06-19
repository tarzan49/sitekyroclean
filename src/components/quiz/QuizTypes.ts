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
  { id: '1-lugar',    label: '1 Lugar',    cleaningPrice: 49, waterproofingPrice: 49, bothPrice: 89,  originalBothPrice: 98  },
  { id: '2-lugares',  label: '2 Lugares',  cleaningPrice: 69, waterproofingPrice: 69, bothPrice: 129, originalBothPrice: 138 },
  { id: '3-lugares',  label: '3 Lugares',  cleaningPrice: 79, waterproofingPrice: 89, bothPrice: 149, originalBothPrice: 168 },
  { id: '4+-lugares', label: '4+ Lugares', cleaningPrice: 'Sob orçamento', waterproofingPrice: 'Sob orçamento', bothPrice: 'Sob orçamento' },
];

// Chaise longue: preço fixo de 20€ (limpeza ou pack)
export const sofaChaisePrice = { cleaning: 10, waterproofing: 20 };

// Mattress pricing
// Limpeza:           39 / 49 / 59
// Impermeabilização: 45 / 50 / 55
// Pack Total (15% desconto sobre soma): 71 / 84 / 97  (poupa 13/15/17€ vs. separado)
// originalBothPrice = soma sem desconto (preço riscado no UI)
export const mattressPrices: PriceOption[] = [
  { id: 'solteiro', label: 'Solteiro',     cleaningPrice: 39, waterproofingPrice: 45, bothPrice: 71,  originalBothPrice: 84  },
  { id: 'casal',    label: 'Casal',        cleaningPrice: 49, waterproofingPrice: 50, bothPrice: 84,  originalBothPrice: 99  },
  { id: 'king',     label: 'King / Queen', cleaningPrice: 59, waterproofingPrice: 55, bothPrice: 97,  originalBothPrice: 114 },
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

export const locationPrices: Record<string, number> = {
  // Zona 0 — Porto metropolitan core (grátis)
  'Porto': 0,
  'Matosinhos': 0,
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
  'Guimarães': 25,
  // Zona Lisboa — deslocação especial
  'Lisboa': 35,
  'Cascais': 35,
  'Oeiras': 35,
  'Sintra': 35,
  'Almada': 35,
  'Setúbal': 40,
};

export const mattressWaterproofPrices: Record<string, number> = {
  'solteiro': 71,
  'casal': 84,
  'king': 97,
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
