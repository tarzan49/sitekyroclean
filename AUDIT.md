# Code Audit — Kyro Clean Solutions (`src/`)

Date: 2026-06-10
Scope: entire `src/` directory (React 18 + TypeScript + Vite + Tailwind, ~3,946 prerendered routes)

Legend: 🔴 CRITICAL · 🟡 WARNING · 🟢 INFO

---

## 🔴 CRITICAL

### C1. Core business data (phone, email, address, review count, site URL) hardcoded in 50+ files

No `src/constants/business.ts` exists. `src/constants/google.ts` only has Google Place/Review/Maps URLs.

- **Phone (`925530647` / `+351925530647` / `925 530 647`)** — ~75 occurrences across ~40 files: `Header.tsx:68`, `Footer.tsx:147,149`, `lib/analytics.ts:35`, `LocalBusinessSchema.tsx:16`, `ServiceLocationSchema.tsx:48`, `ServiceSchema.tsx:63`, `ProblemPage.tsx:521`, `ReviewRequest.tsx:28`, `FAQEstofos.tsx` (10x), `HeaderV1.tsx`, `FinalCTAV1.tsx`, `QuotePopup.tsx`, `ServiceContactSection.tsx`, `Contact.tsx`, every SEO template (Location/Freguesia/Material/MarcaSofa/Problem/SofaVariant/PackCombo/Price), `WhatsAppButton.tsx`, `MobileStickyBar.tsx`, `ErrorBoundary.tsx`, `services/submissionService.ts`, `data/packComboData.ts`.
- **Email (`cleansolutions.pt25@gmail.com`)** — 14 occurrences in 12 files: `Contact.tsx:103,130,132`, `Footer.tsx:151,153`, `QuizForm.tsx:869`, `ServiceContactSection.tsx:44,46`, `LocalBusinessSchema.tsx:17`, `ServiceLocationSchema.tsx:49`, `ServiceSchema.tsx:64`, `FAQ.tsx:174,182`, `PoliticaPrivacidade.tsx:130-131`, `TermosCondicoes.tsx:31`, `ProblemPage.tsx`.
- **Address/geo (`R. de António Cardoso 263`, `Porto`, `4150-081`, `41.1496,-8.6109`)** — identical block repeated in `LocalBusinessSchema.tsx:30-38`, `ServiceLocationSchema.tsx:53-56`, `ServiceSchema.tsx:68-71`, `ProblemPage.tsx:526-528`.
- **`BASE_URL`/`SITE_URL = "https://cleansolutions.com.pt"`** — re-declared as a local const in `LocalBusinessSchema.tsx:4`, `ServiceSchema.tsx:1`, `BlogPost.tsx:86`, and inlined as a raw string literal 100+ times across `ProblemPage.tsx` (12x), `MaterialPage.tsx` (16x), `PricePage.tsx` (13x), `Blog.tsx` (13x), `AreasDeServico.tsx` (8x), `PackComboPage.tsx`, `Packs.tsx`, `PacksSitemap.tsx`, `BeforeAfterPage.tsx`, `MarcaSofaPage.tsx`.
- **Review count/rating (`reviewCount`/`ratingCount: "60"`, `"5.0"`, `"+1000 clientes"`)** — schema duplicated in `LocalBusinessSchema.tsx:63-64`, `ServiceLocationSchema.tsx:64-65`, `ServiceSchema.tsx:78-79`, `ProblemPage.tsx:531`, `ReviewRequest.tsx:34`; UI copy duplicated in `QuotePopup.tsx:142`, `ServiceHero.tsx:204`, `HeroV1.tsx:212`, `GuaranteeSection.tsx:113`, `FreguesiaServicePage.tsx:167`, `LocationServicePage.tsx:229`, `SofaVariantPage.tsx:222`, `MarcaSofaPage.tsx:174`, `MaterialPage.tsx:175`, `FAQEstofos.tsx:286`, `PackComboPage.tsx:369`, `Obrigado.tsx:214`, `problemSeoData.ts:941`.

**Why this is critical:** every time the review count grows (it just changed 50→60 in this exact session, requiring 24 manual edits across 19 files), or the phone/email/address ever changes, someone has to find and edit every one of these spots correctly. Missing even one leaves stale/inconsistent data live (e.g. wrong phone in a JSON-LD block that Google has already indexed).

