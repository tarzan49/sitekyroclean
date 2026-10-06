import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Mail, Moon } from "lucide-react";
import {
  ACTION_LABEL,
  campaignCalendar,
  isQuietTime,
  type FollowUpAction,
  type PlannedClient,
} from "@/lib/clientFollowUp";
import { DIGEST_SECTIONS } from "@/lib/followUpDigest";
import { displayName } from "@/lib/clientRecords";
import { lisbonDay } from "@/lib/crmClosings";
import { FollowUpActionCard, type CardHandlers } from "./FollowUpActionCard";

// Vista "Hoje" do separador Clientes (dono, 2026-10-06): o que fazer hoje, por
// ordem, com a mensagem pronta; o que vem nos próximos dias; e o que NÃO se
// deve enviar, com o porquê. É a mesma lista que vai no email das 9h30 e que o
// bot recebe pela API (follow-ups).

const stamp = (iso: string) =>
  new Intl.DateTimeFormat("pt-PT", { timeZone: "Europe/Lisbon", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
const dm = (day: string) => `${day.slice(8, 10)}/${day.slice(5, 7)}`;

/** Agrupa os motivos parecidos ("Sem resposta há 5 dias", "há 6 dias") num só título. */
const REASON_FAMILIES: [RegExp, string][] = [
  [/^Primeiro responder/, "Primeiro responder: escreveram por último"],
  [/^Pediu para não receber/, "Pediram para não receber mensagens"],
  [/^Não quer promoções/, "Não querem promoções"],
  [/^Em pausa/, "Em pausa: queixa ou problema em aberto"],
  [/^Já tem serviço marcado/, "Já têm serviço marcado"],
  [/^Combinado voltar a falar/, "Combinado voltar a falar mais tarde"],
  [/^Disse que não/, "Disseram que não há menos de 90 dias"],
  [/^Já recebeu uma mensagem comercial/, "Já receberam uma mensagem comercial há pouco"],
  [/^A última mensagem foi nossa/, "A nossa última mensagem ficou sem resposta há menos de 7 dias"],
  [/^Uma mensagem comercial de cada vez/, "Uma mensagem comercial de cada vez"],
  [/^Já levou \d+ seguimentos/, "Já levaram 2 seguimentos sem resposta: parar"],
  [/^Sem resposta há/, "Mais de 3 dias sem resposta: o seguimento já não resulta"],
];
const reasonFamily = (reason: string) => REASON_FAMILIES.find(([re]) => re.test(reason))?.[1] ?? reason.split(":")[0];

export default function ClientsToday({ planned, snapshot, lastDigest, onSendDigest, onShowCampaigns, ...handlers }: {
  planned: PlannedClient[];
  snapshot: string | null;
  lastDigest: { day: string; items: number; error: string | null } | null;
  onSendDigest: () => Promise<string>;
  onShowCampaigns: () => void;
} & CardHandlers) {
  const now = new Date();
  const today = lisbonDay(now);
  const [openBlocked, setOpenBlocked] = useState<string | null>(null);
  const [digestNote, setDigestNote] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const sections = useMemo(() => DIGEST_SECTIONS.map(s => ({
    ...s,
    items: planned
      .flatMap(p => p.plan.today.filter(a => s.kinds.includes(a.kind)).map(a => ({ p, a })))
      .sort((x, y) => x.a.priority - y.a.priority || x.a.due.localeCompare(y.a.due)),
  })), [planned]);

  const campaigns = campaignCalendar(today).filter(r => r.active).map(r => ({
    run: r,
    eligible: planned.filter(p => p.plan.today.some(a => a.kind === "campanha" && a.campaignId === r.id)).length,
  }));

  const soon = planned
    .flatMap(p => p.plan.soon.filter(a => a.kind !== "campanha").map(a => ({ p, a })))
    .sort((x, y) => x.a.due.localeCompare(y.a.due));

  const blockedGroups = useMemo(() => {
    const groups = new Map<string, { p: PlannedClient; kind: FollowUpAction["kind"]; reason: string }[]>();
    for (const p of planned) {
      for (const b of p.plan.blocked) {
        if (b.kind === "campanha") continue;
        const key = reasonFamily(b.reason);
        groups.set(key, [...(groups.get(key) ?? []), { p, kind: b.kind, reason: b.reason }]);
      }
    }
    return [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [planned]);

  const total = new Set(sections.flatMap(s => s.items.map(i => i.p.client.id))).size;

  const sendDigest = async () => {
    setSending(true);
    setDigestNote(await onSendDigest());
    setSending(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-navy">{total} {total === 1 ? "pessoa" : "pessoas"} para seguir hoje</p>
          <p className="text-[11px] text-gray-500">
            {snapshot ? `WhatsApp lido até ${stamp(snapshot)}: o que aconteceu depois disso ainda não está aqui. ` : ""}
            Lê sempre a conversa antes de enviar.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button onClick={sendDigest} disabled={sending}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 bg-white text-navy hover:border-navy/30 disabled:opacity-40">
            <Mail className="w-3.5 h-3.5" /> {sending ? "A enviar…" : "Mandar-me o email agora"}
          </button>
          <p className="text-[11px] text-gray-500">
            {digestNote ?? (lastDigest ? `Último email a ${dm(lastDigest.day)}${lastDigest.error ? " (falhou)" : ` · ${lastDigest.items} pessoas`}` : "Email automático todos os dias às 9h30")}
          </p>
        </div>
      </div>

      {isQuietTime(now) && (
        <p className="flex items-center gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <Moon className="w-4 h-4 shrink-0" /> É de noite: prepara as mensagens, mas nenhuma sai antes das 9h30.
        </p>
      )}

      {campaigns.filter(c => c.eligible > 0).map(({ run, eligible }) => (
        <button key={run.id} onClick={onShowCampaigns}
          className="w-full text-left bg-gradient-to-br from-gold/[0.10] to-gold/[0.02] border border-gold/25 rounded-xl p-4">
          <p className="text-sm font-bold text-navy">Campanha a decorrer: {run.campaign.name} (até {dm(run.end)})</p>
          <p className="text-xs text-gray-600">{eligible} contactos elegíveis. Vai em lote: vê a lista e o texto na vista Campanhas antes de enviar.</p>
        </button>
      ))}

      {sections.map(s => s.items.length > 0 && (
        <div key={s.title} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-4 pb-2">
            <p className="text-sm font-bold text-navy">{s.title} ({s.items.length})</p>
            <p className="text-[11px] text-gray-500">{s.tip}</p>
          </div>
          <div className="divide-y divide-gray-100">
            {s.items.map(({ p, a }) => (
              <FollowUpActionCard key={`${p.client.id}:${a.kind}:${a.campaignId ?? ""}`} item={p} action={a} {...handlers} />
            ))}
          </div>
        </div>
      ))}

      {total === 0 && (
        <p className="text-sm text-gray-500 bg-white border border-gray-200 rounded-xl p-6 text-center">Nada para seguir hoje.</p>
      )}

      {soon.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm font-bold text-navy mb-2">Próximos dias ({soon.length})</p>
          <ul className="space-y-1">
            {soon.map(({ p, a }) => (
              <li key={`${p.client.id}:${a.kind}`} className="text-xs text-navy">
                <button onClick={() => handlers.onOpen(p.client.id)} className="text-left">
                  <strong>{dm(a.due)}</strong> · {displayName(p.client, p.services)}: {ACTION_LABEL[a.kind]}
                  <span className="text-gray-500"> · {a.why}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {blockedGroups.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-4 pb-2">
            <p className="text-sm font-bold text-navy">Não enviar hoje</p>
            <p className="text-[11px] text-gray-500">Mensagens que fariam sentido, mas que as regras travam. É aqui que se perde menos clientes por insistência.</p>
          </div>
          <div className="divide-y divide-gray-100">
            {blockedGroups.map(([family, rows]) => (
              <div key={family}>
                <button onClick={() => setOpenBlocked(o => (o === family ? null : family))}
                  className="w-full px-4 py-2 flex items-center gap-2 text-left text-xs text-navy hover:bg-gray-50">
                  {openBlocked === family ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  <span className="font-medium">{family}</span>
                  <span className="text-gray-500">({rows.length})</span>
                </button>
                {openBlocked === family && (
                  <ul className="px-10 pb-3 space-y-1">
                    {rows.map(({ p, kind, reason }) => (
                      <li key={`${p.client.id}:${kind}`} className="text-xs text-gray-700">
                        <button onClick={() => handlers.onOpen(p.client.id)} className="text-left">
                          <strong className="text-navy">{displayName(p.client, p.services)}</strong> · {ACTION_LABEL[kind]}: {reason}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
