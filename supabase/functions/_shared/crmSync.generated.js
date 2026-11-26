// GERADO por `npm run build:crm-sync` a partir de src/lib/crmSyncCore.ts. Não editar à mão.
// src/constants/rugRates.ts
var RUG_RATE_COMMON = 10;
var RUG_RATE_NATURAL = 12;
var CARPET_TIERS = [
  { from: 0, rate: 8 },
  { from: 30, rate: 7 },
  { from: 60, rate: 6 },
  { from: 100, rate: 5 }
];
var RUG_RATE_CARPET = CARPET_TIERS[CARPET_TIERS.length - 1].rate;

// src/constants/rugSitePrice.ts
var RUG_PRICE_FROM = `Desde ${RUG_RATE_COMMON}€/m²`;
var RUG_PRICE_NOTE = `${RUG_RATE_COMMON}€/m² em tapete comum, mais a deslocação; juta e sisal ${RUG_RATE_NATURAL}€/m².`;
var CARPET_PRICE_FROM = `Desde ${RUG_RATE_CARPET}€/m²`;
var carpetTierText = CARPET_TIERS.slice(0, -1).map((t, i) => `até ${CARPET_TIERS[i + 1].from} m² ${t.rate}€/m²`).join(", ");
var CARPET_TIER_ROWS = CARPET_TIERS.map((t, i) => ({
  area: i === CARPET_TIERS.length - 1 ? `mais de ${t.from} m²` : i === 0 ? `até ${CARPET_TIERS[1].from} m²` : `${t.from} a ${CARPET_TIERS[i + 1].from} m²`,
  rate: t.rate
}));
var CARPET_TIERS_SENTENCE = CARPET_TIER_ROWS.map((t) => `${t.area} ${t.rate}€/m²`).join(", ");
var CARPET_PRICE_NOTE = `Alcatifa a partir de ${RUG_RATE_CARPET}€/m², conforme a área (${carpetTierText}), mais a deslocação.`;

// src/data/serviceCatalog.ts
var ARTICLE_CITIES = {
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
  "Póvoa de Lanhoso": "a"
};
var cityPrep = (city) => {
  const article = ARTICLE_CITIES[city];
  if (!article) return "em";
  return article === "o" ? "no" : "na";
};
var cities = [
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
  { name: "Alcoutim", slug: "alcoutim", region: "secondary", area: "algarve", description: "vila ribeirinha do interior algarvio" }
];

// src/constants/campaigns.ts
var BLACK_FRIDAY_2026 = {
  from: Date.parse("2026-11-27T00:00:00Z"),
  until: Date.parse("2026-12-01T00:00:00Z")
};

// src/constants/travel.ts
var locationPrices = {
  // ═══ Porto/Norte (equipa Porto) ═══
  // Zona 0 — Porto metropolitan core
  "Porto": 10,
  "Matosinhos": 10,
  // Zona 1 — Subúrbios imediatos, ~10-20 min
  "Vila Nova de Gaia": 10,
  "Maia": 10,
  "Gondomar": 10,
  // Zona 2 — Grande Porto, ~20-30 min
  "Valongo": 10,
  "Espinho": 10,
  "Póvoa de Varzim": 10,
  "Vila do Conde": 10,
  "Santo Tirso": 10,
  "Trofa": 10,
  "Paredes": 10,
  "Santa Maria da Feira": 10,
  // ~27 min pela A1, vizinha de Espinho (2026-09-26)
  // Zona 3 — Interior norte, ~35-45 min
  "Penafiel": 15,
  "Paços de Ferreira": 15,
  "Felgueiras": 15,
  "Lousada": 15,
  // Zona 3 — Sul do Douro, ~33-37 min, como Penafiel (2026-09-26, entraram na
  // campanha de Google Ads do Porto e o questionário recusava-as)
  "São João da Madeira": 15,
  "Ovar": 15,
  "Oliveira de Azeméis": 15,
  // Zona 4 — Mais afastado, ~45-55 min
  "Arouca": 20,
  // Aveiro — Centro, deslocação a partir do Porto (2026-09-10, corrigido a pedido do dono)
  "Aveiro": 15,
  // ═══ Coimbra e Centro (trabalhador local desde 2026-09-28) ═══
  // Dono, 2026-09-28: Coimbra 10€, arredores próximos 15€, mais longe 20€
  // (mesma lógica de escalões da equipa de Braga). Deixou de ser deslocação
  // alargada: saiu de EXTENDED_TRIP_CITIES.
  "Coimbra": 10,
  "Figueira da Foz": 20,
  // ~45 min pela A14
  // Dono, 2026-11-24: concelhos do distrito de Coimbra pelos escalões de 28/09, por distância de carro ao
  // centro de Coimbra: até ~30 km 15€, mais longe 20€.
  "Condeixa-a-Nova": 15,
  "Penacova": 15,
  "Miranda do Corvo": 15,
  "Lousã": 15,
  "Montemor-o-Velho": 15,
  "Vila Nova de Poiares": 15,
  "Cantanhede": 15,
  "Penela": 20,
  "Soure": 20,
  "Mira": 20,
  "Góis": 20,
  "Arganil": 20,
  "Tábua": 20,
  "Oliveira do Hospital": 20,
  "Pampilhosa da Serra": 20,
  // Dono, 2026-11-15: escalões pelo centro de Leiria (como Braga):
  // centro 10€, arredores próximos (até ~15 km) 15€, mais longe 20€.
  "Leiria": 10,
  "Batalha": 15,
  "Marinha Grande": 15,
  "Porto de Mós": 20,
  "Ourém": 20,
  "Fátima": 20,
  "Pombal": 20,
  "Alcobaça": 20,
  "Nazaré": 20,
  // ═══ Madeira (dono, 2026-11-15): escalões pelo centro do Funchal ═══
  "Funchal": 10,
  "Câmara de Lobos": 15,
  "Caniço": 15,
  "Santa Cruz": 20,
  "Machico": 20,
  // ═══ Braga/Minho (equipa local, escalões por distância ao centro de Braga) ═══
  // Dono, 2026-11-18: Minho só 10€ ou 15€ (perto das equipas de Braga ou de Viana = 10€, resto 15€).
  // Escalões por sede de concelho; a morada concreta é confirmada no orçamento.
  "Braga": 10,
  "Guimarães": 15,
  "Vila Nova de Famalicão": 15,
  "Barcelos": 15,
  "Viana do Castelo": 10,
  "Póvoa de Lanhoso": 15,
  "Fafe": 15,
  "Esposende": 15,
  "Vizela": 15,
  "Amares": 10,
  "Vila Verde": 15,
  // ═══ Lisboa / Área Metropolitana (equipa local) ═══
  // Lisboa: mínimo 10€, máximo 15€.
  // Zona 0 — Lisboa
  "Lisboa": 10,
  // Zona 1 — Vizinhos imediatos, ~10-15 min
  "Amadora": 10,
  "Odivelas": 10,
  "Oeiras": 10,
  // Zona 2 — Grande Lisboa, ~20-30 min
  "Cascais": 10,
  "Sintra": 10,
  "Loures": 10,
  "Almada": 10,
  "Seixal": 10,
  // Zona 3 — Mais afastado, ~30-40 min
  "Vila Franca de Xira": 15,
  "Barreiro": 15,
  "Moita": 15,
  "Mafra": 15,
  // Zona 4 — Extremos da AML, ~40-50 min
  "Setúbal": 15,
  "Montijo": 15,
  "Alcochete": 15,
  "Palmela": 15,
  "Sesimbra": 15,
  // Alentejo Litoral — equipa Lisboa, ~1h a 1h35. Disponibilidade sob consulta,
  // ver EXTENDED_TRIP_CITIES. (2026-09-26, entraram na campanha de Lisboa.)
  // Alcácer do Sal fica a 15€ (inclui a Comporta, o limite sul do dono). A sul
  // da Comporta é 20€ (dono, 2026-09-28), e os anúncios deixaram de lá chegar.
  "Alcácer do Sal": 15,
  "Grândola": 20,
  "Santiago do Cacém": 20,
  "Sines": 20,
  // ═══ Algarve (equipa local) ═══
  // Algarve: 10€ no centro, 15€ na zona ocidental e 25€ nos extremos/interior.
  // Zona 0 — Faro/Loulé
  "Faro": 10,
  "Loulé": 10,
  // Zona 1 — Vizinhos imediatos, ~10-15 min
  "Albufeira": 10,
  "São Brás de Alportel": 10,
  "Olhão": 10,
  // Zona 2 — Algarve central, ~20-30 min
  "Silves": 10,
  "Lagoa": 10,
  "Tavira": 10,
  // Zona 3 — Algarve ocidental, ~30-40 min
  "Portimão": 15,
  "Lagos": 15,
  // Zona 4 — Extremos, ~40-55 min
  "Vila Real de Santo António": 25,
  "Castro Marim": 25,
  "Monchique": 25,
  // Zona 5 — Interior/Costa Vicentina, ~55-70 min
  "Aljezur": 25,
  "Vila do Bispo": 25,
  "Alcoutim": 25
};
var SMALL_ORDER_FAR_SURCHARGE = 10;
var SMALL_ORDER_FAR_MIN = 49;
var SMALL_ORDER_FAR_RULE = `Longe de Odivelas (mais de 20 km de carro), um serviço abaixo de ${SMALL_ORDER_FAR_MIN}€ leva mais ${SMALL_ORDER_FAR_SURCHARGE}€ (já está no total). Diz numa frase que é por ser um serviço pequeno nesta zona e que, se juntar outra peça na mesma visita, deixa de ter esse acréscimo.`;
var TRAVEL_FREE_ABOVE = { 10: 120, 15: 135, 20: 150 };

