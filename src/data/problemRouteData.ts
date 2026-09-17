// Route metadata espelhada de problemSeoData.ts.
// ARMADILHA: esta lista e escrita a mao. Um problema novo em problemSeoData.ts
// gera a sua propria pagina mas NENHUMA pagina problema x cidade enquanto nao
// for acrescentado aqui tambem. Aconteceu em 2026-09-17 com oito problemas.
// O teste em problemRouteData.test.ts passou a apanhar a divergencia.
// Only slug + visible + relatedCities — no text content.
// Keeps problemSeoData.ts out of the initial bundle.

export interface ProblemRouteSlug {
  slug: string;
  relatedCities: string[];
}

export const PROBLEM_ROUTE_SLUGS: ProblemRouteSlug[] = [
  { slug: "manchas-sofa", relatedCities: ["porto", "matosinhos", "maia", "vila-nova-de-gaia"] },
  { slug: "manchas-vinho-sofa", relatedCities: ["porto", "braga", "guimaraes"] },
  { slug: "manchas-cafe-sofa", relatedCities: ["porto", "maia", "matosinhos"] },
  { slug: "manchas-gordura-sofa", relatedCities: ["porto", "vila-nova-de-gaia", "gondomar"] },
  { slug: "manchas-colchao", relatedCities: ["porto", "braga", "matosinhos"] },
  { slug: "manchas-tapete", relatedCities: ["porto", "vila-nova-de-gaia", "braga"] },
  { slug: "cheiro-sofa", relatedCities: ["porto", "maia", "gondomar"] },
  { slug: "cheiro-urina-sofa", relatedCities: ["porto", "matosinhos", "valongo"] },
  { slug: "cheiro-colchao", relatedCities: ["porto", "braga", "maia"] },
  { slug: "urina-colchao", relatedCities: ["porto", "gondomar", "valongo"] },
  { slug: "cheiro-tapete", relatedCities: ["porto", "maia", "vila-nova-de-gaia"] },
  { slug: "acaros-colchao", relatedCities: ["porto", "braga", "matosinhos"] },
  { slug: "acaros-sofa", relatedCities: ["porto", "gondomar", "maia"] },
  { slug: "alergias-sofa", relatedCities: ["porto", "matosinhos", "braga"] },
  { slug: "alergias-colchao", relatedCities: ["porto", "maia", "vila-nova-de-gaia"] },
  { slug: "pelos-animais-sofa", relatedCities: ["porto", "gondomar", "valongo"] },
  { slug: "pelos-animais-tapete", relatedCities: ["porto", "maia", "matosinhos"] },
  { slug: "tapete-persa", relatedCities: ["porto", "vila-nova-de-gaia", "guimaraes"] },
  { slug: "tapete-la", relatedCities: ["porto", "braga", "maia"] },
  { slug: "mofo-tapete", relatedCities: ["porto", "vila-nova-de-gaia", "maia"] },
  { slug: "mofo-alcatifa", relatedCities: ["porto", "braga", "matosinhos"] },
  { slug: "impermeabilizar-sofa", relatedCities: ["porto", "matosinhos", "braga"] },
  { slug: "preco-limpeza-sofa", relatedCities: ["porto", "matosinhos", "maia", "vila-nova-de-gaia"] },
  { slug: "preco-limpeza-colchao", relatedCities: ["porto", "braga", "vila-nova-de-gaia"] },
  { slug: "preco-limpeza-tapete", relatedCities: ["porto", "matosinhos", "maia"] },
  { slug: "limpeza-profunda-sofa", relatedCities: ["porto", "matosinhos", "braga"] },
  { slug: "limpeza-sofa-domicilio", relatedCities: ["porto", "matosinhos", "maia", "vila-nova-de-gaia", "gondomar"] },
  { slug: "limpeza-sofa-urgente", relatedCities: ["porto", "matosinhos", "maia"] },
  { slug: "limpeza-colchao-urgente", relatedCities: ["porto", "gondomar", "maia"] },
  { slug: "empresa-limpeza-estofos", relatedCities: ["porto", "matosinhos", "braga", "vila-nova-de-gaia"] },
  { slug: "limpeza-sofa-profissional", relatedCities: ["porto", "matosinhos", "braga"] },
  { slug: "limpeza-cadeiras-escritorio", relatedCities: ["porto", "matosinhos", "maia"] },
  { slug: "limpeza-alcatifas-empresa", relatedCities: ["porto", "matosinhos", "braga", "vila-nova-de-gaia"] },
  { slug: "manchas-sangue-colchao", relatedCities: ["porto", "maia", "gondomar"] },
  { slug: "limpeza-sofa-bebe", relatedCities: ["porto", "matosinhos", "braga"] },
  { slug: "manchas-tinta-sofa", relatedCities: ["porto", "maia", "braga"] },
  { slug: "sofa-amarelado", relatedCities: ["porto", "cascais", "lisboa"] },
  { slug: "limpeza-cabeceira-cama", relatedCities: ["porto", "braga", "vila-nova-de-gaia"] },
  { slug: "limpeza-sofa-chenille", relatedCities: ["porto", "lisboa", "sintra"] },
  { slug: "limpeza-puff", relatedCities: ["porto", "maia", "matosinhos"] },
  { slug: "manchas-suor-sofa", relatedCities: ["porto", "gondomar", "valongo"] },
  { slug: "limpeza-colchao-bebe", relatedCities: ["porto", "lisboa", "braga"] },
  { slug: "limpeza-sofa-hotel", relatedCities: ["porto", "lisboa", "cascais", "braga"] },
  { slug: "acaros-tapete", relatedCities: ["porto", "braga", "lisboa"] },
  { slug: "limpeza-sofa-perto-de-mim", relatedCities: ["porto", "matosinhos", "lisboa", "cascais", "braga"] },
  { slug: "limpeza-sofa-antes-depois", relatedCities: ["porto", "matosinhos", "braga"] },
  { slug: "etiqueta-limpeza-sofa", relatedCities: ["porto", "lisboa", "braga", "matosinhos"] },
  { slug: "manchas-castanhas-apos-limpeza", relatedCities: ["porto", "lisboa", "vila-nova-de-gaia", "braga"] },
  { slug: "mancha-volta-apos-limpeza", relatedCities: ["porto", "lisboa", "maia", "faro"] },
  { slug: "sofa-demora-secar", relatedCities: ["porto", "lisboa", "faro", "braga"] },
  { slug: "cheiro-mofo-sofa", relatedCities: ["porto", "lisboa", "matosinhos", "faro"] },
  { slug: "tapete-encolheu", relatedCities: ["porto", "lisboa", "braga", "vila-nova-de-gaia"] },
  { slug: "impermeabilizacao-duracao", relatedCities: ["porto", "lisboa", "braga", "faro"] },
  { slug: "sofa-couro-ressecado", relatedCities: ["porto", "lisboa", "braga", "matosinhos"] },
];
