import { useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import { lisbonDay } from "@/lib/crmClosings";
import { invoiceStatusOf, invoiceVatOf } from "@/lib/invoiceVat";
import { invoicesToIssue, vatByMonth, type VatRow } from "@/lib/crmVat";
import { clientOwesOwner, debtKindOf } from "@/lib/crmDebts";
import { dayMonth, invoiceTitle, money } from "./crmInvoiceUi";

// Aba "Faturas e IVA" do CRM. Reorganizada a 2026-11-01 (dono: "mais organizado,
// remover aquilo que não interessa, deixar apenas aquilo que me ajuda a tirar
// factos"; "é muito importante dar tracking a isso"). Três perguntas, por esta ordem:
// 1. Que faturas ainda tenho de passar? (todos os meses, as dos serviços feitos primeiro)
// 2. Quanto IVA tenho de entregar em cada mês, e desse, quanto dinheiro ainda não me chegou?
// 3. Quais são as faturas desse mês? (as do Francisco à parte, fechadas: IVA já entregue por ele)
// As contas estão em crmVat.ts; quem me deve, em crmDebts.ts.

type Row = VatRow & {
  billed_value: number;
  description: string;
  client_name: string | null;
  city: string | null;
  paid: boolean;
  invoice_ref: string | null;
  calendar_missing_since?: string | null;
};

const MONTH_FMT = new Intl.DateTimeFormat("pt-PT", { month: "long", year: "numeric", timeZone: "UTC" });
const monthName = (m: string) => MONTH_FMT.format(new Date(`${m}-15T12:00:00Z`)).replace(/^\p{L}/u, c => c.toUpperCase());
const round2 = (n: number) => Math.round(n * 100) / 100;
const grossOf = (r: Row) => round2(r.billed_value + (Number(r.upsell_value) || 0));
const chip = "px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap";

function CrmVat<T extends Row>({ records, onTogglePaid, onMarkClientPaid, onAdvanceInvoice, onEdit }: {
  records: T[];
  onTogglePaid: (r: T) => void;
  onMarkClientPaid: (r: T) => void;
  onAdvanceInvoice: (r: T) => void;
  onEdit: (r: T) => void;
}) {
  const today = lisbonDay(new Date());
  const allMonths = useMemo(() => vatByMonth(records, today), [records, today]);
  // Só os meses com faturas da empresa; as do Francisco ficam todas juntas no fim.
  const months = useMemo(() => allMonths.filter(m => m.services.length > 0), [allMonths]);
  const francisco = useMemo(() => allMonths.flatMap(m => m.francisco).sort((a, b) => b.request_date.localeCompare(a.request_date)), [allMonths]);
  const toIssue = useMemo(() => invoicesToIssue(records, today), [records, today]);
  const [picked, setPicked] = useState<string | null>(null);
  // Abre no mês mais recente com serviços já feitos (no início do mês, o anterior).
  const month = months.find(m => m.month === picked) ?? months.find(m => m.services.some(r => r.request_date <= today)) ?? months[0];

  if (!month) return <p className="text-center py-10 text-sm text-gray-400">Ainda não há serviços com fatura da empresa.</p>;

  const toIssueDone = toIssue.filter(r => r.request_date <= today);
  const totalUnreceived = round2(months.reduce((s, m) => s + m.vatUnpaid, 0));

  // Recebido / quem deve. O cliente que me paga diretamente tem botão próprio.
  const moneyChip = (r: T) => {
    if (r.request_date > today) return <span className={`${chip} bg-gray-100 text-gray-600 border-gray-200`}>Por fazer</span>;
    if (clientOwesOwner(r)) return (
      <button onClick={() => onMarkClientPaid(r)} title="O cliente paga-te a ti e ainda não pagou. Carregar = recebi."
        className={`${chip} bg-orange-50 text-orange-700 border-orange-300`}>Cliente deve</button>
    );
    const owed = debtKindOf(r, today) === "team";
    return (
      <button onClick={() => onTogglePaid(r)} title={owed ? "A equipa ainda não te pagou. Carregar = pagou." : "Já recebeste. Carregar = desfazer."}
        className={`${chip} ${owed ? "bg-red-100 text-red-700 border-red-300" : "bg-green-50 text-green-700 border-green-200"}`}>{owed ? "Equipa deve" : "Recebido"}</button>
    );
  };

  const invoiceRow = (r: T, action: React.ReactNode) => (
    <div key={r.id} className="px-3 py-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <span className="font-mono text-xs text-navy w-11">{dayMonth(r.request_date)}</span>
      <div className="min-w-0 flex-1 basis-48">
        <p className="text-sm font-semibold text-navy truncate">{r.client_name || r.city || "-"}</p>
        <p className="text-[11px] text-gray-500 truncate">
          {r.description}
          {r.invoice_ref ? <span className="text-gray-700"> · {r.invoice_ref}</span> : null}
        </p>
      </div>
      <div className="text-right w-36" title={invoiceTitle(r)}>
        <p className="text-sm font-bold text-navy">{money(grossOf(r))}</p>
        <p className="text-[11px] text-blue-700">
          IVA {money(invoiceVatOf(r))} · {r.vat_on_top ? "à parte" : "incluído"}
          {r.invoice_value != null ? ` · fatura de ${money(Number(r.invoice_value))}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-1.5 ml-auto">
        {moneyChip(r)}
        {action}
        <button onClick={() => onEdit(r)} aria-label="Editar" className="p-1.5 text-gray-400 hover:text-navy rounded-md"><Pencil className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );

  const issuedChip = (r: T) => (
    <button onClick={() => onAdvanceInvoice(r)} title={invoiceTitle(r)}
      className={`${chip} ${invoiceStatusOf(r) === "issued" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-amber-50 text-amber-800 border-amber-300"}`}>
      {invoiceStatusOf(r) === "issued" ? `Passada ${r.invoice_issued_on ? dayMonth(r.invoice_issued_on) : ""}`.trim() : "Fatura por passar"}
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Os três números que importam */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className={`rounded-xl p-4 border ${toIssueDone.length ? "bg-amber-50 border-amber-300" : "bg-white border-gray-200"}`}>
          <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Faturas por passar</p>
          <p className={`text-xl font-bold ${toIssueDone.length ? "text-amber-800" : "text-green-600"}`}>{toIssueDone.length || "Nenhuma"}</p>
          <p className="text-[11px] text-gray-600">
            {toIssueDone.length ? `${money(round2(toIssueDone.reduce((s, r) => s + grossOf(r), 0)))} de serviços já feitos` : "de serviços já feitos"}
            {toIssue.length > toIssueDone.length ? ` · + ${toIssue.length - toIssueDone.length} de serviços por fazer` : ""}
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">IVA a entregar · {monthName(month.month)}</p>
          <p className="text-xl font-bold text-blue-800">{money(month.vat)}</p>
          <p className="text-[11px] text-gray-600">
            {month.services.filter(r => r.request_date <= today).length} serviços feitos
            {month.vatUpcoming > 0 ? ` · + ${money(month.vatUpcoming)} quando os por fazer acontecerem` : ""}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">IVA de dinheiro que ainda não recebeste</p>
          <p className={`text-xl font-bold ${totalUnreceived ? "text-red-600" : "text-green-600"}`}>{money(totalUnreceived)}</p>
          <p className="text-[11px] text-gray-600">Tens de o entregar na mesma: cobra às equipas e aos clientes em falta.</p>
        </div>
      </div>

      {/* 1. Faturas por passar, todos os meses */}
      {toIssue.length > 0 && (
        <section className="bg-white border border-amber-300 rounded-xl overflow-hidden">
          <div className="px-3 pt-3 pb-2">
            <p className="text-sm font-bold text-navy">Faturas por passar ({toIssue.length})</p>
            <p className="text-xs text-gray-500">De todos os meses. Quando a passares, carrega em "Passei".</p>
          </div>
          <div className="divide-y divide-gray-100 border-t border-gray-100">
            {toIssue.map(r => invoiceRow(r, (
              <button onClick={() => onAdvanceInvoice(r)} title={invoiceTitle(r)}
                className={`${chip} bg-amber-500 text-white border-amber-500 hover:bg-amber-600`}>Passei</button>
            )))}
          </div>
        </section>
      )}

      {/* 2. IVA por mês */}
      <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-3 pt-3 pb-2">
          <p className="text-sm font-bold text-navy">IVA a entregar por mês</p>
          <p className="text-xs text-gray-500">Faturas da empresa, pelo dia do serviço, só serviços já feitos. Carrega num mês para ver as faturas.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-y border-gray-200 bg-gray-50">
                {["Mês", "Faturas", "IVA a entregar", "Ainda não recebido", "Por passar"].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {months.map(m => (
                <tr key={m.month} onClick={() => setPicked(m.month)} aria-selected={m.month === month.month}
                  className={`border-b border-gray-100 last:border-0 cursor-pointer ${m.month === month.month ? "bg-blue-50/70" : "hover:bg-gray-50"}`}>
                  <td className="px-3 py-2 font-semibold text-navy whitespace-nowrap">{monthName(m.month)}</td>
                  <td className="px-3 py-2 text-gray-600">{m.services.length || "-"}</td>
                  <td className="px-3 py-2 font-bold text-blue-800 whitespace-nowrap">
                    {money(m.vat)}
                    {m.vatUpcoming > 0 && <span className="font-normal text-gray-400"> + {money(m.vatUpcoming)} por fazer</span>}
                  </td>
                  <td className={`px-3 py-2 whitespace-nowrap ${m.vatUnpaid ? "text-red-600 font-semibold" : "text-gray-400"}`}>{m.vatUnpaid ? money(m.vatUnpaid) : "-"}</td>
                  <td className={`px-3 py-2 whitespace-nowrap ${m.toIssue ? "text-amber-700 font-semibold" : "text-gray-400"}`}>{m.toIssue || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Faturas do mês */}
      <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <p className="text-sm font-bold text-navy px-3 pt-3 pb-2">{monthName(month.month)}: faturas da empresa ({month.services.length})</p>
        <div className="divide-y divide-gray-100 border-t border-gray-100">
          {month.services.length === 0 && <p className="px-3 py-3 text-xs text-gray-400">Nenhuma fatura da empresa neste mês.</p>}
          {month.services.map(r => invoiceRow(r, issuedChip(r)))}
        </div>
      </section>

      {francisco.length > 0 && (
        <details className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <summary className="px-3 py-2.5 text-xs font-semibold text-gray-500 cursor-pointer select-none">
            Faturas do Francisco ({francisco.length}) · IVA {money(round2(francisco.reduce((sum, r) => sum + invoiceVatOf(r), 0)))} já entregue por ele, fora destas contas
          </summary>
          <div className="divide-y divide-gray-100 border-t border-gray-100 opacity-75">
            {francisco.map(r => invoiceRow(r, issuedChip(r)))}
          </div>
        </details>
      )}
    </div>
  );
}

export default CrmVat;
