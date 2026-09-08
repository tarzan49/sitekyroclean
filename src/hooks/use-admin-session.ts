import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Substitui o antigo gate de password client-side (uma string comparada em
// JS, visível em texto simples no bundle público — achado CRITICAL no audit
// de código 2026-09-08). O acesso real ao painel /admin passa a depender de
// uma sessão Supabase Auth válida, que também é o que as políticas RLS de
// leads/quiz_events/error_logs agora exigem para select/update (ver migration
// 20260908000000_restrict_admin_tables_to_authenticated.sql) — sem sessão,
// nem a UI mostra os dados nem o Supabase os devolve.
export function useAdminSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

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

  return { session, loading, isAuthed: !!session };
}
