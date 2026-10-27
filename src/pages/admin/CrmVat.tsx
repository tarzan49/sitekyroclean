import { useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import { lisbonDay } from "@/lib/crmClosings";
import { invoiceStatusOf, invoiceVatOf, vatToDeliverOf } from "@/lib/invoiceVat";
import { vatByMonth, type VatRow } from "@/lib/crmVat";
import { INVOICE_CHIP, dayMonth, invoiceTitle, money, vatLine } from "./crmInvoiceUi";

// Aba "Faturas e IVA" do CRM (dono, 2026-10-27): o IVA a entregar de cada mês,
// serviço a serviço, com quem já pagou e quem não. As contas estão em crmVat.ts.

type Row = VatRow & {
  billed_value: number;
  description: string;
  client_name: string | null;
  city: string | null;
  paid: boolean;
  invoice_ref: string | null;
};

const MONTH_FMT = new Intl.DateTimeFormat("pt-PT", { month: "long", year: "numeric", timeZone: "UTC" });
const monthName = (m: string) => MONTH_FMT.format(new Date(`${m}-15T12:00:00Z`));

// Todas as faturas do mês, as do Francisco também (dono, 2026-10-27: "outubro
// também tem algumas faturas do Francisco [...] os clientes a quem eu já
// entreguei a fatura"). Entregue = fatura passada.
type ListFilter = "all" | "issued" | "to_issue";
const LIST_FILTERS: ReadonlyArray<readonly [ListFilter, string]> = [["all", "Todas"], ["issued", "Entregues"], ["to_issue", "Por passar"]];

function CrmVat<T extends Row>({ records, onTogglePaid, onAdvanceInvoice, onEdit }: {
  records: T[];
  onTogglePaid: (r: T) => void;
  onAdvanceInvoice: (r: T) => void;
  onEdit: (r: T) => void;
}) {
  const today = lisbonDay(new Date());
  const months = useMemo(() => vatByMonth(records, today), [records, today]);
  const [picked, setPicked] = useState<string | null>(null);
  const [show, setShow] = useState<ListFilter>("all");
  const month = months.find(m => m.month === picked) ?? months.find(m => m.month <= today.slice(0, 7)) ?? months[0];
  const rowsOf = (f: ListFilter) => month
    ? [...month.services, ...month.francisco]
      .filter(r => f === "all" || invoiceStatusOf(r) === f)
      .sort((a, b) => a.request_date.localeCompare(b.request_date))
    : [];
  const list = rowsOf(show);
  const totalVat = months.reduce((s, m) => s + m.vat, 0);
  const totalUnpaid = months.reduce((s, m) => s + m.vatUnpaid, 0);

  if (!months.length) return <p className="text-center py-10 text-sm text-gray-400">Ainda não há serviços com fatura.</p>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">IVA a entregar, {monthName(month.month)}</p>
          <p className="text-xl font-bold text-blue-800">{money(month.vat)}</p>
          {month.vatUpcoming > 0 && <p className="text-[11px] text-gray-500">+ {money(month.vatUpcoming)} de serviços ainda por fazer</p>}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Desse IVA, ainda por pagar</p>
          <p className={`text-xl font-bold ${month.vatUnpaid ? "text-red-600" : "text-green-600"}`}>{money(month.vatUnpaid)}</p>
          <p className="text-[11px] text-gray-500">{money(month.vatPaid)} de serviços já pagos</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 col-span-2 sm:col-span-1">
          <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Todos os meses</p>
          <p className="text-xl font-bold text-navy">{money(Math.round(totalVat * 100) / 100)}</p>
          {totalUnpaid > 0 && <p className="text-[11px] text-red-600">{money(Math.round(totalUnpaid * 100) / 100)} por pagar</p>}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <p className="text-sm font-bold text-navy px-3 pt-3">Por mês</p>
        <p className="text-xs text-gray-500 px-3">Carrega num mês para ver os serviços. O IVA a entregar conta só as faturas da empresa e os serviços já feitos; as do Francisco aparecem na lista, com o IVA já entregue por ele.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {["Mês", "Com fatura", "Entregues", "Por passar", "IVA a entregar", "Pago", "Por pagar", "Por fazer"].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {months.map(m => (
                <tr key={m.month} onClick={() => setPicked(m.month)} aria-selected={m.month === month.month}
                  className={`border-b border-gray-100 last:border-0 cursor-pointer ${m.month === month.month ? "bg-blue-50/70" : "hover:bg-gray-50"}`}>
                  <td className="px-3 py-2 font-semibold text-navy whitespace-nowrap capitalize">{monthName(m.month)}</td>
                  <td className="px-3 py-2 text-gray-600">{m.services.length + m.francisco.length}{m.francisco.length ? <span className="text-gray-400"> ({m.francisco.length} Francisco)</span> : null}</td>
                  <td className="px-3 py-2 text-blue-700 font-semibold">{[...m.services, ...m.francisco].filter(r => invoiceStatusOf(r) === "issued").length || "-"}</td>
                  <td className={`px-3 py-2 whitespace-nowrap ${m.toIssue ? "text-amber-700 font-semibold" : "text-gray-400"}`}>{m.toIssue || "-"}</td>
                  <td className="px-3 py-2 font-bold text-blue-800 whitespace-nowrap">{money(m.vat)}</td>
                  <td className="px-3 py-2 text-green-700 whitespace-nowrap">{money(m.vatPaid)}</td>
                  <td className={`px-3 py-2 whitespace-nowrap ${m.vatUnpaid ? "text-red-600 font-semibold" : "text-gray-400"}`}>{money(m.vatUnpaid)}</td>
                  <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{m.vatUpcoming ? money(m.vatUpcoming) : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-3 py-3 flex flex-wrap items-center gap-2">
          <p className="text-sm font-bold text-navy capitalize mr-auto">Serviços com fatura · {monthName(month.month)}</p>
          <div className="flex gap-1.5" role="group" aria-label="Mostrar faturas">
            {LIST_FILTERS.map(([id, label]) => (
              <button key={id} type="button" onClick={() => setShow(id)} aria-pressed={show === id}
                className={`h-7 px-2.5 rounded-full text-[11px] font-semibold border ${show === id ? "bg-navy text-white border-navy" : "bg-white text-navy border-gray-200"}`}>
                {label} <span className={show === id ? "text-white/75" : "text-gray-400"}>{rowsOf(id).length}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {list.length === 0 && <p className="px-3 pb-3 text-xs text-gray-400">Nenhuma fatura aqui neste mês.</p>}
          {list.map(r => {
            const done = r.request_date <= today;
            const status = invoiceStatusOf(r);
            const byFrancisco = r.invoice_by === "Francisco";
            return (
              <div key={r.id} className={`px-3 py-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 ${!r.paid && done ? "bg-red-50/50" : ""}`}>
                <span className="font-mono text-xs text-navy w-11">{dayMonth(r.request_date)}</span>
                <div className="min-w-0 flex-1 basis-48">
                  <p className="text-sm font-semibold text-navy truncate">{r.client_name || r.city || "-"}</p>
                  <p className="text-[11px] text-gray-500 truncate">{r.description}{r.invoice_value != null ? ` · fatura de ${money(Number(r.invoice_value))}` : ""}</p>
                </div>
                <div className="text-right w-36">
                  {byFrancisco
                    ? <p className="text-sm font-semibold text-gray-400" title="O Francisco passou esta fatura e já entregou o IVA">IVA {money(invoiceVatOf(r))} · entregue</p>
                    : <p className="text-sm font-bold text-blue-800">IVA {money(done ? vatToDeliverOf(r, today) : invoiceVatOf(r))}</p>}
                  <p className="text-[11px] text-gray-500" title={vatLine(r)}>{r.vat_on_top ? "IVA à parte" : "IVA incluído"} · {money(r.billed_value + (Number(r.upsell_value) || 0))}</p>
                </div>
                <div className="flex items-center gap-1.5 ml-auto">
                  {byFrancisco && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">Francisco</span>}
                  {!done && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">Por fazer</span>}
                  <button onClick={() => onTogglePaid(r)} title="O cliente já pagou?"
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${r.paid ? "bg-green-50 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-300"}`}>
                    {r.paid ? "Pago" : "Por pagar"}
                  </button>
                  <button onClick={() => onAdvanceInvoice(r)} title={invoiceTitle(r)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${INVOICE_CHIP[status].cls}`}>
                    {status === "issued" ? `Entregue ${r.invoice_issued_on ? dayMonth(r.invoice_issued_on) : ""}`.trim() : INVOICE_CHIP[status].long}
                  </button>
                  <button onClick={() => onEdit(r)} aria-label="Editar" className="p-1.5 text-gray-400 hover:text-navy rounded-md"><Pencil className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CrmVat;
