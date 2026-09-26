import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { hasAdminAccess } from "./admin-authorization.ts";

/**
 * Sessão do Supabase Auth de uma conta em `admin_users`. Para as funções que
 * leem dados privados com a chave de serviço, que ignora o RLS: o RLS não
 * protege esse caminho, esta verificação é que protege.
 */
export async function isAuthenticatedAdmin(req: Request): Promise<boolean> {
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!token || !supabaseUrl || !serviceKey) return false;

  const supabase = createClient(supabaseUrl, serviceKey);
  return hasAdminAccess({
    auth: { getUser: (value) => supabase.auth.getUser(value) },
    from: (table) => ({ select: (columns) => ({ eq: (column, value) => ({
      maybeSingle: async () => {
        const { data, error } = await supabase.from(table).select(columns).eq(column, value).maybeSingle();
        return { data: data as { user_id: string } | null, error };
      },
    }) }) }),
  }, token);
}
