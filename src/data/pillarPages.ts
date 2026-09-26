// As seis páginas-pilar (um serviço cada): título, descrição, <h1> e FAQs.
//
// Existe porque estas páginas eram escritas três vezes e cada cópia dizia uma
// coisa: o componente React (h1 e FAQs, o que as pessoas veem), o `routeMeta`
// do `PageHead.tsx` (título e descrição no browser) e o bloco `CORE` do
// `scripts/prerender.ts` (o HTML estático, que é o que os crawlers leem).
// Medido em produção a 2026-09-26: /limpeza-sofas dizia "Limpeza de Sofás ao
// Domicílio" aos motores e "Higienização Profissional de Sofás" às pessoas,
// com quatro FAQs de um lado e três do outro, e a única pergunta em comum
// respondida com durações diferentes ("1 a 3 horas" e "45 minutos e 2 horas").
// Os títulos divergiam em quatro das seis páginas, e a FAQ de preços das
// cadeiras só existia no estático, com escalões que o motor não pratica.
//
// Regra: título, descrição e <h1> são os que as pessoas já viam; as FAQs são a
// união das duas listas, com uma só resposta por pergunta. Os preços saem do
// motor (`enginePrices.ts`), nunca escritos à mão. `pillarPages.test.ts`
// verifica que as três leituras usam isto e mais nada.
//
// Sem imports com alias `@/`, para o `scripts/prerender.ts` o conseguir ler.
import { services } from './serviceCatalog';
import { sofaPrices, mattressPrices, type PriceOption } from '../components/quiz/QuizTypes';
import { TRAVEL_FEE_MIN } from '../constants/commercialPolicy';
import {
  formatEuro,
  SOFA_CLEANING_FROM,
  MATTRESS_CLEANING_FROM,
  SOFA_WATERPROOF_ESSENCIAL_FROM,
  SOFA_WATERPROOF_PREMIUM_FROM,
  CHAIR_WATERPROOF_ESSENCIAL_UNIT,
  CHAIR_WATERPROOF_PREMIUM_UNIT,
  SOFA_CLEAN_AND_PROTECT_FROM,
  MATTRESS_CLEAN_AND_ANTI_MITE_FROM,
  MATTRESS_ANTI_MITE_WITH_CLEANING_FROM,
  SOFA_ANTI_MITE_WITH_CLEANING_FROM,
  SOFA_PROTECT_WITH_CLEANING_FROM,
  CHAIR_ANTI_MITE_UNIT_LABEL,
  CHAIR_PRICE_TITLE,
  chairTierSentence,
  chairCleaningTiers,
} from './enginePrices';

export type PillarSlug = 'limpeza-sofas' | 'limpeza-colchoes' | 'limpeza-tapetes' | 'limpeza-cadeiras' | 'limpeza-alcatifas' | 'impermeabilizacao';

export interface PillarFaq { question: string; answer: string }

export interface PillarPage {
  path: string;
  serviceSlug: PillarSlug;
  /** Componente React desta página, lido pelo teste de paridade. */
  component: string;
  /** Nome do serviço no schema (Service, WebPage). */
  serviceName: string;
  /** Nome curto do catálogo: é o que a migalha do hero mostra. */
  breadcrumbLabel: string;
  title: string;
  description: string;
  h1: string;
  /** Rótulo de preço de partida ("49€", "Sob orçamento"): sem número, sem oferta. */
  priceFrom: string;
  faqs: PillarFaq[];
}

const catalog = (slug: PillarSlug) => {
  const service = services.find(item => item.slug === slug);
  if (!service) throw new Error(`pillarPages: o serviço "${slug}" não existe em serviceCatalog`);
  return service;
};

/** "49€ para 1 lugar, 69€ para 2 lugares e 79€ para 3 lugares; 4+ lugares sob orçamento". */
function sizeList(options: PriceOption[]): string {
  const priced = options.filter(item => typeof item.cleaningPrice === 'number')
    .map(item => `${formatEuro(item.cleaningPrice as number)} para ${item.label.toLowerCase()}`);
  const quoted = options.filter(item => typeof item.cleaningPrice !== 'number').map(item => item.label.toLowerCase());
  const list = priced.length > 1 ? `${priced.slice(0, -1).join(', ')} e ${priced[priced.length - 1]}` : priced.join('');
  return quoted.length ? `${list}; ${quoted.join(', ')} sob orçamento` : list;
}

