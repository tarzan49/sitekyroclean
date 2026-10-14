import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lisbonDay, shiftMonth } from "@/lib/crmClosings";
import { goalProgress, monthlyReviewStats, REVIEW_DEADLINE_DAYS, REVIEW_MIN_STARS, reviewCounts, serviceReviews, unlinkedReviews, type GoogleReview, type ReviewService } from "@/lib/crmReviews";
import { addDays, checkProcedure, ITEM_LABEL, PROCEDURE_PAY_ENABLED, procedureWeeklySummary, type ProcedureCheck, type ProcedureRecord } from "@/lib/serviceProcedure";

// Aba "Avaliações" do CRM: quantas avaliações entram por mês (estão a crescer?)
// e, serviço a serviço, quem deixou avaliação. As contas estão em crmReviews.ts;
// as avaliações vêm da tabela google_reviews. A coluna Procedimento lê
// service_procedure (fotografias e vídeo que a equipa mandou ao bot) e mostra a
// percentagem da equipa pela regra de serviceProcedure.ts.

const MONTH_FMT = new Intl.DateTimeFormat("pt-PT", { month: "long", year: "numeric", timeZone: "UTC" });
const SHORT_MONTH_FMT = new Intl.DateTimeFormat("pt-PT", { month: "short", year: "numeric", timeZone: "UTC" });
const monthName = (month: string) => MONTH_FMT.format(new Date(`${month}-15T12:00:00Z`));
const shortMonth = (month: string) => SHORT_MONTH_FMT.format(new Date(`${month}-15T12:00:00Z`));
const dm = (day: string) => `${day.slice(8, 10)}/${day.slice(5, 7)}`;
const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);
const DAY_MS = 86_400_000;

