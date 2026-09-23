/**
 * Camada central de medição do site.
 *
 * É o único sítio de onde partem eventos para o GA4 e para o Google Ads. Os
 * componentes importam daqui e nunca tocam em `window.gtag`: uma chamada solta
 * dentro de um componente React volta a disparar a cada re-render, e foi assim
 * que este tipo de instrumentação já produziu contagens infladas noutros sites.
 *
 * O que está por baixo:
 * - `src/lib/gtag.ts` — carregar a tag, consentimento, envio, deduplicação;
 * - `src/lib/leadTracking.ts` — o que é um lead a sério e o que não é;
 * - `src/lib/leadAttribution.ts` — de onde veio a pessoa, first e last touch.
 */
import { markFiredOnce, sendGtagEvent, type EventParams } from './gtag';
import { trackCallClickEvent, trackWhatsAppClick } from '@/lib/quizTracking';

export { trackLeadEvent, newLeadId, type LeadChannel } from './leadTracking';

// ============================================
// CORE EVENT TRACKING
// ============================================

/**
 * Envia um evento. Ponto de entrada genérico — para leads use `trackLeadEvent`,
 * que trata da conversão do Ads e da deduplicação.
 */
export function trackEvent(eventName: string, params?: EventParams) {
  sendGtagEvent(eventName, params);
}

// ============================================
// PAGE VIEW (SPA)
// ============================================

/**
 * Última página enviada. A `gtag.js` está configurada com
 * `send_page_view: false`, por isso *todos* os `page_view` saem daqui — e uma
 * SPA torna a repetição fácil: o React em modo estrito corre os efeitos duas
 * vezes em desenvolvimento, e uma mudança só de `search` ou de `hash`
 * revisita a mesma rota. Guardar o último caminho enviado resolve os dois.
 */
let lastPageViewKey: string | null = null;

/**
 * Envia um `page_view`.
 *
 * O `page_location` vai **sem query string** de propósito. É onde os
 * parâmetros de campanha estão, e alguns anúncios trazem no URL coisas que
 * não devem acabar num relatório partilhável. O que interessa da campanha já
 * foi lido e guardado pela atribuição; o relatório de páginas fica mais limpo
 * com um caminho por página em vez de uma linha por combinação de parâmetros.
 */
export function trackPageView(path?: string): boolean {
  if (typeof window === 'undefined') return false;
  const pagePath = path ?? window.location.pathname;
  if (pagePath === lastPageViewKey) return false;
  lastPageViewKey = pagePath;
  return sendGtagEvent('page_view', {
    page_path: pagePath,
    page_location: `${window.location.origin}${pagePath}`,
    page_title: document.title,
  });
}

/** Permite reenviar a página atual — usado quando a tag só carrega depois do consentimento. */
export function resetPageViewGuard(): void { lastPageViewKey = null; }

// ============================================
// MICROCONVERSÕES
// ============================================

export type ContactChannel = 'whatsapp' | 'phone';

export interface ContactClickContext {
  /** Onde estava o botão: `header`, `footer`, `hero`, `sticky-bar`, `page:/…`. */
  cta_location: string;
  service?: string;
  city?: string;
}

/**
 * Clique num CTA de contacto.
 *
 * **Não é um lead.** O WhatsApp abre e a conversa pode nunca acontecer; um
 * `tel:` marca o número e a chamada pode nunca ser atendida. Mede intenção, e é
 * assim que aparece no painel: numa coluna separada da dos leads.
 *
 * O envio para o Supabase continua a passar por `quizTracking`, que já tem a
 * caixa de saída persistente e o delegado de cliques em todo o site. Aqui trata-se
 * do lado da Google e do contexto extra (serviço, cidade) que o delegado global
 * não consegue adivinhar.
 */
export function trackContactClick(channel: ContactChannel, context: ContactClickContext, sourceEvent?: Event): void {
  // O envio para o GA4 acontece uma vez só, dentro de `quizTracking`, que é o
  // mesmo caminho por onde passam os cliques apanhados pelo delegado global.
  // Enviar também aqui contava cada clique com CTA identificado a dobrar.
  //
  // Hoje nenhum componente chama isto: todos os CTA de contacto do site são
  // `<a href>` e são medidos uma vez só pelo delegado global, que lê a origem
  // de `data-tracking-source`. Fica como escape para um CTA que não seja uma
  // âncora — e nesse caso **passa-se o evento original** (`e.nativeEvent`), que
  // é a chave de deduplicação contra o delegado.
  const ctx = { service: context.service, city: context.city };
  if (channel === 'whatsapp') trackWhatsAppClick(context.cta_location, ctx, sourceEvent);
  else trackCallClickEvent(context.cta_location, ctx, sourceEvent);
}

