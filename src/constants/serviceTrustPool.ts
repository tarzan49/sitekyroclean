// Regra mandatory (2026-09-01, repetida pelo dono depois de eu ter aplicado
// só a upsell): NUNCA um título totalmente dourado. Cada título é autorado
// já dividido em `titleGold` (a parte chave — preço+produto quando existe
// upsell, ou o conceito central quando não existe) + `titleRest` (o resto,
// a preto). Nada de regex a adivinhar a partir de um título único — cada
// pool escreve as duas partes explicitamente.
import { DRYING_PROMISE } from './commercialPolicy';
import { formatEuro, SOFA_WATERPROOF_PREMIUM_FROM, SOFA_ANTI_MITE_WITH_CLEANING_FROM, CHAIR_ANTI_MITE_UNIT_LABEL } from '../data/enginePrices';

export interface TrustPoint { stat?: string; titleGold: string; titleRest?: string; desc: string; }

/** Shared landing selection, including the HTML delivered before JavaScript. */
export function getLandingTrustPoints(serviceSlug: string, family: string, municipality: string, place: string): TrustPoint[] {
  const variant = family === 'freguesia' ? 2 : 1;
  const seed = family === 'freguesia' ? `${municipality}-${place}` : place;
  return getTrustPointsForSeed(serviceSlug, `${serviceSlug}:${variant}:${seed}`) ?? [];
}

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
  {
    "titleGold": "Impermeabilização opcional",
    "titleRest": " para facilitar os cuidados",
    "desc": "A proteção ajuda a reduzir a absorção de derrames em tecidos compatíveis. Absorva o líquido prontamente; não existe garantia de evitar todas as manchas."
  },
  {
    "titleGold": "Proteção do tecido",
    "titleRest": " não é reparação",
    "desc": "A impermeabilização não reconstrói fibras gastas nem corrige rasgões. Avaliamos o estado do sofá antes de propor a aplicação."
  },
  {
    "titleGold": "Cuidados após derrames",
    "titleRest": " de bebidas ou alimentos",
    "desc": "Remova os resíduos com cuidado e siga as instruções fornecidas para o tecido. A proteção não dispensa a manutenção."
  },
  {
    "titleGold": "Essencial e Premium",
    "titleRest": " para comparar antes de escolher",
    "desc": "Compare o âmbito, os cuidados e o preço das duas opções no orçamento. A escolha depende da compatibilidade do tecido e das peças a proteger."
  },
  {
    "titleGold": "Limpeza prévia",
    "titleRest": " avaliada separadamente",
    "desc": "Mostre as manchas e indique produtos já aplicados. A limpeza necessária antes da proteção é combinada e discriminada no orçamento."
  }
];

const SOFA_ANTIACAROS_UPSELL_POOL: TrustPoint[] = [
  {"titleGold": `A partir de ${formatEuro(SOFA_ANTI_MITE_WITH_CLEANING_FROM)} Anti Ácaros`, "titleRest": ", como complemento à limpeza", "desc": "A limpeza remove sujidade e resíduos do sofá. O tratamento anti-ácaros é opcional e é confirmado separadamente no orçamento."},
  {"titleGold": `A partir de ${formatEuro(SOFA_ANTI_MITE_WITH_CLEANING_FROM)} Anti Ácaros`, "titleRest": ", na mesma visita", "desc": "Pode acrescentar este tratamento ao seu sofá sem marcar outra intervenção. Avaliamos o material e as condições de aplicação antes de começar."},
  {"titleGold": `A partir de ${formatEuro(SOFA_ANTI_MITE_WITH_CLEANING_FROM)} Anti Ácaros`, "titleRest": ", com aplicação adequada ao tecido", "desc": "Escolhemos o tratamento conforme o tecido e o uso do sofá. Explicamos os cuidados após a aplicação e confirmamos o preço antes da marcação."},
  {"titleGold": `A partir de ${formatEuro(SOFA_ANTI_MITE_WITH_CLEANING_FROM)} Anti Ácaros`, "titleRest": ", dirigido a ácaros", "desc": "Anti-ácaros e desbacterização são o mesmo tratamento. Indique o cuidado pretendido para receber uma proposta adequada."},
  {"titleGold": `A partir de ${formatEuro(SOFA_ANTI_MITE_WITH_CLEANING_FROM)} Anti Ácaros`, "titleRest": ", com orçamento claro", "desc": "O extra não está incluído automaticamente na limpeza. Pode escolhê-lo ao configurar o artigo e confirmar o valor com a equipa."},
];

