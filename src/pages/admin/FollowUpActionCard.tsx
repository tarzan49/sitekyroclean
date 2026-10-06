import { useState } from "react";
import { Check, Copy, MessageCircle } from "lucide-react";
import { waLink, type ActionKind, type FollowUpAction, type PlannedClient } from "@/lib/clientFollowUp";
import { displayName, formatPhone, type ClientRow } from "@/lib/clientRecords";

// Um cartão por coisa a fazer (vistas Hoje e Campanhas): porquê, a mensagem já
// escrita (editável), e os botões para a abrir no WhatsApp e registar o envio.
// O registo é o que faz o seguimento seguinte sair na altura certa e o que
// mede o que resulta.

export interface TouchPayload {
  kind: ActionKind;
  campaign?: string | null;
  template?: string | null;
  skipped?: boolean;
  message?: string | null;
  note?: string | null;
}

export type ClientPatch = Partial<Pick<ClientRow,
  "name" | "notes" | "follow_up_at" | "follow_up_reason" | "reviewed_google" |
  "contact_preference" | "contact_note" | "on_hold_reason" | "referred_by">>;

export interface CardHandlers {
  onLog: (clientId: string, payload: TouchPayload) => Promise<boolean>;
  onSave: (clientId: string, patch: ClientPatch) => Promise<boolean>;
  onOpen: (clientId: string) => void;
}

