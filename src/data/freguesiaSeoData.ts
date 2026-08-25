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
  // ─── Braga / Norte (expansão 2026-08-25, equipa local nova) ───
  // Verificado contra pt.wikipedia.org "Lista de freguesias de Braga" + cm-braga.pt —
  // 37 freguesias, inalterado desde a Lei 11-A/2013 (confirmado: zero menções de
  // Braga na Lei 25-A/2025, que só afetou outros concelhos do distrito).
  {
    name: "Braga", slug: "braga",
    freguesias: [
      { name: "Adaúfe", slug: "adaufe", nearby: ["lamas", "cabreiros-e-passos-sao-juliao", "tebosa"] },
      { name: "Braga (São Vicente)", slug: "braga-sao-vicente", nearby: ["braga-sao-vitor", "braga-maximinos-se-e-cividade", "gualtar"] },
      { name: "Braga (São Vítor)", slug: "braga-sao-vitor", nearby: ["braga-sao-vicente", "braga-sao-jose-de-sao-lazaro-e-sao-joao-do-souto", "nogueiro-e-tenoes"] },
      { name: "Espinho", slug: "espinho-braga", nearby: ["lomar-e-arcos", "ferreiros-e-gondizalves", "este-sao-pedro-e-sao-mamede"] },
      { name: "Esporões", slug: "esporoes", nearby: ["sobreposta", "guisande-e-oliveira", "escudeiros-e-penso"] },
      { name: "Figueiredo", slug: "figueiredo-braga", nearby: ["arentim-e-cunha", "morreira-e-trandeiras", "vilaca-e-fradelos"] },
      { name: "Gualtar", slug: "gualtar", nearby: ["braga-sao-vicente", "nogueiro-e-tenoes", "real-dume-e-semelhe"] },
      { name: "Lamas", slug: "lamas", nearby: ["ruilhe", "cabreiros-e-passos-sao-juliao", "adaufe"] },
      { name: "Mire de Tibães", slug: "mire-de-tibaes", nearby: ["braga-maximinos-se-e-cividade", "padim-da-graca", "palmeira"] },
      { name: "Padim da Graça", slug: "padim-da-graca", nearby: ["mire-de-tibaes", "sequeira", "ruilhe"] },
      { name: "Palmeira", slug: "palmeira", nearby: ["mire-de-tibaes", "merelim-sao-pedro-e-frossos", "priscos"] },
      { name: "Pedralva", slug: "pedralva", nearby: ["priscos", "palmeira", "tadim"] },
      { name: "Priscos", slug: "priscos", nearby: ["palmeira", "merelim-sao-pedro-e-frossos", "pedralva"] },
      { name: "Ruilhe", slug: "ruilhe", nearby: ["sequeira", "padim-da-graca", "lamas"] },
      { name: "Sequeira", slug: "sequeira", nearby: ["padim-da-graca", "ruilhe", "cabreiros-e-passos-sao-juliao"] },
      { name: "Sobreposta", slug: "sobreposta", nearby: ["tebosa", "guisande-e-oliveira", "esporoes"] },
      { name: "Tadim", slug: "tadim", nearby: ["este-sao-pedro-e-sao-mamede", "santa-lucrecia-de-algeriz-e-navarra", "pedralva"] },
      { name: "Tebosa", slug: "tebosa", nearby: ["adaufe", "sobreposta", "guisande-e-oliveira"] },
      { name: "Arentim e Cunha", slug: "arentim-e-cunha", nearby: ["morreira-e-trandeiras", "figueiredo-braga", "celeiros-aveleda-e-vimieiro"] },
      { name: "Braga (Maximinos, Sé e Cividade)", slug: "braga-maximinos-se-e-cividade", nearby: ["braga-sao-vicente", "mire-de-tibaes", "braga-sao-jose-de-sao-lazaro-e-sao-joao-do-souto"] },
      { name: "Braga (São José de São Lázaro e São João do Souto)", slug: "braga-sao-jose-de-sao-lazaro-e-sao-joao-do-souto", nearby: ["braga-sao-vitor", "braga-maximinos-se-e-cividade", "nogueira-fraiao-e-lamacaes"] },
      { name: "Cabreiros e Passos (São Julião)", slug: "cabreiros-e-passos-sao-juliao", nearby: ["sequeira", "lamas", "adaufe"] },
      { name: "Celeirós, Aveleda e Vimieiro", slug: "celeiros-aveleda-e-vimieiro", nearby: ["arentim-e-cunha", "vilaca-e-fradelos", "cabreiros-e-passos-sao-juliao"] },
      { name: "Crespos e Pousada", slug: "crespos-e-pousada", nearby: ["escudeiros-e-penso", "merelim-sao-paio-panoias-e-parada-de-tibaes", "palmeira"] },
      { name: "Escudeiros e Penso (Santo Estêvão e São Vicente)", slug: "escudeiros-e-penso", nearby: ["esporoes", "crespos-e-pousada", "merelim-sao-paio-panoias-e-parada-de-tibaes"] },
      { name: "Este (São Pedro e São Mamede)", slug: "este-sao-pedro-e-sao-mamede", nearby: ["nogueiro-e-tenoes", "espinho-braga", "tadim"] },
      { name: "Ferreiros e Gondizalves", slug: "ferreiros-e-gondizalves", nearby: ["nogueira-fraiao-e-lamacaes", "espinho-braga", "lomar-e-arcos"] },
      { name: "Guisande e Oliveira (São Pedro)", slug: "guisande-e-oliveira", nearby: ["tebosa", "sobreposta", "esporoes"] },
      { name: "Lomar e Arcos", slug: "lomar-e-arcos", nearby: ["real-dume-e-semelhe", "ferreiros-e-gondizalves", "espinho-braga"] },
      { name: "Merelim (São Paio), Panóias e Parada de Tibães", slug: "merelim-sao-paio-panoias-e-parada-de-tibaes", nearby: ["crespos-e-pousada", "escudeiros-e-penso", "merelim-sao-pedro-e-frossos"] },
      { name: "Merelim (São Pedro) e Frossos", slug: "merelim-sao-pedro-e-frossos", nearby: ["merelim-sao-paio-panoias-e-parada-de-tibaes", "palmeira", "priscos"] },
      { name: "Morreira e Trandeiras", slug: "morreira-e-trandeiras", nearby: ["santa-lucrecia-de-algeriz-e-navarra", "arentim-e-cunha", "figueiredo-braga"] },
      { name: "Nogueira, Fraião e Lamaçães", slug: "nogueira-fraiao-e-lamacaes", nearby: ["braga-sao-jose-de-sao-lazaro-e-sao-joao-do-souto", "ferreiros-e-gondizalves", "espinho-braga"] },
      { name: "Nogueiró e Tenões", slug: "nogueiro-e-tenoes", nearby: ["gualtar", "braga-sao-vitor", "este-sao-pedro-e-sao-mamede"] },
      { name: "Real, Dume e Semelhe", slug: "real-dume-e-semelhe", nearby: ["gualtar", "lomar-e-arcos", "santa-lucrecia-de-algeriz-e-navarra"] },
      { name: "Santa Lucrécia de Algeriz e Navarra", slug: "santa-lucrecia-de-algeriz-e-navarra", nearby: ["tadim", "real-dume-e-semelhe", "morreira-e-trandeiras"] },
      { name: "Vilaça e Fradelos", slug: "vilaca-e-fradelos", nearby: ["figueiredo-braga", "celeiros-aveleda-e-vimieiro", "morreira-e-trandeiras"] },
    ],
  },
  // Verificado contra a Lei n.º 25-A/2025 (texto oficial), cm-guimaraes.pt/municipio/freguesias
  // e geoapi.pt (dados CAOP/DGT) — 55 freguesias, SUBIU de 48 (padrão pós-2013) por causa
  // de 6 uniões desagregadas em 13 novas freguesias autónomas desde as autárquicas de
  // outubro de 2025: prazins-santo-tirso, corvite, tabuadelo, sao-faustino,
  // airao-santa-maria, airao-sao-joao, vermil, conde, gandarela, sande-vila-nova,
  // sande-sao-clemente, serzedo, calvos.
  {
    name: "Guimarães", slug: "guimaraes",
    freguesias: [
      { name: "Airão (Santa Maria)", slug: "airao-santa-maria", nearby: ["lordelo", "airao-sao-joao", "vermil"] },
      { name: "Airão (São João)", slug: "airao-sao-joao", nearby: ["airao-santa-maria", "vermil", "brito"] },
      { name: "Aldão", slug: "aldao", nearby: ["caldelas", "mesao-frio", "pinheiro"] },
      { name: "Azurém", slug: "azurem", nearby: ["costa", "creixomil", "urgezes"] },
      { name: "Barco", slug: "barco", nearby: ["moreira-de-conegos", "serzedelo", "prazins-santo-tirso"] },
      { name: "Brito", slug: "brito", nearby: ["airao-sao-joao", "vermil", "mesao-frio"] },
      { name: "Caldelas", slug: "caldelas", nearby: ["mesao-frio", "aldao", "pinheiro"] },
      { name: "Calvos", slug: "calvos", nearby: ["conde", "gandarela", "serzedo"] },
      { name: "Candoso (São Martinho)", slug: "candoso-sao-martinho", nearby: ["urgezes", "candoso-santiago-e-mascotelos", "selho-sao-cristovao"] },
      { name: "Conde", slug: "conde", nearby: ["pinheiro", "gandarela", "calvos"] },
      { name: "Corvite", slug: "corvite", nearby: ["prazins-santo-tirso", "prazins-santa-eufemia", "arosa-e-casteloes"] },
      { name: "Costa", slug: "costa-guimaraes", nearby: ["azurem", "creixomil", "ponte"] },
      { name: "Creixomil", slug: "creixomil", nearby: ["costa-guimaraes", "azurem", "fermentoes"] },
      { name: "Fermentões", slug: "fermentoes", nearby: ["creixomil", "selho-sao-jorge", "infantas"] },
      { name: "Gandarela", slug: "gandarela", nearby: ["conde", "calvos", "sande-sao-clemente"] },
      { name: "Gondar", slug: "gondar", nearby: ["gonca", "longos", "lordelo"] },
      { name: "Gonça", slug: "gonca", nearby: ["infantas", "gondar", "longos"] },
      { name: "Guardizela", slug: "guardizela", nearby: ["candoso-santiago-e-mascotelos", "selho-sao-lourenco-e-gominhaes", "sande-sao-lourenco-e-balazar"] },
      { name: "Infantas", slug: "infantas", nearby: ["ponte", "fermentoes", "gonca"] },
      { name: "Longos", slug: "longos", nearby: ["gondar", "gonca", "lordelo"] },
      { name: "Lordelo", slug: "lordelo", nearby: ["longos", "gondar", "airao-santa-maria"] },
      { name: "Mesão Frio", slug: "mesao-frio", nearby: ["brito", "caldelas", "aldao"] },
      { name: "Moreira de Cónegos", slug: "moreira-de-conegos", nearby: ["serzedelo", "silvares", "barco"] },
      { name: "Nespereira", slug: "nespereira", nearby: ["sao-faustino", "oliveira-sao-paio-e-sao-sebastiao", "pencelo"] },
      { name: "Pencelo", slug: "pencelo", nearby: ["nespereira", "ronfe", "polvoreira"] },
      { name: "Pinheiro", slug: "pinheiro-guimaraes", nearby: ["aldao", "caldelas", "conde"] },
      { name: "Polvoreira", slug: "polvoreira", nearby: ["ronfe", "sao-torcato", "pencelo"] },
      { name: "Ponte", slug: "ponte", nearby: ["costa-guimaraes", "urgezes", "infantas"] },
      { name: "Prazins (Santa Eufémia)", slug: "prazins-santa-eufemia", nearby: ["silvares", "prazins-santo-tirso", "corvite"] },
      { name: "Prazins (Santo Tirso)", slug: "prazins-santo-tirso", nearby: ["prazins-santa-eufemia", "corvite", "barco"] },
      { name: "Ronfe", slug: "ronfe", nearby: ["sao-torcato", "polvoreira", "pencelo"] },
      { name: "Sande (São Clemente)", slug: "sande-sao-clemente", nearby: ["gandarela", "sande-sao-martinho", "sande-vila-nova"] },
      { name: "Sande (São Martinho)", slug: "sande-sao-martinho", nearby: ["calvos", "sande-sao-clemente", "sande-vila-nova"] },
      { name: "Sande (Vila Nova)", slug: "sande-vila-nova", nearby: ["sande-sao-clemente", "sande-sao-martinho", "sande-sao-lourenco-e-balazar"] },
      { name: "Selho (São Cristóvão)", slug: "selho-sao-cristovao", nearby: ["candoso-sao-martinho", "selho-sao-jorge", "selho-sao-lourenco-e-gominhaes"] },
      { name: "Selho (São Jorge)", slug: "selho-sao-jorge", nearby: ["selho-sao-cristovao", "fermentoes", "selho-sao-lourenco-e-gominhaes"] },
      { name: "Serzedelo", slug: "serzedelo", nearby: ["moreira-de-conegos", "silvares", "barco"] },
      { name: "Serzedo", slug: "serzedo", nearby: ["calvos", "conde", "gandarela"] },
      { name: "Silvares", slug: "silvares", nearby: ["moreira-de-conegos", "serzedelo", "prazins-santa-eufemia"] },
      { name: "São Faustino", slug: "sao-faustino", nearby: ["tabuadelo", "oliveira-sao-paio-e-sao-sebastiao", "nespereira"] },
      { name: "São Torcato", slug: "sao-torcato", nearby: ["ronfe", "polvoreira", "briteiros-santo-estevao-e-donim"] },
      { name: "Tabuadelo", slug: "tabuadelo", nearby: ["arosa-e-casteloes", "sao-faustino", "oliveira-sao-paio-e-sao-sebastiao"] },
      { name: "Urgezes", slug: "urgezes", nearby: ["azurem", "ponte", "candoso-sao-martinho"] },
      { name: "Vermil", slug: "vermil", nearby: ["airao-santa-maria", "airao-sao-joao", "brito"] },
      { name: "Abação e Gémeos", slug: "abacao-e-gemeos", nearby: ["briteiros-santo-estevao-e-donim", "briteiros-sao-salvador-e-briteiros-santa-leocadia", "ataes-e-rendufe"] },
      { name: "Arosa e Castelões", slug: "arosa-e-casteloes", nearby: ["corvite", "sande-sao-lourenco-e-balazar", "tabuadelo"] },
      { name: "Atães e Rendufe", slug: "ataes-e-rendufe", nearby: ["briteiros-sao-salvador-e-briteiros-santa-leocadia", "abacao-e-gemeos", "leitoes-oleiros-e-figueiredo"] },
      { name: "Briteiros (Santo Estêvão) e Donim", slug: "briteiros-santo-estevao-e-donim", nearby: ["sao-torcato", "briteiros-sao-salvador-e-briteiros-santa-leocadia", "abacao-e-gemeos"] },
      { name: "Briteiros (São Salvador) e Briteiros (Santa Leocádia)", slug: "briteiros-sao-salvador-e-briteiros-santa-leocadia", nearby: ["briteiros-santo-estevao-e-donim", "abacao-e-gemeos", "ataes-e-rendufe"] },
      { name: "Candoso Santiago e Mascotelos", slug: "candoso-santiago-e-mascotelos", nearby: ["candoso-sao-martinho", "selho-sao-jorge", "guardizela"] },
      { name: "Leitões, Oleiros e Figueiredo", slug: "leitoes-oleiros-e-figueiredo", nearby: ["ataes-e-rendufe", "souto-santa-maria-souto-sao-salvador-e-gondomar", "gonca"] },
      { name: "Oliveira, São Paio e São Sebastião", slug: "oliveira-sao-paio-e-sao-sebastiao", nearby: ["sao-faustino", "tabuadelo", "nespereira"] },
      { name: "Sande (São Lourenço) e Balazar", slug: "sande-sao-lourenco-e-balazar", nearby: ["sande-vila-nova", "guardizela", "arosa-e-casteloes"] },
      { name: "Selho (São Lourenço) e Gominhães", slug: "selho-sao-lourenco-e-gominhaes", nearby: ["selho-sao-jorge", "selho-sao-cristovao", "guardizela"] },
      { name: "Souto (Santa Maria), Souto (São Salvador) e Gondomar", slug: "souto-santa-maria-souto-sao-salvador-e-gondomar", nearby: ["leitoes-oleiros-e-figueiredo", "ataes-e-rendufe", "gondar"] },
    ],
  },
  // Verificado contra a Lei n.º 25-A/2025 (texto oficial, PDF do Diário da República) +
  // geoapi.pt (CAOP/DGT) + aldeiasportuguesas.pt — 39 freguesias, SUBIU de 34 (padrão
  // pós-2013) por causa de 4 uniões desagregadas em 9 novas freguesias desde as
  // autárquicas de outubro de 2025: ruivaes, novais, gondifelos, cavaloes, outiz,
  // esmeriz, cabecudos, avidos, lagoa-famalicao. Wikipédia estava desatualizada
  // (ainda mostrava 34) — não usada como fonte única.
  {
    name: "Vila Nova de Famalicão", slug: "vila-nova-de-famalicao",
    freguesias: [
      { name: "Antas e Abade de Vermoim", slug: "antas-e-abade-de-vermoim", nearby: ["vermoim-famalicao", "cruz", "bairro"] },
      { name: "Arnoso (Santa Maria e Santa Eulália) e Sezures", slug: "arnoso-santa-maria-e-santa-eulalia-e-sezures", nearby: ["ribeirao", "carreira-e-bente", "mogege"] },
      { name: "Avidos", slug: "avidos", nearby: ["lagoa-famalicao", "gondifelos", "cavaloes", "pedome"] },
      { name: "Bairro", slug: "bairro", nearby: ["cruz", "fradelos", "brufe", "antas-e-abade-de-vermoim"] },
      { name: "Brufe", slug: "brufe", nearby: ["bairro", "gaviao", "vale-sao-martinho"] },
      { name: "Cabeçudos", slug: "cabecudos", nearby: ["esmeriz", "avidos", "lagoa-famalicao"] },
      { name: "Carreira e Bente", slug: "carreira-e-bente", nearby: ["arnoso-santa-maria-e-santa-eulalia-e-sezures", "ribeirao"] },
      { name: "Castelões", slug: "casteloes", nearby: ["joane", "seide", "nine", "vila-nova-de-famalicao-e-calendario"] },
      { name: "Cavalões", slug: "cavaloes", nearby: ["gondifelos", "outiz", "avidos"] },
      { name: "Cruz", slug: "cruz", nearby: ["fradelos", "bairro", "antas-e-abade-de-vermoim"] },
      { name: "Delães", slug: "delaes", nearby: ["riba-de-ave", "joane", "oliveira-sao-mateus"] },
      { name: "Esmeriz", slug: "esmeriz", nearby: ["cabecudos", "riba-de-ave", "oliveira-sao-mateus"] },
      { name: "Fradelos", slug: "fradelos", nearby: ["louro", "cruz", "bairro"] },
      { name: "Gavião", slug: "gaviao", nearby: ["brufe", "vale-sao-martinho", "vale-sao-cosme-telhado-e-portela"] },
      { name: "Gondifelos", slug: "gondifelos", nearby: ["cavaloes", "outiz", "seide", "mogege"] },
      { name: "Joane", slug: "joane", nearby: ["delaes", "seide", "casteloes"] },
      { name: "Lagoa", slug: "lagoa-famalicao", nearby: ["avidos", "cabecudos", "pedome"] },
      { name: "Landim", slug: "landim", nearby: ["lousado", "requiao", "vilarinho-das-cambas", "pousada-de-saramagos"] },
      { name: "Lemenhe, Mouquim e Jesufrei", slug: "lemenhe-mouquim-e-jesufrei", nearby: ["lousado", "requiao", "ruivaes", "novais"] },
      { name: "Louro", slug: "louro", nearby: ["nine", "fradelos"] },
      { name: "Lousado", slug: "lousado", nearby: ["requiao", "landim", "lemenhe-mouquim-e-jesufrei"] },
      { name: "Mogege", slug: "mogege", nearby: ["seide", "ribeirao", "gondifelos", "arnoso-santa-maria-e-santa-eulalia-e-sezures"] },
      { name: "Nine", slug: "nine", nearby: ["casteloes", "pedome", "louro", "vila-nova-de-famalicao-e-calendario"] },
      { name: "Novais", slug: "novais", nearby: ["ruivaes", "lemenhe-mouquim-e-jesufrei"] },
      { name: "Oliveira (Santa Maria)", slug: "oliveira-santa-maria", nearby: ["oliveira-sao-mateus", "riba-de-ave", "vila-nova-de-famalicao-e-calendario"] },
      { name: "Oliveira (São Mateus)", slug: "oliveira-sao-mateus", nearby: ["oliveira-santa-maria", "delaes", "esmeriz"] },
      { name: "Outiz", slug: "outiz", nearby: ["gondifelos", "cavaloes", "avidos"] },
      { name: "Pedome", slug: "pedome", nearby: ["nine", "avidos", "lagoa-famalicao"] },
      { name: "Pousada de Saramagos", slug: "pousada-de-saramagos", nearby: ["vilarinho-das-cambas", "landim"] },
      { name: "Requião", slug: "requiao", nearby: ["lousado", "landim", "lemenhe-mouquim-e-jesufrei"] },
      { name: "Riba de Ave", slug: "riba-de-ave", nearby: ["delaes", "esmeriz", "oliveira-santa-maria"] },
      { name: "Ribeirão", slug: "ribeirao", nearby: ["vale-sao-cosme-telhado-e-portela", "vermoim-famalicao", "arnoso-santa-maria-e-santa-eulalia-e-sezures", "carreira-e-bente"] },
      { name: "Ruivães", slug: "ruivaes", nearby: ["novais", "lemenhe-mouquim-e-jesufrei"] },
      { name: "Seide", slug: "seide", nearby: ["joane", "casteloes", "mogege", "gondifelos"] },
      { name: "Vale (São Cosme), Telhado e Portela", slug: "vale-sao-cosme-telhado-e-portela", nearby: ["gaviao", "vale-sao-martinho", "ribeirao"] },
      { name: "Vale (São Martinho)", slug: "vale-sao-martinho", nearby: ["gaviao", "brufe", "vale-sao-cosme-telhado-e-portela"] },
      { name: "Vermoim", slug: "vermoim-famalicao", nearby: ["antas-e-abade-de-vermoim", "vila-nova-de-famalicao-e-calendario", "ribeirao"] },
      { name: "Vila Nova de Famalicão e Calendário", slug: "vila-nova-de-famalicao-e-calendario", nearby: ["antas-e-abade-de-vermoim", "cruz", "casteloes", "oliveira-santa-maria"] },
      { name: "Vilarinho das Cambas", slug: "vilarinho-das-cambas", nearby: ["landim", "pousada-de-saramagos"] },
    ],
  },
  // Verificado contra a Lei n.º 25-A/2025 (texto oficial) + geoapi.pt/CAOP + cm-barcelos.pt
  // ("1-20 of 65 results") — 65 freguesias, SUBIU de 61 (padrão pós-2013) por causa de 2
  // uniões desagregadas em 6 novas freguesias desde as autárquicas de outubro de 2025:
  // barcelos, vila-boa, vila-frescainha-sao-martinho, vila-frescainha-sao-pedro,
  // silveiros, rio-covo-santa-eulalia. Colisão de slug: "arcozelo" já existe em Vila
  // Nova de Gaia → sufixo "-barcelos". Nota: a freguesia-sede "Barcelos" tem slug igual
  // ao do concelho ("barcelos") — confirmado seguro, as rotas usam igualdade exata de
  // "{service}-{municipioSlug}-{freguesiaSlug}" (FreguesiaServicePage.tsx), não há
  // lookup global só por slug de freguesia.
  {
    name: "Barcelos", slug: "barcelos",
    freguesias: [
      { name: "Abade de Neiva", slug: "abade-de-neiva", nearby: ["aborim", "roriz", "manhente"] },
      { name: "Aborim", slug: "aborim", nearby: ["abade-de-neiva", "roriz", "alvelos"] },
      { name: "Adães", slug: "adaes", nearby: ["airo", "aldreu", "martim"] },
      { name: "Airó", slug: "airo", nearby: ["adaes", "aldreu", "ucha"] },
      { name: "Aldreu", slug: "aldreu", nearby: ["airo", "adaes", "durraes-e-tregosa"] },
      { name: "Alheira e Igreja Nova", slug: "alheira-e-igreja-nova", nearby: ["gilmonde", "palme", "moure"] },
      { name: "Alvelos", slug: "alvelos", nearby: ["aborim", "balugaes", "carapecos"] },
      { name: "Alvito (São Pedro e São Martinho) e Couto", slug: "alvito-sao-pedro-e-sao-martinho-e-couto", nearby: ["carreira-e-fonte-coberta", "chorente-goios-courel-pedra-furada-e-gueral", "cambeses"] },
      { name: "Arcozelo", slug: "arcozelo-barcelos", nearby: ["barcelos", "carvalhal", "vila-cova-e-feitos"] },
      { name: "Areias", slug: "areias", nearby: ["panque", "fragoso", "perelhal"] },
      { name: "Areias de Vilar e Encourados", slug: "areias-de-vilar-e-encourados", nearby: ["campo-e-tamel-sao-pedro-fins", "remelhe", "pousa"] },
      { name: "Balugães", slug: "balugaes", nearby: ["alvelos", "carapecos", "cristelo"] },
      { name: "Barcelinhos", slug: "barcelinhos", nearby: ["barcelos", "manhente", "roriz"] },
      { name: "Barcelos", slug: "barcelos", nearby: ["barcelinhos", "vila-boa", "vila-frescainha-sao-martinho", "arcozelo-barcelos"] },
      { name: "Barqueiros", slug: "barqueiros", nearby: ["macieira-de-rates", "lijo", "galegos-santa-maria"] },
      { name: "Cambeses", slug: "cambeses", nearby: ["alvito-sao-pedro-e-sao-martinho-e-couto", "tamel-sao-verissimo", "moure"] },
      { name: "Campo e Tamel (São Pedro Fins)", slug: "campo-e-tamel-sao-pedro-fins", nearby: ["areias-de-vilar-e-encourados", "remelhe", "cossourado"] },
      { name: "Carapeços", slug: "carapecos", nearby: ["balugaes", "alvelos", "negreiros-e-chavao"] },
      { name: "Carreira e Fonte Coberta", slug: "carreira-e-fonte-coberta", nearby: ["alvito-sao-pedro-e-sao-martinho-e-couto", "chorente-goios-courel-pedra-furada-e-gueral", "sequeade-e-bastuco-sao-joao-e-santo-estevao"] },
      { name: "Carvalhal", slug: "carvalhal", nearby: ["arcozelo-barcelos", "vila-cova-e-feitos", "silva"] },
      { name: "Carvalhas", slug: "carvalhas", nearby: ["silva", "lama", "carvalhal"] },
      { name: "Chorente, Góios, Courel, Pedra Furada e Gueral", slug: "chorente-goios-courel-pedra-furada-e-gueral", nearby: ["alvito-sao-pedro-e-sao-martinho-e-couto", "carreira-e-fonte-coberta", "creixomil-e-mariz"] },
      { name: "Cossourado", slug: "cossourado", nearby: ["campo-e-tamel-sao-pedro-fins", "pousa", "viatodos-grimancelos-minhotaes-e-monte-de-fralaes"] },
      { name: "Creixomil e Mariz", slug: "creixomil-e-mariz", nearby: ["chorente-goios-courel-pedra-furada-e-gueral", "sequeade-e-bastuco-sao-joao-e-santo-estevao", "tamel-santa-leocadia-e-vilar-do-monte"] },
      { name: "Cristelo", slug: "cristelo", nearby: ["balugaes", "quintiaes-e-aguiar", "durraes-e-tregosa"] },
      { name: "Durrães e Tregosa", slug: "durraes-e-tregosa", nearby: ["aldreu", "cristelo", "ucha"] },
      { name: "Fornelos", slug: "fornelos", nearby: ["galegos-santa-maria", "galegos-sao-martinho", "macieira-de-rates"] },
      { name: "Fragoso", slug: "fragoso", nearby: ["areias", "perelhal", "silva"] },
      { name: "Galegos (Santa Maria)", slug: "galegos-santa-maria", nearby: ["fornelos", "galegos-sao-martinho", "barqueiros"] },
      { name: "Galegos (São Martinho)", slug: "galegos-sao-martinho", nearby: ["galegos-santa-maria", "fornelos", "gamil-e-midoes"] },
      { name: "Gamil e Midões", slug: "gamil-e-midoes", nearby: ["galegos-sao-martinho", "lijo", "rio-covo-santa-eugenia"] },
      { name: "Gilmonde", slug: "gilmonde", nearby: ["alheira-e-igreja-nova", "palme", "oliveira"] },
      { name: "Lama", slug: "lama", nearby: ["panque", "silva", "carvalhas"] },
      { name: "Lijó", slug: "lijo", nearby: ["gamil-e-midoes", "barqueiros", "macieira-de-rates"] },
      { name: "Macieira de Rates", slug: "macieira-de-rates", nearby: ["barqueiros", "lijo", "fornelos"] },
      { name: "Manhente", slug: "manhente", nearby: ["abade-de-neiva", "roriz", "barcelinhos"] },
      { name: "Martim", slug: "martim", nearby: ["adaes", "pereira", "negreiros-e-chavao"] },
      { name: "Milhazes, Vilar de Figos e Faria", slug: "milhazes-vilar-de-figos-e-faria", nearby: ["vila-cova-e-feitos", "palme", "moure"] },
      { name: "Moure", slug: "moure", nearby: ["alheira-e-igreja-nova", "cambeses", "milhazes-vilar-de-figos-e-faria"] },
      { name: "Negreiros e Chavão", slug: "negreiros-e-chavao", nearby: ["carapecos", "martim", "pereira"] },
      { name: "Oliveira", slug: "oliveira", nearby: ["gilmonde", "paradela", "palme"] },
      { name: "Palme", slug: "palme", nearby: ["alheira-e-igreja-nova", "gilmonde", "milhazes-vilar-de-figos-e-faria"] },
      { name: "Panque", slug: "panque", nearby: ["areias", "silva", "lama"] },
      { name: "Paradela", slug: "paradela", nearby: ["oliveira", "varzea", "vila-seca"] },
      { name: "Pereira", slug: "pereira", nearby: ["martim", "negreiros-e-chavao", "quintiaes-e-aguiar"] },
      { name: "Perelhal", slug: "perelhal", nearby: ["fragoso", "areias", "silva"] },
      { name: "Pousa", slug: "pousa", nearby: ["areias-de-vilar-e-encourados", "cossourado", "viatodos-grimancelos-minhotaes-e-monte-de-fralaes"] },
      { name: "Quintiães e Aguiar", slug: "quintiaes-e-aguiar", nearby: ["cristelo", "pereira", "durraes-e-tregosa"] },
      { name: "Remelhe", slug: "remelhe", nearby: ["areias-de-vilar-e-encourados", "campo-e-tamel-sao-pedro-fins", "silveiros"] },
      { name: "Rio Covo (Santa Eugénia)", slug: "rio-covo-santa-eugenia", nearby: ["rio-covo-santa-eulalia", "gamil-e-midoes", "silveiros"] },
      { name: "Rio Covo (Santa Eulália)", slug: "rio-covo-santa-eulalia", nearby: ["rio-covo-santa-eugenia", "silveiros", "remelhe"] },
      { name: "Roriz", slug: "roriz", nearby: ["abade-de-neiva", "manhente", "aborim"] },
      { name: "Sequeade e Bastuço (São João e Santo Estêvão)", slug: "sequeade-e-bastuco-sao-joao-e-santo-estevao", nearby: ["creixomil-e-mariz", "carreira-e-fonte-coberta", "tamel-santa-leocadia-e-vilar-do-monte"] },
      { name: "Silva", slug: "silva", nearby: ["lama", "carvalhal", "perelhal", "fragoso"] },
      { name: "Silveiros", slug: "silveiros", nearby: ["rio-covo-santa-eulalia", "rio-covo-santa-eugenia", "remelhe"] },
      { name: "Tamel (Santa Leocádia) e Vilar do Monte", slug: "tamel-santa-leocadia-e-vilar-do-monte", nearby: ["creixomil-e-mariz", "sequeade-e-bastuco-sao-joao-e-santo-estevao", "tamel-sao-verissimo"] },
      { name: "Tamel (São Veríssimo)", slug: "tamel-sao-verissimo", nearby: ["cambeses", "tamel-santa-leocadia-e-vilar-do-monte", "moure"] },
      { name: "Ucha", slug: "ucha", nearby: ["airo", "durraes-e-tregosa", "aldreu"] },
      { name: "Várzea", slug: "varzea", nearby: ["paradela", "vila-seca", "oliveira"] },
      { name: "Viatodos, Grimancelos, Minhotães e Monte de Fralães", slug: "viatodos-grimancelos-minhotaes-e-monte-de-fralaes", nearby: ["cossourado", "pousa", "campo-e-tamel-sao-pedro-fins"] },
      { name: "Vila Boa", slug: "vila-boa", nearby: ["barcelos", "vila-frescainha-sao-pedro", "vila-frescainha-sao-martinho"] },
      { name: "Vila Cova e Feitos", slug: "vila-cova-e-feitos", nearby: ["arcozelo-barcelos", "carvalhal", "milhazes-vilar-de-figos-e-faria"] },
      { name: "Vila Frescainha (São Martinho)", slug: "vila-frescainha-sao-martinho", nearby: ["barcelos", "vila-boa", "vila-frescainha-sao-pedro"] },
      { name: "Vila Frescainha (São Pedro)", slug: "vila-frescainha-sao-pedro", nearby: ["vila-frescainha-sao-martinho", "vila-boa", "barcelos"] },
      { name: "Vila Seca", slug: "vila-seca", nearby: ["paradela", "varzea", "oliveira"] },
    ],
  },
  // Verificado contra a Lei n.º 25-A/2025 (texto oficial) + geoapi.pt/CAOP (endpoint
  // JSON) + cm-viana-castelo.pt/institucional/juntas-de-freguesia — 30 freguesias,
  // SUBIU de 27 (padrão pós-2013) por causa de 3 uniões desagregadas em 6 novas
  // freguesias desde as autárquicas de outubro de 2025: barroselas, carvoeiro,
  // mazarefes, vila-fria, cardielos, serreleis. Wikipédia ainda mostrava 27 —
  // desatualizada, não usada como fonte única. Nome oficial "Vila Nova de Anha"
  // (não só "Anha") confirmado via código INE 160904. Zero colisões de slug.
  {
    name: "Viana do Castelo", slug: "viana-do-castelo",
    freguesias: [
      { name: "Afife", slug: "afife", nearby: ["carreco", "freixieiro-de-soutelo"] },
      { name: "Alvarães", slug: "alvaraes", nearby: ["sao-romao-de-neiva", "vila-fria", "vila-de-punhe"] },
      { name: "Amonde", slug: "amonde", nearby: ["montaria", "outeiro", "nogueira-meixedo-e-vilar-de-murteda"] },
      { name: "Vila Nova de Anha", slug: "vila-nova-de-anha", nearby: ["darque", "chafe", "vila-fria"] },
      { name: "Areosa", slug: "areosa", nearby: ["carreco", "perre", "viana-do-castelo-santa-maria-maior-e-monserrate-e-meadela"] },
      { name: "Barroselas", slug: "barroselas", nearby: ["carvoeiro", "mujaes", "vila-fria"] },
      { name: "Cardielos", slug: "cardielos", nearby: ["serreleis", "torre-e-vila-mou", "santa-marta-de-portuzelo"] },
      { name: "Carreço", slug: "carreco", nearby: ["afife", "areosa", "outeiro"] },
      { name: "Carvoeiro", slug: "carvoeiro", nearby: ["barroselas", "mujaes"] },
      { name: "Castelo do Neiva", slug: "castelo-do-neiva", nearby: ["sao-romao-de-neiva", "chafe"] },
      { name: "Chafé", slug: "chafe", nearby: ["castelo-do-neiva", "sao-romao-de-neiva", "vila-nova-de-anha"] },
      { name: "Darque", slug: "darque", nearby: ["viana-do-castelo-santa-maria-maior-e-monserrate-e-meadela", "vila-nova-de-anha", "subportela-deocriste-e-portela-susa"] },
      { name: "Freixieiro de Soutelo", slug: "freixieiro-de-soutelo", nearby: ["afife", "outeiro", "amonde"] },
      { name: "Lanheses", slug: "lanheses", nearby: ["torre-e-vila-mou", "nogueira-meixedo-e-vilar-de-murteda"] },
      { name: "Mazarefes", slug: "mazarefes", nearby: ["vila-fria", "subportela-deocriste-e-portela-susa", "darque"] },
      { name: "Montaria", slug: "montaria", nearby: ["amonde", "nogueira-meixedo-e-vilar-de-murteda"] },
      { name: "Mujães", slug: "mujaes", nearby: ["barroselas", "carvoeiro", "subportela-deocriste-e-portela-susa"] },
      { name: "Outeiro", slug: "outeiro", nearby: ["carreco", "freixieiro-de-soutelo", "perre", "nogueira-meixedo-e-vilar-de-murteda"] },
      { name: "Perre", slug: "perre", nearby: ["areosa", "outeiro", "santa-marta-de-portuzelo"] },
      { name: "Santa Marta de Portuzelo", slug: "santa-marta-de-portuzelo", nearby: ["perre", "cardielos", "serreleis"] },
      { name: "Serreleis", slug: "serreleis", nearby: ["cardielos", "santa-marta-de-portuzelo", "geraz-do-lima-santa-maria-santa-leocadia-e-moreira-e-deao"] },
      { name: "São Romão de Neiva", slug: "sao-romao-de-neiva", nearby: ["castelo-do-neiva", "chafe", "alvaraes"] },
      { name: "Geraz do Lima (Santa Maria, Santa Leocádia e Moreira) e Deão", slug: "geraz-do-lima-santa-maria-santa-leocadia-e-moreira-e-deao", nearby: ["serreleis", "torre-e-vila-mou", "subportela-deocriste-e-portela-susa"] },
      { name: "Nogueira, Meixedo e Vilar de Murteda", slug: "nogueira-meixedo-e-vilar-de-murteda", nearby: ["outeiro", "amonde", "montaria", "lanheses"] },
      { name: "Subportela, Deocriste e Portela Susã", slug: "subportela-deocriste-e-portela-susa", nearby: ["vila-franca", "mujaes", "darque"] },
      { name: "Torre e Vila Mou", slug: "torre-e-vila-mou", nearby: ["cardielos", "lanheses", "geraz-do-lima-santa-maria-santa-leocadia-e-moreira-e-deao"] },
      { name: "Viana do Castelo (Santa Maria Maior e Monserrate) e Meadela", slug: "viana-do-castelo-santa-maria-maior-e-monserrate-e-meadela", nearby: ["areosa", "perre", "darque"] },
      { name: "Vila Franca", slug: "vila-franca", nearby: ["subportela-deocriste-e-portela-susa", "vila-de-punhe", "mazarefes"] },
      { name: "Vila Fria", slug: "vila-fria", nearby: ["mazarefes", "alvaraes", "vila-de-punhe"] },
      { name: "Vila de Punhe", slug: "vila-de-punhe", nearby: ["vila-fria", "vila-franca", "alvaraes"] },
    ],
  },
  // Verificado contra a Lei n.º 25-A/2025 (texto oficial, grep integral a "Lanhoso" —
  // zero ocorrências) + povoadelanhoso.pt + geoapi.pt/CAOP + Wikipédia — as 4 fontes
  // convergem em 22 freguesias/uniões, INALTERADO desde 2013 (não foi afetado pelas
  // reposições de outubro de 2025). Discrepância de grafia: geoapi.pt/Wikipédia usam
  // "Fonte Arcada e Oliveira", mantida a grafia da própria junta/câmara "Fontarcada e
  // Oliveira". Colisões: "serzedelo" já existe em Guimarães → sufixo "-lanhoso";
  // freguesia-sede "Póvoa de Lanhoso" com slug igual ao do concelho, mesmo padrão já
  // confirmado seguro em Barcelos.
  {
    name: "Póvoa de Lanhoso", slug: "povoa-de-lanhoso",
    freguesias: [
      { name: "Águas Santas e Moure", slug: "aguas-santas-e-moure", nearby: ["geraz-do-minho", "campos-e-louredo", "calvos-e-frades"] },
      { name: "Calvos e Frades", slug: "calvos-e-frades", nearby: ["aguas-santas-e-moure", "rendufinho", "campos-e-louredo"] },
      { name: "Campos e Louredo", slug: "campos-e-louredo", nearby: ["aguas-santas-e-moure", "geraz-do-minho", "esperanca-e-brunhais"] },
      { name: "Covelas", slug: "covelas", nearby: ["fontarcada-e-oliveira", "monsul", "verim-friande-e-ajude"] },
      { name: "Esperança e Brunhais", slug: "esperanca-e-brunhais", nearby: ["geraz-do-minho", "verim-friande-e-ajude", "campos-e-louredo"] },
      { name: "Ferreiros", slug: "ferreiros", nearby: ["santo-emiliao", "taide", "povoa-de-lanhoso"] },
      { name: "Fontarcada e Oliveira", slug: "fontarcada-e-oliveira", nearby: ["covelas", "monsul", "sobradelo-da-goma"] },
      { name: "Galegos", slug: "galegos", nearby: ["rendufinho", "calvos-e-frades", "serzedelo-lanhoso"] },
      { name: "Garfe", slug: "garfe", nearby: ["sobradelo-da-goma", "travassos", "sao-joao-de-rei"] },
      { name: "Geraz do Minho", slug: "geraz-do-minho", nearby: ["aguas-santas-e-moure", "verim-friande-e-ajude", "campos-e-louredo"] },
      { name: "Lanhoso", slug: "lanhoso", nearby: ["povoa-de-lanhoso", "taide", "santo-emiliao"] },
      { name: "Monsul", slug: "monsul", nearby: ["covelas", "fontarcada-e-oliveira", "sobradelo-da-goma"] },
      { name: "Póvoa de Lanhoso", slug: "povoa-de-lanhoso", nearby: ["lanhoso", "taide", "ferreiros", "vilela"] },
      { name: "Rendufinho", slug: "rendufinho", nearby: ["calvos-e-frades", "galegos", "serzedelo-lanhoso"] },
      { name: "Santo Emilião", slug: "santo-emiliao", nearby: ["ferreiros", "taide", "lanhoso"] },
      { name: "São João de Rei", slug: "sao-joao-de-rei", nearby: ["vilela", "travassos", "garfe"] },
      { name: "Serzedelo", slug: "serzedelo-lanhoso", nearby: ["rendufinho", "galegos", "calvos-e-frades"] },
      { name: "Sobradelo da Goma", slug: "sobradelo-da-goma", nearby: ["fontarcada-e-oliveira", "monsul", "garfe"] },
      { name: "Taíde", slug: "taide", nearby: ["ferreiros", "santo-emiliao", "povoa-de-lanhoso", "lanhoso"] },
      { name: "Travassos", slug: "travassos", nearby: ["vilela", "sao-joao-de-rei", "garfe"] },
      { name: "Verim, Friande e Ajude", slug: "verim-friande-e-ajude", nearby: ["covelas", "geraz-do-minho", "esperanca-e-brunhais"] },
      { name: "Vilela", slug: "vilela", nearby: ["povoa-de-lanhoso", "sao-joao-de-rei", "travassos"] },
    ],
  },
  // Verificado contra a Lei n.º 25-A/2025 (texto oficial, PDF do Diário da República,
  // 1.ª série, Suplemento n.º 51, 13-03-2025) — Fafe NÃO consta na lista de concelhos
  // com uniões desagregadas (ao contrário de Guimarães, Vila Nova de Famalicão,
  // Barcelos e Viana do Castelo); confirmado também via aldeiasportuguesas.pt
  // (observatório dedicado à lei, que não nomeia Fafe entre os 6 concelhos do
  // distrito de Braga afetados). Manteve-se em 25 freguesias/uniões, o padrão
  // pós-2013 (Lei 11-A/2013). Confirmado por 3 fontes concordantes: cm-fafe.pt/
  // freguesias (25, em 3 páginas, site ao vivo pós-autárquicas de out/2025),
  // geoapi.pt (JSON CAOP/DGT, 25) e Wikipédia "Lista de freguesias de Fafe" (25).
  // Colisões de slug: "fornelos" já existe em Barcelos e "travassos" já existe em
  // Póvoa de Lanhoso → sufixo "-fafe" em ambos. Freguesia-sede "Fafe" com slug
  // igual ao do concelho, mesmo padrão já confirmado seguro em Barcelos/Póvoa de
  // Lanhoso. Nota: extração direta do PDF do DR falhou (stream comprimido, sem
  // poppler no ambiente) — conclusão apoiada em triangulação de fontes vivas, não
  // em leitura linha a linha do anexo legal.
  {
    name: "Fafe", slug: "fafe",
    freguesias: [
      { name: "Aboim, Felgueiras, Gontim e Pedraído", slug: "aboim-felgueiras-gontim-e-pedraido", nearby: ["agrela-e-serafao", "golaes", "armil"] },
      { name: "Agrela e Serafão", slug: "agrela-e-serafao", nearby: ["aboim-felgueiras-gontim-e-pedraido", "medelo", "vinhos"] },
      { name: "Antime e Silvares (São Clemente)", slug: "antime-e-silvares-sao-clemente", nearby: ["fornelos-fafe", "silvares-sao-martinho", "ardegao-arnozela-e-seidoes"] },
      { name: "Ardegão, Arnozela e Seidões", slug: "ardegao-arnozela-e-seidoes", nearby: ["antime-e-silvares-sao-clemente", "moreira-do-rei-e-varzea-cova", "cepaes-e-fareja"] },
      { name: "Armil", slug: "armil", nearby: ["golaes", "pacos", "aboim-felgueiras-gontim-e-pedraido"] },
      { name: "Arões (Santa Cristina)", slug: "aroes-santa-cristina", nearby: ["medelo", "aroes-sao-romao", "ribeiros"] },
      { name: "Arões (São Romão)", slug: "aroes-sao-romao", nearby: ["aroes-santa-cristina", "quinchaes", "vinhos"] },
      { name: "Cepães e Fareja", slug: "cepaes-e-fareja", nearby: ["ardegao-arnozela-e-seidoes", "freitas-e-vila-cova", "antime-e-silvares-sao-clemente"] },
      { name: "Estorãos", slug: "estoraos", nearby: ["fafe", "regadas", "silvares-sao-martinho"] },
      { name: "Fafe", slug: "fafe", nearby: ["sao-gens", "fornelos-fafe", "regadas", "estoraos"] },
      { name: "Fornelos", slug: "fornelos-fafe", nearby: ["fafe", "sao-gens", "regadas", "antime-e-silvares-sao-clemente"] },
      { name: "Freitas e Vila Cova", slug: "freitas-e-vila-cova", nearby: ["moreira-do-rei-e-varzea-cova", "monte-e-queimadela", "cepaes-e-fareja"] },
      { name: "Golães", slug: "golaes", nearby: ["aboim-felgueiras-gontim-e-pedraido", "armil", "pacos"] },
      { name: "Medelo", slug: "medelo", nearby: ["agrela-e-serafao", "vinhos", "aroes-santa-cristina"] },
      { name: "Monte e Queimadela", slug: "monte-e-queimadela", nearby: ["moreira-do-rei-e-varzea-cova", "freitas-e-vila-cova", "travassos-fafe"] },
      { name: "Moreira do Rei e Várzea Cova", slug: "moreira-do-rei-e-varzea-cova", nearby: ["ardegao-arnozela-e-seidoes", "freitas-e-vila-cova", "monte-e-queimadela"] },
      { name: "Paços", slug: "pacos", nearby: ["golaes", "armil", "quinchaes"] },
      { name: "Quinchães", slug: "quinchaes", nearby: ["pacos", "aroes-sao-romao", "ribeiros"] },
      { name: "Regadas", slug: "regadas", nearby: ["fafe", "fornelos-fafe", "estoraos"] },
      { name: "Revelhe", slug: "revelhe", nearby: ["travassos-fafe", "ribeiros", "quinchaes"] },
      { name: "Ribeiros", slug: "ribeiros", nearby: ["quinchaes", "aroes-santa-cristina", "travassos-fafe"] },
      { name: "Silvares (São Martinho)", slug: "silvares-sao-martinho", nearby: ["sao-gens", "estoraos", "antime-e-silvares-sao-clemente"] },
      { name: "São Gens", slug: "sao-gens", nearby: ["fafe", "fornelos-fafe", "silvares-sao-martinho"] },
      { name: "Travassós", slug: "travassos-fafe", nearby: ["ribeiros", "revelhe", "monte-e-queimadela"] },
      { name: "Vinhós", slug: "vinhos", nearby: ["agrela-e-serafao", "medelo", "aroes-sao-romao"] },
    ],
  },
  // Esposende: CONFIRMADO como um dos concelhos afetados pela Lei n.º 25-A/2025 (13-03-2025,
  // em vigor pós-autárquicas de out/2025) — era a "forte candidata" apontada na investigação
  // anterior, e a suspeita confirma-se. Triangulação com 3 fontes independentes, todas
  // concordantes sem qualquer discrepância:
  // 1) Texto oficial da Lei 25-A/2025 (Diário da República, 1.ª série, Suplemento n.º 51,
  //    13-03-2025, files.diariodarepublica.pt/1s/2025/03/05102/0000200014.pdf) — extraído com
  //    pdfminer.six (poppler/pdftotext não disponível no ambiente). O anexo (coluna B → coluna
  //    C) mostra 4 uniões de Esposende desagregadas: "Apúlia e Fão" → Apúlia + Fão;
  //    "Belinho e Mar" → Belinho + Mar; "Esposende, Marinhas e Gandra" → Esposende + Marinhas +
  //    Gandra; "Palmeira de Faro e Curvos" → Palmeira de Faro + Curvos. Total: 9 freguesias
  //    repostas a partir de 4 uniões extintas.
  // 2) geoapi.pt (endpoint JSON ao vivo, dados CAOP/DGT, json.geoapi.pt/municipio/Esposende/
  //    freguesias) devolve exatamente 14 entradas: as 9 repostas + Antas, Forjães, Gemeses,
  //    Vila Chã (nunca agregadas, sempre autónomas) + "União das freguesias de Fonte Boa e Rio
  //    Tinto" (única união que NÃO foi desagregada — Rio Tinto não cumpre os critérios de
  //    desagregação da lei).
  // 3) Notícia oficial do município (municipio.esposende.pt/viver/atualidade/noticias/noticia/
  //    concelho-de-esposende-recupera-autonomia-das-suas-freguesias) confirma literalmente
  //    "novo mapa territorial composto por treze freguesias e uma união de freguesias" (13+1=14)
  //    e lista as mesmas 9 freguesias repostas nominalmente. Wikipédia PT já está atualizada e
  //    coincide (Wikipédia EN ainda mostra a estrutura antiga de 9 uniões pré-2025, não usada
  //    aqui). Nenhuma discrepância entre fontes.
  // Colisões de slug: "gandra" já existe em Paredes e "vila-cha" já existe em Vila do Conde →
  // sufixo "-esposende" em ambos (usado também dentro dos arrays `nearby` abaixo). Freguesia-
  // sede "Esposende" com slug igual ao do concelho, mesmo padrão já confirmado seguro em
  // Barcelos/Póvoa de Lanhoso/Fafe. A união remanescente "Fonte Boa e Rio Tinto" segue o mesmo
  // estilo de nome já usado para uniões não desagregadas noutras entradas (ex. "Aboim,
  // Felgueiras, Gontim e Pedraído" em Fafe): nome descritivo sem o prefixo "União das
  // Freguesias de". Nota: domínio da câmara mudou de cm-esposende.pt para
  // municipio.esposende.pt (cm-esposende.pt ainda existe mas devolveu 404 nos caminhos
  // tentados).
  {
    name: "Esposende", slug: "esposende",
    freguesias: [
      { name: "Antas", slug: "antas", nearby: ["gemeses", "vila-cha-esposende", "fonte-boa-e-rio-tinto", "mar"] },
      { name: "Apúlia", slug: "apulia", nearby: ["fao", "forjaes", "belinho"] },
      { name: "Belinho", slug: "belinho", nearby: ["fao", "apulia", "forjaes", "gandra-esposende"] },
      { name: "Curvos", slug: "curvos", nearby: ["palmeira-de-faro", "vila-cha-esposende", "marinhas"] },
      { name: "Esposende", slug: "esposende", nearby: ["fao", "marinhas", "mar", "gandra-esposende"] },
      { name: "Forjães", slug: "forjaes", nearby: ["apulia", "belinho", "gandra-esposende"] },
      { name: "Fão", slug: "fao", nearby: ["apulia", "esposende", "belinho"] },
      { name: "Gandra", slug: "gandra-esposende", nearby: ["esposende", "belinho", "forjaes", "gemeses"] },
      { name: "Gemeses", slug: "gemeses", nearby: ["gandra-esposende", "antas", "mar"] },
      { name: "Mar", slug: "mar", nearby: ["esposende", "marinhas", "antas", "gemeses"] },
      { name: "Marinhas", slug: "marinhas", nearby: ["esposende", "mar", "curvos", "palmeira-de-faro"] },
      { name: "Palmeira de Faro", slug: "palmeira-de-faro", nearby: ["marinhas", "curvos", "vila-cha-esposende"] },
      { name: "Fonte Boa e Rio Tinto", slug: "fonte-boa-e-rio-tinto", nearby: ["antas", "vila-cha-esposende", "gemeses"] },
      { name: "Vila Chã", slug: "vila-cha-esposende", nearby: ["curvos", "fonte-boa-e-rio-tinto", "antas", "palmeira-de-faro"] },
    ],
  },
];

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
