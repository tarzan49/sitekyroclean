// Os temas do índice do blog, na ordem da página. A mesma lista desenha o React (Blog.tsx) e o HTML
// estático (prerender.ts). Sem imports com alias `@/`, para correr em Node puro.
export interface BlogTheme { id: string; heading: string; goldWord: string; slugs: readonly string[] }

export const BLOG_THEMES: readonly BlogTheme[] = [
  { id: 'precos', heading: 'Preços e', goldWord: 'orçamento', slugs: [
    'quanto-custa-limpar-sofa-profissional',
    'quanto-custa-limpar-colchao-profissional',
    'limpeza-cadeiras-estofadas-precos-guia',
    'limpeza-tapetes-profissional-guia-completo',
    'quanto-custa-limpar-alcatifa',
    'limpeza-alcatifa-escritorio',
  ] },
  { id: 'manchas', heading: 'Manchas e', goldWord: 'cheiros', slugs: [
    'como-tirar-manchas-sofa-tecido',
    'como-tirar-cheiro-sofa',
    'como-tirar-manchas-urina-colchao',
    'limpeza-sofa-animais-domesticos',
  ] },
  { id: 'cuidar', heading: 'Cuidar do', goldWord: 'sofá', slugs: [
    'sinais-sofa-precisa-limpeza-profissional',
    'com-que-frequencia-limpar-sofa',
    'como-manter-sofa-limpo-entre-limpezas',
    'como-preparar-casa-visita-tecnico',
    'mitos-limpeza-estofos',
  ] },
  { id: 'materiais', heading: 'Materiais e', goldWord: 'proteção', slugs: [
    'impermeabilizacao-sofa-vale-pena',
    'higienizacao-vs-impermeabilizacao-sofa',
    'o-que-e-extracao-a-vapor-estofos',
    'como-limpar-sofa-veludo',
    'como-limpar-sofa-microfibra',
    'limpeza-sofa-couro',
  ] },
  { id: 'saude', heading: 'Saúde e', goldWord: 'família', slugs: [
    'acaros-sofas-colchoes-riscos-saude',
    'guia-acaros-em-casa',
    'doencas-causadas-estofos-sujos',
    'limpeza-sofa-bebe-crianca',
    'limpeza-colchao-bebe-crianca',
  ] },
];
