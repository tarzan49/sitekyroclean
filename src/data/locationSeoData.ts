// Location × Service SEO data for long-tail keyword targeting
// Each city × service combination has unique content to avoid duplicate content penalties

export interface LocationService {
  slug: string;
  city: string;
  citySlug: string;
  service: string;
  serviceSlug: string;
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  problems: { title: string; description: string }[];
  howItWorks: string;
  benefits: string[];
  localSection: string;
  faqs: { question: string; answer: string }[];
  relatedServices: string[];
  priceFrom: string;
}

// Default "from" price shown when a specific service price isn't available
export const DEFAULT_PRICE_FROM = "39€";

// Cities configuration
export const cities = [
  // Área Metropolitana do Porto: Primary
  { name: "Porto", slug: "porto", region: "primary", description: "capital do Norte de Portugal" },
  { name: "Matosinhos", slug: "matosinhos", region: "secondary", description: "cidade costeira vizinha do Porto" },
  { name: "Maia", slug: "maia", region: "secondary", description: "município a norte do Porto" },
  { name: "Vila Nova de Gaia", slug: "vila-nova-de-gaia", region: "secondary", description: "cidade na margem sul do Douro" },
  { name: "Gondomar", slug: "gondomar", region: "secondary", description: "município a leste do Porto" },
  { name: "Valongo", slug: "valongo", region: "secondary", description: "município a nordeste do Porto" },
  { name: "Póvoa de Varzim", slug: "povoa-de-varzim", region: "secondary", description: "cidade costeira do litoral norte" },
  { name: "Vila do Conde", slug: "vila-do-conde", region: "secondary", description: "cidade histórica do litoral norte" },
  { name: "Paredes", slug: "paredes", region: "secondary", description: "município do Vale do Sousa" },
  { name: "Penafiel", slug: "penafiel", region: "secondary", description: "cidade do Vale do Sousa" },
  { name: "Lousada", slug: "lousada", region: "secondary", description: "município do Vale do Sousa" },
  { name: "Paços de Ferreira", slug: "pacos-de-ferreira", region: "secondary", description: "capital do móvel" },
  { name: "Felgueiras", slug: "felgueiras", region: "secondary", description: "município do Vale do Sousa" },
  { name: "Santo Tirso", slug: "santo-tirso", region: "secondary", description: "cidade do Ave" },
  { name: "Trofa", slug: "trofa", region: "secondary", description: "município entre Porto e Braga" },
  { name: "Espinho", slug: "espinho", region: "secondary", description: "cidade costeira a sul do Porto" },
  { name: "Arouca", slug: "arouca", region: "secondary", description: "município no interior do distrito de Aveiro" },
  // Outros: Norte
  { name: "Braga", slug: "braga", region: "secondary", description: "cidade milenar do Minho" },
  { name: "Guimarães", slug: "guimaraes", region: "secondary", description: "berço da nação portuguesa" },
  // Lisboa e região
  { name: "Lisboa", slug: "lisboa", region: "primary", description: "capital de Portugal" },
  { name: "Cascais", slug: "cascais", region: "secondary", description: "vila costeira na linha de Cascais" },
  { name: "Oeiras", slug: "oeiras", region: "secondary", description: "município entre Lisboa e Cascais" },
  { name: "Sintra", slug: "sintra", region: "secondary", description: "vila histórica e Património UNESCO" },
  { name: "Almada", slug: "almada", region: "secondary", description: "cidade na margem sul do Tejo" },
  { name: "Setúbal", slug: "setubal", region: "secondary", description: "cidade portuária a sul de Lisboa" },
] as const;

// Services configuration
export const services = [
  { name: "Limpeza de Sofás", slug: "limpeza-sofas", baseRoute: "/limpeza-sofas", priceFrom: "39€", icon: "sofa" },
  { name: "Limpeza de Colchões", slug: "limpeza-colchoes", baseRoute: "/limpeza-colchoes", priceFrom: "39€", icon: "mattress" },
  { name: "Limpeza de Tapetes", slug: "limpeza-tapetes", baseRoute: "/limpeza-tapetes", priceFrom: "5€/m²", icon: "carpet" },
  { name: "Limpeza de Cadeiras", slug: "limpeza-cadeiras", baseRoute: "/limpeza-cadeiras", priceFrom: "10€", icon: "chair" },
  { name: "Limpeza de Alcatifas", slug: "limpeza-alcatifas", baseRoute: "/limpeza-alcatifas", priceFrom: "3€/m²", icon: "rug" },
  { name: "Impermeabilização", slug: "impermeabilizacao", baseRoute: "/impermeabilizacao", priceFrom: "49€", icon: "waterproof" },
] as const;

