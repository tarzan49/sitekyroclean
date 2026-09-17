import { useEffect, useRef, useCallback } from 'react';
import { trackEvent } from '@/lib/analytics';
import { trackQuizEvent } from '@/lib/quizTracking';
interface QuizAnalyticsOptions {
  isOpen: boolean; currentStep: number; totalSteps: number; service?: string;
  serviceType?: string; location?: string; timing?: string; contactMethod?: string; totalValue?: number;
}
/** v2: one attempt per opening, viewed steps, success only after delivery. */
export function useQuizAnalytics(options: QuizAnalyticsOptions) {
  const latest = useRef(options);
  // Closing also resets the form; preserve the last open step and selections.
  if (options.isOpen) latest.current = options;
  const attempt = useRef<{ id: string; seen: Set<number>; completed: boolean; reportedStep: number | null } | null>(null);
  const payload = useCallback(() => ({ session_id: attempt.current?.id, service: latest.current.service,
    city: latest.current.location, service_type: latest.current.serviceType, value: latest.current.totalValue }), []);
  // O abandono é reportado no passo onde a pessoa estava quando saiu. Carregar
  // no X é a minoria das saídas reais, por isso isto dispara também quando o
  // separador vai para segundo plano ou a página é descarregada — e aí a
  // pessoa pode voltar e continuar. A tentativa não fica trancada: reportar
  // duas vezes o mesmo passo é ignorado, mas avançar e voltar a sair reporta
  // o passo novo. Logo pode haver mais do que uma linha `abandon` por
  // `session_id`, e a análise conta tentativas distintas, nunca linhas
  // (ver `uniqueAttempts` em `src/lib/quizMetrics.ts` e a CTE `tentativas` em
  // `supabase/queries/estudo-dados-proprios.sql`).
  const abandon = useCallback(() => {
    const a = attempt.current;
    if (!a || a.completed) return;
    const step = latest.current.currentStep;
    if (a.reportedStep === step) return;
    a.reportedStep = step;
    trackQuizEvent({ ...payload(), action: 'abandon', step });
    trackEvent('quiz_abandoned', { last_step: step });
  }, [payload]);
  useEffect(() => {
    if (!options.isOpen) { abandon(); attempt.current = null; return; }
    if (!attempt.current) {
      attempt.current = { id: `v2:q:${crypto.randomUUID()}`, seen: new Set(), completed: false, reportedStep: null };
      trackQuizEvent({ ...payload(), action: 'start', step: -1 });
      trackEvent('quiz_started');
    }
    const a = attempt.current;
    if (!a.seen.has(options.currentStep) && !a.completed) {
      a.seen.add(options.currentStep);
      trackQuizEvent({ ...payload(), action: 'start', step: options.currentStep });
      trackEvent('quiz_step_view', { step_number: options.currentStep,
        step_name: ['location', 'service', 'treatment', 'quantities', 'contact'][options.currentStep] || 'unknown' });
    }
  }, [options.isOpen, options.currentStep, abandon, payload]);
  // Três sinais, porque nenhum sozinho cobre as saídas reais:
  // `visibilitychange` é o único que um browser de telemóvel garante quando
  // manda o separador para segundo plano e o mata mais tarde sem nunca o
  // descarregar; `pagehide` cobre fechar o separador e navegar para fora do
  // site; `popstate` cobre o "voltar", que numa SPA troca de rota e desmonta
  // o quiz sem disparar nenhum dos outros dois. Antes disto só `pagehide` (e
  // o fecho explícito) reportavam, e ~90% das desistências não eram medidas.
  useEffect(() => {
    const onHidden = () => { if (document.visibilityState === 'hidden') abandon(); };
    window.addEventListener('pagehide', abandon);
    window.addEventListener('popstate', abandon);
    document.addEventListener('visibilitychange', onHidden);
    return () => {
      window.removeEventListener('pagehide', abandon);
      window.removeEventListener('popstate', abandon);
      document.removeEventListener('visibilitychange', onHidden);
    };
  }, [abandon]);
  const trackSubmission = useCallback(() => {
    if (!attempt.current || attempt.current.completed) return;
    attempt.current.completed = true;
    trackQuizEvent({ ...payload(), action: 'complete', step: 4 });
    trackEvent('quiz_completed', { value: latest.current.totalValue ?? 0, currency: 'EUR' });
  }, [payload]);
  return { trackSubmission };
}