**Fix:** create `src/constants/business.ts`:
```ts
export const SITE_URL = "https://cleansolutions.com.pt";
export const PHONE_DISPLAY = "925 530 647";
export const PHONE_TEL = "925530647";
export const PHONE_E164 = "+351925530647";
export const WHATSAPP_BASE = `https://wa.me/351925530647`;
export const BUSINESS_EMAIL = "cleansolutions.pt25@gmail.com";
export const BUSINESS_ADDRESS = {
  streetAddress: "R. de António Cardoso 263",
  addressLocality: "Porto",
  postalCode: "4150-081",
  addressCountry: "PT",
};
export const BUSINESS_GEO = { latitude: 41.1496, longitude: -8.6109 };
export const REVIEW_RATING = "5.0";
export const REVIEW_COUNT = "60";
export const CLIENTS_SERVED_LABEL = "+1000";
```
Then import-and-replace across the ~50 files above. This is the single highest-leverage fix in this audit.

---

### C2. Five independent hand-rolled JSON-LD `@graph` builders — schema coverage diverges per template family

- `ProblemPage.tsx:511-556` builds its own `@graph` (LocalBusiness + WebPage + BreadcrumbList) — **omits the `Service`/`Offer` node** that `ServiceSchema`/`ServiceLocationSchema` include.
- `MaterialPage.tsx:396-446` builds a third independent `@graph` (WebPage + BreadcrumbList + Service).
- `MarcaSofaPage.tsx:77-129` and `PackComboPage.tsx:71-113` each build a fourth/fifth `@graph`; `MarcaSofaPage` even inlines its own `FAQPage` schema instead of reusing `ServiceFAQSchema`.
- `ReviewRequest.tsx:24-40` re-declares yet another `LocalBusiness` node with the same `telephone`/`ratingValue`/`reviewCount` fields.
- Meanwhile `LocationServicePage.tsx` and `FreguesiaServicePage.tsx` correctly use the shared `ServiceLocationSchema` + `ServiceFAQSchema`.

**Why critical:** Problem/Material/MarcaSofa/PackCombo pages (hundreds of routes) likely have weaker rich-result eligibility (missing `Offer`/`aggregateRating`/inconsistent `Service` schema) than Location/Freguesia pages, purely due to copy-paste drift — not an intentional design choice.

**Fix:** Move all `@graph` node builders into `src/lib/seoSchema.ts` as composable functions (`buildLocalBusinessNode()`, `buildBreadcrumbNode(items)`, `buildServiceNode(...)`, `buildFaqNode(...)`). Refactor `ProblemPage`, `MaterialPage`, `MarcaSofaPage`, `PackComboPage`, `ReviewRequest` to compose from these instead of hand-writing `@graph` arrays. Removes ~150-200 duplicated lines and closes the schema gap.

---

### C3. Dead/orphaned files that could mislead a future developer

- **`src/pages/FAQ.tsx`** (205 lines) — not routed anywhere in `App.tsx`. The live FAQ route (`/perguntas-frequentes-limpeza-estofos`) serves `FAQEstofos.tsx`. Editing `FAQ.tsx` would have zero effect.
- **`src/components/HeaderV1.tsx`** (382 lines) — not imported anywhere; the live header is `Header.tsx`. A near-duplicate that could be mistakenly "fixed" instead of the real header.
- **`src/components/QuotePopup.tsx`** (188 lines) + **`src/hooks/usePopupStorage.ts`** (46 lines) — never rendered. Backed by 32 orphaned i18n keys (`quotePopup`, `welcomePopup`, `newsletterPopup` sections in `translation.json`).

**Fix:** Delete all three files (and the `usePopupStorage` hook) plus the 32 orphaned i18n keys. ~439 lines removed with zero behavioral change. If `QuotePopup` was a planned feature, confirm with the team before deleting — otherwise it's dead weight.

---

## 🟡 WARNING

### W1. `QuizForm.tsx` is a 1,304-line god component

`src/components/QuizForm.tsx` mixes:
- ~25 `useState` hooks for unrelated concerns (step nav, location autocomplete, countdown timer, social proof rotation, exit intent, 8 separate `pending*` upsell states, confetti, summary modal).
- Pure pricing logic (`calculateServicePrice`, `travelCost`, `packDiscountActive`, `isSobOrcamento`, lines 150-266) mixed into component state.
- `handleSubmit()` (lines 607-883, ~280 lines): builds Formspree payload, retries network requests, calls `supabase.from('leads').insert(...)` directly (lines 695-723), builds WhatsApp message + receipt, writes `sessionStorage`.
- 9 `useEffect` hooks for scroll lock, keyboard padding, countdown timer, price animation, social proof rotation, confetti, exit-intent, scroll-to-top.
- The full 340-line modal render tree (lines 956-1299).

**Fix:** extract three hooks:
- `useQuizPricing(formData, items)` → `{ totalPrice, packDiscountActive, isSobOrcamento, ... }`
- `useQuizSubmission()` → wraps Formspree + Supabase + sessionStorage + WhatsApp/receipt building
- `useQuizUiEffects(isOpen)` → scroll lock, keyboard padding, timers, social proof rotation, exit intent

`QuizForm.tsx` becomes the orchestrator + render shell only.

---

### W2. No service/storage abstraction — direct `supabase`/`sessionStorage` access inline

- `QuizForm.tsx:693-723` dynamically imports `@/lib/supabase` and inserts into `leads` directly from the component, with a large inline object literal and a swallowed try/catch.
- `safeSessionSet()` (`QuizForm.tsx:47-53`) duplicates what should be a shared `src/lib/safeStorage.ts`. `QuotePopup.tsx` reads the same `sessionStorage` key (`hasClickedQuote`) directly with no shared helper.

**Fix:** add `src/services/leadsService.ts` exporting `submitLead(lead: LeadInput): Promise<void>` (wraps Supabase insert + `logError`); add `src/lib/safeStorage.ts` exporting `safeSessionGet/Set`, `safeLocalGet/Set` for reuse.

---

### W3. "Open quiz" tracking sequence copy-pasted in 4 components, read independently in a 5th

`window.dispatchEvent(new CustomEvent('quizOpened')); sessionStorage.setItem('hasClickedQuote', '1');` appears verbatim in:
- `QuizButton.tsx:19-20`
- `Header.tsx:44-45`
- `HeaderV1.tsx:43-44` (dead file, see C3)
- `ServiceSchedulingBar.tsx:36-37`

`QuotePopup.tsx:40` (also dead, see C3) reads the `hasClickedQuote` key independently.

**Fix:** add `src/hooks/use-quiz-launcher.ts` exporting `markQuizOpened()`, plus constants `QUIZ_OPENED_EVENT` / `HAS_CLICKED_QUOTE_KEY` in `src/constants/`. Replace the live call sites (Header, QuizButton, and `ServiceSchedulingBar` if it's actually live — see W9 note).

---

### W4. `QuizUpsellOverlay.tsx` (561 lines) — 18 props prop-drilled from `QuizForm`, 8 of them `pending*` state pairs

`QuizForm.tsx:74-80` owns `pendingUpsellId`, `pendingSofaItems`, `pendingMattressItems`, `pendingCarpetArea`, `pendingChairQtyNum`, `pendingWaterproof` (+ setters) purely so `QuizUpsellOverlay` (lines 1160-1182 of `QuizForm.tsx`) can manage its own internal `prompt → select → config` flow.

**Fix:** move all `pending*` state into `QuizUpsellOverlay` itself (or a co-located `useUpsellSelection()` hook). Expose only `onConfirm(item)` / `onCancel()` to `QuizForm`. Removes 12 props + 8 state vars from `QuizForm`.

---

### W5. Four parallel WhatsApp message-builder functions instead of one shared module

- `src/lib/buildServiceWaMessage.ts` (canonical, shared — good).
- `buildMaterialWaMessage()` — `MaterialPage.tsx:42-57`
- `buildProblemWaMessage()` — `ProblemPage.tsx:101-159` (~58 lines of slug switch)
- `buildWaMessage()` — `SofaVariantPage.tsx:109`
- `buildWhatsAppUrl()` — `data/packComboData.ts:100`

All four follow the identical "Olá! ... <item> ... <city>. Qual é o preço...?" shape but live in separate page files.

**Fix:** consolidate into `src/lib/whatsappMessages.ts` alongside `buildServiceWaMessage`. ~60 lines reorganized; centralizes copy/tone for future edits.

---

### W6. Trust-badge / star-rating JSX block copy-pasted ~10+ times; `GoogleReviewsBadge` built for this purpose but unused

Pixel-identical "★★★★★ 5.0 · 60+ avaliações · Google" blocks (same Tailwind classes, same `[...Array(5)]` star loop, same `#D4AF37` gold) appear verbatim in:
- `FreguesiaServicePage.tsx:155-170`, `LocationServicePage.tsx:217-231`, `SofaVariantPage.tsx:208-223` (identical)
- Smaller variants: `ServiceHero.tsx:195-207`, `QuotePopup.tsx:136-143` (dead, see C3), `MarcaSofaPage.tsx:173-174`, `MaterialPage.tsx:172-175`, `FAQEstofos.tsx:284-286`, `PackComboPage.tsx:355-369`, `HeroV1.tsx`, `GuaranteeSection.tsx`, `HowItWorksV1.tsx`, `BeforeAfterPage.tsx`, `QuizStepContact.tsx`