// Content generators: unique per city × service to avoid duplicate content
function generateSofaContent(city: string, cityDesc: string): Omit<LocationService, 'slug' | 'city' | 'citySlug' | 'service' | 'serviceSlug' | 'relatedServices' | 'priceFrom'> {
  return {
    title: `Limpeza de Sofás ${city} | Desde 39€ ao Domicílio | Kyro Clean Solutions`,
    metaDescription: `Limpeza e lavagem profissional de sofás em ${city}. Remoção de manchas, ácaros e odores ao domicílio. Resultados visíveis no momento. Desde 39€. Peça orçamento grátis.`,
    h1: `Limpeza de Sofás Profissional em ${city}`,
    intro: `Precisa de limpeza de sofás em ${city}? A Kyro Clean Solutions oferece serviço profissional de limpeza e lavagem de sofás ao domicílio em ${city} e ${cityDesc}. Utilizamos equipamento de extração profissional para remover manchas, ácaros, bactérias e odores acumulados, devolvendo higiene e frescura ao seu sofá. Resultados visíveis no momento com preços desde 39€.`,
    problems: [
      { title: "Manchas difíceis no sofá", description: `Manchas de café, vinho, comida ou gordura que se acumulam no dia-a-dia em ${city}. Sem tratamento profissional, estas manchas penetram nas fibras e tornam-se permanentes.` },
      { title: "Ácaros e bactérias invisíveis", description: `O seu sofá pode conter milhões de ácaros e bactérias que causam alergias, irritações respiratórias e problemas de pele. A limpeza regular doméstica não é suficiente para eliminar estes microrganismos.` },
      { title: "Odores desagradáveis", description: `Suor, animais de estimação, humidade e uso diário acumulam odores nos tecidos do sofá. A nossa desodorização profissional elimina completamente estes cheiros.` },
      { title: "Desgaste prematuro do tecido", description: `Sem proteção adequada, os tecidos desgastam-se mais rapidamente. A impermeabilização previne danos e prolonga a vida útil do sofá.` },
    ],
    howItWorks: `O nosso processo de limpeza de sofás em ${city} é simples: 1) Inspeção do sofá e tipo de tecido, 2) Pulverização com produto específico por tecido, 3) Escovação para distribuir o produto nas fibras, 4) Extração profunda com equipamento a quente, 5) Secagem rápida: sofá pronto a usar em poucas horas. Todo o serviço é realizado no conforto da sua casa em ${city}.`,
    benefits: [
      "Remoção de 99% dos ácaros e bactérias",
      "Eliminação de manchas antigas e recentes",
      "Desodorização completa do sofá",
      "Secagem rápida: pronto em poucas horas",
      "Equipamento profissional de extração",
      `Serviço ao domicílio em ${city} e arredores`,
    ],
    localSection: `Servimos toda a área de ${city} e arredores, incluindo as principais freguesias e zonas residenciais. A nossa equipa desloca-se diretamente à sua casa em ${city}, sem custos adicionais de deslocação na área metropolitana. Atendemos clientes residenciais e comerciais: escritórios, restaurantes, hotéis e clínicas em ${city}.`,
    faqs: [
      { question: `Quanto custa a limpeza de sofá em ${city}?`, answer: `A limpeza de sofá em ${city} começa a partir de 39€ para sofás de 2 lugares. O preço varia conforme o tamanho, tipo de tecido e estado de sujidade. Peça orçamento gratuito sem compromisso.` },
      { question: `Quanto tempo demora a limpeza do sofá em ${city}?`, answer: `O serviço de limpeza de sofá ao domicílio em ${city} demora entre 1 a 3 horas, dependendo do tamanho e estado do sofá. O sofá fica pronto a usar em 4-6 horas após a limpeza.` },
      { question: `A limpeza remove manchas antigas do sofá?`, answer: `Sim, o nosso processo de extração profunda remove a grande maioria das manchas, incluindo manchas antigas de café, vinho, gordura e líquidos. Manchas muito antigas podem necessitar de tratamento adicional.` },
      { question: `A limpeza de sofá remove ácaros e bactérias?`, answer: `Sim. A nossa higienização profissional elimina até 99% dos ácaros e bactérias presentes no sofá, melhorando significativamente a qualidade do ar e reduzindo alergias.` },
      { question: `Fazem limpeza de sofás ao domicílio em ${city}?`, answer: `Sim! A Kyro Clean Solutions faz limpeza de sofás ao domicílio em ${city} e toda a área envolvente. A nossa equipa desloca-se à sua casa com todo o equipamento necessário.` },
      { question: `A limpeza pode danificar o tecido do sofá?`, answer: `Não. Utilizamos produtos certificados e técnicas adaptadas a cada tipo de tecido: algodão, linho, microfibra, veludo ou couro. Inspeccionamos sempre o tecido antes de iniciar.` },
    ],
  };
}

