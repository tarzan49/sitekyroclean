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

/**
 * Colunas que o servidor disse não conhecer, nesta sessão.
 *
 * Porque existe: as colunas de campanha (`gclid`, `campaign_id`, …) foram
 * acrescentadas a `quiz_events` por uma migração que é aplicada **à mão**, no
 * SQL Editor do dashboard — este projeto não corre `supabase db push`, por
 * razões que estão escritas no CLAUDE.md. Isso significa que há uma janela em
 * que o código novo já está em produção e a migração ainda não foi colada.
 *
 * Sem isto, nessa janela o PostgREST devolvia `PGRST204` a **todos** os
 * inserts e o site inteiro deixava de registar eventos, em silêncio, até
 * alguém reparar. Com isto, o primeiro insert que bate numa coluna
 * desconhecida perde essa coluna, é reenviado, e todos os seguintes já saem
 * sem ela: o pior caso passa a ser "ficámos sem a atribuição até a migração
 * ser aplicada" em vez de "ficámos sem métricas nenhumas".
 */
const unknownColumns = new Set<string>();

/** "Could not find the 'gclid' column of 'quiz_events' in the schema cache" */
function parseUnknownColumn(message: unknown): string | null {
  const match = /Could not find the '([^']+)' column/.exec(String(message ?? ''));
  return match?.[1] ?? null;
}

function withoutUnknownColumns(event: EventPayload): EventPayload {
  if (!unknownColumns.size) return event;
  const out = { ...event };
  for (const column of unknownColumns) delete out[column];
  return out;
}

export async function sendStoredEvent(url: string, key: string, event: EventPayload) {
  if (!url || !key) throw new Error('Tracking configuration missing');

  // Uma tentativa por coluna desconhecida, mais a inicial. O limite existe só
  // para nunca haver um ciclo infinito num erro que não estávamos à espera.
  for (let attempt = 0; attempt < 25; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(`${url}/rest/v1/quiz_events`, {
      method: 'POST', keepalive: true,
      headers: { 'Content-Type': 'application/json', apikey: key, Authorization: `Bearer ${key}`, Prefer: 'return=minimal' },
      body: JSON.stringify(withoutUnknownColumns(event)), signal: controller.signal,
    }).finally(() => clearTimeout(timer));
    if (response.ok) return;

    const body = await response.json().catch(() => ({}));
    // Only a primary-key duplicate is an acknowledged retry, never every 409.
    if (response.status === 409 && body.code === '23505' && String(body.message).includes('quiz_events_pkey')) return;

    if (body.code === 'PGRST204') {
      const column = parseUnknownColumn(body.message);
      if (column && !unknownColumns.has(column)) {
        console.warn(`[Tracking] A coluna '${column}' não existe em quiz_events; a continuar sem ela. Falta aplicar a migração?`);
        unknownColumns.add(column);
        continue;
      }
    }
    throw new Error(`Tracking HTTP ${response.status} (${body.code || 'unknown'})`);
  }
  throw new Error('Tracking: demasiadas colunas desconhecidas em quiz_events');
}

/** Só para os testes: o conjunto de colunas rejeitadas vive no módulo. */
export function resetUnknownColumnsForTesting() { unknownColumns.clear(); }
