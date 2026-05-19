// Central engine for keyword variant pages:
// higienizacao/lavagem × sofa/colchao/tapetes/cadeiras/alcatifas × all cities + parishes
// Content generated on demand — no 1 570-entry array kept in memory at module load.

import { cities } from './locationSeoData';
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
  priceFrom: string;
}

interface ContentBlock {
  intro: string;
  whatIs: string;
  benefits: string[];
  processSteps: { step: number; title: string; description: string }[];
  faqs: { question: string; answer: string }[];
}

// ─── Service metadata ──────────────────────────────────────────────

const SERVICE_META: Record<ServiceKey, {
  label: string; labelPlural: string; canonicalBase: string; priceFrom: string; waterproofPriceFrom?: string;
}> = {
  sofa:      { label: 'Sofá',      labelPlural: 'Sofás',      canonicalBase: 'limpeza-sofas',     priceFrom: '49€',     waterproofPriceFrom: '49€'      },
  colchao:   { label: 'Colchão',   labelPlural: 'Colchões',   canonicalBase: 'limpeza-colchoes',  priceFrom: '39€',     waterproofPriceFrom: '45€'      },
  tapetes:   { label: 'Tapetes',   labelPlural: 'Tapetes',    canonicalBase: 'limpeza-tapetes',   priceFrom: '5€/m²'                                    },
  cadeiras:  { label: 'Cadeiras',  labelPlural: 'Cadeiras',   canonicalBase: 'limpeza-cadeiras',  priceFrom: '17,50€',  waterproofPriceFrom: '15€/cad.' },
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
  impermeabilizacao: ['sofa', 'colchao', 'cadeiras'],
};

// ─── Content generators (one per variant × service) ────────────────
// loc = display name ("Porto" or "Paranhos, Porto"), ctx = context phrase

function content_higienizacao_sofa(loc: string, ctx: string): ContentBlock {
  return {
    intro: `A higienização profissional do sofá em ${loc} vai além da limpeza visual: eliminamos os agentes patogénicos invisíveis que afetam a saúde da sua família. A Kyro Clean Solutions usa protocolos de sanitização certificados para remover ácaros, bactérias, fungos e alergénios acumulados nos tecidos em ${loc} e ${ctx}.`,
    whatIs: `A higienização de sofá é um processo de sanitização profunda que elimina microrganismos patogénicos (ácaros, bactérias e fungos) que se acumulam nos tecidos com o uso diário. Ao contrário da limpeza convencional, a higienização usa agentes antimicrobianos certificados e aspiração HEPA para garantir um ambiente verdadeiramente saudável. Especialmente recomendada para famílias com bebés, crianças, idosos e alérgicos em ${loc}.`,
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
      { question: `Qual a diferença entre higienização e limpeza de sofá em ${loc}?`, answer: `A limpeza remove sujidade visível: manchas e pó. A higienização vai mais longe: elimina ácaros, bactérias e fungos com agentes antimicrobianos certificados. Em ${loc}, a Kyro Clean oferece ambos, podendo combiná-los para resultado completo.` },
      { question: `A higienização de sofá elimina ácaros em ${loc}?`, answer: `Sim. O processo elimina até 99,9% dos ácaros com aspiração HEPA e tratamento antimicrobiano certificado, ideal para alérgicos em ${loc}.` },
      { question: 'Com que frequência devo higienizar o sofá?', answer: 'Para famílias com bebés, crianças ou alérgicos, recomendamos a cada 6 meses. Para uso normal, uma vez por ano é suficiente.' },
      { question: `A higienização é segura para bebés em ${loc}?`, answer: 'Sim. Usamos apenas produtos certificados e hipoalergénicos para uso doméstico. O sofá pode ser utilizado poucas horas após o tratamento.' },
      { question: `Quanto custa higienizar um sofá em ${loc}?`, answer: `Começa a partir de 49€ para sofás de 2 lugares. Peça orçamento gratuito, deslocamo-nos a ${loc} e toda a área envolvente.` },
    ],
  };
}