function generateColchaoContent(city: string, cityDesc: string): Omit<LocationService, 'slug' | 'city' | 'citySlug' | 'service' | 'serviceSlug' | 'relatedServices' | 'priceFrom'> {
  return {
    title: `Limpeza de Colchões ${city} | Desde 39€ | Kyro Clean Solutions`,
    metaDescription: `Higienização profissional de colchões em ${city}. Eliminamos ácaros, bactérias e odores para noites mais saudáveis. Serviço ao domicílio desde 39€.`,
    h1: `Limpeza e Higienização de Colchões em ${city}`,
    intro: `Sabia que o seu colchão pode conter milhões de ácaros e bactérias? Em ${city}, a Kyro Clean Solutions oferece higienização profunda de colchões ao domicílio, eliminando microrganismos, manchas e odores acumulados. Dormirá melhor e mais saudável. Serviço disponível em ${city} e ${cityDesc} desde 39€.`,
    problems: [
      { title: "Ácaros no colchão", description: `Um colchão pode conter até 2 milhões de ácaros. Em ${city}, o clima húmido favorece a proliferação destes microrganismos que causam alergias, rinite e asma.` },
      { title: "Manchas de suor e líquidos", description: `Manchas de suor, urina, sangue e outros líquidos penetram no colchão e criam ambiente ideal para bactérias e fungos.` },
      { title: "Odores acumulados", description: `Com o uso diário, odores de suor e humidade ficam retidos nas fibras do colchão, comprometendo a qualidade do sono.` },
      { title: "Alergias noturnas", description: `Se acorda com espirros, olhos irritados ou congestão nasal, o seu colchão pode ser a causa. A higienização profissional resolve este problema.` },
    ],
    howItWorks: `Em ${city}, o nosso processo inclui: 1) Inspeção e aspiração profunda, 2) Pulverização com solução antibacteriana, 3) Escovação para penetrar nas fibras, 4) Extração a quente com equipamento profissional, 5) Secagem rápida.`,
    benefits: [
      "Eliminação de 99% dos ácaros",
      "Remoção de manchas de suor e urina",
      "Desodorização antibacteriana",
      "Melhoria da qualidade do sono",
      `Serviço ao domicílio em ${city}`,
      "Secagem rápida: colchão pronto no mesmo dia",
    ],
    localSection: `A nossa equipa de higienização de colchões cobre toda a área de ${city} e arredores. Atendemos residências, hotéis, residências seniores e alojamentos locais em ${city}. Deslocação incluída sem custos adicionais na área metropolitana.`,
    faqs: [
      { question: `Quanto custa a limpeza de colchão em ${city}?`, answer: `A higienização de colchão em ${city} começa a partir de 39€ para colchão de solteiro. Colchões de casal têm preços a partir de 49€. Contacte-nos para orçamento personalizado.` },
      { question: `A limpeza de colchão remove ácaros?`, answer: `Sim. O nosso processo de higienização profissional elimina até 99% dos ácaros, bactérias e fungos presentes no colchão, ideal para quem sofre de alergias.` },
      { question: `A limpeza remove cheiro de urina do colchão?`, answer: `Sim. A nossa extração profunda combinada com desodorização enzimática elimina completamente odores de urina, incluindo manchas antigas.` },
      { question: `Quanto tempo demora a secagem do colchão?`, answer: `O colchão fica pronto a usar no mesmo dia, tipicamente em 4-6 horas após a limpeza. Em dias mais secos, pode estar pronto ainda mais cedo.` },
      { question: `Com que frequência devo higienizar o colchão?`, answer: `Recomendamos higienização profissional a cada 6-12 meses para manter o colchão livre de ácaros e bactérias, especialmente para alérgicos.` },
    ],
  };
}