const CrmReviews = ({ services }: { services: ReviewService[] }) => {
  const currentMonth = lisbonDay(new Date()).slice(0, 7);
  const [month, setMonth] = useState(currentMonth);
  const [reviews, setReviews] = useState<GoogleReview[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [procedures, setProcedures] = useState<ProcedureRecord[]>([]);

  const fetchReviews = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error: err } = await (supabase as any)
      .from("google_reviews")
      .select("review_id, profile, author, stars, reviewed_at, service_request_id, excluded")
      .order("reviewed_at", { ascending: true });
    if (err) { setError(err.message); return; }
    setError(null);
    setReviews((data ?? []) as GoogleReview[]);
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from("service_procedure").select("*").order("service_day", { ascending: true })
      .then(({ data, error: err }: { data: ProcedureRecord[] | null; error: { message: string } | null }) => { if (!err) setProcedures(data ?? []); });
  }, []);

  // O procedimento de cada serviço: pela linha do CRM, ou pelo evento do calendário enquanto a linha não estava ligada.
  const endedDay = addDays(lisbonDay(new Date()), -1);
  const procByService = useMemo(() => {
    const byEvent = new Map(procedures.map(p => [p.calendar_event_id, p]));
    const map = new Map<string, ProcedureRecord>();
    for (const s of services) {
      const p = procedures.find(x => x.service_request_id === s.id) ?? (s.calendar_event_id ? byEvent.get(s.calendar_event_id) : undefined);
      if (p) map.set(s.id, p);
    }
    return map;
  }, [procedures, services]);
  const serviceOfProc = useMemo(() => {
    const map = new Map<string, string>();
    for (const [sid, p] of procByService) map.set(p.calendar_event_id, sid);
    return map;
  }, [procByService]);
  const reviewsOfService = useCallback((sid: string | undefined) =>
    (reviews ?? []).filter(r => sid && r.service_request_id === sid).map(r => ({ stars: r.stars, reviewed_at: r.reviewed_at, excluded: r.excluded })), [reviews]);
  const weekly = useMemo(() => procedureWeeklySummary(procedures, p => reviewsOfService(p.service_request_id ?? serviceOfProc.get(p.calendar_event_id)), endedDay)
    .filter(w => w.week.slice(0, 7) === month || addDays(w.week, 6).slice(0, 7) === month), [procedures, reviewsOfService, serviceOfProc, endedDay, month]);

  const monthly = useMemo(() => reviews ? monthlyReviewStats(reviews, currentMonth) : [], [reviews, currentMonth]);
  const stat = monthly.find(m => m.month === month) ?? null;
  const summary = useMemo(() => serviceReviews(services, reviews ?? [], month), [services, reviews, month]);
  const loose = useMemo(() => unlinkedReviews(reviews ?? [], month), [reviews, month]);
  const goals = useMemo(() => goalProgress(reviews ?? [], month), [reviews, month]);

  /** Liga a avaliação escolhida ao serviço (e desliga a que lá estava). */
  const link = async (serviceId: string, current: GoogleReview | null, reviewId: string) => {
    setSaving(serviceId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = () => (supabase as any).from("google_reviews");
    if (current) await table().update({ service_request_id: null }).eq("review_id", current.review_id);
    if (reviewId) await table().update({ service_request_id: serviceId }).eq("review_id", reviewId);
    await fetchReviews();
    setSaving(null);
  };

  /** As avaliações que podem ser deste serviço: sem serviço, de 2 dias antes a 40 dias depois. */
  const candidates = (s: ReviewService) => {
    const day = Date.parse(`${s.request_date}T12:00:00Z`);
    return (reviews ?? []).filter(r => !r.excluded && !r.service_request_id
      && Date.parse(r.reviewed_at) >= day - 2 * DAY_MS && Date.parse(r.reviewed_at) <= day + 40 * DAY_MS);
  };

  if (error) return <p className="text-sm text-red-600">Não foi possível ler as avaliações: {error}</p>;
  if (!reviews) return <p className="text-sm text-gray-500">A carregar avaliações…</p>;

  const recent = [...monthly].reverse().slice(0, 12);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-gray-500">
          Avaliações das duas fichas do Google, pela data em que foram escritas. Para as equipas contam as de {REVIEW_MIN_STARS} e 5 estrelas. Não contam as da equipa nem da família. Prazo para o cliente avaliar: {REVIEW_DEADLINE_DAYS} dias depois do serviço.
        </p>
        <div className="flex items-center gap-1 border border-gray-200 rounded-lg">
          <button onClick={() => setMonth(m => shiftMonth(m, -1))} aria-label="Mês anterior" className="p-1.5 text-navy hover:bg-gray-50 rounded-l-lg">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-1 text-xs font-semibold text-navy capitalize min-w-[120px] text-center">{monthName(month)}</span>
          <button onClick={() => setMonth(m => shiftMonth(m, 1))} disabled={month >= currentMonth} aria-label="Mês seguinte" className="p-1.5 text-navy hover:bg-gray-50 rounded-r-lg disabled:opacity-30">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {goals.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-3">
          {goals.map(g => (
            <div key={g.profile} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider">Meta {g.profile === "lisboa" ? "Lisboa" : "Porto"} · fim de {shortMonth(g.month)}</p>
                <p className="text-xs font-semibold text-navy">{g.current} / {g.total}</p>
              </div>
              <div className="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-[#D4AF37]" style={{ width: `${Math.min(100, (g.current / g.total) * 100)}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-gray-500">{g.missing > 0 ? `Faltam ${g.missing}. ` : "Meta atingida. "}Prémio: {g.reward}.</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-gold/[0.10] to-gold/[0.02] border border-gold/25 rounded-xl p-4">
          <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Avaliações no mês</p>
          <p className="text-xl font-bold text-navy">{stat?.count ?? 0}</p>
          {stat?.change != null && (
            <p className={`text-xs font-semibold ${stat.change > 0 ? "text-green-700" : stat.change < 0 ? "text-red-600" : "text-gray-500"}`}>
              {stat.change > 0 ? "+" : ""}{stat.change} vs mês anterior{month === currentMonth ? " (mês a meio)" : ""}
            </p>
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Média</p>
          <p className="text-xl font-bold text-navy">{stat?.average != null ? stat.average.toFixed(2).replace(".", ",") : "-"}</p>
          {stat && <p className="text-xs text-gray-500">{stat.five} de 5★ · {stat.four} de 4★ · {stat.low} abaixo</p>}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Serviços com avaliação</p>
          <p className="text-xl font-bold text-navy">{summary.withReview} de {summary.services}</p>
          <p className="text-xs text-gray-500">{summary.rate != null ? `${summary.rate.toString().replace(".", ",")}%` : "sem serviços"}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total acumulado</p>
          <p className="text-xl font-bold text-gold">{stat?.cumulative ?? 0}</p>
          <p className="text-xs text-gray-500">no fim de {shortMonth(month)}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <p className="text-sm font-bold text-navy px-3 pt-3">Por mês</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {["Mês", "Avaliações", "vs anterior", "Porto", "Lisboa", "5★", "4★", "Abaixo", "Média", "Acumulado"].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map(m => (
                <tr key={m.month} onClick={() => setMonth(m.month)} className={`border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 ${m.month === month ? "bg-gold/[0.06]" : ""}`}>
                  <td className="px-3 py-2 text-navy font-medium capitalize whitespace-nowrap">{shortMonth(m.month)}</td>
                  <td className="px-3 py-2 text-navy font-semibold">{m.count}</td>
                  <td className={`px-3 py-2 font-semibold ${m.change == null || m.change === 0 ? "text-gray-400" : m.change > 0 ? "text-green-700" : "text-red-600"}`}>
                    {m.change == null ? "-" : `${m.change > 0 ? "+" : ""}${m.change}`}
                  </td>
                  <td className="px-3 py-2 text-gray-600">{m.porto}</td>
                  <td className="px-3 py-2 text-gray-600">{m.lisboa}</td>
                  <td className="px-3 py-2 text-gray-600">{m.five}</td>
                  <td className="px-3 py-2 text-gray-600">{m.four}</td>
                  <td className={`px-3 py-2 ${m.low ? "text-red-600 font-semibold" : "text-gray-600"}`}>{m.low}</td>
                  <td className="px-3 py-2 text-gray-600">{m.average != null ? m.average.toFixed(2).replace(".", ",") : "-"}</td>
                  <td className="px-3 py-2 text-gold font-semibold">{m.cumulative}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <p className="text-sm font-bold text-navy px-3 pt-3">Serviços de {monthName(month)}</p>
        <p className="text-xs text-gray-500 px-3">Escolhe a avaliação de cada serviço. A lista mostra as avaliações ainda sem serviço, escritas até 40 dias depois.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {["Dia", "Cliente", "Região", "Faturado", "Avaliação", "Procedimento"].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {summary.rows.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Sem serviços em {monthName(month)}.</td></tr>
              )}
              {summary.rows.map(({ service: s, review: r }) => (
                <tr key={s.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-3 py-2 font-mono text-navy">{dm(s.request_date)}</td>
                  <td className="px-3 py-2 text-navy max-w-[200px] truncate">{s.client_name || s.city || "-"}{s.client_name && s.city ? <span className="text-gray-400"> · {s.city}</span> : null}</td>
                  <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{s.locality ?? "-"}</td>
                  <td className="px-3 py-2 text-navy whitespace-nowrap">{Number(s.billed_value)}€</td>
                  <td className="px-3 py-2">
                    <select
                      value={r?.review_id ?? ""}
                      disabled={saving === s.id}
                      onChange={e => link(s.id, r, e.target.value)}
                      className={`max-w-[230px] rounded-md border px-2 py-1 text-xs ${r ? (reviewCounts(r) ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-700") : "border-gray-200 bg-white text-gray-500"}`}
                    >
                      <option value="">Sem avaliação</option>
                      {r && <option value={r.review_id}>{stars(r.stars)} {r.author} ({dm(lisbonDay(r.reviewed_at))})</option>}
                      {candidates(s).map(c => (
                        <option key={c.review_id} value={c.review_id}>{stars(c.stars)} {c.author} ({dm(lisbonDay(c.reviewed_at))}, {c.profile === "lisboa" ? "Lisboa" : "Porto"})</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <ProcedureCell rec={procByService.get(s.id)} check={procByService.get(s.id) ? checkProcedure(procByService.get(s.id)!, reviewsOfService(s.id), endedDay) : null} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {weekly.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <p className="text-sm font-bold text-navy px-3 pt-3">Procedimento por semana e equipa</p>
          <p className="text-xs text-gray-500 px-3">Serviços com a mensagem do bot: fotografia de antes, de depois e vídeo enviados em resposta, e avaliação de {REVIEW_MIN_STARS} ou 5 estrelas até {REVIEW_DEADLINE_DAYS} dias depois.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {["Semana", "Equipa", "Serviços", "Fotos e vídeo", "Avaliação", "Completos", "A correr", "Incompletos"].map(h => (
                    <th key={h} className="text-left px-3 py-2 text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weekly.map(w => (
                  <tr key={`${w.week}-${w.team}`} className="border-b border-gray-100 last:border-0">
                    <td className="px-3 py-2 font-mono text-navy whitespace-nowrap">{dm(w.week)} a {dm(addDays(w.week, 6))}</td>
                    <td className="px-3 py-2 text-navy whitespace-nowrap">{w.team}</td>
                    <td className="px-3 py-2 text-navy font-semibold">{w.services}</td>
                    <td className="px-3 py-2 text-gray-600">{w.media}</td>
                    <td className="px-3 py-2 text-gray-600">{w.review}</td>
                    <td className="px-3 py-2 text-green-700 font-semibold">{w.complete}</td>
                    <td className="px-3 py-2 text-gray-600">{w.open}</td>
                    <td className={`px-3 py-2 ${w.closedIncomplete ? "text-red-600 font-semibold" : "text-gray-600"}`}>{w.closedIncomplete}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {loose.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <p className="text-sm font-bold text-navy px-3 pt-3">Avaliações de {monthName(month)} sem serviço ligado</p>
          <p className="text-xs text-gray-500 px-3 pb-2">Clientes antigos, nomes diferentes do WhatsApp ou serviços fora do CRM. Liga-as em cima, no serviço certo.</p>
          <ul className="px-3 pb-3 text-xs text-navy space-y-1">
            {loose.map(r => (
              <li key={r.review_id}>{dm(lisbonDay(r.reviewed_at))} · <span className="text-gold">{stars(r.stars)}</span> {r.author} <span className="text-gray-400">({r.profile === "lisboa" ? "Lisboa" : "Porto"})</span></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const MARKS: { key: keyof Pick<ProcedureCheck, "before" | "after" | "video" | "review">; short: string; item: "before" | "after" | "video" | "review" }[] = [
  { key: "before", short: "Antes", item: "before" },
  { key: "after", short: "Depois", item: "after" },
  { key: "video", short: "Vídeo", item: "video" },
  { key: "review", short: "Aval.", item: "review" },
];

/** ✓/✗ de antes, depois, vídeo e avaliação, e a % da equipa quando o prazo acabou. */
const ProcedureCell = ({ rec, check }: { rec: ProcedureRecord | undefined; check: ProcedureCheck | null }) => {
  if (!rec || !check) return <span className="text-gray-400">Sem mensagem do bot</span>;
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-gray-400 mr-0.5">{rec.team}</span>
      {MARKS.map(m => (
        <span key={m.key} title={`${ITEM_LABEL[m.item]}: ${check[m.key] ? "sim" : "não"}`}
          className={`px-1.5 py-0.5 rounded border text-[10px] font-semibold ${check[m.key] ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
          {check[m.key] ? "✓" : "✗"} {m.short}
        </span>
      ))}
      <span className={`ml-1 font-bold ${check.status === "completo" ? "text-green-700" : check.status === "fechado" ? "text-red-600" : "text-gray-500"}`}
        title={PROCEDURE_PAY_ENABLED ? undefined : "Regra de pagamento por confirmar: as contas ainda não aplicam isto."}>
        {check.pay ? `${check.pay.teamShare}%${check.pay.bonus ? ` + ${check.pay.bonus}€` : ""}` : `até ${dm(check.deadline)}`}
      </span>
    </div>
  );
};

export default CrmReviews;
