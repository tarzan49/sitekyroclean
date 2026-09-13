import { DRYING_PROMISE } from '../constants/commercialPolicy';
import type { ProcessGuide } from './serviceProcessGuides';

// The five illustrated stages are shared by React and static material pages.
export const MATERIAL_PROCESS_GUIDES: Record<string, ProcessGuide> = {
  "limpeza-sofa-tecido": {
    heading: "Como limpamos o seu sofá em tecido",
    subtitle: "Explore as cinco etapas e os cuidados específicos deste revestimento.",
    image: "/images/materials/process-sofa-tecido.webp",
    steps: [
      { label: "Avaliação", title: "Primeiro, conhecemos o tecido.", description: "Observamos a composição, as costuras e as manchas. Testamos uma zona discreta e explicamos as limitações antes de começar.", alt: "Teste com pano branco numa costura discreta do sofá em tecido" },
      { label: "Aspiração", title: "Retiramos o pó e os resíduos soltos.", description: "Aspiramos assentos, encostos e recantos com um bocal adequado ao tecido, antes de aplicar qualquer solução.", alt: "Aspiração de uma almofada de tecido com bocal de estofos" },
      { label: "Aplicação", title: "Preparamos as zonas a limpar.", description: "Aplicamos a solução compatível com o tecido, controlando a quantidade de produto e de humidade.", alt: "Aplicação moderada de solução de limpeza sobre o tecido" },
      { label: "Extração", title: "Extraímos a sujidade e a humidade.", description: "Quando o tecido permite, percorremos a superfície com o bocal de extração, ajustando o método ao resultado da avaliação.", alt: "Extração de uma almofada de tecido com bocal transparente" },
      { label: "Secagem", title: "Deixamos o sofá a ventilar.", description: `${DRYING_PROMISE} Volte a usar o sofá apenas quando estiver completamente seco.`, alt: "Sofá de tecido em repouso junto a uma janela aberta" },
    ],
  },
  "limpeza-sofa-veludo": {
    heading: "Como limpamos o seu sofá em veludo",
    subtitle: "Explore as cinco etapas e os cuidados específicos deste revestimento.",
    image: "/images/materials/process-sofa-veludo.webp",
    steps: [
      { label: "Avaliação", title: "Observamos o pelo e a reação da cor.", description: "Identificamos o veludo e o estado do revestimento. Testamos uma zona discreta e explicamos as limitações das marcas existentes.", alt: "Teste numa costura discreta de um sofá em veludo verde" },
      { label: "Aspiração", title: "Aspiramos sem pressionar o pelo.", description: "Usamos um acessório suave, com atenção às costuras e às zonas de contacto, respeitando a delicadeza do veludo.", alt: "Aspiração suave de veludo com acessório de escova" },
      { label: "Limpeza", title: "Controlamos a humidade e a pressão.", description: "Trabalhamos com a solução e o método adequados ao veludo identificado. Evitamos tratar todos os veludos como se fossem o mesmo tecido.", alt: "Limpeza localizada do veludo com pano branco" },
      { label: "Escovagem", title: "Acompanhamos o sentido do pelo.", description: "Quando indicado para o revestimento, fazemos uma escovagem suave para orientar o pelo, sem prometer remover vincos permanentes.", alt: "Escovagem suave do veludo numa direção uniforme" },
      { label: "Secagem", title: "O acabamento termina com ventilação.", description: `${DRYING_PROMISE} Volte a usar o sofá apenas quando estiver completamente seco.`, alt: "Sofá em veludo verde a secar numa sala ventilada" },
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
    subtitle: "Explore as cinco etapas e os cuidados específicos deste revestimento.",
    image: "/images/materials/process-sofa-microfibra.webp",
    steps: [
      { label: "Avaliação", title: "Consultamos a etiqueta e o tecido.", description: "Verificamos as indicações do fabricante, a composição e as manchas. O método é escolhido após esta avaliação, não apenas pelo aspeto da microfibra.", alt: "Inspeção da etiqueta sob uma almofada de microfibra" },
      { label: "Aspiração", title: "Chegamos às fibras e às costuras.", description: "Aspiramos os resíduos soltos com um bocal de estofos, dando atenção aos recantos e às zonas de maior utilização.", alt: "Aspiração das costuras de um sofá em microfibra" },
      { label: "Teste", title: "Testamos antes de avançar.", description: "Experimentamos o método numa zona escondida para observar a reação da cor e da textura, com a quantidade de humidade adequada.", alt: "Teste localizado de microfibra com pano branco" },
      { label: "Limpeza", title: "Limpamos com o método compatível.", description: "Trabalhamos por zonas de acordo com as indicações do revestimento. A demonstração mostra uma limpeza com pano, sem saturar as fibras.", alt: "Limpeza controlada de uma almofada de microfibra com pano" },
      { label: "Secagem", title: "Deixamos as fibras secar por completo.", description: `${DRYING_PROMISE} Volte a usar o sofá apenas quando estiver completamente seco.`, alt: "Sofá cinzento em microfibra num ambiente ventilado" },
    ],
  },
  "limpeza-sofa-linho": {
    heading: "Como limpamos o seu sofá em linho",
    subtitle: "Explore as cinco etapas e os cuidados específicos deste revestimento.",
    image: "/images/materials/process-sofa-linho.webp",
    steps: [
      { label: "Avaliação", title: "Avaliamos a trama natural e a cor.", description: "Observamos a composição e testamos uma zona discreta. Explicamos as limitações das manchas e escolhemos um método compatível com o linho.", alt: "Teste da trama de linho numa costura discreta" },
      { label: "Aspiração", title: "Retiramos os resíduos com cuidado.", description: "Aspiramos assentos e costuras com um acessório suave, respeitando a trama e os vincos naturais do revestimento.", alt: "Aspiração suave de uma almofada em linho" },
      { label: "Aplicação", title: "Usamos apenas a humidade necessária.", description: "Aplicamos a solução compatível de forma controlada. A quantidade de produto e a temperatura são ajustadas ao tecido avaliado.", alt: "Preparação de pano com pouca solução para limpar linho" },
      { label: "Extração", title: "Reduzimos a humidade que fica no tecido.", description: "Quando a avaliação permite limpeza por extração, usamos o bocal de estofos com controlo de humidade. Outros linhos podem exigir um método diferente.", alt: "Extração controlada de uma almofada em linho" },
      { label: "Secagem", title: "Privilegiamos a ventilação do espaço.", description: `${DRYING_PROMISE} Volte a usar o sofá apenas quando estiver completamente seco.`, alt: "Sofá de linho e almofadas a secar numa sala ventilada" },
    ],
  },
  "limpeza-sofa-camurca": {
    heading: "Como limpamos o seu sofá em camurça",
    subtitle: "Explore as cinco etapas e os cuidados específicos deste revestimento.",
    image: "/images/materials/process-sofa-camurca.webp",
    steps: [
      { label: "Avaliação", title: "Confirmamos a camurça e o seu estado.", description: "Distinguimos o revestimento e observamos manchas e desgaste. Testamos uma zona discreta antes de escolher o tratamento.", alt: "Avaliação de uma costura de camurça com pano branco" },
      { label: "Aspiração", title: "Retiramos o pó com um acessório suave.", description: "Aspiramos sem pressionar excessivamente o pelo, com atenção aos assentos, costuras e recantos.", alt: "Aspiração suave de um sofá em camurça" },
      { label: "Limpeza", title: "Escolhemos um cuidado compatível.", description: "A demonstração mostra uma limpeza localizada a seco. O produto e o método dependem da avaliação; não molhamos a superfície indiscriminadamente.", alt: "Limpeza localizada de camurça com esponja própria a seco" },
      { label: "Escovagem", title: "Cuidamos da direção do pelo.", description: "Escovamos suavemente quando indicado para a peça, respeitando a textura da camurça e as limitações de marcas preexistentes.", alt: "Escovagem suave de uma almofada em camurça" },
      { label: "Final", title: "Verificamos a peça antes de terminar.", description: "Revemos a textura e explicamos os cuidados após a intervenção. A utilização do sofá depende do método aplicado e da secagem completa quando existe humidade.", alt: "Sofá em camurça camel em repouso num espaço arejado" },
    ],
  },
  "limpeza-sofa-sintetico": {
    heading: "Como limpamos o seu sofá sintético",
    subtitle: "Explore as cinco etapas e os cuidados específicos deste revestimento.",
    image: "/images/materials/process-sofa-sintetico.webp",
    steps: [
      { label: "Avaliação", title: "Distinguimos os revestimentos sintéticos.", description: "Pele sintética, poliéster e outros tecidos exigem cuidados diferentes. Este exemplo mostra pele sintética; o método é adaptado à sua peça.", alt: "Inspeção de uma costura de sofá em pele sintética" },
      { label: "Preparação", title: "Retiramos o pó da superfície.", description: "Limpamos os resíduos soltos com um acessório macio e observamos as zonas gastas. Uma limpeza não repara descamação existente.", alt: "Remoção de pó da pele sintética com pano seco" },
      { label: "Limpeza", title: "Trabalhamos sem agredir o acabamento.", description: "Usamos uma solução compatível após o teste, com pano macio e humidade controlada, sem esfregar com materiais abrasivos.", alt: "Limpeza suave de pele sintética com pano ligeiramente húmido" },
      { label: "Remoção", title: "Retiramos os resíduos do produto.", description: "Passamos um pano adequado para remover os resíduos. Não aplicamos automaticamente o cuidado de hidratação usado em pele natural.", alt: "Remoção de resíduos da pele sintética com pano limpo" },
      { label: "Secagem", title: "Conferimos a superfície antes da utilização.", description: "Deixamos secar e explicamos os cuidados indicados para o revestimento. O tempo depende do material sintético e do método aplicado.", alt: "Sofá em pele sintética clara a secar longe de calor direto" },
    ],
  },
};