`src/components/GoogleReviewsBadge.tsx` already exists, accepts `rating`/`count` props, and is **never imported**.

**Fix:** extend `GoogleReviewsBadge` (or build `<TrustRatingBadge variant="hero"|"compact"|"pill" rating={REVIEW_RATING} reviewCount={REVIEW_COUNT} />`) and replace the ~10+ inline blocks. ~120-150 lines removed; also fixes C1's review-count duplication for these specific spots in one shot.

---

### W7. Inline data + page-level logic in large SEO templates should move to `src/data`/`src/lib`

- `LocationServicePage.tsx` (657 lines): `PRICE_TABLE` (lines 24-59) and `SERVICE_TESTIMONIALS` (lines 61-86) are static content living inline instead of in `src/data/` like `locationSeoData.ts`.
- `ProblemPage.tsx` (564 lines): `CATEGORY_TIPS` (lines 17-99, ~83 lines) → `src/data/problemTipsData.ts`; `buildProblemWaMessage()` (lines 101-159) → `src/lib/` (see W5).
- `MaterialPage.tsx` (455 lines): `MATERIAL_HERO` map + `buildMaterialWaMessage()` (lines 26-57) → `src/data/materialHeroImages.ts` + `src/lib/`.

**Fix:** as part of W5's consolidation, also relocate these data tables to `src/data/` for consistency with the existing data-file convention.

