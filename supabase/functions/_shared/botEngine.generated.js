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
  const cents = Math.round(servicesTotal * 100);
  if (baseFee === 10 && cents > 12e3 || baseFee === 15 && cents > 13500 || baseFee === 20 && cents >= 15e3) return 0;
  return baseFee;
}

// src/components/quiz/QuizTypes.ts
var sofaPrices = [
  { waterproofingUpsellDiscount: 10, id: "1-lugar", label: "1 Lugar", cleaningPrice: 49, waterproofingPrice: 49, bothPrice: 99, originalBothPrice: 98, waterproofingPremiumPrice: 79 },
  { waterproofingUpsellDiscount: 10, id: "2-lugares", label: "2 Lugares", cleaningPrice: 69, waterproofingPrice: 79, bothPrice: 139, originalBothPrice: 148, waterproofingPremiumPrice: 109, packPremiumDelta: 30 },
  { waterproofingUpsellDiscount: 10, id: "3-lugares", label: "3 Lugares", cleaningPrice: 79, waterproofingPrice: 99, bothPrice: 169, originalBothPrice: 178, waterproofingPremiumPrice: 139, packPremiumDelta: 30 },
  { waterproofingUpsellDiscount: 10, id: "4-lugares", label: "4 Lugares", cleaningPrice: 99, waterproofingPrice: 119, bothPrice: 209, originalBothPrice: 218, waterproofingPremiumPrice: 169, packPremiumDelta: 30 },
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
var RUG_VISIT_SOFA_PRICE = 70;
var fold = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();
var NATURAL = /\b(juta|sisal|rafia|coco|fibra natural|fibras naturais|seagrass)\b/;
var DELICATE = /\b(la|lan|wool|seda|silk|viscose|persa|persia|oriental|arraiolos|feito a mao|tecido a mao|hand ?made|kilim|tibetano|nepal)\b/;
function rugMaterialClass(material) {
  if (typeof material !== "string" || !material.trim()) return "common";
  const m = fold(material);
  if (DELICATE.test(m)) return "delicate";
  if (NATURAL.test(m)) return "natural";
  return "common";
}
var roundToNine = (value) => Math.max(9, Math.round((value - 9) / 10) * 10 + 9);
function rugEstimate(rugs, city) {
  if (!rugs.length) return { ok: false, reason: "sem tapetes" };
  if (!city || !(city in locationPrices)) return { ok: false, reason: "localidade não servida" };
  if (rugs.some((r) => typeof r.material !== "string" || !r.material.trim())) {
    return { ok: false, needsMaterial: true, reason: "falta o material de cada tapete: vê-o na fotografia (microfibra, sintético, juta, sisal, lã…) ou pergunta-o numa frase, e volta a calcular" };
  }
  const classes = rugs.map((r) => rugMaterialClass(r.material));
  if (classes.includes("delicate")) return { ok: false, reason: "tapete delicado (lã, seda, viscose, persa, Arraiolos ou feito à mão): o responsável dá o preço" };
  const areaM2 = Math.round(rugs.reduce((s, r) => s + r.qty * r.width * r.length, 0) * 100) / 100;
  if (areaM2 < RUG_ESTIMATE_MIN_AREA_M2) return { ok: false, reason: `menos de ${RUG_ESTIMATE_MIN_AREA_M2} m² no total: o responsável dá o preço` };
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
  return typeof input === "string" ? CITY_BY_FOLDED.get(fold2(input)) ?? null : null;
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
  if (kind === "sofa" || kind === "mattress") {
    size = typeof r.size === "string" ? r.size : "";
    if (!BOT_SIZES[kind].includes(size)) return fail(`items[${index}].size tem de ser um de: ${BOT_SIZES[kind].join(", ")}`);
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
function rugPickupFor(items) {
  const rugs = items.filter((i) => i.kind === "rug");
  if (!rugs.length) return null;
  const areaM2 = Math.round(rugs.reduce((sum2, i) => sum2 + i.qty * Number(i.width) * Number(i.length), 0) * 100) / 100;
  return { areaM2, minAreaM2: RUG_PICKUP_MIN_AREA_M2, fee: rugPickupFee(areaM2), rule: RUG_PICKUP_FEE_RULE };
}
function botQuote(input) {
  if (!input || typeof input !== "object") return fail("O pedido tem de ter items e city");
  const { items: rawItems, city: rawCity } = input;
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
  const extendedTrip = city !== null && EXTENDED_TRIP_CITIES.has(city);
  const rugsOnly = items.every((i) => i.kind === "rug");
  const rugPrice = rugsOnly ? rugEstimate(items.map((i, n) => ({ width: Number(i.width), length: Number(i.length), qty: i.qty, material: rawItems[n].material })), city) : null;
  const rugPriced = rugPrice?.ok === true;
  const handToOwner = result.quote && !rugPriced || city === null || extendedTrip;
  return {
    ok: true,
    city,
    cityKnown: city !== null,
    extendedTrip,
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
    travel: result.travel,
    total: result.total,
    quote: result.quote,
    handToOwner,
    rugPickup: rugPickupFor(items),
    rugEstimate: rugPrice,
    // Discount to close now, only when the client said the price is the problem (owner, 13 Oct 2026).
    closeNow: closeNowOffer({
      total: result.quote ? null : result.total,
      waterproofing: items.some((i) => i.extra === "essencial" || i.extra === "premium"),
      handToOwner: handToOwner && !rugPriced,
      rug: rugPrice?.ok ? { homePrice: rugPrice.homePrice, pickupPrice: rugPrice.pickupPrice } : null
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
  if (n >= 2400 && n < 2500) return null;
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
  Lisboa: ["Lisboa 1", "Lisboa 2"],
  Algarve: ["Algarve"],
  Coimbra: ["Coimbra"]
};
var ALL_TEAMS = Object.values(TEAMS_BY_REGION).flat();
var WATERPROOFING_TEAMS = { Braga: ["Porto 1"] };
var teamsFor = (zone, waterproofing) => waterproofing && WATERPROOFING_TEAMS[zone] || TEAMS_BY_REGION[zone];
function hasWaterproofing(items) {
  return Array.isArray(items) && items.some((i) => /essencial|premium/.test(String(i?.treatment ?? "")));
}
var TEAM_CAPACITY = { "Porto 1": 2, "Lisboa 1": 2 };
var capacity = (team) => TEAM_CAPACITY[team] ?? 1;
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
  const spare = (t) => capacity(t) - busy.filter((b) => b.team === t && overlaps(b)).length;
  const teamsFree = teams.filter((t) => spare(t) > 0);
  const unassigned = busy.filter((b) => !b.team && b.region === region && overlaps(b)).length;
  const near = (t) => busy.some((b) => b.team === t && (from - b.to >= 0 && from - b.to <= 90 * 6e4 || b.from - to >= 0 && b.from - to <= 90 * 6e4));
  const room = teamsFree.reduce((n, t) => n + spare(t), 0);
  const sameTime = busy.some((b) => (b.team ? TEAM_REGION.get(b.team) === region : b.region === region) && b.from < to && b.to > from);
  return { free: room - unassigned >= 1, teamsFree, nearOtherJob: teamsFree.some(near), nearTeams: teamsFree.filter(near), sameTime };
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
function botAvailability(req, events, now) {
  const city = resolveBotCity(req?.city);
  const durationRaw = Number(req?.durationMin);
  const durationMin = Number.isFinite(durationRaw) && durationRaw >= 15 && durationRaw <= 600 ? Math.ceil(durationRaw / 15) * 15 : visitMinutes(req?.items);
  const base = { city, durationMin, suggestion: null, requested: null, free: [] };
  if (req?.city !== void 0 && typeof req.city !== "string") return { error: "city tem de ser texto" };
  if (!city) return { ...base, region: null, teams: [], handToOwner: "Localidade fora da lista: confirmar com o responsável" };
  const area = CITY_REGION.get(fold3(city));
  if (EXTENDED_TRIP_CITIES.has(city)) return { ...base, region: area ?? null, teams: [], handToOwner: "Disponibilidade sob consulta (deslocação alargada): a data é do responsável" };
  if (!area) return { ...base, region: null, teams: [], handToOwner: "Região sem equipa: confirmar com o responsável" };
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
  const dayOrder = onlyDay ? [onlyDay] : Array.from({ length: span }, (_, i) => addDays(today, i));
  const busy = busyIntervals(events);
  const earliestToday = now.getTime() + LEAD_TIME_MIN * 6e4;
  const slots = [];
  for (const date of dayOrder) {
    const label = dayLabel(date, today);
    for (let m = EARLIEST_HOUR * 60; m <= LAST_OFFER_HOUR * 60 && m + durationMin <= DAY_END_HOUR * 60; m += 60) {
      const from = lisbonToUtc(date, m);
      if (from < earliestToday) continue;
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
    requested = {
      date: onlyDay,
      time: hourLabel(m),
      free: inHours && st.free,
      teamsFree: inHours ? st.teamsFree : [],
      sameTime: st.sameTime,
      start: new Date(from).toISOString(),
      end: new Date(from + durationMin * 6e4).toISOString()
    };
  }
  const two = pickTwo(slots, dayOrder, onlyDay);
  const free = dayOrder.map((date) => ({ date, label: dayLabel(date, today), times: slots.filter((s) => s.date === date).map((s) => s.time) })).filter((d) => d.times.length);
  return {
    city,
    region: area,
    teams,
    durationMin,
    handToOwner: two.length ? null : "Sem horas livres nos próximos dias: o responsável confirma a data",
    suggestion: two.length ? { text: suggestionText(two), slots: two } : null,
    requested,
    free
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
function planBotHold(req, events, now, ownEventId) {
  if (!req || typeof req !== "object") return { error: "O pedido tem de ser um objeto" };
  const r = req;
  const conversationId = text(r.conversationId, MAX.conversationId);
  if (!conversationId) return { error: "conversationId em falta" };
  if (typeof r.date !== "string" || typeof r.time !== "string") return { error: 'date (AAAA-MM-DD) e time ("15h") são obrigatórios' };
  const others = ownEventId ? events.filter((e) => e.id !== ownEventId) : events;
  const availability = botAvailability({ city: r.city, items: r.items, date: r.date, time: r.time }, others, now);
  if ("error" in availability) return { error: String(availability.error) };
  if (availability.handToOwner && !availability.requested) return { ok: false, handToOwner: availability.handToOwner };
  const slot = availability.requested;
  if (!slot) return { error: "time inválido" };
  if (!slot.free) return { ok: false, taken: true, alternatives: availability.suggestion };
  const quote = botQuote({ items: r.items, city: r.city });
  if ("error" in quote) return { error: String(quote.error) };
  const city = availability.city;
  const what = quote.lines.map((l) => l.label).join(" + ");
  const agreed = bookingTotal(quote, r.closeNow, slot.date, now);
  if (typeof agreed === "string") return { ok: false, handToOwner: agreed };
  const price = quote.quote ? "sob orçamento" : euro(agreed.total) + (agreed.closeNow ? " (com 10% para fechar já)" : "");
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
function planOwnerBooking(req, events) {
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
    const same = events.find((e) => e.start && lisbon(Date.parse(e.start)).date === r.date && /^\s*servi[cç]o\b/i.test(e.summary) && digitsOf(`${e.summary} ${e.description}`).includes(key9));
    if (same) return { ok: false, exists: true, summary: same.summary };
  }
  const total = amount(r.total);
  const pickupFee = amount(r.pickupFee) ?? 0;
  const money = total === null ? "?€ (?€)" : `${formatAmount(ownerShare(total, pickupFee))}€ (${formatAmount(total)}€)`;
  const start = lisbonToUtc(r.date, minutes);
  const startIso = new Date(start).toISOString(), endIso = new Date(start + durationMin * 6e4).toISOString();
  const address = text(r.address, MAX.address);
  const named = typeof r.team === "string" && TEAM_COLOR[r.team] ? r.team : null;
  const team = r.confirmed === true && total !== null && address.length >= 8 ? named ?? chooseTeam(events, r.city ?? address, startIso, endIso, /imperm/i.test(service)) : null;
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
var TEAM_COLOR = { "Porto 1": "9", "Porto 2": "8", Braga: "10", "Lisboa 1": "6", "Lisboa 2": "3", Algarve: "5", Coimbra: "4" };
var AD_MARK = { google: " (anúncio)", facebook: " (anúncio facebook)", instagram: " (anúncio instagram)" };
var isWeekend = (date) => [0, 6].includes((/* @__PURE__ */ new Date(`${date}T12:00:00Z`)).getUTCDay());
function planBotBooking(req, events, now, ownEventId) {
  if (!req || typeof req !== "object") return { error: "O pedido tem de ser um objeto" };
  const r = req;
  const conversationId = text(r.conversationId, MAX.conversationId);
  if (!conversationId) return { error: "conversationId em falta" };
  if (typeof r.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(r.date) || typeof r.time !== "string") return { error: 'date (AAAA-MM-DD) e time ("15h") são obrigatórios' };
  const ownerChose = isWeekend(r.date) && r.ownerApprovedWeekend === true;
  if (isWeekend(r.date) && !ownerChose) return { ok: false, weekend: true };
  const name = text(r.name, MAX.name), address = text(r.address, MAX.address), phone = text(r.phone, MAX.phone);
  const missing = [!name && "nome", address.length < 8 && "morada completa"].filter((m) => !!m);
  if (missing.length) return { ok: false, missing };
  const others = ownEventId ? events.filter((e) => e.id !== ownEventId) : events;
  const key9 = digitsOf(phone).slice(-9);
  if (key9.length === 9 && others.some((e) => e.start && lisbon(Date.parse(e.start)).date === r.date && /^\s*servi[cç]o\b/i.test(e.summary) && digitsOf(`${e.summary} ${e.description}`).includes(key9))) return { ok: false, exists: true };
  const availability = botAvailability({ city: r.city, items: r.items, date: r.date, time: r.time }, others, now);
  if ("error" in availability) return { error: String(availability.error) };
  if (availability.handToOwner && !availability.requested) return { ok: false, handToOwner: availability.handToOwner };
  const slot = availability.requested;
  if (!slot) return { error: "time inválido" };
  if (!slot.free) return { ok: false, taken: true, alternatives: availability.suggestion };
  if (slot.sameTime && !ownerChose) return { ok: false, sameTime: true };
  const quote = botQuote({ items: r.items, city: r.city });
  if ("error" in quote) return { error: String(quote.error) };
  if (quote.quote || !(quote.total > 0)) return { ok: false, handToOwner: "sob orçamento: o responsável dá o valor e marca" };
  const agreed = bookingTotal(quote, r.closeNow, slot.date, now);
  if (typeof agreed === "string") return { ok: false, handToOwner: agreed };
  const total = agreed.total;
  const team = chooseTeam(others, r.city, slot.start, slot.end, hasWaterproofing(r.items));
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
    `Total: ${euro(total)} (deslocação incluída)`,
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
    if (start < EARLIEST_HOUR * 60 || end > DAY_END_HOUR * 60 || lisbon(t.to).date !== date) {
      add(t, `fora do horário (${EARLIEST_HOUR}h às ${DAY_END_HOUR}h)`);
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
      if (cap === 1 && next && next.from >= t.to && next.from - t.to < TRAVEL_MARGIN_MIN * 6e4) {
        add(next, `menos de ${TRAVEL_MARGIN_MIN} min de viagem desde o serviço anterior`);
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
  if (l.vat) parts.push(`IVA 23% ${euros(l.vat)}`);
  return [head, `Serviço ${euros(l.billed)} · ${parts.join(" + ")} = deves-me ${euros(l.amount)}`];
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
    for (const l of a.ownerOwes) out.push(`${dm(l.date)} ${l.label} · a vossa parte ${euros(l.amount)}`);
  }
  out.push("", `Total que me devem: ${euros(a.total)}`);
  return out.join("\n");
}
function teamAccounts(rows, events, date, adjustments = []) {
  const teamOfEvent = new Map(events.map((e) => [e.id, eventTeam(e)]));
  const byTeam = /* @__PURE__ */ new Map();
  const bucketOf = (team) => {
    const b = byTeam.get(team) ?? { today: [], before: [], adjustments: [], ownerOwes: [] };
    byTeam.set(team, b);
    return b;
  };
  const unassigned = [];
  const owed = rows.filter((r) => !r.paid && r.request_date && r.request_date <= date && !r.calendar_missing_since).filter((r) => (Number(r.billed_value) || 0) > 0 || (Number(r.upsell_value) || 0) > 0).sort((a, b) => a.request_date.localeCompare(b.request_date));
  for (const r of owed) {
    const share = ownerShareOf(r);
    if (share <= 0) continue;
    const team = r.calendar_event_id ? teamOfEvent.get(r.calendar_event_id) ?? null : null;
    if (r.paid_to_owner) {
      const teamPart = round23((Number(r.billed_value) || 0) + (Number(r.upsell_value) || 0) - share);
      if (team && teamPart > 0) bucketOf(team).ownerOwes.push({ date: r.request_date, label: labelOf(r), amount: teamPart });
      continue;
    }
    const penalty = team && !r.review_requested && reviewPenaltyApplies(team, r.request_date) ? round23((Number(r.billed_value) || 0) * REVIEW_PENALTY_SHARE) : 0;
    const billed = Number(r.billed_value) || 0;
    const vat = r.invoiced ? round23(billed * INVOICE_VAT) : 0;
    const what = (r.description ?? "").trim();
    const line = {
      date: r.request_date,
      label: labelOf(r),
      amount: round23(share + penalty + vat),
      billed,
      share,
      ...what ? { what } : {},
      ...penalty ? { reviewPenalty: penalty } : {},
      ...vat ? { vat } : {}
    };
    if (!team) {
      unassigned.push(line);
      continue;
    }
    const bucket = bucketOf(team);
    (line.date === date ? bucket.today : bucket.before).push(line);
  }
  for (const a of adjustments) {
    if (a.day > date || !(Number(a.amount) > 0)) continue;
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
    "Como agradecimento, fica com 10% de desconto no próximo serviço. Obrigado!"
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
  teamAccounts
};