function content_higienizacao_colchao(loc: string, ctx: string): ContentBlock {
  return {
    intro: `Passamos um terço da vida no colchão, por isso a higienização profissional do colchão em ${loc} é essencial para a saúde do sono. A Kyro Clean Solutions elimina ácaros, bactérias e fungos com protocolos de sanitização certificados, garantindo noites mais saudáveis em ${loc} e ${ctx}.`,
    whatIs: `A higienização de colchão elimina os microrganismos que proliferam enquanto dormimos: ácaros, bactérias, fungos e alergénios. Um colchão pode conter até 2 milhões de ácaros; a aspiração HEPA e o tratamento antimicrobiano certificado reduzem este número em 99,9%, melhorando a qualidade do sono e reduzindo alergias noturnas em ${loc}.`,
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
      { question: `Qual a diferença entre higienização e limpeza de colchão em ${loc}?`, answer: `A limpeza remove manchas e sujidade visível. A higienização elimina microrganismos com agentes antimicrobianos certificados. Em ${loc}, recomendamos combiná-las para resultado completo.` },
      { question: 'Com que frequência devo higienizar o colchão?', answer: 'Para alérgicos e famílias com bebés, a cada 6 meses. Para uso geral, uma vez por ano. Crianças beneficiam de higienização trimestral.' },
      { question: `A higienização é segura para grávidas e recém-nascidos em ${loc}?`, answer: 'Sim. Usamos produtos hipoalergénicos e certificados, sem compostos tóxicos. Certificado de segurança disponível.' },
      { question: 'A higienização remove o cheiro de suor do colchão?', answer: 'Sim. O processo inclui desodorização enzimática que elimina odores de suor, urina e humidade acumulados nas fibras.' },
      { question: `Quanto custa higienizar um colchão em ${loc}?`, answer: `Começa a partir de 39€ para colchão de solteiro. Peça orçamento gratuito, deslocamo-nos a ${loc} sem custos adicionais.` },
    ],
  };
}

function content_higienizacao_tapetes(loc: string, ctx: string): ContentBlock {
  return {
    intro: `Os tapetes da sua casa em ${loc} são um dos maiores reservatórios de alergénios no interior: acumulam ácaros, pólen, penas e bactérias nas suas fibras. A Kyro Clean Solutions oferece higienização profissional de tapetes em ${loc} e ${ctx}, tornando o chão seguro para crianças e alérgicos.`,
    whatIs: `A higienização de tapetes vai além da lavagem convencional: usa agentes antimicrobianos certificados e aspiração HEPA para eliminar microrganismos que vivem nas fibras. Crianças que brincam no chão estão em contacto direto com estes alergénios. A higienização profissional em ${loc} remove 99,9% dos ácaros, bactérias e alergénios, melhorando a qualidade do ar interior.`,
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
      { question: `Qual a diferença entre higienização e lavagem de tapetes em ${loc}?`, answer: `A lavagem usa extração aquosa para remover manchas. A higienização usa agentes antimicrobianos para eliminar microrganismos. Para tapetes com crianças, recomendamos a combinação dos dois em ${loc}.` },
      { question: 'A higienização danifica tapetes persas ou de lã?', answer: 'Não. Avaliamos o tipo de fibra antes de iniciar e usamos produtos adaptados. Tapetes delicados recebem tratamento específico sem riscos.' },
      { question: `Com que frequência higienizar tapetes em ${loc}?`, answer: 'Para famílias com crianças pequenas ou alérgicos, a cada 6 meses. Para uso geral, uma vez por ano é suficiente.' },
      { question: 'A higienização remove os pelos do animal de estimação?', answer: 'Sim. O processo remove pelos, alergénios de animais e bactérias associadas, tornando o tapete seguro para toda a família.' },
      { question: `Quanto custa higienizar tapetes em ${loc}?`, answer: `A partir de 5€/m². Peça orçamento gratuito, deslocamo-nos a ${loc} com todo o equipamento necessário.` },
    ],
  };
}

