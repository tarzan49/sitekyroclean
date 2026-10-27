// GERADO por `npm run build:bot-engine` a partir de src/lib/botEngine.ts. Não editar à mão.
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
  // Dono, 2026-10-26: Leiria fica perto de Coimbra, equipa Coimbra, 20€.
  "Leiria": 20,
  "Batalha": 20,
  // ═══ Braga/Minho (equipa local, escalões por distância ao centro de Braga) ═══
  // Referência ao centro de Braga: até 10 km = 10€; até 15 km = 15€; acima = 20€.
  // Escalões por sede de concelho; a morada concreta é confirmada no orçamento.
  "Braga": 10,
  "Guimarães": 20,
  "Vila Nova de Famalicão": 20,
  "Barcelos": 20,
  "Viana do Castelo": 20,
  "Póvoa de Lanhoso": 15,
  "Fafe": 20,
  "Esposende": 20,
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
var EXTENDED_TRIP_CITIES = /* @__PURE__ */ new Set([
  "Aveiro",
  "Alcácer do Sal",
  "Grândola",
  "Santiago do Cacém",
  "Sines"
]);
function calculateTravelFee(baseFee, servicesTotal) {
  if (!Number.isFinite(servicesTotal) || servicesTotal < 0) return baseFee;
  const cents2 = Math.round(servicesTotal * 100);
  if (baseFee === 10 && cents2 > 12e3 || baseFee === 15 && cents2 > 13500 || baseFee === 20 && cents2 >= 15e3) return 0;
  return baseFee;
}

// src/components/quiz/QuizTypes.ts
var sofaPrices = [
  { waterproofingUpsellDiscount: 10, id: "1-lugar", label: "1 Lugar", cleaningPrice: 49, waterproofingPrice: 39, bothPrice: 89, originalBothPrice: 88, waterproofingPremiumPrice: 79 },
  { waterproofingUpsellDiscount: 10, id: "2-lugares", label: "2 Lugares", cleaningPrice: 69, waterproofingPrice: 69, bothPrice: 129, originalBothPrice: 138, waterproofingPremiumPrice: 119, packPremiumDelta: 50 },
  { waterproofingUpsellDiscount: 10, id: "3-lugares", label: "3 Lugares", cleaningPrice: 79, waterproofingPrice: 89, bothPrice: 159, originalBothPrice: 168, waterproofingPremiumPrice: 149, packPremiumDelta: 50 },
  { waterproofingUpsellDiscount: 10, id: "4-lugares", label: "4 Lugares", cleaningPrice: 99, waterproofingPrice: 109, bothPrice: 199, originalBothPrice: 208, waterproofingPremiumPrice: 179, packPremiumDelta: 50 },
  { id: "5-lugares", label: "5+ Lugares", cleaningPrice: 119, waterproofingPrice: "Sob orçamento", bothPrice: "Sob orçamento", waterproofingPremiumPrice: "Sob orçamento" },
  { id: "canto", label: "Canto", cleaningPrice: 109, waterproofingPrice: "Sob orçamento", bothPrice: "Sob orçamento", waterproofingPremiumPrice: "Sob orçamento" },
  { id: "4+-lugares", label: "Em U ou modular", cleaningPrice: "Sob orçamento", waterproofingPrice: "Sob orçamento", bothPrice: "Sob orçamento", waterproofingPremiumPrice: "Sob orçamento" }
];
var mattressPrices = [
  // bothPrice baixado em 10€ em cada tamanho a 2026-09-08, teste explícito do
  // dono para ver se um preço mais atrativo melhora a conversão deste
  // tratamento — reverter se não compensar.
  { id: "solteiro", label: "Solteiro", cleaningPrice: 59, waterproofingPrice: 35, bothPrice: 74, originalBothPrice: 94 },
  { id: "casal", label: "Casal", cleaningPrice: 69, waterproofingPrice: 40, bothPrice: 89, originalBothPrice: 109 },
  { id: "king", label: "King / Queen", cleaningPrice: 79, waterproofingPrice: 45, bothPrice: 104, originalBothPrice: 124 }
];

