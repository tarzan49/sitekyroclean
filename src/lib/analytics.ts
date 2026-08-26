/**
 * Analytics & Tracking Utilities
 * Comprehensive event tracking for quiz funnel, conversions, and Core Web Vitals
 */

import { PHONE_TEL } from "@/constants/business";
import { trackCallClickEvent } from "@/lib/quizTracking";

// ============================================
// CORE EVENT TRACKING
// ============================================

/**
 * Track a custom event to Google Analytics
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
  
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log('[Analytics]', eventName, params);
  }
}

/**
 * Track phone call button clicks - sends to GA4
 */
export function trackCallClick(location: string) {
  // Track in Google Analytics
  trackEvent('call_click', {
    event_category: 'engagement',
    event_label: location,
    phone_number: PHONE_TEL,
  });

  // Also track in Supabase quiz_events so it shows up in the admin panel
  // alongside WhatsApp clicks — GA4 alone isn't visible there.
  trackCallClickEvent(location);
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