function content_higienizacao_cadeiras(loc: string, ctx: string): ContentBlock {
  return {
    intro: `A higienização de cadeiras estofadas em ${loc} é essencial para restaurantes, escritórios e clínicas que partilham superfícies entre múltiplos utilizadores. A Kyro Clean Solutions aplica bactericida certificado que elimina 99,9% dos microrganismos em cadeiras de uso partilhado em ${loc} e ${ctx}.`,
    whatIs: `Cadeiras de uso partilhado (restaurante, escritório, sala de espera) acumulam bactérias, vírus e fungos que a limpeza convencional não elimina. A higienização profissional usa agentes bactericidas certificados compatíveis com normas HACCP, garantindo superfícies seguras para clientes e colaboradores em ${loc}. Ideal para certificações de higiene e inspeções sanitárias.`,
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
      { question: `A higienização de cadeiras é obrigatória para restaurantes em ${loc}?`, answer: `As normas HACCP exigem higienização regular de todas as superfícies que contactam com clientes. Em ${loc}, a Kyro Clean emite certificado de higienização após cada serviço.` },
      { question: 'Com que frequência higienizar cadeiras de restaurante?', answer: 'Recomendamos mensalmente para restaurantes em funcionamento contínuo. Para escritórios, trimestralmente é suficiente.' },
      { question: `Fazem higienização de lotes de cadeiras em ${loc}?`, answer: `Sim. Deslocamo-nos a ${loc} para lotes de qualquer dimensão, desde 5 cadeiras de sala de jantar até centenas de cadeiras de escritório.` },
      { question: 'A higienização danifica o tecido das cadeiras?', answer: 'Não. Avaliamos sempre o tipo de tecido antes de iniciar. O bactericida é adaptado ao material: tecido, pele sintética, veludo ou mesh.' },
      { question: `Quanto custa higienizar cadeiras em ${loc}?`, answer: `A partir de 17,50€ por cadeira com descontos progressivos para lotes. Peça orçamento personalizado para o seu negócio em ${loc}.` },
    ],
  };
}

function content_higienizacao_alcatifas(loc: string, ctx: string): ContentBlock {
  return {
    intro: `A higienização de alcatifas em ${loc} é crítica para hotéis, clínicas, escolas e espaços comerciais onde a saúde coletiva está em causa. A Kyro Clean Solutions aplica protocolos de sanitização certificados para grandes superfícies em ${loc} e ${ctx}, garantindo qualidade do ar interior e conformidade com normas de higiene.`,
    whatIs: `Em grandes superfícies de alcatifa, os microrganismos multiplicam-se entre lavagens convencionais, comprometendo a qualidade do ar interior. A higienização profissional usa aspiração industrial HEPA e agentes antimicrobianos aprovados para uso em espaços públicos em ${loc}. Ideal para auditorias sanitárias e certificações de qualidade do ar.`,
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
      { question: `Com que frequência higienizar alcatifas em espaços comerciais em ${loc}?`, answer: `Para hotéis e clínicas, recomendamos mensalmente. Para escritórios em ${loc}, trimestralmente. Emitimos relatório após cada serviço para auditorias.` },
      { question: 'A higienização cumpre normas para clínicas e hospitais?', answer: 'Sim. Usamos produtos aprovados para ambientes médicos e podemos fornecer ficha técnica dos produtos usados para conformidade regulatória.' },
      { question: `Fazem higienização de alcatifas fora do horário em ${loc}?`, answer: `Sim. Trabalhamos em horário noturno e ao fim de semana para minimizar a perturbação do negócio em ${loc}.` },
      { question: 'Quanto tempo ficam as alcatifas molhadas?', answer: 'Com extração de alta sucção e ventilação adequada, as alcatifas ficam prontas em 2-4 horas.' },
      { question: `Qual o preço de higienização de alcatifas em ${loc}?`, answer: `A partir de 3€/m² com descontos por volume para grandes superfícies. Orçamento gratuito para o seu espaço em ${loc}.` },
    ],
  };
}

