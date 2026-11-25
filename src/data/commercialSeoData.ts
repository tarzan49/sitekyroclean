import { cities, cityPrep } from './serviceCatalog';
import { pickReviewSubset, type PoolReview } from './reviewsPool';
// Páginas comerciais (B2B). Dono, 24 Nov: "aumenta para o país todo [...] já trabalhamos com hotéis,
// restaurantes, cafés, com tudo [...] layout como as outras, só que específicas, com mais profissionalismo".
// Duas famílias, no mesmo molde (CommercialPage):
//   /limpeza-comercial-{cidade}  = as 102 cidades onde operamos (`cities`), com os setores ligados;
//   /limpeza-comercial-{setor}   = uma página nacional por setor, com o que limpamos nesse setor e as
//                                  obrigações legais lidas na fonte (nunca inventadas).
//   /limpeza-comercial-{setor}-{cidade} = cada setor em cada cidade (dono, 25 Nov: "cada cidade vai ter a sua secção").
// Nada de descontos de contrato, visitas grátis nem testemunhos que não existam: só factos do negócio.

export type CommercialRegion = 'Porto' | 'Braga' | 'Coimbra' | 'Lisboa' | 'Algarve' | 'Madeira';

export interface CommercialCity {
  name: string;
  slug: string;
  region: CommercialRegion;
}

const AREA_REGION: Record<string, CommercialRegion> = {
  porto: 'Porto', braga: 'Braga', coimbra: 'Coimbra', lisboa: 'Lisboa', algarve: 'Algarve', madeira: 'Madeira',
};

export const COMMERCIAL_CITIES: CommercialCity[] = cities.map(c => ({
  name: c.name,
  slug: c.slug,
  region: AREA_REGION[c.area] ?? 'Lisboa',
}));

export type SegmentKey = 'hoteis' | 'alojamento-local' | 'restaurantes' | 'escritorios';

export interface SectorRule {
  /** O que a norma obriga, em paráfrase fiel. */
  text: string;
  /** Diploma e ponto exatos. */
  source: string;
  url: string;
}

export interface SectorData {
  key: SegmentKey;
  /** Rótulo curto nos cartões. */
  label: string;
  /** Uma linha nos cartões das páginas de cidade. */
  short: string;
  video: 'hotel' | 'alojamento' | 'restaurante' | 'escritorio';
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  /** O que limpamos neste setor (peça + porquê). */
  items: { item: string; detail: string }[];
  rules: SectorRule[];
  /** Frase que liga as regras ao serviço, sem afirmar mais do que a norma diz. */
  rulesNote: string;
  faqs: { question: string; answer: string }[];
  /** Só nas páginas setor × cidade. */
  city?: CommercialCity;
}

// Pontos do contrato: só o que é verdade em qualquer serviço da Kyro (CLAUDE.md §3).
export const CONTRACT_POINTS: string[] = [
  'Fatura com IVA em nome da empresa (preços sem IVA, +23%), paga por transferência',
  'Marcamos antes de abrir, depois de fechar ou ao fim de semana',
  'Fotografias de antes e depois no fim de cada visita',
  'Secagem de 2 a 5 horas; com impermeabilização, 24 horas sem uso',
  'Uma visita, por época ou regular: a frequência é sua',
  'Um só contacto no WhatsApp para pedir ou mudar',
];

const IVA_FAQ = { question: 'Passam fatura com IVA?', answer: 'Sim, sempre em nome da empresa e com o NIF. Os preços são sem IVA e acrescem 23%; o pagamento é feito por transferência para a conta da Kyro.' };
const HOURS_FAQ = { question: 'Trabalham fora do horário de funcionamento?', answer: 'Sim. Marcamos antes de abrir, depois de fechar ou ao fim de semana, conforme o espaço. A secagem leva 2 a 5 horas.' };
const PRICE_FAQ = { question: 'Como é feito o preço?', answer: 'Pelo número e tipo de peças e pela frequência. Envie-nos fotografias e as quantidades no WhatsApp e respondemos com a proposta.' };

