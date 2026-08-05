// Central engine for keyword variant pages:
// higienizacao/lavagem × sofa/colchao/tapetes/cadeiras/alcatifas × all cities + parishes
// Content generated on demand — no 1 570-entry array kept in memory at module load.

import { cities, cityPrep } from './locationSeoData';
import { municipiosComFreguesias } from './freguesiaSeoData';

// ─── Types ─────────────────────────────────────────────────────────

export type ServiceKey = 'sofa' | 'colchao' | 'tapetes' | 'cadeiras' | 'alcatifas';
export type VariantKey = 'higienizacao' | 'lavagem' | 'impermeabilizacao';

export interface KeywordVariantData {
  slug: string;
  locationPart: string;
  locationName: string;
  serviceKey: ServiceKey;
  variantKey: VariantKey;
  canonical: string;
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  whatIs: string;
  benefits: string[];
  processSteps: { step: number; title: string; description: string }[];
  faqs: { question: string; answer: string }[];
  problems: { title: string; description: string }[];
  testimonials: { name: string; location: string; text: string }[];
  priceFrom: string;
}

interface ContentBlock {
  intro: string;
  whatIs: string;
  benefits: string[];
  processSteps: { step: number; title: string; description: string }[];
  faqs: { question: string; answer: string }[];
  problems: { title: string; description: string }[];
  testimonials: { name: string; location: string; text: string }[];
}

// ─── Service metadata ──────────────────────────────────────────────

const SERVICE_META: Record<ServiceKey, {
  label: string; labelPlural: string; canonicalBase: string; priceFrom: string; waterproofPriceFrom?: string;
}> = {
  sofa:      { label: 'Sofá',      labelPlural: 'Sofás',      canonicalBase: 'limpeza-sofas',     priceFrom: '49€',     waterproofPriceFrom: '59€'      },
  colchao:   { label: 'Colchão',   labelPlural: 'Colchões',   canonicalBase: 'limpeza-colchoes',  priceFrom: '49€' },
  tapetes:   { label: 'Tapetes',   labelPlural: 'Tapetes',    canonicalBase: 'limpeza-tapetes',   priceFrom: '12€/m²'                                    },
  cadeiras:  { label: 'Cadeiras',  labelPlural: 'Cadeiras',   canonicalBase: 'limpeza-cadeiras',  priceFrom: '20€',     waterproofPriceFrom: '25€/cad.'    },
  alcatifas: { label: 'Alcatifas', labelPlural: 'Alcatifas',  canonicalBase: 'limpeza-alcatifas', priceFrom: '3€/m²'                                    },
};

// Impermeabilizacao variant: canonical always points to /impermeabilizacao-{location}
const VARIANT_CANONICAL_BASE: Partial<Record<VariantKey, string>> = {
  impermeabilizacao: 'impermeabilizacao',
};

// Which services each variant covers
const SERVICES_FOR_VARIANT: Record<VariantKey, ServiceKey[]> = {
  higienizacao:      ['sofa', 'colchao', 'tapetes', 'cadeiras', 'alcatifas'],
  lavagem:           ['sofa', 'colchao', 'tapetes', 'cadeiras', 'alcatifas'],
  impermeabilizacao: ['sofa', 'cadeiras'],
};

// ─── Content generators (one per variant × service) ────────────────
// loc = display name ("Porto" or "Paranhos, Porto"), ctx = context phrase

function content_higienizacao_sofa(loc: string, ctx: string): ContentBlock {
  return {
    intro: `A higienização profissional do sofá em ${loc} vai além da limpeza visual: eliminamos os agentes patogénicos invisíveis que afetam a saúde da sua família. A Kyro Clean Solutions usa protocolos de sanitização certificados para remover ácaros, bactérias, fungos e alergénios acumulados nos tecidos em ${loc} e ${ctx}.`,
    whatIs: `A higienização vai além de tirar o pó: elimina os ácaros, bactérias e fungos que vivem nos tecidos e que causam alergias, espirros e problemas respiratórios. Feita com produtos seguros para toda a família, é especialmente recomendada quando há bebés, crianças ou alérgicos em casa em ${loc}.`,
    benefits: [
      'Eliminação de 99,9% de ácaros, bactérias e vírus',
      'Sanitização certificada com agentes antimicrobianos',
      'Seguro para bebés, crianças e pessoas alérgicas',
      'Produtos certificados e hipoalergénicos',
      `Serviço ao domicílio em ${loc}`,
      'Certificado de higienização disponível sob pedido',
    ],
    processSteps: [
      { step: 1, title: 'Avaliação de higiene', description: `Inspecção do sofá e identificação de focos de contaminação em ${loc}.` },
      { step: 2, title: 'Aspiração HEPA', description: 'Remoção de 99,9% dos ácaros e detritos com filtro HEPA certificado.' },
      { step: 3, title: 'Sanitização antimicrobiana', description: 'Aplicação de agente certificado, seguro para tecidos e toda a família.' },
      { step: 4, title: 'Secagem rápida', description: 'Sofá pronto a usar em poucas horas, sem humidade residual.' },
    ],
    faqs: [
      { question: `Quanto tempo após a higienização posso usar o sofá?`, answer: `Em condições normais de ventilação, o sofá está pronto a usar em 2 a 4 horas. Não fica húmido nem com cheiro a produtos — apenas limpo.` },
      { question: `A higienização resolve mesmo os espirros e alergias causados pelo sofá?`, answer: `Sim. Os ácaros do sofá são uma das principais causas de rinite alérgica em casa. O processo elimina-os das fibras profundas — onde o aspirador doméstico não chega — e os sintomas melhoram visivelmente.` },
      { question: `Fazem higienização de sofá ao domicílio em ${loc}?`, answer: `Sim, deslocamo-nos a ${loc} com todo o equipamento. Não precisa de preparar nada nem de mover o sofá.` },
      { question: `Qual a diferença entre higienizar e simplesmente aspirar o sofá?`, answer: `O aspirador remove sujidade solta da superfície. A higienização profissional penetra nas fibras e elimina os patogénicos invisíveis — ácaros, bactérias, fungos — que causam alergias e odores persistentes.` },
      { question: `A higienização do sofá é segura se tiver crianças e animais em casa?`, answer: `Sim. Usamos produtos certificados e sem compostos tóxicos, seguros para crianças e animais. O sofá pode ser usado poucas horas depois.` },
    ],
    problems: [
      { title: "Alergias que pioram em casa", description: `Um sofá usado durante 3 anos pode conter mais de 15 milhões de ácaros nas fibras. São invisíveis, mas libertam-se ao sentar e agravam alergias respiratórias em ${loc}.` },
      { title: "Odores que o aspirador não resolve", description: "Bactérias anaeróbias acumulam-se nas camadas profundas do tecido e produzem odores persistentes que nenhum spray doméstico elimina de raiz." },
      { title: "Bebé ou criança em contacto direto com o tecido", description: "Crianças respiram mais próximo das fibras e são mais vulneráveis a alergénios. A higienização profissional cria um ambiente verdadeiramente seguro para os mais novos." },
    ],
    testimonials: [
      { name: "Mariana F.", location: "Porto", text: "O sofá estava num estado que eu já nem queria receber visitas. Depois da higienização ficou tão limpo que parecia ter saído da loja. Os meus filhos voltaram a sentar-se nele sem eu me preocupar." },
      { name: "Ricardo M.", location: "Matosinhos", text: "Tenho dois gatos e o sofá cheirava de uma forma impossível. Depois do serviço o cheiro desapareceu por completo. Ainda não percebi como é possível, mas ficou impecável." },
    ],
  };
}