// src/constants/chairPricing.ts
var CHAIR_WATERPROOF_ESSENTIAL = 18;
var CHAIR_WATERPROOF_PREMIUM = 25;
var CHAIR_WATERPROOF_SMALL_MAX = 4;
var CHAIR_WATERPROOF_SMALL_ESSENTIAL = 23;
var CHAIR_WATERPROOF_SMALL_PREMIUM = 30;
function chairWaterproofTotal(qty, tier) {
  if (!Number.isSafeInteger(qty) || qty <= 0) return null;
  const small = tier === "premium" ? CHAIR_WATERPROOF_SMALL_PREMIUM : CHAIR_WATERPROOF_SMALL_ESSENTIAL;
  if (qty <= CHAIR_WATERPROOF_SMALL_MAX) return qty * small;
  const unit = tier === "premium" ? CHAIR_WATERPROOF_PREMIUM : CHAIR_WATERPROOF_ESSENTIAL;
  return Math.max(qty * unit, CHAIR_WATERPROOF_SMALL_MAX * small);
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
function sofaAntiAcarosPrice(sizeId) {
  return SOFA_ANTI_ACAROS_PRICE[sizeId] ?? null;
}
function chairAntiAcarosTotal(qty) {
  return Number.isSafeInteger(qty) && qty > 0 ? qty * CHAIR_ANTI_ACAROS_UNIT_PRICE : null;
}
function mattressAntiAcarosPrice(option2) {
  return typeof option2.cleaningPrice === "number" && typeof option2.bothPrice === "number" ? option2.bothPrice - option2.cleaningPrice : null;
}

// src/constants/packPerks.ts
var PACK_PERK_MIN_ORDER = 100;
var PACK_PERK_MATTRESS_OFF = 14;
var PACK_PERK_SOFA_PRICE = { "1-lugar": 35, "2-lugares": 55, "3-lugares": 65, "4-lugares": 79 };
var PACK_PERK_CHAIRS_SET = 4;
var PACK_PERK_RUG_SET_M2 = 5;
var PACK_PERK_RUG_NOTE = `Limpe ${PACK_PERK_RUG_SET_M2} m², pague ${PACK_PERK_RUG_SET_M2 - 1}`;
function perkChairsPrice(tableTotal, qty) {
  if (qty <= 0) return 0;
  const free = Math.floor(qty / PACK_PERK_CHAIRS_SET);
  return Math.round(tableTotal * (qty - free) / qty * 100) / 100;
}
function perkChairsFree(qty) {
  return Math.max(0, Math.floor(qty / PACK_PERK_CHAIRS_SET));
}
var round2 = (n) => Math.round(n * 100) / 100;
function priceWithPackPerks(lines, mainKind = lines[0]?.kind) {
  const tableSubtotal = round2(lines.reduce((sum2, line) => sum2 + (line.tablePrice ?? 0), 0));
  const eligible = tableSubtotal >= PACK_PERK_MIN_ORDER;
  const results = lines.map((line) => {
    const isMain = line.kind === mainKind;
    const table = { amount: line.tablePrice, tablePrice: line.tablePrice, isMain, perkApplied: false, perkNote: null };
    if (isMain || !eligible) return table;
    if (line.kind === "rug") return { ...table, perkNote: PACK_PERK_RUG_NOTE };
    if (line.tablePrice === null) return table;
    const treatment = line.treatment ?? "none";
    let amount2 = line.tablePrice;
    if (line.kind === "sofa" && treatment === "none" && line.sizeId && PACK_PERK_SOFA_PRICE[line.sizeId] !== void 0) {
      amount2 = PACK_PERK_SOFA_PRICE[line.sizeId] * line.qty;
    } else if (line.kind === "mattress" && (treatment === "none" || treatment === "anti-acaros")) {
      amount2 = line.tablePrice - PACK_PERK_MATTRESS_OFF * line.qty;
    } else if (line.kind === "chairs" && treatment === "none") {
      amount2 = perkChairsPrice(line.tablePrice, line.qty);
    }
    amount2 = round2(amount2);
    const perkApplied = amount2 < line.tablePrice;
    const free = perkChairsFree(line.qty);
    const perkNote = !perkApplied ? null : line.kind === "chairs" ? `${free} oferecida${free > 1 ? "s" : ""}` : "preço de pack";
    return { ...table, amount: amount2, perkApplied, perkNote };
  });
  return { lines: results, tableSubtotal, eligible };
}
var PACK_PERK_RULE = `A partir de ${PACK_PERK_MIN_ORDER}€ de subtotal, o artigo principal fica ao preço de tabela, em todas as unidades e tamanhos, e cada artigo de outro tipo que juntar à mesma visita entra com preço de pack: sofás a partir de ${PACK_PERK_SOFA_PRICE["1-lugar"]}€, menos ${PACK_PERK_MATTRESS_OFF}€ em cada colchão, uma cadeira oferecida por cada conjunto de ${PACK_PERK_CHAIRS_SET} e, nos tapetes, ${PACK_PERK_RUG_NOTE.toLowerCase()}.`;
var PACK_PERK_SUMMARY = `A partir de ${PACK_PERK_MIN_ORDER}€ de subtotal, o artigo principal fica ao preço de tabela e os artigos de outro tipo que acrescentar entram com preço de pack.`;
var PACK_PERK_PRICES = `Sofá a partir de ${PACK_PERK_SOFA_PRICE["1-lugar"]}€, menos ${PACK_PERK_MATTRESS_OFF}€ em cada colchão, uma cadeira oferecida por cada ${PACK_PERK_CHAIRS_SET} e, nos tapetes, ${PACK_PERK_RUG_NOTE.toLowerCase()}.`;
var PACK_PERK_BULLETS = [
  `Preço de pack a partir de ${PACK_PERK_MIN_ORDER}€ de subtotal (abaixo disso, preço de tabela normal).`,
  "O artigo principal fica ao preço de tabela, em todas as unidades e tamanhos. O preço de pack é para os artigos de outro tipo.",
  `Sofá acrescentado: ${PACK_PERK_SOFA_PRICE["1-lugar"]}€ o de 1 lugar, ${PACK_PERK_SOFA_PRICE["2-lugares"]}€ o de 2 lugares, ${PACK_PERK_SOFA_PRICE["3-lugares"]}€ o de 3 lugares, ${PACK_PERK_SOFA_PRICE["4-lugares"]}€ o de 4 lugares; o de 5+ lugares fica ao preço de tabela.`,
  `Colchão acrescentado: menos ${PACK_PERK_MATTRESS_OFF}€ por unidade, em qualquer tamanho.`,
  `Cadeiras acrescentadas: uma oferecida por cada conjunto de ${PACK_PERK_CHAIRS_SET}.`,
  `Tapete acrescentado: ${PACK_PERK_RUG_NOTE.toLowerCase()}, sempre sob orçamento.`,
  "Uma só deslocação para a visita toda, cobrada uma única vez."
];

// src/constants/rugMeasure.ts
var RUG_SIDE_MAX_METERS = 20;
var RUG_SIDE_DOUBTFUL_METERS = 8;
function rugSide(raw) {
  const n = typeof raw === "number" ? raw : Number(String(raw ?? "").trim().replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) return null;
  if (n > RUG_SIDE_MAX_METERS) {
    const meters = Math.round(n) / 100;
    return meters > RUG_SIDE_MAX_METERS ? null : { meters, fromCm: true, doubtful: false };
  }
  return { meters: n, fromCm: false, doubtful: n >= RUG_SIDE_DOUBTFUL_METERS };
}
var formatMeters = (m) => String(Number(m.toFixed(2))).replace(".", ",");

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
function calcSofaUnitPrice(option2, treated, serviceType, tier, antiAcaros) {
  if (treated && antiAcaros && serviceType !== "waterproofing") {
    const extra = sofaAntiAcarosPrice(option2.id);
    return typeof option2.cleaningPrice === "number" && extra !== null ? option2.cleaningPrice + extra : null;
  }
  return calcPackPricing(option2, treated, serviceType === "waterproofing", null, tier).displayPrice;
}
function calcMattressUnitPrice(option2, treated, serviceType) {
  const price = treated ? option2.bothPrice : serviceType === "waterproofing" ? option2.waterproofingPrice : option2.cleaningPrice;
  return typeof price === "number" ? price : null;
}
function calcChairClean(qty) {
  if (qty <= 0 || qty >= 10) return null;
  if (qty <= 4) return qty * 20;
  if (qty <= 6) return 4 * 20 + (qty - 4) * 15;
  return 4 * 20 + 2 * 15 + (qty - 6) * 12.5;
}
function calcChairWaterproof(qty) {
  return chairWaterproofTotal(qty, "essencial");
}
function calcChairWaterproofPremium(qty) {
  return chairWaterproofTotal(qty, "premium");
}

// src/lib/customPack.ts
var PACK_KIND_LABEL = { sofa: "Sofá", mattress: "Colchão", chairs: "Cadeiras", rug: "Tapete", carpet: "Alcatifa" };
var EXTRA_LABEL = { none: "Só limpeza", premium: "Limpeza + impermeabilização Premium (até 10 anos)", essencial: "Limpeza + impermeabilização Essencial (1 a 2 anos)", "anti-acaros": "Limpeza + tratamento anti-ácaros" };
var dimension = (s) => Number(s.trim().replace(",", "."));
function packItemValid(item) {
  if (!Number.isInteger(item.qty) || item.qty < 1 || item.qty > 100) return false;
  if (item.kind === "rug" || item.kind === "carpet") return [item.width, item.length].every((s) => Number.isFinite(dimension(s)) && dimension(s) > 0);
  return item.kind === "chairs" || (item.kind === "sofa" ? sofaPrices : mattressPrices).some((p) => p.id === item.size);
}
var PERK_TREATMENT = { none: "none", premium: "waterproofing", essencial: "waterproofing", "anti-acaros": "anti-acaros" };
function customPackLine(item) {
  const options = item.kind === "sofa" ? sofaPrices : mattressPrices;
  const option2 = options.find((p) => p.id === item.size);
  let amount2 = null;
  const size = item.kind === "rug" || item.kind === "carpet" ? `${item.width} × ${item.length} m` : item.kind === "chairs" ? `${item.qty} unidades` : option2?.label ?? "Tamanho a confirmar";
  const waterproofingOnly = item.primary === "waterproofing" && (item.extra === "premium" || item.extra === "essencial") && (item.kind === "sofa" || item.kind === "chairs");
  if (waterproofingOnly && item.kind === "chairs") {
    amount2 = (item.extra === "premium" ? calcChairWaterproofPremium(item.qty) : calcChairWaterproof(item.qty)) ?? null;
  } else if (waterproofingOnly && option2) {
    const unit = calcSofaUnitPrice(option2, false, "waterproofing", item.extra === "premium" ? "premium" : "essencial", false);
    amount2 = unit === null ? null : unit * item.qty;
  } else if (item.kind === "chairs") {
    amount2 = calcChairClean(item.qty);
    if (amount2 !== null) {
      if (item.extra === "premium") amount2 += calcChairWaterproofPremium(item.qty) ?? 0;
      if (item.extra === "essencial") amount2 += calcChairWaterproof(item.qty) ?? 0;
      if (item.extra === "anti-acaros") amount2 += chairAntiAcarosTotal(item.qty) ?? 0;
    }
  } else if (item.kind === "sofa" && option2) {
    const unit = calcSofaUnitPrice(option2, item.extra !== "none", "cleaning", item.extra === "premium" ? "premium" : "essencial", item.extra === "anti-acaros");
    amount2 = unit === null ? null : unit * item.qty;
  } else if (item.kind === "mattress" && option2) {
    const unit = calcMattressUnitPrice(option2, item.extra === "anti-acaros", "cleaning");
    amount2 = unit === null ? null : unit * item.qty;
  }
  return {
    label: `${PACK_KIND_LABEL[item.kind]} · ${size}${item.kind !== "chairs" ? ` · ${item.qty} un.` : ""} · ${waterproofingOnly ? `Só impermeabilização ${item.extra === "premium" ? "Premium (até 10 anos)" : "Essencial (1 a 2 anos)"}` : EXTRA_LABEL[item.extra]}`,
    amount: amount2,
    tablePrice: amount2,
    quote: amount2 === null
  };
}
function calculateCustomPack(items, city) {
  const waterproofingOnly = (item) => item.primary === "waterproofing" && (item.extra === "premium" || item.extra === "essencial");
  const chairsToClean = items.filter((i) => i.kind === "chairs" && !waterproofingOnly(i)).reduce((sum2, i) => sum2 + i.qty, 0);
  const table = items.map((item) => {
    const line = customPackLine(item);
    return item.kind === "chairs" && !waterproofingOnly(item) && chairsToClean >= 10 ? { ...line, amount: null, tablePrice: null, quote: true } : line;
  });
  const mainKind = items[0]?.kind;
  const perks = priceWithPackPerks(items.map((item, i) => ({
    kind: item.kind,
    sizeId: item.size,
    qty: item.qty,
    tablePrice: table[i].tablePrice,
    treatment: PERK_TREATMENT[item.extra]
  })), mainKind);
  const lines = table.map((line, i) => ({ ...line, ...perks.lines[i] }));
  const subtotal = Math.round(lines.reduce((sum2, line) => sum2 + (line.amount ?? 0), 0) * 100) / 100;
  const tableSubtotal = perks.tableSubtotal;
  const savings = Math.round((tableSubtotal - subtotal) * 100) / 100;
  const baseTravel = locationPrices[city] ?? null;
  const travel = baseTravel === null ? null : calculateTravelFee(baseTravel, subtotal);
  return {
    lines,
    mainKind,
    subtotal,
    tableSubtotal,
    savings,
    perkEligible: perks.eligible,
    travel,
    total: Math.round((subtotal + (travel ?? 0)) * 100) / 100,
    quote: lines.some((l) => l.quote) || travel === null,
    valid: items.length > 0 && items.every(packItemValid) && Boolean(city.trim())
  };
}

// src/constants/commercialPolicy.ts
var RESPONSE_PROMISE = "Resposta em menos de 5 minutos";
var DRYING_PROMISE = "Secagem média de 2 a 5 horas, dependendo da ventilação, do tecido e das condições do espaço.";
var SOFA_DRYING_RANGE = "2 a 5 horas";
var SOFA_DRYING_PROMISE = `Secagem média de ${SOFA_DRYING_RANGE}, dependendo da ventilação, do tecido e das condições do espaço.`;
var SATISFACTION_PROMISE = "Se não ficar satisfeito, contacte-nos até 48 horas após o serviço e repetimos a intervenção sem custos. Após esse prazo, esta garantia comercial de repetição deixa de se aplicar, sem prejuízo dos direitos legais.";
var PRICE_PROMISE = "A simulação é uma estimativa. Confirmamos o preço com base nos artigos, medidas, tratamento e deslocação antes da marcação. O valor confirmado mantém-se para esse serviço; alterações ao pedido são orçamentadas previamente.";
var AVAILABILITY_PROMISE = "Procuramos realizar o serviço no próprio dia ou no dia seguinte, mediante disponibilidade confirmada pela equipa.";
var COVERAGE_PROMISE = "Equipas em Braga, Porto, Coimbra, Lisboa e Algarve, com cobertura regular do litoral entre Viana do Castelo e o Algarve. Outras localidades mediante confirmação.";
var TREATMENT_EXTRAS = "A limpeza remove sujidade e resíduos das fibras. O tratamento anti-ácaros e a desbacterização são extras opcionais, escolhidos e orçamentados separadamente.";
var RUG_PICKUP_MIN_AREA_M2 = 3;
var RUG_PICKUP_MAX_AREA_M2 = 20;
var RUG_PICKUP_RULE = `Só fazemos recolha quando os tapetes do pedido somam entre ${RUG_PICKUP_MIN_AREA_M2} e ${RUG_PICKUP_MAX_AREA_M2} m²; fora disso, a lavagem é sempre feita em sua casa.`;
var RUG_PICKUP_FEE = 20;
function rugPickupFee(totalAreaM2) {
  if (!(totalAreaM2 >= RUG_PICKUP_MIN_AREA_M2) || totalAreaM2 > RUG_PICKUP_MAX_AREA_M2) return null;
  return RUG_PICKUP_FEE;
}
var RUG_PICKUP_FEE_RULE = `A recolha e entrega tem um custo adicional de ${RUG_PICKUP_FEE}€.`;
var travelFees = Object.values(locationPrices);
var TRAVEL_FEE_MIN = Math.min(...travelFees);
var TRAVEL_FEE_MAX = Math.max(...travelFees);
var TRAVEL_PROMISE = `A deslocação é cobrada à parte, entre ${TRAVEL_FEE_MIN}€ e ${TRAVEL_FEE_MAX}€ conforme a localidade. O valor de cada cidade aparece na respetiva página e a morada concreta é confirmada antes da marcação. Em tapetes e alcatifas, a deslocação também é sob orçamento.`;
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
var priced = (value, what) => required(typeof value === "number" ? value : null, what);
function sofaCleaningPrice(id) {
  return priced(option(sofaPrices, id, "sofaPrices").cleaningPrice, `a limpeza do sofá "${id}"`);
}
function chairCleaningTiers() {
  const tiers = [];
  let qty = 1;
  for (; qty < 100; qty++) {
    const total = calcChairClean(qty);
    if (total === null) break;
    const unit = Math.round((total - (calcChairClean(qty - 1) ?? 0)) * 100) / 100;
    const last = tiers[tiers.length - 1];
    if (last && last.unit === unit) last.last = qty;
    else tiers.push({ first: qty, last: qty, unit });
  }
  return { tiers, quoteFrom: qty };
}
var chairUnits = chairCleaningTiers().tiers.map((tier) => tier.unit);
var CHAIR_UNIT_MIN = Math.min(...chairUnits);
var CHAIR_UNIT_MAX = Math.max(...chairUnits);
var CHAIR_PRICE_LABEL = `Desde ${formatEuro(CHAIR_UNIT_MIN)}`;
var CHAIR_PRICE_SHORT = `a partir de ${formatEuro(CHAIR_UNIT_MIN)}`;

// src/lib/botRugEstimate.ts
var RUG_RATE_COMMON = 10;
var RUG_RATE_NATURAL = 12;
var RUG_ESTIMATE_MIN_AREA_M2 = 3;
var RUG_SMALL_COMBO_EXTRA = 10;
var RUG_VISIT_SOFA_PRICE = 70;
var fold = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();
var NATURAL = /\b(juta|sisal|rafia|coco|fibra natural|fibras naturais|seagrass)\b/;
var DELICATE = /\b(seda|silk|viscose|persa|persia|oriental|arraiolos|feito a mao|tecido a mao|hand ?made|kilim|tibetano|nepal)\b/;
function rugMaterialClass(material) {
  if (typeof material !== "string" || !material.trim()) return "common";
  const m = fold(material);
  if (DELICATE.test(m)) return "delicate";
  if (NATURAL.test(m)) return "natural";
  return "common";
}
var roundToNine = (value) => Math.max(9, Math.round((value - 9) / 10) * 10 + 9);
var roundDownToNine = (value) => Math.max(9, Math.floor((value - 9) / 10) * 10 + 9);
function rugComboEstimate(rugs, othersPrice, city) {
  const rug = rugEstimate(rugs, city);
  if (!rug.ok) return rug;
  const rugsWashing = roundToNine(rug.homePrice - rug.travelFee);
  if (rug.areaM2 < RUG_ESTIMATE_MIN_AREA_M2) {
    const usualPrice2 = othersPrice + rug.travelFee + rugsWashing;
    const comboPrice2 = roundToNine(othersPrice + rug.travelFee + RUG_SMALL_COMBO_EXTRA);
    return {
      ok: true,
      rugsWashing,
      othersPrice,
      usualPrice: usualPrice2,
      comboPrice: comboPrice2,
      travelWaived: usualPrice2 - comboPrice2,
      rule: "Tapete pequeno na mesma visita. Dá o preço como condição especial: com o tapete seria usualPrice, fazemos tudo por comboPrice. Depois a prova e as horas."
    };
  }
  const usualPrice = rug.homePrice + othersPrice + rug.travelFee;
  const comboPrice = roundDownToNine(rugsWashing + othersPrice);
  return {
    ok: true,
    rugsWashing,
    othersPrice,
    usualPrice,
    comboPrice,
    travelWaived: usualPrice - comboPrice,
    rule: "Lavagem em casa. Dá o preço como condição especial da mesma visita: em separado seria usualPrice, tudo na mesma visita fica comboPrice, com a deslocação oferecida. Uma frase curta sobre porque faz sentido (uma só deslocação), depois a prova e as horas."
  };
}
function rugEstimate(rugs, city) {
  if (!rugs.length) return { ok: false, reason: "sem tapetes" };
  if (!city || !(city in locationPrices)) return { ok: false, reason: "localidade não servida" };
  const rawArea = rugs.reduce((s, r) => s + r.qty * r.width * r.length, 0);
  if (rawArea >= RUG_ESTIMATE_MIN_AREA_M2 && rugs.some((r) => typeof r.material !== "string" || !r.material.trim())) {
    return { ok: false, needsMaterial: true, reason: "falta o material de cada tapete: vê-o na fotografia (microfibra, sintético, juta, sisal, lã…) ou pergunta-o numa frase, e volta a calcular" };
  }
  const classes = rugs.map((r) => rugMaterialClass(r.material));
  if (classes.includes("delicate")) return { ok: false, reason: "tapete delicado (seda, viscose, persa, Arraiolos ou feito à mão): o responsável dá o preço" };
  const areaM2 = Math.round(rugs.reduce((s, r) => s + r.qty * r.width * r.length, 0) * 100) / 100;
  const washing = rugs.reduce((s, r, i) => s + r.qty * r.width * r.length * (classes[i] === "natural" ? RUG_RATE_NATURAL : RUG_RATE_COMMON), 0);
  const travelFee = locationPrices[city];
  const homePrice = roundToNine(washing + travelFee);
  const pickupFee = rugPickupFee(areaM2);
  return {
    ok: true,
    areaM2,
    ratePerM2: [...new Set(classes.map((c) => c === "natural" ? RUG_RATE_NATURAL : RUG_RATE_COMMON))],
    travelFee,
    homePrice,
    pickupFee,
    pickupPrice: pickupFee === null ? null : homePrice + pickupFee,
    sofaUpsellPrice: RUG_VISIT_SOFA_PRICE,
    sofaUsualPrice: sofaCleaningPrice("3-lugares") + travelFee,
    rule: "Em casa: homePrice, com a deslocação incluída. Com recolha e entrega: pickupPrice (null = sem recolha). Depois, numa mensagem à parte e uma vez só: o sofá na mesma visita por sofaUpsellPrice, em vez de sofaUsualPrice."
  };
}

// src/lib/botCloseNow.ts
var CLOSE_NOW_WATERPROOFING_RATE = 0.05;
var CLOSE_NOW_DAYS = 7;
var CLOSE_NOW_MAX_TOTAL = 200;
var OWNER_DECIDES = `acima de ${CLOSE_NOW_MAX_TOTAL}€: a condição é decidida pelo responsável (handoff "pediu desconto, acima de ${CLOSE_NOW_MAX_TOTAL}€: decides tu")`;
var CLOSE_NOW_CONDITION = `Só se ficar marcado já, nesta conversa, para um dos dias que temos livres nos próximos ${CLOSE_NOW_DAYS} dias.`;
var closeNowDiscount = (price) => price <= 150 ? 10 : 10 + 5 * Math.ceil((price - 150) / 50);
var closeNowPrice = (price, waterproofing = false) => waterproofing ? Math.round(price * (1 - CLOSE_NOW_WATERPROOFING_RATE)) : Math.max(0, price - closeNowDiscount(price));
var RULE = "Usa só quando o cliente disse que o problema é o preço, uma vez por conversa, e diz sempre a condição.";
function closeNowOffer(q) {
  if (q.rug) {
    if (Math.max(q.rug.homePrice, q.rug.pickupPrice ?? 0) > CLOSE_NOW_MAX_TOTAL) return { ok: false, reason: OWNER_DECIDES };
    return {
      ok: true,
      total: null,
      homePrice: closeNowPrice(q.rug.homePrice),
      pickupPrice: q.rug.pickupPrice === null ? null : closeNowPrice(q.rug.pickupPrice),
      condition: CLOSE_NOW_CONDITION,
      rule: RULE
    };
  }
  if (q.handToOwner || q.total === null) return { ok: false, reason: "sob orçamento: o preço é do responsável" };
  if (q.total > CLOSE_NOW_MAX_TOTAL) return { ok: false, reason: OWNER_DECIDES };
  return { ok: true, total: closeNowPrice(q.total, q.waterproofing), homePrice: null, pickupPrice: null, condition: CLOSE_NOW_CONDITION, rule: RULE };
}

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
  }
];

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

