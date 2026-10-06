import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { lisbonDay, shiftMonth } from "@/lib/crmClosings";
import { defaultTeamFor, isUpsellTeam, splitUpsell, summarizeUpsells, teamShareOf, UPSELL_TEXT, type UpsellRow } from "@/lib/crmUpsell";

// Aba "Upsell" do CRM: o que cada equipa vendeu a mais nos serviços do mês e
// como se divide (70/30, no Porto 60/40; a equipa fica sempre com a maior).
// O valor escreve-se no formulário do pedido, na aba Pedidos.

interface Row extends UpsellRow {
  id: string;
  request_date: string;
  description: string;
  client_name: string | null;
}

const money = (n: number) => `${(Math.round(n * 100) / 100).toLocaleString("pt-PT", { maximumFractionDigits: 2 })}€`;
const MONTH_FMT = new Intl.DateTimeFormat("pt-PT", { month: "long", year: "numeric", timeZone: "UTC" });
const monthName = (month: string) => MONTH_FMT.format(new Date(`${month}-15T12:00:00Z`));
const pct = (team: Parameters<typeof teamShareOf>[0]) => {
  const t = Math.round(teamShareOf(team) * 100);
  return `${t}/${100 - t}`;
};

const CrmUpsell = ({ records, onEdit }: { records: Row[]; onEdit: (id: string) => void }) => {
  const currentMonth = lisbonDay(new Date()).slice(0, 7);
  const [month, setMonth] = useState(currentMonth);

  const rows = useMemo(
    () => records.filter(r => r.request_date.startsWith(month) && (Number(r.upsell_value) || 0) > 0),
    [records, month],
  );
  const summary = useMemo(() => summarizeUpsells(rows), [rows]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-gray-500">
          Divisão: 70% equipa / 30% para ti; no Porto 60% / 40%. A tua parte já entra no teu cut. Mês do serviço. O valor mete-se em cada pedido (lápis), na aba Pedidos.
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
        <div className="bg-gradient-to-br from-gold/[0.10] to-gold/[0.02] border border-gold/25 rounded-xl p-4">
          <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Upsell total</p>
          <p className={`text-xl font-bold ${UPSELL_TEXT}`}>{money(summary.value)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Serviços com upsell</p>
          <p className="text-xl font-bold text-navy">{summary.count}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Para as equipas</p>
          <p className="text-xl font-bold text-navy">{money(summary.teamPart)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">A tua parte</p>
          <p className="text-xl font-bold text-gold">{money(summary.ownerPart)}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <p className="text-sm font-bold text-navy px-3 pt-3">Por equipa</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {["Equipa", "Divisão", "Serviços", "Upsell", "Equipa recebe", "A tua parte"].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {summary.teams.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Sem upsells em {monthName(month)}.</td></tr>
              )}
              {summary.teams.map(t => (
                <tr key={t.team} className="border-b border-gray-100 last:border-0">
                  <td className="px-3 py-2 text-navy font-medium whitespace-nowrap">{t.team}</td>
                  <td className="px-3 py-2 text-gray-500">{pct(t.team)}</td>
                  <td className="px-3 py-2 text-navy">{t.count}</td>
                  <td className={`px-3 py-2 font-semibold whitespace-nowrap ${UPSELL_TEXT}`}>{money(t.value)}</td>
                  <td className="px-3 py-2 font-semibold text-navy whitespace-nowrap">{money(t.teamPart)}</td>
                  <td className="px-3 py-2 font-semibold text-gold whitespace-nowrap">{money(t.ownerPart)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {rows.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <p className="text-sm font-bold text-navy px-3 pt-3">Serviços</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {["Dia", "Serviço", "Equipa", "Upsell", "Equipa recebe", "A tua parte"].map(h => (
                    <th key={h} className="text-left px-3 py-2 text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(r => {
                  const team = isUpsellTeam(r.upsell_team) ? r.upsell_team : defaultTeamFor(r.locality);
                  const split = splitUpsell(Number(r.upsell_value), team);
                  return (
                    <tr key={r.id} onClick={() => onEdit(r.id)} className="border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50">
                      <td className="px-3 py-2 font-mono text-navy">{r.request_date.slice(8, 10)}/{r.request_date.slice(5, 7)}</td>
                      <td className="px-3 py-2 text-navy max-w-[260px] truncate">{r.client_name ? `${r.client_name} · ` : ""}{r.description || "-"}</td>
                      <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{team}{!isUpsellTeam(r.upsell_team) && <span className="text-amber-700"> (por confirmar)</span>}</td>
                      <td className={`px-3 py-2 font-semibold whitespace-nowrap ${UPSELL_TEXT}`}>{money(Number(r.upsell_value))}</td>
                      <td className="px-3 py-2 font-semibold text-navy whitespace-nowrap">{money(split.team)}</td>
                      <td className="px-3 py-2 font-semibold text-gold whitespace-nowrap">{money(split.owner)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrmUpsell;
