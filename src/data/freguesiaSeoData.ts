// Hyper-local SEO: Freguesia (neighborhood) level pages
// Each freguesia × service generates a unique landing page

import { services } from "./locationSeoData";

export interface Freguesia {
  name: string;
  slug: string;
  municipio: string;
  municipioSlug: string;
  nearby: string[]; // slugs of nearby freguesias
}

export interface MunicipioGroup {
  name: string;
  slug: string;
  freguesias: { name: string; slug: string; nearby: string[] }[];
}

// ─── All municipalities and their freguesias ───────────────────────
export const municipiosComFreguesias: MunicipioGroup[] = [
  {
    name: "Porto", slug: "porto",
    freguesias: [
      { name: "Paranhos", slug: "paranhos", nearby: ["ramalde", "bonfim", "campanha"] },
      { name: "Ramalde", slug: "ramalde", nearby: ["paranhos", "aldoar", "lordelo-do-ouro"] },
      { name: "Bonfim", slug: "bonfim", nearby: ["paranhos", "campanha", "cedofeita"] },
      { name: "Campanhã", slug: "campanha", nearby: ["bonfim", "paranhos"] },
      { name: "Cedofeita", slug: "cedofeita", nearby: ["ramalde", "bonfim", "lordelo-do-ouro"] },
      { name: "Lordelo do Ouro", slug: "lordelo-do-ouro", nearby: ["ramalde", "cedofeita", "aldoar"] },
      { name: "Aldoar", slug: "aldoar", nearby: ["ramalde", "lordelo-do-ouro", "nevogilde"] },
      { name: "Foz do Douro", slug: "foz-do-douro", nearby: ["aldoar", "nevogilde", "lordelo-do-ouro"] },
      { name: "Nevogilde", slug: "nevogilde", nearby: ["aldoar", "foz-do-douro"] },
      { name: "Massarelos", slug: "massarelos", nearby: ["lordelo-do-ouro", "cedofeita"] },
      { name: "Miragaia", slug: "miragaia", nearby: ["cedofeita", "massarelos"] },
      { name: "Santo Ildefonso", slug: "santo-ildefonso", nearby: ["cedofeita", "bonfim"] },
      { name: "Sé", slug: "se", nearby: ["santo-ildefonso", "miragaia", "bonfim"] },
      { name: "São Nicolau", slug: "sao-nicolau", nearby: ["se", "miragaia"] },
      { name: "Vitória", slug: "vitoria", nearby: ["cedofeita", "se", "santo-ildefonso"] },
    ],
  },
  {
    name: "Matosinhos", slug: "matosinhos",
    freguesias: [
      { name: "Matosinhos", slug: "matosinhos-centro", nearby: ["leca-da-palmeira", "senhora-da-hora"] },
      { name: "Leça da Palmeira", slug: "leca-da-palmeira", nearby: ["matosinhos-centro", "perafita"] },
      { name: "São Mamede de Infesta", slug: "sao-mamede-de-infesta", nearby: ["senhora-da-hora", "leca-do-balio"] },
      { name: "Senhora da Hora", slug: "senhora-da-hora", nearby: ["matosinhos-centro", "sao-mamede-de-infesta"] },
      { name: "Custóias", slug: "custoias", nearby: ["leca-do-balio", "guifoes"] },
      { name: "Leça do Balio", slug: "leca-do-balio", nearby: ["custoias", "sao-mamede-de-infesta"] },
      { name: "Guifões", slug: "guifoes", nearby: ["custoias", "perafita"] },
      { name: "Perafita", slug: "perafita", nearby: ["leca-da-palmeira", "lavra"] },
      { name: "Lavra", slug: "lavra", nearby: ["perafita", "santa-cruz-do-bispo"] },
      { name: "Santa Cruz do Bispo", slug: "santa-cruz-do-bispo", nearby: ["lavra", "perafita"] },
    ],
  },
  {
    name: "Maia", slug: "maia",
    freguesias: [
      { name: "Cidade da Maia", slug: "cidade-da-maia", nearby: ["castelo-da-maia", "aguas-santas"] },
      { name: "Águas Santas", slug: "aguas-santas", nearby: ["cidade-da-maia", "moreira"] },
      { name: "Castêlo da Maia", slug: "castelo-da-maia", nearby: ["cidade-da-maia", "moreira"] },
      { name: "Moreira", slug: "moreira-maia", nearby: ["cidade-da-maia", "aguas-santas", "castelo-da-maia"] },
      { name: "Nogueira", slug: "nogueira-maia", nearby: ["cidade-da-maia", "silva-escura"] },
      { name: "Silva Escura", slug: "silva-escura", nearby: ["nogueira-maia", "folgosa"] },
      { name: "Folgosa", slug: "folgosa-maia", nearby: ["silva-escura", "nogueira-maia"] },
      { name: "Vila Nova da Telha", slug: "vila-nova-da-telha", nearby: ["cidade-da-maia", "moreira-maia"] },
      { name: "Milheirós", slug: "milheiros", nearby: ["cidade-da-maia", "aguas-santas"] },
      { name: "Vermoim", slug: "vermoim", nearby: ["cidade-da-maia", "castelo-da-maia"] },
    ],
  },
  {
    name: "Vila Nova de Gaia", slug: "vila-nova-de-gaia",
    freguesias: [
      { name: "Mafamude", slug: "mafamude", nearby: ["vilar-do-paraiso", "santa-marinha", "oliveira-do-douro"] },
      { name: "Santa Marinha", slug: "santa-marinha", nearby: ["mafamude", "afurada"] },
      { name: "Afurada", slug: "afurada", nearby: ["santa-marinha", "canidelo"] },
      { name: "Canidelo", slug: "canidelo", nearby: ["afurada", "madalena"] },
      { name: "Madalena", slug: "madalena", nearby: ["canidelo", "valadares"] },
      { name: "Valadares", slug: "valadares", nearby: ["madalena", "gulpilhares"] },
      { name: "Gulpilhares", slug: "gulpilhares", nearby: ["valadares", "arcozelo"] },
      { name: "Arcozelo", slug: "arcozelo", nearby: ["gulpilhares", "sao-felix-da-marinha"] },
      { name: "São Félix da Marinha", slug: "sao-felix-da-marinha", nearby: ["arcozelo"] },
      { name: "Oliveira do Douro", slug: "oliveira-do-douro", nearby: ["mafamude", "vilar-de-andorinho"] },
      { name: "Vilar do Paraíso", slug: "vilar-do-paraiso", nearby: ["mafamude", "pedroso"] },
      { name: "Vilar de Andorinho", slug: "vilar-de-andorinho", nearby: ["oliveira-do-douro", "avintes"] },
      { name: "Avintes", slug: "avintes", nearby: ["vilar-de-andorinho", "oliveira-do-douro"] },
      { name: "Canelas", slug: "canelas", nearby: ["vilar-do-paraiso", "pedroso"] },
      { name: "Pedroso", slug: "pedroso", nearby: ["canelas", "vilar-do-paraiso", "serzedo"] },
      { name: "Serzedo", slug: "serzedo", nearby: ["pedroso", "perosinho"] },
      { name: "Perosinho", slug: "perosinho", nearby: ["serzedo", "grijó"] },
      { name: "Grijó", slug: "grijo", nearby: ["perosinho", "sermonde"] },
      { name: "Sermonde", slug: "sermonde", nearby: ["grijo"] },
    ],
  },
  {
    name: "Gondomar", slug: "gondomar",
    freguesias: [
      { name: "Rio Tinto", slug: "rio-tinto", nearby: ["baguim-do-monte", "fanzeres"] },
      { name: "Baguim do Monte", slug: "baguim-do-monte", nearby: ["rio-tinto", "fanzeres"] },
      { name: "Fânzeres", slug: "fanzeres", nearby: ["rio-tinto", "baguim-do-monte", "sao-pedro-da-cova"] },
      { name: "São Pedro da Cova", slug: "sao-pedro-da-cova", nearby: ["fanzeres"] },
      { name: "Valbom", slug: "valbom", nearby: ["gondomar-centro", "jovim"] },
      { name: "Gondomar Centro", slug: "gondomar-centro", nearby: ["valbom", "rio-tinto"] },
      { name: "Jovim", slug: "jovim", nearby: ["valbom", "foz-do-sousa"] },
      { name: "Foz do Sousa", slug: "foz-do-sousa", nearby: ["jovim", "lomba"] },
      { name: "Lomba", slug: "lomba", nearby: ["foz-do-sousa", "covelo"] },
      { name: "Covelo", slug: "covelo", nearby: ["lomba", "melres"] },
      { name: "Melres", slug: "melres", nearby: ["covelo", "medas"] },
      { name: "Medas", slug: "medas", nearby: ["melres"] },
    ],
  },
  {
    name: "Valongo", slug: "valongo",
    freguesias: [
      { name: "Valongo Centro", slug: "valongo-centro", nearby: ["ermesinde", "campo"] },
      { name: "Ermesinde", slug: "ermesinde", nearby: ["valongo-centro", "alfena"] },
      { name: "Alfena", slug: "alfena", nearby: ["ermesinde", "valongo-centro"] },
      { name: "Campo", slug: "campo-valongo", nearby: ["valongo-centro", "sobrado"] },
      { name: "Sobrado", slug: "sobrado-valongo", nearby: ["campo-valongo"] },
    ],
  },
  {
    name: "Paredes", slug: "paredes",
    freguesias: [
      { name: "Paredes Centro", slug: "paredes-centro", nearby: ["rebordosa", "gandra"] },
      { name: "Rebordosa", slug: "rebordosa", nearby: ["paredes-centro", "aguiar-de-sousa"] },
      { name: "Gandra", slug: "gandra", nearby: ["paredes-centro", "baltar"] },
      { name: "Baltar", slug: "baltar", nearby: ["gandra", "lordelo-paredes"] },
      { name: "Lordelo", slug: "lordelo-paredes", nearby: ["baltar", "paredes-centro"] },
      { name: "Aguiar de Sousa", slug: "aguiar-de-sousa", nearby: ["rebordosa"] },
      { name: "Cete", slug: "cete", nearby: ["paredes-centro", "paço-de-sousa"] },
      { name: "Paço de Sousa", slug: "paco-de-sousa", nearby: ["cete", "paredes-centro"] },
    ],
  },
  {
    name: "Penafiel", slug: "penafiel",
    freguesias: [
      { name: "Penafiel Centro", slug: "penafiel-centro", nearby: ["paço-de-sousa-penafiel", "bustelo"] },
      { name: "Paço de Sousa", slug: "paco-de-sousa-penafiel", nearby: ["penafiel-centro"] },
      { name: "Bustelo", slug: "bustelo", nearby: ["penafiel-centro"] },
      { name: "Guilhufe", slug: "guilhufe", nearby: ["penafiel-centro", "marecos"] },
      { name: "Marecos", slug: "marecos", nearby: ["guilhufe", "penafiel-centro"] },
      { name: "Rio de Moinhos", slug: "rio-de-moinhos", nearby: ["penafiel-centro"] },
    ],
  },
  {
    name: "Lousada", slug: "lousada",
    freguesias: [
      { name: "Lousada Centro", slug: "lousada-centro", nearby: ["silvares", "lustosa"] },
      { name: "Silvares", slug: "silvares", nearby: ["lousada-centro"] },
      { name: "Lustosa", slug: "lustosa", nearby: ["lousada-centro"] },
      { name: "Caíde de Rei", slug: "caide-de-rei", nearby: ["lousada-centro", "lustosa"] },
      { name: "Nespereira", slug: "nespereira-lousada", nearby: ["lousada-centro"] },
    ],
  },
  {
    name: "Paços de Ferreira", slug: "pacos-de-ferreira",
    freguesias: [
      { name: "Paços de Ferreira Centro", slug: "pacos-de-ferreira-centro", nearby: ["freamunde", "frazao"] },
      { name: "Freamunde", slug: "freamunde", nearby: ["pacos-de-ferreira-centro"] },
      { name: "Frazão", slug: "frazao", nearby: ["pacos-de-ferreira-centro", "freamunde"] },
      { name: "Carvalhosa", slug: "carvalhosa", nearby: ["pacos-de-ferreira-centro"] },
      { name: "Seroa", slug: "seroa", nearby: ["pacos-de-ferreira-centro", "frazao"] },
    ],
  },
  {
    name: "Felgueiras", slug: "felgueiras",
    freguesias: [
      { name: "Felgueiras Centro", slug: "felgueiras-centro", nearby: ["margaride", "lixa"] },
      { name: "Margaride", slug: "margaride", nearby: ["felgueiras-centro"] },
      { name: "Lixa", slug: "lixa", nearby: ["felgueiras-centro"] },
      { name: "Barrosas", slug: "barrosas", nearby: ["felgueiras-centro", "lixa"] },
      { name: "Idães", slug: "idaes", nearby: ["felgueiras-centro"] },
    ],
  },
  {
    name: "Santo Tirso", slug: "santo-tirso",
    freguesias: [
      { name: "Santo Tirso Centro", slug: "santo-tirso-centro", nearby: ["sao-tome-de-negrelos", "vilarinho"] },
      { name: "São Tomé de Negrelos", slug: "sao-tome-de-negrelos", nearby: ["santo-tirso-centro"] },
      { name: "Vilarinho", slug: "vilarinho-santo-tirso", nearby: ["santo-tirso-centro"] },
      { name: "Areias", slug: "areias-santo-tirso", nearby: ["santo-tirso-centro"] },
      { name: "Negrelos", slug: "negrelos", nearby: ["sao-tome-de-negrelos", "santo-tirso-centro"] },
    ],
  },
  {
    name: "Trofa", slug: "trofa",
    freguesias: [
      { name: "Trofa Centro", slug: "trofa-centro", nearby: ["sao-romao-do-coronado", "sao-martinho-de-bougado"] },
      { name: "São Romão do Coronado", slug: "sao-romao-do-coronado", nearby: ["trofa-centro"] },
      { name: "São Martinho de Bougado", slug: "sao-martinho-de-bougado", nearby: ["trofa-centro", "sao-romao-do-coronado"] },
      { name: "Guidões", slug: "guidoes", nearby: ["trofa-centro"] },
      { name: "Alvarelhos", slug: "alvarelhos", nearby: ["trofa-centro", "guidoes"] },
    ],
  },
  {
    name: "Póvoa de Varzim", slug: "povoa-de-varzim",
    freguesias: [
      { name: "Póvoa de Varzim Centro", slug: "povoa-de-varzim-centro", nearby: ["aver-o-mar", "agucar-doce"] },
      { name: "Aver-o-Mar", slug: "aver-o-mar", nearby: ["povoa-de-varzim-centro", "agucar-doce"] },
      { name: "Aguçadoura", slug: "agucadoura", nearby: ["aver-o-mar", "navais"] },
      { name: "Navais", slug: "navais", nearby: ["agucadoura"] },
      { name: "Beiriz", slug: "beiriz", nearby: ["povoa-de-varzim-centro", "argivai"] },
      { name: "Argivai", slug: "argivai", nearby: ["beiriz", "povoa-de-varzim-centro"] },
    ],
  },
  {
    name: "Vila do Conde", slug: "vila-do-conde",
    freguesias: [
      { name: "Vila do Conde Centro", slug: "vila-do-conde-centro", nearby: ["azurara", "mindelo"] },
      { name: "Azurara", slug: "azurara", nearby: ["vila-do-conde-centro"] },
      { name: "Mindelo", slug: "mindelo", nearby: ["vila-do-conde-centro", "vila-cha"] },
      { name: "Vila Chã", slug: "vila-cha", nearby: ["mindelo", "labruge"] },
      { name: "Labruge", slug: "labruge", nearby: ["vila-cha"] },
      { name: "Modivas", slug: "modivas", nearby: ["vila-do-conde-centro"] },
    ],
  },
  {
    name: "Espinho", slug: "espinho",
    freguesias: [
      { name: "Espinho Centro", slug: "espinho-centro", nearby: ["silvalde", "anta"] },
      { name: "Silvalde", slug: "silvalde", nearby: ["espinho-centro", "paramos"] },
      { name: "Anta", slug: "anta-espinho", nearby: ["espinho-centro", "guetim"] },
      { name: "Paramos", slug: "paramos", nearby: ["silvalde"] },
      { name: "Guetim", slug: "guetim", nearby: ["anta-espinho"] },
    ],
  },
  {
    name: "Arouca", slug: "arouca",
    freguesias: [
      { name: "Arouca Centro", slug: "arouca-centro", nearby: ["escariz", "urrô"] },
      { name: "Escariz", slug: "escariz", nearby: ["arouca-centro"] },
      { name: "Urrô", slug: "urro", nearby: ["arouca-centro", "escariz"] },
      { name: "Alvarenga", slug: "alvarenga", nearby: ["arouca-centro"] },
      { name: "Moldes", slug: "moldes", nearby: ["arouca-centro"] },
    ],
  },
];

