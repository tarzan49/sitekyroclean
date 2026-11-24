// Fotografias e fotogramas reais da equipa, uma por guia (dono, 25 Nov 2026: nada gerado por IA).
// Recortes 4:3 de material já publicado no site (antes e depois, vídeos do processo).
const files = import.meta.glob<string>('../assets/blog/*.webp', { eager: true, import: 'default' });

export const BLOG_IMAGES: Record<string, string> = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.replace(/^.*\/|\.webp$/g, ''), url]),
);
export const DEFAULT_BLOG_IMAGE = BLOG_IMAGES['o-que-e-extracao-a-vapor-estofos'];

/** O que se vê em cada fotografia (o `heroAlt` dos artigos descrevia as imagens antigas). */
export const BLOG_IMAGE_ALTS: Record<string, string> = {
  'quanto-custa-limpar-sofa-profissional': 'Sofá claro de dois lugares depois da limpeza',
  'como-tirar-manchas-sofa-tecido': 'Sofá cinzento com manchas na chaise antes da limpeza',
  'impermeabilizacao-sofa-vale-pena': 'Água a ser retirada com a mão num tecido impermeabilizado',
  'acaros-sofas-colchoes-riscos-saude': 'Bocal de extração a limpar um colchão',
  'quanto-custa-limpar-colchao-profissional': 'Colchão de casal depois da limpeza',
  'limpeza-tapetes-profissional-guia-completo': 'Máquina de lavagem a limpar um tapete claro',
  'limpeza-cadeiras-estofadas-precos-guia': 'Extração no assento de uma cadeira estofada',
  'doencas-causadas-estofos-sujos': 'Bocal de extração a retirar a sujidade de um colchão',
  'como-preparar-casa-visita-tecnico': 'Sala com o sofá-cama aberto e o equipamento pronto a usar',
  'como-limpar-sofa-veludo': 'Sofá de veludo azul depois da limpeza',
  'como-tirar-cheiro-sofa': 'Pulverização do produto num sofá de tecido',
  'limpeza-alcatifa-escritorio': 'Alcatifa cinzenta com uma mancha antes da limpeza',
  'guia-acaros-em-casa': 'Extração num tapete de pelo',
  'limpeza-sofa-animais-domesticos': 'Sofá com chaise depois da limpeza',
  'como-manter-sofa-limpo-entre-limpezas': 'Sofá de três lugares depois da limpeza',
  'higienizacao-vs-impermeabilizacao-sofa': 'Aplicação da impermeabilização num sofá claro',
  'com-que-frequencia-limpar-sofa': 'Sofá de canto com sinais de uso antes da limpeza',
  'sinais-sofa-precisa-limpeza-profissional': 'Sofá de canto com sujidade visível nos assentos',
  'como-limpar-sofa-microfibra': 'Assento de sofá em tecido depois da limpeza',
  'limpeza-sofa-bebe-crianca': 'Sofá de tecido bege depois da limpeza',
  'limpeza-colchao-bebe-crianca': 'Colchão pequeno depois da limpeza',
  'o-que-e-extracao-a-vapor-estofos': 'Bocal de extração com água suja num sofá',
  'mitos-limpeza-estofos': 'Sofá-cama com manchas antes da limpeza',
  'limpeza-sofa-couro': 'Banco estofado cor de laranja num café',
  'como-tirar-manchas-urina-colchao': 'Colchão com manchas antes da limpeza',
  'quanto-custa-limpar-alcatifa': 'Extração a retirar a sujidade de uma alcatifa',
};
