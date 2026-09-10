import { useEffect, useRef, useCallback } from 'react';
import { trackEvent } from '@/lib/analytics';
import { trackQuizEvent } from '@/lib/quizTracking';
interface QuizAnalyticsOptions {
  isOpen: boolean; currentStep: number; totalSteps: number; service?: string;
  serviceType?: string; location?: string; timing?: string; contactMethod?: string; totalValue?: number;
}
/** v2: one attempt per opening, viewed steps, success only after delivery. */
export function useQuizAnalytics(options: QuizAnalyticsOptions) {
  const latest = useRef(options); latest.current = options;
  const attempt = useRef<{ id: string; seen: Set<number>; completed: boolean; closed: boolean } | null>(null);
  const payload = useCallback(() => ({ session_id: attempt.current?.id, service: latest.current.service,
    city: latest.current.location, service_type: latest.current.serviceType, value: latest.current.totalValue }), []);
  const abandon = useCallback(() => {
    const a = attempt.current;
    if (!a || a.completed || a.closed) return;
    a.closed = true;
    trackQuizEvent({ ...payload(), action: 'abandon', step: latest.current.currentStep });
    trackEvent('quiz_abandoned', { last_step: latest.current.currentStep });
  }, [payload]);
  useEffect(() => {
    if (!options.isOpen) { abandon(); attempt.current = null; return; }
    if (!attempt.current) {
      attempt.current = { id: `v2:q:${crypto.randomUUID()}`, seen: new Set(), completed: false, closed: false };
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
  useEffect(() => {
    window.addEventListener('pagehide', abandon);
    return () => { window.removeEventListener('pagehide', abandon); };
  }, [abandon]);
  const trackSubmission = useCallback(() => {
    if (!attempt.current || attempt.current.completed) return;
    attempt.current.completed = true;
    trackQuizEvent({ ...payload(), action: 'complete', step: 4 });
    trackEvent('quiz_completed', { value: latest.current.totalValue ?? 0, currency: 'EUR' });
  }, [payload]);
  return { trackSubmission };
}
