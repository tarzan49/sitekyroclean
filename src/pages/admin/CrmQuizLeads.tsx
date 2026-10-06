import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { lisbonDay, shiftMonth } from "@/lib/crmClosings";
import { QUIZ_LEADS_SINCE, type QuizSummary, type WhatsAppMonth } from "@/lib/crmQuizLeads";

// Aba "Questionário" do CRM: quantas pessoas pediram orçamento pelo
// questionário do site e quantas fecharam. As contas estão em crmQuizLeads.ts.

const money = (n: number) => `${(Math.round(n * 100) / 100).toLocaleString("pt-PT", { maximumFractionDigits: 2 })}€`;
const rate = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)}%` : "–");
const MONTH_FMT = new Intl.DateTimeFormat("pt-PT", { month: "long", year: "numeric", timeZone: "UTC" });
const monthName = (month: string) => MONTH_FMT.format(new Date(`${month}-15T12:00:00Z`));
const dayLabel = (day: string) => `${day.slice(8, 10)}/${day.slice(5, 7)}`;

const CrmQuizLeads = ({ summary, whatsApp, error }: { summary: QuizSummary | null; whatsApp: WhatsAppMonth[] | null; error: string | null }) => {
  const [month, setMonth] = useState(() => lisbonDay(new Date()).slice(0, 7));

  const people = useMemo(() => summary?.people.filter(p => p.firstDay.startsWith(month)) ?? [], [summary, month]);
  const closed = people.filter(p => p.services.length > 0);
  const billed = closed.reduce((t, p) => t + p.billed, 0);
  const share = closed.reduce((t, p) => t + p.share, 0);
  const total = useMemo(() => {
    const all = summary?.people ?? [];
    return { people: all.length, closed: all.filter(p => p.services.length).length };
  }, [summary]);

  if (error) {
    return <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">Não foi possível ler os pedidos do questionário: {error}</div>;
  }
  if (!summary) return <p className="text-sm text-gray-400 py-8 text-center">A carregar…</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-gray-500 max-w-2xl">
          Pessoas que pediram orçamento pelo questionário do site, no mês do primeiro pedido. Fechou = tem um serviço no CRM fechado depois do pedido, ligado pelo telefone do questionário, pelo número do WhatsApp que mandou o código do pedido ou pelo nome completo.
          Desde o início: {total.closed} de {total.people} ({rate(total.closed, total.people)}).
        </p>
        <div className="flex items-center gap-1 border border-gray-200 rounded-lg">
          <button onClick={() => setMonth(m => shiftMonth(m, -1))} aria-label="Mês anterior" className="p-1.5 text-navy hover:bg-gray-50 rounded-l-lg">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-1 text-xs font-semibold text-navy capitalize min-w-[120px] text-center">{monthName(month)}</span>
          <button onClick={() => setMonth(m => shiftMonth(m, 1))} aria-label="Mês seguinte" className="p-1.5 text-navy hover:bg-gray-50 rounded-r-lg">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Pedidos</p>
          <p className="text-xl font-bold text-navy">{people.length}</p>
          <p className="text-[11px] text-gray-500">pessoas diferentes</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Fecharam</p>
          <p className="text-xl font-bold text-green-600">{closed.length}</p>
        </div>
        <div className="bg-gradient-to-br from-gold/[0.10] to-gold/[0.02] border border-gold/25 rounded-xl p-4">
          <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Taxa de fecho</p>
          <p className="text-xl font-bold text-navy">{rate(closed.length, people.length)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Faturado</p>
          <p className="text-xl font-bold text-navy">{money(billed)}</p>
          <p className="text-[11px] text-gray-500"><span className="text-gold font-semibold">{money(share)}</span> para ti</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <p className="text-sm font-bold text-navy px-3 pt-3">Por mês</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {["Mês", "Pedidos", "Fecharam", "Taxa de fecho", "Faturado", "Para ti", ...(whatsApp ? ["WhatsApp direto"] : [])].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {summary.months.map(m => (
                <tr key={m.month} onClick={() => setMonth(m.month)} className={`border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 ${m.month === month ? "bg-gold/[0.06]" : ""}`}>
                  <td className="px-3 py-2 text-navy font-medium capitalize whitespace-nowrap">{monthName(m.month)}</td>
                  <td className="px-3 py-2 text-navy">{m.people}</td>
                  <td className="px-3 py-2 text-green-700 font-semibold">{m.closed}</td>
                  <td className="px-3 py-2 text-navy font-semibold">{rate(m.closed, m.people)}</td>
                  <td className="px-3 py-2 text-navy whitespace-nowrap">{money(m.billed)}</td>
                  <td className="px-3 py-2 text-gold font-semibold whitespace-nowrap">{money(m.share)}</td>
                  {whatsApp && (() => {
                    const w = whatsApp.find(x => x.month === m.month);
                    return <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{w ? `${w.closed} de ${w.contacts} (${rate(w.closed, w.contacts)})` : "–"}</td>;
                  })()}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <p className="text-sm font-bold text-navy px-3 pt-3 capitalize">Pedidos de {monthName(month)}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {["Pedido", "Nome", "Pediu", "Localidade", "Valor do questionário", "Resultado"].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {people.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">
                  {month < QUIZ_LEADS_SINCE.slice(0, 7) ? "Os pedidos anteriores a 14/09/2026 não estão guardados." : `Sem pedidos do questionário em ${monthName(month)}.`}
                </td></tr>
              )}
              {people.map(p => {
                const last = p.leads[p.leads.length - 1];
                return (
                  <tr key={p.key} className={`border-b border-gray-100 last:border-0 ${p.services.length ? "bg-green-50/60" : ""}`}>
                    <td className="px-3 py-2 font-mono text-navy whitespace-nowrap">{dayLabel(p.firstDay)}{p.leads.length > 1 && <span className="text-gray-400 font-sans"> ({p.leads.length}×)</span>}</td>
                    <td className="px-3 py-2 text-navy max-w-[160px] truncate">{last.name || "-"}</td>
                    <td className="px-3 py-2 text-gray-600 max-w-[220px] truncate" title={last.service ?? undefined}>{last.service || "-"}</td>
                    <td className="px-3 py-2 text-gray-600 max-w-[140px] truncate">{last.location || "-"}</td>
                    <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{last.value || "-"}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {p.services.length
                        ? <span className="font-semibold text-green-700" title={`Ligado pelo ${[...new Set(p.matchedBy)].join(" e pelo ")}`}>Fechou · {money(p.billed)}{p.services.length > 1 ? ` (${p.services.length} serviços)` : ""}{p.matchedBy.some(m => m !== "telefone") && <span className="font-normal text-gray-500"> · pelo {[...new Set(p.matchedBy.filter(m => m !== "telefone"))].join(" e ")}</span>}</span>
                        : <span className="text-gray-400">Não fechou</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-gray-500">
        {summary.tests > 0 && `${summary.tests} pedido${summary.tests === 1 ? "" : "s"} de teste (nome com "teste" ou número inventado) ficam fora destas contas. `}
        {summary.withoutPhone > 0 && `${summary.withoutPhone} pedido${summary.withoutPhone === 1 ? "" : "s"} sem telefone também. `}
        O número do WhatsApp de quem mandou o código do pedido é lido do WhatsApp Web, não se atualiza sozinho.
        {whatsApp && " WhatsApp direto = contactos do separador Clientes que não passaram pelo questionário, no mês do primeiro contacto; fechou = etiqueta de cliente ou marcado, ou serviço no CRM."}
      </p>
    </div>
  );
};

export default CrmQuizLeads;
