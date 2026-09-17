// Estudo com dados próprios da operação.
//
// Porque existe: as 16.000 páginas deste site são combinatórias, dizem o mesmo
// de formas diferentes, e qualquer concorrente as consegue gerar. Os pedidos
// que passaram mesmo por este site são a única coisa que ninguém pode copiar.
//
// Origem dos números: tabela `quiz_events` do Supabase, linhas com
// `action = 'complete'`, agregadas pela consulta em
// supabase/queries/estudo-dados-proprios.sql, corrida a 2026-09-17. A consulta
// devolve só agregados e corta qualquer grupo com menos de 20 registos.
//
// REGRA DESTE FICHEIRO: guarda contagens, nunca percentagens. As percentagens
// que a consulta devolve são calculadas sobre os grupos que sobreviveram ao
// corte, não sobre o total de pedidos, e isso produz afirmações falsas: o
// Porto aparecia a "100,0%" por ser a única cidade acima de 20 pedidos, quando
// são 65 dos 224. Aqui ficam as contagens e a página deriva as percentagens
// sobre o denominador que declara. Um número novo entra como contagem.

/** Uma categoria publicada, com a contagem bruta de pedidos. */
export interface StudyCount {
  key: string;
  label: string;
  requests: number;
}

/** Distribuição de valores de uma categoria. Quartis, nunca média. */
export interface StudyQuartiles extends StudyCount {
  q1: number;
  median: number;
  q3: number;
}

/** Primeiro e último pedido registados. Não é uma janela escolhida. */
export const STUDY_PERIOD = { start: "2026-06-05", end: "2026-09-17" };

/** Data em que a consulta foi corrida e estes números fixados. */
export const STUDY_RUN_ON = "2026-09-17";

/** Pedidos concluídos no período. É o denominador de tudo o que é publicado. */
export const STUDY_TOTAL_REQUESTS = 224;

/**
 * Pedidos com valor estimado. Os restantes tinham pelo menos um artigo "sob
 * orçamento", e nesses casos o quiz não regista valor nenhum em vez de
 * registar zero (ver `totalValue` em QuizForm.tsx).
 */
export const STUDY_REQUESTS_WITH_VALUE = 209;

/** Nenhum grupo com menos de 20 pedidos é publicado. Está na consulta. */
export const STUDY_MIN_GROUP_SIZE = 20;

/** Serviço principal escolhido. `carpet` cobre tapetes e alcatifas. */
export const STUDY_SERVICES: StudyCount[] = [
  { key: "sofa", label: "Sofá", requests: 125 },
  { key: "carpet", label: "Tapetes e alcatifas", requests: 59 },
  { key: "mattress", label: "Colchão", requests: 26 },
];

/**
 * Cidades. Só o Porto chega aos 20 pedidos: os restantes 159 estão espalhados
 * por cidades que individualmente ficam abaixo do corte, e por isso não são
 * publicadas. Uma lista com uma cidade só não é um retrato nacional, e a
 * página diz isso em vez de deixar o leitor concluir o contrário.
 */
export const STUDY_CITIES: StudyCount[] = [
  { key: "porto", label: "Porto", requests: 65 },
];

/**
 * Distribuição por mês. O primeiro e o último mês são parciais, porque o
 * período começa a 5 de junho e acaba a 17 de setembro: não são meses
 * comparáveis com os do meio e a página assinala-os.
 */
export interface StudyMonth extends StudyCount {
  partial: boolean;
}

export const STUDY_MONTHS: StudyMonth[] = [
  { key: "2026-06", label: "junho de 2026", requests: 25, partial: true },
  { key: "2026-07", label: "julho de 2026", requests: 47, partial: false },
  { key: "2026-08", label: "agosto de 2026", requests: 90, partial: false },
  { key: "2026-09", label: "setembro de 2026", requests: 62, partial: true },
];

/** Limpeza contra impermeabilização, quando as duas estão disponíveis. */
export const STUDY_SERVICE_TYPES: StudyCount[] = [
  { key: "cleaning", label: "Limpeza", requests: 198 },
  { key: "waterproofing", label: "Impermeabilização", requests: 23 },
];

/**
 * Valor total do pedido, por serviço principal.
 *
 * O que o valor é: o total estimado do pedido inteiro, não o preço de uma
 * peça. Soma o serviço principal, os artigos adicionais do mesmo pedido e a
 * taxa de deslocação (`totalPrice` em use-quiz-pricing.ts). É por isso que a
 * mediana de um sofá fica acima do preço de partida de 49€.
 *
 * O que o valor não é: faturação. É o que o simulador estimou no momento em
 * que o pedido foi submetido, antes de a peça ser vista.
 */
