import { TRAVEL_FEE_MIN, TRAVEL_FEE_MAX } from '../constants/commercialPolicy';

export type PriceFactor = { icon: string; title: string; description: string; examples: string[] };

// "Como é calculado o preço?". Nos serviços com preço de tabela, os cartões
// mostram só aquilo por que o quiz cobra: tamanho ou quantidade, tratamento e
// deslocação (dono, 2026-09-30). Tipo de tecido, manchas e sujidade não mudam
// o preço; o sofá em pele é a exceção, confirmada no orçamento. Tapetes e
// alcatifas são sempre sob orçamento, e aí o material e o estado contam mesmo.
const TRAVEL: PriceFactor = {
  icon: 'MapPin',
  title: "Onde é o serviço?",
  description: `A deslocação é cobrada à parte, entre ${TRAVEL_FEE_MIN}€ e ${TRAVEL_FEE_MAX}€ conforme a localidade.`,
  examples: ["O valor da sua cidade aparece nesta página", "Uma só deslocação para todos os artigos da visita"],
};

export const PRICE_FACTORS: Record<string, PriceFactor[]> = {
  "limpeza-sofas": [
    { icon: 'Sofa', title: "Qual é o tamanho do sofá?", description: "A limpeza tem preço por sofá, conforme o número de lugares.", examples: ["1, 2, 3 ou 4 lugares", "Sofá de canto, em U, modular ou com 5 ou mais lugares: sob orçamento", "Sofá em pele: confirmado no orçamento"] },
    { icon: 'ShieldCheck', title: "Que tratamento quer?", description: "A limpeza pode ficar sozinha ou levar um tratamento, com preço próprio.", examples: ["Só limpeza", "Impermeabilização Essencial ou Premium", "Anti-ácaros"] },
    TRAVEL,
  ],
  "limpeza-colchoes": [
    { icon: 'Ruler', title: "Qual é o tamanho do colchão?", description: "A limpeza tem preço por colchão, conforme o tamanho.", examples: ["Solteiro", "Casal", "King / Queen"] },
    { icon: 'ShieldCheck', title: "Que tratamento quer?", description: "A limpeza pode ficar sozinha ou levar o tratamento anti-ácaros, com preço próprio.", examples: ["Só limpeza", "Limpeza com anti-ácaros"] },
    TRAVEL,
  ],
  "limpeza-tapetes": [
    { icon: 'Ruler', title: "Que tapete tem?", description: "As medidas e as fibras ajudam-nos a preparar o orçamento.", examples: ["Largura e comprimento", "Lã, sintético, seda ou sisal"] },
    { icon: 'Layers', title: "Que cuidados precisa?", description: "Cada tapete pede uma avaliação do material e do seu estado.", examples: ["Manchas e sujidade acumulada", "Peças artesanais, idade e fibras frágeis"] },
    { icon: 'MapPin', title: "Como será o serviço?", description: "Confirmamos a logística necessária para a sua peça.", examples: ["Necessidade de recolha", "Condições de entrega"] },
  ],
  "limpeza-cadeiras": [
    { icon: 'Armchair', title: "Quantas cadeiras quer limpar?", description: "A limpeza tem preço por cadeira, que desce com a quantidade.", examples: ["Número total de cadeiras", "Escalões de preço por quantidade"] },
    { icon: 'ShieldCheck', title: "Que tratamento quer?", description: "Cada cadeira pode ficar só com a limpeza ou levar um tratamento, com preço próprio.", examples: ["Só limpeza", "Impermeabilização Essencial ou Premium", "Anti-ácaros"] },
    TRAVEL,
  ],
  "limpeza-alcatifas": [
    { icon: 'Ruler', title: "Qual é a área?", description: "Preparamos um orçamento à medida do espaço.", examples: ["Área total a limpar", "Tipo de alcatifa e fibra"] },
    { icon: 'ScanLine', title: "Como está a alcatifa?", description: "Avaliamos a sujidade e os cuidados necessários antes do serviço.", examples: ["Manchas e estado geral", "Manutenção e tratamentos necessários"] },
    { icon: 'MapPin', title: "Como é o acesso?", description: "Planeamos o trabalho de acordo com as condições do local.", examples: ["Acessibilidade do espaço", "Disponibilidade da área a limpar"] },
  ],
  "impermeabilizacao": [
    { icon: 'Sofa', title: "O que quer proteger?", description: "A proteção tem preço por sofá, conforme o número de lugares, ou por cadeira.", examples: ["Sofá de 1, 2, 3 ou 4 lugares", "Sofá de canto, em U, modular ou com 5 ou mais lugares: sob orçamento", "Cadeiras, por unidade"] },
    { icon: 'ShieldCheck', title: "Que proteção quer?", description: "Há duas versões, com preços diferentes, e pode juntar a limpeza na mesma visita.", examples: ["Essencial, à base de água", "Premium, à base de solvente", "Com limpeza na mesma visita"] },
    TRAVEL,
  ],
};
