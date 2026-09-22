import { CHAIR_WATERPROOF_ESSENTIAL } from '../constants/chairPricing';
// Central engine for keyword variant pages:
// higienizacao/lavagem × sofa/colchao/tapetes/cadeiras/alcatifas × all cities + parishes
// Content generated on demand — no 1 570-entry array kept in memory at module load.

import { cities, cityPrep } from './serviceCatalog';
import { municipiosComFreguesias } from './freguesiaSeoData';
import { getLandingFaqs, type LandingService } from './landingFaqPool';
import { getLandingEditorial } from './landingEditorial';

// ─── Types ─────────────────────────────────────────────────────────

export type ServiceKey = 'sofa' | 'colchao' | 'tapetes' | 'cadeiras' | 'alcatifas';
export type VariantKey = 'higienizacao' | 'lavagem' | 'impermeabilizacao';

export interface KeywordVariantData {
  faqs: { question: string; answer: string }[];
  slug: string;
  locationPart: string;
  locationName: string;
  municipality: string;
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
  problems: { title: string; description: string }[];
  testimonials: { name: string; location: string; text: string }[];
  priceFrom: string;
}

interface ContentBlock {
  intro: string;
  whatIs: string;
  benefits: string[];
  processSteps: { step: number; title: string; description: string }[];
  problems: { title: string; description: string }[];
  testimonials: { name: string; location: string; text: string }[];
}

// ─── Seeded pick (mesma técnica de freguesiaContentEngine.ts) ───────
// Cada content_X_Y tinha um único texto fixo para intro/whatIs — todas as
// freguesias com a mesma variante liam frases idênticas, só a com a cidade
// trocada. Confirmado real pelo /audit de 2026-09-06 (check_page_similarity.py
// com amostra justa: 6 de 9 páginas abaixo do limiar de conteúdo distinto).
// getSeed(loc) dá um número estável por localização; pick() escolhe sempre a
// mesma variante para a mesma cidade em builds diferentes.
// Multiplicador 31 é primo (coprimo com 3, 5, 8...) — importa mais do que
// parece: um multiplicador divisível por 3 (33, por exemplo) faz `hash % 3`
// depender quase só do ÚLTIMO caractere da string, e a esmagadora maioria
// destas localizações termina em ", Porto"/", Lisboa" — colidiam quase todas
// no mesmo índice. Confirmado com as 15 freguesias reais do Porto antes de
// aceitar esta versão (distribuição 6/5/4 em vez de 9/2/4 ou pior).
function getSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffffffff;
  return Math.abs(h);
}
function pick<T>(arr: readonly T[], seed: number): T {
  return arr[seed % arr.length];
}

// ─── Service metadata ──────────────────────────────────────────────

const SERVICE_META: Record<ServiceKey, {
  label: string; labelPlural: string; canonicalBase: string; priceFrom: string; waterproofPriceFrom?: string;
}> = {
  sofa:      { label: 'Sofá',      labelPlural: 'Sofás',      canonicalBase: 'limpeza-sofas',     priceFrom: '49€',     waterproofPriceFrom: '59€'      },
  colchao:   { label: 'Colchão',   labelPlural: 'Colchões',   canonicalBase: 'limpeza-colchoes',  priceFrom: '59€' },
  tapetes:   { label: 'Tapetes',   labelPlural: 'Tapetes',    canonicalBase: 'limpeza-tapetes',   priceFrom: 'Sob orçamento'                              },
  cadeiras:  { label: 'Cadeiras',  labelPlural: 'Cadeiras',   canonicalBase: 'limpeza-cadeiras',  priceFrom: '20€',     waterproofPriceFrom: `${CHAIR_WATERPROOF_ESSENTIAL}€/cad.`    },
  alcatifas: { label: 'Alcatifas', labelPlural: 'Alcatifas',  canonicalBase: 'limpeza-alcatifas', priceFrom: 'Sob orçamento'                             },
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
  const prep = cityPrep(loc);
  return {
    intro: `Limpeza de sofás ao domicílio ${prep} ${loc} por extração profunda. Consulte os preços por tamanho e envie fotografias para avaliarmos as manchas. Atendimento em ${ctx}.`,
    whatIs: 'A higienização remove sujidade acumulada nas fibras por extração. Avaliamos o tecido e o estado do sofá para escolher o tratamento adequado. A remoção de manchas e odores depende da sua origem, antiguidade e do material.',
    benefits: ['Extração de sujidade acumulada nas fibras', 'Tratamento adaptado ao tecido', 'Avaliação de manchas por fotografia', 'Preço confirmado antes do serviço', `Serviço ao domicílio ${prep} ${loc}`, 'Orientações de ventilação e secagem após o serviço'],
    processSteps: [
      { step: 1, title: 'Inspeção', description: 'Avaliação do estado e do tecido do sofá.' },
      { step: 2, title: 'Preparação', description: 'Aplicação do produto adequado ao material e à sujidade.' },
      { step: 3, title: 'Extração', description: 'Remoção de sujidade com equipamento profissional.' },
      { step: 4, title: 'Secagem', description: 'Normalmente 3 a 6 horas, dependendo do tecido e da ventilação.' },
    ],
    problems: [
      { title: 'Sujidade acumulada', description: 'O uso diário deixa resíduos nas fibras. A extração profissional permite uma limpeza mais profunda do que a aspiração doméstica.' },
      { title: 'Manchas e odores', description: 'Envie uma fotografia e explique a origem do problema para avaliarmos o tratamento adequado.' },
      { title: 'Cuidados com o tecido', description: 'Inspecionamos o material antes do serviço e explicamos os cuidados de secagem e manutenção.' },
    ],
    testimonials: [],
  };
}

function content_higienizacao_colchao(loc: string, ctx: string): ContentBlock {
  const seed = getSeed(loc + '|higienizacao-colchao');
  const seed2 = getSeed(loc + '|higienizacao-colchao_w');
  const seedB = getSeed(loc + '|higienizacao-colchao_b');
  const seedP = getSeed(loc + '|higienizacao-colchao_p');
  const seedT = getSeed(loc + '|higienizacao-colchao_t');
  return {
    intro: pick([
      `Passamos um terço da vida no colchão, por isso a higienização profissional do colchão em ${loc} é essencial para a saúde do sono. A Kyro Clean Solutions remove sujidade e resíduos das fibras e disponibiliza anti-ácaros e desbacterização como extras opcionais em ${loc}, ${ctx}.`,
      `Quer dormir melhor em ${loc}? O colchão acumula ácaros, bactérias e fungos ao longo dos anos, mesmo com lençóis lavados regularmente. A Kyro Clean Solutions elimina-os com protocolos de sanitização certificados em ${loc}, ${ctx}.`,
      `Um colchão nunca lavado profissionalmente pode ter milhões de ácaros nas suas camadas internas, mesmo parecendo limpo por fora. A higienização profissional em ${loc} elimina esses agentes com sanitização certificada, garantindo noites mais saudáveis em ${loc}, ${ctx}.`,
    ] as const, seed),
    whatIs: pick([
      `Passamos um terço da vida no colchão, por isso a higiene interna importa tanto como a externa. A limpeza remove sujidade e resíduos acumulados nas fibras. Anti-ácaros e desbacterização são tratamentos adicionais, escolhidos e orçamentados separadamente.`,
      `A parte de fora do colchão pode estar impecável enquanto as camadas internas acumulam ácaros e bactérias responsáveis por alergias nocturnas e espirros de manhã. O tratamento chega a essas camadas profundas sem produtos tóxicos, seguro para toda a família.`,
      `Lençóis limpos não significam colchão limpo: os ácaros e bactérias que causam alergias nocturnas e má qualidade de sono vivem nas camadas internas, fora do alcance da lavagem normal. Este tratamento remove-os sem produtos tóxicos, seguro para toda a família.`,
    ] as const, seed2),
    benefits: pick([
      [
        'Remoção de resíduos associados a ácaros e bactérias do colchão',
        'Melhoria comprovada da qualidade do sono',
        'Ideal para alérgicos, asmáticos e pessoas com rinite',
        'Seguro para bebés e grávidas',
        `Serviço ao domicílio em ${loc}`,
        'Colchão pronto a usar no mesmo dia',
      ],
      [
        'Limpeza profunda das fibras do colchão',
        'Sono comprovadamente mais tranquilo depois do tratamento',
        'Recomendado para alérgicos, asmáticos e quem sofre de rinite',
        'Seguro para bebés e mulheres grávidas',
        `Deslocação a partir de 10€ em ${loc}`,
        'Sem esperar dias: colchão pronto no mesmo dia',
      ],
    ] as const, seedB),
    processSteps: [
      { step: 1, title: 'Avaliação de contaminação', description: `Análise do nível de infestação e identificação de focos em ${loc}.` },
      { step: 2, title: 'Aspiração HEPA profunda', description: 'Remoção de resíduos associados a ácaros, esporos e detritos biológicos.' },
      { step: 3, title: 'Pré-tratamento de limpeza', description: 'Aplicação de produto certificado, seguro para contato com pele sensível.' },
      { step: 4, title: 'Secagem e aeração', description: 'Colchão pronto a usar no mesmo dia após aeração.' },
    ],
    problems: pick([
      [
        { title: "Acordar com olhos vermelhos ou nariz congestionado", description: `Os ácaros do colchão são a causa mais comum de rinite alérgica noturna em ${loc}. O corpo passa 8 horas em contacto direto com o foco de contaminação.` },
        { title: "Cheiro a suor mesmo depois de arejar", description: `Bactérias anaeróbias nas camadas internas do colchão produzem odores que o arejamento não elimina. Só a extração profissional alcança essa profundidade, algo comum nos pedidos que recebemos em ${loc}.` },
        { title: "Criança ou idoso com alergias respiratórias", description: "São os grupos mais vulneráveis a ácaros e alergénios do colchão. A higienização regular é especialmente recomendada para quem acorda com sintomas noturnos." },
      ],
      [
        { title: "Manhãs com nariz entupido e olhos irritados", description: `Passar 8 horas por noite em contacto direto com um colchão cheio de ácaros é a causa mais comum de rinite alérgica noturna em ${loc}.` },
        { title: "Cheiro a suor que o arejamento não tira", description: `As camadas internas do colchão escondem bactérias anaeróbias que produzem odores persistentes. Só a extração profissional chega a essa profundidade, um pedido frequente em ${loc}.` },
        { title: "Idosos e crianças com sintomas respiratórios ao acordar", description: "São os grupos mais expostos a ácaros e alergénios do colchão. A higienização regular ajuda especialmente quem acorda com sintomas todas as manhãs." },
      ],
    ] as const, seedP),
    testimonials: [pick([
      { name: "Catarina L.", location: "Braga", text: "A minha filha tem asma e desde que higienizámos o colchão os sintomas de manhã melhoraram bastante. Não esperava uma diferença tão notória num objeto que parecia limpo." },
      { name: "Paulo S.", location: "Vila Nova de Gaia", text: "Vieram no dia marcado, fizeram tudo em silêncio e foram embora. O colchão secou em menos tempo do que disseram. Resultado sem nada a apontar." },
    ] as const, seedT)],
  };
}

