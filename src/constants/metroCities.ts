export const METRO_CITY_SLUGS = [
  // Porto/Norte
  "porto", "matosinhos", "maia", "vila-nova-de-gaia", "gondomar", "braga", "guimaraes",
  "vila-nova-de-famalicao", "barcelos", "viana-do-castelo", "povoa-de-lanhoso", "fafe", "esposende",
  // Coimbra (trabalhador local desde 2026-09-28)
  "coimbra", "figueira-da-foz",
  // Lisboa / Área Metropolitana
  "lisboa", "sintra", "cascais", "oeiras", "amadora", "almada", "loures",
  // Algarve
  "faro", "loule", "albufeira", "portimao", "lagos",
] as const;

export const METRO_CITIES = new Set<string>(METRO_CITY_SLUGS);
