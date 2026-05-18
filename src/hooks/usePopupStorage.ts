/**
 * usePopupStorage.ts
 * Encapsulates all sessionStorage/localStorage reads and writes
 * used by the QuotePopup visibility logic.
 */

const SESSION_KEY = 'quotePopupSeen';
const SUBMITTED_KEY = 'quotePopupSubmitted';
const TIMESTAMP_KEY = 'quotePopupSeenAt';
const CLICKED_QUOTE_KEY = 'hasClickedQuote';
const HOURS_24_MS = 24 * 60 * 60 * 1000;

export function usePopupStorage() {
  function shouldShow(): boolean {
    if (sessionStorage.getItem(CLICKED_QUOTE_KEY) === '1') return false;
    if (sessionStorage.getItem(SUBMITTED_KEY) === '1') return false;
    if (localStorage.getItem(SUBMITTED_KEY) === '1') return false;
    if (sessionStorage.getItem(SESSION_KEY) === '1') return false;
    const lastSeenAt = localStorage.getItem(TIMESTAMP_KEY);
    if (lastSeenAt) {
      const timeSinceSeen = Date.now() - parseInt(lastSeenAt, 10);
      if (timeSinceSeen < HOURS_24_MS) return false;
    }
    return true;
  }

  function markSeen(): void {
    sessionStorage.setItem(SESSION_KEY, '1');
    localStorage.setItem(TIMESTAMP_KEY, String(Date.now()));
  }

  function markSubmitted(): void {
    sessionStorage.setItem(SUBMITTED_KEY, '1');
    localStorage.setItem(SUBMITTED_KEY, '1');
  }

  function markQuoteClicked(): void {
    sessionStorage.setItem(CLICKED_QUOTE_KEY, '1');
  }

  function isQuoteClicked(): boolean {
    return sessionStorage.getItem(CLICKED_QUOTE_KEY) === '1';
  }

  return { shouldShow, markSeen, markSubmitted, markQuoteClicked, isQuoteClicked };
}