function content_higienizacao_tapetes(loc: string, ctx: string): ContentBlock {
  const seed = getSeed(loc + '|higienizacao-tapetes');
  const seed2 = getSeed(loc + '|higienizacao-tapetes_w');
  const seedB = getSeed(loc + '|higienizacao-tapetes_b');
  const seedP = getSeed(loc + '|higienizacao-tapetes_p');
  const seedT = getSeed(loc + '|higienizacao-tapetes_t');
  return {
    intro: pick([
      `Os tapetes da sua casa em ${loc} são um dos maiores reservatórios de alergénios no interior: acumulam ácaros, pólen, penas e bactérias nas suas fibras. A Kyro Clean Solutions oferece higienização profissional de tapetes em ${loc}, ${ctx}, tornando o chão seguro para crianças e alérgicos.`,
      `Precisa de higienizar os tapetes em ${loc}? As fibras acumulam ácaros, pólen e bactérias que a aspiração doméstica não alcança. A Kyro Clean Solutions oferece higienização profissional em ${loc}, ${ctx}, tornando o chão seguro para crianças e alérgicos.`,
      `Os tapetes em ${loc} concentram alergénios ao nível do chão, exatamente onde crianças e animais passam mais tempo: ácaros, pólen e bactérias acumulados nas fibras. A Kyro Clean Solutions higieniza profissionalmente em ${loc}, ${ctx}, tornando esse espaço seguro.`,
    ] as const, seed),
    whatIs: pick([
      `O tapete retém nos seus fios o pólen, ácaros e bactérias que entram em casa com os sapatos ou com os animais de estimação. Este tratamento remove esses alergénios em profundidade, tornando o chão seguro para crianças que brincam e para quem sofre de alergias em ${loc}.`,
      `Cada visita de sapatos ou de um animal de estimação deposita pólen, ácaros e bactérias nas fibras do tapete, que ali se acumulam com o tempo. O tratamento remove esses alergénios em profundidade, tornando o chão seguro para crianças e alérgicos em ${loc}.`,
      `As fibras do tapete funcionam como um filtro que nunca se limpa sozinho: retêm pólen, ácaros e bactérias trazidos de fora. Este tratamento remove-os em profundidade, tornando o chão seguro para crianças que brincam e para quem sofre de alergias em ${loc}.`,
    ] as const, seed2),
    benefits: pick([
      [
        'Tapete seguro para crianças que brincam no chão',
        'Remoção de pó e resíduos nas fibras',
        'Fibras preservadas, sem danos em tapetes delicados',
        'Melhoria da qualidade do ar interior',
        `Serviço ao domicílio em ${loc}`,
        'Eficaz em tapetes de lã, seda, sintéticos e persas',
      ],
      [
        'Chão seguro para crianças pequenas brincarem',
        'Remoção de resíduos acumulados nas fibras',
        'Fibras delicadas preservadas, sem risco de dano',
        'Ar interior visivelmente mais limpo',
        `Deslocação a partir de 10€ em ${loc}`,
        'Adaptado a lã, seda, sintéticos e tapetes persas',
      ],
    ] as const, seedB),
    processSteps: [
      { step: 1, title: 'Avaliação das fibras', description: `Identificação do tipo de tapete e nível de contaminação em ${loc}.` },
      { step: 2, title: 'Aspiração HEPA', description: 'Remoção profunda de ácaros, pólen e detritos das fibras.' },
      { step: 3, title: 'Sanitização antimicrobiana', description: 'Aplicação de agente certificado, adaptado ao tipo de fibra.' },
      { step: 4, title: 'Secagem controlada', description: 'Tapete seguro para uso em poucas horas, fibras intactas.' },
    ],
    problems: pick([
      [
        { title: "Criança que brinca no chão com espirros frequentes", description: "O tapete concentra ácaros, pólen e fungos nas fibras. Quando a criança rasteja ou brinca, inalha estes alergénios em concentração máxima ao nível do chão." },
        { title: "Animal de estimação que dorme no tapete", description: "Pelos, caspa e bactérias dos animais penetram nas fibras e multiplicam-se. A higienização remove alergénios de animais que a aspiração doméstica deixa para trás." },
        { title: "Espirros frequentes ou comichão nos olhos em casa", description: "O tapete liberta alergénios ao ser pisado, criando uma nuvem invisível ao nível do chão. A higienização profunda ajuda a remover partículas acumuladas." },
      ],
      [
        { title: "Espirros constantes quando a criança brinca no chão", description: "Ácaros, pólen e fungos concentram-se nas fibras do tapete, exatamente onde a criança inala mais concentração, ao rastejar ou brincar ao nível do chão." },
        { title: "Cão ou gato que passa horas deitado no tapete", description: "Pelos, caspa e bactérias dos animais acumulam-se e multiplicam-se nas fibras, ficando para trás mesmo depois da aspiração doméstica habitual." },
        { title: "Comichão nos olhos ou espirros frequentes em casa", description: "Cada vez que o tapete é pisado liberta uma nuvem invisível de alergénios ao nível do chão. A higienização profunda ajuda a remover partículas acumuladas." },
      ],
    ] as const, seedP),
    testimonials: [pick([
      { name: "Inês T.", location: "Lisboa", text: "Tapete persa de família com manchas que me recusava a tentar limpar em casa com medo de o estragar. Voltou a ficar como novo. Fico aliviada por não ter tentado sozinha." },
      { name: "Jorge A.", location: "Setúbal", text: "Tapete da sala com sete anos de uso diário. As cores que eu já nem me lembrava que eram assim voltaram. Fiquei genuinamente surpreendido com o que estava debaixo da sujidade." },
    ] as const, seedT)],
  };
}

