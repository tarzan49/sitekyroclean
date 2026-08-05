// Location × Service SEO data for long-tail keyword targeting
// Each city × service combination has unique content to avoid duplicate content penalties
// locationPrices duplicado aqui (sem import @/) para compatibilidade com scripts/prerender.ts (Node.js sem alias Vite)
// Três equipas locais, três sistemas de zonas independentes (Porto/Norte, Lisboa/AML, Algarve)
// Sem zona grátis: mínimo 5€ sempre, sobe com a distância ao centro de cada equipa.
const locationPrices: Record<string, number> = {
  // ── Porto/Norte ──
  'Porto': 5, 'Matosinhos': 5,
  'Vila Nova de Gaia': 10, 'Maia': 10, 'Gondomar': 10,
  'Valongo': 15, 'Espinho': 15, 'Póvoa de Varzim': 15, 'Vila do Conde': 15,
  'Santo Tirso': 15, 'Trofa': 15, 'Paredes': 15,
  'Penafiel': 20, 'Paços de Ferreira': 20, 'Felgueiras': 20, 'Lousada': 20,
  'Arouca': 25, 'Braga': 25, 'Aveiro': 25,
  'Guimarães': 30,
  // ── Lisboa / Área Metropolitana (equipa local) ──
  'Lisboa': 5,
  'Amadora': 10, 'Odivelas': 10, 'Oeiras': 10,
  'Cascais': 15, 'Sintra': 15, 'Loures': 15, 'Almada': 15, 'Seixal': 15,
  'Vila Franca de Xira': 20, 'Barreiro': 20, 'Moita': 20, 'Mafra': 20,
  'Setúbal': 25, 'Montijo': 25, 'Alcochete': 25, 'Palmela': 25, 'Sesimbra': 25,
  // ── Algarve (equipa local) ──
  'Faro': 5, 'Loulé': 5,
  'Albufeira': 10, 'São Brás de Alportel': 10, 'Olhão': 10,
  'Silves': 15, 'Lagoa': 15, 'Tavira': 15,
  'Portimão': 20, 'Lagos': 20,
  'Vila Real de Santo António': 25, 'Castro Marim': 25, 'Monchique': 25,
  'Aljezur': 30, 'Vila do Bispo': 30, 'Alcoutim': 30,
};

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
export const DEFAULT_PRICE_FROM = "49€";

