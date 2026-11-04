// Marca × Cidade SEO pages: "limpeza colchão Molaflex porto", "higienização colchão Pikolin lisboa"
// Mesmo padrão de marcaSofaData.ts, mesma lista de cidades (marcaCities)

import { MARCA_CITIES } from "./marcaCities";

export interface MarcaColchao {
  id: string;
  name: string;
  slug: string;
  material: string;
  materialDescription: string;
  cleaningProcess: string;
  doNots: string[];
  doThis: string[];
  serviceSlug: string;
  faqs: { question: string; answer: string }[];
}

export const marcasColchao: MarcaColchao[] = [
  {
    id: "ikea",
    name: "IKEA",
    slug: "ikea",
    material: "Tecido quilted removível com núcleo em espuma ou molas ensacadas",
    materialDescription: "Os colchões IKEA (como o MORGEDAL ou o HÖVÅG) combinam um tecido quilted na parte visível com um núcleo em espuma viscoelástica ou molas ensacadas. A camada exterior acumula suor, células mortas e ácaros que a aspiração doméstica não consegue remover em profundidade.",
    cleaningProcess: "Extração com água, com humidade controlada para não saturar o núcleo de espuma. Aspiração profunda dos dois lados, seguida de extração de sujidade e resíduos. Anti-ácaros e desbacterização são extras opcionais.",
    doNots: [
      "Não ensopar o colchão em água: a espuma interior demora dias a secar e pode criar bolor",
      "Não expor o colchão ao sol direto para secar: deforma a espuma viscoelástica",
    ],
    doThis: [
      "Tratamos os dois lados do colchão com extração profissional, removendo ácaros e sujidade que a aspiração doméstica não alcança",
      "Controlamos a humidade da extração em colchões de espuma IKEA, para não saturar o núcleo",
    ],
    serviceSlug: "limpeza-colchoes",
    faqs: [
      { question: "O colchão IKEA de espuma pode ser limpo por extração?", answer: "Sim. Fazemos extração com água, com a humidade controlada para não saturar a espuma viscoelástica, e confirmamos antes as indicações do modelo." },
      { question: "Quanto tempo demora a secar um colchão IKEA depois da limpeza?", answer: "Em média, entre 2 a 5 horas, dependendo da ventilação, do tecido e das condições do espaço. Recomendamos agendar de manhã para o colchão estar pronto ao final do dia." },
      { question: "Conseguem remover manchas antigas de um colchão IKEA?", answer: "Na maioria dos casos sim. Manchas de suor, urina ou líquidos derramados respondem bem ao pré-tratamento enzimático aplicado antes da extração com água." },
    ],
  },
  {
    id: "conforama",
    name: "Conforama",
    slug: "conforama",
    material: "Tecido acolchoado com núcleo misto de espuma e molas",
    materialDescription: "Os colchões vendidos na Conforama cobrem várias gamas, de espuma económica a modelos com molas ensacadas. O tecido exterior acolchoado é o que mais retém pó, ácaros e odores ao longo do uso diário, independentemente do núcleo interior.",
    cleaningProcess: "Aspiração profunda inicial em ambos os lados, seguida de extração com água e produto de limpeza adequado ao tecido. Anti-ácaros e desbacterização são extras opcionais. Tratamento localizado de manchas antes da extração geral.",
    doNots: [
      "Não usar detergentes domésticos genéricos: podem deixar resíduo que atrai mais sujidade",
      "Não guardar o colchão de pé enquanto seca: deforma o núcleo interior",
    ],
    doThis: [
      "Adaptamos a técnica ao tipo de núcleo, espuma ou molas, de cada modelo Conforama, sem margem de erro",
      "Devolvemos o colchão pronto a usar em poucas horas, sem interromper a sua rotina",
    ],
    serviceSlug: "limpeza-colchoes",
    faqs: [
      { question: "Todos os colchões da Conforama respondem bem à limpeza profissional?", answer: "Sim, o processo adapta-se ao tipo de núcleo (espuma ou molas), mas a técnica de extração com água no tecido exterior é semelhante em toda a gama." },
      { question: "A limpeza remove o cheiro a novo ou a armazenamento?", answer: "Sim. A desodorização profissional atua nos odores de fábrica, de humidade de armazenamento ou de uso, nas zonas acessíveis." },
      { question: "Preciso de retirar a proteção de colchão antes da visita?", answer: "Não é obrigatório, mas ajuda. Se preferir, a nossa equipa remove e volta a colocar a proteção sem custo adicional." },
    ],
  },
  {
    id: "molaflex",
    name: "Molaflex",
    slug: "molaflex",
    material: "Tecido jacquard acolchoado, muitas vezes com tratamento anti-ácaros de fábrica",
    materialDescription: "Os colchões Molaflex utilizam tecidos jacquard acolchoados, em vários modelos já com tratamento anti-ácaros de fábrica. Mesmo assim, o uso diário acumula suor, células mortas e alergénios que só uma limpeza profissional profunda consegue remover sem danificar o tratamento original.",
    cleaningProcess: "Extração com água e produto de pH neutro, compatível com tratamentos anti-ácaros de fábrica. Aspiração profunda e desodorização final em ambos os lados.",
    doNots: [
      "Não usar detergentes fortes ou alcalinos: podem remover o tratamento anti-ácaros de fábrica",
      "Não esfregar com força o tecido jacquard: as fibras podem puxar e desfazer o padrão",
    ],
    doThis: [
      "Preservamos o tratamento anti-ácaros de fábrica com produtos de pH neutro certificados",
      "Renovamos a eficácia do tratamento Molaflex original em vez de o substituir por químicos agressivos",
    ],
    serviceSlug: "limpeza-colchoes",
    faqs: [
      { question: "A limpeza remove o tratamento anti-ácaros de fábrica do Molaflex?", answer: "Não. Usamos produtos de pH neutro compatíveis, sem agentes agressivos que degradem o tratamento anti-ácaros original do tecido." },
      { question: "Um colchão Molaflex de molas pode ser limpo por extração?", answer: "Sim. A extração com água atua no tecido exterior e na camada de acolchoamento, com a humidade controlada para não saturar as molas interiores." },
      { question: "Com que frequência devo limpar um colchão Molaflex?", answer: "Recomendamos higienização profissional a cada 6 a 12 meses, mesmo com tratamento anti-ácaros de fábrica, já que este perde eficácia gradualmente com o uso." },
    ],
  },
  {
    id: "pikolin",
    name: "Pikolin",
    slug: "pikolin",
    material: "Tecido respirável com núcleo ortopédico em espuma ou molas",
    materialDescription: "Os colchões Pikolin destacam-se por núcleos ortopédicos em espuma viscoelástica ou molas ensacadas, com tecidos exteriores pensados para respirabilidade. Essa transpiração adicional também significa mais absorção de suor e humidade, que exige limpeza regular para não comprometer o conforto.",
    cleaningProcess: "Extração com água e humidade controlada, ajustada para tecidos respiráveis. Tratamento anti-ácaros opcional e secagem assistida para acelerar a evaporação da humidade absorvida.",
    doNots: [
      "Não ensopar o tecido respirável: a estrutura porosa absorve e retém água mais do que um tecido normal",
      "Não usar amaciador ou perfumes têxteis: podem obstruir os poros do tecido respirável",
    ],
    doThis: [
      "Controlamos a humidade da extração no tecido respirável do Pikolin, sem obstruir os poros",
      "Preservamos o suporte ortopédico do núcleo, prolongando o desempenho e o conforto do colchão",
    ],
    serviceSlug: "limpeza-colchoes",
    faqs: [
      { question: "O tecido respirável do Pikolin precisa de cuidados especiais?", answer: "Sim, controlamos a humidade da extração e evitamos produtos que obstruam os poros do tecido, para preservar a respirabilidade original." },
      { question: "A limpeza ajuda a manter o suporte ortopédico do colchão?", answer: "Sim. Ao remover sujidade acumulada e humidade retida, a limpeza profissional ajuda a manter a firmeza e o desempenho do núcleo ortopédico ao longo do tempo." },
      { question: "Quanto tempo até o colchão Pikolin estar pronto a usar?", answer: "Em média, entre 2 a 5 horas, dependendo da ventilação, do tecido e das condições do espaço." },
    ],
  },
  {
    id: "colmol",
    name: "Colmol",
    slug: "colmol",
    material: "Tecidos naturais e fibras recicladas",
    materialDescription: "Os colchões Colmol apostam em tecidos naturais e fibras recicladas, uma abordagem mais sustentável que exige produtos de limpeza igualmente suaves para não comprometer as propriedades hipoalergénicas do material.",
    cleaningProcess: "Extração com água e produtos biodegradáveis e de pH neutro, adequados a fibras naturais e recicladas. Tratamento anti-ácaros opcional e secagem controlada.",
    doNots: [
      "Não usar produtos químicos agressivos: comprometem a natureza hipoalergénica das fibras naturais",
      "Não usar branqueadores: descolora fibras naturais de forma permanente",
    ],
    doThis: [
      "Usamos produtos biodegradáveis e de pH neutro, alinhados com a filosofia sustentável Colmol",
      "Preservamos as propriedades hipoalergénicas das fibras naturais e recicladas em cada limpeza",
    ],
    serviceSlug: "limpeza-colchoes",
    faqs: [
      { question: "Os produtos usados na limpeza são compatíveis com as fibras naturais do Colmol?", answer: "Sim. Usamos produtos biodegradáveis e de pH neutro, próprios para tecidos naturais e reciclados, sem comprometer as propriedades hipoalergénicas do colchão." },
      { question: "A limpeza profissional mantém as propriedades sustentáveis do colchão?", answer: "Sim. Não usamos químicos agressivos nem branqueadores, preservando a composição natural e reciclada do tecido." },
      { question: "Colchões Colmol precisam de limpeza mais frequente por serem naturais?", answer: "Não necessariamente, mas fibras naturais podem reter humidade de forma diferente de sintéticas, por isso recomendamos a mesma periodicidade de 6 a 12 meses." },
    ],
  },
  {
    id: "mindol",
    name: "Mindol",
    slug: "mindol",
    material: "Espuma e fibras naturais com foco em sustentabilidade",
    materialDescription: "Os colchões Mindol combinam espuma de qualidade com fibras naturais numa proposta sustentável. O tecido exterior, tal como em qualquer colchão, acumula ácaros e suor com o uso diário, mesmo quando fabricado com materiais mais nobres.",
    cleaningProcess: "Extração com água, humidade controlada e produtos suaves, compatível com fibras naturais e espuma de qualidade. Aspiração profunda e desodorização final.",
    doNots: [
      "Não ensopar em água: a espuma interior demora a secar e pode desenvolver bolor",
      "Não usar produtos abrasivos nas fibras naturais exteriores",
    ],
    doThis: [
      "Tratamos as fibras naturais com produtos suaves que preservam a qualidade Mindol",
      "Removemos suor e resíduos com um processo adequado ao material do colchão",
    ],
    serviceSlug: "limpeza-colchoes",
    faqs: [
      { question: "A limpeza profissional é segura para as fibras naturais do Mindol?", answer: "Sim. Usamos produtos suaves e de pH neutro, próprios para fibras naturais, sem comprometer a qualidade ou durabilidade do material." },
      { question: "Um colchão Mindol de espuma pode ser limpo por extração?", answer: "Sim, com a humidade controlada para não saturar a espuma interior, tal como em qualquer colchão com núcleo de espuma, e confirmando antes as indicações do fabricante." },
      { question: "Quanto custa a limpeza de um colchão Mindol?", answer: "O preço depende apenas do tamanho do colchão (solteiro, casal ou king/queen), não da marca. Peça orçamento gratuito e sem compromisso." },
    ],
  },
];

const marcaCities = MARCA_CITIES;

export interface MarcaColchaoRoute {
  path: string;
  marcaSlug: string;
  citySlug: string;
}

export function getAllMarcaColchaoRoutes(): MarcaColchaoRoute[] {
  return marcasColchao.flatMap(marca =>
    marcaCities.map(city => ({
      path: `/limpeza-colchao-${marca.slug}-${city.slug}`,
      marcaSlug: marca.slug,
      citySlug: city.slug,
    }))
  );
}

export function getMarcaColchaoByCityAndSlug(marcaSlug: string, citySlug: string) {
  const marca = marcasColchao.find(m => m.slug === marcaSlug);
  const city = marcaCities.find(c => c.slug === citySlug);
  if (!marca || !city) return null;
  return { marca, city };
}