function content_higienizacao_cadeiras(loc: string, ctx: string): ContentBlock {
  const seed = getSeed(loc + '|higienizacao-cadeiras');
  return {
    intro: pick([
      `Cadeiras de jantar, escritório ou restaurante acumulam manchas e resíduos com o uso diário. Fazemos higienização de cadeiras em ${loc}, ${ctx}, com avaliação do tecido antes de começar.`,
      `Precisa de renovar o aspeto das cadeiras em ${loc}? A limpeza profunda trata gordura e sujidade das zonas de contacto, com um processo adaptado ao material de cada cadeira.`,
      `Para casas e espaços de uso partilhado em ${loc}, a Kyro Clean Solutions limpa cadeiras estofadas ao domicílio. Pode acrescentar anti-ácaros ou desbacterização, como tratamentos opcionais com orçamento separado.`,
    ] as const, seed),
    whatIs: `A higienização de cadeiras em ${loc} remove sujidade e resíduos das fibras. A desbacterização é um tratamento adicional dirigido a bactérias; o anti-ácaros tem outro objetivo e é também opcional. Confirmamos o produto, a compatibilidade com o tecido e o preço de cada extra antes da marcação.`,
    benefits: ['Tratamento localizado de manchas e gordura', 'Processo adaptado ao tecido de cada cadeira', 'Anti-ácaros opcional, a 5€ por cadeira', 'Desbacterização opcional sob orçamento', 'Lotes de dez ou mais cadeiras sob orçamento', 'Secagem média de 3 a 6 horas, conforme ventilação'],
    processSteps: [
      { step: 1, title: 'Avaliação do material', description: `Inspeção do tecido, das manchas e das costuras em ${loc}.` },
      { step: 2, title: 'Pré-tratamento', description: 'Aplicação de solução de limpeza adequada à sujidade e ao tecido.' },
      { step: 3, title: 'Extração da sujidade', description: 'Extração dos resíduos e da humidade. Tratamentos adicionais só quando escolhidos no orçamento.' },
      { step: 4, title: 'Secagem e cuidados', description: 'Secagem média de 3 a 6 horas, dependendo da ventilação, tecido e condições do espaço.' },
    ],
    problems: [
      { title: 'Manchas e gordura nos assentos', description: 'Comida, bebidas e contacto diário deixam resíduos que podem exigir um tratamento localizado.' },
      { title: 'Cadeiras de uso partilhado', description: 'Peça limpeza e, se pretender um cuidado adicional, indique desbacterização ou anti-ácaros no orçamento.' },
      { title: 'Renovar o aspeto do espaço', description: 'Cadeiras com tecido cuidado ajudam a manter uma apresentação uniforme na sala, escritório ou restaurante.' },
    ],
    testimonials: [],
  };
}

function content_higienizacao_alcatifas(loc: string, ctx: string): ContentBlock {
  const seed = getSeed(loc + '|higienizacao-alcatifas');
  const seed2 = getSeed(loc + '|higienizacao-alcatifas_w');
  const seedB = getSeed(loc + '|higienizacao-alcatifas_b');
  const seedP = getSeed(loc + '|higienizacao-alcatifas_p');
  const seedT = getSeed(loc + '|higienizacao-alcatifas_t');
  return {
    intro: pick([
      `A higienização de alcatifas em ${loc} é crítica para hotéis, clínicas, escolas e espaços comerciais onde a saúde coletiva está em causa. A Kyro Clean Solutions aplica protocolos de sanitização certificados para grandes superfícies em ${loc}, ${ctx}, garantindo qualidade do ar interior e conformidade com normas de higiene.`,
      `Precisa de higienizar alcatifas em ${loc}? Hotéis, clínicas, escolas e espaços comerciais dependem desta manutenção para a saúde coletiva de quem os frequenta. A Kyro Clean Solutions aplica sanitização certificada para grandes superfícies em ${loc}, ${ctx}.`,
      `Alcatifas de espaços comerciais em ${loc} — hotéis, clínicas, escolas — acumulam pó e alergénios que afetam a qualidade do ar de toda a gente que ali passa. A Kyro Clean Solutions aplica protocolos de sanitização certificados para grandes superfícies em ${loc}, ${ctx}.`,
    ] as const, seed),
    whatIs: pick([
      `As alcatifas de espaços comerciais acumulam nas fibras densas grandes quantidades de pó, bactérias e alergénios que pioram a qualidade do ar. Este tratamento elimina-os com produtos aprovados para espaços públicos, melhorando o ar do espaço e facilitando auditorias de higiene em ${loc}.`,
      `As fibras densas de uma alcatifa comercial funcionam como um filtro que acumula pó, bactérias e alergénios ano após ano, afetando a qualidade do ar respirado. Este tratamento remove-os com produtos aprovados para espaços públicos, facilitando também auditorias de higiene em ${loc}.`,
      `Numa alcatifa de grande superfície, o pó, as bactérias e os alergénios acumulam-se muito mais depressa do que a aspiração normal consegue remover. Este tratamento elimina-os com produtos aprovados para espaços públicos, melhorando o ar interior e a conformidade com normas de higiene em ${loc}.`,
    ] as const, seed2),
    benefits: pick([
      [
        'Aprovado para espaços públicos, hotéis e clínicas',
        'Melhoria mensurável da qualidade do ar interior',
        'Agentes antimicrobianos para grandes superfícies',
        'Agendamento fora do horário de funcionamento',
        `Cobertura em ${loc} e toda a área envolvente`,
        'Relatório de higienização disponível',
      ],
      [
        'Aprovação para uso em hotéis, clínicas e espaços públicos',
        'Qualidade do ar interior com melhoria mensurável',
        'Agentes antimicrobianos adaptados a grandes superfícies',
        'Trabalho fora do horário de funcionamento do espaço',
        `Cobertura de ${loc} e área envolvente`,
        'Relatório de higienização entregue no final',
      ],
    ] as const, seedB),
    processSteps: [
      { step: 1, title: 'Aspiração industrial HEPA', description: `Remoção profunda de ácaros e alergénios em toda a superfície em ${loc}.` },
      { step: 2, title: 'Pré-tratamento de limpeza', description: 'Aplicação de agente de largo espectro aprovado para espaços públicos.' },
      { step: 3, title: 'Extração profunda', description: 'Extração da sujidade e dos resíduos acumulados nas fibras.' },
      { step: 4, title: 'Secagem acelerada', description: 'Espaço apto para uso em 3 a 6 horas com ventilação adequada.' },
    ],
    problems: pick([
      [
        { title: "Cheiro a bafio ou mofo em dias húmidos", description: `Fungos proliferam nas fibras densas das alcatifas quando há humidade acumulada em ${loc}. A higienização com agentes antifúngicos elimina o problema na raiz, não o mascara.` },
        { title: "Funcionários com sintomas respiratórios no espaço", description: "Alcatifas comerciais são o maior reservatório de alergénios em espaços fechados. A qualidade do ar interior melhora significativamente após higienização profissional." },
        { title: "Auditoria de qualidade do ar ou certificação pendente", description: "Emitimos relatório de higienização com ficha técnica dos produtos, aceite em auditorias de qualidade do ar interior e certificações de espaços de trabalho." },
      ],
      [
        { title: "Cheiro a mofo que aparece em dias de mais humidade", description: `A humidade acumulada nas fibras densas das alcatifas em ${loc} favorece a proliferação de fungos. Só agentes antifúngicos na higienização eliminam o problema, não apenas o mascaram.` },
        { title: "Queixas respiratórias entre quem trabalha no espaço", description: "Numa alcatifa comercial acumula-se o maior reservatório de alergénios de todo o espaço fechado. A qualidade do ar melhora de forma visível após a higienização." },
        { title: "Certificação ou auditoria de qualidade do ar a caminho", description: "O relatório de higienização com ficha técnica dos produtos usados é aceite em auditorias de qualidade do ar e em certificações de espaços de trabalho." },
      ],
    ] as const, seedP),
    testimonials: [pick([
      { name: "Dra. Sofia V.", location: "Porto", text: "Clínica com alcatifa em dois consultórios. Precisávamos de comprovativo para auditoria anual. Foram pontuais, profissionais e deixaram tudo em perfeitas condições." },
      { name: "Nuno A.", location: "Braga", text: "Hotel com alcatifas em todo o corredor principal. Não queríamos fechar ao público por isso fizeram o trabalho de madrugada. De manhã estava tudo pronto e sem cheiro a produtos." },
    ] as const, seedT)],
  };
}