function content_higienizacao_colchao(loc: string, ctx: string): ContentBlock {
  return {
    intro: `Passamos um terço da vida no colchão, por isso a higienização profissional do colchão em ${loc} é essencial para a saúde do sono. A Kyro Clean Solutions elimina ácaros, bactérias e fungos com protocolos de sanitização certificados, garantindo noites mais saudáveis em ${loc} e ${ctx}.`,
    whatIs: `Passamos um terço da vida no colchão, por isso a higiene interna importa tanto como a externa. Este tratamento elimina os ácaros e bactérias das camadas profundas que causam alergias nocturnas, espirros de manhã e má qualidade de sono — sem produtos tóxicos, seguro para toda a família.`,
    benefits: [
      'Eliminação de 99,9% dos ácaros e bactérias do colchão',
      'Melhoria comprovada da qualidade do sono',
      'Ideal para alérgicos, asmáticos e pessoas com rinite',
      'Seguro para bebés e grávidas',
      `Serviço ao domicílio em ${loc}`,
      'Colchão pronto a usar no mesmo dia',
    ],
    processSteps: [
      { step: 1, title: 'Avaliação de contaminação', description: `Análise do nível de infestação e identificação de focos em ${loc}.` },
      { step: 2, title: 'Aspiração HEPA profunda', description: 'Remoção de 99,9% dos ácaros, esporos e detritos biológicos.' },
      { step: 3, title: 'Tratamento antimicrobiano', description: 'Aplicação de produto certificado, seguro para contato com pele sensível.' },
      { step: 4, title: 'Secagem e aeração', description: 'Colchão pronto a usar no mesmo dia após aeração.' },
    ],
    faqs: [
      { question: `A higienização do colchão melhora mesmo as alergias nocturnas?`, answer: `Sim. Os ácaros do colchão são a principal causa de rinite e asma noturna. Higienizar elimina esses alergénios das camadas profundas onde nenhum aspirador chega — muitos clientes notam diferença na primeira semana.` },
      { question: `Com que frequência devo higienizar o colchão de um bebé?`, answer: `Para bebés recomendamos a cada 6 meses. A pele do bebé é mais sensível e passa mais tempo em contacto direto com as fibras do que um adulto.` },
      { question: `O colchão fica húmido depois da higienização? Quando posso dormir nele?`, answer: `A higienização não usa grandes quantidades de líquido. Com ventilação normal o colchão fica pronto para dormir no mesmo dia, tipicamente em 3 a 5 horas.` },
      { question: `A higienização funciona em colchões de memory foam e látex?`, answer: `Sim. Adaptamos os produtos e técnicas ao tipo de espuma para não danificar a estrutura interna. O resultado é o mesmo: eliminação de ácaros, patogénicos e odores.` },
      { question: `Qual o preço de higienização de colchão de casal em ${loc}?`, answer: `A partir de 69€ para casal e 79€ para king size. Deslocação a partir de 5€ a ${loc}, consoante a distância. Orçamento gratuito e sem compromisso.` },
    ],
    problems: [
      { title: "Acordar com olhos vermelhos ou nariz congestionado", description: `Os ácaros do colchão são a causa mais comum de rinite alérgica noturna em ${loc}. O corpo passa 8 horas em contacto direto com o foco de contaminação.` },
      { title: "Cheiro a suor mesmo depois de arejar", description: "Bactérias anaeróbias nas camadas internas do colchão produzem odores que o arejamento não elimina. Só a extração profissional alcança essa profundidade." },
      { title: "Criança ou idoso com alergias respiratórias", description: "São os grupos mais vulneráveis a ácaros e alergénios do colchão. A higienização regular é especialmente recomendada para quem acorda com sintomas noturnos." },
    ],
    testimonials: [
      { name: "Catarina L.", location: "Braga", text: "A minha filha tem asma e desde que higienizámos o colchão os sintomas de manhã melhoraram bastante. Não esperava uma diferença tão notória num objeto que parecia limpo." },
      { name: "Paulo S.", location: "Vila Nova de Gaia", text: "Vieram no dia marcado, fizeram tudo em silêncio e foram embora. O colchão secou em menos tempo do que disseram. Resultado sem nada a apontar." },
    ],
  };
}

function content_higienizacao_tapetes(loc: string, ctx: string): ContentBlock {
  return {
    intro: `Os tapetes da sua casa em ${loc} são um dos maiores reservatórios de alergénios no interior: acumulam ácaros, pólen, penas e bactérias nas suas fibras. A Kyro Clean Solutions oferece higienização profissional de tapetes em ${loc} e ${ctx}, tornando o chão seguro para crianças e alérgicos.`,
    whatIs: `O tapete retém nos seus fios o pólen, ácaros e bactérias que entram em casa com os sapatos ou com os animais de estimação. Este tratamento remove esses alergénios em profundidade, tornando o chão seguro para crianças que brincam e para quem sofre de alergias em ${loc}.`,
    benefits: [
      'Tapete seguro para crianças que brincam no chão',
      'Eliminação de 99,9% de ácaros e alergénios',
      'Fibras preservadas, sem danos em tapetes delicados',
      'Melhoria da qualidade do ar interior',
      `Serviço ao domicílio em ${loc}`,
      'Eficaz em tapetes de lã, seda, sintéticos e persas',
    ],
    processSteps: [
      { step: 1, title: 'Avaliação das fibras', description: `Identificação do tipo de tapete e nível de contaminação em ${loc}.` },
      { step: 2, title: 'Aspiração HEPA', description: 'Remoção profunda de ácaros, pólen e detritos das fibras.' },
      { step: 3, title: 'Sanitização antimicrobiana', description: 'Aplicação de agente certificado, adaptado ao tipo de fibra.' },
      { step: 4, title: 'Secagem controlada', description: 'Tapete seguro para uso em poucas horas, fibras intactas.' },
    ],
    faqs: [
      { question: `A higienização danifica as cores de tapetes persas ou de lã?`, answer: `Não. Avaliamos sempre o tipo de fibra antes de iniciar e usamos produtos adaptados a cada material. Tapetes persas e orientais recebem tratamento específico que preserva as cores originais.` },
      { question: `A higienização remove os alergénios de cão e gato do tapete?`, answer: `Sim. O processo remove pelos, caspa e todos os alergénios de animais das fibras em profundidade — o aspirador doméstico remove os pelos visíveis mas não atinge estes alergénios microscópicos.` },
      { question: `Fazem higienização de tapetes ao domicílio em ${loc} ou tenho de os entregar?`, answer: `Fazemos ao domicílio, sem necessidade de transporte. Deslocamo-nos a ${loc} com todo o equipamento. Para tapetes muito delicados podemos fazer recolha e tratamento nas nossas instalações.` },
      { question: `Posso tentar higienizar o tapete em casa com um aspirador potente?`, answer: `O aspirador doméstico remove sujidade solta da superfície. Para eliminar os ácaros e patogénicos das camadas profundas das fibras é necessário equipamento profissional e produtos certificados.` },
      { question: `Qual o preço mínimo de higienização de tapete em ${loc}?`, answer: `A partir de 12€/m², com preço mínimo de 25€ por serviço. O preço final depende do tipo de fibra e estado do tapete. Orçamento gratuito ao domicílio em ${loc}.` },
    ],
    problems: [
      { title: "Criança que brinca no chão com espirros frequentes", description: "O tapete concentra ácaros, pólen e fungos nas fibras. Quando a criança rasteja ou brinca, inalha estes alergénios em concentração máxima ao nível do chão." },
      { title: "Animal de estimação que dorme no tapete", description: "Pelos, caspa e bactérias dos animais penetram nas fibras e multiplicam-se. A higienização remove alergénios de animais que a aspiração doméstica deixa para trás." },
      { title: "Espirros frequentes ou comichão nos olhos em casa", description: "O tapete liberta alergénios ao ser pisado, criando uma nuvem invisível ao nível do chão. A higienização profunda reduz estes níveis em 99,9%." },
    ],
    testimonials: [
      { name: "Inês T.", location: "Lisboa", text: "Tapete persa de família com manchas que me recusava a tentar limpar em casa com medo de o estragar. Voltou a ficar como novo. Fico aliviada por não ter tentado sozinha." },
      { name: "Jorge A.", location: "Setúbal", text: "Tapete da sala com sete anos de uso diário. As cores que eu já nem me lembrava que eram assim voltaram. Fiquei genuinamente surpreendido com o que estava debaixo da sujidade." },
    ],
  };
}

