// Marca × Cidade SEO pages:"limpeza sofá IKEA porto", "higienização sofá Natuzzi lisboa"
// Zero competition in the market:no competitor has brand-specific pages

import { MARCA_CITIES } from "./marcaCities";

export interface MarcaSofa {
  id: string;
  name: string;
  slug: string;
  material: string;
  materialDescription: string;
  cleaningProcess: string;
  doNots: string[];
  doThis: string[];
  estimatedPriceRange: string;
  minPrice: number;
  maxPrice: number;
  serviceSlug: string;
  faqs: { question: string; answer: string }[];
}

export const marcas: MarcaSofa[] = [
  {
    id: "ikea",
    name: "IKEA",
    slug: "ikea",
    material: "Microfibra e algodão",
    materialDescription: "Os sofás IKEA (EKTORP, KIVIK, SÖDERHAMN, FRIHETEN) são maioritariamente revestidos em microfibra, algodão ou poliéster. São acessíveis mas acumulam sujidade nas fibras e exigem limpeza regular para manter o aspeto original.",
    cleaningProcess: "Limpeza a vapor a baixa pressão para preservar as fibras sintéticas. Uso de detergente neutro específico para microfibra. Extração de sujidade acumulada nas fibras.",
    doNots: [
      "Não usar produtos alcalinos: danificam a microfibra permanentemente",
      "Não esfregar com força: as fibras ficam com aspeto felpudo",
    ],
    doThis: [
      "Extraímos a sujidade acumulada nas fibras de microfibra sem danificar o tecido sintético IKEA",
      "Tratamos separadamente as capas removíveis de modelos como o EKTORP, para um resultado mais completo",
    ],
    estimatedPriceRange: "49€ - 79€",
    minPrice: 49,
    maxPrice: 79,
    serviceSlug: "limpeza-sofas",
    faqs: [
      {
        question: "Conseguem tirar as manchas dos sofás IKEA?",
        answer: "Sim. A maioria dos tecidos IKEA responde muito bem à limpeza a vapor. Manchas antigas de comida, café ou gordura são removidas em mais de 90% dos casos.",
      },
      {
        question: "O sofá IKEA precisa de ser desmontado para limpeza?",
        answer: "Não é necessário. Limpamos o sofá montado, incluindo todas as almofadas, encostos e recantos. O processo completo demora 1-2 horas no domicílio.",
      },
      {
        question: "A capa removível do sofá IKEA pode ser lavada à parte?",
        answer: "Sim. Para modelos com capas removíveis como o EKTORP, tratamos as capas separadamente para um resultado mais completo.",
      },
    ],
  },
  {
    id: "natuzzi",
    name: "Natuzzi",
    slug: "natuzzi",
    material: "Couro genuíno italiano",
    materialDescription: "Os sofás Natuzzi são revestidos em couro genuíno italiano de alta qualidade, um dos mais exigentes de tratar. Exigem produtos específicos para manter a elasticidade, hidratação e brilho natural ao longo dos anos.",
    cleaningProcess: "Limpeza suave com produto específico para couro genuíno (pH neutro). Remoção de gordura e sujidade com técnica de passagem suave. Hidratação com condicionador de couro após limpeza. Polimento final para restaurar o brilho natural.",
    doNots: [
      "Nunca usar produtos de limpeza domésticos: danificam o couro de forma irreversível",
      "Não expor a luz solar direta durante a secagem: racha o couro",
    ],
    doThis: [
      "Hidratamos e restauramos o brilho natural do couro genuíno Natuzzi com condicionador profissional certificado",
      "Usamos técnica manual sem vapor direto no couro, preservando a elasticidade original do material",
    ],
    estimatedPriceRange: "79€ - 129€",
    minPrice: 79,
    maxPrice: 129,
    serviceSlug: "limpeza-sofas",
    faqs: [
      {
        question: "Podem restaurar o couro do meu Natuzzi que ficou opaco e seco?",
        answer: "Sim. Com condicionador de couro profissional, restauramos a hidratação e o brilho do couro genuíno Natuzzi em mais de 85% dos casos. O resultado é visível imediatamente após o tratamento.",
      },
      {
        question: "A limpeza profissional danifica o couro original do Natuzzi?",
        answer: "Não. Usamos apenas produtos certificados para couro genuíno, seguros para sofás de alta gama como Natuzzi. Não usamos vapor direto no couro: a técnica é manual com produtos específicos.",
      },
      {
        question: "Com que frequência devo limpar um Natuzzi de couro?",
        answer: "Recomendamos limpeza profissional 1 vez por ano e hidratação a cada 6 meses para manter o couro Natuzzi em ótimo estado. Couro bem cuidado dura décadas.",
      },
    ],
  },
  {
    id: "roche-bobois",
    name: "Roche Bobois",
    slug: "roche-bobois",
    material: "Tecidos de design premium e couro selecionado",
    materialDescription: "Os sofás Roche Bobois são peças de design de alta gama com tecidos exclusivos importados, como sedas, linho ou veludo estruturado, ou couros selecionados. Cada modelo pode ter especificações únicas de manutenção.",
    cleaningProcess: "Avaliação obrigatória do tecido antes de qualquer intervenção. Produto de pH rigorosamente neutro para preservar cores e fibras delicadas. Técnica de extração a pressão mínima. Secagem controlada sem qualquer fonte de calor.",
    doNots: [
      "Nunca tentar limpeza doméstica: risco de dano irreversível em tecidos de luxo",
      "Não usar vapor a alta temperatura em seda ou linho",
    ],
    doThis: [
      "Fazemos sempre avaliação prévia gratuita do tecido antes de qualquer intervenção em peças de design Roche Bobois",
      "Temos seguro de responsabilidade civil que cobre eventuais danos em sofás de valor elevado",
    ],
    estimatedPriceRange: "Sob consulta",
    minPrice: 89,
    maxPrice: 200,
    serviceSlug: "limpeza-sofas",
    faqs: [
      {
        question: "Trabalham com sofás de design de alta gama como Roche Bobois?",
        answer: "Sim. Temos experiência com sofás premium de marcas como Roche Bobois, B&B Italia e outras peças de design. Fazemos sempre avaliação prévia gratuita do material antes de qualquer intervenção.",
      },
      {
        question: "O preço é diferente para sofás Roche Bobois?",
        answer: "Sim, o preço é personalizado conforme o material e estado do sofá. Fazemos orçamento gratuito antes de iniciar. A complexidade do material exige produtos e tempo adicional.",
      },
      {
        question: "Têm seguro para danos em sofás de valor elevado como o Roche Bobois?",
        answer: "Sim. A Kyro Clean tem seguro de responsabilidade civil que cobre eventuais danos durante a prestação de serviço em Portugal.",
      },
    ],
  },
  {
    id: "conforama",
    name: "Conforama",
    slug: "conforama",
    material: "Tecido e couro sintético (PU)",
    materialDescription: "Os sofás Conforama usam maioritariamente tecidos sintéticos e couro ecológico (PU ou couro sintético). São económicos mas o PU exige cuidados especiais para não descascar durante a limpeza.",
    cleaningProcess: "Limpeza suave com spray desengordurante e vapor moderado. Atenção especial nas costuras do couro PU. Produto específico para tecidos sintéticos. Evitamos humidade excessiva para preservar as emendas.",
    doNots: [
      "Não usar vapor a alta pressão em couro PU: descasca e não tem recuperação",
      "Evitar produtos com álcool em tecidos sintéticos: dissolve o PU",
    ],
    doThis: [
      "Usamos técnica específica para couro PU que não agride nem descasca o material",
      "Damos atenção redobrada às costuras, o ponto mais frágil do couro sintético Conforama",
    ],
    estimatedPriceRange: "49€ - 79€",
    minPrice: 49,
    maxPrice: 79,
    serviceSlug: "limpeza-sofas",
    faqs: [
      {
        question: "O couro PU do meu Conforama está a descascar. Conseguem reparar?",
        answer: "Podemos limpar e tratar para retardar o processo, mas o descascamento avançado de couro PU não tem recuperação total. Podemos recomendar profissionais de reestofamento se necessário.",
      },
      {
        question: "A limpeza profissional vai piorar o estado do couro PU do Conforama?",
        answer: "Não, se feita corretamente. Usamos técnicas específicas para couro sintético que não agridem o material. Evitamos vapor a alta pressão e produtos inadequados.",
      },
      {
        question: "Vale a pena limpar um sofá Conforama mais antigo?",
        answer: "Sim, se o couro não estiver muito degradado. A limpeza profissional prolonga a vida útil em 2-3 anos e melhora significativamente o aspeto visual.",
      },
    ],
  },
  {
    id: "el-corte-ingles",
    name: "El Corte Inglés",
    slug: "el-corte-ingles",
    material: "Tecido de alta qualidade (algodão, linho e mistos)",
    materialDescription: "Os sofás El Corte Inglés combinam tecidos de algodão, linho e misturas de fibras naturais e sintéticas. São duráveis, de boa qualidade e respondem muito bem à limpeza profissional.",
    cleaningProcess: "Extração a vapor controlada para fibras naturais e mistas. Tratamento com produto específico para tecidos de qualidade. Resultado final com cores mais vivas e tecido renovado.",
    doNots: [
      "Não usar água muito quente em linho: pode encolher o tecido",
      "Não usar branqueadores em tecidos coloridos: descolora permanentemente",
    ],
    doThis: [
      "Usamos produtos de pH neutro que deixam as cores do tecido El Corte Inglés mais vivas e definidas",
      "Tratamos almofadas removíveis e fixas com o método adequado a cada uma",
    ],
    estimatedPriceRange: "49€ - 89€",
    minPrice: 49,
    maxPrice: 89,
    serviceSlug: "limpeza-sofas",
    faqs: [
      {
        question: "Conseguem manter as cores originais do sofá El Corte Inglés?",
        answer: "Sim. Usamos produtos de pH neutro que preservam as cores dos tecidos. Na maioria dos casos as cores ficam mais vivas e definidas após a limpeza profissional.",
      },
      {
        question: "Limpam sofás El Corte Inglés com almofadas removíveis e não-removíveis?",
        answer: "Sim. As almofadas removíveis recebem tratamento individual para limpeza mais completa. As fixas são tratadas no local com equipamento específico.",
      },
      {
        question: "A garantia do sofá El Corte Inglés é afetada pela limpeza profissional?",
        answer: "Geralmente não. A limpeza profissional por especialistas é aceite pela maioria dos fabricantes. Recomendamos verificar os termos de garantia específicos.",
      },
    ],
  },
  {
    id: "kave-home",
    name: "Kave Home",
    slug: "kave-home",
    material: "Veludo, boucle e linho",
    materialDescription: "Os sofás Kave Home têm design contemporâneo com tecidos boucle, veludo e linho, materiais com grande apelo estético mas que exigem limpeza especializada para preservar a textura característica.",
    cleaningProcess: "Limpeza a seco para veludo com escova profissional de fibras suaves. Steam cleaning cuidadoso para boucle a baixa pressão. Sempre na direção do pelo para preservar a textura.",
    doNots: [
      "Nunca esfregar veludo com força: o pelo fica permanentemente danificado",
      "Não usar vapor de alta pressão em boucle: destrói a textura característica",
    ],
    doThis: [
      "Escovamos o veludo sempre na direção do pelo com fibras profissionais suaves, sem deixar marcas",
      "Usamos vapor a pressão mínima e temperatura controlada para preservar a textura característica do boucle",
    ],
    estimatedPriceRange: "59€ - 89€",
    minPrice: 59,
    maxPrice: 89,
    serviceSlug: "limpeza-sofas",
    faqs: [
      {
        question: "Conseguem limpar o veludo do Kave Home sem deixar marcas ou alterar a textura?",
        answer: "Sim. Temos técnicas específicas para veludo: escova profissional suave na direção do pelo e extração muito controlada. O veludo Kave Home recupera o aspeto original sem marcas.",
      },
      {
        question: "O boucle do sofá Kave Home pode ser limpo a vapor?",
        answer: "Com muito cuidado, sim. Usamos vapor a pressão mínima e temperatura controlada para preservar a textura característica do boucle.",
      },
      {
        question: "Com que frequência devo limpar um sofá Kave Home de veludo?",
        answer: "Sofás de veludo acumulam pó e sujidade com mais facilidade que tecidos lisos. Recomendamos limpeza profissional a cada 6-8 meses para manter o aspeto premium.",
      },
    ],
  },
  {
    id: "leroy-merlin",
    name: "Leroy Merlin",
    slug: "leroy-merlin",
    material: "Poliéster e tecido resistente",
    materialDescription: "Os sofás Leroy Merlin são práticos e resistentes, com revestimentos em poliéster e microfibra de boa qualidade. São adequados para uso intenso e respondem muito bem à limpeza profissional regular.",
    cleaningProcess: "Limpeza a vapor standard a temperatura moderada. Produto desengordurante para manchas de uso quotidiano. Extração de humidade para acabamento limpo. Processo direto e eficaz para tecidos de poliéster.",
    doNots: [
      "Não usar produtos de limpeza agressivos em poliéster: podem alterar as cores",
      "Não deixar humidade por tempo prolongado: risco de bolor nas costuras",
    ],
    doThis: [
      "Removemos manchas de uso quotidiano com desengordurante específico para poliéster, sem alterar as cores",
      "Extraímos a humidade por completo, eliminando o risco de bolor nas costuras",
    ],
    estimatedPriceRange: "49€ - 79€",
    minPrice: 49,
    maxPrice: 79,
    serviceSlug: "limpeza-sofas",
    faqs: [
      {
        question: "Os sofás Leroy Merlin são fáceis de limpar profissionalmente?",
        answer: "Sim, os tecidos sintéticos do Leroy Merlin respondem muito bem à limpeza profissional a vapor. É um dos materiais mais acessíveis de tratar com resultado excelente.",
      },
      {
        question: "Vale a pena investir em limpeza num sofá Leroy Merlin?",
        answer: "Absolutamente. O preço começa nos 49€, muito menos que um sofá novo (tipicamente 300-800€ no Leroy Merlin). A limpeza prolonga a vida útil em vários anos.",
      },
      {
        question: "Com que frequência devo limpar um sofá Leroy Merlin?",
        answer: "Para uso familiar normal, recomendamos limpeza profissional 1 a 2 vezes por ano. Com crianças ou animais de estimação, pode ser necessário mais frequente.",
      },
    ],
  },
  {
    id: "moviflor",
    name: "Moviflor",
    slug: "moviflor",
    material: "Tecido e couro (genuíno e sintético)",
    materialDescription: "O Moviflor oferece sofás em tecido, couro genuíno e couro sintético. A gama varia muito, desde económicos a premium. A avaliação prévia do material é essencial para definir o tratamento correto.",
    cleaningProcess: "Avaliação do tipo de revestimento antes da intervenção. Técnica diferenciada: vapor controlado para tecido, produtos específicos para couro genuíno, técnica suave para couro sintético.",
    doNots: [
      "Não usar o mesmo produto em couro e tecido: são tratamentos completamente diferentes",
      "Não tratar couro genuíno com produtos de couro sintético e vice-versa",
    ],
    doThis: [
      "Fazemos avaliação prévia gratuita do revestimento antes de qualquer intervenção, tecido ou couro",
      "Eliminamos odores persistentes como fumo e animais de estimação em mais de 90% dos casos",
    ],
    estimatedPriceRange: "49€ - 89€",
    minPrice: 49,
    maxPrice: 89,
    serviceSlug: "limpeza-sofas",
    faqs: [
      {
        question: "Tratam tanto os sofás de tecido como de couro do Moviflor?",
        answer: "Sim, tratamos todos os materiais Moviflor. A avaliação prévia gratuita garante o tratamento adequado para o modelo exato do teu sofá.",
      },
      {
        question: "Conseguem remover cheiro de cigarro ou animais de um sofá Moviflor?",
        answer: "Sim. A nossa técnica de desodorização profissional elimina odores persistentes, incluindo fumo e animais de estimação, em mais de 90% dos casos.",
      },
      {
        question: "O serviço Kyro Clean inclui transporte ou recolha do sofá Moviflor?",
        answer: "Não. O serviço é ao domicílio: deslocamo-nos até à tua casa. Sem necessidade de mover ou transportar o sofá.",
      },
    ],
  },
];

const marcaCities = MARCA_CITIES;

export interface MarcaSofaRoute {
  path: string;
  marcaSlug: string;
  citySlug: string;
}

export function getAllMarcaSofaRoutes(): MarcaSofaRoute[] {
  return marcas.flatMap(marca =>
    marcaCities.map(city => ({
      path: `/limpeza-sofa-${marca.slug}-${city.slug}`,
      marcaSlug: marca.slug,
      citySlug: city.slug,
    }))
  );
}

export function getMarcaByCityAndSlug(marcaSlug: string, citySlug: string) {
  const marca = marcas.find(m => m.slug === marcaSlug);
  const city = marcaCities.find(c => c.slug === citySlug);
  if (!marca || !city) return null;
  return { marca, city };
}