function content_lavagem_sofa(loc: string, ctx: string): ContentBlock {
  const seed = getSeed(loc + '|lavagem-sofa');
  const seed2 = getSeed(loc + '|lavagem-sofa_w');
  const seedB = getSeed(loc + '|lavagem-sofa_b');
  const seedP = getSeed(loc + '|lavagem-sofa_p');
  const seedT = getSeed(loc + '|lavagem-sofa_t');
  return {
    intro: pick([
      `Precisa de lavar o sofá em ${loc}? A Kyro Clean Solutions realiza lavagem profunda por extração profissional, o método mais eficaz para remover manchas, gorduras e resíduos acumulados nas fibras. Ao contrário da limpeza seca, a lavagem por extração penetra nas camadas profundas do tecido, devolvendo o sofá ao estado original em ${loc}, ${ctx}.`,
      `A Kyro Clean Solutions faz lavagem profunda de sofás em ${loc} por extração profissional, o método mais eficaz para remover manchas, gorduras e resíduos das fibras. Diferente da limpeza seca, a extração penetra nas camadas profundas do tecido e devolve o sofá ao estado original em ${loc}, ${ctx}.`,
      `Manchas e gorduras acumuladas no sofá em ${loc} raramente saem só com limpeza seca. A Kyro Clean Solutions usa lavagem por extração profissional, que penetra nas camadas profundas do tecido e devolve o sofá ao estado original em ${loc}, ${ctx}.`,
    ] as const, seed),
    whatIs: pick([
      `A lavagem profissional é como uma limpeza por dentro do tecido: retira manchas, gordura acumulada e o escurecimento que o aspirador doméstico nunca consegue atingir. O sofá fica com as cores e o toque que tinha quando era novo, ao domicílio em ${loc}, sem mover o sofá.`,
      `Enquanto o aspirador doméstico só limpa a superfície, a lavagem profissional retira manchas, gordura acumulada e o escurecimento de dentro do próprio tecido. O sofá recupera as cores e o toque de quando era novo, ao domicílio em ${loc}, sem precisar de o mover.`,
      `O escurecimento e as manchas que se acumulam num sofá ao longo dos anos vivem dentro das fibras, fora do alcance de qualquer aspirador. A lavagem profissional chega a essa profundidade e devolve as cores e o toque originais, ao domicílio em ${loc}.`,
    ] as const, seed2),
    benefits: pick([
      [
        'Extração profunda com equipamento profissional',
        'Remove manchas antigas que a limpeza seca não consegue',
        'Devolve o aspeto original e as cores ao tecido',
        'Tecido macio como novo após a lavagem',
        `Lavagem ao domicílio em ${loc}`,
        'Secagem rápida: sofá pronto em 3 a 6 horas',
      ],
      [
        'Extração profunda com equipamento profissional dedicado',
        'Remove manchas antigas que resistem à limpeza seca',
        'Cores e aspeto original de volta ao tecido',
        'Tecido macio ao toque, como quando era novo',
        `Deslocação a partir de 10€ em ${loc}`,
        'Sofá pronto em 3 a 6 horas de secagem',
      ],
    ] as const, seedB),
    processSteps: [
      { step: 1, title: 'Mapeamento de manchas', description: `Identificação e avaliação de cada mancha por tipo em ${loc}.` },
      { step: 2, title: 'Pré-tratamento', description: 'Produto específico por tipo de mancha: gordura, vinho, urina, café.' },
      { step: 3, title: 'Lavagem por extração profissional', description: 'Injeção de solução quente e aspiração em profundidade das fibras.' },
      { step: 4, title: 'Secagem acelerada', description: 'Sofá pronto a usar em 3 a 6 horas com ventilação adequada.' },
    ],
    problems: pick([
      [
        { title: "Manchas de café, vinho ou gordura que não saem", description: `Líquidos penetram nas fibras em menos de 30 segundos e ligam-se ao tecido. A extração profissional a quente é o único método que os remove sem danificar o sofá em ${loc}.` },
        { title: "Sofá com aspeto escuro e cores apagadas", description: "Sujidade acumulada cobre o fio original e faz o sofá parecer mais velho. A lavagem por extração remove esta camada e revela as cores e a maciez originais do tecido." },
        { title: "Cheiro a estofo velho mesmo depois de aspirar", description: "A aspiração remove apenas sujidade superficial. Humidade e resíduos orgânicos nas fibras profundas produzem odores que só a extração aquosa elimina definitivamente." },
      ],
      [
        { title: "Manchas de vinho, café ou gordura que já não saem", description: `Bastam 30 segundos para um líquido penetrar nas fibras e ligar-se ao tecido. Só a extração profissional a quente as remove sem danificar o sofá em ${loc}.` },
        { title: "Sofá que foi escurecendo e perdendo a cor original", description: "É a sujidade acumulada, não a idade do sofá, que cobre o fio original e o faz parecer mais velho. A extração revela de novo as cores e a maciez do tecido." },
        { title: "Cheiro a estofo que persiste mesmo depois de aspirar", description: "A aspiração só remove sujidade da superfície. Nas fibras profundas, humidade e resíduos orgânicos geram odores que só a extração aquosa elimina de vez." },
      ],
    ] as const, seedP),
    testimonials: [pick([
      { name: "Filipa O.", location: "Porto", text: "Mancha de vinho tinto de quase dois anos. Eu já tinha aceite que ia ficar ali para sempre. Depois da lavagem desapareceu. Continuo sem perceber como é possível mas não me importo." },
      { name: "Bruno C.", location: "Vila Nova de Gaia", text: "Sofá de microfibra cinzenta que estava cada vez mais escuro com o uso. Depois da lavagem ficou da cor original. A diferença entre antes e depois é honestamente chocante." },
    ] as const, seedT)],
  };
}

function content_lavagem_colchao(loc: string, ctx: string): ContentBlock {
  const seed = getSeed(loc + '|lavagem-colchao');
  const seed2 = getSeed(loc + '|lavagem-colchao_w');
  const seedB = getSeed(loc + '|lavagem-colchao_b');
  const seedP = getSeed(loc + '|lavagem-colchao_p');
  const seedT = getSeed(loc + '|lavagem-colchao_t');
  return {
    intro: pick([
      `Manchas de suor, urina ou outros líquidos no colchão em ${loc}? A Kyro Clean Solutions realiza lavagem profunda por extração que remove manchas acumuladas nas camadas profundas do colchão, renovando-o completamente. Serviço ao domicílio em ${loc}, ${ctx}.`,
      `A Kyro Clean Solutions lava colchões em ${loc} por extração profunda, removendo manchas de suor, urina e outros líquidos acumuladas nas camadas internas. O colchão fica completamente renovado, com serviço ao domicílio em ${loc}, ${ctx}.`,
      `O colchão em ${loc} guarda manchas de suor, urina e outros líquidos nas suas camadas mais profundas, onde nenhum arejamento chega. A Kyro Clean Solutions remove-as por extração profissional, renovando o colchão por completo ao domicílio em ${loc}, ${ctx}.`,
    ] as const, seed),
    whatIs: pick([
      `Com o uso diário, o colchão absorve suor, líquidos e manchas nas suas camadas profundas, e o arejamento não chega para os remover. Este tratamento extrai essas impurezas de dentro do colchão, devolve o aspeto original e elimina os odores na raiz, tudo ao domicílio em ${loc}.`,
      `Todos os dias o colchão absorve suor e líquidos que se instalam nas suas camadas internas, onde nenhum arejamento consegue chegar. Este tratamento extrai essas impurezas de dentro do colchão, devolvendo o aspeto original e eliminando os odores na raiz, ao domicílio em ${loc}.`,
      `Arejar o colchão limpa apenas a superfície — o suor e os líquidos absorvidos ao longo do tempo ficam retidos nas camadas mais internas. Este tratamento extrai essas impurezas de dentro do colchão, devolvendo o aspeto original e eliminando os odores na raiz, ao domicílio em ${loc}.`,
    ] as const, seed2),
    benefits: pick([
      [
        'Remoção de manchas de suor, urina e sangue',
        'Extração profunda nas camadas interiores do colchão',
        `Eliminação de odores orgânicos acumulados em ${loc}`,
        `Colchão como novo em ${loc}: aspeto e frescura restaurados`,
        `Lavagem ao domicílio em ${loc}`,
        'Pronto a usar no mesmo dia',
      ],
      [
        'Manchas de suor, urina e sangue removidas',
        'Extração que chega às camadas mais interiores do colchão',
        `Odores orgânicos acumulados eliminados na origem em ${loc}`,
        `Aspeto e frescura de colchão novo restaurados em ${loc}`,
        `Deslocação a partir de 10€ em ${loc}`,
        'Sem esperar dias: pronto a usar no mesmo dia',
      ],
    ] as const, seedB),
    processSteps: [
      { step: 1, title: 'Identificação de manchas', description: `Mapeamento por tipo de mancha e avaliação da profundidade em ${loc}.` },
      { step: 2, title: 'Pré-tratamento enzimático', description: 'Aplicação de produto enzimático específico para manchas orgânicas.' },
      { step: 3, title: 'Extração profissional', description: 'Injeção de solução quente e aspiração profunda das fibras.' },
      { step: 4, title: 'Secagem e aeração', description: 'Colchão pronto a usar no mesmo dia com aeração adequada.' },
    ],
    problems: pick([
      [
        { title: "Manchas amareladas de suor que resistiram a tudo", description: "A oxidação do suor cria manchas proteicas que se ligam às fibras com o tempo. A lavagem enzimática a quente é o único método que as remove eficazmente sem danificar o colchão." },
        { title: "Mancha de urina com cheiro persistente", description: `A urina penetra fundo nas camadas do colchão. O pré-tratamento enzimático específico remove tanto a mancha visível como o odor das camadas internas, de forma definitiva, em qualquer morada dentro de ${loc}.` },
        { title: "Colchão com odor intenso apesar do arejamento", description: "Sujidade orgânica acumulada nas fibras internas produz odores que o arejamento não elimina. A extração profissional alcança essas camadas profundas e devolvem a frescura." },
      ],
      [
        { title: "Manchas amareladas de suor que nada em casa resolveu", description: "Com o tempo, a oxidação do suor cria manchas proteicas ligadas às fibras. Só a lavagem enzimática a quente as remove sem danificar o colchão." },
        { title: "Mancha de urina que ainda cheira, mesmo depois de limpar", description: `A urina penetra fundo nas camadas do colchão. O pré-tratamento enzimático remove a mancha visível e o odor de dentro para fora, de forma definitiva, ao domicílio em ${loc}.` },
        { title: "Odor intenso no colchão que o arejamento não resolve", description: "Nas fibras internas acumula-se sujidade orgânica que o simples arejar não elimina. A extração profissional chega a essas camadas e devolve a frescura." },
      ],
    ] as const, seedP),
    testimonials: [pick([
      { name: "Marta P.", location: "Lisboa", text: "O meu filho teve um acidente no colchão quando era bebé e nunca consegui tirar a mancha por completo. Finalmente desapareceu. Devia ter feito isto muito antes." },
      { name: "Tiago R.", location: "Coimbra", text: "Colchão novo há dois anos mas já com manchas amareladas de suor. Ficou como novo e o cheiro que havia também desapareceu. Não esperava um resultado tão completo." },
    ] as const, seedT)],
  };
}