export const SECTORS: SectorData[] = [
  {
    key: 'hoteis',
    label: 'Hotéis',
    short: 'Colchões, cabeceiras, cadeirões e sofás de lobby',
    video: 'hotel',
    title: 'Limpeza de Colchões e Estofos para Hotéis | Kyro Clean',
    metaDescription: 'Limpeza e higienização de colchões, cabeceiras, cadeirões e sofás de lobby para hotéis em todo o país. Por lotes de quartos, fatura com IVA, proposta no WhatsApp.',
    h1: 'Limpeza de colchões e estofos para hotéis',
    intro: 'Colchões, cabeceiras, cadeirões e sofás de lobby limpos por extração, quarto a quarto, sem parar a ocupação.',
    items: [
      { item: 'Colchões', detail: 'Extração com água quente e anti-ácaros (Bactran), por lotes de quartos.' },
      { item: 'Cabeceiras estofadas', detail: 'Limpas no próprio quarto, sem desmontar.' },
      { item: 'Cadeirões e sofás-cama', detail: 'Nos quartos e nas suítes, com impermeabilização opcional.' },
      { item: 'Sofás de lobby e bar', detail: 'Fora das horas de maior movimento.' },
      { item: 'Alcatifas e tapetes', detail: 'Corredores, quartos e salas de reunião.' },
    ],
    rules: [
      { text: 'Hotéis, aldeamentos e apartamentos turísticos, em todas as categorias: colchões higienizados pelo menos uma vez em cada três anos, com registo documental.', source: 'Portaria n.º 327/2008, Anexo I n.º 80A (e Anexos II e III n.º 65A), na redação da Portaria n.º 309/2015', url: 'https://diariodarepublica.pt/dr/detalhe/portaria/309-2015-70386134' },
    ],
    rulesNote: 'Cada colchão que limpamos fica com fotografias de antes e depois e a fatura com a data, que pode guardar como registo.',
    faqs: [
      { question: 'Conseguem fazer vários quartos no mesmo dia?', answer: 'Sim. Combinamos lotes de quartos com a governanta, conforme as saídas e entradas, e cada colchão seca em 2 a 5 horas.' },
      HOURS_FAQ,
      IVA_FAQ,
      PRICE_FAQ,
    ],
  },
  {
    key: 'alojamento-local',
    label: 'Alojamento local',
    short: 'Colchões, sofás-cama e sofás entre reservas',
    video: 'alojamento',
    title: 'Limpeza de Colchões e Sofás para Alojamento Local | Kyro Clean',
    metaDescription: 'Limpeza de colchões, sofás e sofás-cama para alojamento local entre reservas, em todo o país. Fatura com IVA, fotografias de antes e depois, proposta no WhatsApp.',
    h1: 'Limpeza de colchões e sofás para alojamento local',
    intro: 'Colchões, sofás e sofás-cama limpos entre reservas, com secagem de 2 a 5 horas e fotografias para o anfitrião.',
    items: [
      { item: 'Colchões', detail: 'Extração e anti-ácaros entre check-out e check-in.' },
      { item: 'Sofás e sofás-cama', detail: 'Manchas de café, vinho ou maquilhagem, entre duas estadias.' },
      { item: 'Impermeabilização', detail: 'O líquido fica à superfície e limpa-se com um pano.' },
      { item: 'Tapetes', detail: 'Lavados no local, com a deslocação incluída no preço.' },
    ],
    rules: [
      { text: 'Os estabelecimentos de alojamento local devem reunir sempre condições de higiene e limpeza, e manter as instalações e equipamentos em boas condições de conservação.', source: 'Decreto-Lei n.º 128/2014, art. 12.º, n.º 1, al. a) e n.º 4', url: 'https://diariodarepublica.pt/dr/legislacao-consolidada/decreto-lei/2014-56406355' },
    ],
    rulesNote: 'A lei não fixa prazos para colchões ou sofás no alojamento local; as fotografias e a fatura de cada visita mostram que a limpeza foi feita.',
    faqs: [
      { question: 'Dá para fazer entre duas reservas?', answer: 'Sim, se houver pelo menos meio dia livre: a secagem leva 2 a 5 horas. Com impermeabilização, o sofá fica 24 horas sem uso.' },
      { question: 'Tenho de estar presente?', answer: 'Não é preciso, desde que a equipa tenha acesso ao alojamento. No fim enviamos as fotografias de antes e depois.' },
      IVA_FAQ,
      PRICE_FAQ,
    ],
  },
  {
    key: 'restaurantes',
    label: 'Restaurantes e cafés',
    short: 'Cadeiras, bancos corridos e sofás de sala',
    video: 'restaurante',
    title: 'Limpeza de Cadeiras e Bancos para Restaurantes e Cafés | Kyro Clean',
    metaDescription: 'Limpeza de cadeiras estofadas, bancos corridos e sofás para restaurantes, cafés e bares em todo o país, antes de abrir ou no dia de folga. Fatura com IVA.',
    h1: 'Limpeza de cadeiras e bancos para restaurantes e cafés',
    intro: 'Cadeiras estofadas, bancos corridos e sofás de sala limpos antes de abrir ou no dia de folga.',
    items: [
      { item: 'Cadeiras estofadas', detail: 'Gordura, vinho e molhos saem com pré-tratamento e extração.' },
      { item: 'Bancos corridos', detail: 'Em tecido, veludo ou pele, no próprio local.' },
      { item: 'Sofás de esplanada coberta e lounge', detail: 'Antes da época ou depois dela.' },
      { item: 'Impermeabilização', detail: 'Os derrames ficam à superfície e limpam-se com um pano.' },
    ],
    rules: [],
    rulesNote: '',
    faqs: [
      { question: 'Podem vir no dia de folga?', answer: 'Sim, é o mais comum. Também vimos de manhã antes de abrir: as cadeiras secam em 2 a 5 horas.' },
      { question: 'Limpam bancos em pele?', answer: 'Sim. Na pele fazemos limpeza e hidratação; a impermeabilização é só para tecido.' },
      IVA_FAQ,
      PRICE_FAQ,
    ],
  },
  {
    key: 'escritorios',
    label: 'Escritórios',
    short: 'Cadeiras de trabalho, sofás de receção e alcatifas',
    video: 'escritorio',
    title: 'Limpeza de Cadeiras, Sofás e Alcatifas para Escritórios | Kyro Clean',
    metaDescription: 'Limpeza de cadeiras de escritório, sofás de receção e alcatifas em todo o país, ao fim do dia ou ao fim de semana. Fatura com IVA, proposta no WhatsApp.',
    h1: 'Limpeza de cadeiras, sofás e alcatifas para escritórios',
    intro: 'Cadeiras de trabalho, sofás de receção e alcatifas limpos ao fim do dia ou ao fim de semana.',
    items: [
      { item: 'Cadeiras de trabalho', detail: 'Assento e encosto, onde se acumula o suor e o pó do dia a dia.' },
      { item: 'Sofás e poltronas de receção', detail: 'A primeira coisa que um cliente vê.' },
      { item: 'Alcatifas', detail: 'Extração por área, com proposta à medida.' },
      { item: 'Salas de reunião', detail: 'Cadeiras e alcatifa na mesma visita.' },
    ],
    rules: [],
    rulesNote: '',
    faqs: [
      { question: 'Podem vir ao fim de semana?', answer: 'Sim. Ao fim de semana ou ao fim do dia: na segunda de manhã está tudo seco.' },
      { question: 'Fazem muitas cadeiras de uma vez?', answer: 'Sim. Diga-nos quantas são e fazemos a proposta à medida.' },
      IVA_FAQ,
      PRICE_FAQ,
    ],
  },
];