// src/lib/botQuote.ts
var BOT_TREATMENTS = ["clean", "clean+essencial", "clean+premium", "clean+anti-acaros", "essencial", "premium"];
var KINDS = ["sofa", "mattress", "chairs", "rug", "carpet"];
var MAX_ITEMS = 20;
var TREATMENT_TO_ITEM = {
  clean: { extra: "none", primary: "cleaning" },
  "clean+essencial": { extra: "essencial", primary: "cleaning" },
  "clean+premium": { extra: "premium", primary: "cleaning" },
  "clean+anti-acaros": { extra: "anti-acaros", primary: "cleaning" },
  essencial: { extra: "essencial", primary: "waterproofing" },
  premium: { extra: "premium", primary: "waterproofing" }
};
var fold2 = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase().replace(/\s+/g, " ");
var CITY_BY_FOLDED = new Map(Object.keys(locationPrices).map((name) => [fold2(name), name]));
function resolveBotCity(input) {
  if (typeof input !== "string") return null;
  for (const part of [input, ...input.split(/[,()/]/)]) {
    const key = fold2(part);
    if (!key) continue;
    const city = CITY_BY_FOLDED.get(key) ?? freguesiaToMunicipio.get(key) ?? parishPartToMunicipio.get(key);
    if (city) return city;
  }
  return null;
}
function listBotCities() {
  return Object.entries(locationPrices).map(([name, travelFee]) => ({ name, travelFee, extendedTrip: EXTENDED_TRIP_CITIES.has(name) }));
}
var BOT_SIZES = {
  sofa: sofaPrices.map((p) => p.id),
  mattress: mattressPrices.map((p) => p.id)
};
var fail = (error) => ({ ok: false, error });
function toItem(raw, index) {
  if (!raw || typeof raw !== "object") return fail(`items[${index}] tem de ser um objeto`);
  const r = raw;
  const kind = r.kind;
  if (!KINDS.includes(kind)) return fail(`items[${index}].kind tem de ser um de: ${KINDS.join(", ")}`);
  const treatment = r.treatment ?? "clean";
  if (!BOT_TREATMENTS.includes(treatment)) return fail(`items[${index}].treatment tem de ser um de: ${BOT_TREATMENTS.join(", ")}`);
  const qty = r.qty ?? 1;
  if (typeof qty !== "number" || !Number.isInteger(qty) || qty < 1 || qty > 100) return fail(`items[${index}].qty tem de ser um inteiro entre 1 e 100`);
  const { extra, primary } = TREATMENT_TO_ITEM[treatment];
  if (kind === "mattress" && (extra === "premium" || extra === "essencial")) return fail(`items[${index}]: colchões não se impermeabilizam`);
  if ((kind === "rug" || kind === "carpet") && treatment !== "clean") return fail(`items[${index}]: tapetes e alcatifas só têm limpeza`);
  let size = "";
  if (kind === "sofa" && r.size === "u") {
    const seats = r.seats;
    if (typeof seats !== "number" || !Number.isInteger(seats) || seats < 2 || seats > 15) return fail(`items[${index}].seats (lugares contados na fotografia, 2 a 15) é obrigatório num sofá em U`);
    size = treatment !== "clean" ? "4+-lugares" : seats <= 4 ? "4-lugares" : "5-lugares";
  } else if (kind === "sofa" || kind === "mattress") {
    size = typeof r.size === "string" ? r.size : "";
    if (!BOT_SIZES[kind].includes(size)) return fail(`items[${index}].size tem de ser um de: ${BOT_SIZES[kind].join(", ")}${kind === "sofa" ? ", ou u (sofá em U, com seats)" : ""}`);
  }
  const dim = (v) => {
    const side = typeof v === "number" ? rugSide(v) : null;
    return side ? String(side.meters) : "";
  };
  const width = kind === "rug" || kind === "carpet" ? dim(r.width) : "";
  const length = kind === "rug" || kind === "carpet" ? dim(r.length) : "";
  if ((kind === "rug" || kind === "carpet") && (!width || !length)) return fail(`items[${index}]: tapetes e alcatifas precisam de width e length em metros (ou centímetros, a partir de ${RUG_SIDE_MAX_METERS + 1})`);
  return { id: String(index), kind, size, qty, extra, primary, width, length };
}
var WATERPROOFING_TRAVEL_MAX = 10;
var isWaterproofing = (i) => i.extra === "essencial" || i.extra === "premium";
var withTier = (items, tier) => items.map((i) => isWaterproofing(i) ? { ...i, extra: tier } : i);
var cents = (n) => Math.round(n * 100) / 100;
function waterproofingTiers(items, city) {
  const premium = calculateCustomPack(withTier(items, "premium"), city);
  const essencial = calculateCustomPack(withTier(items, "essencial"), city);
  if (premium.travel === null) return null;
  const baseFee = locationPrices[city] ?? 0;
  const travel = baseFee > WATERPROOFING_TRAVEL_MAX ? WATERPROOFING_TRAVEL_MAX : Math.min(premium.travel, WATERPROOFING_TRAVEL_MAX);
  return {
    travel,
    premium: premium.quote ? null : cents(premium.subtotal + travel),
    essencial: essencial.quote ? null : cents(essencial.subtotal + travel)
  };
}
function rugPickupFor(items) {
  const rugs = items.filter((i) => i.kind === "rug");
  if (!rugs.length) return null;
  const areaM2 = Math.round(rugs.reduce((sum2, i) => sum2 + i.qty * Number(i.width) * Number(i.length), 0) * 100) / 100;
  return { areaM2, minAreaM2: RUG_PICKUP_MIN_AREA_M2, fee: rugPickupFee(areaM2), rule: RUG_PICKUP_FEE_RULE };
}
var PUFF_PRICE = 25;
var PUFF_SAME_VISIT_PRICE = 20;
function puffQuote(qty, city, withOthers, othersTotal) {
  const unitPrice = withOthers ? PUFF_SAME_VISIT_PRICE : PUFF_PRICE;
  const amount2 = qty * unitPrice;
  const travel = withOthers ? 0 : city !== null ? locationPrices[city] ?? null : null;
  return {
    qty,
    tablePrice: PUFF_PRICE,
    unitPrice,
    specialCondition: withOthers,
    amount: amount2,
    travel,
    // Order total with the puffs; null when the rest of the order has no price.
    total: withOthers ? othersTotal === null ? null : cents(othersTotal + amount2) : travel === null ? null : amount2 + travel
  };
}
var U_WATERPROOFING_EXTRA = { premium: 150, essencial: 90 };
var U_WATERPROOFING_ALONE = { premium: 179, essencial: 129 };
function uWaterproofingQuote(input) {
  const raw = input.items;
  if (!Array.isArray(raw)) return null;
  const treatmentOf = (r) => String(r.treatment ?? "");
  const isU = (r) => !!r && typeof r === "object" && r.kind === "sofa" && r.size === "u";
  const isUw = (r) => isU(r) && ["clean+premium", "clean+essencial", "premium", "essencial"].includes(treatmentOf(r));
  const uItems = raw.filter(isUw);
  if (!uItems.length) return null;
  if (raw.some((r) => !isUw(r) && r && typeof r === "object" && /premium|essencial/.test(treatmentOf(r)))) return null;
  const alone = uItems.every((r) => !treatmentOf(r).startsWith("clean"));
  if (!alone && uItems.some((r) => !treatmentOf(r).startsWith("clean"))) return null;
  const n = uItems.reduce((sum2, r) => sum2 + (typeof r.qty === "number" ? r.qty : 1), 0);
  const tier = /premium/.test(treatmentOf(uItems[0])) ? "premium" : "essencial";
  const others = raw.filter((r) => !isUw(r));
  if (alone) {
    const city = resolveBotCity(input.city);
    if (city === null || EXTENDED_TRIP_CITIES.has(city)) return null;
    const base2 = others.length ? botQuote({ ...input, items: others }) : null;
    if (base2 && (!base2.ok || base2.quote || base2.total === null)) return null;
    const rest = base2 && base2.ok && base2.total !== null ? base2.total : 0;
    const premium2 = cents(rest + U_WATERPROOFING_ALONE.premium * n);
    const essencial2 = cents(rest + U_WATERPROOFING_ALONE.essencial * n);
    const total2 = tier === "premium" ? premium2 : essencial2;
    const amount2 = U_WATERPROOFING_ALONE[tier] * n;
    const line = { label: `Impermeabilização ${tier === "premium" ? "Premium" : "Essencial"} sofá em U`, amount: amount2, tablePrice: amount2, perkApplied: false, perkNote: void 0, quote: false };
    return {
      ok: true,
      city,
      cityKnown: true,
      extendedTrip: false,
      sharedTrip: false,
      lines: [...base2 && base2.ok ? base2.lines : [], line],
      subtotal: cents((base2 && base2.ok ? base2.subtotal : 0) + amount2),
      savings: 0,
      perkEligible: false,
      travel: base2 && base2.ok ? base2.travel : 0,
      total: total2,
      waterproofingTiers: { travel: base2 && base2.ok ? base2.travel : 0, premium: premium2, essencial: essencial2 },
      quote: false,
      handToOwner: false,
      rugPickup: null,
      rugEstimate: null,
      rugCombo: null,
      puff: base2 && base2.ok ? base2.puff : null,
      closeNow: closeNowOffer({ total: total2, waterproofing: true, handToOwner: false, rug: null })
    };
  }
  const base = botQuote({ ...input, items: raw.map((r) => isUw(r) ? { ...r, treatment: "clean" } : r) });
  if (!base.ok || base.quote || base.total === null) return null;
  const premium = cents(base.total + U_WATERPROOFING_EXTRA.premium * n);
  const essencial = cents(base.total + U_WATERPROOFING_EXTRA.essencial * n);
  const total = tier === "premium" ? premium : essencial;
  return {
    ...base,
    lines: [...base.lines, { label: `Impermeabilização ${tier === "premium" ? "Premium" : "Essencial"} sofá em U`, amount: U_WATERPROOFING_EXTRA[tier] * n, tablePrice: U_WATERPROOFING_EXTRA[tier] * n, perkApplied: false, perkNote: void 0, quote: false }],
    subtotal: cents(base.subtotal + U_WATERPROOFING_EXTRA[tier] * n),
    total,
    waterproofingTiers: { travel: base.travel, premium, essencial },
    closeNow: closeNowOffer({ total, waterproofing: true, handToOwner: base.handToOwner, rug: null })
  };
}
function botQuote(input) {
  if (input && typeof input === "object") {
    const u = uWaterproofingQuote(input);
    if (u) return withBigOrder(u);
  }
  return withBigOrder(botQuoteInner(input));
}
var BIG_ORDER_MIN = 300;
var BIG_ORDER_CUT = { cleaning: 0.07, waterproofing: 0.04 };
var BIG_ORDER_MIN_SAVING = 20;
var endIn9 = (v) => Math.floor((v + 1) / 10) * 10 - 1;
function bigOrderPrice(total, travel, waterproofing) {
  const cut = waterproofing ? BIG_ORDER_CUT.waterproofing : BIG_ORDER_CUT.cleaning;
  const special = endIn9((total - travel) * (1 - cut));
  return total - special >= BIG_ORDER_MIN_SAVING ? special : endIn9(total - BIG_ORDER_MIN_SAVING);
}
function withBigOrder(r) {
  const q = r;
  if (!q.ok || q.quote || q.handToOwner || typeof q.total !== "number" || q.total <= BIG_ORDER_MIN) return { ...r, bigOrder: null };
  const wp = !!q.waterproofingTiers;
  const travel = q.travel ?? 0;
  const special = bigOrderPrice(q.total, travel, wp);
  const t = q.waterproofingTiers;
  const tierPrice = (v) => v === null ? null : v > BIG_ORDER_MIN ? bigOrderPrice(v, t.travel, true) : v;
  return { ...r, bigOrder: { normal: q.total, special, savings: cents(q.total - special), tiers: t ? { premium: tierPrice(t.premium), essencial: tierPrice(t.essencial) } : null } };
}
function botQuoteInner(input) {
  if (!input || typeof input !== "object") return fail("O pedido tem de ter items e city");
  const { items: rawItemsIn, city: rawCity, sharedTrip: rawShared, puffs: rawPuffs } = input;
  const puffs = rawPuffs ?? 0;
  if (typeof puffs !== "number" || !Number.isInteger(puffs) || puffs < 0 || puffs > 20) return fail("puffs tem de ser um inteiro entre 0 e 20");
  const rawItems = rawItemsIn ?? [];
  if (Array.isArray(rawItems) && rawItems.length === 0 && puffs > 0) {
    const city2 = resolveBotCity(rawCity);
    const puff = puffQuote(puffs, city2, false, null);
    const extendedTrip2 = city2 !== null && EXTENDED_TRIP_CITIES.has(city2);
    return {
      ok: true,
      city: city2,
      cityKnown: city2 !== null,
      extendedTrip: extendedTrip2,
      sharedTrip: false,
      lines: [],
      subtotal: puff.amount,
      savings: 0,
      perkEligible: false,
      travel: puff.travel ?? 0,
      total: puff.total ?? puff.amount,
      waterproofingTiers: null,
      quote: false,
      handToOwner: city2 === null || extendedTrip2,
      rugPickup: null,
      rugEstimate: null,
      rugCombo: null,
      puff,
      closeNow: closeNowOffer({ total: puff.total, waterproofing: false, handToOwner: city2 === null || extendedTrip2, rug: null })
    };
  }
  if (!Array.isArray(rawItems) || rawItems.length === 0) return fail("items tem de ser uma lista com pelo menos um artigo");
  if (rawItems.length > MAX_ITEMS) return fail(`No máximo ${MAX_ITEMS} artigos por orçamento`);
  const items = [];
  for (const [i, raw] of rawItems.entries()) {
    const item = toItem(raw, i);
    if ("ok" in item) return item;
    items.push(item);
  }
  const city = resolveBotCity(rawCity);
  const result = calculateCustomPack(items, city ?? "");
  const tiers = items.some(isWaterproofing) ? waterproofingTiers(items, city ?? "") : null;
  const extendedTrip = city !== null && EXTENDED_TRIP_CITIES.has(city);
  const sharedTrip = extendedTrip && rawShared === true && !result.quote;
  const tiersOut = tiers && sharedTrip ? { travel: 0, premium: tiers.premium === null ? null : cents(tiers.premium - tiers.travel), essencial: tiers.essencial === null ? null : cents(tiers.essencial - tiers.travel) } : tiers;
  const travel = sharedTrip ? 0 : tiers ? tiers.travel : result.travel;
  const total = sharedTrip ? cents(result.subtotal) : tiers ? cents(result.subtotal + tiers.travel) : result.total;
  const rugsOnly = items.every((i) => i.kind === "rug");
  const rugPrice = rugsOnly ? rugEstimate(items.map((i, n) => ({ width: Number(i.width), length: Number(i.length), qty: i.qty, material: rawItems[n].material })), city) : null;
  const rugIdx = items.flatMap((i, n) => i.kind === "rug" ? [n] : []);
  const others = items.filter((i) => i.kind !== "rug");
  const othersResult = !rugsOnly && rugIdx.length && others.length ? calculateCustomPack(others, city ?? "") : null;
  const rugCombo = othersResult && !othersResult.quote ? rugComboEstimate(rugIdx.map((n) => ({ width: Number(items[n].width), length: Number(items[n].length), qty: items[n].qty, material: rawItems[n].material })), othersResult.subtotal, city) : null;
  const rugPriced = rugPrice?.ok === true || rugCombo?.ok === true;
  const handToOwner = result.quote && !rugPriced || city === null || extendedTrip && !sharedTrip;
  return {
    ok: true,
    city,
    cityKnown: city !== null,
    extendedTrip,
    sharedTrip,
    lines: result.lines.map((line) => ({
      label: line.label,
      amount: line.amount,
      tablePrice: line.tablePrice,
      perkApplied: line.perkApplied,
      perkNote: line.perkNote,
      quote: line.quote
    })),
    subtotal: result.subtotal,
    savings: result.savings,
    perkEligible: result.perkEligible,
    travel,
    total,
    // Both versions of the same order, same travel: quote them from here.
    waterproofingTiers: tiersOut,
    quote: result.quote,
    handToOwner,
    rugPickup: rugPickupFor(items),
    rugEstimate: rugPrice,
    rugCombo,
    // Puffs on the same visit: 20€ each (special condition). Add puff.amount to the price you quote.
    puff: puffs > 0 ? puffQuote(puffs, city, true, rugCombo?.ok ? rugCombo.comboPrice : rugPrice?.ok ? rugPrice.homePrice : result.quote ? null : total) : null,
    // Discount to close now, only when the client said the price is the problem (owner, 13 Oct 2026).
    closeNow: closeNowOffer({
      total: result.quote ? null : total,
      waterproofing: items.some(isWaterproofing),
      handToOwner: handToOwner && !rugPriced,
      rug: rugPrice?.ok ? { homePrice: rugPrice.homePrice, pickupPrice: rugPrice.pickupPrice } : rugCombo?.ok ? { homePrice: rugCombo.comboPrice, pickupPrice: null } : null
    })
  };
}

// src/data/serviceCatalog.ts
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
  // Leiria e Batalha (equipa Coimbra, dono 2026-10-26)
  { name: "Leiria", slug: "leiria", region: "secondary", area: "coimbra", description: "cidade do castelo, no centro litoral" },
  { name: "Batalha", slug: "batalha", region: "secondary", area: "coimbra", description: "vila do mosteiro, junto a Leiria" },
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

// src/lib/postalRegion.ts
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

