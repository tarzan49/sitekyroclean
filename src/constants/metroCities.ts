export const METRO_CITY_SLUGS = [
  // Porto/Norte
  "porto", "matosinhos", "maia", "vila-nova-de-gaia", "gondomar", "braga",
  // Lisboa / Área Metropolitana
  "lisboa", "sintra", "cascais", "oeiras", "amadora", "almada", "loures",
  // Algarve
  "faro", "loule", "albufeira", "portimao", "lagos",
] as const;

export const METRO_CITIES = new Set(METRO_CITY_SLUGS);
