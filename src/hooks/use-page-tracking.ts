import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { captureLeadAttribution } from '@/lib/leadAttribution';
import { resetPageViewGuard, trackPageView } from '@/lib/analytics';
import { isPublicTrackingPage, trackPageViewEvent } from '@/lib/quizTracking';
import { resetMetaPageViewGuard, trackMetaPageView } from '@/lib/metaPixel';

/**
 * Uma página vista, por mudança de rota.
 *
 * Porque é preciso: este site é uma SPA. A `gtag.js` envia um `page_view` no
 * arranque e mais nenhum — mudar de rota não recarrega a página. Sem isto, o
 * GA4 via a página de entrada de cada visita e mais nada, o que torna
 * impossível responder a "esta landing page converte a quanto?" para qualquer
 * página que não seja de entrada. A `config` do GA4 tem por isso
 * `send_page_view: false`, e todos os `page_view` passam a sair daqui.
 *
 * Três armadilhas que isto trata:
 *
 * 1. **Repetição.** O `<StrictMode>` do React corre os efeitos duas vezes em
 *    desenvolvimento, e uma navegação que muda só a query string revisita a
 *    mesma rota. O `trackPageView` guarda o último caminho enviado e ignora o
 *    repetido.
 * 2. **Consentimento a meio da visita.** Quem aceita as cookies na terceira
 *    página só tem a tag carregada a partir daí. Nesse momento o guarda é
 *    reposto e a página atual é enviada, senão a primeira `page_view` daquela
 *    pessoa seria a página *seguinte* e o relatório ficava com uma sessão sem
 *    página de entrada.
 * 3. **O painel de administração.** `/admin/*` nunca é medido, em lado nenhum.
 */
export function usePageTracking(): void {
  const location = useLocation();

  useEffect(() => {
    // A atribuição é lida antes do `page_view` de propósito: é aqui que os
    // parâmetros de campanha do URL são guardados, e o evento seguinte já
    // precisa deles.
    captureLeadAttribution();
    if (!isPublicTrackingPage()) return;
    trackPageView(location.pathname);
    trackPageViewEvent(location.pathname);
    trackMetaPageView(location.pathname);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onConsentChanged = () => {
      captureLeadAttribution();
      if (!isPublicTrackingPage()) return;
      resetPageViewGuard();
      trackPageView(window.location.pathname);
      trackPageViewEvent(window.location.pathname);
      resetMetaPageViewGuard();
      trackMetaPageView(window.location.pathname);
    };
    window.addEventListener('kyro:consent-changed', onConsentChanged);
    return () => window.removeEventListener('kyro:consent-changed', onConsentChanged);
  }, []);
}
