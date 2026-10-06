// GERADO por `npm run build:follow-up-engine` a partir de src/lib/followUpBundle.ts. Não editar à mão.
// src/lib/clientRecords.ts
var CLIENT_SERVICES = ["Sofá", "Colchão", "Tapete", "Cadeira", "Impermeabilização", "Recolha"];
var CLIENT_REGIONS = ["Porto", "Lisboa", "Braga", "Algarve", "Coimbra"];
var STATUS_BY_LABEL = [
  ["Concluído", "cliente"],
  ["Deu Avaliação Google", "cliente"],
  ["Serviço Marcado", "marcado"],
  ["Por marcar serviço", "por_marcar"],
  ["1 mês followup", "por_marcar"],
  ["Dar seguimento", "por_marcar"],
  ["Lead", "por_marcar"],
  ["Não está interessado", "nao_interessado"]
];
var cleanLabel = (name) => name.replace(/[‎‏‪-‮]/g, "").trim();
function factsFromLabels(rawLabels) {
  const labels = rawLabels.map(cleanLabel).filter(Boolean);
  const has = (l) => labels.includes(l);
  const status = STATUS_BY_LABEL.find(([l]) => has(l))?.[1] ?? "sem_estado";
  return {
    status,
    services: CLIENT_SERVICES.filter(has),
    region: CLIENT_REGIONS.find(has) ?? null,
    fromGoogleAds: has("Google"),
    reviewedGoogle: has("Deu Avaliação Google"),
    labels
  };
}
var normalizePhone = (phone) => phone.replace(/\D/g, "").replace(/^00/, "");
var phoneKey = (phone) => phone ? normalizePhone(phone).slice(-9) : "";
function formatPhone(phone) {
  const d = normalizePhone(phone);
  if (d.length === 12 && d.startsWith("351")) return `+351 ${d.slice(3, 6)} ${d.slice(6, 9)} ${d.slice(9)}`;
  return `+${d}`;
}
var NOT_A_NAME = /* @__PURE__ */ new Set(["cliente", "senhora", "senhor", "sr", "sra", "nao", "pt", "casa"]);
var displayName = (c, services = []) => c.name?.trim() || services.find((s) => s.client_name?.trim())?.client_name?.trim() || c.whatsapp_name?.trim() || formatPhone(c.phone);
function firstName(c, services = []) {
  const name = displayName(c, services);
  if (name.startsWith("+")) return "";
  const first = name.replace(/^[^\p{L}]+/u, "").match(/^\p{L}+/u)?.[0] ?? "";
  if (!/^\p{L}{2,}$/u.test(first) || NOT_A_NAME.has(fold(first))) return "";
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}
function servicesByPhone(services) {
  const map = /* @__PURE__ */ new Map();
  for (const s of services) {
    const key = phoneKey(s.phone);
    if (key.length < 9) continue;
    const list = map.get(key) ?? [];
    list.push(s);
    map.set(key, list);
  }
  for (const list of map.values()) list.sort((a, b) => a.request_date.localeCompare(b.request_date));
  return map;
}
var fold = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// src/lib/crmServiceMix.ts
var normalize = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
var ITEM_PATTERNS = [
  ["Sofá", /\bsofa|poltron|chaise|cadeirao|cadeiroes|\bmaple|\bpuff|\bpufe/],
  ["Colchão", /colch|sommier/],
  ["Tapete", /tapete|carpete/],
  ["Cadeiras", /\bcadeiras?\b/],
  ["Alcatifa", /alcatif/],
  ["Cabeceira", /cabeceira/]
];
function itemsOf(description) {
  const d = normalize(description);
  const found = ITEM_PATTERNS.filter(([, re]) => re.test(d)).map(([item]) => item);
  return found.length ? found : ["Outro"];
}
function typeOf(description) {
  return /impermeabiliz/.test(normalize(description)) ? "Impermeabilização" : "Limpeza";
}

// src/lib/crmClosings.ts
var WEEKDAY_LONG = ["segunda", "terça", "quarta", "quinta", "sexta", "sábado", "domingo"];
var lisbon = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Lisbon", year: "numeric", month: "2-digit", day: "2-digit" });
function lisbonDay(iso) {
  return lisbon.format(typeof iso === "string" ? new Date(iso) : iso);
}
var toUtcNoon = (day) => Date.UTC(Number(day.slice(0, 4)), Number(day.slice(5, 7)) - 1, Number(day.slice(8, 10)), 12);
var fromUtc = (ms) => new Date(ms).toISOString().slice(0, 10);
function addDays(day, n) {
  return fromUtc(toUtcNoon(day) + n * 864e5);
}
function weekdayOf(day) {
  return (new Date(toUtcNoon(day)).getUTCDay() + 6) % 7;
}

