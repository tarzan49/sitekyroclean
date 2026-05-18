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
  { id: '2-lugares',  label: '2 Lugares',  cleaningPrice: 69, waterproofingPrice: 59, bothPrice: 119, originalBothPrice: 128 },
  { id: '3-lugares',  label: '3 Lugares',  cleaningPrice: 79, waterproofingPrice: 69, bothPrice: 129, originalBothPrice: 148 },
  { id: '4+-lugares', label: '4+ Lugares', cleaningPrice: 'Sob orçamento', waterproofingPrice: 'Sob orçamento', bothPrice: 'Sob orçamento' },
];

// Chaise longue: preço fixo de 20€ (limpeza ou pack)
export const sofaChaisePrice = { cleaning: 10, waterproofing: 0 };

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
  'Porto': 0,
  'Matosinhos': 5,
  'Maia': 5,
  'Vila Nova de Gaia': 5,
  'Gondomar': 5,
  'Valongo': 5,
  'Trofa': 5,
  'Santo Tirso': 5,
  'Espinho': 5,
  'Braga': 10,
  'Guimarães': 10,
  'Póvoa de Varzim': 10,
  'Vila do Conde': 10,
  'Paredes': 10,
  'Penafiel': 10,
  'Lousada': 10,
  'Paços de Ferreira': 10,
  'Felgueiras': 10,
  'Arouca': 10,
  'Aveiro': 10,
  'Lisboa': 15,
  'Cascais': 15,
  'Oeiras': 15,
  'Sintra': 15,
  'Almada': 15,
  'Setúbal': 15,
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