function content_lavagem_tapetes(loc: string, ctx: string): ContentBlock {
  const seed = getSeed(loc + '|lavagem-tapetes');
  const seed2 = getSeed(loc + '|lavagem-tapetes_w');
  const seedB = getSeed(loc + '|lavagem-tapetes_b');
  const seedP = getSeed(loc + '|lavagem-tapetes_p');
  const seedT = getSeed(loc + '|lavagem-tapetes_t');
  return {
    intro: pick([
      `Precisa de lavar tapetes em ${loc}? A Kyro Clean Solutions faz lavagem especializada de tapetes de todos os tipos (persas, orientais, modernos e de lã) com extração profissional e recolha ao domicílio em ${loc}, ${ctx}. Cada tapete é medido e orçamentado individualmente.`,
      `A Kyro Clean Solutions faz lavagem especializada de tapetes em ${loc} — persas, orientais, modernos e de lã — com extração profissional e recolha ao domicílio em ${loc}, ${ctx}. Cada tapete é medido e orçamentado individualmente, sem tabela fixa por m².`,
      `Tapetes persas, orientais, modernos ou de lã em ${loc} pedem tratamento diferente consoante a fibra. A Kyro Clean Solutions faz lavagem especializada com extração profissional e recolha ao domicílio em ${loc}, ${ctx}, medindo e orçamentando cada peça individualmente.`,
    ] as const, seed),
    whatIs: pick([
      `A lavagem profissional retira a sujidade compactada que anos de aspiração deixaram para trás nas fibras, restaura as cores e o toque originais. Feita com produtos adaptados ao tipo de fibra (lã, seda, sintético ou persa) para que o tapete não corra riscos em ${loc}.`,
      `Anos de aspiração deixam sempre para trás uma camada de sujidade compactada nas fibras que só a lavagem profissional consegue remover, restaurando as cores e o toque originais. Os produtos são adaptados ao tipo de fibra (lã, seda, sintético ou persa) para que o tapete não corra riscos em ${loc}.`,
      `A sujidade que se compacta nas fibras de um tapete ao longo dos anos não sai só com aspiração — precisa de extração profissional para restaurar as cores e o toque originais. Cada produto é escolhido consoante o tipo de fibra (lã, seda, sintético ou persa) para não pôr o tapete em risco em ${loc}.`,
    ] as const, seed2),
    benefits: pick([
      [
        'Lavagem especializada para tapetes persas e orientais',
        `Restauração das cores e aspeto original em ${loc}`,
        'Remove manchas de gordura, vinho e animais',
        `Recolha e entrega ao domicílio em ${loc}`,
        'Técnicas específicas por tipo de fibra',
        'Secagem controlada: fibras preservadas',
      ],
      [
        'Especialistas em lavagem de tapetes persas e orientais',
        `Cores e aspeto original de volta ao tapete em ${loc}`,
        'Manchas de gordura, vinho e animais removidas',
        `Recolha e entrega ao domicílio em ${loc}`,
        'Cada fibra tratada com a técnica adequada',
        'Secagem controlada para preservar as fibras',
      ],
    ] as const, seedB),
    processSteps: [
      { step: 1, title: 'Avaliação do tapete', description: `Identificação do tipo de fibra e mapeamento de manchas em ${loc}.` },
      { step: 2, title: 'Pré-tratamento de manchas', description: 'Produto específico por tipo de mancha e tipo de fibra.' },
      { step: 3, title: 'Lavagem por extração profissional', description: 'Injeção de solução quente e aspiração da sujidade das fibras.' },
      { step: 4, title: 'Secagem controlada', description: 'Secagem adequada ao tipo de fibra para preservar forma e cores.' },
    ],
    problems: pick([
      [
        { title: "Manchas de café, molho ou vinho que ficaram", description: "As fibras absorvem líquidos em segundos. Quanto mais tempo passam, mais profundas ficam. A extração profissional remove a grande maioria das manchas antigas, mesmo de anos." },
        { title: "Tapete com aspeto opaco e cores desbotadas", description: "A sujidade acumulada cria uma camada que apaga as cores naturais das fibras. A lavagem profissional revela as cores originais e a textura real do tapete." },
        { title: "Tapete de qualidade com manchas que teme tratar em casa", description: "Tapetes persas, orientais ou de lã podem ser danificados por produtos errados. Avaliamos sempre antes de iniciar e usamos técnicas específicas por tipo de fibra." },
      ],
      [
        { title: "Manchas antigas de vinho, molho ou café no tapete", description: "Um líquido absorvido em segundos fica mais difícil de remover quanto mais tempo passa. A extração profissional resolve a grande maioria dos casos, mesmo com anos de idade." },
        { title: "Tapete com cores apagadas e aspeto baço", description: "É a sujidade acumulada, não o desgaste do material, que cria a camada opaca sobre as cores naturais. A lavagem profissional revela de novo a cor e a textura reais." },
        { title: "Medo de estragar um tapete persa, oriental ou de lã", description: "Produtos errados podem danificar estas fibras de forma irreversível. Cada tapete é avaliado antes de iniciar, com técnica adequada ao tipo de fibra." },
      ],
    ] as const, seedP),
    testimonials: [pick([
      { name: "Leonor S.", location: "Porto", text: "Tapete da entrada da loja completamente escurecido de tráfego. Depois da lavagem as cores voltaram e os clientes começaram a notar. Contratei de novo dois meses depois." },
      { name: "Henrique M.", location: "Braga", text: "Tapete de lã comprado há oito anos com manchas de vinho e café acumuladas. Não sabia que ia ficar tão bem. Quem o vê hoje não acredita na diferença." },
    ] as const, seedT)],
  };
}

