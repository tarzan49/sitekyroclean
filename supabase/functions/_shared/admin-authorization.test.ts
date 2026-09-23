import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts';
import { hasAdminAccess } from './admin-authorization.ts';

for (const [label, authenticated, admin, error, expected] of [
  ['anonymous', false, false, false, false],
  ['authenticated non-admin', true, false, false, false],
  ['authorized admin', true, true, false, true],
  ['database error', true, true, true, false],
] as const) {
  Deno.test(label, async () => {
    const client = {
      auth: { getUser: async (_token: string) => ({ data: { user: authenticated ? { id: 'verified-user' } : null }, error: null }) },
      from: (table: string) => {
        assertEquals(table, 'admin_users');
        return { select: (_columns: string) => ({ eq: (column: string, value: string) => {
          assertEquals(column, 'user_id');
          assertEquals(value, 'verified-user');
          return { maybeSingle: async () => ({ data: admin ? { user_id: value } : null, error: error ? new Error('unavailable') : null }) };
        } }) };
      },
    };
    assertEquals(await hasAdminAccess(client, 'test-token'), expected);
  });
}