function content_lavagem_sofa(loc: string, ctx: string): ContentBlock {
  return {
    intro: `Precisa de lavar o sofá em ${loc}? A Kyro Clean Solutions realiza lavagem profunda por extração profissional, o método mais eficaz para remover manchas, gorduras e resíduos acumulados nas fibras. Ao contrário da limpeza seca, a lavagem por extração penetra nas camadas profundas do tecido, devolvendo o sofá ao estado original em ${loc} e ${ctx}.`,
    whatIs: `A lavagem de sofá por extração é o método profissional mais eficaz para renovar tecidos desgastados em ${loc}. A máquina de extração injeta solução quente nas fibras e aspira de volta toda a sujidade, manchas e gordura, incluindo resíduos impossíveis de remover com limpeza doméstica. O resultado é um sofá com aspeto renovado, cores revitalizadas e tecido macio.`,
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
      { question: `Qual a diferença entre lavagem e limpeza de sofá em ${loc}?`, answer: `A lavagem usa extração aquosa: injeta solução quente e aspira a sujidade. A limpeza seca usa agentes químicos sem água. Em ${loc}, a Kyro avalia o tipo de tecido e escolhe o método ideal.` },
      { question: 'A lavagem por extração danifica o tecido?', answer: 'Não. Avaliamos sempre o tipo de tecido. Seguro para microfibra, algodão, linho e chenille. Para tecidos delicados como seda, usamos métodos alternativos.' },
      { question: 'Quanto tempo fica o sofá húmido após a lavagem?', answer: 'Com extração de alta sucção, o sofá fica pronto em 4 a 6 horas. Em dias quentes com ventilação, pode secar mais rápido.' },
      { question: `A lavagem remove manchas de anos em ${loc}?`, answer: `Sim, na grande maioria dos casos. A extração profissional remove manchas antigas de café, vinho, gordura e líquidos. Manchas muito antigas podem precisar de tratamento adicional; avaliamos gratuitamente em ${loc}.` },
      { question: `Quanto custa a lavagem de sofá em ${loc}?`, answer: `A partir de 49€ para sofás de 2 lugares. Peça orçamento gratuito, deslocamo-nos a ${loc} sem compromisso.` },
    ],
  };
}

function content_lavagem_colchao(loc: string, ctx: string): ContentBlock {
  return {
    intro: `Manchas de suor, urina ou outros líquidos no colchão em ${loc}? A Kyro Clean Solutions realiza lavagem profunda por extração que remove manchas acumuladas nas camadas profundas do colchão, renovando-o completamente. Serviço ao domicílio em ${loc} e ${ctx}.`,
    whatIs: `A lavagem de colchão por extração remove manchas de suor, urina, sangue e outros líquidos que penetraram nas fibras com o uso diário. Ao contrário da simples higienização superficial, a lavagem profissional injeta solução quente e aspira toda a sujidade orgânica das camadas profundas do colchão em ${loc}, devolvendo-lhe o aspeto original e eliminando odores.`,
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
      { question: `Qual a diferença entre lavagem e higienização de colchão em ${loc}?`, answer: `A lavagem remove manchas físicas com extração aquosa. A higienização elimina microrganismos com agentes antimicrobianos. Para resultado completo em ${loc}, combinamos ambos.` },
      { question: 'A lavagem remove manchas de urina de crianças?', answer: 'Sim. O pré-tratamento enzimático específico para urina remove tanto a mancha como o odor, mesmo em manchas antigas de anos.' },
      { question: 'A lavagem remove manchas antigas de suor?', answer: 'Sim, na grande maioria dos casos. A extração a quente penetra nas fibras e remove manchas amareladas de suor que resistiram a tentativas domésticas.' },
      { question: 'Quanto tempo fica o colchão húmido?', answer: 'Com o nosso sistema de alta sucção, o colchão fica pronto a usar no mesmo dia, tipicamente em 4-6 horas.' },
      { question: `Quanto custa a lavagem de colchão em ${loc}?`, answer: `A partir de 39€ para colchão de solteiro. Peça orçamento gratuito, deslocamo-nos a ${loc} sem custos adicionais.` },
    ],
  };
}

function content_lavagem_tapetes(loc: string, ctx: string): ContentBlock {
  return {
    intro: `Precisa de lavar tapetes em ${loc}? A Kyro Clean Solutions faz lavagem especializada de tapetes de todos os tipos (persas, orientais, modernos e de lã) com extração profissional e recolha ao domicílio em ${loc} e ${ctx}. Preços desde 5€/m².`,
    whatIs: `A lavagem de tapetes por extração é o método profissional mais eficaz para renovar fibras desgastadas em ${loc}. A máquina de extração injeta solução quente e aspira a sujidade, manchas e gordura das fibras, restaurando cores e devolvendo o tapete ao seu estado original. Para tapetes persas e delicados, usamos técnicas e produtos específicos que preservam as fibras sem riscos.`,
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
      { question: `Fazem lavagem de tapetes persas em ${loc}?`, answer: `Sim. Temos experiência em tapetes persas, orientais e de lã. Usamos produtos e técnicas específicas para preservar fibras e cores naturais em ${loc}.` },
      { question: 'Fazem recolha e entrega de tapetes ao domicílio?', answer: `Sim. Recolhemos e entregamos tapetes ao domicílio em ${loc} e toda a área envolvente, sem custos para encomendas acima de 50€.` },
      { question: 'Quanto tempo demora a lavagem e secagem do tapete?', answer: 'O processo completo demora 3-5 dias úteis dependendo do tipo e tamanho do tapete. Tapetes sintéticos secam mais rápido.' },
      { question: 'A lavagem restaura as cores originais do tapete?', answer: 'Sim. A lavagem por extração remove sujidade profunda que opaca as cores, revelando a vivacidade original das fibras naturais.' },
      { question: `Qual o preço de lavagem de tapetes em ${loc}?`, answer: `A partir de 5€/m². O preço final depende do tipo de tapete e estado de sujidade. Orçamento gratuito em ${loc}.` },
    ],
  };
}

