import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createEventDelivery, sendStoredEvent } from './eventDelivery';
beforeEach(()=>localStorage.clear());
describe('event delivery', () => {
  it('persists before sending and retries an ambiguous failure with the same id after reload', async () => {
    const send = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(undefined);
    const first = createEventDelivery(send,localStorage);
    first.enqueue({action:'whatsapp_click'});
    await vi.waitFor(()=>expect(first.status().lastError).toBe('offline'));
    expect(localStorage.length).toBe(1);
    const second = createEventDelivery(send,localStorage); await second.flush();
    expect(send.mock.calls[0][0].id).toBe(send.mock.calls[1][0].id);
    expect(second.status().pending).toBe(0); expect(localStorage.length).toBe(0);
  });
  it('keeps simultaneous tabs events independently', async () => {
    const send = vi.fn().mockRejectedValue(new Error('offline'));
    createEventDelivery(send,localStorage).enqueue({action:'call_click'});
    createEventDelivery(send,localStorage).enqueue({action:'whatsapp_click'});
    await vi.waitFor(()=>expect(send).toHaveBeenCalledTimes(2)); expect(localStorage.length).toBe(2);
  });
  it('accepts only successful responses or acknowledged primary-key duplicates', async () => {
    const event={id:crypto.randomUUID(),created_at:new Date().toISOString()};
    const fetcher=vi.fn().mockResolvedValueOnce({ok:false,status:409,json:async()=>({code:'23505',message:'quiz_events_pkey'})}).mockResolvedValueOnce({ok:false,status:403,json:async()=>({code:'42501'})});
    vi.stubGlobal('fetch',fetcher);
    await expect(sendStoredEvent('https://example.invalid','key',event)).resolves.toBeUndefined();
    await expect(sendStoredEvent('https://example.invalid','key',event)).rejects.toThrow('403');
    expect(fetcher.mock.calls[0][1].keepalive).toBe(true); vi.unstubAllGlobals();
  });
});

describe('colunas que o servidor ainda não conhece', () => {
  const pgrst204 = (column: string) => ({
    ok: false, status: 400,
    json: async () => ({ code: 'PGRST204', message: `Could not find the '${column}' column of 'quiz_events' in the schema cache` }),
  });
  const ok = { ok: true, status: 201, json: async () => ({}) };
  const event = { id: 'e1', created_at: new Date().toISOString(), action: 'page_view', gclid: 'Cj0', campaign_id: '221' };

  beforeEach(async () => {
    const { resetUnknownColumnsForTesting } = await import('./eventDelivery');
    resetUnknownColumnsForTesting();
  });

  /**
   * A migração é aplicada à mão no SQL Editor, por isso há uma janela em que o
   * código novo já está em produção e as colunas ainda não existem. Sem isto,
   * nessa janela o site deixava de registar qualquer evento, em silêncio.
   */
  it('perde a coluna desconhecida e entrega o evento na mesma', async () => {
    const { sendStoredEvent } = await import('./eventDelivery');
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(pgrst204('gclid'))
      .mockResolvedValueOnce(pgrst204('campaign_id'))
      .mockResolvedValueOnce(ok);
    vi.stubGlobal('fetch', fetchMock);

    await expect(sendStoredEvent('https://x.invalid', 'k', event)).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(3);
    const entregue = JSON.parse(fetchMock.mock.calls[2][1].body);
    expect(entregue).not.toHaveProperty('gclid');
    expect(entregue).not.toHaveProperty('campaign_id');
    expect(entregue.action).toBe('page_view');
    vi.unstubAllGlobals();
  });

  it('lembra-se da coluna e já não a envia no evento seguinte', async () => {
    const { sendStoredEvent } = await import('./eventDelivery');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(pgrst204('gclid')).mockResolvedValue(ok));
    await sendStoredEvent('https://x.invalid', 'k', { ...event, campaign_id: undefined });

    const segundo = vi.fn().mockResolvedValue(ok);
    vi.stubGlobal('fetch', segundo);
    await sendStoredEvent('https://x.invalid', 'k', { ...event, id: 'e2' });
    // Uma só chamada: já sabe que a coluna não existe, não volta a tentar.
    expect(segundo).toHaveBeenCalledTimes(1);
    expect(JSON.parse(segundo.mock.calls[0][1].body)).not.toHaveProperty('gclid');
    vi.unstubAllGlobals();
  });

  it('continua a rejeitar um erro que não seja de coluna em falta', async () => {
    const { sendStoredEvent } = await import('./eventDelivery');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({ code: '42501' }) }));
    await expect(sendStoredEvent('https://x.invalid', 'k', event)).rejects.toThrow('42501');
    vi.unstubAllGlobals();
  });
});
