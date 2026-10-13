// Taxa de fecho por serviço na aba Serviços do CRM (dono, 2026-10-13: "a taxa
// de fecho, que é o cálculo dos fechos sobre orçamentos recebidos em qualquer
// canal").
//
// Orçamento = uma pessoa que pediu preço, no mês do seu primeiro pedido, venha
// do questionário do site (tabela `leads`) ou do WhatsApp (fichas `clients`,
// mês do primeiro contacto). Quem fez o questionário e depois escreveu no
// WhatsApp conta uma vez, pelo questionário (as mesmas chaves que a aba
// Questionário usa). Fechou com as regras dessas duas abas: serviço no CRM a
// partir do pedido (questionário), ou etiqueta cliente/marcado ou serviço no
// CRM a partir do primeiro contacto (WhatsApp).
//
// O serviço sai, no questionário, do texto do pedido (as mesmas regras da
// descrição do CRM, `servicesOf`) e, no WhatsApp, das etiquetas: Sofá,
// Colchão, Tapete, Cadeira, mais Impermeabilização, que torna o sofá e as
// cadeiras em "Impermeabilização de …" (tapetes e colchões não se
// impermeabilizam no site: "Tapete + Impermeabilização" é limpeza de tapete e
// impermeabilização de sofá). Impermeabilização sem sofá nem cadeiras conta
// como sofá (é quase sempre sofá) e Recolha como tapete. Uma pessoa conta em cada serviço
// que pediu. Sem etiqueta de serviço entra só na taxa do mês.
import { phoneKey } from "./clientRecords";
import { addDays, lisbonDay } from "./crmClosings";
import type { QuizSummary } from "./crmQuizLeads";
import { servicesOf, summarizeServiceMix, type MixRow } from "./crmServiceMix";
import type { ServiceRankRow } from "./weeklyReview";

export interface CloseRateContact {
  phone: string;
  first_contact_at: string | null;
  status: string;
  services?: string[] | null;
}

export interface CloseRateService {
  phone: string | null;
  booked_at: string | null;
  created_at: string;
  calendar_missing_since?: string | null;
}

export interface CloseRateCount {
  quotes: number;
  closed: number;
}

export interface ServiceCloseRates {
  /** Todas as pessoas do mês, com ou sem serviço identificado. */
  total: CloseRateCount;
  quiz: CloseRateCount;
  whatsApp: CloseRateCount;
  /** Por serviço, com os rótulos da aba ("Limpeza de sofá"). */
  byService: Map<string, CloseRateCount>;
  /** Contactos do WhatsApp sem etiqueta de serviço. */
  withoutService: number;
}

const fold = (t: string) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const LABEL_ITEM: Record<string, string> = { sofa: "sofá", colchao: "colchão", tapete: "tapete", cadeira: "cadeiras", recolha: "tapete" };

const WATERPROOFABLE = new Set(["sofá", "cadeiras"]);

/** Só sofás e cadeiras se impermeabilizam; o resto do mesmo pedido é limpeza. */
function fixWaterproofing(labels: string[]): string[] {
  const waterproof = labels.some(l => l.startsWith("Impermeabilização"));
  const out = labels.map(l => {
    const m = /^Impermeabilização de (.+)$/.exec(l);
    return m && !WATERPROOFABLE.has(m[1]) ? `Limpeza de ${m[1]}` : l;
  });
  if (waterproof && !out.some(l => l.startsWith("Impermeabilização"))) out.push("Impermeabilização de sofá");
  return [...new Set(out)];
}

/** Etiquetas do WhatsApp → rótulos da aba Serviços. */
export function servicesFromLabels(labels: string[] | null | undefined): string[] {
  const folded = (labels ?? []).map(fold);
  const type = folded.includes("impermeabilizacao") ? "Impermeabilização" : "Limpeza";
  const items = [...new Set(folded.map(l => LABEL_ITEM[l]).filter(Boolean))];
  if (!items.length && type === "Impermeabilização") items.push("sofá");
  return fixWaterproofing(items.map(i => `${type} de ${i}`));
}