// src/lib/botAvailability.ts
var TEAMS_BY_REGION = {
  Porto: ["Porto 1", "Porto 2"],
  Braga: ["Braga"],
  Lisboa: ["Lisboa 1"],
  Algarve: ["Algarve"],
  Coimbra: ["Coimbra"]
};
var ALL_TEAMS = Object.values(TEAMS_BY_REGION).flat();
var WATERPROOFING_TEAMS = { Braga: ["Porto 1"] };
var teamsFor = (zone, waterproofing) => waterproofing && WATERPROOFING_TEAMS[zone] || TEAMS_BY_REGION[zone];
function hasWaterproofing(items) {
  return Array.isArray(items) && items.some((i) => /essencial|premium/.test(String(i?.treatment ?? "")));
}
var TEAM_CAPACITY = { "Lisboa 1": 2 };
var capacity = (team) => TEAM_CAPACITY[team] ?? 1;
var TEAM_TRAVEL_MARGIN_MIN = { "Porto 1": 60 };
var marginMs = (team) => (team && TEAM_TRAVEL_MARGIN_MIN[team] || TRAVEL_MARGIN_MIN) * 6e4;
var TEAM_WEEKDAY_HOURS = { "Porto 2": { from: 8, to: 13 } };
var isWeekday = (date) => {
  const d = (/* @__PURE__ */ new Date(`${date}T12:00:00Z`)).getUTCDay();
  return d >= 1 && d <= 5;
};
function teamWorks(team, from, to) {
  const hours = TEAM_WEEKDAY_HOURS[team];
  if (!hours) return true;
  const start = lisbon(from), end = lisbon(to);
  if (!isWeekday(start.date)) return true;
  return start.date === end.date && start.minutes >= hours.from * 60 && end.minutes <= hours.to * 60;
}
var teamEarliestMinutes = (team, date) => (TEAM_WEEKDAY_HOURS[team] && isWeekday(date) ? Math.min(TEAM_WEEKDAY_HOURS[team].from, EARLIEST_HOUR) : EARLIEST_HOUR) * 60;
var TEAM_REGION = new Map(Object.entries(TEAMS_BY_REGION).flatMap(([region, teams]) => teams.map((t) => [t, region])));
var AREA_REGION = {
  porto: "Porto",
  braga: "Braga",
  lisboa: "Lisboa",
  algarve: "Algarve",
  coimbra: "Coimbra"
};
function zoneFromPostalCode(code) {
  const n = Number(code.slice(0, 4));
  if (n >= 3e3 && n < 3100) return "Coimbra";
  return localityFromPostalCode(code);
}
var MINUTES = { sofa: 60, mattress: 45, chair: 10, rugPerM2: 4, waterproofing: 20, minimum: 45 };
var TRAVEL_MARGIN_MIN = 30;
var EARLIEST_HOUR = 10;
var DAY_END_HOUR = 21;
var LAST_OFFER_HOUR = 18;
var LEAD_TIME_MIN = 90;
var DEFAULT_DAYS = 4;
var MAX_DAYS = 14;
var DAY_RULES = [
  // Owner, 26 Oct 2026 at night: "amanhã no Porto só te quero marcar serviços para quarta-feira".
  {
    zone: "Porto",
    from: "2026-10-26",
    until: "2026-10-27",
    closed: [{ date: "2026-10-27" }],
    prefer: ["2026-10-28"],
    onlyPreferred: true,
    note: "Terça (dia 27) já não temos vaga no Porto: oferece quarta (dia 28)."
  },
  // "E para Lisboa podes marcar para a parte da tarde, mas … principalmente serviços para quarta-feira".
  {
    zone: "Lisboa",
    from: "2026-10-26",
    until: "2026-10-27",
    closed: [{ date: "2026-10-27", fromHour: 14 }],
    prefer: ["2026-10-28"],
    note: "Terça (dia 27) em Lisboa só há vaga à tarde, a partir das 14h: oferece primeiro quarta (dia 28)."
  }
];
var fold3 = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
var CITY_REGION = new Map(cities.map((c) => [fold3(c.name), AREA_REGION[c.area]]));
var CITY_NAMES = cities.map((c) => ({ key: fold3(c.name), region: AREA_REGION[c.area] })).filter((c) => c.key.length >= 4).sort((a, b) => b.key.length - a.key.length);
var SERVICE_LIKE = /^(servico|limpeza|pre-? ?reserva|a confirmar)\b/;
var TEAM_LINE = /^\s*Equipa:\s*([^\n<]*)/im;
var POSTAL = /\b(\d{4})-\d{3}\b/;
function eventTeam(e) {
  const t = TEAM_LINE.exec(e.description ?? "")?.[1];
  if (!t) return null;
  const k = fold3(t);
  return ALL_TEAMS.find((team) => fold3(team) === k) ?? null;
}
function eventRegion(e) {
  const text2 = `${e.summary}
${e.description}`;
  const postal = POSTAL.exec(text2);
  if (postal) {
    const r = zoneFromPostalCode(postal[1]);
    if (r) return r;
  }
  const folded = fold3(e.summary);
  for (const c of CITY_NAMES) {
    if (new RegExp(`(^|[^a-z])${c.key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z]|$)`).test(folded)) return c.region;
  }
  return null;
}
function visitMinutes(items) {
  if (!Array.isArray(items) || !items.length) return 60;
  let total = 0;
  for (const raw of items) {
    const qty = Math.max(1, Math.min(50, Math.floor(Number(raw?.qty) || 1)));
    const t = String(raw?.treatment ?? "clean");
    const waterproof = /essencial|premium/.test(t);
    switch (raw?.kind) {
      case "sofa":
        total += qty * (MINUTES.sofa + (waterproof ? MINUTES.waterproofing : 0));
        break;
      case "mattress":
        total += qty * (MINUTES.mattress + (waterproof ? MINUTES.waterproofing : 0));
        break;
      case "chairs":
        total += qty * MINUTES.chair + (waterproof ? MINUTES.waterproofing : 0);
        break;
      case "rug":
      case "carpet": {
        const m2 = Number(raw?.width) * Number(raw?.length);
        total += qty * (Number.isFinite(m2) && m2 > 0 ? m2 * MINUTES.rugPerM2 : 30);
        break;
      }
      default:
        total += 60;
    }
  }
  return Math.ceil(Math.max(MINUTES.minimum, total) / 15) * 15;
}
var lisbonParts = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Lisbon",
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit"
});
function lisbon(ms) {
  const p = Object.fromEntries(lisbonParts.formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, minutes: Number(p.hour) * 60 + Number(p.minute) };
}
function lisbonToUtc(date, minutes) {
  const [y, m, d] = date.split("-").map(Number);
  const wall = Date.UTC(y, m - 1, d, 0, minutes);
  let t = wall;
  for (let i = 0; i < 2; i++) {
    const l = lisbon(t);
    const [ly, lm, ld] = l.date.split("-").map(Number);
    t += wall - Date.UTC(ly, lm - 1, ld, 0, l.minutes);
  }
  return t;
}
var addDays = (date, n) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
};
var WEEKDAYS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
var weekday = (date) => WEEKDAYS[(/* @__PURE__ */ new Date(`${date}T12:00:00Z`)).getUTCDay()];
function dayLabel(date, today) {
  if (date === today) return `hoje (${weekday(date)})`;
  if (date === addDays(today, 1)) return `amanhã (${weekday(date)})`;
  return `${weekday(date)} (dia ${Number(date.slice(8))})`;
}
var hourLabel = (minutes) => `${Math.floor(minutes / 60)}h${minutes % 60 ? String(minutes % 60).padStart(2, "0") : ""}`;
function busyIntervals(events) {
  const out = [];
  for (const e of events) {
    if (!e.start || String(e.status).toUpperCase() === "CANCELLED") continue;
    const from = Date.parse(e.start);
    if (!Number.isFinite(from)) continue;
    const parsedEnd = e.end ? Date.parse(e.end) : NaN;
    const to = Number.isFinite(parsedEnd) && parsedEnd > from ? parsedEnd : from + 60 * 6e4;
    const team = eventTeam(e);
    if (team) {
      out.push({ from, to, team, region: null });
      continue;
    }
    if (!SERVICE_LIKE.test(fold3(e.summary))) continue;
    const region = eventRegion(e);
    if (region) out.push({ from, to, team: null, region });
  }
  return out;
}
function slotState(busy, teams, region, from, to) {
  const margin = TRAVEL_MARGIN_MIN * 6e4;
  const overlaps = (b) => b.from < to + margin && b.to > from - margin;
  const overlapsFor = (t) => (b) => b.from < to + marginMs(t) && b.to > from - marginMs(t);
  const spare = (t) => capacity(t) - busy.filter((b) => b.team === t && overlapsFor(t)(b)).length;
  const early = (t) => lisbon(from).minutes < teamEarliestMinutes(t, lisbon(from).date);
  const teamsFree = teams.filter((t) => teamWorks(t, from, to) && !early(t) && spare(t) > 0);
  const unassigned = busy.filter((b) => !b.team && b.region === region && overlaps(b)).length;
  const near = (t) => busy.some((b) => b.team === t && (from - b.to >= 0 && from - b.to <= 90 * 6e4 || b.from - to >= 0 && b.from - to <= 90 * 6e4));
  const room = teamsFree.reduce((n, t) => n + spare(t), 0);
  const sameTime = busy.some((b) => (b.team ? TEAM_REGION.get(b.team) === region : b.region === region) && b.from < to && b.to > from);
  return { free: room - unassigned >= 1, teamsFree, nearOtherJob: teamsFree.some(near), nearTeams: teamsFree.filter(near), sameTime };
}
function teamBusyAt(events, team, startIso, endIso) {
  const from = Date.parse(startIso), to = Date.parse(endIso);
  if (!Number.isFinite(from) || !(to > from)) return true;
  if (!teamWorks(team, from, to)) return true;
  const margin = marginMs(team);
  return busyIntervals(events).filter((b) => b.team === team && b.from < to + margin && b.to > from - margin).length >= capacity(team);
}
function chooseTeam(events, city, startIso, endIso, waterproofing = false) {
  const name = resolveBotCity(city);
  const area = name ? CITY_REGION.get(fold3(name)) : void 0;
  if (!area) return null;
  const from = Date.parse(startIso), to = Date.parse(endIso);
  if (!Number.isFinite(from) || !(to > from)) return null;
  const busy = busyIntervals(events);
  const order = teamsFor(area, waterproofing);
  const st = slotState(busy, order, area, from, to);
  if (!st.free) return null;
  const day = lisbon(from).date;
  const jobsThatDay = (t) => busy.filter((b) => b.team === t && lisbon(b.from).date === day).length;
  return [...st.teamsFree].sort((a, b) => Number(st.nearTeams.includes(b)) - Number(st.nearTeams.includes(a)) || jobsThatDay(a) - jobsThatDay(b) || order.indexOf(a) - order.indexOf(b))[0] ?? null;
}
var FAR_ZONES = [
  {
    cities: ["Alcácer do Sal", "Grândola", "Santiago do Cacém", "Sines"],
    places: ["alcacer", "grandola", "santiago do cacem", "sines", "santo andre", "comporta", "troia", "melides", "porto covo", "carvalhal"],
    postal: [7500, 7599]
  },
  { cities: ["Aveiro"], places: ["aveiro", "ilhavo", "gafanha", "costa nova", "barra"], postal: [3800, 3839] }
];
var farZoneOf = (city) => FAR_ZONES.find((z) => z.cities.includes(city)) ?? null;
function inFarZone(e, zone) {
  const text2 = `${e.summary}
${e.description}`;
  const postal = POSTAL.exec(text2);
  if (postal) {
    const n = Number(postal[1]);
    return n >= zone.postal[0] && n <= zone.postal[1];
  }
  const f = fold3(e.summary);
  return zone.places.some((p) => new RegExp(`(^|[^a-z])${p}([^a-z]|$)`).test(f));
}
function sharedTripAvailability(req, city, area, durationMin, events, now) {
  const empty = { city, region: area, teams: [], durationMin, suggestion: null, requested: null, free: [], sharedTrip: null };
  const zone = farZoneOf(city);
  const today = lisbon(now.getTime()).date;
  const last = addDays(today, MAX_DAYS - 1);
  const earliest = now.getTime() + LEAD_TIME_MIN * 6e4;
  const anchors = zone ? events.filter((e) => e.start && e.end && String(e.status).toUpperCase() !== "CANCELLED" && /^servico\b/.test(fold3(e.summary)) && eventTeam(e) && inFarZone(e, zone)).map((e) => ({ team: eventTeam(e), from: Date.parse(e.start), to: Date.parse(e.end) })).filter((a) => Number.isFinite(a.to) && a.to > now.getTime() && lisbon(a.from).date <= last).sort((a, b) => a.from - b.from) : [];
  const onlyDay = typeof req.date === "string" && DATE.test(req.date) ? req.date : null;
  const usable = anchors.filter((a) => !onlyDay || lisbon(a.from).date === onlyDay);
  if (!usable.length) return { ...empty, handToOwner: "Disponibilidade sob consulta (deslocação alargada): a data é do responsável" };
  const margin = TRAVEL_MARGIN_MIN * 6e4;
  const busyTeam = (team, from, to) => teamBusyAt(events, team, new Date(from).toISOString(), new Date(to).toISOString());
  const trips = usable.map((a) => {
    const date = lisbon(a.from).date;
    const startMin = Math.ceil(lisbon(a.to + margin).minutes / 30) * 30;
    const slots = [];
    for (let m = Math.max(startMin, EARLIEST_HOUR * 60); m <= LAST_OFFER_HOUR * 60 && m + durationMin <= DAY_END_HOUR * 60; m += 30) {
      const from = lisbonToUtc(date, m);
      if (from < earliest || busyTeam(a.team, from, from + durationMin * 6e4)) continue;
      slots.push({ date, minutes: m, label: dayLabel(date, today), time: hourLabel(m), teamsFree: [a.team], nearOtherJob: true, sameTime: false });
    }
    return { a, date, slots };
  });
  const trip = trips.find((t) => t.slots.length);
  const first = trip?.slots[0];
  const second = trip && first ? trip.slots.find((s) => s.minutes - first.minutes >= 180) ?? trip.slots.find((s) => s.minutes - first.minutes >= 120) ?? trip.slots[1] : void 0;
  const two = [first, second].filter((s) => !!s);
  let requested = null;
  let reqTrip = trip;
  if (req.time !== void 0) {
    const m = parseTime(req.time);
    if (m === null || !onlyDay) return { error: 'time precisa de date e de uma hora como "15h" ou "15:30"' };
    const from = lisbonToUtc(onlyDay, m), to = from + durationMin * 6e4;
    const inHours = m >= 7 * 60 && m + durationMin <= DAY_END_HOUR * 60 && from >= now.getTime();
    const fit = trips.find((t) => !busyTeam(t.a.team, from, to)) ?? trips[0];
    reqTrip = fit;
    const free = inHours && !busyTeam(fit.a.team, from, to);
    requested = {
      date: onlyDay,
      time: hourLabel(m),
      free,
      teamsFree: free ? [fit.a.team] : [],
      sameTime: false,
      start: new Date(from).toISOString(),
      end: new Date(to).toISOString()
    };
  }
  const chosen = reqTrip ?? trips[0];
  const sharedTrip = { date: chosen.date, team: chosen.a.team, anchorEnd: new Date(chosen.a.to).toISOString(), anchorTime: hourLabel(lisbon(chosen.a.from).minutes) };
  if (!two.length && !requested) return { ...empty, handToOwner: "Disponibilidade sob consulta (deslocação alargada): a data é do responsável" };
  return {
    ...empty,
    teams: [sharedTrip.team],
    handToOwner: two.length ? null : "Equipa na zona mas sem hora livre a seguir: o responsável confirma",
    suggestion: two.length ? { text: suggestionText(two), slots: two } : null,
    requested,
    free: trip ? [{ date: trip.date, label: dayLabel(trip.date, today), times: trip.slots.map((s) => s.time) }] : [],
    sharedTrip
  };
}
var DATE = /^\d{4}-\d{2}-\d{2}$/;
function parseTime(v) {
  const m = /^(\d{1,2})(?:[:h](\d{2})?)?h?$/i.exec(String(v ?? "").trim());
  if (!m) return null;
  const h = Number(m[1]), min = Number(m[2] ?? 0);
  return h < 24 && min < 60 ? h * 60 + min : null;
}
function pickTwo(slots, dayOrder, onlyDay) {
  const clean = slots.filter((s) => !s.sameTime);
  if (clean.length && clean.length < slots.length) {
    const two = pickTwo(clean, dayOrder, onlyDay);
    if (two.length >= 2) return two;
    const rest = pickTwo(slots.filter((s) => s !== two[0]), dayOrder, onlyDay);
    return [two[0], rest[0]].filter((s) => !!s).sort((x, y) => x.date.localeCompare(y.date) || x.minutes - y.minutes);
  }
  const days = onlyDay ? [onlyDay] : dayOrder;
  const byDay = days.map((d) => slots.filter((s) => s.date === d)).filter((list) => list.length);
  if (!byDay.length) return [];
  const best = (list) => list.find((s) => s.nearOtherJob) ?? list[0];
  const first = byDay[0];
  const a = best(first);
  const sameDay = first.filter((s) => Math.abs(s.minutes - a.minutes) >= 180).concat(first.filter((s) => Math.abs(s.minutes - a.minutes) >= 120 && Math.abs(s.minutes - a.minutes) < 180));
  const b = sameDay.find((s) => s.nearOtherJob) ?? sameDay[0] ?? (onlyDay ? void 0 : byDay[1] && best(byDay[1]));
  return [a, b].filter((s) => !!s).sort((x, y) => x.date.localeCompare(y.date) || x.minutes - y.minutes);
}
function suggestionText(slots) {
  if (slots.length === 1) return `${slots[0].label} às ${slots[0].time}`;
  const [a, b] = slots;
  return a.date === b.date ? `${a.label} às ${a.time} ou às ${b.time}` : `${a.label} às ${a.time} ou ${b.label} às ${b.time}`;
}
function botAvailability(req, events, now, rules = DAY_RULES) {
  const city = resolveBotCity(req?.city);
  const durationRaw = Number(req?.durationMin);
  const durationMin = Number.isFinite(durationRaw) && durationRaw >= 15 && durationRaw <= 600 ? Math.ceil(durationRaw / 15) * 15 : visitMinutes(req?.items);
  const base = { city, durationMin, suggestion: null, requested: null, free: [] };
  if (req?.city !== void 0 && typeof req.city !== "string") return { error: "city tem de ser texto" };
  if (!city) return { ...base, region: null, teams: [], handToOwner: "Localidade fora da lista: confirmar com o responsável" };
  const area = CITY_REGION.get(fold3(city));
  if (EXTENDED_TRIP_CITIES.has(city)) {
    if (req.date !== void 0 && (typeof req.date !== "string" || !DATE.test(req.date))) return { error: "date tem de ser AAAA-MM-DD" };
    return sharedTripAvailability(req, city, area ?? null, durationMin, events, now);
  }
  if (!area) return { ...base, region: null, teams: [], handToOwner: "Região sem equipa: confirmar com o responsável" };
  if (area === "Algarve" && req.ownerTime !== true) return { ...base, region: area, teams: [...TEAMS_BY_REGION.Algarve], handToOwner: "Algarve: o responsável escolhe o horário" };
  const teams = [...teamsFor(area, hasWaterproofing(req?.items))];
  const today = lisbon(now.getTime()).date;
  let onlyDay = null;
  if (req.date !== void 0) {
    if (typeof req.date !== "string" || !DATE.test(req.date)) return { error: "date tem de ser AAAA-MM-DD" };
    if (req.date < today) return { error: "date já passou" };
    onlyDay = req.date;
  }
  const daysRaw = Math.floor(Number(req.days));
  const span = Number.isFinite(daysRaw) && daysRaw >= 1 ? Math.min(MAX_DAYS, daysRaw) : DEFAULT_DAYS;
  const active = req.ownerTime === true ? [] : rules.filter((r) => r.from <= today && today <= r.until && (r.zone === area || teams.every((t) => TEAMS_BY_REGION[r.zone].includes(t))));
  const closedAt = (date, m) => active.some((r) => r.closed?.some((c) => c.date === date && (c.fromHour === void 0 || m < c.fromHour * 60)));
  const preferred = [...new Set(active.flatMap((r) => r.prefer ?? []))].filter((d) => d >= today && d <= addDays(today, MAX_DAYS - 1)).sort();
  const onlyPreferred = active.some((r) => r.onlyPreferred);
  const ahead = Array.from({ length: span }, (_, i) => addDays(today, i));
  const dayOrder = onlyDay ? [onlyDay] : [...preferred, ...ahead.filter((d) => !preferred.includes(d))];
  const scan = onlyDay ? [onlyDay, ...preferred.filter((d) => d !== onlyDay)] : dayOrder;
  const busy = busyIntervals(events);
  const earliestToday = now.getTime() + LEAD_TIME_MIN * 6e4;
  const slots = [];
  for (const date of scan) {
    const label = dayLabel(date, today);
    const firstMinutes = Math.min(...teams.map((t) => teamEarliestMinutes(t, date)));
    for (let m = firstMinutes; m <= LAST_OFFER_HOUR * 60 && m + durationMin <= DAY_END_HOUR * 60; m += 60) {
      const from = lisbonToUtc(date, m);
      if (from < earliestToday || closedAt(date, m)) continue;
      const st = slotState(busy, teams, area, from, from + durationMin * 6e4);
      if (st.free) slots.push({ date, minutes: m, label, time: hourLabel(m), teamsFree: st.teamsFree, nearOtherJob: st.nearOtherJob, sameTime: st.sameTime });
    }
  }
  let requested = null;
  if (req.time !== void 0) {
    const m = parseTime(req.time);
    if (m === null || !onlyDay) return { error: 'time precisa de date e de uma hora como "15h" ou "15:30"' };
    const from = lisbonToUtc(onlyDay, m);
    const inHours = m >= 7 * 60 && m + durationMin <= DAY_END_HOUR * 60 && from >= now.getTime();
    const st = slotState(busy, teams, area, from, from + durationMin * 6e4);
    const open = inHours && !closedAt(onlyDay, m);
    requested = {
      date: onlyDay,
      time: hourLabel(m),
      free: open && st.free,
      teamsFree: open ? st.teamsFree : [],
      sameTime: st.sameTime,
      start: new Date(from).toISOString(),
      end: new Date(from + durationMin * 6e4).toISOString()
    };
  }
  let offerDays = dayOrder;
  if (onlyDay && !slots.some((s) => s.date === onlyDay) && active.some((r) => r.closed?.some((c) => c.date === onlyDay))) offerDays = preferred;
  else if (!onlyDay && onlyPreferred && slots.some((s) => preferred.includes(s.date))) offerDays = preferred;
  const offered = slots.filter((s) => offerDays.includes(s.date));
  const two = pickTwo(offered, offerDays, offerDays.length === 1 ? offerDays[0] : null);
  const free = offerDays.map((date) => ({ date, label: dayLabel(date, today), times: offered.filter((s) => s.date === date).map((s) => s.time) })).filter((d) => d.times.length);
  return {
    city,
    region: area,
    teams,
    durationMin,
    handToOwner: two.length ? null : "Sem horas livres nos próximos dias: o responsável confirma a data",
    suggestion: two.length ? { text: suggestionText(two), slots: two } : null,
    requested,
    free,
    ...active.length ? { dayRule: active.map((r) => r.note).join(" ") } : {}
  };
}