// src/data/freguesiaList.ts
var municipiosComFreguesias = [
  {
    name: "Porto",
    slug: "porto",
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
      { name: "Vitória", slug: "vitoria", nearby: ["cedofeita", "se", "santo-ildefonso"] }
    ]
  },
  {
    name: "Matosinhos",
    slug: "matosinhos",
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
      { name: "Santa Cruz do Bispo", slug: "santa-cruz-do-bispo", nearby: ["lavra", "perafita"] }
    ]
  },
  {
    name: "Maia",
    slug: "maia",
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
      { name: "Vermoim", slug: "vermoim", nearby: ["cidade-da-maia", "castelo-da-maia"] }
    ]
  },
  {
    name: "Vila Nova de Gaia",
    slug: "vila-nova-de-gaia",
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
      { name: "Sermonde", slug: "sermonde", nearby: ["grijo"] }
    ]
  },
  {
    name: "Gondomar",
    slug: "gondomar",
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
      { name: "Medas", slug: "medas", nearby: ["melres"] }
    ]
  },
  {
    name: "Valongo",
    slug: "valongo",
    freguesias: [
      { name: "Valongo Centro", slug: "valongo-centro", nearby: ["ermesinde", "campo"] },
      { name: "Ermesinde", slug: "ermesinde", nearby: ["valongo-centro", "alfena"] },
      { name: "Alfena", slug: "alfena", nearby: ["ermesinde", "valongo-centro"] },
      { name: "Campo", slug: "campo-valongo", nearby: ["valongo-centro", "sobrado"] },
      { name: "Sobrado", slug: "sobrado-valongo", nearby: ["campo-valongo"] }
    ]
  },
  {
    name: "Paredes",
    slug: "paredes",
    freguesias: [
      { name: "Paredes Centro", slug: "paredes-centro", nearby: ["rebordosa", "gandra"] },
      { name: "Rebordosa", slug: "rebordosa", nearby: ["paredes-centro", "aguiar-de-sousa"] },
      { name: "Gandra", slug: "gandra", nearby: ["paredes-centro", "baltar"] },
      { name: "Baltar", slug: "baltar", nearby: ["gandra", "lordelo-paredes"] },
      { name: "Lordelo", slug: "lordelo-paredes", nearby: ["baltar", "paredes-centro"] },
      { name: "Aguiar de Sousa", slug: "aguiar-de-sousa", nearby: ["rebordosa"] },
      { name: "Cete", slug: "cete", nearby: ["paredes-centro", "paço-de-sousa"] },
      { name: "Paço de Sousa", slug: "paco-de-sousa", nearby: ["cete", "paredes-centro"] }
    ]
  },
  {
    name: "Penafiel",
    slug: "penafiel",
    freguesias: [
      { name: "Penafiel Centro", slug: "penafiel-centro", nearby: ["paço-de-sousa-penafiel", "bustelo"] },
      { name: "Paço de Sousa", slug: "paco-de-sousa-penafiel", nearby: ["penafiel-centro"] },
      { name: "Bustelo", slug: "bustelo", nearby: ["penafiel-centro"] },
      { name: "Guilhufe", slug: "guilhufe", nearby: ["penafiel-centro", "marecos"] },
      { name: "Marecos", slug: "marecos", nearby: ["guilhufe", "penafiel-centro"] },
      { name: "Rio de Moinhos", slug: "rio-de-moinhos", nearby: ["penafiel-centro"] }
    ]
  },
  {
    name: "Lousada",
    slug: "lousada",
    freguesias: [
      { name: "Lousada Centro", slug: "lousada-centro", nearby: ["silvares", "lustosa"] },
      { name: "Silvares", slug: "silvares", nearby: ["lousada-centro"] },
      { name: "Lustosa", slug: "lustosa", nearby: ["lousada-centro"] },
      { name: "Caíde de Rei", slug: "caide-de-rei", nearby: ["lousada-centro", "lustosa"] },
      { name: "Nespereira", slug: "nespereira-lousada", nearby: ["lousada-centro"] }
    ]
  },
  {
    name: "Paços de Ferreira",
    slug: "pacos-de-ferreira",
    freguesias: [
      { name: "Paços de Ferreira Centro", slug: "pacos-de-ferreira-centro", nearby: ["freamunde", "frazao"] },
      { name: "Freamunde", slug: "freamunde", nearby: ["pacos-de-ferreira-centro"] },
      { name: "Frazão", slug: "frazao", nearby: ["pacos-de-ferreira-centro", "freamunde"] },
      { name: "Carvalhosa", slug: "carvalhosa", nearby: ["pacos-de-ferreira-centro"] },
      { name: "Seroa", slug: "seroa", nearby: ["pacos-de-ferreira-centro", "frazao"] }
    ]
  },
  {
    name: "Felgueiras",
    slug: "felgueiras",
    freguesias: [
      { name: "Felgueiras Centro", slug: "felgueiras-centro", nearby: ["margaride", "lixa"] },
      { name: "Margaride", slug: "margaride", nearby: ["felgueiras-centro"] },
      { name: "Lixa", slug: "lixa", nearby: ["felgueiras-centro"] },
      { name: "Barrosas", slug: "barrosas", nearby: ["felgueiras-centro", "lixa"] },
      { name: "Idães", slug: "idaes", nearby: ["felgueiras-centro"] }
    ]
  },
  {
    name: "Santo Tirso",
    slug: "santo-tirso",
    freguesias: [
      { name: "Santo Tirso Centro", slug: "santo-tirso-centro", nearby: ["sao-tome-de-negrelos", "vilarinho"] },
      { name: "São Tomé de Negrelos", slug: "sao-tome-de-negrelos", nearby: ["santo-tirso-centro"] },
      { name: "Vilarinho", slug: "vilarinho-santo-tirso", nearby: ["santo-tirso-centro"] },
      { name: "Areias", slug: "areias-santo-tirso", nearby: ["santo-tirso-centro"] },
      { name: "Negrelos", slug: "negrelos", nearby: ["sao-tome-de-negrelos", "santo-tirso-centro"] }
    ]
  },
  {
    name: "Trofa",
    slug: "trofa",
    freguesias: [
      { name: "Trofa Centro", slug: "trofa-centro", nearby: ["sao-romao-do-coronado", "sao-martinho-de-bougado"] },
      { name: "São Romão do Coronado", slug: "sao-romao-do-coronado", nearby: ["trofa-centro"] },
      { name: "São Martinho de Bougado", slug: "sao-martinho-de-bougado", nearby: ["trofa-centro", "sao-romao-do-coronado"] },
      { name: "Guidões", slug: "guidoes", nearby: ["trofa-centro"] },
      { name: "Alvarelhos", slug: "alvarelhos", nearby: ["trofa-centro", "guidoes"] }
    ]
  },
  {
    name: "Póvoa de Varzim",
    slug: "povoa-de-varzim",
    freguesias: [
      { name: "Póvoa de Varzim Centro", slug: "povoa-de-varzim-centro", nearby: ["aver-o-mar", "agucar-doce"] },
      { name: "Aver-o-Mar", slug: "aver-o-mar", nearby: ["povoa-de-varzim-centro", "agucar-doce"] },
      { name: "Aguçadoura", slug: "agucadoura", nearby: ["aver-o-mar", "navais"] },
      { name: "Navais", slug: "navais", nearby: ["agucadoura"] },
      { name: "Beiriz", slug: "beiriz", nearby: ["povoa-de-varzim-centro", "argivai"] },
      { name: "Argivai", slug: "argivai", nearby: ["beiriz", "povoa-de-varzim-centro"] }
    ]
  },
  {
    name: "Vila do Conde",
    slug: "vila-do-conde",
    freguesias: [
      { name: "Vila do Conde Centro", slug: "vila-do-conde-centro", nearby: ["azurara", "mindelo"] },
      { name: "Azurara", slug: "azurara", nearby: ["vila-do-conde-centro"] },
      { name: "Mindelo", slug: "mindelo", nearby: ["vila-do-conde-centro", "vila-cha"] },
      { name: "Vila Chã", slug: "vila-cha", nearby: ["mindelo", "labruge"] },
      { name: "Labruge", slug: "labruge", nearby: ["vila-cha"] },
      { name: "Modivas", slug: "modivas", nearby: ["vila-do-conde-centro"] }
    ]
  },
  {
    name: "Espinho",
    slug: "espinho",
    freguesias: [
      { name: "Espinho Centro", slug: "espinho-centro", nearby: ["silvalde", "anta"] },
      { name: "Silvalde", slug: "silvalde", nearby: ["espinho-centro", "paramos"] },
      { name: "Anta", slug: "anta-espinho", nearby: ["espinho-centro", "guetim"] },
      { name: "Paramos", slug: "paramos", nearby: ["silvalde"] },
      { name: "Guetim", slug: "guetim", nearby: ["anta-espinho"] }
    ]
  },
  {
    name: "Arouca",
    slug: "arouca",
    freguesias: [
      { name: "Arouca Centro", slug: "arouca-centro", nearby: ["escariz", "urrô"] },
      { name: "Escariz", slug: "escariz", nearby: ["arouca-centro"] },
      { name: "Urrô", slug: "urro", nearby: ["arouca-centro", "escariz"] },
      { name: "Alvarenga", slug: "alvarenga", nearby: ["arouca-centro"] },
      { name: "Moldes", slug: "moldes", nearby: ["arouca-centro"] }
    ]
  },
  // Sul do Douro (2026-09-26). Nomes e proximidade confirmados na GeoAPI
  // (json.geoapi.pt, centroides das freguesias). A sede de cada concelho fica
  // de fora: seria uma página igual à da cidade. São João da Madeira tem uma
  // única freguesia, que é a própria cidade, por isso não tem entrada aqui.
  {
    name: "Santa Maria da Feira",
    slug: "santa-maria-da-feira",
    freguesias: [
      { name: "Lourosa", slug: "lourosa", nearby: ["mozelos", "santa-maria-de-lamas", "fiaes"] },
      { name: "Fiães", slug: "fiaes", nearby: ["lourosa", "argoncilhe", "mozelos"] },
      { name: "Argoncilhe", slug: "argoncilhe", nearby: ["mozelos", "fiaes", "lourosa"] },
      { name: "Mozelos", slug: "mozelos", nearby: ["santa-maria-de-lamas", "lourosa", "nogueira-da-regedoura"] },
      { name: "Santa Maria de Lamas", slug: "santa-maria-de-lamas", nearby: ["mozelos", "lourosa", "pacos-de-brandao"] },
      { name: "Nogueira da Regedoura", slug: "nogueira-da-regedoura", nearby: ["mozelos", "sao-paio-de-oleiros", "santa-maria-de-lamas"] },
      { name: "São Paio de Oleiros", slug: "sao-paio-de-oleiros", nearby: ["pacos-de-brandao", "nogueira-da-regedoura", "santa-maria-de-lamas"] },
      { name: "Paços de Brandão", slug: "pacos-de-brandao", nearby: ["sao-paio-de-oleiros", "santa-maria-de-lamas", "rio-meao"] },
      { name: "Rio Meão", slug: "rio-meao", nearby: ["pacos-de-brandao", "sao-joao-de-ver", "santa-maria-de-lamas"] },
      { name: "São João de Ver", slug: "sao-joao-de-ver", nearby: ["rio-meao", "santa-maria-de-lamas", "lourosa"] },
      { name: "Arrifana", slug: "arrifana", nearby: ["milheiros-de-poiares", "sao-joao-de-ver"] },
      { name: "Milheirós de Poiares", slug: "milheiros-de-poiares", nearby: ["arrifana", "sao-joao-de-ver"] }
    ]
  },
  {
    name: "Oliveira de Azeméis",
    slug: "oliveira-de-azemeis",
    freguesias: [
      { name: "Cucujães", slug: "cucujaes", nearby: ["sao-roque", "macieira-de-sarnes", "nogueira-do-cravo"] },
      { name: "São Roque", slug: "sao-roque", nearby: ["nogueira-do-cravo", "macieira-de-sarnes", "cucujaes"] },
      { name: "Nogueira do Cravo", slug: "nogueira-do-cravo", nearby: ["macieira-de-sarnes", "sao-roque", "cesar"] },
      { name: "Macieira de Sarnes", slug: "macieira-de-sarnes", nearby: ["nogueira-do-cravo", "cesar", "sao-roque"] },
      { name: "Cesar", slug: "cesar", nearby: ["macieira-de-sarnes", "fajoes", "nogueira-do-cravo"] },
      { name: "Fajões", slug: "fajoes", nearby: ["carregosa", "cesar", "macieira-de-sarnes"] },
      { name: "Carregosa", slug: "carregosa", nearby: ["fajoes", "cesar"] },
      { name: "Loureiro", slug: "loureiro", nearby: ["pinheiro-da-bemposta", "cucujaes"] },
      { name: "Pinheiro da Bemposta", slug: "pinheiro-da-bemposta", nearby: ["loureiro"] }
    ]
  },
  {
    name: "Ovar",
    slug: "ovar",
    freguesias: [
      { name: "Esmoriz", slug: "esmoriz", nearby: ["cortegaca", "maceda"] },
      { name: "Cortegaça", slug: "cortegaca", nearby: ["esmoriz", "maceda"] },
      { name: "Maceda", slug: "maceda", nearby: ["arada", "cortegaca", "furadouro"] },
      { name: "Arada", slug: "arada", nearby: ["maceda", "furadouro"] },
      { name: "Furadouro", slug: "furadouro", nearby: ["arada", "maceda"] },
      { name: "Válega", slug: "valega", nearby: ["arada", "furadouro"] }
    ]
  },
  // ═══════════════ Centro (Aveiro/Coimbra, expansão 2026-09-10) ═══════════════
  {
    name: "Aveiro",
    slug: "aveiro",
    freguesias: [
      { name: "Glória", slug: "gloria", nearby: ["vera-cruz", "esgueira", "santa-joana"] },
      { name: "Vera Cruz", slug: "vera-cruz", nearby: ["gloria", "sao-bernardo", "aradas"] },
      { name: "Esgueira", slug: "esgueira", nearby: ["gloria", "oliveirinha", "santa-joana"] },
      { name: "São Bernardo", slug: "sao-bernardo", nearby: ["vera-cruz", "aradas"] },
      { name: "Aradas", slug: "aradas", nearby: ["sao-bernardo", "vera-cruz"] },
      { name: "Santa Joana", slug: "santa-joana", nearby: ["gloria", "esgueira"] },
      { name: "Oliveirinha", slug: "oliveirinha", nearby: ["esgueira", "eixo"] },
      { name: "Cacia", slug: "cacia", nearby: ["eixo", "eirol"] },
      { name: "Eixo", slug: "eixo", nearby: ["eirol", "oliveirinha", "cacia"] },
      { name: "Eirol", slug: "eirol", nearby: ["eixo", "cacia"] },
      { name: "Requeixo", slug: "requeixo", nearby: ["nossa-senhora-de-fatima", "nariz"] },
      { name: "Nossa Senhora de Fátima", slug: "nossa-senhora-de-fatima", nearby: ["requeixo", "nariz"] },
      { name: "Nariz", slug: "nariz", nearby: ["requeixo", "nossa-senhora-de-fatima"] },
      { name: "São Jacinto", slug: "sao-jacinto", nearby: ["gloria"] }
    ]
  },
  {
    name: "Coimbra",
    slug: "coimbra",
    freguesias: [
      { name: "Sé Nova", slug: "se-nova", nearby: ["santa-cruz", "almedina", "sao-bartolomeu"] },
      { name: "Santa Cruz", slug: "santa-cruz", nearby: ["se-nova", "almedina", "sao-bartolomeu"] },
      { name: "Almedina", slug: "almedina", nearby: ["se-nova", "santa-cruz", "sao-bartolomeu"] },
      { name: "São Bartolomeu", slug: "sao-bartolomeu", nearby: ["se-nova", "santa-cruz", "almedina"] },
      { name: "Santo António dos Olivais", slug: "santo-antonio-dos-olivais", nearby: ["se-nova", "sao-silvestre"] },
      { name: "São Silvestre", slug: "sao-silvestre", nearby: ["santo-antonio-dos-olivais", "trouxemil"] },
      { name: "Trouxemil", slug: "trouxemil", nearby: ["sao-silvestre", "torre-de-vilela"] },
      { name: "Torre de Vilela", slug: "torre-de-vilela", nearby: ["trouxemil", "souselas"] },
      { name: "Souselas", slug: "souselas", nearby: ["torre-de-vilela", "botao", "sao-joao-do-campo"] },
      { name: "Cernache", slug: "cernache", nearby: ["antanhol", "assafarge", "castelo-viegas"] },
      { name: "Botão", slug: "botao", nearby: ["souselas", "torre-de-vilela"] },
      { name: "Santa Clara", slug: "santa-clara", nearby: ["castelo-viegas", "se-nova"] },
      { name: "Castelo Viegas", slug: "castelo-viegas", nearby: ["santa-clara", "torres-do-mondego"] },
      { name: "Torres do Mondego", slug: "torres-do-mondego", nearby: ["castelo-viegas", "antuzede"] },
      { name: "Antuzede", slug: "antuzede", nearby: ["torres-do-mondego", "vil-de-matos"] },
      { name: "Vil de Matos", slug: "vil-de-matos", nearby: ["antuzede", "assafarge"] },
      { name: "Assafarge", slug: "assafarge", nearby: ["vil-de-matos", "antanhol"] },
      { name: "Antanhol", slug: "antanhol", nearby: ["assafarge", "castelo-viegas"] },
      { name: "São Martinho do Bispo", slug: "sao-martinho-do-bispo", nearby: ["ribeira-de-frades", "eiras"] },
      { name: "Ribeira de Frades", slug: "ribeira-de-frades", nearby: ["sao-martinho-do-bispo", "eiras"] },
      { name: "Eiras", slug: "eiras", nearby: ["sao-martinho-do-bispo", "ribeira-de-frades", "sao-paulo-de-frades"] },
      { name: "São Paulo de Frades", slug: "sao-paulo-de-frades", nearby: ["eiras", "sao-martinho-de-arvore"] },
      { name: "São Martinho de Árvore", slug: "sao-martinho-de-arvore", nearby: ["sao-paulo-de-frades", "lamarosa"] },
      { name: "Lamarosa", slug: "lamarosa", nearby: ["sao-martinho-de-arvore", "sao-paulo-de-frades"] },
      { name: "Brasfemes", slug: "brasfemes", nearby: ["ceira", "sao-joao-do-campo"] },
      { name: "Ceira", slug: "ceira", nearby: ["brasfemes", "almalagues"] },
      { name: "São João do Campo", slug: "sao-joao-do-campo", nearby: ["brasfemes", "ceira"] },
      { name: "Almalaguês", slug: "almalagues", nearby: ["ceira", "taveiro"] },
      { name: "Taveiro", slug: "taveiro", nearby: ["ameal", "arzila", "almalagues"] },
      { name: "Ameal", slug: "ameal", nearby: ["taveiro", "arzila"] },
      { name: "Arzila", slug: "arzila", nearby: ["taveiro", "ameal"] },
      // Bairros de Santo António dos Olivais e de Coimbra que as pessoas
      // pesquisam pelo nome (2026-09-28), como Vilamoura em Loulé.
      { name: "Celas", slug: "celas", nearby: ["santo-antonio-dos-olivais", "se-nova"] },
      { name: "Solum", slug: "solum", nearby: ["norton-de-matos", "vale-das-flores", "santo-antonio-dos-olivais"] },
      { name: "Vale das Flores", slug: "vale-das-flores", nearby: ["solum", "norton-de-matos", "santo-antonio-dos-olivais"] },
      { name: "Norton de Matos", slug: "norton-de-matos", nearby: ["solum", "vale-das-flores", "santa-clara"] },
      { name: "Pedrulha", slug: "pedrulha", nearby: ["santa-cruz", "eiras"] }
    ]
  },
  // Figueira da Foz (2026-09-28, servida a partir de Coimbra). Freguesias
  // de depois da reorganização de 13/10/2025 (Buarcos, Brenha e Santana
  // voltaram a ser freguesias). São Julião é a cidade e fica de fora, como a
  // sede dos outros concelhos. Cova-Gala, Costa de Lavos e Leirosa entram
  // como localidades. A Praia da Tocha é de Cantanhede, não da Figueira.
  {
    name: "Figueira da Foz",
    slug: "figueira-da-foz",
    freguesias: [
      { name: "Buarcos", slug: "buarcos", nearby: ["tavarede", "brenha", "quiaios"] },
      { name: "Tavarede", slug: "tavarede", nearby: ["buarcos", "brenha", "quiaios"] },
      { name: "Brenha", slug: "brenha", nearby: ["alhadas", "tavarede", "quiaios"] },
      { name: "Alhadas", slug: "alhadas", nearby: ["brenha", "moinhos-da-gandara", "maiorca"] },
      { name: "Quiaios", slug: "quiaios", nearby: ["brenha", "tavarede", "buarcos"] },
      { name: "Bom Sucesso", slug: "bom-sucesso", nearby: ["ferreira-a-nova", "moinhos-da-gandara", "quiaios"] },
      { name: "Moinhos da Gândara", slug: "moinhos-da-gandara", nearby: ["santana", "alhadas", "ferreira-a-nova"] },
      { name: "Ferreira-a-Nova", slug: "ferreira-a-nova", nearby: ["bom-sucesso", "moinhos-da-gandara", "santana"] },
      { name: "Santana", slug: "santana", nearby: ["moinhos-da-gandara", "alhadas", "ferreira-a-nova"] },
      { name: "Maiorca", slug: "maiorca", nearby: ["vila-verde", "alhadas", "brenha"] },
      { name: "Vila Verde", slug: "vila-verde", nearby: ["maiorca", "alhadas", "alqueidao"] },
      { name: "São Pedro", slug: "sao-pedro", nearby: ["cova-gala", "lavos", "costa-de-lavos"] },
      { name: "Lavos", slug: "lavos", nearby: ["alqueidao", "costa-de-lavos", "sao-pedro"] },
      { name: "Alqueidão", slug: "alqueidao", nearby: ["lavos", "paiao", "vila-verde"] },
      { name: "Paião", slug: "paiao", nearby: ["alqueidao", "marinha-das-ondas", "lavos"] },
      { name: "Marinha das Ondas", slug: "marinha-das-ondas", nearby: ["paiao", "leirosa", "lavos"] },
      { name: "Cova-Gala", slug: "cova-gala", nearby: ["sao-pedro", "costa-de-lavos", "lavos"] },
      { name: "Costa de Lavos", slug: "costa-de-lavos", nearby: ["leirosa", "lavos", "cova-gala"] },
      { name: "Leirosa", slug: "leirosa", nearby: ["costa-de-lavos", "marinha-das-ondas"] }
    ]
  },
  // ═══════════════ Lisboa / Área Metropolitana ═══════════════
  {
    name: "Lisboa",
    slug: "lisboa",
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
      { name: "Olivais", slug: "olivais", nearby: ["santa-clara", "parque-das-nacoes", "alvalade"] }
    ]
  },
  {
    name: "Cascais",
    slug: "cascais",
    freguesias: [
      { name: "Cascais e Estoril", slug: "cascais-estoril", nearby: ["alcabideche", "carcavelos-e-parede"] },
      { name: "Alcabideche", slug: "alcabideche", nearby: ["cascais-estoril", "sao-domingos-de-rana"] },
      { name: "Carcavelos e Parede", slug: "carcavelos-e-parede", nearby: ["cascais-estoril", "sao-domingos-de-rana"] },
      { name: "São Domingos de Rana", slug: "sao-domingos-de-rana", nearby: ["alcabideche", "carcavelos-e-parede"] }
    ]
  },
  {
    name: "Oeiras",
    slug: "oeiras",
    freguesias: [
      { name: "Oeiras e São Julião da Barra", slug: "oeiras-e-sao-juliao-da-barra", nearby: ["carnaxide-e-queijas", "porto-salvo"] },
      { name: "Algés, Linda-a-Velha e Cruz Quebrada", slug: "alges-linda-a-velha", nearby: ["carnaxide-e-queijas", "oeiras-e-sao-juliao-da-barra"] },
      { name: "Carnaxide e Queijas", slug: "carnaxide-e-queijas", nearby: ["alges-linda-a-velha", "oeiras-e-sao-juliao-da-barra", "barcarena"] },
      { name: "Barcarena", slug: "barcarena", nearby: ["carnaxide-e-queijas", "porto-salvo"] },
      { name: "Porto Salvo", slug: "porto-salvo", nearby: ["barcarena", "oeiras-e-sao-juliao-da-barra"] }
    ]
  },
  {
    name: "Sintra",
    slug: "sintra",
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
      { name: "Almargem do Bispo, Pêro Pinheiro e Montelavar", slug: "almargem-do-bispo", nearby: ["sintra-vila", "sao-joao-das-lampas-e-terrugem"] }
    ]
  },
  {
    name: "Almada",
    slug: "almada",
    freguesias: [
      { name: "Almada, Cova da Piedade, Pragal e Cacilhas", slug: "almada-cova-da-piedade", nearby: ["laranjeiro-e-feijo", "caparica-e-trafaria"] },
      { name: "Caparica e Trafaria", slug: "caparica-e-trafaria", nearby: ["almada-cova-da-piedade", "costa-da-caparica"] },
      { name: "Costa da Caparica", slug: "costa-da-caparica", nearby: ["caparica-e-trafaria", "charneca-de-caparica"] },
      { name: "Charneca de Caparica e Sobreda", slug: "charneca-de-caparica", nearby: ["costa-da-caparica", "laranjeiro-e-feijo"] },
      { name: "Laranjeiro e Feijó", slug: "laranjeiro-e-feijo", nearby: ["almada-cova-da-piedade", "charneca-de-caparica"] }
    ]
  },
  {
    name: "Setúbal",
    slug: "setubal",
    freguesias: [
      { name: "Setúbal (Centro Histórico)", slug: "setubal-centro", nearby: ["sao-sebastiao-setubal", "sado"] },
      { name: "São Sebastião", slug: "sao-sebastiao-setubal", nearby: ["setubal-centro", "gambia-pontes"] },
      { name: "Sado", slug: "sado", nearby: ["setubal-centro", "gambia-pontes"] },
      { name: "Gâmbia-Pontes-Alto da Guerra", slug: "gambia-pontes", nearby: ["sao-sebastiao-setubal", "sado"] },
      { name: "Azeitão", slug: "azeitao", nearby: ["setubal-centro"] }
    ]
  },
  {
    name: "Amadora",
    slug: "amadora",
    freguesias: [
      { name: "Águas Livres", slug: "aguas-livres", nearby: ["alfragide", "venteira"] },
      { name: "Alfragide", slug: "alfragide", nearby: ["aguas-livres", "encosta-do-sol"] },
      { name: "Encosta do Sol", slug: "encosta-do-sol", nearby: ["alfragide", "falagueira-venda-nova"] },
      { name: "Falagueira-Venda Nova", slug: "falagueira-venda-nova", nearby: ["encosta-do-sol", "mina-de-agua"] },
      { name: "Mina de Água", slug: "mina-de-agua", nearby: ["falagueira-venda-nova", "venteira"] },
      { name: "Venteira", slug: "venteira", nearby: ["mina-de-agua", "aguas-livres"] }
    ]
  },
  {
    name: "Odivelas",
    slug: "odivelas",
    freguesias: [
      { name: "Odivelas", slug: "odivelas-centro", nearby: ["povoa-de-santo-adriao", "pontinha-e-famoes"] },
      { name: "Póvoa de Santo Adrião e Olival Basto", slug: "povoa-de-santo-adriao", nearby: ["odivelas-centro", "ramada-e-canecas"] },
      { name: "Ramada e Caneças", slug: "ramada-e-canecas", nearby: ["povoa-de-santo-adriao", "odivelas-centro"] },
      { name: "Pontinha e Famões", slug: "pontinha-e-famoes", nearby: ["odivelas-centro"] }
    ]
  },
  {
    name: "Loures",
    slug: "loures",
    freguesias: [
      { name: "Loures", slug: "loures-centro", nearby: ["sacavem-e-prior-velho", "bucelas"] },
      { name: "Sacavém e Prior Velho", slug: "sacavem-e-prior-velho", nearby: ["loures-centro", "moscavide-e-portela", "santa-iria-de-azoia"] },
      { name: "Santa Iria de Azoia, São João da Talha e Bobadela", slug: "santa-iria-de-azoia", nearby: ["sacavem-e-prior-velho", "camarate-unhos-apelacao"] },
      { name: "Camarate, Unhos e Apelação", slug: "camarate-unhos-apelacao", nearby: ["santa-iria-de-azoia", "santo-antonio-dos-cavaleiros"] },
      { name: "Santo António dos Cavaleiros e Frielas", slug: "santo-antonio-dos-cavaleiros", nearby: ["camarate-unhos-apelacao", "loures-centro"] },
      { name: "Bucelas", slug: "bucelas", nearby: ["loures-centro", "fanhoes"] },
      { name: "Fanhões", slug: "fanhoes", nearby: ["bucelas", "lousa-loures"] },
      { name: "Lousa", slug: "lousa-loures", nearby: ["fanhoes", "loures-centro"] },
      { name: "Moscavide e Portela", slug: "moscavide-e-portela", nearby: ["sacavem-e-prior-velho"] }
    ]
  },
  {
    name: "Vila Franca de Xira",
    slug: "vila-franca-de-xira",
    freguesias: [
      { name: "Vila Franca de Xira", slug: "vila-franca-de-xira-centro", nearby: ["alverca-do-ribatejo", "povoa-de-santa-iria"] },
      { name: "Alverca do Ribatejo", slug: "alverca-do-ribatejo", nearby: ["vila-franca-de-xira-centro", "povoa-de-santa-iria"] },
      { name: "Póvoa de Santa Iria e Forte da Casa", slug: "povoa-de-santa-iria", nearby: ["alverca-do-ribatejo", "vialonga"] },
      { name: "Alhandra, São João dos Montes e Calhandriz", slug: "alhandra", nearby: ["vila-franca-de-xira-centro", "castanheira-do-ribatejo"] },
      { name: "Vialonga", slug: "vialonga", nearby: ["povoa-de-santa-iria", "vila-franca-de-xira-centro"] },
      { name: "Castanheira do Ribatejo e Cachoeiras", slug: "castanheira-do-ribatejo", nearby: ["alhandra", "vila-franca-de-xira-centro"] }
    ]
  },
  {
    name: "Barreiro",
    slug: "barreiro",
    freguesias: [
      { name: "Barreiro e Lavradio", slug: "barreiro-e-lavradio", nearby: ["alto-do-seixalinho", "palhais-e-coina"] },
      { name: "Alto do Seixalinho, Santo André e Verderena", slug: "alto-do-seixalinho", nearby: ["barreiro-e-lavradio", "palhais-e-coina"] },
      { name: "Palhais e Coina", slug: "palhais-e-coina", nearby: ["barreiro-e-lavradio", "alto-do-seixalinho"] }
    ]
  },
  {
    name: "Moita",
    slug: "moita",
    freguesias: [
      { name: "Moita", slug: "moita-centro", nearby: ["baixa-da-banheira", "alhos-vedros"] },
      { name: "Baixa da Banheira e Vale da Amoreira", slug: "baixa-da-banheira", nearby: ["moita-centro", "alhos-vedros"] },
      { name: "Alhos Vedros", slug: "alhos-vedros", nearby: ["moita-centro", "baixa-da-banheira"] },
      { name: "Gaio-Rosário e Sarilhos Pequenos", slug: "gaio-rosario", nearby: ["moita-centro"] }
    ]
  },
  {
    name: "Mafra",
    slug: "mafra",
    freguesias: [
      { name: "Mafra", slug: "mafra-centro", nearby: ["malveira", "venda-do-pinheiro"] },
      { name: "Ericeira", slug: "ericeira", nearby: ["mafra-centro"] },
      { name: "Malveira e São Miguel de Alcainça", slug: "malveira", nearby: ["mafra-centro", "venda-do-pinheiro"] },
      { name: "Venda do Pinheiro e Santo Estêvão das Galés", slug: "venda-do-pinheiro", nearby: ["malveira", "mafra-centro"] }
    ]
  },
  {
    name: "Seixal",
    slug: "seixal",
    freguesias: [
      { name: "Seixal, Arrentela e Aldeia de Paio Pires", slug: "seixal-centro", nearby: ["amora", "corroios"] },
      { name: "Amora", slug: "amora", nearby: ["seixal-centro", "corroios"] },
      { name: "Corroios", slug: "corroios", nearby: ["amora", "seixal-centro"] },
      { name: "Fernão Ferro", slug: "fernao-ferro", nearby: ["seixal-centro"] }
    ]
  },
  {
    name: "Montijo",
    slug: "montijo",
    freguesias: [
      { name: "Montijo e Afonsoeiro", slug: "montijo-centro", nearby: ["alto-estanqueiro", "sarilhos-grandes"] },
      { name: "Alto Estanqueiro-Jardia", slug: "alto-estanqueiro", nearby: ["montijo-centro", "canha"] },
      { name: "Canha", slug: "canha", nearby: ["alto-estanqueiro", "pegoes"] },
      { name: "Pegões", slug: "pegoes", nearby: ["canha"] },
      { name: "Sarilhos Grandes", slug: "sarilhos-grandes", nearby: ["montijo-centro"] }
    ]
  },
  {
    name: "Alcochete",
    slug: "alcochete",
    freguesias: [
      { name: "Alcochete", slug: "alcochete-centro", nearby: ["samouco", "sao-francisco-alcochete"] },
      { name: "Samouco", slug: "samouco", nearby: ["alcochete-centro"] },
      { name: "São Francisco", slug: "sao-francisco-alcochete", nearby: ["alcochete-centro"] }
    ]
  },
  {
    name: "Palmela",
    slug: "palmela",
    freguesias: [
      { name: "Palmela", slug: "palmela-centro", nearby: ["pinhal-novo", "quinta-do-anjo"] },
      { name: "Pinhal Novo", slug: "pinhal-novo", nearby: ["palmela-centro", "poceirao-e-marateca"] },
      { name: "Poceirão e Marateca", slug: "poceirao-e-marateca", nearby: ["pinhal-novo"] },
      { name: "Quinta do Anjo", slug: "quinta-do-anjo", nearby: ["palmela-centro"] }
    ]
  },
  {
    name: "Sesimbra",
    slug: "sesimbra",
    freguesias: [
      { name: "Sesimbra (Castelo) e Quinta do Conde", slug: "sesimbra-castelo", nearby: ["santiago-sesimbra"] },
      { name: "Santiago", slug: "santiago-sesimbra", nearby: ["sesimbra-castelo"] }
    ]
  },
  // Alentejo Litoral (2026-09-26), mesma fonte e mesmo critério. Tróia não é
  // freguesia (pertence ao Carvalhal), mas entra como Vilamoura em Loulé: é o
  // nome que as pessoas escrevem. Alvalade e Carvalhal ficaram de fora porque
  // o nome já existe em Lisboa e em Barcelos, e a deteção de localização
  // resolve freguesias pelo nome.
  {
    name: "Alcácer do Sal",
    slug: "alcacer-do-sal",
    freguesias: [
      { name: "Comporta", slug: "comporta", nearby: [] },
      { name: "Torrão", slug: "torrao", nearby: [] }
    ]
  },
  {
    name: "Grândola",
    slug: "grandola",
    freguesias: [
      { name: "Tróia", slug: "troia", nearby: [] },
      { name: "Melides", slug: "melides", nearby: [] }
    ]
  },
  {
    name: "Santiago do Cacém",
    slug: "santiago-do-cacem",
    freguesias: [
      { name: "Vila Nova de Santo André", slug: "vila-nova-de-santo-andre", nearby: [] },
      { name: "Cercal do Alentejo", slug: "cercal-do-alentejo", nearby: [] },
      { name: "Ermidas-Sado", slug: "ermidas-sado", nearby: [] }
    ]
  },
  {
    name: "Sines",
    slug: "sines",
    freguesias: [
      { name: "Porto Covo", slug: "porto-covo", nearby: [] }
    ]
  },
  // ═══════════════ Algarve ═══════════════
  {
    name: "Faro",
    slug: "faro",
    freguesias: [
      { name: "Faro (Sé e São Pedro)", slug: "faro-centro", nearby: ["conceicao-de-faro", "montenegro"] },
      { name: "Conceição de Faro", slug: "conceicao-de-faro", nearby: ["faro-centro", "montenegro"] },
      { name: "Estoi", slug: "estoi", nearby: ["santa-barbara-de-nexe", "faro-centro"] },
      { name: "Montenegro", slug: "montenegro", nearby: ["faro-centro", "conceicao-de-faro"] },
      { name: "Santa Bárbara de Nexe", slug: "santa-barbara-de-nexe", nearby: ["estoi", "faro-centro"] }
    ]
  },
  {
    name: "Loulé",
    slug: "loule",
    freguesias: [
      { name: "Loulé (Centro)", slug: "loule-centro", nearby: ["boliqueime", "alte-e-salir"] },
      { name: "Quarteira", slug: "quarteira", nearby: ["vilamoura", "almancil"] },
      { name: "Vilamoura", slug: "vilamoura", nearby: ["quarteira", "almancil"] },
      { name: "Almancil", slug: "almancil", nearby: ["quinta-do-lago", "vale-do-lobo", "quarteira"] },
      { name: "Quinta do Lago", slug: "quinta-do-lago", nearby: ["vale-do-lobo", "almancil"] },
      { name: "Vale do Lobo", slug: "vale-do-lobo", nearby: ["quinta-do-lago", "almancil"] },
      { name: "Boliqueime", slug: "boliqueime", nearby: ["loule-centro", "almancil"] },
      { name: "Alte, Ameixial e Salir", slug: "alte-e-salir", nearby: ["loule-centro"] }
    ]
  },
  {
    name: "Albufeira",
    slug: "albufeira",
    freguesias: [
      { name: "Albufeira e Olhos de Água", slug: "albufeira-centro", nearby: ["guia", "ferreiras"] },
      { name: "Ferreiras", slug: "ferreiras", nearby: ["albufeira-centro", "paderne"] },
      { name: "Guia", slug: "guia", nearby: ["albufeira-centro", "ferreiras"] },
      { name: "Paderne", slug: "paderne", nearby: ["ferreiras"] }
    ]
  },
  {
    name: "Olhão",
    slug: "olhao",
    freguesias: [
      { name: "Olhão", slug: "olhao-centro", nearby: ["quelfes", "pechao"] },
      { name: "Quelfes", slug: "quelfes", nearby: ["olhao-centro", "moncarapacho-e-fuseta"] },
      { name: "Moncarapacho e Fuseta", slug: "moncarapacho-e-fuseta", nearby: ["quelfes", "olhao-centro"] },
      { name: "Pechão", slug: "pechao", nearby: ["olhao-centro"] }
    ]
  },
  {
    name: "São Brás de Alportel",
    slug: "sao-bras-de-alportel",
    freguesias: [
      { name: "São Brás de Alportel", slug: "sao-bras-de-alportel-centro", nearby: [] }
    ]
  },
  {
    name: "Silves",
    slug: "silves",
    freguesias: [
      { name: "Silves", slug: "silves-centro", nearby: ["algoz-e-tunes", "sao-bartolomeu-de-messines"] },
      { name: "Algoz e Tunes", slug: "algoz-e-tunes", nearby: ["silves-centro", "armacao-de-pera"] },
      { name: "Armação de Pêra", slug: "armacao-de-pera", nearby: ["algoz-e-tunes", "pera"] },
      { name: "Pêra", slug: "pera", nearby: ["armacao-de-pera"] },
      { name: "São Bartolomeu de Messines", slug: "sao-bartolomeu-de-messines", nearby: ["silves-centro", "sao-marcos-da-serra"] },
      { name: "São Marcos da Serra", slug: "sao-marcos-da-serra", nearby: ["sao-bartolomeu-de-messines"] }
    ]
  },
  {
    name: "Lagoa",
    slug: "lagoa-algarve",
    freguesias: [
      { name: "Lagoa e Carvoeiro", slug: "lagoa-e-carvoeiro", nearby: ["estombar-e-parchal", "porches"] },
      { name: "Estômbar e Parchal", slug: "estombar-e-parchal", nearby: ["lagoa-e-carvoeiro", "ferragudo"] },
      { name: "Ferragudo", slug: "ferragudo", nearby: ["estombar-e-parchal"] },
      { name: "Porches", slug: "porches", nearby: ["lagoa-e-carvoeiro"] }
    ]
  },
  {
    name: "Tavira",
    slug: "tavira",
    freguesias: [
      { name: "Tavira (Santa Maria e Santiago)", slug: "tavira-centro", nearby: ["conceicao-e-cabanas", "santa-luzia-tavira"] },
      { name: "Conceição e Cabanas de Tavira", slug: "conceicao-e-cabanas", nearby: ["tavira-centro", "luz-de-tavira"] },
      { name: "Luz de Tavira e Santo Estêvão", slug: "luz-de-tavira", nearby: ["conceicao-e-cabanas", "santa-catarina-da-fonte-do-bispo"] },
      { name: "Santa Catarina da Fonte do Bispo", slug: "santa-catarina-da-fonte-do-bispo", nearby: ["luz-de-tavira", "cachopo"] },
      { name: "Santa Luzia", slug: "santa-luzia-tavira", nearby: ["tavira-centro"] },
      { name: "Cachopo", slug: "cachopo", nearby: ["santa-catarina-da-fonte-do-bispo"] }
    ]
  },
  {
    name: "Portimão",
    slug: "portimao",
    freguesias: [
      { name: "Portimão", slug: "portimao-centro", nearby: ["alvor", "mexilhoeira-grande"] },
      { name: "Alvor", slug: "alvor", nearby: ["portimao-centro", "mexilhoeira-grande"] },
      { name: "Mexilhoeira Grande", slug: "mexilhoeira-grande", nearby: ["alvor", "portimao-centro"] }
    ]
  },
  {
    name: "Lagos",
    slug: "lagos",
    freguesias: [
      { name: "Lagos (São Sebastião e Santa Maria)", slug: "lagos-centro", nearby: ["luz-lagos", "odiaxere"] },
      { name: "Luz", slug: "luz-lagos", nearby: ["lagos-centro", "bensafrim"] },
      { name: "Odiáxere", slug: "odiaxere", nearby: ["lagos-centro", "bensafrim"] },
      { name: "Bensafrim e Barão de São João", slug: "bensafrim", nearby: ["luz-lagos", "odiaxere"] }
    ]
  },
  {
    name: "Vila Real de Santo António",
    slug: "vila-real-de-santo-antonio",
    freguesias: [
      { name: "Vila Real de Santo António", slug: "vila-real-de-santo-antonio-centro", nearby: ["monte-gordo"] },
      { name: "Monte Gordo", slug: "monte-gordo", nearby: ["vila-real-de-santo-antonio-centro"] }
    ]
  },
  {
    name: "Castro Marim",
    slug: "castro-marim",
    freguesias: [
      { name: "Castro Marim", slug: "castro-marim-centro", nearby: ["odeleite", "azinhal"] },
      { name: "Odeleite", slug: "odeleite", nearby: ["castro-marim-centro"] },
      { name: "Azinhal", slug: "azinhal", nearby: ["castro-marim-centro"] }
    ]
  },
  {
    name: "Monchique",
    slug: "monchique",
    freguesias: [
      { name: "Monchique", slug: "monchique-centro", nearby: ["alferce", "marmelete"] },
      { name: "Alferce", slug: "alferce", nearby: ["monchique-centro"] },
      { name: "Marmelete", slug: "marmelete", nearby: ["monchique-centro"] }
    ]
  },
  {
    name: "Aljezur",
    slug: "aljezur",
    freguesias: [
      { name: "Aljezur", slug: "aljezur-centro", nearby: ["bordeira", "odeceixe"] },
      { name: "Bordeira", slug: "bordeira", nearby: ["aljezur-centro", "rogil"] },
      { name: "Odeceixe", slug: "odeceixe", nearby: ["aljezur-centro"] },
      { name: "Rogil", slug: "rogil", nearby: ["bordeira"] }
    ]
  },
  {
    name: "Vila do Bispo",
    slug: "vila-do-bispo",
    freguesias: [
      { name: "Vila do Bispo e Raposeira", slug: "vila-do-bispo-centro", nearby: ["sagres", "budens"] },
      { name: "Budens", slug: "budens", nearby: ["vila-do-bispo-centro"] },
      { name: "Sagres", slug: "sagres", nearby: ["vila-do-bispo-centro"] }
    ]
  },
  {
    name: "Alcoutim",
    slug: "alcoutim",
    freguesias: [
      { name: "Alcoutim e Pereiro", slug: "alcoutim-centro", nearby: ["gioes", "martim-longo"] },
      { name: "Giões", slug: "gioes", nearby: ["alcoutim-centro"] },
      { name: "Martim Longo", slug: "martim-longo", nearby: ["vaqueiros", "alcoutim-centro"] },
      { name: "Vaqueiros", slug: "vaqueiros", nearby: ["martim-longo"] }
    ]
  },
  // ─── Braga / Norte (expansão 2026-08-25, equipa local nova) ───
  // Verificado contra pt.wikipedia.org "Lista de freguesias de Braga" + cm-braga.pt —
  // 37 freguesias, inalterado desde a Lei 11-A/2013 (confirmado: zero menções de
  // Braga na Lei 25-A/2025, que só afetou outros concelhos do distrito).
  {
    name: "Braga",
    slug: "braga",
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
      { name: "Vilaça e Fradelos", slug: "vilaca-e-fradelos", nearby: ["figueiredo-braga", "celeiros-aveleda-e-vimieiro", "morreira-e-trandeiras"] }
    ]
  },
  // Verificado contra a Lei n.º 25-A/2025 (texto oficial), cm-guimaraes.pt/municipio/freguesias
  // e geoapi.pt (dados CAOP/DGT) — 55 freguesias, SUBIU de 48 (padrão pós-2013) por causa
  // de 6 uniões desagregadas em 13 novas freguesias autónomas desde as autárquicas de
  // outubro de 2025: prazins-santo-tirso, corvite, tabuadelo, sao-faustino,
  // airao-santa-maria, airao-sao-joao, vermil, conde, gandarela, sande-vila-nova,
  // sande-sao-clemente, serzedo, calvos.
  {
    name: "Guimarães",
    slug: "guimaraes",
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
      { name: "Souto (Santa Maria), Souto (São Salvador) e Gondomar", slug: "souto-santa-maria-souto-sao-salvador-e-gondomar", nearby: ["leitoes-oleiros-e-figueiredo", "ataes-e-rendufe", "gondar"] }
    ]
  },
  // Verificado contra a Lei n.º 25-A/2025 (texto oficial, PDF do Diário da República) +
  // geoapi.pt (CAOP/DGT) + aldeiasportuguesas.pt — 39 freguesias, SUBIU de 34 (padrão
  // pós-2013) por causa de 4 uniões desagregadas em 9 novas freguesias desde as
  // autárquicas de outubro de 2025: ruivaes, novais, gondifelos, cavaloes, outiz,
  // esmeriz, cabecudos, avidos, lagoa-famalicao. Wikipédia estava desatualizada
  // (ainda mostrava 34) — não usada como fonte única.
  {
    name: "Vila Nova de Famalicão",
    slug: "vila-nova-de-famalicao",
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
      { name: "Vilarinho das Cambas", slug: "vilarinho-das-cambas", nearby: ["landim", "pousada-de-saramagos"] }
    ]
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
    name: "Barcelos",
    slug: "barcelos",
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
      { name: "Vila Seca", slug: "vila-seca", nearby: ["paradela", "varzea", "oliveira"] }
    ]
  },
  // Verificado contra a Lei n.º 25-A/2025 (texto oficial) + geoapi.pt/CAOP (endpoint
  // JSON) + cm-viana-castelo.pt/institucional/juntas-de-freguesia — 30 freguesias,
  // SUBIU de 27 (padrão pós-2013) por causa de 3 uniões desagregadas em 6 novas
  // freguesias desde as autárquicas de outubro de 2025: barroselas, carvoeiro,
  // mazarefes, vila-fria, cardielos, serreleis. Wikipédia ainda mostrava 27 —
  // desatualizada, não usada como fonte única. Nome oficial "Vila Nova de Anha"
  // (não só "Anha") confirmado via código INE 160904. Zero colisões de slug.
  {
    name: "Viana do Castelo",
    slug: "viana-do-castelo",
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
      { name: "Vila de Punhe", slug: "vila-de-punhe", nearby: ["vila-fria", "vila-franca", "alvaraes"] }
    ]
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
    name: "Póvoa de Lanhoso",
    slug: "povoa-de-lanhoso",
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
      { name: "Vilela", slug: "vilela", nearby: ["povoa-de-lanhoso", "sao-joao-de-rei", "travassos"] }
    ]
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
    name: "Fafe",
    slug: "fafe",
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
      { name: "Vinhós", slug: "vinhos", nearby: ["agrela-e-serafao", "medelo", "aroes-sao-romao"] }
    ]
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
    name: "Esposende",
    slug: "esposende",
    freguesias: [
      { name: "Antas", slug: "antas", nearby: ["belinho", "mar", "vila-cha-esposende", "forjaes"] },
      { name: "Apúlia", slug: "apulia", nearby: ["fao", "fonte-boa-e-rio-tinto"] },
      { name: "Belinho", slug: "belinho", nearby: ["antas", "mar", "forjaes"] },
      { name: "Curvos", slug: "curvos", nearby: ["palmeira-de-faro", "vila-cha-esposende", "marinhas"] },
      { name: "Esposende", slug: "esposende", nearby: ["fao", "marinhas", "mar", "gandra-esposende"] },
      { name: "Forjães", slug: "forjaes", nearby: ["antas", "belinho", "vila-cha-esposende"] },
      { name: "Fão", slug: "fao", nearby: ["apulia", "esposende", "fonte-boa-e-rio-tinto"] },
      { name: "Gandra", slug: "gandra-esposende", nearby: ["esposende", "marinhas", "gemeses"] },
      { name: "Gemeses", slug: "gemeses", nearby: ["gandra-esposende", "antas", "mar"] },
      { name: "Mar", slug: "mar", nearby: ["esposende", "marinhas", "antas", "gemeses"] },
      { name: "Marinhas", slug: "marinhas", nearby: ["esposende", "mar", "curvos", "palmeira-de-faro"] },
      { name: "Palmeira de Faro", slug: "palmeira-de-faro", nearby: ["marinhas", "curvos", "vila-cha-esposende"] },
      { name: "Fonte Boa e Rio Tinto", slug: "fonte-boa-e-rio-tinto", nearby: ["fao", "apulia", "gemeses"] },
      { name: "Vila Chã", slug: "vila-cha-esposende", nearby: ["curvos", "fonte-boa-e-rio-tinto", "antas", "palmeira-de-faro"] }
    ]
  },
  // Zona de Leiria e Madeira (dono, 2026-11-15). A freguesia sede fica de
  // fora (Leiria, Pousos, Barreira e Cortes; Sé no Funchal): seria igual à
  // página da cidade. Sem dados locais: cai no texto genérico até haver
  // pontos de referência confirmados.
  {
    name: "Leiria",
    slug: "leiria",
    freguesias: [
      { name: "Marrazes e Barosa", slug: "marrazes-e-barosa", nearby: ["parceiros-e-azoia", "regueira-de-pontes", "amor"] },
      { name: "Parceiros e Azoia", slug: "parceiros-e-azoia", nearby: ["marrazes-e-barosa", "santa-eufemia-e-boa-vista", "maceira"] },
      { name: "Santa Eufémia e Boa Vista", slug: "santa-eufemia-e-boa-vista", nearby: ["parceiros-e-azoia", "caranguejeira", "colmeias-e-memoria"] },
      { name: "Caranguejeira", slug: "caranguejeira", nearby: ["santa-eufemia-e-boa-vista", "santa-catarina-da-serra-e-chainca", "arrabal"] },
      { name: "Santa Catarina da Serra e Chainça", slug: "santa-catarina-da-serra-e-chainca", nearby: ["caranguejeira", "arrabal"] },
      { name: "Arrabal", slug: "arrabal", nearby: ["caranguejeira", "santa-catarina-da-serra-e-chainca", "maceira"] },
      { name: "Maceira", slug: "maceira", nearby: ["parceiros-e-azoia", "arrabal"] },
      { name: "Colmeias e Memória", slug: "colmeias-e-memoria", nearby: ["santa-eufemia-e-boa-vista", "milagres"] },
      { name: "Milagres", slug: "milagres", nearby: ["colmeias-e-memoria", "regueira-de-pontes", "bidoeira-de-cima"] },
      { name: "Regueira de Pontes", slug: "regueira-de-pontes", nearby: ["marrazes-e-barosa", "amor", "milagres"] },
      { name: "Amor", slug: "amor", nearby: ["regueira-de-pontes", "marrazes-e-barosa", "monte-real-e-carvide"] },
      { name: "Monte Real e Carvide", slug: "monte-real-e-carvide", nearby: ["amor", "souto-da-carpalhosa-e-ortigosa", "monte-redondo-e-carreira"] },
      { name: "Monte Redondo e Carreira", slug: "monte-redondo-e-carreira", nearby: ["monte-real-e-carvide", "bajouca", "coimbrao"] },
      { name: "Coimbrão", slug: "coimbrao", nearby: ["monte-redondo-e-carreira"] },
      { name: "Bajouca", slug: "bajouca", nearby: ["monte-redondo-e-carreira", "souto-da-carpalhosa-e-ortigosa", "bidoeira-de-cima"] },
      { name: "Souto da Carpalhosa e Ortigosa", slug: "souto-da-carpalhosa-e-ortigosa", nearby: ["monte-real-e-carvide", "bajouca", "bidoeira-de-cima"] },
      { name: "Bidoeira de Cima", slug: "bidoeira-de-cima", nearby: ["souto-da-carpalhosa-e-ortigosa", "milagres", "bajouca"] }
    ]
  },
  {
    name: "Funchal",
    slug: "funchal",
    freguesias: [
      { name: "Santo António", slug: "santo-antonio-funchal", nearby: ["sao-martinho-funchal", "sao-roque-funchal", "sao-pedro-funchal"] },
      { name: "São Martinho", slug: "sao-martinho-funchal", nearby: ["santo-antonio-funchal", "sao-pedro-funchal"] },
      { name: "São Pedro", slug: "sao-pedro-funchal", nearby: ["sao-martinho-funchal", "santa-luzia-funchal", "santo-antonio-funchal"] },
      { name: "Santa Luzia", slug: "santa-luzia-funchal", nearby: ["sao-pedro-funchal", "imaculado-coracao-de-maria", "monte-funchal"] },
      { name: "Imaculado Coração de Maria", slug: "imaculado-coracao-de-maria", nearby: ["santa-luzia-funchal", "santa-maria-maior-funchal", "monte-funchal"] },
      { name: "Santa Maria Maior", slug: "santa-maria-maior-funchal", nearby: ["imaculado-coracao-de-maria", "sao-goncalo-funchal"] },
      { name: "São Gonçalo", slug: "sao-goncalo-funchal", nearby: ["santa-maria-maior-funchal"] },
      { name: "Monte", slug: "monte-funchal", nearby: ["imaculado-coracao-de-maria", "santa-luzia-funchal", "sao-roque-funchal"] },
      { name: "São Roque", slug: "sao-roque-funchal", nearby: ["monte-funchal", "santo-antonio-funchal"] },
      { name: "Sé", slug: "se-funchal", nearby: ["santa-maria-maior-funchal", "sao-pedro-funchal", "santa-luzia-funchal"] }
    ]
  },
  // Leiria e zona (equipa Coimbra) e Madeira (equipa própria); dono, 17 Nov. A sede de concelho tem página de cidade própria.
  {
    name: "Batalha",
    slug: "batalha",
    freguesias: [
      { name: "Golpilheira", slug: "golpilheira", nearby: ["reguengo-do-fetal"] },
      { name: "Reguengo do Fetal", slug: "reguengo-do-fetal", nearby: ["golpilheira", "sao-mamede-batalha"] },
      { name: "São Mamede", slug: "sao-mamede-batalha", nearby: ["reguengo-do-fetal"] }
    ]
  },
  {
    name: "Marinha Grande",
    slug: "marinha-grande",
    freguesias: [
      { name: "Vieira de Leiria", slug: "vieira-de-leiria", nearby: ["moita-marinha-grande"] },
      { name: "Moita", slug: "moita-marinha-grande", nearby: ["vieira-de-leiria"] }
    ]
  },
  {
    name: "Nazaré",
    slug: "nazare",
    freguesias: [
      { name: "Famalicão", slug: "famalicao-nazare", nearby: ["valado-dos-frades"] },
      { name: "Valado dos Frades", slug: "valado-dos-frades", nearby: ["famalicao-nazare"] }
    ]
  },
  {
    name: "Porto de Mós",
    slug: "porto-de-mos",
    freguesias: [
      { name: "Mira de Aire", slug: "mira-de-aire", nearby: ["juncal"] },
      { name: "Juncal", slug: "juncal", nearby: ["mira-de-aire", "calvaria-de-cima"] },
      { name: "Calvaria de Cima", slug: "calvaria-de-cima", nearby: ["juncal", "pedreiras"] },
      { name: "Pedreiras", slug: "pedreiras", nearby: ["calvaria-de-cima", "serro-ventoso"] },
      { name: "Serro Ventoso", slug: "serro-ventoso", nearby: ["pedreiras", "alqueidao-da-serra"] },
      { name: "Alqueidão da Serra", slug: "alqueidao-da-serra", nearby: ["serro-ventoso", "sao-bento-porto-de-mos"] },
      { name: "São Bento", slug: "sao-bento-porto-de-mos", nearby: ["alqueidao-da-serra"] }
    ]
  },
  {
    name: "Ourém",
    slug: "ourem",
    freguesias: [
      { name: "Nossa Senhora da Piedade", slug: "nossa-senhora-da-piedade-ourem", nearby: ["nossa-senhora-das-misericordias"] },
      { name: "Nossa Senhora das Misericórdias", slug: "nossa-senhora-das-misericordias", nearby: ["nossa-senhora-da-piedade-ourem", "caxarias"] },
      { name: "Caxarias", slug: "caxarias", nearby: ["nossa-senhora-das-misericordias", "atouguia-ourem"] },
      { name: "Atouguia", slug: "atouguia-ourem", nearby: ["caxarias", "seica"] },
      { name: "Seiça", slug: "seica", nearby: ["atouguia-ourem", "espite"] },
      { name: "Espite", slug: "espite", nearby: ["seica", "urqueira"] },
      { name: "Urqueira", slug: "urqueira", nearby: ["espite"] }
    ]
  },
  {
    name: "Pombal",
    slug: "pombal",
    freguesias: [
      { name: "Louriçal", slug: "lourical", nearby: ["redinha"] },
      { name: "Redinha", slug: "redinha", nearby: ["lourical", "abiul"] },
      { name: "Abiul", slug: "abiul", nearby: ["redinha", "almagreira"] },
      { name: "Almagreira", slug: "almagreira", nearby: ["abiul", "carnide-pombal"] },
      { name: "Carnide", slug: "carnide-pombal", nearby: ["almagreira", "carrico"] },
      { name: "Carriço", slug: "carrico", nearby: ["carnide-pombal", "meirinhas"] },
      { name: "Meirinhas", slug: "meirinhas", nearby: ["carrico", "pelariga"] },
      { name: "Pelariga", slug: "pelariga", nearby: ["meirinhas", "vermoil"] },
      { name: "Vermoil", slug: "vermoil", nearby: ["pelariga", "vila-ca"] },
      { name: "Vila Cã", slug: "vila-ca", nearby: ["vermoil", "guia-ilha-e-mata-mourisca"] },
      { name: "Guia, Ilha e Mata Mourisca", slug: "guia-ilha-e-mata-mourisca", nearby: ["vila-ca"] }
    ]
  },
  {
    name: "Alcobaça",
    slug: "alcobaca",
    freguesias: [
      { name: "Benedita", slug: "benedita", nearby: ["sao-martinho-do-porto"] },
      { name: "São Martinho do Porto", slug: "sao-martinho-do-porto", nearby: ["benedita", "pataias-e-martinganca"] },
      { name: "Pataias e Martingança", slug: "pataias-e-martinganca", nearby: ["sao-martinho-do-porto", "aljubarrota"] },
      { name: "Aljubarrota", slug: "aljubarrota", nearby: ["pataias-e-martinganca", "alfeizerao"] },
      { name: "Alfeizerão", slug: "alfeizerao", nearby: ["aljubarrota", "turquel"] },
      { name: "Turquel", slug: "turquel", nearby: ["alfeizerao", "barrio"] },
      { name: "Bárrio", slug: "barrio", nearby: ["turquel", "cela"] },
      { name: "Cela", slug: "cela", nearby: ["barrio", "maiorga"] },
      { name: "Maiorga", slug: "maiorga", nearby: ["cela", "evora-de-alcobaca"] },
      { name: "Évora de Alcobaça", slug: "evora-de-alcobaca", nearby: ["maiorga", "vimeiro-alcobaca"] },
      { name: "Vimeiro", slug: "vimeiro-alcobaca", nearby: ["evora-de-alcobaca", "coz-alpedriz-e-montes"] },
      { name: "Coz, Alpedriz e Montes", slug: "coz-alpedriz-e-montes", nearby: ["vimeiro-alcobaca"] }
    ]
  },
  {
    name: "Câmara de Lobos",
    slug: "camara-de-lobos",
    freguesias: [
      { name: "Estreito de Câmara de Lobos", slug: "estreito-de-camara-de-lobos", nearby: ["curral-das-freiras"] },
      { name: "Curral das Freiras", slug: "curral-das-freiras", nearby: ["estreito-de-camara-de-lobos", "jardim-da-serra"] },
      { name: "Jardim da Serra", slug: "jardim-da-serra", nearby: ["curral-das-freiras", "quinta-grande"] },
      { name: "Quinta Grande", slug: "quinta-grande", nearby: ["jardim-da-serra"] }
    ]
  },
  {
    name: "Santa Cruz",
    slug: "santa-cruz",
    freguesias: [
      { name: "Camacha", slug: "camacha", nearby: ["gaula"] },
      { name: "Gaula", slug: "gaula", nearby: ["camacha", "santo-antonio-da-serra"] },
      { name: "Santo António da Serra", slug: "santo-antonio-da-serra", nearby: ["gaula"] }
    ]
  },
  {
    name: "Machico",
    slug: "machico",
    freguesias: [
      { name: "Caniçal", slug: "canical", nearby: ["porto-da-cruz"] },
      { name: "Porto da Cruz", slug: "porto-da-cruz", nearby: ["canical", "agua-de-pena"] },
      { name: "Água de Pena", slug: "agua-de-pena", nearby: ["porto-da-cruz"] }
    ]
  }
];

