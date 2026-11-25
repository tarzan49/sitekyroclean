interface AdminClient {
  auth: { getUser(token: string): Promise<{ data: { user: { id: string; factors?: { status: string }[] } | null }; error: unknown }> };
  from(table: string): {
    select(columns: string): {
      eq(column: string, value: string): {
        maybeSingle(): PromiseLike<{ data: { user_id: string } | null; error: unknown }>;
      };
    };
  };
}

/** O token já foi verificado por getUser; aqui só se lê o nível. */
function tokenLevel(token: string): string {
  try {
    return String(JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).aal ?? 'aal1');
  } catch {
    return 'aal1';
  }
}

/** Authentication alone never grants access to customer emails. Fail closed. */
export async function hasAdminAccess(client: AdminClient, token: string): Promise<boolean> {
  try {
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user) return false;
    // Conta com segundo fator confirmado: só uma sessão com o código (aal2) entra, como em is_admin() (25 Nov 2026).
    if (data.user.factors?.some(f => f.status === 'verified') && tokenLevel(token) !== 'aal2') return false;
    const { data: admin, error: adminError } = await client.from('admin_users')
      .select('user_id').eq('user_id', data.user.id).maybeSingle();
    return !adminError && admin?.user_id === data.user.id;
  } catch {
    return false;
  }
}