// src/constants/packPerks.ts
var PACK_PERK_MIN_ORDER = 100;
var PACK_PERK_MATTRESS_OFF = 14;
var PACK_PERK_SOFA_PRICE = { "1-lugar": 35, "2-lugares": 55, "3-lugares": 65, "4-lugares": 79 };
var PACK_PERK_CHAIRS_SET = 4;
var PACK_PERK_RUG_SET_M2 = 5;
var PACK_PERK_RUG_NOTE = `Limpe ${PACK_PERK_RUG_SET_M2} m², pague ${PACK_PERK_RUG_SET_M2 - 1}`;
function perkMattressPrice(tablePrice) {
  return tablePrice - PACK_PERK_MATTRESS_OFF;
}
function perkSofaPrice(sizeId, tablePrice) {
  return PACK_PERK_SOFA_PRICE[sizeId] ?? tablePrice;
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
  if (qty <= 0 || qty >= 10) return null;
  if (qty <= 4) return qty * 20;
  if (qty <= 6) return 4 * 20 + (qty - 4) * 15;
  return 4 * 20 + 2 * 15 + (qty - 6) * 12.5;
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
var priced = (value, what) => required(typeof value === "number" ? value : null, what);
function sofaCleaningPrice(id) {
  return priced(option(sofaPrices, id, "sofaPrices").cleaningPrice, `a limpeza do sofá "${id}"`);
}
function mattressCleaningPrice(id) {
  return priced(option(mattressPrices, id, "mattressPrices").cleaningPrice, `a limpeza do colchão "${id}"`);
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

// src/constants/google.ts
var GOOGLE_PLACE_ID = "ChIJt71NLgBlJA0RIT9kggF_3Fk";
var GOOGLE_REVIEW_URL = `https://search.google.com/local/writereview?placeid=${GOOGLE_PLACE_ID}`;
var GOOGLE_MAPS_URL = `https://www.google.com/maps/place/?q=place_id:${GOOGLE_PLACE_ID}`;
var GOOGLE_REVIEWS_VIEW_URL = `https://search.google.com/local/reviews?placeid=${GOOGLE_PLACE_ID}`;
var GOOGLE_REVIEW_LINK_PORTO = "https://g.page/r/CSE_ZIIBf9xZEBM/review";
var GOOGLE_REVIEW_LINK_LISBOA = "https://g.page/r/CRc7F7lX3xcEECE/review";

// src/lib/clientFollowUp.ts
var FOLLOW_UP_RULES = {
  /** Nunca escrever primeiro entre as 21h e as 9h30 (bot, 2.12 e 8). */
  quietFromMinutes: 21 * 60,
  quietUntilMinutes: 9 * 60 + 30,
  /** Seguimentos de um orçamento depois da última mensagem do cliente (bot, 8). */
  maxFollowUps: 2,
  /** O 1.º seguimento sai umas 4 horas depois da nossa última mensagem, no mesmo dia. */
  firstFollowUpHours: 4,
  /** O 2.º (e último), cerca de 24 horas depois do 1.º. */
  secondFollowUpHours: 20,
  /** Passados estes dias sem resposta, o orçamento parou: só data combinada ou campanha. */
  followUpWindowDays: 3,
  /** Responder a quem escreveu por último: um lead até 7 dias depois; um cliente até 3 (um "obrigado" não pede resposta). */
  answerLeadDays: 7,
  answerClientDays: 3,
  /** Pedido de avaliação: até 14 dias depois do serviço, e um só lembrete, 1 a 4 dias depois do pedido (bot, 7.4). */
  reviewWindowDays: 14,
  reviewReminderAfterDays: 1,
  reviewReminderUntilDays: 4,
  /** Tapete com recolha: a avaliação só depois da entrega (até 4 dias úteis). */
  rugPickupDelayDays: 6,
  /** Recomendação: a quem avaliou ou já repetiu, entre 7 e 120 dias depois do serviço, uma vez por ano. */
  referralFromDays: 7,
  referralUntilDays: 120,
  referralEveryDays: 365,
  /** Mensagens comerciais (mesma visita, recomendação, manutenção, campanha): uma de cada vez, com este intervalo. */
  marketingEveryDays: 45,
  /** Antes de uma mensagem comercial, a nossa última mensagem sem resposta tem de ter pelo menos estes dias. */
  quietDaysAfterOurMessage: 7,
  /** Não interessado: nada comercial durante 90 dias depois do último contacto. */
  afterNoDays: 90,
  /** Orçamento parado: campanha só 30 dias depois do último contacto. */
  stalledCampaignDays: 30,
  /** Cliente: campanha só 60 dias depois do último serviço. */
  clientCampaignDays: 60,
  /** "Aproveitar a mesma visita": entre 5 e 2 dias antes do serviço. */
  sameVisitFromDays: 5,
  sameVisitUntilDays: 2,
  /** Manutenção: lembrar a partir da data e até 60 dias depois (a seguir fica para as campanhas). */
  maintenanceValidDays: 60,
  /** O que entra na lista "Próximos dias". */
  soonDays: 7,
  /** Envios de cada versão (A e B) antes de o motor escolher a que resulta mais. */
  minVariantSample: 8
};
var R = FOLLOW_UP_RULES;
var CLIENT_CONDITION = "a deslocação fica por nossa conta";
var REFERRAL_CONDITION = "Por cada pessoa que vier da sua parte, a deslocação fica por nossa conta, para ela e para si na próxima limpeza.";
var OFFERS_CONFIRMED = false;
var MATTRESS_TABLE = mattressCleaningPrice("casal");
var PACK_LINE = `na mesma visita, cada artigo que juntar fica com preço de pack (um colchão de casal, por exemplo, por ${formatEuro(perkMattressPrice(MATTRESS_TABLE))} em vez de ${formatEuro(MATTRESS_TABLE)})`;
var CONTACT_PREFERENCES = ["normal", "sem_promocoes", "nao_contactar"];
var ACTION_KINDS = [
  "responder",
  "seguimento",
  "lembrete",
  "vespera",
  "mesma_visita",
  "avaliacao",
  "avaliacao_lembrete",
  "recomendacao",
  "manutencao",
  "campanha"
];
var MARKETING_KINDS = ["mesma_visita", "recomendacao", "manutencao", "campanha"];
var STAGE_INFO = {
  conversa: {
    label: "Em conversa",
    stance: "Escreveram por último. Responder primeiro e depressa: quem pede vários orçamentos fica com quem responde primeiro."
  },
  orcamento_aberto: {
    label: "Orçamento em aberto",
    stance: "Até 3 dias depois da última mensagem do cliente. Dois seguimentos no máximo, com horas reais, e parar."
  },
  orcamento_parado: {
    label: "Orçamento parado",
    stance: "Mais de 3 dias sem resposta. Não insistir: só na data que a pessoa deu, ou numa campanha com uma razão concreta."
  },
  marcado: {
    label: "Serviço marcado",
    stance: "Lembrar na véspera e, 2 a 5 dias antes, oferecer um segundo artigo com preço de pack. Nada comercial além disso."
  },
  cliente_recente: {
    label: "Cliente recente",
    stance: "Serviço nos últimos 60 dias. Pedir a avaliação (uma vez e um lembrete) e, a quem avaliou, uma recomendação."
  },
  manutencao: {
    label: "Manutenção a fazer",
    stance: "Já passou o intervalo que o site recomenda. Uma mensagem pessoal, com a condição de cliente: é a venda mais barata."
  },
  cliente: {
    label: "Cliente",
    stance: "Primeiros a saber das campanhas, sempre com a condição de cliente. Nunca mais do que uma mensagem comercial por mês e meio."
  },
  perdido: {
    label: "Não interessado",
    stance: "Nada durante 90 dias. Depois, só campanhas com uma razão real (Black Friday, Natal). Nunca condições maiores para reconquistar."
  },
  em_pausa: {
    label: "Em pausa",
    stance: "Queixa ou problema em aberto. Resolver primeiro; nada de avaliações, recomendações nem campanhas até lá."
  },
  nao_contactar: {
    label: "Não contactar",
    stance: "Pediram para não receber mensagens. Só se responde quando escreverem."
  }
};
var toNoon = (day) => Date.UTC(Number(day.slice(0, 4)), Number(day.slice(5, 7)) - 1, Number(day.slice(8, 10)), 12);
var dayDiff = (from, to) => Math.round((toNoon(to) - toNoon(from)) / 864e5);
var LISBON_CLOCK = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Lisbon", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
function lisbonMinutes(d) {
  const [h, m] = LISBON_CLOCK.format(d).split(":").map(Number);
  return h % 24 * 60 + m;
}
var clock = (minutes) => `${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, "0")}`;
var dm = (day) => `${day.slice(8, 10)}/${day.slice(5, 7)}`;
function isQuietTime(now) {
  const minutes = lisbonMinutes(now);
  return minutes >= R.quietFromMinutes || minutes < R.quietUntilMinutes;
}
function greetingFor(minutes) {
  if (minutes >= 6 * 60 && minutes < 12 * 60) return "Bom dia";
  if (minutes >= 12 * 60 && minutes < 20 * 60) return "Boa tarde";
  return "Boa noite";
}
function dayPhrase(day, today) {
  const diff = dayDiff(today, day);
  const weekday = WEEKDAY_LONG[weekdayOf(day)];
  if (diff === 0) return "hoje";
  if (diff === 1) return `amanhã (${weekday})`;
  return `${weekday} (dia ${Number(day.slice(8, 10))})`;
}
function whenPhrase(iso, today) {
  const day = lisbonDay(iso);
  const diff = dayDiff(day, today);
  const ref = diff === 0 ? "hoje" : diff === 1 ? "ontem" : `a ${dm(day)}`;
  return `${ref} às ${clock(lisbonMinutes(new Date(iso)))}`;
}
function sendWindow(at) {
  const day = lisbonDay(at);
  const minutes = lisbonMinutes(at);
  if (minutes >= R.quietFromMinutes) return { day: addDays(day, 1), notBefore: clock(R.quietUntilMinutes) };
  if (minutes < R.quietUntilMinutes) return { day, notBefore: clock(R.quietUntilMinutes) };
  return { day, notBefore: clock(minutes) };
}
var maxIso = (...values) => values.filter((v) => !!v).sort().at(-1) ?? null;
var ITEM_ORDER = ["Sofá", "Colchão", "Cadeiras", "Tapete", "Alcatifa", "Cabeceira"];
var WORDS = {
  "Sofá": { the: "o sofá", your: "o seu sofá", of: "do sofá", plural: false, data: "quantos lugares tem" },
  "Colchão": { the: "o colchão", your: "o seu colchão", of: "do colchão", plural: false, data: "o tamanho do colchão" },
  "Cadeiras": { the: "as cadeiras", your: "as suas cadeiras", of: "das cadeiras", plural: true, data: "quantas cadeiras são" },
  "Tapete": { the: "o tapete", your: "o seu tapete", of: "do tapete", plural: false, data: "as medidas do tapete" },
  "Alcatifa": { the: "a alcatifa", your: "a sua alcatifa", of: "da alcatifa", plural: false, data: "a área da alcatifa" },
  "Cabeceira": { the: "a cabeceira", your: "a sua cabeceira", of: "da cabeceira", plural: false, data: "as medidas da cabeceira" }
};
var LABEL_ITEM = {
  "Sofá": "Sofá",
  "Colchão": "Colchão",
  "Tapete": "Tapete",
  "Cadeira": "Cadeiras",
  "Impermeabilização": "Sofá",
  "Recolha": "Tapete"
};
var joinPt = (parts) => parts.length <= 1 ? parts.join("") : `${parts.slice(0, -1).join(", ")} e ${parts[parts.length - 1]}`;
function itemsOfService(s) {
  return itemsOf(s.description).filter((i) => i !== "Outro");
}
function contactItems(c, services) {
  const set = new Set(services.flatMap(itemsOfService));
  if (!set.size) for (const label of c.services) {
    const item = LABEL_ITEM[label];
    if (item) set.add(item);
  }
  return ITEM_ORDER.filter((i) => set.has(i));
}
function wordsFor(items) {
  if (!items.length) return { the: "os seus estofos", your: "os seus estofos", of: "dos seus estofos", plural: true };
  if (items.length === 1) return WORDS[items[0]];
  return {
    the: joinPt(items.map((i) => WORDS[i].the)),
    your: joinPt(items.map((i) => WORDS[i].the)),
    of: joinPt(items.map((i) => WORDS[i].of)),
    plural: true
  };
}
function jobOf(s) {
  const items = itemsOfService(s);
  const kind = typeOf(s.description) === "Impermeabilização" ? "a impermeabilização" : "a limpeza";
  return items.length ? `${kind} ${wordsFor(items).of}` : kind;
}
var isRugPickup = (s) => itemsOfService(s).includes("Tapete") && /recolh/i.test(s.description);
var reviewLinkFor = (region) => region === "Lisboa" ? GOOGLE_REVIEW_LINK_LISBOA : GOOGLE_REVIEW_LINK_PORTO;
var TRAVEL_ALLOWANCE = 20;
function sameVisitOffer(s) {
  const items = itemsOfService(s);
  const base = Number(s.billed_value || 0) - TRAVEL_ALLOWANCE;
  if (base <= 0) return null;
  if (!items.includes("Colchão") && base + MATTRESS_TABLE >= PACK_PERK_MIN_ORDER) {
    return `o colchão fica com preço de pack: o de casal, por exemplo, fica por ${formatEuro(perkMattressPrice(MATTRESS_TABLE))} em vez de ${formatEuro(MATTRESS_TABLE)}`;
  }
  const sofa = sofaCleaningPrice("3-lugares");
  if (!items.includes("Sofá") && base + sofa >= PACK_PERK_MIN_ORDER) {
    return `o sofá fica com preço de pack: o de 3 lugares, por exemplo, fica por ${formatEuro(perkSofaPrice("3-lugares", sofa))} em vez de ${formatEuro(sofa)}`;
  }
  return null;
}
var MAINTENANCE = {
  "Sofá": { days: 270, advice: "Recomendamos uma limpeza profissional do sofá a cada 6 a 12 meses, conforme o uso." },
  "Colchão": { days: 365, advice: "Para uso doméstico, recomendamos uma limpeza profunda do colchão a cada 12 a 18 meses." },
  "Tapete": { days: 365, advice: "Para uso doméstico, recomendamos uma limpeza profunda do tapete a cada 12 meses." },
  "Alcatifa": { days: 365, advice: "Para uso doméstico, recomendamos uma limpeza profunda a cada 12 meses." },
  "Cadeiras": { days: 365, advice: "" },
  "Cabeceira": { days: 365, advice: "" },
  "Essencial": { days: 540, advice: "A proteção Essencial dura 1 a 2 anos, conforme o uso, por isso é uma boa altura para a reforçar." }
};
function monthsPhrase(days) {
  const months = Math.round(days / 30.4);
  if (months >= 11 && months <= 13) return "cerca de um ano";
  if (months > 13 && months < 18) return "mais de um ano";
  if (months >= 18 && months <= 19) return "cerca de um ano e meio";
  return `cerca de ${months} meses`;
}
function maintenanceBases(past, approx) {
  const bases = /* @__PURE__ */ new Map();
  for (const s of past) {
    const essencial = typeOf(s.description) === "Impermeabilização" && /essencial/i.test(s.description);
    for (const item of itemsOfService(s)) {
      const key = essencial && item === "Sofá" ? "Essencial" : item;
      if ((bases.get(key) ?? "") < s.request_date) bases.set(key, s.request_date);
    }
  }
  if (!past.length && approx) for (const item of approx.items) bases.set(item, approx.day);
  return bases;
}
var AUDIENCE_LABEL = {
  clientes: "Clientes (último serviço há mais de 60 dias)",
  parados: "Orçamentos parados há mais de 30 dias",
  nao_interessados: "Não interessados há mais de 90 dias"
};
var ASK_SLOTS = "Quer que lhe enviemos as vagas da sua zona?";
var CAMPAIGNS = [
  {
    id: "ano-novo",
    name: "Depois das festas",
    start: "01-07",
    end: "01-31",
    audiences: ["clientes"],
    idea: "Depois do Natal e da passagem de ano ficam as nódoas das visitas. Só para clientes: são os que já confiam em nós.",
    offer: `Clientes: ${CLIENT_CONDITION}.`,
    message: (m) => `${m.hello}

Depois das festas há sempre uma nódoa ou outra para tratar. Como já é nosso cliente, se quiser voltar a limpar ${m.the} em janeiro, ${CLIENT_CONDITION}.

${ASK_SLOTS}`
  },
  {
    id: "primavera",
    name: "Primavera",
    start: "03-15",
    end: "04-30",
    audiences: ["clientes", "parados", "nao_interessados"],
    idea: "A altura das limpezas grandes da casa. Sem prometer nada sobre alergias: o site não o faz.",
    offer: `Clientes: ${CLIENT_CONDITION}. Os outros: preço de pack no segundo artigo da mesma visita (pedidos a partir de ${PACK_PERK_MIN_ORDER}€, como no site).`,
    message: (m) => `${m.hello}

Com a primavera, muitos dos nossos clientes aproveitam para tratar dos estofos e dos tapetes. ${m.isClient ? `Como já é nosso cliente, se quiser voltar a limpar ${m.the}, ${CLIENT_CONDITION}.` : `Se ainda quiser tratar ${m.of}, ${PACK_LINE}.`}

${ASK_SLOTS}`
  },
  {
    id: "verao",
    name: "Antes do verão",
    start: "06-01",
    end: "06-30",
    audiences: ["clientes", "parados"],
    idea: "Antes das férias e das visitas do verão; também quando os alojamentos locais preparam a época.",
    offer: `Clientes: ${CLIENT_CONDITION}. Orçamentos parados: preço de pack no segundo artigo da mesma visita.`,
    message: (m) => `${m.hello}

Antes das férias e das visitas do verão, muitos dos nossos clientes aproveitam para deixar a casa pronta. ${m.isClient ? `Como já é nosso cliente, se quiser voltar a limpar ${m.the}, ${CLIENT_CONDITION}.` : `Se ainda quiser tratar ${m.of}, ${PACK_LINE}.`}

${ASK_SLOTS}`
  },
  {
    id: "regresso",
    name: "Regresso à rotina",
    start: "09-01",
    end: "09-30",
    audiences: ["clientes", "parados"],
    idea: "Depois das férias, com as crianças e os animais de volta a casa o dia todo.",
    offer: `Clientes: ${CLIENT_CONDITION}. Orçamentos parados: preço de pack no segundo artigo da mesma visita.`,
    message: (m) => `${m.hello}

Com o regresso à rotina depois das férias, é uma boa altura para tratar ${m.of}. ${m.isClient ? `Como já é nosso cliente, ${CLIENT_CONDITION}.` : `E ${PACK_LINE}.`}

${ASK_SLOTS}`
  },
  {
    id: "black-friday",
    name: "Black Friday",
    start: "11-20",
    end: "11-30",
    audiences: ["clientes", "parados", "nao_interessados"],
    idea: "A semana em que as pessoas esperam uma condição especial. Serve sobretudo a quem ficou por marcar por causa do preço.",
    offer: "Deslocação por nossa conta para quem marcar nesta semana, mesmo que o serviço fique para dezembro.",
    message: (m) => `${m.hello}

Nesta semana da Black Friday temos uma condição especial: quem marcar até ${m.endPhrase} tem a deslocação por nossa conta, mesmo que a limpeza fique para dezembro.

${m.isClient ? `Se quiser voltar a tratar ${m.of} antes das festas` : `Se ainda quiser tratar ${m.of}`}, diga-nos e enviamos-lhe as vagas da sua zona.`
  },
  {
    id: "natal",
    name: "Antes do Natal",
    start: "12-01",
    end: "12-18",
    audiences: ["clientes", "parados", "nao_interessados"],
    idea: "Antes de receber a família: é quando mais gente quer a casa apresentável.",
    offer: `Clientes: ${CLIENT_CONDITION}. Os outros: preço de pack no segundo artigo da mesma visita (pedidos a partir de ${PACK_PERK_MIN_ORDER}€, como no site).`,
    message: (m) => `${m.hello}

Com o Natal a chegar, estamos a organizar as vagas para antes das festas. ${m.isClient ? `Como já é nosso cliente, se quiser voltar a limpar ${m.the}, ${CLIENT_CONDITION}.` : `Se ainda quiser tratar ${m.of} antes de receber a família, ${PACK_LINE}.`}

${ASK_SLOTS}`
  }
];
function campaignRun(campaign, today) {
  const year = Number(today.slice(0, 4));
  let start = `${year}-${campaign.start}`;
  let end = `${year}-${campaign.end}`;
  if (today > end) {
    start = `${year + 1}-${campaign.start}`;
    end = `${year + 1}-${campaign.end}`;
  }
  return { campaign, id: `${campaign.id}-${start.slice(0, 4)}`, start, end, active: today >= start && today <= end };
}
function campaignCalendar(today, campaigns = CAMPAIGNS) {
  return campaigns.map((c) => campaignRun(c, today)).sort((a, b) => a.start.localeCompare(b.start));
}
function bucket(seed, n) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = h * 31 + seed.charCodeAt(i) >>> 0;
  return h % n;
}
function orderVariants(messages, seed, stats) {
  if (messages.length < 2) return messages;
  const s = (m) => stats?.[m.id] ?? { sent: 0, won: 0 };
  if (messages.every((m) => s(m).sent >= R.minVariantSample)) {
    return [...messages].sort((a, b) => s(b).won / s(b).sent - s(a).won / s(a).sent);
  }
  const first = bucket(seed, messages.length);
  return [...messages.slice(first), ...messages.slice(0, first)];
}
function planStatus(label, past, future) {
  if (future.length) return "marcado";
  if (past.length) return "cliente";
  return label;
}
function sendModeOf(a) {
  if (a.kind === "campanha") return "owner_ok";
  if (a.check) return "owner_ok";
  if (!OFFERS_CONFIRMED && (a.kind === "recomendacao" || a.kind === "manutencao")) return "owner_ok";
  return "auto";
}
function planClient(input, ctx) {
  const c = input.client;
  const today = ctx.today ?? lisbonDay(ctx.now);
  const nowMinutes = ctx.today && ctx.today !== lisbonDay(ctx.now) ? 10 * 60 : lisbonMinutes(ctx.now);
  const greeting = greetingFor(Math.max(nowMinutes, R.quietUntilMinutes));
  const services = input.services.filter((s) => !s.calendar_missing_since).sort((a, b) => a.request_date.localeCompare(b.request_date));
  const past = services.filter((s) => s.request_date <= today);
  const future = services.filter((s) => s.request_date > today);
  const touches = [...input.touches].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const sent = touches.filter((t) => !t.skipped);
  const status = planStatus(c.status, past, future);
  const pref = c.contact_preference ?? "normal";
  const hold = c.on_hold_reason?.trim() || null;
  const name = firstName(c, services);
  const hello = name ? `${greeting}, ${name}! Tudo bem?` : `${greeting}! Tudo bem?`;
  const hi = name ? `${greeting}, ${name}!` : `${greeting}!`;
  const items = contactItems(c, services);
  const words = wordsFor(items);
  const clientLast = c.last_client_message_at;
  const weWroteAt = c.last_contact_at && (!clientLast || c.last_contact_at > clientLast) ? c.last_contact_at : null;
  const ourLast = maxIso(weWroteAt, sent[0]?.created_at);
  const theyWroteLast = !!clientLast && (!ourLast || clientLast >= ourLast);
  const lastPast = past[past.length - 1] ?? null;
  const approx = !lastPast && status === "cliente" && c.last_contact_at ? { day: lisbonDay(c.last_contact_at), items: items.length ? items : ["Sofá"] } : null;
  const lastServiceDate = lastPast?.request_date ?? approx?.day ?? null;
  const daysSinceService = lastServiceDate ? dayDiff(lastServiceDate, today) : null;
  const silentDays = c.last_contact_at ? dayDiff(lisbonDay(c.last_contact_at), today) : null;
  const cands = [];
  const blocked = [];
  if (theyWroteLast && clientLast) {
    const age = dayDiff(lisbonDay(clientLast), today);
    const limit = status === "por_marcar" || status === "sem_estado" ? R.answerLeadDays : R.answerClientDays;
    if (age <= limit) {
      cands.push({
        kind: "responder",
        due: lisbonDay(clientLast),
        priority: 0,
        title: "Responder",
        why: `Escreveu-nos ${whenPhrase(clientLast, today)} e a última mensagem é dele(a). Ler a conversa toda antes de responder.`,
        messages: []
      });
    }
  }
  if (c.follow_up_at) {
    cands.push({
      kind: "lembrete",
      due: c.follow_up_at,
      priority: 1,
      title: "Lembrete combinado",
      why: `Combinado voltar a falar a ${dm(c.follow_up_at)}${c.follow_up_reason ? `: ${c.follow_up_reason}` : "."}`,
      messages: [{
        id: "lembrete-a",
        label: "Voltar a falar",
        text: `${hello}

Combinámos voltar a falar por esta altura sobre ${items.length ? `a limpeza ${words.of}` : "a limpeza"}. Temos disponibilidade [dia 1] às [hora 1] ou [dia 2] às [hora 2]. Como gostaria de avançar?`
      }]
    });
  }
  const nextService = future[0] ?? null;
  if (nextService && dayDiff(today, nextService.request_date) <= 2) {
    const since = addDays(nextService.request_date, -3);
    const done = touches.some((t) => t.kind === "vespera" && lisbonDay(t.created_at) >= since);
    if (!done) {
      cands.push({
        kind: "vespera",
        due: addDays(nextService.request_date, -1),
        until: addDays(nextService.request_date, -1),
        priority: 1,
        title: "Lembrar o serviço de amanhã",
        why: `Serviço ${dayPhrase(nextService.request_date, today)}: ${nextService.description}`,
        messages: [{ id: "vespera-a", label: "Lembrete", text: `${hello}

Só para lembrar: amanhã às [hora] estamos aí para ${jobOf(nextService)}. Até amanhã` }]
      });
    }
  }
  if (nextService) {
    const daysTo = dayDiff(today, nextService.request_date);
    const offer = sameVisitOffer(nextService);
    const offered = touches.some((t) => t.kind === "mesma_visita" && dayDiff(lisbonDay(t.created_at), today) <= 30);
    if (offer && !offered && daysTo >= R.sameVisitUntilDays && daysTo <= R.sameVisitFromDays + R.soonDays) {
      cands.push({
        kind: "mesma_visita",
        due: addDays(nextService.request_date, -R.sameVisitFromDays),
        until: addDays(nextService.request_date, -R.sameVisitUntilDays),
        priority: 4,
        title: "Aproveitar a mesma visita",
        why: `Serviço ${dayPhrase(nextService.request_date, today)} (${nextService.description}). Um segundo artigo na mesma visita fica com preço de pack e não leva deslocação a mais. Se já ofereceram um extra na conversa e a pessoa disse que não, não enviar.`,
        messages: [{
          id: "mesma-visita-a",
          label: "Segundo artigo",
          text: `${hello}

Para ${dayPhrase(nextService.request_date, today)} está tudo combinado para ${jobOf(nextService)}. Se quiser aproveitar a mesma visita, ${offer}.

Quer que acrescentemos ao serviço?`
        }]
      });
    }
  }
  if (!c.reviewed_google && (lastPast || approx) && status === "cliente") {
    const serviceDay = lastPast?.request_date ?? approx.day;
    const pickup = lastPast ? isRugPickup(lastPast) : false;
    const start = pickup ? addDays(serviceDay, R.rugPickupDelayDays) : serviceDay;
    const until = addDays(start, R.reviewWindowDays);
    const asks = touches.filter((t) => (t.kind === "avaliacao" || t.kind === "avaliacao_lembrete") && lisbonDay(t.created_at) >= serviceDay);
    const link = reviewLinkFor(lastPast?.locality ?? c.region);
    const done = wordsFor(lastPast ? itemsOfService(lastPast) : items);
    const job = lastPast ? jobOf(lastPast) : `a limpeza ${done.of}`;
    if (!asks.length) {
      if (today <= until) {
        cands.push({
          kind: "avaliacao",
          due: start,
          until,
          priority: 2,
          title: "Pedir avaliação",
          why: `Serviço a ${dm(serviceDay)}${lastPast ? ` (${lastPast.description})` : " (data aproximada: sem serviço no CRM com este telefone)"}. Ainda não avaliou.`,
          check: pickup ? "Tapete com recolha: confirmar primeiro no grupo da equipa que já foi entregue." : void 0,
          messages: orderVariants([
            {
              id: "avaliacao-a",
              label: "Versão A (bot 7.4)",
              text: `${hello}

Esperamos que ${done.the} ${done.plural ? "tenham" : "tenha"} ficado como queria. Se precisar de alguma coisa, estamos por aqui.

Se gostou do resultado, uma avaliação no Google ajuda-nos muito: ${link}`
            },
            {
              id: "avaliacao-b",
              label: "Versão B (05/10)",
              text: `${hello}

Esperamos que tenha gostado do resultado ${job.replace(/^a /, "da ")}. Se precisar de alguma coisa, estamos por aqui.

Se ficou contente com o trabalho, uma avaliação no Google ajuda-nos muito e demora menos de um minuto:
${link}

Muito obrigado pela confiança!`
            }
          ], `${c.id}:avaliacao`, ctx.variantStats)
        });
      }
    } else {
      const first = asks[asks.length - 1];
      const reminded = asks.some((t) => t.kind === "avaliacao_lembrete");
      const askedDay = lisbonDay(first.created_at);
      const remUntil = addDays(askedDay, R.reviewReminderUntilDays);
      if (!first.skipped && !reminded && today <= remUntil) {
        cands.push({
          kind: "avaliacao_lembrete",
          due: addDays(askedDay, R.reviewReminderAfterDays),
          until: remUntil,
          priority: 3,
          title: "Lembrar a avaliação (só uma vez)",
          why: `Pedimos a avaliação a ${dm(askedDay)} e ainda não a deixou. Se já disse que ia avaliar, não insistir.`,
          messages: [{ id: "avaliacao-lembrete-a", label: "Lembrete", text: `${hi} Desculpe voltar a incomodar. Se tiver um minuto, a sua avaliação ajuda-nos muito: ${link}

Muito obrigado!` }]
        });
      }
    }
  }
  const loyal = past.length >= 2;
  if ((c.reviewed_google || loyal) && lastServiceDate && status === "cliente" && daysSinceService !== null) {
    const asked = touches.some((t) => t.kind === "recomendacao" && dayDiff(lisbonDay(t.created_at), today) < R.referralEveryDays);
    if (!asked && daysSinceService >= R.referralFromDays && daysSinceService <= R.referralUntilDays) {
      const thanks = c.reviewed_google ? "Muito obrigado pela sua avaliação, ajuda-nos imenso." : "Muito obrigado por continuar a confiar em nós.";
      const ask = "Se conhecer alguém que precise de limpar um sofá, um colchão ou um tapete, pode passar-lhe o nosso contacto.";
      cands.push({
        kind: "recomendacao",
        due: addDays(lastServiceDate, R.referralFromDays),
        until: addDays(lastServiceDate, R.referralUntilDays),
        priority: 4,
        title: "Pedir recomendação",
        why: c.reviewed_google ? "Deixou avaliação no Google: é quem mais facilmente recomenda." : `Já fez ${past.length} serviços connosco.`,
        messages: orderVariants([
          { id: "recomendacao-a", label: "Versão A (com condição)", text: `${hello}

${thanks} ${ask} ${REFERRAL_CONDITION}

Obrigado!` },
          { id: "recomendacao-b", label: "Versão B (sem condição)", text: `${hello}

${thanks} ${ask} Vamos tratá-la com o mesmo cuidado com que o tratámos a si.

Obrigado!` }
        ], `${c.id}:recomendacao`, ctx.variantStats)
      });
    }
  }
  let maintenanceDue = false;
  if (status === "cliente") {
    const bases = maintenanceBases(past, approx);
    let best = null;
    for (const [key, base] of bases) {
      const due = addDays(base, MAINTENANCE[key].days);
      if (!best || due < best.due) best = { key, base, due };
    }
    if (best && today >= addDays(best.due, -R.soonDays) && today <= addDays(best.due, R.maintenanceValidDays)) {
      const base = best.base;
      const done = touches.some((t) => t.kind === "manutencao" && lisbonDay(t.created_at) > base);
      maintenanceDue = today >= best.due && !done;
      if (!done) {
        const key = best.key;
        const what = key === "Essencial" ? "protegemos o seu sofá" : `limpámos ${WORDS[key].your}`;
        const advice = MAINTENANCE[key].advice;
        const opening = `${hello}

Já passaram ${monthsPhrase(dayDiff(base, today))} desde que ${what}.${advice ? ` ${advice}` : ""}`;
        cands.push({
          kind: "manutencao",
          due: best.due,
          until: addDays(best.due, R.maintenanceValidDays),
          priority: 4,
          title: "Voltar a limpar",
          why: `Último serviço de ${key === "Essencial" ? "impermeabilização Essencial" : key.toLowerCase()} a ${dm(base)}${approx ? " (data aproximada pelo último contacto)" : ""}.`,
          messages: orderVariants([
            { id: "manutencao-a", label: "Versão A (com condição de cliente)", text: `${opening}

Como já é nosso cliente, ${CLIENT_CONDITION}. ${ASK_SLOTS}` },
            { id: "manutencao-b", label: "Versão B (sem condição)", text: `${opening}

${ASK_SLOTS}` }
          ], `${c.id}:manutencao`, ctx.variantStats)
        });
      }
    }
  }
  const isLead = status === "por_marcar" || status === "sem_estado";
  if (isLead && !theyWroteLast && ourLast && !c.follow_up_at) {
    const since = clientLast ?? c.first_contact_at ?? ourLast;
    const followUps = sent.filter((t) => t.kind === "seguimento" && t.created_at > since);
    const silent = dayDiff(lisbonDay(since), today);
    if (followUps.length >= R.maxFollowUps) {
      if (silent <= 14) blocked.push({ kind: "seguimento", title: "Seguimento", reason: `Já levou ${followUps.length} seguimentos sem resposta: parar.` });
    } else if (silent > R.followUpWindowDays) {
      if (silent <= 14) blocked.push({ kind: "seguimento", title: "Seguimento", reason: `Sem resposta há ${silent} dias: depois de 3 dias o seguimento já não resulta. Só numa data combinada ou numa campanha.` });
    } else {
      const n = followUps.length;
      const base = n === 0 ? ourLast : followUps[0].created_at;
      const hours = n === 0 ? R.firstFollowUpHours : R.secondFollowUpHours;
      const win = sendWindow(new Date(Date.parse(base) + hours * 36e5));
      const lead = name ? `${name}, ainda` : "Ainda";
      const item = items[0] ? WORDS[items[0]] : null;
      cands.push({
        kind: "seguimento",
        due: win.day,
        notBefore: win.notBefore,
        priority: n === 0 ? 1 : 2,
        title: n === 0 ? "1.º seguimento (mesmo dia)" : "2.º e último seguimento",
        why: n === 0 ? `A última mensagem foi nossa, ${whenPhrase(ourLast, today)}, sem resposta. Antes de enviar, confirmar na conversa que ainda não levou seguimentos: com dois, parar.` : `1.º seguimento ${whenPhrase(followUps[0].created_at, today)}, sem resposta. Este é o último.`,
        messages: n === 0 ? [
          { id: "seguimento-preco", label: "Já tem preço", text: `${lead} temos [dia 1] às [hora 1] ou [dia 2] às [hora 2] para ${words.your}. Como gostaria de avançar?` },
          {
            id: "seguimento-foto",
            label: "Falta a fotografia",
            text: `Só para dar seguimento${name ? `, ${name}` : ""}. Conseguiu tirar a fotografia ${words.of}? Se for mais fácil, diga-nos só ${item ? item.data : "o que precisa de limpar"} e enviamos-lhe já o orçamento.`
          }
        ] : [{ id: "seguimento-ultimo", label: "Último", text: `${hello} Só para não perder a vaga: podemos marcar para [dia] às [hora]? Se preferir outro dia, é só dizer.` }]
      });
    }
  }
  const audience = status === "cliente" ? daysSinceService !== null && daysSinceService >= R.clientCampaignDays ? "clientes" : null : isLead ? silentDays !== null && silentDays >= R.stalledCampaignDays ? "parados" : null : status === "nao_interessado" ? silentDays !== null && silentDays >= R.afterNoDays ? "nao_interessados" : null : null;
  for (const run of campaignCalendar(today, ctx.campaigns ?? CAMPAIGNS)) {
    if (!run.active) continue;
    if (touches.some((t) => t.kind === "campanha" && t.campaign === run.id)) continue;
    if (!audience || !run.campaign.audiences.includes(audience)) {
      if (status === "nao_interessado" && run.campaign.audiences.includes("nao_interessados")) {
        blocked.push({ kind: "campanha", campaignId: run.id, title: run.campaign.name, reason: `Disse que não há ${silentDays ?? "?"} dias: esperar ${R.afterNoDays}.` });
      } else if (status === "cliente" && run.campaign.audiences.includes("clientes")) {
        blocked.push({ kind: "campanha", campaignId: run.id, title: run.campaign.name, reason: `Serviço há ${daysSinceService ?? "?"} dias: as campanhas são para quem não faz serviço há mais de ${R.clientCampaignDays}.` });
      } else if (isLead && run.campaign.audiences.includes("parados")) {
        blocked.push({ kind: "campanha", campaignId: run.id, title: run.campaign.name, reason: `Último contacto há ${silentDays ?? "?"} dias: a campanha é para orçamentos parados há mais de ${R.stalledCampaignDays}.` });
      }
      continue;
    }
    cands.push({
      kind: "campanha",
      campaignId: run.id,
      due: run.start,
      until: run.end,
      priority: 5,
      title: run.campaign.name,
      why: `${AUDIENCE_LABEL[audience]}. ${run.campaign.idea}`,
      messages: [{
        id: `campanha-${run.campaign.id}`,
        label: run.campaign.name,
        text: run.campaign.message({ hello, the: words.the, of: words.of, isClient: audience === "clientes", endPhrase: dayPhrase(run.end, today) })
      }]
    });
    break;
  }
  const hasAnswer = cands.some((a) => a.kind === "responder");
  const lastMarketing = sent.find((t) => MARKETING_KINDS.includes(t.kind));
  const marketingGap = lastMarketing ? dayDiff(lisbonDay(lastMarketing.created_at), today) : null;
  const ourSilence = !theyWroteLast && ourLast ? dayDiff(lisbonDay(ourLast), today) : null;
  const reasonFor = (a) => {
    const marketing = MARKETING_KINDS.includes(a.kind);
    if (pref === "nao_contactar" && a.kind !== "responder") {
      return `Pediu para não receber mensagens${c.contact_note ? ` (${c.contact_note})` : ""}. Só responder se escrever.`;
    }
    if (pref === "sem_promocoes" && marketing) return "Não quer promoções: só mensagens do próprio serviço.";
    if (hold && !["responder", "vespera", "lembrete"].includes(a.kind)) return `Em pausa: ${hold}`;
    if (hasAnswer && a.kind !== "responder" && a.kind !== "vespera") return "Primeiro responder: escreveu-nos por último.";
    if (nextService && ["recomendacao", "manutencao", "campanha"].includes(a.kind)) {
      return `Já tem serviço marcado ${dayPhrase(nextService.request_date, today)}.`;
    }
    if (c.follow_up_at && c.follow_up_at > today && marketing) return `Combinado voltar a falar a ${dm(c.follow_up_at)}: esperar por essa data.`;
    if (status === "nao_interessado" && marketing && silentDays !== null && silentDays < R.afterNoDays) {
      return `Disse que não há ${silentDays} dias: esperar ${R.afterNoDays}.`;
    }
    if (marketing && marketingGap !== null && marketingGap < R.marketingEveryDays) {
      return `Já recebeu uma mensagem comercial a ${dm(lisbonDay(lastMarketing.created_at))}: uma de cada vez, com ${R.marketingEveryDays} dias de intervalo.`;
    }
    if (marketing && a.kind !== "mesma_visita" && ourSilence !== null && ourSilence < R.quietDaysAfterOurMessage) {
      return `A última mensagem foi nossa há ${ourSilence} dia${ourSilence === 1 ? "" : "s"} e ficou sem resposta: esperar ${R.quietDaysAfterOurMessage} dias.`;
    }
    return null;
  };
  const allowed = [];
  for (const a of cands) {
    const reason = reasonFor(a);
    if (reason) {
      if (a.due <= today) blocked.push({ kind: a.kind, title: a.title, reason, campaignId: a.campaignId });
    } else {
      allowed.push({ ...a, send: sendModeOf(a) });
    }
  }
  allowed.sort((a, b) => a.priority - b.priority || a.due.localeCompare(b.due));
  const final = [];
  let marketingTaken = null;
  for (const a of allowed) {
    if (MARKETING_KINDS.includes(a.kind) && a.due <= today) {
      if (marketingTaken) {
        blocked.push({ kind: a.kind, title: a.title, reason: `Uma mensagem comercial de cada vez: primeiro "${marketingTaken.title}".`, campaignId: a.campaignId });
        continue;
      }
      marketingTaken = a;
    }
    final.push(a);
  }
  const soonLimit = addDays(today, R.soonDays);
  const stage = pref === "nao_contactar" ? "nao_contactar" : hold ? "em_pausa" : status === "marcado" ? "marcado" : hasAnswer && (isLead || status === "nao_interessado") ? "conversa" : status === "cliente" ? maintenanceDue ? "manutencao" : daysSinceService !== null && daysSinceService <= 60 ? "cliente_recente" : "cliente" : status === "nao_interessado" ? "perdido" : silentDays !== null && silentDays <= R.followUpWindowDays ? "orcamento_aberto" : "orcamento_parado";
  return {
    stage,
    loyal,
    promoter: c.reviewed_google,
    today: final.filter((a) => a.due <= today && (!a.until || a.until >= today)),
    soon: final.filter((a) => a.due > today && a.due <= soonLimit),
    blocked,
    lastServiceDate,
    approxServiceDate: !lastPast && !!approx,
    nextServiceDate: nextService?.request_date ?? null,
    servicesDone: past.length
  };
}
function snapshotAt(clients) {
  return maxIso(...clients.map((c) => c.last_contact_at));
}
function variantStats(rows, now) {
  const stats = {};
  const settled = new Date(now.getTime() - 3 * 864e5).toISOString();
  for (const { client, services, touches } of rows) {
    for (const t of touches) {
      if (t.skipped || !t.template || t.created_at > settled) continue;
      const s = stats[t.template] ??= { sent: 0, won: 0 };
      s.sent++;
      if (touchWon(t, client, services)) s.won++;
    }
  }
  return stats;
}
function touchWon(t, client, services) {
  if (t.kind === "avaliacao" || t.kind === "avaliacao_lembrete") return client.reviewed_google;
  if (t.kind === "recomendacao") return !!client.last_client_message_at && client.last_client_message_at > t.created_at;
  return bookedAfter(t, services).length > 0;
}
function bookedAfter(t, services) {
  const limit = new Date(Date.parse(t.created_at) + 30 * 864e5).toISOString();
  return services.filter((s) => {
    if (s.calendar_missing_since) return false;
    const closed = s.booked_at ?? `${s.request_date}T12:00:00Z`;
    return closed > t.created_at && closed <= limit;
  });
}
function planAll(data, ctx) {
  const byPhone = servicesByPhone(data.services);
  const byClient = /* @__PURE__ */ new Map();
  for (const t of data.touches) byClient.set(t.client_id, [...byClient.get(t.client_id) ?? [], t]);
  const rows = data.clients.map((client) => ({
    client,
    services: byPhone.get(phoneKey(client.phone)) ?? [],
    touches: byClient.get(client.id) ?? []
  }));
  const stats = ctx.variantStats ?? variantStats(rows, ctx.now);
  return rows.map((r) => ({ ...r, plan: planClient(r, { ...ctx, variantStats: stats }) }));
}
var CROSS_SELL_ITEMS = ["Sofá", "Colchão", "Cadeiras", "Tapete", "Impermeabilização"];
function boughtItems(c, services) {
  const set = /* @__PURE__ */ new Set();
  for (const s of services) {
    if (s.calendar_missing_since) continue;
    for (const i of itemsOfService(s)) if (CROSS_SELL_ITEMS.includes(i)) set.add(i);
    if (typeOf(s.description) === "Impermeabilização") set.add("Impermeabilização");
  }
  for (const label of c.services) {
    const item = label === "Cadeira" ? "Cadeiras" : label === "Recolha" ? "Tapete" : label;
    if (CROSS_SELL_ITEMS.includes(item)) set.add(item);
  }
  return set;
}
function botGuidance(p, today) {
  const { client: c, plan } = p;
  const g = [];
  switch (plan.stage) {
    case "nao_contactar":
      g.push(`Pediu para não receber mensagens${c.contact_note ? ` (${c.contact_note})` : ""}. Responde só ao que perguntar, sem seguimentos nem promoções.`);
      break;
    case "em_pausa":
      g.push(`Tem um problema em aberto (${c.on_hold_reason}). Passa a conversa ao responsável antes de qualquer outra coisa.`);
      break;
    case "marcado":
      g.push(`Tem serviço marcado ${plan.nextServiceDate ? dayPhrase(plan.nextServiceDate, today) : ""}. Se quiser juntar um artigo, usa o preço de pack da mesma visita.`.replace(" .", "."));
      break;
    case "perdido":
      g.push("Disse que não noutra altura. Segue o funil normal e nunca menciones essa recusa.");
      break;
    case "orcamento_parado":
      g.push("Já pediu orçamento antes e não marcou. Retoma onde ficou, sem repetir o que já foi enviado, e pergunta o que ficou por decidir.");
      break;
    case "cliente":
    case "cliente_recente":
    case "manutencao":
      g.push(`Já é cliente${plan.servicesDone ? ` (${plan.servicesDone} serviço${plan.servicesDone === 1 ? "" : "s"})` : ""}. Trata-o como tal, sem explicar tudo do zero. Se pedir uma condição, a de cliente é: ${CLIENT_CONDITION}${OFFERS_CONFIRMED ? "" : " (ainda é proposta: confirma com o responsável)"}.`);
      break;
    default:
      break;
  }
  if (plan.loyal) g.push("Cliente fiel: dá-lhe as primeiras vagas.");
  if (plan.promoter) g.push("Deixou avaliação no Google.");
  if (c.from_google_ads) g.push("Veio do anúncio Google.");
  if (c.referred_by) g.push(`Veio por recomendação de ${c.referred_by}.`);
  if (plan.stage === "cliente" || plan.stage === "cliente_recente" || plan.stage === "manutencao") {
    const bought = boughtItems(c, p.services);
    const missing = CROSS_SELL_ITEMS.filter((i) => !bought.has(i) && i !== "Tapete");
    if (bought.size && missing.length) g.push(`Ainda não fez connosco: ${joinPt(missing.map((m) => m.toLowerCase()))}. Se fizer sentido, oferece UM extra depois do preço.`);
  }
  return g;
}
function waLink(phone, text) {
  const digits = phone.replace(/\D/g, "").replace(/^00/, "");
  return text ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}` : `https://wa.me/${digits}`;
}

