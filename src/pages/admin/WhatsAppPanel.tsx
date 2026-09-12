import { useState, useCallback, useEffect } from "react";
import { RefreshCw, MessageCircle, Clock, Copy, Check, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import KyroConnectionStatus from "./KyroConnectionStatus";

interface WaConversation {
  jid: string;
  name: string | null;
  phone: string | null;
  labels: string[] | null;
  last_message_at: string | null;
  last_message_text: string | null;
  last_message_from_me: boolean;
  waiting_for_reply: boolean;
}

interface WaMessage {
  id: string;
  chat_jid: string;
  from_me: boolean;
  sent_at: string;
  body: string | null;
  type: string | null;
}

interface WaSuggestedReply {
  chat_jid: string;
  created_at: string;
  based_on_msg_ts: string | null;
  reply: string;
}

const fmtTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "-";

const WhatsAppPanel = () => {
  const [conversations, setConversations] = useState<WaConversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<WaMessage[]>([]);
  const [suggestion, setSuggestion] = useState<WaSuggestedReply | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: err } = await (supabase as any)
        .from("wa_conversations")
        .select("*")
        .order("last_message_at", { ascending: false })
        .limit(200);
      if (err) throw err;
      setConversations(data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao carregar conversas. Corre a migration wa_conversations no Supabase primeiro.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  const openConversation = useCallback(async (jid: string) => {
    setSelected(jid);
    setDetailLoading(true);
    setCopied(false);
    try {
      const [msgsRes, sugRes] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any).from("wa_messages").select("*").eq("chat_jid", jid).order("sent_at", { ascending: true }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any).from("wa_suggested_replies").select("*").eq("chat_jid", jid).maybeSingle(),
      ]);
      if (msgsRes.error) throw msgsRes.error;
      setMessages(msgsRes.data ?? []);
      setSuggestion(sugRes.data ?? null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao carregar a conversa.");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const copySuggestion = async () => {
    if (!suggestion) return;
    await navigator.clipboard.writeText(suggestion.reply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedConv = conversations.find(c => c.jid === selected);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-navy">WhatsApp</h2>
          <p className="text-sm text-gray-500">
            {conversations.length} conversa{conversations.length === 1 ? "" : "s"}
            {" · "}{conversations.filter(c => c.waiting_for_reply).length} à espera de resposta
          </p>
        </div>
        <button
          onClick={fetchConversations}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 text-navy hover:border-navy/30 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      <KyroConnectionStatus />

      <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
        <p>Em validação: isto só lê conversas e sugere respostas. Nada é enviado automaticamente — copia a sugestão e envia tu mesmo pelo WhatsApp.</p>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <p className="font-semibold mb-1">Não foi possível carregar</p>
          <p>{error}</p>
          <p className="mt-2 text-xs text-amber-600">
            Corre o SQL em <code className="bg-amber-100 px-1 rounded">supabase/migrations/20260910000000_add_whatsapp_conversations.sql</code> no Supabase, e confirma que <code className="bg-amber-100 px-1 rounded">bun run push</code> já correu no projeto kyro-clean-solutions.
          </p>
        </div>
      )}

      {!error && (
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
          {/* Lista de conversas */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden max-h-[70vh] overflow-y-auto">
            {loading && conversations.length === 0 && (
              <div className="flex items-center justify-center py-16">
                <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {!loading && conversations.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-12 px-4">Sem conversas sincronizadas ainda.</p>
            )}
            {conversations.map(c => (
              <button
                key={c.jid}
                onClick={() => openConversation(c.jid)}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50/70 transition-colors ${selected === c.jid ? "bg-gold/10" : ""}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-navy truncate">{c.name || c.phone || c.jid}</p>
                  {c.waiting_for_reply && <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />}
                </div>
                <p className="text-xs text-gray-400 truncate mt-0.5">{c.last_message_text || "-"}</p>
                {!!c.labels?.length && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {c.labels.map(l => (
                      <span key={l} className="text-[9px] px-1.5 py-0.5 rounded bg-navy/5 text-navy/60 border border-navy/10">{l}</span>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-gray-300 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />{fmtTime(c.last_message_at)}</p>
              </button>
            ))}
          </div>

          {/* Detalhe da conversa */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 min-h-[300px]">
            {!selected && (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm py-16">
                <div className="text-center">
                  <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  Escolhe uma conversa à esquerda
                </div>
              </div>
            )}
            {selected && (
              <>
                <h3 className="font-semibold text-navy mb-3">{selectedConv?.name || selectedConv?.phone || selected}</h3>
                {detailLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1 mb-4">
                      {messages.map(m => (
                        <div key={m.id} className={`flex ${m.from_me ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${m.from_me ? "bg-gold/15 text-navy" : "bg-gray-100 text-navy"}`}>
                            <p className="whitespace-pre-wrap">{m.body || `[${m.type}]`}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{fmtTime(m.sent_at)}</p>
                          </div>
                        </div>
                      ))}
                      {messages.length === 0 && <p className="text-sm text-gray-400 text-center py-8">Sem mensagens sincronizadas.</p>}
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sugestão de resposta</p>
                      {suggestion ? (
                        <div className="bg-navy/5 border border-navy/10 rounded-xl p-4">
                          <p className="text-sm text-navy whitespace-pre-wrap mb-3">{suggestion.reply}</p>
                          <button
                            onClick={copySuggestion}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gold text-navy hover:opacity-90 transition-opacity"
                          >
                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copied ? "Copiado" : "Copiar"}
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">Sem sugestão para esta conversa (ou já respondeste à última mensagem).</p>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppPanel;
