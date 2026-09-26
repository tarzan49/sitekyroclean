export interface QuizFormData {
  service: string;
  serviceType: 'cleaning' | 'waterproofing' | 'both' | '';
  // Só relevante quando serviceType === 'waterproofing' e o serviço é sofá/cadeiras.
  // "essencial" = à base de água (produto atual, aguenta ~2 lavagens). "premium" =
  // à base de diluente (novo, 2026-08-30, dura até 10 anos/5 lavagens, preço mais alto).
  waterproofingTier: 'essencial' | 'premium';
  sofaSize: string;
  // Tratamento dos sofás quando a limpeza é o serviço principal: as unidades
  // marcadas em SofaItem.packEnabled/packQty levam anti-ácaros em vez de
  // impermeabilização. Um só tratamento por sofá, como no configurador de
  // packs (2026-09-26). Ignorado quando o serviço principal é impermeabilização.
  sofaAntiAcaros: boolean;
  carpetArea: string;
  carpetKind?: 'tapete' | 'alcatifa';
  mattressSize: string;
  chairType: string;
  chairQuantity: string;
  chairWaterproofing: boolean;
  chairWaterproofQty: number;
  // Anti-ácaros das cadeiras: tratamento próprio (5€ por cadeira, ver
  // constants/antiAcarosPricing.ts), mutuamente exclusivo com a
  // impermeabilização acima (decisão feita no ecrã a seguir às quantidades).
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
  sofaAntiAcaros: false,
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
  // Redução por sofá no pack de limpeza e proteção, em ambos os percursos.
  waterproofingUpsellDiscount?: number;
}

// Sofá: preços de tabela.
// cleaningPrice          = limpeza (49 / 69 / 79)
// waterproofingPrice     = impermeabilização Essencial sozinha (59 / 79 / 99)
// waterproofingPremiumPrice = impermeabilização Premium sozinha (89 / 109 / 139)
// bothPrice              = limpeza + Essencial antes da redução (99 / 139 / 169)
// waterproofingUpsellDiscount = redução por sofá no pack limpeza + proteção (10)
// O pack Essencial cobrado é bothPrice - redução: 89 / 129 / 159 (calcPackPricing).
// O Premium soma a diferença Premium - Essencial (30 em todos os tamanhos,
// packPremiumDelta onde é fixado à mão): 119 / 159 / 189.
// originalBothPrice (preço riscado) é a soma separada limpeza + Essencial
// (108 / 148 / 178) e nunca pode ficar abaixo do preço do pack, senão o
// "desconto" mostrado fica ao contrário (bug já visto antes).
export const sofaPrices: PriceOption[] = [
  { waterproofingUpsellDiscount: 10, id: '1-lugar',    label: '1 Lugar',    cleaningPrice: 49, waterproofingPrice: 59, bothPrice: 99,  originalBothPrice: 108, waterproofingPremiumPrice: 89 },
  { waterproofingUpsellDiscount: 10, id: '2-lugares',  label: '2 Lugares',  cleaningPrice: 69, waterproofingPrice: 79, bothPrice: 139, originalBothPrice: 148, waterproofingPremiumPrice: 109, packPremiumDelta: 30 },
  { waterproofingUpsellDiscount: 10, id: '3-lugares',  label: '3 Lugares',  cleaningPrice: 79, waterproofingPrice: 99, bothPrice: 169, originalBothPrice: 178, waterproofingPremiumPrice: 139, packPremiumDelta: 30 },
  { waterproofingUpsellDiscount: 10, id: '4+-lugares', label: '4+ Lugares', cleaningPrice: 'Sob orçamento', waterproofingPrice: 'Sob orçamento', bothPrice: 'Sob orçamento', waterproofingPremiumPrice: 'Sob orçamento' },
];

// Colchão: waterproofingPrice/bothPrice/originalBothPrice são reaproveitados
// para o anti-ácaros (colchões não se impermeabilizam, 2026-08-30).
// cleaningPrice      = limpeza (59 / 69 / 79)
// waterproofingPrice = anti-ácaros sozinho (35 / 40 / 45)
// bothPrice          = limpeza + anti-ácaros (74 / 89 / 104), ou seja um
//                      acréscimo de 15 / 20 / 25 sobre a limpeza
//                      (mattressAntiAcarosPrice em constants/antiAcarosPricing.ts)
// originalBothPrice  = soma sem desconto, preço riscado (94 / 109 / 124)
export const mattressPrices: PriceOption[] = [
  // bothPrice baixado em 10€ em cada tamanho a 2026-09-08, teste explícito do
  // dono para ver se um preço mais atrativo melhora a conversão deste
  // tratamento — reverter se não compensar.
  { id: 'solteiro', label: 'Solteiro',     cleaningPrice: 59, waterproofingPrice: 35, bothPrice: 74,  originalBothPrice: 94 },
  { id: 'casal',    label: 'Casal',        cleaningPrice: 69, waterproofingPrice: 40, bothPrice: 89,  originalBothPrice: 109 },
  { id: 'king',     label: 'King / Queen', cleaningPrice: 79, waterproofingPrice: 45, bothPrice: 104, originalBothPrice: 124 },
];

// Sem zona grátis: mínimo 10€ sempre em todo o site, sobe com a distância ao centro de cada equipa.
// Antigas zonas 0€/5€ subiram para 10€ (mínimo sitewide) — todas as outras zonas mantêm o preço original.
export { locationPrices } from '../../constants/travel';

export interface SofaItem     { sizeId: string; qty: number; packEnabled: boolean; packQty?: number; }
export interface MattressItem { sizeId: string; qty: number; packEnabled: boolean; packQty?: number; }
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
}