function content_lavagem_cadeiras(loc: string, ctx: string): ContentBlock {
  return {
    intro: `Lavagem de cadeiras estofadas em ${loc} para restaurantes, escritórios e residências. A Kyro Clean Solutions renova lotes de cadeiras com extração profissional, eliminando manchas e devolvendo um aspeto como novo. Serviço ao domicílio em ${loc} e ${ctx}.`,
    whatIs: `A lavagem de cadeiras por extração remove manchas de gordura, alimentos, suor e líquidos acumulados no estofamento ao longo do uso. Em ${loc}, restaurantes e escritórios beneficiam especialmente deste serviço; cadeiras limpas transmitem cuidado e profissionalismo ao cliente. A extração profissional injeta solução quente nas fibras e aspira toda a sujidade em profundidade, com secagem rápida.`,
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
      { question: `Quantas cadeiras conseguem lavar por dia em ${loc}?`, answer: `A nossa equipa consegue lavar entre 20 a 50 cadeiras por dia dependendo do estado. Agendamos ao fim de semana ou à noite para não perturbar o negócio em ${loc}.` },
      { question: 'Quanto tempo ficam as cadeiras húmidas após a lavagem?', answer: 'Com o nosso sistema de alta sucção, as cadeiras ficam prontas a usar em 2 a 4 horas. Em dias quentes, menos.' },
      { question: `Fazem lavagem de cadeiras com o restaurante aberto em ${loc}?`, answer: `Trabalhamos fora do horário de expediente, ao fim de semana, à noite ou de madrugada, para não interromper o funcionamento do restaurante em ${loc}.` },
      { question: 'Qual o desconto para lotes grandes de cadeiras?', answer: 'Até 3 cadeiras: 17,50€/cad. De 4 a 6: 15€/cad. Acima de 10: 12,50€/cad. Contacte-nos para orçamento para o seu espaço.' },
      { question: `Quanto custa lavar cadeiras em ${loc}?`, answer: `A partir de 12,50€ por cadeira em lotes grandes. Peça orçamento gratuito para o seu restaurante ou escritório em ${loc}.` },
    ],
  };
}

function content_lavagem_alcatifas(loc: string, ctx: string): ContentBlock {
  return {
    intro: `Lavagem de alcatifas em ${loc} para hotéis, escritórios e grandes espaços comerciais. A Kyro Clean Solutions realiza extração profunda profissional em qualquer dimensão de alcatifa, com secagem rápida e mínima perturbação do negócio em ${loc} e ${ctx}.`,
    whatIs: `A lavagem de alcatifas por extração profissional é o método mais eficaz para grandes superfícies em ${loc}. A máquina injeta solução aquecida nas fibras e aspira toda a sujidade acumulada, incluindo manchas de passagem frequente, derramamentos e resíduos que a aspiração convencional não remove. O resultado é uma alcatifa renovada com aspeto como novo e odores eliminados.`,
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
      { question: `Quanto tempo ficam as alcatifas molhadas após a lavagem em ${loc}?`, answer: `Com o nosso sistema de extração de alta sucção e ventilação adequada, as alcatifas ficam prontas em 2 a 4 horas em ${loc}.` },
      { question: `Posso usar o espaço no mesmo dia da lavagem em ${loc}?`, answer: 'Sim. Agendamos frequentemente ao fim de semana ou à noite, e o espaço fica pronto para abertura no dia seguinte.' },
      { question: 'Fazem lavagem de alcatifas em hotéis e grandes espaços?', answer: `Sim. Temos equipamento industrial para qualquer dimensão. Já trabalhámos em hotéis, centros comerciais e escritórios abertos em ${loc}.` },
      { question: 'Fazem lavagem fora do horário de trabalho?', answer: `Sim. Trabalhamos à noite, ao fim de semana e em dias de menor movimento para minimizar a perturbação do negócio em ${loc}.` },
      { question: `Qual o preço de lavagem de alcatifas em ${loc}?`, answer: `A partir de 3€/m² com descontos por volume para superfícies acima de 50m². Orçamento gratuito para o seu espaço em ${loc}.` },
    ],
  };
}