function generateTapetesContent(city: string, cityDesc: string): Omit<LocationService, 'slug' | 'city' | 'citySlug' | 'service' | 'serviceSlug' | 'relatedServices' | 'priceFrom'> {
  return {
    title: `Limpeza de Tapetes ${city} | Desde 5€/m² | Kyro Clean Solutions`,
    metaDescription: `Lavagem profissional de tapetes em ${city}. Limpeza de tapetes persas, orientais e modernos. Recolha e entrega. Desde 5€/m².`,
    h1: `Limpeza e Lavagem de Tapetes em ${city}`,
    intro: `Procura lavagem de tapetes profissional em ${city}? A Kyro Clean Solutions oferece limpeza especializada de tapetes de todos os tipos: persas, orientais, modernos, de lã e sintéticos. Serviço disponível em ${city} e ${cityDesc} com recolha e entrega ao domicílio. Preços desde 5€/m².`,
    problems: [
      { title: "Sujidade acumulada nas fibras", description: `Os tapetes acumulam poeira, terra, areia e resíduos diariamente. Em ${city}, o uso constante torna a limpeza profunda essencial para manter a higiene.` },
      { title: "Manchas resistentes", description: `Manchas de líquidos, comida e animais que se fixam nas fibras do tapete e são impossíveis de remover com aspirador convencional.` },
      { title: "Alergénios e ácaros", description: `Os tapetes são dos principais reservatórios de ácaros e alergénios numa casa, contribuindo para problemas respiratórios.` },
      { title: "Cores desbotadas", description: `Sem limpeza adequada, as cores dos tapetes perdem vivacidade. A nossa lavagem profissional revitaliza as cores originais.` },
    ],
    howItWorks: `Processo de limpeza de tapetes em ${city}: 1) Avaliação do tipo de tapete e fibras, 2) Pulverização com produto específico por fibra, 3) Escovação para penetrar nas fibras, 4) Extração profunda com equipamento profissional, 5) Secagem controlada para preservar as fibras. Oferecemos recolha e entrega ao domicílio em ${city}.`,
    benefits: [
      "Limpeza de tapetes persas e orientais",
      "Remoção de manchas e odores",
      "Revitalização das cores",
      `Recolha e entrega em ${city}`,
      "Produtos seguros para fibras delicadas",
      "Preços desde 5€/m²",
    ],
    localSection: `Recolhemos e entregamos tapetes em toda a área de ${city}. Atendemos clientes residenciais e comerciais: restaurantes, hotéis e escritórios em ${city} e arredores.`,
    faqs: [
      { question: `Quanto custa a limpeza de tapetes em ${city}?`, answer: `A limpeza de tapetes em ${city} tem preços a partir de 5€/m². O custo depende do tipo de tapete, dimensão e estado de sujidade. Peça orçamento gratuito.` },
      { question: `Fazem lavagem de tapetes persas em ${city}?`, answer: `Sim. Temos experiência na lavagem de tapetes persas, orientais e delicados. Utilizamos produtos e técnicas específicas para preservar as fibras e cores.` },
      { question: `Têm serviço de recolha de tapetes em ${city}?`, answer: `Sim! Oferecemos recolha e entrega de tapetes ao domicílio em ${city} e toda a área envolvente, sem custos adicionais para encomendas acima de 50€.` },
      { question: `Quanto tempo demora a lavagem de tapetes?`, answer: `O processo completo de lavagem e secagem demora tipicamente 3-5 dias úteis, dependendo do tipo e tamanho do tapete.` },
      { question: `A limpeza de tapetes remove odor a animal de estimação?`, answer: `Sim. A nossa lavagem profunda com desodorização enzimática elimina completamente odores de animais de estimação dos tapetes.` },
    ],
  };
}

