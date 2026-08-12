// B2B / commercial SEO pages — restaurantes, hotéis e escritórios que precisam
// de limpeza de estofos em regime de contrato recorrente, não o cliente
// avulso do quiz. CTA e tom diferentes de propósito: orçamento personalizado
// por WhatsApp, não o calculador de preço fixo (o preço de um contrato
// depende do número de peças e da frequência, não faz sentido num quiz).
//
// Cidades: as praças de maior densidade comercial/hoteleira dentro das 3
// regiões onde a Kyro já opera (Porto/Norte, Lisboa/AML, Algarve) — mesmo
// critério já usado em packComboData.ts/marcaSofaData.ts para escolher
// "cidades grandes" sem replicar as ~53 cidades todas.

import { cityPrep } from "./locationSeoData";

export interface CommercialCity {
  name: string;
  slug: string;
  region: "Porto" | "Lisboa" | "Algarve";
}

export const COMMERCIAL_CITIES: CommercialCity[] = [
  // Porto / Norte
  { name: "Porto", slug: "porto", region: "Porto" },
  { name: "Vila Nova de Gaia", slug: "vila-nova-de-gaia", region: "Porto" },
  { name: "Matosinhos", slug: "matosinhos", region: "Porto" },
  { name: "Braga", slug: "braga", region: "Porto" },
  { name: "Guimarães", slug: "guimaraes", region: "Porto" },
  { name: "Maia", slug: "maia", region: "Porto" },
  { name: "Póvoa de Varzim", slug: "povoa-de-varzim", region: "Porto" },
  // Lisboa / Área Metropolitana
  { name: "Lisboa", slug: "lisboa", region: "Lisboa" },
  { name: "Cascais", slug: "cascais", region: "Lisboa" },
  { name: "Sintra", slug: "sintra", region: "Lisboa" },
  { name: "Oeiras", slug: "oeiras", region: "Lisboa" },
  { name: "Almada", slug: "almada", region: "Lisboa" },
  { name: "Setúbal", slug: "setubal", region: "Lisboa" },
  { name: "Sesimbra", slug: "sesimbra", region: "Lisboa" },
  // Algarve
  { name: "Faro", slug: "faro", region: "Algarve" },
  { name: "Albufeira", slug: "albufeira", region: "Algarve" },
  { name: "Portimão", slug: "portimao", region: "Algarve" },
  { name: "Lagos", slug: "lagos", region: "Algarve" },
  { name: "Loulé", slug: "loule", region: "Algarve" },
  { name: "Tavira", slug: "tavira", region: "Algarve" },
];

export type SegmentKey = "restaurantes" | "hoteis" | "escritorios";

export interface SegmentContent {
  key: SegmentKey;
  label: string;
  overline: string;
  painPoints: string[];
  solution: string;
}

const SEGMENTS: Omit<SegmentContent, "painPoints" | "solution">[] = [
  { key: "restaurantes", label: "Restaurantes", overline: "Hotelaria e Restauração" },
  { key: "hoteis", label: "Hotéis e Alojamento Local", overline: "Hotelaria" },
  { key: "escritorios", label: "Escritórios", overline: "Espaços de Trabalho" },
];

function segmentContent(segment: SegmentKey, cityName: string, prep: string): { painPoints: string[]; solution: string } {
  switch (segment) {
    case "restaurantes":
      return {
        painPoints: [
          `Estofos de bancos e cadeiras acumulam manchas de comida, gordura e vinho todos os dias, visíveis a quem entra ${prep} ${cityName}`,
          "Odores de cozinha e de clientes fumadores absorvem-se no tecido e não saem com limpeza normal",
          "Fecho para limpeza profunda durante o horário de funcionamento não é opção",
        ],
        solution: `Limpeza e desodorização profissional de bancos, cadeiras e sofás de espera, fora do horário de serviço (antes da abertura, depois do fecho ou em dia de descanso), com secagem rápida para não atrasar a reabertura.`,
      };
    case "hoteis":
      return {
        painPoints: [
          `Rotatividade alta de hóspedes exige estofos de quartos e áreas comuns sempre apresentáveis, com pouca margem entre check-out e check-in ${prep} ${cityName}`,
          "Manchas, odores e alergénios em colchões e cabeceiras afetam diretamente as avaliações online",
          "Grandes volumes (dezenas de quartos) exigem uma equipa que cumpra prazos apertados",
        ],
        solution: "Higienização de colchões, cabeceiras, cadeirões e sofás de lobby em regime de contrato recorrente, com agendamento por lotes de quartos e relatório fotográfico por peça, para o rececionista confirmar antes de libertar o quarto.",
      };
    case "escritorios":
      return {
        painPoints: [
          `Cadeiras e sofás de receção refletem diretamente a imagem da empresa a clientes e visitas ${prep} ${cityName}`,
          "Uso intensivo em open-space acumula ácaros e alergénios que afetam a qualidade do ar",
          "Coordenar acesso ao escritório fora do horário comercial é normalmente complicado",
        ],
        solution: "Higienização periódica de cadeiras de escritório, sofás de receção e áreas de espera, agendada para fins de semana ou fora de horas, com fatura mensal única para toda a conta.",
      };
  }
}