function content_impermeabilizacao_sofa(loc: string, ctx: string): ContentBlock {
  return {
    intro: `A impermeabilização de sofás em ${loc} cria uma barreira invisível contra líquidos, manchas e gordura, protegendo o seu investimento por anos sem alterar o toque ou a aparência do tecido. A Kyro Clean Solutions aplica tratamento de nano-partículas certificado em ${loc} e ${ctx}, com resultados garantidos.`,
    whatIs: `A impermeabilização profissional de sofás usa nano-partículas que penetram nas fibras e criam uma membrana repelente invisível. Qualquer líquido derramado (vinho, café, sumo ou água) forma gotas à superfície e pode ser removido com um simples pano, sem deixar mancha. Uma única aplicação em ${loc} protege o tecido durante 2 a 5 anos, reduzindo drasticamente o custo e a frequência de limpezas futuras.`,
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
      { question: `Quanto custa impermeabilizar um sofá em ${loc}?`, answer: `O preço começa a partir de 49€ para sofás de 1 lugar, 69€ para 2 lugares e 89€ para 3 lugares. O pack limpeza + impermeabilização começa em 89€ para 1 lugar, com desconto em relação aos serviços separados. Orçamento gratuito em ${loc}.` },
      { question: `Quanto tempo dura a impermeabilização do sofá em ${loc}?`, answer: 'Com uso normal e manutenção regular, a proteção dura de 2 a 5 anos. Em famílias com crianças ou animais, recomendamos reaplicação ao fim de 2 anos.' },
      { question: 'A impermeabilização altera o toque ou a cor do tecido?', answer: 'Não. O tratamento de nano-partículas é completamente invisível e não altera a maciez, a cor nem a textura do tecido.' },
      { question: `Posso impermeabilizar o sofá sem o limpar antes em ${loc}?`, answer: `Recomendamos vivamente a limpeza antes da impermeabilização. Aplicar em tecido sujo reduz significativamente a eficácia da barreira. A Kyro oferece o pack limpeza + impermeabilização com desconto em ${loc}.` },
      { question: 'A impermeabilização funciona em veludo e tecidos delicados?', answer: 'Sim. Adaptamos o produto ao tipo de tecido. Para veludo, seda e tecidos delicados usamos formulações específicas que preservam a fibra.' },
    ],
  };
}