function content_higienizacao_cadeiras(loc: string, ctx: string): ContentBlock {
  return {
    intro: `A higienização de cadeiras estofadas em ${loc} é essencial para restaurantes, escritórios e clínicas que partilham superfícies entre múltiplos utilizadores. A Kyro Clean Solutions aplica bactericida certificado que elimina 99,9% dos microrganismos em cadeiras de uso partilhado em ${loc} e ${ctx}.`,
    whatIs: `As cadeiras que partilhamos acumulam bactérias e vírus em silêncio — a limpeza habitual com pano não chega para os remover. Este tratamento elimina os germes das fibras com produtos certificados, essencial para restaurantes, escritórios e qualquer espaço onde várias pessoas se sentam na mesma cadeira em ${loc}.`,
    benefits: [
      'Bactericida certificado compatível com normas HACCP',
      'Ideal para restaurantes, escritórios e clínicas em ${loc}',
      'Imagem profissional: cadeiras com aspeto cuidado',
      'Descontos progressivos para lotes acima de 10 cadeiras',
      `Serviço ao domicílio em ${loc}`,
      'Cadeiras prontas a usar em poucas horas',
    ],
    processSteps: [
      { step: 1, title: 'Inspeção por cadeira', description: `Avaliação do estado de cada cadeira e tipo de tecido em ${loc}.` },
      { step: 2, title: 'Desengordurante profissional', description: 'Remoção de gordura, sujidade e resíduos orgânicos.' },
      { step: 3, title: 'Bactericida certificado', description: 'Aplicação de produto HACCP-compatível em todas as superfícies.' },
      { step: 4, title: 'Secagem rápida', description: 'Cadeiras prontas a usar em poucas horas, sem interrupção do negócio.' },
    ],
    faqs: [
      { question: `Emitem certificado de higienização para inspeções sanitárias em ${loc}?`, answer: `Sim. Após cada serviço emitimos certificado com identificação dos produtos usados, aceite em inspeções HACCP e auditorias sanitárias. Essencial para restaurantes, clínicas e espaços de saúde em ${loc}.` },
      { question: `Conseguem higienizar cadeiras de veludo sem danificar a textura?`, answer: `Sim. O veludo é um dos tecidos mais comuns em cadeiras de restaurante e escritório. Usamos produtos e técnicas específicas para veludo que eliminam os patogénicos sem alterar a textura ou brilho do tecido.` },
      { question: `Podem trabalhar fora do horário de funcionamento do restaurante?`, answer: `Sim. Trabalhamos regularmente ao fim de semana, à noite e de madrugada para não perturbar o funcionamento do negócio. As cadeiras ficam prontas a usar em 2 a 4 horas.` },
      { question: `Qual o desconto para higienizar um lote grande de cadeiras em ${loc}?`, answer: `Até 4 cadeiras: 20€/cad. · 5 a 6 cadeiras: 15€/cad. · 7 a 10 cadeiras: 12,50€/cad. Para 11 ou mais cadeiras, orçamento personalizado. Orçamento gratuito em ${loc}.` },
      { question: `A higienização funciona em cadeiras de mesh (escritório) além de estofo?`, answer: `Sim. O mesh é tratado com bactericida compatível que elimina as bactérias sem danificar as fibras plásticas da rede. Muito comum em cadeiras ergonómicas de escritório partilhadas.` },
    ],
    problems: [
      { title: "Cadeiras de uso partilhado (restaurante, escritório)", description: `Cadeiras partilhadas por múltiplos utilizadores são superfícies de alto risco de transmissão de vírus e bactérias que a limpeza convencional não elimina em ${loc}.` },
      { title: "Inspeção sanitária ou auditoria HACCP pendente", description: "A higienização com certificado é exigida em muitas inspeções para espaços alimentares e de saúde. Emitimos comprovativo após cada serviço para conformidade regulatória." },
      { title: "Imagem profissional comprometida por cadeiras sujas", description: "Cadeiras com aspeto gorduroso ou manchado transmitem desleixo aos clientes. A higienização profissional devolve o aspeto cuidado e prolonga a vida do estofamento." },
    ],
    testimonials: [
      { name: "Ana Beatriz C.", location: "Porto", text: "Restaurante com quarenta e duas cadeiras. Depois da higienização os clientes começaram a comentar o aspeto do espaço. Isso não acontecia há anos. Valeu completamente o investimento." },
      { name: "Miguel F.", location: "Aveiro", text: "Escritório com doze cadeiras partilhadas. Era algo que adiava há tempo. Em meia manhã estava feito e as cadeiras ficaram como quando as comprei. Rápido e sem complicações." },
    ],
  };
}

function content_higienizacao_alcatifas(loc: string, ctx: string): ContentBlock {
  return {
    intro: `A higienização de alcatifas em ${loc} é crítica para hotéis, clínicas, escolas e espaços comerciais onde a saúde coletiva está em causa. A Kyro Clean Solutions aplica protocolos de sanitização certificados para grandes superfícies em ${loc} e ${ctx}, garantindo qualidade do ar interior e conformidade com normas de higiene.`,
    whatIs: `As alcatifas de espaços comerciais acumulam nas fibras densas grandes quantidades de pó, bactérias e alergénios que pioram a qualidade do ar. Este tratamento elimina-os com produtos aprovados para espaços públicos, melhorando o ar do espaço e facilitando auditorias de higiene em ${loc}.`,
    benefits: [
      'Aprovado para espaços públicos, hotéis e clínicas',
      'Melhoria mensurável da qualidade do ar interior',
      'Agentes antimicrobianos para grandes superfícies',
      'Agendamento fora do horário de funcionamento',
      `Cobertura em ${loc} e toda a área envolvente`,
      'Relatório de higienização disponível',
    ],
    processSteps: [
      { step: 1, title: 'Aspiração industrial HEPA', description: `Remoção profunda de ácaros e alergénios em toda a superfície em ${loc}.` },
      { step: 2, title: 'Pré-tratamento antimicrobiano', description: 'Aplicação de agente de largo espectro aprovado para espaços públicos.' },
      { step: 3, title: 'Extração profunda', description: 'Eliminação dos agentes patogénicos até às camadas mais profundas.' },
      { step: 4, title: 'Secagem acelerada', description: 'Espaço apto para uso em 2-4 horas com ventilação adequada.' },
    ],
    faqs: [
      { question: `A higienização de alcatifas melhora realmente a qualidade do ar do espaço?`, answer: `Sim. As alcatifas são o maior reservatório de alergénios, pólen e bactérias em espaços fechados. Após higienização a qualidade do ar interior melhora de forma mensurável — especialmente relevante em escritórios e clínicas.` },
      { question: `Emitem relatório de higienização aceite em auditorias ISO ou sanitárias?`, answer: `Sim. Emitimos relatório detalhado com ficha técnica dos produtos usados, aceite em auditorias de qualidade do ar, certificações ISO e inspeções sanitárias. Disponível para todos os serviços em ${loc}.` },
      { question: `O espaço tem de fechar durante a higienização das alcatifas?`, answer: `Depende da dimensão e do tipo de espaço. Em escritórios e clínicas fazemos frequentemente fora do horário para não interromper a atividade. O espaço fica apto para uso 2 a 4 horas após o serviço.` },
      { question: `Fazem higienização de alcatifas ao fim de semana e à noite em ${loc}?`, answer: `Sim. É o horário mais comum para espaços comerciais em ${loc}. Agendamos conforme a disponibilidade do espaço para minimizar qualquer perturbação ao negócio.` },
      { question: `Qual o preço de higienização de alcatifa para escritório em ${loc}?`, answer: `A partir de 3€/m² com descontos progressivos por volume. Para superfícies acima de 100m² há preço especial. Orçamento gratuito e sem compromisso para o seu espaço em ${loc}.` },
    ],
    problems: [
      { title: "Cheiro a bafio ou mofo em dias húmidos", description: `Fungos proliferam nas fibras densas das alcatifas quando há humidade acumulada em ${loc}. A higienização com agentes antifúngicos elimina o problema na raiz, não o mascara.` },
      { title: "Funcionários com sintomas respiratórios no espaço", description: "Alcatifas comerciais são o maior reservatório de alergénios em espaços fechados. A qualidade do ar interior melhora significativamente após higienização profissional." },
      { title: "Auditoria de qualidade do ar ou certificação pendente", description: "Emitimos relatório de higienização com ficha técnica dos produtos, aceite em auditorias de qualidade do ar interior e certificações de espaços de trabalho." },
    ],
    testimonials: [
      { name: "Dra. Sofia V.", location: "Porto", text: "Clínica com alcatifa em dois consultórios. Precisávamos de comprovativo para auditoria anual. Foram pontuais, profissionais e deixaram tudo em perfeitas condições." },
      { name: "Nuno A.", location: "Braga", text: "Hotel com alcatifas em todo o corredor principal. Não queríamos fechar ao público por isso fizeram o trabalho de madrugada. De manhã estava tudo pronto e sem cheiro a produtos." },
    ],
  };
}