// src/lib/botHold.ts
var MAX = { name: 80, phone: 30, address: 200, conversationId: 120, note: 300 };
var text = (v, max) => typeof v === "string" ? v.replace(/[\r\n\t]+/g, " ").replace(/\s{2,}/g, " ").trim().slice(0, max) : "";
var euro = (n) => `${Number.isInteger(n) ? n : n.toFixed(2).replace(".", ",")}€`;
function bookingTotal(quote, wantsCloseNow, date, now) {
  if (wantsCloseNow !== true) return { total: quote.total, closeNow: false };
  if (!quote.closeNow.ok || quote.closeNow.total == null) return "condição de 10% sem preço do motor: decide o responsável";
  const days = (Date.parse(`${date}T12:00:00Z`) - Date.parse(`${lisbon(now.getTime()).date}T12:00:00Z`)) / 864e5;
  if (days > CLOSE_NOW_DAYS) return `condição de 10% só para os próximos ${CLOSE_NOW_DAYS} dias`;
  return { total: quote.closeNow.total, closeNow: true };
}
var agreedTotalOf = (v) => typeof v === "number" && Number.isFinite(v) && v > 0 && v <= 5e3 ? Math.round(v * 100) / 100 : null;
function planBotHold(req, events, now, ownEventId) {
  if (!req || typeof req !== "object") return { error: "O pedido tem de ser um objeto" };
  const r = req;
  const conversationId = text(r.conversationId, MAX.conversationId);
  if (!conversationId) return { error: "conversationId em falta" };
  if (typeof r.date !== "string" || typeof r.time !== "string") return { error: 'date (AAAA-MM-DD) e time ("15h") são obrigatórios' };
  const others = ownEventId ? events.filter((e) => e.id !== ownEventId) : events;
  const availability = botAvailability({ city: r.city, items: r.items, date: r.date, time: r.time, ownerTime: r.ownerApprovedWeekend === true || r.ownerApprovedTime === true }, others, now);
  if ("error" in availability) return { error: String(availability.error) };
  if (availability.handToOwner && !availability.requested) return { ok: false, handToOwner: availability.handToOwner };
  const slot = availability.requested;
  if (!slot) return { error: "time inválido" };
  if (!slot.free) return { ok: false, taken: true, alternatives: availability.suggestion };
  const quote = botQuote({ items: r.items, city: r.city, sharedTrip: !!availability.sharedTrip });
  if ("error" in quote) return { error: String(quote.error) };
  const city = availability.city;
  const what = quote.lines.map((l) => l.label).join(" + ");
  const chatTotal = agreedTotalOf(r.agreedTotal);
  const agreed = chatTotal ? { total: chatTotal, closeNow: false } : bookingTotal(quote, r.closeNow, slot.date, now);
  if (typeof agreed === "string") return { ok: false, handToOwner: agreed };
  const price = chatTotal ? euro(chatTotal) : quote.quote ? "sob orçamento" : euro(agreed.total) + (agreed.closeNow ? " (com 10% para fechar já)" : "");
  const name = text(r.name, MAX.name) || "cliente";
  const title = `Pré-reserva – ${name} – ${city} – ${what} – ${price}`;
  const pickup = quote.rugPickup?.fee != null && r.rugPickup === true ? `Recolha e entrega: ${euro(quote.rugPickup.fee)}` : "";
  const description = [
    'Pré-reserva feita pelo bot do WhatsApp: confirma (muda o título para "Serviço X€ (Y€) …") ou apaga.',
    `Telefone: ${text(r.phone, MAX.phone) || "ver conversa"}`,
    `Artigos: ${what}`,
    `Total: ${price}${quote.quote ? "" : ` (deslocação incluída)`}`,
    pickup,
    text(r.address, MAX.address) ? `Morada: ${text(r.address, MAX.address)}` : "Morada: por pedir",
    text(r.note, MAX.note) ? `Nota: ${text(r.note, MAX.note)}` : "",
    `bot:${conversationId}`
  ].filter(Boolean).join("\n");
  return { ok: true, event: { title, description, start: slot.start, end: slot.end }, slot: { date: slot.date, time: slot.time, durationMin: availability.durationMin } };
}
var OWNER_BOOKING_PREFIX = "A confirmar · ";
var digitsOf = (t) => t.replace(/\D/g, "");
var amount = (v) => typeof v === "number" && Number.isFinite(v) && v > 0 && v < 1e4 ? Math.round(v * 100) / 100 : null;
var ownerShare = (total, pickupFee = 0) => Math.ceil(total / 2 - pickupFee);
function clientServiceNear(events, phone, date) {
  const key9 = digitsOf(phone).slice(-9);
  if (key9.length !== 9) return void 0;
  const day = Date.parse(`${date}T12:00:00Z`);
  return events.filter((e) => e.start && e.status !== "CANCELLED" && Math.abs(Date.parse(e.start) - day) <= 60 * 864e5 && /^\s*(a confirmar · )?servi[cç]o\b/i.test(e.summary) && digitsOf(`${e.summary} ${e.description}`).includes(key9)).sort((a, b) => Math.abs(Date.parse(a.start) - day) - Math.abs(Date.parse(b.start) - day))[0];
}
function planOwnerBooking(req, events, nowMs = Date.now()) {
  if (!req || typeof req !== "object") return { error: "O pedido tem de ser um objeto" };
  const r = req;
  const conversationId = text(r.conversationId, MAX.conversationId);
  if (!conversationId) return { error: "conversationId em falta" };
  if (typeof r.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(r.date)) return { error: "date tem de ser AAAA-MM-DD" };
  const minutes = parseTime(r.time);
  if (minutes === null) return { error: "time inválido" };
  const service = text(r.service, 160);
  if (!service) return { error: "service em falta" };
  const durationRaw = Number(r.durationMin);
  const durationMin = Number.isFinite(durationRaw) && durationRaw >= 30 && durationRaw <= 480 ? Math.ceil(durationRaw / 15) * 15 : 60;
  const phone = text(r.phone, MAX.phone);
  const key9 = digitsOf(phone).slice(-9);
  if (key9.length === 9) {
    const same = clientServiceNear(events, phone, r.date);
    if (same) return { ok: false, exists: true, summary: same.summary };
  }
  const total = amount(r.total);
  const pickupFee = amount(r.pickupFee) ?? 0;
  const money = total === null ? "?€ (?€)" : `${formatAmount(ownerShare(total, pickupFee))}€ (${formatAmount(total)}€)`;
  const start = lisbonToUtc(r.date, minutes);
  if (start < nowMs) return { error: "A hora já passou: não se marca um serviço no passado" };
  const startIso = new Date(start).toISOString(), endIso = new Date(start + durationMin * 6e4).toISOString();
  const address = text(r.address, MAX.address);
  const waterproofing = /imperm|premium|essencial/i.test(service);
  const namedRaw = typeof r.team === "string" && TEAM_COLOR[r.team] ? r.team : null;
  const named = namedRaw && waterproofing && TEAMS_BY_REGION.Braga.includes(namedRaw) ? WATERPROOFING_TEAMS.Braga?.[0] ?? namedRaw : namedRaw;
  const team = total !== null ? named ?? chooseTeam(events, r.city ?? address, startIso, endIso, waterproofing) : null;
  if (team) {
    const phoneOut = /^351\d{9}$/.test(digitsOf(phone)) ? digitsOf(phone).slice(3) : phone;
    const title = [`Serviço ${money}${r.fromAds === true ? " (anúncio)" : ""} ${service}`, phoneOut, text(r.name, MAX.name), address].filter(Boolean).join(" - ");
    const description2 = [
      `Marcado pelo bot a partir da conversa do WhatsApp, equipa ${team} (muda a cor para trocar).`,
      text(r.notes, 600),
      pickupFee && total !== null ? `Parte do dono: metade do total menos a recolha (${formatAmount(total / 2)}€ − ${formatAmount(pickupFee)}€).` : "",
      `bot:${conversationId}`
    ].filter(Boolean).join("\n\n");
    return { ok: true, team, event: { title, description: description2, start: startIso, end: endIso, colorId: TEAM_COLOR[team] } };
  }
  const parts = [`${OWNER_BOOKING_PREFIX}Serviço ${money}${r.fromAds === true ? " (anúncio)" : ""} ${service}`, phone, text(r.name, MAX.name), address].filter(Boolean);
  const description = [
    'Preparado a partir da conversa do WhatsApp. Confere e apaga "A confirmar · " do título para confirmar (entra no CRM e vai para a equipa).',
    text(r.notes, 600),
    pickupFee && total !== null ? `Parte do dono: metade do total menos a recolha (${formatAmount(total / 2)}€ − ${formatAmount(pickupFee)}€).` : "",
    `bot:${conversationId}`
  ].filter(Boolean).join("\n\n");
  return { ok: true, event: { title: parts.join(" - "), description, start: startIso, end: endIso } };
}
var formatAmount = (n) => Number.isInteger(n) ? String(n) : n.toFixed(2).replace(".", ",").replace(/,?0+$/, "");
var TEAM_COLOR = { "Porto 1": "9", "Porto 2": "8", Braga: "10", "Lisboa 1": "6", Algarve: "5", Coimbra: "4" };
var AD_MARK = { google: " (anúncio)", facebook: " (anúncio facebook)", instagram: " (anúncio instagram)" };
var isWeekend = (date) => [0, 6].includes((/* @__PURE__ */ new Date(`${date}T12:00:00Z`)).getUTCDay());
function planBotBooking(req, events, now, ownEventId) {
  if (!req || typeof req !== "object") return { error: "O pedido tem de ser um objeto" };
  const r = req;
  const conversationId = text(r.conversationId, MAX.conversationId);
  if (!conversationId) return { error: "conversationId em falta" };
  if (typeof r.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(r.date) || typeof r.time !== "string") return { error: 'date (AAAA-MM-DD) e time ("15h") são obrigatórios' };
  const ownerChose = isWeekend(r.date) && r.ownerApprovedWeekend === true || r.ownerApprovedTime === true;
  const name = text(r.name, MAX.name), address = text(r.address, MAX.address), phone = text(r.phone, MAX.phone);
  const missing = [!name && "nome", address.length < 8 && "morada completa"].filter((m) => !!m);
  if (missing.length) return { ok: false, missing };
  const others = ownEventId ? events.filter((e) => e.id !== ownEventId) : events;
  const key9 = digitsOf(phone).slice(-9);
  if (key9.length === 9 && others.some((e) => e.start && lisbon(Date.parse(e.start)).date === r.date && /^\s*servi[cç]o\b/i.test(e.summary) && digitsOf(`${e.summary} ${e.description}`).includes(key9))) return { ok: false, exists: true };
  const booked = clientServiceNear(others, phone, r.date);
  if (booked?.id) return { ok: false, reschedule: { eventId: booked.id, date: r.date, time: r.time } };
  const availability = botAvailability({ city: r.city, items: r.items, date: r.date, time: r.time, ownerTime: r.ownerApprovedWeekend === true || r.ownerApprovedTime === true }, others, now);
  if ("error" in availability) return { error: String(availability.error) };
  if (availability.handToOwner && !availability.requested) return { ok: false, handToOwner: availability.handToOwner };
  const slot = availability.requested;
  if (!slot) return { error: "time inválido" };
  if (!slot.free) return { ok: false, taken: true, alternatives: availability.suggestion };
  if (slot.sameTime && !ownerChose) return { ok: false, sameTime: true };
  const quote = botQuote({ items: r.items, city: r.city, sharedTrip: !!availability.sharedTrip });
  if ("error" in quote) return { error: String(quote.error) };
  const chatTotal = agreedTotalOf(r.agreedTotal);
  if (!chatTotal && (quote.quote || !(quote.total > 0))) return { ok: false, handToOwner: "sob orçamento: o responsável dá o valor e marca" };
  const agreed = chatTotal ? { total: chatTotal, closeNow: false } : bookingTotal(quote, r.closeNow, slot.date, now);
  if (typeof agreed === "string") return { ok: false, handToOwner: agreed };
  const total = agreed.total;
  const team = availability.sharedTrip?.team ?? chooseTeam(others, r.city, slot.start, slot.end, hasWaterproofing(r.items));
  if (!team) return { ok: false, taken: true, alternatives: availability.suggestion };
  const pickupFee = quote.rugPickup?.fee != null && r.rugPickup === true ? quote.rugPickup.fee : 0;
  const what = quote.lines.map((l) => l.label).join(" + ");
  const service = text(r.service, 120) || what;
  const ad = typeof r.adOrigin === "string" ? AD_MARK[r.adOrigin] ?? "" : "";
  const phoneOut = /^351\d{9}$/.test(digitsOf(phone)) ? digitsOf(phone).slice(3) : phone;
  const title = [`Serviço ${formatAmount(ownerShare(total, pickupFee))}€ (${formatAmount(total)}€)${ad} ${service}`, phoneOut, name, address].filter(Boolean).join(" - ");
  const description = [
    ownerChose ? `Marcado pelo bot do WhatsApp numa hora de fim de semana escolhida por ti, equipa ${team} (escolhida pelo bot; muda a cor para trocar).` : `Marcado pelo bot do WhatsApp numa vaga livre, equipa ${team} (escolhida pelo bot; muda a cor para trocar).`,
    `Artigos: ${what}`,
    availability.sharedTrip ? `Total: ${euro(total)} (sem deslocação: a equipa já está na zona nesse dia)` : `Total: ${euro(total)} (deslocação incluída)`,
    chatTotal ? `Preço combinado na conversa${quote.quote || !(quote.total > 0) ? "" : ` (tabela ${euro(quote.total)})`}.` : "",
    agreed.closeNow ? `Condição para fechar já: 10% a menos (tabela ${euro(quote.total)}), marcado na conversa para os próximos ${CLOSE_NOW_DAYS} dias.` : "",
    text(r.note, MAX.note) ? `Nota: ${text(r.note, MAX.note)}` : "",
    `bot:${conversationId}`
  ].filter(Boolean).join("\n");
  return { ok: true, team, event: { title, description, start: slot.start, end: slot.end, colorId: TEAM_COLOR[team] }, slot: { date: slot.date, time: slot.time, durationMin: availability.durationMin } };
}

