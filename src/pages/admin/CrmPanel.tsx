import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, Plus, Download, RefreshCw, Search, Trash2, Pencil, X, Phone, CalendarDays } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CRM_LOCALITIES, type CrmLocality } from "@/lib/calendarServices";
import type { SyncPlan } from "@/lib/calendarSync";
import { syncCalendarIntoCrm } from "@/lib/crmCalendarSync";
import { lisbonDay, weekdayOf, WEEKDAY_SHORT } from "@/lib/crmClosings";
import CrmUpsell from "./CrmUpsell";
import CrmServiceMix from "./CrmServiceMix";
import { computeServiceCloseRates } from "@/lib/crmServiceCloseRate";
import CrmReviews from "./CrmReviews";
import { summarizeQuizLeads, QUIZ_BADGE, type QuizLeadRow, type WhatsAppContactRow } from "@/lib/crmQuizLeads";
import { UPSELL_TEAMS, UPSELL_TEXT, ownerUpsellOf, defaultTeamFor, isUpsellTeam, splitUpsell, tieredUpsell, type UpsellTeam } from "@/lib/crmUpsell";
import { INVOICE_VAT, invoiceStatusOf, invoiceVatOf, ownerServiceCutWithoutVat, upsellWithoutVatOf, vatToDeliverOf } from "@/lib/invoiceVat";
import { INVOICE_CHIP, dayMonth, invoiceTitle, money, vatLine } from "./crmInvoiceUi";
import CrmVat from "./CrmVat";

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
  /** Vendido a mais pela equipa no serviço; fora de billed_value e de my_cut. A parte do dono soma-se ao cut só no ecrã (ver cutOf). */
  upsell_value: number | null;
  upsell_team: string | null;
  /** Com fatura: o valor tem o IVA de 23% lá dentro (src/lib/invoiceVat.ts). invoice_ref = nome e NIF da fatura. */
  invoiced: boolean;
  invoice_ref: string | null;
  /** Dia da fatura; vazio com `invoiced` = fatura por passar. */
  invoice_issued_on: string | null;
  /** Quem passou a fatura: "Empresa" ou "Francisco" (até 20/10/2026). */
  invoice_by: string | null;
  /** Fatura de só uma parte do serviço: o valor dessa parte, com IVA. Vazio = o serviço todo. */
  invoice_value: number | null;
  /** IVA à parte (por cima do preço combinado); false = IVA incluído no preço. O valor faturado tem sempre o IVA. */
  vat_on_top: boolean;
  /** A equipa pediu a avaliação ao cliente; sem isso as contas da noite somam 5% do valor (src/lib/teamAccounts.ts). */
  review_requested: boolean;
}

const LOCALITIES = CRM_LOCALITIES;
const SOURCES = ["Website", "WhatsApp", "Instagram", "Referência", "Google Calendar", "Google Ads", "Meta Ads", "Outro"];

const MONTH_FMT = new Intl.DateTimeFormat("pt-PT", { month: "long", year: "numeric" });
// O cut mostrado = my_cut + a parte do dono no upsell. Não se escreve em my_cut:
// a sincronização do calendário reescreve-o a partir do título do evento.
// Com fatura da empresa, o cut não leva o IVA (dono, 2026-10-27): é metade do valor
// sem IVA, como nas contas das equipas, e o IVA aparece à parte (vatToDeliverOf).
const ownerUpsellNetOf = (r: ServiceRequest) => ownerUpsellOf({ ...r, upsell_value: upsellWithoutVatOf(r) });
const cutOf = (r: ServiceRequest) => round2((ownerServiceCutWithoutVat(r) ?? r.my_cut) + ownerUpsellNetOf(r));
const TIME_FMT = new Intl.DateTimeFormat("pt-PT", { hour: "2-digit", minute: "2-digit" });
const round2 = (n: number) => Math.round(n * 100) / 100;
const parseEuros = (v: string) => parseFloat(v.replace(",", "."));

// Filtros da aba Pedidos (dono, 2026-10-27: "um botão de filtro [...] por pagar,
// por fatura [...] em vez de me aparecer todas as informações, aparece só uma").
// As faturas saíram daqui para a aba "Faturas e IVA" (dono, 2026-10-27).
type StatusFilter = "all" | "unpaid" | "paid" | "review";
const STATUS_FILTERS: ReadonlyArray<readonly [StatusFilter, string]> = [
  ["all", "Todos"], ["unpaid", "Por pagar"], ["paid", "Pagos"], ["review", "Para rever"],
];
const matchesStatus = (r: ServiceRequest, f: StatusFilter) => {
  switch (f) {
    case "unpaid": return !r.paid;
    case "paid": return r.paid;
    case "review": return !!r.needs_review;
    default: return true;
  }
};

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
  invoiced: boolean;
  invoice_ref: string;
  /** AAAA-MM-DD; vazio = fatura por passar. */
  invoice_issued_on: string;
  invoice_by: "Empresa" | "Francisco";
  /** Fatura de só uma parte do serviço; vazio = o serviço todo. */
  invoice_value: string;
  vat_on_top: boolean;
  review_requested: boolean;
  locality: CrmLocality | "";
  phone: string;
  source: string;
  upsell_value: string;
  upsell_team: UpsellTeam;
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
  invoiced: false,
  invoice_ref: "",
  invoice_issued_on: "",
  invoice_by: "Empresa",
  invoice_value: "",
  vat_on_top: false,
  review_requested: false,
  locality: "Porto",
  phone: "",
  source: "WhatsApp",
  upsell_value: "",
  upsell_team: "Porto 1",
});