// Cities configuration
export const cities = [
  // Área Metropolitana do Porto: Primary
  { name: "Porto", slug: "porto", region: "primary", area: "porto", description: "capital do Norte de Portugal" },
  { name: "Matosinhos", slug: "matosinhos", region: "secondary", area: "porto", description: "cidade costeira vizinha do Porto" },
  { name: "Maia", slug: "maia", region: "secondary", area: "porto", description: "município a norte do Porto" },
  { name: "Vila Nova de Gaia", slug: "vila-nova-de-gaia", region: "secondary", area: "porto", description: "cidade na margem sul do Douro" },
  { name: "Gondomar", slug: "gondomar", region: "secondary", area: "porto", description: "município a leste do Porto" },
  { name: "Valongo", slug: "valongo", region: "secondary", area: "porto", description: "município a nordeste do Porto" },
  { name: "Póvoa de Varzim", slug: "povoa-de-varzim", region: "secondary", area: "porto", description: "cidade costeira do litoral norte" },
  { name: "Vila do Conde", slug: "vila-do-conde", region: "secondary", area: "porto", description: "cidade histórica do litoral norte" },
  { name: "Paredes", slug: "paredes", region: "secondary", area: "porto", description: "município do Vale do Sousa" },
  { name: "Penafiel", slug: "penafiel", region: "secondary", area: "porto", description: "cidade do Vale do Sousa" },
  { name: "Lousada", slug: "lousada", region: "secondary", area: "porto", description: "município do Vale do Sousa" },
  { name: "Paços de Ferreira", slug: "pacos-de-ferreira", region: "secondary", area: "porto", description: "capital do móvel" },
  { name: "Felgueiras", slug: "felgueiras", region: "secondary", area: "porto", description: "município do Vale do Sousa" },
  { name: "Santo Tirso", slug: "santo-tirso", region: "secondary", area: "porto", description: "cidade do Ave" },
  { name: "Trofa", slug: "trofa", region: "secondary", area: "porto", description: "município entre Porto e Braga" },
  { name: "Espinho", slug: "espinho", region: "secondary", area: "porto", description: "cidade costeira a sul do Porto" },
  { name: "Arouca", slug: "arouca", region: "secondary", area: "porto", description: "município no interior do distrito de Aveiro" },
  // Outros: Norte
  { name: "Braga", slug: "braga", region: "secondary", area: "porto", description: "cidade milenar do Minho" },
  { name: "Guimarães", slug: "guimaraes", region: "secondary", area: "porto", description: "berço da nação portuguesa" },
  // Lisboa e Área Metropolitana
  { name: "Lisboa", slug: "lisboa", region: "primary", area: "lisboa", description: "capital de Portugal" },
  { name: "Amadora", slug: "amadora", region: "secondary", area: "lisboa", description: "município vizinho de Lisboa, um dos mais densos do país" },
  { name: "Odivelas", slug: "odivelas", region: "secondary", area: "lisboa", description: "município a norte de Lisboa" },
  { name: "Oeiras", slug: "oeiras", region: "secondary", area: "lisboa", description: "município entre Lisboa e Cascais" },
  { name: "Cascais", slug: "cascais", region: "secondary", area: "lisboa", description: "vila costeira na linha de Cascais" },
  { name: "Sintra", slug: "sintra", region: "secondary", area: "lisboa", description: "vila histórica e Património UNESCO" },
  { name: "Loures", slug: "loures", region: "secondary", area: "lisboa", description: "município a norte da capital" },
  { name: "Almada", slug: "almada", region: "secondary", area: "lisboa", description: "cidade na margem sul do Tejo" },
  { name: "Seixal", slug: "seixal", region: "secondary", area: "lisboa", description: "município na margem sul, junto ao estuário do Tejo" },
  { name: "Vila Franca de Xira", slug: "vila-franca-de-xira", region: "secondary", area: "lisboa", description: "município ribeirinho a norte de Lisboa" },
  { name: "Barreiro", slug: "barreiro", region: "secondary", area: "lisboa", description: "cidade na margem sul do Tejo" },
  { name: "Moita", slug: "moita", region: "secondary", area: "lisboa", description: "município na margem sul do Tejo" },
  { name: "Mafra", slug: "mafra", region: "secondary", area: "lisboa", description: "vila histórica a norte de Sintra" },
  { name: "Setúbal", slug: "setubal", region: "secondary", area: "lisboa", description: "cidade portuária a sul de Lisboa" },
  { name: "Montijo", slug: "montijo", region: "secondary", area: "lisboa", description: "município na margem sul, em frente a Lisboa" },
  { name: "Alcochete", slug: "alcochete", region: "secondary", area: "lisboa", description: "vila ribeirinha na margem sul do Tejo" },
  { name: "Palmela", slug: "palmela", region: "secondary", area: "lisboa", description: "município entre Setúbal e o Montijo" },
  { name: "Sesimbra", slug: "sesimbra", region: "secondary", area: "lisboa", description: "vila costeira a sul de Lisboa" },
  // Algarve
  { name: "Faro", slug: "faro", region: "primary", area: "algarve", description: "capital do Algarve" },
  { name: "Loulé", slug: "loule", region: "secondary", area: "algarve", description: "município que inclui Quarteira, Vilamoura e Almancil" },
  { name: "Albufeira", slug: "albufeira", region: "secondary", area: "algarve", description: "cidade turística do Algarve central" },
  { name: "Olhão", slug: "olhao", region: "secondary", area: "algarve", description: "cidade piscatória do Algarve oriental" },
  { name: "São Brás de Alportel", slug: "sao-bras-de-alportel", region: "secondary", area: "algarve", description: "vila serrana no interior do Algarve" },
  { name: "Silves", slug: "silves", region: "secondary", area: "algarve", description: "cidade histórica do Algarve central" },
  { name: "Lagoa", slug: "lagoa-algarve", region: "secondary", area: "algarve", description: "município turístico do Algarve central" },
  { name: "Tavira", slug: "tavira", region: "secondary", area: "algarve", description: "cidade histórica do Algarve oriental" },
  { name: "Portimão", slug: "portimao", region: "secondary", area: "algarve", description: "maior cidade do Algarve ocidental" },
  { name: "Lagos", slug: "lagos", region: "secondary", area: "algarve", description: "cidade histórica do Algarve ocidental" },
  { name: "Vila Real de Santo António", slug: "vila-real-de-santo-antonio", region: "secondary", area: "algarve", description: "cidade fronteiriça do Algarve oriental" },
  { name: "Castro Marim", slug: "castro-marim", region: "secondary", area: "algarve", description: "vila histórica junto à fronteira com Espanha" },
  { name: "Monchique", slug: "monchique", region: "secondary", area: "algarve", description: "vila serrana no interior do Algarve" },
  { name: "Aljezur", slug: "aljezur", region: "secondary", area: "algarve", description: "vila da Costa Vicentina" },
  { name: "Vila do Bispo", slug: "vila-do-bispo", region: "secondary", area: "algarve", description: "município do extremo sudoeste do Algarve" },
  { name: "Alcoutim", slug: "alcoutim", region: "secondary", area: "algarve", description: "vila ribeirinha do interior algarvio" },
] as const;

