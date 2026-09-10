/** Persistent, bounded outbox. Stable primary keys make ambiguous retries safe. */
export type EventPayload = Record<string, unknown> & { id: string; created_at: string };
const KEY = 'kyro_event_v2:';
const MAX_AGE = 7 * 86400000;
export function createEventDelivery(send: (event: EventPayload) => Promise<void>, storage?: Storage, onFailure?: (message: string) => void) {
  let pending: EventPayload[] = [];
  try {
    for (let i = (storage?.length || 0) - 1; i >= 0; i--) {
      const key = storage!.key(i)!;
      if (!key.startsWith(KEY)) continue;
      try {
        const event = JSON.parse(storage!.getItem(key)!);
        if (event.id && Date.parse(event.created_at) > Date.now() - MAX_AGE) pending.push(event);
        else storage!.removeItem(key);
      } catch { storage!.removeItem(key); }
    }
  } catch { /* storage unavailable */ }
  const inFlight = new Set<string>();
  let lastError: string | null = null;
  const save = (event: EventPayload) => { try { storage?.setItem(KEY + event.id, JSON.stringify(event)); } catch { console.warn('[Tracking] Persistent storage unavailable; events remain in memory.'); } };
  const deliver = async (event: EventPayload) => {
    if (inFlight.has(event.id)) return;
    inFlight.add(event.id);
    try {
      await send(event);
      pending = pending.filter(e => e.id !== event.id);
      if (!pending.length) lastError = null;
      try { storage?.removeItem(KEY + event.id); } catch { /* acknowledged retry on reload is safe */ }
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Event delivery failed';
      console.warn('[Tracking]', lastError);
      onFailure?.(lastError);
    } finally { inFlight.delete(event.id); }
  };
  return {
    enqueue(payload: Record<string, unknown>) {
      const event = { ...payload, id: crypto.randomUUID(), created_at: new Date().toISOString() } as EventPayload;
      if (pending.length >= 200) {
        // Contact/submission evidence takes priority over periodic time samples.
        const disposable = pending.find(e => e.action === 'session_time' && !inFlight.has(e.id));
        if (disposable && payload.action !== 'session_time') {
          pending = pending.filter(e => e.id !== disposable.id);
          try { storage?.removeItem(KEY + disposable.id); } catch { /* unavailable */ }
        } else {
          lastError = 'Outbox full'; console.error('[Tracking] Outbox full'); onFailure?.(lastError); return;
        }
      }
      pending.push(event); save(event); void deliver(event);
    },
    flush: () => Promise.all(pending.map(deliver)),
    status: () => ({ pending: pending.length, lastError }),
  };
}

export async function sendStoredEvent(url: string, key: string, event: EventPayload) {
  if (!url || !key) throw new Error('Tracking configuration missing');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  const response = await fetch(`${url}/rest/v1/quiz_events`, {
    method: 'POST', keepalive: true,
    headers: { 'Content-Type': 'application/json', apikey: key, Authorization: `Bearer ${key}`, Prefer: 'return=minimal' },
    body: JSON.stringify(event), signal: controller.signal,
  }).finally(() => clearTimeout(timer));
  if (response.ok) return;
  // Only a primary-key duplicate is an acknowledged retry, never every 409.
  const body = await response.json().catch(() => ({}));
  if (response.status === 409 && body.code === '23505' && String(body.message).includes('quiz_events_pkey')) return;
  throw new Error(`Tracking HTTP ${response.status} (${body.code || 'unknown'})`);
}