// ============================================
// FORMULÁRIO DE ORÇAMENTO
// ============================================

/**
 * A pessoa começou mesmo o formulário.
 *
 * "Começou mesmo" é abrir e avançar do primeiro passo, não abrir. Abrir o quiz
 * já é medido por `quiz_started`; se as duas coisas fossem o mesmo evento, a
 * taxa de conclusão passava a ser medida contra quem só espreitou.
 *
 * Uma vez por tentativa: a chave leva o identificador da tentativa do quiz.
 */
export function trackQuoteFormStart(attemptId: string, context?: { service?: string; city?: string }): void {
  if (!markFiredOnce(`form_start:${attemptId}`)) return;
  sendGtagEvent('quote_form_start', {
    attempt_id: attemptId,
    service: context?.service,
    city: context?.city,
    page_path: typeof window !== 'undefined' ? window.location.pathname : undefined,
  });
}

/** Um passo do formulário, uma vez por passo e por tentativa. */
export function trackQuoteFormStep(attemptId: string, stepNumber: number, stepName: string): void {
  if (!markFiredOnce(`form_step:${attemptId}:${stepNumber}`)) return;
  sendGtagEvent('quote_form_step', { attempt_id: attemptId, step_number: stepNumber, step_name: stepName });
}

// ============================================
// QUIZ FUNNEL TRACKING
// ============================================

export type QuizStep = 
  | 'start'
  | 'service_selected'
  | 'details_completed'
  | 'location_selected'
  | 'timing_selected'
  | 'contact_filled'
  | 'method_selected'
  | 'submitted';

/**
 * Track quiz step completion for funnel analysis
 */
export function trackQuizStep(
  step: QuizStep,
  stepNumber: number,
  data?: {
    service?: string;
    serviceType?: string;
    location?: string;
    timing?: string;
    contactMethod?: string;
    totalValue?: number;
  }
) {
  trackEvent('quiz_step', {
    event_category: 'quiz_funnel',
    step_name: step,
    step_number: stepNumber,
    ...data,
  });

  // Also track as Google Ads conversion event for specific steps
  if (step === 'start') {
    trackEvent('quiz_started', { event_category: 'conversion' });
  } else if (step === 'submitted') {
    trackEvent('quiz_completed', { 
      event_category: 'conversion',
      value: data?.totalValue || 0,
      currency: 'EUR',
    });
  }
}

/**
 * Track quiz abandonment (when user closes without completing)
 */
export function trackQuizAbandonment(
  lastStepReached: number,
  totalSteps: number,
  service?: string
) {
  trackEvent('quiz_abandoned', {
    event_category: 'quiz_funnel',
    last_step: lastStepReached,
    total_steps: totalSteps,
    completion_rate: Math.round((lastStepReached / totalSteps) * 100),
    service: service || 'not_selected',
  });
}

/**
 * Track time spent on each quiz step
 */
let stepStartTime: number = 0;

export function startStepTimer() {
  stepStartTime = Date.now();
}

export function trackStepDuration(stepNumber: number) {
  if (stepStartTime > 0) {
    const duration = Math.round((Date.now() - stepStartTime) / 1000);
    trackEvent('quiz_step_duration', {
      event_category: 'quiz_engagement',
      step_number: stepNumber,
      duration_seconds: duration,
    });
    stepStartTime = Date.now(); // Reset for next step
  }
}

// ============================================
// UPSELL TRACKING
// ============================================

/**
 * Track when upsell is viewed
 */
export function trackUpsellViewed(
  service: string,
  itemType: string,
  upsellValue: number
) {
  trackEvent('upsell_viewed', {
    event_category: 'upsell',
    service,
    item_type: itemType,
    upsell_value: upsellValue,
  });
}

/**
 * Track when upsell is accepted (user selects "both" option)
 */
export function trackUpsellAccepted(
  service: string,
  itemType: string,
  upsellValue: number
) {
  trackEvent('upsell_accepted', {
    event_category: 'upsell',
    service,
    item_type: itemType,
    upsell_value: upsellValue,
  });
}

