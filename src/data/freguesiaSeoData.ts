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
  // ═══════════════ Lisboa / Área Metropolitana ═══════════════
  {
    name: "Lisboa", slug: "lisboa",
    freguesias: [
      { name: "Santa Maria Maior", slug: "santa-maria-maior", nearby: ["misericordia", "sao-vicente", "arroios"] },
      { name: "Misericórdia", slug: "misericordia", nearby: ["santa-maria-maior", "santo-antonio", "estrela"] },
      { name: "Santo António", slug: "santo-antonio", nearby: ["misericordia", "avenidas-novas", "arroios"] },
      { name: "São Vicente", slug: "sao-vicente", nearby: ["santa-maria-maior", "penha-de-franca", "beato"] },
      { name: "Arroios", slug: "arroios", nearby: ["santo-antonio", "penha-de-franca", "areeiro"] },
      { name: "Penha de França", slug: "penha-de-franca", nearby: ["sao-vicente", "arroios", "beato"] },
      { name: "Beato", slug: "beato", nearby: ["sao-vicente", "penha-de-franca", "marvila"] },
      { name: "Marvila", slug: "marvila", nearby: ["beato", "parque-das-nacoes", "olivais"] },
      { name: "Parque das Nações", slug: "parque-das-nacoes", nearby: ["marvila", "olivais"] },
      { name: "Areeiro", slug: "areeiro", nearby: ["arroios", "alvalade", "avenidas-novas"] },
      { name: "Alvalade", slug: "alvalade", nearby: ["areeiro", "avenidas-novas", "olivais"] },
      { name: "Avenidas Novas", slug: "avenidas-novas", nearby: ["santo-antonio", "areeiro", "campolide"] },
      { name: "Campo de Ourique", slug: "campo-de-ourique", nearby: ["estrela", "campolide", "alcantara"] },
      { name: "Estrela", slug: "estrela", nearby: ["misericordia", "campo-de-ourique", "campolide"] },
      { name: "Campolide", slug: "campolide", nearby: ["avenidas-novas", "campo-de-ourique", "benfica"] },
      { name: "Alcântara", slug: "alcantara", nearby: ["campo-de-ourique", "belem", "campolide"] },
      { name: "Belém", slug: "belem", nearby: ["alcantara", "ajuda"] },
      { name: "Ajuda", slug: "ajuda", nearby: ["belem", "benfica"] },
      { name: "Benfica", slug: "benfica", nearby: ["campolide", "ajuda", "sao-domingos-de-benfica"] },
      { name: "São Domingos de Benfica", slug: "sao-domingos-de-benfica", nearby: ["benfica", "carnide", "avenidas-novas"] },
      { name: "Carnide", slug: "carnide", nearby: ["sao-domingos-de-benfica", "lumiar", "benfica"] },
      { name: "Lumiar", slug: "lumiar", nearby: ["carnide", "santa-clara", "olivais"] },
      { name: "Santa Clara", slug: "santa-clara", nearby: ["lumiar", "olivais"] },
      { name: "Olivais", slug: "olivais", nearby: ["santa-clara", "parque-das-nacoes", "alvalade"] },
    ],
  },
  {
    name: "Cascais", slug: "cascais",
    freguesias: [
      { name: "Cascais e Estoril", slug: "cascais-estoril", nearby: ["alcabideche", "carcavelos-e-parede"] },
      { name: "Alcabideche", slug: "alcabideche", nearby: ["cascais-estoril", "sao-domingos-de-rana"] },
      { name: "Carcavelos e Parede", slug: "carcavelos-e-parede", nearby: ["cascais-estoril", "sao-domingos-de-rana"] },
      { name: "São Domingos de Rana", slug: "sao-domingos-de-rana", nearby: ["alcabideche", "carcavelos-e-parede"] },
    ],
  },
  {
    name: "Oeiras", slug: "oeiras",
    freguesias: [
      { name: "Oeiras e São Julião da Barra", slug: "oeiras-e-sao-juliao-da-barra", nearby: ["carnaxide-e-queijas", "porto-salvo"] },
      { name: "Algés, Linda-a-Velha e Cruz Quebrada", slug: "alges-linda-a-velha", nearby: ["carnaxide-e-queijas", "oeiras-e-sao-juliao-da-barra"] },
      { name: "Carnaxide e Queijas", slug: "carnaxide-e-queijas", nearby: ["alges-linda-a-velha", "oeiras-e-sao-juliao-da-barra", "barcarena"] },
      { name: "Barcarena", slug: "barcarena", nearby: ["carnaxide-e-queijas", "porto-salvo"] },
      { name: "Porto Salvo", slug: "porto-salvo", nearby: ["barcarena", "oeiras-e-sao-juliao-da-barra"] },
    ],
  },
  {
    name: "Sintra", slug: "sintra",
    freguesias: [
      { name: "Sintra (Vila)", slug: "sintra-vila", nearby: ["colares", "almargem-do-bispo", "rio-de-mouro"] },
      { name: "Agualva e Mira-Sintra", slug: "agualva-e-mira-sintra", nearby: ["cacem-e-sao-marcos", "algueirao-mem-martins"] },
      { name: "Algueirão-Mem Martins", slug: "algueirao-mem-martins", nearby: ["agualva-e-mira-sintra", "rio-de-mouro", "casal-de-cambra"] },
      { name: "Casal de Cambra", slug: "casal-de-cambra", nearby: ["algueirao-mem-martins", "cacem-e-sao-marcos"] },
      { name: "Cacém e São Marcos", slug: "cacem-e-sao-marcos", nearby: ["agualva-e-mira-sintra", "massama-e-monte-abraao"] },
      { name: "Massamá e Monte Abraão", slug: "massama-e-monte-abraao", nearby: ["cacem-e-sao-marcos", "queluz-e-belas"] },
      { name: "Queluz e Belas", slug: "queluz-e-belas", nearby: ["massama-e-monte-abraao", "rio-de-mouro"] },
      { name: "Rio de Mouro", slug: "rio-de-mouro", nearby: ["algueirao-mem-martins", "queluz-e-belas", "sintra-vila"] },
      { name: "São João das Lampas e Terrugem", slug: "sao-joao-das-lampas-e-terrugem", nearby: ["sintra-vila", "colares"] },
      { name: "Colares", slug: "colares", nearby: ["sintra-vila", "sao-joao-das-lampas-e-terrugem"] },
      { name: "Almargem do Bispo, Pêro Pinheiro e Montelavar", slug: "almargem-do-bispo", nearby: ["sintra-vila", "sao-joao-das-lampas-e-terrugem"] },
    ],
  },
  {
    name: "Almada", slug: "almada",
    freguesias: [
      { name: "Almada, Cova da Piedade, Pragal e Cacilhas", slug: "almada-cova-da-piedade", nearby: ["laranjeiro-e-feijo", "caparica-e-trafaria"] },
      { name: "Caparica e Trafaria", slug: "caparica-e-trafaria", nearby: ["almada-cova-da-piedade", "costa-da-caparica"] },
      { name: "Costa da Caparica", slug: "costa-da-caparica", nearby: ["caparica-e-trafaria", "charneca-de-caparica"] },
      { name: "Charneca de Caparica e Sobreda", slug: "charneca-de-caparica", nearby: ["costa-da-caparica", "laranjeiro-e-feijo"] },
      { name: "Laranjeiro e Feijó", slug: "laranjeiro-e-feijo", nearby: ["almada-cova-da-piedade", "charneca-de-caparica"] },
    ],
  },
  {
    name: "Setúbal", slug: "setubal",
    freguesias: [
      { name: "Setúbal (Centro Histórico)", slug: "setubal-centro", nearby: ["sao-sebastiao-setubal", "sado"] },
      { name: "São Sebastião", slug: "sao-sebastiao-setubal", nearby: ["setubal-centro", "gambia-pontes"] },
      { name: "Sado", slug: "sado", nearby: ["setubal-centro", "gambia-pontes"] },
      { name: "Gâmbia-Pontes-Alto da Guerra", slug: "gambia-pontes", nearby: ["sao-sebastiao-setubal", "sado"] },
      { name: "Azeitão", slug: "azeitao", nearby: ["setubal-centro"] },
    ],
  },
  {
    name: "Amadora", slug: "amadora",
    freguesias: [
      { name: "Águas Livres", slug: "aguas-livres", nearby: ["alfragide", "venteira"] },
      { name: "Alfragide", slug: "alfragide", nearby: ["aguas-livres", "encosta-do-sol"] },
      { name: "Encosta do Sol", slug: "encosta-do-sol", nearby: ["alfragide", "falagueira-venda-nova"] },
      { name: "Falagueira-Venda Nova", slug: "falagueira-venda-nova", nearby: ["encosta-do-sol", "mina-de-agua"] },
      { name: "Mina de Água", slug: "mina-de-agua", nearby: ["falagueira-venda-nova", "venteira"] },
      { name: "Venteira", slug: "venteira", nearby: ["mina-de-agua", "aguas-livres"] },
    ],
  },
  {
    name: "Odivelas", slug: "odivelas",
    freguesias: [
      { name: "Odivelas", slug: "odivelas-centro", nearby: ["povoa-de-santo-adriao", "pontinha-e-famoes"] },
      { name: "Póvoa de Santo Adrião e Olival Basto", slug: "povoa-de-santo-adriao", nearby: ["odivelas-centro", "ramada-e-canecas"] },
      { name: "Ramada e Caneças", slug: "ramada-e-canecas", nearby: ["povoa-de-santo-adriao", "odivelas-centro"] },
      { name: "Pontinha e Famões", slug: "pontinha-e-famoes", nearby: ["odivelas-centro"] },
    ],
  },
  {
    name: "Loures", slug: "loures",
    freguesias: [
      { name: "Loures", slug: "loures-centro", nearby: ["sacavem-e-prior-velho", "bucelas"] },
      { name: "Sacavém e Prior Velho", slug: "sacavem-e-prior-velho", nearby: ["loures-centro", "moscavide-e-portela", "santa-iria-de-azoia"] },
      { name: "Santa Iria de Azoia, São João da Talha e Bobadela", slug: "santa-iria-de-azoia", nearby: ["sacavem-e-prior-velho", "camarate-unhos-apelacao"] },
      { name: "Camarate, Unhos e Apelação", slug: "camarate-unhos-apelacao", nearby: ["santa-iria-de-azoia", "santo-antonio-dos-cavaleiros"] },
      { name: "Santo António dos Cavaleiros e Frielas", slug: "santo-antonio-dos-cavaleiros", nearby: ["camarate-unhos-apelacao", "loures-centro"] },
      { name: "Bucelas", slug: "bucelas", nearby: ["loures-centro", "fanhoes"] },
      { name: "Fanhões", slug: "fanhoes", nearby: ["bucelas", "lousa-loures"] },
      { name: "Lousa", slug: "lousa-loures", nearby: ["fanhoes", "loures-centro"] },
      { name: "Moscavide e Portela", slug: "moscavide-e-portela", nearby: ["sacavem-e-prior-velho"] },
    ],
  },
  {
    name: "Vila Franca de Xira", slug: "vila-franca-de-xira",
    freguesias: [
      { name: "Vila Franca de Xira", slug: "vila-franca-de-xira-centro", nearby: ["alverca-do-ribatejo", "povoa-de-santa-iria"] },
      { name: "Alverca do Ribatejo", slug: "alverca-do-ribatejo", nearby: ["vila-franca-de-xira-centro", "povoa-de-santa-iria"] },
      { name: "Póvoa de Santa Iria e Forte da Casa", slug: "povoa-de-santa-iria", nearby: ["alverca-do-ribatejo", "vialonga"] },
      { name: "Alhandra, São João dos Montes e Calhandriz", slug: "alhandra", nearby: ["vila-franca-de-xira-centro", "castanheira-do-ribatejo"] },
      { name: "Vialonga", slug: "vialonga", nearby: ["povoa-de-santa-iria", "vila-franca-de-xira-centro"] },
      { name: "Castanheira do Ribatejo e Cachoeiras", slug: "castanheira-do-ribatejo", nearby: ["alhandra", "vila-franca-de-xira-centro"] },
    ],
  },
  {
    name: "Barreiro", slug: "barreiro",
    freguesias: [
      { name: "Barreiro e Lavradio", slug: "barreiro-e-lavradio", nearby: ["alto-do-seixalinho", "palhais-e-coina"] },
      { name: "Alto do Seixalinho, Santo André e Verderena", slug: "alto-do-seixalinho", nearby: ["barreiro-e-lavradio", "palhais-e-coina"] },
      { name: "Palhais e Coina", slug: "palhais-e-coina", nearby: ["barreiro-e-lavradio", "alto-do-seixalinho"] },
    ],
  },
  {
    name: "Moita", slug: "moita",
    freguesias: [
      { name: "Moita", slug: "moita-centro", nearby: ["baixa-da-banheira", "alhos-vedros"] },
      { name: "Baixa da Banheira e Vale da Amoreira", slug: "baixa-da-banheira", nearby: ["moita-centro", "alhos-vedros"] },
      { name: "Alhos Vedros", slug: "alhos-vedros", nearby: ["moita-centro", "baixa-da-banheira"] },
      { name: "Gaio-Rosário e Sarilhos Pequenos", slug: "gaio-rosario", nearby: ["moita-centro"] },
    ],
  },
  {
    name: "Mafra", slug: "mafra",
    freguesias: [
      { name: "Mafra", slug: "mafra-centro", nearby: ["malveira", "venda-do-pinheiro"] },
      { name: "Ericeira", slug: "ericeira", nearby: ["mafra-centro"] },
      { name: "Malveira e São Miguel de Alcainça", slug: "malveira", nearby: ["mafra-centro", "venda-do-pinheiro"] },
      { name: "Venda do Pinheiro e Santo Estêvão das Galés", slug: "venda-do-pinheiro", nearby: ["malveira", "mafra-centro"] },
    ],
  },
  {
    name: "Seixal", slug: "seixal",
    freguesias: [
      { name: "Seixal, Arrentela e Aldeia de Paio Pires", slug: "seixal-centro", nearby: ["amora", "corroios"] },
      { name: "Amora", slug: "amora", nearby: ["seixal-centro", "corroios"] },
      { name: "Corroios", slug: "corroios", nearby: ["amora", "seixal-centro"] },
      { name: "Fernão Ferro", slug: "fernao-ferro", nearby: ["seixal-centro"] },
    ],
  },
  {
    name: "Montijo", slug: "montijo",
    freguesias: [
      { name: "Montijo e Afonsoeiro", slug: "montijo-centro", nearby: ["alto-estanqueiro", "sarilhos-grandes"] },
      { name: "Alto Estanqueiro-Jardia", slug: "alto-estanqueiro", nearby: ["montijo-centro", "canha"] },
      { name: "Canha", slug: "canha", nearby: ["alto-estanqueiro", "pegoes"] },
      { name: "Pegões", slug: "pegoes", nearby: ["canha"] },
      { name: "Sarilhos Grandes", slug: "sarilhos-grandes", nearby: ["montijo-centro"] },
    ],
  },
  {
    name: "Alcochete", slug: "alcochete",
    freguesias: [
      { name: "Alcochete", slug: "alcochete-centro", nearby: ["samouco", "sao-francisco-alcochete"] },
      { name: "Samouco", slug: "samouco", nearby: ["alcochete-centro"] },
      { name: "São Francisco", slug: "sao-francisco-alcochete", nearby: ["alcochete-centro"] },
    ],
  },
  {
    name: "Palmela", slug: "palmela",
    freguesias: [
      { name: "Palmela", slug: "palmela-centro", nearby: ["pinhal-novo", "quinta-do-anjo"] },
      { name: "Pinhal Novo", slug: "pinhal-novo", nearby: ["palmela-centro", "poceirao-e-marateca"] },
      { name: "Poceirão e Marateca", slug: "poceirao-e-marateca", nearby: ["pinhal-novo"] },
      { name: "Quinta do Anjo", slug: "quinta-do-anjo", nearby: ["palmela-centro"] },
    ],
  },
  {
    name: "Sesimbra", slug: "sesimbra",
    freguesias: [
      { name: "Sesimbra (Castelo) e Quinta do Conde", slug: "sesimbra-castelo", nearby: ["santiago-sesimbra"] },
      { name: "Santiago", slug: "santiago-sesimbra", nearby: ["sesimbra-castelo"] },
    ],
  },
  // ═══════════════ Algarve ═══════════════
  {
    name: "Faro", slug: "faro",
    freguesias: [
      { name: "Faro (Sé e São Pedro)", slug: "faro-centro", nearby: ["conceicao-de-faro", "montenegro"] },
      { name: "Conceição de Faro", slug: "conceicao-de-faro", nearby: ["faro-centro", "montenegro"] },
      { name: "Estoi", slug: "estoi", nearby: ["santa-barbara-de-nexe", "faro-centro"] },
      { name: "Montenegro", slug: "montenegro", nearby: ["faro-centro", "conceicao-de-faro"] },
      { name: "Santa Bárbara de Nexe", slug: "santa-barbara-de-nexe", nearby: ["estoi", "faro-centro"] },
    ],
  },
  {
    name: "Loulé", slug: "loule",
    freguesias: [
      { name: "Loulé (Centro)", slug: "loule-centro", nearby: ["boliqueime", "alte-e-salir"] },
      { name: "Quarteira", slug: "quarteira", nearby: ["vilamoura", "almancil"] },
      { name: "Vilamoura", slug: "vilamoura", nearby: ["quarteira", "almancil"] },
      { name: "Almancil", slug: "almancil", nearby: ["quinta-do-lago", "vale-do-lobo", "quarteira"] },
      { name: "Quinta do Lago", slug: "quinta-do-lago", nearby: ["vale-do-lobo", "almancil"] },
      { name: "Vale do Lobo", slug: "vale-do-lobo", nearby: ["quinta-do-lago", "almancil"] },
      { name: "Boliqueime", slug: "boliqueime", nearby: ["loule-centro", "almancil"] },
      { name: "Alte, Ameixial e Salir", slug: "alte-e-salir", nearby: ["loule-centro"] },
    ],
  },
  {
    name: "Albufeira", slug: "albufeira",
    freguesias: [
      { name: "Albufeira e Olhos de Água", slug: "albufeira-centro", nearby: ["guia", "ferreiras"] },
      { name: "Ferreiras", slug: "ferreiras", nearby: ["albufeira-centro", "paderne"] },
      { name: "Guia", slug: "guia", nearby: ["albufeira-centro", "ferreiras"] },
      { name: "Paderne", slug: "paderne", nearby: ["ferreiras"] },
    ],
  },
  {
    name: "Olhão", slug: "olhao",
    freguesias: [
      { name: "Olhão", slug: "olhao-centro", nearby: ["quelfes", "pechao"] },
      { name: "Quelfes", slug: "quelfes", nearby: ["olhao-centro", "moncarapacho-e-fuseta"] },
      { name: "Moncarapacho e Fuseta", slug: "moncarapacho-e-fuseta", nearby: ["quelfes", "olhao-centro"] },
      { name: "Pechão", slug: "pechao", nearby: ["olhao-centro"] },
    ],
  },
  {
    name: "São Brás de Alportel", slug: "sao-bras-de-alportel",
    freguesias: [
      { name: "São Brás de Alportel", slug: "sao-bras-de-alportel-centro", nearby: [] },
    ],
  },
  {
    name: "Silves", slug: "silves",
    freguesias: [
      { name: "Silves", slug: "silves-centro", nearby: ["algoz-e-tunes", "sao-bartolomeu-de-messines"] },
      { name: "Algoz e Tunes", slug: "algoz-e-tunes", nearby: ["silves-centro", "armacao-de-pera"] },
      { name: "Armação de Pêra", slug: "armacao-de-pera", nearby: ["algoz-e-tunes", "pera"] },
      { name: "Pêra", slug: "pera", nearby: ["armacao-de-pera"] },
      { name: "São Bartolomeu de Messines", slug: "sao-bartolomeu-de-messines", nearby: ["silves-centro", "sao-marcos-da-serra"] },
      { name: "São Marcos da Serra", slug: "sao-marcos-da-serra", nearby: ["sao-bartolomeu-de-messines"] },
    ],
  },
  {
    name: "Lagoa", slug: "lagoa-algarve",
    freguesias: [
      { name: "Lagoa e Carvoeiro", slug: "lagoa-e-carvoeiro", nearby: ["estombar-e-parchal", "porches"] },
      { name: "Estômbar e Parchal", slug: "estombar-e-parchal", nearby: ["lagoa-e-carvoeiro", "ferragudo"] },
      { name: "Ferragudo", slug: "ferragudo", nearby: ["estombar-e-parchal"] },
      { name: "Porches", slug: "porches", nearby: ["lagoa-e-carvoeiro"] },
    ],
  },
  {
    name: "Tavira", slug: "tavira",
    freguesias: [
      { name: "Tavira (Santa Maria e Santiago)", slug: "tavira-centro", nearby: ["conceicao-e-cabanas", "santa-luzia-tavira"] },
      { name: "Conceição e Cabanas de Tavira", slug: "conceicao-e-cabanas", nearby: ["tavira-centro", "luz-de-tavira"] },
      { name: "Luz de Tavira e Santo Estêvão", slug: "luz-de-tavira", nearby: ["conceicao-e-cabanas", "santa-catarina-da-fonte-do-bispo"] },
      { name: "Santa Catarina da Fonte do Bispo", slug: "santa-catarina-da-fonte-do-bispo", nearby: ["luz-de-tavira", "cachopo"] },
      { name: "Santa Luzia", slug: "santa-luzia-tavira", nearby: ["tavira-centro"] },
      { name: "Cachopo", slug: "cachopo", nearby: ["santa-catarina-da-fonte-do-bispo"] },
    ],
  },
  {
    name: "Portimão", slug: "portimao",
    freguesias: [
      { name: "Portimão", slug: "portimao-centro", nearby: ["alvor", "mexilhoeira-grande"] },
      { name: "Alvor", slug: "alvor", nearby: ["portimao-centro", "mexilhoeira-grande"] },
      { name: "Mexilhoeira Grande", slug: "mexilhoeira-grande", nearby: ["alvor", "portimao-centro"] },
    ],
  },
  {
    name: "Lagos", slug: "lagos",
    freguesias: [
      { name: "Lagos (São Sebastião e Santa Maria)", slug: "lagos-centro", nearby: ["luz-lagos", "odiaxere"] },
      { name: "Luz", slug: "luz-lagos", nearby: ["lagos-centro", "bensafrim"] },
      { name: "Odiáxere", slug: "odiaxere", nearby: ["lagos-centro", "bensafrim"] },
      { name: "Bensafrim e Barão de São João", slug: "bensafrim", nearby: ["luz-lagos", "odiaxere"] },
    ],
  },
  {
    name: "Vila Real de Santo António", slug: "vila-real-de-santo-antonio",
    freguesias: [
      { name: "Vila Real de Santo António", slug: "vila-real-de-santo-antonio-centro", nearby: ["monte-gordo"] },
      { name: "Monte Gordo", slug: "monte-gordo", nearby: ["vila-real-de-santo-antonio-centro"] },
    ],
  },
  {
    name: "Castro Marim", slug: "castro-marim",
    freguesias: [
      { name: "Castro Marim", slug: "castro-marim-centro", nearby: ["odeleite", "azinhal"] },
      { name: "Odeleite", slug: "odeleite", nearby: ["castro-marim-centro"] },
      { name: "Azinhal", slug: "azinhal", nearby: ["castro-marim-centro"] },
    ],
  },
  {
    name: "Monchique", slug: "monchique",
    freguesias: [
      { name: "Monchique", slug: "monchique-centro", nearby: ["alferce", "marmelete"] },
      { name: "Alferce", slug: "alferce", nearby: ["monchique-centro"] },
      { name: "Marmelete", slug: "marmelete", nearby: ["monchique-centro"] },
    ],
  },
  {
    name: "Aljezur", slug: "aljezur",
    freguesias: [
      { name: "Aljezur", slug: "aljezur-centro", nearby: ["bordeira", "odeceixe"] },
      { name: "Bordeira", slug: "bordeira", nearby: ["aljezur-centro", "rogil"] },
      { name: "Odeceixe", slug: "odeceixe", nearby: ["aljezur-centro"] },
      { name: "Rogil", slug: "rogil", nearby: ["bordeira"] },
    ],
  },
  {
    name: "Vila do Bispo", slug: "vila-do-bispo",
    freguesias: [
      { name: "Vila do Bispo e Raposeira", slug: "vila-do-bispo-centro", nearby: ["sagres", "budens"] },
      { name: "Budens", slug: "budens", nearby: ["vila-do-bispo-centro"] },
      { name: "Sagres", slug: "sagres", nearby: ["vila-do-bispo-centro"] },
    ],
  },
  {
    name: "Alcoutim", slug: "alcoutim",
    freguesias: [
      { name: "Alcoutim e Pereiro", slug: "alcoutim-centro", nearby: ["gioes", "martim-longo"] },
      { name: "Giões", slug: "gioes", nearby: ["alcoutim-centro"] },
      { name: "Martim Longo", slug: "martim-longo", nearby: ["vaqueiros", "alcoutim-centro"] },
      { name: "Vaqueiros", slug: "vaqueiros", nearby: ["martim-longo"] },
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
