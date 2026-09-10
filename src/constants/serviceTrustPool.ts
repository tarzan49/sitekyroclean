// Regra mandatory (2026-09-01, repetida pelo dono depois de eu ter aplicado
// só a upsell): NUNCA um título totalmente dourado. Cada título é autorado
// já dividido em `titleGold` (a parte chave — preço+produto quando existe
// upsell, ou o conceito central quando não existe) + `titleRest` (o resto,
// a preto). Nada de regex a adivinhar a partir de um título único — cada
// pool escreve as duas partes explicitamente.
export interface TrustPoint { stat?: string; titleGold: string; titleRest?: string; desc: string; }

// Escolha determinística mas com variedade: a mesma seed (serviço+variante+
// localização) escolhe sempre o mesmo item do pool, mas seeds diferentes
// (cidades/freguesias diferentes) tendem a escolher itens diferentes — evita
// texto repetido palavra por palavra em centenas de páginas, sem precisar de
// aleatoriedade real (que mudaria o conteúdo a cada reload, mau para SEO).
function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}
function pickFromPool<T>(pool: T[], seed: string): T {
  return pool[hashSeed(seed) % pool.length];
}

// 2026-08-31: sofá e colchão passam a usar pools de várias opções por ponto
// em vez de 3 variantes fixas — pedido explícito: o 1º e 2º ponto do sofá têm
// de ser sempre upsell (impermeabilização e Anti Ácaros, um pool de 5 cada),
// o 3º é sempre o mesmo (Pack Família). No colchão só há um upsell (Anti
// Ácaros), por isso é o 2º ponto que é sempre upsell (pool de 5); o 1º é um
// pool de 5 conselhos gerais (frequência recomendada + 4 outros); o 3º
// intercala entre um estudo/facto e o convite a juntar outro estofo.

const SOFA_IMPERM_UPSELL_POOL: TrustPoint[] = [
  { titleGold: 'A partir de 50€ Impermeabilização', titleRest: ' para nunca mais temer uma mancha', desc: 'Sem proteção, o café ou o vinho atravessa o tecido em apenas 30 segundos, irrecuperável em 70% dos casos. Aplicada já nesta visita, a mancha fica à superfície, pronta a limpar com um pano.' },
  { titleGold: 'A partir de 50€ Impermeabilização', titleRest: ' que trava o desgaste do tecido', desc: 'A fricção diária com células mortas e gordura corporal pode antecipar o desgaste visível do tecido para os 18 meses de uso. A Impermeabilização cria uma barreira que reduz esse desgaste e prolonga a vida do estofo.' },
  { titleGold: 'A partir de 50€ Impermeabilização', titleRest: ' para proteger de crianças e animais', desc: 'Urina, patas sujas e comida caída são as principais causas de manchas permanentes. A Impermeabilização repele líquidos à superfície, dando tempo a limpar antes de absorverem.' },
  { titleGold: 'A partir de 50€ Impermeabilização', titleRest: ' que sai muito mais barato que substituir', desc: 'Substituir um sofá custa centenas de euros. Impermeabilizá-lo custa uma fração disso e mantém o aspeto de novo durante muito mais tempo.' },
  { titleGold: 'A partir de 50€ Impermeabilização', titleRest: ' no momento certo: aproveite agora', desc: 'Com o tecido limpo e sem gordura, o produto de impermeabilização adere melhor e dura mais. Aplicado sobre sujidade acumulada, a proteção nunca é tão eficaz.' },
];

