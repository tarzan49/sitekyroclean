// Cada folha tem quatro fotografias reais de serviços nossos, por ordem de leitura (dono, 25 Nov: saíram as de IA).
// Shared by national/city material pages and the static prerenderer.
export interface MaterialExample {
  label: string;
  alt: string;
}
export interface MaterialExamples {
  name: string;
  image: string;
  examples: [MaterialExample, MaterialExample, MaterialExample, MaterialExample];
}

export const MATERIAL_EXAMPLES: Record<string, MaterialExamples> = {
  "limpeza-sofa-tecido": {
    name: "tecido",
    image: "/images/materials/sofa-tecido-examples.webp",
    examples: [
      { label: "Tecido bege", alt: "Sofá de dois lugares em tecido bege, limpo" },
      { label: "Tecido cinzento", alt: "Sofá-cama cinzento em tecido, depois da limpeza" },
      { label: "Trama larga", alt: "Pormenor da trama de um sofá cinzento com gotas de água à superfície" },
      { label: "Bouclé claro", alt: "Poltrona clara em tecido bouclé" },
    ],
  },
  "limpeza-sofa-veludo": {
    name: "veludo",
    image: "/images/materials/sofa-veludo-examples.webp",
    examples: [
      { label: "Veludo azul", alt: "Sofá de dois lugares em veludo azul" },
      { label: "Veludo rosa", alt: "Sofá de dois lugares em veludo rosa com almofadas" },
      { label: "Veludo terracota", alt: "Sofá de três lugares em veludo terracota" },
      { label: "Veludo em gomos", alt: "Banco comprido em veludo rosa com gomos" },
    ],
  },
  "limpeza-sofa-pele": {
    name: "pele",
    image: "/images/materials/sofa-pele-examples.webp",
    examples: [
      { label: "Pele creme", alt: "Sofá creme em pele com almofadas" },
      { label: "Banco corrido", alt: "Banco em revestimento tipo pele, limpo" },
      { label: "Assento liso", alt: "Banco com assento liso em revestimento tipo pele" },
      { label: "Costuras", alt: "Pormenor das costuras de um banco em revestimento tipo pele" },
    ],
  },
  "limpeza-sofa-microfibra": {
    name: "microfibra",
    image: "/images/materials/sofa-microfibra-examples.webp",
    examples: [
      { label: "Com chaise", alt: "Sofá com chaise em microfibra castanha-clara" },
      { label: "Microfibra bege", alt: "Sofá bege em microfibra" },
      { label: "Microfibra vermelha", alt: "Sofá vermelho em microfibra" },
      { label: "Fibras finas", alt: "Pormenor de um assento cinzento em microfibra" },
    ],
  },
  "limpeza-sofa-linho": {
    name: "linho",
    image: "/images/materials/sofa-linho-examples.webp",
    examples: [
      { label: "Tecido claro", alt: "Sofá claro de dois lugares em tecido natural" },
      { label: "Tecido bege", alt: "Sofá bege de trama fina" },
      { label: "Trama e vincos", alt: "Pormenor da trama e dos vincos de um tecido tipo linho" },
      { label: "Textura natural", alt: "Pormenor da textura de um tecido natural" },
    ],
  },
  "limpeza-sofa-camurca": {
    name: "camurça",
    image: "/images/materials/sofa-camurca-examples.webp",
    examples: [
      { label: "Com chaise", alt: "Sofá com chaise de aspeto camurça" },
      { label: "Dois lugares", alt: "Sofá claro de dois lugares de aspeto camurça" },
      { label: "Capitoné", alt: "Banco capitoné de aspeto camurça" },
      { label: "Assentos", alt: "Assentos cinzentos de aspeto camurça" },
    ],
  },
  "limpeza-sofa-sintetico": {
    name: "materiais sintéticos",
    image: "/images/materials/sofa-sintetico-examples.webp",
    examples: [
      { label: "Banco de café", alt: "Banco em pele sintética dourada" },
      { label: "Pele sintética", alt: "Banco em pele sintética junto à janela" },
      { label: "Vincos", alt: "Vincos do assento em pele sintética" },
      { label: "Assento comprido", alt: "Banco comprido em pele sintética" },
    ],
  },
  "limpeza-tapete-la": {
    name: "lã",
    image: "/images/materials/tapete-la-examples.webp",
    examples: [
      { label: "Com losangos", alt: "Tapete claro com losangos, depois da lavagem" },
      { label: "Círculos coloridos", alt: "Tapete bege com círculos coloridos" },
      { label: "Pelo alto", alt: "Tapete cinzento de pelo alto" },
      { label: "Redondo", alt: "Tapete redondo claro" },
    ],
  },
  "limpeza-tapete-persa": {
    name: "tapetes persas",
    image: "/images/materials/tapete-persa-examples.webp",
    examples: [
      { label: "Padrão clássico", alt: "Tapete de estilo persa inteiro" },
      { label: "Medalhão", alt: "Pormenor do medalhão de um tapete de estilo persa" },
      { label: "Bordô", alt: "Tapete bordô com padrão geométrico" },
      { label: "Rebordo", alt: "Canto dobrado de um tapete de estilo persa" },
    ],
  },
  "limpeza-tapete-sintetico": {
    name: "fibras sintéticas",
    image: "/images/materials/tapete-sintetico-examples.webp",
    examples: [
      { label: "Efeito mármore", alt: "Tapete claro com efeito mármore" },
      { label: "Padrão colorido", alt: "Tapete com padrão em várias cores" },
      { label: "Liso claro", alt: "Tapete claro liso numa sala" },
      { label: "Trama cinzenta", alt: "Tapete cinzento de trama fina" },
    ],
  },
  "limpeza-tapete-sisal": {
    name: "sisal e juta",
    image: "/images/materials/tapete-sisal-examples.webp",
    examples: [
      { label: "Juta inteira", alt: "Tapete de juta inteiro durante a lavagem" },
      { label: "Tapete natural", alt: "Tapete de fibra natural visto de cima" },
      { label: "Trama", alt: "Pormenor da trama de um tapete de juta" },
      { label: "Fibras", alt: "Pormenor das fibras de um tapete de juta" },
    ],
  },
};
