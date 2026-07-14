// Programmatic SEO: Material pages data engine
// Targets searches like "limpeza sofa tecido", "limpeza sofa veludo porto"

import { cities, cityPrep } from "./locationSeoData";

export interface MaterialDefinition {
  slug: string;
  name: string;
  serviceSlug: string;
  serviceName: string;
  keyword: string;
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  characteristics: string[];
  cleaningProcess: string[];
  tips: string[];
  faqs: { question: string; answer: string }[];
  relatedMaterials: string[];
}

const materialDefinitions: MaterialDefinition[] = [
  // ── SOFÁ MATERIALS ──
  {
    slug: "limpeza-sofa-tecido",
    name: "Sofá em Tecido",
    serviceSlug: "limpeza-sofas",
    serviceName: "Limpeza de Sofás",
    keyword: "limpeza sofá tecido",
    title: "Limpeza de Sofá em Tecido | Profissional | Kyro Clean Solutions",
    metaDescription: "Limpeza profissional de sofá em tecido. Remoção de manchas, ácaros e odores. Tratamento específico para tecidos. Desde 39€. Orçamento grátis.",
    h1: "Limpeza Profissional de Sofá em Tecido",
    intro: "Sofás em tecido são os mais comuns nas casas portuguesas e requerem cuidados específicos. A Kyro Clean Solutions utiliza técnicas de extração profunda adaptadas a cada tipo de tecido para garantir uma limpeza segura e eficaz.",
    characteristics: [
      "Absorve líquidos e manchas facilmente",
      "Acumula ácaros e pó nas fibras",
      "Sensível a produtos químicos agressivos",
      "Precisa de secagem controlada",
    ],
    cleaningProcess: [
      "Identificação do tipo de tecido e teste de cor",
      "Aspiração profunda para remover pó e partículas",
      "Pré-tratamento com solução adequada ao tecido",
      "Extração profunda com água quente e equipamento profissional",
    ],
    tips: [
      "Aspire o sofá semanalmente",
      "Limpe manchas imediatamente sem esfregar",
      "Evite exposição solar direta prolongada",
      "Considere impermeabilização após a limpeza",
    ],
    faqs: [
      { question: "A limpeza profissional é segura para qualquer tecido?", answer: "Sim. Testamos sempre o tecido antes de iniciar e utilizamos produtos específicos para cada tipo de fibra, garantindo uma limpeza segura e eficaz." },
      { question: "Quanto tempo demora a secagem do sofá em tecido?", answer: "Normalmente entre 4 a 6 horas. Depende do tipo de tecido, ventilação e temperatura ambiente." },
      { question: "A limpeza remove todas as manchas do tecido?", answer: "Na maioria dos casos, sim. Manchas muito antigas ou de tinta permanente podem necessitar de tratamento adicional." },
    ],
    relatedMaterials: ["limpeza-sofa-veludo", "limpeza-sofa-microfibra", "limpeza-sofa-linho"],
  },
  {
    slug: "limpeza-sofa-veludo",
    name: "Sofá em Veludo",
    serviceSlug: "limpeza-sofas",
    serviceName: "Limpeza de Sofás",
    keyword: "limpeza sofá veludo",
    title: "Limpeza de Sofá em Veludo | Cuidado Especializado | Kyro",
    metaDescription: "Limpeza especializada de sofás em veludo. Preservamos a textura e brilho original. Equipamento profissional de extração. Orçamento grátis.",
    h1: "Limpeza Especializada de Sofá em Veludo",
    intro: "O veludo é um tecido luxuoso que requer cuidados especializados. A nossa equipa está treinada para limpar sofás em veludo sem danificar a textura ou o brilho característico deste material premium.",
    characteristics: [
      "Textura delicada e sensível à pressão",
      "Marcas de dedos e vincos facilmente visíveis",
      "Requer técnica de limpeza no sentido do pelo",
      "Secagem cuidadosa para evitar marcas de água",
    ],
    cleaningProcess: [
      "Avaliação da direção do pelo do veludo",
      "Aspiração suave com bocal de veludo",
      "Limpeza com vapor controlado a baixa pressão",
      "Escovagem final no sentido do pelo",
    ],
    tips: [
      "Escove regularmente no sentido do pelo",
      "Nunca esfregue manchas: absorva com pano seco",
      "Evite sentar-se sempre no mesmo local",
      "Impermeabilize para proteger contra manchas",
    ],
    faqs: [
      { question: "A limpeza profissional estraga o veludo?", answer: "Não. Utilizamos técnicas específicas para veludo, incluindo limpeza no sentido do pelo e pressão controlada, preservando a textura e o brilho." },
      { question: "Posso limpar veludo em casa?", answer: "Para manchas pontuais, pode absorver o excesso com pano seco. Mas para uma limpeza profunda, recomendamos sempre serviço profissional para evitar danos permanentes." },
      { question: "Quanto custa limpar um sofá em veludo?", answer: "A partir de 39€ para sofás de 2 lugares. O veludo pode requerer um tratamento mais cuidadoso, o que pode influenciar ligeiramente o preço." },
    ],
    relatedMaterials: ["limpeza-sofa-tecido", "limpeza-sofa-pele", "limpeza-sofa-camurca"],
  },
  {
    slug: "limpeza-sofa-pele",
    name: "Sofá em Pele",
    serviceSlug: "limpeza-sofas",
    serviceName: "Limpeza de Sofás",
    keyword: "limpeza sofá pele",
    title: "Limpeza de Sofá em Pele | Tratamento Profissional | Kyro",
    metaDescription: "Limpeza e hidratação profissional de sofás em pele. Removemos manchas e restauramos o brilho. Produtos específicos para couro. Orçamento grátis.",
    h1: "Limpeza e Hidratação de Sofá em Pele",
    intro: "Sofás em pele e couro exigem um cuidado especializado para manter a elasticidade, cor e brilho. Utilizamos produtos específicos para couro que limpam, hidratam e protegem o seu sofá.",
    characteristics: [
      "Material natural que necessita de hidratação",
      "Sensível a calor e exposição solar",
      "Pode rachar e descamar sem cuidado adequado",
      "Resistente a líquidos se bem tratado",
    ],
    cleaningProcess: [
      "Identificação do tipo de pele (anilina, semi-anilina, pigmentada)",
      "Limpeza suave com espuma específica para couro",
      "Hidratação profunda com creme nutritivo",
      "Proteção final com selante para couro",
    ],
    tips: [
      "Hidrate o sofá em pele a cada 6 meses",
      "Mantenha longe de fontes de calor direto",
      "Limpe derrames imediatamente com pano seco",
      "Evite produtos abrasivos ou à base de álcool",
    ],
    faqs: [
      { question: "Com que frequência devo limpar um sofá em pele?", answer: "Recomendamos limpeza profissional a cada 6-12 meses, dependendo do uso. A hidratação deve ser feita pelo menos semestralmente." },
      { question: "A limpeza remove arranhões da pele?", answer: "Arranhões superficiais podem ser minimizados com o processo de hidratação e proteção. Arranhões profundos podem necessitar de restauro especializado." },
      { question: "Quanto custa limpar e hidratar um sofá em pele?", answer: "A partir de 59€ para sofás de 2 lugares, incluindo limpeza e hidratação. O preço pode variar conforme o tipo de pele e estado do sofá." },
    ],
    relatedMaterials: ["limpeza-sofa-tecido", "limpeza-sofa-camurca", "limpeza-sofa-sintetico"],
  },
  {
    slug: "limpeza-sofa-microfibra",
    name: "Sofá em Microfibra",
    serviceSlug: "limpeza-sofas",
    serviceName: "Limpeza de Sofás",
    keyword: "limpeza sofá microfibra",
    title: "Limpeza de Sofá em Microfibra | Kyro Clean Solutions",
    metaDescription: "Limpeza profissional de sofás em microfibra. Remoção de manchas sem danificar as fibras. Resultados imediatos. Desde 39€.",
    h1: "Limpeza Profissional de Sofá em Microfibra",
    intro: "A microfibra é um material popular pela sua durabilidade e conforto, mas pode ser difícil de limpar corretamente em casa. O nosso processo profissional remove manchas e sujidade sem danificar as fibras finas.",
    characteristics: [
      "Fibras ultra-finas que retêm sujidade",
      "Pode manchar com água se mal aplicada",
      "Resistente ao desgaste diário",
      "Requer técnica específica de limpeza",
    ],
    cleaningProcess: [
      "Teste de reação do tecido (código W, S ou WS)",
      "Aspiração profunda das fibras",
      "Limpeza com solução adequada ao código do tecido",
      "Escovagem para restaurar a textura macia",
    ],
    tips: [
      "Verifique o código de limpeza na etiqueta",
      "Aspire regularmente para evitar acumulação",
      "Trate manchas rapidamente com pano húmido",
      "Escove com escova macia após a limpeza",
    ],
    faqs: [
      { question: "A microfibra pode ser lavada com água?", answer: "Depende do código de limpeza do tecido (W = água, S = solvente, WS = ambos). Nós identificamos sempre o código antes de escolher o método de limpeza adequado." },
      { question: "A limpeza remove as manchas de água na microfibra?", answer: "Sim. As manchas de água (auréolas) são comuns em microfibra e removemos facilmente com o tratamento profissional adequado." },
    ],
    relatedMaterials: ["limpeza-sofa-tecido", "limpeza-sofa-veludo", "limpeza-sofa-sintetico"],
  },
  {
    slug: "limpeza-sofa-linho",
    name: "Sofá em Linho",
    serviceSlug: "limpeza-sofas",
    serviceName: "Limpeza de Sofás",
    keyword: "limpeza sofá linho",
    title: "Limpeza de Sofá em Linho | Kyro Clean Solutions",
    metaDescription: "Limpeza profissional de sofás em linho. Cuidado delicado que preserva a textura natural. Remoção de manchas. Orçamento grátis.",
    h1: "Limpeza de Sofá em Linho",
    intro: "O linho é um material natural elegante mas delicado. A nossa equipa utiliza técnicas suaves que limpam profundamente sem encolher ou deformar as fibras de linho do seu sofá.",
    characteristics: [
      "Fibra natural que pode encolher com calor",
      "Amassa facilmente e marca com líquidos",
      "Requer limpeza a temperaturas controladas",
      "Textura que melhora com o uso",
    ],
    cleaningProcess: [
      "Teste de encolhimento e reação do tecido",
      "Aspiração suave com bocal adequado",
      "Limpeza com água a temperatura controlada",
      "Secagem natural com ventilação adequada",
    ],
    tips: [
      "Evite lavar com água quente",
      "Rode as almofadas regularmente",
      "Proteja da luz solar direta",
      "Considere capas protetoras no dia-a-dia",
    ],
    faqs: [
      { question: "A limpeza profissional encolhe o linho?", answer: "Não. Controlamos cuidadosamente a temperatura da água e o processo de secagem para evitar qualquer encolhimento do tecido." },
      { question: "O linho é difícil de manter limpo?", answer: "O linho tende a marcar mais facilmente, mas com limpeza profissional regular e impermeabilização, mantém-se bonito e protegido." },
    ],
    relatedMaterials: ["limpeza-sofa-tecido", "limpeza-sofa-veludo", "limpeza-sofa-microfibra"],
  },
  {
    slug: "limpeza-sofa-camurca",
    name: "Sofá em Camurça",
    serviceSlug: "limpeza-sofas",
    serviceName: "Limpeza de Sofás",
    keyword: "limpeza sofá camurça",
    title: "Limpeza de Sofá em Camurça | Cuidado Especializado | Kyro",
    metaDescription: "Limpeza de sofás em camurça com técnica especializada. Preservamos a textura aveludada. Remoção segura de manchas. Orçamento grátis.",
    h1: "Limpeza de Sofá em Camurça",
    intro: "A camurça é um material delicado que necessita de limpeza especializada. Utilizamos técnicas a seco e vapor controlado para limpar profundamente sem danificar a textura aveludada.",
    characteristics: [
      "Superfície aveludada sensível à água",
      "Marca facilmente com líquidos e gordura",
      "Requer limpeza a seco ou vapor controlado",
      "Cor pode desbotar com produtos inadequados",
    ],
    cleaningProcess: [
      "Avaliação do estado e tipo de camurça",
      "Limpeza a seco com espuma específica",
      "Remoção de manchas com vapor controlado",
      "Escovagem final para restaurar a textura",
    ],
    tips: [
      "Nunca use água diretamente na camurça",
      "Escove regularmente com escova de camurça",
      "Use protetor spray específico para camurça",
      "Guarde longe de humidade e luz solar",
    ],
    faqs: [
      { question: "Posso limpar camurça com água?", answer: "Não recomendamos. A água pode manchar permanentemente a camurça. Utilizamos técnicas a seco e vapor controlado que são seguras para este material." },
      { question: "A camurça pode ser impermeabilizada?", answer: "Sim, e recomendamos. A impermeabilização cria uma barreira protetora contra líquidos e manchas, prolongando a vida útil do sofá em camurça." },
    ],
    relatedMaterials: ["limpeza-sofa-pele", "limpeza-sofa-veludo", "limpeza-sofa-tecido"],
  },
  {
    slug: "limpeza-sofa-sintetico",
    name: "Sofá em Material Sintético",
    serviceSlug: "limpeza-sofas",
    serviceName: "Limpeza de Sofás",
    keyword: "limpeza sofá sintético",
    title: "Limpeza de Sofá Sintético | Kyro Clean Solutions",
    metaDescription: "Limpeza profissional de sofás em material sintético. Pele sintética, poliéster e napa. Remoção de manchas e restauração. Desde 39€.",
    h1: "Limpeza de Sofá em Material Sintético",
    intro: "Sofás em pele sintética, poliéster ou napa são práticos e duráveis, mas necessitam de limpeza adequada para evitar descamação e desgaste prematuro. Limpamos e protegemos o seu sofá sintético.",
    characteristics: [
      "Material resistente mas pode descamar",
      "Sensível a produtos abrasivos",
      "Fácil de limpar superficialmente",
      "Pode amarelar com o tempo",
    ],
    cleaningProcess: [
      "Identificação do tipo de material sintético",
      "Limpeza suave com espuma específica",
      "Hidratação para prevenir rachaduras",
      "Proteção UV para evitar amarelecimento",
    ],
    tips: [
      "Limpe regularmente com pano húmido",
      "Evite produtos à base de acetona ou álcool",
      "Mantenha longe de fontes de calor",
      "Hidrate periodicamente para evitar rachaduras",
    ],
    faqs: [
      { question: "A pele sintética pode ser limpa profissionalmente?", answer: "Sim. Utilizamos produtos específicos para materiais sintéticos que limpam sem causar descamação ou descoloração." },
      { question: "Como evitar que o sofá sintético descame?", answer: "A hidratação regular e proteção contra calor e UV são fundamentais. O nosso serviço inclui hidratação e proteção que prolonga a vida do material." },
    ],
    relatedMaterials: ["limpeza-sofa-pele", "limpeza-sofa-tecido", "limpeza-sofa-microfibra"],
  },
  // ── TAPETE MATERIALS ──
  {
    slug: "limpeza-tapete-la",
    name: "Tapete de Lã",
    serviceSlug: "limpeza-tapetes",
    serviceName: "Limpeza de Tapetes",
    keyword: "limpeza tapete lã",
    title: "Limpeza de Tapete de Lã | Kyro Clean Solutions",
    metaDescription: "Limpeza profissional de tapetes de lã. Preservamos a qualidade e cor das fibras naturais. Tratamento delicado. Desde 12€/m².",
    h1: "Limpeza Profissional de Tapetes de Lã",
    intro: "Tapetes de lã são peças valiosas que requerem cuidados especializados. A nossa equipa limpa tapetes de lã com técnicas que preservam a qualidade, cor e integridade das fibras naturais.",
    characteristics: [
      "Fibra natural que pode encolher",
      "Cores podem desbotar com produtos errados",
      "Retém pó e ácaros nas fibras densas",
      "Material durável se bem cuidado",
    ],
    cleaningProcess: [
      "Inspeção do tapete e identificação do tipo de fibra",
      "Pulverização com solução de limpeza específica para lã",
      "Lavagem com máquina profissional que escova e extrai em simultâneo",
      "Secagem controlada em plano horizontal",
    ],
    tips: [
      "Aspire semanalmente dos dois lados",
      "Rode o tapete regularmente para desgaste uniforme",
      "Trate manchas imediatamente com pano húmido",
      "Limpeza profissional anual recomendada",
    ],
    faqs: [
      { question: "A limpeza profissional encolhe tapetes de lã?", answer: "Não. Utilizamos temperaturas e técnicas controladas específicas para lã que previnem o encolhimento e preservam as fibras." },
      { question: "Quanto custa limpar um tapete de lã?", answer: "A partir de 12€/m² (até 5m²), com tarifa decrescente para áreas maiores. Tapetes orientais ou artesanais podem requerer tratamento especializado com preço sob consulta." },
    ],
    relatedMaterials: ["limpeza-tapete-sintetico", "limpeza-tapete-persa", "limpeza-tapete-sisal"],
  },
  {
    slug: "limpeza-tapete-persa",
    name: "Tapete Persa",
    serviceSlug: "limpeza-tapetes",
    serviceName: "Limpeza de Tapetes",
    keyword: "limpeza tapete persa",
    title: "Limpeza de Tapete Persa | Cuidado Premium | Kyro",
    metaDescription: "Limpeza especializada de tapetes persas e orientais. Preservamos cores e fibras originais. Tratamento premium. Orçamento sob consulta.",
    h1: "Limpeza Especializada de Tapetes Persas",
    intro: "Tapetes persas e orientais são obras de arte que merecem o máximo cuidado. A nossa equipa tem formação específica para limpar tapetes feitos à mão, preservando a integridade dos nós, cores e fibras originais.",
    characteristics: [
      "Feito à mão com fibras naturais",
      "Cores naturais sensíveis a químicos",
      "Valor artístico e sentimental elevado",
      "Nós delicados que requerem cuidado extremo",
    ],
    cleaningProcess: [
      "Inspeção detalhada da estrutura, nós e cores",
      "Pulverização com solução neutra própria para fibras naturais",
      "Lavagem com máquina profissional que escova e extrai em simultâneo",
      "Secagem em plano horizontal com ventilação",
    ],
    tips: [
      "Nunca lave um tapete persa em máquina",
      "Aspire suavemente no sentido do pelo",
      "Proteja da exposição solar direta",
      "Guarde enrolado (não dobrado) se não usar",
    ],
    faqs: [
      { question: "Podem limpar tapetes persas feitos à mão?", answer: "Sim. Temos formação e experiência em limpeza de tapetes persas, orientais e artesanais. Cada tapete é tratado individualmente com o cuidado que merece." },
      { question: "A limpeza pode danificar as cores do tapete persa?", answer: "Não. Testamos sempre a solidez das cores antes de iniciar e utilizamos apenas produtos neutros e suaves que preservam as cores originais." },
    ],
    relatedMaterials: ["limpeza-tapete-la", "limpeza-tapete-sintetico"],
  },
  {
    slug: "limpeza-tapete-sintetico",
    name: "Tapete Sintético",
    serviceSlug: "limpeza-tapetes",
    serviceName: "Limpeza de Tapetes",
    keyword: "limpeza tapete sintético",
    title: "Limpeza de Tapete Sintético | Kyro Clean Solutions",
    metaDescription: "Limpeza profissional de tapetes sintéticos. Remoção de manchas e odores. Resultados imediatos. Desde 12€/m². Orçamento grátis.",
    h1: "Limpeza de Tapetes Sintéticos",
    intro: "Tapetes sintéticos (polipropileno, poliéster, nylon) são resistentes mas acumulam sujidade e odores. A nossa limpeza profissional remove toda a sujidade acumulada nas fibras e devolve o aspeto original.",
    characteristics: [
      "Resistente a manchas e desgaste",
      "Acumula electricidade estática",
      "Fácil de limpar mas retém odores",
      "Fibras que achatam com o uso",
    ],
    cleaningProcess: [
      "Inspeção do tapete e identificação do tipo de fibra",
      "Pulverização com solução de limpeza adequada",
      "Lavagem com máquina profissional que escova e extrai em simultâneo",
      "Secagem rápida e escovagem final das fibras",
    ],
    tips: [
      "Aspire 2-3 vezes por semana",
      "Trate manchas imediatamente",
      "Rode o tapete para desgaste uniforme",
      "Limpeza profissional semestral recomendada",
    ],
    faqs: [
      { question: "Quanto custa limpar um tapete sintético?", answer: "A partir de 12€/m² (até 5m²), com tarifa decrescente para áreas maiores. Tapetes sintéticos são geralmente mais económicos de limpar do que tapetes naturais." },
      { question: "A limpeza levanta as fibras achatadas?", answer: "Sim. O processo de extração e escovagem ajuda a restaurar o volume e aspeto original das fibras sintéticas." },
    ],
    relatedMaterials: ["limpeza-tapete-la", "limpeza-tapete-persa", "limpeza-tapete-sisal"],
  },
  {
    slug: "limpeza-tapete-sisal",
    name: "Tapete de Sisal/Juta",
    serviceSlug: "limpeza-tapetes",
    serviceName: "Limpeza de Tapetes",
    keyword: "limpeza tapete sisal",
    title: "Limpeza de Tapete de Sisal e Juta | Kyro",
    metaDescription: "Limpeza profissional de tapetes de sisal e juta. Fibras naturais tratadas com cuidado especializado. Orçamento grátis.",
    h1: "Limpeza de Tapetes de Sisal e Juta",
    intro: "Tapetes de sisal e juta são feitos de fibras naturais que requerem limpeza a seco ou com mínima humidade. A nossa equipa utiliza técnicas específicas para limpar sem danificar estas fibras delicadas.",
    characteristics: [
      "Fibras naturais sensíveis à água",
      "Podem manchar e deformar com excesso de humidade",
      "Requerem limpeza a seco ou vapor",
      "Biodegradáveis e ecológicos",
    ],
    cleaningProcess: [
      "Inspeção do tapete e identificação do tipo de fibra",
      "Aplicação de produto de limpeza a seco, sem água",
      "Escovagem manual para soltar a sujidade das fibras",
      "Remoção final por aspiração profunda",
    ],
    tips: [
      "Nunca lave com água abundante",
      "Aspire regularmente no sentido das fibras",
      "Trate manchas imediatamente com pano seco",
      "Mantenha em ambiente com humidade controlada",
    ],
    faqs: [
      { question: "Posso lavar o tapete de sisal com água?", answer: "Não recomendamos. O sisal e a juta são muito sensíveis à humidade e podem deformar. Utilizamos limpeza a seco ou vapor controlado." },
    ],
    relatedMaterials: ["limpeza-tapete-la", "limpeza-tapete-sintetico"],
  },
];