const PLACEHOLDER = /\[(dia|hora)/;
const NO_NAME = /^(Bom dia|Boa tarde|Boa noite)!/;
const btn = "px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 text-navy hover:border-navy/30 disabled:opacity-40";

export function FollowUpActionCard({ item, action, onLog, onSave, onOpen }: { item: PlannedClient; action: FollowUpAction } & CardHandlers) {
  const { client: c, services } = item;
  const [variant, setVariant] = useState(0);
  const [text, setText] = useState(action.messages[0]?.text ?? "");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [later, setLater] = useState(false);
  const [laterDay, setLaterDay] = useState("");
  const [stopOpen, setStopOpen] = useState(false);
  const [stopWhy, setStopWhy] = useState("");
  const message = action.messages[variant];
  const isReview = action.kind === "avaliacao" || action.kind === "avaliacao_lembrete";
  const canDefer = action.kind === "seguimento" || action.kind === "responder" || action.kind === "lembrete";

  const pickVariant = (i: number) => {
    setVariant(i);
    setText(action.messages[i].text);
  };

  const run = async (fn: () => Promise<boolean>) => {
    setBusy(true);
    await fn();
    setBusy(false);
  };

  const sent = () => run(async () => {
    const ok = await onLog(c.id, { kind: action.kind, campaign: action.campaignId ?? null, template: message?.id ?? null, message: text || null });
    if (ok && action.kind === "lembrete") await onSave(c.id, { follow_up_at: null, follow_up_reason: null });
    return ok;
  });

  const skip = () => run(async () => {
    const ok = await onLog(c.id, { kind: action.kind, campaign: action.campaignId ?? null, skipped: true, note: "Decidido no painel: não enviar" });
    if (ok && action.kind === "lembrete") await onSave(c.id, { follow_up_at: null, follow_up_reason: null });
    return ok;
  });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="px-4 py-3 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <button onClick={() => onOpen(c.id)} className="min-w-0 text-left">
          <p className="font-medium text-navy truncate">
            {displayName(c, services)}
            <span className="ml-2 text-[11px] text-gray-500 font-normal">{formatPhone(c.phone)}{c.region ? ` · ${c.region}` : ""}</span>
          </p>
          <p className="text-xs text-gray-700">
            <strong>{action.title}</strong>
            {action.notBefore && <span className="text-gray-500"> · a partir das {action.notBefore}</span>}
            {" · "}{action.why}
          </p>
        </button>
        <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full border ${action.send === "auto" ? "border-green-200 text-green-800 bg-green-50" : "border-amber-200 text-amber-800 bg-amber-50"}`}
          title={action.send === "auto" ? "O bot pode enviar esta sozinho, dentro das horas" : "O bot só envia esta com o teu OK"}>
          {action.send === "auto" ? "Bot: sozinho" : "Bot: com o teu OK"}
        </span>
      </div>

      {action.check && <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5"><strong>Antes de enviar:</strong> {action.check}</p>}

      {action.messages.length > 1 && (
        <div className="flex flex-wrap gap-1" role="group" aria-label="Versão da mensagem">
          {action.messages.map((m, i) => (
            <button key={m.id} onClick={() => pickVariant(i)} aria-pressed={variant === i}
              className={`px-2 py-0.5 text-[11px] rounded-full border ${variant === i ? "bg-navy text-white border-navy" : "bg-white text-navy border-gray-200"}`}>
              {m.label}{i === 0 ? " (sugerida)" : ""}
            </button>
          ))}
        </div>
      )}

      {action.messages.length > 0 && (
        <>
          <textarea value={text} onChange={e => setText(e.target.value)} rows={Math.min(8, text.split("\n").length + 2)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-navy/40 bg-gray-50" />
          {PLACEHOLDER.test(text) && <p className="text-[11px] text-amber-800">Preenche [dia] e [hora] com vagas reais do calendário, em hora de Portugal.</p>}
          {NO_NAME.test(text) && <p className="text-[11px] text-amber-800">Sem nome: escreve na ficha o nome a usar nas mensagens.</p>}
        </>
      )}

      <div className="flex flex-wrap gap-1.5">
        <a href={waLink(c.phone, action.messages.length ? text : undefined)} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-[#0B2F2A] text-white">
          <MessageCircle className="w-3.5 h-3.5" /> {action.messages.length ? "Abrir no WhatsApp" : "Abrir conversa"}
        </a>
        {action.messages.length > 0 && (
          <button onClick={copy} className={`flex items-center gap-1 ${btn}`}>
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} {copied ? "Copiada" : "Copiar"}
          </button>
        )}
        <button onClick={sent} disabled={busy} className="px-2.5 py-1.5 text-xs rounded-lg bg-navy text-white disabled:opacity-40">
          {action.kind === "responder" ? "Já respondi" : "Enviei"}
        </button>
        {action.kind !== "responder" && <button onClick={skip} disabled={busy} className={btn}>Não enviar</button>}
        {isReview && <button onClick={() => run(() => onSave(c.id, { reviewed_google: true }))} disabled={busy} className={btn}>Já avaliou</button>}
        {canDefer && <button onClick={() => setLater(v => !v)} className={btn}>Lembrar noutro dia</button>}
        <button onClick={() => setStopOpen(v => !v)} className={`${btn} text-gray-500`}>Não contactar mais</button>
      </div>

      {later && (
        <div className="flex flex-wrap items-center gap-2">
          <input type="date" value={laterDay} onChange={e => setLaterDay(e.target.value)}
            className="px-2 py-1 text-xs border border-gray-200 rounded-lg" aria-label="Dia para voltar a falar" />
          <button disabled={!laterDay || busy} className="px-2.5 py-1.5 text-xs rounded-lg bg-navy text-white disabled:opacity-40"
            onClick={() => run(() => onSave(c.id, { follow_up_at: laterDay, follow_up_reason: c.follow_up_reason || "combinado voltar a falar" }))}>
            Guardar
          </button>
          <span className="text-[11px] text-gray-500">Até lá não aparece nenhum seguimento nem campanha.</span>
        </div>
      )}

      {stopOpen && (
        <div className="flex flex-wrap items-center gap-2">
          <input value={stopWhy} onChange={e => setStopWhy(e.target.value)} placeholder="Porquê? (ex.: pediu para não lhe escrevermos)"
            className="flex-1 min-w-[200px] px-2 py-1 text-xs border border-gray-200 rounded-lg" />
          <button disabled={busy} className="px-2.5 py-1.5 text-xs rounded-lg bg-red-700 text-white disabled:opacity-40"
            onClick={() => run(() => onSave(c.id, { contact_preference: "nao_contactar", contact_note: stopWhy.trim() || "Marcado no painel" }))}>
            Confirmar
          </button>
        </div>
      )}
    </div>
  );
}
