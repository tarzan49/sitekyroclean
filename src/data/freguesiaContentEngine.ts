// ─── Dynamic Content Engine (Content Spintax) ────────────────────
// Generates unique, deterministic content for each freguesia page
// to eliminate duplicate content across ~800 pages.
// 
// Key principle: slug-based hash produces consistent output (Google sees
// the same content every crawl) but different across freguesias (>40% variation).

// ─── Hash / Seed ─────────────────────────────────────────────────

/** Deterministic seed from a string: same slug always returns same number */
export function getSeed(slug: string): number {
  return slug.split('').reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0);
}

/** Pick one item from an array using seed */
function pick<T>(arr: readonly T[], seed: number): T {
  return arr[seed % arr.length];
}

/** Pick N unique items from an array, deterministically */
function pickN<T>(arr: readonly T[], seed: number, n: number): T[] {
  const copy = [...arr];
  const result: T[] = [];
  let s = seed;
  for (let i = 0; i < Math.min(n, copy.length); i++) {
    const idx = s % copy.length;
    result.push(copy.splice(idx, 1)[0]);
    s = s * 31 + 7; // simple deterministic progression
  }
  return result;
}

// ─── Landmark Data ───────────────────────────────────────────────

export interface FreguesiaLocalData {
  landmarks: string[];
  localTip: string;
}

