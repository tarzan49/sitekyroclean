/**
 * Decisão de cookies e a sua ligação ao Google Consent Mode v2.
 *
 * O banner e a UX não mudam: `getConsent`/`setConsent`/`restoreConsent` são a
 * mesma interface de sempre. O que mudou foi o que está do outro lado —
 * carregar a tag e falar com a Google passou para `src/lib/gtag.ts`, para os
 * IDs deixarem de estar escritos à mão dentro de um ficheiro sobre
 * consentimento (era assim que o ID de uma conta de Google Ads desativada
 * continuou configurado meses depois de a conta deixar de ser usada).
 *
 * Os quatro sinais do Consent Mode v2 — `analytics_storage`, `ad_storage`,
 * `ad_user_data`, `ad_personalization` — são declarados como `denied` no script
 * inline do `index.html`, que corre antes de tudo o resto, e só passam a
 * `granted` aqui, depois de a pessoa aceitar. Os quatro andam juntos porque o
 * banner faz uma pergunta só; separá-los exigiria um banner com escolhas
 * separadas, que é outra decisão.
 */
import { applyConsentMode, loadGoogleTags, updateConsent } from './gtag';
import { readConsent, readConsentDecision, writeConsent, writeDecision, type ConsentDecision, type ConsentStatus } from './consentStorage';

export type { ConsentStatus, ConsentDecision };

// A leitura vive em `consentStorage.ts` para `gtag.ts` a poder usar sem
// importar este ficheiro, que por sua vez importa `gtag.ts`. O nome público
// mantém-se: todo o site continua a fazer `getConsent()` daqui.
export const getConsent = readConsent;
export const getConsentDecision = readConsentDecision;

/**
 * Aplica uma decisão já resolvida nas duas finalidades.
 *
 * O banner de hoje faz uma pergunta só, que cobre análise **e** publicidade —
 * o texto di-lo por extenso —, por isso `setConsent` mapeia para as duas.
 * Quando houver escolhas separadas, é esta função que o banner passa a chamar,
 * e mais nada no site muda.
 */
export function setConsentDecision(decision: { analytics: boolean; ads: boolean }) {
  writeDecision(decision);
  // A ordem importa: no modo avançado a tag tem de estar carregada para o
  // `consent update` ter a quem ser entregue; no modo básico o `update` é
  // inofensivo antes do carregamento porque fica na fila do `dataLayer` e é
  // lido assim que a biblioteca chega.
  if (decision.analytics || decision.ads) loadGoogleTags();
  updateConsent({ ...decision, decidedAt: null });
  window.dispatchEvent(new Event('kyro:consent-changed'));
}

export function setConsent(status: 'accepted' | 'declined') {
  writeConsent(status);
  const decision = readConsentDecision();
  if (decision.analytics || decision.ads) loadGoogleTags();
  updateConsent(decision);
  window.dispatchEvent(new Event('kyro:consent-changed'));
}

/** Call once on app start to restore previously given consent */
export function restoreConsent() {
  const stored = getConsent();
  const decision = readConsentDecision();
  applyConsentMode(decision.analytics || decision.ads);
  if (stored !== null) updateConsent(decision);
}
