import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Copy, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lisbonDay } from "@/lib/crmClosings";
import { CALENDAR_FETCH_SINCE } from "@/lib/calendarSync";
import type { CalendarEvent } from "@/lib/calendarServices";
import { euros, type AccountAdjustment, type AccountEvent, type AccountRow } from "@/lib/teamAccounts";
import { weeklySettlement, type SettlementGroup } from "@/lib/weeklySettlement";
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

function CrmSettlements({ records, onChanged }: { records: AccountRow[]; onChanged: () => Promise<unknown> | void }) {
  const [events, setEvents] = useState<AccountEvent[] | null>(null);
  const [adjustments, setAdjustments] = useState<AdjustmentRow[]>([]);
  const [history, setHistory] = useState<SettlementRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const today = lisbonDay(new Date());

  const load = useCallback(async () => {
    setError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;
      const [cal, adj, hist] = await Promise.all([
        supabase.functions.invoke("calendar-events", { body: { since: CALENDAR_FETCH_SINCE } }),
        db.from("team_account_adjustments").select("id, team, day, label, amount").is("settled_at", null),
        db.from("team_settlements").select("id, group_id, group_label, cycle_end, amount, service_count, paid_at").order("paid_at", { ascending: false }).limit(30),
      ]);
      if (cal.error || !cal.data?.success) throw new Error(cal.data?.error ?? cal.error?.message ?? "Erro ao ler o calendário");
      if (adj.error) throw adj.error;
      if (hist.error) throw hist.error;
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

  const copyMessages = async (g: SettlementGroup) => {
    await navigator.clipboard.writeText(g.teams.map(t => t.message).join("\n\n---\n\n"));
    setCopied(g.id);
    setTimeout(() => setCopied(c => (c === g.id ? null : c)), 2000);
  };

  const settle = async (g: SettlementGroup) => {
    if (!settlement?.canSettle) return;
    if (!confirm(`${g.label} pagou ${euros(g.total)}? Os ${g.serviceCount} serviços ficam dados como pagos e as contas voltam a zero.`)) return;
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

  if (!settlement) return <p className="text-center py-10 text-sm text-gray-400">{error ?? "A carregar as contas..."}</p>;

  const grand = settlement.groups.reduce((s, g) => s + g.total, 0);

  return (
    <div className="space-y-4">
      <div className="bg-navy text-white rounded-xl px-4 py-4">
        <p className="text-xs uppercase tracking-wide text-white/60">Acerto de domingo {dayMonth(settlement.cycleEnd)}</p>
        <p className="text-3xl font-bold mt-1">{euros(grand)}</p>
        <p className="text-xs text-white/70 mt-1">
          De {dayMonth(settlement.cycleStart)} a {dayMonth(settlement.cycleEnd)}, mais o que ficou por pagar de antes.{" "}
          {settlement.canSettle ? "Hoje é dia de acerto." : "Só se fecha ao domingo."}
        </p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}

      {settlement.unassigned.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          {settlement.unassigned.length} serviço{settlement.unassigned.length === 1 ? "" : "s"} por pagar sem equipa no calendário ({euros(settlement.unassigned.reduce((s, l) => s + l.amount, 0))}) não entra{settlement.unassigned.length === 1 ? "" : "m"} em nenhum grupo: {settlement.unassigned.map(l => `${l.label} a ${dayMonth(l.date)}`).join("; ")}.
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        {settlement.groups.map(g => (
          <div key={g.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
            <div>
              <p className="text-sm font-semibold text-navy">{g.label}</p>
              <p className="text-2xl font-bold text-navy mt-0.5">{euros(g.total)}</p>
              <p className="text-xs text-gray-500">
                {g.serviceCount} serviço{g.serviceCount === 1 ? "" : "s"}
                {g.vat > 0 && <> · dos quais {euros(g.vat)} de IVA a entregar ao Estado</>}
              </p>
              {g.overdue > 0 && (
                <p className="mt-1 inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700 border border-red-300">
                  {euros(g.overdue)} de semanas anteriores por pagar
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button onClick={() => settle(g)} disabled={!settlement.canSettle || g.total <= 0 || busy !== null}
                title={settlement.canSettle ? "Dar como pago e repor as contas a zero" : "Só se pode fechar ao domingo"}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-[#D4AF37] text-navy disabled:opacity-40 disabled:cursor-not-allowed">
                {settlement.canSettle ? <Check className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                {busy === g.id ? "A fechar..." : "Equipa pagou"}
              </button>
              <button onClick={() => copyMessages(g)} disabled={!g.teams.length} title="Copiar a mensagem das contas para enviar"
                className="px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 text-navy disabled:opacity-40">
                {copied === g.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {g.teams.length > 0 && (
              <button onClick={() => setOpen(o => (o === g.id ? null : g.id))} className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-navy">
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open === g.id ? "rotate-180" : ""}`} /> Ver serviços
              </button>
            )}
            {open === g.id && g.teams.map(t => (
              <div key={t.team} className="border-t border-gray-100 pt-2 space-y-1">
                <p className="text-xs font-bold text-navy">{t.team} · {euros(t.total)}</p>
                {[...t.before, ...t.today].map((l, i) => (
                  <p key={l.id ?? i} className="text-xs text-gray-600 flex justify-between gap-2">
                    <span>{dayMonth(l.date)} · {l.label}</span><span className="font-medium">{euros(l.amount)}</span>
                  </p>
                ))}
                {t.adjustments.map((l, i) => (
                  <p key={l.id ?? `a${i}`} className="text-xs text-gray-600 flex justify-between gap-2">
                    <span>{l.label}</span><span className="font-medium">{euros(l.amount)}</span>
                  </p>
                ))}
                {t.ownerOwes.length > 0 && (
                  <p className="text-xs text-gray-500">Descontado: {euros(t.ownerOwes.reduce((s, l) => s + l.amount, 0))} pagos diretamente a ti</p>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl">
        <p className="px-4 py-3 text-sm font-semibold text-navy border-b border-gray-100">Pagamentos registados</p>
        {history.length === 0
          ? <p className="px-4 py-6 text-sm text-gray-400 text-center">Ainda nenhum acerto fechado.</p>
          : history.map(h => (
            <div key={h.id} className="px-4 py-2 text-sm flex justify-between gap-3 border-b border-gray-50 last:border-0">
              <span className="text-gray-600">Domingo {dayMonth(h.cycle_end)} · {h.group_label} · {h.service_count} serviço{h.service_count === 1 ? "" : "s"}</span>
              <span className="font-semibold text-navy">{euros(Number(h.amount))}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

export default CrmSettlements;
