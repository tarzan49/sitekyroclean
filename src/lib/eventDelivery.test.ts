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
