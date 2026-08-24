import { useState, useCallback, useEffect } from "react";
import { RefreshCw, Trash2, CheckCircle, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ErrorLog {
  id: string;
  created_at: string;
  message: string;
  source: string | null;
  url: string | null;
  line_number: number | null;
  col_number: number | null;
  stack: string | null;
  user_agent: string | null;
  severity: string;
}

const ErrorLogPanel = () => {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [errorsLoading, setErrorsLoading] = useState(false);
  const [errorsError, setErrorsError] = useState<string | null>(null);

  const fetchErrors = useCallback(async () => {
    setErrorsLoading(true);
    setErrorsError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("error_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      setErrors(data ?? []);
    } catch (e: unknown) {
      setErrorsError(e instanceof Error ? e.message : "Erro ao carregar logs. Cria a tabela error_logs no Supabase primeiro.");
    } finally {
      setErrorsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchErrors();
  }, [fetchErrors]);

  const deleteError = async (id: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("error_logs").delete().eq("id", id);
    if (error) {
      alert(`Erro ao apagar: ${error.message}\n\nSolução: vai ao Supabase Dashboard → SQL Editor e corre:\nCREATE POLICY "allow_delete" ON public.error_logs FOR DELETE USING (true);`);
      return;
    }
    setErrors(prev => prev.filter(e => e.id !== id));
  };

  const clearAllErrors = async () => {
    if (!confirm("Apagar todos os logs de erro?")) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("error_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) {
      alert(`Erro ao apagar: ${error.message}\n\nSolução: vai ao Supabase Dashboard → SQL Editor e corre:\nCREATE POLICY "allow_delete" ON public.error_logs FOR DELETE USING (true);`);
      return;
    }
    setErrors([]);
    alert("Logs apagados com sucesso.");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-navy">Error Log</h2>
          <p className="text-sm text-gray-500">Últimos 50 erros registados no site</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchErrors}
            disabled={errorsLoading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 text-navy hover:border-navy/30 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${errorsLoading ? "animate-spin" : ""}`} />
            Atualizar
          </button>
          {errors.length > 0 && (
            <button
              onClick={clearAllErrors}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Limpar todos
            </button>
          )}
        </div>
      </div>

      {errorsError && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <p className="font-semibold mb-1">Tabela não encontrada</p>
          <p>{errorsError}</p>
          <p className="mt-2 text-xs text-amber-600">
            Corre o SQL em <code>supabase/migrations/20240101_admin_tables.sql</code> no teu projeto Supabase.
          </p>
        </div>
      )}

      {errorsLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!errorsLoading && !errorsError && errors.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3 opacity-60" />
          <p className="text-navy font-semibold">Sem erros registados</p>
          <p className="text-sm text-gray-400 mt-1">O site está a funcionar sem erros detectados.</p>
        </div>
      )}

      {!errorsLoading && errors.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Gravidade</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mensagem</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">URL</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Data</th>
                  <th className="w-10 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {errors.map(err => (
                  <tr key={err.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${
                        err.severity === "error"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : err.severity === "warning"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-orange-50 text-orange-700 border-orange-200"
                      }`}>
                        {err.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-navy font-medium text-xs max-w-[300px] truncate">{err.message}</p>
                      {err.source && (
                        <p className="text-gray-400 text-[10px] font-mono mt-0.5 truncate max-w-[300px]">
                          {err.source}{err.line_number ? `:${err.line_number}` : ""}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-gray-400 font-mono truncate max-w-[200px] block">{err.url ?? "-"}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-gray-400">
                        {new Date(err.created_at).toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => deleteError(err.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Setup instructions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-navy text-sm mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-gold" />
          Rastreamento de erros ativo
        </h3>
        <p className="text-xs text-gray-500 mb-2">
          O site captura automaticamente <code className="bg-gray-100 px-1 rounded">window.onerror</code> e <code className="bg-gray-100 px-1 rounded">unhandledrejection</code>
          e guarda na tabela <code className="bg-gray-100 px-1 rounded">error_logs</code> do Supabase.
        </p>
        <p className="text-xs text-gray-400">
          Se a tabela ainda não existe, corre o ficheiro <code className="bg-gray-100 px-1 rounded">supabase/migrations/20240101_admin_tables.sql</code> no teu Supabase.
        </p>
      </div>
    </div>
  );
};

export default ErrorLogPanel;
