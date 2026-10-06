import { useMemo } from "react";
import {
  ACTION_LABEL,
  CROSS_SELL_ITEMS,
  FOLLOW_UP_RULES as R,
  MAINTENANCE,
  STAGES,
  STAGE_INFO,
  crossSellMatrix,
  snapshotAt,
  touchResults,
  variantStats,
  type ActionKind,
  type FollowUpData,
  type PlannedClient,
} from "@/lib/clientFollowUp";
import { phoneKey, type ClientService } from "@/lib/clientRecords";
import { addDays, lisbonDay } from "@/lib/crmClosings";
import { GOOGLE_ADS_SOURCE, googlePhoneSet } from "@/lib/googleAdsResults";

// Vista "Estratégia" do separador Clientes (dono, 2026-10-06: "posicionar-me
// estrategicamente perante os clientes", "ganhar mais clientes, dar upsell e
// reduzir o nosso CAC"). Onde está cada contacto e como tratá-lo, as regras de
// contacto que o painel, o email e o bot seguem, o que ainda não venderam a
// quem já é cliente, o que as mensagens estão a dar e quanto custa um cliente
// do anúncio comparado com os que chegam sem custo (repetição e recomendação).

export interface StrategyService extends ClientService {
  source?: string | null;
  created_at?: string | null;
}

export interface SpendRow {
  platform: string;
  spend_date: string;
  amount: number;
}