// src/lib/followUpDigest.ts
var DIGEST_SECTIONS = [
  { title: "Responder primeiro", kinds: ["responder"], tip: "Escreveram por último e ninguém respondeu. Ler a conversa toda antes." },
  { title: "Fechar orçamentos", kinds: ["seguimento"], tip: "Dois seguimentos no máximo e parar. As horas saem do calendário, em hora de Portugal." },
  { title: "Combinado para hoje", kinds: ["lembrete"], tip: "A pessoa pediu para voltarmos a falar por esta altura." },
  { title: "Serviços marcados", kinds: ["vespera", "mesma_visita"], tip: "Lembrar na véspera; um segundo artigo na mesma visita fica com preço de pack." },
  { title: "Depois do serviço", kinds: ["avaliacao", "avaliacao_lembrete"], tip: "Avaliação com o link da ficha certa (Lisboa ou Porto). Um só lembrete." },
  { title: "Clientes que já confiam em nós", kinds: ["recomendacao", "manutencao"], tip: "Recomendações e manutenção: os clientes mais baratos de conseguir." }
];
var esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
var WEEKDAY_DATE = new Intl.DateTimeFormat("pt-PT", { timeZone: "Europe/Lisbon", weekday: "long", day: "numeric", month: "long" });
var STAMP = new Intl.DateTimeFormat("pt-PT", { timeZone: "Europe/Lisbon", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
function digestItems(planned) {
  return DIGEST_SECTIONS.map((section) => ({
    title: section.title,
    tip: section.tip,
    items: planned.flatMap((p) => p.plan.today.filter((a) => section.kinds.includes(a.kind)).map((action) => ({
      name: displayName(p.client, p.services),
      phone: p.client.phone,
      region: p.client.region,
      action
    }))).sort((a, b) => a.action.priority - b.action.priority || a.action.due.localeCompare(b.action.due))
  })).filter((s) => s.items.length > 0);
}
function buildDigest(planned, opts) {
  const today = lisbonDay(opts.now);
  const sections = digestItems(planned);
  const people = new Set(sections.flatMap((s) => s.items.map((i) => i.phone)));
  const campaigns = campaignCalendar(today).filter((r) => r.active).map((r) => ({
    name: r.campaign.name,
    end: r.end,
    eligible: planned.filter((p) => p.plan.today.some((a) => a.kind === "campanha" && a.campaignId === r.id)).length
  })).filter((c) => c.eligible > 0);
  const answer = sections.find((s) => s.title === "Responder primeiro")?.items.length ?? 0;
  const count = people.size;
  const subject = count ? `Kyro · ${count} ${count === 1 ? "pessoa" : "pessoas"} para seguir hoje${answer ? ` (${answer} por responder)` : ""}` : "Kyro · nada para seguir hoje";
  const dateLine = WEEKDAY_DATE.format(opts.now);
  const snapshotLine = opts.snapshot ? `As conversas do WhatsApp são da leitura de ${STAMP.format(new Date(opts.snapshot))}: o que aconteceu depois disso pode ainda não estar aqui.` : "Ainda não há leitura do WhatsApp nas fichas.";
  const quiet = isQuietTime(opts.now);
  const itemHtml = (i) => {
    const a = i.action;
    const msg = a.messages[0];
    const link = waLink(i.phone, msg?.text);
    const meta = [i.region, formatPhone(i.phone)].filter(Boolean).join(" · ");
    return `<div style="border:1px solid #e5e7eb;border-radius:10px;padding:12px 14px;margin:0 0 10px">
<p style="margin:0;font-size:15px;font-weight:600;color:#0B2F2A">${esc(i.name)} <span style="font-weight:400;color:#6b7280;font-size:13px">· ${esc(meta)}</span></p>
<p style="margin:4px 0 0;font-size:13px;color:#1f2937"><strong>${esc(a.title)}${a.notBefore && a.due === today ? ` (a partir das ${esc(a.notBefore)})` : ""}.</strong> ${esc(a.why)}</p>
${a.check ? `<p style="margin:4px 0 0;font-size:13px;color:#92400e"><strong>Antes de enviar:</strong> ${esc(a.check)}</p>` : ""}
${msg ? `<div style="white-space:pre-wrap;background:#f9fafb;border-radius:8px;padding:10px;margin:8px 0;font-size:13px;color:#111827">${esc(msg.text)}</div>` : ""}
<a href="${esc(link)}" style="display:inline-block;background:#0B2F2A;color:#ffffff;text-decoration:none;padding:8px 14px;border-radius:8px;font-size:13px;font-weight:600">${msg ? "Abrir no WhatsApp com a mensagem" : "Abrir a conversa"}</a>
</div>`;
  };
  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;max-width:640px;margin:0 auto;padding:8px;color:#0B2F2A">
<div style="border-top:3px solid #D4AF37;padding-top:12px">
<h1 style="font-size:20px;margin:0">Seguimentos de hoje</h1>
<p style="margin:2px 0 14px;color:#6b7280;font-size:13px">${esc(dateLine)} · ${count} ${count === 1 ? "pessoa" : "pessoas"}</p>
${quiet ? '<p style="font-size:13px;background:#fef3c7;color:#92400e;padding:8px 10px;border-radius:8px">Agora é de noite: nenhuma mensagem sai antes das 9h30.</p>' : ""}
${sections.map((s) => `<h2 style="font-size:15px;margin:22px 0 2px">${esc(s.title)} (${s.items.length})</h2>
<p style="font-size:12px;color:#6b7280;margin:0 0 8px">${esc(s.tip)}</p>
${s.items.map(itemHtml).join("\n")}`).join("\n")}
${campaigns.length ? `<h2 style="font-size:15px;margin:22px 0 2px">Campanhas a decorrer</h2>
${campaigns.map((c) => `<p style="font-size:13px;margin:4px 0">${esc(c.name)}: ${c.eligible} contactos elegíveis, até ${c.end.slice(8, 10)}/${c.end.slice(5, 7)}. A lista e o texto estão no painel (Clientes, vista Campanhas): vão em lote, só com o teu OK.</p>`).join("\n")}` : ""}
<p style="font-size:12px;color:#6b7280;margin:24px 0 4px">${esc(snapshotLine)} O botão abre a conversa com a mensagem escrita: nada é enviado sem carregares em enviar. Depois de enviar, marca "Enviei" no painel para o seguimento seguinte sair na altura certa.</p>
<p style="font-size:12px;margin:0"><a href="${esc(opts.panelUrl)}" style="color:#8B6914">Abrir o painel</a></p>
</div></div>`;
  const text = [
    `Seguimentos de hoje: ${dateLine} (${count} ${count === 1 ? "pessoa" : "pessoas"})`,
    quiet ? "Agora é de noite: nenhuma mensagem sai antes das 9h30." : "",
    ...sections.flatMap((s) => [
      "",
      `${s.title.toUpperCase()} (${s.items.length})`,
      ...s.items.flatMap((i) => [
        `- ${i.name} (${[i.region, formatPhone(i.phone)].filter(Boolean).join(", ")}): ${i.action.title}. ${i.action.why}`,
        i.action.check ? `  Antes de enviar: ${i.action.check}` : "",
        `  ${waLink(i.phone, i.action.messages[0]?.text)}`
      ].filter(Boolean))
    ]),
    ...campaigns.length ? ["", "CAMPANHAS", ...campaigns.map((c) => `- ${c.name}: ${c.eligible} elegíveis (lista no painel)`)] : [],
    "",
    snapshotLine,
    `Painel: ${opts.panelUrl}`
  ].filter((l, i, all) => l !== "" || all[i - 1] !== "").join("\n");
  return { subject, html, text, count, sections, campaigns };
}
export {
  ACTION_KINDS,
  CONTACT_PREFERENCES,
  OFFERS_CONFIRMED,
  STAGE_INFO,
  botGuidance,
  buildDigest,
  campaignCalendar,
  factsFromLabels,
  firstName,
  isQuietTime,
  lisbonDay,
  normalizePhone,
  phoneKey,
  planAll,
  snapshotAt,
  waLink
};
