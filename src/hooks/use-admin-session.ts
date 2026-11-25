import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// `Database` (src/integrations/supabase/types.ts) está desatualizado — só
// conhece duas tabelas antigas e não tem nenhuma função RPC tipada
// (`Functions: { [_ in never]: never }`). `.from()` ainda aceita qualquer
// nome de tabela; `.rpc()` não, por isso este é o primeiro sítio do projeto a
// precisar de um cast à mão em vez de regenerar o ficheiro inteiro.
//
// Chamada como `supabase.rpc(fn)`, nunca extraída para uma referência solta
// (`const x = supabase.rpc; x(...)`) — isso desliga o método do objeto
// `supabase` a que pertence, e a própria biblioteca do Supabase falha a
// meio com "undefined is not an object (evaluating 'this.rest')" porque
// depende de `this` ser o cliente. Foi exatamente isto que partiu o painel
// admin na primeira versão deste ficheiro.
interface RpcCapableClient {
  rpc(fn: 'is_admin'): Promise<{ data: boolean | null; error: { message: string } | null }>;
}
// Cast do objeto, não do método: `(supabase as RpcCapableClient).rpc(fn)`
// continua a chamar `.rpc` por acesso a propriedade no `supabase` real — só
// o tipo muda, o `this` no runtime é sempre o `supabase` verdadeiro.
const callIsAdmin = (fn: 'is_admin') => (supabase as unknown as RpcCapableClient).rpc(fn);

/** Nível da sessão no próprio token: aal1 = só a senha, aal2 = senha e código. */
export function sessionLevel(token: string | undefined): string {
  try {
    const part = (token ?? '').split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return String(JSON.parse(atob(part)).aal ?? 'aal1');
  } catch {
    return 'aal1';
  }
}

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
  // A verificação falhou (rede ou Supabase): não é o mesmo que não ter acesso.
  const [adminError, setAdminError] = useState<string | null>(null);

  // Segundo fator (dono, 25 Nov 2026). Quem o exige é a base de dados (`is_admin()` recusa uma sessão só com senha quando a
  // conta tem um fator confirmado); aqui decide-se apenas que ecrã mostrar.
  const [factorId, setFactorId] = useState<string | null>(null);
  const [noFactor, setNoFactor] = useState(false);

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

  // Só quando muda a pessoa, não a cada objeto de sessão novo. O Supabase renova o
  // token quando se volta ao separador do browser e manda uma sessão nova; antes,
  // isso voltava a pôr o ecrã de carregamento, desmontava o painel e o CRM abria
  // outra vez nos Pedidos (dono, 2026-11-01: "a página dá reset").
  const userId = session?.user.id ?? null;
  const level = sessionLevel(session?.access_token);
  useEffect(() => {
    if (!userId) {
      setFactorId(null);
      setIsAdmin(false);
      setCheckingAdmin(false);
      return;
    }
    setCheckingAdmin(true);
    setAdminError(null);
    let stale = false;
    callIsAdmin('is_admin').then(async ({ data, error }) => {
      const factors = await supabase.auth.mfa.listFactors().catch(() => null);
      if (stale) return;
      setFactorId(factors?.data?.totp?.[0]?.id ?? null);
      // Só se oferece ligar o segundo fator quando a lista chegou mesmo vazia, nunca porque falhou.
      setNoFactor(!!factors?.data && !factors.data.totp.length);
      setIsAdmin(!error && data === true);
      setAdminError(error ? error.message : null);
      setCheckingAdmin(false);
    });
    return () => { stale = true; };
  }, [userId, level]);

  const needsCode = !!session && !isAdmin && !!factorId && level !== 'aal2';
  return { session, loading, isAuthed: !!session, isAdmin, checkingAdmin, adminError, factorId, needsCode, noFactor };
}