const TRAVEL = `A deslocação é à parte, a partir de ${TRAVEL_FEE_MIN}€, e o preço é confirmado antes da marcação.`;
const { quoteFrom: CHAIR_QUOTE_FROM } = chairCleaningTiers();

export const PILLAR_PAGES: PillarPage[] = [
  {
    path: '/limpeza-sofas',
    serviceSlug: 'limpeza-sofas',
    component: 'LimpezaSofas',
    serviceName: 'Limpeza de Sofás',
    breadcrumbLabel: catalog('limpeza-sofas').name,
    title: `Limpeza e Lavagem de Sofás ao Domicílio | Desde ${formatEuro(SOFA_CLEANING_FROM)} | Kyro Clean Solutions`,
    description: 'Limpeza e lavagem profissional de sofás ao domicílio. Limpeza de sujidade e resíduos com extração profissional. Tratamentos antiácaros opcionais. Equipas em Braga, Porto, Lisboa e Algarve.',
    h1: 'Higienização Profissional de Sofás',
    priceFrom: catalog('limpeza-sofas').priceFrom,
    faqs: [
      { question: 'Quanto custa a limpeza de sofá?', answer: `Preços de partida da limpeza de sofá: ${sizeList(sofaPrices)}. Na mesma visita, o anti-ácaros acrescenta a partir de ${formatEuro(SOFA_ANTI_MITE_WITH_CLEANING_FROM)} e a impermeabilização Essencial ${formatEuro(SOFA_PROTECT_WITH_CLEANING_FROM)} num sofá de 1 lugar. ${TRAVEL} Peça orçamento gratuito e sem compromisso.` },
      { question: 'Quanto tempo demora a limpeza de um sofá?', answer: 'A duração depende do tamanho e do estado do sofá, mas, em média, varia entre 45 minutos e 2 horas. Trabalhamos com máquinas de extração profissional, por isso o processo é rápido, mas sem nunca comprometer o detalhe em cada zona do estofo.' },
      { question: 'O sofá fica muito molhado? Quanto tempo leva a secar?', answer: 'Não. Usamos extração profunda com forte capacidade de sucção, o que retira a maior parte da água usada na limpeza. Em condições normais de ventilação, o sofá fica seco entre 3 a 6 horas. Em dias mais húmidos pode demorar um pouco mais, mas nunca deixamos o tecido encharcado.' },
      { question: 'A limpeza remove manchas antigas do sofá?', answer: 'Sim. Tratamos manchas de vinho, café, gordura e sangue com pré-tratamento específico. Manchas muito antigas podem não sair completamente, mas apresentamos sempre o melhor resultado possível.' },
      { question: 'A limpeza pode danificar o tecido ou desbotar a cor?', answer: 'Pelo contrário: os produtos que utilizamos são específicos para estofos, com pH equilibrado e adequados a cada tipo de tecido. Fazemos sempre uma avaliação prévia e, se necessário, teste numa zona pouco visível. O objetivo é recuperar a cor e a textura original, sem danificar fibras.' },
      { question: 'Em que zonas fazem limpeza de sofás ao domicílio?', answer: 'Temos equipas em Braga, Porto, Lisboa e Algarve. Aveiro, Coimbra e Alentejo Litoral sob consulta.' },
    ],
  },
  {
    path: '/limpeza-colchoes',
    serviceSlug: 'limpeza-colchoes',
    component: 'LimpezaColchoes',
    serviceName: 'Limpeza de Colchões',
    breadcrumbLabel: catalog('limpeza-colchoes').name,
    title: `Limpeza e Higienização de Colchões | Desde ${formatEuro(MATTRESS_CLEANING_FROM)} | Kyro Clean Solutions`,
    description: 'Higienização e lavagem profunda de colchões ao domicílio. Removemos sujidade e resíduos das fibras. Anti-ácaros e desbacterização opcionais. Equipas em Braga, Porto, Lisboa e Algarve.',
    h1: 'Higienização Profissional de Colchões',
    priceFrom: catalog('limpeza-colchoes').priceFrom,
    faqs: [
      { question: 'Quanto custa a limpeza de colchão?', answer: `Preços de partida da limpeza de colchão: ${sizeList(mattressPrices)}. ${TRAVEL} Peça orçamento gratuito.` },
      { question: 'A limpeza inclui tratamento anti-ácaros?', answer: `Não. A limpeza remove sujidade e resíduos das fibras. O anti-ácaros é um tratamento opcional, escolhido à parte: num colchão de solteiro, a limpeza com anti-ácaros fica em ${formatEuro(MATTRESS_CLEAN_AND_ANTI_MITE_FROM)}, mais ${formatEuro(MATTRESS_ANTI_MITE_WITH_CLEANING_FROM)} do que só a limpeza.` },
      { question: 'Para que serve a limpeza de colchões se uso sempre lençóis?', answer: 'Os lençóis protegem a superfície, mas o suor, a pele descamada e o pó atravessam o tecido e acumulam-se no revestimento do colchão, onde a lavagem da roupa de cama não chega. A limpeza remove essa sujidade e esses resíduos das fibras. O anti-ácaros é um extra opcional, com preço próprio.' },
      { question: 'A limpeza elimina totalmente ácaros e bactérias?', answer: 'A limpeza remove sujidade e resíduos das fibras. Anti-ácaros e desbacterização, que são o mesmo tratamento, são um extra opcional com preço próprio. Não prometemos eliminação total nem melhoria de sintomas.' },
      { question: 'Com que frequência devo limpar o colchão?', answer: 'Para uso doméstico, recomendamos uma limpeza profunda a cada 12 a 18 meses. Em casos de alergias, problemas respiratórios, crianças pequenas ou colchões muito utilizados (AL, hotéis), o ideal é encurtar o intervalo para 6 a 12 meses.' },
      { question: 'Fazem limpeza de colchões ao domicílio?', answer: 'Sim. O técnico desloca-se a sua casa com todo o equipamento. Não precisa de retirar o colchão nem de se deslocar.' },
    ],
  },
  {
    path: '/limpeza-tapetes',
    serviceSlug: 'limpeza-tapetes',
    component: 'LimpezaTapetes',
    serviceName: 'Limpeza de Tapetes',
    breadcrumbLabel: catalog('limpeza-tapetes').name,
    title: 'Limpeza e Lavagem de Tapetes | Orçamento Grátis | Kyro Clean Solutions',
    description: 'Lavagem profissional de tapetes com extração profunda. Removemos sujidade, manchas e alergénios. Método avaliado pela composição do tapete. Sempre sob orçamento.',
    h1: 'Higienização Profissional de Tapetes',
    priceFrom: catalog('limpeza-tapetes').priceFrom,
    faqs: [
      { question: 'Quanto custa a limpeza de tapete?', answer: 'Cada tapete é medido (largura x comprimento) e orçamentado individualmente, sem preço fixo por m². Peça um orçamento gratuito e sem compromisso.' },
      { question: 'Quanto tempo demora a limpeza de tapete?', answer: 'O serviço demora 1 a 2 horas. O tapete fica seco em 3 a 6 horas, dependendo da espessura e do material.' },
      { question: 'Que tipos de tapete limpam?', answer: 'Limpamos todos os tipos: persas, shaggy, sisal, juta, lã, acrílico, polipropileno e fibras naturais. O produto é sempre adaptado ao material.' },
      { question: 'A limpeza profunda remove mesmo cheiros e manchas antigas?', answer: 'Conseguimos reduzir significativamente cheiros a humidade, animais e uso diário, e remover a grande maioria das manchas. Em alguns casos muito antigos ou já oxidados o tecido pode não voltar a 100%, mas explicamos sempre o cenário realista antes de avançar.' },
      { question: 'A carpete precisa de ser retirada de casa para ser limpa?', answer: 'Na maioria dos casos, não. Fazemos a limpeza diretamente no local, com equipamento profissional de extração. Assim evitam-se deslocações, tempo de espera e riscos de danos no transporte.' },
      { question: 'De quanto em quanto tempo devo limpar a carpete/tapete?', answer: 'Para uso doméstico, recomendamos uma limpeza profunda a cada 12 meses. Em casas com crianças, animais ou alergias, o ideal é a cada 6 a 9 meses. Em empresas, hotéis ou restaurantes, a frequência deve ser ajustada ao nível de tráfego (trimestral, semestral ou anual).' },
    ],
  },
  {
    path: '/limpeza-cadeiras',
    serviceSlug: 'limpeza-cadeiras',
    component: 'LimpezaCadeiras',
    serviceName: 'Limpeza de Cadeiras',
    breadcrumbLabel: catalog('limpeza-cadeiras').name,
    title: `Limpeza e Lavagem de Cadeiras Estofadas | ${CHAIR_PRICE_TITLE} | Kyro Clean Solutions`,
    description: 'Limpeza e lavagem profissional de cadeiras estofadas ao domicílio. Ideal para escritórios, restaurantes e residências. Resultados no momento.',
    h1: 'Higienização Profissional de Cadeiras',
    priceFrom: catalog('limpeza-cadeiras').priceFrom,
    faqs: [
      { question: 'Quanto custa a limpeza de cadeiras?', answer: `O preço por cadeira desce com a quantidade. ${chairTierSentence()} O anti-ácaros é opcional, a ${CHAIR_ANTI_MITE_UNIT_LABEL} ${TRAVEL}` },
      { question: 'Limpam cadeiras de escritório?', answer: 'Sim. Limpamos cadeiras de escritório, sala de jantar, poltronas e bancos. O serviço é ao domicílio ou no local de trabalho.' },
      { question: 'Quanto tempo demora a limpeza de cadeiras?', answer: 'Cada cadeira demora 15 a 30 minutos. Um conjunto de 6 cadeiras leva cerca de 2 horas.' },
      { question: 'Quanto tempo as cadeiras ficam fora de uso após a limpeza?', answer: 'Normalmente entre 3 e 6 horas, consoante o tecido e a ventilação do espaço. Quando terminamos o serviço, deixamos sempre orientações simples para acelerar a secagem (circular ar, abrir janelas, evitar sentar até estar seco).' },
      { question: 'A limpeza de cadeiras é recomendada só quando estão muito manchadas?', answer: 'Não. Quanto mais cedo se intervém, melhores são os resultados e maior é a durabilidade do tecido. A limpeza regular evita acumulação de nódoas, cheiros e gordura corporal, mantendo o aspeto "como novo" por muito mais tempo.' },
      { question: 'É seguro limpar cadeiras de tecido mais delicado (veludo, linho, etc.)?', answer: 'Sim. Antes de iniciar, avaliamos sempre o tipo de tecido e escolhemos produtos adequados. Em materiais mais delicados, ajustamos a pressão, a quantidade de água e os movimentos para garantir segurança máxima.' },
      { question: 'Fazem limpeza de cadeiras em quantidade para restaurantes?', answer: `Sim. Para restaurantes, hotéis e escritórios, a partir de ${CHAIR_QUOTE_FROM} cadeiras o orçamento é feito à medida da quantidade e do espaço. Contacte-nos para um orçamento personalizado.` },
    ],
  },
  {
    path: '/limpeza-alcatifas',
    serviceSlug: 'limpeza-alcatifas',
    component: 'LimpezaAlcatifas',
    serviceName: 'Limpeza de Alcatifas',
    breadcrumbLabel: catalog('limpeza-alcatifas').name,
    title: 'Limpeza e Lavagem de Alcatifas | Orçamento Grátis | Kyro Clean Solutions',
    description: 'Limpeza e lavagem profunda de alcatifas com extração profissional. Removemos sujidade acumulada e alergénios. Secagem média de 3 a 6 horas, conforme a ventilação. Equipas em Braga, Porto, Lisboa e Algarve.',
    h1: 'Higienização Profissional de Alcatifas',
    priceFrom: catalog('limpeza-alcatifas').priceFrom,
    faqs: [
      { question: 'Quanto custa a limpeza de alcatifa?', answer: 'A limpeza de alcatifa é sempre sob orçamento. Indique a largura e o comprimento de cada área, a localidade e envie fotografias.' },
      { question: 'Qual a diferença entre tapete e alcatifa?', answer: 'Tapetes são peças soltas; alcatifas são revestimentos fixos que cobrem toda a divisão. Tratamos ambos ao domicílio com equipamento profissional.' },
      { question: 'Limpam alcatifas de escritório?', answer: 'Sim. Temos disponibilidade para escritórios, hotéis, clínicas e outros espaços comerciais, incluindo fora do horário comercial.' },
      { question: 'A alcatifa fica molhada muito tempo?', answer: 'Com o nosso equipamento de extração profissional, a alcatifa fica seca em 3 a 6 horas, dependendo da espessura e da ventilação.' },
      { question: 'A limpeza profunda substitui a aspiração do dia a dia?', answer: 'Não. A aspiração regular é essencial para remover o pó superficial. A nossa limpeza profunda atua onde o aspirador não chega: fibras internas, manchas entranhadas, resíduos de sujidade e gordura acumulada.' },
      { question: 'A alcatifa pode encolher, ondular ou descolar com a limpeza?', answer: 'Usamos equipamentos adequados para alcatifas fixas, com controlo de humidade e extração forte, evitando excesso de água. Em condições normais, a alcatifa não encolhe nem ondula. Se houver alguma fragilidade estrutural prévia, sinalizamos antes.' },
      { question: 'A limpeza ajuda mesmo em casos de alergias e má qualidade do ar?', answer: 'Sim. As alcatifas funcionam como "filtros" que retêm pó, ácaros e partículas. Quando não são limpas, tudo isso volta ao ar a cada passo. A limpeza profunda reduz estes agentes, contribuindo para um ambiente mais saudável, especialmente em casas com crianças, idosos ou pessoas alérgicas.' },
    ],
  },
  {
    path: '/impermeabilizacao',
    serviceSlug: 'impermeabilizacao',
    component: 'Impermeabilizacao',
    serviceName: 'Impermeabilização de Estofos',
    breadcrumbLabel: catalog('impermeabilizacao').name,
    title: 'Impermeabilização de Estofos | Kyro Clean Solutions | Essencial ou Premium',
    description: 'Impermeabilização profissional de sofás e cadeiras. Versão Essencial e versão Premium, com proteção invisível e real até 10 anos.',
    h1: 'Impermeabilização Profissional de Estofos',
    priceFrom: catalog('impermeabilizacao').priceFrom,
    faqs: [
      { question: 'O que é exatamente a impermeabilização e como funciona?', answer: 'A impermeabilização cria uma camada de proteção invisível e respirável à volta das fibras do tecido. Líquidos e sujidade deixam de ser absorvidos com facilidade, formando gotas à superfície que podem ser limpas rapidamente antes de penetrarem no estofo.' },
      { question: 'Qual a diferença entre a Essencial e a Premium?', answer: 'A Essencial é à base de água, aguenta até 2 lavagens e mantém a proteção real por 1 a 2 anos, consoante o uso. A Premium é à base de diluente, mais resistente ao desgaste, aguenta até 5 lavagens e dura até 10 anos. Para casas com crianças, animais ou uso intenso, a Premium compensa a longo prazo.' },
      { question: 'Quanto custa a impermeabilização?', answer: `A versão Essencial começa em ${formatEuro(SOFA_WATERPROOF_ESSENCIAL_FROM)} para sofá de 1 lugar e custa ${formatEuro(CHAIR_WATERPROOF_ESSENCIAL_UNIT)} por cadeira. A versão Premium começa em ${formatEuro(SOFA_WATERPROOF_PREMIUM_FROM)} para sofá de 1 lugar e custa ${formatEuro(CHAIR_WATERPROOF_PREMIUM_UNIT)} por cadeira. Peça orçamento gratuito.` },
      { question: 'Quanto tempo dura a impermeabilização?', answer: 'Depende da versão escolhida. Com a Essencial, a proteção real dura 1 a 2 anos, consoante o uso. Com a Premium, mais resistente ao desgaste, a proteção dura até 10 anos. Para manter o efeito repelente visível no dia a dia, podem ser recomendadas reaplicações localizadas ou manutenções preventivas, sobretudo em zonas de maior uso.' },
      { question: 'Posso fazer impermeabilização sem limpeza prévia?', answer: `Recomendamos sempre limpeza prévia para maior eficácia. No Pack Proteção Total, limpeza e impermeabilização Essencial na mesma visita, um sofá de 1 lugar fica em ${formatEuro(SOFA_CLEAN_AND_PROTECT_FROM)}, em vez de ${formatEuro(SOFA_CLEANING_FROM + SOFA_WATERPROOF_ESSENCIAL_FROM)} pedidos em separado.` },
      { question: 'A impermeabilização é definitiva?', answer: 'O tratamento não cria uma película rígida nem permanente. A proteção mantém-se ativa durante o período correspondente à versão aplicada, mas o seu desempenho pode ser reforçado com manutenção adequada.' },
      { question: 'A impermeabilização precisa de manutenção?', answer: 'Sim. A manutenção preventiva permite preservar o nível máximo de proteção e prolongar a vida útil dos estofos. Recomendamos avaliações periódicas, especialmente em contextos de uso intensivo.' },
      { question: 'A impermeabilização altera a cor, o toque ou o conforto do tecido?', answer: 'Não. O tecido mantém o mesmo aspeto e toque natural em ambas as versões. O tratamento é hidrorrepelente e respirável, não criando película rígida. O que muda é a forma como reage a líquidos: em vez de serem rapidamente absorvidos, formam pequenas gotas à superfície, facilitando a limpeza imediata.' },
    ],
  },
];

export function getPillarPage(path: string): PillarPage {
  const page = PILLAR_PAGES.find(item => item.path === path);
  if (!page) throw new Error(`pillarPages: não existe página-pilar em "${path}"`);
  return page;
}