// Services configuration
export const services = [
  { name: "Limpeza de Sofás", slug: "limpeza-sofas", baseRoute: "/limpeza-sofas", priceFrom: "49€", icon: "sofa" },
  { name: "Limpeza de Colchões", slug: "limpeza-colchoes", baseRoute: "/limpeza-colchoes", priceFrom: "49€", icon: "mattress" },
  { name: "Limpeza de Tapetes", slug: "limpeza-tapetes", baseRoute: "/limpeza-tapetes", priceFrom: "12€/m²", icon: "carpet" },
  { name: "Limpeza de Cadeiras", slug: "limpeza-cadeiras", baseRoute: "/limpeza-cadeiras", priceFrom: "20€", icon: "chair" },
  { name: "Limpeza de Alcatifas", slug: "limpeza-alcatifas", baseRoute: "/limpeza-alcatifas", priceFrom: "3€/m²", icon: "rug" },
  { name: "Impermeabilização", slug: "impermeabilizacao", baseRoute: "/impermeabilizacao", priceFrom: "59€", icon: "waterproof" },
] as const;

// Cities that take a definite article in Portuguese ("no Porto", "na Amadora"); everything else reads naturally with "em"
const ARTICLE_CITIES: Record<string, "o" | "a"> = {
  "Porto": "o",
  "Barreiro": "o",
  "Seixal": "o",
  "Montijo": "o",
  "Amadora": "a",
  "Moita": "a",
};
export const cityPrep = (city: string) => {
  const article = ARTICLE_CITIES[city];
  if (!article) return "em";
  return article === "o" ? "no" : "na";
};
export const cityPrepCap = (city: string) => {
  const prep = cityPrep(city);
  return prep.charAt(0).toUpperCase() + prep.slice(1);
};

