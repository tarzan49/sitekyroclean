import { getConsent } from './consent';

const KEY = 'kyro_lead_attribution_v1';
const campaignKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'gbraid', 'wbraid', 'fbclid'] as const;
export type LeadAttribution = {
  landing_path: string;
  captured_at: number;
  referrer?: string;
  referrer_source?: string;
} & Partial<Record<typeof campaignKeys[number], string>>;

/**
 * Assistentes de IA que enviam referrer proprio, por dominio.
 *
 * Existe porque os clientes dizem que chegaram por IA e isso nunca ficava
 * registado em lado nenhum: a atribuicao guardava UTMs, que so existem em
 * campanhas pagas, e deitava fora o document.referrer, que e onde o nome do
 * assistente vem escrito.
 *
 * Nao apanha tudo, e e melhor saber onde falha do que confiar a mais nisto:
 * quem copia o endereco em vez de clicar chega sem referrer nenhum, alguns
 * assistentes nao o enviam, e um clique vindo das AI Overviews da Google
 * chega como google.com, indistinguivel de uma pesquisa normal. O que este
 * campo mede e um minimo garantido, nunca o total.
 */
const assistantHosts: Record<string, string> = {
  'chatgpt.com': 'ChatGPT',
  'chat.openai.com': 'ChatGPT',
  'openai.com': 'ChatGPT',
  'perplexity.ai': 'Perplexity',
  'claude.ai': 'Claude',
  'gemini.google.com': 'Gemini',
  'bard.google.com': 'Gemini',
  'copilot.microsoft.com': 'Copilot',
  'you.com': 'You.com',
};

/** Nome do assistente, o dominio simples, ou undefined se for do proprio site. */
function classifyReferrer(referrer: string): { referrer?: string; referrer_source?: string } {
  if (!referrer) return {};
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, '');
    if (host === window.location.hostname) return {};
    const assistant = Object.entries(assistantHosts).find(([domain]) => host === domain || host.endsWith(`.${domain}`));
    return { referrer: host.slice(0, 250), ...(assistant && { referrer_source: assistant[1] }) };
  } catch {
    return {};
  }
}

/** Consent-gated first entry; new tagged campaigns replace the previous one. */
export function captureLeadAttribution(): LeadAttribution | null {
  try {
    if (getConsent() !== 'accepted') { sessionStorage.removeItem(KEY); return null; }
    const params = new URLSearchParams(window.location.search);
    const previous = JSON.parse(sessionStorage.getItem(KEY) || 'null') as LeadAttribution | null;
    const tagged = campaignKeys.some(key => params.has(key));
    if (previous && Date.now() - previous.captured_at < 30 * 60000 && (!tagged || campaignKeys.every(key => (params.get(key) || undefined) === previous[key]))) return previous;
    const attribution: LeadAttribution = { landing_path: window.location.pathname, captured_at: Date.now(), ...classifyReferrer(document.referrer) };
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
  if (!attribution) return '';
  // O assistente vai numa linha propria e em texto simples: esta nota e lida
  // por uma pessoa no email de cada pedido, nao so no CRM, e um nome dentro
  // de um JSON passa despercebido.
  const assistant = attribution.referrer_source ? `Chegou por ${attribution.referrer_source}.\n` : '';
  return `${assistant}Origem da campanha: ${JSON.stringify(attribution)}`;
}