export interface CommercialPageData {
  city: CommercialCity;
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  segments: SegmentContent[];
  benefits: string[];
  faqs: { question: string; answer: string }[];
}

const BENEFITS: string[] = [
  "Contrato recorrente com desconto face ao preço avulso, faturado mensalmente",
  "Agendamento fora do horário de funcionamento, sem interromper a atividade",
  "Um único ponto de contacto para toda a conta, sem burocracia por visita",
  "Produtos certificados, seguros para espaços com circulação de clientes e público",
  "Relatório fotográfico antes/depois por peça, incluído em todos os contratos",
  "Equipa fixa, familiarizada com o espaço, sem repetir explicações a cada visita",
];

function faqsFor(cityName: string, prep: string): { question: string; answer: string }[] {
  return [
    { question: "Como funciona a faturação de um contrato?", answer: "Emitimos uma fatura mensal única para todas as visitas do período, com o detalhe de peças tratadas. Não precisa de aprovar cada visita individualmente." },
    { question: "Conseguem trabalhar fora do horário de funcionamento?", answer: `Sim, é o modelo mais comum nos nossos contratos ${prep} ${cityName}: antes da abertura, depois do fecho, ou aos fins de semana, consoante o que for melhor para o seu negócio.` },
    { question: "Qual a frequência recomendada?", answer: "Depende do volume de circulação: mensal para escritórios e restaurantes de menor movimento, quinzenal ou semanal para hotéis e espaços de alta rotatividade. Ajustamos o contrato à sua realidade." },
    { question: "Como é feito o acesso ao espaço se não estivermos presentes?", answer: "Coordenamos diretamente com o responsável do espaço (gerente, rececionista, facilities). Muitos dos nossos contratos funcionam com chave ou código de acesso entregue à equipa fixa." },
    { question: "O preço é fixo como no site para clientes particulares?", answer: "Não. O preço de um contrato depende do número e tipo de peças, frequência e volume. Enviamos uma proposta personalizada após uma primeira visita de avaliação, gratuita e sem compromisso." },
  ];
}

export function getCommercialPageData(citySlug: string): CommercialPageData | null {
  const city = COMMERCIAL_CITIES.find(c => c.slug === citySlug);
  if (!city) return null;
  const prep = cityPrep(city.name);

  const segments: SegmentContent[] = SEGMENTS.map(s => ({
    ...s,
    ...segmentContent(s.key, city.name, prep),
  }));

  return {
    city,
    title: `Limpeza Comercial de Estofos ${prep} ${city.name} | Restaurantes, Hotéis e Escritórios | Kyro Clean`,
    metaDescription: `Contratos de limpeza e higienização de estofos para restaurantes, hotéis e escritórios ${prep} ${city.name}. Agendamento fora de horas, faturação mensal, equipa fixa. Orçamento personalizado.`,
    h1: `Limpeza Comercial de Estofos ${prep} ${city.name}`,
    intro: `Contratos de limpeza recorrente para restaurantes, hotéis e escritórios ${prep} ${city.name}. A mesma extração profissional que usamos em milhares de casas particulares, adaptada ao ritmo do seu negócio: fora de horas, com fatura mensal e uma equipa fixa que já conhece o espaço.`,
    segments,
    benefits: BENEFITS,
    faqs: faqsFor(city.name, prep),
  };
}

export function getAllCommercialRoutes(): { path: string; citySlug: string }[] {
  return COMMERCIAL_CITIES.map(c => ({ path: `/limpeza-comercial-${c.slug}`, citySlug: c.slug }));
}
