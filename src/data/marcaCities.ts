// Lista partilhada de cidades para todas as páginas Marca × Item × Cidade
// (sofá, colchão, cadeiras, tapetes). As 34 cidades mais povoadas do país
// entre as que o site já cobre em locationSeoData.ts — ranking real de
// população INE/Censos via Wikipédia:
// https://pt.wikipedia.org/wiki/Lista_de_munic%C3%ADpios_de_Portugal_por_popula%C3%A7%C3%A3o
// Aveiro/Coimbra/Barcelos ficam de fora: população elevada mas sem
// páginas de localização no site (ficariam órfãs).
export const MARCA_CITIES = [
  // Porto/Norte
  { name: "Porto", slug: "porto" },
  { name: "Vila Nova de Gaia", slug: "vila-nova-de-gaia" },
  { name: "Braga", slug: "braga" },
  { name: "Matosinhos", slug: "matosinhos" },
  { name: "Gondomar", slug: "gondomar" },
  { name: "Guimarães", slug: "guimaraes" },
  { name: "Maia", slug: "maia" },
  { name: "Valongo", slug: "valongo" },
  { name: "Paredes", slug: "paredes" },
  { name: "Vila do Conde", slug: "vila-do-conde" },
  { name: "Póvoa de Varzim", slug: "povoa-de-varzim" },
  { name: "Penafiel", slug: "penafiel" },
  { name: "Santo Tirso", slug: "santo-tirso" },
  // Lisboa / Área Metropolitana
  { name: "Lisboa", slug: "lisboa" },
  { name: "Sintra", slug: "sintra" },
  { name: "Cascais", slug: "cascais" },
  { name: "Loures", slug: "loures" },
  { name: "Amadora", slug: "amadora" },
  { name: "Almada", slug: "almada" },
  { name: "Seixal", slug: "seixal" },
  { name: "Oeiras", slug: "oeiras" },
  { name: "Odivelas", slug: "odivelas" },
  { name: "Vila Franca de Xira", slug: "vila-franca-de-xira" },
  { name: "Setúbal", slug: "setubal" },
  { name: "Mafra", slug: "mafra" },
  { name: "Barreiro", slug: "barreiro" },
  { name: "Moita", slug: "moita" },
  { name: "Montijo", slug: "montijo" },
  { name: "Palmela", slug: "palmela" },
  { name: "Sesimbra", slug: "sesimbra" },
  // Algarve
  { name: "Faro", slug: "faro" },
  { name: "Loulé", slug: "loule" },
  { name: "Portimão", slug: "portimao" },
  { name: "Albufeira", slug: "albufeira" },
] as const;

export const MARCA_CITY_SLUGS = MARCA_CITIES.map(c => c.slug);