/** Local landmarks and tips per freguesia slug */
const freguesiaLocalData: Record<string, FreguesiaLocalData> = {
  // Porto
  "paranhos": { landmarks: ["Hospital de São João", "Universidade do Porto (Polo II)", "Parque da Cidade (zona norte)"], localTip: "Zona universitária com alta rotatividade de inquilinos: os estofos precisam de limpeza regular entre mudanças." },
  "ramalde": { landmarks: ["NorteShopping", "Pavilhão Rosa Mota", "Parque da Pasteleira"], localTip: "Bairro residencial com muitas famílias: sofás e colchões acumulam ácaros rapidamente." },
  "bonfim": { landmarks: ["Praça da Alegria", "Rua de Santa Catarina (zona alta)", "Jardim de São Lázaro"], localTip: "Uma das zonas mais antigas do Porto: edifícios com humidade exigem cuidados extra com mofo nos estofos." },
  "campanha": { landmarks: ["Estação de Campanhã", "Matadouro Municipal", "Parque Oriental"], localTip: "Zona em renovação urbana: muitos apartamentos renovados com estofos novos que beneficiam de impermeabilização preventiva." },
  "cedofeita": { landmarks: ["Rua de Cedofeita", "Jardim do Marquês", "Mercado do Bom Sucesso"], localTip: "Centro urbano denso com muitos apartamentos pequenos onde a limpeza ao domicílio é especialmente conveniente." },
  "lordelo-do-ouro": { landmarks: ["Parque da Cidade", "Museu de Serralves", "Avenida da Boavista"], localTip: "Zona premium com residências de alto padrão que exigem cuidados especializados com tecidos delicados." },
  "aldoar": { landmarks: ["Estádio do Bessa", "Parque da Cidade (zona sul)", "Aldoar (centro)"], localTip: "Área residencial tranquila, ideal para agendar limpezas ao domicílio com calma e sem pressa." },
  "foz-do-douro": { landmarks: ["Farol da Foz", "Praia do Molhe", "Jardim do Passeio Alegre"], localTip: "A brisa marítima traz sal e humidade: os estofos perto da costa acumulam mais salitre e necessitam de limpeza mais frequente." },
  "nevogilde": { landmarks: ["Praia de Nevogilde", "Avenida Marechal Gomes da Costa"], localTip: "Zona residencial exclusiva: os nossos técnicos estão habituados a trabalhar com tecidos premium e peles naturais." },
  "massarelos": { landmarks: ["Museu do Carro Eléctrico", "Cais das Pedras", "Jardim do Palácio de Cristal"], localTip: "Proximidade ao rio Douro aumenta a humidade interior: impermeabilização é especialmente recomendada." },
  "miragaia": { landmarks: ["Ponte da Arrábida", "Centro Histórico", "Alfândega do Porto"], localTip: "Edifícios históricos com pouca ventilação: a limpeza profunda ajuda a prevenir mofo e alergénios." },
  "santo-ildefonso": { landmarks: ["Rua de Santa Catarina", "Mercado do Bolhão", "Igreja de Santo Ildefonso"], localTip: "Zona comercial e residencial vibrante: limpamos estofos em apartamentos turísticos e residenciais." },
  "se": { landmarks: ["Sé Catedral do Porto", "Ponte D. Luís I", "Ribeira"], localTip: "Coração histórico do Porto: muitos alojamentos locais que precisam de limpeza profissional entre hóspedes." },
  "sao-nicolau": { landmarks: ["Ribeira do Porto", "Palácio da Bolsa", "Igreja de São Francisco"], localTip: "Zona turística com alto fluxo: os estofos de alojamento local beneficiam de higienização regular." },
  "vitoria": { landmarks: ["Torre dos Clérigos", "Livraria Lello", "Praça de Lisboa"], localTip: "No coração do Porto: acesso rápido e fácil para a nossa equipa chegar à sua porta." },
  // Matosinhos
  "matosinhos-centro": { landmarks: ["Porto de Leixões", "Praia de Matosinhos", "Mercado de Matosinhos"], localTip: "Ambiente costeiro com maresia: os estofos absorvem humidade e sal, tornando a limpeza periódica essencial." },
  "leca-da-palmeira": { landmarks: ["Piscina das Marés (Siza Vieira)", "Praia de Leça", "Farol de Leça"], localTip: "Zona costeira de referência: a maresia exige atenção extra à preservação dos tecidos." },
  "sao-mamede-de-infesta": { landmarks: ["Hospital Pedro Hispano", "Parque de Real"], localTip: "Bairro residencial com acesso fácil pelo Metro: agendamento flexível para a sua conveniência." },
  "senhora-da-hora": { landmarks: ["NorteShopping (proximidade)", "Parque de Quires"], localTip: "Zona central de Matosinhos com muitas famílias jovens: proteja os estofos dos mais pequenos." },
  "custoias": { landmarks: ["Igreja de Custóias", "zona residencial norte"], localTip: "Área tranquila e familiar: ideal para agendar a limpeza com tranquilidade." },
  "leca-do-balio": { landmarks: ["Mosteiro de Leça do Balio", "Ponte românica"], localTip: "Zona histórica com edifícios antigos: a humidade pode afetar os estofos, sendo a limpeza preventiva crucial." },
  "guifoes": { landmarks: ["Parque da Cidade de Matosinhos (zona norte)"], localTip: "Área residencial em crescimento: proteja os seus estofos novos com impermeabilização desde o primeiro dia." },
  "perafita": { landmarks: ["Zona Industrial de Perafita", "Praia de Angeiras"], localTip: "Entre a praia e a cidade: a brisa oceânica requer manutenção extra dos tecidos." },
  "lavra": { landmarks: ["Praia de Lavra", "Memória de Lavra"], localTip: "Zona costeira norte: os estofos perto do mar precisam de atenção especial contra a humidade." },
  "santa-cruz-do-bispo": { landmarks: ["Mosteiro de Santa Cruz do Bispo"], localTip: "Comunidade tranquila: agende a sua limpeza ao domicílio com toda a calma." },
  // Maia
  "cidade-da-maia": { landmarks: ["Câmara Municipal da Maia", "Fórum da Maia", "Zoo da Maia"], localTip: "Centro urbano com muitas famílias: a limpeza regular protege a saúde de crianças e animais." },
  "aguas-santas": { landmarks: ["Estação de Metro de Águas Santas", "Parque da Quinta do Engenho Novo"], localTip: "Excelente acessibilidade via Metro: fácil coordenar a limpeza com a sua rotina." },
  "castelo-da-maia": { landmarks: ["Castêlo da Maia (centro)", "zona residencial moderna"], localTip: "Zona residencial moderna com condomínios novos: impermeabilize para proteger o investimento." },
  "moreira-maia": { landmarks: ["Aeroporto do Porto (proximidade)", "Centro de Moreira"], localTip: "Perto do aeroporto: limpamos também estofos de espaços de alojamento local e Airbnb." },
  "nogueira-maia": { landmarks: ["Zona rural da Maia", "Igreja de Nogueira"], localTip: "Área mais rural e verde: o pólen e humidade naturais tornam a limpeza periódica importante." },
  "silva-escura": { landmarks: ["Parque de Avioso", "zona semi-rural"], localTip: "Zona tranquila e acolhedora: sem pressa, trabalhamos com atenção ao detalhe." },
  "folgosa-maia": { landmarks: ["Igreja de Folgosa", "zona florestal"], localTip: "Rodeada de natureza: o ambiente húmido requer cuidados especiais com estofos." },
  "vila-nova-da-telha": { landmarks: ["Zona industrial e residencial"], localTip: "Área em expansão: novos lares merecem estofos protegidos desde o início." },
  "milheiros": { landmarks: ["Centro de Milheirós", "Parque Local"], localTip: "Bairro familiar e acessível: facilitamos o agendamento ao fim-de-semana." },
  "vermoim": { landmarks: ["Vermoim centro", "zona residencial consolidada"], localTip: "Zona residencial estável: mantenha os seus estofos em perfeitas condições com limpeza anual." },
  // Vila Nova de Gaia
  "mafamude": { landmarks: ["Câmara Municipal de Gaia", "Auditório de Gaia", "El Corte Inglés"], localTip: "Centro de Gaia com grande densidade populacional: serviço rápido ao domicílio sem complicações." },
  "santa-marinha": { landmarks: ["Caves do Vinho do Porto", "Cais de Gaia", "Teleférico de Gaia"], localTip: "Zona turística e residencial junto ao rio: a humidade do Douro exige atenção especial aos estofos." },
  "afurada": { landmarks: ["Aldeia Piscatória da Afurada", "Restaurantes à beira-rio"], localTip: "Aldeia costeira com carácter próprio: cuidamos dos estofos de residências e restaurantes." },
  "canidelo": { landmarks: ["Praia de Canidelo", "Reserva Natural do Estuário do Douro"], localTip: "Entre o rio e o mar: os tecidos sofrem mais com a humidade e sal nesta localização." },
  "madalena": { landmarks: ["Praia da Madalena", "Marginal de Gaia"], localTip: "Zona costeira procurada por famílias: proteja os estofos da humidade marítima." },
  "valadares": { landmarks: ["Praia de Valadares", "zona residencial sul"], localTip: "Área residencial junto à praia: a maresia exige manutenção regular dos tecidos." },
  "gulpilhares": { landmarks: ["Praia de Gulpilhares", "zona sul de Gaia"], localTip: "Zona costeira tranquila: ideal para agendar uma limpeza profunda sem pressas." },
  "arcozelo": { landmarks: ["Praia de Arcozelo", "zona rural-costeira"], localTip: "Entre campo e mar: os estofos precisam de cuidados contra humidade e pólen." },
  "sao-felix-da-marinha": { landmarks: ["Praia de São Félix", "zona sul de Gaia"], localTip: "Limite sul de Gaia: garantimos cobertura total mesmo nas zonas mais afastadas." },
  "oliveira-do-douro": { landmarks: ["Ponte do Freixo (proximidade)", "zona interior de Gaia"], localTip: "Zona residencial consolidada: a maioria dos clientes opta pelo pack limpeza + impermeabilização." },
  "vilar-do-paraiso": { landmarks: ["Centro de Vilar do Paraíso", "Conservatório de Música"], localTip: "Zona residencial familiar: limpamos sofás, colchões e tapetes num único agendamento." },
  "vilar-de-andorinho": { landmarks: ["Barragem do Crestuma-Lever (proximidade)"], localTip: "Área verde e residencial: o ambiente húmido torna a impermeabilização especialmente recomendada." },
  "avintes": { landmarks: ["Castelo de Avintes", "zona ribeirinha"], localTip: "Junto ao rio: proteja os seus estofos da humidade constante com impermeabilização profissional." },
  "canelas": { landmarks: ["Centro de Canelas", "zona residencial"], localTip: "Zona em crescimento: aproveite para proteger estofos novos com os nossos packs." },
  "pedroso": { landmarks: ["Centro de Pedroso", "Floresta de Pedroso"], localTip: "Rodeada de verde: o pólen e a humidade acumulam-se nos estofos sem que se note." },
  "serzedo": { landmarks: ["Centro de Serzedo"], localTip: "Zona interior tranquila: dedicamos tempo e atenção a cada peça." },
  "perosinho": { landmarks: ["Centro de Perosinho"], localTip: "Comunidade acolhedora: os nossos técnicos tratam cada casa como se fosse a sua." },
  "grijo": { landmarks: ["Mosteiro de Grijó", "zona semi-rural"], localTip: "Zona histórica e verde: edifícios antigos beneficiam de limpeza e higienização profunda." },
  "sermonde": { landmarks: ["Centro de Sermonde"], localTip: "Zona rural de Gaia: garantimos deslocação sem custos adicionais." },
  // Gondomar
  "rio-tinto": { landmarks: ["Estação de Metro de Rio Tinto", "Centro de Rio Tinto"], localTip: "Um dos pontos mais acessíveis de Gondomar via Metro: facilitamos o agendamento." },
  "baguim-do-monte": { landmarks: ["Centro de Baguim do Monte", "zona residencial"], localTip: "Zona residencial próxima do Porto: beneficie dos mesmos preços sem custos extra." },
  "fanzeres": { landmarks: ["Centro de Fânzeres", "zona leste de Gondomar"], localTip: "Área familiar: os nossos produtos são 100% seguros para crianças e animais." },
  "sao-pedro-da-cova": { landmarks: ["Minas de São Pedro da Cova", "Museu Mineiro"], localTip: "Zona histórica mineira: a poeira mineral exige uma limpeza mais profunda dos estofos." },
  "valbom": { landmarks: ["Marina de Valbom", "Jardins de Valbom"], localTip: "Junto ao rio Douro: a humidade fluvial exige manutenção regular dos tecidos." },
  "gondomar-centro": { landmarks: ["Câmara Municipal de Gondomar", "Ourivesaria de Gondomar"], localTip: "Centro do concelho: fácil acesso para a nossa equipa." },
  "jovim": { landmarks: ["Zona ribeirinha de Jovim", "Área verde"], localTip: "Zona verde junto ao Douro: ambiente húmido que pede cuidados extra." },
  "foz-do-sousa": { landmarks: ["Rio Sousa", "zona florestal"], localTip: "Rodeada de natureza: ideal para quem valoriza um lar fresco e higienizado." },
  "lomba": { landmarks: ["Serra de Santa Justa (proximidade)"], localTip: "Zona mais elevada e ventilada: mesmo assim, os ácaros estão por toda a parte." },
  "covelo": { landmarks: ["Zona rural de Gondomar"], localTip: "Zona tranquila e verde: garantimos pontualidade e profissionalismo." },
  "melres": { landmarks: ["Margem do Douro", "zona rural leste"], localTip: "Junto ao Douro: a humidade constante torna a impermeabilização essencial." },
  "medas": { landmarks: ["Centro de Medas", "zona interior"], localTip: "Uma das zonas mais interiores do concelho: a nossa equipa chega a toda a parte." },
  // Valongo
  "valongo-centro": { landmarks: ["Câmara Municipal de Valongo", "Serra de Santa Justa"], localTip: "Centro de Valongo: acesso fácil e rápido para a nossa equipa." },
  "ermesinde": { landmarks: ["Estação de Ermesinde", "Centro Comercial de Ermesinde"], localTip: "Zona urbana densamente povoada: muitas famílias a precisar de limpeza regular de estofos." },
  "alfena": { landmarks: ["Centro de Alfena", "Parques locais"], localTip: "Zona residencial em crescimento: novos moradores, novos estofos para proteger." },
  "campo-valongo": { landmarks: ["Estação de Campo", "Serras de Valongo"], localTip: "Zona semi-rural entre serras: a natureza traz pólen que se acumula nos estofos." },
  "sobrado-valongo": { landmarks: ["Centro de Sobrado", "zona leste de Valongo"], localTip: "Zona tranquila e familiar: sem custos de deslocação adicionais." },
};

