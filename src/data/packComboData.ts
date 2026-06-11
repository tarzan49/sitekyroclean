import { WHATSAPP_BASE } from "../constants/business";

// Pack/Combo SEO pages — targets "pack sofá e colchão porto", "limpeza completa sala porto"
//
// Pricing rules:
//   - Packs 1, 3, 4: 20% off the sum of individually selected component prices
//   - Pack 2 (Sofá+Impermeabilização): fixed VIP pricing per option (matches quiz bothPrice)
//     Individual price shown = what customer would pay on two separate visits
//
// Key constraint: packPrice is always >= 80% of individual services summed.
// This ensures profitability while showing a genuine saving to the customer.

export interface PackOption {
  id: string;
  label: string;
  sublabel?: string;
  price: number;       // individual standalone price for this component
  packPrice?: number;  // fixed pack price (only used for single-selector VIP packs)
}

export interface PackSelector {
  key: string;
  label: string;
  options: PackOption[];
}

export interface PackCombo {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  discountPct: number;        // 0.20 = 20%; ignored when all options have packPrice
  selectors: PackSelector[];
  features: string[];
  testimonial: { text: string; author: string };
  service1: string;
  service2: string;
  service1Slug: string;
  service2Slug: string;
}

// ── Price calculator ─────────────────────────────────────────────────────────

export interface PackPriceResult {
  individualTotal: number;
  packTotal: number;
  savings: number;
  savingsPct: number;
  lines: { label: string; individual: number; pack?: number }[];
}

export function calcPackPrices(
  pack: PackCombo,
  selections: Record<string, string>
): PackPriceResult | null {
  let individualTotal = 0;
  let packTotalOverride = 0;
  let allHavePackPrice = true;
  const lines: PackPriceResult['lines'] = [];

  for (const sel of pack.selectors) {
    const optId = selections[sel.key];
    if (!optId) return null;
    const opt = sel.options.find(o => o.id === optId);
    if (!opt) return null;
    individualTotal += opt.price;
    lines.push({ label: `${sel.label}: ${opt.label}`, individual: opt.price, pack: opt.packPrice });
    if (opt.packPrice !== undefined) {
      packTotalOverride += opt.packPrice;
    } else {
      allHavePackPrice = false;
    }
  }

  const packTotal = allHavePackPrice
    ? packTotalOverride
    : Math.round(individualTotal * (1 - pack.discountPct));

  const savings = individualTotal - packTotal;
  const savingsPct = Math.round((savings / individualTotal) * 100);

  return { individualTotal, packTotal, savings, savingsPct, lines };
}

export function getDefaultSelections(pack: PackCombo): Record<string, string> {
  const result: Record<string, string> = {};
  for (const sel of pack.selectors) {
    // Default to first option
    result[sel.key] = sel.options[0]?.id ?? '';
  }
  return result;
}

export function getFromPrice(pack: PackCombo): number {
  const defaults = getDefaultSelections(pack);
  const prices = calcPackPrices(pack, defaults);
  if (!prices) return 0;
  return prices.packTotal;
}

export function buildWhatsAppUrl(
  pack: PackCombo,
  city: { name: string },
  selections: Record<string, string>,
  prices: PackPriceResult
): string {
  const lines = pack.selectors.map(sel => {
    const opt = sel.options.find(o => o.id === selections[sel.key]);
    return `• ${sel.label}: ${opt?.label ?? '?'} (${opt?.price ?? '?'}€ individual)`;
  });

  const msg = [
    `Olá Kyro Clean! Tenho interesse no *${pack.name}* em ${city.name}.`,
    '',
    'Configuração escolhida:',
    ...lines,
    '',
    `Total individual: ${prices.individualTotal}€`,
    `*Preço Pack: ${prices.packTotal}€*`,
    `Poupança: ${prices.savings}€ (${prices.savingsPct}%)`,
    '',
    'Podem confirmar disponibilidade?',
  ].join('\n');

  return `${WHATSAPP_BASE}?text=${encodeURIComponent(msg)}`;
}

// ── Pack definitions ─────────────────────────────────────────────────────────