export function getSector(slug: string): SectorData | null {
  const national = SECTORS.find(s => s.key === slug);
  if (national) return national;
  const base = SECTORS.find(s => slug.startsWith(`${s.key}-`));
  const city = base && COMMERCIAL_CITIES.find(c => c.slug === slug.slice(base.key.length + 1));
  return base && city ? sectorInCity(base, city) : null;
}

/** O setor numa cidade: título, introdução e perguntas próprias, com as localidades vizinhas reais da mesma zona. */
function sectorInCity(base: SectorData, city: CommercialCity): SectorData {
  const where = `${cityPrep(city.name)} ${city.name}`;
  const near = COMMERCIAL_CITIES.filter(c => c.region === city.region && c.slug !== city.slug);
  const i = COMMERCIAL_CITIES.findIndex(c => c.slug === city.slug) % Math.max(1, near.length);
  const around = [...near.slice(i), ...near.slice(0, i)].slice(0, 4).map(c => c.name);
  const what = base.label.toLowerCase();
  return {
    ...base,
    city,
    title: `${base.h1} ${where} | Kyro Clean`,
    metaDescription: `${base.h1} ${where}: ${base.short.charAt(0).toLowerCase()}${base.short.slice(1)}. Fatura com IVA, fora de horas, contacto direto por WhatsApp, telefone ou email.`,
    h1: `${base.h1} ${where}`,
    intro: `${base.intro} Serviço ${where}.`,
    faqs: [
      { question: `Trabalham com ${what} ${where}?`, answer: `Sim, vamos ao seu espaço ${where}.${around.length ? ` Também vamos a ${around.join(', ')}.` : ''} Diga-nos as peças e a frequência e respondemos com a proposta.` },
      ...base.faqs,
    ].slice(0, 5),
  };
}

