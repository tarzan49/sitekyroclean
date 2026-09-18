import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// `Database` (src/integrations/supabase/types.ts) está desatualizado — só
// conhece duas tabelas antigas e não tem nenhuma função RPC tipada
// (`Functions: { [_ in never]: never }`). `.from()` ainda aceita qualquer
// nome de tabela; `.rpc()` não, por isso este é o primeiro sítio do projeto a
// precisar de um cast à mão em vez de regenerar o ficheiro inteiro.
const callIsAdmin = supabase.rpc as unknown as (fn: 'is_admin') => Promise<{ data: boolean | null; error: { message: string } | null }>;

// Substitui o antigo gate de password client-side (uma string comparada em
// JS, visível em texto simples no bundle público — achado CRITICAL no audit
// de código 2026-09-08). O acesso real ao painel /admin passa a depender de
// uma sessão Supabase Auth válida, que também é o que as políticas RLS de
// leads/quiz_events/error_logs agora exigem para select/update (ver migration
// 20260908000000_restrict_admin_tables_to_authenticated.sql) — sem sessão,
// nem a UI mostra os dados nem o Supabase os devolve.
//
// Sessão válida sozinha já não chega (2026-09-18): qualquer conta do
// Supabase Auth era, por construção, administradora — não havia distinção.
// `is_admin()` (ver migration 20260918010000_admin_authorization.sql) lê a
// tabela `admin_users` do lado do servidor; `isAdmin` aqui é só o reflexo
// dessa verificação para a UI decidir o que mostrar. A fronteira de
// segurança real é o RLS, não este hook — uma conta autenticada sem
// `admin_users` continua sem conseguir ler/escrever nada mesmo que este hook
// falhe ou seja contornado.
export function useAdminSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setIsAdmin(false);
      setCheckingAdmin(false);
      return;
    }
    setCheckingAdmin(true);
    callIsAdmin('is_admin').then(({ data, error }) => {
      setIsAdmin(!error && data === true);
      setCheckingAdmin(false);
    });
  }, [session]);

  return { session, loading, isAuthed: !!session, isAdmin, checkingAdmin };
}
