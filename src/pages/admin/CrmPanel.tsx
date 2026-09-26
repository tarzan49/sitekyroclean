import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, Plus, Download, RefreshCw, Search, Trash2, Pencil, X, Phone, CalendarDays } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CRM_LOCALITIES, type CalendarEvent, type CrmLocality } from "@/lib/calendarServices";
import { CALENDAR_SYNC_SINCE, planCalendarSync, type SyncPlan } from "@/lib/calendarSync";
import { lisbonDay, weekdayOf, WEEKDAY_SHORT } from "@/lib/crmClosings";
import CrmClosings from "./CrmClosings";

interface ServiceRequest {
  id: string;
  request_date: string; // YYYY-MM-DD
  description: string;
  client_name: string | null;
  city: string | null;
  billed_value: number;
  my_cut: number;
  paid: boolean;
  /** Vazia só em linhas do calendário cuja região não se conseguiu identificar (ver needs_review). */
  locality: CrmLocality | null;
  phone: string | null;
  source: string | null;
  created_at: string;
  /** Quando o serviço foi fechado: criação do evento no calendário, ou entrada no CRM. */
  booked_at: string | null;
  calendar_event_id: string | null;
  calendar_updated_at: string | null;
  calendar_missing_since: string | null;
  needs_review: string | null;
}

const LOCALITIES = CRM_LOCALITIES;
const SOURCES = ["Website", "WhatsApp", "Instagram", "Referência", "Google Calendar", "Outro"];

const MONTH_FMT = new Intl.DateTimeFormat("pt-PT", { month: "long", year: "numeric" });
const money = (n: number) => `${n.toFixed(2).replace(/\.00$/, "")}€`;
const TIME_FMT = new Intl.DateTimeFormat("pt-PT", { hour: "2-digit", minute: "2-digit" });

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** "sáb 26/09", em hora de Lisboa. */
function closedLabel(bookedAt: string | null) {
  if (!bookedAt) return "-";
  const day = lisbonDay(bookedAt);
  return `${WEEKDAY_SHORT[weekdayOf(day)].toLowerCase()} ${day.slice(8, 10)}/${day.slice(5, 7)}`;
}

type SyncState =
  | { status: "idle" | "running" | "not-configured" }
  | { status: "done"; at: Date; counts: SyncPlan["counts"] }
  | { status: "error"; message: string };

type FormState = {
  day: string;
  /** Data de fecho, AAAA-MM-DD. */
  booked_day: string;
  description: string;
  client_name: string;
  city: string;
  billed_value: string;
  my_cut: string;
  paid: boolean;
  locality: CrmLocality | "";
  phone: string;
  source: string;
};

const emptyForm = (): FormState => ({
  day: "",
  booked_day: lisbonDay(new Date()),
  description: "",
  client_name: "",
  city: "",
  billed_value: "",
  my_cut: "",
  paid: false,
  locality: "Porto",
  phone: "",
  source: "WhatsApp",
});

