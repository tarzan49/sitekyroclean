import { useState, useCallback, useRef } from 'react';
import { submitQuizLead, type QuizLeadPayload } from '@/services/submissionService';
import { logError } from '@/lib/errorTracking';

interface UseQuizSubmissionOptions {
  trackSubmission: () => void;
  resetForm: () => void;
  onClose: () => void;
  navigate: (path: string) => void;
}

export function useQuizSubmission({ trackSubmission, resetForm, onClose, navigate }: UseQuizSubmissionOptions) {
  const inFlight = useRef<Promise<{ success: boolean }> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = useCallback((payload: QuizLeadPayload): Promise<{ success: boolean }> => {
    if (inFlight.current) return inFlight.current;
    const run = async () => {
      setIsSubmitting(true);
      try {
        await submitQuizLead(payload);

        // The lead is captured at this point - analytics tracking must never
        // block the success flow even if it throws.
        try {
          trackSubmission();
        } catch (trackErr) {
          console.warn('[QuizForm] trackSubmission failed (lead already sent):', trackErr);
        }

        resetForm();
        onClose();
        navigate('/obrigado');
        return { success: true };
      } catch (error) {
        console.error('[QuizForm] Submit error:', error);
        logError({
          message: error instanceof Error ? error.message : String(error),
          source: 'QuizForm-submit',
          severity: 'error',
          stack: error instanceof Error ? error.stack ?? null : null,
        });
        return { success: false };
      } finally {
        inFlight.current = null;
        setIsSubmitting(false);
      }
    };
    inFlight.current = run();
    return inFlight.current;
  }, [trackSubmission, resetForm, onClose, navigate]);

  return { isSubmitting, submit };
}