// src/lib/agendaCheck.ts
var fold4 = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
var SERVICE = /^(servico|limpeza)\b/;
var PENDING = /^(pre-? ?reserva|a confirmar)\b/;
var AMOUNT = /\d+(?:[.,]\d{1,2})?\s*€/;
var PHONE = /(?:\+\d{1,3}[\s.]?)?\d{3}[\s.]?\d{3}[\s.]?\d{3,4}\b/;
var POSTAL2 = /\b\d{4}-\d{3}\b/;
var FREE = /\b(gratuit[oa]|sem custo|nao cobrar)\b/;
var BLOCK = /^bloqueio\b/;
var STREET = /\b(rua|r\.|av\.?|avenida|travessa|tv\.?|largo|praca|estrada|alameda|urbanizacao|urb\.?|calcada|bairro|lugar|caminho|beco|quinta|praceta|rotunda|edificio|lote)\b/;
var timed = (events) => events.flatMap((e) => {
  if (!e.start || String(e.status).toUpperCase() === "CANCELLED") return [];
  const from = Date.parse(e.start);
  if (!Number.isFinite(from)) return [];
  const end = e.end ? Date.parse(e.end) : NaN;
  const to = Number.isFinite(end) && end > from ? end : from + 60 * 6e4;
  return [{ e, from, to, team: eventTeam(e), summary: fold4(e.summary) }];
});
function serviceWhat(summary) {
  const head = summary.split(/\s+[-–]\s+/)[0] ?? "";
  const what = head.replace(/\(an[uú]ncio[^)]*\)/giu, " ").replace(/^\s*(servi[cç]o|limpeza)\s+(?=\d)/iu, "").replace(/\d+(?:[.,]\d{1,2})?\s*€\s*(\(\s*\d+(?:[.,]\d{1,2})?\s*€\s*\))?/gu, " ").replace(/^\s*servi[cç]o\b/iu, "").replace(/\s{2,}/g, " ").trim();
  return what || "serviço";
}
function missingData(e) {
  const text2 = `${e.summary}
${e.description ?? ""}`;
  const out = [];
  if (!AMOUNT.test(e.summary) && !FREE.test(fold4(e.summary))) out.push("sem valor no título");
  const withoutAmounts = text2.replace(/\d+(?:[.,]\d{1,2})?\s*€/g, " ");
  if (!PHONE.test(withoutAmounts)) out.push("sem telefone");
  const segments = e.summary.split(/\s+[-–]\s+/).slice(1).map(fold4);
  const hasStreet = POSTAL2.test(text2) || segments.some((s) => STREET.test(s) && /\d/.test(s.replace(PHONE, "")));
  if (!hasStreet) out.push("morada sem rua e número nem código postal");
  return out;
}
function agendaCheck(events, date, now, pendingDays = 7) {
  const today = lisbon(now.getTime()).date;
  const all = timed(events);
  const ofDay = all.filter((t) => lisbon(t.from).date === date);
  const services = ofDay.filter((t) => SERVICE.test(t.summary)).sort((a, b) => a.from - b.from);
  const blocks = ofDay.filter((t) => t.team && BLOCK.test(t.summary));
  const time = (ms) => hourLabel(lisbon(ms).minutes);
  const issues = [];
  const add = (t, problem) => issues.push({ time: time(t.from), team: t.team, what: serviceWhat(t.e.summary), problem });
  for (const t of services) {
    if (!t.team) add(t, "sem equipa escolhida (falta a cor)");
    for (const m of missingData(t.e)) add(t, m);
    const start = lisbon(t.from).minutes, end = lisbon(t.to).minutes;
    const own = t.team ? TEAM_WEEKDAY_HOURS[t.team] : void 0;
    const weekday2 = [1, 2, 3, 4, 5].includes((/* @__PURE__ */ new Date(`${date}T12:00:00Z`)).getUTCDay());
    if (t.team && own && !teamWorks(t.team, t.from, t.to)) {
      add(t, `${t.team} nos dias úteis só trabalha das ${own.from}h às ${own.to}h`);
    } else {
      const first = own && weekday2 ? Math.min(own.from, EARLIEST_HOUR) : EARLIEST_HOUR;
      if (start < first * 60 || end > DAY_END_HOUR * 60 || lisbon(t.to).date !== date) {
        add(t, `fora do horário (${first}h às ${DAY_END_HOUR}h)`);
      }
    }
    if (t.team && blocks.some((b) => b.team === t.team && b.from < t.to && b.to > t.from)) add(t, "a equipa tem um bloqueio a essa hora");
  }
  const byTeam = /* @__PURE__ */ new Map();
  for (const t of services) if (t.team) byTeam.set(t.team, [...byTeam.get(t.team) ?? [], t]);
  for (const [team, list2] of byTeam) {
    const cap = TEAM_CAPACITY[team] ?? 1;
    for (let i = 0; i < list2.length; i++) {
      const t = list2[i];
      const overlapping = list2.filter((o) => o !== t && o.from < t.to && o.to > t.from).length;
      if (overlapping >= cap) add(t, `${team} tem outro serviço à mesma hora`);
      const next = list2[i + 1];
      const travel = TEAM_TRAVEL_MARGIN_MIN[team] ?? TRAVEL_MARGIN_MIN;
      if (cap === 1 && next && next.from >= t.to && next.from - t.to < travel * 6e4) {
        add(next, `menos de ${travel} min de viagem desde o serviço anterior`);
      }
    }
  }
  const horizon = now.getTime() + pendingDays * 864e5;
  const pending = all.filter((t) => PENDING.test(t.summary) && t.to > now.getTime() && t.from < horizon).sort((a, b) => a.from - b.from).map((t) => ({
    day: dayLabel(lisbon(t.from).date, today),
    time: time(t.from),
    kind: t.summary.startsWith("a confirmar") ? "A confirmar" : "Pré-reserva",
    region: t.team ?? eventRegion(t.e)
  }));
  const list = services.map((t) => ({ time: time(t.from), end: time(t.to), team: t.team, what: serviceWhat(t.e.summary) }));
  const day = dayLabel(date, today);
  return { date, day, services: list, issues, pending, message: agendaMessage(day, list, issues, pending) };
}
function agendaMessage(day, services, issues, pending) {
  const lines = [`Agenda de ${day}: ${services.length} ${services.length === 1 ? "serviço" : "serviços"}.`];
  const teams = /* @__PURE__ */ new Map();
  for (const s of services) teams.set(s.team ?? "sem equipa", (teams.get(s.team ?? "sem equipa") ?? 0) + 1);
  if (teams.size) lines.push([...teams].map(([t, n]) => `${t}: ${n}`).join(" · "));
  lines.push("");
  if (issues.length) {
    lines.push(`A corrigir (${issues.length}):`);
    for (const i of issues) lines.push(`- ${i.time}${i.team ? ` ${i.team}` : ""}, ${i.what}: ${i.problem}`);
  } else {
    lines.push("Nada a corrigir nos serviços.");
  }
  if (pending.length) {
    lines.push("", `Por confirmar nos próximos dias (${pending.length}):`);
    for (const p of pending) lines.push(`- ${p.kind}, ${p.day} às ${p.time}${p.region ? `, ${p.region}` : ""}`);
  }
  return lines.join("\n");
}

// src/lib/crmUpsell.ts
var UPSELL_TEAMS = ["Porto 1", "Porto 2", "Braga", "Lisboa 1", "Lisboa 2", "Algarve", "Coimbra"];
function teamShareOf(team) {
  return team.startsWith("Porto") ? 0.6 : 0.7;
}
var round22 = (n) => Math.round(n * 100) / 100;
var UPSELL_TIERS_FROM = "2026-10-19";
var UPSELL_TIER_LIMIT = 100;
var UPSELL_TIER_SHARES = { upTo: 0.7, above: 0.6 };
var tieredUpsell = (day) => !!day && day >= UPSELL_TIERS_FROM;
function splitUpsell(value, team, day) {
  const teamPart = tieredUpsell(day) ? round22(Math.min(value, UPSELL_TIER_LIMIT) * UPSELL_TIER_SHARES.upTo + Math.max(0, value - UPSELL_TIER_LIMIT) * UPSELL_TIER_SHARES.above) : round22(value * teamShareOf(team));
  return { team: teamPart, owner: round22(value - teamPart) };
}
function defaultTeamFor(locality) {
  return UPSELL_TEAMS.find((t) => locality && t.startsWith(locality)) ?? "Porto 1";
}
var isUpsellTeam = (s) => !!s && UPSELL_TEAMS.includes(s);
function ownerUpsellOf(r) {
  const value = Number(r.upsell_value) || 0;
  if (value <= 0) return 0;
  return splitUpsell(value, isUpsellTeam(r.upsell_team) ? r.upsell_team : defaultTeamFor(r.locality), r.request_date).owner;
}

