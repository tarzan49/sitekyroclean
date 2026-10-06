// GERADO por `npm run build:bot-engine` a partir de src/lib/botQuote.ts. Não editar à mão.
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
  { waterproofingUpsellDiscount: 10, id: "4+-lugares", label: "5+ Lugares ou em U", cleaningPrice: "Sob orçamento", waterproofingPrice: "Sob orçamento", bothPrice: "Sob orçamento", waterproofingPremiumPrice: "Sob orçamento" }
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
    let amount = line.tablePrice;
    if (line.kind === "sofa" && treatment === "none" && line.sizeId && PACK_PERK_SOFA_PRICE[line.sizeId] !== void 0) {
      amount = PACK_PERK_SOFA_PRICE[line.sizeId] * line.qty;
    } else if (line.kind === "mattress" && (treatment === "none" || treatment === "anti-acaros")) {
      amount = line.tablePrice - PACK_PERK_MATTRESS_OFF * line.qty;
    } else if (line.kind === "chairs" && treatment === "none") {
      amount = perkChairsPrice(line.tablePrice, line.qty);
    }
    amount = round2(amount);
    const perkApplied = amount < line.tablePrice;
    const free = perkChairsFree(line.qty);
    const perkNote = !perkApplied ? null : line.kind === "chairs" ? `${free} oferecida${free > 1 ? "s" : ""}` : "preço de pack";
    return { ...table, amount, perkApplied, perkNote };
  });
  return { lines: results, tableSubtotal, eligible };
}
var PACK_PERK_RULE = `A partir de ${PACK_PERK_MIN_ORDER}€ de subtotal, o artigo principal fica ao preço de tabela, em todas as unidades e tamanhos, e cada artigo de outro tipo que juntar à mesma visita entra com preço de pack: sofás a partir de ${PACK_PERK_SOFA_PRICE["1-lugar"]}€, menos ${PACK_PERK_MATTRESS_OFF}€ em cada colchão, uma cadeira oferecida por cada conjunto de ${PACK_PERK_CHAIRS_SET} e, nos tapetes, ${PACK_PERK_RUG_NOTE.toLowerCase()}.`;
var PACK_PERK_SUMMARY = `A partir de ${PACK_PERK_MIN_ORDER}€ de subtotal, o artigo principal fica ao preço de tabela e os artigos de outro tipo que acrescentar entram com preço de pack.`;
var PACK_PERK_PRICES = `Sofá a partir de ${PACK_PERK_SOFA_PRICE["1-lugar"]}€, menos ${PACK_PERK_MATTRESS_OFF}€ em cada colchão, uma cadeira oferecida por cada ${PACK_PERK_CHAIRS_SET} e, nos tapetes, ${PACK_PERK_RUG_NOTE.toLowerCase()}.`;
var PACK_PERK_BULLETS = [
  `Preço de pack a partir de ${PACK_PERK_MIN_ORDER}€ de subtotal (abaixo disso, preço de tabela normal).`,
  "O artigo principal fica ao preço de tabela, em todas as unidades e tamanhos. O preço de pack é para os artigos de outro tipo.",
  `Sofá acrescentado: ${PACK_PERK_SOFA_PRICE["1-lugar"]}€ o de 1 lugar, ${PACK_PERK_SOFA_PRICE["2-lugares"]}€ o de 2 lugares, ${PACK_PERK_SOFA_PRICE["3-lugares"]}€ o de 3 lugares, ${PACK_PERK_SOFA_PRICE["4-lugares"]}€ o de 4 lugares.`,
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
  const displayPrice = packOn && packPrice !== null ? packPrice : basePrice;
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
  let amount = null;
  const size = item.kind === "rug" || item.kind === "carpet" ? `${item.width} × ${item.length} m` : item.kind === "chairs" ? `${item.qty} unidades` : option?.label ?? "Tamanho a confirmar";
  const waterproofingOnly = item.primary === "waterproofing" && (item.extra === "premium" || item.extra === "essencial") && (item.kind === "sofa" || item.kind === "chairs");
  if (waterproofingOnly && item.kind === "chairs") {
    amount = (item.extra === "premium" ? calcChairWaterproofPremium(item.qty) : calcChairWaterproof(item.qty)) ?? null;
  } else if (waterproofingOnly && option) {
    const unit = calcSofaUnitPrice(option, false, "waterproofing", item.extra === "premium" ? "premium" : "essencial", false);
    amount = unit === null ? null : unit * item.qty;
  } else if (item.kind === "chairs") {
    amount = calcChairClean(item.qty);
    if (amount !== null) {
      if (item.extra === "premium") amount += calcChairWaterproofPremium(item.qty) ?? 0;
      if (item.extra === "essencial") amount += calcChairWaterproof(item.qty) ?? 0;
      if (item.extra === "anti-acaros") amount += chairAntiAcarosTotal(item.qty) ?? 0;
    }
  } else if (item.kind === "sofa" && option) {
    const unit = calcSofaUnitPrice(option, item.extra !== "none", "cleaning", item.extra === "premium" ? "premium" : "essencial", item.extra === "anti-acaros");
    amount = unit === null ? null : unit * item.qty;
  } else if (item.kind === "mattress" && option) {
    const unit = calcMattressUnitPrice(option, item.extra === "anti-acaros", "cleaning");
    amount = unit === null ? null : unit * item.qty;
  }
  return {
    label: `${PACK_KIND_LABEL[item.kind]} · ${size}${item.kind !== "chairs" ? ` · ${item.qty} un.` : ""} · ${waterproofingOnly ? `Só impermeabilização ${item.extra === "premium" ? "Premium (até 10 anos)" : "Essencial (1 a 2 anos)"}` : EXTRA_LABEL[item.extra]}`,
    amount,
    tablePrice: amount,
    quote: amount === null
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
    handToOwner: result.quote || city === null || extendedTrip
  };
}
export {
  BOT_SIZES,
  BOT_TREATMENTS,
  botQuote,
  listBotCities,
  resolveBotCity
};
