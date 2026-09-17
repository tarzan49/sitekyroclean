/**
 * Enhanced Conversions for Leads — dados first-party, com hash, para o Google Ads.
 *
 * Para que serve: sem isto, um clique num anúncio só é ligado a uma conversão
 * se o `gclid` sobreviver desde o clique até à submissão (cookie de terceiros,
 * ITP do Safari, pessoa que muda de telemóvel para computador). Com isto, o
 * email ou o telefone que a pessoa escreveu no formulário — com hash, nunca em
 * claro — deixam a Google ligar a conversão à conta que fez o clique, mesmo
 * quando o identificador do clique se perdeu.
 *
 * Como é implementado: `gtag('set', 'user_data', …)` com os campos
 * `sha256_email_address` / `sha256_phone_number`, que é a forma atual e
 * suportada de enviar dados já com hash. **Não** se usa o formato antigo
 * `enhanced_conversion_data`, retirado pela Google.
 *
 * Regras que não se quebram:
 * - o hash é feito no browser, com SHA-256; o valor em claro nunca sai daqui;
 * - nada disto vai para parâmetros normais de evento, URLs ou UTMs — só para o
 *   canal `user_data`, que é o único que a Google trata como dados do cliente;
 * - só corre com `ad_user_data` concedido, e só se
 *   `VITE_ENHANCED_CONVERSIONS=true`.
 */
import { ENHANCED_CONVERSIONS_ENABLED } from '@/constants/tracking';
import { getConsent } from './consent';
import { isDebugMode } from '@/constants/tracking';

/** Email normalizado como a Google o espera: minúsculas, sem espaços. */
function normalizeEmail(email: string): string | null {
  const value = email.trim().toLowerCase();
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) ? value : null;
}

/**
 * Telefone em E.164, que é o único formato que a Google aceita.
 *
 * Um número escrito neste site vem quase sempre como "912 345 678", sem
 * indicativo. Assume-se Portugal (+351) quando são nove dígitos a começar por
 * 9, 2 ou 3, que é o plano de numeração português. Qualquer outra coisa é
 * descartada em vez de adivinhada: um indicativo errado produz um hash válido
 * de um número que não existe, e isso não dá erro em lado nenhum — só nunca
 * corresponde a ninguém.
 */
function normalizePhone(phone: string): string | null {
  const digits = phone.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return /^\+\d{8,15}$/.test(digits) ? digits : null;
  const plain = digits.replace(/^00/, '');
  if (/^351\d{9}$/.test(plain)) return `+${plain}`;
  if (/^[923]\d{8}$/.test(plain)) return `+351${plain}`;
  return null;
}

async function sha256Hex(value: string): Promise<string | null> {
  try {
    // `crypto.subtle` só existe em contexto seguro (https ou localhost). Em
    // http simples não existe de todo, e aí não há enhanced conversions —
    // o que é indiferente, porque o site só corre em https.
    if (typeof crypto === 'undefined' || !crypto.subtle) return null;
    const bytes = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
  } catch {
    return null;
  }
}

export interface UserDataInput {
  email?: string;
  phone?: string;
}

/**
 * Envia os dados do cliente, com hash, antes da conversão.
 *
 * Devolve o que foi efetivamente enviado, para o chamador poder registar "foi
 * com email e telefone" sem nunca ver os valores. Silencioso e sem efeito
 * quando falta consentimento, a funcionalidade está desligada, ou o contacto
 * não passa na normalização.
 */
export async function setEnhancedConversionUserData(input: UserDataInput): Promise<{ email: boolean; phone: boolean }> {
  const sent = { email: false, phone: false };
  if (!ENHANCED_CONVERSIONS_ENABLED) return sent;
  if (getConsent() !== 'accepted') return sent;
  if (typeof window === 'undefined' || !window.gtag) return sent;

  const payload: Record<string, string> = {};
  const email = input.email ? normalizeEmail(input.email) : null;
  const phone = input.phone ? normalizePhone(input.phone) : null;

  if (email) {
    const hashed = await sha256Hex(email);
    if (hashed) { payload.sha256_email_address = hashed; sent.email = true; }
  }
  if (phone) {
    const hashed = await sha256Hex(phone);
    if (hashed) { payload.sha256_phone_number = hashed; sent.phone = true; }
  }

  if (!Object.keys(payload).length) return sent;
  window.gtag('set', 'user_data', payload);
  if (isDebugMode()) console.info('[Tracking] user_data definido (com hash)', { email: sent.email, phone: sent.phone });
  return sent;
}

/** Exportados só para os testes poderem verificar a normalização sem rede. */
export const __testing = { normalizeEmail, normalizePhone };