// src/constants/commercialPolicy.ts
var RESPONSE_PROMISE = "Resposta em menos de 1 minuto";
var DRYING_PROMISE = "Secagem média de 2 a 5 horas, dependendo da ventilação, do tecido e das condições do espaço.";
var SOFA_DRYING_RANGE = "2 a 5 horas";
var SOFA_DRYING_PROMISE = `Secagem média de ${SOFA_DRYING_RANGE}, dependendo da ventilação, do tecido e das condições do espaço.`;
var SATISFACTION_PROMISE = "Se não ficar satisfeito, contacte-nos até 48 horas após o serviço e repetimos a intervenção sem custos. Após esse prazo, esta garantia comercial de repetição deixa de se aplicar, sem prejuízo dos direitos legais.";
var PRICE_PROMISE = "A simulação é uma estimativa. Confirmamos o preço com base nos artigos, medidas, tratamento e deslocação antes da marcação. O valor confirmado mantém-se para esse serviço; alterações ao pedido são orçamentadas previamente.";
var DEPOSIT_MIN_EUR = 20;
var DEPOSIT_RULE = `Para reservas com mais de 2 semanas de antecedência pedimos um sinal de 15% (mínimo ${DEPOSIT_MIN_EUR}€), pago por MB Way ou transferência, que desconta no total. A data fica reservada quando recebemos o comprovativo. O sinal não é reembolsável; se remarcar, passa para a nova data.`;
var AVAILABILITY_PROMISE = "Procuramos realizar o serviço no próprio dia ou no dia seguinte, mediante disponibilidade confirmada pela equipa.";
var COVERAGE_PROMISE = "Equipas em Braga, Porto, Coimbra, Lisboa e Algarve, com cobertura regular do litoral entre Viana do Castelo e o Algarve. Outras localidades mediante confirmação.";
var TREATMENT_EXTRAS = "A limpeza remove sujidade e resíduos das fibras. O tratamento anti-ácaros e a desbacterização são extras opcionais, escolhidos e orçamentados separadamente.";
var RUG_PICKUP_MIN_AREA_M2 = 3;
var RUG_PICKUP_MAX_AREA_M2 = 12;
var RUG_PICKUP_RULE = `Neste momento não estamos a fazer recolhas de tapetes: a lavagem é feita em sua casa. A única exceção é a zona do Porto, com tapetes que somem entre ${RUG_PICKUP_MIN_AREA_M2} e ${RUG_PICKUP_MAX_AREA_M2} m².`;
var RUG_PICKUP_FEE = 20;
var foldCity = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
var CITY_AREA = new Map(cities.map((c) => [foldCity(c.name), c.area]));
var RUG_PICKUP_FEE_RULE = `A recolha e entrega tem um custo adicional de ${RUG_PICKUP_FEE}€.`;
var RUG_SERVICE_SLUGS = ["limpeza-tapetes", "limpeza-alcatifas"];
var RUG_TRAVEL_RULE = "Os tapetes e as alcatifas sozinhos pagam sempre a deslocação da localidade.";
var travelFees = Object.values(locationPrices);
var TRAVEL_FEE_MIN = Math.min(...travelFees);
var TRAVEL_FEE_MAX = Math.max(...travelFees);
var TRAVEL_RULE = `A deslocação é calculada à parte conforme a localidade (a partir de ${TRAVEL_FEE_MIN}€) e pode ser grátis em pedidos acima de certo valor (desde ${Math.min(...Object.values(TRAVEL_FREE_ABOVE))}€, conforme a localidade e o serviço).`;
var TRAVEL_PROMISE = `A deslocação é cobrada à parte, entre ${TRAVEL_FEE_MIN}€ e ${TRAVEL_FEE_MAX}€ conforme a localidade, e pode ser grátis em pedidos acima de certo valor. O valor de cada cidade aparece na respetiva página e a morada concreta é confirmada antes da marcação. Nas zonas a mais de 20 km da equipa, um serviço abaixo de ${SMALL_ORDER_FAR_MIN}€ tem mais ${SMALL_ORDER_FAR_SURCHARGE}€; juntando outra peça na mesma visita, deixa de ter. ${RUG_TRAVEL_RULE}`;
var SERVICE_CONDITIONS = [
  PRICE_PROMISE,
  TRAVEL_PROMISE,
  SATISFACTION_PROMISE,
  DRYING_PROMISE,
  AVAILABILITY_PROMISE,
  `${RESPONSE_PROMISE}.`,
  COVERAGE_PROMISE,
  TREATMENT_EXTRAS
];
var SITE_MIN_ORDER_EUR = 59;
var SITE_MIN_ORDER_TEXT = `O pedido mínimo é ${SITE_MIN_ORDER_EUR}€. Para continuar, junte mais um artigo (outro tapete, um sofá, um colchão, cadeiras…).`;