function content_lavagem_sofa(loc: string, ctx: string): ContentBlock {
  return {
    intro: `Precisa de lavar o sofá em ${loc}? A Kyro Clean Solutions realiza lavagem profunda por extração profissional, o método mais eficaz para remover manchas, gorduras e resíduos acumulados nas fibras. Ao contrário da limpeza seca, a lavagem por extração penetra nas camadas profundas do tecido, devolvendo o sofá ao estado original em ${loc} e ${ctx}.`,
    whatIs: `A lavagem profissional é como uma limpeza por dentro do tecido: retira manchas, gordura acumulada e o escurecimento que o aspirador doméstico nunca consegue atingir. O sofá fica com as cores e o toque que tinha quando era novo — ao domicílio em ${loc}, sem mover o sofá.`,
    benefits: [
      'Extração profunda com equipamento profissional',
      'Remove manchas antigas que a limpeza seca não consegue',
      'Devolve o aspeto original e as cores ao tecido',
      'Tecido macio como novo após a lavagem',
      `Lavagem ao domicílio em ${loc}`,
      'Secagem rápida: sofá pronto em 4 a 6 horas',
    ],
    processSteps: [
      { step: 1, title: 'Mapeamento de manchas', description: `Identificação e avaliação de cada mancha por tipo em ${loc}.` },
      { step: 2, title: 'Pré-tratamento', description: 'Produto específico por tipo de mancha: gordura, vinho, urina, café.' },
      { step: 3, title: 'Lavagem por extração profissional', description: 'Injeção de solução quente e aspiração em profundidade das fibras.' },
      { step: 4, title: 'Secagem acelerada', description: 'Sofá pronto a usar em 4 a 6 horas com ventilação adequada.' },
    ],
    faqs: [
      { question: `A lavagem por extração pode danificar o tecido do sofá?`, answer: `Não, desde que se avalie o tecido antes de iniciar. É segura para microfibra, algodão, linho, chenille e veludo. Para tecidos muito delicados como seda usamos métodos alternativos sem água.` },
      { question: `Quanto tempo fica o sofá húmido após a lavagem profissional?`, answer: `Com o nosso sistema de extração de alta sucção, o sofá fica pronto a usar em 4 a 6 horas com boa ventilação. Em dias quentes pode secar ainda mais rápido.` },
      { question: `A lavagem consegue remover manchas de café e vinho com anos?`, answer: `Sim, na grande maioria dos casos. Manchas antigas de café, vinho e gordura são removidas pela extração profissional a quente. Manchas muito antigas ou de tinta podem precisar de tratamento adicional — avaliamos gratuitamente.` },
      { question: `Posso escolher o horário da visita para lavar o sofá em ${loc}?`, answer: `Sim. Agendamos conforme a sua disponibilidade em ${loc}, incluindo fins de semana e horários alargados. O processo decorre no local, sem necessidade de mover o sofá.` },
      { question: `Qual a diferença de preço entre lavar um sofá de 2 e 3 lugares?`, answer: `Sofá de 2 lugares a partir de 49€, 3 lugares a partir de 69€. Com chaise longue acrescenta 10€. Orçamento gratuito e personalizado ao seu sofá em ${loc}.` },
    ],
    problems: [
      { title: "Manchas de café, vinho ou gordura que não saem", description: `Líquidos penetram nas fibras em menos de 30 segundos e ligam-se ao tecido. A extração profissional a quente é o único método que os remove sem danificar o sofá em ${loc}.` },
      { title: "Sofá com aspeto escuro e cores apagadas", description: "Sujidade acumulada cobre o fio original e faz o sofá parecer mais velho. A lavagem por extração remove esta camada e revela as cores e a maciez originais do tecido." },
      { title: "Cheiro a estofo velho mesmo depois de aspirar", description: "A aspiração remove apenas sujidade superficial. Humidade e resíduos orgânicos nas fibras profundas produzem odores que só a extração aquosa elimina definitivamente." },
    ],
    testimonials: [
      { name: "Filipa O.", location: "Porto", text: "Mancha de vinho tinto de quase dois anos. Eu já tinha aceite que ia ficar ali para sempre. Depois da lavagem desapareceu. Continuo sem perceber como é possível mas não me importo." },
      { name: "Bruno C.", location: "Vila Nova de Gaia", text: "Sofá de microfibra cinzenta que estava cada vez mais escuro com o uso. Depois da lavagem ficou da cor original. A diferença entre antes e depois é honestamente chocante." },
    ],
  };
}