// ============================================
// ENGAGEMENT TRACKING
// ============================================

/**
 * Track scroll depth for key pages
 */
export function initScrollTracking() {
  if (typeof window === 'undefined') return;
  
  const thresholds = [25, 50, 75, 100];
  const tracked = new Set<number>();
  
  const handleScroll = () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);
    
    thresholds.forEach(threshold => {
      if (scrollPercent >= threshold && !tracked.has(threshold)) {
        tracked.add(threshold);
        trackEvent('scroll_depth', {
          event_category: 'engagement',
          depth_percent: threshold,
          page_path: window.location.pathname,
        });
      }
    });
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => window.removeEventListener('scroll', handleScroll);
}

// ============================================
// CORE WEB VITALS TRACKING (Production)
// ============================================

interface WebVitalMetric {
  name: 'LCP' | 'FID' | 'CLS' | 'INP' | 'TTFB' | 'FCP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

/**
 * Send Core Web Vitals to Google Analytics
 */
function sendWebVitalToGA(metric: WebVitalMetric) {
  trackEvent('web_vitals', {
    event_category: 'Web Vitals',
    event_label: metric.name,
    metric_name: metric.name,
    metric_value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    metric_rating: metric.rating,
    non_interaction: true,
  });
}

/**
 * Get rating for each metric based on Google's thresholds
 */
function getMetricRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<string, [number, number]> = {
    LCP: [2500, 4000],      // Good < 2.5s, Poor > 4s
    FID: [100, 300],         // Good < 100ms, Poor > 300ms
    CLS: [0.1, 0.25],        // Good < 0.1, Poor > 0.25
    INP: [200, 500],         // Good < 200ms, Poor > 500ms
    TTFB: [800, 1800],       // Good < 800ms, Poor > 1.8s
    FCP: [1800, 3000],       // Good < 1.8s, Poor > 3s
  };

  const [good, poor] = thresholds[name] || [0, 0];
  if (value <= good) return 'good';
  if (value > poor) return 'poor';
  return 'needs-improvement';
}

/**
 * Initialize Core Web Vitals monitoring (production only)
 */
export function initWebVitalsTracking() {
  if (typeof window === 'undefined') return;

  // LCP - Largest Contentful Paint
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry;
      const value = lastEntry.startTime;
      
      sendWebVitalToGA({
        name: 'LCP',
        value,
        rating: getMetricRating('LCP', value),
      });
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) {
    // Observer not supported
  }

  // FCP - First Contentful Paint
  try {
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          sendWebVitalToGA({
            name: 'FCP',
            value: entry.startTime,
            rating: getMetricRating('FCP', entry.startTime),
          });
        }
      });
    });
    fcpObserver.observe({ type: 'paint', buffered: true });
  } catch (e) {
    // Observer not supported
  }

  // CLS - Cumulative Layout Shift
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const layoutEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
        if (!layoutEntry.hadRecentInput) {
          clsValue += layoutEntry.value ?? 0;
        }
      });
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
    
    // Report CLS on page unload
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        sendWebVitalToGA({
          name: 'CLS',
          value: clsValue,
          rating: getMetricRating('CLS', clsValue),
        });
      }
    });
  } catch (e) {
    // Observer not supported
  }

  // INP - Interaction to Next Paint (replaces FID)
  try {
    let worstINP = 0;
    const inpObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const duration = (entry as PerformanceEntry & { duration?: number }).duration ?? 0;
        if (duration > worstINP) {
          worstINP = duration;
        }
      });
    });
    // Use type assertion to handle durationThreshold which is valid but not in all TS definitions
    inpObserver.observe({ type: 'event', buffered: true, durationThreshold: 16 } as PerformanceObserverInit);
    
    // Report INP on page unload
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && worstINP > 0) {
        sendWebVitalToGA({
          name: 'INP',
          value: worstINP,
          rating: getMetricRating('INP', worstINP),
        });
      }
    });
  } catch (e) {
    // Observer not supported
  }

  // TTFB - Time to First Byte
  try {
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navEntry) {
      const ttfb = navEntry.responseStart - navEntry.requestStart;
      sendWebVitalToGA({
        name: 'TTFB',
        value: ttfb,
        rating: getMetricRating('TTFB', ttfb),
      });
    }
  } catch (e) {
    // Not supported
  }
}

// ============================================
// DEVICE & SESSION TRACKING
// ============================================

/**
 * Get device type for analytics segmentation
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