function content_lavagem_cadeiras(loc: string, ctx: string): ContentBlock {
  const seed = getSeed(loc + '|lavagem-cadeiras');
  const seed2 = getSeed(loc + '|lavagem-cadeiras_w');
  const seedB = getSeed(loc + '|lavagem-cadeiras_b');
  const seedP = getSeed(loc + '|lavagem-cadeiras_p');
  const seedT = getSeed(loc + '|lavagem-cadeiras_t');
  return {
    intro: pick([
      `Lavagem de cadeiras estofadas em ${loc} para restaurantes, escritórios e residências. A Kyro Clean Solutions renova lotes de cadeiras com extração profissional, eliminando manchas e devolvendo um aspeto como novo. Serviço ao domicílio em ${loc}, ${ctx}.`,
      `A Kyro Clean Solutions renova lotes de cadeiras estofadas em ${loc} com extração profissional, eliminando manchas e devolvendo um aspeto como novo. Ideal para restaurantes, escritórios e residências, ao domicílio em ${loc}, ${ctx}.`,
      `Cadeiras estofadas de restaurantes, escritórios e residências em ${loc} acumulam manchas que a limpeza normal não remove. A Kyro Clean Solutions renova lotes inteiros com extração profissional, devolvendo um aspeto como novo ao domicílio em ${loc}, ${ctx}.`,
    ] as const, seed),
    whatIs: pick([
      `A lavagem profissional remove manchas de gordura, comida e suor que se acumularam nas fibras das cadeiras ao longo do tempo. Cadeiras com aspeto cuidado transmitem profissionalismo, e a secagem é rápida para que o espaço não fique parado. Feita ao domicílio em ${loc}.`,
      `Gordura, comida e suor acumulam-se nas fibras das cadeiras ao longo do tempo, mesmo com limpeza regular. A lavagem profissional remove essa sujidade em profundidade, com secagem rápida para o espaço não ficar parado, feita ao domicílio em ${loc}.`,
      `Cadeiras com aspeto cuidado transmitem profissionalismo — as manchas de gordura, comida e suor que se acumulam nas fibras ao longo do tempo não conseguem. A lavagem profissional remove-as com secagem rápida, ao domicílio em ${loc}.`,
    ] as const, seed2),
    benefits: pick([
      [
        'Ideal para lotes de cadeiras de restaurante e escritório',
        `Aspeto como novo em ${loc}: manchas e gorduras eliminadas`,
        'Cores revitalizadas em todos os tipos de tecido',
        'Secagem rápida: cadeiras prontas no mesmo dia',
        `Lavagem ao domicílio em ${loc}`,
        'Descontos progressivos para lotes grandes',
      ],
      [
        'Preparado para lotes de restaurante e escritório',
        `Manchas e gorduras eliminadas, aspeto renovado em ${loc}`,
        'Cores revitalizadas em qualquer tipo de tecido',
        'Cadeiras prontas no mesmo dia após secagem rápida',
        `Deslocação a partir de 10€ em ${loc}`,
        'Desconto progressivo quanto maior o lote',
      ],
    ] as const, seedB),
    processSteps: [
      { step: 1, title: 'Mapeamento de manchas', description: `Avaliação de cada cadeira e tipo de tecido em ${loc}.` },
      { step: 2, title: 'Pré-tratamento', description: 'Desengordurante e produto específico por tipo de mancha.' },
      { step: 3, title: 'Lavagem por extração profissional', description: 'Injeção de solução quente e aspiração em profundidade.' },
      { step: 4, title: 'Secagem rápida', description: 'Cadeiras prontas a usar no mesmo dia com ventilação adequada.' },
    ],
    problems: pick([
      [
        { title: "Cadeiras de jantar com manchas de comida acumuladas", description: "Gordura, molhos e bebidas acumulam-se nas fibras ao longo dos anos. A extração profissional remove estas manchas mesmo as mais antigas e profundas nas fibras." },
        { title: "Cadeiras de escritório com aspeto sujo e desgastado", description: "Cadeiras desgastadas transmitem desleixo a clientes e visitantes. A lavagem profissional devolve um aspeto cuidado e prolonga significativamente a vida útil do estofamento." },
        { title: "Manchas escuras nas zonas de contacto habitual", description: "O encosto e o assento ficam progressivamente mais escuros com o uso diário. A lavagem por extração remove esta sujidade compactada de forma profunda e eficaz." },
      ],
      [
        { title: "Cadeiras de jantar com anos de manchas de comida", description: "Gordura, molhos e bebidas acumulam-se nas fibras ao longo do tempo. A extração profissional remove mesmo as manchas mais antigas e profundas." },
        { title: "Cadeiras de escritório com aspeto desgastado à vista de todos", description: "Cadeiras com aspeto sujo transmitem desleixo a clientes e visitantes. A lavagem devolve um aspeto cuidado e prolonga a vida útil do estofamento." },
        { title: "Zonas de contacto habitual cada vez mais escuras", description: "O uso diário escurece progressivamente encosto e assento. A extração remove essa sujidade compactada de forma profunda." },
      ],
    ] as const, seedP),
    testimonials: [pick([
      { name: "Joana F.", location: "Porto", text: "Cadeiras de sala de jantar com gordura acumulada de anos. Limpei-as várias vezes em casa sem resultado. Numa única visita ficaram como novas. Não voltarei a tentar sozinha." },
      { name: "Rui B.", location: "Maia", text: "Seis cadeiras de escritório com manchas que já nem sabia de onde vinham. Parecem acabadas de comprar. Muito melhor do que esperava e a um preço razoável." },
    ] as const, seedT)],
  };
}

function content_lavagem_alcatifas(loc: string, ctx: string): ContentBlock {
  const seed = getSeed(loc + '|lavagem-alcatifas');
  const seed2 = getSeed(loc + '|lavagem-alcatifas_w');
  const seedB = getSeed(loc + '|lavagem-alcatifas_b');
  const seedP = getSeed(loc + '|lavagem-alcatifas_p');
  const seedT = getSeed(loc + '|lavagem-alcatifas_t');
  return {
    intro: pick([
      `Lavagem de alcatifas em ${loc} para hotéis, escritórios e grandes espaços comerciais. A Kyro Clean Solutions realiza extração profunda profissional em qualquer dimensão de alcatifa, com secagem rápida e mínima perturbação do negócio em ${loc}, ${ctx}.`,
      `A Kyro Clean Solutions faz lavagem de alcatifas em ${loc} com extração profunda profissional, em qualquer dimensão de superfície. Ideal para hotéis, escritórios e grandes espaços comerciais, com secagem rápida e mínima perturbação do negócio em ${loc}, ${ctx}.`,
      `Hotéis, escritórios e grandes espaços comerciais em ${loc} precisam de lavagem de alcatifa sem parar a atividade. A Kyro Clean Solutions faz extração profunda profissional em qualquer dimensão, com secagem rápida em ${loc}, ${ctx}.`,
    ] as const, seed),
    whatIs: pick([
      `A lavagem profissional penetra nas camadas mais densas da alcatifa e remove a sujidade que anos de aspiração deixaram para trás: manchas de passagem, derramamentos e a sujidade invisível das fibras. O resultado é visível no mesmo dia, com secagem em 3 a 6 horas em ${loc}.`,
      `Anos de aspiração deixam sempre uma camada de sujidade compactada nas fibras densas da alcatifa — manchas de passagem, derramamentos antigos, sujidade invisível. A lavagem profissional penetra até essa camada, com resultado visível no mesmo dia e secagem em 3 a 6 horas em ${loc}.`,
      `As manchas de passagem, derramamentos e sujidade que se acumulam numa alcatifa ao longo dos anos ficam presas nas fibras mais densas, fora do alcance da aspiração normal. A lavagem profissional remove-as, com resultado visível no mesmo dia e secagem em 3 a 6 horas em ${loc}.`,
    ] as const, seed2),
    benefits: pick([
      [
        'Equipamento comercial para grandes superfícies',
        'Remove manchas de passagem e derramamentos',
        'Secagem rápida: espaço apto em 3 a 6 horas',
        'Agendamento noturno e ao fim de semana',
        `Cobertura em ${loc} e toda a área envolvente`,
        'Orçamento competitivo à medida, mesmo em grandes áreas',
      ],
      [
        'Equipamento comercial adaptado a grandes superfícies',
        'Manchas de passagem e derramamentos removidos',
        'Espaço apto em 3 a 6 horas de secagem rápida',
        'Trabalho noturno e ao fim de semana sempre possível',
        `Cobertura de ${loc} e toda a área envolvente`,
        'Orçamento à medida e competitivo em grandes áreas',
      ],
    ] as const, seedB),
    processSteps: [
      { step: 1, title: 'Aspiração pré-lavagem', description: `Aspiração industrial para remoção de sujidade solta antes da lavagem em ${loc}.` },
      { step: 2, title: 'Aplicação de detergente', description: 'Produto profissional específico para alcatifas comerciais.' },
      { step: 3, title: 'Extração profissional', description: 'Lavagem a quente em profundidade e aspiração de alto volume.' },
      { step: 4, title: 'Secagem acelerada', description: 'Ventilação dirigida: espaço apto para uso em 3 a 6 horas.' },
    ],
    problems: pick([
      [
        { title: "Manchas em zonas de passagem ou entrada", description: `Corredores e entradas acumulam sujidade de calçado que compacta nas fibras em ${loc}. A lavagem profissional remove esta sujidade que a aspiração já não consegue extrair.` },
        { title: "Alcatifa com anos de sujidade compactada", description: "A aspiração regular não remove os resíduos que penetraram nas fibras ao longo do tempo. A lavagem por extração renova a alcatifa devolvendo o aspeto como novo." },
        { title: "Derramamento recente de café ou bebida", description: "Quanto mais rápida a intervenção profissional, maior a probabilidade de remoção total. A extração a quente remove o derramamento antes de se tornar mancha permanente." },
      ],
      [
        { title: "Zonas de entrada e corredores com manchas de calçado", description: `A sujidade de calçado compacta-se nas fibras dos corredores e entradas em ${loc}. Só a lavagem profissional consegue extrair o que a aspiração já não retira.` },
        { title: "Sujidade compactada acumulada ao longo dos anos", description: "A aspiração regular não chega aos resíduos que penetraram nas fibras com o tempo. A extração renova a alcatifa e devolve o aspeto como novo." },
        { title: "Café ou bebida acabados de entornar na alcatifa", description: "Quanto mais depressa a extração a quente intervier, maior a hipótese de remoção total, antes de o derramamento se tornar mancha permanente." },
      ],
    ] as const, seedP),
    testimonials: [pick([
      { name: "Carlos P.", location: "Porto", text: "Sede da empresa com alcatifa clara em toda a área de trabalho. Vieram ao fim de semana para não perturbar. Segunda-feira de manhã estava impecável. Fizemos já três vezes." },
      { name: "Teresa N.", location: "Aveiro", text: "Hotel com o corredor principal muito danificado. Já estava a ponderar substituir a alcatifa. Depois da lavagem mudei completamente de ideias. Ficou como quando foi colocada." },
    ] as const, seedT)],
  };
}