// src/data/landingFaqExpansion.ts
var faq = (id, topic, question, answer, article) => ({ id, topic, question, answer, ...article ? { article } : {} });
var LANDING_FAQ_EXPANSION = {
  "limpeza-sofas": [
    faq("sofa-puff", "orcamento", "O puff solto conta como parte do sofá?", "Identifique o puff separadamente e envie uma fotografia ao lado do sofá. Um apoio de pés independente não deve ser confundido com uma chaise integrada. A equipa confirma como incluir cada peça na proposta."),
    faq("sofa-poltrona", "orcamento", "Que opção escolho para uma poltrona?", "Mostre a poltrona e indique se tem braços, apoio de pés ou mecanismo reclinável. A opção de um lugar pode servir de referência, mas confirmamos o modelo antes de fechar o preço; não conte automaticamente uma poltrona como uma cadeira de jantar."),
    faq("sofa-so-mancha", "orcamento", "Limpar apenas uma nódoa custa o mesmo que limpar o sofá?", "Explique se pretende tratar uma zona ou limpar o conjunto. Não existe uma redução automática do preço proporcional ao tamanho da nódoa: é necessário avaliar o tecido, o acesso e o trabalho envolvido antes de propor uma intervenção localizada."),
    faq("sofa-modulos-soltos", "orcamento", "Como conto um sofá composto por módulos separados?", "Envie uma fotografia do conjunto montado e indique quantos módulos tem, incluindo cantos e apoios de pés. O número de almofadas nem sempre corresponde ao número de lugares. Confirmamos a configuração em vez de somar opções à sorte no simulador."),
    faq("sofa-eletrico", "preparacao", "O que devo indicar se o sofá for elétrico ou reclinável?", "Avise sobre os mecanismos, tomadas incorporadas e cabos, e disponibilize as instruções do fabricante. Combine com a equipa a posição de acesso e a preparação da peça; não desmonte componentes elétricos para facilitar a limpeza."),
    faq("sofa-sem-etiqueta", "preparacao", "Posso pedir avaliação de um sofá sem etiqueta?", "Sim. Envie imagens do revestimento, das costuras e do conjunto e indique a marca ou o modelo, se souber. A fotografia não identifica sempre a composição; a falta de etiqueta pode exigir avaliação adicional e limitar o método possível."),
    faq("sofa-segunda-mao", "preparacao", "Que informação é útil sobre um sofá comprado em segunda mão?", "Indique o estado em que o recebeu, manchas, odores e quaisquer tratamentos conhecidos. Não é preciso adivinhar o histórico: explique o que sabe e o que desconhece. Uma fotografia do conjunto ajuda a preparar a avaliação."),
    faq("sofa-parede", "preparacao", "Preciso de afastar o sofá da parede?", "Avise se quer limpar as costas ou outras zonas encostadas à parede. Combine o acesso antes da visita, sobretudo em peças pesadas ou fixas. Não arraste o sofá sozinho nem retire proteções do chão sem necessidade."),
    faq("sofa-pele", "tratamento", "Um sofá de pele pode receber a mesma limpeza de um sofá de tecido?", "Não se deve escolher o método apenas pelo formato do sofá. Pele, pele sintética e tecido precisam de identificação própria. Envie a etiqueta e fotografias para confirmar a possibilidade de intervenção; o processo ilustrado para tecido não é uma instrução para aplicar água em pele."),
    faq("sofa-veludo", "tratamento", "As marcas no veludo são sempre manchas?", "Nem sempre. Antes de prometer um resultado, é preciso observar o revestimento e distinguir sujidade, direção do pelo e desgaste. Mostre a zona sob mais de um ângulo e não a esfregue repetidamente para tentar igualar a aparência."),
    faq("sofa-vapor", "tratamento", "Extração e limpeza a vapor são a mesma coisa?", "O guia do serviço descreve a extração de água e resíduos com um bocal de estofos. Isso não significa aplicar vapor a todos os sofás. A escolha do procedimento depende da etiqueta e da avaliação, não da palavra usada para pedir a limpeza."),
    faq("sofa-lixivia", "tratamento", "Uma marca deixada por lixívia sai com a limpeza?", "Se o produto retirou ou alterou a cor do tecido, a limpeza não repõe o corante. Informe a equipa sobre o produto aplicado e mostre a área. Essa situação deve ser distinguida de resíduos removíveis antes de decidir o tratamento."),
    faq("sofa-odor-regressa", "cuidados", "E se o cheiro voltar depois de o sofá secar?", "Contacte a equipa e descreva quando o odor reapareceu e em que zona. Pode existir uma origem não resolvida no interior ou no espaço. Não aplique perfume para esconder o cheiro antes da avaliação; comunique até 48 horas se pretender acionar a garantia de repetição."),
    faq("sofa-aureola", "cuidados", "O que faço se notar uma auréola após a secagem?", "Fotografe a zona com luz uniforme e contacte a equipa, indicando quando a marca se tornou visível. Não volte a molhar ou esfregar por iniciativa própria. Para acionar a garantia de repetição gratuita, comunique o resultado até 48 horas após o serviço."),
    faq("sofa-animais-regresso", "cuidados", "Quando deixo os animais voltar para o sofá?", "Durante o serviço mantenha os animais afastados da área de trabalho. Depois, respeite a secagem completa e as instruções específicas dos produtos ou extras aplicados. Confirme com a equipa as condições de utilização, sem assumir que todas as intervenções têm o mesmo prazo."),
    faq("sofa-secador", "cuidados", "Posso usar um secador de cabelo para acelerar a secagem?", "Não improvise uma secagem com calor concentrado. Pergunte à equipa como ventilar o espaço e respeite as instruções do fabricante do sofá. A média de secagem não autoriza aquecer o tecido para cumprir um horário.")
  ],
  "limpeza-colchoes": [
    faq("colchao-topper", "orcamento", "O topper está incluído no orçamento do colchão?", "Identifique o topper como uma peça separada, com medidas, material e etiqueta próprios. Não assuma que pode receber o mesmo procedimento do colchão ou que está incluído no preço. A equipa confirma a possibilidade e o valor antes de marcar."),
    faq("colchao-duas-faces-preco", "orcamento", "O preço contempla as duas faces do colchão?", "Indique se pretende tratar uma ou duas faces e mostre o modelo. Confirmamos o âmbito antes da marcação, incluindo o acesso e as limitações do fabricante. Não duplique a quantidade no simulador para representar a segunda face sem esclarecer o pedido."),
    faq("colchao-berco", "orcamento", "Como peço orçamento para um colchão de berço?", "Envie as medidas e a etiqueta do colchão de berço, distinguindo-o de um colchão de cama individual. A peça precisa de avaliação própria; não atribuímos um preço reduzido apenas por ser mais pequena nem assumimos compatibilidade com qualquer método."),
    faq("colchao-varias-camas", "orcamento", "Como indico colchões de várias camas no mesmo pedido?", "Conte cada colchão e separe-os por tamanho. Se uma cama tiver dois colchões individuais, indique duas peças, não um colchão de casal. Associe as fotografias às medidas para confirmar o orçamento do conjunto."),
    faq("colchao-beliche", "preparacao", "Como preparo o acesso a um colchão num beliche?", "Informe a altura, a forma de acesso e se o colchão pode ser retirado segundo as instruções da cama. Combine o manuseamento com a equipa; não levante uma peça pesada de uma posição elevada sozinho."),
    faq("colchao-mudanca", "preparacao", "Convém limpar o colchão antes ou depois de uma mudança?", "Diga onde estará o colchão durante a visita e quando será transportado. A limpeza deve ser planeada com tempo para a secagem completa, sem embalar a peça húmida. O melhor momento depende da logística e das condições dos dois espaços."),
    faq("colchao-humido", "preparacao", "Devo avisar se o colchão ainda estiver molhado de um acidente?", "Sim. Indique o líquido, a quantidade aproximada e quando aconteceu. A presença de humidade no interior altera a avaliação e o planeamento da secagem. Não esconda a zona com um protetor antes de a mostrar à equipa."),
    faq("colchao-etiqueta-capa", "preparacao", "A etiqueta da capa basta para decidir a limpeza de todo o colchão?", "Não necessariamente. A capa e o núcleo podem ter instruções diferentes. Mostre as etiquetas disponíveis e identifique o modelo. A possibilidade de lavar uma capa não significa que seja permitido molhar a espuma ou o restante interior."),
    faq("colchao-tempur", "tratamento", "Todos os colchões viscoelásticos podem ser limpos por extração?", "Não. As restrições dependem do modelo: por exemplo, o fabricante TEMPUR não permite lavar, limpar a vapor ou a seco o seu material. A capa tem instruções próprias. Identificamos o colchão antes de confirmar o procedimento, sem generalizar a todos os viscoelásticos."),
    faq("colchao-afundado", "tratamento", "A limpeza corrige um colchão afundado?", "Não. Depressões permanentes, molas danificadas ou perda de suporte são questões da estrutura. A avaliação da limpeza incide no estado do revestimento e na sujidade; não substitui reparação nem devolve o suporte de um colchão novo."),
    faq("colchao-perfume", "tratamento", "Perfumar o colchão é equivalente a higienizá-lo?", "Não. Um cheiro agradável não demonstra que a sujidade foi removida. Explique se aplicou perfumes ou sprays e em que zonas. A avaliação considera os resíduos e a origem do odor, e não apenas o cheiro no momento da visita."),
    faq("colchao-protecao-imper", "tratamento", "Também fazem impermeabilização de colchões?", "Não disponibilizamos impermeabilização de colchões. A proteção por impermeabilização do nosso catálogo destina-se a sofás e cadeiras compatíveis. Para o colchão, confirme a limpeza e quaisquer tratamentos opcionais efetivamente disponíveis no orçamento."),
    faq("colchao-vertical", "cuidados", "Devo pôr o colchão na vertical para secar?", "Não existe uma posição válida para todos os modelos. Siga as instruções da equipa e do fabricante, evitando dobrar, pressionar ou apoiar a peça de forma instável. O peso e a construção devem ser considerados antes de a mover."),
    faq("colchao-calor", "cuidados", "Posso ligar uma manta elétrica para secar o colchão?", "Não use uma manta elétrica como método improvisado de secagem. Alguns fabricantes, incluindo TEMPUR, desaconselham-na nos seus materiais. Combine a ventilação e o tempo de espera com a equipa; não volte a fazer a cama enquanto houver humidade."),
    faq("colchao-odor-depois", "cuidados", "E se o colchão continuar com odor depois de seco?", "Informe a equipa sobre a zona e a intensidade do odor e diga se a peça já secou por completo. Pode ser necessário rever o alcance da intervenção. Não aplique outro produto antes desse contacto; a garantia de repetição deve ser acionada até 48 horas."),
    faq("colchao-embalar", "cuidados", "Posso embalar o colchão logo depois da limpeza?", "Só depois de estar completamente seco. Diga antecipadamente se vai guardar ou transportar a peça, para planear a visita. O acondicionamento deve seguir as instruções do fabricante, sem fechar humidade dentro da embalagem.")
  ],
  "limpeza-tapetes": [
    faq("tapete-passadeira", "orcamento", "Uma passadeira comprida pode ser indicada no simulador?", "Sim. Introduza o comprimento e a largura da peça e identifique-a como passadeira. Envie fotografias da frente e do verso; as medidas preparam a avaliação, mas não transformam o pedido num preço fixo por metro quadrado."),
    faq("tapete-pelo-alto", "orcamento", "O pelo alto do tapete é relevante para o orçamento?", "Indique que se trata de um tapete de pelo alto e mostre um pormenor da fibra e da base. A mesma área pode corresponder a peças com construções diferentes. O orçamento considera a avaliação do tapete, não apenas as medidas."),
    faq("tapete-artesanal", "orcamento", "Que dados envio para avaliar um tapete artesanal ou antigo?", "Além das medidas, envie imagens do desenho, verso, franjas e zonas frágeis. Indique a origem e os materiais apenas se os conhecer. A equipa confirma se pode intervir e em que condições, sem tratar a peça como um tapete sintético comum."),
    faq("tapete-verso-ambito", "orcamento", "Posso pedir avaliação da limpeza do verso do tapete?", "Sim, mostre o verso e explique o que pretende tratar. A base pode ter materiais ou limitações diferentes da frente. A intervenção nessa zona precisa de confirmação e não deve ser presumida como incluída no orçamento da superfície."),
    faq("tapete-enrolado-visita", "preparacao", "Deixo o tapete enrolado para a equipa chegar?", "Combine primeiro a modalidade da visita e o local de avaliação. Pode ser necessário observar a peça aberta e o verso. Não a enrole se estiver húmida nem prepare transporte sem confirmar que haverá recolha."),
    faq("tapete-antiderrapante", "preparacao", "Devo mostrar a manta antiderrapante que está por baixo?", "Sim. Identifique se a manta é solta ou faz parte do tapete e mostre quaisquer marcas na base. Ela não entra automaticamente no serviço. Combine a retirada e o acesso ao verso antes da visita."),
    faq("tapete-fragil-aspirar", "preparacao", "Preciso de aspirar um tapete com franjas soltas antes da visita?", "Não force uma aspiração sobre zonas frágeis só para preparar a limpeza. Mostre as franjas e fios soltos à equipa. A manutenção deve respeitar o fabricante e o estado da peça; confirme como a deixar preparada sem agravar danos."),
    faq("tapete-chao", "preparacao", "É importante indicar o chão onde o tapete está colocado?", "Sim. Informe se está sobre madeira, pedra ou outro revestimento e mostre o espaço disponível. O local de trabalho e a proteção das superfícies devem ser combinados antes de escolher a modalidade de limpeza."),
    faq("tapete-sisal", "tratamento", "Um tapete de sisal pode ser molhado como um sintético?", "Não assuma que o método de um tapete serve para outro. Envie a etiqueta e confirme as restrições do fabricante do sisal antes de aplicar água ou produtos. A equipa pode limitar a intervenção se não houver condições de compatibilidade."),
    faq("tapete-viscose", "tratamento", "Como é avaliado um tapete de viscose?", "Começamos pela identificação da fibra, das instruções de manutenção e do estado da superfície e da base. Mostre alterações de aspeto e intervenções anteriores. Não confirmamos limpeza por extração apenas a partir do tamanho da peça."),
    faq("tapete-cola", "tratamento", "A limpeza resolve uma base que está a desfazer-se?", "Não. A degradação da base, cola ou revestimento do verso precisa de ser distinguida de sujidade. Mostre resíduos que se soltam da peça antes da visita. A limpeza não reconstitui a base e pode não ser adequada ao estado do tapete."),
    faq("tapete-manchas-numeradas", "tratamento", "Devo identificar separadamente manchas de origens diferentes?", "Sim. Uma fotografia geral com indicação de cada zona ajuda a distinguir, por exemplo, um derrame recente de uma marca antiga. Diga o que sabe sobre cada mancha e os produtos aplicados; não é necessário adivinhar a origem das restantes."),
    faq("tapete-aspirar-depois", "cuidados", "Quando retomo a aspiração habitual do tapete?", "Espere pela secagem completa e siga a indicação recebida para a fibra, o pelo e as franjas. Se o fabricante limitar o uso de escovas rotativas ou outros acessórios, mantenha essas restrições após a limpeza."),
    faq("tapete-sol", "cuidados", "Devo pôr o tapete ao sol para secar mais depressa?", "Confirme com a equipa o local de secagem adequado à peça e siga as instruções do fabricante. Não mude um tapete húmido para o exterior ou para uma fonte de calor sem orientação, sobretudo quando o material ou as cores exigem cuidados próprios."),
    faq("tapete-aureola", "cuidados", "E se uma marca no tapete reaparecer depois de secar?", "Fotografe a zona e contacte a equipa antes de aplicar mais produto. Indique se a marca corresponde a um derrame antigo e quando reapareceu. Se pretender acionar a garantia de repetição gratuita, comunique até 48 horas após a intervenção."),
    faq("tapete-aparencia", "cuidados", "Como comparo o aspeto do tapete antes e depois?", "Observe a peça seca, de preferência sob a mesma luz e no mesmo sentido. Fotografias de ângulos diferentes podem dificultar a comparação. Se persistirem marcas ou dúvidas, mostre imagens de conjunto e de pormenor à equipa.")
  ],
  "limpeza-cadeiras": [
    faq("cadeira-banco", "orcamento", "Um banco estofado comprido conta como uma cadeira?", "Mostre o banco e indique as suas medidas e partes estofadas. Não o converta automaticamente em uma ou várias cadeiras no simulador. A equipa confirma a forma de orçamentar a peça conforme o modelo e o âmbito pedido."),
    faq("cadeira-bracos", "orcamento", "Os braços estofados devem ser indicados no pedido?", "Sim. Mostre assento, encosto e braços, quando também têm revestimento. As fotografias devem representar a cadeira completa para confirmarmos o que será tratado, sem assumir que todos os modelos têm apenas um assento."),
    faq("cadeira-parte-lote", "orcamento", "Posso pedir limpeza só de algumas cadeiras do conjunto?", "Indique apenas as unidades que quer limpar e a quantidade de cada modelo. O escalão do orçamento corresponde às cadeiras incluídas no pedido, não ao número total que possui. Pode pedir uma comparação antes de decidir."),
    faq("cadeira-proteger-parte", "orcamento", "Posso limpar todas as cadeiras e proteger apenas algumas?", "Explique quantas pretende limpar e quantas pretende impermeabilizar, identificando os modelos. A proteção é uma escolha separada e depende da compatibilidade. Confirme a seleção e os valores discriminados antes da marcação."),
    faq("cadeira-desaparafusar", "preparacao", "Devo desaparafusar os assentos antes da limpeza?", "Não desmonte a cadeira por iniciativa própria. Informe se os assentos são removíveis e disponibilize as instruções do modelo. A equipa combina o acesso necessário; desmontagem e reparação não devem ser presumidas como parte da limpeza."),
    faq("cadeira-documentos", "preparacao", "Como preparo uma zona de trabalho com cadeiras de escritório?", "Retire documentos e objetos pessoais das cadeiras e deixe uma passagem para o equipamento. Informe quais os postos que podem ficar sem uso durante a intervenção e a secagem. A deslocação de equipamentos do escritório deve ser combinada."),
    faq("cadeira-etiqueta-diferentes", "preparacao", "Cadeiras iguais por fora podem ter tecidos diferentes?", "Podem existir versões ou revestimentos substituídos. Se algumas foram reestofadas, identifique-as e envie as respetivas etiquetas ou informação do estofador. Não presuma que a instrução de uma cadeira se aplica a todo o conjunto."),
    faq("cadeira-instavel", "preparacao", "Devo avisar se uma cadeira estiver instável?", "Sim. Assinale pés soltos, costuras abertas ou partes que não suportam manuseamento normal. A limpeza não corrige a estabilidade da estrutura. A equipa precisa de conhecer essas limitações antes de mover ou tratar a peça."),
    faq("cadeira-tinta", "tratamento", "Uma mancha de caneta na cadeira pode ser tratada?", "Mostre o tipo e a extensão da marca e diga se já tentou removê-la. Tinta e alteração da cor do tecido não são a mesma coisa. A equipa avalia as possibilidades, sem garantir remoção nem recomendar solventes caseiros."),
    faq("cadeira-madeira", "tratamento", "A limpeza dos estofos também restaura a madeira da cadeira?", "Não. O tratamento das zonas estofadas não é restauro de madeira, metal ou verniz. Mostre os diferentes materiais da peça e confirme o âmbito. Manchas ou danos na estrutura devem ser avaliados separadamente."),
    faq("cadeira-pele", "tratamento", "Cadeiras de pele sintética seguem o processo ilustrado para tecido?", "Não automaticamente. Identifique o revestimento e mostre zonas descamadas ou danificadas. O guia de extração dos estofos de tecido não deve ser usado como instrução universal para pele sintética; a possibilidade de intervenção precisa de confirmação."),
    faq("cadeira-botoes", "tratamento", "Botões e costuras fundos interferem na avaliação?", "Mostre os recantos, costuras e botões, sobretudo se estiverem soltos ou acumularem resíduos. A construção do estofo influencia o acesso às zonas a tratar. Confirme esses detalhes com a equipa antes de fechar o pedido."),
    faq("cadeira-recolocar-mesa", "cuidados", "Posso encostar as cadeiras à mesa enquanto secam?", "Deixe os estofos com circulação de ar e evite que assentos ou encostos húmidos fiquem pressionados contra outras superfícies. Combine uma disposição que preserve a passagem e permita a secagem completa antes de arrumar o conjunto."),
    faq("cadeira-capa-voltar", "cuidados", "Quando volto a colocar uma capa avulsa na cadeira?", "Espere pela secagem completa do estofo e da própria capa, respeitando as instruções de ambos. A capa avulsa não deve servir para esconder uma zona ainda húmida ou uma marca que precise de ser mostrada à equipa."),
    faq("cadeira-pes-sujos", "cuidados", "Limpar o assento dispensa os cuidados com pés e rodas?", "Não. O orçamento dos estofos não substitui a manutenção da estrutura ou das rodas. Siga as instruções do fabricante para essas peças e evite levar resíduos do chão para o assento durante o manuseamento."),
    faq("cadeira-marca-depois", "cuidados", "O que faço se uma cadeira do lote ficar com uma marca visível?", "Identifique qual a cadeira e envie fotografias da zona e do conjunto. Isso permite relacionar a observação com o modelo e o tratamento feito. Não esfregue novamente antes de contactar a equipa; a garantia de repetição é acionada até 48 horas.")
  ],
  "limpeza-alcatifas": [
    faq("alcatifa-area-parcial", "orcamento", "Posso pedir orçamento apenas para uma zona da alcatifa?", "Delimite a área pretendida e envie uma fotografia do espaço completo. Confirme onde termina a intervenção e se existem móveis fixos. O orçamento deve identificar o que fica incluído, sem pressupor que toda a divisão será limpa."),
    faq("alcatifa-planta", "orcamento", "Uma planta do espaço ajuda a preparar o orçamento?", "Sim, desde que indique as medidas e quais as zonas alcatifadas a tratar. Assinale áreas excluídas, escadas e mobiliário fixo. A planta complementa as fotografias, mas não substitui a avaliação do estado e do acesso."),
    faq("alcatifa-fases", "orcamento", "Posso pedir uma proposta para limpar o espaço por fases?", "Explique as áreas, os horários possíveis e as passagens que precisam de ficar acessíveis. A equipa confirma se a organização por fases é viável e como fica o orçamento. Não assuma que várias visitas têm as mesmas condições de uma só."),
    faq("alcatifa-placas", "orcamento", "Como identifico alcatifa em placas no pedido?", "Indique que são placas e envie uma fotografia das juntas e da área total. Não é necessário levantar peças para pedir orçamento. A equipa confirma as condições de instalação e o âmbito da limpeza antes de intervir."),
    faq("alcatifa-cabos", "preparacao", "O que faço aos cabos que passam pela alcatifa?", "Informe a equipa e combine com o responsável do espaço a libertação da área. Não desligue nem desloque instalações por iniciativa própria se não souber como fazê-lo. A passagem do equipamento deve estar planeada antes da visita."),
    faq("alcatifa-evento", "preparacao", "Posso marcar limpeza antes de um evento no espaço?", "Indique a hora em que a sala precisa de estar utilizável e reserve margem para a secagem. A disponibilidade e as condições são confirmadas antes de marcar; a média de secagem não é uma garantia de reabertura a uma hora exata."),
    faq("alcatifa-piso-tecnico", "preparacao", "Devo avisar se houver piso técnico sob a alcatifa?", "Sim. Informe sobre painéis de acesso, instalações por baixo e restrições de manutenção do piso. A equipa precisa desses dados para avaliar a intervenção. Não levante painéis nem assuma que o processo de uma laje contínua é adequado a esse espaço."),
    faq("alcatifa-po-obras", "preparacao", "Que informação envio se houve obras junto da alcatifa?", "Descreva os trabalhos e mostre poeira, tinta ou outros resíduos presentes. Distinguir sujidade de uso de resíduos de obra ajuda a avaliar o pedido. Não apresente uma limpeza pós-obra como manutenção normal sem explicar o estado do espaço."),
    faq("alcatifa-produto-espuma", "tratamento", "É relevante ter usado champô doméstico na alcatifa?", "Sim. Indique o produto, a zona e a quantidade aproximada, se souber. Resíduos de intervenções anteriores precisam de ser considerados na avaliação; não aplique mais champô para preparar a visita."),
    faq("alcatifa-substituir", "tratamento", "A limpeza substitui a troca de placas danificadas?", "Não. Placas rasgadas, queimadas ou com perda permanente de revestimento não são reparadas por limpeza. Identifique esses pontos para separar o que é sujidade do que precisa de manutenção da instalação."),
    faq("alcatifa-derrame-grande", "tratamento", "Um derrame que encharcou a alcatifa é tratado como limpeza normal?", "Não deve ser assumido como um pedido normal sem avaliação. Diga o que derramou, quando e qual a área afetada, incluindo possível humidade por baixo. A equipa confirma o alcance do serviço; limpeza superficial não equivale a recuperação de uma inundação."),
    faq("alcatifa-contraste", "tratamento", "Limpar só o corredor pode deixar diferença para o resto da sala?", "Pode existir diferença de estado entre áreas com uso e manutenção distintos. Mostre o conjunto e combine os limites da limpeza. Para um tom igual em toda a sala, o melhor é limpar a área inteira."),
    faq("alcatifa-ar-condicionado", "cuidados", "O ar condicionado substitui a avaliação da secagem?", "Não. A presença de ar condicionado, por si só, não confirma que a alcatifa está seca. Combine a ventilação do espaço com a equipa e verifique as condições antes de retomar o uso normal."),
    faq("alcatifa-passagem-obrigatoria", "cuidados", "E se precisar de atravessar a zona antes de estar seca?", "Avise dessa necessidade antes da marcação para planear a circulação. Depois do serviço, siga as indicações da equipa para a área tratada. Não cubra a alcatifa húmida com plástico ou mobiliário para improvisar uma passagem."),
    faq("alcatifa-rodas", "cuidados", "Quando volto a usar cadeiras com rodas sobre a alcatifa?", "Espere pela secagem completa e pela indicação de reabertura da zona. Antes de repor as cadeiras, verifique a limpeza das rodas e respeite as instruções do revestimento. O fim da intervenção não significa que a área esteja imediatamente pronta a usar."),
    faq("alcatifa-marca-regressa", "cuidados", "Como comunico uma mancha que reapareceu na alcatifa?", "Marque a localização numa fotografia ou na planta e indique quando ficou novamente visível. Contacte a equipa antes de aplicar outro produto. A garantia de repetição gratuita exige comunicação até 48 horas após a intervenção.")
  ],
  impermeabilizacao: [
    faq("protecao-quantidade-parcial", "orcamento", "Posso impermeabilizar só parte das cadeiras do conjunto?", "Indique exatamente quantas cadeiras pretende proteger e quais os modelos. O orçamento deve representar as peças selecionadas, não o conjunto inteiro. A opção Essencial ou Premium e os respetivos valores são confirmados antes da marcação.", "cadeiras"),
    faq("protecao-chaise", "orcamento", "A chaise longue precisa de constar do pedido de proteção?", "Sim, a chaise faz parte do sofá a proteger. Escolha o número de lugares e envie uma fotografia do conjunto completo, com a chaise e os restantes módulos. A área a proteger é confirmada antes da marcação, para não ficar nenhuma parte por considerar.", "sofa"),
    faq("protecao-puff", "orcamento", "A proteção do sofá inclui um puff separado?", "Não assuma que inclui peças independentes. Mostre o puff, as medidas e o revestimento e peça a sua avaliação no mesmo orçamento. A compatibilidade e o âmbito são confirmados para cada artigo.", "sofa"),
    faq("protecao-so-servico", "orcamento", "Posso pedir apenas impermeabilização, sem nova limpeza?", "Explique o estado da peça e quando foi limpa, se aplicável. A proteção não obriga a contratar limpeza sem necessidade, mas a superfície precisa de reunir as condições adequadas. A equipa avalia se pode aplicar o produto ou se é preciso preparar o tecido primeiro."),
    faq("protecao-obras", "preparacao", "Devo esperar que acabem as obras na sala para proteger o sofá?", "Informe sobre poeiras, pintura e trabalhos previstos e combine a sequência com a equipa. A aplicação exige condições adequadas da peça e do espaço; não se deve usar a impermeabilização como substituto de proteger o mobiliário durante obras.", "sofa"),
    faq("protecao-capas", "preparacao", "Aplica-se a proteção sobre uma manta que cobre o sofá?", "O pedido deve identificar qual o revestimento a proteger. Uma manta ou capa avulsa não é automaticamente parte do sofá nem da proposta. Mostre a peça tal como será utilizada e confirme o âmbito antes de preparar a visita.", "sofa"),
    faq("protecao-ficha", "preparacao", "Posso pedir as instruções do produto antes da aplicação?", "Peça à equipa a informação do tratamento proposto, incluindo preparação, utilização e manutenção. Se tiver restrições indicadas pelo fabricante do móvel, partilhe-as antes da marcação. Não substituímos essa confirmação por uma promessa genérica de compatibilidade."),
    faq("protecao-uso-sala", "preparacao", "A sala precisa de ficar disponível depois da aplicação?", "Planeie um período sem utilização das peças tratadas e combine as condições de ventilação e acesso. A cura pode exigir até 24 horas. Avise se não consegue reservar esse intervalo, para avaliar a marcação antes do serviço."),
    faq("protecao-desgaste", "tratamento", "Impermeabilizar evita rasgões ou marcas de unhas?", "Não. A proteção contra absorção de líquidos não é uma barreira física contra unhas, cortes ou desgaste mecânico. Esses danos precisam de outros cuidados e não devem ser apresentados como um resultado esperado da impermeabilização."),
    faq("protecao-cor", "tratamento", "A impermeabilização recupera a cor de um tecido desbotado?", "Não. A aplicação não repõe corante nem reconstrói fibras gastas. Mostre alterações de cor antes da visita para avaliar a peça. A decisão de proteger deve ser separada da expectativa de restauro do revestimento."),
    faq("protecao-exterior", "tratamento", "Depois de protegido, posso deixar o sofá de interior à chuva?", "Não. A impermeabilização proposta para estofos compatíveis não transforma um sofá de interior em mobiliário de exterior. Siga as condições de utilização do fabricante e não exponha a peça à chuva para testar a proteção.", "sofa"),
    faq("protecao-antiacaros-cadeiras", "tratamento", "A proteção das cadeiras é o mesmo que a limpeza normal?", "Não. A impermeabilização é opcional e a limpeza é um serviço distinto. Nas opções de proteção de cadeiras atualmente apresentadas no orçamento, desbacterização e anti-ácaros são indicados como incluídos na proteção; isso não os torna automaticamente incluídos numa limpeza sem impermeabilização.", "cadeiras"),
    faq("protecao-lavar-depois", "cuidados", "Devo informar uma futura equipa de limpeza de que existe proteção?", "Sim. Guarde a identificação do tratamento e a data e partilhe-as antes de outra limpeza. As instruções do produto aplicado e do tecido orientam a manutenção. Não assuma que qualquer método preserva o acabamento."),
    faq("protecao-teste-copo", "cuidados", "É aconselhável entornar água para testar a proteção?", "Não faça derrames de teste por iniciativa própria, especialmente durante a cura. Peça à equipa esclarecimentos sobre a aplicação e as condições de utilização. Perante um derrame real, retire o líquido prontamente conforme as instruções recebidas."),
    faq("protecao-seco-toque", "cuidados", "Estar seco ao toque significa que a proteção já está ativa?", "Não necessariamente. A cura do tratamento e a sensação de superfície seca são coisas diferentes. Respeite o prazo indicado pela equipa, que pode chegar a 24 horas, antes de utilizar a peça."),
    faq("protecao-registo", "cuidados", "Que informação devo guardar depois da impermeabilização?", "Guarde a data, as peças tratadas, a opção escolhida e as instruções de manutenção fornecidas. Esse registo ajuda a esclarecer dúvidas e a avaliar futuras limpezas ou reaplicações, sem depender apenas da aparência do tecido.")
  ]
};