// src/lib/teamAccounts.ts
var REVIEW_PENALTY_SHARE = 0.05;
var REVIEW_PENALTY_FROM = UPSELL_TIERS_FROM;
var REVIEW_PENALTY_FROM_BY_TEAM = { "Porto 1": "", "Porto 2": "2026-10-15" };
var REVIEW_PENALTY_LABEL = { "Porto 2": "sem fotos antes e depois e avaliação" };
var INVOICE_VAT = 0.23;
var REVIEW_PENALTY_ENABLED = false;
function reviewPenaltyApplies(team, day) {
  return REVIEW_PENALTY_ENABLED && day >= (REVIEW_PENALTY_FROM_BY_TEAM[team] ?? REVIEW_PENALTY_FROM);
}
var round23 = (n) => Math.round(n * 100) / 100;
var euros = (n) => `${round23(n).toFixed(2).replace(/\.00$/, "").replace(".", ",")}€`;
var dm = (date) => `${date.slice(8, 10)}/${date.slice(5, 7)}`;
function labelOf(r) {
  const name = (r.client_name ?? "").trim();
  const city = (r.city ?? "").trim();
  if (name && city && !name.toLowerCase().includes(city.toLowerCase())) return `${name}, ${city}`;
  return name || city || "Serviço";
}
function ownerShareOf(r) {
  return round23((Number(r.my_cut) || 0) + ownerUpsellOf(r));
}
var sum = (lines) => round23(lines.reduce((s, l) => s + l.amount, 0));
function lineBlock(l, team) {
  const head = [dm(l.date), l.label, l.what].filter(Boolean).join(" · ");
  if (l.billed === void 0 || l.share === void 0) return [`${head}: ${euros(l.amount)}`];
  const parts = [`a minha parte ${euros(l.share)}`];
  if (l.reviewPenalty) parts.push(`5% ${REVIEW_PENALTY_LABEL[team] ?? "sem avaliação"} ${euros(l.reviewPenalty)}`);
  if (l.vat && l.teamPart !== void 0) {
    const net = round23(l.billed - l.vat);
    const mine = round23(net - l.teamPart);
    const owed = [`a minha parte ${euros(mine)}`, `o IVA ${euros(l.vat)}`];
    if (l.upsellShare) owed.push(`a minha parte no upsell ${euros(l.upsellShare)}`);
    if (l.reviewPenalty) owed.push(`5% ${REVIEW_PENALTY_LABEL[team] ?? "sem avaliação"} ${euros(l.reviewPenalty)}`);
    return [
      head,
      `COM FATURA: o cliente paga ${euros(l.billed)}, IVA incluído`,
      `Valor do serviço sem IVA: ${euros(net)}`,
      `IVA a entregar ao Estado: ${euros(l.vat)}`,
      `Vossa parte (metade do valor sem IVA): ${euros(l.teamPart)}`,
      `Minha parte (metade do valor sem IVA): ${euros(mine)}`,
      `Deves-me ${euros(l.amount)} (${owed.join(" + ")})`
    ];
  }
  return [head, `Serviço ${euros(l.billed)} · ${parts.join(" + ")} = deves-me ${euros(l.amount)}`];
}
function paidToOwnerLine(l) {
  const base = `${dm(l.date)} ${l.label} · a vossa parte ${euros(l.amount)}`;
  if (!l.vat || l.billed === void 0) return base;
  return `${base} (com fatura: ${euros(l.billed)} = ${euros(l.billed - l.vat)} sem IVA + ${euros(l.vat)} de IVA a entregar ao Estado; a vossa parte é metade do valor sem IVA)`;
}
function teamMessage(a) {
  const out = [`Contas até ${dm(a.date)} (${a.team})`, ""];
  if (a.today.length) {
    out.push(`Serviços de ${dm(a.date)}:`, "");
    for (const l of a.today) out.push(...lineBlock(l, a.team), "");
    out.push(`Total de ${dm(a.date)}: ${euros(a.todayTotal)}`);
  } else {
    out.push(`${dm(a.date)}: nenhum serviço por pagar.`);
  }
  if (a.before.length) {
    out.push("", "Por pagar de dias anteriores:", "");
    for (const l of a.before) out.push(...lineBlock(l, a.team), "");
    out.push(`Total de dias anteriores: ${euros(a.beforeTotal)}`);
  }
  if (a.adjustments.length) {
    out.push("", "Acertos combinados:");
    for (const l of a.adjustments) out.push(`${l.label}: ${euros(l.amount)}`);
  }
  if (a.ownerOwes.length) {
    out.push("", `Soma: ${euros(sum([...a.today, ...a.before, ...a.adjustments]))}`);
    out.push("", "Pagos diretamente a mim (desconto a vossa parte):");
    for (const l of a.ownerOwes) out.push(paidToOwnerLine(l));
  }
  if (a.awaitingClient.length) {
    out.push("", "O cliente paga-me a mim e ainda não pagou (desconto a vossa parte quando pagar):");
    for (const l of a.awaitingClient) out.push(paidToOwnerLine(l));
  }
  out.push("", `Total que me devem: ${euros(a.total)}`);
  const vat = round23([...a.today, ...a.before].reduce((s, l) => s + (l.vat ?? 0), 0));
  if (vat > 0) out.push(`Dos quais IVA a entregar ao Estado: ${euros(vat)}`);
  return out.join("\n");
}
function teamAccounts(rows, events, date, adjustments = []) {
  const teamOfEvent = new Map(events.map((e) => [e.id, eventTeam(e)]));
  const byTeam = /* @__PURE__ */ new Map();
  const bucketOf = (team) => {
    const b = byTeam.get(team) ?? { today: [], before: [], adjustments: [], ownerOwes: [], awaitingClient: [] };
    byTeam.set(team, b);
    return b;
  };
  const unassigned = [];
  const owed = rows.filter((r) => !r.paid && r.request_date && r.request_date <= date && !r.calendar_missing_since).filter((r) => (Number(r.billed_value) || 0) > 0 || (Number(r.upsell_value) || 0) > 0).sort((a, b) => a.request_date.localeCompare(b.request_date));
  for (const r of owed) {
    const share = ownerShareOf(r);
    if (share <= 0) continue;
    const team = r.calendar_event_id ? teamOfEvent.get(r.calendar_event_id) ?? null : null;
    const billed = Number(r.billed_value) || 0;
    const net = r.invoiced ? round23(billed / (1 + INVOICE_VAT)) : billed;
    const invoiceTeamPart = r.invoiced ? Math.floor(round23(net * 50)) / 100 : null;
    const ownerUpsell = round23(share - (Number(r.my_cut) || 0));
    if (r.paid_to_owner) {
      const teamPart = invoiceTeamPart !== null ? round23(invoiceTeamPart + (Number(r.upsell_value) || 0) - Math.max(0, ownerUpsell)) : round23(billed + (Number(r.upsell_value) || 0) - share);
      const invoice = r.invoiced ? { billed, vat: round23(billed - net) } : {};
      if (team && teamPart > 0) (r.client_paid_owner_at ? bucketOf(team).ownerOwes : bucketOf(team).awaitingClient).push({ date: r.request_date, label: labelOf(r), amount: teamPart, ...invoice });
      continue;
    }
    const penalty = team && !r.review_requested && reviewPenaltyApplies(team, r.request_date) ? round23((Number(r.billed_value) || 0) * REVIEW_PENALTY_SHARE) : 0;
    const vat = r.invoiced ? round23(billed - net) : 0;
    const what = (r.description ?? "").trim();
    const amount2 = invoiceTeamPart !== null ? round23(billed - invoiceTeamPart + Math.max(0, ownerUpsell) + penalty) : round23(share + penalty);
    const line = {
      date: r.request_date,
      label: labelOf(r),
      amount: amount2,
      billed,
      share,
      ...what ? { what } : {},
      ...penalty ? { reviewPenalty: penalty } : {},
      ...vat ? { vat, teamPart: invoiceTeamPart, ...ownerUpsell > 0 ? { upsellShare: ownerUpsell } : {} } : {}
    };
    if (!team) {
      unassigned.push(line);
      continue;
    }
    const bucket = bucketOf(team);
    (line.date === date ? bucket.today : bucket.before).push(line);
  }
  for (const a of adjustments) {
    if (a.day > date || !Number(a.amount)) continue;
    bucketOf(a.team).adjustments.push({ date: a.day, label: a.label, amount: round23(Number(a.amount)) });
  }
  const teams = [...byTeam.entries()].map(([team, b]) => {
    const base = {
      team,
      date,
      today: b.today,
      before: b.before,
      adjustments: b.adjustments,
      ownerOwes: b.ownerOwes,
      awaitingClient: b.awaitingClient,
      todayTotal: sum(b.today),
      beforeTotal: sum(b.before),
      total: round23(sum([...b.today, ...b.before, ...b.adjustments]) - sum(b.ownerOwes))
    };
    return { ...base, message: teamMessage(base) };
  }).filter((t) => t.total > 0).sort((a, b) => a.team.localeCompare(b.team));
  return { date, teams, unassigned };
}

// src/lib/crmClosings.ts
var lisbon2 = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Lisbon", year: "numeric", month: "2-digit", day: "2-digit" });

// src/lib/crmReviews.ts
var REVIEW_MIN_STARS = 4;
var REVIEW_DEADLINE_DAYS = 7;

// src/constants/business.ts
var INSTAGRAM_URL = "https://www.instagram.com/kyrocleansolutions/";
var BUSINESS_EMAIL = "cleansolutions.pt25@gmail.com";
var BUSINESS_EMAIL_HREF = `mailto:${BUSINESS_EMAIL}`;

