import { calendarErrorMessage } from "@/lib/crmCalendarSync";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Camera, Check, ChevronDown, ChevronLeft, ChevronRight, Copy, Lock, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lisbonDay } from "@/lib/crmClosings";
import { CALENDAR_FETCH_SINCE } from "@/lib/calendarSync";
import type { CalendarEvent } from "@/lib/calendarServices";
import { euros, type AccountAdjustment, type AccountEvent, type AccountRow } from "@/lib/teamAccounts";
import { addDays, groupOfTeam, SETTLEMENT_TEAMS, teamWeek, weekStartOf, weeklySettlement, type WeekService, type WeekServiceStatus } from "@/lib/weeklySettlement";
import { dayMonth } from "./crmInvoiceUi";

// Aba "Contas" do CRM (dono, 2026-11-01): o que cada grupo de equipas deve nesta
// semana, de domingo a domingo, e o botão que o fecha. As contas estão em
// src/lib/weeklySettlement.ts; aqui só se desenham e se regista o pagamento.

interface SettlementRow {
  id: string;
  group_id: string;
  group_label: string;
  cycle_end: string;
  amount: number;
  service_count: number;
  paid_at: string;
}

type AdjustmentRow = AccountAdjustment & { id: string };

const ALL_TEAMS = "Todas as equipas";

export interface PastDebt { id: string; date: string; description: string; kind: "client" | "team"; value: number }