const SOFA_FIXED_CROSSSELL: TrustPoint = { titleGold: 'Uma visita,', titleRest: ' vários estofos limpos', desc: 'Pode juntar outros artigos na mesma visita. O orçamento identifica os serviços, os descontos aplicáveis e a deslocação, que não recebe desconto.' };

function getSofaTrustPoints(seed: string): TrustPoint[] {
  return [
    pickFromPool(SOFA_IMPERM_UPSELL_POOL, `${seed}:imperm`),
    pickFromPool(SOFA_ANTIACAROS_UPSELL_POOL, `${seed}:antiacaros`),
    SOFA_FIXED_CROSSSELL,
  ];
}

const COLCHAO_ADVICE_POOL: TrustPoint[] = [
  {
    "titleGold": "Frequência de limpeza",
    "titleRest": " adaptada ao uso",
    "desc": "O estado do colchão, as instruções do fabricante e a utilização ajudam a decidir quando limpar, sem impor um intervalo universal."
  },
  {
    "titleGold": "Rodar ou virar o colchão",
    "titleRest": " apenas quando indicado",
    "desc": "Consulte a etiqueta e as instruções do fabricante. Nem todos os colchões podem ser virados ou usados nas duas faces."
  },
  {
    "titleGold": "Roupa de cama",
    "titleRest": " e revestimento do colchão",
    "desc": "Lavar os lençóis não substitui a avaliação do revestimento. Mostre manchas ou outras alterações para definir os cuidados adequados."
  },
  {
    "titleGold": "Ventilação do quarto",
    "titleRest": " antes e depois da visita",
    "desc": "Informe as condições de ventilação para preparar a secagem. Não cubra o colchão enquanto estiver húmido."
  },
  {
    "titleGold": "Colchão recente",
    "titleRest": " com cuidados próprios",
    "desc": "Consulte as instruções de manutenção e mostre a etiqueta antes de aplicar produtos ou pedir uma intervenção."
  }
];

const COLCHAO_ANTIACAROS_UPSELL_POOL: TrustPoint[] = [
  {"titleGold": "Tratamento Anti Ácaros", "titleRest": ", como complemento à limpeza", "desc": "A limpeza remove sujidade e resíduos do colchão. O tratamento anti-ácaros é opcional e é confirmado separadamente no orçamento."},
  {"titleGold": "Tratamento Anti Ácaros", "titleRest": ", na mesma visita", "desc": "Pode acrescentar este tratamento ao seu colchão sem marcar outra intervenção. Avaliamos o material e as condições de aplicação antes de começar."},
  {"titleGold": "Tratamento Anti Ácaros", "titleRest": ", com aplicação adequada ao tecido", "desc": "Escolhemos o tratamento conforme o tecido e o uso do colchão. Explicamos os cuidados após a aplicação e confirmamos o preço antes da marcação."},
  {"titleGold": "Tratamento Anti Ácaros", "titleRest": ", dirigido a ácaros", "desc": "Anti-ácaros e desbacterização são o mesmo tratamento. Indique o cuidado pretendido para receber uma proposta adequada."},
  {"titleGold": "Tratamento Anti Ácaros", "titleRest": ", com orçamento claro", "desc": "O extra não está incluído automaticamente na limpeza. Pode escolhê-lo ao configurar o artigo e confirmar o valor com a equipa."},
];