function generateCadeirasContent(city: string, cityDesc: string): Omit<LocationService, 'slug' | 'city' | 'citySlug' | 'service' | 'serviceSlug' | 'relatedServices' | 'priceFrom'> {
  return {
    title: `Limpeza de Cadeiras Estofadas ${city} | Desde 10€ | Kyro Clean Solutions`,
    metaDescription: `Limpeza profissional de cadeiras estofadas em ${city}. Ideal para escritórios, restaurantes e residências. Desde 10€ por cadeira.`,
    h1: `Limpeza de Cadeiras Estofadas em ${city}`,
    intro: `Precisa de limpar cadeiras estofadas em ${city}? A Kyro Clean Solutions realiza limpeza profissional de cadeiras de escritório, cadeiras de jantar e cadeiras estofadas em ${city} e ${cityDesc}. Serviço rápido e eficaz ao domicílio ou no seu estabelecimento. Desde 10€ por cadeira.`,
    problems: [
      { title: "Sujidade do uso diário", description: `Cadeiras de escritório e jantar acumulam manchas de suor, gordura e líquidos diariamente. Em ${city}, muitos escritórios e restaurantes necessitam de limpeza regular.` },
      { title: "Manchas visíveis", description: `Manchas de café, alimentos e tinta que deixam as cadeiras com aspecto descuidado, prejudicando a imagem do seu espaço.` },
      { title: "Odores retidos", description: `O tecido das cadeiras absorve odores de suor e comida, criando um ambiente desagradável no escritório ou restaurante.` },
    ],
    howItWorks: `Limpeza de cadeiras em ${city}: 1) Inspeção do tecido, 2) Pulverização com produto específico, 3) Escovação para penetrar nas fibras, 4) Extração profunda com equipamento profissional, 5) Secagem rápida. Ideal para lotes de cadeiras em escritórios e restaurantes.`,
    benefits: [
      "Preço acessível: desde 10€/cadeira",
      "Ideal para escritórios e restaurantes",
      "Descontos para quantidades",
      `Serviço ao domicílio em ${city}`,
      "Secagem rápida: pronto no mesmo dia",
      "Melhora a imagem do seu espaço",
    ],
    localSection: `Atendemos escritórios, restaurantes, hotéis, clínicas e residências em ${city}. Oferecemos preços especiais para limpeza de lotes de cadeiras em empresas da zona de ${city} e arredores.`,
    faqs: [
      { question: `Quanto custa limpar cadeiras estofadas em ${city}?`, answer: `A limpeza de cadeiras estofadas em ${city} começa a partir de 10€ por cadeira. Oferecemos descontos progressivos para quantidades maiores: ideal para escritórios e restaurantes.` },
      { question: `Fazem limpeza de cadeiras de escritório em ${city}?`, answer: `Sim! Limpamos cadeiras de escritório, cadeiras de conferência e cadeiras executivas. Deslocamo-nos ao seu escritório em ${city} sem interrupção do trabalho.` },
      { question: `Qual o desconto para limpeza de muitas cadeiras?`, answer: `Oferecemos descontos progressivos: 10% para 10+ cadeiras, 15% para 20+ cadeiras. Contacte-nos para orçamento personalizado para o seu escritório ou restaurante em ${city}.` },
    ],
  };
}