// Content generators: unique per city × service to avoid duplicate content
function generateSofaContent(city: string, cityDesc: string): Omit<LocationService, 'slug' | 'city' | 'citySlug' | 'service' | 'serviceSlug' | 'relatedServices' | 'priceFrom'> {
  const prep = cityPrep(city);
  return {
    title: `Limpeza de Sofás ${city} | Desde 49€ ao Domicílio | Kyro Clean Solutions`,
    metaDescription: `Limpeza e lavagem profissional de sofás ${prep} ${city}. Remoção de manchas, ácaros e odores ao domicílio. Resultados visíveis no momento. Desde 49€. Peça orçamento grátis.`,
    h1: `Limpeza de Sofás Profissional ${prep} ${city}`,
    intro: `Precisa de limpeza de sofás ${prep} ${city}? A Kyro Clean Solutions oferece serviço profissional de limpeza e lavagem de sofás ao domicílio ${prep} ${city} e ${cityDesc}. Utilizamos equipamento de extração profissional para remover manchas, ácaros, bactérias e odores acumulados, devolvendo higiene e frescura ao seu sofá. Resultados visíveis no momento com preços desde 49€.`,
    problems: [
      { title: "Manchas difíceis no sofá", description: `Manchas de café, vinho, comida ou gordura que se acumulam no dia-a-dia ${prep} ${city}. Sem tratamento profissional, estas manchas penetram nas fibras e tornam-se permanentes.` },
      { title: "Ácaros e bactérias invisíveis", description: `O seu sofá pode conter milhões de ácaros e bactérias que causam alergias, irritações respiratórias e problemas de pele. A limpeza regular doméstica não é suficiente para eliminar estes microrganismos.` },
      { title: "Odores desagradáveis", description: `Suor, animais de estimação, humidade e uso diário acumulam odores nos tecidos do sofá. A nossa desodorização profissional elimina completamente estes cheiros.` },
      { title: "Desgaste prematuro do tecido", description: `Sem proteção adequada, os tecidos desgastam-se mais rapidamente. A impermeabilização previne danos e prolonga a vida útil do sofá.` },
    ],
    howItWorks: `O nosso processo de limpeza de sofás ${prep} ${city} é simples: 1) Inspeção do sofá e tipo de tecido, 2) Pulverização com produto específico por tecido, 3) Escovação para distribuir o produto nas fibras, 4) Extração profunda com equipamento a quente, 5) Secagem rápida: sofá pronto a usar em poucas horas. Todo o serviço é realizado no conforto da sua casa ${prep} ${city}.`,
    benefits: [
      "Tratamento adaptado a cada tecido: algodão, linho, veludo, microfibra, chenille ou couro",
      "Remoção de manchas de vinho, café, gordura e urina de animais de estimação",
      "Eliminação de até 99% dos ácaros, bactérias e fungos do estofo",
      `Equipa móvel que se desloca a casas e empresas ${prep} ${city}, com deslocação calculada pela distância`,
      "Sofá seco e pronto a usar em poucas horas, sem químicos agressivos",
      `Conhecemos bem as necessidades de quem vive ${prep} ${city}, ${cityDesc}, e adaptamos o horário à sua disponibilidade`,
    ],
    localSection: `Servimos toda a área de ${city} e arredores, incluindo as principais freguesias e zonas residenciais. A nossa equipa desloca-se diretamente à sua casa ${prep} ${city} com taxa de deslocação de ${locationPrices[city] ?? 5}€. Atendemos clientes residenciais e comerciais: escritórios, restaurantes, hotéis e clínicas ${prep} ${city}.`,
    faqs: [
      { question: `Quanto custa a limpeza de sofá ${prep} ${city}?`, answer: `A limpeza de sofá ${prep} ${city} começa a partir de 49€ para sofás de 1 lugar. O preço varia conforme o tamanho, tipo de tecido e estado de sujidade. Peça orçamento gratuito sem compromisso.` },
      { question: `Quanto tempo demora a limpeza do sofá ${prep} ${city}?`, answer: `O serviço de limpeza de sofá ao domicílio ${prep} ${city} demora entre 1 a 3 horas, dependendo do tamanho e estado do sofá. O sofá fica pronto a usar em 4-6 horas após a limpeza.` },
      { question: `A limpeza remove manchas antigas do sofá?`, answer: `Sim, o nosso processo de extração profunda remove a grande maioria das manchas, incluindo manchas antigas de café, vinho, gordura e líquidos. Manchas muito antigas podem necessitar de tratamento adicional.` },
      { question: `A limpeza de sofá remove ácaros e bactérias?`, answer: `Sim. A nossa higienização profissional elimina até 99% dos ácaros e bactérias presentes no sofá, melhorando significativamente a qualidade do ar e reduzindo alergias.` },
      { question: `Fazem limpeza de sofás ao domicílio ${prep} ${city}?`, answer: `Sim! A Kyro Clean Solutions faz limpeza de sofás ao domicílio ${prep} ${city} e toda a área envolvente. A nossa equipa desloca-se à sua casa com todo o equipamento necessário.` },
      { question: `A limpeza pode danificar o tecido do sofá?`, answer: `Não. Utilizamos produtos certificados e técnicas adaptadas a cada tipo de tecido: algodão, linho, microfibra, veludo ou couro. Inspeccionamos sempre o tecido antes de iniciar.` },
    ],
  };
}