// Intercala estudo/facto com o convite ao Pack Família (índices alternados
// por construção, a seed decide qual dos 4 aparece em cada página).
const COLCHAO_POINT3_POOL: TrustPoint[] = [
  { titleGold: 'Cuidado regular', titleRest: ' para o seu colchão', desc: 'A limpeza ajuda a remover suor, pó e resíduos acumulados nas fibras. Anti-ácaros e desbacterização podem ser acrescentados como extras.' },
  { titleGold: 'Sofá ou tapete', titleRest: ' na mesma visita?', desc: 'Pode juntar outros artigos na mesma visita. O orçamento identifica os serviços, os descontos aplicáveis e a deslocação, que não recebe desconto.' },
  { titleGold: 'Tratamentos opcionais', titleRest: ' conforme o seu objetivo', desc: 'Diga-nos o que pretende tratar. Explicamos a diferença entre limpeza, anti-ácaros e desbacterização antes de escolher.' },
  { titleGold: 'Aproveite o técnico', titleRest: ' já em sua casa', desc: 'Pode juntar outros artigos na mesma visita. O orçamento identifica os serviços, os descontos aplicáveis e a deslocação, que não recebe desconto.' },
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
// (Pack Família). O anti-ácaros das cadeiras escreve-se sempre como taxa
// unitária, "5€/un." (decisão do responsável), nunca como total calculado.
const CADEIRAS_IMPERM_UPSELL_POOL: TrustPoint[] = [
  {
    "titleGold": "Impermeabilização opcional",
    "titleRest": " para cadeiras estofadas",
    "desc": "A proteção pode ajudar a reduzir a absorção de líquidos em tecidos compatíveis. Derrames devem ser absorvidos prontamente."
  },
  {
    "titleGold": "Estado do revestimento",
    "titleRest": " avaliado antes da proteção",
    "desc": "Tecido gasto, rasgado ou desbotado não é restaurado pela impermeabilização. Mostre essas zonas antes de escolher o serviço."
  },
  {
    "titleGold": "Cuidados à mesa",
    "titleRest": " após pequenos acidentes",
    "desc": "Sumo, café e alimentos exigem atenção mesmo numa cadeira protegida. Siga as instruções de manutenção fornecidas."
  },
  {
    "titleGold": "Essencial e Premium",
    "titleRest": " para o conjunto escolhido",
    "desc": "Indique a quantidade e os modelos das cadeiras. Compare as opções e os respetivos preços antes de confirmar."
  },
  {
    "titleGold": "Limpeza e proteção",
    "titleRest": " discriminadas no orçamento",
    "desc": "A necessidade de limpeza prévia é avaliada pelo estado do estofo. Confirme quais as partes da cadeira incluídas na aplicação."
  }
];

const CADEIRAS_ANTIACAROS_UPSELL_POOL: TrustPoint[] = [
  {"titleGold": `${CHAIR_ANTI_MITE_UNIT_LABEL} Anti Ácaros`, "titleRest": ", como complemento à limpeza", "desc": "A limpeza remove sujidade e resíduos da cadeira. O tratamento anti-ácaros é opcional e é confirmado separadamente no orçamento."},
  {"titleGold": `${CHAIR_ANTI_MITE_UNIT_LABEL} Anti Ácaros`, "titleRest": ", na mesma visita", "desc": "Pode acrescentar este tratamento à sua cadeira sem marcar outra intervenção. Avaliamos o material e as condições de aplicação antes de começar."},
  {"titleGold": `${CHAIR_ANTI_MITE_UNIT_LABEL} Anti Ácaros`, "titleRest": ", com aplicação adequada ao tecido", "desc": "Escolhemos o tratamento conforme o tecido e o uso da cadeira. Explicamos os cuidados após a aplicação e confirmamos o preço antes da marcação."},
  {"titleGold": `${CHAIR_ANTI_MITE_UNIT_LABEL} Anti Ácaros`, "titleRest": ", dirigido a ácaros", "desc": "Anti-ácaros e desbacterização são o mesmo tratamento. Indique o cuidado pretendido para receber uma proposta adequada."},
  {"titleGold": `${CHAIR_ANTI_MITE_UNIT_LABEL} Anti Ácaros`, "titleRest": ", com orçamento claro", "desc": "O extra não está incluído automaticamente na limpeza. Pode escolhê-lo ao configurar o artigo e confirmar o valor com a equipa."},
];

const CADEIRAS_FIXED_CROSSSELL: TrustPoint = { titleGold: 'Uma visita,', titleRest: ' vários estofos limpos', desc: 'Pode juntar outros artigos na mesma visita. O orçamento identifica os serviços, os descontos aplicáveis e a deslocação, que não recebe desconto.' };

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
  {
    "titleGold": "Resíduos nas fibras",
    "titleRest": " além da superfície",
    "desc": "O material, a base e a sujidade observada orientam a avaliação. Envie fotografias da frente e do verso do tapete."
  },
  {
    "titleGold": "Orçamento por peça",
    "titleRest": " com medidas e material",
    "desc": "Indique largura e comprimento de cada tapete. O valor é confirmado após avaliação, sem preço fixo por m²."
  },
  {
    "titleGold": "Pó e sujidade",
    "titleRest": " acumulados com o uso",
    "desc": "Aspiração e limpeza profissional têm funções distintas. O procedimento é escolhido após verificar as fibras, as cores e a base."
  },
  {
    "titleGold": "Odores no tapete",
    "titleRest": " avaliados pela origem",
    "desc": "Indique quando o odor começou e se houve derrames ou humidade. A avaliação define o que pode ser tratado, sem prometer remoção total."
  },
  {
    "titleGold": "Produtos já aplicados",
    "titleRest": " importam na avaliação",
    "desc": "Informe tentativas de limpeza anteriores. Essa informação ajuda a escolher o procedimento e a explicar eventuais limitações."
  }
];

