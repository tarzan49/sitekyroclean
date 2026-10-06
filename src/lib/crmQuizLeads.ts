// Pedidos do questionário do site que fecharam (dono, 2026-10-06: "colocar no
// CRM aqueles que foram fechados pelo quiz, para perceber também a taxa de
// fecho").
//
// O questionário grava cada pedido na tabela `leads` (origem "Website"). O
// serviço, quando fecha, entra no CRM pelo calendário, sem nenhuma ligação ao
// pedido: liga-se pelo telefone (últimos 9 dígitos, como nas fichas de
// clientes). Uma pessoa conta uma vez, no dia do seu primeiro pedido, e fechou
// se tem um serviço no CRM fechado a partir desse dia (com um dia de folga,
// para o caso de o serviço ter sido marcado logo e a hora do pedido cair no
// dia seguinte em UTC). Um serviço anterior ao pedido é de um cliente que já
// existia: não conta como fecho do questionário.
//
// A tabela `leads` só tem pedidos desde 14/09/2026 (o `db push` desse dia
// apagou os anteriores; ver CLAUDE.md).
import { phoneKey } from "@/lib/clientRecords";
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
}

export interface QuizPerson {
  key: string;
  /** Dia (Lisboa) do primeiro pedido. */
  firstDay: string;
  /** Pedidos desta pessoa no questionário, do mais antigo ao mais recente. */
  leads: QuizLeadRow[];
  /** Serviços do CRM fechados a partir do primeiro pedido. */
  services: QuizServiceRow[];
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
  /** Serviços do CRM que vieram do questionário, por id. */
  quizServiceIds: Set<string>;
}

const num = (v: unknown) => Number(v) || 0;
const round2 = (n: number) => Math.round(n * 100) / 100;
const closedDay = (s: Pick<QuizServiceRow, "booked_at" | "created_at">) => lisbonDay(s.booked_at ?? s.created_at);

/** Só os pedidos do site; o bot do WhatsApp também escreve em `leads`, com origem "WhatsApp". */
export const isQuizLead = (l: Pick<QuizLeadRow, "source">) => l.source !== "WhatsApp";

export function summarizeQuizLeads(leads: QuizLeadRow[], services: QuizServiceRow[]): QuizSummary {
  const byKey = new Map<string, QuizLeadRow[]>();
  let withoutPhone = 0;
  for (const l of leads) {
    if (!isQuizLead(l)) continue;
    const key = phoneKey(l.phone);
    if (key.length < 9) { withoutPhone++; continue; }
    const list = byKey.get(key) ?? [];
    list.push(l);
    byKey.set(key, list);
  }

  const servicesByKey = new Map<string, QuizServiceRow[]>();
  for (const s of services) {
    const key = phoneKey(s.phone);
    if (key.length < 9 || !byKey.has(key)) continue;
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
    const won = (servicesByKey.get(key) ?? []).filter(s => closedDay(s) >= from);
    won.forEach(s => quizServiceIds.add(s.id));
    people.push({
      key, firstDay, leads: list, services: won,
      billed: round2(won.reduce((t, s) => t + num(s.billed_value), 0)),
      share: round2(won.reduce((t, s) => t + num(s.my_cut) + ownerUpsellOf(s), 0)),
    });
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

  return { people, months, withoutPhone, quizServiceIds };
}