// src/lib/serviceProcedure.ts
var PROCEDURE_FULL_SHARE = 50;
var PROCEDURE_REDUCED_SHARE = 45;
var PROCEDURE_PAY_RULE = "review_compensates";
var PROCEDURE_REVIEW_BONUS = 5;
function procedurePay(got, rule = PROCEDURE_PAY_RULE) {
  const media = got.before && got.after && got.video;
  if (rule === "review_compensates") {
    if (media && got.review) return { teamShare: PROCEDURE_FULL_SHARE, bonus: PROCEDURE_REVIEW_BONUS };
    return { teamShare: media || got.review ? PROCEDURE_FULL_SHARE : PROCEDURE_REDUCED_SHARE, bonus: 0 };
  }
  if (rule === "review_bonus") return { teamShare: media ? PROCEDURE_FULL_SHARE : PROCEDURE_REDUCED_SHARE, bonus: media && got.review ? PROCEDURE_REVIEW_BONUS : 0 };
  return { teamShare: media && got.review ? PROCEDURE_FULL_SHARE : PROCEDURE_REDUCED_SHARE, bonus: 0 };
}
var PROCEDURE_FROM_BY_TEAM = {
  "Porto 1": "2026-10-15",
  "Porto 2": "2026-10-15",
  "Lisboa 1": "2026-10-15",
  "Lisboa 2": "2026-10-15",
  "Algarve": "2026-10-15",
  "Coimbra": "2026-10-15"
};
var procedureFrom = (team) => PROCEDURE_FROM_BY_TEAM[team] ?? UPSELL_TIERS_FROM;
var REVIEW_LINKS = {
  lisboa: "https://g.page/r/CRc7F7lX3xcEECE/review",
  porto: "https://search.google.com/local/writereview?placeid=ChIJt71NLgBlJA0RIT9kggF_3Fk"
};
var reviewProfileOfTeam = (team) => /^lisboa/i.test(team) ? "lisboa" : "porto";
var ITEM_LABEL = {
  before: "fotografia de antes",
  after: "fotografia de depois",
  video: "vídeo",
  review: "avaliação do cliente"
};
var lisbon3 = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Lisbon" });
var lisbonDayOf = (iso) => lisbon3.format(typeof iso === "string" ? new Date(iso) : iso);
function addDays2(day, n) {
  const t = Date.UTC(Number(day.slice(0, 4)), Number(day.slice(5, 7)) - 1, Number(day.slice(8, 10)), 12) + n * 864e5;
  return new Date(t).toISOString().slice(0, 10);
}
var dm2 = (day) => `${day.slice(8, 10)}/${day.slice(5, 7)}`;
var procedureDeadline = (serviceDay) => addDays2(serviceDay, REVIEW_DEADLINE_DAYS);
function joinPt(items) {
  return items.length <= 1 ? items[0] ?? "" : `${items.slice(0, -1).join(", ")} e ${items[items.length - 1]}`;
}
var missingText = (missing) => joinPt(missing.map((i) => ITEM_LABEL[i]));
function procedureApplies(rec) {
  return !!rec?.prompted_at && rec.service_day >= procedureFrom(rec.team);
}
function checkProcedure(rec, reviews, endedDay) {
  const deadline = procedureDeadline(rec.service_day);
  const inTime = (at) => !!at && lisbonDayOf(at) <= deadline;
  const before = !!rec.before_msg_id && inTime(rec.before_at);
  const after = !!rec.after_msg_id && inTime(rec.after_at);
  const video = !!rec.video_msg_id && inTime(rec.video_at);
  const review = reviews.some((r) => !r.excluded && r.stars >= REVIEW_MIN_STARS && lisbonDayOf(r.reviewed_at) <= deadline);
  const missing = ["before", "after", "video", "review"].filter((k) => !{ before, after, video, review }[k]);
  const status = missing.length === 0 ? "completo" : endedDay >= deadline ? "fechado" : "em_curso";
  return {
    before,
    after,
    video,
    review,
    missing: [...missing],
    deadline,
    status,
    pay: status === "em_curso" ? null : procedurePay({ before, after, video, review })
  };
}
function slotForMedia(rec, kind, caption) {
  if (kind === "video") return "video";
  const c = (caption ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  if (/\bdepois\b|\bafter\b|\bdps\b/.test(c)) return "after";
  if (/\bantes\b|\bbefore\b/.test(c)) return "before";
  return rec.before_msg_id ? "after" : "before";
}
var serviceName = (f) => `${f.label}${f.what ? ` (${f.what})` : ""}`;
function procedurePromptMessage(f) {
  return [
    `Serviço terminado: ${serviceName(f)}, ${dm2(f.serviceDay)}${f.time ? ` às ${f.time}` : ""}.`,
    "",
    "Responde a esta mensagem com a fotografia de antes, a fotografia de depois e o vídeo.",
    "",
    `A mensagem a seguir é para mandares ao cliente: reencaminha-a ou copia-a. O prazo para a avaliação é ${dm2(procedureDeadline(f.serviceDay))}. Obrigado!`
  ].join("\n");
}
function procedureClientMessage(f) {
  const name = (f.firstName ?? "").trim();
  const what = (f.what ?? "").trim();
  const service = what ? `do serviço (${what.charAt(0).toLowerCase()}${what.slice(1)})` : "do serviço";
  return [
    `Olá${name ? ` ${name}` : ""}, obrigado por nos ter recebido hoje! Esperamos que tenha gostado do resultado ${service}. Se ficou contente com o trabalho, uma avaliação no Google ajuda-nos muito e ajuda outros clientes a escolher. Demora menos de um minuto:`,
    REVIEW_LINKS[reviewProfileOfTeam(f.team)],
    "Como agradecimento, fica com 10% de desconto no próximo serviço.",
    "",
    "E se quiser ver mais antes e depois dos nossos trabalhos, siga-nos no Instagram:",
    INSTAGRAM_URL,
    "Obrigado!"
  ].join("\n");
}
function procedureReceiptMessage(label, received, check) {
  const got = received.length ? `Recebido para ${label}: ${missingText(received)}.` : `Para ${label}:`;
  const media = check.missing.filter((i) => i !== "review");
  if (media.length) return `${got} Falta: ${missingText(media)}.${check.missing.includes("review") ? ` E a avaliação do cliente até ${dm2(check.deadline)}.` : ""}`;
  if (check.missing.includes("review")) return `${got} Fotografias e vídeo completos, obrigado. Falta só a avaliação do cliente até ${dm2(check.deadline)}.`;
  return `${got} Procedimento completo, obrigado!`;
}
var REMINDER_DAYS = [1, 5];
var REMINDER_HOUR = 10;
function reminderDue(rec, check, now) {
  if (!rec.prompted_at || check.status !== "em_curso" || check.missing.length === 0) return null;
  const today = lisbonDayOf(now);
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Lisbon", hour: "2-digit", hourCycle: "h23" }).format(now));
  if (hour < REMINDER_HOUR) return null;
  let due = null;
  REMINDER_DAYS.forEach((d, i) => {
    if (i >= rec.reminders_sent && today >= addDays2(rec.service_day, d)) due = i;
  });
  return due;
}
function procedureReminderMessage(label, check, serviceDay) {
  const media = check.missing.filter((i) => i !== "review");
  const lines = [`Lembrete do serviço ${label}, ${dm2(serviceDay)}. Falta: ${missingText(check.missing)}.`];
  if (media.length) lines.push("Responde à mensagem desse serviço com o que falta.");
  if (check.missing.includes("review")) lines.push("Se o cliente ainda não avaliou, manda-lhe outra vez o link.");
  lines.push(`Prazo: ${dm2(check.deadline)}.`);
  return lines.join(" ");
}
function procedureClosedMessage(label, serviceDay, missing, pay) {
  const share = pay ? ` Neste serviço a equipa fica com ${pay.teamShare}%${pay.bonus ? ` + ${pay.bonus}€` : ""}.` : "";
  return `O prazo do serviço ${label}, ${dm2(serviceDay)}, acabou sem ${missingText(missing)}. O procedimento deste serviço ficou incompleto.${share}`;
}
var PROCEDURE_NOT_A_REPLY_MESSAGE = "Para não misturar serviços, manda as fotografias e o vídeo em resposta à mensagem do serviço: carrega nessa mensagem, escolhe Responder e envia.";
function factsFromTitle(summary) {
  const parts = summary.split(/\s+-\s+/).map((s) => s.trim());
  const what = (parts[0] ?? "").replace(/^(a confirmar\s*·\s*)?(servi[cç]o|limpeza)\b/i, (m) => /limpeza/i.test(m) ? "Limpeza" : "").replace(/\d+(?:[.,]\d+)?\s*€/g, "").replace(/\((?:\s*|an[uú]ncio[^)]*)\)/gi, "").replace(/\s+/g, " ").trim();
  const nameish = parts.slice(1).find((p) => /^[\p{L} '.]+$/u.test(p) && p.split(/\s+/).length <= 4 && !/^(rua|av|avenida|travessa|largo|praça|estrada)\b/i.test(p));
  return { what: what || null, firstName: nameish ? nameish.split(/\s+/)[0] : null };
}
function procedureStatusChanges(records, reviews, endedDay, nowIso) {
  const out = [];
  for (const rec of records) {
    if (!rec.prompted_at) continue;
    const own = rec.service_request_id ? reviews.filter((r) => r.service_request_id === rec.service_request_id) : [];
    const { status } = checkProcedure(rec, own, endedDay);
    if (status === rec.status) continue;
    out.push({ calendar_event_id: rec.calendar_event_id, status, closed_at: status === "em_curso" ? null : rec.closed_at ?? nowIso });
  }
  return out;
}

// src/lib/quizOrder.ts
var QUIZ_ORDER_VERSION = 1;
var typed = (v) => String(v ?? "").trim();
function rugOf(item, kind) {
  const w = rugSide(item.largura), l = rugSide(item.comprimento);
  if (!w || !l) return null;
  return {
    kind,
    typed: `${typed(item.largura)} × ${typed(item.comprimento)}`,
    width: w.meters,
    length: l.meters,
    areaM2: Math.round(w.meters * l.meters * 100) / 100,
    fromCm: w.fromCm || l.fromCm,
    doubtful: kind === "rug" && (w.doubtful || l.doubtful)
  };
}
var fmtEuro = (n) => n % 1 === 0 ? `${n}€` : `${n.toFixed(2).replace(".", ",")}€`;
var KIND_WORD = { rug: "Tapete", carpet: "Alcatifa" };
function rugChecks(rugs) {
  const out = [];
  rugs.forEach((r, i) => {
    const name = `${KIND_WORD[r.kind]} ${i + 1}`;
    if (r.doubtful) out.push(`${name}: escreveu ${r.typed} no questionário (em metros, ${formatMeters(r.areaM2)} m²). É muito grande para um tapete: confirma as medidas antes do preço, numa pergunta curta ("São ${formatMeters(r.width)} × ${formatMeters(r.length)} metros?").`);
  });
  return out;
}
function rugLine(r, i) {
  const read = `${formatMeters(r.width)} × ${formatMeters(r.length)} m (${formatMeters(r.areaM2)} m²)`;
  return `${KIND_WORD[r.kind]} ${i + 1}: ${read}${r.fromCm ? `, escrito em centímetros no questionário (${r.typed}), já convertido` : ""}`;
}
function knownFrom(service, kinds, hasRugs, city, rugPickup) {
  const out = [];
  if (kinds.has("sofa") || /sof[aá]/i.test(service)) out.push("quantos lugares tem cada sofá e o tratamento escolhido");
  if (kinds.has("mattress") || /colch/i.test(service)) out.push("o tamanho de cada colchão");
  if (kinds.has("chairs") || /cadeira/i.test(service)) out.push("quantas cadeiras são");
  if (hasRugs) out.push("as medidas de cada tapete ou alcatifa");
  if (rugPickup !== null) out.push(rugPickup ? "que quer recolha e entrega" : "que quer a lavagem em casa");
  if (city) out.push(`a localidade (${city})`);
  return out;
}
function rugsFromDetails(details) {
  const rugs = [];
  for (const m of details.matchAll(/(Tapete|Alcatifa) \d+: ([\d.,]+) × ([\d.,]+) m/g)) {
    const rug = rugOf({ id: "", largura: m[2], comprimento: m[3] }, m[1] === "Alcatifa" ? "carpet" : "rug");
    if (rug) rugs.push(rug);
  }
  return rugs;
}
var isRecord = (v) => !!v && typeof v === "object" && !Array.isArray(v);
function describeQuizOrder(row) {
  const city = typeof row.location === "string" ? row.location : "";
  const service = typeof row.service === "string" ? row.service : "";
  const o = isRecord(row.quiz_order) && row.quiz_order.v === QUIZ_ORDER_VERSION ? row.quiz_order : null;
  if (o) {
    const rugs2 = Array.isArray(o.rugs) ? o.rugs : [];
    let rugIndex2 = 0;
    const items2 = (Array.isArray(o.lines) ? o.lines : []).filter((l) => !/^Deslocação:/.test(l.label)).map((l) => {
      const rug = /^(Tapete|Alcatifa) \d+:/.test(l.label) ? rugs2[rugIndex2++] : void 0;
      const label = rug ? rugLine(rug, rugIndex2 - 1) : l.label;
      return `${l.qty}x ${label}: ${l.price === null ? "sob orçamento" : fmtEuro(l.price)}`;
    });
    const quoteItems = Array.isArray(o.quote?.items) ? o.quote.items : [];
    const kinds = new Set(quoteItems.map((i) => i.kind));
    return {
      source: "quiz_order",
      items: items2,
      rugs: rugs2,
      quoteRequest: quoteItems.length ? { items: quoteItems, city: o.city || city } : null,
      quoteExact: o.quote?.exact !== false,
      alreadyKnown: knownFrom(service, kinds, rugs2.length > 0, o.city || city, o.rugPickup ?? null),
      confirmFirst: rugChecks(rugs2),
      rugPickup: o.rugPickup ?? null,
      quizTotal: typeof o.total === "number" ? o.total : null,
      quizPriceText: o.priceText || row.value || null,
      sobOrcamento: Boolean(o.sobOrcamento),
      observations: o.observations ?? null,
      slot: o.slot ?? null
    };
  }
  const details = typeof row.details === "string" ? row.details : "";
  const rugs = rugsFromDetails(details);
  let rugIndex = 0;
  const items = details.split("\n").map((s) => s.trim()).filter(Boolean).map((line) => {
    if (!/^\d+x (Tapete|Alcatifa) \d+:/.test(line)) return line;
    const rug = rugs[rugIndex++];
    return rug ? `1x ${rugLine(rug, rugIndex - 1)}: sob orçamento` : line;
  });
  const pickup = /Recolha(?:, entrega e deslocação| e entrega)/.test(details);
  return {
    source: "details",
    items,
    rugs,
    quoteRequest: null,
    quoteExact: false,
    alreadyKnown: knownFrom(service, /* @__PURE__ */ new Set(), rugs.length > 0, city, rugs.length ? pickup : null),
    confirmFirst: rugChecks(rugs),
    rugPickup: rugs.length ? pickup : null,
    quizTotal: null,
    quizPriceText: row.value ?? null,
    sobOrcamento: /sob orçamento/i.test(`${details} ${row.value ?? ""}`),
    observations: null,
    slot: null
  };
}

// src/lib/testLead.ts
function isTestOrder(name, phone9) {
  if (/teste|n[aã]o contactar/i.test(name ?? "")) return true;
  return /^9(\d)\1{7}$/.test(phone9) || /^9\d0{7}$/.test(phone9);
}

// src/lib/labelFacts.ts
var LABEL_FACTS_PAST_AFTER_MS = 3 * 60 * 6e4;
var INVISIBLE = new RegExp("[\\u200b-\\u200f\\u202a-\\u202e\\u2066-\\u2069\\ufeff]", "g");
var UNICODE_HYPHEN = new RegExp("[\\u2010-\\u2015\\u2212]", "g");
var COMBINING_MARK = new RegExp("[\\u0300-\\u036f]", "g");
var fold5 = (s) => s.replace(INVISIBLE, "").replace(UNICODE_HYPHEN, "-").normalize("NFD").replace(COMBINING_MARK, "").toLowerCase().trim();
var SERVICE2 = /^servico\b/;
var CLEANING = /^limpeza\b/;
var EURO_AMOUNT = /\d\s*€/;
var PENDING2 = /^(a confirmar|pre[- ]?reserva)/;
var SEPARATOR = "[\\s.\\-+\\u200b-\\u200f\\u202a-\\u202e\\u2066-\\u2069\\u2010-\\u2015\\u2212]";
var DIGIT_RUN = new RegExp(`\\d+(?:${SEPARATOR}+\\d+)*`, "g");
var HTML_SPACE = /&(?:nbsp|#160|#xa0);/gi;
var NOT_A_PHONE = new RegExp("(?<!\\d)(?:\\d{4}[-\\u2010-\\u2015\\u2212]\\d{3}|\\d{1,2}[./-]\\d{1,2}[./-](?:19|20)\\d{2}|(?:19|20)\\d{2}-\\d{1,2}-\\d{1,2})(?!\\d)", "g");
var phoneKey = (v) => v.replace(/\D/g, "").slice(-9);
function phoneKeysIn(text2) {
  const keys = /* @__PURE__ */ new Set();
  for (const run of text2.replace(HTML_SPACE, " ").replace(NOT_A_PHONE, "|").match(DIGIT_RUN) ?? []) {
    let digits3 = "";
    for (const group of run.match(/\d+/g) ?? []) {
      digits3 += group;
      if (digits3.length >= 9) keys.add(digits3.slice(-9));
    }
  }
  return keys;
}
function kindOf(summary) {
  const s = fold5(summary);
  if (SERVICE2.test(s) || CLEANING.test(s) && EURO_AMOUNT.test(s)) return "service";
  if (PENDING2.test(s)) return "pending";
  return null;
}
function instantOf(e) {
  if (e.start) {
    const t = Date.parse(e.start);
    return Number.isFinite(t) ? t : null;
  }
  return e.startDate && /^\d{4}-\d{2}-\d{2}$/.test(e.startDate) ? lisbonToUtc(e.startDate, 21 * 60) : null;
}
function labelFacts(phones, events, now) {
  const wanted = new Set(phones.map(phoneKey).filter((k) => k.length === 9));
  const nowMs = now.getTime();
  const pastBefore = nowMs - LABEL_FACTS_PAST_AFTER_MS;
  if (wanted.size === 0) return {};
  const best = /* @__PURE__ */ new Map();
  for (const e of events) {
    if (String(e.status).toUpperCase() === "CANCELLED") continue;
    const kind = kindOf(e.summary ?? "");
    if (!kind) continue;
    const at = instantOf(e);
    if (at === null) continue;
    if (kind === "pending" && at < nowMs) continue;
    const keys = phoneKeysIn(`${e.summary ?? ""}
${e.description ?? ""}
${e.location ?? ""}`);
    for (const key of keys) {
      if (!wanted.has(key)) continue;
      const b = best.get(key) ?? { past: null, next: null, pending: null };
      if (kind === "pending") {
        if (b.pending === null || at < b.pending) b.pending = at;
      } else if (at < pastBefore) {
        if (b.past === null || at > b.past) b.past = at;
      } else if (b.next === null || at < b.next) {
        b.next = at;
      }
      best.set(key, b);
    }
  }
  const day = (ms) => ms === null ? null : lisbon(ms).date;
  const out = {};
  for (const [key, b] of best) out[key] = { past: day(b.past), next: day(b.next), pending: day(b.pending) };
  return out;
}

// src/lib/botBookedServices.ts
var digits = (s) => s.replace(/\D/g, "");
var KIND = /^\s*(?:(a confirmar)\s*·\s*)?(servi[cç]o|pr[ée]-reserva)\b/i;
function bookedServices(phone, events, now) {
  const key9 = digits(phone).slice(-9);
  if (key9.length !== 9) return [];
  const from = now.getTime() - 12 * 36e5, to = now.getTime() + 60 * 864e5;
  const out = [];
  for (const e of events) {
    const m = KIND.exec(e.summary ?? "");
    if (!m || !e.start) continue;
    const t = Date.parse(e.start);
    if (!(t >= from && t <= to)) continue;
    if (!digits(`${e.summary} ${e.description ?? ""}`).includes(key9)) continue;
    const at = lisbon(t);
    const kind = m[1] ? "a confirmar" : /pr/i.test(m[2]) ? "pré-reserva" : "serviço";
    const service = (e.summary ?? "").replace(KIND, "").replace(/^[\s?\d€()]+/, "").replace(/\(an[úu]ncio[^)]*\)\s*/i, "").split(" - ")[0].replace(/^[–\s]+/, "").trim();
    out.push({ id: e.id ?? "", title: e.summary ?? "", description: e.description ?? "", date: at.date, time: `${Math.floor(at.minutes / 60)}h${at.minutes % 60 ? String(at.minutes % 60).padStart(2, "0") : ""}`, kind, service });
  }
  return out.sort((a, b) => (a.date + a.time.padStart(5, "0")).localeCompare(b.date + b.time.padStart(5, "0")));
}

// src/lib/botBookingUpdate.ts
var digits2 = (s) => s.replace(/\D/g, "");
var SERVICE_TITLE = /^\s*(?:a confirmar\s*·\s*)?servi[cç]o\b/i;
var POSTCODE = /\b\d{4}-\d{3}\b/;
function stamp(now) {
  return new Intl.DateTimeFormat("pt-PT", { timeZone: "Europe/Lisbon", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(now);
}
function planBookingUpdate(ev, phone, c, now) {
  const key9 = digits2(phone).slice(-9);
  if (key9.length !== 9 || !digits2(`${ev.summary} ${ev.description}`).includes(key9)) return { ok: false, reason: "o evento não é deste cliente" };
  if (!SERVICE_TITLE.test(ev.summary)) return { ok: false, reason: 'só serviços e "A confirmar"' };
  if (!ev.start || !ev.end) return { ok: false, reason: "evento sem hora" };
  const parts = ev.summary.split(" - ");
  const said = [];
  const clean = (v) => (v ?? "").replace(/\s+/g, " ").trim().slice(0, 200);
  const postcode = clean(c.postcode), floor = clean(c.floor), address = clean(c.address), name = clean(c.name), note = clean(c.note), cancel = clean(c.cancel);
  if (parts.length >= 2) {
    const phoneAt = parts.findIndex((p) => digits2(p).endsWith(key9));
    if (name && phoneAt > 0 && (parts.length <= phoneAt + 1 || !parts[phoneAt + 1].trim())) {
      parts[phoneAt + 1] = name;
      said.push(`nome ${name}`);
    }
    const addrAt = phoneAt > 0 && parts.length > phoneAt + 2 ? phoneAt + 2 : -1;
    if (address && address.length >= 8 && addrAt < 0) {
      parts.push(address);
      said.push(`morada ${address}`);
    } else if (address && address.length >= 8 && addrAt > 0 && digits2(address) !== digits2(parts.slice(addrAt).join(" - "))) {
      said.push(`morada ${address} (era ${parts.slice(addrAt).join(" - ")})`);
      parts.splice(addrAt, parts.length - addrAt, address);
    }
    const at = addrAt > 0 ? addrAt : parts.length - 1;
    if (postcode && POSTCODE.test(postcode) && !parts.join(" - ").includes(postcode.match(POSTCODE)[0])) {
      parts[at] = `${parts[at]}, ${postcode.match(POSTCODE)[0]}`;
      said.push(`código postal ${postcode.match(POSTCODE)[0]}`);
    }
    if (floor && !fold6(ev.summary + ev.description).includes(fold6(floor))) {
      parts[at] = `${parts[at]}, ${floor}`;
      said.push(floor);
    }
  }
  let start = ev.start, end = ev.end, moved = false;
  if (c.date && c.time && /^\d{4}-\d{2}-\d{2}$/.test(c.date) && /^\d{1,2}:\d{2}$/.test(c.time)) {
    const [h, m] = c.time.split(":").map(Number);
    const s = lisbonToUtc(c.date, h * 60 + m);
    const dur = Date.parse(ev.end) - Date.parse(ev.start);
    if (s !== Date.parse(ev.start) && s > now.getTime()) {
      const was = lisbon(Date.parse(ev.start));
      start = new Date(s).toISOString();
      end = new Date(s + dur).toISOString();
      moved = true;
      said.push(`mudou de ${was.date.slice(8)}/${was.date.slice(5, 7)} às ${hm(was.minutes)} para ${c.date.slice(8)}/${c.date.slice(5, 7)} às ${c.time}`);
    }
  }
  if (note && !fold6(ev.description).includes(fold6(note))) said.push(`nota: ${note}`);
  if (cancel) said.push(`PEDIU PARA DESMARCAR: ${cancel}`);
  if (!said.length) return { ok: false, reason: "nada de novo" };
  const line = `Atualizado pela conversa (${stamp(now)}): ${said.join("; ")}.`;
  const lines = ev.description.split("\n");
  const markAt = lines.findIndex((l) => /^bot:/.test(l));
  if (markAt >= 0) lines.splice(markAt, 0, line, "");
  else lines.push("", line);
  return { ok: true, title: parts.join(" - "), description: lines.join("\n").replace(/\n{3,}/g, "\n\n").slice(0, 4e3), start, end, moved, cancel: !!cancel, summary: said };
}
var hm = (min) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
function fold6(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ");
}
export {
  PROCEDURE_NOT_A_REPLY_MESSAGE,
  TEAM_COLOR,
  addDays2 as addDays,
  agendaCheck,
  bookedServices,
  botAvailability,
  botQuote,
  checkProcedure,
  describeQuizOrder,
  eventTeam,
  factsFromTitle,
  isTestOrder,
  labelFacts,
  lisbonDayOf,
  listBotCities,
  planBookingUpdate,
  planBotBooking,
  planBotHold,
  planOwnerBooking,
  procedureApplies,
  procedureClientMessage,
  procedureClosedMessage,
  procedureFrom,
  procedurePromptMessage,
  procedureReceiptMessage,
  procedureReminderMessage,
  procedureStatusChanges,
  reminderDue,
  resolveBotCity,
  slotForMedia,
  teamAccounts,
  teamBusyAt
};