function content_lavagem_colchao(loc: string, ctx: string): ContentBlock {
  return {
    intro: `Manchas de suor, urina ou outros líquidos no colchão em ${loc}? A Kyro Clean Solutions realiza lavagem profunda por extração que remove manchas acumuladas nas camadas profundas do colchão, renovando-o completamente. Serviço ao domicílio em ${loc} e ${ctx}.`,
    whatIs: `Com o uso diário, o colchão absorve suor, líquidos e manchas nas suas camadas profundas — e o arejamento não chega para os remover. Este tratamento extrai essas impurezas de dentro do colchão, devolve o aspeto original e elimina os odores na raiz, tudo ao domicílio em ${loc}.`,
    benefits: [
      'Remoção de manchas de suor, urina e sangue',
      'Extração profunda nas camadas interiores do colchão',
      'Eliminação de odores orgânicos acumulados',
      'Colchão como novo: aspeto e frescura restaurados',
      `Lavagem ao domicílio em ${loc}`,
      'Pronto a usar no mesmo dia',
    ],
    processSteps: [
      { step: 1, title: 'Identificação de manchas', description: `Mapeamento por tipo de mancha e avaliação da profundidade em ${loc}.` },
      { step: 2, title: 'Pré-tratamento enzimático', description: 'Aplicação de produto enzimático específico para manchas orgânicas.' },
      { step: 3, title: 'Extração profissional', description: 'Injeção de solução quente e aspiração profunda das fibras.' },
      { step: 4, title: 'Secagem e aeração', description: 'Colchão pronto a usar no mesmo dia com aeração adequada.' },
    ],
    faqs: [
      { question: `A lavagem remove manchas de urina antigas de criança do colchão?`, answer: `Sim. O pré-tratamento enzimático específico para urina quebra os compostos orgânicos e remove tanto a mancha como o odor, mesmo em manchas com meses ou anos de antiguidade.` },
      { question: `As manchas amareladas de suor saem com a lavagem do colchão?`, answer: `Sim, na grande maioria dos casos. A extração a quente com pré-tratamento enzimático remove manchas amareladas de suor que resistiram a todas as tentativas domésticas.` },
      { question: `A lavagem é segura em colchões de molas e híbridos?`, answer: `Sim. A extração é feita apenas nas camadas de estofamento superior, sem atingir as molas ou a estrutura interna. É segura em qualquer tipo de colchão.` },
      { question: `A lavagem funciona em colchões antigos ou muito usados?`, answer: `Sim. Mesmo colchões com vários anos de uso reagem bem à extração profissional, recuperando frescura e reduzindo alergénios acumulados. Se houver dano estrutural (molas partidas, buracos), a lavagem não resolve esse desgaste, apenas a limpeza e o odor.` },
      { question: `Quanto custa lavar um colchão king size em ${loc}?`, answer: `A partir de 79€ para king e queen size. Para colchão de solteiro a partir de 49€ e casal a partir de 69€. Deslocação a partir de 5€ a ${loc}, consoante a distância.` },
    ],
    problems: [
      { title: "Manchas amareladas de suor que resistiram a tudo", description: "A oxidação do suor cria manchas proteicas que se ligam às fibras com o tempo. A lavagem enzimática a quente é o único método que as remove eficazmente sem danificar o colchão." },
      { title: "Mancha de urina com cheiro persistente", description: "A urina penetra fundo nas camadas do colchão. O pré-tratamento enzimático específico remove tanto a mancha visível como o odor das camadas internas, de forma definitiva." },
      { title: "Colchão com odor intenso apesar do arejamento", description: "Sujidade orgânica acumulada nas fibras internas produz odores que o arejamento não elimina. A extração profissional alcança essas camadas profundas e devolvem a frescura." },
    ],
    testimonials: [
      { name: "Marta P.", location: "Lisboa", text: "O meu filho teve um acidente no colchão quando era bebé e nunca consegui tirar a mancha por completo. Finalmente desapareceu. Devia ter feito isto muito antes." },
      { name: "Tiago R.", location: "Coimbra", text: "Colchão novo há dois anos mas já com manchas amareladas de suor. Ficou como novo e o cheiro que havia também desapareceu. Não esperava um resultado tão completo." },
    ],
  };
}

function content_lavagem_tapetes(loc: string, ctx: string): ContentBlock {
  return {
    intro: `Precisa de lavar tapetes em ${loc}? A Kyro Clean Solutions faz lavagem especializada de tapetes de todos os tipos (persas, orientais, modernos e de lã) com extração profissional e recolha ao domicílio em ${loc} e ${ctx}. Preços desde 12€/m².`,
    whatIs: `A lavagem profissional retira a sujidade compactada que anos de aspiração deixaram para trás nas fibras, restaura as cores e o toque originais. Feita com produtos adaptados ao tipo de fibra — lã, seda, sintético ou persa — para que o tapete não corra riscos em ${loc}.`,
    benefits: [
      'Lavagem especializada para tapetes persas e orientais',
      'Restauração das cores e aspeto original',
      'Remove manchas de gordura, vinho e animais',
      `Recolha e entrega ao domicílio em ${loc}`,
      'Técnicas específicas por tipo de fibra',
      'Secagem controlada: fibras preservadas',
    ],
    processSteps: [
      { step: 1, title: 'Avaliação do tapete', description: `Identificação do tipo de fibra e mapeamento de manchas em ${loc}.` },
      { step: 2, title: 'Pré-tratamento de manchas', description: 'Produto específico por tipo de mancha e tipo de fibra.' },
      { step: 3, title: 'Lavagem por extração profissional', description: 'Injeção de solução quente e aspiração da sujidade das fibras.' },
      { step: 4, title: 'Secagem controlada', description: 'Secagem adequada ao tipo de fibra para preservar forma e cores.' },
    ],
    faqs: [
      { question: `Fazem recolha e entrega de tapetes para lavagem em ${loc}?`, answer: `Sim. Recolhemos ao domicílio em ${loc}, tratamos nas nossas instalações e entregamos de volta. Para tapetes muito delicados como persas ou orientais este método permite um tratamento mais cuidado.` },
      { question: `A lavagem preserva as cores originais de tapetes naturais?`, answer: `Sim. A extração profissional remove a sujidade que opaca as cores, revelando os tons originais das fibras. Em tapetes persas e orientais usamos técnicas específicas que realçam as cores sem os danificar.` },
      { question: `A lavagem remove os pelos de cão e gato presos nas fibras do tapete?`, answer: `Sim. O processo de extração remove pelos, caspa e alergénios de animais que ficam presos nas fibras e que o aspirador comum não consegue retirar completamente.` },
      { question: `Quanto tempo demora a lavagem e secagem de um tapete de lã?`, answer: `O processo de lavagem demora entre 3 a 5 dias úteis para tapetes de lã (secagem mais lenta para preservar as fibras). Tapetes sintéticos ficam prontos em 1 a 2 dias.` },
      { question: `Qual o preço mínimo para lavagem de tapete pequeno em ${loc}?`, answer: `Preço mínimo de 25€ por tapete, a partir de 12€/m² para médios e grandes. O preço final depende do tipo de fibra e estado. Orçamento gratuito com recolha em ${loc}.` },
    ],
    problems: [
      { title: "Manchas de café, molho ou vinho que ficaram", description: "As fibras absorvem líquidos em segundos. Quanto mais tempo passam, mais profundas ficam. A extração profissional remove a grande maioria das manchas antigas, mesmo de anos." },
      { title: "Tapete com aspeto opaco e cores desbotadas", description: "A sujidade acumulada cria uma camada que apaga as cores naturais das fibras. A lavagem profissional revela as cores originais e a textura real do tapete." },
      { title: "Tapete de qualidade com manchas que teme tratar em casa", description: "Tapetes persas, orientais ou de lã podem ser danificados por produtos errados. Avaliamos sempre antes de iniciar e usamos técnicas específicas por tipo de fibra." },
    ],
    testimonials: [
      { name: "Leonor S.", location: "Porto", text: "Tapete da entrada da loja completamente escurecido de tráfego. Depois da lavagem as cores voltaram e os clientes começaram a notar. Contratei de novo dois meses depois." },
      { name: "Henrique M.", location: "Braga", text: "Tapete de lã comprado há oito anos com manchas de vinho e café acumuladas. Não sabia que ia ficar tão bem. Quem o vê hoje não acredita na diferença." },
    ],
  };
}

