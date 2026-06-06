# Audit Report — Kyro Clean (sitekyroclean)
_Generated: 2026-06-06_

---

## Summary

| Severity | Found | Fixed |
|----------|-------|-------|
| 🔴 Critical | 3 | 3 |
| 🟡 Warning | 4 | 2 |
| 🟢 Info | 2 | 0 |

Lines of duplicated code removed: ~140

---

## 🔴 CRITICAL — Fixed

### 1. `SERVICE_TO_QUIZ` duplicated in 6 files ✅
Files: LocationServicePage, FreguesiaServicePage, MaterialPage, PricePage, ProblemPage, ProblemCityPage
Fix: `src/constants/serviceToQuiz.ts` — also added `SERVICEKEY_TO_QUIZ` (was in SofaVariantPage).

### 2. Hero/result image mappings duplicated in 2 files ✅
Files: LocationServicePage:47-63, FreguesiaServicePage:64-80 — identical mappings + 12 duplicate asset imports each
Fix: `src/constants/serviceContent.ts` exports `SERVICE_HERO_IMAGES`, `SERVICE_RESULT_IMAGES`, `SERVICE_RESULT_CONTENT`, fallbacks.

### 3. `RESULT_CONTENT` duplicated in 2 files ✅
Files: LocationServicePage:18-25, FreguesiaServicePage:35-42
Fix: Consolidated into `SERVICE_RESULT_CONTENT` in serviceContent.ts

---

## 🟡 WARNING — Fixed

### 4. `METRO_CITIES`/`METRO_SLUGS` duplicated in 4 files ✅
Files: LocationServicePage:66, FreguesiaServicePage:83, ProblemPage:216, ProblemCityPage:92
Fix: `src/constants/metroCities.ts` exports `METRO_CITIES` (Set) and `METRO_CITY_SLUGS` (array)

### 5. WA message builder duplicated in 3 files ✅
Files: LocationServicePage, FreguesiaServicePage, PricePage
Fix: `src/lib/buildServiceWaMessage.ts`
Note: MaterialPage and ProblemPage builders have distinct logic — kept local.

---

## 🟡 WARNING — Pending

### 6. Large component files
- `QuizForm.tsx` — largest; should be split into per-step sub-components
- `LocationServicePage.tsx` — ~620 lines
- `ProblemPage.tsx` — ~560 lines

### 7. `PRICE_TABLE` in LocationServicePage (~line 65)
Single source currently — extract to constants if needed in other pages.

---

## 🟢 INFO — Pending

### 8. Possibly unused Lucide imports
`Search`, `Wind`, `Droplets`, `Sparkles` in MaterialPage.tsx — verify usage.

---

## New files created

| File | Purpose |
|------|---------|
| `src/constants/serviceToQuiz.ts` | SERVICE_TO_QUIZ + SERVICEKEY_TO_QUIZ |
| `src/constants/metroCities.ts` | METRO_CITIES (Set) + METRO_CITY_SLUGS (array) |
| `src/constants/serviceContent.ts` | Hero/result images + RESULT_CONTENT |
| `src/lib/buildServiceWaMessage.ts` | Unified WA message builder |