const money = (n: number) => `${Math.round(n).toLocaleString("pt-PT")}€`;
const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)}%` : "-");

const RULES = [
  `Nunca escrever primeiro entre as 21h e as 9h30. O que calhar de noite vai às 9h30.`,
  `Quem escreveu por último vem sempre primeiro: nada comercial antes de lhe responder.`,
  `Orçamento sem resposta: 1.º seguimento umas ${R.firstFollowUpHours} horas depois, no mesmo dia; 2.º cerca de 24 horas depois; e parar (no máximo ${R.maxFollowUps}).`,
  `Passados ${R.followUpWindowDays} dias sem resposta não se insiste: só na data que a pessoa deu, ou numa campanha com uma razão concreta.`,
  `Serviço marcado: lembrar na véspera; ${R.sameVisitFromDays} a ${R.sameVisitUntilDays} dias antes, oferecer um segundo artigo com preço de pack.`,
  `Avaliação no dia do serviço (tapete com recolha: depois da entrega), um só lembrete 1 a ${R.reviewReminderUntilDays} dias depois, e nunca mais.`,
  `Recomendação a quem avaliou ou já repetiu, ${R.referralFromDays} a ${R.referralUntilDays} dias depois do serviço, uma vez por ano.`,
  `Manutenção quando passa o intervalo que o site recomenda: sofá ${Math.round(MAINTENANCE["Sofá"].days / 30)} meses, colchão, tapete e cadeiras ${Math.round(MAINTENANCE["Colchão"].days / 30)}, impermeabilização Essencial ${Math.round(MAINTENANCE.Essencial.days / 30)}.`,
  `Mensagens comerciais (mesma visita, recomendação, manutenção, campanha): uma de cada vez, com ${R.marketingEveryDays} dias de intervalo, e só ${R.quietDaysAfterOurMessage} dias depois de uma mensagem nossa sem resposta.`,
  `Não interessado: nada durante ${R.afterNoDays} dias; depois, só campanhas. Nunca condições maiores para reconquistar.`,
  `Nunca a quem pediu para não receber mensagens; quem tem uma queixa em aberto fica em pausa até estar resolvida.`,
  `Campanhas vão em lote: a lista e o texto passam sempre por ti antes de sair.`,
];

const VARIANT_KIND: Record<string, ActionKind> = {
  avaliacao: "avaliacao", recomendacao: "recomendacao", manutencao: "manutencao",
};

export default function ClientsStrategy({ planned, data, spend, services }: {
  planned: PlannedClient[];
  data: FollowUpData;
  spend: SpendRow[];
  services: StrategyService[];
}) {
  const now = new Date();
  const today = lisbonDay(now);

  const segments = useMemo(() => STAGES.map(stage => {
    const rows = planned.filter(p => p.plan.stage === stage);
    const billed = rows.reduce((sum, p) => sum + p.services.reduce((s, r) => s + (r.request_date <= today ? Number(r.billed_value || 0) : 0), 0), 0);
    return { stage, count: rows.length, billed };
  }), [planned, today]);

  const loyal = planned.filter(p => p.plan.loyal);
  const promoters = planned.filter(p => p.plan.promoter);
  const referred = planned.filter(p => p.client.referred_by);

  const cac = useMemo(() => {
    const since = addDays(today, -30);
    const google = googlePhoneSet(data.clients);
    const referredPhones = new Set(data.clients.filter(c => c.referred_by).map(c => phoneKey(c.phone)));
    const live = services.filter(s => !s.calendar_missing_since);
    const firstDay = new Map<string, string>();
    for (const s of live) {
      const k = phoneKey(s.phone);
      if (k.length === 9 && (!firstDay.has(k) || s.request_date < firstDay.get(k)!)) firstDay.set(k, s.request_date);
    }
    const recent = live.filter(s => {
      const closed = s.booked_at ?? s.created_at;
      return closed && lisbonDay(closed) >= since;
    });
    const g = recent.filter(s => s.source === GOOGLE_ADS_SOURCE || google.has(phoneKey(s.phone)));
    const repeat = recent.filter(s => { const k = phoneKey(s.phone); return k.length === 9 && firstDay.get(k)! < s.request_date; });
    const ref = recent.filter(s => referredPhones.has(phoneKey(s.phone)));
    const sum = (rows: StrategyService[]) => rows.reduce((t, s) => t + Number(s.billed_value || 0), 0);
    const cost = spend.filter(r => r.platform === "google" && r.spend_date >= since && r.spend_date <= today).reduce((t, r) => t + Number(r.amount || 0), 0);
    return { total: recent.length, google: g.length, googleBilled: sum(g), repeat: repeat.length, repeatBilled: sum(repeat), referred: ref.length, referredBilled: sum(ref), cost };
  }, [data.clients, services, spend, today]);

  const cross = useMemo(() => crossSellMatrix(planned.map(p => ({
    client: p.client,
    services: p.services,
    isClient: p.plan.servicesDone > 0 || ["cliente", "cliente_recente", "manutencao"].includes(p.plan.stage),
  }))), [planned]);

  const results = useMemo(() => touchResults(planned, addDays(today, -90), snapshotAt(data.clients)), [planned, today, data.clients]);
  const variants = useMemo(
    () => Object.entries(variantStats(planned, now)).filter(([id]) => VARIANT_KIND[id.replace(/-[ab]$/, "")]).sort(),
    [planned], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <p className="text-sm font-bold text-navy">Onde estão os teus contactos, e como tratar cada grupo</p>
        <p className="text-[11px] text-gray-500 mb-3">Cada contacto está num só grupo. O faturado é o dos serviços já feitos no CRM.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {segments.filter(s => s.count > 0).map(s => (
            <div key={s.stage} className="border border-gray-200 rounded-xl p-3">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-navy">{STAGE_INFO[s.stage].label}</p>
                <p className="text-lg font-bold text-navy">{s.count}</p>
              </div>
              {s.billed > 0 && <p className="text-[11px] text-gray-500">{money(s.billed)} faturados</p>}
              <p className="text-xs text-gray-700 mt-1">{STAGE_INFO[s.stage].stance}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ["Clientes fiéis", loyal.length, "2 ou mais serviços: primeiras vagas, condição de cliente"],
          ["Deram avaliação", promoters.length, "os mais prováveis de recomendar"],
          ["Vieram por recomendação", referred.length, "escreve na ficha quem recomendou"],
          ["Vieram do anúncio", planned.filter(p => p.client.from_google_ads).length, "etiqueta Google no WhatsApp"],
        ].map(([label, value, note]) => (
          <div key={String(label)} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-xl font-bold text-navy">{value}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">{note}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
        <p className="text-sm font-bold text-navy">Custo de cada cliente (últimos 30 dias)</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="border border-gray-200 rounded-lg p-3">
            <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider">Google Ads</p>
            <p className="text-lg font-bold text-navy">{cac.google ? money(cac.cost / cac.google) : "-"} <span className="text-xs font-normal text-gray-500">por serviço</span></p>
            <p className="text-[11px] text-gray-500">{money(cac.cost)} gastos · {cac.google} serviços fechados · {money(cac.googleBilled)} faturados</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-3">
            <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider">Clientes que voltaram</p>
            <p className="text-lg font-bold text-navy">{cac.repeat} <span className="text-xs font-normal text-gray-500">serviços, sem anúncio</span></p>
            <p className="text-[11px] text-gray-500">{money(cac.repeatBilled)} faturados · {pct(cac.repeat, cac.total)} dos fechos do mês</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-3">
            <p className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider">Por recomendação</p>
            <p className="text-lg font-bold text-navy">{cac.referred} <span className="text-xs font-normal text-gray-500">serviços, sem anúncio</span></p>
            <p className="text-[11px] text-gray-500">{money(cac.referredBilled)} faturados · só conta quem tem "recomendado por" na ficha</p>
          </div>
        </div>
        <p className="text-[11px] text-gray-500">
          Cada serviço de um cliente que volta ou que chega por recomendação custa, no máximo, a condição que lhe damos (a deslocação). Pedir avaliações sobe a
          conversão dos anúncios; a manutenção e as recomendações trazem clientes sem gasto; o segundo artigo na mesma visita aumenta o que cada cliente pago deixa.
          Fechos pelo dia de fecho do CRM; o Google conta pela origem "Google Ads" ou pelo telefone com etiqueta Google.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <p className="text-sm font-bold text-navy mb-2">Quando escrever e quando não (regras do painel, do email e do bot)</p>
        <ul className="space-y-1 list-disc pl-5">
          {RULES.map(r => <li key={r} className="text-xs text-gray-700">{r}</li>)}
        </ul>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-4 pb-2">
          <p className="text-sm font-bold text-navy">Venda cruzada: o que os clientes ainda não fizeram connosco</p>
          <p className="text-[11px] text-gray-500">Linha: o que já fizeram. Coluna: o que nunca fizeram. Pelo CRM e pelas etiquetas do WhatsApp.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-y border-gray-200 bg-gray-50">
                <th className="text-left px-3 py-2 text-[10.5px] font-bold text-gray-500 uppercase tracking-wider">Fizeram</th>
                {CROSS_SELL_ITEMS.map(b => <th key={b} className="text-left px-3 py-2 text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Sem {b.toLowerCase()}</th>)}
              </tr>
            </thead>
            <tbody>
              {CROSS_SELL_ITEMS.filter(a => cross.totals[a] > 0).map(a => (
                <tr key={a} className="border-b border-gray-100 last:border-0">
                  <td className="px-3 py-2 text-navy font-medium whitespace-nowrap">{a} ({cross.totals[a]})</td>
                  {CROSS_SELL_ITEMS.map(b => <td key={b} className="px-3 py-2 text-navy">{a === b ? "" : cross.matrix[a][b]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-4 pb-2">
          <p className="text-sm font-bold text-navy">O que as mensagens estão a dar (últimos 90 dias)</p>
          <p className="text-[11px] text-gray-500">
            Só conta o que foi registado com "Enviei" no painel ou pelo bot. Marcaram = serviço fechado no CRM nos 30 dias a seguir à mensagem.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-y border-gray-200 bg-gray-50">
                {["Mensagem", "Enviadas", "Responderam", "Marcaram", "Faturado"].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-[10.5px] font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map(r => (
                <tr key={r.kind} className="border-b border-gray-100 last:border-0">
                  <td className="px-3 py-2 text-navy font-medium">{ACTION_LABEL[r.kind]}</td>
                  <td className="px-3 py-2 text-navy">{r.sent}</td>
                  <td className="px-3 py-2 text-navy">{r.known ? `${r.replied} (${pct(r.replied, r.known)})` : "-"}</td>
                  <td className="px-3 py-2 text-navy">{r.booked} ({pct(r.booked, r.sent)})</td>
                  <td className="px-3 py-2 text-navy">{money(r.billed)}</td>
                </tr>
              ))}
              {results.length === 0 && <tr><td colSpan={5} className="text-center text-gray-500 py-6">Ainda não há envios registados.</td></tr>}
            </tbody>
          </table>
        </div>
        {variants.length > 0 && (
          <div className="p-4 pt-3 border-t border-gray-100">
            <p className="text-xs font-bold text-navy mb-1">Versões A e B</p>
            <p className="text-[11px] text-gray-500 mb-2">
              Com {R.minVariantSample} envios de cada versão, o painel e o bot passam a sugerir primeiro a que resultou mais (avaliação feita, resposta, ou serviço marcado).
            </p>
            <ul className="space-y-0.5">
              {variants.map(([id, s]) => (
                <li key={id} className="text-xs text-gray-700">
                  {ACTION_LABEL[VARIANT_KIND[id.replace(/-[ab]$/, "")]]} · versão {id.slice(-1).toUpperCase()}: {s.won} de {s.sent} ({pct(s.won, s.sent)})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
