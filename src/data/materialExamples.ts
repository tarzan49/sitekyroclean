// Each contact sheet contains four distinct illustrative photographs in reading order.
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
      { label: "Tecido bege", alt: "Sofá bege de tecido numa sala luminosa" },
      { label: "Tecido cinzento", alt: "Sofá modular cinzento em tecido" },
      { label: "Trama e costuras", alt: "Pormenor da trama e costura de uma almofada de tecido" },
      { label: "Textura clara", alt: "Braço de sofá com tecido claro de trama entrelaçada" },
    ],
  },
  "limpeza-sofa-veludo": {
    name: "veludo",
    image: "/images/materials/sofa-veludo-examples.webp",
    examples: [
      { label: "Veludo verde", alt: "Sofá verde com revestimento em veludo" },
      { label: "Veludo azul", alt: "Sofá azul de linhas curvas em veludo" },
      { label: "Sentido do pelo", alt: "Pormenor do pelo de uma almofada em veludo terracota" },
      { label: "Brilho suave", alt: "Braço de sofá em veludo verde claro com reflexos suaves" },
    ],
  },
  "limpeza-sofa-pele": {
    name: "pele",
    image: "/images/materials/sofa-pele-examples.webp",
    examples: [
      { label: "Pele conhaque", alt: "Sofá em pele de tom conhaque" },
      { label: "Pele castanha", alt: "Sofá em pele castanha numa sala" },
      { label: "Grão natural", alt: "Pormenor do grão e da costura de uma almofada em pele" },
      { label: "Dobras da pele", alt: "Dobras naturais no braço de um sofá em pele castanha" },
    ],
  },
  "limpeza-sofa-microfibra": {
    name: "microfibra",
    image: "/images/materials/sofa-microfibra-examples.webp",
    examples: [
      { label: "Microfibra cinzenta", alt: "Sofá cinzento revestido em microfibra" },
      { label: "Microfibra areia", alt: "Sofá com chaise em microfibra de cor areia" },
      { label: "Fibras finas", alt: "Pormenor de uma almofada em microfibra de textura fina" },
      { label: "Acabamento mate", alt: "Braço de sofá em microfibra com acabamento mate" },
    ],
  },
  "limpeza-sofa-linho": {
    name: "linho",
    image: "/images/materials/sofa-linho-examples.webp",
    examples: [
      { label: "Linho natural", alt: "Sofá bege em linho natural" },
      { label: "Linho branco", alt: "Sofá branco em linho com almofadas soltas" },
      { label: "Trama irregular", alt: "Pormenor da trama irregular e costura do linho" },
      { label: "Vincos naturais", alt: "Braço de sofá em linho cinzento com vincos naturais" },
    ],
  },
  "limpeza-sofa-camurca": {
    name: "camurça",
    image: "/images/materials/sofa-camurca-examples.webp",
    examples: [
      { label: "Camurça camel", alt: "Sofá em camurça de cor camel" },
      { label: "Camurça taupe", alt: "Sofá em camurça de cor taupe" },
      { label: "Pelo delicado", alt: "Pormenor do pelo e costura de uma almofada de camurça" },
      { label: "Textura aveludada", alt: "Braço de sofá em camurça de textura mate aveludada" },
    ],
  },
  "limpeza-sofa-sintetico": {
    name: "materiais sintéticos",
    image: "/images/materials/sofa-sintetico-examples.webp",
    examples: [
      { label: "Pele sintética", alt: "Sofá creme em pele sintética" },
      { label: "Poliéster cinzento", alt: "Sofá cinzento em tecido de poliéster" },
      { label: "Grão uniforme", alt: "Pormenor do grão uniforme de um braço em pele sintética preta" },
      { label: "Trama de poliéster", alt: "Almofada azul com trama regular de poliéster" },
    ],
  },
  "limpeza-tapete-la": {
    name: "lã",
    image: "/images/materials/tapete-la-examples.webp",
    examples: [
      { label: "Lã clara", alt: "Tapete claro de lã numa sala" },
      { label: "Lã com padrão", alt: "Tapete cinzento de lã com padrão geométrico discreto" },
      { label: "Fibras naturais", alt: "Pormenor do pelo natural e rebordo de um tapete de lã" },
      { label: "Pelo em laçada", alt: "Pormenor de fibras de lã em laçada num tapete taupe" },
    ],
  },
  "limpeza-tapete-persa": {
    name: "tapetes persas",
    image: "/images/materials/tapete-persa-examples.webp",
    examples: [
      { label: "Padrão clássico", alt: "Tapete de estilo persa em tons bordô e azul" },
      { label: "Tons suaves", alt: "Tapete de estilo persa com flores em tons claros" },
      { label: "Desenho floral", alt: "Pormenor do desenho floral de um tapete de estilo persa" },
      { label: "Nós e franjas", alt: "Canto de um tapete de estilo persa com nós e franjas visíveis" },
    ],
  },
  "limpeza-tapete-sintetico": {
    name: "fibras sintéticas",
    image: "/images/materials/tapete-sintetico-examples.webp",
    examples: [
      { label: "Polipropileno", alt: "Tapete cinzento de polipropileno numa sala" },
      { label: "Poliéster", alt: "Tapete de poliéster claro com padrão geométrico" },
      { label: "Pelo de nylon", alt: "Pormenor do pelo denso de nylon e rebordo de um tapete" },
      { label: "Fibras regulares", alt: "Pormenor das fibras regulares de um tapete de poliéster bege" },
    ],
  },
  "limpeza-tapete-sisal": {
    name: "sisal e juta",
    image: "/images/materials/tapete-sisal-examples.webp",
    examples: [
      { label: "Sisal com rebordo", alt: "Tapete retangular de sisal natural com rebordo castanho" },
      { label: "Juta entrançada", alt: "Tapete redondo de juta entrançada" },
      { label: "Trama de sisal", alt: "Pormenor da trama apertada de sisal e do rebordo" },
      { label: "Fibras de juta", alt: "Pormenor das fibras grossas entrançadas de juta" },
    ],
  },
};