function content_lavagem_cadeiras(loc: string, ctx: string): ContentBlock {
  return {
    intro: `Lavagem de cadeiras estofadas em ${loc} para restaurantes, escritórios e residências. A Kyro Clean Solutions renova lotes de cadeiras com extração profissional, eliminando manchas e devolvendo um aspeto como novo. Serviço ao domicílio em ${loc} e ${ctx}.`,
    whatIs: `A lavagem profissional remove manchas de gordura, comida e suor que se acumularam nas fibras das cadeiras ao longo do tempo. Cadeiras com aspeto cuidado transmitem profissionalismo — e a secagem é rápida para que o espaço não fique parado. Feita ao domicílio em ${loc}.`,
    benefits: [
      'Ideal para lotes de cadeiras de restaurante e escritório',
      'Aspeto como novo: manchas e gorduras eliminadas',
      'Cores revitalizadas em todos os tipos de tecido',
      'Secagem rápida: cadeiras prontas no mesmo dia',
      `Lavagem ao domicílio em ${loc}`,
      'Descontos progressivos para lotes grandes',
    ],
    processSteps: [
      { step: 1, title: 'Mapeamento de manchas', description: `Avaliação de cada cadeira e tipo de tecido em ${loc}.` },
      { step: 2, title: 'Pré-tratamento', description: 'Desengordurante e produto específico por tipo de mancha.' },
      { step: 3, title: 'Lavagem por extração profissional', description: 'Injeção de solução quente e aspiração em profundidade.' },
      { step: 4, title: 'Secagem rápida', description: 'Cadeiras prontas a usar no mesmo dia com ventilação adequada.' },
    ],
    faqs: [
      { question: `A lavagem consegue remover gordura de cozinha das cadeiras de restaurante?`, answer: `Sim. A gordura de cozinha é uma das manchas mais comuns em cadeiras de restaurante e a mais difícil de remover em casa. O pré-tratamento desengordurante profissional dissolve-a antes da extração.` },
      { question: `Quanto tempo ficam as cadeiras fora de uso depois da lavagem?`, answer: `Com o nosso sistema de extração de alta sucção, as cadeiras ficam prontas a usar em 2 a 4 horas. Em dias quentes com boa ventilação pode ser menos.` },
      { question: `Conseguem lavar cadeiras de veludo sem danificar a textura característica?`, answer: `Sim. O veludo requer técnica específica — lavagem com movimento correto das fibras. Temos experiência em veludo de várias qualidades e densidades sem danificar a textura.` },
      { question: `Fazem lavagem de cadeiras de restaurante fora do horário de funcionamento?`, answer: `Sim. É o nosso horário mais frequente para restaurantes em ${loc}. Trabalhamos à noite ou ao fim de semana para que as cadeiras estejam prontas antes da abertura.` },
      { question: `Qual o preço para lavar um lote de 20 cadeiras de escritório em ${loc}?`, answer: `Para lotes acima de 10 cadeiras aplicamos preço personalizado, normalmente com desconto face ao preço por unidade. Orçamento gratuito com deslocação a ${loc} incluída.` },
    ],
    problems: [
      { title: "Cadeiras de jantar com manchas de comida acumuladas", description: "Gordura, molhos e bebidas acumulam-se nas fibras ao longo dos anos. A extração profissional remove estas manchas mesmo as mais antigas e profundas nas fibras." },
      { title: "Cadeiras de escritório com aspeto sujo e desgastado", description: "Cadeiras desgastadas transmitem desleixo a clientes e visitantes. A lavagem profissional devolve um aspeto cuidado e prolonga significativamente a vida útil do estofamento." },
      { title: "Manchas escuras nas zonas de contacto habitual", description: "O encosto e o assento ficam progressivamente mais escuros com o uso diário. A lavagem por extração remove esta sujidade compactada de forma profunda e eficaz." },
    ],
    testimonials: [
      { name: "Joana F.", location: "Porto", text: "Cadeiras de sala de jantar com gordura acumulada de anos. Limpei-as várias vezes em casa sem resultado. Numa única visita ficaram como novas. Não voltarei a tentar sozinha." },
      { name: "Rui B.", location: "Maia", text: "Seis cadeiras de escritório com manchas que já nem sabia de onde vinham. Parecem acabadas de comprar. Muito melhor do que esperava e a um preço razoável." },
    ],
  };
}

function content_lavagem_alcatifas(loc: string, ctx: string): ContentBlock {
  return {
    intro: `Lavagem de alcatifas em ${loc} para hotéis, escritórios e grandes espaços comerciais. A Kyro Clean Solutions realiza extração profunda profissional em qualquer dimensão de alcatifa, com secagem rápida e mínima perturbação do negócio em ${loc} e ${ctx}.`,
    whatIs: `A lavagem profissional penetra nas camadas mais densas da alcatifa e remove a sujidade que anos de aspiração deixaram para trás — manchas de passagem, derramamentos e a sujidade invisível das fibras. O resultado é visível no mesmo dia, com secagem em 2 a 4 horas em ${loc}.`,
    benefits: [
      'Equipamento comercial para grandes superfícies',
      'Remove manchas de passagem e derramamentos',
      'Secagem rápida: espaço apto em 2-4 horas',
      'Agendamento noturno e ao fim de semana',
      `Cobertura em ${loc} e toda a área envolvente`,
      'Preços competitivos por m² para grandes áreas',
    ],
    processSteps: [
      { step: 1, title: 'Aspiração pré-lavagem', description: `Aspiração industrial para remoção de sujidade solta antes da lavagem em ${loc}.` },
      { step: 2, title: 'Aplicação de detergente', description: 'Produto profissional específico para alcatifas comerciais.' },
      { step: 3, title: 'Extração profissional', description: 'Lavagem a quente em profundidade e aspiração de alto volume.' },
      { step: 4, title: 'Secagem acelerada', description: 'Ventilação dirigida: espaço apto para uso em 2-4 horas.' },
    ],
    faqs: [
      { question: `A alcatifa pode ser usada no mesmo dia da lavagem?`, answer: `Sim, na maioria dos casos. Com extração de alta sucção e boa ventilação, as alcatifas ficam prontas em 2 a 4 horas. Para alcatifas de alta densidade pode demorar um pouco mais.` },
      { question: `A lavagem profissional funciona em alcatifas de alta densidade (tipo hotel)?`, answer: `Sim. Temos equipamento industrial específico para alcatifas de alta densidade que a extração doméstica não consegue penetrar. É o tipo de alcatifa mais comum em hotéis e centros comerciais.` },
      { question: `Fazem lavagem de alcatifas em grandes superfícies acima de 100m²?`, answer: `Sim. Temos capacidade para qualquer dimensão de superfície. Já trabalhámos em hotéis, centros comerciais e espaços corporativos em ${loc}. Preço por m² com desconto progressivo por volume.` },
      { question: `A lavagem remove o cheiro a bafio de alcatifas antigas?`, answer: `Sim. O cheiro a bafio vem de fungos e bactérias acumulados nas fibras. A lavagem por extração elimina esses microrganismos na raiz, e o odor desaparece completamente após secagem.` },
      { question: `Qual o preço de lavagem de alcatifa para espaço comercial em ${loc}?`, answer: `A partir de 3€/m² com descontos progressivos para superfícies grandes. Para espaços acima de 100m² há orçamento personalizado. Deslocamo-nos a ${loc} com todo o equipamento.` },
    ],
    problems: [
      { title: "Manchas em zonas de passagem ou entrada", description: `Corredores e entradas acumulam sujidade de calçado que compacta nas fibras em ${loc}. A lavagem profissional remove esta sujidade que a aspiração já não consegue extrair.` },
      { title: "Alcatifa com anos de sujidade compactada", description: "A aspiração regular não remove os resíduos que penetraram nas fibras ao longo do tempo. A lavagem por extração renova a alcatifa devolvendo o aspeto como novo." },
      { title: "Derramamento recente de café ou bebida", description: "Quanto mais rápida a intervenção profissional, maior a probabilidade de remoção total. A extração a quente remove o derramamento antes de se tornar mancha permanente." },
    ],
    testimonials: [
      { name: "Carlos P.", location: "Porto", text: "Sede da empresa com alcatifa clara em toda a área de trabalho. Vieram ao fim de semana para não perturbar. Segunda-feira de manhã estava impecável. Fizemos já três vezes." },
      { name: "Teresa N.", location: "Aveiro", text: "Hotel com o corredor principal muito danificado. Já estava a ponderar substituir a alcatifa. Depois da lavagem mudei completamente de ideias. Ficou como quando foi colocada." },
    ],
  };
}

