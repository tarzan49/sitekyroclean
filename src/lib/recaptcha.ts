declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

function loadRecaptchaScript(siteKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') return resolve();

    // If already loaded
    if (window.grecaptcha) return resolve();

    const existing = document.querySelector<HTMLScriptElement>('script[data-recaptcha="true"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('reCAPTCHA failed to load')));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    script.async = true;
    script.defer = true;
    script.dataset.recaptcha = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('reCAPTCHA failed to load'));
    document.head.appendChild(script);
  });
}

/**
 * Gets a reCAPTCHA v3 token for the given action.
 * Returns null if no site key is configured or if running outside the browser.
 */
export async function getRecaptchaToken(action: string): Promise<string | null> {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;
  if (!siteKey) return null;
  if (typeof window === 'undefined') return null;

  await loadRecaptchaScript(siteKey);
  const recaptcha = window.grecaptcha;
  if (!recaptcha) return null;

  await new Promise<void>((resolve) => recaptcha.ready(resolve));
  return recaptcha.execute(siteKey, { action });
}

/**
 * Versão que nunca parte a submissão de um pedido.
 *
 * A primeira tentativa de pôr reCAPTCHA neste site partiu o formulário: se o
 * script não carrega, se um bloqueador o trava ou se a promessa nunca resolve,
 * um `await` direto a `getRecaptchaToken` fica pendurado e o cliente carrega em
 * enviar e não acontece nada. Aqui qualquer falha, e qualquer demora acima do
 * tempo limite, devolve `null` em vez de propagar. Sem token, o servidor deixa
 * passar de propósito: perder um cliente real custa muito mais do que deixar
 * entrar um pedido de spam.
 */
export async function getRecaptchaTokenSafe(action: string, timeoutMs = 3000): Promise<string | null> {
  try {
    return await Promise.race([
      getRecaptchaToken(action),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
    ]);
  } catch {
    return null;
  }
}

export {};