// src/data/landingFaqPool.ts
var common = [
  { id: "estimativa", topic: "orcamento", question: "O valor do simulador é o preço final?", answer: PRICE_PROMISE },
  { id: "deslocacao", topic: "orcamento", question: "A deslocação está incluída no preço do serviço?", answer: ({ municipality, serviceSlug }) => {
    const fee = locationPrices[municipality];
    return fee === void 0 ? "A deslocação é cobrada à parte. Indique a localidade e a morada para confirmarmos o valor antes da marcação." : RUG_SERVICE_SLUGS.includes(serviceSlug) ? `Não: o preço por m² é o da lavagem. A deslocação ${cityPrep(municipality)} ${municipality} são ${fee}€. ${RUG_PICKUP_FEE_RULE}` : `Não: o preço mostrado é o do serviço. ${TRAVEL_RULE} A taxa da tabela para ${municipality} é ${fee}€. Confirmamos a morada e o total do pedido antes da marcação.`;
  } },
  { id: "orcamento-gratuito", topic: "orcamento", question: "Pedir orçamento tem algum custo ou compromisso?", answer: `O orçamento é gratuito e sem compromisso. Envie fotografias, quantidades e localidade para avaliarmos o pedido. ${RESPONSE_PROMISE}.` },
  { id: "sinal", topic: "orcamento", question: "Preciso de pagar algo antes do serviço?", answer: DEPOSIT_RULE },
  { id: "marcacao", topic: "preparacao", question: "É possível marcar para hoje ou amanhã?", answer: AVAILABILITY_PROMISE },
  { id: "acesso", topic: "preparacao", question: "Que informações sobre o acesso devo indicar?", answer: "Indique o piso, a existência de elevador e eventuais restrições de acesso ou estacionamento. Estes detalhes ajudam a equipa a organizar a visita e a confirmar as condições antes da marcação." },
  { id: "fotografias", topic: "preparacao", question: "Que fotografias ajudam a preparar o orçamento?", answer: "Envie uma fotografia da peça ou área completa e pormenores das manchas, do desgaste e da etiqueta do material, se existir. Avise também se já aplicou algum produto." },
  { id: "avaliacao", topic: "tratamento", question: "O material é avaliado antes de começar?", answer: "Sim. A avaliação do tecido, do estado e das intervenções anteriores orienta a escolha do procedimento. As limitações identificadas são explicadas antes de executar o serviço." },
  { id: "danos", topic: "tratamento", question: "O serviço também repara rasgões e tecido desgastado?", answer: "Não. Rasgões, costuras abertas, perda de cor e desgaste do tecido são danos materiais. Devem ser identificados antes da intervenção e não são corrigidos por limpeza ou aplicação de proteção." },
  { id: "produtos-anteriores", topic: "tratamento", question: "Devo avisar se já usei um tira-nódoas?", answer: "Sim. Diga qual foi o produto, onde o aplicou e quando, mesmo que a mancha não tenha saído. Se possível, mostre a embalagem. Essa informação é relevante para avaliar resíduos e possíveis alterações do tecido." },
  { id: "garantia", topic: "cuidados", question: "O que faço se não ficar satisfeito com o resultado?", answer: SATISFACTION_PROMISE },
  { id: "manchas-preexistentes", topic: "cuidados", question: "Uma mancha antiga retira a garantia de repetição?", answer: `Não. A existência de manchas preexistentes não exclui a repetição gratuita comunicada até 48 horas. Explicamos as limitações antes do serviço; repetir a intervenção não significa garantir a remoção de todas as manchas. ${SATISFACTION_PROMISE}` },
  { id: "manutencao", topic: "cuidados", question: "Como devo escolher os produtos de manutenção?", answer: "Siga a etiqueta do artigo e as orientações dadas pela equipa para o material e tratamento realizados. Evite misturar produtos ou aplicar um produto novo numa zona visível sem verificar a compatibilidade." }
];
var initialByService = {
  "limpeza-sofas": [
    { id: "sofa-quantidade", topic: "orcamento", question: "Como indico o tamanho do sofá para receber orçamento?", answer: "Indique o número de lugares e se tem chaise longue, canto ou módulos separados. Uma fotografia completa ajuda a confirmar a configuração. Use a tabela do simulador para os tamanhos disponíveis; peças fora dessa tabela são avaliadas por orçamento." },
    { id: "sofa-chaise", topic: "orcamento", question: "Como indico um sofá com chaise longue no simulador?", answer: "Escolha o número de lugares do sofá; a chaise não é uma opção à parte no simulador. Envie uma fotografia do conjunto completo e indique se existem outros módulos, para confirmarmos a configuração antes de marcar." },
    { id: "sofa-protecao", topic: "orcamento", question: "Limpar e impermeabilizar o sofá são o mesmo serviço?", answer: "Não. A limpeza trata a sujidade e os resíduos; a impermeabilização acrescenta proteção ao tecido compatível. Pode pedir ambos, mas a proteção deve ser escolhida e discriminada no orçamento." },
    { id: "sofa-espaco", topic: "preparacao", question: "O que devo retirar do sofá antes da visita?", answer: "Retire mantas, objetos pessoais e artigos que estejam sobre o sofá. Deixe espaço de acesso à volta e avise a equipa se a peça for difícil de deslocar. Não é necessário desmontar o sofá por iniciativa própria." },
    { id: "sofa-almofadas", topic: "preparacao", question: "Devo retirar as capas das almofadas antes da limpeza?", answer: "Não retire as capas sem combinar com a equipa. A etiqueta e a construção do sofá determinam como devem ser tratadas. Uma capa removível não significa que possa ir à máquina de lavar." },
    { id: "sofa-sofa-cama", topic: "preparacao", question: "Como preparo um sofá-cama?", answer: "Avise que se trata de um sofá-cama e indique se o pedido inclui apenas os estofos ou também o colchão interior. Retire a roupa de cama e confirme com a equipa como deixar o mecanismo acessível." },
    { id: "sofa-lavagem", topic: "tratamento", question: "Lavagem e higienização de sofás são tratamentos diferentes?", answer: `Estas expressões podem descrever o mesmo pedido de limpeza profissional. O procedimento é definido pelo material e pelo estado do sofá, não apenas pelo nome usado na pesquisa. ${TREATMENT_EXTRAS}` },
    { id: "sofa-odores", topic: "tratamento", question: "A limpeza resolve sempre o cheiro a urina no sofá?", answer: "O resultado depende de onde a urina penetrou e do estado do enchimento. A limpeza do tecido pode não resolver uma origem de odor no interior. Indique há quanto tempo aconteceu e o que já aplicou para avaliarmos as possibilidades e limitações." },
    { id: "sofa-manchas", topic: "tratamento", question: "Conseguem retirar manchas de café ou vinho?", answer: "Avaliamos o tipo de tecido, a antiguidade da mancha e os produtos já usados antes de escolher o tratamento. A pré-lavagem amolece a mancha e a extração retira o que está nas fibras." },
    { id: "sofa-secagem", topic: "cuidados", question: "Quanto tempo devo esperar para usar o sofá?", answer: `${SOFA_DRYING_PROMISE} Volte a utilizar o sofá quando estiver completamente seco e siga as indicações da equipa.` },
    { id: "sofa-cobrir", topic: "cuidados", question: "Posso colocar uma manta no sofá logo após a limpeza?", answer: "Espere pela secagem completa. Cobrir tecido ainda húmido dificulta a circulação do ar. Durante a secagem, mantenha o espaço ventilado de acordo com as orientações da equipa." },
    { id: "sofa-frequencia", topic: "cuidados", question: "Com que frequência devo limpar o sofá?", answer: "A frequência depende do uso, da presença de animais, dos derrames e das indicações do fabricante. Observe o estado do tecido e peça avaliação quando houver sujidade acumulada ou odores persistentes, em vez de seguir um intervalo igual para todos os sofás." }
  ],
  "limpeza-colchoes": [
    { id: "colchao-medidas", topic: "orcamento", question: "Que tamanho de colchão devo selecionar no orçamento?", answer: "Meça a largura e o comprimento e compare com as opções do simulador. Se tiver dúvidas entre casal e King/Queen, envie as medidas. Indique separadamente os colchões com tamanhos diferentes." },
    { id: "colchao-tratamento", topic: "orcamento", question: "O preço da limpeza inclui tratamento anti-ácaros?", answer: TREATMENT_EXTRAS },
    { id: "colchao-cabeceira", topic: "orcamento", question: "A cabeceira e a base da cama estão incluídas?", answer: "O pedido de limpeza do colchão não inclui automaticamente a cabeceira ou a base estofada. Envie fotografias e indique essas peças para serem avaliadas e discriminadas no orçamento." },
    { id: "colchao-roupa", topic: "preparacao", question: "Devo retirar os lençóis e o protetor do colchão?", answer: "Sim. Retire lençóis, cobertores e protetores para deixar o colchão acessível. A lavagem desses artigos é uma tarefa separada e deve seguir as respetivas etiquetas." },
    { id: "colchao-faces", topic: "preparacao", question: "Preciso de virar ou levantar o colchão antes da visita?", answer: "Combine com a equipa quais as faces a tratar e informe sobre limitações de acesso ou peso. Não tente levantar sozinho um colchão pesado. A construção e a etiqueta também devem ser consideradas." },
    { id: "colchao-horario", topic: "preparacao", question: "Como organizar a limpeza se preciso de dormir nessa cama?", answer: `${DRYING_PROMISE} Reserve tempo para secar completamente antes de voltar a fazer a cama. Avise a equipa de que precisa de a utilizar nessa noite para avaliar o horário e as condições, sem garantia de um prazo exato.` },
    { id: "colchao-amarelo", topic: "tratamento", question: "As manchas amareladas desaparecem sempre?", answer: "Não necessariamente. Suor, tempo de uso e oxidação podem alterar a cor do revestimento. A limpeza pode melhorar o estado do tecido sem o devolver à cor original. As limitações são explicadas antes do serviço." },
    { id: "colchao-espuma", topic: "tratamento", question: "Um colchão de espuma exige cuidados diferentes?", answer: "A composição, a etiqueta e o estado do colchão orientam a avaliação. Informe se é de espuma, látex, molas ou outra construção e envie a etiqueta, quando disponível. O procedimento deve respeitar as limitações do fabricante." },
    { id: "colchao-alergia", topic: "tratamento", question: "Higienizar o colchão é o mesmo que fazer tratamento anti-ácaros?", answer: `${TREATMENT_EXTRAS} Higienização não deve ser interpretada como esterilização ou garantia de benefícios clínicos.` },
    { id: "colchao-lencois", topic: "cuidados", question: "Quando posso voltar a colocar os lençóis?", answer: "Só quando o colchão estiver completamente seco. Lençóis ou protetores colocados demasiado cedo podem reter humidade. Verifique também as zonas de contacto e siga a orientação da equipa." },
    { id: "colchao-ventilacao", topic: "cuidados", question: "A falta de ventilação pode atrasar a secagem?", answer: `Sim. ${DRYING_PROMISE} Se o quarto ventila pouco, avise antes da marcação para planearmos as condições de secagem.` },
    { id: "colchao-protetor", topic: "cuidados", question: "Como manter o colchão depois da limpeza?", answer: "Use roupa de cama limpa, mantenha a ventilação e siga as instruções do fabricante sobre rotação e manutenção. Se usar um protetor, coloque-o apenas depois de o colchão secar completamente." }
  ],
  "limpeza-tapetes": [
    { id: "tapete-preco", topic: "orcamento", question: "Existe um preço fixo por metro quadrado de tapete?", answer: `Sim: ${RUG_PRICE_NOTE} Indique a largura e o comprimento de cada tapete e o preço final sai logo, com a lavagem feita em sua casa.` },
    { id: "tapete-varios", topic: "orcamento", question: "Como peço orçamento para vários tapetes?", answer: "Meça cada tapete separadamente e adicione as respetivas dimensões no simulador. Identifique nas fotografias qual corresponde a cada medida, sobretudo se tiverem fibras ou estados diferentes." },
    { id: "tapete-redondo", topic: "orcamento", question: "Como indico as medidas de um tapete redondo ou irregular?", answer: "Indique que a forma é redonda ou irregular e envie uma fotografia com as maiores medidas. Num tapete redondo, informe o diâmetro. Confirmamos a forma e as dimensões para preparar o orçamento." },
    { id: "tapete-moveis", topic: "preparacao", question: "Devo retirar os móveis que estão sobre o tapete?", answer: "Informe quais os móveis sobre o tapete e combine o acesso com a equipa. Retire objetos pequenos e frágeis. Não mova sozinho peças pesadas nem arraste móveis que possam danificar o tapete ou o chão." },
    { id: "tapete-etiqueta", topic: "preparacao", question: "A etiqueta do tapete é importante para o orçamento?", answer: "Sim. Uma fotografia da etiqueta pode ajudar a identificar a fibra e as restrições de manutenção. Envie também imagens da frente, do verso e das franjas, quando existirem." },
    { id: "tapete-local", topic: "preparacao", question: "A limpeza é feita em casa ou o tapete é recolhido?", answer: `A lavagem é feita em sua casa, com extração profunda, e o tapete fica seco em 2 a 5 horas. ${RUG_PICKUP_RULE} ${RUG_PICKUP_FEE_RULE}` },
    { id: "tapete-cores", topic: "tratamento", question: "Há cuidados especiais com tapetes de cores fortes?", answer: "Sim. A composição e a estabilidade das cores precisam de avaliação, especialmente em peças artesanais ou sem etiqueta. A equipa explica as limitações antes de decidir o procedimento." },
    { id: "tapete-franjas", topic: "tratamento", question: "As franjas e o verso precisam de avaliação própria?", answer: "Sim. Podem ter materiais e um estado de conservação diferentes da superfície. Mostre franjas soltas, cola, zonas frágeis ou alterações no verso antes de começar." },
    { id: "tapete-protecao", topic: "tratamento", question: "Posso pedir impermeabilização para o tapete?", answer: "Fazemos, mas não é a nossa recomendação, por isso não aparece na lista do site. Um tapete está sempre em contacto com os pés, o que desgasta o efeito da impermeabilização muito mais depressa. Por isso não conseguimos prever a garantia: a da impermeabilização Premium e a da Essencial não são as mesmas que damos nos sofás e nas cadeiras. Se quiser fazer na mesma, peça o preço pelo WhatsApp." },
    { id: "tapete-secagem", topic: "cuidados", question: "Quanto tempo demora o tapete a secar?", answer: `${DRYING_PROMISE} A espessura e o suporte do tapete também devem ser considerados. Confirme a secagem completa antes de o voltar a usar normalmente.` },
    { id: "tapete-enrolar", topic: "cuidados", question: "Posso enrolar o tapete depois da limpeza?", answer: "Não o enrole nem guarde enquanto houver humidade. Confirme a secagem da superfície e do verso e siga as indicações recebidas para o material da peça." },
    { id: "tapete-derrame", topic: "cuidados", question: "O que faço se voltar a entornar um líquido no tapete?", answer: "Absorva suavemente o excesso com um pano limpo, sem esfregar nem encharcar. Siga a etiqueta e peça orientação antes de aplicar produtos, sobretudo em fibras delicadas ou cores que possam transferir." }
  ],
  "limpeza-cadeiras": [
    { id: "cadeira-quantidade", topic: "orcamento", question: "O preço por cadeira depende da quantidade?", answer: "Sim. O simulador apresenta os escalões da tabela para a quantidade selecionada. Indique o total de cadeiras a limpar e envie fotografias se forem modelos diferentes. O valor é confirmado antes da marcação." },
    { id: "cadeira-modelos", topic: "orcamento", question: "Posso incluir cadeiras de modelos diferentes no mesmo pedido?", answer: "Sim, indique a quantidade de cada modelo e mostre o assento e o encosto nas fotografias. Confirmamos as peças e o âmbito do serviço antes de fechar o orçamento." },
    { id: "cadeira-protecao", topic: "orcamento", question: "A impermeabilização das cadeiras está incluída na limpeza?", answer: "Não é incluída automaticamente na limpeza. Pode escolher proteção para cadeiras compatíveis e comparar as opções Essencial e Premium no orçamento, com os valores discriminados." },
    { id: "cadeira-acesso", topic: "preparacao", question: "Como deixo as cadeiras preparadas para a visita?", answer: "Retire objetos e capas avulsas e deixe acesso aos assentos e encostos. Informe se há cadeiras frágeis, instáveis ou difíceis de deslocar para combinar o manuseamento adequado." },
    { id: "cadeira-escritorio", topic: "preparacao", question: "Que detalhes devo mostrar numa cadeira de escritório?", answer: "Mostre o assento, o encosto e a etiqueta, se existir. Indique se o revestimento é tecido, rede ou outro material e avise sobre mecanismos ou peças danificadas." },
    { id: "cadeira-capas", topic: "preparacao", question: "Devo lavar as capas das cadeiras antes da visita?", answer: "Confirme primeiro com a equipa se são capas removíveis e o que a etiqueta permite. Lavar uma capa por um método incompatível pode alterar a forma ou a cor antes da avaliação." },
    { id: "cadeira-assento", topic: "tratamento", question: "Limpam apenas o assento ou também o encosto?", answer: "Indique todas as partes estofadas que pretende limpar. O âmbito depende do modelo e é confirmado no orçamento; não se deve assumir que peças não mostradas nas fotografias estão incluídas." },
    { id: "cadeira-gordura", topic: "tratamento", question: "As manchas de comida nas cadeiras de jantar têm solução?", answer: "Avaliamos o tipo de mancha, o tecido e o tempo decorrido. Gordura e resíduos alimentares podem exigir atenção específica, mas manchas antigas ou alterações de cor podem não desaparecer totalmente." },
    { id: "cadeira-rede", topic: "tratamento", question: "Uma cadeira de rede é tratada como uma cadeira de tecido?", answer: "A rede e os estofos podem ter construções e limitações diferentes. Envie uma fotografia e a etiqueta para avaliação. Não aplicamos uma regra única apenas por ambas serem cadeiras." },
    { id: "cadeira-secagem", topic: "cuidados", question: "Quando posso voltar a sentar-me nas cadeiras?", answer: `${DRYING_PROMISE} Aguarde até os assentos e encostos estarem completamente secos antes de os usar.` },
    { id: "cadeira-empilhar", topic: "cuidados", question: "Posso empilhar ou cobrir as cadeiras enquanto secam?", answer: "Evite encostar superfícies húmidas, empilhar ou cobrir os estofos durante a secagem. Deixe circular o ar e siga as orientações da equipa para o modelo tratado." },
    { id: "cadeira-manutencao", topic: "cuidados", question: "Como evito acumulação de sujidade nos assentos?", answer: "Remova regularmente resíduos soltos pelo método permitido na etiqueta e trate derrames sem esfregar. Não use sempre o mesmo produto em cadeiras com revestimentos diferentes sem verificar a compatibilidade." }
  ],
  "limpeza-alcatifas": [
    { id: "alcatifa-preco", topic: "orcamento", question: "A limpeza de alcatifa tem preço fixo por metro quadrado?", answer: `Sim: ${CARPET_PRICE_NOTE} Confirmamos a área, o estado e as condições do espaço. Envie as medidas e fotografias para receber a proposta.` },
    { id: "alcatifa-divisoes", topic: "orcamento", question: "Como meço alcatifa em várias divisões?", answer: "Indique largura e comprimento de cada área separadamente. Assinale corredores, recantos e zonas que não entram no pedido, para evitar contar áreas a mais ou omitir partes a limpar." },
    { id: "alcatifa-escadas", topic: "orcamento", question: "Como peço orçamento para escadas alcatifadas?", answer: "Indique o número de degraus, as dimensões aproximadas e os patamares. Envie fotografias de conjunto e pormenor; escadas não devem ser descritas apenas como uma divisão plana." },
    { id: "alcatifa-mobiliario", topic: "preparacao", question: "A divisão precisa de ficar completamente vazia?", answer: "Combine quais as áreas a limpar e os móveis que podem ser deslocados em segurança. Identifique mobiliário fixo ou pesado para definirmos previamente o acesso e o âmbito da intervenção." },
    { id: "alcatifa-circulacao", topic: "preparacao", question: "Como organizo a passagem das pessoas durante o serviço?", answer: "Informe se a área é uma passagem obrigatória. Combine com a equipa o acesso durante a limpeza e a secagem, sobretudo em corredores e escadas, antes de escolher o horário." },
    { id: "alcatifa-levantada", topic: "preparacao", question: "Devo avisar se a alcatifa estiver descolada ou com ondulações?", answer: "Sim. Mostre zonas levantadas, juntas abertas ou desgaste antes da visita. A limpeza não substitui a reparação da fixação, e esses pontos podem limitar o procedimento." },
    { id: "alcatifa-passagem", topic: "tratamento", question: "As marcas escuras nas zonas de passagem desaparecem?", answer: "Podem resultar de sujidade, mas também de desgaste ou compactação das fibras. A avaliação distingue essas situações; limpar não reconstrói fibras gastas nem garante uma aparência uniforme." },
    { id: "alcatifa-rodapes", topic: "tratamento", question: "É possível limpar a sujidade junto dos rodapés?", answer: "Mostre essas zonas nas fotografias e confirme o acesso junto das paredes. O resultado depende do material, da origem e da antiguidade das marcas; as limitações são avaliadas antes da intervenção." },
    { id: "alcatifa-humidade", topic: "tratamento", question: "A limpeza resolve a causa de humidade na alcatifa?", answer: "Não. Uma infiltração ou outra fonte de humidade precisa de ser identificada e resolvida. Avise a equipa antes de marcar: limpar a superfície não substitui a reparação da causa." },
    { id: "alcatifa-secagem", topic: "cuidados", question: "Quanto tempo devo reservar para a secagem da alcatifa?", answer: `${DRYING_PROMISE} Confirme com a equipa quando pode retomar a circulação normal na área tratada.` },
    { id: "alcatifa-moveis-voltar", topic: "cuidados", question: "Quando posso voltar a colocar os móveis sobre a alcatifa?", answer: "Aguarde a secagem completa e siga as indicações sobre recolocação do mobiliário. Peças pesadas ou bases em contacto com zonas húmidas podem dificultar a secagem." },
    { id: "alcatifa-rotina", topic: "cuidados", question: "Como cuidar das zonas de maior passagem depois da limpeza?", answer: "Adapte a manutenção à intensidade de uso e à etiqueta da alcatifa. Remova resíduos soltos regularmente e comunique manchas persistentes; não tente compensar desgaste com aplicações repetidas de produtos." }
  ],
  "impermeabilizacao": [
    { id: "protecao-opcoes", topic: "orcamento", question: "Posso comparar Essencial e Premium antes de escolher?", answer: "Sim. O simulador permite comparar as opções disponíveis e os respetivos acréscimos para as peças escolhidas. Confirme o material e o âmbito da proteção com a equipa antes da marcação." },
    { id: "protecao-pecas", topic: "orcamento", question: "Que peças devo indicar no orçamento de impermeabilização?", answer: "Indique se pretende proteger sofás, cadeiras ou ambos, com as quantidades e configurações. Envie fotografias e etiquetas, se existirem. Tapetes não fazem parte deste serviço." },
    { id: "protecao-limpeza", topic: "orcamento", question: "A limpeza está incluída no preço da impermeabilização?", answer: "Não deve assumir que está incluída. Indique se a peça precisa também de limpeza para receber uma proposta com os dois serviços discriminados. O estado do tecido é avaliado antes da aplicação." },
    { id: "protecao-novo", topic: "preparacao", question: "Posso impermeabilizar um sofá ou cadeiras novos?", answer: "Peça avaliação do material e informe se já trazem algum acabamento de fábrica. Uma peça nova não é automaticamente compatível com qualquer produto de proteção." },
    { id: "protecao-anterior", topic: "preparacao", question: "Devo avisar se já existe proteção no tecido?", answer: "Sim. Diga quando foi aplicada e qual o produto ou tratamento, se souber. A equipa precisa dessa informação para avaliar compatibilidade e condições de reaplicação." },
    { id: "protecao-seco", topic: "preparacao", question: "O tecido pode estar húmido quando a proteção é aplicada?", answer: "Avise se a peça foi limpa recentemente ou ainda está húmida. As condições necessárias para aplicar o produto dependem do material e do tratamento; a equipa confirma quando é adequado avançar." },
    { id: "protecao-limites", topic: "tratamento", question: "A proteção impede todas as manchas?", answer: "Não. A impermeabilização pode ajudar a reduzir a absorção de líquidos em tecidos compatíveis, mas não torna a peça imune a manchas. O tipo de líquido, o desgaste e a rapidez de atuação continuam a importar." },
    { id: "protecao-remover", topic: "tratamento", question: "A impermeabilização elimina manchas que já existem?", answer: "Não. A proteção não é um método de remoção de manchas. O estado inicial e a eventual necessidade de limpeza devem ser avaliados antes, sem prometer recuperar alterações permanentes do tecido." },
    { id: "protecao-compativel", topic: "tratamento", question: "Todos os tecidos de sofás e cadeiras podem ser protegidos?", answer: "A compatibilidade deve ser avaliada a partir do material, da etiqueta e do estado da peça. Informe sobre acabamentos anteriores e zonas danificadas; não existe uma indicação automática para todos os tecidos." },
    { id: "protecao-cura", topic: "cuidados", question: "Quando posso usar a peça depois da impermeabilização?", answer: "A cura do produto pode exigir até 24 horas e é diferente da secagem de uma limpeza. Siga o prazo e as instruções indicados pela equipa para o tratamento aplicado antes de voltar a usar a peça." },
    { id: "protecao-derrame", topic: "cuidados", question: "O que faço se cair líquido sobre o tecido protegido?", answer: "Absorva o líquido rapidamente com um pano limpo, sem esfregar. Não deixe o derrame permanecer no tecido para testar a proteção. Siga as instruções de manutenção do tratamento aplicado." },
    { id: "protecao-reaplicar", topic: "cuidados", question: "Como sei se a proteção precisa de ser reaplicada?", answer: "Informe a equipa sobre o tempo desde a aplicação, o uso e as limpezas posteriores. A avaliação do estado e do tratamento existente orienta a necessidade de reaplicação; não provoque derrames para testar." }
  ]
};
var byService = { ...initialByService };
for (const service of Object.keys(initialByService)) {
  byService[service] = [...initialByService[service], ...LANDING_FAQ_EXPANSION[service]];
}

