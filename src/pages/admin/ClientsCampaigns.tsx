import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import {
  AUDIENCE_LABEL,
  OFFERS_CONFIRMED,
  campaignCalendar,
  planAll,
  snapshotAt,
  touchResults,
  type FollowUpData,
} from "@/lib/clientFollowUp";
import { displayName, firstName, normalizePhone } from "@/lib/clientRecords";
import { dayDiff } from "@/lib/clientFollowUp";
import { lisbonDay } from "@/lib/crmClosings";
import { FollowUpActionCard, type CardHandlers } from "./FollowUpActionCard";

// Vista "Campanhas" do separador Clientes (dono, 2026-10-06: "com boas
// promoções"). O calendário do ano, quem recebe cada campanha (e quem fica de
// fora, com o porquê) e o texto de cada pessoa. Vai em lote, por isso nada sai
// sem o dono ver esta lista: é a regra de 05/10/2026 para envios a várias
// pessoas. Uma campanha futura pré-visualiza-se no primeiro dia dela.

const dm = (day: string) => `${day.slice(8, 10)}/${day.slice(5, 7)}`;
const money = (n: number) => `${Math.round(n).toLocaleString("pt-PT")}€`;

const csvCell = (v: string) => (/[",;\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

export default function ClientsCampaigns({ data, ...handlers }: { data: FollowUpData } & CardHandlers) {
  const now = new Date();
  const today = lisbonDay(now);
  const runs = campaignCalendar(today);
  const [selected, setSelected] = useState(() => (runs.find(r => r.active) ?? runs[0]).id);
  const [limit, setLimit] = useState(30);
  const run = runs.find(r => r.id === selected) ?? runs[0];
  const previewDay = run.active ? today : run.start;

  const planned = useMemo(
    () => planAll(data, { now, today: previewDay, campaigns: [run.campaign] }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, previewDay, run.id],
  );
  const eligible = planned.flatMap(p => p.plan.today.filter(a => a.kind === "campanha" && a.campaignId === run.id).map(a => ({ p, a })));
  const excluded = planned.flatMap(p => p.plan.blocked.filter(b => b.campaignId === run.id).map(b => ({ p, reason: b.reason })));
  const excludedByReason = [...excluded.reduce((m, e) => {
    const key = e.reason.replace(/\d+/g, "N").split(":")[0];
    m.set(key, (m.get(key) ?? 0) + 1);
    return m;
  }, new Map<string, number>())].sort((a, b) => b[1] - a[1]);

  const results = useMemo(() => {
    const rows = planned.map(p => ({ ...p, touches: p.touches.filter(t => t.kind === "campanha" && t.campaign === run.id) }));
    return touchResults(rows, "2000-01-01", snapshotAt(data.clients)).find(r => r.kind === "campanha") ?? null;
  }, [planned, run.id, data.clients]);

  const exportCsv = () => {
    const lines = [
      ["Primeiro nome", "Nome", "Telefone", "Mensagem"].join(","),
      ...eligible.map(({ p, a }) => [firstName(p.client, p.services), displayName(p.client, p.services), `+${normalizePhone(p.client.phone)}`, a.messages[0]?.text ?? ""].map(csvCell).join(",")),
    ];
    const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kyro-campanha-${run.id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {runs.map(r => {
          const days = dayDiff(today, r.start);
          return (
            <button key={r.id} onClick={() => { setSelected(r.id); setLimit(30); }} aria-pressed={r.id === run.id}
              className={`text-left rounded-xl p-4 border transition-colors ${r.id === run.id ? "border-navy bg-white shadow-sm" : "border-gray-200 bg-white hover:border-navy/30"}`}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-navy">{r.campaign.name}</p>
                <span className={`text-[10.5px] px-2 py-0.5 rounded-full border ${r.active ? "border-green-200 bg-green-50 text-green-800" : "border-gray-200 text-gray-600"}`}>
                  {r.active ? `até ${dm(r.end)}` : `daqui a ${days} dias`}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">{dm(r.start)} a {dm(r.end)}</p>
              <p className="text-xs text-gray-700 mt-1.5">{r.campaign.idea}</p>
            </button>
          );
        })}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
        <p className="text-sm font-bold text-navy">{run.campaign.name}: {dm(run.start)} a {dm(run.end)}</p>
        <p className="text-xs text-gray-700"><strong>Condição:</strong> {run.campaign.offer}</p>
        {!OFFERS_CONFIRMED && (
          <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
            As condições das campanhas são uma proposta: confirma-as antes da primeira campanha. Até lá o bot não envia nenhuma sozinho.
          </p>
        )}
        <p className="text-xs text-gray-600"><strong>Para quem:</strong> {run.campaign.audiences.map(a => AUDIENCE_LABEL[a]).join("; ")}.</p>
        <p className="text-xs text-gray-600">
          Fica sempre de fora quem pediu para não receber mensagens, quem tem uma queixa em aberto, quem já tem serviço marcado e quem recebeu outra mensagem comercial nos últimos 45 dias.
        </p>
        {results && results.sent > 0 && (
          <p className="text-xs text-navy">
            Resultado: {results.sent} enviadas · {results.replied} responderam{results.known < results.sent ? ` (de ${results.known} já lidas)` : ""} · {results.booked} marcaram em 30 dias · {money(results.billed)}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-navy">
          <strong>{eligible.length}</strong> recebem{run.active ? "" : ` (se fosse a ${dm(run.start)})`} · {excluded.length} ficam de fora
        </p>
        <button onClick={exportCsv} disabled={!eligible.length}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 bg-white text-navy hover:border-navy/30 disabled:opacity-40">
          <Download className="w-3.5 h-3.5" /> Lista e mensagens (CSV)
        </button>
      </div>

      {excludedByReason.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm font-bold text-navy mb-1">Ficam de fora</p>
          <ul className="space-y-0.5">
            {excludedByReason.map(([reason, n]) => <li key={reason} className="text-xs text-gray-700">{n} · {reason}</li>)}
          </ul>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
        {eligible.slice(0, limit).map(({ p, a }) => (
          <FollowUpActionCard key={`${p.client.id}:${run.id}`} item={p} action={a} {...handlers} />
        ))}
        {eligible.length === 0 && <p className="text-sm text-gray-500 text-center py-8">Ninguém para esta campanha com as regras de hoje.</p>}
      </div>
      {eligible.length > limit && (
        <button onClick={() => setLimit(l => l + 50)} className="w-full py-2 text-xs rounded-lg border border-gray-200 bg-white text-navy">
          Mostrar mais ({eligible.length - limit})
        </button>
      )}
    </div>
  );
}