const TAPETES_QUALIDADE_POOL: TrustPoint[] = [
  {
    "titleGold": "Aparência mais cuidada",
    "titleRest": " sem prometer restauro",
    "desc": "A limpeza trata sujidade e resíduos. Não repõe corantes perdidos nem repara desgaste permanente das fibras."
  },
  {
    "titleGold": "Secagem da limpeza",
    "titleRest": " dependente das condições",
    "desc": `${DRYING_PROMISE} Confirme quando pode voltar a usar o tapete.`
  },
  {
    "titleGold": "Cores e acabamento",
    "titleRest": " avaliados antes de limpar",
    "desc": "Verificamos a estabilidade das cores e as instruções do fabricante antes de escolher produtos e método."
  },
  {
    "titleGold": "Método adequado",
    "titleRest": " às fibras e à base",
    "desc": "Lã, seda, sisal e sintéticos podem exigir cuidados diferentes. A modalidade e a viabilidade do serviço são confirmadas após avaliação."
  },
  {
    "titleGold": "Peças delicadas",
    "titleRest": " com avaliação individual",
    "desc": "Mostre a etiqueta e o estado da peça. Quando adequado, testa-se numa zona discreta antes de avançar."
  }
];

const TAPETES_FIXED_CROSSSELL: TrustPoint = { titleGold: 'Uma visita,', titleRest: ' vários espaços tratados', desc: 'Pode juntar outros artigos na mesma visita. O orçamento identifica os serviços, os descontos aplicáveis e a deslocação, que não recebe desconto.' };

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
  {
    "titleGold": "Zonas de passagem",
    "titleRest": " com sujidade acumulada",
    "desc": "Entradas e corredores podem precisar de atenção localizada. Indique as faixas mais marcadas ao pedir o orçamento."
  },
  {
    "titleGold": "Áreas de trabalho",
    "titleRest": " preparadas para a visita",
    "desc": "Indique o mobiliário e as zonas acessíveis. Planeamos as áreas a tratar sem assumir que todos os móveis podem ser deslocados."
  },
  {
    "titleGold": "Margens e rodapés",
    "titleRest": " incluídos na avaliação",
    "desc": "Mostre linhas de pó nos limites da alcatifa. O acesso aos cantos é confirmado antes da intervenção."
  },
  {
    "titleGold": "Uso do espaço",
    "titleRest": " considerado no planeamento",
    "desc": "Informe os horários e as restrições de circulação. A organização da visita depende da disponibilidade confirmada."
  },
  {
    "titleGold": "Escadas e recortes",
    "titleRest": " medidos separadamente",
    "desc": "Indique degraus, corredores e áreas irregulares para preparar uma proposta adequada, sempre sob orçamento."
  }
];

const ALCATIFA_QUALIDADE_POOL: TrustPoint[] = [
  {
    "titleGold": "Sujidade e desgaste",
    "titleRest": " são situações diferentes",
    "desc": "A limpeza pode melhorar o aspeto ao remover resíduos, mas não repõe fibras gastas nem recupera cor perdida."
  },
  {
    "titleGold": "Secagem da limpeza",
    "titleRest": " com ventilação adequada",
    "desc": `${DRYING_PROMISE} Confirme a circulação e a recolocação dos móveis.`
  },
  {
    "titleGold": "Horário da intervenção",
    "titleRest": " combinado previamente",
    "desc": "Indique quando o espaço está disponível. A equipa confirma a possibilidade de execução e as condições de acesso."
  },
  {
    "titleGold": "Limpeza de resíduos",
    "titleRest": " sem tratamentos implícitos",
    "desc": "A limpeza não inclui automaticamente anti-ácaros ou desbacterização. Tratamentos adicionais são avaliados e orçamentados separadamente."
  },
  {
    "titleGold": "Instalação e fibras",
    "titleRest": " orientam o procedimento",
    "desc": "Avaliamos o tipo de revestimento, a base e a instalação para escolher o método e explicar limitações antes de executar."
  }
];