const SOFA_ANTIACAROS_UPSELL_POOL: TrustPoint[] = [
  {"titleGold": "A partir de 20€ Anti Ácaros", "titleRest": ", como complemento à limpeza", "desc": "A limpeza remove sujidade e resíduos do sofá. O tratamento anti-ácaros é opcional e é confirmado separadamente no orçamento."},
  {"titleGold": "A partir de 20€ Anti Ácaros", "titleRest": ", na mesma visita", "desc": "Pode acrescentar este tratamento ao seu sofá sem marcar outra intervenção. Avaliamos o material e as condições de aplicação antes de começar."},
  {"titleGold": "A partir de 20€ Anti Ácaros", "titleRest": ", com aplicação adequada ao tecido", "desc": "Escolhemos o tratamento conforme o tecido e o uso do sofá. Explicamos os cuidados após a aplicação e confirmamos o preço antes da marcação."},
  {"titleGold": "A partir de 20€ Anti Ácaros", "titleRest": ", dirigido a ácaros", "desc": "Anti-ácaros e desbacterização têm objetivos distintos. Indique o cuidado pretendido para receber uma proposta adequada."},
  {"titleGold": "A partir de 20€ Anti Ácaros", "titleRest": ", com orçamento claro", "desc": "O extra não está incluído automaticamente na limpeza. Pode escolhê-lo ao configurar o artigo e confirmar o valor com a equipa."},
];

const SOFA_FIXED_CROSSSELL: TrustPoint = { titleGold: 'Uma visita,', titleRest: ' vários estofos limpos', desc: 'Sofá, colchão, tapete ou cadeiras: o mesmo técnico trata tudo no mesmo dia, com desconto de pack.' };

function getSofaTrustPoints(seed: string): TrustPoint[] {
  return [
    pickFromPool(SOFA_IMPERM_UPSELL_POOL, `${seed}:imperm`),
    pickFromPool(SOFA_ANTIACAROS_UPSELL_POOL, `${seed}:antiacaros`),
    SOFA_FIXED_CROSSSELL,
  ];
}

const COLCHAO_ADVICE_POOL: TrustPoint[] = [
  { stat: '6–12', titleGold: 'Frequência recomendada', titleRest: ' para higienizar o colchão', desc: 'É o intervalo recomendado por especialistas para higienizar um colchão em uso diário. O seu, há quanto tempo não é tratado?' },
  { titleGold: 'Vire o colchão', titleRest: ' a cada 3 meses', desc: 'Ajuda a distribuir o desgaste e o suor absorvido de forma mais uniforme, prolongando a vida útil entre limpezas profissionais.' },
  { titleGold: 'Lençóis lavados', titleRest: ' não bastam', desc: 'A roupa de cama protege a superfície, mas o suor e as células mortas acumulam-se por baixo, no próprio colchão, ao longo de meses.' },
  { titleGold: 'Alergias sazonais', titleRest: ' podem vir do colchão', desc: 'Em quartos pouco ventilados, o colchão acumula ácaros e pólen que pioram sintomas respiratórios, sobretudo na mudança de estação.' },
  { titleGold: 'Colchão novo', titleRest: ' também precisa de cuidado', desc: 'A limpeza regular não é só para manchas visíveis: remove também o que se acumula desde o primeiro dia de uso, mesmo sem se notar.' },
];

const COLCHAO_ANTIACAROS_UPSELL_POOL: TrustPoint[] = [
  {"titleGold": "Tratamento Anti Ácaros", "titleRest": ", como complemento à limpeza", "desc": "A limpeza remove sujidade e resíduos do colchão. O tratamento anti-ácaros é opcional e é confirmado separadamente no orçamento."},
  {"titleGold": "Tratamento Anti Ácaros", "titleRest": ", na mesma visita", "desc": "Pode acrescentar este tratamento ao seu colchão sem marcar outra intervenção. Avaliamos o material e as condições de aplicação antes de começar."},
  {"titleGold": "Tratamento Anti Ácaros", "titleRest": ", com aplicação adequada ao tecido", "desc": "Escolhemos o tratamento conforme o tecido e o uso do colchão. Explicamos os cuidados após a aplicação e confirmamos o preço antes da marcação."},
  {"titleGold": "Tratamento Anti Ácaros", "titleRest": ", dirigido a ácaros", "desc": "Anti-ácaros e desbacterização têm objetivos distintos. Indique o cuidado pretendido para receber uma proposta adequada."},
  {"titleGold": "Tratamento Anti Ácaros", "titleRest": ", com orçamento claro", "desc": "O extra não está incluído automaticamente na limpeza. Pode escolhê-lo ao configurar o artigo e confirmar o valor com a equipa."},
];