export const STUDY_VALUES: StudyQuartiles[] = [
  { key: "sofa", label: "Sofá", requests: 121, q1: 74, median: 89, q3: 128 },
  { key: "mattress", label: "Colchão", requests: 26, q1: 69, median: 79, q3: 131.5 },
];

/**
 * Valores retirados de propósito.
 *
 * 52 pedidos de tapete têm valor registado, e não são publicados. Desde
 * 2026-09-06 este site nunca apresenta preço de tapete: o preço depende de
 * medir e ver a peça. Esses 52 valores foram produzidos pelo motor de preço
 * por m² que existia antes dessa data e que já não existe no código. Publicar
 * uma mediana a partir deles seria dar um preço de tapete por uma porta
 * lateral, com números de uma regra que deixou de valer.
 */
export const STUDY_VALUES_WITHHELD = {
  label: "Tapetes e alcatifas",
  requests: 52,
  reason:
    "Desde 6 de setembro de 2026 não apresentamos preço de tapete em lado nenhum do site: depende de medir e ver a peça. Os valores registados antes dessa data vieram de um cálculo por metro quadrado que já não usamos, por isso não os publicamos aqui.",
};

// ─── Derivações ────────────────────────────────────────────────────────────
// Tudo o que segue é calculado. Nenhum destes números é escrito à mão.

/** Soma das contagens de uma lista. */
export function studySum(groups: StudyCount[]): number {
  return groups.reduce((total, group) => total + group.requests, 0);
}

/**
 * Pedidos que existem mas não aparecem numa lista, por estarem em categorias
 * abaixo do corte. Publicar este resto é o que impede as percentagens de
 * parecerem cobrir o total quando não cobrem.
 */
export function studyRemainder(groups: StudyCount[]): number {
  const remainder = STUDY_TOTAL_REQUESTS - studySum(groups);
  if (remainder < 0) {
    throw new Error("studyData: as contagens publicadas excedem o total de pedidos");
  }
  return remainder;
}

/** Percentagem sobre o total de pedidos, sempre o mesmo denominador. */
export function studyShare(requests: number, total = STUDY_TOTAL_REQUESTS): number {
  return (100 * requests) / total;
}

/** `55,8%`. Uma casa decimal: a segunda seria precisão que 224 registos não dão. */
export function formatShare(requests: number, total = STUDY_TOTAL_REQUESTS): string {
  return `${studyShare(requests, total).toFixed(1).replace(".", ",")}%`;
}

/** `89€`, `131,50€`. Sem casas decimais quando o valor é inteiro. */
export function formatEuro(value: number): string {
  return Number.isInteger(value)
    ? `${value}€`
    : `${value.toFixed(2).replace(".", ",")}€`;
}

