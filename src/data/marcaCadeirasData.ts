// Marca × Cidade SEO pages: "limpeza cadeiras IKEA porto", "higienização cadeiras Herman Miller lisboa"
// Mesmo padrão de marcaSofaData.ts / marcaColchaoData.ts, mesma lista de cidades (marcaCities)

import { MARCA_CITIES } from "./marcaCities";

export interface MarcaCadeiras {
  id: string;
  name: string;
  slug: string;
  material: string;
  materialDescription: string;
  cleaningProcess: string;
  doNots: string[];
  doThis: string[];
  estimatedPriceRange: string;
  minPrice: number;
  maxPrice: number;
  serviceSlug: string;
  faqs: { question: string; answer: string }[];
}

export const marcasCadeiras: MarcaCadeiras[] = [
  {
    id: "ikea",
    name: "IKEA",
    slug: "ikea",
    material: "Tecido, mesh respirável ou couro sintético, escritório e sala de jantar",
    materialDescription: "As cadeiras IKEA (como a POÄNG, KAUSTBY ou a linha de escritório MARKUS) usam tecido, mesh respirável ou couro sintético. Mesmo em cadeiras de uso ocasional, o assento e o encosto acumulam gordura, sujidade e ácaros com o tempo.",
    cleaningProcess: "Extração a vapor calibrada ao tipo de tecido, com pré-tratamento de manchas de uso quotidiano. Aspiração profunda das costuras e zonas de maior contacto.",
    doNots: [
      "Não usar produtos alcalinos em tecido: pode descolorar de forma permanente",
      "Não ensopar cadeiras de escritório com espuma no assento: o núcleo demora a secar",
    ],
    doThis: [
      "Tratamos separadamente cada tipo de acabamento IKEA, tecido, mesh ou couro sintético",
      "Removemos gordura e sujidade das zonas de maior contacto sem danificar as costuras",
    ],
    estimatedPriceRange: "12,50€ - 20€/unidade",
    minPrice: 12.5,
    maxPrice: 20,
    serviceSlug: "limpeza-cadeiras",
    faqs: [
      { question: "Limpam cadeiras IKEA de escritório e de sala de jantar?", answer: "Sim, tratamos os dois tipos. A técnica adapta-se ao material: mesh respirável para cadeiras de escritório, tecido ou couro sintético para sala de jantar." },
      { question: "Quanto tempo demora a limpeza de um conjunto de cadeiras IKEA?", answer: "Entre 15 a 30 minutos por cadeira, dependendo do estado. Para conjuntos de 4 ou mais, o preço por unidade desce." },
      { question: "As cadeiras IKEA de escritório podem ser limpas com o mecanismo montado?", answer: "Sim, não é necessário desmontar. Limpamos o assento e o encosto com a cadeira montada, sem afetar o mecanismo." },
    ],
  },
  {
    id: "conforama",
    name: "Conforama",
    slug: "conforama",
    material: "Tecido ou couro sintético em estrutura de madeira ou metal",
    materialDescription: "As cadeiras de sala de jantar Conforama combinam tecido ou couro sintético com estruturas de madeira ou metal. O assento acumula restos de comida, gordura e manchas de bebidas com o uso diário à mesa.",
    cleaningProcess: "Pré-tratamento de manchas de comida e bebida antes da extração geral, com produto desengordurante específico para têxteis de sala de jantar.",
    doNots: [
      "Não usar detergentes de cozinha genéricos: podem manchar ou descolorar o tecido",
      "Não deixar manchas de comida secarem: ficam mais difíceis de remover com o tempo",
    ],
    doThis: [
      "Removemos manchas de comida, gordura e bebidas com produto específico para têxteis de sala de jantar",
      "Tratamos o conjunto todo na mesma visita, garantindo cor e textura uniformes em todas as cadeiras",
    ],
    estimatedPriceRange: "12,50€ - 20€/unidade",
    minPrice: 12.5,
    maxPrice: 20,
    serviceSlug: "limpeza-cadeiras",
    faqs: [
      { question: "Conseguem remover manchas antigas de vinho ou molho nas cadeiras Conforama?", answer: "Na maioria dos casos sim, com pré-tratamento específico antes da extração geral. Manchas muito antigas podem não sair a 100%, mas o resultado é sempre muito visível." },
      { question: "Limpam conjuntos completos de sala de jantar Conforama?", answer: "Sim, e o preço por unidade desce a partir da 5ª cadeira. Tratamos o conjunto todo na mesma visita." },
      { question: "O couro sintético das cadeiras Conforama precisa de cuidado especial?", answer: "Sim, usamos técnica e produtos específicos que não descascam nem danificam o couro sintético, ao contrário de produtos domésticos genéricos." },
    ],
  },
  {
    id: "leroy-merlin",
    name: "Leroy Merlin",
    slug: "leroy-merlin",
    material: "Tecido, mesh ou couro sintético, escritório e sala de jantar",
    materialDescription: "As cadeiras Leroy Merlin cobrem tanto o escritório (mesh e tecido ergonómico) como a sala de jantar (tecido, couro sintético ou madeira). Cada categoria acumula sujidade de forma diferente, consoante o uso diário.",
    cleaningProcess: "Avaliação do tipo de cadeira, escritório ou sala de jantar, antes da limpeza. Técnica adaptada a mesh respirável ou a tecido tradicional.",
    doNots: [
      "Não usar vapor de alta pressão em mesh: pode esticar ou rasgar a rede respirável",
      "Não usar produtos agressivos em rodízios e mecanismos: pode danificar a mobilidade",
    ],
    doThis: [
      "Adaptamos a técnica ao tipo exato de cadeira Leroy Merlin, escritório ou sala de jantar",
      "Limpamos rodízios e mecanismos com cuidado, sem comprometer a mobilidade da cadeira",
    ],
    estimatedPriceRange: "12,50€ - 20€/unidade",
    minPrice: 12.5,
    maxPrice: 20,
    serviceSlug: "limpeza-cadeiras",
    faqs: [
      { question: "Limpam cadeiras de escritório Leroy Merlin com mesh?", answer: "Sim, com técnica de baixa pressão específica para mesh respirável, que remove sujidade sem esticar ou rasgar a rede." },
      { question: "As rodas e mecanismos da cadeira de escritório ficam afetados pela limpeza?", answer: "Não. Tratamos apenas o estofo, com cuidado redobrado junto de rodízios e mecanismos para não comprometer a mobilidade." },
      { question: "Vale a pena limpar cadeiras Leroy Merlin em vez de substituir?", answer: "Sim, a limpeza profissional custa uma fração do preço de cadeiras novas e devolve o aspeto original em poucos minutos por unidade." },
    ],
  },
  {
    id: "herman-miller",
    name: "Herman Miller",
    slug: "herman-miller",
    material: "Mesh técnico premium em cadeiras ergonómicas de alta gama",
    materialDescription: "As cadeiras Herman Miller, como a Aeron ou a Embody, usam mesh técnico premium concebido para respirabilidade e suporte ergonómico. É um material de alta gama que exige produtos específicos para não comprometer a elasticidade nem o desempenho técnico.",
    cleaningProcess: "Avaliação prévia obrigatória do mesh técnico. Produto de pH neutro e técnica de baixa pressão, preservando a elasticidade e a estrutura ergonómica original.",
    doNots: [
      "Nunca usar produtos abrasivos no mesh técnico: compromete a elasticidade e o desempenho ergonómico",
      "Não usar vapor de alta temperatura: pode deformar a estrutura técnica do tecido",
    ],
    doThis: [
      "Preservamos a elasticidade e o desempenho ergonómico do mesh técnico Herman Miller",
      "Usamos produtos de pH neutro certificados, próprios para materiais técnicos de alta gama",
    ],
    estimatedPriceRange: "12,50€ - 20€/unidade",
    minPrice: 12.5,
    maxPrice: 20,
    serviceSlug: "limpeza-cadeiras",
    faqs: [
      { question: "A limpeza profissional afeta o desempenho ergonómico da Herman Miller Aeron?", answer: "Não. Usamos produtos e técnica específicos para mesh técnico, que preservam a elasticidade e o suporte ergonómico original da cadeira." },
      { question: "O preço é diferente para uma cadeira Herman Miller?", answer: "Não, o preço depende apenas da quantidade de cadeiras, não da marca. Peça orçamento gratuito e sem compromisso." },
      { question: "Com que frequência devo limpar uma cadeira Herman Miller de uso diário?", answer: "Para uso intensivo em escritório, recomendamos limpeza profissional a cada 6 a 12 meses para manter a respirabilidade e o aspeto do mesh técnico." },
    ],
  },
  {
    id: "moviflor",
    name: "Moviflor",
    slug: "moviflor",
    material: "Tecido ou couro (genuíno ou sintético) em cadeiras de sala de jantar",
    materialDescription: "As cadeiras de sala de jantar Moviflor cobrem tecido, couro genuíno e couro sintético, com uma gama que vai do económico ao premium. A avaliação prévia do revestimento é essencial para definir o tratamento correto.",
    cleaningProcess: "Avaliação do tipo de revestimento antes da intervenção. Técnica diferenciada: vapor controlado para tecido, produtos específicos para couro genuíno e técnica suave para couro sintético.",
    doNots: [
      "Não usar o mesmo produto em couro e tecido: são tratamentos completamente diferentes",
      "Não tratar couro genuíno com produtos de couro sintético e vice-versa",
    ],
    doThis: [
      "Fazemos avaliação prévia gratuita do revestimento de cada cadeira Moviflor antes de qualquer intervenção",
      "Tratamos conjuntos mistos, tecido e couro, na mesma visita, com a técnica certa para cada material",
    ],
    estimatedPriceRange: "12,50€ - 20€/unidade",
    minPrice: 12.5,
    maxPrice: 20,
    serviceSlug: "limpeza-cadeiras",
    faqs: [
      { question: "Tratam tanto cadeiras de tecido como de couro do Moviflor?", answer: "Sim, tratamos todos os materiais Moviflor. A avaliação prévia gratuita garante o tratamento adequado para cada revestimento." },
      { question: "Conseguem limpar um conjunto de 6 cadeiras Moviflor na mesma visita?", answer: "Sim, e o preço por unidade desce a partir da 5ª cadeira. O conjunto todo fica pronto na mesma visita." },
      { question: "O serviço inclui transporte das cadeiras Moviflor?", answer: "Não. O serviço é ao domicílio: deslocamo-nos até à tua casa, sem necessidade de mover ou transportar as cadeiras." },
    ],
  },
  {
    id: "el-corte-ingles",
    name: "El Corte Inglés",
    slug: "el-corte-ingles",
    material: "Tecido de alta qualidade e couro premium",
    materialDescription: "As cadeiras El Corte Inglés combinam tecidos de alta qualidade (algodão, linho, misturas) e couro premium. São duráveis e respondem muito bem à limpeza profissional, mantendo o aspeto original por mais tempo.",
    cleaningProcess: "Extração a vapor controlada para tecidos de qualidade, com produto específico que preserva as cores. Hidratação adicional para acabamentos em couro.",
    doNots: [
      "Não usar água muito quente em tecidos de linho: pode encolher a fibra",
      "Não usar branqueadores em tecidos coloridos: descolora de forma permanente",
    ],
    doThis: [
      "Usamos produtos de pH neutro que deixam as cores das cadeiras El Corte Inglés mais vivas e definidas",
      "Hidratamos acabamentos em couro premium, prolongando a vida útil do revestimento",
    ],
    estimatedPriceRange: "12,50€ - 20€/unidade",
    minPrice: 12.5,
    maxPrice: 20,
    serviceSlug: "limpeza-cadeiras",
    faqs: [
      { question: "Conseguem manter as cores originais das cadeiras El Corte Inglés?", answer: "Sim. Usamos produtos de pH neutro que preservam as cores, na maioria dos casos deixando-as mais vivas e definidas após a limpeza." },
      { question: "As cadeiras de couro premium El Corte Inglés precisam de hidratação?", answer: "Sim, recomendamos. Aplicamos condicionador de couro após a limpeza para manter a flexibilidade e o brilho do material." },
      { question: "A garantia da cadeira é afetada pela limpeza profissional?", answer: "Geralmente não. A limpeza profissional por especialistas é aceite pela maioria dos fabricantes. Recomendamos confirmar os termos de garantia específicos." },
    ],
  },
];

export interface MarcaCadeirasRoute {
  path: string;
  marcaSlug: string;
  citySlug: string;
}

const marcaCities = MARCA_CITIES;

export function getAllMarcaCadeirasRoutes(): MarcaCadeirasRoute[] {
  return marcasCadeiras.flatMap(marca =>
    marcaCities.map(city => ({
      path: `/limpeza-cadeiras-${marca.slug}-${city.slug}`,
      marcaSlug: marca.slug,
      citySlug: city.slug,
    }))
  );
}

export function getMarcaCadeirasByCityAndSlug(marcaSlug: string, citySlug: string) {
  const marca = marcasCadeiras.find(m => m.slug === marcaSlug);
  const city = marcaCities.find(c => c.slug === citySlug);
  if (!marca || !city) return null;
  return { marca, city };
}