// src/components/quiz/QuizTypes.ts
var sofaPrices = [
  { waterproofingUpsellDiscount: 10, id: "1-lugar", label: "1 Lugar", cleaningPrice: 49, waterproofingPrice: 39, bothPrice: 89, originalBothPrice: 88, waterproofingPremiumPrice: 79 },
  { waterproofingUpsellDiscount: 10, id: "2-lugares", label: "2 Lugares", cleaningPrice: 69, waterproofingPrice: 69, bothPrice: 138, originalBothPrice: 138, waterproofingPremiumPrice: 119, packPremiumDelta: 50 },
  { waterproofingUpsellDiscount: 10, id: "3-lugares", label: "3 Lugares", cleaningPrice: 79, waterproofingPrice: 89, bothPrice: 169, originalBothPrice: 169, waterproofingPremiumPrice: 149, packPremiumDelta: 60 },
  { waterproofingUpsellDiscount: 10, id: "4-lugares", label: "4 Lugares", cleaningPrice: 99, waterproofingPrice: 119, bothPrice: 219, originalBothPrice: 219, waterproofingPremiumPrice: 179, packPremiumDelta: 60 },
  // dono, 22 Nov 2026, Rosângela: 3L pack 219/159, 4L imper 189/129 e pack 269/209 (com deslocação)
  { id: "5-lugares", label: "5+ Lugares", cleaningPrice: 119, waterproofingPrice: "Sob orçamento", bothPrice: "Sob orçamento", waterproofingPremiumPrice: "Sob orçamento" },
  { id: "canto", label: "Canto", cleaningPrice: 119, waterproofingPrice: "Sob orçamento", bothPrice: "Sob orçamento", waterproofingPremiumPrice: "Sob orçamento" },
  { id: "4+-lugares", label: "Em U ou modular", cleaningPrice: "Sob orçamento", waterproofingPrice: "Sob orçamento", bothPrice: "Sob orçamento", waterproofingPremiumPrice: "Sob orçamento" }
];
var mattressPrices = [
  // bothPrice baixado em 10€ em cada tamanho a 2026-09-08, teste explícito do
  // dono para ver se um preço mais atrativo melhora a conversão deste
  // tratamento — reverter se não compensar.
  { id: "solteiro", label: "Solteiro", cleaningPrice: 59, waterproofingPrice: 35, bothPrice: 74, originalBothPrice: 94 },
  { id: "casal", label: "Casal", cleaningPrice: 69, waterproofingPrice: 40, bothPrice: 89, originalBothPrice: 109 },
  { id: "king", label: "King / Queen", cleaningPrice: 79, waterproofingPrice: 45, bothPrice: 99, originalBothPrice: 124 }
  // king + anti-ácaros = 109€ com a deslocação (dono, 24 Nov)
];