function CrmSettlements({ records, onChanged, pastDebts = [] }: { records: AccountRow[]; onChanged: () => Promise<unknown> | void; pastDebts?: PastDebt[] }) {
  const [events, setEvents] = useState<AccountEvent[] | null>(null);
  const [adjustments, setAdjustments] = useState<AdjustmentRow[]>([]);
  const [history, setHistory] = useState<SettlementRow[]>([]);
  const [media, setMedia] = useState<Map<string, { photos: boolean; video: boolean }>>(new Map());
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const today = lisbonDay(new Date());

  const load = useCallback(async () => {
    setError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;
      const [cal, adj, proc, hist] = await Promise.all([
        supabase.functions.invoke("calendar-events", { body: { since: CALENDAR_FETCH_SINCE } }),
        db.from("team_account_adjustments").select("id, team, day, label, amount").is("settled_at", null),
        db.from("service_procedure").select("service_request_id, before_at, after_at, video_at").gte("service_day", "2026-10-01"),
        db.from("team_settlements").select("id, group_id, group_label, cycle_end, amount, service_count, paid_at").order("paid_at", { ascending: false }).limit(30),
      ]);
      if (cal.error || !cal.data?.success) throw new Error(await calendarErrorMessage(cal.data, cal.error));
      if (adj.error) throw adj.error;
      if (hist.error) throw hist.error;
      // A falta da tabela do procedimento não impede as contas: só deixa as fotos e o vídeo por saber.
      const m = new Map<string, { photos: boolean; video: boolean }>();
      for (const r of (proc.error ? [] : proc.data ?? []) as { service_request_id: string | null; before_at: string | null; after_at: string | null; video_at: string | null }[]) {
        if (!r.service_request_id) continue;
        const prev = m.get(r.service_request_id);
        m.set(r.service_request_id, { photos: !!(r.before_at && r.after_at) || !!prev?.photos, video: !!r.video_at || !!prev?.video });
      }
      setMedia(m);
      setEvents((cal.data.events as CalendarEvent[]).map(e => ({
        id: e.id, summary: e.summary, description: e.description, status: e.status, start: null, end: null,
      })));
      setAdjustments(adj.data ?? []);
      setHistory(hist.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar as contas");
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const settlement = useMemo(
    () => events ? weeklySettlement(records, events, adjustments, today) : null,
    [records, events, adjustments, today],
  );

  const teamTotals = useMemo(() => {
    const m = new Map<string, number>();
    for (const g of settlement?.groups ?? []) for (const t of g.teams) m.set(t.team, t.total);
    return m;
  }, [settlement]);

  const [team, setTeam] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState(() => weekStartOf(today));
  useEffect(() => {
    if (team || !settlement) return;
    const top = [...teamTotals.entries()].sort((a, b) => b[1] - a[1])[0];
    setTeam(top?.[0] ?? SETTLEMENT_TEAMS[0]);
  }, [settlement, teamTotals, team]);

  const week = useMemo(
    () => !events || !team ? []
      : team === ALL_TEAMS
        ? SETTLEMENT_TEAMS.flatMap(t => teamWeek(records, events, t, weekStart, today).map(w => ({ ...w, label: `${w.label} · ${t}` })))
            .sort((a, b) => a.date.localeCompare(b.date))
        : teamWeek(records, events, team, weekStart, today),
    [records, events, team, weekStart, today],
  );

  if (!settlement || !team) return <p className="text-center py-10 text-sm text-gray-400">{error ?? "A carregar as contas..."}</p>;

  const isAll = team === ALL_TEAMS;
  const allAccounts = settlement.groups.flatMap(g => g.teams);
  const account = isAll ? null : allAccounts.find(t => t.team === team) ?? null;
  const group = isAll ? null : settlement.groups.find(g => g.id === groupOfTeam(team).id)!;
  const owedNow = isAll ? allAccounts.reduce((s, t) => s + t.total, 0) : account?.total ?? 0;
  const weekEnd = addDays(weekStart, 6);
  const sel = isAll ? allAccounts : account ? [account] : [];
  const adjSum = sel.reduce((s, t) => s + t.adjustments.reduce((x, l) => x + l.amount, 0), 0);
  const oweSum = sel.reduce((s, t) => s + t.ownerOwes.reduce((x, l) => x + l.amount, 0), 0);
  const earlier = sel.flatMap(a => [...a.before, ...a.today]).filter(l => l.date < weekStart);
  const weekBilled = week.reduce((s, w) => s + w.billed, 0);
  const weekShare = week.reduce((s, w) => s + w.amount, 0);
  const todo = week.filter(w => w.status === "por_fazer");
  const todoBilled = todo.reduce((s, w) => s + w.billed, 0);
  const todoShare = todo.reduce((s, w) => s + w.amount, 0);
  const weekOwed = week.filter(w => w.status === "por_pagar").reduce((s, w) => s + w.amount, 0);
  const groupHistory = history.filter(h => isAll || h.group_id === group?.id);
  const isCurrentWeek = weekStart === weekStartOf(today);

  const copyMessage = async () => {
    if (!account) return;
    await navigator.clipboard.writeText(account.message);
    setCopied(team);
    setTimeout(() => setCopied(c => (c === team ? null : c)), 2000);
  };

  const settle = async () => {
    const g = group;
    if (!g || !settlement.canSettle) return;
    const who = g.teams.map(t => t.team).join(" + ");
    if (!confirm(`${who} pagou ${euros(g.total)}? Os ${g.serviceCount} serviços ficam dados como pagos e as contas voltam a zero.`)) return;
    setBusy(g.id);
    setError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;
      // Primeiro o registo (a base de dados só o aceita num domingo); só depois se fecha o resto.
      const { error: e1 } = await db.from("team_settlements").insert({
        group_id: g.id, group_label: g.label, cycle_end: settlement.cycleEnd, amount: g.total, vat: g.vat,
        service_count: g.serviceCount, service_ids: g.serviceIds, adjustment_ids: g.adjustmentIds,
      });
      if (e1) throw e1;
      if (g.serviceIds.length) {
        const { error: e2 } = await db.from("service_requests").update({ paid: true }).in("id", g.serviceIds);
        if (e2) throw e2;
      }
      if (g.adjustmentIds.length) {
        const { error: e3 } = await db.from("team_account_adjustments").update({ settled_at: new Date().toISOString() }).in("id", g.adjustmentIds);
        if (e3) throw e3;
      }
      await Promise.all([load(), onChanged()]);
    } catch (e) {
      setError(`Não consegui fechar as contas: ${e instanceof Error ? e.message : (e as { message?: string })?.message ?? "erro"}. Confirma o que ficou registado antes de repetir.`);
    } finally {
      setBusy(null);
    }
  };

  // Marcar um serviço como pago ou por pagar (dono, 3/11). Grava o mesmo `paid`
  // do CRM, por isso a ficha do cliente e o total da equipa mudam juntos.
  const togglePaid = async (w: WeekService) => {
    if (!w.id || (w.status !== "pago" && w.status !== "por_pagar")) return;
    setBusy(w.id);
    setError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: e } = await (supabase as any).from("service_requests").update({ paid: w.status !== "pago" }).eq("id", w.id);
      if (e) throw e;
      await onChanged();
    } catch (e) {
      setError(`Não consegui mudar o pagamento: ${e instanceof Error ? e.message : (e as { message?: string })?.message ?? "erro"}.`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}

      {pastDebts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm font-bold text-red-700">
            Meses anteriores por fechar: {euros(Math.round(pastDebts.reduce((s, d) => s + d.value, 0) * 100) / 100)} ({pastDebts.length})
          </p>
          <ul className="mt-2 space-y-1 text-xs text-gray-700">
            {pastDebts.map(d => (
              <li key={d.id} className="flex gap-2">
                <span className="font-mono text-navy shrink-0">{dayMonth(d.date)}</span>
                <span className="truncate flex-1">{d.description}</span>
                <span className="shrink-0 text-gray-500">{d.kind === "client" ? "cliente" : "equipa"}</span>
                <span className="shrink-0 font-semibold text-red-600">{euros(d.value)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Equipas */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <button onClick={() => setTeam(ALL_TEAMS)}
          className={`shrink-0 rounded-xl border px-3.5 py-2 text-left transition ${isAll ? "bg-navy border-navy text-white" : "bg-white border-gray-200 text-navy hover:border-navy/40"}`}>
          <span className="block text-xs font-semibold">{ALL_TEAMS}</span>
          <span className={`block text-sm font-bold ${isAll ? "text-[#D4AF37]" : "text-red-600"}`}>
            {euros([...teamTotals.values()].reduce((s, v) => s + v, 0))}
          </span>
        </button>
        {SETTLEMENT_TEAMS.map(t => {
          const owed = teamTotals.get(t) ?? 0;
          const active = t === team;
          return (
            <button key={t} onClick={() => setTeam(t)}
              className={`shrink-0 rounded-xl border px-3.5 py-2 text-left transition ${active ? "bg-navy border-navy text-white" : "bg-white border-gray-200 text-navy hover:border-navy/40"}`}>
              <span className="block text-xs font-semibold">{t}</span>
              <span className={`block text-sm font-bold ${owed > 0 ? (active ? "text-[#D4AF37]" : "text-red-600") : (active ? "text-white/60" : "text-gray-400")}`}>
                {owed > 0 ? euros(owed) : "Em dia"}
              </span>
            </button>
          );
        })}
      </div>

      {/* O que a equipa deve */}
      <div className="bg-navy text-white rounded-2xl p-5">
        <p className="text-xs uppercase tracking-wide text-white/60">{isAll ? "As equipas devem-te" : `${team} deve-te`}</p>
        <p className="text-4xl font-bold mt-1">{euros(owedNow)}</p>
        <div className="mt-3 space-y-1 text-xs text-white/80 border-t border-white/10 pt-3">
          <p className="flex justify-between"><span>Serviços até hoje por pagar</span><span>{euros(sel.reduce((s, t) => s + t.todayTotal, 0))} + {euros(sel.reduce((s, t) => s + t.beforeTotal, 0))}</span></p>
          {adjSum > 0 && <p className="flex justify-between"><span>Acertos e dívidas combinadas</span><span>+{euros(adjSum)}</span></p>}
          {oweSum > 0 && <p className="flex justify-between"><span>Pagos a ti (parte da equipa)</span><span>−{euros(oweSum)}</span></p>}
          {earlier.length > 0 && <p className="flex justify-between text-[#D4AF37]"><span>Dos quais de semanas anteriores</span><span>{euros(earlier.reduce((s, l) => s + l.amount, 0))}</span></p>}
        </div>
        <p className="text-xs text-white/70 mt-1">
          Acerto de domingo {dayMonth(settlement.cycleEnd)}. {settlement.canSettle ? "Hoje é dia de acerto." : "Só se fecha ao domingo."}
        </p>
        {account?.awaitingClient.length ? (
          <p className="text-xs text-white/70 mt-1">
            Fora do total: {account.awaitingClient.map(l => `${l.label} (${euros(l.amount)} da equipa, o cliente paga-te a ti)`).join("; ")}.
          </p>
        ) : null}
        {!isAll && <div className="flex gap-2 mt-4">
          <button onClick={settle} disabled={!settlement.canSettle || !group || group.total <= 0 || busy !== null}
            title={settlement.canSettle ? "Dar como pago e repor as contas a zero" : "Só se pode fechar ao domingo"}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-bold rounded-lg bg-[#D4AF37] text-navy disabled:opacity-40 disabled:cursor-not-allowed">
            {settlement.canSettle ? <Check className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            {busy === group?.id ? "A fechar..." : `${team} pagou ${euros(group?.total ?? 0)}`}
          </button>
          <button onClick={copyMessage} disabled={!account}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded-lg border border-white/20 disabled:opacity-40">
            {copied === team ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Mensagem
          </button>
        </div>}
      </div>

      {/* Semana */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <button onClick={() => setWeekStart(w => addDays(w, -7))} className="p-1.5 rounded-lg hover:bg-gray-100" aria-label="Semana anterior"><ChevronLeft className="w-4 h-4" /></button>
          <div className="text-center">
            <p className="text-sm font-semibold text-navy">{dayMonth(weekStart)} a {dayMonth(weekEnd)}</p>
            <p className="text-[11px] text-gray-400">{isCurrentWeek ? "Esta semana" : "Segunda a domingo"}</p>
          </div>
          <button onClick={() => setWeekStart(w => addDays(w, 7))} className="p-1.5 rounded-lg hover:bg-gray-100" aria-label="Semana seguinte"><ChevronRight className="w-4 h-4" /></button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100 border-b border-gray-100 text-center">
          <div className="py-3"><p className="text-[11px] text-gray-400">Serviços</p><p className="text-lg font-bold text-navy">{week.length}</p></div>
          <div className="py-3"><p className="text-[11px] text-gray-400">Faturado</p><p className="text-lg font-bold text-navy">{euros(weekBilled)}</p></div>
          <div className="py-3"><p className="text-[11px] text-gray-400">A tua parte</p><p className="text-lg font-bold text-navy">{euros(weekShare)}</p></div>
          <div className="py-3"><p className="text-[11px] text-gray-400">Falta faturar ({todo.length})</p><p className="text-lg font-bold text-navy">{euros(todoBilled)}</p><p className="text-[11px] text-gray-400">a tua parte {euros(todoShare)}</p></div>
        </div>

        {week.length === 0
          ? <p className="px-4 py-8 text-sm text-gray-400 text-center">Nenhum serviço {isAll ? "" : `da ${team} `}nesta semana.</p>
          : week.map((w, i) => {
            const key = w.id ?? `w${i}`;
            const m = w.id ? media.get(w.id) : undefined;
            const isOpen = open === key;
            return (
              <div key={key} className="border-b border-gray-50 last:border-0">
                <div className="px-4 py-3 flex items-start gap-3">
                  <div className="w-11 shrink-0 text-xs font-semibold text-gray-500 pt-0.5">{dayMonth(w.date)}</div>
                  <button onClick={() => setOpen(isOpen ? null : key)} className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-semibold text-navy truncate">{w.label}</p>
                    {w.what && <p className="text-xs text-gray-500 line-clamp-2">{w.what}</p>}
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400">
                      <span>Serviço {euros(w.billed)}</span>
                      {w.date <= today && (
                        <>
                          <span className={`inline-flex items-center gap-0.5 ${m?.photos ? "text-green-700" : "text-red-600"}`}><Camera className="w-3 h-3" />{m?.photos ? "Fotos" : "Sem fotos"}</span>
                          <span className={`inline-flex items-center gap-0.5 ${m?.video ? "text-green-700" : "text-red-600"}`}><Video className="w-3 h-3" />{m?.video ? "Vídeo" : "Sem vídeo"}</span>
                        </>
                      )}
                      <ChevronDown className={`w-3 h-3 transition ${isOpen ? "rotate-180" : ""}`} />
                    </div>
                  </button>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-navy">{euros(w.amount)}</p>
                    {w.id && (w.status === "pago" || w.status === "por_pagar")
                      ? <button onClick={() => togglePaid(w)} disabled={busy !== null}
                          title={w.status === "pago" ? "Marcar como por pagar" : "Marcar como pago"} className="disabled:opacity-50">
                          <StatusPill status={busy === w.id ? (w.status === "pago" ? "por_pagar" : "pago") : w.status} />
                        </button>
                      : <StatusPill status={w.status} />}
                  </div>
                </div>
                {isOpen && (
                  <div className="mx-4 mb-3 rounded-lg bg-gray-50 px-3 py-2 space-y-1 text-xs">
                    {w.breakdown.map((b, j) => (
                      <p key={j} className={`flex justify-between gap-3 ${b.strong ? "font-bold text-navy border-t border-gray-200 pt-1 mt-1" : "text-gray-600"}`}><span>{b.label}</span><span>{b.value}</span></p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

        {weekOwed > 0 && (
          <div className="px-4 py-2.5 bg-red-50 text-xs font-semibold text-red-700 flex justify-between">
            <span>Por pagar desta semana</span><span>{euros(weekOwed)}</span>
          </div>
        )}
      </div>

      {earlier.length > 0 && (
        <div className="bg-white border border-red-200 rounded-2xl">
          <p className="px-4 py-3 text-sm font-semibold text-red-700 border-b border-red-100">Dívida de semanas anteriores (antes de {dayMonth(weekStart)}): {euros(earlier.reduce((s, l) => s + l.amount, 0))}</p>
          {earlier.map((l, i) => (
            <div key={l.id ?? i} className="px-4 py-2 text-sm flex justify-between gap-3 border-b border-gray-50 last:border-0">
              <span className="text-gray-600 min-w-0 truncate">{dayMonth(l.date)} · {l.label}</span>
              <span className="font-semibold text-navy">{euros(l.amount)}</span>
            </div>
          ))}
        </div>
      )}

      {account && (account.adjustments.length > 0 || account.ownerOwes.length > 0) && (
        <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 space-y-1 text-sm">
          {account.adjustments.map((l, i) => (
            <p key={l.id ?? i} className="flex justify-between gap-3 text-gray-600"><span>{l.label}</span><span className="font-semibold text-navy">{euros(l.amount)}</span></p>
          ))}
          {account.ownerOwes.map((l, i) => (
            <p key={l.id ?? `o${i}`} className="flex justify-between gap-3 text-gray-600"><span>{l.label} · pago a ti, desconta a parte da equipa</span><span className="font-semibold text-green-700">−{euros(l.amount)}</span></p>
          ))}
        </div>
      )}

      {settlement.unassigned.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800">
          Sem equipa no calendário (não conta para ninguém): {settlement.unassigned.map(l => `${l.label} a ${dayMonth(l.date)}, ${euros(l.amount)}`).join("; ")}.
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl">
        <p className="px-4 py-3 text-sm font-semibold text-navy border-b border-gray-100">Pagamentos {isAll ? "das equipas" : `da ${team}`}</p>
        {groupHistory.length === 0
          ? <p className="px-4 py-6 text-sm text-gray-400 text-center">Ainda nenhum acerto registado aqui.</p>
          : groupHistory.map(h => (
            <div key={h.id} className="px-4 py-2 text-sm flex justify-between gap-3 border-b border-gray-50 last:border-0">
              <span className="text-gray-600">Domingo {dayMonth(h.cycle_end)} · {h.service_count} serviço{h.service_count === 1 ? "" : "s"}</span>
              <span className="font-semibold text-navy">{euros(Number(h.amount))}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

const STATUS: Record<WeekServiceStatus, [string, string]> = {
  pago: ["Pago", "bg-green-50 text-green-700 border-green-200"],
  por_pagar: ["Por pagar", "bg-red-50 text-red-700 border-red-200"],
  por_fazer: ["Por fazer", "bg-gray-50 text-gray-500 border-gray-200"],
  cliente_paga_dono: ["Paga-te a ti", "bg-blue-50 text-blue-700 border-blue-200"],
};

function StatusPill({ status }: { status: WeekServiceStatus }) {
  const [label, cls] = STATUS[status];
  return <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cls}`}>{label}</span>;
}

export default CrmSettlements;
