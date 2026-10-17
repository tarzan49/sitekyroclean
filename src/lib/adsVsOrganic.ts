import { addDays, countsAsClosing, lisbonDay, weekdayOf } from './crmClosings';
import { lisbonMidnight } from './lisbonTime';

// O que os anúncios trazem a mais (dono, 2026-10-17: "termos dados para perceber
// quantos pedidos de orçamento temos a mais comparando com agosto e setembro";
// "não podes considerar que as pessoas que vêm de anúncios são apenas as que estão
// assinaladas com (google), são sim as pessoas a mais que vêm").
//
// Média orgânica = média por semana de agosto e setembro antes dos anúncios. Numa
// semana com anúncios, tudo o que passa dessa média conta como trazido pelos
// anúncios: pedidos de orçamento, fechos, faturado e a parte do dono. O lucro é a
// parte do dono a mais menos o gasto. A semana em curso compara com a média
// proporcional aos dias que já passaram.

/** Primeira segunda-feira da média orgânica. */
export const ORGANIC_FROM = '2026-08-03';
/** Último domingo da média orgânica: os anúncios começaram no sábado 26/09, por isso a semana de 21/09 é mista e fica de fora das duas contas. */
export const ORGANIC_TO = '2026-09-20';
/** Primeira semana inteira com anúncios. */
export const ADS_FROM = '2026-09-28';

export interface WeeklyConversationRow { week: string; source: 'whatsapp_web' | 'servidor'; new_people: number; people_wrote: number; counted_at: string }
export interface ClosingInput { booked_at: string | null; billed_value: number | null; upsell_value?: number | null; my_cut: number | null }
export interface SpendInput { stat_date: string; cost: number }

export interface WeekStats {
  week: string;
  /** Dias da semana já passados (7 numa semana acabada). */
  daysElapsed: number;
  spend: number;
  /** Pedidos de orçamento: pessoas que escreveram pela primeira vez nessa semana. */
  newPeople: number | null;
  /** Todas as pessoas que escreveram nessa semana, novas e antigas. */
  peopleWrote: number | null;
  conversationsSource: 'whatsapp_web' | 'servidor' | null;
  closings: number;
  billed: number;
  /** Parte do dono (o primeiro valor do título no calendário), sem a parte dele nos upsells. */
  share: number;
}

const mondayOf = (day: string) => addDays(day, -weekdayOf(day));

/** A contagem do WhatsApp Web só vale para uma semana se foi feita depois de ela acabar; antes disso, a do servidor. */
export function pickConversations(rows: WeeklyConversationRow[], week: string): WeeklyConversationRow | null {
  const mine = rows.filter(r => r.week === week);
  const web = mine.find(r => r.source === 'whatsapp_web');
  const server = mine.find(r => r.source === 'servidor');
  if (web && lisbonDay(web.counted_at) > addDays(week, 6)) return web;
  return server ?? web ?? null;
}

/** Semanas (segunda a domingo, Lisboa) de `firstWeek` até à semana de `now`. */
export function buildWeeks(closings: ClosingInput[], spend: SpendInput[], conversations: WeeklyConversationRow[], firstWeek: string, now: Date = new Date()): WeekStats[] {
  const today = lisbonDay(now);
  const last = mondayOf(today);
  const out: WeekStats[] = [];
  for (let week = mondayOf(firstWeek); week <= last; week = addDays(week, 7)) {
    const end = addDays(week, 6);
    const inWeek = (day: string) => day >= week && day <= end;
    const done = closings.filter(c => c.booked_at && countsAsClosing({ billed_value: Number(c.billed_value) || 0, upsell_value: c.upsell_value }) && inWeek(lisbonDay(c.booked_at)));
    const conv = pickConversations(conversations, week);
    const daysElapsed = end < today ? 7 : Math.min(7, Math.max(0, (now.getTime() - lisbonMidnight(week)) / 86_400_000));
    out.push({
      week, daysElapsed,
      spend: spend.filter(s => inWeek(s.stat_date)).reduce((s, x) => s + (Number(x.cost) || 0), 0),
      newPeople: conv ? conv.new_people : null,
      peopleWrote: conv ? conv.people_wrote : null,
      conversationsSource: conv ? conv.source : null,
      closings: done.length,
      billed: done.reduce((s, c) => s + (Number(c.billed_value) || 0), 0),
      share: done.reduce((s, c) => s + (Number(c.my_cut) || 0), 0),
    });
  }
  return out;
}

export interface Baseline { weeks: number; conversationWeeks: number; newPeople: number | null; peopleWrote: number | null; closings: number; billed: number; share: number }

/** Média por semana das semanas inteiras entre ORGANIC_FROM e ORGANIC_TO. As conversas usam só as semanas que têm contagem. */
export function organicBaseline(weeks: WeekStats[], from = ORGANIC_FROM, to = ORGANIC_TO): Baseline {
  const list = weeks.filter(w => w.week >= from && addDays(w.week, 6) <= to && w.daysElapsed >= 7);
  const avg = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0);
  const conv = list.filter(w => w.newPeople !== null);
  return {
    weeks: list.length,
    conversationWeeks: conv.length,
    newPeople: conv.length ? avg(conv.map(w => w.newPeople!)) : null,
    peopleWrote: conv.length ? avg(conv.map(w => w.peopleWrote!)) : null,
    closings: avg(list.map(w => w.closings)),
    billed: avg(list.map(w => w.billed)),
    share: avg(list.map(w => w.share)),
  };
}

export interface ExtraWeek {
  week: string;
  partial: boolean;
  extraNewPeople: number | null;
  extraClosings: number;
  extraBilled: number;
  extraShare: number;
  spend: number;
  /** Parte do dono a mais menos o gasto. */
  profit: number;
}

/** O que cada semana com anúncios teve a mais do que a média orgânica (proporcional aos dias, na semana em curso). */
export function adsExtra(weeks: WeekStats[], base: Baseline, adsFrom = ADS_FROM): { rows: ExtraWeek[]; total: Omit<ExtraWeek, 'week' | 'partial'> } {
  const rows = weeks.filter(w => w.week >= adsFrom).map(w => {
    const k = w.daysElapsed / 7;
    const extraShare = w.share - base.share * k;
    return {
      week: w.week,
      partial: w.daysElapsed < 7,
      extraNewPeople: w.newPeople !== null && base.newPeople !== null ? w.newPeople - base.newPeople * k : null,
      extraClosings: w.closings - base.closings * k,
      extraBilled: w.billed - base.billed * k,
      extraShare,
      spend: w.spend,
      profit: extraShare - w.spend,
    };
  });
  const sum = (f: (r: ExtraWeek) => number) => rows.reduce((s, r) => s + f(r), 0);
  const people = rows.filter(r => r.extraNewPeople !== null);
  return {
    rows,
    total: {
      extraNewPeople: people.length ? people.reduce((s, r) => s + r.extraNewPeople!, 0) : null,
      extraClosings: sum(r => r.extraClosings),
      extraBilled: sum(r => r.extraBilled),
      extraShare: sum(r => r.extraShare),
      spend: sum(r => r.spend),
      profit: sum(r => r.profit),
    },
  };
}