// Intercala estudo/facto com o convite ao Pack Família (índices alternados
// por construção, a seed decide qual dos 4 aparece em cada página).
const COLCHAO_POINT3_POOL: TrustPoint[] = [
  { titleGold: 'Cuidado regular', titleRest: ' para o seu colchão', desc: 'A limpeza ajuda a remover suor, pó e resíduos acumulados nas fibras. Anti-ácaros e desbacterização podem ser acrescentados como extras.' },
  { titleGold: 'Sofá ou tapete', titleRest: ' na mesma visita?', desc: 'Peça o colchão e outro estofo no mesmo agendamento: o técnico já está em sua casa e o desconto aplica-se a tudo.' },
  { titleGold: 'Tratamentos opcionais', titleRest: ' conforme o seu objetivo', desc: 'Diga-nos o que pretende tratar. Explicamos a diferença entre limpeza, anti-ácaros e desbacterização antes de escolher.' },
  { titleGold: 'Aproveite o técnico', titleRest: ' já em sua casa', desc: 'Junte sofá, tapete ou cadeiras à limpeza do colchão: mesma visita, mesmo dia, com desconto de pack.' },
];

function getColchaoTrustPoints(seed: string): TrustPoint[] {
  return [
    pickFromPool(COLCHAO_ADVICE_POOL, `${seed}:advice`),
    pickFromPool(COLCHAO_ANTIACAROS_UPSELL_POOL, `${seed}:antiacaros`),
    pickFromPool(COLCHAO_POINT3_POOL, `${seed}:p3`),
  ];
}

// Cadeiras: mesmo padrão do sofá — 1º ponto sempre upsell de Impermeabilização
// (pool de 5), 2º ponto sempre upsell de Anti Ácaros (pool de 5), 3º fixo
// (Pack Família). Preços "a partir de": 20€ Impermeabilização (mínimo, 1-4
// cadeiras Essencial) e 7,5€ Anti Ácaros (preço fixo por cadeira) — 2026-08-31.
const CADEIRAS_IMPERM_UPSELL_POOL: TrustPoint[] = [
  { titleGold: 'A partir de 20€ Impermeabilização', titleRest: ' para nunca mais temer uma mancha', desc: 'Sem proteção, um copo entornado numa cadeira de jantar absorve em apenas 30 segundos, difícil de remover depois. Aplicada já nesta visita, a mancha fica à superfície, pronta a limpar com um pano.' },
  { titleGold: 'A partir de 20€ Impermeabilização', titleRest: ' que trava o desgaste do tecido', desc: 'O uso diário à mesa pode antecipar o desgaste visível do tecido para os 18 meses. A Impermeabilização cria uma barreira que reduz esse desgaste e prolonga a vida da cadeira.' },
  { titleGold: 'A partir de 20€ Impermeabilização', titleRest: ' para proteger de crianças e animais', desc: 'Sumo entornado, patas sujas ou comida caída são as principais causas de manchas permanentes em cadeiras de jantar. A Impermeabilização repele líquidos à superfície, dando tempo a limpar antes de absorverem.' },
  { titleGold: 'A partir de 20€ Impermeabilização', titleRest: ' que sai muito mais barato que substituir', desc: 'Substituir um conjunto de cadeiras custa centenas de euros. Impermeabilizá-las custa uma fração disso e mantém o aspeto de novo durante muito mais tempo.' },
  { titleGold: 'A partir de 20€ Impermeabilização', titleRest: ' no momento certo: aproveite agora', desc: 'Com o tecido limpo e sem gordura, o produto de impermeabilização adere melhor e dura mais. Aplicado sobre sujidade acumulada, a proteção nunca é tão eficaz.' },
];