// src/constants/chairPricing.ts
var CHAIR_CLEAN_UNIT = 20;
var CHAIR_CLEAN_MID_FROM = 5;
var CHAIR_CLEAN_MID = 15;
var CHAIR_CLEAN_BIG_FROM = 9;
var CHAIR_CLEAN_BIG = 10;
function chairCleanUnit(qty) {
  return qty >= CHAIR_CLEAN_BIG_FROM ? CHAIR_CLEAN_BIG : qty >= CHAIR_CLEAN_MID_FROM ? CHAIR_CLEAN_MID : CHAIR_CLEAN_UNIT;
}
function chairCleanTotal(qty, before = 0) {
  if (!Number.isSafeInteger(qty) || qty <= 0) return null;
  let total = 0;
  for (let k = 1; k <= qty; k++) total += chairCleanUnit(before + k);
  return Math.round(total * 100) / 100;
}

// src/constants/antiAcarosPricing.ts
var SOFA_ANTI_ACAROS_PRICE = {
  "1-lugar": 20,
  "2-lugares": 40,
  "3-lugares": 50,
  "4-lugares": 60
};
var CHAIR_ANTI_ACAROS_UNIT_PRICE = 5;
var CHAIR_ANTI_ACAROS_UNIT_LABEL = `${CHAIR_ANTI_ACAROS_UNIT_PRICE}€/un.`;
function mattressAntiAcarosPrice(option2) {
  return typeof option2.cleaningPrice === "number" && typeof option2.bothPrice === "number" ? option2.bothPrice - option2.cleaningPrice : null;
}

// src/constants/packPerks.ts
var PACK_PERK_RUG_SET_M2 = 5;
var PACK_PERK_RUG_NOTE = `Limpe ${PACK_PERK_RUG_SET_M2} m², pague ${PACK_PERK_RUG_SET_M2 - 1}`;

// src/components/quiz/quizHelpers.ts
function calcPackPricing(option2, packOn, isWaterproofBase, fallbackDelta = null, tier = "essencial") {
  const isPremium = tier === "premium";
  const isSob = typeof option2.cleaningPrice !== "number";
  const cleanPrice = typeof option2.cleaningPrice === "number" ? option2.cleaningPrice : null;
  const waterPrice = typeof option2.waterproofingPrice === "number" ? option2.waterproofingPrice : null;
  const waterPremiumPrice = typeof option2.waterproofingPremiumPrice === "number" ? option2.waterproofingPremiumPrice : null;
  const basePrice = isWaterproofBase ? isPremium ? waterPremiumPrice : waterPrice : cleanPrice;
  const tierDelta = isPremium ? typeof option2.packPremiumDelta === "number" ? option2.packPremiumDelta : waterPremiumPrice !== null && waterPrice !== null ? waterPremiumPrice - waterPrice : 0 : 0;
  const bothEssencial = typeof option2.bothPrice === "number" ? option2.bothPrice : fallbackDelta !== null && cleanPrice !== null ? cleanPrice + fallbackDelta : null;
  const upsellDiscount = option2.waterproofingUpsellDiscount ?? 0;
  const packPrice = bothEssencial !== null ? bothEssencial + tierDelta - upsellDiscount : null;
  const packDelta = packPrice !== null && basePrice !== null ? packPrice - basePrice : fallbackDelta;
  const displayPrice = packOn ? packPrice : basePrice;
  return { isSob, basePrice, packPrice, packDelta, displayPrice };
}
function calcChairClean(qty) {
  return chairCleanTotal(qty);
}

// src/data/enginePrices.ts
function formatEuro(value) {
  return Number.isInteger(value) ? `${value}€` : `${value.toFixed(2).replace(".", ",")}€`;
}
function option(options, id, table) {
  const found = options.find((item) => item.id === id);
  if (!found) throw new Error(`enginePrices: "${id}" não existe em ${table}`);
  return found;
}
function cheapest(options, field, table) {
  const values = options.map((item) => item[field]).filter((value) => typeof value === "number");
  if (!values.length) throw new Error(`enginePrices: ${table} não tem nenhum ${String(field)} numérico`);
  return Math.min(...values);
}
var required = (value, what) => {
  if (value === null) throw new Error(`enginePrices: o motor deixou de ter preço para ${what}`);
  return value;
};
var SOFA_CLEANING_FROM = cheapest(sofaPrices, "cleaningPrice", "sofaPrices");
var MATTRESS_CLEANING_FROM = cheapest(mattressPrices, "cleaningPrice", "mattressPrices");
var CHAIR_CLEANING_FROM = required(calcChairClean(1), "uma cadeira");
var SOFA_WATERPROOF_ESSENCIAL_FROM = cheapest(sofaPrices, "waterproofingPrice", "sofaPrices");
var SOFA_WATERPROOF_PREMIUM_FROM = cheapest(sofaPrices, "waterproofingPremiumPrice", "sofaPrices");
var sofaPack = calcPackPricing(option(sofaPrices, "1-lugar", "sofaPrices"), true, false);
var SOFA_CLEAN_AND_PROTECT_FROM = required(sofaPack.packPrice, "limpeza + impermeabilização");
var SOFA_PROTECT_WITH_CLEANING_FROM = required(sofaPack.packDelta, "a impermeabilização acrescentada à limpeza");
var mattressSingle = option(mattressPrices, "solteiro", "mattressPrices");
var MATTRESS_ANTI_MITE_WITH_CLEANING_FROM = required(mattressAntiAcarosPrice(mattressSingle), "o anti-ácaros acrescentado à limpeza do colchão");
var MATTRESS_CLEAN_AND_ANTI_MITE_FROM = MATTRESS_CLEANING_FROM + MATTRESS_ANTI_MITE_WITH_CLEANING_FROM;
var SOFA_ANTI_MITE_WITH_CLEANING_FROM = Math.min(...Object.values(SOFA_ANTI_ACAROS_PRICE));
function chairCleaningTiers() {
  return {
    tiers: [
      { first: 1, last: CHAIR_CLEAN_MID_FROM - 1, unit: chairCleanUnit(1) },
      { first: CHAIR_CLEAN_MID_FROM, last: CHAIR_CLEAN_BIG_FROM - 1, unit: chairCleanUnit(CHAIR_CLEAN_MID_FROM) },
      { first: CHAIR_CLEAN_BIG_FROM, last: Infinity, unit: chairCleanUnit(CHAIR_CLEAN_BIG_FROM) }
    ],
    quoteFrom: null
  };
}
var chairUnits = chairCleaningTiers().tiers.map((tier) => tier.unit);
var CHAIR_UNIT_MIN = Math.min(...chairUnits);
var CHAIR_UNIT_MAX = Math.max(...chairUnits);
var CHAIR_PRICE_LABEL = `Desde ${formatEuro(CHAIR_UNIT_MIN)}`;
var CHAIR_PRICE_SHORT = `a partir de ${formatEuro(CHAIR_UNIT_MIN)}`;

// src/data/freguesiaContentEngine.ts
var FREGUESIA_ARTICLE = Object.fromEntries([
  ...[
    "Golpilheira",
    "Vieira de Leiria",
    "Moita",
    "Benedita",
    "Camacha",
    "Cela",
    "Maiorga",
    "Redinha",
    "Pelariga",
    "Atouguia",
    "Caranguejeira",
    "Maceira",
    "Bajouca",
    "Bidoeira de Cima",
    "Guia, Ilha e Mata Mourisca",
    "Calvaria de Cima",
    "Urqueira",
    "Ajuda",
    "Afurada",
    "Aguçadoura",
    "Amora",
    "Anta",
    "Apúlia",
    "Arrifana",
    "Azurara",
    "Baixa da Banheira e Vale da Amoreira",
    "Caparica e Trafaria",
    "Charneca de Caparica e Sobreda",
    "Costa",
    "Costa da Caparica",
    "Costa de Lavos",
    "Cova-Gala",
    "Cruz",
    "Ericeira",
    "Estrela",
    "Encosta do Sol",
    "Falagueira-Venda Nova",
    "Foz do Douro",
    "Foz do Sousa",
    "Glória",
    "Guia",
    "Lama",
    "Lixa",
    "Lomba",
    "Luz",
    "Luz de Tavira e Santo Estêvão",
    "Madalena",
    "Marinha das Ondas",
    "Mexilhoeira Grande",
    "Mina de Água",
    "Misericórdia",
    "Palmeira",
    "Pedralva",
    "Pedrulha",
    "Penha de França",
    "Ponte",
    "Pontinha e Famões",
    "Pousa",
    "Pousada de Saramagos",
    "Póvoa de Lanhoso",
    "Póvoa de Santa Iria e Forte da Casa",
    "Póvoa de Santo Adrião e Olival Basto",
    "Póvoa de Varzim Centro",
    "Quinta Grande",
    "Quinta do Anjo",
    "Quinta do Lago",
    "Ramada e Caneças",
    "Ribeira de Frades",
    "Senhora da Hora",
    "Sé",
    "Sé Nova",
    "Silva",
    "Silva Escura",
    "Torre de Vilela",
    "Torre e Vila Mou",
    "Trofa Centro",
    "Várzea",
    "Venda do Pinheiro e Santo Estêvão das Galés",
    "Venteira",
    "Vitória",
    "Fonte Boa e Rio Tinto",
    "Gâmbia-Pontes-Alto da Guerra",
    "Leirosa",
    "Lamarosa",
    "Areosa",
    "Oliveirinha",
    "Cidade da Maia",
    "Malveira e São Miguel de Alcainça",
    "Ucha",
    "Seroa",
    "Comporta",
    "Carregosa",
    "Carvalhosa"
  ].map((n) => [n, "na"]),
  ...[
    "Caniçal",
    "Porto da Cruz",
    "Juncal",
    "Louriçal",
    "Carriço",
    "Bárrio",
    "Vimeiro",
    "Arrabal",
    "Coimbrão",
    "Monte",
    "Curral das Freiras",
    "Estreito de Câmara de Lobos",
    "Jardim da Serra",
    "Serro Ventoso",
    "Alqueidão da Serra",
    "Reguengo do Fetal",
    "Souto da Carpalhosa e Ortigosa",
    "Amor",
    "Valado dos Frades",
    "Imaculado Coração de Maria",
    "Areeiro",
    "Bairro",
    "Barco",
    "Beato",
    "Bonfim",
    "Bom Sucesso",
    "Campo",
    "Campo de Ourique",
    "Carvalhal",
    "Castelo do Neiva",
    "Castêlo da Maia",
    "Cercal do Alentejo",
    "Covelo",
    "Furadouro",
    "Lumiar",
    "Outeiro",
    "Paião",
    "Parque das Nações",
    "Pinhal Novo",
    "Pinheiro",
    "Pinheiro da Bemposta",
    "Sado",
    "Seixal, Arrentela e Aldeia de Paio Pires",
    "Barreiro e Lavradio",
    "Torrão",
    "Vale das Flores",
    "Vale do Lobo",
    "Montijo e Afonsoeiro",
    "Laranjeiro e Feijó",
    "Alto do Seixalinho, Santo André e Verderena",
    "Alto Estanqueiro-Jardia",
    "Cacém e São Marcos"
  ].map((n) => [n, "no"]),
  ...["Antas", "Areias", "Marinhas", "Avenidas Novas", "Águas Livres", "Águas Santas", "Águas Santas e Moure", "Torres do Mondego"].map((n) => [n, "nas"]),
  ...["Olivais"].map((n) => [n, "nos"])
]);

// src/data/freguesiaSeoData.ts
var parishMunicipalities = /* @__PURE__ */ new Map();
for (const municipality of municipiosComFreguesias) {
  for (const parish of municipality.freguesias) {
    const owners = parishMunicipalities.get(parish.name) ?? /* @__PURE__ */ new Set();
    owners.add(municipality.name);
    parishMunicipalities.set(parish.name, owners);
  }
}

// src/lib/parishMunicipality.ts
var normalizeCity = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
var TOO_COMMON_PARISH_NAMES = new Set(["São Pedro", "Santana", "Vila Verde", "Bom Sucesso", "Ferreira"].map(normalizeCity));
var freguesiaToMunicipio = /* @__PURE__ */ new Map();
var ambiguousParishNames = /* @__PURE__ */ new Set();
for (const m of municipiosComFreguesias) {
  if (!(m.name in locationPrices)) continue;
  for (const f of m.freguesias) {
    const key = normalizeCity(f.name);
    const previous = freguesiaToMunicipio.get(key);
    if (previous && previous !== m.name) ambiguousParishNames.add(key);
    freguesiaToMunicipio.set(key, m.name);
  }
}
for (const key of [...ambiguousParishNames, ...TOO_COMMON_PARISH_NAMES]) freguesiaToMunicipio.delete(key);
var parishPartToMunicipio = /* @__PURE__ */ new Map();
var ambiguousParts = /* @__PURE__ */ new Set();
for (const m of municipiosComFreguesias) {
  if (!(m.name in locationPrices)) continue;
  for (const f of m.freguesias) {
    const parts = f.name.replace(/^uni[aã]o das freguesias d[eo]s?\s+/i, "").split(/,\s*|\s+e\s+/);
    if (parts.length < 2) continue;
    for (const part of parts) {
      const key = normalizeCity(part);
      if (key.length < 4) continue;
      const previous = parishPartToMunicipio.get(key);
      if (previous && previous !== m.name) ambiguousParts.add(key);
      parishPartToMunicipio.set(key, m.name);
    }
  }
}
for (const key of [...ambiguousParts, ...TOO_COMMON_PARISH_NAMES]) parishPartToMunicipio.delete(key);
var BOT_ONLY_PARISHES = {
  Mafra: ["Santo Isidoro", "Ribamar", "Ribeira de Ilhas", "Sobreiro", "São Lourenço", "Encarnação", "Enxara do Bispo", "Gradil", "Vila Franca do Rosário", "Igreja Nova", "Cheleiros", "Milharado", "Azueira", "Sobral da Abelheira"],
  // 20 Nov 2026 (Flavia): "Monte da Caparica" came back without a locality and the bot quoted 99€ instead of 89€.
  Almada: ["Monte da Caparica", "Charneca da Caparica", "Vale Fetal", "Fonte da Telha", "Pragal", "Cacilhas"]
};
for (const [municipality, names] of Object.entries(BOT_ONLY_PARISHES)) {
  if (!(municipality in locationPrices)) continue;
  for (const name of names) {
    const key = normalizeCity(name);
    if (!freguesiaToMunicipio.has(key) && !parishPartToMunicipio.has(key)) parishPartToMunicipio.set(key, municipality);
  }
}

// src/lib/locationDetection.ts
var servedParishes = municipiosComFreguesias.filter((m) => m.name in locationPrices).flatMap((m) => m.freguesias.map((f) => ({ parish: f.name, city: m.name, key: normalizeCity(f.name) })));

// src/lib/postalRegion.ts
var TEAM_LOCALITIES = ["Porto", "Lisboa", "Algarve", "Braga", "Coimbra"];
var CRM_LOCALITIES = [...TEAM_LOCALITIES, "Madeira"];
function localityFromPostalCode(code) {
  const n = Number(code.slice(0, 4));
  if (!Number.isInteger(n)) return null;
  if (n >= 2400 && n < 2500) return "Coimbra";
  if (n >= 1e3 && n < 3e3) return "Lisboa";
  if (n >= 7e3 && n < 8e3) return "Lisboa";
  if (n >= 8e3 && n < 9e3) return "Algarve";
  if (n >= 3e3 && n < 3100) return "Coimbra";
  if (n >= 4700 && n < 4780 || n >= 4800 && n < 5e3) return "Braga";
  if (n >= 3e3 && n < 6e3) return "Porto";
  return null;
}
function crmLocalityFromPostalCode(code) {
  const n = Number(code.slice(0, 4));
  if (Number.isInteger(n) && n >= 9e3 && n < 9400) return "Madeira";
  return localityFromPostalCode(code);
}

