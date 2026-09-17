import { useState, useCallback, useEffect } from "react";
import { RefreshCw, Mail, X, EyeOff, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { safeLocalGet, safeLocalSet } from "@/lib/safeStorage";

const HIDDEN_IDS_KEY = "kyro_admin_hidden_quiz_leads";

function loadHiddenIds(): Set<string> {
  try {
    return new Set(JSON.parse(safeLocalGet(HIDDEN_IDS_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

interface ResendEmailSummary {
  id: string;
  to: string[];
  from: string;
  subject: string;
  created_at: string;
  last_event: string;
  reply_to?: string[] | null;
}

interface ResendEmailDetail extends ResendEmailSummary {
  html?: string | null;
  text?: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  delivered: "Entregue",
  delivery_delayed: "Entrega atrasada",
  bounced: "Devolvido",
  complained: "Marcado como spam",
  sent: "Enviado",
  scheduled: "Agendado",
};

const STATUS_STYLE: Record<string, string> = {
  delivered: "bg-green-50 text-green-700 border-green-200",
  bounced: "bg-red-50 text-red-700 border-red-200",
  complained: "bg-red-50 text-red-700 border-red-200",
  delivery_delayed: "bg-amber-50 text-amber-700 border-amber-200",
};

const QuizLeadsPanel = () => {
  const [emails, setEmails] = useState<ResendEmailSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const [detail, setDetail] = useState<ResendEmailDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Guardado só no browser: o Resend não tem forma de apagar um email já enviado
  // (log de auditoria, não de gestão), por isso "ocultar" aqui é a única limpeza
  // possível — não afeta o que existe do lado do Resend.
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => loadHiddenIds());
  const [showHidden, setShowHidden] = useState(false);

  const hideEmail = (id: string) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      safeLocalSet(HIDDEN_IDS_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  const unhideAll = () => {
    setHiddenIds(new Set());
    safeLocalSet(HIDDEN_IDS_KEY, "[]");
  };

  const visibleEmails = showHidden ? emails : emails.filter((mail) => !hiddenIds.has(mail.id));

  const fetchEmails = useCallback(async (cursor?: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("list-resend-leads", {
        body: cursor ? { cursor, direction: "after" } : {},
      });
      if (fnError || !data?.success) throw new Error(data?.error ?? fnError?.message ?? "Erro ao carregar");
      setEmails((prev) => (cursor ? [...prev, ...(data.emails ?? [])] : (data.emails ?? [])));
      setHasMore(Boolean(data.hasMore));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao carregar pedidos do Resend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setDetail(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("list-resend-leads", {
        body: { emailId: id },
      });
      if (fnError || !data?.success) throw new Error(data?.error ?? fnError?.message ?? "Erro ao carregar");
      setDetail(data.email);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao carregar o email.");
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-navy">Quiz Leads</h2>
          <p className="text-sm text-gray-500">
            {visibleEmails.length} email{visibleEmails.length === 1 ? "" : "s"} de pedido enviados pelo Resend
            {hiddenIds.size > 0 && !showHidden ? ` · ${hiddenIds.size} escondido${hiddenIds.size === 1 ? "" : "s"}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          {hiddenIds.size > 0 && (
            <button
              onClick={() => setShowHidden((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 text-navy hover:border-navy/30 transition-colors"
            >
              {showHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showHidden ? "Esconder de novo" : `Mostrar escondidos (${hiddenIds.size})`}
            </button>
          )}
          {showHidden && hiddenIds.size > 0 && (
            <button
              onClick={unhideAll}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 text-navy hover:border-navy/30 transition-colors"
            >
              Limpar lista de escondidos
            </button>
          )}
          <button
            onClick={() => fetchEmails()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 text-navy hover:border-navy/30 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          {error}
        </div>
      )}

      {loading && emails.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && !error && visibleEmails.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-navy font-semibold">{emails.length > 0 ? "Todos os pedidos estão escondidos" : "Sem pedidos enviados ainda"}</p>
          <p className="text-sm text-gray-400 mt-1">
            {emails.length > 0 ? "Usa \"Mostrar escondidos\" acima para os ver de novo." : "Os pedidos aparecem aqui assim que o site enviar o primeiro email."}
          </p>
        </div>
      )}

      {visibleEmails.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assunto</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Contacto</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="w-10 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {visibleEmails.map((mail) => (
                  <tr
                    key={mail.id}
                    onClick={() => openDetail(mail.id)}
                    className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer ${hiddenIds.has(mail.id) ? "opacity-40" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-400">
                        {new Date(mail.created_at).toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-navy font-medium text-xs max-w-[280px] truncate">{mail.subject}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-gray-500 truncate max-w-[200px] block">
                        {mail.reply_to?.[0] ?? "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${STATUS_STYLE[mail.last_event] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
                        {STATUS_LABEL[mail.last_event] ?? mail.last_event}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {!hiddenIds.has(mail.id) && (
                        <button
                          onClick={(e) => { e.stopPropagation(); hideEmail(mail.id); }}
                          title="Ocultar"
                          className="text-gray-300 hover:text-navy transition-colors"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {hasMore && (
            <div className="p-3 border-t border-gray-100 text-center">
              <button
                onClick={() => fetchEmails(emails[emails.length - 1]?.id)}
                disabled={loading}
                className="px-4 py-2 text-xs font-medium rounded-lg border border-gray-200 text-navy hover:border-navy/30 transition-colors disabled:opacity-50"
              >
                {loading ? "A carregar..." : "Carregar mais"}
              </button>
            </div>
          )}
        </div>
      )}

      {(detailLoading || detail) && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
          onClick={() => { setDetail(null); }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <p className="font-semibold text-navy text-sm truncate pr-4">{detail?.subject ?? "A carregar..."}</p>
              <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              {detailLoading && (
                <div className="flex items-center justify-center py-16">
                  <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {!detailLoading && detail?.html && (
                <iframe title="Email" srcDoc={detail.html} className="w-full h-[60vh] border-0" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizLeadsPanel;
