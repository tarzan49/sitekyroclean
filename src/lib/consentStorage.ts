/**
 * Onde a decisão de cookies está guardada — e mais nada.
 *
 * Existe para quebrar um ciclo: `consent.ts` precisa de `gtag.ts` para carregar
 * a tag e enviar o sinal de consentimento, e `gtag.ts` precisa de saber a
 * decisão antes de deixar sair um evento. Com a leitura aqui, os dois importam
 * este módulo e nenhum importa o outro.
 *
 * **Duas finalidades separadas, mesmo com um banner só.** Guardar a decisão
 * como um par `{analytics, ads}` em vez de um booleano é o que impede o erro de
 * tratar "aceitou análise" como "autorizou publicidade". Hoje o banner faz uma
 * pergunta única que cobre as duas coisas — o texto di-lo por extenso — por
 * isso aceitar liga as duas e recusar desliga as duas. Se um dia o banner
 * passar a ter escolhas separadas, muda-se o banner e `writeDecision`, e nada
 * mais no site precisa de saber.
 */

export const CONSENT_KEY = 'kyro_cookie_consent';
export const CONSENT_DECISION_KEY = 'kyro_consent_v2';

/** Forma legada, mantida porque meio site a lê e o banner escreve-a. */
export type ConsentStatus = 'accepted' | 'declined' | null;

export interface ConsentDecision {
  /** Medição de audiência: GA4, `quiz_events`, atribuição interna. */
  analytics: boolean;
  /** Publicidade: conversões do Google Ads, enhanced conversions, remarketing. */
  ads: boolean;
  decidedAt: string | null;
}

export const NO_CONSENT: ConsentDecision = { analytics: false, ads: false, decidedAt: null };

export function readConsent(): ConsentStatus {
  try {
    return (localStorage.getItem(CONSENT_KEY) as ConsentStatus) ?? null;
  } catch {
    // Armazenamento bloqueado lê-se como "ainda não decidiu", que é o estado
    // mais restritivo: sem decisão, nada é enviado.
    return null;
  }
}

/**
 * A decisão detalhada.
 *
 * A chave legada manda quando as duas existem: é a que o banner escreve, e se
 * alguém recusar depois de ter aceitado, é ela que fica correta primeiro. A
 * chave detalhada só acrescenta granularidade dentro de uma aceitação.
 */
export function readConsentDecision(): ConsentDecision {
  const legacy = readConsent();
  if (legacy === null) return NO_CONSENT;
  if (legacy === 'declined') return { analytics: false, ads: false, decidedAt: null };
  try {
    const stored = JSON.parse(localStorage.getItem(CONSENT_DECISION_KEY) || 'null') as ConsentDecision | null;
    if (stored && typeof stored.analytics === 'boolean' && typeof stored.ads === 'boolean') return stored;
  } catch { /* storage blocked */ }
  // Aceitação sem detalhe: é uma aceitação feita pelo banner atual, que pergunta
  // pelas duas finalidades numa frase só.
  return { analytics: true, ads: true, decidedAt: null };
}

export function writeConsent(status: 'accepted' | 'declined'): void {
  writeDecision(status === 'accepted' ? { analytics: true, ads: true } : { analytics: false, ads: false });
}

export function writeDecision(decision: { analytics: boolean; ads: boolean }): void {
  const full: ConsentDecision = { ...decision, decidedAt: new Date().toISOString() };
  try {
    // As duas chaves são escritas em conjunto e nunca separadas: o resto do
    // site lê a legada, o Consent Mode lê a detalhada.
    localStorage.setItem(CONSENT_KEY, decision.analytics || decision.ads ? 'accepted' : 'declined');
    localStorage.setItem(CONSENT_DECISION_KEY, JSON.stringify(full));
  } catch { /* storage blocked */ }
}