// ── Helpers ──

export function getMaterialBySlug(slug: string): MaterialDefinition | null {
  return materialDefinitions.find(m => m.slug === slug) || null;
}

export function getAllMaterials(): MaterialDefinition[] {
  return materialDefinitions;
}

export function getMaterialsByService(serviceSlug: string): MaterialDefinition[] {
  return materialDefinitions.filter(m => m.serviceSlug === serviceSlug);
}

export function getAllMaterialRoutes(): { path: string; slug: string }[] {
  return materialDefinitions.map(m => ({
    path: `/${m.slug}`,
    slug: m.slug,
  }));
}

// Material × City combos
export function getAllMaterialCityRoutes(): { path: string; materialSlug: string; citySlug: string }[] {
  const routes: { path: string; materialSlug: string; citySlug: string }[] = [];
  for (const mat of materialDefinitions) {
    for (const city of cities) {
      routes.push({
        path: `/${mat.slug}-${city.slug}`,
        materialSlug: mat.slug,
        citySlug: city.slug,
      });
    }
  }
  return routes;
}

export function getMaterialCityData(materialSlug: string, citySlug: string) {
  const mat = getMaterialBySlug(materialSlug);
  const city = cities.find(c => c.slug === citySlug);
  if (!mat || !city) return null;
  const prep = cityPrep(city.name);
  return {
    ...mat,
    city: city.name,
    citySlug: city.slug,
    cityDescription: city.description,
    title: `${mat.h1} ${prep} ${city.name} | Kyro Clean Solutions`,
    metaDescription: `${mat.metaDescription.replace('. Orçamento grátis.', '')} ${prep} ${city.name}. Orçamento grátis.`,
    h1: `${mat.h1} ${prep} ${city.name}`,
  };
}

export function getRelatedMaterialLinks(slugs: string[]): { name: string; path: string }[] {
  return slugs
    .map(slug => {
      const m = materialDefinitions.find(mat => mat.slug === slug);
      return m ? { name: m.name, path: `/${m.slug}` } : null;
    })
    .filter(Boolean) as { name: string; path: string }[];
}
