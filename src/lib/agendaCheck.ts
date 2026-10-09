// Verificação da agenda de amanhã (dono, 2026-10-09: "é suposto o robô fazer
// quase tudo"). Lê o calendário do dono e diz o que está mal num serviço de
// amanhã antes de a equipa lá chegar: sem equipa, sem telefone, sem morada,
// fora de horas, dois serviços ao mesmo tempo na mesma equipa, serviço em cima
// de um bloqueio da equipa. Lista também as pré-reservas e os "A confirmar"
// que continuam por fechar nos próximos dias.
//
// Corre na `bot-api` (ação `agenda-check`) e o servidor do bot manda a
// mensagem ao dono. Como o resto da `bot-api`, não devolve nomes, telefones
// nem moradas: só horas, equipas, o serviço e o que falta.
import {
  DAY_END_HOUR, EARLIEST_HOUR, TEAM_CAPACITY, TRAVEL_MARGIN_MIN,
  dayLabel, eventRegion, eventTeam, hourLabel, lisbon, type AvailabilityEvent,
} from './botAvailability';

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const SERVICE = /^(servico|limpeza)\b/;
const PENDING = /^(pre-? ?reserva|a confirmar)\b/;
const AMOUNT = /\d+(?:[.,]\d{1,2})?\s*€/;
const PHONE = /(?:\+\d{1,3}[\s.]?)?\d{3}[\s.]?\d{3}[\s.]?\d{3,4}\b/;
const POSTAL = /\b\d{4}-\d{3}\b/;
const FREE = /\b(gratuit[oa]|sem custo|nao cobrar)\b/;
const BLOCK = /^bloqueio\b/;
const STREET = /\b(rua|r\.|av\.?|avenida|travessa|tv\.?|largo|praca|estrada|alameda|urbanizacao|urb\.?|calcada|bairro|lugar|caminho|beco|quinta|praceta|rotunda|edificio|lote)\b/;

export interface AgendaIssue { time: string; team: string | null; what: string; problem: string }
export interface AgendaService { time: string; end: string; team: string | null; what: string }
export interface AgendaPending { day: string; time: string; kind: 'Pré-reserva' | 'A confirmar'; region: string | null }
export interface AgendaReport {
  date: string;
  day: string;
  services: AgendaService[];
  issues: AgendaIssue[];
  pending: AgendaPending[];
  /** A mensagem pronta para o dono, em português. */
  message: string;
}

interface Timed { e: AvailabilityEvent; from: number; to: number; team: string | null; summary: string }

const timed = (events: AvailabilityEvent[]): Timed[] => events.flatMap(e => {
  if (!e.start || String(e.status).toUpperCase() === 'CANCELLED') return [];
  const from = Date.parse(e.start);
  if (!Number.isFinite(from)) return [];
  const end = e.end ? Date.parse(e.end) : NaN;
  const to = Number.isFinite(end) && end > from ? end : from + 60 * 60_000;
  return [{ e, from, to, team: eventTeam(e), summary: fold(e.summary) }];
});

/** O serviço sem o rótulo e os valores: "Limpeza de sofá 3 lugares". Nunca o nome, o telefone ou a morada. */
function serviceWhat(summary: string): string {
  const head = summary.split(/\s+[-–]\s+/)[0] ?? '';
  const what = head
    .replace(/\(an[uú]ncio[^)]*\)/giu, ' ')
    .replace(/^\s*(servi[cç]o|limpeza)\s+(?=\d)/iu, '')
    .replace(/\d+(?:[.,]\d{1,2})?\s*€\s*(\(\s*\d+(?:[.,]\d{1,2})?\s*€\s*\))?/gu, ' ')
    .replace(/^\s*servi[cç]o\b/iu, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return what || 'serviço';
}

/** O que falta no título de um serviço para a equipa o conseguir fazer. */
function missingData(e: AvailabilityEvent): string[] {
  const text = `${e.summary}\n${e.description ?? ''}`;
  const out: string[] = [];
  if (!AMOUNT.test(e.summary) && !FREE.test(fold(e.summary))) out.push('sem valor no título');
  const withoutAmounts = text.replace(/\d+(?:[.,]\d{1,2})?\s*€/g, ' ');
  if (!PHONE.test(withoutAmounts)) out.push('sem telefone');
  const segments = e.summary.split(/\s+[-–]\s+/).slice(1).map(fold);
  const hasStreet = POSTAL.test(text) || segments.some(s => STREET.test(s) && /\d/.test(s.replace(PHONE, '')));
  if (!hasStreet) out.push('morada sem rua e número nem código postal');
  return out;
}

