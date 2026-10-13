import { useState } from "react";
import { summarizeServiceMix, type MixRow, type ServiceLine } from "@/lib/crmServiceMix";
import type { CloseRateCount, ServiceCloseRates } from "@/lib/crmServiceCloseRate";

// Aba "Serviços" do CRM (dono, 2026-10-06): todos os serviços do mês numa
// tabela, com quantas vezes foram pedidos, quanto dinheiro deram e o ticket
// médio, para ver onde vale a pena investir. O mais pedido não é forçosamente o
// que dá mais dinheiro, e a tabela põe as duas posições lado a lado.
// Usa o mesmo mês da aba Pedidos (dia do serviço). A taxa de fecho (fechos ÷
// orçamentos de qualquer canal) conta as pessoas pelo mês do primeiro pedido:
// ver crmServiceCloseRate.ts.

const GOLD = "#D4AF37";

const money = (n: number) => `${Math.round(n).toLocaleString("pt-PT")}€`;
const percent = (part: number, whole: number) => `${whole ? Math.round((part / whole) * 100) : 0}%`;

type SortKey = "count" | "billed" | "average" | "rate";
const SORTS: { id: SortKey; label: string }[] = [
  { id: "count", label: "Mais pedidos" },
  { id: "billed", label: "Mais dinheiro" },
  { id: "average", label: "Ticket médio" },
  { id: "rate", label: "Taxa de fecho" },
];

/** Abaixo disto a taxa de um serviço ainda é ruído: não entra no destaque nem sobe na ordenação. */
const MIN_QUOTES = 5;
const rateOf = (c: CloseRateCount | undefined) => (c && c.quotes ? c.closed / c.quotes : null);