const CrmPanel = () => {
  const [records, setRecords] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"pedidos" | "fechos">("pedidos");
  const [sync, setSync] = useState<SyncState>({ status: "idle" });

  const [viewedMonth, setViewedMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const [search, setSearch] = useState("");
  const [filterLocality, setFilterLocality] = useState<string>("all");
  const [filterPaid, setFilterPaid] = useState<string>("all");

  const [formOpen, setFormOpen] = useState(false);
  const backdropMouseDownRef = useRef(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);

  const fetchRecords = useCallback(async (): Promise<ServiceRequest[] | null> => {
    setLoading(true);
    setError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: err } = await (supabase as any)
        .from("service_requests")
        .select("*")
        .order("request_date", { ascending: true });
      if (err) throw err;
      setRecords(data ?? []);
      return data ?? [];
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao carregar pedidos. Cria a tabela service_requests no Supabase primeiro.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cria e atualiza as linhas a partir dos eventos de serviço do Google
   * Calendar (função `calendar-events`). As regras estão em `calendarSync.ts`.
   * Devolve true se mudou alguma linha.
   */
  const syncCalendar = useCallback(async (rows: ServiceRequest[]): Promise<boolean> => {
    setSync({ status: "running" });
    try {
      const { data, error: fnError } = await supabase.functions.invoke("calendar-events", {
        body: { since: CALENDAR_SYNC_SINCE },
      });
      if (fnError || !data?.success) {
        if ((fnError as { context?: Response } | null)?.context?.status === 503) {
          setSync({ status: "not-configured" });
          return false;
        }
        throw new Error(data?.error ?? fnError?.message ?? "Erro ao ler o calendário");
      }
      const plan = planCalendarSync(rows, (data.events ?? []) as CalendarEvent[], {
        since: CALENDAR_SYNC_SINCE,
        now: new Date().toISOString(),
      });
      if (plan.inserts.length) {
        // ignoreDuplicates: dois separadores abertos não duplicam um serviço.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: err } = await (supabase as any).from("service_requests")
          .upsert(plan.inserts, { onConflict: "calendar_event_id", ignoreDuplicates: true });
        if (err) throw err;
      }
      for (const { id, patch } of plan.updates) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: err } = await (supabase as any).from("service_requests").update(patch).eq("id", id);
        if (err) throw err;
      }
      setSync({ status: "done", at: new Date(), counts: plan.counts });
      return plan.inserts.length + plan.updates.length > 0;
    } catch (e: unknown) {
      setSync({ status: "error", message: e instanceof Error ? e.message : String(e) });
      return false;
    }
  }, []);

  useEffect(() => {
    (async () => {
      const rows = await fetchRecords();
      if (rows && await syncCalendar(rows)) await fetchRecords();
    })();
  }, [fetchRecords, syncCalendar]);

  const runSync = async () => {
    const rows = await fetchRecords();
    if (rows && await syncCalendar(rows)) await fetchRecords();
  };

  const missingRows = useMemo(() => records.filter(r => r.calendar_missing_since), [records]);
  const reviewCount = useMemo(() => records.filter(r => r.needs_review).length, [records]);

  const monthRecords = useMemo(
    () => records.filter(r => monthKey(new Date(r.request_date + "T00:00:00")) === monthKey(viewedMonth)),
    [records, viewedMonth]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return monthRecords.filter(r => {
      if (filterLocality !== "all" && r.locality !== filterLocality) return false;
      if (filterPaid === "paid" && !r.paid) return false;
      if (filterPaid === "unpaid" && r.paid) return false;
      if (term && !(r.description.toLowerCase().includes(term) || (r.phone ?? "").toLowerCase().includes(term) || (r.city ?? "").toLowerCase().includes(term) || (r.client_name ?? "").toLowerCase().includes(term))) return false;
      return true;
    });
  }, [monthRecords, search, filterLocality, filterPaid]);

  const totals = useMemo(() => {
    const billed = monthRecords.reduce((s, r) => s + r.billed_value, 0);
    const cut = monthRecords.reduce((s, r) => s + r.my_cut, 0);
    const paid = monthRecords.filter(r => r.paid);
    const unpaid = monthRecords.filter(r => !r.paid);
    const byLocality = LOCALITIES.map(loc => {
      const rows = monthRecords.filter(r => r.locality === loc);
      return { loc, billed: rows.reduce((s, r) => s + r.billed_value, 0), cut: rows.reduce((s, r) => s + r.my_cut, 0), count: rows.length };
    }).filter(l => l.count > 0);
    return { billed, cut, paidCount: paid.length, unpaidCount: unpaid.length, unpaidValue: unpaid.reduce((s, r) => s + r.billed_value, 0), byLocality };
  }, [monthRecords]);

  const maxLocalityCut = Math.max(1, ...totals.byLocality.map(l => l.cut));

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setFormOpen(true);
  };

  const editingRecord = editingId ? records.find(r => r.id === editingId) ?? null : null;

  const openEdit = (r: ServiceRequest) => {
    setEditingId(r.id);
    setForm({
      day: String(new Date(r.request_date + "T00:00:00").getDate()),
      booked_day: r.booked_at ? lisbonDay(r.booked_at) : "",
      description: r.description,
      client_name: r.client_name ?? "",
      city: r.city ?? "",
      billed_value: String(r.billed_value),
      my_cut: String(r.my_cut),
      paid: r.paid,
      locality: r.locality ?? "",
      phone: r.phone ?? "",
      source: r.source ?? "",
    });
    setFormOpen(true);
  };

  const closeForm = () => { setFormOpen(false); setEditingId(null); };

  const handleSave = async () => {
    const day = parseInt(form.day, 10);
    if (!day || day < 1 || day > 31) { alert("Indica um dia válido (1-31)."); return; }
    if (!form.locality) { alert("Escolhe a localidade."); return; }
    const billed = parseFloat(form.billed_value.replace(",", ".")) || 0;
    const cut = parseFloat(form.my_cut.replace(",", ".")) || 0;
    const requestDate = `${viewedMonth.getFullYear()}-${String(viewedMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    // A data de fecho só se escreve quando muda: assim a hora exata (do evento
    // do calendário, ou do default now() numa linha nova de hoje) não se perde.
    // Um dia escolhido à mão fica ao meio-dia UTC, que é esse dia em Lisboa.
    const originalBookedDay = editingRecord?.booked_at ? lisbonDay(editingRecord.booked_at) : editingId ? "" : lisbonDay(new Date());
    const bookedAt = form.booked_day === originalBookedDay ? undefined : form.booked_day ? `${form.booked_day}T12:00:00Z` : null;

    setSaving(true);
    const payload = {
      request_date: requestDate,
      description: form.description.trim(),
      client_name: form.client_name.trim() || null,
      city: form.city.trim() || null,
      billed_value: billed,
      my_cut: cut,
      paid: form.paid,
      locality: form.locality,
      phone: form.phone.trim() || null,
      source: form.source || null,
      // Guardar no formulário é rever a linha.
      needs_review: null,
      ...(bookedAt !== undefined ? { booked_at: bookedAt } : {}),
    };
    try {
      if (editingId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: err } = await (supabase as any).from("service_requests").update(payload).eq("id", editingId);
        if (err) throw err;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: err } = await (supabase as any).from("service_requests").insert(payload);
        if (err) throw err;
      }
      closeForm();
      fetchRecords();
    } catch (e: unknown) {
      alert(`Erro ao guardar: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apagar este pedido definitivamente?")) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: err } = await (supabase as any).from("service_requests").delete().eq("id", id);
    if (!err) setRecords(prev => prev.filter(r => r.id !== id));
  };

  /** O evento foi apagado do calendário mas o serviço aconteceu: a linha passa a ser só do CRM. */
  const keepMissing = async (r: ServiceRequest) => {
    const patch = { calendar_event_id: null, calendar_updated_at: null, calendar_missing_since: null };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: err } = await (supabase as any).from("service_requests").update(patch).eq("id", r.id);
    if (!err) setRecords(prev => prev.map(x => x.id === r.id ? { ...x, ...patch } : x));
  };

  const togglePaid = async (r: ServiceRequest) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: err } = await (supabase as any).from("service_requests").update({ paid: !r.paid }).eq("id", r.id);
    if (!err) setRecords(prev => prev.map(x => x.id === r.id ? { ...x, paid: !x.paid } : x));
  };

  const exportCSV = () => {
    const headers = ["Dia", "Fechado", "Descrição", "Cliente", "Localidade", "Cidade", "Telefone", "Origem", "Faturado", "Meu Cut", "Pago"];
    const rows = filtered.map(r => [
      new Date(r.request_date + "T00:00:00").getDate(),
      r.booked_at ? lisbonDay(r.booked_at) : "",
      r.description, r.client_name ?? "", r.locality ?? "", r.city ?? "", r.phone ?? "", r.source ?? "",
      r.billed_value.toFixed(2), r.my_cut.toFixed(2), r.paid ? "Sim" : "Não",
    ].map(c => `"${String(c ?? "").replace(/"/g, '""')}"`));
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `kyro-crm-${monthKey(viewedMonth)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const monthLabel = MONTH_FMT.format(viewedMonth).replace(/^\w/, c => c.toUpperCase());

  return (
    <div className="space-y-4">
      {/* Header + month nav */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-navy">CRM — Pedidos de Serviço</h2>
          <p className="text-sm text-gray-500">
            {view === "pedidos" ? `${monthRecords.length} pedido${monthRecords.length === 1 ? "" : "s"} neste mês` : "Serviços fechados por dia"}
            {reviewCount > 0 && <span className="text-amber-700"> · {reviewCount} para rever</span>}
          </p>
          <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
            <CalendarDays className="w-3 h-3" />
            {sync.status === "idle" && "Google Calendar"}
            {sync.status === "running" && "A ler o Google Calendar…"}
            {sync.status === "done" && (
              sync.counts.added + sync.counts.updated + sync.counts.missing + sync.counts.restored === 0
                ? `Google Calendar em dia (${TIME_FMT.format(sync.at)})`
                : `Google Calendar (${TIME_FMT.format(sync.at)}): ${[
                    sync.counts.added && `${sync.counts.added} novo${sync.counts.added === 1 ? "" : "s"}`,
                    sync.counts.updated && `${sync.counts.updated} atualizado${sync.counts.updated === 1 ? "" : "s"}`,
                    sync.counts.missing && `${sync.counts.missing} apagado${sync.counts.missing === 1 ? "" : "s"} do calendário`,
                    sync.counts.restored && `${sync.counts.restored} de volta ao calendário`,
                  ].filter(Boolean).join(", ")}`
            )}
            {sync.status === "not-configured" && <span className="text-amber-700">Google Calendar por ligar: falta a secret GOOGLE_CALENDAR_ICS_URL no Supabase</span>}
            {sync.status === "error" && <span className="text-red-600">Não foi possível ler o Google Calendar: {sync.message}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {view === "pedidos" && (
            <>
              <div className="flex items-center gap-1 border border-gray-200 rounded-lg">
                <button onClick={() => setViewedMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))} className="p-2 text-navy hover:bg-gray-50 rounded-l-lg">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 text-sm font-semibold text-navy capitalize min-w-[140px] text-center">{monthLabel}</span>
                <button onClick={() => setViewedMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))} className="p-2 text-navy hover:bg-gray-50 rounded-r-lg">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <button onClick={openAdd} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#12121e] bg-gradient-to-r from-gold to-[#d4c57b] rounded-lg hover:opacity-90 transition-opacity">
                <Plus className="w-3.5 h-3.5" /> Adicionar pedido
              </button>
              <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 text-navy hover:border-navy/30 transition-colors">
                <Download className="w-3.5 h-3.5" /> Exportar CSV
              </button>
            </>
          )}
          <button onClick={runSync} disabled={loading || sync.status === "running"} title="Ler os eventos de serviço novos do Google Calendar"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 text-navy hover:border-navy/30 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${loading || sync.status === "running" ? "animate-spin" : ""}`} /> Sincronizar calendário
          </button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200" role="tablist">
        {([["pedidos", "Pedidos"], ["fechos", "Fechos"]] as const).map(([id, label]) => (
          <button key={id} role="tab" aria-selected={view === id} onClick={() => setView(id)}
            className={`px-4 py-2 text-sm font-semibold -mb-px border-b-2 transition-colors ${view === id ? "border-[#D4AF37] text-navy" : "border-transparent text-gray-500 hover:text-navy"}`}>
            {label}
          </button>
        ))}
      </div>

      {missingRows.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          {missingRows.length === 1 ? "1 serviço foi apagado" : `${missingRows.length} serviços foram apagados`} do Google Calendar ({missingRows.map(r => `${r.client_name ?? r.description} a ${new Date(r.request_date + "T00:00:00").getDate()}/${r.request_date.slice(5, 7)}`).join("; ")}).
          {" "}Se foi cancelado, apaga-o aqui; se o serviço se fez, carrega em <strong>Manter</strong> na linha.
        </div>
      )}

      {view === "fechos" && <CrmClosings records={records} />}

      {view === "pedidos" && (<>
      {/* Totals */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-gold/[0.10] to-gold/[0.02] border border-gold/25 rounded-xl p-4">
          <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total faturado</p>
          <p className="text-xl font-bold text-navy">{money(totals.billed)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">O meu cut</p>
          <p className="text-xl font-bold text-navy">{money(totals.cut)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Pagos</p>
          <p className="text-xl font-bold text-green-600">{totals.paidCount}</p>
        </div>
        <div className="bg-white border border-red-200 rounded-xl p-4">
          <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Por pagar</p>
          <p className="text-xl font-bold text-red-600">{totals.unpaidCount} <span className="text-xs font-medium text-red-500">({money(totals.unpaidValue)})</span></p>
        </div>
      </div>

      {/* Locality breakdown */}
      {totals.byLocality.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-bold text-gray-500 mb-3">Por localidade</p>
          {totals.byLocality.map(l => (
            <div key={l.loc} className="flex items-center gap-2.5 mb-2 last:mb-0">
              <span className="text-xs text-gray-600 w-16 flex-shrink-0">{l.loc}</span>
              <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-gold to-[#d4c57b]" style={{ width: `${(l.cut / maxLocalityCut) * 100}%` }} />
              </div>
              <span className="text-xs font-bold text-navy w-32 text-right flex-shrink-0">{money(l.cut)} <span className="text-gray-400 font-normal">/ {l.count}</span></span>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit form */}
      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/40 p-4 overflow-y-auto"
          onMouseDown={e => { backdropMouseDownRef.current = e.target === e.currentTarget; }}
          onClick={e => { if (backdropMouseDownRef.current && e.target === e.currentTarget) closeForm(); }}
        >
        <div className="bg-white border border-gold/30 rounded-xl p-4 space-y-3 w-full max-w-2xl my-auto shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-navy">{editingId ? "Editar pedido" : "Novo pedido"} — {monthLabel}</p>
            <button onClick={closeForm} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">Dia do mês</label>
              <input type="number" min={1} max={31} value={form.day} onChange={e => setForm(f => ({ ...f, day: e.target.value }))}
                className="w-full h-9 px-2.5 text-sm border border-gray-200 rounded-lg text-navy focus:outline-none focus:border-gold" placeholder="ex: 14" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">Localidade</label>
              <select value={form.locality} onChange={e => setForm(f => ({ ...f, locality: e.target.value as FormState["locality"] }))}
                className="w-full h-9 px-2.5 text-sm border border-gray-200 rounded-lg text-navy focus:outline-none focus:border-gold">
                {!form.locality && <option value="">Escolher…</option>}
                {LOCALITIES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">Cidade</label>
              <input type="text" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                placeholder="ex: Valongo"
                className="w-full h-9 px-2.5 text-sm border border-gray-200 rounded-lg text-navy focus:outline-none focus:border-gold" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">Origem</label>
              <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                className="w-full h-9 px-2.5 text-sm border border-gray-200 rounded-lg text-navy focus:outline-none focus:border-gold">
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 h-9 text-sm text-navy cursor-pointer select-none">
                <input type="checkbox" checked={form.paid} onChange={e => setForm(f => ({ ...f, paid: e.target.checked }))} className="rounded border-gray-300" />
                Pago
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">Descrição do pedido</label>
              <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="ex: colchão, sofá + cadeira, vários items"
                className="w-full h-9 px-2.5 text-sm border border-gray-200 rounded-lg text-navy focus:outline-none focus:border-gold" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">Nome do cliente</label>
              <input type="text" value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
                placeholder="ex: Maria Silva"
                className="w-full h-9 px-2.5 text-sm border border-gray-200 rounded-lg text-navy focus:outline-none focus:border-gold" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">Telefone do cliente</label>
              <input type="text" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="9xxxxxxxx"
                className="w-full h-9 px-2.5 text-sm border border-gray-200 rounded-lg text-navy focus:outline-none focus:border-gold" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">Valor faturado (€)</label>
              <input type="text" inputMode="decimal" value={form.billed_value} onChange={e => setForm(f => ({ ...f, billed_value: e.target.value }))}
                placeholder="0.00"
                className="w-full h-9 px-2.5 text-sm border border-gray-200 rounded-lg text-navy focus:outline-none focus:border-gold" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 mb-1 flex items-center justify-between">
                O meu valor / cut (€)
                <button type="button" onClick={() => setForm(f => ({ ...f, my_cut: f.billed_value }))} className="text-gold hover:underline font-medium">= faturado</button>
              </label>
              <input type="text" inputMode="decimal" value={form.my_cut} onChange={e => setForm(f => ({ ...f, my_cut: e.target.value }))}
                placeholder="0.00"
                className="w-full h-9 px-2.5 text-sm border border-gray-200 rounded-lg text-navy focus:outline-none focus:border-gold" />
            </div>
          </div>
          <div className="flex items-end gap-3 flex-wrap">
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">Data de fecho</label>
              <input type="date" value={form.booked_day} onChange={e => setForm(f => ({ ...f, booked_day: e.target.value }))}
                className="h-9 px-2.5 text-sm border border-gray-200 rounded-lg text-navy focus:outline-none focus:border-gold" />
            </div>
            <p className="text-[11px] text-gray-500 flex-1 min-w-[200px] pb-1">
              O dia em que fechaste o serviço, não o dia em que o fazes. É o que conta na aba Fechos.
            </p>
          </div>
          {editingRecord?.needs_review && (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Para rever: {editingRecord.needs_review}. Ao guardar, fica dado como revisto.
            </p>
          )}
          {editingRecord?.calendar_event_id && (
            <p className="text-[11px] text-gray-500">
              Criado a partir do Google Calendar. Se voltares a editar o evento no calendário, essa alteração substitui o que mudares aqui.
            </p>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={closeForm} className="px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancelar</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-xs font-bold text-[#12121e] bg-gradient-to-r from-gold to-[#d4c57b] rounded-lg hover:opacity-90 disabled:opacity-50">
              {saving ? "A guardar..." : "Guardar"}
            </button>
          </div>
        </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Procurar por descrição ou telefone..."
            className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-gray-200 focus:border-gold focus:outline-none text-navy placeholder:text-gray-400" />
        </div>
        <select value={filterLocality} onChange={e => setFilterLocality(e.target.value)} className="h-9 px-3 text-xs font-medium bg-white border border-gray-200 rounded-lg text-navy focus:outline-none focus:border-gold">
          <option value="all">Todas as localidades</option>
          {LOCALITIES.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <select value={filterPaid} onChange={e => setFilterPaid(e.target.value)} className="h-9 px-3 text-xs font-medium bg-white border border-gray-200 rounded-lg text-navy focus:outline-none focus:border-gold">
          <option value="all">Todos os estados</option>
          <option value="paid">Pago</option>
          <option value="unpaid">Por pagar</option>
        </select>
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          Erro ao carregar pedidos: {error}. Confirma que a tabela <code className="bg-red-100 px-1 rounded">service_requests</code> existe no Supabase (migration <code className="bg-red-100 px-1 rounded">20260911000000_add_service_requests.sql</code>).
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {["Dia", "Fechado", "Descrição", "Cliente", "Localidade", "Cidade", "Telefone", "Origem", "Faturado", "Meu cut", "Pago", ""].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={12} className="text-center py-10 text-gray-400">A carregar...</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={12} className="text-center py-10 text-gray-400">
                  {monthRecords.length === 0 ? `Ainda não há pedidos registados em ${monthLabel}.` : "Nenhum pedido corresponde aos filtros."}
                </td></tr>
              )}
              {filtered.map((r, i) => (
                <tr key={r.id} className={`border-b border-gray-100 ${!r.paid ? "bg-red-50/60" : (i % 2 === 0 ? "" : "bg-gray-50/50")}`}>
                  <td className="px-3 py-2 font-mono text-navy">{new Date(r.request_date + "T00:00:00").getDate()}</td>
                  <td className="px-3 py-2 text-gray-500 whitespace-nowrap" title={r.booked_at ? new Date(r.booked_at).toLocaleString("pt-PT", { timeZone: "Europe/Lisbon" }) : "Sem data de fecho"}>{closedLabel(r.booked_at)}</td>
                  <td className="px-3 py-2 text-navy font-medium max-w-[260px]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {r.calendar_event_id && <CalendarDays className="w-3 h-3 text-gray-400 flex-shrink-0" aria-label="Criado a partir do Google Calendar" />}
                      <span className="truncate">{r.description || "-"}</span>
                      {r.calendar_missing_since && (
                        <span className="flex-shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-300">Apagado no calendário</span>
                      )}
                      {r.needs_review && (
                        <button onClick={() => openEdit(r)} title={r.needs_review}
                          className="flex-shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">Rever</button>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-gray-600 max-w-[160px] truncate">{r.client_name || "-"}</td>
                  <td className={`px-3 py-2 ${r.locality ? "text-gray-600" : "text-amber-700 font-semibold"}`}>{r.locality ?? "?"}</td>
                  <td className="px-3 py-2 text-gray-500">{r.city || "-"}</td>
                  <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                    {r.phone ? (
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-gray-400" />{r.phone}</span>
                    ) : "-"}
                  </td>
                  <td className="px-3 py-2 text-gray-500">{r.source || "-"}</td>
                  <td className="px-3 py-2 font-semibold text-navy whitespace-nowrap">{money(r.billed_value)}</td>
                  <td className="px-3 py-2 font-semibold text-gold whitespace-nowrap">{money(r.my_cut)}</td>
                  <td className="px-3 py-2">
                    <button onClick={() => togglePaid(r)} className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${r.paid ? "bg-green-50 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-300"}`}>
                      {r.paid ? "Pago" : "Por pagar"}
                    </button>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {r.calendar_missing_since && (
                        <button onClick={() => keepMissing(r)} title="O serviço fez-se: manter a linha e desligá-la do calendário"
                          className="px-2 py-1 text-[10px] font-bold rounded-md border border-gray-200 text-navy hover:bg-gray-50">Manter</button>
                      )}
                      <button onClick={() => openEdit(r)} className="p-1.5 text-gray-400 hover:text-navy hover:bg-gray-100 rounded-md"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(r.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </>)}
    </div>
  );
};

export default CrmPanel;