function content_impermeabilizacao_sofa(loc: string, ctx: string): ContentBlock {
  return {
    intro: `A impermeabilização de sofás em ${loc} cria uma barreira invisível contra líquidos, manchas e gordura, protegendo o seu investimento por anos sem alterar o toque ou a aparência do tecido. A Kyro Clean Solutions aplica tratamento de nano-partículas certificado em ${loc} e ${ctx}, com resultados garantidos.`,
    whatIs: `Este tratamento cria uma barreira invisível no tecido do sofá: a próxima vez que cair café, vinho ou sumo, o líquido fica à superfície e limpa-se com um pano — sem mancha, sem stress. O toque e o aspeto do sofá ficam exactamente iguais, e a proteção dura anos em ${loc}.`,
    benefits: [
      'Barreira invisível contra líquidos, manchas e gordura',
      'Toque e aspeto do tecido 100% preservados',
      'Proteção de 2 a 5 anos com uma única aplicação',
      'Reduz a frequência e custo das limpezas futuras',
      `Serviço ao domicílio em ${loc}, sem deslocação do sofá`,
      'Seguro para tecidos naturais, sintéticos e veludo',
    ],
    processSteps: [
      { step: 1, title: 'Avaliação do tecido', description: `Inspecção do tipo de fibra e estado do sofá em ${loc} para confirmar compatibilidade.` },
      { step: 2, title: 'Limpeza prévia', description: 'O sofá deve estar limpo antes da aplicação. Recomendamos limpeza prévia para resultado ideal.' },
      { step: 3, title: 'Aplicação de nano-partículas', description: 'Tratamento uniforme em todo o tecido com o produto impermeabilizante certificado.' },
      { step: 4, title: 'Secagem e ativação', description: 'A barreira ativa-se na secagem: sofá pronto a usar em 2 a 4 horas.' },
    ],
    faqs: [
      { question: `A impermeabilização altera o toque ou a cor do sofá?`, answer: `Não. O tratamento é completamente invisível e não altera a maciez, a cor nem a textura do tecido. O sofá fica igual ao toque — só que repele líquidos.` },
      { question: `Quanto tempo dura a impermeabilização de um sofá?`, answer: `Com uso normal, a proteção dura 2 a 5 anos. Em famílias com crianças ou animais de estimação, onde há mais probabilidade de derrames, recomendamos reaplicação ao fim de 2 anos.` },
      { question: `Preciso de limpar o sofá antes de o impermeabilizar?`, answer: `Sim, e é altamente recomendado. Aplicar impermeabilização sobre tecido sujo reduz significativamente a eficácia e duração da barreira. Oferecemos o pack limpeza + impermeabilização com desconto em ${loc}.` },
      { question: `A impermeabilização funciona em sofás de veludo, pele e microfibra?`, answer: `Sim. Adaptamos a formulação ao tipo de tecido. Para veludo e tecidos delicados usamos produtos específicos que preservam a textura e o brilho característico do material.` },
      { question: `Qual a diferença de preço entre só impermeabilizar e fazer o pack limpeza + impermeabilização?`, answer: `Só impermeabilização: 59€ (1L), 79€ (2L), 99€ (3L). Pack com limpeza: 99€ (1L), 145€ (2L), 169€ (3L). O pack representa uma poupança considerável e garante maior eficácia da proteção.` },
    ],
    problems: [
      { title: "Sofá novo que quer proteger desde o início", description: "É muito mais fácil e económico proteger do que tratar manchas após o facto. Uma aplicação cria uma barreira invisível que dura 2 a 5 anos sem alterar o toque ou a cor." },
      { title: "Família com crianças pequenas ou animais de estimação", description: "Acidentes são inevitáveis. Sem proteção, cada derramamento pode tornar-se uma mancha permanente. A impermeabilização repele líquidos antes de penetrarem nas fibras." },
      { title: "Tecido delicado como veludo, pele ou microfibra", description: "Estes tecidos são difíceis de limpar sem danificar. Um erro de limpeza pode ser irreversível. A impermeabilização evita que o problema aconteça desde o início." },
    ],
    testimonials: [
      { name: "Susana L.", location: "Porto", text: "Protegemos o sofá novo logo na primeira semana. Dois meses depois o meu filho entornou sumo de manga em cima. Limpou-se com um papel. Valeu cada cêntimo sem qualquer dúvida." },
      { name: "David A.", location: "Vila Nova de Gaia", text: "Veludo cinzento claro. Toda a gente me dizia que ia ser impossível de manter. Com a impermeabilização já passou um ano e está impecável. Recomendo a qualquer pessoa com sofá de cor clara." },
    ],
  };
}

function content_impermeabilizacao_cadeiras(loc: string, ctx: string): ContentBlock {
  return {
    intro: `A impermeabilização de cadeiras estofadas em ${loc} protege o tecido de derramamentos, gordura e uso intensivo, ideal para restaurantes, escritórios e residências que querem cadeiras com aspeto cuidado por mais tempo. Kyro Clean Solutions ao domicílio em ${loc} e ${ctx}.`,
    whatIs: `Uma aplicação cria uma barreira transparente nas fibras das cadeiras que repele líquidos e gordura. A limpeza do dia a dia fica reduzida a uma passagem de pano húmido, e o tecido mantém o aspeto cuidado por anos. Aplicamos ao domicílio em ${loc}, de 2 cadeiras a centenas.`,
    benefits: [
      'Tecido repele derramamentos, café e gordura',
      'Manutenção diária reduzida a uma simples passagem de pano',
      'Prolonga o aspeto cuidado das cadeiras por anos',
      'Ideal para restaurantes, hotéis e escritórios',
      `Aplicação ao domicílio em ${loc}, sem transporte`,
      'Descontos progressivos para lotes acima de 6 cadeiras',
    ],
    processSteps: [
      { step: 1, title: 'Avaliação do tecido', description: `Inspecção do tipo de fibra de cada cadeira em ${loc}: veludo, mesh, tecido ou pele sintética.` },
      { step: 2, title: 'Limpeza prévia', description: 'Recomendamos limpeza das cadeiras antes da aplicação para máxima eficácia da barreira.' },
      { step: 3, title: 'Aplicação do impermeabilizante', description: 'Tratamento uniforme com produto certificado, adaptado ao tipo de tecido.' },
      { step: 4, title: 'Secagem rápida', description: 'Cadeiras prontas a usar em 1 a 2 horas, sem interrupção do negócio.' },
    ],
    faqs: [
      { question: `A impermeabilização das cadeiras facilita a limpeza diária do restaurante?`, answer: `Sim, muito. Derrames de vinho, café e molhos ficam à superfície e limpam-se com um pano — em vez de penetrarem nas fibras e criarem manchas permanentes. O tempo de limpeza diária reduz significativamente.` },
      { question: `A impermeabilização funciona em cadeiras de pele sintética ou só em tecido?`, answer: `Funciona nos dois. Para pele sintética o tratamento reforça a repelência natural do material. Para tecido (veludo, chenille, mesh) cria uma barreira nas fibras. Adaptamos o produto ao material.` },
      { question: `Quanto tempo ficam as cadeiras fora de uso depois da impermeabilização?`, answer: `A impermeabilização é rápida (15 a 30 minutos por lote) e a secagem demora 1 a 2 horas. As cadeiras ficam prontas a usar no mesmo dia, sem necessidade de fechar o espaço.` },
      { question: `Qual o desconto para impermeabilizar um lote de cadeiras de restaurante?`, answer: `25€/cad. para as primeiras 4 cadeiras, 20€/cad. da 5ª à 10ª. Para lotes acima de 10 cadeiras, orçamento personalizado para o seu restaurante em ${loc}.` },
      { question: `A impermeabilização das cadeiras resiste a derrames de gordura e molhos?`, answer: `Sim. A barreira repele gordura, molhos, vinho e bebidas. Para derrames de produtos muito ácidos (vinagre, sumos cítricos) é recomendado limpar rapidamente para preservar a barreira mais tempo.` },
    ],
    problems: [
      { title: "Cadeiras de jantar usadas diariamente", description: "A mesa de jantar é a zona de maior risco para derrames. Sem proteção, uma taça de vinho ou molho pode danificar o tecido de forma permanente e irreversível." },
      { title: "Veludo claro ou tecido de cor lisa", description: "Estas cadeiras mostram qualquer mancha de imediato. Sem impermeabilização, qualquer derrame cria uma marca visível que a limpeza doméstica não consegue remover." },
      { title: "Cadeiras de design, vintage ou de valor", description: "A reposição pode ser impossível ou muito cara. A impermeabilização profissional protege o investimento com uma barreira invisível que não altera o aspeto nem o toque." },
    ],
    testimonials: [
      { name: "Cristina B.", location: "Porto", text: "Restaurante com quarenta cadeiras de veludo. A limpeza diária reduziu para metade do tempo depois da impermeabilização. O tecido mantém-se muito melhor do que antes." },
      { name: "André F.", location: "Matosinhos", text: "Cadeiras de design da sala de jantar que queria mesmo proteger. Um ano depois nem uma marca visível. Foi claramente a decisão certa logo no início." },
    ],
  };
}

