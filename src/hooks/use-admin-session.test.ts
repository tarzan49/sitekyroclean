import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useAdminSession } from './use-admin-session';

/**
 * Reproduz o formato real do supabase-js o suficiente para apanhar a
 * regressão que partiu o Admin Panel: `rpc()` lê `this.rest`, tal como a
 * biblioteca real. Se `useAdminSession` voltar a extrair `supabase.rpc`
 * para uma referência solta antes de a chamar (`const x = supabase.rpc;
 * x(...)`), `this` deixa de ser este objeto e o teste falha com o mesmo
 * erro visto em produção local: "undefined is not an object (evaluating
 * 'this.rest')".
 */
function fakeSupabaseClient(session: { user: { id: string } } | null, isAdminResult: boolean) {
  return {
    rest: { marker: true },
    rpc(fn: string) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!(this as any)?.rest) throw new TypeError("undefined is not an object (evaluating 'this.rest')");
      expect(fn).toBe('is_admin');
      return Promise.resolve({ data: isAdminResult, error: null });
    },
    auth: {
      getSession: () => Promise.resolve({ data: { session } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  };
}

const mocks = vi.hoisted(() => ({ client: null as unknown as ReturnType<typeof fakeSupabaseClient> }));
vi.mock('@/integrations/supabase/client', () => ({ get supabase() { return mocks.client; } }));

afterEach(cleanup);

it('sem sessão: não chama rpc, isAdmin fica falso', async () => {
  mocks.client = fakeSupabaseClient(null, true);
  const { result } = renderHook(() => useAdminSession());
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.isAuthed).toBe(false);
  expect(result.current.isAdmin).toBe(false);
});

it("com sessão: chama rpc('is_admin') sem perder o `this`, reflete admin=true", async () => {
  mocks.client = fakeSupabaseClient({ user: { id: '1' } }, true);
  const { result } = renderHook(() => useAdminSession());
  // `checkingAdmin` começa falso antes de a sessão carregar (ainda não há
  // nada a verificar) — esperar só por isso apanhava esse estado inicial
  // por engano. Tem de esperar pelos dois ao mesmo tempo: sessão carregada
  // E verificação terminada.
  await waitFor(() => {
    expect(result.current.isAuthed).toBe(true);
    expect(result.current.checkingAdmin).toBe(false);
  });
  expect(result.current.isAdmin).toBe(true);
});

it('com sessão mas is_admin() devolve falso: isAdmin fica falso, isAuthed continua true', async () => {
  mocks.client = fakeSupabaseClient({ user: { id: '1' } }, false);
  const { result } = renderHook(() => useAdminSession());
  await waitFor(() => {
    expect(result.current.isAuthed).toBe(true);
    expect(result.current.checkingAdmin).toBe(false);
  });
  expect(result.current.isAdmin).toBe(false);
});