function generateColchaoContent(city: string, cityDesc: string): Omit<LocationService, 'slug' | 'city' | 'citySlug' | 'service' | 'serviceSlug' | 'relatedServices' | 'priceFrom'> {
  const prep = cityPrep(city);
  const Prep = cityPrepCap(city);
  return {
    title: `Limpeza de Colchões ${city} | Desde 49€ | Kyro Clean Solutions`,
    metaDescription: `Higienização profissional de colchões ${prep} ${city}. Eliminamos ácaros, bactérias e odores para noites mais saudáveis. Serviço ao domicílio desde 49€.`,
    h1: `Limpeza e Higienização de Colchões ${prep} ${city}`,
    intro: `Sabia que o seu colchão pode conter milhões de ácaros e bactérias? ${Prep} ${city}, a Kyro Clean Solutions oferece higienização profunda de colchões ao domicílio, eliminando microrganismos, manchas e odores acumulados. Dormirá melhor e mais saudável. Serviço disponível ${prep} ${city} e ${cityDesc} desde 49€.`,
    problems: [
      { title: "Ácaros no colchão", description: `Um colchão pode conter até 2 milhões de ácaros. ${Prep} ${city}, o clima húmido favorece a proliferação destes microrganismos que causam alergias, rinite e asma.` },
      { title: "Manchas de suor e líquidos", description: `Manchas de suor, urina, sangue e outros líquidos penetram no colchão e criam ambiente ideal para bactérias e fungos.` },
      { title: "Odores acumulados", description: `Com o uso diário, odores de suor e humidade ficam retidos nas fibras do colchão, comprometendo a qualidade do sono.` },
      { title: "Alergias noturnas", description: `Se acorda com espirros, olhos irritados ou congestão nasal, o seu colchão pode ser a causa. A higienização profissional resolve este problema.` },
    ],
    howItWorks: `${Prep} ${city}, o nosso processo inclui: 1) Inspeção e aspiração profunda, 2) Pulverização com solução antibacteriana, 3) Escovação para penetrar nas fibras, 4) Extração a quente com equipamento profissional, 5) Secagem rápida.`,
    benefits: [
      "Eliminação de até 99% dos ácaros responsáveis por alergias e rinite noturna",
      "Remoção de manchas de suor, urina e líquidos sem danificar os materiais internos",
      "Desodorização antibacteriana que devolve frescura ao quarto",
      "Processo seguro para colchões de espuma, látex, viscoelástico e molas",
      `Serviço ao domicílio ${prep} ${city}, sem necessidade de desmontar a cama`,
      `Ideal para famílias e alérgicos ${prep} ${city} que procuram noites de sono mais saudáveis`,
    ],
    localSection: `A nossa equipa de higienização de colchões cobre toda a área de ${city} e arredores. Atendemos residências, hotéis, residências seniores e alojamentos locais ${prep} ${city}. Taxa de deslocação de ${locationPrices[city] ?? 5}€.`,
    faqs: [
      { question: `Quanto custa a limpeza de colchão ${prep} ${city}?`, answer: `A higienização de colchão ${prep} ${city} começa a partir de 49€ para colchão de solteiro. Colchões de casal têm preços a partir de 69€. Contacte-nos para orçamento personalizado.` },
      { question: `A limpeza de colchão remove ácaros?`, answer: `Sim. O nosso processo de higienização profissional elimina até 99% dos ácaros, bactérias e fungos presentes no colchão, ideal para quem sofre de alergias.` },
      { question: `A limpeza remove cheiro de urina do colchão?`, answer: `Sim. A nossa extração profunda combinada com desodorização enzimática elimina completamente odores de urina, incluindo manchas antigas.` },
      { question: `Quanto tempo demora a secagem do colchão?`, answer: `O colchão fica pronto a usar no mesmo dia, tipicamente em 4-6 horas após a limpeza. Em dias mais secos, pode estar pronto ainda mais cedo.` },
      { question: `Com que frequência devo higienizar o colchão?`, answer: `Recomendamos higienização profissional a cada 6-12 meses para manter o colchão livre de ácaros e bactérias, especialmente para alérgicos.` },
    ],
  };
}

