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
  // Set at click time from the row's quantity stepper (sofa/mattress qty, or chairQty override).
  sofaQty?: number;
  mattressQty?: number;
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
    { service: 'carpet', serviceType: 'cleaning', carpetArea: '12' },
    { service: 'carpet', serviceType: 'cleaning', carpetArea: '20' },
  ],
  'limpeza-cadeiras': [
    { service: 'chairs', serviceType: 'cleaning', chairQty: '1' },
    { service: 'chairs', serviceType: 'cleaning', chairQty: '1' },
    { service: 'chairs', serviceType: 'cleaning', chairQty: '6' },
  ],
  'limpeza-alcatifas': [
    { service: 'carpet', serviceType: 'cleaning', carpetArea: '15' },
    { service: 'carpet', serviceType: 'cleaning', carpetArea: '20' },
  ],
  'impermeabilizacao': [
    { service: 'sofa', serviceType: 'waterproofing', sofaSizeId: '1-lugar' },
    { service: 'sofa', serviceType: 'waterproofing', sofaSizeId: '2-lugares' },
    { service: 'sofa', serviceType: 'waterproofing', sofaSizeId: '3-lugares' },
    { service: 'mattress', serviceType: 'waterproofing', mattressSizeId: 'solteiro' },
    { service: 'mattress', serviceType: 'waterproofing', mattressSizeId: 'casal' },
    { service: 'carpet', serviceType: 'waterproofing', carpetArea: '12' },
  ],
};

export const PRICE_TABLE: Record<string, { item: string; price: string }[]> = {
  'limpeza-sofas': [
    { item: 'Sofá 1 lugar',            price: '49€' },
    { item: 'Sofá 2 lugares',          price: '69€' },
    { item: 'Sofá 3 lugares',          price: '79€' },
    { item: 'Chaise longue (add-on)',  price: '+10€' },
    { item: 'Sofá modular / em L',     price: 'Sob orçamento' },
  ],
  'limpeza-colchoes': [
    { item: 'Colchão solteiro',        price: '39€' },
    { item: 'Colchão casal',           price: '49€' },
    { item: 'Colchão king / queen',    price: '59€' },
  ],
  'limpeza-tapetes': [
    { item: 'Tapete até 5 m²',         price: '10€/m²' },
    { item: 'Tapete 5 – 15 m²',        price: '7€/m²' },
    { item: 'Tapete +15 m²',           price: 'Sob orçamento' },
  ],
  'limpeza-cadeiras': [
    { item: '1 cadeira (tampo)',        price: '15€' },
    { item: '1 cadeira (completa)',     price: '20€' },
    { item: '6+ cadeiras',             price: '10€/un' },
  ],
  'limpeza-alcatifas': [
    { item: 'Até 50 m²',               price: '3€/m²' },
    { item: '+50 m²',                  price: 'Sob orçamento' },
  ],
  'impermeabilizacao': [
    { item: 'Sofá 1 lugar',            price: '49€' },
    { item: 'Sofá 2 lugares',          price: '69€' },
    { item: 'Sofá 3 lugares',          price: '89€' },
    { item: 'Colchão solteiro',        price: '45€' },
    { item: 'Colchão casal',           price: '50€' },
    { item: 'Tapetes',                 price: '7€/m²' },
  ],
};

export const SERVICE_TESTIMONIALS: Record<string, { name: string; city: string; text: string }[]> = {
  'limpeza-sofas': [
    { name: "Maria S.", city: "Porto", text: "O meu sofá tinha 8 anos e achei que ia ter de comprar um novo. Resultado incrível, como novo em poucas horas!" },
    { name: "Rui T.", city: "Espinho", text: "Tinham-me dito que a nódoa de vinho não saía. A Kyro provou o contrário! Sofá impecável." },
  ],
  'limpeza-colchoes': [
    { name: "Fernando G.", city: "Rio Tinto", text: "Tinha alergia constante à noite. Depois da limpeza do colchão melhorou imenso. Super recomendo!" },
    { name: "Daniela R.", city: "Famalicão", text: "Limparam os colchões das crianças. Ficaram super higiénicos e sem aquele cheiro a humidade." },
  ],
  'limpeza-tapetes': [
    { name: "Sandra V.", city: "Paredes", text: "O tapete da sala recuperou cores que já nem me lembrava que tinha. Fiquei completamente impressionada!" },
    { name: "Miguel S.", city: "Cascais", text: "Limparam tapetes persas antigos com todo o cuidado. Resultado impecável, como novos." },
  ],
  'limpeza-cadeiras': [
    { name: "Teresa F.", city: "Lisboa", text: "As cadeiras da sala de jantar ficaram como novas. Atendimento excelente do início ao fim." },
    { name: "Helena M.", city: "Ermesinde", text: "As cadeiras do escritório ficaram impecáveis. Equipa pontual e muito profissional." },
  ],
  'limpeza-alcatifas': [
    { name: "Carlos M.", city: "Braga", text: "Serviço de excelência! A alcatifa do escritório ficou impecável. Profissionais muito competentes e pontuais." },
    { name: "António F.", city: "Vila do Conde", text: "Limparam todo o recheio do AL e os hóspedes notaram logo a diferença. Obrigado!" },
  ],
  'impermeabilizacao': [
    { name: "Ricardo A.", city: "Póvoa de Varzim", text: "A impermeabilização foi perfeita. Agora estou muito mais tranquilo com crianças em casa. Recomendo vivamente!" },
    { name: "João P.", city: "Vila Nova de Gaia", text: "Cheiro fresco e sensação incrível. Equipa profissional, rápida e super cuidadosa." },
  ],
};