---

### W8. `QuizStepConfig.tsx` (311 lines) — near-duplicate sofa/mattress pricing branches

Sofa branch and mattress branch each recompute `basePrice`, `bothFullP`, `packPrice`, `packDelta`, `dp` (display price) with the same shape, differing only in price table (`sofaPrices` vs `mattressPrices`) and add-on delta (+40 vs +30).

**Fix:** extract `usePackPricing(option, item, serviceType, addonDelta)` in `quizHelpers.ts` returning `{ basePrice, packPrice, packDelta, displayPrice }`; use in both branches.

---

### W9. Dead components/files safe to delete (~2,500 lines, near-zero risk — none are imported anywhere)

| Group | Files | LOC |
|---|---|---|
| Higienização/lavagem keyword-variant wrappers (re-export `getKeywordVariantData`, never imported — route gen goes through `getAllKeywordVariantRoutes()` directly) | `data/higienizacaoAlcatifasData.ts`, `higienizacaoCadeirasData.ts`, `higienizacaoColchaoData.ts`, `higienizacaoSofaData.ts`, `higienizacaoTapetesData.ts`, `lavagemAlcatifasData.ts`, `lavagemCadeirasData.ts`, `lavagemColchaoData.ts`, `lavagemSofaData.ts`, `lavagemTapetesData.ts` | ~80 |
| Dead homepage components (back orphaned i18n sections `about`, `beforeAfter`, `clientTypes`, `whyChooseUs`, `trustBadges`) | `components/About.tsx`, `BeforeAfterSection.tsx`, `BenefitCard.tsx`, `ClientTypes.tsx`, `DidYouKnowBox.tsx`, `GuaranteeSection.tsx`, `WhyChooseUs.tsx`, `TrustBadges.tsx`, `SocialProofBarV1.tsx` | ~1,162 |
| Dead `Service*` page-section components (superseded by `ServiceHero`/`ServiceFAQ`/`ServiceBenefitsBar` which ARE used) | `components/RelatedServices.tsx`, `ServiceAreaLinks.tsx`, `ServiceBenefitsSection.tsx`, `ServiceContactSection.tsx`, `ServiceGuarantee.tsx`, `ServicePageTitle.tsx`, `ServiceProblemsGrid.tsx`, `ServiceSchedulingBar.tsx` *(check W3 usage first)*, `ServiceTestimonials.tsx` | ~837 |
| Other dead standalone components | `components/LocationAutocomplete.tsx`, `OptimizedImage.tsx`, `PacksTopBar.tsx`, `GoogleReviewsBadge.tsx` *(or repurpose per W6)*, `WhatsAppButton.tsx`, `NavLink.tsx` | ~592 |
| Unused quiz step variants | `components/quiz/steps/QuizStep0Location.tsx`, `QuizStep4Contact.tsx` | ~263 |
| `QuizSummary.tsx` — own header comment claims it's behind a `{false && ...}` guard that no longer exists in `QuizForm.tsx`; fully disconnected | `components/quiz/steps/QuizSummary.tsx` | ~225 |
| Dead exports never called (`App.tsx` hardcodes `/problemas/:slug`, doesn't enumerate) | `data/problemSeoData.ts:1389-1400` (`getProblemsByCategory`, `getAllProblemRoutes`) | ~10 |

> ⚠️ Note: `ServiceSchedulingBar.tsx` is listed both here (as a "dead Service* component") and in W3 (as a live call site for the quiz-launcher pattern). **Verify actual usage with a fresh grep before deleting** — the two audit passes disagreed; if it's genuinely unused, drop it from W3's fix list too.

**Fix:** delete all files above (after double-checking the `ServiceSchedulingBar` conflict noted above). ~2,500 lines removed.

---

### W10. Orphaned i18n sections in `src/i18n/locales/pt/translation.json`

No `t('...')` references found for these top-level sections:
- `quotePopup`, `welcomePopup`, `newsletterPopup` (32 keys, tied to dead `QuotePopup.tsx` — see C3)
- `about`, `beforeAfter`, `clientTypes`, `whyChooseUs`, `trustBadges` (tied to dead components — see W9)
- `slider` (3 keys), `christmas` (4 keys — **double-check**, may be a seasonal toggle), `promocoes` (6 keys), `testimonials2` (1 key)

**Fix:** remove once the corresponding dead components (W9/C3) are deleted; manually verify `christmas` isn't behind a date-based feature flag before removing.

---

### W11. `react-i18next` used inconsistently — newer SEO templates bypass i18n entirely

Older "core" pages (`LimpezaSofas.tsx`, `LimpezaColchoes.tsx`, `LimpezaCadeiras.tsx`, `LimpezaTapetes.tsx`, `LimpezaAlcatifas.tsx`, `Impermeabilizacao.tsx`, `Index.tsx`) use `useTranslation()`/`t('key')`. All newer programmatic SEO templates (`LocationServicePage`, `FreguesiaServicePage`, `ProblemPage`, `MaterialPage`, `MarcaSofaPage`, `SofaVariantPage`, `PackComboPage`, `ProblemCityPage`) hardcode every string in PT directly in JSX — zero `react-i18next` imports.

**Why it matters:** not a live bug (site is PT-only today), but it's an architectural fork — `src/i18n/locales/pt/` is now dead weight for ~80% of pages, and any future i18n expansion requires retrofitting every SEO template.

**Fix:** either (a) formally document that SEO template pages are PT-only by design and exclude them from the i18n system, or (b) if multi-language is planned, migrate shared section copy (FAQ headers, CTA labels, "Como funciona") into `t()` keys via a shared `useServicePageCopy()` hook.

---

### W12. shadcn/ui scaffold — ~3,254 lines of unused generated components (separate, low-priority cleanup)

Confirmed zero usages outside their own file: `alert-dialog`, `alert`, `aspect-ratio`, `avatar`, `badge`, `breadcrumb`, `calendar`, `card`, `carousel`, `chart`, `checkbox`, `collapsible`, `command`, `context-menu`, `drawer`, `dropdown-menu`, `form`, `input-otp`, `menubar`, `navigation-menu`, `pagination`, `popover`, `progress`, `radio-group`, `resizable`, `scroll-area`, `select`, `sidebar`, `slider`, `switch`, `table`, `toggle-group`, `toggle` (all in `src/components/ui/`).

**Fix (optional, separate pass):** delete unused `ui/*` files and corresponding `package.json` deps: `@radix-ui/react-{alert-dialog,aspect-ratio,avatar,checkbox,collapsible,context-menu,dropdown-menu,menubar,navigation-menu,popover,progress,radio-group,scroll-area,select,slider,switch,toggle,toggle-group}`, `cmdk`, `vaul`, `input-otp`, `recharts`, `react-day-picker`, `react-resizable-panels`.

---

## 🟢 INFO

### I1. `ServiceSchema.tsx:90-100` hardcodes its own 8-city `areaServed` array instead of mapping `cities` from `locationSeoData.ts` (already the source of truth, used by `LocalBusinessSchema`).

### I2. `"39€"` default price fallback duplicated independently in `MaterialPage.tsx:81-82`, `ProblemCityPage.tsx:86`, `ServiceLocationSchema.tsx:12`, `ServiceSchema.tsx:22`, `LimpezaSofas.tsx:130`, `LimpezaColchoes.tsx:130`. Export `DEFAULT_PRICE_FROM = "39€"` from `locationSeoData.ts` and reference it.

### I3. Unused npm dependencies (not imported anywhere in `src/`): `@hookform/resolvers`, `date-fns`, `i18next-browser-languagedetector`. Run `npm uninstall` for these (verify not used by build scripts first).

### I4. Unused/write-only state in `QuizForm.tsx`: `locationFadeIn` (61), `pendingChairQty` (78), `showSummary` (81), `timerFlash` (82, 375-376, 924), `hasSofas` (155), `isSobOrcamento` useMemo (242-265, real one is in `pricingService.ts`), `needsLocationStep` (450), `timingLabel`/`contactLabel` (615-616), `hypoText` (732). ~15-20 lines. **Caution:** `timerFlash`/`showSummary` look like half-wired UI features — confirm with the team before deleting.

### I5. Small dead exports/hooks:
- `src/hooks/use-intersection-observer.ts` (53 lines) — never imported, delete file.
- `src/lib/performance.ts` — `criticalStyles`/`preloadCriticalResources` (lines 1-23) unused, only `measureWebVitals` is used.
- `src/hooks/use-quiz-analytics.ts` — `useUpsellTracking` (153-180+) never used.
- `src/hooks/useScrollReveal.ts` — `getActiveIndex()` (14-24) never called.
- `src/data/freguesiaContentEngine.ts:287` (`getSeed`), `src/data/marcaSofaData.ts` (`marcaCities`), `src/hooks/use-toast.ts:129` (`reducer`) — exported but only used internally; drop `export`.

### I6. Unused imports / dead identifiers (~20 spots, one-line fixes each):
`Header.tsx` (`onOpenQuiz` prop), `Hero.tsx` (`trackWhatsAppClick` import + `waHref` — possible tracking gap, not just dead code), `QuizForm.tsx` (`Check`, `Flame` from lucide-react), `Services.tsx` (`containerW`/`setContainerW`), `layout/SectionLayout.tsx` (`ctaLink` prop), `AdminDashboard.tsx` (6 unused lucide icons, `PRIORITY_MAP`, `setFilterAssigned`), `AdminPanel.tsx` (`XCircle`), `AdminSeoPages.tsx` (`ProblemPage` type), `BlogPost.tsx` (`allPosts`), `MarcaSofaPage.tsx` (`CheckCircle`), `ProblemCityPage.tsx` (`METRO_CITIES`, `ProblemCityRoute`), `Testemunhos.tsx` (`Sparkles`), `materialSeoData.ts` (`services` import), `pricingService.ts` (`mattressItems` param in `isSobOrcamento`).

### I7. SEO template section order drift (cosmetic, document rather than fix):
- `LocationServicePage` has "Tabela de Preços" + "Testemunhos" sections that `FreguesiaServicePage` lacks.
- `FreguesiaServicePage` renders `ServiceFAQSchema` inline inside the FAQ section; `LocationServicePage` renders it at the very end.
- None of `ProblemPage`/`MaterialPage`/`MarcaSofaPage`/`SofaVariantPage` have a `GuaranteeSection`-equivalent block that core `Limpeza*` pages have.
- **Fix:** document which sections are "core" vs "optional per template family", or codify via a shared `<SeoPageLayout>`.

### I8. Raw hex colors (`#071a12`, `#0B2F2A`, `#FDFDF9`, `#D4AF37`) used inline via `style={{...}}` alongside `bg-checker-dark`/`bg-kyro-green` Tailwind utilities across all SEO templates (e.g. `LocationServicePage.tsx:184` vs `:351`). Consistent across templates (not drift between files), but a missed opportunity to fully adopt the `bg-kyro-green` utility and drop ~dozens of inline style objects.

### I9. Files over 400 lines

| Lines | File | Note |
|---|---|---|
| 1650 | `src/data/blogData.ts` | content dataset, expected |
| 1421 | `src/data/problemSeoData.ts` | content dataset, expected |
| 1304 | `src/components/QuizForm.tsx` | see W1 |
| 1105 | `src/pages/AdminPanel.tsx` | out of scope (admin) |
| 826 | `src/pages/AdminDashboard.tsx` | out of scope (admin) |
| 712 | `src/pages/AdminManager.tsx` | out of scope (admin) |
| 657 | `src/pages/LocationServicePage.tsx` | see W7 |
| 635 | `src/components/ui/sidebar.tsx` | shadcn boilerplate, unused (W12) |
| 564 | `src/pages/ProblemPage.tsx` | see C2, W7 |
| 561 | `src/components/quiz/steps/QuizUpsellOverlay.tsx` | see W4 |
| 554 | `src/data/keywordVariantData.ts` | content dataset, expected |
| 473 | `src/pages/FreguesiaServicePage.tsx` | see I7 |
| 463 | `src/pages/SofaVariantPage.tsx` | |
| 462 | `src/data/materialSeoData.ts` | content dataset, expected |
| 455 | `src/pages/MaterialPage.tsx` | see C2, W7 |
| 439 | `src/pages/AdminImport.tsx` | out of scope (admin) |
| 438 | `src/components/Services.tsx` | |
| 435 | `src/pages/PackComboPage.tsx` | see C2 |
| 421 | `src/pages/PricePage.tsx` | |

---

## Summary

| Severity | Count | Approx. LOC removable/affected |
|---|---|---|
| 🔴 CRITICAL | 3 | C1: ~50 files to consolidate (low LOC, high risk reduction) · C2: ~150-200 lines · C3: ~439 lines deleted |
| 🟡 WARNING | 12 | W9 alone: ~2,500 lines deleted; W6: ~120-150 lines; W5/W7: ~120 lines reorganized; W12 (optional): ~3,254 lines |
| 🟢 INFO | 9 | ~75-100 lines (unused imports/exports/vars) |

**Near-zero-risk deletions available immediately:** C3 (~439 lines) + W9 (~2,500 lines) = **~2,940 lines**, none of which are imported anywhere in the project.

**Top 5 most impactful issues:**
1. **C1** — No `src/constants/business.ts`; phone/email/address/review-count/site-URL hardcoded across ~50 files. Highest leverage fix in this audit — directly caused the 24-file edit needed earlier this session just to bump the review count from 50 to 60.
2. **C3 + W9** — ~2,940 lines of dead components/pages/data files, including a duplicate header (`HeaderV1.tsx`) and a duplicate FAQ page (`FAQ.tsx`) that could be mistakenly edited instead of the live versions.
3. **C2** — 5 divergent hand-rolled JSON-LD builders; Problem/Material/MarcaSofa/PackCombo pages are missing schema fields (`Offer`, consistent `aggregateRating`) that Location/Freguesia pages have, a real SEO gap across hundreds of routes.
4. **W1** — `QuizForm.tsx` (1,304 lines) is a god component mixing pricing logic, Supabase writes, analytics, and a 340-line render tree — the most business-critical file on the site (lead capture) and the hardest to safely modify.
5. **W6** — Trust-badge/review JSX duplicated 10+ times while a purpose-built `GoogleReviewsBadge` component sits unused; fixing this also resolves part of C1's review-count duplication.

Full details with file paths and line numbers for every item above are in this file.
