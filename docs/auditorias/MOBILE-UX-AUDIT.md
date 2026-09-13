# 📱 Mobile UX Audit Checklist - Clean Solutions

## Overview
This document provides a comprehensive checklist for validating mobile UX, Core Web Vitals, and Google Ads readiness.

---

## ✅ UI & Layout Audit

### Responsive Design
- [x] Layout adapts correctly to all breakpoints (320px, 375px, 414px, 768px, 1024px+)
- [x] No horizontal scrolling on any screen size
- [x] Content doesn't overflow or get cut off
- [x] Images scale proportionally
- [x] Text remains legible at all sizes (minimum 14px body text)

### Touch Targets
- [x] All buttons minimum 44x44px (accessibility standard)
- [x] Form inputs minimum 48px height
- [x] Adequate spacing between interactive elements (minimum 8px)
- [x] No overlapping touch areas

### Typography
- [x] Font sizes use responsive units (rem/em)
- [x] Line height optimized for mobile reading (1.4-1.6)
- [x] Form inputs use 16px+ to prevent iOS zoom

### Navigation
- [x] Sticky CTA visible on scroll
- [x] Easy thumb reach for primary actions
- [x] Back button always accessible in modals

---

## ✅ Quiz Functionality Audit

### Flow & Logic
- [x] Quiz opens without issues
- [x] Service selection works correctly
- [x] Size/type selection updates prices dynamically
- [x] Upsell messages display correctly for all options
- [x] Location selection shows prices
- [x] Free delivery message appears for orders >150€
- [x] Contact info validation works
- [x] Submit sends data correctly

### Mobile-Specific
- [x] Modal doesn't exceed viewport height
- [x] Scrollable content area inside modal
- [x] Continue/Back buttons always visible
- [x] Keyboard doesn't obscure form inputs
- [x] No layout shift during step transitions

### Edge Cases
- [x] "Other" service type works
- [x] Custom location input works
- [x] Error handling with WhatsApp fallback
- [x] Form resets on close

---

## ✅ Performance Audit (Core Web Vitals)

### LCP (Largest Contentful Paint) - Target: < 2.5s
- [x] Hero image preloaded with `fetchpriority="high"`
- [x] Critical CSS inlined in `<head>`
- [x] Fonts preconnected
- [x] Above-the-fold content loads first

### CLS (Cumulative Layout Shift) - Target: < 0.1
- [x] Images have explicit width/height or aspect-ratio
- [x] Fonts use `font-display: swap`
- [x] No content injected dynamically that causes shifts
- [x] Placeholder states for lazy-loaded content

### INP (Interaction to Next Paint) - Target: < 200ms
- [x] Event handlers are efficient
- [x] No heavy computations on main thread during interactions
- [x] Debounced scroll/resize handlers
- [x] Animations use CSS transforms (GPU-accelerated)

### TTFB (Time to First Byte) - Target: < 800ms
- [x] CDN configured (via hosting platform)
- [x] Static assets optimized

---

## ✅ Analytics & Tracking

### Quiz Funnel Events
- [x] `quiz_started` - When quiz opens
- [x] `quiz_step` - Each step completion with step number
- [x] `quiz_step_duration` - Time spent per step
- [x] `quiz_abandoned` - When closed without completing
- [x] `quiz_completed` - Successful submission with value

### Upsell Tracking
- [x] `upsell_viewed` - When upsell hint is visible
- [x] `upsell_accepted` - When user selects "both" option

### Engagement Tracking
- [x] `scroll_depth` - 25%, 50%, 75%, 100% thresholds
- [x] `cta_click` - Primary CTA interactions
- [x] `call_click` - Phone number clicks

### Core Web Vitals (Production)
- [x] `web_vitals` - LCP, CLS, INP, FCP, TTFB sent to GA

---

## ✅ Google Ads Readiness

### Landing Page Quality
- [x] Fast load time (< 3s on 4G)
- [x] Mobile-friendly design
- [x] Clear value proposition above the fold
- [x] Primary CTA visible immediately

### Tracking for Conversions
- [x] Google Ads tag installed (`AW-17779872363`)
- [x] Conversion events configured:
  - Quiz start
  - Quiz completion (with value)
  - Phone call clicks

### Ad Compatibility
- [x] No intrusive popups on page load (QuotePopup has 5s delay)
- [x] Content matches ad messaging
- [x] No misleading elements

---

## ✅ Security Checklist

### Input Validation
- [x] Client-side validation on all form fields
- [x] Phone number format validated
- [x] Email format validated
- [x] Text inputs sanitized

### Data Protection
- [x] No sensitive data logged to console
- [x] Form data sent over HTTPS
- [x] No PII in URL parameters

### XSS Protection
- [x] HTML content sanitized with `sanitizeHtml` utility
- [x] No `dangerouslySetInnerHTML` with user input
- [x] Proper encoding for external URLs (WhatsApp links)

---

## 📊 KPIs Dashboard

### Primary Metrics
| KPI | Target | Measurement |
|-----|--------|-------------|
| Quiz Start Rate | >10% of visitors | `quiz_started` / pageviews |
| Quiz Completion Rate | >60% | `quiz_completed` / `quiz_started` |
| Upsell Acceptance Rate | >30% | `upsell_accepted` / `upsell_viewed` |
| Mobile Conversion Rate | >5% | Conversions / Mobile sessions |

### Secondary Metrics
| KPI | Target | Measurement |
|-----|--------|-------------|
| Avg. Time per Step | <15s | `quiz_step_duration` |
| Drop-off by Step | <10% per step | Funnel analysis |
| Scroll Depth | >75% | `scroll_depth` events |
| Bounce Rate | <40% | GA Sessions |

---

## 🔧 Testing Commands

### Lighthouse Audit
```bash
# Run in Chrome DevTools > Lighthouse
# Select: Performance, Accessibility, Best Practices, SEO
# Device: Mobile
```

### PageSpeed Insights
```
https://pagespeed.web.dev/report?url=YOUR_URL
```

### Mobile-Friendly Test
```
https://search.google.com/test/mobile-friendly?url=YOUR_URL
```

---

## 📅 Regular Audit Schedule

- **Weekly**: Check Core Web Vitals in Search Console
- **Bi-weekly**: Review quiz funnel analytics
- **Monthly**: Full mobile UX testing on physical devices
- **Quarterly**: Security review

---

*Last updated: February 2026*