function content_impermeabilizacao_sofa(loc: string, ctx: string): ContentBlock {
  const seed = getSeed(loc + '|impermeabilizacao-sofa');
  const seed2 = getSeed(loc + '|impermeabilizacao-sofa_w');
  const seedB = getSeed(loc + '|impermeabilizacao-sofa_b');
  const seedP = getSeed(loc + '|impermeabilizacao-sofa_p');
  const seedT = getSeed(loc + '|impermeabilizacao-sofa_t');
  return {
    intro: pick([
      `A impermeabilização de sofás em ${loc} cria uma barreira invisível contra líquidos, manchas e gordura, protegendo o seu investimento sem alterar o toque ou a aparência do tecido. A Kyro Clean Solutions aplica tratamento certificado em ${loc}, ${ctx}, em duas versões: Essencial e Premium.`,
      `A Kyro Clean Solutions impermeabiliza sofás em ${loc}, criando uma barreira invisível contra líquidos, manchas e gordura sem alterar o toque ou a aparência do tecido. Tratamento certificado disponível em ${loc}, ${ctx}, em duas versões: Essencial e Premium.`,
      `Proteger o sofá em ${loc} contra líquidos, manchas e gordura não precisa de alterar o toque nem o aspeto do tecido. A Kyro Clean Solutions aplica tratamento certificado, em duas versões (Essencial e Premium), em ${loc}, ${ctx}.`,
    ] as const, seed),
    whatIs: pick([
      `Este tratamento cria uma barreira invisível no tecido do sofá: a próxima vez que cair café, vinho ou sumo, o líquido fica à superfície e limpa-se com um pano, sem mancha, sem stress. O toque e o aspeto do sofá ficam exactamente iguais. A versão Essencial (à base de água) protege por 1 a 2 anos, e a versão Premium (à base de diluente, mais resistente ao desgaste) protege até 10 anos em ${loc}.`,
      `Depois deste tratamento, café, vinho ou sumo entornado no sofá fica à superfície em vez de se infiltrar no tecido — limpa-se com um pano, sem mancha, sem stress. O toque e o aspeto do sofá ficam exactamente iguais. A versão Essencial (à base de água) protege por 1 a 2 anos, e a Premium (à base de diluente, mais resistente ao desgaste) protege até 10 anos em ${loc}.`,
      `Um derrame de café, vinho ou sumo deixa de ser motivo de stress depois deste tratamento: o líquido fica à superfície do tecido e limpa-se com um pano, sem mancha. O toque e o aspeto do sofá mantêm-se exactamente iguais. A versão Essencial (à base de água) protege por 1 a 2 anos; a Premium (à base de diluente, mais resistente ao desgaste) protege até 10 anos em ${loc}.`,
    ] as const, seed2),
    benefits: pick([
      [
        'Barreira invisível contra líquidos, manchas e gordura',
        'Toque e aspeto do tecido 100% preservados',
        'Essencial: até 2 lavagens, 1 a 2 anos de proteção real',
        'Premium: até 5 lavagens, até 10 anos de proteção real, mais resistente ao desgaste',
        `Serviço ao domicílio em ${loc}, sem deslocação do sofá`,
        'Seguro para tecidos naturais, sintéticos e veludo',
      ],
      [
        'Barreira invisível contra líquidos, manchas e gordura',
        'Toque e aspeto do tecido totalmente preservados',
        'Essencial: 1 a 2 anos de proteção real, até 2 lavagens',
        'Premium: até 10 anos de proteção real, até 5 lavagens, mais resistente ao desgaste',
        `Aplicação ao domicílio em ${loc}, o sofá não sai de casa`,
        'Compatível com tecidos naturais, sintéticos e veludo',
      ],
    ] as const, seedB),
    processSteps: [
      { step: 1, title: 'Avaliação do tecido', description: `Inspecção do tipo de fibra e estado do sofá em ${loc} para confirmar compatibilidade.` },
      { step: 2, title: 'Limpeza prévia', description: 'O sofá deve estar limpo antes da aplicação. Recomendamos limpeza prévia para resultado ideal.' },
      { step: 3, title: 'Escolha da versão e aplicação', description: 'Essencial (à base de água) ou Premium (à base de diluente), aplicada uniformemente em todo o tecido.' },
      { step: 4, title: 'Secagem e ativação', description: 'A barreira ativa-se na secagem: sofá pronto a usar em 3 a 6 horas.' },
    ],
    problems: pick([
      [
        { title: "Sofá novo que quer proteger desde o início", description: "É muito mais fácil e económico proteger do que tratar manchas após o facto. A versão Premium cria uma barreira invisível que dura até 10 anos sem alterar o toque ou a cor." },
        { title: "Família com crianças pequenas ou animais de estimação", description: `Acidentes são inevitáveis. Sem proteção, cada derramamento pode tornar-se uma mancha permanente. Para uso intenso, a versão Premium repele líquidos por mais tempo e aguenta mais lavagens do que a Essencial, um pedido comum em famílias de ${loc}.` },
        { title: "Tecido delicado como veludo, pele ou microfibra", description: `Estes tecidos são difíceis de limpar sem danificar. Um erro de limpeza pode ser irreversível. A impermeabilização evita que o problema aconteça desde o início, com aplicação ao domicílio em ${loc}.` },
      ],
      [
        { title: "Sofá acabado de comprar que merece proteção desde já", description: "Proteger desde o início é sempre mais fácil e económico do que tratar manchas depois. A Premium cria uma barreira invisível que dura até 10 anos, sem alterar toque ou cor." },
        { title: "Casa com crianças pequenas ou animais de estimação", description: `Um acidente é só uma questão de tempo. Sem proteção, o derramamento vira mancha permanente. Para uso intenso, a Premium repele líquidos por mais tempo e aguenta mais lavagens, opção habitual entre famílias em ${loc}.` },
        { title: "Tecidos delicados como veludo, pele ou microfibra", description: `São difíceis de limpar sem risco de dano irreversível. A impermeabilização evita que esse problema chegue a acontecer, com o serviço feito ao domicílio em ${loc}.` },
      ],
    ] as const, seedP),
    testimonials: [pick([
      { name: "Susana L.", location: "Porto", text: "Protegemos o sofá novo logo na primeira semana. Dois meses depois o meu filho entornou sumo de manga em cima. Limpou-se com um papel. Valeu cada cêntimo sem qualquer dúvida." },
      { name: "David A.", location: "Vila Nova de Gaia", text: "Veludo cinzento claro. Toda a gente me dizia que ia ser impossível de manter. Com a impermeabilização já passou um ano e está impecável. Recomendo a qualquer pessoa com sofá de cor clara." },
    ] as const, seedT)],
  };
}

