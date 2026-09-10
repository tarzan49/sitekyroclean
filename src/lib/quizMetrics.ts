export interface MetricEvent { id: string; session_id: string; action: string; step: number; value: number | null; page_path: string | null }
export function uniqueAttempts<T extends MetricEvent>(events: T[]) {
  return [...new Map(events.map(e => [e.session_id, e])).values()];
}
export function classifyMetrics<T extends MetricEvent>(rows: T[]) {
  const events = [...new Map(rows.filter(e => !/^\/admin(?:\/|$)/.test(e.page_path || '')).map(e => [e.id, e])).values()];
  const modern = (e: T) => e.session_id.startsWith('v2:q:');
  const starts = uniqueAttempts(events.filter(e => e.action === 'start' && (modern(e) ? e.step === -1 : e.step === 0)));
  const completes = uniqueAttempts(events.filter(e => e.action === 'complete' && e.step === 4));
  const started = new Set(starts.map(e => e.session_id));
  const completionRate = starts.length ? 100 * completes.filter(e => started.has(e.session_id)).length / starts.length : 0;
  const stepFunnel = ['Localização', 'Serviço', 'Tipo', 'Quantidades', 'Contacto'].map((label, step) => {
    const count = uniqueAttempts(events.filter(e => modern(e) && e.action === 'start' && e.step === step && started.has(e.session_id))).length;
    const modernStarts = starts.filter(modern).length;
    return { step, label, count, rate: modernStarts ? count / modernStarts * 100 : 0 };
  });
  // v2 stores active-time increments; old records were cumulative snapshots.
  const durations = new Map<string, number>();
  for (const e of events.filter(e => e.action === 'session_time' && typeof e.value === 'number')) {
    const previous = durations.get(e.session_id) || 0;
    durations.set(e.session_id, e.session_id.startsWith('v2:') ? previous + Math.max(0, e.value!) : Math.max(previous, e.value!));
  }
  const avgSessionSeconds = durations.size ? Math.round([...durations.values()].reduce((a,b) => a+b,0) / durations.size) : 0;
  return { events, starts, completes, completionRate, stepFunnel, avgSessionSeconds,
    legacy: events.some(e => !e.session_id.startsWith('v2:')), modernStarts: starts.filter(modern).length };
}

/** Respect the actual page length (including a server cap below our page size). */
export async function fetchAllRows<T>(page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown; count?: number | null }>): Promise<T[]> {
  const rows: T[] = [];
  for (;;) {
    const result = await page(rows.length, rows.length + 499);
    if (result.error) throw result.error;
    const batch = result.data || [];
    if (!batch.length) {
      if (result.count != null && rows.length < result.count) throw new Error('Leitura incompleta das métricas. Atualize novamente.');
      return rows;
    }
    rows.push(...batch);
    if (result.count != null && rows.length >= result.count) return rows;
    // Without a count, continue until an empty page rather than assuming a cap.
  }
}
