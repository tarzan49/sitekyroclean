# Codebase Audit — spotless-pro-flow
**Date:** 2026-05-11  
**Stack:** React 18 · TypeScript · Vite · Tailwind CSS · React Router · TanStack Query  
**Scope:** `src/` (full)  
**Severity:** 🔴 CRITICAL · 🟡 WARNING · 🔵 INFO

---

## Table of Contents
1. [Dead Code](#1-dead-code)
2. [Dead References (Unused Imports)](#2-dead-references-unused-imports)
3. [DRY Violations](#3-dry-violations)
4. [SOLID Violations](#4-solid-violations)
5. [Data / Config Issues](#5-dataconfig-issues)
6. [TypeScript Quality](#6-typescript-quality)
7. [Unused Files](#7-unused-files)
8. [Priority Fix List](#priority-fix-list)

---

## 1. Dead Code

### 🟡 `src/components/quiz/index.ts`
- **What:** `chairPrices` is exported but never imported anywhere in the project.
- **Fix:** Remove the export from `index.ts`.

### 🔵 `src/lib/errorTracking.ts`
- **What:** Module exports tracking functions but integration appears incomplete — no evidence of it being wired into app lifecycle or error boundaries.
- **Fix:** Either integrate into `ErrorBoundary.tsx` or delete the file entirely.

### 🔵 `src/lib/quizTracking.ts`
- **What:** Same pattern as `errorTracking.ts` — exports unused in render tree.
- **Fix:** Audit whether any tracking events are actually being fired; remove if not.

---

## 2. Dead References (Unused Imports)

### 🟡 `src/components/Hero.tsx:4`
- **What:** `MessageCircle` imported from `lucide-react` but never rendered.
- **Fix:** Remove from import line.

### 🟡 `src/components/Contact.tsx:1`
- **What:** `Sparkles` and `MessageSquare` imported but not used in JSX.
- **Fix:** Remove both from import.

### 🟡 `src/components/QuizForm.tsx:7`
- **What:** `AlertTriangle`, `Camera`, `Shield` imported from `lucide-react` but not rendered anywhere in the 2298-line component.
- **Fix:** Remove from import. Confirm with `npx tsc --noEmit`.

### 🔵 `src/pages/FreguesiaServicePage.tsx:4`
- **What:** `ArrowRight` imported — verify it's used in all render branches.
- **Fix:** Grep for `ArrowRight` usage within the file; remove if zero uses.

### 🔵 `src/pages/MaterialPage.tsx:4`
- **What:** `Sparkles`, `Wind` imported — confirm usage across all conditional render paths.
- **Fix:** Remove unused icons.

---

## 3. DRY Violations

### 🔴 Hardcoded Phone Number — 63+ occurrences
- **Where:** `Contact.tsx:95`, `QuizForm.tsx` (multiple), `LocalBusinessSchema.tsx:17`, `ServiceSchema.tsx`, `AdminPanel.tsx`, `BeforeAfterPage.tsx`, `FAQEstofos.tsx`, `LocationServicePage.tsx`, `MaterialPage.tsx`, `ProblemPage.tsx`, `PricePage.tsx`, and others.
- **Fix:** Create `src/constants/contact.ts`:
  ```typescript
  export const CONTACT = {
    phone: '925530647',
    phoneE164: '+351925530647',
    whatsappBase: 'https://wa.me/351925530647',
    email: 'cleansolutions.pt25@gmail.com',
    wa: (msg: string) => `https://wa.me/351925530647?text=${encodeURIComponent(msg)}`,
  } as const;
  ```

### 🔴 Hardcoded Email — 13+ occurrences
- **Where:** `Contact.tsx`, `QuizForm.tsx`, `LocalBusinessSchema.tsx`, `ServiceSchema.tsx`, `AdminPanel.tsx`, multiple pages.
- **Fix:** Use `CONTACT.email` from the constant above.

### 🔴 Duplicated Hero/Result Image Maps
- **Where:**
  - `src/pages/LocationServicePage.tsx:32–48` — `heroImages`, `resultImages`
  - `src/pages/FreguesiaServicePage.tsx:37–53` — `SERVICE_HERO_IMAGES`, `SERVICE_RESULT_IMAGES`
- **Fix:** Create `src/constants/serviceImages.ts` with a single canonical map; import in both pages.

### 🔴 Duplicated Process Steps
- **Where:**
  - `src/pages/LocationServicePage.tsx:59–73` — `processSteps`, `impermeabilizacaoSteps`
  - `src/pages/FreguesiaServicePage.tsx:64–78` — identical arrays
- **Fix:** Create `src/constants/serviceProcesses.ts`; import in both pages.

### 🟡 Duplicated SERVICE_PACK_SLUGS
- **Where:** `src/pages/LocationServicePage.tsx` and `src/pages/FreguesiaServicePage.tsx` — identical `Record<string, string[]>` map.
- **Fix:** Extract to `src/constants/packSlugs.ts`.

### 🟡 Checkerboard Inline Styles Still Present
- **Where:** `src/pages/LocationServicePage.tsx` (Como funciona + FAQ sections), `src/pages/FreguesiaServicePage.tsx`, `src/pages/SofaVariantPage.tsx` — still use full inline `backgroundImage/backgroundSize/backgroundPosition` style objects instead of the `bg-checker-dark` CSS class.
- **Fix:** Replace inline checker style objects with `className="bg-checker-dark"` (class already defined in `index.css`).

### 🟡 Repeated WhatsApp/Contact Button Pattern
- **Where:** ~15 files construct near-identical anchor tags for WhatsApp and phone CTAs.
- **Fix:** Create `src/components/ContactButtons.tsx` — `<WhatsAppButton>` and `<CallButton>` with consistent styling; use across pages.

---

## 4. SOLID Violations

### 🔴 `src/components/QuizForm.tsx` — 2 298 lines (SRP violation)
- **What:** Single component handles: quiz state, step navigation, pricing calculations, timer/discount logic, upsell config, exit-intent popup, WhatsApp fallback, form submission to multiple backends.
- **Fix (incremental):**
  1. Extract `useQuizState()` hook — step, formData, navigation
  2. Extract `usePricing()` hook — calcSofaPrice, calcCarpetPrice, timerDiscount
  3. Extract `useUpsell()` hook — upsell selections and totals
  4. Move each step's JSX to `src/components/quiz/steps/QuizStep[N].tsx`
  - Target: QuizForm drops to ~400 lines orchestrating the above.

### 🔴 Duplicated Page Template (SRP + DRY overlap)
- **What:** `LocationServicePage.tsx` (470 lines), `FreguesiaServicePage.tsx` (480 lines), `SofaVariantPage.tsx` (442 lines) share ~70% structure: hero, problems grid, process steps, result image, FAQ, pack banner.
- **Fix:** Create `src/components/ServicePageLayout.tsx` that accepts a config object. Each page becomes ~60 lines of data + `<ServicePageLayout config={...} />`.

### 🟡 `src/pages/AdminPanel.tsx` — 895 lines (SRP violation)
- **What:** Handles auth, tab routing, sitemap display, dashboard, import/export, SEO page management.
- **Fix:** Split into `src/pages/admin/` sub-routes with React Router outlet: `AdminLayout`, `AdminDashboard`, `AdminImport`, `AdminSEO`.

### 🟡 Header State — prop drilling
- **Where:** `src/components/Header.tsx` — `mobileMenuOpen`, `mobileServicesOpen`, `isQuizOpen` managed as local state with manual scroll effects.
- **Fix:** Extract `useHeaderState()` hook.

---

## 5. Data / Config Issues

### 🔴 Magic Numbers in Pricing — `src/components/QuizForm.tsx`
- **Line ~70–74:** Carpet tier rates `10`, `8`, `7` (€/m²) hardcoded.
- **Line ~88–92:** Chair tier rates `17.5`, `15`, `12.5` hardcoded.
- **Line ~207:** Chair waterproofing surcharge `7.5` hardcoded.
- **Line ~250:** Timer discount `0.95` (5% off) hardcoded.
- **Line ~254:** Pack discount `0.10` hardcoded.
- **Fix:** Create `src/constants/pricing.ts`:
  ```typescript
  export const PRICING = {
    carpet: [
      { maxM2: 5,  rate: 10 },
      { maxM2: 10, rate: 8  },
      { maxM2: 15, rate: 7  },
    ],
    chairs: [
      { maxQty: 3,  rate: 17.5 },
      { maxQty: 6,  rate: 15   },
      { maxQty: 10, rate: 12.5 },
    ],
    waterproofingSurchargePerChair: 7.5,
    timerDiscountFactor: 0.95,
    packDiscountFactor: 0.10,
    timerDurationSec: 10 * 60,
  } as const;
  ```

### 🔴 Hardcoded Admin Password — `src/pages/AdminPanel.tsx:28`
- **What:** `"kyro@admin2025"` in source code — visible in git history and bundle.
- **Fix:**
  ```typescript
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;
  ```
  Add to `.env.local` (gitignored). Add `VITE_ADMIN_PASSWORD=` to `.env.example`.

### 🟡 Quiz Timer Duration Duplicated
- **Where:** `src/components/QuizForm.tsx:119` and `:155` — `10 * 60` appears twice.
- **Fix:** Use `PRICING.timerDurationSec` from constants above.

### 🔵 Hardcoded Route Slugs as Strings
- **Where:** `SERVICE_PACK_SLUGS` keys in `LocationServicePage` and `FreguesiaServicePage` use plain strings (`'limpeza-sofas'`, etc.) with no type safety.
- **Fix:** Derive keys from `serviceSlug` union type already present in `locationSeoData.ts`.

---

## 6. TypeScript Quality

### 🔴 `as any` — Supabase Client
- **Where:**
  - `src/lib/errorTracking.ts:13` — `(supabase as any)`
  - `src/lib/quizTracking.ts` — `(supabase as any)` (same pattern)
  - `src/pages/AdminPanel.tsx:182, 249, 271` — multiple `(supabase as any)` calls
- **Fix:** Use `createClient<Database>()` with generated Supabase types, or create typed wrapper functions that narrow the client.

### 🔴 `as any` in QuizForm
- **Where:** `src/components/QuizForm.tsx:~600` — fetch/submission response cast with `as any`.
- **Fix:** Define a `FormSubmissionResponse` interface and type the response properly.

### 🟡 Unsafe `catch (e: any)`
- **Where:** `src/pages/AdminPanel.tsx:273`.
- **Fix:**
  ```typescript
  catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
  }
  ```

### 🟡 `!` Non-null Assertion
- **Where:** `src/lib/recaptcha.ts:8` — `window.grecaptcha!.ready(resolve)`.
- **Fix:**
  ```typescript
  if (typeof window !== 'undefined' && window.grecaptcha) {
    await new Promise<void>(resolve => window.grecaptcha.ready(resolve));
  }
  ```

### 🔵 Missing Return Types on Exported Utilities
- **Where:** `src/lib/analytics.ts`, `src/lib/validation.ts` — exported functions use implicit return types.
- **Fix:** Add explicit `: void`, `: boolean`, `: string` annotations on exported functions.

---

## 7. Unused Files

All pages are lazy-loaded via `App.tsx` — no fully orphaned page files detected.

### 🔵 Verify quiz step components
`QuizStep2Sofa.tsx`, `QuizStep2Carpet.tsx`, `QuizStep2Chairs.tsx` are exported from `src/components/quiz/index.ts` — confirm each is actually consumed inside `QuizForm.tsx` and not just re-exported dead weight.

---

## Priority Fix List

### Quick wins (< 1 hour each, high ROI)

| # | File(s) | Action |
|---|---------|--------|
| 1 | `src/constants/contact.ts` *(new)* | Extract phone + email + WhatsApp — fixes 63+ hardcoded strings |
| 2 | `src/constants/pricing.ts` *(new)* | Extract magic numbers from `QuizForm.tsx` |
| 3 | `src/pages/AdminPanel.tsx:28` | Move password to `VITE_ADMIN_PASSWORD` env var |
| 4 | `src/constants/serviceImages.ts` *(new)* | Merge duplicate hero/result image maps |
| 5 | `src/constants/serviceProcesses.ts` *(new)* | Merge duplicate process step arrays |
| 6 | `Hero.tsx`, `Contact.tsx`, `QuizForm.tsx` | Remove unused lucide imports |
| 7 | `src/components/quiz/index.ts` | Remove dead `chairPrices` export |
| 8 | Como funciona + FAQ sections (3 pages) | Replace inline checker style objects with `bg-checker-dark` class |

### Medium-term (2–4 hours)

| # | File(s) | Action |
|---|---------|--------|
| 9  | `QuizForm.tsx` | Extract `useQuizState`, `usePricing`, `useUpsell` hooks |
| 10 | `QuizForm.tsx` | Move each step to `src/components/quiz/steps/` |
| 11 | `AdminPanel.tsx` | Split into `src/pages/admin/` sub-routes |
| 12 | Supabase files | Add proper types, remove all `as any` |

### Long-term (4–8 hours)

| # | File(s) | Action |
|---|---------|--------|
| 13 | Location / Freguesia / SofaVariant pages | Extract `<ServicePageLayout>` generic template (~500 LOC saved) |
| 14 | `errorTracking.ts`, `quizTracking.ts` | Integrate properly or delete |

---

*Generated 2026-05-11 — verify line numbers against current file state before applying fixes.*
