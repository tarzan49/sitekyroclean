export const PRICE_TABLE: Record<string, { item: string; price: string; highlight?: boolean }[]> = {
  'limpeza-sofas': [
    { item: 'Sofá 1 lugar',            price: '49€' },
    { item: 'Sofá 2 lugares',          price: '69€', highlight: true },
    { item: 'Sofá 3 lugares',          price: '79€' },
    { item: 'Chaise longue (add-on)',  price: '+10€' },
    { item: 'Sofá modular / em L',     price: 'Sob orçamento' },
  ],
  'limpeza-colchoes': [
    { item: 'Colchão solteiro',        price: '39€' },
    { item: 'Colchão casal',           price: '49€', highlight: true },
    { item: 'Colchão king / queen',    price: '59€' },
  ],
  'limpeza-tapetes': [
    { item: 'Tapete até 5 m²',         price: '10€/m²' },
    { item: 'Tapete 5 – 15 m²',        price: '7€/m²', highlight: true },
    { item: 'Tapete +15 m²',           price: 'Sob orçamento' },
  ],
  'limpeza-cadeiras': [
    { item: '1 cadeira (tampo)',        price: '15€' },
    { item: '1 cadeira (completa)',     price: '20€', highlight: true },
    { item: '6+ cadeiras',             price: '10€/un' },
  ],
  'limpeza-alcatifas': [
    { item: 'Até 50 m²',               price: '3€/m²', highlight: true },
    { item: '+50 m²',                  price: 'Sob orçamento' },
  ],
  'impermeabilizacao': [
    { item: 'Sofá 1 lugar',            price: '49€' },
    { item: 'Sofá 2 lugares',          price: '69€', highlight: true },
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