const CrmPanel = () => {
  const [records, setRecords] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"pedidos" | "iva" | "servicos" | "avaliacoes" | "upsell">("pedidos");
  const [sync, setSync] = useState<SyncState>({ status: "idle" });
  const [quizLeads, setQuizLeads] = useState<QuizLeadRow[] | null>(null);
  const [waContacts, setWaContacts] = useState<WhatsAppContactRow[] | null>(null);

  const [viewedMonth, setViewedMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const [search, setSearch] = useState("");
  const [filterLocality, setFilterLocality] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  /** Os filtros olham para todos os meses, não só para o mês aberto. */
  const [allMonths, setAllMonths] = useState(false);

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
      const result = await syncCalendarIntoCrm(rows);
      if (result.status === "not-configured") {
        setSync({ status: "not-configured" });
        return false;
      }
      setSync({ status: "done", at: new Date(), counts: result.counts });
      return result.changed;
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

  // Pedidos do questionário, para ligar ao CRM pelo telefone (crmQuizLeads.ts).
  const fetchQuizLeads = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error: err } = await (supabase as any)
      .from("leads")
      .select("id, created_at, name, phone, service, location, value, source, whatsapp_phone")
      .order("created_at", { ascending: true });
    if (err) return;
    setQuizLeads((data ?? []) as QuizLeadRow[]);
    // Contactos do WhatsApp, para comparar; se a leitura falhar, a aba mostra só o questionário.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: contacts } = await (supabase as any).from("clients").select("phone, first_contact_at, status, services");
    setWaContacts((contacts ?? null) as WhatsAppContactRow[] | null);
  }, []);

  useEffect(() => { fetchQuizLeads(); }, [fetchQuizLeads]);

  const quizSummary = useMemo(() => quizLeads ? summarizeQuizLeads(quizLeads, records) : null, [quizLeads, records]);

  const runSync = async () => {
    fetchQuizLeads();
    const rows = await fetchRecords();
    if (rows && await syncCalendar(rows)) await fetchRecords();
  };

  const missingRows = useMemo(() => records.filter(r => r.calendar_missing_since), [records]);
  const reviewCount = useMemo(() => records.filter(r => r.needs_review).length, [records]);

  const monthRecords = useMemo(
    () => records.filter(r => monthKey(new Date(r.request_date + "T00:00:00")) === monthKey(viewedMonth)),
    [records, viewedMonth]
  );

  // Localidade e pesquisa, no mês aberto ou em todos; o estado filtra-se por cima, para os botões terem o número de cada um.
  const scoped = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (allMonths ? records : monthRecords).filter(r => {
      if (filterLocality !== "all" && r.locality !== filterLocality) return false;
      if (term && !(r.description.toLowerCase().includes(term) || (r.phone ?? "").toLowerCase().includes(term) || (r.city ?? "").toLowerCase().includes(term) || (r.client_name ?? "").toLowerCase().includes(term))) return false;
      return true;
    });
  }, [allMonths, records, monthRecords, search, filterLocality]);

  const statusCounts = useMemo(
    () => Object.fromEntries(STATUS_FILTERS.map(([id]) => [id, scoped.filter(r => matchesStatus(r, id)).length])) as Record<StatusFilter, number>,
    [scoped]
  );

  const filtered = useMemo(() => scoped.filter(r => matchesStatus(r, statusFilter)), [scoped, statusFilter]);

  const filteredSums = useMemo(() => ({
    billed: round2(filtered.reduce((s, r) => s + r.billed_value + (Number(r.upsell_value) || 0), 0)),
    cut: round2(filtered.reduce((s, r) => s + cutOf(r), 0)),
    vat: round2(filtered.reduce((s, r) => s + vatToDeliverOf(r, lisbonDay(new Date())), 0)),
  }), [filtered]);

  /** Carregar outra vez no filtro ligado volta a "Todos". */
  const pickStatus = (f: StatusFilter) => setStatusFilter(prev => (prev === f ? "all" : f));

  const totals = useMemo(() => {
    const billed = monthRecords.reduce((s, r) => s + r.billed_value, 0);
    const cut = monthRecords.reduce((s, r) => s + cutOf(r), 0);
    const upsellCut = monthRecords.reduce((s, r) => s + ownerUpsellNetOf(r), 0);
    const paid = monthRecords.filter(r => r.paid);
    const unpaid = monthRecords.filter(r => !r.paid);
    const byLocality = LOCALITIES.map(loc => {
      const rows = monthRecords.filter(r => r.locality === loc);
      return { loc, billed: rows.reduce((s, r) => s + r.billed_value, 0), cut: rows.reduce((s, r) => s + cutOf(r), 0), count: rows.length };
    }).filter(l => l.count > 0);
    const inv = monthRecords.filter(r => r.invoiced);
    const noInv = monthRecords.filter(r => !r.invoiced);
    const invoicedValue = inv.reduce((s, r) => s + r.billed_value, 0);
    const notInvoicedValue = noInv.reduce((s, r) => s + r.billed_value, 0);
    const invoicedVat = round2(inv.reduce((s, r) => s + vatToDeliverOf(r, lisbonDay(new Date())), 0));
    const toIssueCount = inv.filter(r => invoiceStatusOf(r) === "to_issue").length;
    return { invoicedCount: inv.length, invoicedValue, invoicedVat, toIssueCount, notInvoicedCount: noInv.length, notInvoicedValue, billed, cut, upsellCut, paidCount: paid.length, unpaidCount: unpaid.length, unpaidValue: unpaid.reduce((s, r) => s + r.billed_value, 0), byLocality };
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
      invoiced: r.invoiced,
      invoice_ref: r.invoice_ref ?? "",
      invoice_issued_on: r.invoice_issued_on ?? "",
      invoice_by: r.invoice_by === "Francisco" ? "Francisco" : "Empresa",
      invoice_value: r.invoice_value != null ? String(r.invoice_value) : "",
      vat_on_top: r.vat_on_top,
      review_requested: r.review_requested,
      locality: r.locality ?? "",
      phone: r.phone ?? "",
      source: r.source ?? "",
      upsell_value: r.upsell_value ? String(r.upsell_value) : "",
      upsell_team: isUpsellTeam(r.upsell_team) ? r.upsell_team : defaultTeamFor(r.locality),
    });
    setFormOpen(true);
  };

  /** O formulário escreve o dia no mês aberto: com "Todos os meses", abre primeiro o mês do serviço. */
  const editRow = (r: ServiceRequest) => {
    const [y, m] = r.request_date.split("-").map(Number);
    setViewedMonth(new Date(y, m - 1, 1));
    openEdit(r);
  };

  const closeForm = () => { setFormOpen(false); setEditingId(null); };

  const handleSave = async () => {
    const day = parseInt(form.day, 10);
    if (!day || day < 1 || day > 31) { alert("Indica um dia válido (1-31)."); return; }
    if (!form.locality) { alert("Escolhe a localidade."); return; }
    const billed = parseFloat(form.billed_value.replace(",", ".")) || 0;
    const cut = parseFloat(form.my_cut.replace(",", ".")) || 0;
    const upsell = Math.max(0, parseFloat(form.upsell_value.replace(",", ".")) || 0);
    const invoiceValue = form.invoiced && form.invoice_value.trim() ? parseEuros(form.invoice_value) : null;
    if (invoiceValue !== null && !(invoiceValue >= 0)) { alert("O valor na fatura não é um número."); return; }
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
      invoiced: form.invoiced,
      invoice_ref: form.invoiced ? form.invoice_ref.trim() || null : null,
      invoice_issued_on: form.invoiced ? form.invoice_issued_on || null : null,
      invoice_by: form.invoiced ? form.invoice_by : null,
      invoice_value: invoiceValue,
      vat_on_top: form.invoiced && form.vat_on_top,
      review_requested: form.review_requested,
      locality: form.locality,
      phone: form.phone.trim() || null,
      source: form.source || null,
      upsell_value: upsell,
      upsell_team: upsell > 0 ? form.upsell_team : null,
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
    const db = supabase as any;
    // Com o evento ainda no calendário, a sincronização voltava a criar a linha.
    const eventId = records.find(r => r.id === id)?.calendar_event_id;
    if (eventId) {
      const { error: ignoreErr } = await db.from("crm_ignored_calendar_events")
        .upsert({ event_id: eventId }, { onConflict: "event_id", ignoreDuplicates: true });
      if (ignoreErr) { alert(`Erro ao apagar: ${ignoreErr.message}`); return; }
    }
    const { error: err } = await db.from("service_requests").delete().eq("id", id);
    if (err) { alert(`Erro ao apagar: ${err.message}`); return; }
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  /** O evento foi apagado do calendário mas o serviço aconteceu: a linha passa a ser só do CRM. */
  const keepMissing = async (r: ServiceRequest) => {
    const patch = { calendar_event_id: null, calendar_updated_at: null, calendar_missing_since: null };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: err } = await (supabase as any).from("service_requests").update(patch).eq("id", r.id);
    if (!err) setRecords(prev => prev.map(x => x.id === r.id ? { ...x, ...patch } : x));
  };

  /**
   * Sem fatura → fatura por passar → fatura passada (hoje). Uma fatura passada
   * abre o formulário: voltar atrás, ou mudar a data, faz-se lá, nunca com um toque.
   */
  const advanceInvoice = async (r: ServiceRequest) => {
    const status = invoiceStatusOf(r);
    if (status === "issued") { editRow(r); return; }
    const patch = status === "none"
      ? { invoiced: true, invoice_by: r.invoice_by ?? "Empresa", invoice_issued_on: null }
      : { invoice_issued_on: lisbonDay(new Date()), invoice_by: r.invoice_by ?? "Empresa" };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: err } = await (supabase as any).from("service_requests").update(patch).eq("id", r.id);
    if (err) { alert(`Erro ao guardar a fatura: ${err.message}`); return; }
    setRecords(prev => prev.map(x => x.id === r.id ? { ...x, ...patch } : x));
  };

  const togglePaid = async (r: ServiceRequest) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: err } = await (supabase as any).from("service_requests").update({ paid: !r.paid }).eq("id", r.id);
    if (!err) setRecords(prev => prev.map(x => x.id === r.id ? { ...x, paid: !x.paid } : x));
  };

  const exportCSV = () => {
    const headers = ["Dia", "Fechado", "Descrição", "Cliente", "Localidade", "Cidade", "Telefone", "Origem", "Faturado", "Meu Cut (com upsell)", "Upsell", "Equipa upsell", "Pago", "Fatura", "IVA", "IVA à parte", "Valor na fatura", "Fatura passada em", "Fatura passada por", "Dados da fatura", "Avaliação pedida"];
    const rows = filtered.map(r => [
      allMonths ? r.request_date : new Date(r.request_date + "T00:00:00").getDate(),
      r.booked_at ? lisbonDay(r.booked_at) : "",
      r.description, r.client_name ?? "", r.locality ?? "", r.city ?? "", r.phone ?? "", quizSummary?.quizServiceIds.has(r.id) ? [r.source, QUIZ_BADGE].filter(Boolean).join(" + ") : r.source ?? "",
      r.billed_value.toFixed(2), cutOf(r).toFixed(2), (Number(r.upsell_value) || 0).toFixed(2), r.upsell_team ?? "", r.paid ? "Sim" : "Não", INVOICE_CHIP[invoiceStatusOf(r)].long, r.invoiced ? invoiceVatOf(r).toFixed(2) : "", r.invoiced ? (r.vat_on_top ? "Sim" : "Não, incluído no preço") : "", r.invoice_value != null ? Number(r.invoice_value).toFixed(2) : "", r.invoice_issued_on ?? "", r.invoiced ? r.invoice_by ?? "" : "", r.invoice_ref ?? "", r.review_requested ? "Sim" : "Não",
    ].map(c => `"${String(c ?? "").replace(/"/g, '""')}"`));
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `kyro-crm-${allMonths ? "todos-os-meses" : monthKey(viewedMonth)}${statusFilter === "all" ? "" : `-${statusFilter}`}.csv`;
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
            {view === "avaliacoes" ? "Avaliações do Google por mês e por serviço" : view === "upsell" ? "O que as equipas venderam a mais e a divisão" : `${monthRecords.length} pedido${monthRecords.length === 1 ? "" : "s"} neste mês`}
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
          {(view === "pedidos" || view === "servicos") && (
              <div className="flex items-center gap-1 border border-gray-200 rounded-lg">
                <button onClick={() => setViewedMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))} className="p-2 text-navy hover:bg-gray-50 rounded-l-lg">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 text-sm font-semibold text-navy capitalize min-w-[140px] text-center">{monthLabel}</span>
                <button onClick={() => setViewedMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))} className="p-2 text-navy hover:bg-gray-50 rounded-r-lg">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
          )}
          {view === "pedidos" && (
            <>
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

      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto" role="tablist">
        {([["pedidos", "Pedidos"], ["iva", "Faturas e IVA"], ["servicos", "Serviços"], ["avaliacoes", "Avaliações"], ["upsell", "Upsell"]] as const).map(([id, label]) => (
          <button key={id} role="tab" aria-selected={view === id} onClick={() => setView(id)}
            className={`px-4 py-2 text-sm font-semibold whitespace-nowrap -mb-px border-b-2 transition-colors ${view === id ? "border-[#D4AF37] text-navy" : "border-transparent text-gray-500 hover:text-navy"}`}>
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

      {view === "servicos" && (
        <CrmServiceMix monthLabel={monthLabel}
          records={monthRecords.map(r => ({ ...r, my_cut: cutOf(r) }))}
          allRecords={records.map(r => ({ ...r, my_cut: cutOf(r) }))}
          closeRates={quizSummary || waContacts ? computeServiceCloseRates(monthKey(viewedMonth), quizSummary, waContacts, records) : null} />
      )}

      {view === "iva" && <CrmVat records={records} onTogglePaid={togglePaid} onAdvanceInvoice={advanceInvoice} onEdit={editRow} />}

      {view === "avaliacoes" && <CrmReviews services={records} />}


      {view === "upsell" && <CrmUpsell records={records} onEdit={id => {
        const r = records.find(x => x.id === id);
        if (!r) return;
        // O formulário escreve o dia no mês aberto na aba Pedidos: tem de ser o do serviço.
        const [y, m] = r.request_date.split("-").map(Number);
        setViewedMonth(new Date(y, m - 1, 1));
        openEdit(r);
      }} />}

      {view === "pedidos" && (<>
      {/* Totals */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <div className="bg-gradient-to-br from-gold/[0.10] to-gold/[0.02] border border-gold/25 rounded-xl p-4">
          <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total faturado</p>
          <p className="text-xl font-bold text-navy">{money(totals.billed)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">O meu cut</p>
          <p className="text-xl font-bold text-navy">{money(totals.cut)}</p>
          {totals.upsellCut > 0 && <p className={`text-[11px] font-medium ${UPSELL_TEXT}`}>inclui {money(totals.upsellCut)} de upsell</p>}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Ticket médio</p>
          <p className="text-xl font-bold text-navy">{money(monthRecords.length ? Math.round(totals.billed / monthRecords.length * 100) / 100 : 0)}</p>
          <p className="text-[11px] text-gray-500">{monthRecords.length ? money(Math.round(totals.cut / monthRecords.length * 100) / 100) : "0€"} para ti</p>
        </div>
        <button type="button" onClick={() => pickStatus("paid")} aria-pressed={statusFilter === "paid"}
          className={`text-left bg-white border rounded-xl p-4 transition-colors ${statusFilter === "paid" ? "border-navy ring-1 ring-navy" : "border-gray-200 hover:border-navy/30"}`}>
          <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Pagos</p>
          <p className="text-xl font-bold text-green-600">{totals.paidCount}</p>
        </button>
        <button type="button" onClick={() => pickStatus("unpaid")} aria-pressed={statusFilter === "unpaid"}
          className={`text-left bg-white border rounded-xl p-4 transition-colors ${statusFilter === "unpaid" ? "border-red-500 ring-1 ring-red-500" : "border-red-200 hover:border-red-300"}`}>
          <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Por pagar</p>
          <p className="text-xl font-bold text-red-600">{totals.unpaidCount} <span className="text-xs font-medium text-red-500">({money(totals.unpaidValue)})</span></p>
        </button>
        <button type="button" onClick={() => setView("iva")} title="Abrir as faturas e o IVA de cada mês"
          className="text-left bg-white border border-blue-200 rounded-xl p-4 transition-colors hover:border-blue-400">
          <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Com fatura</p>
          <p className="text-xl font-bold text-navy">{totals.invoicedCount} <span className="text-xs font-medium text-gray-500">({money(totals.invoicedValue)})</span></p>
          {totals.invoicedVat > 0 && <p className="text-[11px] font-medium text-blue-700 mt-0.5">IVA a entregar {money(totals.invoicedVat)}</p>}
          {totals.toIssueCount > 0 && <p className="text-[11px] font-semibold text-amber-700">{totals.toIssueCount} por passar</p>}
          <p className="text-[11px] font-semibold text-blue-700 mt-0.5">Ver faturas e IVA ›</p>
        </button>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Sem fatura</p>
          <p className="text-xl font-bold text-navy">{totals.notInvoicedCount} <span className="text-xs font-medium text-gray-500">({money(totals.notInvoicedValue)})</span></p>
          <p className="text-[11px] text-gray-500 mt-0.5">{totals.invoicedValue + totals.notInvoicedValue > 0 ? Math.round(totals.notInvoicedValue / (totals.invoicedValue + totals.notInvoicedValue) * 100) : 0}% do valor do mês</p>
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

      {/* Filtro por estado: um de cada vez */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1" role="group" aria-label="Filtrar pedidos por estado">
          {STATUS_FILTERS.map(([id, label]) => {
            const active = statusFilter === id;
            return (
              <button key={id} type="button" onClick={() => setStatusFilter(id)} aria-pressed={active}
                className={`shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold border transition-colors ${active ? "bg-navy text-white border-navy" : "bg-white text-navy border-gray-200 hover:border-navy/30"}`}>
                {label}
                <span className={`text-[10.5px] font-bold ${active ? "text-white/75" : id === "unpaid" && statusCounts[id] ? "text-red-600" : "text-gray-400"}`}>{statusCounts[id]}</span>
              </button>
            );
          })}
          <label className="shrink-0 flex items-center gap-1.5 h-8 px-3 ml-1 rounded-full text-xs font-semibold text-navy border border-dashed border-gray-300 cursor-pointer select-none">
            <input type="checkbox" checked={allMonths} onChange={e => setAllMonths(e.target.checked)} className="rounded border-gray-300" />
            Todos os meses
          </label>
        </div>
        {(statusFilter !== "all" || allMonths) && (
          <p className="text-xs text-gray-600">
            {filtered.length} serviço{filtered.length === 1 ? "" : "s"}{allMonths ? " em todos os meses" : ` em ${monthLabel.toLowerCase()}`} · {money(filteredSums.billed)} · <span className="text-gold font-semibold">para ti {money(filteredSums.cut)}{filteredSums.vat > 0 ? " sem IVA" : ""}</span>
            {filteredSums.vat > 0 && <span className="text-blue-700 font-semibold"> · IVA a entregar ao Estado {money(filteredSums.vat)}</span>}
            {statusFilter !== "all" && <button type="button" onClick={() => setStatusFilter("all")} className="ml-2 text-gold font-semibold hover:underline">Ver todos</button>}
          </p>
        )}
      </div>

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
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          Erro ao carregar pedidos: {error}. Confirma que a tabela <code className="bg-red-100 px-1 rounded">service_requests</code> existe no Supabase (migration <code className="bg-red-100 px-1 rounded">20260911000000_add_service_requests.sql</code>).
        </div>
      )}

      {/* Telemóvel: cartões em vez das 12 colunas da tabela */}
      <div className="md:hidden space-y-2">
        {loading && <p className="text-center py-6 text-sm text-gray-400">A carregar...</p>}
        {!loading && filtered.length === 0 && (
          <p className="text-center py-6 text-sm text-gray-400">{!allMonths && monthRecords.length === 0 ? `Ainda não há pedidos registados em ${monthLabel}.` : "Nenhum pedido corresponde aos filtros."}</p>
        )}
        {filtered.map(r => (
          <div key={r.id} className={`rounded-xl border p-3 space-y-2 ${r.paid ? "bg-white border-gray-200" : "bg-red-50/60 border-red-200"}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[11px] text-gray-500">Dia {allMonths ? dayMonth(r.request_date) : new Date(r.request_date + "T00:00:00").getDate()} · fechado {closedLabel(r.booked_at)}</p>
                <p className="text-sm font-semibold text-navy break-words">{r.description || "-"}</p>
                <p className="text-xs text-gray-600">{[r.client_name, r.locality ?? "Região?", r.city].filter(Boolean).join(" · ")}</p>
                {r.phone && <a href={`tel:${r.phone}`} className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" />{r.phone}</a>}
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-navy">{money(r.billed_value)}</p>
                {r.invoiced && <p className="text-[11px] font-medium text-blue-700">{vatLine(r, true)}</p>}
                <p className="text-xs font-semibold text-gold">{money(cutOf(r))}</p>
                {r.upsell_value ? <p className={`text-[11px] font-semibold ${UPSELL_TEXT}`}>+{money(Number(r.upsell_value))}</p> : null}
              </div>
            </div>
            {r.invoiced && <p className="text-[11px] text-blue-800">{vatLine(r)}{r.invoice_value != null ? ` (fatura de ${money(Number(r.invoice_value))})` : ""}</p>}
            {r.needs_review && <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">{r.needs_review}</p>}
            <div className="flex flex-wrap items-center gap-1.5">
              {quizSummary?.quizServiceIds.has(r.id) && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">{QUIZ_BADGE}</span>}
              {r.calendar_missing_since && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-300">Apagado no calendário</span>}
              {r.needs_review && <button onClick={() => editRow(r)} title={r.needs_review} className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">Rever</button>}
              <button onClick={() => togglePaid(r)} className={`px-2 py-1 rounded-full text-[11px] font-bold border ${r.paid ? "bg-green-50 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-300"}`}>{r.paid ? "Pago" : "Por pagar"}</button>
              <div className="ml-auto flex items-center gap-1">
                {r.calendar_missing_since && <button onClick={() => keepMissing(r)} className="px-2 py-1 text-[11px] font-bold rounded-md border border-gray-200 text-navy">Manter</button>}
                <button onClick={() => editRow(r)} aria-label="Editar" className="p-2 text-gray-500 hover:text-navy rounded-md"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(r.id)} aria-label="Apagar" className="p-2 text-gray-500 hover:text-red-600 rounded-md"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div>
          <table className="w-full table-fixed text-xs">
            <colgroup>
              {["4%", "7%", "19%", "10%", "10%", "10%", "8%", "8%", "7%", "6%", "6%", "5%"].map((w, i) => <col key={i} style={{ width: w }} />)}
            </colgroup>
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {["Dia", "Fechado", "Descrição", "Cliente", "Localidade", "Telefone", "Origem", "Faturado", "Meu cut", "Upsell", "Pago", ""].map(h => (
                  <th key={h} className="text-left px-2 py-2 text-[10.5px] font-bold text-gray-500 uppercase tracking-wider truncate">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={12} className="text-center py-10 text-gray-400">A carregar...</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={12} className="text-center py-10 text-gray-400">
                  {!allMonths && monthRecords.length === 0 ? `Ainda não há pedidos registados em ${monthLabel}.` : "Nenhum pedido corresponde aos filtros."}
                </td></tr>
              )}
              {filtered.map((r, i) => (
                <tr key={r.id} className={`border-b border-gray-100 ${!r.paid ? "bg-red-50/60" : (i % 2 === 0 ? "" : "bg-gray-50/50")}`}>
                  <td className="px-2 py-2 font-mono text-navy whitespace-nowrap">{allMonths ? dayMonth(r.request_date) : new Date(r.request_date + "T00:00:00").getDate()}</td>
                  <td className="px-2 py-2 text-gray-500 whitespace-nowrap" title={r.booked_at ? new Date(r.booked_at).toLocaleString("pt-PT", { timeZone: "Europe/Lisbon" }) : "Sem data de fecho"}>{closedLabel(r.booked_at)}</td>
                  <td className="px-2 py-2 text-navy font-medium">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {r.calendar_event_id && <CalendarDays className="w-3 h-3 text-gray-400 flex-shrink-0" aria-label="Criado a partir do Google Calendar" />}
                      <span className="truncate">{r.description || "-"}</span>
                      {r.calendar_missing_since && (
                        <span className="flex-shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-300">Apagado no calendário</span>
                      )}
                      {r.needs_review && (
                        <button onClick={() => editRow(r)} title={r.needs_review}
                          className="flex-shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">Rever</button>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-2 text-gray-600 truncate" title={r.client_name ?? undefined}>{r.client_name || "-"}</td>
                  <td className="px-2 py-2 truncate" title={[r.locality, r.city].filter(Boolean).join(" · ")}>
                    <span className={r.locality ? "text-gray-600" : "text-amber-700 font-semibold"}>{r.locality ?? "?"}</span>
                    {r.city && <span className="text-gray-400"> · {r.city}</span>}
                  </td>
                  <td className="px-2 py-2 text-gray-600 truncate">
                    {r.phone ? (
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-gray-400" />{r.phone}</span>
                    ) : "-"}
                  </td>
                  <td className="px-2 py-2 text-gray-500 truncate" title={[r.source, quizSummary?.quizServiceIds.has(r.id) && "Pediu orçamento pelo questionário do site"].filter(Boolean).join(" · ") || undefined}>
                    {quizSummary?.quizServiceIds.has(r.id)
                      ? <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">{QUIZ_BADGE}</span>
                      : r.source?.startsWith("Google Calendar") ? "Calendário" : r.source || "-"}
                  </td>
                  <td className="px-2 py-2 font-semibold text-navy whitespace-nowrap">
                    {money(r.billed_value)}
                    {r.invoiced && <span className="block text-[10px] font-medium text-blue-700 truncate" title={invoiceTitle(r)}>{vatLine(r, true)}</span>}
                  </td>
                  <td className="px-2 py-2 font-semibold text-gold whitespace-nowrap" title={[ownerServiceCutWithoutVat(r) !== null && `sem IVA (IVA a entregar: ${money(vatToDeliverOf(r, lisbonDay(new Date())))})`, ownerUpsellNetOf(r) ? `${money(round2(cutOf(r) - ownerUpsellNetOf(r)))} do serviço + ${money(ownerUpsellNetOf(r))} de upsell` : null].filter(Boolean).join(" · ") || undefined}>{money(cutOf(r))}</td>
                  <td className={`px-2 py-2 font-semibold whitespace-nowrap ${UPSELL_TEXT}`} title={r.upsell_value ? `${r.upsell_team ?? defaultTeamFor(r.locality)}` : undefined}>{r.upsell_value ? money(Number(r.upsell_value)) : "-"}</td>
                  <td className="px-2 py-2">
                    <button onClick={() => togglePaid(r)} className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${r.paid ? "bg-green-50 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-300"}`}>
                      {r.paid ? "Pago" : "Por pagar"}
                    </button>
                  </td>
                  <td className="px-1 py-2">
                    <div className="flex items-center justify-end gap-0.5">
                      {r.calendar_missing_since && (
                        <button onClick={() => keepMissing(r)} title="O serviço fez-se: manter a linha e desligá-la do calendário"
                          className="px-1.5 py-1 text-[10px] font-bold rounded-md border border-gray-200 text-navy hover:bg-gray-50">Manter</button>
                      )}
                      <button onClick={() => editRow(r)} aria-label="Editar" className="p-1.5 text-gray-400 hover:text-navy hover:bg-gray-100 rounded-md"><Pencil className="w-3.5 h-3.5" /></button>
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
              <label className="flex items-center gap-2 h-9 ml-4 text-sm text-navy cursor-pointer select-none">
                <input type="checkbox" checked={form.invoiced} onChange={e => setForm(f => ({ ...f, invoiced: e.target.checked }))} className="rounded border-gray-300" />
                Com fatura (IVA)
              </label>
              <label className="flex items-center gap-2 h-9 ml-4 text-sm text-navy cursor-pointer select-none">
                <input type="checkbox" checked={form.review_requested} onChange={e => setForm(f => ({ ...f, review_requested: e.target.checked }))} className="rounded border-gray-300" />
                Avaliação pedida
              </label>
            </div>
            {form.invoiced && (() => {
              const billed = parseEuros(form.billed_value) || 0;
              const part = form.invoice_value.trim() ? parseEuros(form.invoice_value) : null;
              const upsell = parseEuros(form.upsell_value) || 0;
              const vat = invoiceVatOf({ billed_value: billed, invoiced: true, invoice_value: part, upsell_value: upsell });
              const gross = round2(billed + upsell);
              return (
                <div className="col-span-2 sm:col-span-5 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-blue-50/50 border border-blue-100 rounded-lg p-3">
                  <div className="col-span-2">
                    <label className="block text-[10px] text-gray-500 mb-1">Dados da fatura (nome e NIF)</label>
                    <input type="text" value={form.invoice_ref} onChange={e => setForm(f => ({ ...f, invoice_ref: e.target.value }))}
                      className="w-full h-9 px-2.5 text-sm border border-gray-200 rounded-lg text-navy bg-white focus:outline-none focus:border-gold" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1">Fatura passada em</label>
                    <input type="date" value={form.invoice_issued_on} onChange={e => setForm(f => ({ ...f, invoice_issued_on: e.target.value }))}
                      className="w-full h-9 px-2.5 text-sm border border-gray-200 rounded-lg text-navy bg-white focus:outline-none focus:border-gold" />
                    <p className="text-[10px] text-gray-500 mt-0.5">{form.invoice_issued_on ? "Fatura passada" : "Vazio = fatura por passar"}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1">Passada por</label>
                    <select value={form.invoice_by} onChange={e => setForm(f => ({ ...f, invoice_by: e.target.value as FormState["invoice_by"] }))}
                      className="w-full h-9 px-2.5 text-sm border border-gray-200 rounded-lg text-navy bg-white focus:outline-none focus:border-gold">
                      <option value="Empresa">Empresa</option>
                      <option value="Francisco">Francisco</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] text-gray-500 mb-1">Valor na fatura, com IVA (€)</label>
                    <input type="text" inputMode="decimal" value={form.invoice_value} onChange={e => setForm(f => ({ ...f, invoice_value: e.target.value }))}
                      placeholder="Vazio = o serviço todo"
                      className="w-full h-9 px-2.5 text-sm border border-gray-200 rounded-lg text-navy bg-white focus:outline-none focus:border-gold" />
                    <p className="text-[10px] text-gray-500 mt-0.5">Só quando a fatura é de uma parte do serviço (ex.: só o colchão).</p>
                  </div>
                  <div className="col-span-2 flex flex-col justify-center gap-1.5">
                    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Como foi combinado o IVA">
                      {([[false, "IVA incluído no preço"], [true, "IVA à parte"]] as const).map(([onTop, label]) => (
                        <button key={label} type="button" role="radio" aria-checked={form.vat_on_top === onTop}
                          onClick={() => setForm(f => ({ ...f, vat_on_top: onTop }))}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border ${form.vat_on_top === onTop ? "bg-blue-700 text-white border-blue-700" : "bg-white text-blue-700 border-blue-200"}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-navy">
                      {form.vat_on_top
                        ? <>Preço {money(round2(gross - vat))} + <strong className="text-blue-700">IVA {money(vat)}</strong> = {money(gross)}</>
                        : <>{money(gross)} com o IVA incluído: <strong className="text-blue-700">IVA {money(vat)}</strong></>}
                      {upsell > 0 && <span className="text-gray-500"> (com o upsell)</span>}
                    </p>
                    {form.vat_on_top && (
                      <button type="button" disabled={!billed}
                        onClick={() => setForm(f => ({ ...f, billed_value: String(round2((parseEuros(f.billed_value) || 0) * (1 + INVOICE_VAT))) }))}
                        className="self-start px-2.5 py-1 text-[11px] font-semibold rounded-md border border-blue-200 text-blue-700 bg-white hover:bg-blue-50 disabled:opacity-40">
                        O valor faturado está sem IVA: somar 23%
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-gray-100 pt-3">
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">Upsell da equipa (€)</label>
              <input type="text" inputMode="decimal" value={form.upsell_value} onChange={e => setForm(f => ({ ...f, upsell_value: e.target.value }))}
                placeholder="0.00"
                className="w-full h-9 px-2.5 text-sm border border-gray-200 rounded-lg text-navy focus:outline-none focus:border-gold" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">Equipa do upsell</label>
              <select value={form.upsell_team} onChange={e => setForm(f => ({ ...f, upsell_team: e.target.value as UpsellTeam }))}
                className="w-full h-9 px-2.5 text-sm border border-gray-200 rounded-lg text-navy focus:outline-none focus:border-gold">
                {UPSELL_TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <p className="col-span-2 sm:col-span-1 text-[11px] text-gray-500 self-end pb-1">
              {(() => {
                const v = parseFloat(form.upsell_value.replace(",", ".")) || 0;
                const formDay = `${viewedMonth.getFullYear()}-${String(viewedMonth.getMonth() + 1).padStart(2, "0")}-${String(form.day).padStart(2, "0")}`;
                if (v <= 0) return tieredUpsell(formDay) ? "A tua parte soma-se ao teu cut. Equipa 70% até 100€, 60% acima." : "A tua parte soma-se ao teu cut. Equipa 70%, tu 30% (Porto 60/40).";
                const s = splitUpsell(v, form.upsell_team, formDay);
                return `Equipa ${money(s.team)} · tu ${money(s.owner)}`;
              })()}
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
    </div>
  );
};

export default CrmPanel;