// Fallback for freguesias without specific landmark data
function getDefaultLocalData(freguesia: string, municipio: string): FreguesiaLocalData {
  return {
    landmarks: [`Centro de ${freguesia}`, `Zona residencial de ${freguesia}`],
    localTip: `Em ${freguesia}, ${municipio}, garantimos o mesmo serviço profissional com equipamento de extração profissional.`,
  };
}

export function getLocalData(slug: string, freguesia: string, municipio: string): FreguesiaLocalData {
  return freguesiaLocalData[slug] || getDefaultLocalData(freguesia, municipio);
}

// ─── Intro Templates (>40% variation) ────────────────────────────

type ContentTemplate = (f: string, c: string, svc: string, price: string) => string;

const introTemplates: ContentTemplate[] = [
  (f, c, svc, price) =>
    `Procura ${svc.toLowerCase()} profissional em ${f}, ${c}? A Kyro Clean Solutions presta serviços ao domicílio com equipamento de extração profissional. Resultados visíveis no momento, desde ${price}.`,
  (f, c, svc, price) =>
    `A Kyro Clean Solutions é a escolha de referência em ${f} para ${svc.toLowerCase()}. Utilizamos tecnologia de extração profissional com água quente em toda a zona de ${c}. Serviço desde ${price}.`,
  (f, c, svc, price) =>
    `Em ${f}, a proximidade urbana e o ritmo do dia-a-dia fazem com que os estofos acumulem sujidade invisível. A Kyro Clean Solutions oferece ${svc.toLowerCase()} profissional em ${c} com resultados no próprio dia, desde ${price}.`,
  (f, c, svc, price) =>
    `Diga adeus às manchas e odores em ${f}. A Kyro Clean Solutions disponibiliza o serviço mais completo de ${svc.toLowerCase()} em ${c}, com equipamento profissional e produtos certificados. Desde ${price}.`,
  (f, c, svc, price) =>
    `Residentes de ${f} já confiam na Kyro Clean Solutions para ${svc.toLowerCase()} ao domicílio. Deslocamo-nos a qualquer zona de ${c} com equipamento de extração profissional. Preços desde ${price}.`,
  (f, c, svc, price) =>
    `Precisa de ${svc.toLowerCase()} em ${f}? A nossa equipa especializada cobre toda a zona de ${c} com um serviço rápido, eficaz e sem complicações. Higienização profissional desde ${price}.`,
  (f, c, svc, price) =>
    `Em ${f}, ${c}, os estofos merecem cuidados profissionais. A Kyro Clean Solutions utiliza extração profissional a quente para remover manchas, ácaros e odores. Desde ${price} ao domicílio.`,
  (f, c, svc, price) =>
    `A limpeza caseira não é suficiente para eliminar ácaros e bactérias dos seus estofos em ${f}. A Kyro Clean Solutions garante uma higienização profunda em ${c}, desde ${price}.`,
];