function generateTapetesContent(city: string, cityDesc: string): Omit<LocationService, 'slug' | 'city' | 'citySlug' | 'service' | 'serviceSlug' | 'relatedServices' | 'priceFrom'> {
  const prep = cityPrep(city);
  const Prep = cityPrepCap(city);
  return {
    title: `Limpeza de Tapetes ${city} | Desde 12€/m² | Kyro Clean Solutions`,
    metaDescription: `Lavagem profissional de tapetes ${prep} ${city}. Limpeza de tapetes persas, orientais e modernos. Recolha e entrega. Desde 12€/m².`,
    h1: `Limpeza e Lavagem de Tapetes ${prep} ${city}`,
    intro: `Procura lavagem de tapetes profissional ${prep} ${city}? A Kyro Clean Solutions oferece limpeza especializada de tapetes de todos os tipos: persas, orientais, modernos, de lã e sintéticos. Serviço disponível ${prep} ${city} e ${cityDesc} com recolha e entrega ao domicílio. Preços desde 12€/m².`,
    problems: [
      { title: "Sujidade acumulada nas fibras", description: `Os tapetes acumulam poeira, terra, areia e resíduos diariamente. ${Prep} ${city}, o uso constante torna a limpeza profunda essencial para manter a higiene.` },
      { title: "Manchas resistentes", description: `Manchas de líquidos, comida e animais que se fixam nas fibras do tapete e são impossíveis de remover com aspirador convencional.` },
      { title: "Alergénios e ácaros", description: `Os tapetes são dos principais reservatórios de ácaros e alergénios numa casa, contribuindo para problemas respiratórios.` },
      { title: "Cores desbotadas", description: `Sem limpeza adequada, as cores dos tapetes perdem vivacidade. A nossa lavagem profissional revitaliza as cores originais.` },
    ],
    howItWorks: `Processo de limpeza de tapetes ${prep} ${city}: 1) Avaliação do tipo de tapete e fibras, 2) Pulverização com produto específico por fibra, 3) Escovação para penetrar nas fibras, 4) Extração profunda com equipamento profissional, 5) Secagem controlada para preservar as fibras. Oferecemos recolha e entrega ao domicílio ${prep} ${city}.`,
    benefits: [
      "Lavagem especializada de tapetes persas, orientais, de lã e sintéticos",
      "Revitalização de cores desbotadas e remoção de manchas antigas",
      "Recolha e entrega ao domicílio, sem necessidade de transportar o tapete",
      "Eliminação de odores de animais de estimação e ácaros das fibras",
      `Serviço de confiança para quem vive ${prep} ${city} e em ${cityDesc}`,
      "Secagem controlada que preserva a textura e estrutura das fibras",
    ],
    localSection: `Recolhemos e entregamos tapetes em toda a área de ${city}. Atendemos clientes residenciais e comerciais: restaurantes, hotéis e escritórios ${prep} ${city} e arredores.`,
    faqs: [
      { question: `Quanto custa a limpeza de tapetes ${prep} ${city}?`, answer: `A limpeza de tapetes ${prep} ${city} tem preços a partir de 12€/m². O custo depende do tipo de tapete, dimensão e estado de sujidade. Peça orçamento gratuito.` },
      { question: `Fazem lavagem de tapetes persas ${prep} ${city}?`, answer: `Sim. Temos experiência na lavagem de tapetes persas, orientais e delicados. Utilizamos produtos e técnicas específicas para preservar as fibras e cores.` },
      { question: `Têm serviço de recolha de tapetes ${prep} ${city}?`, answer: `Sim! Oferecemos recolha e entrega de tapetes ao domicílio ${prep} ${city} e toda a área envolvente, sem custos adicionais para encomendas acima de 50€.` },
      { question: `Quanto tempo demora a lavagem de tapetes?`, answer: `O processo completo de lavagem e secagem demora tipicamente 3-5 dias úteis, dependendo do tipo e tamanho do tapete.` },
      { question: `A limpeza de tapetes remove odor a animal de estimação?`, answer: `Sim. A nossa lavagem profunda com desodorização enzimática elimina completamente odores de animais de estimação dos tapetes.` },
    ],
  };
}

