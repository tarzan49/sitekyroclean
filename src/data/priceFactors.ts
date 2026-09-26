export type PriceFactor = { icon: string; title: string; description: string; examples: string[] };
export const PRICE_FACTORS: Record<string, PriceFactor[]> = {
  "limpeza-sofas": [
    { icon: 'Sofa', title: "Como é o seu sofá?", description: "O tamanho e o tecido ajudam a definir o trabalho necessário.", examples: ["Número de lugares e tipo de tecido", "Sofás de canto ou com mais de 3 lugares"] },
    { icon: 'ScanLine', title: "Como está neste momento?", description: "Avaliamos as manchas para escolher os cuidados adequados.", examples: ["Tipo de manchas", "Intensidade e extensão da sujidade"] },
    { icon: 'ShieldCheck', title: "Quer algum cuidado extra?", description: "Os tratamentos adicionais são opcionais e avaliados à parte.", examples: ["Tratamento de odores", "Impermeabilização do tecido"] },
  ],
  "limpeza-colchoes": [
    { icon: 'Ruler', title: "Qual é o seu colchão?", description: "O tamanho e o material são o ponto de partida.", examples: ["Solteiro, casal ou king size", "Espuma, molas ou viscoelástico"] },
    { icon: 'ScanLine', title: "Como está neste momento?", description: "O estado do colchão ajuda a definir os cuidados necessários.", examples: ["Manchas e estado geral", "Tempo desde a última limpeza"] },
    { icon: 'ShieldCheck', title: "O que quer acrescentar?", description: "Pode pedir outros cuidados no mesmo orçamento.", examples: ["Tratamento anti-ácaros opcional", "Limpeza da cabeceira à parte"] },
  ],
  "limpeza-tapetes": [
    { icon: 'Ruler', title: "Que tapete tem?", description: "As medidas e as fibras ajudam-nos a preparar o orçamento.", examples: ["Largura e comprimento", "Lã, sintético, seda ou sisal"] },
    { icon: 'Layers', title: "Que cuidados precisa?", description: "Cada tapete pede uma avaliação do material e do seu estado.", examples: ["Manchas e sujidade acumulada", "Peças artesanais, idade e fibras frágeis"] },
    { icon: 'MapPin', title: "Como será o serviço?", description: "Confirmamos a logística necessária para a sua peça.", examples: ["Necessidade de recolha", "Condições de entrega"] },
  ],
  "limpeza-cadeiras": [
    { icon: 'Armchair', title: "Que cadeiras tem?", description: "O formato e o estofamento definem os cuidados a aplicar.", examples: ["Jantar, escritório ou poltrona", "Material e estado das manchas"] },
    { icon: 'Layers', title: "Quantas quer limpar?", description: "A quantidade influencia o preço por cadeira.", examples: ["Número total de cadeiras", "Escalões de preço por quantidade"] },
    { icon: 'MapPin', title: "Onde vamos trabalhar?", description: "As condições do espaço ajudam a planear a intervenção.", examples: ["Casa, escritório ou restaurante", "Acesso e disponibilidade do espaço"] },
  ],
  "limpeza-alcatifas": [
    { icon: 'Ruler', title: "Qual é a área?", description: "Preparamos um orçamento à medida do espaço.", examples: ["Área total a limpar", "Tipo de alcatifa e fibra"] },
    { icon: 'ScanLine', title: "Como está a alcatifa?", description: "Avaliamos a sujidade e os cuidados necessários antes do serviço.", examples: ["Manchas e estado geral", "Manutenção e tratamentos necessários"] },
    { icon: 'MapPin', title: "Como é o acesso?", description: "Planeamos o trabalho de acordo com as condições do local.", examples: ["Acessibilidade do espaço", "Disponibilidade da área a limpar"] },
  ],
  "impermeabilizacao": [
    { icon: 'Sofa', title: "O que quer proteger?", description: "A peça, o tamanho e o tecido definem a aplicação.", examples: ["Tipo e dimensão da peça", "Material do estofamento"] },
    { icon: 'ShieldCheck', title: "Que proteção procura?", description: "Escolha a opção adequada ao uso da sua casa.", examples: ["Essencial ou Premium", "Uso diário, crianças e animais"] },
    { icon: 'Layers', title: "Quer juntar a limpeza?", description: "A combinação de serviços é considerada no orçamento.", examples: ["Só impermeabilização", "Limpeza e proteção na mesma visita"] },
  ],
};