// ─── How It Works Templates ──────────────────────────────────────

const howItWorksTemplates: ContentTemplate[] = [
  (f, c, svc) =>
    `O nosso serviço em ${f} segue um processo profissional: inspeção do tecido, pré-tratamento de manchas, extração profunda com água quente e secagem rápida. Trabalhamos ao domicílio para maior comodidade.`,
  (f, c, svc) =>
    `Em ${f}, o processo é simples: 1) Inspecionamos o estado dos estofos; 2) Aplicamos pré-tratamento específico nas manchas; 3) Realizamos a extração profissional profunda; 4) Garantimos secagem rápida. Tudo na sua casa em ${c}.`,
  (f, c, svc) =>
    `Na sua casa em ${f}, começamos por avaliar o tipo de tecido e o grau de sujidade. Depois, aplicamos o tratamento mais adequado com extração profissional a quente. O resultado é imediato e os estofos ficam prontos em poucas horas.`,
  (f, c, svc) =>
    `O nosso processo de ${svc.toLowerCase()} em ${f} é pensado para minimizar a interrupção da sua rotina. Chegamos, inspecionamos, tratamos e entregamos: tudo num único agendamento, sem necessidade de transportar os seus estofos.`,
  (f, c, svc) =>
    `Quando visitamos a sua casa em ${f}, ${c}, trazemos todo o equipamento necessário. Não precisa de preparar nada. O processo dura entre 1 a 3 horas e os estofos ficam prontos a usar no mesmo dia.`,
];