function generateCadeirasContent(city: string, cityDesc: string): Omit<LocationService, 'slug' | 'city' | 'citySlug' | 'service' | 'serviceSlug' | 'relatedServices' | 'priceFrom'> {
  const prep = cityPrep(city);
  const Prep = cityPrepCap(city);
  return {
    title: `Limpeza de Cadeiras Estofadas ${city} | Desde 20€ | Kyro Clean Solutions`,
    metaDescription: `Limpeza profissional de cadeiras estofadas ${prep} ${city}. Ideal para escritórios, restaurantes e residências. Desde 20€ por cadeira.`,
    h1: `Limpeza de Cadeiras Estofadas ${prep} ${city}`,
    intro: `Precisa de limpar cadeiras estofadas ${prep} ${city}? A Kyro Clean Solutions realiza limpeza profissional de cadeiras de escritório, cadeiras de jantar e cadeiras estofadas ${prep} ${city} e ${cityDesc}. Serviço rápido e eficaz ao domicílio ou no seu estabelecimento. Desde 20€ por cadeira.`,
    problems: [
      { title: "Sujidade do uso diário", description: `Cadeiras de escritório e jantar acumulam manchas de suor, gordura e líquidos diariamente. ${Prep} ${city}, muitos escritórios e restaurantes necessitam de limpeza regular.` },
      { title: "Manchas visíveis", description: `Manchas de café, alimentos e tinta que deixam as cadeiras com aspecto descuidado, prejudicando a imagem do seu espaço.` },
      { title: "Odores retidos", description: `O tecido das cadeiras absorve odores de suor e comida, criando um ambiente desagradável no escritório ou restaurante.` },
    ],
    howItWorks: `Limpeza de cadeiras ${prep} ${city}: 1) Inspeção do tecido, 2) Pulverização com produto específico, 3) Escovação para penetrar nas fibras, 4) Extração profunda com equipamento profissional, 5) Secagem rápida. Ideal para lotes de cadeiras em escritórios e restaurantes.`,
    benefits: [
      "Preços por unidade a partir de 20€, com desconto progressivo para lotes de cadeiras",
      "Ideal para escritórios, restaurantes, salas de reunião e refeitórios",
      "Remoção de manchas de café, tinta, gordura e uso diário",
      "Serviço rápido que não interrompe o funcionamento do seu espaço",
      `Deslocamo-nos a empresas e residências ${prep} ${city} e arredores`,
      "Secagem rápida: cadeiras prontas a usar no mesmo dia",
    ],
    localSection: `Atendemos escritórios, restaurantes, hotéis, clínicas e residências ${prep} ${city}. Oferecemos preços especiais para limpeza de lotes de cadeiras em empresas da zona de ${city} e arredores.`,
    faqs: [
      { question: `Quanto custa limpar cadeiras estofadas ${prep} ${city}?`, answer: `A limpeza de cadeiras estofadas ${prep} ${city} começa a partir de 20€ por cadeira (1ª a 4ª), com preço decrescente por unidade a partir da 5ª. Ideal para escritórios e restaurantes.` },
      { question: `Fazem limpeza de cadeiras de escritório ${prep} ${city}?`, answer: `Sim! Limpamos cadeiras de escritório, cadeiras de conferência e cadeiras executivas. Deslocamo-nos ao seu escritório ${prep} ${city} sem interrupção do trabalho.` },
      { question: `Qual o desconto para limpeza de muitas cadeiras?`, answer: `Oferecemos descontos progressivos: 10% para 10+ cadeiras, 15% para 20+ cadeiras. Contacte-nos para orçamento personalizado para o seu escritório ou restaurante ${prep} ${city}.` },
    ],
  };
}

function generateAlcatifasContent(city: string, cityDesc: string): Omit<LocationService, 'slug' | 'city' | 'citySlug' | 'service' | 'serviceSlug' | 'relatedServices' | 'priceFrom'> {
  const prep = cityPrep(city);
  const Prep = cityPrepCap(city);
  return {
    title: `Limpeza de Alcatifas ${city} | Desde 3€/m² | Kyro Clean Solutions`,
    metaDescription: `Limpeza profunda de alcatifas ${prep} ${city}. Remoção de sujidade acumulada e alergénios. Secagem rápida. Desde 3€/m². Orçamento gratuito.`,
    h1: `Limpeza Profunda de Alcatifas ${prep} ${city}`,
    intro: `As alcatifas do seu espaço ${prep} ${city} precisam de limpeza profissional? A Kyro Clean Solutions oferece limpeza profunda de alcatifas com extração profissional ${prep} ${city} e ${cityDesc}. Removemos sujidade acumulada, manchas e alergénios, devolvendo frescura e higiene. Desde 3€/m².`,
    problems: [
      { title: "Sujidade profunda acumulada", description: `As alcatifas acumulam poeira, terra e resíduos nas camadas profundas das fibras. O aspirador convencional remove apenas a sujidade superficial.` },
      { title: "Alergénios e ácaros", description: `${Prep} ${city}, as alcatifas são reservatórios de ácaros e alergénios que afetam a qualidade do ar interior e causam problemas respiratórios.` },
      { title: "Manchas em grandes superfícies", description: `Manchas em alcatifas de escritórios, hotéis e residências que afetam a imagem profissional do espaço.` },
    ],
    howItWorks: `Processo de limpeza de alcatifas ${prep} ${city}: 1) Aspiração industrial, 2) Pulverização com detergente profissional, 3) Escovação para penetrar nas fibras, 4) Extração a quente com equipamento profissional, 5) Secagem rápida com ventilação. Ideal para grandes superfícies em escritórios e hotéis.`,
    benefits: [
      "Limpeza de grandes superfícies em escritórios, hotéis, escolas e clínicas",
      "Extração profunda que remove sujidade retida nas camadas inferiores da alcatifa",
      "Redução de até 99% dos alergénios e ácaros acumulados",
      "Secagem rápida com equipamento de alta sucção, sem interromper a atividade",
      `Cobrimos toda a área de ${city} e arredores, com orçamentos para grandes superfícies`,
      `Conhecemos as necessidades de empresas ${prep} ${city}, ${cityDesc}`,
    ],
    localSection: `Atendemos escritórios, hotéis, escolas, clínicas e espaços comerciais com alcatifas ${prep} ${city} e toda a área metropolitana. Oferecemos orçamentos para grandes superfícies.`,
    faqs: [
      { question: `Quanto custa limpar alcatifas ${prep} ${city}?`, answer: `A limpeza de alcatifas ${prep} ${city} tem preços a partir de 3€/m². Para grandes superfícies oferecemos descontos por volume. Peça orçamento gratuito.` },
      { question: `Fazem limpeza de alcatifas em escritórios ${prep} ${city}?`, answer: `Sim! Realizamos limpeza de alcatifas em escritórios, hotéis e espaços comerciais ${prep} ${city}. Podemos agendar fora do horário de trabalho para mínima interrupção.` },
      { question: `Quanto tempo demora a secar a alcatifa?`, answer: `Com o nosso processo de extração profissional, a alcatifa fica seca em 2-4 horas. Utilizamos equipamento de alta sucção que minimiza o tempo de secagem.` },
    ],
  };
}