const CADEIRAS_ANTIACAROS_UPSELL_POOL: TrustPoint[] = [
  {"titleGold": "5€/un. Anti Ácaros", "titleRest": ", como complemento à limpeza", "desc": "A limpeza remove sujidade e resíduos do cadeira. O tratamento anti-ácaros é opcional e é confirmado separadamente no orçamento."},
  {"titleGold": "5€/un. Anti Ácaros", "titleRest": ", na mesma visita", "desc": "Pode acrescentar este tratamento ao seu cadeira sem marcar outra intervenção. Avaliamos o material e as condições de aplicação antes de começar."},
  {"titleGold": "5€/un. Anti Ácaros", "titleRest": ", com aplicação adequada ao tecido", "desc": "Escolhemos o tratamento conforme o tecido e o uso do cadeira. Explicamos os cuidados após a aplicação e confirmamos o preço antes da marcação."},
  {"titleGold": "5€/un. Anti Ácaros", "titleRest": ", dirigido a ácaros", "desc": "Anti-ácaros e desbacterização têm objetivos distintos. Indique o cuidado pretendido para receber uma proposta adequada."},
  {"titleGold": "5€/un. Anti Ácaros", "titleRest": ", com orçamento claro", "desc": "O extra não está incluído automaticamente na limpeza. Pode escolhê-lo ao configurar o artigo e confirmar o valor com a equipa."},
];

const CADEIRAS_FIXED_CROSSSELL: TrustPoint = { titleGold: 'Uma visita,', titleRest: ' vários estofos limpos', desc: 'Cadeiras, sofá, colchão ou tapete: o mesmo técnico trata tudo no mesmo dia, com desconto de pack.' };

function getCadeirasTrustPoints(seed: string): TrustPoint[] {
  return [
    pickFromPool(CADEIRAS_IMPERM_UPSELL_POOL, `${seed}:imperm`),
    pickFromPool(CADEIRAS_ANTIACAROS_UPSELL_POOL, `${seed}:antiacaros`),
    CADEIRAS_FIXED_CROSSSELL,
  ];
}

// Tapetes: sem upsell (impermeabilização de tapetes foi descontinuada — não
// reintroduzir), por isso os 2 primeiros pontos são pools de 5 factos, não
// de upsell: 1º = gancho de produto (sem preço fixo — cada tapete é sempre
// orçamentado à parte, mudança de 2026-09-06, não voltar a pôr "a partir de
// X€/m²" aqui), 2º = info de qualidade/confiança que convença o cliente a
// limpar. 3º fixo (Pack Família) — 2026-08-31, títulos revistos 2026-09-01,
// preço removido 2026-09-06.
const TAPETES_PROBLEMA_POOL: TrustPoint[] = [
  { titleGold: 'Higienização de Tapetes', titleRest: ' que remove resíduos das fibras', desc: 'Tapetes retêm e libertam no ar partículas a cada passo: pólenes, ácaros e poluentes invisíveis, até 8× mais que um pavimento liso. A higienização profissional remove o que a aspiração doméstica nunca chega.' },
  { titleGold: 'Higienização de Tapetes', titleRest: ' com extração de sujidade das fibras', desc: 'A sujidade acumula-se entre as fibras. A limpeza é orçamentada mediante medidas; tratamentos adicionais são avaliados e confirmados à parte.' },
  { titleGold: 'Higienização de Tapetes', titleRest: ' que remove o pó acumulado há meses', desc: 'Um tapete médio acumula até 2 kg de matéria orgânica, pó e resíduos por metro quadrado ao longo de 12 meses, mesmo com aspiração regular.' },
  { titleGold: 'Higienização de Tapetes', titleRest: ' que remove odores que a aspiração nunca tira', desc: 'Suor, animais de estimação e humidade ficam retidos nas fibras profundas do tapete. Só a extração profissional a quente remove o odor pela raiz, não só à superfície.' },
  { titleGold: 'Higienização de Tapetes', titleRest: ' para cuidar das fibras em casa', desc: 'Espirros e olhos irritados em casa podem vir do tapete, não do ar exterior. Fibras densas acumulam ácaros e pólen que a ventilação normal não remove.' },
];