// ─── Problem Templates ───────────────────────────────────────────

interface ProblemSet {
  title: string;
  description: (f: string) => string;
}

const problemPool: ProblemSet[] = [
  { title: "Manchas difíceis", description: (f) => `Removemos manchas de café, vinho, gordura e outros líquidos em ${f}.` },
  { title: "Ácaros e alergénios", description: (f) => `Eliminação de ácaros e bactérias com extração profunda em ${f}.` },
  { title: "Odores persistentes", description: (f) => `Remoção de cheiros de animais, humidade e tabaco dos seus estofos em ${f}.` },
  { title: "Desgaste e sujidade acumulada", description: (f) => `Devolvemos a cor e textura original aos seus estofos em ${f}.` },
  { title: "Pêlos de animais de estimação", description: (f) => `Extração profunda de pêlos, caspa animal e alergénios em ${f}.` },
  { title: "Humidade e mofo", description: (f) => `Tratamento profissional contra humidade e início de mofo nos tecidos em ${f}.` },
  { title: "Sujidade invisível", description: (f) => `Os estofos acumulam pó, ácaros e bactérias que não se veem a olho nu. Limpamos a fundo em ${f}.` },
  { title: "Manchas de crianças", description: (f) => `Derrames de sumos, comida e marcas de brincadeira: tratamos tudo com produtos seguros em ${f}.` },
];