function generateImpermeabilizacaoContent(city: string, cityDesc: string): Omit<LocationService, 'slug' | 'city' | 'citySlug' | 'service' | 'serviceSlug' | 'relatedServices' | 'priceFrom'> {
  const prep = cityPrep(city);
  return {
    title: `Impermeabilização de Estofos ${city} | Proteção até 10 anos | Kyro Clean Solutions`,
    metaDescription: `Impermeabilização profissional de sofás, cadeiras e tapetes ${prep} ${city}. Proteção invisível contra manchas e líquidos com garantia até 10 anos.`,
    h1: `Impermeabilização de Estofos ${prep} ${city}`,
    intro: `Proteja os seus estofos contra manchas e líquidos ${prep} ${city}. A Kyro Clean Solutions aplica impermeabilização profissional invisível que cria uma barreira protetora nos tecidos, repelindo líquidos e facilitando a limpeza. Serviço disponível ${prep} ${city} e ${cityDesc} com garantia até 10 anos.`,
    problems: [
      { title: "Sofá sem proteção", description: `Sem impermeabilização, qualquer derrame penetra rapidamente nas fibras do sofá, causando manchas permanentes e danos ao estofamento.` },
      { title: "Manchas frequentes com crianças e animais", description: `Famílias ${prep} ${city} com crianças e animais de estimação sofrem com manchas constantes. A impermeabilização previne estes danos.` },
      { title: "Desgaste acelerado dos tecidos", description: `Tecidos não protegidos desgastam-se mais rapidamente. A impermeabilização prolonga significativamente a vida útil dos estofos.` },
    ],
    howItWorks: `Processo de impermeabilização ${prep} ${city}: 1) Limpeza prévia dos estofos (se necessário), 2) Aplicação uniforme do produto impermeabilizante, 3) Secagem e cura do produto, 4) Teste de repelência. Garantia até 10 anos.`,
    benefits: [
      "Barreira protetora invisível que não altera a cor nem a textura do tecido",
      "Proteção contra manchas de vinho, café, gordura e urina de animais",
      "Garantia de durabilidade até 10 anos consoante o tecido e uso",
      "Ideal para famílias com crianças pequenas e animais de estimação",
      `Aplicação ao domicílio ${prep} ${city}, com possibilidade de combinar com limpeza prévia`,
      `Recomendado para quem vive ${prep} ${city} e quer proteger sofás, cadeiras e tapetes a longo prazo`,
    ],
    localSection: `Oferecemos impermeabilização de estofos ${prep} ${city} e toda a região envolvente. Ideal combinar com limpeza profissional: peça pack completo com desconto.`,
    faqs: [
      { question: `Quanto custa impermeabilizar um sofá ${prep} ${city}?`, answer: `A impermeabilização de sofás ${prep} ${city} custa 59€ (1 lugar), 79€ (2 lugares) e 99€ (3 lugares). O pack limpeza + impermeabilização numa única visita começa em 99€ para 1 lugar. Orçamento gratuito ${prep} ${city}.` },
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