const TAPETES_QUALIDADE_POOL: TrustPoint[] = [
  { titleGold: 'Aparência renovada', titleRest: ' sem substituir o tapete', desc: 'Tapetes considerados "inutilizáveis" ficam como novos com extração profissional a quente, recuperando até 90% da aparência original. Sem gastar em tapete novo.' },
  { titleGold: 'Pronto a usar', titleRest: ' em poucas horas', desc: 'O nosso equipamento de alta extração minimiza a humidade residual. Em condições normais de ventilação, o tapete está pronto a pisar em 3 a 6 horas.' },
  { titleGold: 'Recuperação de cores', titleRest: ' sem tratamentos agressivos', desc: 'Enzimas específicas por tipo de fibra restauram a tonalidade original sem branqueamento nem produtos corrosivos que danificam o tapete a longo prazo.' },
  { titleGold: 'A técnica certa', titleRest: ' para cada tipo de fibra', desc: 'Lã, seda, sisal ou sintético: cada material exige um método e produto próprios. Aplicar a técnica errada pode encolher ou destingir o tapete.' },
  { titleGold: 'Tapetes delicados', titleRest: ' tratados com o cuidado que merecem', desc: 'Tapetes antigos, de família ou artesanais recebem um processo mais cuidadoso, testado numa zona pouco visível antes de tratar a peça toda.' },
];

const TAPETES_FIXED_CROSSSELL: TrustPoint = { titleGold: 'Uma visita,', titleRest: ' vários espaços tratados', desc: 'Sofá, colchão ou cadeiras na mesma visita do tapete: um único agendamento, desconto de pack incluído.' };

function getTapetesTrustPoints(seed: string): TrustPoint[] {
  return [
    pickFromPool(TAPETES_PROBLEMA_POOL, `${seed}:problema`),
    pickFromPool(TAPETES_QUALIDADE_POOL, `${seed}:qualidade`),
    TAPETES_FIXED_CROSSSELL,
  ];
}

// Alcatifa: mesma lógica do tapete (pedido explícito 2026-09-09: "combinei
// contigo o esquema da info anteriormente em colchao cadeira sofa e tapete,
// quero a mesma logica de tapete para alcatifa") — sem upsell, 1º ponto é
// gancho de produto, 2º é qualidade/confiança, 3º fixo (Pack Família). Preço
// removido dos dois pools (2026-09-09: "limpeza de alcatifa e sempre sob
// orçamento assim como tapete" — nunca voltar a pôr "desde X€/m²" aqui).
const ALCATIFA_PROBLEMA_POOL: TrustPoint[] = [
  { stat: '1 kg/m²', titleGold: 'Sujidade invisível', titleRest: ' acumulada em cada m² da alcatifa', desc: 'Fibras compactadas retêm o que não se vê mas que respira todos os dias. Nem a aspiração profissional chega às camadas mais profundas.' },
  { stat: '2,5×', titleGold: 'Pior qualidade do ar', titleRest: ' sem limpeza regular', desc: 'Alcatifas sem manutenção anual degradam significativamente o ar interior. Crítico em escritórios, quartos e espaços com pouca ventilação.' },
  { stat: '10×', titleGold: '10× mais poluentes', titleRest: ' retidos do que no ar', desc: 'Fibras densas de alcatifa retêm compostos orgânicos voláteis, poluentes e toxinas que a ventilação normal não remove.' },
  { stat: '1.000', titleGold: '1.000 pessoas/dia', titleRest: ' em zonas comerciais de tráfego intenso', desc: 'Uma alcatifa de escritório ou loja com uso diário intenso acumula sujidade a um ritmo muito mais rápido do que uma alcatifa doméstica.' },
  { stat: '5×', titleGold: '5× mais sujidade', titleRest: ' nas zonas de passagem', desc: 'Corredores e entradas acumulam muito mais sujidade por cm² do que zonas estáticas, e são as mais negligenciadas na limpeza doméstica.' },
];

