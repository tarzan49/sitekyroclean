// Mensagem pré-preenchida no botão "Responder no WhatsApp" do email do pedido.
// Recorda tudo o que a pessoa pediu (não só o primeiro artigo: um pedido com
// upsell traz `service` como lista, "Sofá, 2x Colchão Casal, 4 Cadeiras
// (Impermeabilização Premium)") e pede fotografias desses artigos. Nada de
// horários nem de morada (dono, 2026-10-03): isso combina-se depois de ver as
// fotografias. A mensagem abre editável na caixa do WhatsApp, não é enviada
// sozinha.

type Treatment = "limpeza" | "impermeabilização";

interface Noun { singular: string; plural: string; feminine: boolean }

const NOUNS: { match: RegExp; noun: Noun }[] = [
  { match: /sof[aá]/i, noun: { singular: "sofá", plural: "sofás", feminine: false } },
  { match: /colch[aã]o|colch[oõ]es/i, noun: { singular: "colchão", plural: "colchões", feminine: false } },
  { match: /cadeira/i, noun: { singular: "cadeiras", plural: "cadeiras", feminine: true } },
  { match: /alcatifa/i, noun: { singular: "alcatifa", plural: "alcatifas", feminine: true } },
  { match: /tapete/i, noun: { singular: "tapete", plural: "tapetes", feminine: false } },
];

interface Item { noun: Noun; plural: boolean; treatment: Treatment }

function parseItem(part: string, treatment: Treatment): Item | null {
  const found = NOUNS.find(n => n.match.test(part));
  if (!found) return null;
  const qty = parseInt(part.trim(), 10);
  return { noun: found.noun, plural: Number.isFinite(qty) && qty > 1, treatment };
}

/** Artigos do pedido, pela ordem em que aparecem, sem repetições. */
export function leadItems(service: string, serviceType: string): Item[] {
  const parts = service.split(",").map(p => p.trim()).filter(Boolean);
  const items: Item[] = [];
  parts.forEach((part, index) => {
    // O primeiro é o serviço principal, cujo tratamento vem em `service_type`;
    // os outros são os artigos do upsell, que o trazem no próprio rótulo.
    const source = index === 0 ? serviceType : part;
    const item = parseItem(part, /impermeabiliza/i.test(source) ? "impermeabilização" : "limpeza");
    if (!item) return;
    const same = items.find(i => i.noun === item.noun && i.treatment === item.treatment);
    if (same) same.plural = true;
    else items.push(item);
  });
  return items;
}

function joinPt(words: string[]): string {
  return words.length <= 1 ? (words[0] ?? "") : `${words.slice(0, -1).join(", ")} e ${words[words.length - 1]}`;
}

const nounText = (i: Item) => (i.plural ? i.noun.plural : i.noun.singular);
const isPluralNoun = (i: Item) => i.plural || i.noun.singular === i.noun.plural;
const withArticle = (i: Item) =>
  `${i.noun.feminine ? "da" : "do"}${isPluralNoun(i) ? "s" : ""} ${nounText(i)}`;

/** "limpeza de sofá e colchão, e impermeabilização de cadeiras" */
export function servicePhrase(items: Item[]): string {
  const groups: { treatment: Treatment; nouns: string[] }[] = [];
  for (const item of items) {
    const group = groups.find(g => g.treatment === item.treatment);
    if (group) group.nouns.push(nounText(item));
    else groups.push({ treatment: item.treatment, nouns: [nounText(item)] });
  }
  const texts = groups.map(g => `${g.treatment} de ${joinPt(g.nouns)}`);
  if (texts.length === 2 && groups[0].nouns.length > 1) return `${texts[0]}, e ${texts[1]}`;
  return joinPt(texts);
}

export function photoQuestion(items: Item[]): string {
  return `Tem fotografias ${joinPt(items.map(withArticle))}?`;
}

function firstName(fullName: string): string {
  const first = fullName.trim().split(/\s+/)[0] ?? "";
  return first ? first.charAt(0).toUpperCase() + first.slice(1) : fullName;
}

// Quase todas as localidades servidas levam "em" (em Oeiras, em Lisboa), mas
// um punhado leva artigo contraído e "em Porto" soa logo a mensagem automática.
// Lista curta e explícita das exceções que existem em `locationPrices`; tudo o
// resto, incluindo moradas escritas à mão no campo "outra", cai em "em".
const LOCATION_PREPOSITION: Record<string, string> = {
  "Porto": "no", "Barreiro": "no", "Seixal": "no", "Montijo": "no",
  "Amadora": "na", "Maia": "na", "Moita": "na", "Trofa": "na",
  "Póvoa de Varzim": "na", "Póvoa de Lanhoso": "na",
};

/**
 * O que a pessoa escolheu, artigo a artigo, a partir de `details` (uma linha
 * por artigo, "1x Sofá 3 Lugares + Impermeab. Premium: 189€"). Sem preços: o
 * valor confirma-se depois das fotografias. Antes a mensagem só dizia "para
 * limpeza de sofá e tapete" e a pessoa ficava sem saber se tínhamos lido as
 * medidas (dono, 2026-10-10).
 */
export function detailLines(details: string | undefined): string[] {
  return (details ?? "").split("\n").map(l => l.trim()).filter(Boolean)
    .filter(l => !/^\d+x (Deslocação|Recolha(, entrega| e entrega))/.test(l))
    .map(l => {
      const m = /^(\d+)x (.*?)(?::\s*(?:\d[\d.,]*\s?€|Sob orçamento))?$/i.exec(l);
      if (!m) return l;
      const qty = Number(m[1]);
      const label = m[2]
        .replace(/^(Tapete|Alcatifa) \d+: /, "$1 de ")
        .replace(/ \(Limpeza\)$/, "")
        .replace(/ \(Pack: Limpeza \+ Desbacterização e Anti Ácaros\)$/, " com anti-ácaros")
        .replace(/ \(Desbacterização e Anti Ácaros\)$/, ", anti-ácaros")
        .replace(/Impermeab\. /g, "impermeabilização ")
        .replace(/ \+ /g, " + ");
      return `${qty > 1 ? `${qty} × ` : ""}${label}`;
    });
}

const pickupOf = (details: string | undefined) => /Recolha(?:, entrega e deslocação| e entrega)/.test(details ?? "");

export function buildWhatsAppMessage(lead: Record<string, string>): string {
  const items = leadItems(lead.service ?? "", lead.service_type ?? "");
  const service = items.length ? ` para ${servicePhrase(items)}` : "";
  const loc = lead.location
    ? ` ${LOCATION_PREPOSITION[lead.location] ?? "em"} ${lead.location}`
    : "";
  // Primeira pessoa do plural: quem presta o serviço é a equipa. O nome do
  // António fica só na apresentação, para a pessoa saber com quem fala.
  const lines = detailLines(lead.details);
  if (lines.length) {
    return [
      `Olá ${firstName(lead.name)}, tudo bem?`,
      `Aqui é o António, da Kyro Clean Solutions. Recebemos o seu pedido de orçamento${loc}:`,
      [...lines.map(l => `• ${l}`), ...(pickupOf(lead.details) ? ["• Com recolha e entrega"] : [])].join("\n"),
      ...(items.length ? [photoQuestion(items)] : []),
    ].join("\n\n");
  }
  return [
    `Olá ${firstName(lead.name)}, tudo bem?`,
    `Aqui é o António, da Kyro Clean Solutions. Recebemos o seu pedido de orçamento${service}${loc}.`,
    ...(items.length ? [photoQuestion(items)] : []),
  ].join("\n\n");
}
