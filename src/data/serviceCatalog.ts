// Catálogo mínimo partilhado: os seis serviços, o preço base e a preposição
// de cada cidade.
//
// Vivia dentro de `locationSeoData.ts`, ao lado do conjunto completo das 69
// cidades e dos geradores de conteúdo. Como `CommercialHero`, o schema e as
// mensagens de WhatsApp são usados em todas as páginas SEO, uma importação de
// `services` ou `cityPrep` arrastava o catálogo inteiro (24,5 KB comprimidos)
// para o grafo estático de praticamente todas elas.
//
// Este módulo não importa nada, por isso quem só precisa destes dados leva
// apenas estes dados. `locationSeoData.ts` reexporta-os para não partir os
// consumidores que também precisam do catálogo grande.

// Default "from" price shown when a specific service price isn't available
import { RUG_PRICE_FROM, RUG_PRICE_NOTE } from '../constants/rugSitePrice';
import { CARPET_PRICE_FROM, CARPET_PRICE_NOTE } from '../constants/rugSitePrice';
export const DEFAULT_PRICE_FROM = "49€";

export const services = [
  { name: "Limpeza de Sofás", slug: "limpeza-sofas", baseRoute: "/limpeza-sofas", priceFrom: "49€", icon: "sofa" },
  { name: "Limpeza de Colchões", slug: "limpeza-colchoes", baseRoute: "/limpeza-colchoes", priceFrom: "59€", icon: "mattress" },
  { name: "Limpeza de Tapetes", slug: "limpeza-tapetes", baseRoute: "/limpeza-tapetes", priceFrom: RUG_PRICE_FROM, icon: "carpet" },
  { name: "Limpeza de Cadeiras", slug: "limpeza-cadeiras", baseRoute: "/limpeza-cadeiras", priceFrom: "20€", icon: "chair" },
  { name: "Limpeza de Alcatifas", slug: "limpeza-alcatifas", baseRoute: "/limpeza-alcatifas", priceFrom: CARPET_PRICE_FROM, icon: "rug" },
  { name: "Impermeabilização", slug: "impermeabilizacao", baseRoute: "/impermeabilizacao", priceFrom: "39€", icon: "waterproof" },
] as const;

// Os concelhos que levam artigo: "no Porto", "na Maia", "da Trofa". O nome
// tem de ser escrito como em `cities`, senão cai em "em" sem avisar
// (serviceCatalog.test.ts confere). As freguesias não passam por aqui.
const ARTICLE_CITIES: Record<string, "o" | "a"> = {
  "Porto": "o",
  "Funchal": "o",
  "Barreiro": "o",
  "Seixal": "o",
  "Montijo": "o",
  "Amadora": "a",
  "Moita": "a",
  "Figueira da Foz": "a",
  "Lousã": "a",
  "Pampilhosa da Serra": "a",
  "Batalha": "a",
  "Marinha Grande": "a",
  "Nazaré": "a",
  "Caniço": "o",
  "Maia": "a",
  "Trofa": "a",
  "Póvoa de Varzim": "a",
  "Póvoa de Lanhoso": "a",
};
export const cityPrep = (city: string) => {
  const article = ARTICLE_CITIES[city];
  if (!article) return "em";
  return article === "o" ? "no" : "na";
};
export const cityPrepCap = (city: string) => {
  const prep = cityPrep(city);
  return prep.charAt(0).toUpperCase() + prep.slice(1);
};
/** O mesmo com "de": "município do Porto", "da Maia", "de Braga". */
export const cityPrepDe = (city: string) => {
  const article = ARTICLE_CITIES[city];
  if (!article) return "de";
  return article === "o" ? "do" : "da";
};
/**
 * Um título com a localidade: "Remoção de Manchas do Sofá no Porto". Num
 * título em forma de pergunta, a localidade entra antes do ponto de
 * interrogação, como se diz: "Quanto Custa a Lavagem Profissional de Tapetes
 * no Porto?". Acrescentada ao fim, dava "Tapetes? no Porto" no título e no H1
 * das páginas de preço por cidade (/preco-limpeza-tapete-porto e irmãs).
 */
