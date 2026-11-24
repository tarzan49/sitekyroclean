import { describe, expect, it, vi } from 'vitest';
import { createRetryFetch } from './retryFetch';

const res = (status: number) => new Response('{}', { status });
const url = 'https://x.supabase.co/rest/v1/service_requests';
const make = (f: ReturnType<typeof vi.fn>) => createRetryFetch(f as unknown as typeof fetch, [0, 0]);

describe('createRetryFetch', () => {
  it('repete uma leitura que falha de passagem (502 e 504)', async () => {
    const f = vi.fn().mockResolvedValueOnce(res(502)).mockResolvedValueOnce(res(504)).mockResolvedValueOnce(res(200));
    expect((await make(f)(url)).status).toBe(200);
    expect(f).toHaveBeenCalledTimes(3);
  });
  it('desiste e devolve o erro verdadeiro', async () => {
    const f = vi.fn().mockImplementation(async () => res(502));
    expect((await make(f)(url)).status).toBe(502);
    expect(f).toHaveBeenCalledTimes(3);
  });
  it('nunca repete uma escrita, mas repete is_admin', async () => {
    const w = vi.fn().mockResolvedValue(res(503));
    await make(w)(url, { method: 'PATCH' });
    await make(w)(url, { method: 'POST' });
    expect(w).toHaveBeenCalledTimes(2);
    const a = vi.fn().mockResolvedValueOnce(res(503)).mockRejectedValueOnce(new TypeError('Load failed')).mockResolvedValueOnce(res(200));
    expect((await make(a)('https://x.supabase.co/rest/v1/rpc/is_admin', { method: 'POST' })).status).toBe(200);
  });
  it('deixa 503 e rede dos GET ao supabase-js', async () => {
    const f = vi.fn().mockResolvedValue(res(503));
    await make(f)(url);
    expect(f).toHaveBeenCalledTimes(1);
  });
  it('não repete 401 nem 400', async () => {
    const f = vi.fn().mockResolvedValue(res(401));
    await make(f)(url);
    expect(f).toHaveBeenCalledTimes(1);
  });
});