function content_impermeabilizacao_colchao(loc: string, ctx: string): ContentBlock {
  return {
    intro: `A impermeabilização de colchões em ${loc} protege o seu investimento de derrames acidentais, suor e líquidos biológicos, preservando a higiene e prolongando a vida útil do colchão por anos. A Kyro Clean Solutions aplica tratamento certificado ao domicílio em ${loc} e ${ctx}.`,
    whatIs: `A impermeabilização profissional do colchão cria uma barreira molecular que repele líquidos antes de penetrarem nas camadas internas. Especialmente indicada para colchões de crianças, bebés e idosos, protege de acidentes noturnos, suor excessivo e derrames. Em ${loc}, o tratamento é aplicado ao domicílio com o colchão no lugar, sem necessidade de transporte.`,
    benefits: [
      'Proteção total contra acidentes noturnos de crianças e idosos',
      'Repele suor, líquidos biológicos e derrames',
      'Prolonga significativamente a vida útil do colchão',
      'Mantém a higiene mesmo após anos de uso',
      `Serviço ao domicílio em ${loc}, colchão no lugar`,
      'Combinável com higienização para proteção completa',
    ],
    processSteps: [
      { step: 1, title: 'Avaliação do colchão', description: `Verificação do estado e tipo de revestimento em ${loc}.` },
      { step: 2, title: 'Preparação da superfície', description: 'O colchão deve estar limpo e seco. Recomendamos higienização prévia.' },
      { step: 3, title: 'Aplicação do impermeabilizante', description: 'Tratamento uniforme de ambas as faces com produto certificado, seguro para pele sensível.' },
      { step: 4, title: 'Secagem e ativação', description: 'Colchão pronto a usar após 3 a 5 horas de secagem natural.' },
    ],
    faqs: [
      { question: `Quanto custa impermeabilizar um colchão em ${loc}?`, answer: `O preço começa em 45€ para colchão de solteiro, 50€ para casal e 55€ para king/queen. O pack higienização + impermeabilização começa em 71€ (solteiro) com 15% de desconto sobre os serviços separados. Orçamento gratuito em ${loc}.` },
      { question: 'A impermeabilização do colchão protege de acidentes de crianças?', answer: 'Sim. A barreira repele urina, sumo e outros líquidos antes de penetrarem. Mesmo com acidente, o líquido fica à superfície e pode ser limpo com um pano.' },
      { question: `Posso combinar higienização e impermeabilização em ${loc}?`, answer: `Sim, e é o que recomendamos. O pack higienização + impermeabilização garante um colchão limpo e protegido com desconto sobre os serviços separados. Disponível em ${loc} ao domicílio.` },
      { question: 'A impermeabilização é segura para recém-nascidos?', answer: 'Sim. Usamos produtos certificados, hipoalergénicos e sem compostos tóxicos. Após a secagem completa, o colchão é totalmente seguro para bebés.' },
      { question: 'Com que frequência devo reaplicar a impermeabilização?', answer: 'Para colchões de bebé ou crianças pequenas, recomendamos a cada 18-24 meses. Para adultos, a proteção dura 3 a 5 anos com uso normal.' },
    ],
  };
}

function content_impermeabilizacao_cadeiras(loc: string, ctx: string): ContentBlock {
  return {
    intro: `A impermeabilização de cadeiras estofadas em ${loc} protege o tecido de derramamentos, gordura e uso intensivo, ideal para restaurantes, escritórios e residências que querem cadeiras com aspeto cuidado por mais tempo. Kyro Clean Solutions ao domicílio em ${loc} e ${ctx}.`,
    whatIs: `As cadeiras de jantar e de escritório sofrem derrames diários de líquidos, gordura e manchas de uso. A impermeabilização profissional cria uma barreira invisível nas fibras que repele estes agentes, facilitando a limpeza e prolongando a vida útil do estofamento. Em ${loc}, aplicamos ao domicílio em qualquer quantidade, de 2 cadeiras de sala de jantar a centenas de cadeiras de restaurante.`,
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
      { question: `Quanto custa impermeabilizar cadeiras em ${loc}?`, answer: `A partir de 15€ por cadeira (tampo) ou 20€ por cadeira completa. Para lotes de 6 ou mais, a partir de 10€/cad. (tampo) ou 15€/cad. (completa). Orçamento gratuito para o seu espaço em ${loc}.` },
      { question: `Vale a pena impermeabilizar cadeiras de restaurante em ${loc}?`, answer: `Sim. Cadeiras impermeabilizadas são muito mais fáceis de limpar no dia a dia, mantêm o aspeto cuidado por mais tempo e reduzem o desgaste por manchas de gordura e vinho. O custo amortiza-se rapidamente.` },
      { question: 'A impermeabilização funciona em veludo e pele sintética?', answer: 'Sim. Adaptamos o produto ao tipo de tecido. Para veludo, usamos formulações que preservam a textura característica. Para pele sintética, o tratamento reforça a repelência.' },
      { question: `Fazem impermeabilização de lotes grandes de cadeiras em ${loc}?`, answer: `Sim. Deslocamo-nos a ${loc} para lotes de qualquer dimensão com preços progressivos. Trabalhamos fora do horário para não perturbar o funcionamento do restaurante ou escritório.` },
      { question: `Posso limpar as cadeiras normalmente após a impermeabilização?`, answer: 'Sim. A barreira facilita a limpeza: a maioria dos derrames pode ser removida com um pano húmido. Para sujidade acumulada, use produtos neutros sem solventes.' },
    ],
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
  'impermeabilizacao-colchao':  content_impermeabilizacao_colchao,
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
    title: `${variantLabel} de ${svc.label} em ${locationName} | Kyro Clean Solutions`,
    metaDescription: content.intro.slice(0, 155).trimEnd(),
    h1: `${variantLabel} Profissional de ${svc.label} em ${locationName}`,
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