function generateAlcatifasContent(city: string, cityDesc: string): Omit<LocationService, 'slug' | 'city' | 'citySlug' | 'service' | 'serviceSlug' | 'relatedServices' | 'priceFrom'> {
  return {
    title: `Limpeza de Alcatifas ${city} | Desde 3€/m² | Kyro Clean Solutions`,
    metaDescription: `Limpeza profunda de alcatifas em ${city}. Remoção de sujidade acumulada e alergénios. Secagem rápida. Desde 3€/m². Orçamento gratuito.`,
    h1: `Limpeza Profunda de Alcatifas em ${city}`,
    intro: `As alcatifas do seu espaço em ${city} precisam de limpeza profissional? A Kyro Clean Solutions oferece limpeza profunda de alcatifas com extração profissional em ${city} e ${cityDesc}. Removemos sujidade acumulada, manchas e alergénios, devolvendo frescura e higiene. Desde 3€/m².`,
    problems: [
      { title: "Sujidade profunda acumulada", description: `As alcatifas acumulam poeira, terra e resíduos nas camadas profundas das fibras. O aspirador convencional remove apenas a sujidade superficial.` },
      { title: "Alergénios e ácaros", description: `Em ${city}, as alcatifas são reservatórios de ácaros e alergénios que afetam a qualidade do ar interior e causam problemas respiratórios.` },
      { title: "Manchas em grandes superfícies", description: `Manchas em alcatifas de escritórios, hotéis e residências que afetam a imagem profissional do espaço.` },
    ],
    howItWorks: `Processo de limpeza de alcatifas em ${city}: 1) Aspiração industrial, 2) Pulverização com detergente profissional, 3) Escovação para penetrar nas fibras, 4) Extração a quente com equipamento profissional, 5) Secagem rápida com ventilação. Ideal para grandes superfícies em escritórios e hotéis.`,
    benefits: [
      "Limpeza de grandes superfícies",
      "Secagem rápida: pronto em poucas horas",
      "Ideal para escritórios e hotéis",
      `Cobertura em toda a zona de ${city}`,
      "Preços competitivos desde 3€/m²",
      "Remoção de 99% dos alergénios",
    ],
    localSection: `Atendemos escritórios, hotéis, escolas, clínicas e espaços comerciais com alcatifas em ${city} e toda a área metropolitana. Oferecemos orçamentos para grandes superfícies.`,
    faqs: [
      { question: `Quanto custa limpar alcatifas em ${city}?`, answer: `A limpeza de alcatifas em ${city} tem preços a partir de 3€/m². Para grandes superfícies oferecemos descontos por volume. Peça orçamento gratuito.` },
      { question: `Fazem limpeza de alcatifas em escritórios em ${city}?`, answer: `Sim! Realizamos limpeza de alcatifas em escritórios, hotéis e espaços comerciais em ${city}. Podemos agendar fora do horário de trabalho para mínima interrupção.` },
      { question: `Quanto tempo demora a secar a alcatifa?`, answer: `Com o nosso processo de extração profissional, a alcatifa fica seca em 2-4 horas. Utilizamos equipamento de alta sucção que minimiza o tempo de secagem.` },
    ],
  };
}

function generateImpermeabilizacaoContent(city: string, cityDesc: string): Omit<LocationService, 'slug' | 'city' | 'citySlug' | 'service' | 'serviceSlug' | 'relatedServices' | 'priceFrom'> {
  return {
    title: `Impermeabilização de Estofos ${city} | Proteção até 10 anos | Kyro Clean Solutions`,
    metaDescription: `Impermeabilização profissional de sofás, cadeiras e tapetes em ${city}. Proteção invisível contra manchas e líquidos com garantia até 10 anos.`,
    h1: `Impermeabilização de Estofos em ${city}`,
    intro: `Proteja os seus estofos contra manchas e líquidos em ${city}. A Kyro Clean Solutions aplica impermeabilização profissional invisível que cria uma barreira protetora nos tecidos, repelindo líquidos e facilitando a limpeza. Serviço disponível em ${city} e ${cityDesc} com garantia até 10 anos.`,
    problems: [
      { title: "Sofá sem proteção", description: `Sem impermeabilização, qualquer derrame penetra rapidamente nas fibras do sofá, causando manchas permanentes e danos ao estofamento.` },
      { title: "Manchas frequentes com crianças e animais", description: `Famílias em ${city} com crianças e animais de estimação sofrem com manchas constantes. A impermeabilização previne estes danos.` },
      { title: "Desgaste acelerado dos tecidos", description: `Tecidos não protegidos desgastam-se mais rapidamente. A impermeabilização prolonga significativamente a vida útil dos estofos.` },
    ],
    howItWorks: `Processo de impermeabilização em ${city}: 1) Limpeza prévia dos estofos (se necessário), 2) Aplicação uniforme do produto impermeabilizante, 3) Secagem e cura do produto, 4) Teste de repelência. Garantia até 10 anos.`,
    benefits: [
      "Proteção invisível contra líquidos",
      "Garantia até 10 anos",
      "Não altera a textura nem cor do tecido",
      `Serviço ao domicílio em ${city}`,
      "Facilita limpeza de derrames futuros",
      "Prolonga a vida útil dos estofos",
    ],
    localSection: `Oferecemos impermeabilização de estofos em ${city} e toda a região envolvente. Ideal combinar com limpeza profissional: peça pack completo com desconto.`,
    faqs: [
      { question: `Quanto custa impermeabilizar um sofá em ${city}?`, answer: `A impermeabilização de sofás em ${city} custa 49€ (1 lugar), 69€ (2 lugares) e 89€ (3 lugares). O pack limpeza + impermeabilização numa única visita começa em 89€ para 1 lugar. Orçamento gratuito em ${city}.` },
      { question: `A impermeabilização altera a textura do sofá?`, answer: `Não. O nosso produto de impermeabilização é completamente invisível e não altera a cor, textura ou respirabilidade do tecido.` },
      { question: `Quanto tempo dura a impermeabilização?`, answer: `A nossa impermeabilização profissional dura entre 5 a 10 anos, dependendo do uso e tipo de tecido. Oferecemos garantia incluída.` },
      { question: `Vale a pena impermeabilizar o sofá?`, answer: `Sim, especialmente se tem crianças ou animais. A impermeabilização previne manchas e facilita a limpeza, poupando centenas de euros em substituição de estofos a longo prazo.` },
    ],
  };
}

