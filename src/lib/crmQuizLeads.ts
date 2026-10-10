// Pedidos do questionário do site que fecharam (dono, 2026-10-06: "colocar no
// CRM aqueles que foram fechados pelo quiz, para perceber também a taxa de
// fecho").
//
// O questionário grava cada pedido na tabela `leads` (origem "Website"). O
// serviço, quando fecha, entra no CRM pelo calendário, sem nenhuma ligação ao
// pedido. Liga-se, por esta ordem:
// 1. pelo telefone do questionário (últimos 9 dígitos, como nas fichas);
// 2. pelo número do WhatsApp que mandou o código do pedido ("Acabei de enviar
//    o pedido #XXXX"), em `leads.whatsapp_phone`: a pessoa pode escrever de
//    outro número, e o serviço entra no CRM com o do WhatsApp;
// 3. pelo nome completo (primeiro e último nome iguais no `client_name`), até
//    60 dias depois do pedido, para quando o telefone ficou mal no CRM.
// Uma pessoa conta uma vez, no dia do seu primeiro pedido, e fechou se tem um
// serviço no CRM fechado a partir desse dia (com um dia de folga, para o caso
// de o serviço ter sido marcado logo e a hora do pedido cair no dia seguinte
// em UTC). Um serviço anterior ao pedido é de um cliente que já existia: não
// conta como fecho do questionário. Os pedidos de teste ficam de fora.
//
// A tabela `leads` só tem pedidos desde 14/09/2026 (o `db push` desse dia
// apagou os anteriores; ver CLAUDE.md).
import { phoneKey } from "@/lib/clientRecords";
import { isTestOrder } from "@/lib/testLead";
import { addDays, lisbonDay } from "@/lib/crmClosings";
import { ownerUpsellOf } from "@/lib/crmUpsell";

export const QUIZ_LEADS_SINCE = "2026-09-14";
export const QUIZ_BADGE = "Questionário";

export interface QuizLeadRow {
  id: string;
  created_at: string;
  name: string | null;
  phone: string | null;
  service: string | null;
  location: string | null;
  value: string | null;
  source: string | null;
  whatsapp_phone?: string | null;
}

export interface QuizServiceRow {
  id: string;
  booked_at: string | null;
  created_at: string;
  request_date: string;
  billed_value: number;
  my_cut: number;
  upsell_value: number | null;
  upsell_team: string | null;
  locality: string | null;
  phone: string | null;
  client_name?: string | null;
}

export type QuizMatch = "telefone" | "WhatsApp" | "nome";

export interface QuizPerson {
  key: string;
  /** Dia (Lisboa) do primeiro pedido. */
  firstDay: string;
  /** Pedidos desta pessoa no questionário, do mais antigo ao mais recente. */
  leads: QuizLeadRow[];
  /** Serviços do CRM fechados a partir do primeiro pedido. */
  services: QuizServiceRow[];
  /** Como cada serviço foi ligado, pela ordem de `services`. */
  matchedBy: QuizMatch[];
  billed: number;
  share: number;
}

export interface QuizMonth {
  month: string;
  people: number;
  closed: number;
  billed: number;
  share: number;
}

export interface QuizSummary {
  people: QuizPerson[];
  months: QuizMonth[];
  /** Pedidos sem telefone utilizável: não se conseguem ligar ao CRM. */
  withoutPhone: number;
  /** Pedidos de teste (nome com "teste", números inventados), fora das contas. */
  tests: number;
  /** Serviços do CRM que vieram do questionário, por id. */
  quizServiceIds: Set<string>;
}

const num = (v: unknown) => Number(v) || 0;
const round2 = (n: number) => Math.round(n * 100) / 100;
const closedDay = (s: Pick<QuizServiceRow, "booked_at" | "created_at">) => lisbonDay(s.booked_at ?? s.created_at);

/** Só os pedidos do site; o bot do WhatsApp também escreve em `leads`, com origem "WhatsApp". */
export const isQuizLead = (l: Pick<QuizLeadRow, "source">) => l.source !== "WhatsApp";

/** "TESTE GOOGLE ADS", "teste", e números como 911111111, 999999999 ou 910000000. */
export function isTestLead(l: Pick<QuizLeadRow, "name" | "phone">): boolean {
  return isTestOrder(l.name, phoneKey(l.phone));
}