// src/lib/calendarServices.ts
var AREA_TO_LOCALITY = {
  porto: "Porto",
  lisboa: "Lisboa",
  algarve: "Algarve",
  braga: "Braga",
  // Coimbra e Figueira da Foz: região própria no CRM desde 2026-10-11 (dono).
  coimbra: "Coimbra",
  madeira: "Madeira"
};
function clean(text) {
  return text.replace(/[\u200b-\u200f\u202a-\u202e\u2066-\u2069\ufeff]/g, "").replace(/[\u00a0\u2007\u202f]/g, " ").replace(/[\u2010-\u2015\u2212]/g, "-");
}
var NUM = String.raw`(?:\d{1,3}(?:\.\d{3})+|\d+)(?:[.,]\d{1,2})?`;
var AMOUNT = new RegExp(String.raw`(${NUM})\s*(?:€(?:\s*(?:\(\s*(${NUM})\s*€\s*\)?|\/\s*(${NUM})\s*€))?|\(\s*(${NUM})\s*€\s*\)?)`);
function toNumber(value) {
  const plain = /^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(value) ? value.replace(/\./g, "") : value;
  return Number(plain.replace(",", "."));
}
var AD_SOURCES = { google: "Google Ads", meta: "Meta Ads" };
var AD_TAG = /\(\s*an[uú]ncios?(?:\s+(?:d[oa]\s+|no\s+)?(\p{L}+))?\s*\)/iu;
function adSourceFromTitle(summary) {
  const tag = AD_TAG.exec(clean(summary));
  if (!tag) return null;
  const where = normalizeCity(tag[1] ?? "");
  return /^(facebook|instagram|meta|fb|ig|insta)$/.test(where) ? AD_SOURCES.meta : AD_SOURCES.google;
}
function isServiceEvent(summary) {
  const text = clean(summary).trim();
  return /^(servico|limpeza)\b/.test(normalizeCity(text.slice(0, 10))) && AMOUNT.test(text);
}
function uniquePlaces(entries) {
  const byKey = /* @__PURE__ */ new Map();
  for (const { name, display, locality } of entries) {
    const key = normalizeCity(name);
    if (!locality || key.length < 4) continue;
    const prev = byKey.get(key);
    if (prev === void 0) byKey.set(key, { key, name: (display ?? name).trim(), locality });
    else if (prev && prev.locality !== locality) byKey.set(key, null);
  }
  return [...byKey.values()].filter((p) => p !== null);
}
var PLACE_ALIASES = [
  { name: "Gaia", display: "Vila Nova de Gaia", locality: "Porto" },
  { name: "Viana", display: "Viana do Castelo", locality: "Braga" },
  { name: "Póvoa", display: "Póvoa de Varzim", locality: "Porto" },
  { name: "Águas Santas", locality: "Porto" },
  { name: "Boavista", locality: "Porto" },
  { name: "Campo Alegre", locality: "Porto" },
  { name: "Foz do Douro", locality: "Porto" },
  { name: "Foz", locality: "Porto" },
  { name: "Antas", locality: "Porto" },
  { name: "Charneca da Caparica", locality: "Lisboa" },
  { name: "Miratejo", locality: "Lisboa" },
  { name: "Azambuja", locality: "Lisboa" },
  { name: "Pucariça", locality: "Lisboa" },
  { name: "Carvoeiro", locality: "Algarve" },
  // Madeira (dono, 2026-11-13): região do CRM sem equipa no motor.
  { name: "Funchal", locality: "Madeira" },
  { name: "Câmara de Lobos", locality: "Madeira" },
  { name: "Machico", locality: "Madeira" },
  { name: "Caniço", locality: "Madeira" },
  { name: "Ribeira Brava", locality: "Madeira" },
  { name: "Ponta do Sol", locality: "Madeira" },
  { name: "Porto Moniz", locality: "Madeira" },
  { name: "Porto Santo", locality: "Madeira" },
  { name: "Montegordo", display: "Monte Gordo", locality: "Algarve" },
  { name: "Pedras del Rei", display: "Pedras d'El Rei", locality: "Algarve" },
  { name: "Pedras del Rey", display: "Pedras d'El Rei", locality: "Algarve" }
];
var REGION_ONLY = normalizeCity("Algarve");
var municipalityPlaces = uniquePlaces([
  ...cities.map((c) => ({ name: c.name, locality: AREA_TO_LOCALITY[c.area] })),
  ...PLACE_ALIASES,
  { name: "Algarve", locality: "Algarve" }
]);
var parishPlaces = (() => {
  const areaOf = new Map(cities.map((c) => [c.name, AREA_TO_LOCALITY[c.area]]));
  const municipalityKeys = new Set(municipalityPlaces.map((p) => p.key));
  const entries = [];
  for (const m of municipiosComFreguesias) {
    const locality = areaOf.get(m.name);
    for (const f of m.freguesias) {
      entries.push({ name: f.name, locality });
      for (const part of f.name.split(/,\s*|\s+e\s+/)) {
        if (part !== f.name) entries.push({ name: part, locality });
        for (const piece of part.split("-")) if (piece !== part && piece.length >= 5) entries.push({ name: piece, locality });
      }
    }
  }
  return uniquePlaces(entries).filter((p) => !municipalityKeys.has(p.key) && !TOO_COMMON_PARISH_NAMES.has(p.key));
})();
function knownPlacesFrom(rows) {
  return uniquePlaces(rows.filter((r) => r.city && r.locality && !r.needs_review).map((r) => ({ name: r.city, locality: r.locality }))).map((p) => ({ city: p.name, locality: p.locality }));
}
var STREET_NAME = /(^|[\s,.])(rua|r|avenida|av|travessa|tv|largo|praceta|praca|estrada|alameda|urbanizacao|urb|bairro|beco|calcada)[\s.][^,\n\d]*/g;
function findPlace(text, list) {
  const hay = ` ${normalizeCity(text).replace(STREET_NAME, "$1 ").replace(/[^a-z0-9]+/g, " ")} `;
  let best = null;
  for (const place of list) {
    const needle = ` ${place.key.replace(/[^a-z0-9]+/g, " ")} `;
    const at = hay.lastIndexOf(needle);
    if (at < 0) continue;
    const end = at + needle.length;
    if (!best || end > best.end || end === best.end && place.key.length > best.place.key.length) best = { place, end };
  }
  return best?.place ?? null;
}
var startsWithPlace = (s) => {
  const hay = ` ${normalizeCity(s).replace(/[^a-z0-9]+/g, " ").trim()} `;
  return [...municipalityPlaces, ...parishPlaces].some((p) => hay.startsWith(` ${p.key.replace(/[^a-z0-9]+/g, " ")} `));
};
var PHONE = /(?:\+|00)351\s*[29](?:[\s-]?\d){8}(?!\d)|(?:\+|00)(?!351)\d{1,3}(?:[\s-]?\d){6,11}(?!\d)|(?<![\d-])[29]\d{2}\s?\d{3}\s?\d{3}(?![\d-])/;
function formatPhone(raw) {
  const digits2 = raw.replace(/\D/g, "").replace(/^00/, "");
  const national = digits2.length === 9 ? digits2 : digits2.startsWith("351") && digits2.length === 12 ? digits2.slice(3) : null;
  if (national) return `+351 ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`;
  return raw.trim().replace(/\s+/g, " ").replace(/^00/, "+");
}
var SERVICE_WORDS = /\b(limpeza|impermeabiliza|recolha|entrega|higieniza|lavagem|anti|sofa|sofas|colch|tapete|cadeira|poltrona|alcatifa|carpete|puff|cabeceira|chaise|estofo)/;
var STREET_WORDS = /^(rua|r\.|avenida|av\.?|travessa|tv\.?|largo|praceta|praca|estrada|alameda|urbanizacao|urb\.?|bairro|beco|calcada|quinta|lugar|lote|cp\b|edificio|edf\.?)/;
var FLAT_WORDS = /^(cave|esq|esquerd|dto|direit|frente|tras|r\/?c|andar|bloco|lote|apto|piso|hab|porta|loja|fracao)/;
var POSTAL = /\b(\d{4})-\d{3}\b/;
var isServiceLike = (s) => SERVICE_WORDS.test(normalizeCity(s));
var isNameLike = (s) => {
  const words = s.split(/\s+/).filter(Boolean);
  return words.length >= 1 && words.length <= 4 && !/\d/.test(s) && /^[\p{L}][\p{L}'.\s-]*$/u.test(s) && !isServiceLike(s) && !STREET_WORDS.test(normalizeCity(s)) && !startsWithPlace(s);
};
var tidy = (s) => s.replace(/\s+/g, " ").replace(/^[\s,.;:-]+|[\s,;:-]+$/g, "").trim();
var capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
var TEAM_LINE = /^\s*Equipa:\s*([^\n<]*)/i;
function teamRegionOf(event) {
  const team = TEAM_LINE.exec(clean(event.description))?.[1];
  if (!team) return null;
  const key = normalizeCity(team);
  return CRM_LOCALITIES.find((l) => key.startsWith(normalizeCity(l))) ?? null;
}
function parseServiceEvent(event, known = []) {
  return readServiceEvent(event, known)?.parsed ?? null;
}
function streetForMap(event) {
  return readServiceEvent(event)?.street ?? null;
}
function readServiceEvent(event, known = []) {
  const summary = clean(event.summary).replace(new RegExp(AD_TAG, "giu"), " ").replace(/\s{2,}/g, " ").trim();
  if (!isServiceEvent(summary)) return null;
  const amount = AMOUNT.exec(summary);
  const myCut = toNumber(amount[1]);
  const billed = toNumber(amount[2] ?? amount[3] ?? amount[4] ?? amount[1]);
  const segments = summary.split(/\s+-\s*|\s*-\s+/).map((s) => s.trim());
  let head = segments.shift() ?? "";
  const headPhone = PHONE.exec(head);
  if (headPhone && headPhone.index > 0) {
    segments.unshift(head.slice(headPhone.index));
    head = head.slice(0, headPhone.index);
  }
  let description = tidy(head.replace(/^servi[cç]o\b\s*/i, "").replace(/^limpeza\s+(?=\d)/i, "").replace(AMOUNT, " "));
  let phone = null;
  let name = null;
  const address = [];
  let previousWasPhone = false;
  segments.forEach((raw, i) => {
    let seg = raw;
    const phoneMatch = PHONE.exec(seg);
    if (phoneMatch) {
      phone ??= formatPhone(phoneMatch[0]);
      seg = tidy(seg.replace(phoneMatch[0], " "));
    }
    const besidePhone = Boolean(phoneMatch) || previousWasPhone || PHONE.test(segments[i + 1] ?? "");
    previousWasPhone = Boolean(phoneMatch);
    if (!seg) return;
    const bare = tidy(seg.replace(/\s*\([^()]*\)\s*$/, ""));
    if (!description && isServiceLike(seg)) description = tidy(seg);
    else if (!name && bare && isNameLike(bare) && (address.length === 0 || besidePhone)) name = bare;
    else address.push(seg);
  });
  const addressText = [address.join(", "), clean(event.location)].filter(Boolean).join("\n");
  const fullText = [addressText, head, clean(event.description).replace(TEAM_LINE, "")].join("\n");
  let city = null;
  let locality = null;
  const postal = POSTAL.exec(addressText) ?? POSTAL.exec(fullText);
  if (postal) {
    locality = crmLocalityFromPostalCode(postal[1]);
    const after = tidy(fullText.slice(fullText.indexOf(postal[0]) + postal[0].length).split(/[\n,]/)[0] ?? "");
    if (after && !/\d/.test(after) && /\p{L}/u.test(after)) city = findPlace(after, municipalityPlaces)?.name ?? after;
  }
  const tiers = [
    [uniquePlaces(known.map((k) => ({ name: k.city, locality: k.locality }))), false],
    [municipalityPlaces, false],
    [parishPlaces, true]
  ];
  search: for (const [list] of tiers) {
    for (const text of [addressText, head, fullText]) {
      const place = findPlace(text, list);
      if (!place) continue;
      if (!locality) locality = place.locality;
      city ??= place.name;
      break search;
    }
  }
  if (city && normalizeCity(city) === REGION_ONLY) {
    const specific = findPlace(fullText.replace(/algarve/gi, " "), [...municipalityPlaces, ...parishPlaces]);
    if (specific?.locality === "Algarve") city = specific.name;
  }
  if (!city && address.length > 0) {
    const last = tidy(address[address.length - 1].split(/[\n,]/).pop() ?? "");
    if (last && !/\d/.test(last) && /\p{L}/u.test(last) && !STREET_WORDS.test(normalizeCity(last)) && !FLAT_WORDS.test(normalizeCity(last))) city = last;
  }
  if (city && city === city.toUpperCase()) city = city.toLowerCase().replace(/(^|\s)(\p{L})/gu, (_, sp, c) => sp + c.toUpperCase());
  const review = [];
  if (!locality) review.push("Região por identificar");
  if (myCut > billed) review.push("A tua parte é maior que o faturado");
  const streetPart = [...address, ...clean(event.location).split(/[\n,]/)].map(tidy).find((part) => STREET_WORDS.test(normalizeCity(part)) && /\d/.test(part));
  const street = streetPart?.match(/^.*?\d+[a-z]?\b/i)?.[0] ?? null;
  return { street, parsed: {
    request_date: event.startDate,
    description: capitalize(description),
    client_name: name,
    phone,
    city: city ? capitalize(city) : null,
    locality,
    billed_value: billed,
    my_cut: myCut,
    needs_review: review.length ? review.join(" · ") : null
  } };
}
function placeByName(name) {
  const key = normalizeCity(name);
  const place = municipalityPlaces.find((p) => p.key === key) ?? parishPlaces.find((p) => p.key === key);
  return place ? { city: place.name, locality: place.locality } : null;
}

// src/lib/invoiceVat.ts
var INVOICE_VAT = 0.23;
var round2 = (n) => Math.round(n * 100) / 100;
function vatInside(gross) {
  return round2(gross - round2(gross / (1 + INVOICE_VAT)));
}
function serviceVatOf(r) {
  if (!r.invoiced) return 0;
  const billed = Number(r.billed_value) || 0;
  const part = r.invoice_value === null || r.invoice_value === void 0 || r.invoice_value === "" ? billed : Math.min(Number(r.invoice_value) || 0, billed);
  return vatInside(part);
}

// src/lib/calendarSync.ts
var CALENDAR_SYNC_SINCE = "2026-09-26T15:00:00Z";
var CALENDAR_FETCH_SINCE = "2026-06-01T00:00:00Z";
var CALENDAR_SOURCE = "Google Calendar";
var SYNC_SOURCES = /* @__PURE__ */ new Set([CALENDAR_SOURCE, ...Object.values(AD_SOURCES)]);
var time = (iso) => iso ? Date.parse(iso) : NaN;
var LATE_SERVICE_MS = 60 * 60 * 1e3;
var BOT_BOOKED = /Marcado pelo bot/;
var VAT_WORDS = /\b(iva|fatura|factura|nif|contribuinte)\b/i;
var NO_INVOICE = /\bsem\s+(fatura|factura|iva)\b|n[ãa]o\s+(quer|precisa|pediu|pede)\s+(de\s+)?(fatura|factura)|dispens\w+\s+(a\s+)?(fatura|factura)/i;
var VAT_INCLUDED = /iva\s+inclu[ií]do|iva\s+incl\b/i;
var VAT_ON_TOP = /\bà\s+parte\b|\ba\s+parte\b|\bacresce|\+\s*iva\b|\bmais\s+iva\b|\biva\s+(de\s+)?23|\+\s*23\s*%/i;
var VAT_RATE = 1.23;
var amountsIn = (text) => [...text.matchAll(/(\d{1,5}(?:[.,]\d{1,2})?)\s*(?:€|eur)/gi)].map((m) => Number(m[1].replace(",", ".")));
var round22 = (n) => Math.round(n * 100) / 100;
var near = (a, b) => Math.abs(a - b) <= 0.05;
function invoiceFromEvent(event, titleValue) {
  const text = `${event.summary}
${event.description ?? ""}`;
  if (!VAT_WORDS.test(text) || NO_INVOICE.test(text)) return null;
  const base = Number(titleValue) || 0;
  const withVat = round22(base * VAT_RATE);
  const amounts = amountsIn(text);
  const totalWritten = amounts.find((a) => near(a, withVat));
  const titleIsTotal = amounts.some((a) => a < base && near(round22(a * VAT_RATE), base));
  const result = (vat_on_top, billed_value) => ({ invoiced: true, vat_on_top, invoice_by: "Empresa", billed_value });
  if (VAT_INCLUDED.test(text) && !VAT_ON_TOP.test(text)) return result(false, base);
  if (titleIsTotal) return result(true, base);
  if (totalWritten !== void 0) return result(true, totalWritten);
  if (VAT_ON_TOP.test(text)) return result(true, withVat);
  return result(false, base);
}
var cents = (n) => Math.round((Number(n) || 0) * 100);
function closingDateOf(event) {
  if (BOT_BOOKED.test(event.description ?? "")) return event.created;
  return time(event.updated) - time(event.created) > LATE_SERVICE_MS ? event.updated : event.created;
}
function planCalendarSync(rows, events, { since, now, ignored }) {
  const known = knownPlacesFrom(rows);
  const byEvent = new Map(rows.filter((r) => r.calendar_event_id).map((r) => [r.calendar_event_id, r]));
  const present = /* @__PURE__ */ new Set();
  const movedRows = /* @__PURE__ */ new Set();
  const plan = { inserts: [], updates: [], counts: { added: 0, updated: 0, missing: 0, restored: 0 } };
  const earlierBooking = /* @__PURE__ */ new Map();
  const inFeed = new Set(events.filter((e) => e.status !== "CANCELLED").map((e) => e.id));
  const rescheduled = /* @__PURE__ */ new Map();
  for (const r of rows) {
    const phone = r.phone;
    if (!phone || !r.calendar_event_id) continue;
    const gone = r.calendar_missing_since ? time(now) - time(r.calendar_missing_since) <= 30 * 864e5 : !inFeed.has(r.calendar_event_id) && time(r.booked_at) >= time(since);
    if (!gone) continue;
    rescheduled.set(phone.replace(/\D/g, "").slice(-9), r);
  }
  for (const r of rows) {
    const phone = r.phone;
    if (!phone || !r.booked_at || !r.calendar_missing_since) continue;
    if (time(now) - time(r.calendar_missing_since) > 30 * 864e5) continue;
    const key = phone.replace(/\D/g, "");
    const prev = earlierBooking.get(key);
    if (!prev || time(r.booked_at) < time(prev)) earlierBooking.set(key, r.booked_at);
  }
  const bookedAtFor = (event, phone) => {
    const own = closingDateOf(event);
    const prev = phone ? earlierBooking.get(phone.replace(/\D/g, "")) : void 0;
    return prev && time(prev) < time(own) ? prev : own;
  };
  for (const event of events) {
    if (event.status === "CANCELLED" || !isServiceEvent(event.summary)) continue;
    if (ignored?.has(event.id)) continue;
    const parsed = parseServiceEvent(event, known);
    if (!parsed) continue;
    if (time(event.created) < time(since)) {
      const old = byEvent.get(event.id);
      if (old) {
        const patch2 = upcomingChanges(old, parsed, now);
        if (patch2) {
          plan.updates.push({ id: old.id, patch: patch2 });
          plan.counts.updated++;
        }
      }
      continue;
    }
    present.add(event.id);
    const source = adSourceFromTitle(event.summary) ?? CALENDAR_SOURCE;
    const row = byEvent.get(event.id);
    const moved = !row && parsed.phone ? rescheduled.get(parsed.phone.replace(/\D/g, "").slice(-9)) : void 0;
    if (moved) {
      rescheduled.delete(parsed.phone.replace(/\D/g, "").slice(-9));
      movedRows.add(moved.id);
      plan.updates.push({ id: moved.id, patch: {
        request_date: parsed.request_date,
        calendar_event_id: event.id,
        calendar_updated_at: event.updated,
        calendar_missing_since: null
      } });
      plan.counts.restored++;
      continue;
    }
    if (!row) {
      plan.inserts.push({
        ...parsed,
        // O upsert em lote junta as colunas de todas as linhas: uma sem fatura
        // ia com invoiced null e o lote todo falhava (16/11).
        invoiced: false,
        vat_on_top: false,
        invoice_by: null,
        ...invoiceFromEvent(event, parsed.billed_value) ?? {},
        booked_at: bookedAtFor(event, parsed.phone),
        calendar_event_id: event.id,
        calendar_updated_at: event.updated,
        source,
        paid: false
      });
      plan.counts.added++;
      continue;
    }
    const patch = {};
    if (row.calendar_missing_since) {
      patch.calendar_missing_since = null;
      plan.counts.restored++;
    }
    if (!(time(row.calendar_updated_at) >= time(event.updated))) {
      Object.assign(patch, parsed, { calendar_updated_at: event.updated }, invoiceChanges(row, parsed, event));
      const current = row.source ?? CALENDAR_SOURCE;
      if (current !== source && SYNC_SOURCES.has(current)) patch.source = source;
      plan.counts.updated++;
    } else if (!row.client_name && parsed.client_name) {
      patch.client_name = parsed.client_name;
      plan.counts.updated++;
    }
    if (Object.keys(patch).length) plan.updates.push({ id: row.id, patch });
  }
  for (const row of byEvent.values()) {
    if (present.has(row.calendar_event_id) || row.calendar_missing_since || movedRows.has(row.id)) continue;
    if (!(time(row.booked_at) >= time(since))) continue;
    plan.updates.push({ id: row.id, patch: { calendar_missing_since: now } });
    plan.counts.missing++;
  }
  return plan;
}
function invoiceChanges(row, parsed, event) {
  const invoice = invoiceFromEvent(event, parsed.billed_value);
  const upsell = cents(row.upsell_value ?? 0);
  if (upsell > 0 && row.billed_value != null) {
    const total = cents(row.billed_value) + upsell;
    const calendarTotal = cents(parsed.billed_value);
    if (Math.abs(calendarTotal - total) <= 2 || Math.abs(round22(calendarTotal * VAT_RATE) - total) <= 2) {
      return { billed_value: Number(row.billed_value), my_cut: Number(row.my_cut) || 0 };
    }
  }
  if (!row.invoiced) return invoice ?? {};
  if (row.billed_value === void 0 || row.billed_value === null) return {};
  const crm = cents(row.billed_value);
  const calendar = cents(parsed.billed_value);
  if (calendar === crm) return {};
  if (Math.abs(calendar - (crm - cents(serviceVatOf(row)))) <= 2) {
    return { billed_value: Number(row.billed_value), my_cut: Number(row.my_cut) || 0 };
  }
  return invoice ? { billed_value: invoice.billed_value } : {};
}
function upcomingChanges(row, parsed, now) {
  const today = now.slice(0, 10);
  const current = row.request_date?.slice(0, 10) ?? "";
  if (current < today && parsed.request_date < today) return null;
  return parsed.request_date !== current ? { request_date: parsed.request_date } : null;
}

// src/lib/regionLookup.ts
var UNKNOWN_REGION = "Região por identificar";
var searchOpenStreetMap = async (street) => {
  const url = "https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=pt&addressdetails=1&limit=8&q=" + encodeURIComponent(street);
  const res = await fetch(url, { headers: { "Accept-Language": "pt-PT" } });
  if (!res.ok) throw new Error(`OpenStreetMap ${res.status}`);
  const data = await res.json();
  return data.map(({ address = {} }) => ({
    postcode: address.postcode ?? null,
    names: [address.city, address.town, address.village, address.municipality, address.suburb].filter((n) => Boolean(n))
  }));
};
function regionFromHits(hits) {
  const found = hits.flatMap((hit) => {
    const byName = hit.names.map(placeByName).find(Boolean) ?? null;
    const locality = (hit.postcode ? crmLocalityFromPostalCode(hit.postcode) : null) ?? byName?.locality;
    return locality ? [{ locality, city: byName?.city ?? hit.names[0] ?? null }] : [];
  });
  if (!found.length) return null;
  const [first] = found;
  return { locality: first.locality, city: first.city, note: null };
}
var digits = (phone) => (phone ?? "").replace(/\D/g, "").slice(-9);
function regionFromPhone(rows, phone, excludeId) {
  const key = digits(phone);
  if (key.length < 9) return null;
  const same = rows.filter((r) => r.id !== excludeId && r.locality && !r.needs_review && digits(r.phone) === key);
  const localities = new Set(same.map((r) => r.locality));
  if (localities.size !== 1) return null;
  return { locality: same[0].locality, city: same.find((r) => r.city)?.city ?? null, note: null };
}
function withoutUnknown(review, note) {
  const parts = (review ?? "").split(" · ").filter((p) => p && p !== UNKNOWN_REGION);
  if (note) parts.unshift(note);
  return parts.length ? parts.join(" · ") : null;
}
async function resolveMissingRegions(rows, plan, events, { search = searchOpenStreetMap, pauseMs = 1100, maxLookups = 10 } = {}) {
  const byId = new Map(events.map((e) => [e.id, e]));
  const targets = [];
  for (const insert of plan.inserts) {
    if (insert.locality) continue;
    targets.push({
      phone: insert.phone,
      city: insert.city,
      event: byId.get(insert.calendar_event_id),
      review: insert.needs_review,
      apply: (f) => Object.assign(insert, f)
    });
  }
  const patched = new Map(plan.updates.map((u) => [u.id, u]));
  for (const row of rows) {
    const update = patched.get(row.id);
    const locality = update && "locality" in update.patch ? update.patch.locality : row.locality;
    if (locality || !row.calendar_event_id) continue;
    const review = update?.patch.needs_review !== void 0 ? update.patch.needs_review : row.needs_review;
    if (!review?.includes(UNKNOWN_REGION)) continue;
    const event = byId.get(row.calendar_event_id);
    const city = update && "city" in update.patch ? update.patch.city ?? null : event ? parseServiceEvent(event)?.city ?? null : row.city;
    targets.push({
      phone: update?.patch.phone ?? row.phone,
      city,
      event,
      review,
      excludeId: row.id,
      apply: (f) => {
        if (update) Object.assign(update.patch, f);
        else plan.updates.push({ id: row.id, patch: { ...f } });
      }
    });
  }
  let resolved = 0;
  let lookups = 0;
  for (const target of targets) {
    let found = regionFromPhone(rows, target.phone, target.excludeId);
    const street = !found && target.event ? streetForMap(target.event) : null;
    if (street && lookups < maxLookups) {
      if (lookups > 0 && pauseMs) await new Promise((r) => setTimeout(r, pauseMs));
      lookups++;
      try {
        found = regionFromHits(await search(street));
      } catch {
        found = null;
      }
    }
    if (!found && target.event) {
      const team = teamRegionOf(target.event);
      if (team) found = { locality: team, city: null, note: null };
    }
    if (!found) continue;
    target.apply({ locality: found.locality, city: target.city ?? found.city, needs_review: withoutUnknown(target.review, found.note) });
    resolved++;
  }
  return resolved;
}

// src/lib/crmSyncCore.ts
function dbError(e, what) {
  return new Error(`${what}: ${[e.message, e.details, e.hint].filter(Boolean).join(" · ") || JSON.stringify(e)}`);
}
async function applyCalendarSync(db, rows, events, opts = {}) {
  const { data: ignoredRows, error: ignoredError } = await db.from("crm_ignored_calendar_events").select("event_id");
  if (ignoredError) throw dbError(ignoredError, "eventos ignorados");
  const ignored = new Set((ignoredRows ?? []).map((r) => r.event_id));
  const plan = planCalendarSync(rows, events, { since: CALENDAR_SYNC_SINCE, now: (/* @__PURE__ */ new Date()).toISOString(), ignored });
  await resolveMissingRegions(rows, plan, events, opts.search ? { search: opts.search } : {});
  if (plan.inserts.length) {
    const { error } = await db.from("service_requests").upsert(plan.inserts, { onConflict: "calendar_event_id", ignoreDuplicates: true });
    if (error) throw dbError(error, "criar linhas");
  }
  for (const { id, patch } of plan.updates) {
    const { error } = await db.from("service_requests").update(patch).eq("id", id);
    if (error) throw dbError(error, `atualizar ${id} (${Object.keys(patch).join(", ")})`);
  }
  return { inserts: plan.inserts.length, updates: plan.updates.length, counts: plan.counts };
}
export {
  CALENDAR_FETCH_SINCE,
  applyCalendarSync,
  dbError
};