// ─── Flatten all freguesias ───────────────────────────────────────
export function getAllFreguesias(): Freguesia[] {
  const result: Freguesia[] = [];
  for (const m of municipiosComFreguesias) {
    for (const f of m.freguesias) {
      result.push({
        name: f.name,
        slug: f.slug,
        municipio: m.name,
        municipioSlug: m.slug,
        nearby: f.nearby,
      });
    }
  }
  return result;
}

// ─── Route generation ─────────────────────────────────────────────
export interface FreguesiaRoute {
  path: string;
  serviceSlug: string;
  citySlug: string;
  freguesiaSlug: string;
}

export function getAllFreguesiaRoutes(): FreguesiaRoute[] {
  const routes: FreguesiaRoute[] = [];
  for (const m of municipiosComFreguesias) {
    for (const f of m.freguesias) {
      for (const svc of services) {
        routes.push({
          path: `/${svc.slug}-${m.slug}-${f.slug}`,
          serviceSlug: svc.slug,
          citySlug: m.slug,
          freguesiaSlug: f.slug,
        });
      }
    }
  }
  return routes;
}

// ─── Get freguesia data ───────────────────────────────────────────
export function getFreguesia(municipioSlug: string, freguesiaSlug: string): Freguesia | null {
  const m = municipiosComFreguesias.find(m => m.slug === municipioSlug);
  if (!m) return null;
  const f = m.freguesias.find(f => f.slug === freguesiaSlug);
  if (!f) return null;
  return {
    name: f.name,
    slug: f.slug,
    municipio: m.name,
    municipioSlug: m.slug,
    nearby: f.nearby,
  };
}

