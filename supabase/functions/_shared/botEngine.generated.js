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
  { waterproofingUpsellDiscount: 10, id: "1-lugar", label: "1 Lugar", cleaningPrice: 49, waterproofingPrice: 59, bothPrice: 99, originalBothPrice: 108, waterproofingPremiumPrice: 89 },
  { waterproofingUpsellDiscount: 10, id: "2-lugares", label: "2 Lugares", cleaningPrice: 69, waterproofingPrice: 79, bothPrice: 139, originalBothPrice: 148, waterproofingPremiumPrice: 109, packPremiumDelta: 30 },
  { waterproofingUpsellDiscount: 10, id: "3-lugares", label: "3 Lugares", cleaningPrice: 79, waterproofingPrice: 99, bothPrice: 169, originalBothPrice: 178, waterproofingPremiumPrice: 139, packPremiumDelta: 30 },
  { waterproofingUpsellDiscount: 10, id: "4-lugares", label: "4 Lugares", cleaningPrice: 99, waterproofingPrice: 119, bothPrice: 209, originalBothPrice: 218, waterproofingPremiumPrice: 169, packPremiumDelta: 30 },
  { id: "5-lugares", label: "5+ Lugares", cleaningPrice: 119, waterproofingPrice: "Sob orçamento", bothPrice: "Sob orçamento", waterproofingPremiumPrice: "Sob orçamento" },
  { id: "4+-lugares", label: "Canto, em U ou modular", cleaningPrice: "Sob orçamento", waterproofingPrice: "Sob orçamento", bothPrice: "Sob orçamento", waterproofingPremiumPrice: "Sob orçamento" }
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
  const tableSubtotal = round2(lines.reduce((sum, line) => sum + (line.tablePrice ?? 0), 0));
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