// ─── Benefit Templates ───────────────────────────────────────────

const benefitPool: string[] = [
  "Serviço ao domicílio sem necessidade de transporte",
  "Equipamento profissional de extração certificado",
  "Produtos certificados, seguros para crianças e animais",
  "Resultados visíveis no momento",
  "Orçamento gratuito sem compromisso",
  "Secagem rápida: estofos prontos em poucas horas",
  "Técnicos certificados com experiência comprovada",
  "Eliminação de 99% dos ácaros e bactérias",
  "Atendimento personalizado para cada tipo de tecido",
  "Sem custos de deslocação na maioria das zonas",
  "Agendamento flexível incluindo fins-de-semana",
  "Garantia de satisfação ou repetimos o serviço",
];

// ─── FAQ Pool (10 templates, each page selects 4) ────────────────

interface FAQTemplate {
  question: (svc: string, f: string) => string;
  answer: (svc: string, f: string, price: string, c: string) => string;
}

const faqPool: FAQTemplate[] = [
  {
    question: (svc, f) => `Quanto custa ${svc.toLowerCase()} em ${f}?`,
    answer: (svc, f, price) => `O preço de ${svc.toLowerCase()} em ${f} começa a partir de ${price}. O valor final depende do tamanho e estado da peça. Peça o seu orçamento gratuito.`,
  },
  {
    question: (svc, f) => `Fazem ${svc.toLowerCase()} ao domicílio em ${f}?`,
    answer: (svc, f, price, c) => `Sim, deslocamo-nos a ${f}, ${c} para realizar o serviço no conforto da sua casa. Sem custos de deslocação para a maioria das zonas.`,
  },
  {
    question: (svc, f) => `Quanto tempo demora o serviço em ${f}?`,
    answer: () => `O serviço demora entre 1 a 3 horas, dependendo do tamanho e estado da peça. Os estofos ficam prontos a usar em 4-6 horas.`,
  },
  {
    question: () => `A limpeza remove manchas e odores?`,
    answer: () => `Sim, o nosso processo de extração profunda remove manchas difíceis e elimina odores de animais, humidade e tabaco.`,
  },
  {
    question: () => `Os produtos utilizados são seguros para crianças e animais?`,
    answer: () => `Sim, utilizamos exclusivamente produtos certificados e hipoalergénicos, 100% seguros para crianças, bebés e animais de estimação.`,
  },
  {
    question: (svc, f) => `Trabalham aos fins-de-semana em ${f}?`,
    answer: (svc, f, price, c) => `Sim, temos agendamento disponível de segunda a sábado em ${f} e em todo o ${c}. Consulte disponibilidade ao contactar-nos.`,
  },
  {
    question: () => `A impermeabilização está incluída no serviço?`,
    answer: () => `A impermeabilização é um serviço adicional altamente recomendado. Protege os seus estofos contra futuras manchas e líquidos por vários anos. Podemos adicionar ao orçamento.`,
  },
  {
    question: () => `Que equipamento utilizam na limpeza?`,
    answer: () => `Utilizamos equipamento profissional de extração com água quente, o mais avançado do mercado. Este sistema remove a sujidade das fibras profundas que a aspiração normal não alcança.`,
  },
  {
    question: (svc, f) => `Preciso de preparar alguma coisa antes da limpeza em ${f}?`,
    answer: () => `Não é necessário preparar nada de especial. Apenas recomendamos retirar almofadas decorativas e objetos pessoais de cima dos estofos. A nossa equipa trata de tudo o resto.`,
  },
  {
    question: () => `Fazem limpeza de vários estofos no mesmo dia?`,
    answer: () => `Sim, e é até recomendado! Ao agendar a limpeza de sofá, colchão e tapetes no mesmo dia, beneficia de um melhor preço por peça e poupa tempo.`,
  },
];