/** `5 de junho de 2026`, para o texto. O ISO fica para o `datetime` e o schema. */
export function formatStudyDate(iso: string): string {
  const date = new Date(`${iso}T12:00:00Z`);
  return new Intl.DateTimeFormat("pt-PT", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** Dias cobertos, do primeiro ao último pedido, inclusive. */
export function studyPeriodDays(): number {
  const start = Date.parse(`${STUDY_PERIOD.start}T00:00:00Z`);
  const end = Date.parse(`${STUDY_PERIOD.end}T00:00:00Z`);
  return Math.round((end - start) / 86400000) + 1;
}

// Verificações que correm à carga do módulo, por isso rebentam no build e não
// em produção. Existem porque um número desalinhado aqui contamina a página
// toda: é o ficheiro onde um erro de transcrição não daria erro visível.
if (studySum(STUDY_MONTHS) !== STUDY_TOTAL_REQUESTS) {
  throw new Error("studyData: os meses têm de somar o total de pedidos");
}
for (const group of [...STUDY_SERVICES, ...STUDY_CITIES, ...STUDY_SERVICE_TYPES, ...STUDY_MONTHS]) {
  if (group.requests < STUDY_MIN_GROUP_SIZE) {
    throw new Error(`studyData: "${group.label}" está abaixo do corte de ${STUDY_MIN_GROUP_SIZE} e não pode ser publicado`);
  }
}
if (studySum(STUDY_VALUES) + STUDY_VALUES_WITHHELD.requests > STUDY_REQUESTS_WITH_VALUE) {
  throw new Error("studyData: os valores publicados excedem os pedidos com valor");
}

// ─── Cópia da página ───────────────────────────────────────────────────────
//
// Vive aqui, e não dentro do componente React, por causa da regra
// anti-cloaking: o HTML estático que os motores leem é escrito pelo
// scripts/prerender.ts, não pelo React, e as duas versões têm de dizer
// exatamente a mesma coisa. Partilhando as frases, não podem divergir.
// Os números são interpolados das constantes acima, nunca escritos.

export const STUDY_ROUTE = "/estudo-limpeza-estofos-portugal";

export const STUDY_TITLE =
  "Estudo: o que as pessoas pedem quando limpam estofos | Kyro Clean Solutions";

export const STUDY_H1 = "O que as pessoas pedem quando limpam estofos em casa";

export const STUDY_META_DESCRIPTION =
  `Estudo com dados próprios: ${STUDY_TOTAL_REQUESTS} pedidos de orçamento recebidos entre ` +
  `${formatStudyDate(STUDY_PERIOD.start)} e ${formatStudyDate(STUDY_PERIOD.end)}. Que serviços, que valores e com que método.`;

export const STUDY_INTRO =
  `Entre ${formatStudyDate(STUDY_PERIOD.start)} e ${formatStudyDate(STUDY_PERIOD.end)} recebemos ` +
  `${STUDY_TOTAL_REQUESTS} pedidos de orçamento através deste site. Publicamos aqui o que eles mostram, ` +
  `com o método à vista e com os limites ditos. São ${studyPeriodDays()} dias de uma empresa só: ` +
  `chegam para descrever a nossa procura, não para descrever o mercado português.`;

/** O método. Primeiro, e não no fim: sem ele nada disto é verificável. */
export const STUDY_METHOD_POINTS: string[] = [
  `Os dados são os pedidos de orçamento submetidos pelo simulador deste site, um registo por pedido, entre ${formatStudyDate(STUDY_PERIOD.start)} e ${formatStudyDate(STUDY_PERIOD.end)}.`,
  `São ${STUDY_TOTAL_REQUESTS} pedidos. Não é uma amostra escolhida: é tudo o que foi registado no período.`,
  "Só contam pedidos feitos no site em produção. Pedidos por telefone, por WhatsApp ou por email não passam pelo simulador e não estão aqui.",
  "Só contam pedidos de quem aceitou as cookies de análise. Quem as recusa não é registado, por isso o total real de pedidos é maior do que o publicado aqui.",
  `Nenhum grupo com menos de ${STUDY_MIN_GROUP_SIZE} pedidos é publicado, para nenhum número poder ser ligado a uma pessoa. Onde isso corta categorias, o número de pedidos que ficaram de fora está dito na tabela.`,
  "Os agregados não incluem nome, telefone, email nem morada. A consulta que os produziu não lê esses campos.",
  "Os valores são medianas e quartis, não médias: uma média com pedidos sob orçamento pelo meio não descreve nada.",
];

/** Os limites. Dizer o que os números não dizem é o que os torna citáveis. */
export const STUDY_LIMIT_POINTS: string[] = [
  `${STUDY_TOTAL_REQUESTS} pedidos em ${studyPeriodDays()} dias é pouco. Cada percentagem aqui tem uma margem que estes números não permitem estreitar, e uma diferença de poucos pontos entre duas categorias não é uma diferença real.`,
  `Só o Porto chega aos ${STUDY_MIN_GROUP_SIZE} pedidos. Isto diz onde está a nossa procura, não onde está a procura do país.`,
  "O período tem quatro meses, dois deles incompletos. Não chega para separar sazonalidade de crescimento: os pedidos subiram de junho para agosto, e não sabemos se foi a época do ano ou se foi o site a ganhar visitas.",
  "Os valores são estimativas do simulador no momento do pedido, antes de a peça ser vista. Não são faturação, e o valor final pode mudar depois da avaliação no local.",
  "São os dados de uma empresa. Descrevem quem nos encontra e nos escreve, o que não é o mesmo que descrever quem manda limpar estofos em Portugal.",
];

// ─── Tabelas ───────────────────────────────────────────────────────────────
//
// Construídas aqui, uma vez, e consumidas pela página React e pelo prerender.
// Se cada lado montasse as suas linhas, seriam duas construções parecidas que
// mais cedo ou mais tarde deixavam de ser iguais, e a diferença entre o que a
// pessoa lê e o que o motor lê é exatamente o que a regra anti-cloaking
// proíbe.
//
// Nenhuma categoria abaixo do corte é nomeada. O resto aparece agrupado como
// "outras", porque publicar o nome de um grupo com menos de
// STUDY_MIN_GROUP_SIZE pedidos era o que o corte existe para evitar.

export interface StudyTable {
  id: string;
  heading: string;
  columns: string[];
  rows: string[][];
  note: string;
}

function countRow(group: StudyCount): string[] {
  return [group.label, String(group.requests), formatShare(group.requests)];
}

export function buildStudyTables(): StudyTable[] {
  const servicesRemainder = studyRemainder(STUDY_SERVICES);
  const citiesRemainder = studyRemainder(STUDY_CITIES);
  const typesRemainder = studyRemainder(STUDY_SERVICE_TYPES);

  return [
    {
      id: "servicos",
      heading: "Que peça as pessoas querem tratar",
      columns: ["Serviço", "Pedidos", `% dos ${STUDY_TOTAL_REQUESTS} pedidos`],
      rows: [
        ...STUDY_SERVICES.map(countRow),
        [`Outras categorias, abaixo do corte de ${STUDY_MIN_GROUP_SIZE} pedidos`, String(servicesRemainder), formatShare(servicesRemainder)],
      ],
      note:
        `O sofá é mais de metade dos pedidos. A distância entre o sofá e as restantes peças é a única diferença aqui que ${STUDY_TOTAL_REQUESTS} pedidos sustentam: ` +
        "entre tapetes e colchões a diferença é pequena o suficiente para não a tratarmos como uma ordem fixa.",
    },
    {
      id: "cidades",
      heading: "Onde estão os pedidos",
      columns: ["Cidade", "Pedidos", `% dos ${STUDY_TOTAL_REQUESTS} pedidos`],
      rows: [
        ...STUDY_CITIES.map(countRow),
        [`Outras cidades, cada uma abaixo do corte de ${STUDY_MIN_GROUP_SIZE} pedidos`, String(citiesRemainder), formatShare(citiesRemainder)],
      ],
      note:
        `O Porto é a única cidade que chega aos ${STUDY_MIN_GROUP_SIZE} pedidos no período. Os outros ${citiesRemainder} pedidos estão espalhados por várias cidades, ` +
        "nenhuma delas com registos suficientes para ser publicada. Isto diz que a nossa procura está concentrada no Porto; não diz nada sobre onde está a procura no país.",
    },
    {
      id: "meses",
      heading: "Quando chegam os pedidos",
      columns: ["Mês", "Pedidos", `% dos ${STUDY_TOTAL_REQUESTS} pedidos`],
      rows: STUDY_MONTHS.map(month => [
        month.partial ? `${month.label} (mês incompleto)` : month.label,
        String(month.requests),
        formatShare(month.requests),
      ]),
      note:
        `Junho começa a contar a ${formatStudyDate(STUDY_PERIOD.start)} e setembro acaba a ${formatStudyDate(STUDY_PERIOD.end)}: ` +
        "não são meses inteiros e não se comparam com julho e agosto. Quatro meses não chegam para falar de sazonalidade. " +
        "Os pedidos subiram de junho para agosto, e com estes dados não conseguimos separar a época do ano do crescimento do próprio site. Dizemos que subiu; não dizemos porquê.",
    },
    {
      id: "tipo-de-servico",
      heading: "Limpeza ou impermeabilização",
      columns: ["Tipo de serviço", "Pedidos", `% dos ${STUDY_TOTAL_REQUESTS} pedidos`],
      rows: [
        ...STUDY_SERVICE_TYPES.map(countRow),
        ["Sem tipo registado ou em categoria abaixo do corte", String(typesRemainder), formatShare(typesRemainder)],
      ],
      note:
        "Quando as duas opções estão disponíveis, quase toda a gente pede limpeza. A impermeabilização é pedida como serviço principal por uma minoria pequena, " +
        "e continua a ser sobretudo um extra acrescentado a uma limpeza, não o motivo do contacto.",
    },
    {
      id: "valores",
      heading: "Valor estimado do pedido",
      columns: ["Serviço", "Pedidos com valor", "1.º quartil", "Mediana", "3.º quartil"],
      rows: STUDY_VALUES.map(entry => [
        entry.label,
        String(entry.requests),
        formatEuro(entry.q1),
        formatEuro(entry.median),
        formatEuro(entry.q3),
      ]),
      note:
        "O valor é o total estimado do pedido inteiro: o serviço principal, os artigos adicionais do mesmo pedido e a taxa de deslocação. " +
        "Não é o preço de uma peça, e é por isso que a mediana fica acima do preço de partida. Não é faturação: é o que o simulador estimou antes de a peça ser vista. " +
        `${STUDY_TOTAL_REQUESTS - STUDY_REQUESTS_WITH_VALUE} dos ${STUDY_TOTAL_REQUESTS} pedidos não têm valor nenhum, por incluírem pelo menos um artigo sob orçamento. ` +
        STUDY_VALUES_WITHHELD.reason,
    },
  ];
}
