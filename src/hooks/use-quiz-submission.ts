import { useState, useCallback } from 'react';
import { submitQuizLead, type QuizLeadPayload } from '@/services/submissionService';
import { logError } from '@/lib/errorTracking';

interface UseQuizSubmissionOptions {
  trackSubmission: () => void;
  resetForm: () => void;
  onClose: () => void;
  navigate: (path: string) => void;
}

export function useQuizSubmission({ trackSubmission, resetForm, onClose, navigate }: UseQuizSubmissionOptions) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = useCallback(async (payload: QuizLeadPayload): Promise<{ success: boolean }> => {
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
      setIsSubmitting(false);
    }
  }, [trackSubmission, resetForm, onClose, navigate]);

  return { isSubmitting, submit };
}