export const headingWithCity = (heading: string, city: string) => {
  const where = `${cityPrep(city)} ${city}`;
  return heading.endsWith("?") ? `${heading.slice(0, -1)} ${where}?` : `${heading} ${where}`;
};

// As 70 cidades servidas. Sao dados puros, sem dependencias; viviam ao lado
// dos geradores de conteudo, que arrastam as bibliotecas de FAQ e editorial
// e fazem o chunk chegar aos 24,5 KB comprimidos.
export const cities = [
  // Área Metropolitana do Porto: Primary
  { name: "Porto", slug: "porto", region: "primary", area: "porto", description: "capital do Norte de Portugal" },
  { name: "Matosinhos", slug: "matosinhos", region: "secondary", area: "porto", description: "cidade costeira vizinha do Porto" },
  { name: "Maia", slug: "maia", region: "secondary", area: "porto", description: "município a norte do Porto" },
  { name: "Vila Nova de Gaia", slug: "vila-nova-de-gaia", region: "secondary", area: "porto", description: "cidade na margem sul do Douro" },
  { name: "Gondomar", slug: "gondomar", region: "secondary", area: "porto", description: "município a leste do Porto" },
  { name: "Valongo", slug: "valongo", region: "secondary", area: "porto", description: "município a nordeste do Porto" },
  { name: "Póvoa de Varzim", slug: "povoa-de-varzim", region: "secondary", area: "porto", description: "cidade costeira do litoral norte" },
  { name: "Vila do Conde", slug: "vila-do-conde", region: "secondary", area: "porto", description: "cidade histórica do litoral norte" },
  { name: "Paredes", slug: "paredes", region: "secondary", area: "porto", description: "município do Vale do Sousa" },
  { name: "Penafiel", slug: "penafiel", region: "secondary", area: "porto", description: "cidade do Vale do Sousa" },
  { name: "Lousada", slug: "lousada", region: "secondary", area: "porto", description: "município do Vale do Sousa" },
  { name: "Paços de Ferreira", slug: "pacos-de-ferreira", region: "secondary", area: "porto", description: "capital do móvel" },
  { name: "Felgueiras", slug: "felgueiras", region: "secondary", area: "porto", description: "município do Vale do Sousa" },
  { name: "Santo Tirso", slug: "santo-tirso", region: "secondary", area: "porto", description: "cidade do Ave" },
  { name: "Trofa", slug: "trofa", region: "secondary", area: "porto", description: "município entre Porto e Braga" },
  { name: "Espinho", slug: "espinho", region: "secondary", area: "porto", description: "cidade costeira a sul do Porto" },
  { name: "Arouca", slug: "arouca", region: "secondary", area: "porto", description: "município no interior do distrito de Aveiro" },
  // Sul do Douro (equipa Porto, 2026-09-26: já recebiam anúncios da campanha do Porto)
  { name: "Santa Maria da Feira", slug: "santa-maria-da-feira", region: "secondary", area: "porto", description: "cidade do castelo medieval, a sul do Porto" },
  { name: "São João da Madeira", slug: "sao-joao-da-madeira", region: "secondary", area: "porto", description: "cidade do calçado, entre a Feira e Oliveira de Azeméis" },
  { name: "Oliveira de Azeméis", slug: "oliveira-de-azemeis", region: "secondary", area: "porto", description: "cidade industrial do Entre Douro e Vouga" },
  { name: "Ovar", slug: "ovar", region: "secondary", area: "porto", description: "cidade costeira entre Espinho e Aveiro" },
  // Aveiro (equipa Porto, deslocação alargada, 2026-09-10)
  { name: "Aveiro", slug: "aveiro", region: "secondary", area: "porto", description: "cidade da ria, no litoral centro" },
  // Coimbra e Centro (trabalhador local desde 2026-09-28). No CRM e no
  // calendário das equipas contam como região Porto (AREA_TO_LOCALITY em
  // calendarServices.ts): o dono ainda não quis uma equipa Coimbra.
  { name: "Coimbra", slug: "coimbra", region: "primary", area: "coimbra", description: "cidade universitária às margens do Mondego" },
  { name: "Figueira da Foz", slug: "figueira-da-foz", region: "secondary", area: "coimbra", description: "cidade de praia na foz do Mondego" },
  // Distrito de Coimbra (dono 2026-11-24, escalões pelo centro de Coimbra)
  { name: "Condeixa-a-Nova", slug: "condeixa-a-nova", region: "secondary", area: "coimbra", description: "vila das ruínas de Conímbriga, a sul de Coimbra" },
  { name: "Penacova", slug: "penacova", region: "secondary", area: "coimbra", description: "vila sobre o Mondego, a montante de Coimbra" },
  { name: "Miranda do Corvo", slug: "miranda-do-corvo", region: "secondary", area: "coimbra", description: "vila à porta da Serra da Lousã" },
  { name: "Lousã", slug: "lousa", region: "secondary", area: "coimbra", description: "vila da serra e das aldeias de xisto" },
  { name: "Montemor-o-Velho", slug: "montemor-o-velho", region: "secondary", area: "coimbra", description: "vila do castelo, nos campos do Baixo Mondego" },
  { name: "Vila Nova de Poiares", slug: "vila-nova-de-poiares", region: "secondary", area: "coimbra", description: "vila entre Coimbra e a serra" },
  { name: "Cantanhede", slug: "cantanhede", region: "secondary", area: "coimbra", description: "cidade da Gândara, a noroeste de Coimbra" },
  { name: "Penela", slug: "penela", region: "secondary", area: "coimbra", description: "vila do castelo, a sul de Coimbra" },
  { name: "Soure", slug: "soure", region: "secondary", area: "coimbra", description: "vila entre Coimbra e Pombal" },
  { name: "Mira", slug: "mira", region: "secondary", area: "coimbra", description: "vila da praia e da lagoa, no litoral da Gândara" },
  { name: "Góis", slug: "gois", region: "secondary", area: "coimbra", description: "vila da serra, junto ao rio Ceira" },
  { name: "Arganil", slug: "arganil", region: "secondary", area: "coimbra", description: "vila da Beira Serra, junto ao rio Alva" },
  { name: "Tábua", slug: "tabua", region: "secondary", area: "coimbra", description: "vila da Beira Serra, entre Coimbra e a Estrela" },
  { name: "Oliveira do Hospital", slug: "oliveira-do-hospital", region: "secondary", area: "coimbra", description: "cidade da Beira Serra, à vista da Estrela" },
  { name: "Pampilhosa da Serra", slug: "pampilhosa-da-serra", region: "secondary", area: "coimbra", description: "vila da serra, no interior do distrito de Coimbra" },
  // Leiria e Batalha (equipa Coimbra, dono 2026-10-26)
  { name: "Leiria", slug: "leiria", region: "secondary", area: "coimbra", description: "cidade do castelo, no centro litoral" },
  { name: "Batalha", slug: "batalha", region: "secondary", area: "coimbra", description: "vila do mosteiro, junto a Leiria" },
  // Zona de Leiria (dono 2026-11-15, escalões pelo centro de Leiria)
  { name: "Marinha Grande", slug: "marinha-grande", region: "secondary", area: "coimbra", description: "cidade do vidro, junto ao pinhal de Leiria" },
  { name: "Porto de Mós", slug: "porto-de-mos", region: "secondary", area: "coimbra", description: "vila do castelo, à porta da Serra de Aire e Candeeiros" },
  { name: "Ourém", slug: "ourem", region: "secondary", area: "coimbra", description: "cidade do castelo medieval, no norte do Ribatejo" },
  { name: "Fátima", slug: "fatima", region: "secondary", area: "coimbra", description: "cidade do santuário, no concelho de Ourém" },
  { name: "Pombal", slug: "pombal", region: "secondary", area: "coimbra", description: "cidade entre Leiria e Coimbra" },
  { name: "Alcobaça", slug: "alcobaca", region: "secondary", area: "coimbra", description: "cidade do mosteiro, no Oeste" },
  { name: "Nazaré", slug: "nazare", region: "secondary", area: "coimbra", description: "vila piscatória das ondas gigantes" },
  // Madeira (dono 2026-11-15, escalões pelo centro do Funchal)
  { name: "Funchal", slug: "funchal", region: "primary", area: "madeira", description: "capital da Madeira, virada para a baía" },
  { name: "Câmara de Lobos", slug: "camara-de-lobos", region: "secondary", area: "madeira", description: "vila piscatória a oeste do Funchal" },
  { name: "Caniço", slug: "canico", region: "secondary", area: "madeira", description: "vila a leste do Funchal, no concelho de Santa Cruz" },
  { name: "Santa Cruz", slug: "santa-cruz", region: "secondary", area: "madeira", description: "vila do aeroporto, na costa leste da Madeira" },
  { name: "Machico", slug: "machico", region: "secondary", area: "madeira", description: "baía onde começou o povoamento da Madeira" },
  // Outros: Norte
  { name: "Braga", slug: "braga", region: "primary", area: "braga", description: "cidade milenar do Minho" },
  { name: "Guimarães", slug: "guimaraes", region: "secondary", area: "braga", description: "berço da nação portuguesa" },
  // Expansão Braga/Minho (2026-08-25, equipa local nova em Braga)
  { name: "Vila Nova de Famalicão", slug: "vila-nova-de-famalicao", region: "secondary", area: "braga", description: "cidade industrial do Vale do Ave" },
  { name: "Barcelos", slug: "barcelos", region: "secondary", area: "braga", description: "cidade oleira do Minho" },
  { name: "Viana do Castelo", slug: "viana-do-castelo", region: "secondary", area: "braga", description: "cidade costeira à foz do Lima" },
  { name: "Póvoa de Lanhoso", slug: "povoa-de-lanhoso", region: "secondary", area: "braga", description: "vila do Minho perto de Braga" },
  { name: "Fafe", slug: "fafe", region: "secondary", area: "braga", description: "vila do Minho, terra do capuchinho" },
  { name: "Esposende", slug: "esposende", region: "secondary", area: "braga", description: "vila costeira na foz do Cávado" },
  { name: "Vizela", slug: "vizela", region: "secondary", area: "braga", description: "cidade termal entre Guimarães e Santo Tirso" },
  { name: "Amares", slug: "amares", region: "secondary", area: "braga", description: "vila do Minho a norte de Braga" },
  { name: "Vila Verde", slug: "vila-verde", region: "secondary", area: "braga", description: "vila do Minho a noroeste de Braga" },
  // Lisboa, Área Metropolitana e Alentejo Litoral
  { name: "Lisboa", slug: "lisboa", region: "primary", area: "lisboa", description: "capital de Portugal" },
  { name: "Amadora", slug: "amadora", region: "secondary", area: "lisboa", description: "município vizinho de Lisboa, um dos mais densos do país" },
  { name: "Odivelas", slug: "odivelas", region: "secondary", area: "lisboa", description: "município a norte de Lisboa" },
  { name: "Oeiras", slug: "oeiras", region: "secondary", area: "lisboa", description: "município entre Lisboa e Cascais" },
  { name: "Cascais", slug: "cascais", region: "secondary", area: "lisboa", description: "vila costeira na linha de Cascais" },
  { name: "Sintra", slug: "sintra", region: "secondary", area: "lisboa", description: "vila histórica e Património UNESCO" },
  { name: "Loures", slug: "loures", region: "secondary", area: "lisboa", description: "município a norte da capital" },
  { name: "Almada", slug: "almada", region: "secondary", area: "lisboa", description: "cidade na margem sul do Tejo" },
  { name: "Seixal", slug: "seixal", region: "secondary", area: "lisboa", description: "município na margem sul, junto ao estuário do Tejo" },
  { name: "Vila Franca de Xira", slug: "vila-franca-de-xira", region: "secondary", area: "lisboa", description: "município ribeirinho a norte de Lisboa" },
  { name: "Barreiro", slug: "barreiro", region: "secondary", area: "lisboa", description: "cidade na margem sul do Tejo" },
  { name: "Moita", slug: "moita", region: "secondary", area: "lisboa", description: "município na margem sul do Tejo" },
  { name: "Mafra", slug: "mafra", region: "secondary", area: "lisboa", description: "vila histórica a norte de Sintra" },
  { name: "Setúbal", slug: "setubal", region: "secondary", area: "lisboa", description: "cidade portuária a sul de Lisboa" },
  { name: "Montijo", slug: "montijo", region: "secondary", area: "lisboa", description: "município na margem sul, em frente a Lisboa" },
  { name: "Alcochete", slug: "alcochete", region: "secondary", area: "lisboa", description: "vila ribeirinha na margem sul do Tejo" },
  { name: "Palmela", slug: "palmela", region: "secondary", area: "lisboa", description: "município entre Setúbal e o Montijo" },
  { name: "Sesimbra", slug: "sesimbra", region: "secondary", area: "lisboa", description: "vila costeira a sul de Lisboa" },
  // Alentejo Litoral (equipa Lisboa, deslocação alargada, 2026-09-26: já recebiam anúncios da campanha de Lisboa)
  { name: "Alcácer do Sal", slug: "alcacer-do-sal", region: "secondary", area: "lisboa", description: "cidade ribeirinha do Sado, que inclui a Comporta" },
  { name: "Grândola", slug: "grandola", region: "secondary", area: "lisboa", description: "vila do Alentejo Litoral, com Tróia e Melides na costa" },
  { name: "Santiago do Cacém", slug: "santiago-do-cacem", region: "secondary", area: "lisboa", description: "município do Alentejo Litoral que inclui Vila Nova de Santo André" },
  { name: "Sines", slug: "sines", region: "secondary", area: "lisboa", description: "cidade portuária do Alentejo Litoral" },
  // Algarve
  { name: "Faro", slug: "faro", region: "primary", area: "algarve", description: "capital do Algarve" },
  { name: "Loulé", slug: "loule", region: "secondary", area: "algarve", description: "município que inclui Quarteira, Vilamoura e Almancil" },
  { name: "Albufeira", slug: "albufeira", region: "secondary", area: "algarve", description: "cidade turística do Algarve central" },
  { name: "Olhão", slug: "olhao", region: "secondary", area: "algarve", description: "cidade piscatória do Algarve oriental" },
  { name: "São Brás de Alportel", slug: "sao-bras-de-alportel", region: "secondary", area: "algarve", description: "vila serrana no interior do Algarve" },
  { name: "Silves", slug: "silves", region: "secondary", area: "algarve", description: "cidade histórica do Algarve central" },
  { name: "Lagoa", slug: "lagoa-algarve", region: "secondary", area: "algarve", description: "município turístico do Algarve central" },
  { name: "Tavira", slug: "tavira", region: "secondary", area: "algarve", description: "cidade histórica do Algarve oriental" },
  { name: "Portimão", slug: "portimao", region: "secondary", area: "algarve", description: "maior cidade do Algarve ocidental" },
  { name: "Lagos", slug: "lagos", region: "secondary", area: "algarve", description: "cidade histórica do Algarve ocidental" },
  { name: "Vila Real de Santo António", slug: "vila-real-de-santo-antonio", region: "secondary", area: "algarve", description: "cidade fronteiriça do Algarve oriental" },
  { name: "Castro Marim", slug: "castro-marim", region: "secondary", area: "algarve", description: "vila histórica junto à fronteira com Espanha" },
  { name: "Monchique", slug: "monchique", region: "secondary", area: "algarve", description: "vila serrana no interior do Algarve" },
  { name: "Aljezur", slug: "aljezur", region: "secondary", area: "algarve", description: "vila da Costa Vicentina" },
  { name: "Vila do Bispo", slug: "vila-do-bispo", region: "secondary", area: "algarve", description: "município do extremo sudoeste do Algarve" },
  { name: "Alcoutim", slug: "alcoutim", region: "secondary", area: "algarve", description: "vila ribeirinha do interior algarvio" },
] as const;
