// Fontes externas citadas pelos artigos do blog.
//
// Porque existe: nenhum dos 26 artigos citava uma única fonte, e vários faziam
// afirmações sobre saúde atribuídas a autoridades. Uma delas atribuía à
// Organização Mundial de Saúde uma estimativa que a OMS nunca publicou. Uma
// citação inventada é pior do que citação nenhuma: é uma afirmação de
// autoridade que não se sustenta.
//
// Regra para acrescentar aqui: só entra uma fonte cuja página tenha sido
// aberta e lida, e cujo conteúdo diga mesmo o que o artigo afirma. Se a
// afirmação não tiver fonte que a sustente, muda-se a afirmação, não se
// procura uma fonte que se lhe pareça.
//
// `checkedOn` é a data em que a página foi verificada, não a data do estudo.

export interface BlogSource {
  id: string;
  label: string;
  publisher: string;
  url: string;
  checkedOn: string;
  /** O que esta fonte sustenta, para que a próxima pessoa não a use noutra coisa. */
  supports: string;
}

export const BLOG_SOURCES: Record<string, BlogSource> = {
  "spaic-acaros": {
    id: "spaic-acaros",
    label: "Ácaros do pó da casa: perguntas frequentes",
    publisher: "Sociedade Portuguesa de Alergologia e Imunologia Clínica (SPAIC)",
    url: "https://www.spaic.pt/perguntas-frequentes?id=13",
    checkedOn: "2026-09-17",
    supports:
      "Ácaros como principal causa de alergias respiratórias; preferência por ambientes húmidos e temperaturas amenas; lavagem da roupa de cama acima de 55 ºC; necessidade de combinar várias medidas.",
  },
  "spaic-rinite-asma": {
    id: "spaic-rinite-asma",
    label: "Rinite e asma: perguntas frequentes",
    publisher: "Sociedade Portuguesa de Alergologia e Imunologia Clínica (SPAIC)",
    url: "https://www.spaic.pt/perguntas-frequentes?id=14",
    checkedOn: "2026-09-17",
    supports:
      "Prevalência estimada de rinite em Portugal (cerca de 930.000 pessoas, 9,55% da população) e a relação entre rinite e asma.",
  },
  "oms-humidade-bolor": {
    id: "oms-humidade-bolor",
    label: "WHO guidelines for indoor air quality: dampness and mould (2009)",
    publisher: "Organização Mundial de Saúde",
    url: "https://www.who.int/publications/i/item/9789289041683",
    checkedOn: "2026-09-17",
    supports:
      "Relação entre humidade persistente, crescimento microbiano no interior e aumento de sintomas respiratórios, alergias e asma; prevenir a humidade é a medida principal.",
  },
  "cochrane-acaros-asma": {
    id: "cochrane-acaros-asma",
    label: "Dust mite control measures don't help asthma patients (revisão Cochrane resumida)",
    publisher: "The Journal of Family Practice, 2008",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3183866/",
    checkedOn: "2026-09-17",
    supports:
      "A revisão Cochrane de 54 ensaios não encontrou diferença entre medidas de redução de ácaros e controlo nos sintomas de asma. Citada de propósito: contradiz o argumento comercial fácil e é a evidência honesta sobre o assunto.",
  },
};

export function getBlogSources(ids: string[] | undefined): BlogSource[] {
  if (!ids?.length) return [];
  return ids.map(id => {
    const source = BLOG_SOURCES[id];
    if (!source) throw new Error(`blogSources: fonte "${id}" não existe`);
    return source;
  });
}
