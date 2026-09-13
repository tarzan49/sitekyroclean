import { DRYING_PROMISE } from '../constants/commercialPolicy';
import type { ProcessGuide } from './serviceProcessGuides';

// Illustrated stages are shared by React and static material pages.
export const MATERIAL_PROCESS_GUIDES: Record<string, ProcessGuide> = {
  "limpeza-sofa-tecido": {
    heading: "Como limpamos o seu sofá em tecido",
    subtitle: "Explore as seis etapas e os cuidados específicos deste revestimento.",
    image: "/images/materials/process-sofa-tecido-six.webp",
    steps: [
      { label: "Avaliação", title: "Primeiro, conhecemos o tecido.", description: "Observamos a composição, as costuras e as manchas. Testamos uma zona discreta e explicamos as limitações antes de começar.", alt: "Teste com pano branco numa costura discreta do sofá em tecido" },
      { label: "Aspiração", title: "Retiramos o pó e os resíduos soltos.", description: "Aspiramos assentos, encostos e recantos com um bocal adequado ao tecido, antes de aplicar qualquer solução.", alt: "Aspiração de uma almofada de tecido com bocal de estofos" },
      { label: "Aplicação", title: "Aplicamos a solução de limpeza.", description: "Distribuímos o produto adequado ao tecido, com a quantidade e a humidade ajustadas à avaliação inicial.", alt: "Aplicação de solução de limpeza num sofá em tecido" },
      { label: "Escovação", title: "Escovamos para soltar a sujidade.", description: "Trabalhamos a solução com uma escova adequada ao tecido, ajustando a pressão e respeitando as fibras.", alt: "Escovação de uma almofada em tecido com escova de estofos" },
      { label: "Extração", title: "Extraímos a sujidade e a humidade.", description: "Depois da escovação, passamos o bocal de extração para retirar os resíduos da limpeza e reduzir a humidade no revestimento.", alt: "Extração de uma almofada em tecido com bocal transparente" },
      { label: "Secagem", title: "Deixamos o sofá a ventilar.", description: `${DRYING_PROMISE} Volte a usar o sofá apenas quando estiver completamente seco.`, alt: "Sofá em tecido a secar num espaço ventilado" },
    ],
  },
  "limpeza-sofa-veludo": {
    heading: "Como limpamos o seu sofá em veludo",
    subtitle: "Explore as seis etapas e os cuidados específicos deste revestimento.",
    image: "/images/materials/process-sofa-veludo-six.webp",
    steps: [
      { label: "Avaliação", title: "Observamos o pelo e a reação da cor.", description: "Identificamos o veludo e o estado do revestimento. Testamos uma zona discreta e explicamos as limitações das marcas existentes.", alt: "Teste numa costura discreta de um sofá em veludo verde" },
      { label: "Aspiração", title: "Aspiramos sem pressionar o pelo.", description: "Usamos um acessório suave, com atenção às costuras e às zonas de contacto, respeitando a delicadeza do veludo.", alt: "Aspiração suave de veludo com acessório de escova" },
      { label: "Aplicação", title: "Aplicamos a solução de limpeza.", description: "Distribuímos o produto adequado ao veludo, com a quantidade e a humidade ajustadas à avaliação inicial.", alt: "Aplicação de solução de limpeza num sofá em veludo" },
      { label: "Escovação", title: "Escovamos para soltar a sujidade.", description: "Trabalhamos a solução com uma escova adequada ao veludo, ajustando a pressão e respeitando as fibras.", alt: "Escovação de uma almofada em veludo com escova de estofos" },
      { label: "Extração", title: "Extraímos a sujidade e a humidade.", description: "Depois da escovação, passamos o bocal de extração para retirar os resíduos da limpeza e reduzir a humidade no revestimento.", alt: "Extração de uma almofada em veludo com bocal transparente" },
      { label: "Secagem", title: "Deixamos o sofá a ventilar.", description: `${DRYING_PROMISE} Volte a usar o sofá apenas quando estiver completamente seco.`, alt: "Sofá em veludo a secar num espaço ventilado" },
    ],
  },
  "limpeza-sofa-pele": {
    heading: "Como limpamos o seu sofá em pele",
    subtitle: "Explore as cinco etapas e os cuidados específicos deste revestimento.",
    image: "/images/materials/process-sofa-pele.webp",
    steps: [
      { label: "Avaliação", title: "Identificamos o tipo e o acabamento da pele.", description: "Observamos o grão, as costuras e o desgaste. Testamos uma zona discreta; fissuras ou danos existentes são explicados antes da limpeza.", alt: "Inspeção do grão e da costura de um sofá em pele conhaque" },
      { label: "Preparação", title: "Começamos pela sujidade solta.", description: "Retiramos o pó com um acessório macio, dando atenção aos recantos e sem recorrer a uma lavagem por extração como nos tecidos.", alt: "Remoção de pó da pele com pano macio" },
      { label: "Limpeza", title: "Limpamos a pele com suavidade.", description: "Usamos um produto compatível com o acabamento identificado e trabalhamos por pequenas zonas, com humidade controlada.", alt: "Limpeza de pele com esponja suave e pouca espuma" },
      { label: "Cuidado", title: "Ajustamos o cuidado ao acabamento.", description: "Quando indicado para esta pele, aplicamos o cuidado de hidratação compatível. Não substitui um restauro nem repara fissuras ou descamação.", alt: "Aplicação moderada de cuidado para pele com pano macio" },
      { label: "Final", title: "Conferimos o acabamento e os cuidados.", description: "Verificamos a superfície e explicamos quando pode voltar a usar o sofá, conforme o produto aplicado. Mantemos a peça afastada de calor e sol direto.", alt: "Sofá em pele conhaque em repouso num espaço com luz indireta" },
    ],
  },
  "limpeza-sofa-microfibra": {
    heading: "Como limpamos o seu sofá em microfibra",
    subtitle: "Explore as seis etapas e os cuidados específicos deste revestimento.",
    image: "/images/materials/process-sofa-microfibra-six.webp",
    steps: [
      { label: "Avaliação", title: "Consultamos a etiqueta e o tecido.", description: "Verificamos as indicações do fabricante, a composição e as manchas. O método é escolhido após esta avaliação, não apenas pelo aspeto da microfibra.", alt: "Avaliação de uma costura de microfibra com pano branco" },
      { label: "Aspiração", title: "Chegamos às fibras e às costuras.", description: "Aspiramos os resíduos soltos com um bocal de estofos, dando atenção aos recantos e às zonas de maior utilização.", alt: "Aspiração das costuras de um sofá em microfibra" },
      { label: "Aplicação", title: "Aplicamos a solução de limpeza.", description: "Distribuímos o produto adequado ao microfibra, com a quantidade e a humidade ajustadas à avaliação inicial.", alt: "Aplicação de solução de limpeza num sofá em microfibra" },
      { label: "Escovação", title: "Escovamos para soltar a sujidade.", description: "Trabalhamos a solução com uma escova adequada ao microfibra, ajustando a pressão e respeitando as fibras.", alt: "Escovação de uma almofada em microfibra com escova de estofos" },
      { label: "Extração", title: "Extraímos a sujidade e a humidade.", description: "Depois da escovação, passamos o bocal de extração para retirar os resíduos da limpeza e reduzir a humidade no revestimento.", alt: "Extração de uma almofada em microfibra com bocal transparente" },
      { label: "Secagem", title: "Deixamos o sofá a ventilar.", description: `${DRYING_PROMISE} Volte a usar o sofá apenas quando estiver completamente seco.`, alt: "Sofá em microfibra a secar num espaço ventilado" },
    ],
  },
  "limpeza-sofa-linho": {
    heading: "Como limpamos o seu sofá em linho",
    subtitle: "Explore as seis etapas e os cuidados específicos deste revestimento.",
    image: "/images/materials/process-sofa-linho-six.webp",
    steps: [
      { label: "Avaliação", title: "Avaliamos a trama natural e a cor.", description: "Observamos a composição e testamos uma zona discreta. Explicamos as limitações das manchas e escolhemos um método compatível com o linho.", alt: "Teste da trama de linho numa costura discreta" },
      { label: "Aspiração", title: "Retiramos os resíduos com cuidado.", description: "Aspiramos assentos e costuras com um acessório suave, respeitando a trama e os vincos naturais do revestimento.", alt: "Aspiração suave de uma almofada em linho" },
      { label: "Aplicação", title: "Aplicamos a solução de limpeza.", description: "Distribuímos o produto adequado ao linho, com a quantidade e a humidade ajustadas à avaliação inicial.", alt: "Aplicação de solução de limpeza num sofá em linho" },
      { label: "Escovação", title: "Escovamos para soltar a sujidade.", description: "Trabalhamos a solução com uma escova adequada ao linho, ajustando a pressão e respeitando as fibras.", alt: "Escovação de uma almofada em linho com escova de estofos" },
      { label: "Extração", title: "Extraímos a sujidade e a humidade.", description: "Depois da escovação, passamos o bocal de extração para retirar os resíduos da limpeza e reduzir a humidade no revestimento.", alt: "Extração de uma almofada em linho com bocal transparente" },
      { label: "Secagem", title: "Deixamos o sofá a ventilar.", description: `${DRYING_PROMISE} Volte a usar o sofá apenas quando estiver completamente seco.`, alt: "Sofá em linho a secar num espaço ventilado" },
    ],
  },
  "limpeza-sofa-camurca": {
    heading: "Como limpamos o seu sofá em camurça",
    subtitle: "Explore as seis etapas e os cuidados específicos deste revestimento.",
    image: "/images/materials/process-sofa-camurca-six.webp",
    steps: [
      { label: "Avaliação", title: "Confirmamos a camurça e o seu estado.", description: "Distinguimos o revestimento e observamos manchas e desgaste. Testamos uma zona discreta antes de escolher o tratamento.", alt: "Avaliação de uma costura de camurça com pano branco" },
      { label: "Aspiração", title: "Retiramos o pó com um acessório suave.", description: "Aspiramos sem pressionar excessivamente o pelo, com atenção aos assentos, costuras e recantos.", alt: "Aspiração suave de um sofá em camurça" },
      { label: "Aplicação", title: "Aplicamos a solução de limpeza.", description: "Distribuímos o produto adequado ao camurça, com a quantidade e a humidade ajustadas à avaliação inicial.", alt: "Aplicação de solução de limpeza num sofá em camurça" },
      { label: "Escovação", title: "Escovamos para soltar a sujidade.", description: "Trabalhamos a solução com uma escova adequada ao camurça, ajustando a pressão e respeitando as fibras.", alt: "Escovação de uma almofada em camurça com escova de estofos" },
      { label: "Extração", title: "Extraímos a sujidade e a humidade.", description: "Depois da escovação, passamos o bocal de extração para retirar os resíduos da limpeza e reduzir a humidade no revestimento.", alt: "Extração de uma almofada em camurça com bocal transparente" },
      { label: "Secagem", title: "Deixamos o sofá a ventilar.", description: `${DRYING_PROMISE} Volte a usar o sofá apenas quando estiver completamente seco.`, alt: "Sofá em camurça a secar num espaço ventilado" },
    ],
  },
  "limpeza-sofa-sintetico": {
    heading: "Como limpamos o seu sofá sintético",
    subtitle: "Explore as seis etapas e os cuidados específicos deste revestimento.",
    image: "/images/materials/process-sofa-sintetico-six.webp",
    steps: [
      { label: "Avaliação", title: "Identificamos o revestimento sintético.", description: "Verificamos a composição, as indicações do fabricante e a reação numa zona discreta. Este exemplo mostra tecido sintético; adaptamos os cuidados ao revestimento da sua peça.", alt: "Avaliação de uma costura de sofá em tecido sintético" },
      { label: "Aspiração", title: "Retiramos o pó e os resíduos soltos.", description: "Aspiramos os assentos, encostos e costuras antes da aplicação do produto.", alt: "Aspiração de sofá em tecido sintético" },
      { label: "Aplicação", title: "Aplicamos a solução de limpeza.", description: "Distribuímos o produto adequado ao tecido sintético, com a quantidade e a humidade ajustadas à avaliação inicial.", alt: "Aplicação de solução de limpeza num sofá em tecido sintético" },
      { label: "Escovação", title: "Escovamos para soltar a sujidade.", description: "Trabalhamos a solução com uma escova adequada ao tecido sintético, ajustando a pressão e respeitando as fibras.", alt: "Escovação de uma almofada em tecido sintético com escova de estofos" },
      { label: "Extração", title: "Extraímos a sujidade e a humidade.", description: "Depois da escovação, passamos o bocal de extração para retirar os resíduos da limpeza e reduzir a humidade no revestimento.", alt: "Extração de uma almofada em tecido sintético com bocal transparente" },
      { label: "Secagem", title: "Deixamos o sofá a ventilar.", description: `${DRYING_PROMISE} Volte a usar o sofá apenas quando estiver completamente seco.`, alt: "Sofá em tecido sintético a secar num espaço ventilado" },
    ],
  },
};