// ─── Get nearby freguesias with full data ─────────────────────────
export function getNearbyFreguesias(municipioSlug: string, nearbySlugs: string[]): Freguesia[] {
  const m = municipiosComFreguesias.find(m => m.slug === municipioSlug);
  if (!m) return [];
  return nearbySlugs
    .map(slug => {
      const f = m.freguesias.find(f => f.slug === slug);
      return f ? { name: f.name, slug: f.slug, municipio: m.name, municipioSlug: m.slug, nearby: f.nearby } : null;
    })
    .filter(Boolean) as Freguesia[];
}

// ─── Content generator for freguesia pages (uses dynamic spintax engine) ────
import { getDynamicContent } from "./freguesiaContentEngine";

export function generateFreguesiaContent(
  serviceName: string,
  serviceSlug: string,
  priceFrom: string,
  freguesia: string,
  freguesiaSlug: string,
  municipio: string,
) {
  return getDynamicContent(serviceName, serviceSlug, priceFrom, freguesia, freguesiaSlug, municipio);
}

// ─── Stats ────────────────────────────────────────────────────────
export function getFreguesiaStats() {
  let totalFreguesias = 0;
  for (const m of municipiosComFreguesias) {
    totalFreguesias += m.freguesias.length;
  }
  return {
    municipios: municipiosComFreguesias.length,
    freguesias: totalFreguesias,
    totalPages: totalFreguesias * services.length,
  };
}