export function agendaCheck(events: AvailabilityEvent[], date: string, now: Date, pendingDays = 7): AgendaReport {
  const today = lisbon(now.getTime()).date;
  const all = timed(events);
  const ofDay = all.filter(t => lisbon(t.from).date === date);
  const services = ofDay.filter(t => SERVICE.test(t.summary)).sort((a, b) => a.from - b.from);
  // Só um evento "Bloqueio <Equipa>" fecha a equipa; outros eventos do dono não contam.
  const blocks = ofDay.filter(t => t.team && BLOCK.test(t.summary));
  const time = (ms: number) => hourLabel(lisbon(ms).minutes);
  const issues: AgendaIssue[] = [];
  const add = (t: Timed, problem: string) => issues.push({ time: time(t.from), team: t.team, what: serviceWhat(t.e.summary), problem });

  for (const t of services) {
    if (!t.team) add(t, 'sem equipa escolhida (falta a cor)');
    for (const m of missingData(t.e)) add(t, m);
    const start = lisbon(t.from).minutes, end = lisbon(t.to).minutes;
    if (start < EARLIEST_HOUR * 60 || end > DAY_END_HOUR * 60 || lisbon(t.to).date !== date) {
      add(t, `fora do horário (${EARLIEST_HOUR}h às ${DAY_END_HOUR}h)`);
    }
    if (t.team && blocks.some(b => b.team === t.team && b.from < t.to && b.to > t.from)) add(t, 'a equipa tem um bloqueio a essa hora');
  }

  // Mesma equipa: mais serviços ao mesmo tempo do que pessoas, ou pouco tempo para a viagem.
  const byTeam = new Map<string, Timed[]>();
  for (const t of services) if (t.team) byTeam.set(t.team, [...(byTeam.get(t.team) ?? []), t]);
  for (const [team, list] of byTeam) {
    const cap = TEAM_CAPACITY[team] ?? 1;
    for (let i = 0; i < list.length; i++) {
      const t = list[i];
      const overlapping = list.filter(o => o !== t && o.from < t.to && o.to > t.from).length;
      if (overlapping >= cap) add(t, `${team} tem outro serviço à mesma hora`);
      const next = list[i + 1];
      if (cap === 1 && next && next.from >= t.to && next.from - t.to < TRAVEL_MARGIN_MIN * 60_000) {
        add(next, `menos de ${TRAVEL_MARGIN_MIN} min de viagem desde o serviço anterior`);
      }
    }
  }

  const horizon = now.getTime() + pendingDays * 86_400_000;
  const pending: AgendaPending[] = all
    .filter(t => PENDING.test(t.summary) && t.to > now.getTime() && t.from < horizon)
    .sort((a, b) => a.from - b.from)
    .map(t => ({
      day: dayLabel(lisbon(t.from).date, today),
      time: time(t.from),
      kind: t.summary.startsWith('a confirmar') ? 'A confirmar' : 'Pré-reserva',
      region: t.team ?? eventRegion(t.e),
    }));

  const list = services.map(t => ({ time: time(t.from), end: time(t.to), team: t.team, what: serviceWhat(t.e.summary) }));
  const day = dayLabel(date, today);
  return { date, day, services: list, issues, pending, message: agendaMessage(day, list, issues, pending) };
}

function agendaMessage(day: string, services: AgendaService[], issues: AgendaIssue[], pending: AgendaPending[]): string {
  const lines: string[] = [`Agenda de ${day}: ${services.length} ${services.length === 1 ? 'serviço' : 'serviços'}.`];
  const teams = new Map<string, number>();
  for (const s of services) teams.set(s.team ?? 'sem equipa', (teams.get(s.team ?? 'sem equipa') ?? 0) + 1);
  if (teams.size) lines.push([...teams].map(([t, n]) => `${t}: ${n}`).join(' · '));
  lines.push('');
  if (issues.length) {
    lines.push(`A corrigir (${issues.length}):`);
    for (const i of issues) lines.push(`- ${i.time}${i.team ? ` ${i.team}` : ''}, ${i.what}: ${i.problem}`);
  } else {
    lines.push('Nada a corrigir nos serviços.');
  }
  if (pending.length) {
    lines.push('', `Por confirmar nos próximos dias (${pending.length}):`);
    for (const p of pending) lines.push(`- ${p.kind}, ${p.day} às ${p.time}${p.region ? `, ${p.region}` : ''}`);
  }
  return lines.join('\n');
}
