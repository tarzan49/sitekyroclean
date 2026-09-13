import { getConsent } from './consent';

const KEY = 'kyro_lead_attribution_v1';
const campaignKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'gbraid', 'wbraid', 'fbclid'] as const;
export type LeadAttribution = { landing_path: string; captured_at: number } & Partial<Record<typeof campaignKeys[number], string>>;

/** Consent-gated first entry; new tagged campaigns replace the previous one. */
export function captureLeadAttribution(): LeadAttribution | null {
  try {
    if (getConsent() !== 'accepted') { sessionStorage.removeItem(KEY); return null; }
    const params = new URLSearchParams(window.location.search);
    const previous = JSON.parse(sessionStorage.getItem(KEY) || 'null') as LeadAttribution | null;
    const tagged = campaignKeys.some(key => params.has(key));
    if (previous && Date.now() - previous.captured_at < 30 * 60000 && (!tagged || campaignKeys.every(key => (params.get(key) || undefined) === previous[key]))) return previous;
    const attribution: LeadAttribution = { landing_path: window.location.pathname, captured_at: Date.now() };
    for (const key of campaignKeys) {
      const value = params.get(key);
      if (value) attribution[key] = [...value].filter(char => char.charCodeAt(0) >= 32).join('').slice(0, 250);
    }
    sessionStorage.setItem(KEY, JSON.stringify(attribution));
    return attribution;
  } catch { return null; }
}

export function leadAttributionNote(): string {
  const attribution = captureLeadAttribution();
  return attribution ? `Origem da campanha: ${JSON.stringify(attribution)}` : '';
}