// Content generator map
const contentGenerators: Record<string, (city: string, cityDesc: string) => Omit<LocationService, 'slug' | 'city' | 'citySlug' | 'service' | 'serviceSlug' | 'relatedServices' | 'priceFrom'>> = {
  'limpeza-sofas': generateSofaContent,
  'limpeza-colchoes': generateColchaoContent,
  'limpeza-tapetes': generateTapetesContent,
  'limpeza-cadeiras': generateCadeirasContent,
  'limpeza-alcatifas': generateAlcatifasContent,
  'impermeabilizacao': generateImpermeabilizacaoContent,
};

// Related services map
const relatedServicesMap: Record<string, string[]> = {
  'limpeza-sofas': ['limpeza-colchoes', 'limpeza-cadeiras', 'impermeabilizacao'],
  'limpeza-colchoes': ['limpeza-sofas', 'limpeza-tapetes', 'limpeza-alcatifas'],
  'limpeza-tapetes': ['limpeza-alcatifas', 'limpeza-sofas', 'impermeabilizacao'],
  'limpeza-cadeiras': ['limpeza-sofas', 'impermeabilizacao', 'limpeza-tapetes'],
  'limpeza-alcatifas': ['limpeza-tapetes', 'limpeza-sofas', 'limpeza-cadeiras'],
  'impermeabilizacao': ['limpeza-sofas', 'limpeza-cadeiras', 'limpeza-tapetes'],
};

// Generate all location page data
export function getLocationServiceData(serviceSlug: string, citySlug: string): LocationService | null {
  const city = cities.find(c => c.slug === citySlug);
  const service = services.find(s => s.slug === serviceSlug);
  const generator = contentGenerators[serviceSlug];

  if (!city || !service || !generator) return null;

  const content = generator(city.name, city.description);
  return {
    ...content,
    slug: `${serviceSlug}-${citySlug}`,
    city: city.name,
    citySlug: city.slug,
    service: service.name,
    serviceSlug: service.slug,
    priceFrom: service.priceFrom,
    relatedServices: relatedServicesMap[serviceSlug] || [],
  };
}

// Generate all route slugs
export function getAllLocationRoutes(): { path: string; serviceSlug: string; citySlug: string }[] {
  const routes: { path: string; serviceSlug: string; citySlug: string }[] = [];
  for (const service of services) {
    for (const city of cities) {
      routes.push({
        path: `/${service.slug}-${city.slug}`,
        serviceSlug: service.slug,
        citySlug: city.slug,
      });
    }
  }
  return routes;
}

// Get all city links for a specific service (for internal linking)
export function getCityLinksForService(serviceSlug: string): { name: string; path: string }[] {
  return cities.map(city => ({
    name: city.name,
    path: `/${serviceSlug}-${city.slug}`,
  }));
}