export interface CommercialPageData {
  city: CommercialCity;
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  coverage: string;
  faqs: { question: string; answer: string }[];
}

export function getCommercialPageData(citySlug: string): CommercialPageData | null {
  const city = COMMERCIAL_CITIES.find(c => c.slug === citySlug);
  if (!city) return null;
  const prep = cityPrep(city.name);
  return {
    city,
    title: `Limpeza Comercial de Estofos ${prep} ${city.name} | Hotéis, Restaurantes e Escritórios | Kyro Clean`,
    metaDescription: `Limpeza de colchões, cadeiras, sofás e alcatifas para hotéis, alojamento local, restaurantes, cafés e escritórios ${prep} ${city.name}. Fatura com IVA, fora de horas, proposta no WhatsApp.`,
    h1: `Limpeza comercial de estofos ${prep} ${city.name}`,
    intro: `Hotéis, alojamento local, restaurantes, cafés e escritórios ${prep} ${city.name}: colchões, cadeiras, sofás e alcatifas limpos fora de horas, com fatura com IVA.`,
    coverage: `Servimos ${prep} ${city.name} e arredores; a deslocação vem na proposta.`,
    faqs: [
      { question: `Trabalham com empresas ${prep} ${city.name}?`, answer: `Sim. Hotéis, alojamento local, restaurantes, cafés e escritórios ${prep} ${city.name} e arredores, com a mesma equipa que faz os serviços da zona.` },
      HOURS_FAQ,
      IVA_FAQ,
      PRICE_FAQ,
    ],
  };
}

export function getAllCommercialRoutes(): { path: string; citySlug: string }[] {
  return [
    ...SECTORS.map(s => ({ path: `/limpeza-comercial-${s.key}`, citySlug: s.key })),
    ...COMMERCIAL_CITIES.map(c => ({ path: `/limpeza-comercial-${c.slug}`, citySlug: c.slug })),
    ...SECTORS.flatMap(s => COMMERCIAL_CITIES.map(c => ({ path: `/limpeza-comercial-${s.key}-${c.slug}`, citySlug: `${s.key}-${c.slug}` }))),
  ];
}

// Peça principal de cada setor (páginas comerciais): dá os exemplos, as avaliações e o passo a passo. Partilhado pelo React (CommercialPage) e pelo prerender.
export const COMMERCIAL_HERO_SERVICE: Record<SegmentKey | 'cidade', 'limpeza-colchoes' | 'limpeza-cadeiras'> = {
  hoteis: 'limpeza-colchoes',
  'alojamento-local': 'limpeza-colchoes',
  restaurantes: 'limpeza-cadeiras',
  escritorios: 'limpeza-cadeiras',
  cidade: 'limpeza-cadeiras',
};

/** Avaliações reais da página, sem a da Lumière (dono, 24 Nov: retirada). */
export function commercialReviews(path: string, service: 'limpeza-colchoes' | 'limpeza-cadeiras'): PoolReview[] {
  return pickReviewSubset(service, `${path}:comercial`, 7).filter(r => r.name !== 'Lumiere Restaurante').slice(0, 6);
}

// Contacto direto (dono, 24 Nov: nas páginas comerciais não há valores, as empresas falam diretamente connosco).
export const COMMERCIAL_CONTACT_TEXT = 'Para saber o preço para a sua empresa, o contacto é feito diretamente connosco.';
export const COMMERCIAL_CONTACT_HINT = 'Envie o tipo de espaço, a localidade e as peças, de preferência com fotografias.';

/** Empresas com quem já trabalhámos, confirmadas pelo dono a 24 Nov. Nunca acrescentar contactos comerciais da folha. */
export const COMMERCIAL_CLIENTS = ['Real Indiana', 'Arcádia', 'Mikado', 'Palácio da Bolsa', 'RC Restaurante', 'Duello', 'Menina Colina', 'Garden Balthazar', 'Lumière', 'Praia da Luz', 'Sabores do Churrasco Premium', 'Al Mare', 'Genki', 'Mövenpick', 'Cais 51', 'Espaço Porto Cruz', 'Maré José Avillez', 'Tucanos', 'Smoke by D Cigars', 'Don Lopo', 'Boîte Porto', 'Belouracar', 'Delícia Positiva'];