// ─── Meta Description Templates ──────────────────────────────────

const metaDescTemplates: Array<(svc: string, f: string, c: string, price: string) => string> = [
  (svc, f, c, price) => `${svc} profissional em ${f}, ${c}. Ao domicílio com resultados visíveis. Desde ${price}. Orçamento grátis.`,
  (svc, f, c, price) => `${svc} em ${f}, ${c}. Remoção de manchas, ácaros e odores ao domicílio. Desde ${price}. Peça orçamento gratuito.`,
  (svc, f, c, price) => `Serviço profissional de ${svc.toLowerCase()} em ${f}. Equipamento de extração profissional. Desde ${price} em ${c}.`,
  (svc, f, c, price) => `${svc} ao domicílio em ${f}, ${c}. Técnicos certificados, produtos certificados. Desde ${price}. Orçamento grátis.`,
];

// ─── Main Generator ──────────────────────────────────────────────

export interface DynamicFreguesiaContent {
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  localSection: string;
  problems: { title: string; description: string }[];
  howItWorks: string;
  benefits: string[];
  faqs: { question: string; answer: string }[];
}

export function getDynamicContent(
  serviceName: string,
  serviceSlug: string,
  priceFrom: string,
  freguesiaName: string,
  freguesiaSlug: string,
  municipio: string,
): DynamicFreguesiaContent {
  const seed = getSeed(`${serviceSlug}-${freguesiaSlug}`);
  const localData = getLocalData(freguesiaSlug, freguesiaName, municipio);

  // Intro: select from 8 templates
  const intro = pick(introTemplates, seed)(freguesiaName, municipio, serviceName, priceFrom);

  // Meta description: select from 4 templates
  const metaDescription = pick(metaDescTemplates, seed + 3)(serviceName, freguesiaName, municipio, priceFrom);

  // How it works: select from 5 templates
  const howItWorks = pick(howItWorksTemplates, seed + 7)(freguesiaName, municipio, serviceName, priceFrom);

  // Problems: select 4 from 8
  const selectedProblems = pickN(problemPool, seed + 11, 4).map(p => ({
    title: p.title,
    description: p.description(freguesiaName),
  }));

  // Benefits: select 6 from 12, always include coverage line
  const coverageBenefit = `Cobertura em toda a zona de ${freguesiaName} e ${municipio}`;
  const otherBenefits = pickN(benefitPool, seed + 13, 5);
  const benefits = [...otherBenefits, coverageBenefit];

  // FAQs: select 4 from 10
  const selectedFaqs = pickN(faqPool, seed + 17, 4).map(faq => ({
    question: faq.question(serviceName, freguesiaName),
    answer: faq.answer(serviceName, freguesiaName, priceFrom, municipio),
  }));

  // Local section text with landmarks
  const landmarkList = localData.landmarks.join(', ');
  const localSection = `Prestamos serviço em ${freguesiaName}, perto de ${landmarkList}. ${localData.localTip}`;

  return {
    title: `${serviceName} em ${freguesiaName}, ${municipio} | Desde ${priceFrom} | Kyro Clean Solutions`,
    metaDescription,
    h1: `${serviceName} em ${freguesiaName}`,
    intro: `${intro} ${localSection}`,
    localSection,
    problems: selectedProblems,
    howItWorks,
    benefits,
    faqs: selectedFaqs,
  };
}