const ALCATIFA_FIXED_CROSSSELL: TrustPoint = { titleGold: 'Uma visita,', titleRest: ' todos os espaços tratados', desc: 'Pode juntar outros artigos na mesma visita. O orçamento identifica os serviços, os descontos aplicáveis e a deslocação, que não recebe desconto.' };

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
  { titleGold: `Premium desde ${formatEuro(SOFA_WATERPROOF_PREMIUM_FROM)},`, titleRest: ' proteja até 10 anos o seu sofá de linho', desc: 'A versão Premium cria uma barreira invisível que resiste a até 5 lavagens e pode ajudar a proteger o linho, com duração dependente do uso e da manutenção.' },
  { titleGold: `Premium desde ${formatEuro(SOFA_WATERPROOF_PREMIUM_FROM)},`, titleRest: ' proteja até 10 anos o seu sofá de veludo', desc: 'O veludo absorve líquidos em segundos e mancha com facilidade. A Premium cria uma barreira que repele manchas sem alterar o toque aveludado.' },
  { titleGold: `Premium desde ${formatEuro(SOFA_WATERPROOF_PREMIUM_FROM)},`, titleRest: ' proteja até 10 anos o seu sofá de chenille', desc: 'O chenille retém sujidade nas fibras entrelaçadas. A Premium ajuda a reduzir a absorção de derrames; a remoção deve ser imediata e conforme as instruções.' },
  { titleGold: `Premium desde ${formatEuro(SOFA_WATERPROOF_PREMIUM_FROM)},`, titleRest: ' proteja até 10 anos o seu sofá de algodão', desc: 'Tecidos de algodão absorvem manchas com muita facilidade. A Premium cria uma barreira invisível que ajuda a reduzir a absorção, mediante compatibilidade confirmada.' },
  { titleGold: `Premium desde ${formatEuro(SOFA_WATERPROOF_PREMIUM_FROM)},`, titleRest: ' proteja até 10 anos o seu sofá de bouclé', desc: 'A textura em laçada do bouclé retém sujidade nos relevos. A Premium protege sem esconder a textura nem alterar o aspeto do tecido.' },
];

const IMPERMEABILIZACAO_CADEIRA_POOL: TrustPoint[] = [
  { titleGold: 'Proteção Premium,', titleRest: ' até 10 anos para a sua cadeira de tecido', desc: 'Cadeiras de jantar recebem sumo, molho e gordura todos os dias. A Premium cria uma barreira que dá tempo a limpar antes de a mancha absorver.' },
  { titleGold: 'Proteção Premium,', titleRest: ' até 10 anos para a sua cadeira de veludo', desc: 'O veludo das cadeiras estofadas marca com facilidade. A Premium repele líquidos à superfície sem alterar o brilho nem o toque do tecido.' },
  { titleGold: 'Proteção Premium,', titleRest: ' até 10 anos para a sua cadeira de linho', desc: 'Linho claro mostra qualquer mancha de imediato. Com a Premium, derrames à mesa ficam à superfície, prontos a remover com um pano seco.' },
  { titleGold: 'Proteção Premium,', titleRest: ' até 10 anos para a sua cadeira de chenille', desc: 'As fibras entrelaçadas do chenille retêm sujidade nas costuras. A Premium cria uma barreira que ajuda a evitar que os líquidos sejam absorvidos tão rapidamente, sem dispensar cuidados imediatos.' },
  { titleGold: 'Proteção Premium,', titleRest: ' até 10 anos para a sua cadeira estofada', desc: 'Cadeiras de restaurante ou de uso diário sofrem o desgaste mais rápido de todos os estofos. A duração anunciada da Premium é até 10 anos, dependendo do uso e dos cuidados recomendados.' },
];

const IMPERMEABILIZACAO_FIXED_POINT3: TrustPoint = { titleGold: 'Combine com a limpeza', titleRest: ' num orçamento detalhado', desc: 'Pode juntar outros artigos na mesma visita. O orçamento identifica os serviços, os descontos aplicáveis e a deslocação, que não recebe desconto.' };

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