const ALCATIFA_QUALIDADE_POOL: TrustPoint[] = [
  { titleGold: 'Aparência renovada', titleRest: ' sem substituir a alcatifa', desc: 'Alcatifas consideradas gastas ou descoloridas recuperam até 85% da tonalidade original com extração profissional a quente, sem gastar em revestimento novo.' },
  { titleGold: 'Pronto a usar', titleRest: ' em poucas horas', desc: 'O nosso equipamento de alta sucção minimiza a humidade residual. Em condições normais de ventilação, a alcatifa fica seca em 3 a 6 horas.' },
  { titleGold: 'Sem interromper', titleRest: ' a atividade do espaço', desc: 'Em escritórios, clínicas ou lojas, trabalhamos frequentemente fora do horário de expediente para não afetar o funcionamento do negócio.' },
  { titleGold: 'Remoção de resíduos', titleRest: ' dos alergénios e ácaros', desc: 'A extração profunda a quente remove o que a aspiração doméstica nunca chega, reduzindo significativamente alergénios acumulados nas fibras.' },
  { titleGold: 'Equipamento certo', titleRest: ' para cada tipo de alcatifa', desc: 'Alcatifas de pelo alto, baixo ou de alta densidade (comum em hotéis) exigem pressão e técnica diferentes. Usamos o equipamento adequado a cada caso.' },
];

const ALCATIFA_FIXED_CROSSSELL: TrustPoint = { titleGold: 'Uma visita,', titleRest: ' todos os espaços tratados', desc: 'Sofá, colchão, tapete ou cadeiras na mesma visita da alcatifa: um único agendamento, desconto de pack incluído.' };

function getAlcatifaTrustPoints(seed: string): TrustPoint[] {
  return [
    pickFromPool(ALCATIFA_PROBLEMA_POOL, `${seed}:problema`),
    pickFromPool(ALCATIFA_QUALIDADE_POOL, `${seed}:qualidade`),
    ALCATIFA_FIXED_CROSSSELL,
  ];
}

// Impermeabilização: pedido explícito 2026-09-09 — 1º ponto sempre sofá, 2º
// ponto sempre cadeira (os dois únicos móveis com preço próprio na tabela
// desta página, ver PRICE_TABLE['impermeabilizacao']), ambos no formato
// "a partir de/desde X€, proteja até 10 anos o seu Y de Z". "10 anos" é a
// duração real já usada na Premium noutro lado do site (ver
// keywordVariantData.ts: "proteção real até 10 anos"), não um número novo.
// 3º ponto fica exatamente como estava (fixo, não fazia parte do pedido).
const IMPERMEABILIZACAO_SOFA_POOL: TrustPoint[] = [
  { titleGold: 'Premium desde 89€,', titleRest: ' proteja até 10 anos o seu sofá de linho', desc: 'A versão Premium cria uma barreira invisível que resiste a até 5 lavagens e mantém o linho protegido de manchas e líquidos durante uma década.' },
  { titleGold: 'Premium desde 89€,', titleRest: ' proteja até 10 anos o seu sofá de veludo', desc: 'O veludo absorve líquidos em segundos e mancha com facilidade. A Premium cria uma barreira que repele manchas sem alterar o toque aveludado.' },
  { titleGold: 'Premium desde 89€,', titleRest: ' proteja até 10 anos o seu sofá de chenille', desc: 'O chenille retém sujidade nas fibras entrelaçadas. Com a Premium, líquidos e gordura ficam à superfície, prontos a limpar com um pano.' },
  { titleGold: 'Premium desde 89€,', titleRest: ' proteja até 10 anos o seu sofá de algodão', desc: 'Tecidos de algodão absorvem manchas com muita facilidade. A Premium cria uma barreira invisível que reduz esse risco ao mínimo, sem alterar a cor.' },
  { titleGold: 'Premium desde 89€,', titleRest: ' proteja até 10 anos o seu sofá de bouclé', desc: 'A textura em laçada do bouclé retém sujidade nos relevos. A Premium protege sem esconder a textura nem alterar o aspeto do tecido.' },
];