const nameTokens = (name: string | null | undefined) =>
  (name ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().match(/[a-z]{2,}/g) ?? [];

/** Primeiro e último nome iguais; um nome só não chega. */
function sameFullName(a: string | null | undefined, b: string | null | undefined): boolean {
  const x = nameTokens(a), y = nameTokens(b);
  if (x.length < 2 || y.length < 2) return false;
  return x[0] === y[0] && x[x.length - 1] === y[y.length - 1];
}

export function summarizeQuizLeads(leads: QuizLeadRow[], services: QuizServiceRow[]): QuizSummary {
  const byKey = new Map<string, QuizLeadRow[]>();
  let withoutPhone = 0, tests = 0;
  for (const l of leads) {
    if (!isQuizLead(l)) continue;
    if (isTestLead(l)) { tests++; continue; }
    const key = phoneKey(l.phone) || phoneKey(l.whatsapp_phone);
    if (key.length < 9) { withoutPhone++; continue; }
    const list = byKey.get(key) ?? [];
    list.push(l);
    byKey.set(key, list);
  }

  const servicesByKey = new Map<string, QuizServiceRow[]>();
  for (const s of services) {
    const key = phoneKey(s.phone);
    if (key.length < 9) continue;
    const list = servicesByKey.get(key) ?? [];
    list.push(s);
    servicesByKey.set(key, list);
  }

  const quizServiceIds = new Set<string>();
  const people: QuizPerson[] = [];
  for (const [key, list] of byKey) {
    list.sort((a, b) => a.created_at.localeCompare(b.created_at));
    const firstDay = lisbonDay(list[0].created_at);
    const from = addDays(firstDay, -1);
    const won: QuizServiceRow[] = [];
    const matchedBy: QuizMatch[] = [];
    const take = (s: QuizServiceRow, how: QuizMatch) => {
      if (quizServiceIds.has(s.id) || closedDay(s) < from) return;
      quizServiceIds.add(s.id);
      won.push(s);
      matchedBy.push(how);
    };
    (servicesByKey.get(key) ?? []).forEach(s => take(s, "telefone"));
    const waKeys = new Set(list.map(l => phoneKey(l.whatsapp_phone)).filter(k => k.length === 9 && k !== key));
    waKeys.forEach(k => (servicesByKey.get(k) ?? []).forEach(s => take(s, "WhatsApp")));
    people.push({ key, firstDay, leads: list, services: won, matchedBy, billed: 0, share: 0 });
  }

  // O nome só entra para quem não ficou ligado por telefone, e só com serviços
  // que nenhum telefone ligou a outro pedido.
  for (const p of people) {
    if (p.services.length) continue;
    const until = addDays(p.firstDay, 60);
    for (const s of services) {
      if (quizServiceIds.has(s.id)) continue;
      const day = closedDay(s);
      if (day < addDays(p.firstDay, -1) || day > until) continue;
      if (!p.leads.some(l => sameFullName(l.name, s.client_name))) continue;
      quizServiceIds.add(s.id);
      p.services.push(s);
      p.matchedBy.push("nome");
    }
  }

  for (const p of people) {
    p.billed = round2(p.services.reduce((t, s) => t + num(s.billed_value), 0));
    p.share = round2(p.services.reduce((t, s) => t + num(s.my_cut) + ownerUpsellOf(s), 0));
  }
  people.sort((a, b) => b.firstDay.localeCompare(a.firstDay) || b.leads[0].created_at.localeCompare(a.leads[0].created_at));

  const monthMap = new Map<string, QuizMonth>();
  for (const p of people) {
    const month = p.firstDay.slice(0, 7);
    const m = monthMap.get(month) ?? { month, people: 0, closed: 0, billed: 0, share: 0 };
    m.people++;
    if (p.services.length) m.closed++;
    m.billed = round2(m.billed + p.billed);
    m.share = round2(m.share + p.share);
    monthMap.set(month, m);
  }
  const months = [...monthMap.values()].sort((a, b) => b.month.localeCompare(a.month));

  return { people, months, withoutPhone, tests, quizServiceIds };
}

// Contactos do WhatsApp que não vieram do questionário, para comparar a taxa
// de fecho (dono, 2026-10-06: "faz o mesmo para os contactos do whatsapp").
// Vêm da tabela `clients` (fichas lidas do WhatsApp Web): cada contacto conta
// no mês do primeiro contacto, e fechou se a etiqueta diz cliente ou marcado,
// ou se tem serviço no CRM a partir desse dia. Os contactos sem data de
// primeiro contacto ficam de fora, como no separador Clientes.

export interface WhatsAppContactRow {
  phone: string;
  first_contact_at: string | null;
  status: string;
}

export interface WhatsAppMonth {
  month: string;
  contacts: number;
  closed: number;
}

export function summarizeWhatsAppContacts(
  contacts: WhatsAppContactRow[],
  services: QuizServiceRow[],
  quiz: QuizSummary,
): WhatsAppMonth[] {
  const quizKeys = new Set<string>();
  for (const p of quiz.people) {
    quizKeys.add(p.key);
    p.leads.forEach(l => { const k = phoneKey(l.whatsapp_phone); if (k) quizKeys.add(k); });
  }
  const closedDays = new Map<string, string[]>();
  for (const s of services) {
    const k = phoneKey(s.phone);
    if (k.length === 9) closedDays.set(k, [...(closedDays.get(k) ?? []), closedDay(s)]);
  }
  const months = new Map<string, WhatsAppMonth>();
  for (const c of contacts) {
    const key = phoneKey(c.phone);
    if (!c.first_contact_at || key.length < 9 || quizKeys.has(key)) continue;
    const first = lisbonDay(c.first_contact_at);
    if (first < QUIZ_LEADS_SINCE) continue;
    const month = first.slice(0, 7);
    const m = months.get(month) ?? { month, contacts: 0, closed: 0 };
    m.contacts++;
    const from = addDays(first, -1);
    if (c.status === "cliente" || c.status === "marcado" || (closedDays.get(key) ?? []).some(d => d >= from)) m.closed++;
    months.set(month, m);
  }
  return [...months.values()].sort((a, b) => b.month.localeCompare(a.month));
}