function Bar({ share }: { share: number }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(1, share)) * 100}%`, minWidth: share > 0 ? 2 : 0, background: GOLD }} />
    </div>
  );
}

function Kpi({ label, value, note, accent }: { label: string; value: string; note?: string; accent?: boolean }) {
  return (
    <div className={accent ? "bg-gradient-to-br from-gold/[0.10] to-gold/[0.02] border border-gold/25 rounded-xl p-4" : "bg-white border border-gray-200 rounded-xl p-4"}>
      <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-xl font-bold text-navy">{value}</p>
      {note && <p className="text-[11px] text-gray-500">{note}</p>}
    </div>
  );
}

/** Rende mais do que a procura sugere: está mais acima no dinheiro do que nos pedidos, ou tem ticket acima da média. */
const isHidden = (l: ServiceLine, average: number) => l.billedRank < l.countRank || l.average > average * 1.25;

const CrmServiceMix = ({ records, allRecords, monthLabel, closeRates }: {
  records: MixRow[]; allRecords: MixRow[]; monthLabel: string; closeRates?: ServiceCloseRates | null;
}) => {
  const [sort, setSort] = useState<SortKey>("count");
  // A repartição das linhas com vários serviços pesa-se com o histórico todo: um mês tem poucos pedidos sozinhos.
  const mix = summarizeServiceMix(records, allRecords);

  if (mix.count === 0 && !closeRates?.total.quotes) {
    return <p className="text-sm text-gray-500 py-8 text-center">Sem serviços em {monthLabel}.</p>;
  }

  // Régua do verde: média por serviço pedido. Num pedido com sofá e tapete cada um leva só parte do valor,
  // por isso comparar com o ticket médio por pedido deixava quase tudo abaixo.
  const lineAverage = mix.billed / Math.max(1, mix.services.reduce((s, l) => s + l.count, 0));
  // Serviços com orçamentos no mês mas sem nenhum serviço feito também aparecem, com 0 pedidos.
  const quotesOnly: ServiceLine[] = [...(closeRates?.byService.keys() ?? [])]
    .filter(label => !mix.services.some(l => l.label === label))
    .map(label => ({ label, count: 0, billed: 0, cut: 0, average: 0, alone: 0, countRank: 0, billedRank: 0 }));
  const rate = (l: ServiceLine) => closeRates?.byService.get(l.label);
  const sortRate = (l: ServiceLine) => { const c = rate(l); return c && c.quotes >= MIN_QUOTES ? c.closed / c.quotes : -1 + (rateOf(c) ?? 0) / 10; };
  const rows = [...mix.services, ...quotesOnly].sort((a, b) =>
    (sort === "rate" ? sortRate(b) - sortRate(a) : b[sort] - a[sort]) || b.count - a.count || (rate(b)?.quotes ?? 0) - (rate(a)?.quotes ?? 0));
  const maxCount = Math.max(1, ...mix.services.map(l => l.count));
  const topCount = mix.services[0];
  const topBilled = mix.services.find(l => l.billedRank === 1);
  const topRate = [...(closeRates?.byService ?? [])].filter(([, c]) => c.quotes >= MIN_QUOTES)
    .sort(([, a], [, b]) => b.closed / b.quotes - a.closed / a.quotes || b.quotes - a.quotes)[0];
  const totalRate = rateOf(closeRates?.total);
  const topAverage = [...mix.services].filter(l => l.count >= 2).sort((a, b) => b.average - a.average)[0];
  const hidden = mix.services.filter(l => l.countRank > 1 && isHidden(l, lineAverage)).sort((a, b) => b.average - a.average);

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Serviços com dia em {monthLabel}, lidos da descrição de cada linha.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Kpi accent label="Serviços" value={String(mix.count)} />
        {closeRates && (
          <Kpi label="Taxa de fecho" value={totalRate === null ? "–" : percent(closeRates.total.closed, closeRates.total.quotes)}
            note={`${closeRates.total.closed} fechos de ${closeRates.total.quotes} orçamentos`} />
        )}
        <Kpi label="Ticket médio" value={money(mix.average)} note="faturado ÷ serviços" />
        <Kpi label="Faturado" value={money(mix.billed)} />
        <Kpi label="A tua parte" value={money(mix.cut)} note={`ticket médio ${money(mix.count ? mix.cut / mix.count : 0)} para ti`} />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 text-xs text-navy space-y-1">
        {closeRates && closeRates.total.quotes > 0 && (
          <p>
            Taxa de fecho: <strong>{percent(closeRates.total.closed, closeRates.total.quotes)}</strong> ({closeRates.total.closed} de {closeRates.total.quotes} orçamentos;
            questionário {closeRates.quiz.closed} de {closeRates.quiz.quotes}, WhatsApp {closeRates.whatsApp.closed} de {closeRates.whatsApp.quotes})
            {topRate && <> · maior: <strong>{topRate[0]}</strong> ({percent(topRate[1].closed, topRate[1].quotes)}, {topRate[1].closed} de {topRate[1].quotes})</>}
          </p>
        )}
        {topCount && <p>Mais pedido: <strong>{topCount.label}</strong> ({topCount.count}, {percent(topCount.count, mix.count)} dos serviços)</p>}
        {topBilled && <p>Mais dinheiro: <strong>{topBilled.label}</strong> ({money(topBilled.billed)}, {percent(topBilled.billed, mix.billed)} do faturado)</p>}
        {topAverage && <p>Ticket médio mais alto (2 ou mais pedidos): <strong>{topAverage.label}</strong> ({money(topAverage.average)})</p>}
        {hidden.length > 0 && (
          <p className="text-gray-600">
            Rendem mais do que a procura sugere: {hidden.map(l => `${l.label} (${l.countRank}.º em pedidos, ${l.billedRank}.º em dinheiro, ticket ${money(l.average)})`).join("; ")}.
          </p>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-4 pb-3 flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm font-bold text-navy">Todos os serviços</p>
            <p className="text-[11px] text-gray-500">Pedidos, orçamentos, taxa de fecho, dinheiro e ticket médio de cada serviço no mês.</p>
          </div>
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-0.5" role="group" aria-label="Ordenar por">
            {SORTS.map(s => (
              <button key={s.id} onClick={() => setSort(s.id)} aria-pressed={sort === s.id}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${sort === s.id ? "bg-navy text-white" : "text-navy hover:bg-gray-50"}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-y border-gray-200 bg-gray-50">
                {["Serviço", "Pedidos", ...(closeRates ? ["Orçamentos", "Taxa de fecho"] : []), "% dos serviços", "Faturado", "% do faturado", "Ticket médio", "A tua parte", "Posição pedidos / dinheiro"].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(l => (
                <tr key={l.label} className="border-b border-gray-100 last:border-0">
                  <td className="px-3 py-2 text-navy font-medium whitespace-nowrap">{l.label}</td>
                  <td className="px-3 py-2 min-w-[90px]">
                    <span className="font-semibold text-navy">{l.count}</span>
                    {l.alone < l.count && <span className="text-gray-500 text-[10.5px]"> ({l.alone} sozinho{l.alone === 1 ? "" : "s"})</span>}
                    <div className="mt-1"><Bar share={l.count / maxCount} /></div>
                  </td>
                  {closeRates && (() => {
                    const c = rate(l);
                    const r = rateOf(c);
                    return (
                      <>
                        <td className="px-3 py-2 text-navy">{c?.quotes ?? 0}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {r === null ? <span className="text-gray-400">–</span> : (
                            <span className={`font-semibold ${c!.quotes < MIN_QUOTES ? "text-gray-500" : "text-navy"}`}>
                              {percent(c!.closed, c!.quotes)} <span className="font-normal text-gray-500 text-[10.5px]">({c!.closed}/{c!.quotes})</span>
                            </span>
                          )}
                        </td>
                      </>
                    );
                  })()}
                  <td className="px-3 py-2 text-navy">{percent(l.count, mix.count)}</td>
                  <td className="px-3 py-2 text-navy whitespace-nowrap">{money(l.billed)}</td>
                  <td className="px-3 py-2 text-navy">{percent(l.billed, mix.billed)}</td>
                  <td className={`px-3 py-2 whitespace-nowrap font-semibold ${l.average > lineAverage ? "text-green-700" : "text-navy"}`}>{money(l.average)}</td>
                  <td className="px-3 py-2 text-navy whitespace-nowrap">{money(l.cut)}</td>
                  <td className="px-3 py-2 text-navy whitespace-nowrap">
                    {l.count === 0 ? "–" : `${l.countRank}.º / ${l.billedRank}.º`}
                    {l.billedRank < l.countRank && <span className="ml-1 text-green-700 font-semibold" title="Mais acima no dinheiro do que nos pedidos">▲</span>}
                    {l.billedRank > l.countRank && <span className="ml-1 text-gray-400" title="Mais acima nos pedidos do que no dinheiro">▼</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-gray-500">
        {closeRates && `Taxa de fecho = fechos ÷ orçamentos recebidos em qualquer canal: cada pessoa que pediu preço no questionário do site ou no WhatsApp conta uma vez, no mês do primeiro pedido, e fechou se tem serviço no CRM a partir desse dia (ou, no WhatsApp, a etiqueta cliente ou marcado). Por isso não bate com a coluna Pedidos, que conta os serviços com dia no mês. O serviço do orçamento sai do pedido do questionário ou das etiquetas do WhatsApp (só impermeabilização conta como sofá); uma pessoa conta em cada serviço que pediu.${closeRates.withoutService ? ` ${closeRates.withoutService} contacto${closeRates.withoutService === 1 ? "" : "s"} do WhatsApp sem etiqueta de serviço entra${closeRates.withoutService === 1 ? "" : "m"} só na taxa do mês.` : ""} Com menos de ${MIN_QUOTES} orçamentos a taxa fica a cinzento. Depende das etiquetas do WhatsApp estarem em dia. `}
        Ticket médio a verde: acima da média por serviço pedido no mês ({money(lineAverage)}). ▲ = mais acima no dinheiro do que nos pedidos.
        {mix.combined > 0 && ` ${mix.combined} serviço${mix.combined === 1 ? "" : "s"} tinha${mix.combined === 1 ? "" : "m"} vários artigos (ex.: sofá + tapete): contam como pedido em cada um, e o valor reparte-se pelo ticket médio de cada artigo quando é pedido sozinho, por isso o faturado por serviço é uma estimativa nesses casos. A soma dá o faturado do mês.`}
        {mix.services.some(l => l.label.includes("(outros)")) && ` "Outros" são linhas cuja descrição não diz o artigo (por exemplo, só a morada); corrigir a descrição na aba Pedidos põe-nas no sítio certo.`}
      </p>
    </div>
  );
};

export default CrmServiceMix;
