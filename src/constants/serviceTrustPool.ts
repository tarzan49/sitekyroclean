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
  { titleGold: 'A partir de 20€ Anti Ácaros', titleRest: ' que elimina os ácaros do sofá', desc: 'Um sofá usado há 3 anos pode albergar até 15 milhões de ácaros, mais do que um colchão da mesma idade, porque não tem a proteção da roupa lavada semanalmente. Peça o tratamento Anti Ácaros já nesta visita e previna alergias e problemas respiratórios.' },
  { titleGold: 'A partir de 20€ Anti Ácaros', titleRest: ' para acabar com os espirros no sofá', desc: 'Pode ser sinal de ácaros acumulados nas fibras. O tratamento Anti Ácaros elimina-os e reduz sintomas de alergia respiratória em quem usa o sofá todos os dias.' },
  { titleGold: 'A partir de 20€ Anti Ácaros', titleRest: ' para proteger bebés e crianças', desc: 'A pele sensível reage mais facilmente a ácaros e alergénios acumulados no estofo. O Anti Ácaros elimina-os sem químicos agressivos, seguro para toda a família.' },
  { titleGold: 'A partir de 20€ Anti Ácaros', titleRest: ': o sofá tem o dobro dos ácaros da cama', desc: 'O sofá nunca é lavado como os lençóis e recebe uso diário de várias pessoas. Peça o Anti Ácaros na mesma visita da limpeza e elimine o problema de vez.' },
  { titleGold: 'A partir de 20€ Anti Ácaros', titleRest: ' que trata a causa, não só o sintoma', desc: 'Ácaros e os seus resíduos ficam presos nas fibras mesmo após a aspiração. O tratamento Anti Ácaros vai à raiz do problema.' },
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
  { titleGold: 'A partir de 25€ Anti Ácaros', titleRest: ', sem marcar outra visita', desc: 'O tratamento Anti Ácaros elimina os ácaros do colchão e impede que voltem a aparecer, na mesma visita, sem marcar outro dia.' },
  { titleGold: 'A partir de 25€ Anti Ácaros', titleRest: ' para dormir muito melhor', desc: 'Alta concentração de ácaros pode reduzir a qualidade do sono em até 40%, mesmo sem sintomas visíveis, comprovado em estudos de polissonografia. Peça o Anti Ácaros e durma melhor já esta noite.' },
  { titleGold: 'A partir de 25€ Anti Ácaros', titleRest: ' que elimina milhões de ácaros do colchão', desc: 'Um colchão de 5 anos pode ter o peso original em matéria orgânica acumulada. Adicione o Anti Ácaros à limpeza e elimine o problema, não só a sujidade à superfície.' },
  { titleGold: 'A partir de 25€ Anti Ácaros', titleRest: ' para proteger as crianças', desc: 'O sistema imunitário ainda em desenvolvimento reage mais a ácaros e alergénios. O Anti Ácaros trata o colchão sem químicos agressivos.' },
  { titleGold: 'A partir de 25€ Anti Ácaros', titleRest: ' que elimina e impede que voltem', desc: 'A limpeza normal remove o que já lá está. O Anti Ácaros vai mais longe: cria condições que impedem a repopulação nos meses seguintes.' },
];