export const packs: PackCombo[] = [
  {
    id: 'sofa-colchao',
    name: 'Pack Sofá + Colchão',
    slug: 'pack-sofa-e-colchao',
    tagline: 'O pack mais completo para o teu quarto e sala',
    description: 'Limpeza profissional do sofá e do colchão no mesmo dia. Uma visita, dois resultados, 20% de desconto garantido.',
    discountPct: 0.20,
    selectors: [
      {
        key: 'sofa',
        label: 'Sofá',
        options: [
          { id: '1-lugar',   label: '1 Lugar',   sublabel: 'Sofá pequeno / poltrona', price: 49 },
          { id: '2-lugares', label: '2 Lugares',  sublabel: 'Sofá standard',           price: 69 },
          { id: '3-lugares', label: '3 Lugares',  sublabel: 'Sofá grande / familiar',  price: 79 },
          { id: '3l-chaise', label: '3L + Chaise',sublabel: 'Com chaise longue',        price: 89 },
        ],
      },
      {
        key: 'colchao',
        label: 'Colchão',
        options: [
          { id: 'solteiro', label: 'Solteiro',     sublabel: '90×200 cm',  price: 39 },
          { id: 'casal',    label: 'Casal',         sublabel: '140×200 cm', price: 49 },
          { id: 'king',     label: 'King / Queen',  sublabel: '160+ cm',    price: 59 },
        ],
      },
    ],
    features: [
      'Limpeza a vapor profunda do sofá',
      'Higienização completa do colchão',
      'Remoção de 99% dos ácaros e alergénios',
      'Eliminação de bactérias e odores',
      'Secagem rápida com equipamento profissional',
      'Desodorização biológica incluída',
      'Garantia de satisfação 100%',
      'Uma visita, dois resultados',
    ],
    testimonial: {
      text: 'Fizeram o sofá e o colchão no mesmo dia. Resultado incrível, casa com cheiro a novo!',
      author: 'Ana M., Porto',
    },
    service1: 'Limpeza de Sofá',
    service2: 'Limpeza de Colchão',
    service1Slug: 'limpeza-sofas',
    service2Slug: 'limpeza-colchoes',
  },

  {
    id: 'sofa-impermeabilizacao',
    name: 'Pack Sofá + Impermeabilização',
    slug: 'pack-sofa-impermeabilizacao',
    tagline: 'Limpa e protege: o tratamento mais completo para o teu sofá',
    description: 'Limpeza profunda e impermeabilização na mesma visita. Mais eficaz (impermeabiliza sobre tecido limpo), uma única deslocação e preço VIP.',
    discountPct: 0,
    selectors: [
      {
        key: 'sofa',
        label: 'Sofá',
        // price = se feito em 2 visitas separadas (limpeza + impermeab.)
        // packPrice = preço VIP numa única visita (= quiz bothPrice)
        options: [
          { id: '1-lugar',   label: '1 Lugar',    sublabel: 'Sofá pequeno / poltrona', price: 98,  packPrice: 89  },
          { id: '2-lugares', label: '2 Lugares',  sublabel: 'Sofá standard',           price: 138, packPrice: 129 },
          { id: '3-lugares', label: '3 Lugares',  sublabel: 'Sofá grande / familiar',  price: 168, packPrice: 149 },
          { id: '3l-chaise', label: '3L + Chaise',sublabel: 'Com chaise longue',        price: 188, packPrice: 159 },
        ],
      },
    ],
    features: [
      'Limpeza profissional a vapor (primeiro)',
      'Impermeabilização com produto certificado (depois)',
      'Ordem correta: limpar antes de impermeabilizar',
      'Proteção duradoura até 12 meses',
      'Resistência a líquidos, vinho e sumos',
      'Ideal para famílias com crianças ou pets',
      'Invisível após secagem, não altera a cor',
      'Uma única visita em vez de duas',
    ],
    testimonial: {
      text: 'Depois do pack com impermeabilização, o sofá ficou impecável e já sobreviveu a 2 derrames de sumo das crianças!',
      author: 'Ricardo F., Lisboa',
    },
    service1: 'Limpeza de Sofá',
    service2: 'Impermeabilização',
    service1Slug: 'limpeza-sofas',
    service2Slug: 'impermeabilizacao',
  },

  {
    id: 'sala-completa',
    name: 'Pack Sala Completa',
    slug: 'pack-sala-completa',
    tagline: 'Sofá + Tapete + Cadeiras numa única visita: 20% de desconto',
    description: 'O pack mais popular da Kyro Clean. Sala de estar completamente renovada numa visita: sofá, tapete e cadeiras de jantar limpos ao mesmo tempo.',
    discountPct: 0.20,
    selectors: [
      {
        key: 'sofa',
        label: 'Sofá',
        options: [
          { id: '1-lugar',   label: '1 Lugar',    sublabel: 'Sofá pequeno / poltrona', price: 49 },
          { id: '2-lugares', label: '2 Lugares',  sublabel: 'Sofá standard',           price: 69 },
          { id: '3-lugares', label: '3 Lugares',  sublabel: 'Sofá grande / familiar',  price: 79 },
          { id: '3l-chaise', label: '3L + Chaise',sublabel: 'Com chaise longue',        price: 89 },
        ],
      },
      {
        key: 'tapete',
        label: 'Tapete',
        options: [
          { id: 'pequeno', label: 'Pequeno',  sublabel: 'Até 5 m²',  price: 45 },
          { id: 'medio',   label: 'Médio',    sublabel: '5 – 10 m²', price: 64 },
          { id: 'grande',  label: 'Grande',   sublabel: '10 – 15 m²',price: 84 },
        ],
      },
      {
        key: 'cadeiras',
        label: 'Cadeiras',
        options: [
          { id: '2',  label: '2 Cadeiras',  sublabel: 'Mesa de 2 pessoas', price: 36 },
          { id: '4',  label: '4 Cadeiras',  sublabel: 'Mesa de 4 pessoas', price: 60 },
          { id: '6',  label: '6 Cadeiras',  sublabel: 'Mesa de 6 pessoas', price: 80 },
        ],
      },
    ],
    features: [
      'Limpeza completa do sofá',
      'Higienização do tapete',
      'Limpeza das cadeiras de sala / jantar',
      'Desodorização completa do espaço',
      'Remoção de manchas e alergénios',
      'Resultados visíveis numa única visita',
      '20% de desconto sobre preços individuais',
      'Garantia de satisfação 100%',
    ],
    testimonial: {
      text: 'A minha sala ficou completamente transformada. Sofá, tapete e cadeiras impecáveis. Vale muito a pena o pack!',
      author: 'Sofia L., Braga',
    },
    service1: 'Sofá + Tapete',
    service2: 'Cadeiras de Sala',
    service1Slug: 'limpeza-sofas',
    service2Slug: 'limpeza-tapetes',
  },

  {
    id: 'quarto-completo',
    name: 'Pack Quarto Completo',
    slug: 'pack-quarto-completo',
    tagline: 'Colchão + Tapete: quarto livre de ácaros e alergénios',
    description: 'Higienização completa do quarto: colchão e tapete tratados na mesma visita. Ideal para quem sofre de alergias ou quer melhorar a qualidade do sono.',
    discountPct: 0.20,
    selectors: [
      {
        key: 'colchao',
        label: 'Colchão',
        options: [
          { id: 'solteiro', label: 'Solteiro',     sublabel: '90×200 cm',  price: 39 },
          { id: 'casal',    label: 'Casal',         sublabel: '140×200 cm', price: 49 },
          { id: 'king',     label: 'King / Queen',  sublabel: '160+ cm',    price: 59 },
        ],
      },
      {
        key: 'tapete',
        label: 'Tapete de Quarto',
        options: [
          { id: 'pequeno', label: 'Pequeno',  sublabel: 'Até 5 m²',  price: 45 },
          { id: 'medio',   label: 'Médio',    sublabel: '5 – 10 m²', price: 64 },
        ],
      },
    ],
    features: [
      'Higienização profunda do colchão',
      'Remoção de 99% dos ácaros',
      'Eliminação de bactérias e fungos',
      'Limpeza de tapete de quarto',
      'Desodorização biológica',
      'Quarto fresco e livre de alergénios',
      '20% de desconto sobre preços individuais',
      'Garantia de satisfação 100%',
    ],
    testimonial: {
      text: 'As minhas alergias melhoraram muito depois de limparem o colchão e tapete. Durmo muito melhor!',
      author: 'Marta S., Aveiro',
    },
    service1: 'Limpeza de Colchão',
    service2: 'Tapete de Quarto',
    service1Slug: 'limpeza-colchoes',
    service2Slug: 'limpeza-tapetes',
  },
];

export const packCities = [
  { name: 'Porto',    slug: 'porto'    },
  { name: 'Lisboa',   slug: 'lisboa'   },
  { name: 'Braga',    slug: 'braga'    },
  { name: 'Aveiro',   slug: 'aveiro'   },
  { name: 'Coimbra',  slug: 'coimbra'  },
];

export interface PackComboRoute {
  path: string;
  packId: string;
  citySlug: string;
}

export function getAllPackComboRoutes(): PackComboRoute[] {
  return packs.flatMap(pack =>
    packCities.map(city => ({
      path: `/${pack.slug}-${city.slug}`,
      packId: pack.id,
      citySlug: city.slug,
    }))
  );
}

export function getPackByCityAndId(packId: string, citySlug: string) {
  const pack = packs.find(p => p.id === packId);
  const city = packCities.find(c => c.slug === citySlug);
  if (!pack || !city) return null;
  return { pack, city };
}