// src/components/quiz/quizHelpers.ts
function calcPackPricing(option, packOn, isWaterproofBase, fallbackDelta = null, tier = "essencial") {
  const isPremium = tier === "premium";
  const isSob = typeof option.cleaningPrice !== "number";
  const cleanPrice = typeof option.cleaningPrice === "number" ? option.cleaningPrice : null;
  const waterPrice = typeof option.waterproofingPrice === "number" ? option.waterproofingPrice : null;
  const waterPremiumPrice = typeof option.waterproofingPremiumPrice === "number" ? option.waterproofingPremiumPrice : null;
  const basePrice = isWaterproofBase ? isPremium ? waterPremiumPrice : waterPrice : cleanPrice;
  const tierDelta = isPremium ? typeof option.packPremiumDelta === "number" ? option.packPremiumDelta : waterPremiumPrice !== null && waterPrice !== null ? waterPremiumPrice - waterPrice : 0 : 0;
  const bothEssencial = typeof option.bothPrice === "number" ? option.bothPrice : fallbackDelta !== null && cleanPrice !== null ? cleanPrice + fallbackDelta : null;
  const upsellDiscount = option.waterproofingUpsellDiscount ?? 0;
  const packPrice = bothEssencial !== null ? bothEssencial + tierDelta - upsellDiscount : null;
  const packDelta = packPrice !== null && basePrice !== null ? packPrice - basePrice : fallbackDelta;
  const displayPrice = packOn ? packPrice : basePrice;
  return { isSob, basePrice, packPrice, packDelta, displayPrice };
}
function calcSofaUnitPrice(option, treated, serviceType, tier, antiAcaros) {
  if (treated && antiAcaros && serviceType !== "waterproofing") {
    const extra = sofaAntiAcarosPrice(option.id);
    return typeof option.cleaningPrice === "number" && extra !== null ? option.cleaningPrice + extra : null;
  }
  return calcPackPricing(option, treated, serviceType === "waterproofing", null, tier).displayPrice;
}
function calcMattressUnitPrice(option, treated, serviceType) {
  const price = treated ? option.bothPrice : serviceType === "waterproofing" ? option.waterproofingPrice : option.cleaningPrice;
  return typeof price === "number" ? price : null;
}
function calcChairClean(qty) {
  if (qty <= 0 || qty >= 10) return null;
  if (qty <= 4) return qty * 20;
  if (qty <= 6) return 4 * 20 + (qty - 4) * 15;
  return 4 * 20 + 2 * 15 + (qty - 6) * 12.5;
}
function calcChairWaterproof(qty) {
  return Number.isSafeInteger(qty) && qty > 0 ? qty * CHAIR_WATERPROOF_ESSENTIAL : null;
}
function calcChairWaterproofPremium(qty) {
  return Number.isSafeInteger(qty) && qty > 0 ? qty * CHAIR_WATERPROOF_PREMIUM : null;
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
  const option = options.find((p) => p.id === item.size);
  let amount2 = null;
  const size = item.kind === "rug" || item.kind === "carpet" ? `${item.width} × ${item.length} m` : item.kind === "chairs" ? `${item.qty} unidades` : option?.label ?? "Tamanho a confirmar";
  const waterproofingOnly = item.primary === "waterproofing" && (item.extra === "premium" || item.extra === "essencial") && (item.kind === "sofa" || item.kind === "chairs");
  if (waterproofingOnly && item.kind === "chairs") {
    amount2 = (item.extra === "premium" ? calcChairWaterproofPremium(item.qty) : calcChairWaterproof(item.qty)) ?? null;
  } else if (waterproofingOnly && option) {
    const unit = calcSofaUnitPrice(option, false, "waterproofing", item.extra === "premium" ? "premium" : "essencial", false);
    amount2 = unit === null ? null : unit * item.qty;
  } else if (item.kind === "chairs") {
    amount2 = calcChairClean(item.qty);
    if (amount2 !== null) {
      if (item.extra === "premium") amount2 += calcChairWaterproofPremium(item.qty) ?? 0;
      if (item.extra === "essencial") amount2 += calcChairWaterproof(item.qty) ?? 0;
      if (item.extra === "anti-acaros") amount2 += chairAntiAcarosTotal(item.qty) ?? 0;
    }
  } else if (item.kind === "sofa" && option) {
    const unit = calcSofaUnitPrice(option, item.extra !== "none", "cleaning", item.extra === "premium" ? "premium" : "essencial", item.extra === "anti-acaros");
    amount2 = unit === null ? null : unit * item.qty;
  } else if (item.kind === "mattress" && option) {
    const unit = calcMattressUnitPrice(option, item.extra === "anti-acaros", "cleaning");
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
  const totalChairs = items.filter((i) => i.kind === "chairs").reduce((sum, i) => sum + i.qty, 0);
  const table = items.map((item) => {
    const line = customPackLine(item);
    return item.kind === "chairs" && totalChairs >= 10 ? { ...line, amount: null, tablePrice: null, quote: true } : line;
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
  const subtotal = Math.round(lines.reduce((sum, line) => sum + (line.amount ?? 0), 0) * 100) / 100;
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
var DRYING_PROMISE = "Secagem média de 3 a 6 horas, dependendo da ventilação, do tecido e das condições do espaço.";
var SOFA_DRYING_RANGE = "2 a 5 horas";
var SOFA_DRYING_PROMISE = `Secagem média de ${SOFA_DRYING_RANGE}, dependendo da ventilação, do tecido e das condições do espaço.`;
var SATISFACTION_PROMISE = "Se não ficar satisfeito, contacte-nos até 48 horas após o serviço e repetimos a intervenção sem custos. Após esse prazo, esta garantia comercial de repetição deixa de se aplicar, sem prejuízo dos direitos legais.";
var PRICE_PROMISE = "A simulação é uma estimativa. Confirmamos o preço com base nos artigos, medidas, tratamento e deslocação antes da marcação. O valor confirmado mantém-se para esse serviço; alterações ao pedido são orçamentadas previamente.";
var AVAILABILITY_PROMISE = "Procuramos realizar o serviço no próprio dia ou no dia seguinte, mediante disponibilidade confirmada pela equipa.";
var COVERAGE_PROMISE = "Equipas em Braga, Porto, Coimbra, Lisboa e Algarve, com cobertura regular do litoral entre Viana do Castelo e o Algarve. Outras localidades mediante confirmação.";
var TREATMENT_EXTRAS = "A limpeza remove sujidade e resíduos das fibras. O tratamento anti-ácaros e a desbacterização são extras opcionais, escolhidos e orçamentados separadamente.";
var RUG_PICKUP_MIN_AREA_M2 = 3;
var RUG_PICKUP_RULE = `Só fazemos recolha quando os tapetes do pedido somam ${RUG_PICKUP_MIN_AREA_M2} m² ou mais; abaixo disso, a lavagem é sempre feita em sua casa.`;
function rugPickupFee(totalAreaM2) {
  if (!(totalAreaM2 >= RUG_PICKUP_MIN_AREA_M2)) return null;
  if (totalAreaM2 <= 6) return 10;
  if (totalAreaM2 < 10) return 15;
  return 20;
}
var RUG_PICKUP_FEE_RULE = "A recolha e entrega, com a deslocação incluída, custa 10€ até 6 m², 15€ acima de 6 m² e 20€ a partir de 10 m², somando os tapetes do pedido.";
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
var fold = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase().replace(/\s+/g, " ");
var CITY_BY_FOLDED = new Map(Object.keys(locationPrices).map((name) => [fold(name), name]));
function resolveBotCity(input) {
  return typeof input === "string" ? CITY_BY_FOLDED.get(fold(input)) ?? null : null;
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
  const dim = (v) => typeof v === "number" && Number.isFinite(v) && v > 0 && v <= 100 ? String(v) : "";
  const width = kind === "rug" || kind === "carpet" ? dim(r.width) : "";
  const length = kind === "rug" || kind === "carpet" ? dim(r.length) : "";
  if ((kind === "rug" || kind === "carpet") && (!width || !length)) return fail(`items[${index}]: tapetes e alcatifas precisam de width e length em metros`);
  return { id: String(index), kind, size, qty, extra, primary, width, length };
}
function rugPickupFor(items) {
  const rugs = items.filter((i) => i.kind === "rug");
  if (!rugs.length) return null;
  const areaM2 = Math.round(rugs.reduce((sum, i) => sum + i.qty * Number(i.width) * Number(i.length), 0) * 100) / 100;
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
    handToOwner: result.quote || city === null || extendedTrip,
    rugPickup: rugPickupFor(items)
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
  if (n >= 4700 && n < 4780 || n >= 4800 && n < 5e3) return "Braga";
  if (n >= 3e3 && n < 6e3) return "Porto";
  return null;
}

// src/lib/botAvailability.ts
var TEAMS_BY_REGION = {
  Porto: ["Porto 1", "Porto 2"],
  Braga: ["Braga"],
  Lisboa: ["Lisboa 1", "Lisboa 2"],
  Algarve: ["Algarve"]
};
var ALL_TEAMS = Object.values(TEAMS_BY_REGION).flat();
var AREA_REGION = {
  porto: "Porto",
  braga: "Braga",
  lisboa: "Lisboa",
  algarve: "Algarve",
  coimbra: "coimbra"
};
var MINUTES = { sofa: 60, mattress: 45, chair: 10, rugPerM2: 4, waterproofing: 20, minimum: 45 };
var TRAVEL_MARGIN_MIN = 30;
var EARLIEST_HOUR = 10;
var DAY_END_HOUR = 21;
var LAST_OFFER_HOUR = 18;
var LEAD_TIME_MIN = 90;
var DEFAULT_DAYS = 4;
var MAX_DAYS = 14;
var fold2 = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
var CITY_REGION = new Map(cities.map((c) => [fold2(c.name), AREA_REGION[c.area]]));
var CITY_NAMES = cities.map((c) => ({ key: fold2(c.name), region: AREA_REGION[c.area] })).filter((c) => c.key.length >= 4).sort((a, b) => b.key.length - a.key.length);
var SERVICE_LIKE = /^(servico|limpeza|pre-? ?reserva|a confirmar)\b/;
var TEAM_LINE = /^\s*Equipa:\s*([^\n<]*)/im;
var POSTAL = /\b(\d{4})-\d{3}\b/;
function eventTeam(e) {
  const t = TEAM_LINE.exec(e.description ?? "")?.[1];
  if (!t) return null;
  const k = fold2(t);
  return ALL_TEAMS.find((team) => fold2(team) === k) ?? null;
}
function eventRegion(e) {
  const text2 = `${e.summary}
${e.description}`;
  const postal = POSTAL.exec(text2);
  if (postal) {
    const r = localityFromPostalCode(postal[1]);
    if (r) return r;
  }
  const folded = fold2(e.summary);
  for (const c of CITY_NAMES) {
    if (c.region === "coimbra") continue;
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
    if (!SERVICE_LIKE.test(fold2(e.summary))) continue;
    const region = eventRegion(e);
    if (region) out.push({ from, to, team: null, region });
  }
  return out;
}
function slotState(busy, teams, region, from, to) {
  const margin = TRAVEL_MARGIN_MIN * 6e4;
  const overlaps = (b) => b.from < to + margin && b.to > from - margin;
  const teamsFree = teams.filter((t) => !busy.some((b) => b.team === t && overlaps(b)));
  const unassigned = busy.filter((b) => !b.team && b.region === region && overlaps(b)).length;
  const near = (t) => busy.some((b) => b.team === t && (from - b.to >= 0 && from - b.to <= 90 * 6e4 || b.from - to >= 0 && b.from - to <= 90 * 6e4));
  return { free: teamsFree.length - unassigned >= 1, teamsFree, nearOtherJob: teamsFree.some(near) };
}
var DATE = /^\d{4}-\d{2}-\d{2}$/;
function parseTime(v) {
  const m = /^(\d{1,2})(?:[:h](\d{2})?)?h?$/i.exec(String(v ?? "").trim());
  if (!m) return null;
  const h = Number(m[1]), min = Number(m[2] ?? 0);
  return h < 24 && min < 60 ? h * 60 + min : null;
}
function pickTwo(slots, dayOrder, onlyDay) {
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
  const area = CITY_REGION.get(fold2(city));
  if (area === "coimbra") return { ...base, region: null, teams: [], handToOwner: "Coimbra e Figueira da Foz ainda não têm calendário de equipa: a disponibilidade é do responsável" };
  if (EXTENDED_TRIP_CITIES.has(city)) return { ...base, region: area ?? null, teams: [], handToOwner: "Disponibilidade sob consulta (deslocação alargada): a data é do responsável" };
  if (!area) return { ...base, region: null, teams: [], handToOwner: "Região sem equipa: confirmar com o responsável" };
  const teams = [...TEAMS_BY_REGION[area]];
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
      if (st.free) slots.push({ date, minutes: m, label, time: hourLabel(m), teamsFree: st.teamsFree, nearOtherJob: st.nearOtherJob });
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
  const price = quote.quote ? "sob orçamento" : euro(quote.total);
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
  const parts = [`${OWNER_BOOKING_PREFIX}Serviço ${money}${r.fromAds === true ? " (anúncio)" : ""} ${service}`, phone, text(r.name, MAX.name), text(r.address, MAX.address)].filter(Boolean);
  const start = lisbonToUtc(r.date, minutes);
  const description = [
    'Preparado a partir da conversa do WhatsApp depois de "fica agendado". Confere e apaga "A confirmar · " do título para confirmar (entra no CRM e vai para a equipa).',
    text(r.notes, 600),
    pickupFee && total !== null ? `Parte do dono: metade do total menos a recolha (${formatAmount(total / 2)}€ − ${formatAmount(pickupFee)}€).` : "",
    `bot:${conversationId}`
  ].filter(Boolean).join("\n\n");
  return { ok: true, event: { title: parts.join(" - "), description, start: new Date(start).toISOString(), end: new Date(start + durationMin * 6e4).toISOString() } };
}
var formatAmount = (n) => Number.isInteger(n) ? String(n) : n.toFixed(2).replace(".", ",").replace(/,?0+$/, "");
export {
  botAvailability,
  botQuote,
  listBotCities,
  planBotHold,
  planOwnerBooking,
  resolveBotCity
};
