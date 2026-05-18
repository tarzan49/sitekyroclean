/**
 * useQuizStorage.ts
 * Thin localStorage abstraction for the quiz timer key.
 */

/** localStorage key used to persist the countdown expiry timestamp. */
export const TIMER_KEY = 'kyro_timer_expiry';

/** Return type of {@link useQuizStorage}. */
export interface QuizStorageActions {
  /** Returns the stored expiry timestamp (ms since epoch), or null if absent. */
  getTimerExpiry: () => number | null;
  /** Persists the expiry timestamp (ms since epoch). */
  setTimerExpiry: (expiryMs: number) => void;
  /** Removes the stored expiry timestamp. */
  clearTimerExpiry: () => void;
}

/**
 * Hook that provides typed localStorage helpers for the quiz timer.
 * Keeps all localStorage key references in a single place so they are
 * easy to rename or migrate in the future.
 *
 * @returns `{ getTimerExpiry, setTimerExpiry, clearTimerExpiry }`
 */
export function useQuizStorage(): QuizStorageActions {
  const getTimerExpiry = (): number | null => {
    const raw = localStorage.getItem(TIMER_KEY);
    if (!raw) return null;
    const parsed = parseInt(raw, 10);
    return isNaN(parsed) ? null : parsed;
  };

  const setTimerExpiry = (expiryMs: number): void => {
    localStorage.setItem(TIMER_KEY, String(expiryMs));
  };

  const clearTimerExpiry = (): void => {
    localStorage.removeItem(TIMER_KEY);
  };

  return { getTimerExpiry, setTimerExpiry, clearTimerExpiry };
}