const closedDay = (s: CloseRateService) => lisbonDay(s.booked_at ?? s.created_at);

/** Metas (dono, 2026-10-13): o questionário fecha pelo menos 50%; cada serviço, 70%. */
export const QUIZ_CLOSE_RATE_GOAL = 0.5;
export const SERVICE_CLOSE_RATE_GOAL = 0.7;

/**
 * @param period "AAAA-MM" (um mês) ou { from, to } (dias AAAA-MM-DD, inclusive),
 *   sobre o dia do primeiro pedido de cada pessoa.
 */
export function computeServiceCloseRates(
  period: string | { from: string; to: string },
  quiz: QuizSummary | null,
  contacts: CloseRateContact[] | null,
  services: CloseRateService[],
): ServiceCloseRates {
  const { from: start, to: end } = typeof period === "string" ? { from: `${period}-01`, to: `${period}-31` } : period;
  const inPeriod = (day: string) => day >= start && day <= end;
  const out: ServiceCloseRates = {
    total: { quotes: 0, closed: 0 }, quiz: { quotes: 0, closed: 0 }, whatsApp: { quotes: 0, closed: 0 },
    byService: new Map(), withoutService: 0,
  };
  const add = (labels: string[], closed: boolean, channel: CloseRateCount) => {
    out.total.quotes++; channel.quotes++;
    if (closed) { out.total.closed++; channel.closed++; }
    for (const l of new Set(labels)) {
      const c = out.byService.get(l) ?? { quotes: 0, closed: 0 };
      c.quotes++;
      if (closed) c.closed++;
      out.byService.set(l, c);
    }
  };

  const quizKeys = new Set<string>();
  for (const p of quiz?.people ?? []) {
    quizKeys.add(p.key);
    p.leads.forEach(l => { const k = phoneKey(l.whatsapp_phone); if (k) quizKeys.add(k); });
    if (!inPeriod(p.firstDay)) continue;
    add(p.leads.flatMap(l => (l.service ? fixWaterproofing(servicesOf(l.service)) : [])), p.services.length > 0, out.quiz);
  }

  const closedDays = new Map<string, string[]>();
  for (const s of services) {
    if (s.calendar_missing_since) continue;
    const k = phoneKey(s.phone);
    if (k.length === 9) closedDays.set(k, [...(closedDays.get(k) ?? []), closedDay(s)]);
  }
  for (const c of contacts ?? []) {
    const key = phoneKey(c.phone);
    if (!c.first_contact_at || key.length < 9 || quizKeys.has(key)) continue;
    const first = lisbonDay(c.first_contact_at);
    if (!inPeriod(first)) continue;
    const from = addDays(first, -1);
    const closed = c.status === "cliente" || c.status === "marcado" || (closedDays.get(key) ?? []).some(d => d >= from);
    const labels = servicesFromLabels(c.services);
    if (!labels.length) out.withoutService++;
    add(labels, closed, out.whatsApp);
  }
  return out;
}

/** Fechos que faltavam para a meta, com os mesmos orçamentos. */
export const missingFor = (c: CloseRateCount, goal: number) => Math.max(0, Math.ceil(goal * c.quotes - c.closed));

/**
 * Linhas do ranking da aba Fechos: orçamentos e fechos de cada serviço, com o
 * ticket médio desse serviço nas linhas do CRM dadas (repartidas como na aba
 * Serviços, pesadas com `weightRows`).
 */
export function closeRateRankRows(rates: ServiceCloseRates, ticketRows: MixRow[], weightRows: MixRow[] = ticketRows): ServiceRankRow[] {
  const tickets = new Map(summarizeServiceMix(ticketRows, weightRows).services.map(l => [l.label, l.average]));
  return [...rates.byService].map(([service, c]) => {
    const rate = c.quotes ? c.closed / c.quotes : 0;
    const t = tickets.get(service);
    const ticket = t === undefined ? null : Math.round(t * 10) / 10;
    return { service, contacts: c.quotes, closed: c.closed, rate, ticket, valuePerContact: ticket === null ? null : Math.round(rate * ticket * 10) / 10 };
  });
}