// Intercala estudo/facto com o convite ao Pack Família (índices alternados
// por construção, a seed decide qual dos 4 aparece em cada página).
const COLCHAO_POINT3_POOL: TrustPoint[] = [
  { stat: '80%', titleGold: 'Redução de 80%', titleRest: ' dos episódios de rinite', desc: 'Estudo publicado no Journal of Allergy documenta redução de 80% nos sintomas após higienização profissional do colchão.' },
  { titleGold: 'Sofá ou tapete', titleRest: ' na mesma visita?', desc: 'Peça o colchão e outro estofo no mesmo agendamento: o técnico já está em sua casa e o desconto aplica-se a tudo.' },
  { stat: '23%', titleGold: 'Colchões causam 23%', titleRest: ' das alergias respiratórias crónicas', desc: 'São causadas ou agravadas por fungos e bactérias em colchões, segundo estudos do European Journal of Allergy.' },
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
  { titleGold: 'A partir de 7,5€ Anti Ácaros', titleRest: ' que elimina as bactérias da cadeira', desc: 'As zonas de contacto de cadeiras de jantar podem ter até 400× mais bactérias do que uma sanita, das superfícies mais contaminadas de uma casa. Peça o tratamento Anti Ácaros já nesta visita.' },
  { titleGold: 'A partir de 7,5€ Anti Ácaros', titleRest: ' para acabar com os espirros à mesa', desc: 'Pode ser sinal de ácaros acumulados no estofo da cadeira. O tratamento Anti Ácaros elimina-os e reduz sintomas de alergia respiratória em quem usa a cadeira todos os dias.' },
  { titleGold: 'A partir de 7,5€ Anti Ácaros', titleRest: ' para proteger bebés e crianças', desc: 'A pele sensível reage mais facilmente a ácaros e alergénios acumulados no estofo. O Anti Ácaros elimina-os sem químicos agressivos, seguro para toda a família.' },
  { titleGold: 'A partir de 7,5€ Anti Ácaros', titleRest: ': as costuras têm 6× mais gordura', desc: 'A gordura corporal e restos alimentares acumulam-se nas costuras e dobras, invisíveis, mas presentes em cada refeição. O Anti Ácaros trata a fundo.' },
  { titleGold: 'A partir de 7,5€ Anti Ácaros', titleRest: ' que trata a causa, não só o sintoma', desc: 'Ácaros e os seus resíduos ficam presos nas fibras mesmo após a aspiração. O tratamento Anti Ácaros vai à raiz do problema.' },
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
// de upsell: 1º = "a partir de" + preço base de higienização (não há addon,
// mas segue a mesma convenção de preço+produto do resto do site), 2º =
// info de qualidade/confiança que convença o cliente a limpar (sem preço).
// 3º fixo (Pack Família) — 2026-08-31, títulos revistos 2026-09-01.
const TAPETES_PROBLEMA_POOL: TrustPoint[] = [
  { titleGold: 'A partir de 15€/m² Higienização de Tapetes', titleRest: ' que elimina alergénios invisíveis', desc: 'Tapetes retêm e libertam no ar partículas a cada passo: pólenes, ácaros e poluentes invisíveis, até 8× mais que um pavimento liso. A higienização profissional remove o que a aspiração doméstica nunca chega.' },
  { titleGold: 'A partir de 15€/m² Higienização de Tapetes', titleRest: ' que elimina bactérias que a aspiração não apanha', desc: 'Um tapete de uso doméstico pode conter até 4.000 vezes mais bactérias por cm² do que a sanita. Não é visível, mas está lá, a cada passo descalço.' },
  { titleGold: 'A partir de 15€/m² Higienização de Tapetes', titleRest: ' que remove o pó acumulado há meses', desc: 'Um tapete médio acumula até 2 kg de matéria orgânica, pó e resíduos por metro quadrado ao longo de 12 meses, mesmo com aspiração regular.' },
  { titleGold: 'A partir de 15€/m² Higienização de Tapetes', titleRest: ' que remove odores que a aspiração nunca tira', desc: 'Suor, animais de estimação e humidade ficam retidos nas fibras profundas do tapete. Só a extração profissional a quente remove o odor pela raiz, não só à superfície.' },
  { titleGold: 'A partir de 15€/m² Higienização de Tapetes', titleRest: ' para aliviar alergias em casa', desc: 'Espirros e olhos irritados em casa podem vir do tapete, não do ar exterior. Fibras densas acumulam ácaros e pólen que a ventilação normal não remove.' },
];

const TAPETES_QUALIDADE_POOL: TrustPoint[] = [
  { titleGold: 'Aparência renovada', titleRest: ' sem substituir o tapete', desc: 'Tapetes considerados "inutilizáveis" ficam como novos com extração profissional a quente, recuperando até 90% da aparência original. Sem gastar em tapete novo.' },
  { titleGold: 'Pronto a usar', titleRest: ' em poucas horas', desc: 'O nosso equipamento de alta extração minimiza a humidade residual. Em condições normais de ventilação, o tapete está pronto a pisar em 2 a 4 horas.' },
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

/** Pontos de confiança para sofá/colchão/cadeiras (pools com variedade — ver
 *  acima). `seed` deve identificar a página de forma estável (ex: serviço+
 *  variante+cidade/freguesia) para que a mesma página mostre sempre o mesmo
 *  conteúdo. */
export function getTrustPointsForSeed(serviceSlug: string, seed: string): TrustPoint[] | null {
  if (serviceSlug === 'limpeza-sofas') return getSofaTrustPoints(seed);
  if (serviceSlug === 'limpeza-colchoes') return getColchaoTrustPoints(seed);
  if (serviceSlug === 'limpeza-cadeiras') return getCadeirasTrustPoints(seed);
  if (serviceSlug === 'limpeza-tapetes') return getTapetesTrustPoints(seed);
  return null;
}

/**
 * 3 variantes por serviço — cada tipo de página usa uma variante diferente:
 * [0] = páginas genéricas (/limpeza-sofas)
 * [1] = páginas localidade×serviço (/limpeza-sofas-porto)
 * [2] = páginas freguesia×serviço + keyword variants
 *
 * Sofá, colchão, cadeiras e tapetes já não usam isto (ver
 * getTrustPointsForSeed acima) — os restantes serviços (alcatifas,
 * impermeabilização) ainda usam o sistema de 3 variantes fixas, a rever
 * depois.
 *
 * Em cada variante, um dos 3 pontos foi escrito para puxar para o upsell/Pack
 * Família (mesma visita, mais um estofo, desconto de pack) em vez de só justificar
 * o serviço em si — pedido explícito 2026-08-30: a informação à esquerda do
 * orçamento deve também incentivar o upsell, não só suportar a limpeza isolada.
 */
export const SERVICE_TRUST_POOL: Record<string, TrustPoint[][]> = {

  'limpeza-alcatifas': [
    // Variante 0
    [
      { stat: '1 kg/m²', titleGold: 'Sujidade invisível', titleRest: ' acumulada em cada m²', desc: 'Fibras compactadas retêm o que não se vê mas que respira todos os dias.' },
      { stat: '2,5×', titleGold: 'Pior qualidade do ar', titleRest: ' sem limpeza regular', desc: 'Alcatifas sem manutenção anual degradam significativamente o ar interior, crítico em escritórios e quartos.' },
      { titleGold: 'Aproveite a visita', titleRest: ' para mais um espaço', desc: 'O técnico já está em sua casa: junte sofás, cadeiras ou tapetes na mesma visita e poupe na deslocação.' },
    ],
    // Variante 1
    [
      { stat: '10×', titleGold: '10× mais poluentes', titleRest: ' retidos do que no ar', desc: 'Fibras densas de alcatifa retêm compostos orgânicos voláteis, poluentes e toxinas que ventilação normal não remove.' },
      { titleGold: 'Pack Família', titleRest: ' poupa até 10%', desc: 'Combine a alcatifa com outro serviço na mesma visita (sofá, tapete, cadeiras) e o desconto aplica-se a tudo.' },
      { stat: '85%', titleGold: '85% da tonalidade', titleRest: ' original recuperada', desc: 'Alcatifas consideradas descoloradas ou gastas recuperam até 85% da cor original com extração profissional a quente.' },
    ],
    // Variante 2
    [
      { stat: '1.000', titleGold: '1.000 pessoas/dia', titleRest: ' em zonas comerciais', desc: 'Uma alcatifa de escritório com 1.000 passagens por dia requer limpeza profissional bimestral para manter condições de higiene.' },
      { stat: '5×', titleGold: '5× mais sujidade', titleRest: ' nas zonas de passagem', desc: 'Os corredores e entradas acumulam 5× mais sujidade por cm² do que zonas estáticas, e são as mais negligenciadas.' },
      { titleGold: 'Uma visita,', titleRest: ' todos os espaços tratados', desc: 'Sofás, tapetes ou cadeiras na mesma visita da alcatifa: um único agendamento, desconto de pack incluído.' },
    ],
  ],

  'impermeabilizacao': [
    // Variante 0
    [
      { stat: '60s', titleGold: '60 segundos', titleRest: ' para uma mancha ficar permanente', desc: 'Sem proteção, o tecido absorve o vinho em menos de 60 segundos. Com nano-barreira, rola para o chão.' },
      { stat: '10⁻⁹m', titleGold: 'Proteção molecular', titleRest: ' a nível nanométrico', desc: 'Nano-partículas criam uma barreira a nível molecular invisível ao toque, não altera cor, textura nem respirabilidade.' },
      { titleGold: 'Combine com a limpeza', titleRest: ' e poupe', desc: 'Peça a impermeabilização junto com a limpeza profunda: o Pack Proteção Total tem desconto sobre os dois serviços em separado.' },
    ],
    // Variante 1
    [
      { stat: '78%', titleGold: '78% nunca', titleRest: ' impermeabilizou o sofá', desc: 'E 62% desses acabou a substituir o estofo prematuramente. A impermeabilização é o seguro que ninguém contrata antes de precisar.' },
      { stat: '24h', titleGold: 'Barreira ativa', titleRest: ' 24h após a aplicação', desc: 'A nano-barreira cura em 24 horas à temperatura ambiente. A partir daí, protege contra suor, oleosidade e corantes.' },
      { titleGold: 'Pack Proteção Total', titleRest: ' poupa mais', desc: 'Combine a impermeabilização com a limpeza profunda no mesmo agendamento e o desconto aplica-se aos dois serviços.' },
    ],
    // Variante 2
    [
      { stat: '3×', titleGold: '3× mais proteção', titleRest: ' combinado com a limpeza', desc: 'Impermeabilizar sobre tecido limpo aumenta a eficácia da barreira em 3× comparado com aplicação sobre sujidade acumulada.' },
      { stat: '3×', titleGold: '3× mais tempo', titleRest: ' a manter a cor original', desc: 'Tecidos impermeabilizados resistem ao desbotamento por UV e manchas de oleosidade, mantendo a cor original até 3× mais tempo.' },
      { titleGold: 'Menos de 1€', titleRest: ' por semana', desc: 'O custo anual de impermeabilização equivale a menos de 1€ por semana, e evita uma substituição que custa 10× mais.' },
    ],
  ],
};