// ─── Testimonials por serviço (legado — mantido para compatibilidade) ──

const SERVICE_TESTIMONIALS: Record<ServiceKey, { name: string; city: string; stars: number; text: string }> = {
  sofa: {
    name: "Ana M.", city: "Porto", stars: 5,
    text: "O sofá de veludo estava com manchas de anos que eu achei impossíveis de tirar. O António chegou, tratou com um cuidado incrível e ficou como novo. Nem parece o mesmo sofá.",
  },
  colchao: {
    name: "Rui F.", city: "Braga", stars: 5,
    text: "Nunca pensei que o meu colchão pudesse ter tantos ácaros. Os meus filhos têm alergias e a diferença foi imediata, dormem muito melhor. Serviço impecável e com muito cuidado.",
  },
  tapetes: {
    name: "Sofia C.", city: "Lisboa", stars: 5,
    text: "Tapete persa de família com manchas de mais de 10 anos. Ficou perfeito. Trabalharam com muito cuidado e conheciam claramente o que faziam com fibras delicadas.",
  },
  cadeiras: {
    name: "João P.", city: "Vila Nova de Gaia", stars: 5,
    text: "Tenho um restaurante com 32 cadeiras. Resultado profissional, cadeiras como novas. Os clientes já comentaram a limpeza do espaço. Voltarei certamente a contratar.",
  },
  alcatifas: {
    name: "Dra. Carla V.", city: "Porto", stars: 5,
    text: "Clínica com alcatifa em três salas de espera. Serviço profissional, com ficha técnica dos produtos. Ideal para as nossas auditorias sanitárias anuais.",
  },
};

// ─── Generator map ─────────────────────────────────────────────────

const GENERATORS: Record<string, (loc: string, ctx: string) => ContentBlock> = {
  'higienizacao-sofa':      content_higienizacao_sofa,
  'higienizacao-colchao':   content_higienizacao_colchao,
  'higienizacao-tapetes':   content_higienizacao_tapetes,
  'higienizacao-cadeiras':  content_higienizacao_cadeiras,
  'higienizacao-alcatifas': content_higienizacao_alcatifas,
  'lavagem-sofa':           content_lavagem_sofa,
  'lavagem-colchao':        content_lavagem_colchao,
  'lavagem-tapetes':        content_lavagem_tapetes,
  'lavagem-cadeiras':           content_lavagem_cadeiras,
  'lavagem-alcatifas':          content_lavagem_alcatifas,
  'impermeabilizacao-sofa':     content_impermeabilizacao_sofa,
  'impermeabilizacao-cadeiras': content_impermeabilizacao_cadeiras,
};

const VARIANT_LABEL: Record<VariantKey, string> = {
  higienizacao:      'Higienização',
  lavagem:           'Lavagem',
  impermeabilizacao: 'Impermeabilização',
};

// ─── Core generator ────────────────────────────────────────────────

function buildData(
  variantKey: VariantKey,
  serviceKey: ServiceKey,
  locationPart: string,
  locationName: string,
  locationCtx: string,
  canonicalSuffix: string,
): KeywordVariantData {
  const svc = SERVICE_META[serviceKey];
  const variantLabel = VARIANT_LABEL[variantKey];
  const generator = GENERATORS[`${variantKey}-${serviceKey}`];
  const content = generator(locationName, locationCtx);
  const prep = cityPrep(locationName);
  const canonicalBase = VARIANT_CANONICAL_BASE[variantKey] ?? svc.canonicalBase;
  const priceFrom = variantKey === 'impermeabilizacao'
    ? (svc.waterproofPriceFrom ?? svc.priceFrom)
    : svc.priceFrom;

  return {
    slug: `${variantKey}-${serviceKey}-${locationPart}`,
    locationPart,
    locationName,
    serviceKey,
    variantKey,
    canonical: `/${canonicalBase}-${canonicalSuffix}`,
    title: `${variantLabel} de ${svc.label} ${prep} ${locationName} | Kyro Clean Solutions`,
    metaDescription: content.intro.slice(0, 155).trimEnd(),
    h1: `${variantLabel} Profissional de ${svc.label} ${prep} ${locationName}`,
    ...content,
    priceFrom,
  };
}

// ─── Public lookup (on-demand — no pre-allocation) ─────────────────

export function getKeywordVariantData(
  variantKey: VariantKey,
  serviceKey: ServiceKey,
  locationPart: string,
): KeywordVariantData | null {
  // Try city first
  const city = cities.find(c => c.slug === locationPart);
  if (city) {
    return buildData(
      variantKey, serviceKey,
      locationPart, city.name, city.description,
      `${city.slug}`, // canonical: /limpeza-sofas-porto
    );
  }

  // Try municipio-freg
  for (const mun of municipiosComFreguesias) {
    const prefix = `${mun.slug}-`;
    if (!locationPart.startsWith(prefix)) continue;
    const fregSlug = locationPart.slice(prefix.length);
    const freg = mun.freguesias.find(f => f.slug === fregSlug);
    if (!freg) continue;
    return buildData(
      variantKey, serviceKey,
      locationPart,
      `${freg.name}, ${mun.name}`,
      `uma das principais freguesias de ${mun.name}`,
      `${mun.slug}-${fregSlug}`, // canonical: /limpeza-sofas-porto-paranhos
    );
  }

  return null;
}

// ─── Route generation (cheap — only strings) ──────────────────────

export interface KeywordVariantRoute {
  path: string;
  variantKey: VariantKey;
  serviceKey: ServiceKey;
  locationPart: string;
}

export function getAllKeywordVariantRoutes(): KeywordVariantRoute[] {
  const routes: KeywordVariantRoute[] = [];
  const VARIANTS: VariantKey[] = ['higienizacao', 'lavagem', 'impermeabilizacao'];

  for (const v of VARIANTS) {
    const services = SERVICES_FOR_VARIANT[v];
    for (const s of services) {
      // Cities
      for (const city of cities) {
        routes.push({ path: `/${v}-${s}-${city.slug}`, variantKey: v, serviceKey: s, locationPart: city.slug });
      }
      // Parishes
      for (const mun of municipiosComFreguesias) {
        for (const freg of mun.freguesias) {
          const locPart = `${mun.slug}-${freg.slug}`;
          routes.push({ path: `/${v}-${s}-${locPart}`, variantKey: v, serviceKey: s, locationPart: locPart });
        }
      }
    }
  }
  return routes;
}