const IMPERMEABILIZACAO_CADEIRA_POOL: TrustPoint[] = [
  { titleGold: 'A partir de 20€,', titleRest: ' proteja até 10 anos a sua cadeira de tecido', desc: 'Cadeiras de jantar recebem sumo, molho e gordura todos os dias. A Premium cria uma barreira que dá tempo a limpar antes de a mancha absorver.' },
  { titleGold: 'Desde 20€,', titleRest: ' proteja até 10 anos a sua cadeira de veludo', desc: 'O veludo das cadeiras estofadas marca com facilidade. A Premium repele líquidos à superfície sem alterar o brilho nem o toque do tecido.' },
  { titleGold: 'A partir de 20€,', titleRest: ' proteja até 10 anos a sua cadeira de linho', desc: 'Linho claro mostra qualquer mancha de imediato. Com a Premium, derrames à mesa ficam à superfície, prontos a remover com um pano seco.' },
  { titleGold: 'Desde 20€,', titleRest: ' proteja até 10 anos a sua cadeira de chenille', desc: 'As fibras entrelaçadas do chenille retêm sujidade nas costuras. A Premium cria uma barreira que impede que os líquidos cheguem lá.' },
  { titleGold: 'A partir de 20€,', titleRest: ' proteja até 10 anos a sua cadeira estofada', desc: 'Cadeiras de restaurante ou de uso diário sofrem o desgaste mais rápido de todos os estofos. A Premium prolonga o aspeto de novo durante uma década.' },
];

const IMPERMEABILIZACAO_FIXED_POINT3: TrustPoint = { titleGold: 'Combine com a limpeza', titleRest: ' e poupe', desc: 'Peça a impermeabilização junto com a limpeza profunda: o Pack Proteção Total tem desconto sobre os dois serviços em separado.' };

function getImpermeabilizacaoTrustPoints(seed: string): TrustPoint[] {
  return [
    pickFromPool(IMPERMEABILIZACAO_SOFA_POOL, `${seed}:sofa`),
    pickFromPool(IMPERMEABILIZACAO_CADEIRA_POOL, `${seed}:cadeira`),
    IMPERMEABILIZACAO_FIXED_POINT3,
  ];
}

/** Pontos de confiança para sofá/colchão/cadeiras/tapete/alcatifa/
 *  impermeabilização (pools com variedade — ver acima). `seed` deve
 *  identificar a página de forma estável (ex: serviço+variante+cidade/
 *  freguesia) para que a mesma página mostre sempre o mesmo conteúdo. */
export function getTrustPointsForSeed(serviceSlug: string, seed: string): TrustPoint[] | null {
  if (serviceSlug === 'limpeza-sofas') return getSofaTrustPoints(seed);
  if (serviceSlug === 'limpeza-colchoes') return getColchaoTrustPoints(seed);
  if (serviceSlug === 'limpeza-cadeiras') return getCadeirasTrustPoints(seed);
  if (serviceSlug === 'limpeza-tapetes') return getTapetesTrustPoints(seed);
  if (serviceSlug === 'limpeza-alcatifas') return getAlcatifaTrustPoints(seed);
  if (serviceSlug === 'impermeabilizacao') return getImpermeabilizacaoTrustPoints(seed);
  return null;
}
