export interface MetricEvent { id: string; session_id: string; action: string; step: number; value: number | null; page_path: string | null }
/** -1 é a abertura do quiz; 0..4 são os passos. Alinhado com QuizForm. */
export const STEP_LABELS = [
  { step: -1, label: 'Abertura' },
  { step: 0, label: 'Localização' },
  { step: 1, label: 'Serviço' },
  { step: 2, label: 'Tipo' },
  { step: 3, label: 'Quantidades' },
  { step: 4, label: 'Contacto' },
] as const;
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
  // Funil por tentativa: onde as pessoas desistem. Mesmo cálculo que
  // `supabase/queries/funil-quiz.sql` — se mudares um, muda o outro.
  //
  // `chegaram` é "o passo mais longe da tentativa é >= a este", não "viu este
  // passo". Um quiz aberto já preenchido (a partir do widget de preços) salta
  // passos: quem entrou direto no 3 passou o 0, 1 e 2, porque a resposta
  // desses passos já era conhecida. Contar só etapas efetivamente vistas
  // responde a outra pergunta e faria o funil crescer a meio.
  //
  // Desistiu = tentativa sem 'complete'. A ação 'abandon' não decide quem
  // desistiu, só confirma onde: como a pessoa pode sair, voltar e sair outra
  // vez, há tentativas com mais do que uma linha 'abandon'.
  const attempts = new Map<string, { furthest: number; completed: boolean }>();
  for (const e of events) {
    if (!modern(e) || !started.has(e.session_id)) continue;
    const a = attempts.get(e.session_id) ?? { furthest: -1, completed: false };
    if (e.action === 'start' && e.step > a.furthest) a.furthest = e.step;
    if (e.action === 'complete') a.completed = true;
    attempts.set(e.session_id, a);
  }
  const allAttempts = [...attempts.values()];
  const dropoff = STEP_LABELS.map(({ step, label }) => {
    const reached = allAttempts.filter(a => a.furthest >= step).length;
    const dropped = allAttempts.filter(a => !a.completed && a.furthest === step).length;
    return { step, label, reached, dropped,
      reachedRate: allAttempts.length ? reached / allAttempts.length * 100 : 0,
      dropRate: reached ? dropped / reached * 100 : 0 };
  });
  const attemptsCompleted = allAttempts.filter(a => a.completed).length;
  // v2 stores active-time increments; old records were cumulative snapshots.
  const durations = new Map<string, number>();
  for (const e of events.filter(e => e.action === 'session_time' && typeof e.value === 'number')) {
    const previous = durations.get(e.session_id) || 0;
    durations.set(e.session_id, e.session_id.startsWith('v2:') ? previous + Math.max(0, e.value!) : Math.max(previous, e.value!));
  }
  const avgSessionSeconds = durations.size ? Math.round([...durations.values()].reduce((a,b) => a+b,0) / durations.size) : 0;
  return { events, starts, completes, completionRate, dropoff, avgSessionSeconds,
    attemptsTotal: allAttempts.length, attemptsCompleted, attemptsAbandoned: allAttempts.length - attemptsCompleted,
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
