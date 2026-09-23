interface AdminClient {
  auth: { getUser(token: string): Promise<{ data: { user: { id: string } | null }; error: unknown }> };
  from(table: string): {
    select(columns: string): {
      eq(column: string, value: string): {
        maybeSingle(): PromiseLike<{ data: { user_id: string } | null; error: unknown }>;
      };
    };
  };
}

/** Authentication alone never grants access to customer emails. Fail closed. */
export async function hasAdminAccess(client: AdminClient, token: string): Promise<boolean> {
  try {
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user) return false;
    const { data: admin, error: adminError } = await client.from('admin_users')
      .select('user_id').eq('user_id', data.user.id).maybeSingle();
    return !adminError && admin?.user_id === data.user.id;
  } catch {
    return false;
  }
}