function content_impermeabilizacao_cadeiras(loc: string, ctx: string): ContentBlock {
  const seed = getSeed(loc + '|impermeabilizacao-cadeiras');
  const seed2 = getSeed(loc + '|impermeabilizacao-cadeiras_w');
  const seedB = getSeed(loc + '|impermeabilizacao-cadeiras_b');
  const seedP = getSeed(loc + '|impermeabilizacao-cadeiras_p');
  const seedT = getSeed(loc + '|impermeabilizacao-cadeiras_t');
  return {
    intro: pick([
      `A impermeabilização de cadeiras estofadas em ${loc} protege o tecido de derramamentos, gordura e uso intensivo, ideal para restaurantes, escritórios e residências que querem cadeiras com aspeto cuidado por mais tempo. Kyro Clean Solutions ao domicílio em ${loc}, ${ctx}, com versão Essencial e versão Premium.`,
      `A Kyro Clean Solutions impermeabiliza cadeiras estofadas em ${loc}, protegendo o tecido de derramamentos, gordura e uso intensivo. Ideal para restaurantes, escritórios e residências, ao domicílio em ${loc}, ${ctx}, com versão Essencial e versão Premium.`,
      `Cadeiras estofadas em ${loc} sujeitas a derramamentos, gordura e uso intensivo mantêm o aspeto cuidado por muito mais tempo com impermeabilização. A Kyro Clean Solutions aplica ao domicílio em ${loc}, ${ctx}, com versão Essencial e versão Premium.`,
    ] as const, seed),
    whatIs: pick([
      `Uma aplicação cria uma barreira transparente nas fibras das cadeiras que repele líquidos e gordura. A limpeza do dia a dia fica reduzida a uma passagem de pano húmido. A versão Essencial (à base de água) mantém o aspeto cuidado por 1 a 2 anos, e a versão Premium (à base de diluente, mais resistente ao desgaste) por até 10 anos. Aplicamos ao domicílio em ${loc}, de 2 cadeiras a centenas.`,
      `Depois de uma aplicação, as fibras das cadeiras ganham uma barreira transparente que repele líquidos e gordura, reduzindo a limpeza do dia a dia a uma passagem de pano húmido. A versão Essencial (à base de água) mantém o aspeto cuidado por 1 a 2 anos, a Premium (à base de diluente, mais resistente ao desgaste) por até 10 anos. Aplicamos ao domicílio em ${loc}, de 2 cadeiras a centenas.`,
      `Líquidos e gordura deixam de penetrar nas fibras das cadeiras depois desta aplicação, que cria uma barreira transparente e reduz a limpeza do dia a dia a uma passagem de pano húmido. A Essencial (à base de água) protege por 1 a 2 anos, a Premium (à base de diluente, mais resistente ao desgaste) por até 10 anos. Aplicamos ao domicílio em ${loc}, de 2 cadeiras a centenas.`,
    ] as const, seed2),
    benefits: pick([
      [
        `Tecido repele derramamentos, café e gordura em ${loc}`,
        'Manutenção diária reduzida a uma simples passagem de pano',
        'Essencial: até 2 lavagens. Premium: até 5 lavagens, mais resistente ao desgaste',
        'Ideal para restaurantes, hotéis e escritórios de uso intenso (recomendamos a Premium)',
        `Aplicação ao domicílio em ${loc}, sem transporte`,
        'Descontos progressivos para lotes acima de 4 cadeiras',
      ],
      [
        `Derramamentos, café e gordura repelidos pelo tecido em ${loc}`,
        'Limpeza diária reduzida a uma simples passagem de pano',
        'Essencial: até 2 lavagens. Premium: até 5 lavagens, maior resistência ao desgaste',
        'Indicado para restaurantes, hotéis e escritórios de uso intenso (recomendamos a Premium)',
        `Aplicação ao domicílio em ${loc}, sem transportar nada`,
        'Desconto progressivo a partir de 4 cadeiras no lote',
      ],
    ] as const, seedB),
    processSteps: [
      { step: 1, title: 'Avaliação do tecido', description: `Inspecção do tipo de fibra de cada cadeira em ${loc}: veludo, mesh, tecido ou pele sintética.` },
      { step: 2, title: 'Limpeza prévia', description: 'Recomendamos limpeza das cadeiras antes da aplicação para máxima eficácia da barreira.' },
      { step: 3, title: 'Escolha da versão e aplicação', description: 'Essencial ou Premium, aplicada uniformemente com produto certificado, adaptado ao tipo de tecido.' },
      { step: 4, title: 'Secagem rápida', description: 'Cadeiras prontas a usar em 3 a 6 horas, sem interrupção do negócio.' },
    ],
    problems: pick([
      [
        { title: "Cadeiras de jantar usadas diariamente", description: `A mesa de jantar é a zona de maior risco para derrames. Sem proteção, uma taça de vinho ou molho pode danificar o tecido de forma permanente e irreversível, um cenário comum em casas de ${loc}.` },
        { title: "Veludo claro ou tecido de cor lisa", description: `Estas cadeiras mostram qualquer mancha de imediato. Sem impermeabilização, qualquer derrame cria uma marca visível que a limpeza doméstica não consegue remover, mesmo em ${loc}.` },
        { title: "Cadeiras de design, vintage ou de valor", description: `A reposição pode ser impossível ou muito cara. A impermeabilização profissional protege o investimento com uma barreira invisível que não altera o aspeto nem o toque, aplicada ao domicílio em ${loc}.` },
      ],
      [
        { title: "Cadeiras de jantar em uso todos os dias", description: `É à mesa de jantar que os derrames acontecem com mais frequência. Sem proteção, uma taça de vinho ou molho pode danificar o tecido de forma permanente, algo frequente em ${loc}.` },
        { title: "Cadeiras de veludo claro ou tecido de cor lisa", description: `Qualquer mancha aparece de imediato nestes tecidos. Sem impermeabilização, um derrame deixa marca visível que a limpeza doméstica não remove, mesmo em ${loc}.` },
        { title: "Cadeiras de design, peças vintage ou de valor elevado", description: `Substituir pode ser caro ou impossível. A barreira invisível da impermeabilização protege o investimento sem alterar aspeto nem toque, com aplicação ao domicílio em ${loc}.` },
      ],
    ] as const, seedP),
    testimonials: [pick([
      { name: "Cristina B.", location: "Porto", text: "Restaurante com quarenta cadeiras de veludo. A limpeza diária reduziu para metade do tempo depois da impermeabilização. O tecido mantém-se muito melhor do que antes." },
      { name: "André F.", location: "Matosinhos", text: "Cadeiras de design da sala de jantar que queria mesmo proteger. Um ano depois nem uma marca visível. Foi claramente a decisão certa logo no início." },
    ] as const, seedT)],
  };
}

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
  municipality: string,
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
    municipality,
    serviceKey,
    variantKey,
    canonical: `/${canonicalBase}-${canonicalSuffix}`,
    title: `${variantLabel} de ${svc.label} ${prep} ${locationName} | Kyro Clean Solutions`,
    h1: `${variantLabel} Profissional de ${svc.label} ${prep} ${locationName}`,
    ...content,
    ...getLandingEditorial({ family: 'variante', serviceSlug: variantKey === 'impermeabilizacao' ? 'impermeabilizacao' : ({ sofa: 'limpeza-sofas', colchao: 'limpeza-colchoes', tapetes: 'limpeza-tapetes', cadeiras: 'limpeza-cadeiras', alcatifas: 'limpeza-alcatifas' } as const)[serviceKey], serviceLabel: `${variantLabel} de ${svc.label}`, place: locationName, municipality }),
    faqs: getLandingFaqs({
      serviceSlug: variantKey === 'impermeabilizacao' ? 'impermeabilizacao' : ({ sofa: 'limpeza-sofas', colchao: 'limpeza-colchoes', tapetes: 'limpeza-tapetes', cadeiras: 'limpeza-cadeiras', alcatifas: 'limpeza-alcatifas' } satisfies Record<ServiceKey, LandingService>)[serviceKey],
      pageKey: `/${variantKey}-${serviceKey}-${locationPart}`,
      municipality,
      family: 'variante',
    }),
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
      city.name,
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
      mun.name,
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
