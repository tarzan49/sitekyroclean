# Audit: cleansolutions.com.pt · 06 Sep 2026 · zero-credential first pass

**Scope note:** ~14,997 URLs in the sitemap (12 sub-sitemaps: core, location, freguesia, problem, material, keyword-variants, price, resources, packs, marcas, en, comercial). Full site is way over the "one page per template" threshold, so this pass checked one page per template live on production (homepage, a location page, a freguesia page, a 404 probe) rather than crawling all ~15k. No Search Console, Semrush, or Business Profile data supplied yet — everything below is either directly measured live or read from your own source, never estimated.

**Live site is behind your work.** Everything from this session (the tapete pricing cleanup, carpet widget, upsell fixes, timeline redesign) is on `worktree-kyro-minorder-emdash`, not merged to `master`. Production still serves the old "Desde 15€/m²" tapete pricing — confirmed live on `/limpeza-tapetes` and `/limpeza-tapetes-porto-paranhos`. Merging this branch will retroactively fix a chunk of what's below for free.

---

### [x] 1. Soft-404s: any bad URL returned 200 with the homepage · index-hygiene, real
Fixed 06 Sep. `curl -o /dev/null -w "%{http_code}" https://cleansolutions.com.pt/pagina-que-nao-existe-xyz-123` returned **200**, served with the homepage's own title/meta, because `_redirects` ended in a blanket `/* /index.html 200` catch-all.

**First attempt failed and I reverted it**, worth recording why: tried adding a `/* /index.html 404` rule — turns out Cloudflare Pages `_redirects` [only supports status 200 on a rewrite](https://developers.cloudflare.com/pages/configuration/redirects/); custom statuses on a rewrite are silently unsupported. Confirmed locally with `wrangler pages dev` before touching anything live.

**The real fix, verified locally:** Cloudflare Pages has a documented built-in behavior — if a `404.html` exists in the deploy, it's served with a genuine 404 status for any request matching no static file and no `_redirects` rule. Added a `404.html` generation step to `scripts/prerender.ts` (reuses the same `generatePageBody()`/schema helpers every other page already gets, with its own noindex meta), and removed the blanket catch-all from `_redirects` entirely.

That surfaced a second wrinkle: `/obrigado`, `/obrigado-pelo-servico`, `/admin/panel`, `/admin/deslocacoes` are genuinely client-only (never prerendered, `Disallow`'d in robots.txt already) and used to ride the same catch-all to keep working on direct load/refresh. A `_redirects` rule targeting `/index.html` turned out to redirect to `/` instead of rewriting (reproducible in `wrangler pages dev`, not documented anywhere I could find) — so instead of relying on `_redirects` for these 4 at all, `scripts/prerender.ts` now writes them as real static files, exactly like the other ~15,000 routes, each with its own noindex meta.

**Verified with `wrangler pages dev` against the actual production build** (not just dev mode): homepage 200, every real page 200, all 4 client-only routes 200 with noindex present, the existing 301 redirects and trailing-slash rule still fire, and — the actual fix — a made-up URL now returns a real 404 with the styled `NotFound.tsx` page, zero console errors on any of it.

**Who:** me, in `scripts/prerender.ts` and `public/_redirects`
**Time:** done (took longer than the 30 min estimate — two dead ends before finding what actually works, both caught by local testing before touching production)
**Changes:** `scripts/prerender.ts` (404.html + 4 client-only-route generation) and `public/_redirects` (catch-all removed). No body copy touched.

### [ ] 2. Cloudflare's managed robots.txt blocks every AI crawler sitewide · GEO, owner decision needed

`robots.txt` (auto-managed by Cloudflare, not something in your repo) disallows `ClaudeBot`, `GPTBot`, `Google-Extended`, `Applebot-Extended`, `Bytespider`, `CCBot`, `Amazonbot`, `meta-externalagent` — full site, `Disallow: /`. Regular `Googlebot` (classic Search) and `Bingbot` are **not** in that block list, so normal Google/Bing search indexing is unaffected. `Google-Extended` specifically controls Gemini/AI-training use of your content, separate from Search indexing.

**This is a real choice, not obviously a bug:** blocking it protects your written content (testimonials, service descriptions, pricing) from being used to train AI models for free. The cost is that ChatGPT, Claude, and Perplexity can't cite your business by name when someone asks "melhor limpeza de sofás no Porto" — increasingly how younger/tech-savvy customers search. Given `Content-Signal: search=yes,ai-train=no,use=reference` is also declared, someone already made a deliberate call here.

**Not fixing this without your yes** — it's your call whether AI-surface visibility is worth trading against training-data protection. If you want AI citability, the fix is a `robots.txt` override in Cloudflare (outside this repo) allowing at minimum `ClaudeBot`, `GPTBot`, `PerplexityBot`, `OAI-SearchBot`.

**Who:** you, in Cloudflare dashboard (this isn't in the site's own code)
**Time:** 5 min if you decide to change it
**Changes:** none yet — reporting only

### [x] 3. Homepage had zero `<h1>` and zero body text in the raw HTML · on-page/GEO
Fixed 06 Sep. `curl https://cleansolutions.com.pt/` returned an 11KB shell: title/meta/schema present, but no H1 and no visible copy — all client-hydrated. Turned out **every one of the other ~14,997 pages already had a fix for this** (`scripts/prerender.ts`'s `emit()` injects a small server-rendered `<h1>` + intro paragraph into every route via `generatePageBody()`) — the homepage was the one route that never went through `emit()` at all, since `dist/index.html` is also reused as the shared `<head>` template for cloning into every other page. Added a homepage-only injection at the end of `prerenderRoutes()`, writing straight to `dist/index.html` (using the real homepage schema, not the template's stripped copy) after every other route is already generated — so it can't affect the other 14,997 pages. Verified: homepage now ships `<h1>Estofos como novos, ao domicílio.</h1>` (the real hero H1 text) server-side, React swaps it cleanly on hydration with zero console errors and no duplicate H1, other routes' output unchanged (spot-checked `limpeza-sofas-porto.html`).

**Who:** me, in `scripts/prerender.ts`
**Time:** done
**Changes:** `scripts/prerender.ts` only (~15 lines added at the end of `prerenderRoutes()`). No body copy touched — reused your own real hero headline and homepage meta description, wrote nothing new.

### [x] 4. Search Console exports · supplied 06 Sep, here's what they show

**Manual actions:** clean — "Nenhum problema detetado."

**Indexing (as of 28 Aug, latest data point):** **8,115 indexed, 9,415 not indexed** — total known URLs ~17,530, above the ~15,000 sitemap count (Google discovered some extra ones, normal). Trending up: both indexed and not-indexed jumped together around 22 Aug, consistent with the programmatic page set landing in the sitemap around then. The "not indexed" reasons add up to exactly 9,415:

| Reason | Pages | Status |
|---|---:|---|
| Discovered, not indexed | 5,127 | **Real, open.** Google knows these URLs exist but hasn't prioritized crawling them — by far the biggest bucket, and the expected symptom of a very large templated page set (ties directly to the doorway-page question in finding-to-come #6). |
| Alternate page with proper canonical | 1,369 | Normal — correctly-canonicalized duplicates, not a problem by itself. |
| Blocked by robots.txt | 1,167 | **Already fixed, draining out.** This is stale classification from the old `Disallow: /*?lang=*` rule, removed 10 Aug (commit `e3715a6`) — that commit's own message predicted almost this exact number ("~1170 URLs ... stuck permanently"). No action needed, just waiting on Google's re-crawl. |
| Crawled, not indexed | 751 | **Real, open.** Google looked and passed — a quality/uniqueness signal, same underlying question as the 5,127 above. |
| Excluded by noindex | 728 | **Already fixed, draining out.** Stale residue from a noindex tag applied to variant pages then removed on 5 Jun (commit `101c3ab`, "remove noindex from 1570 keyword variant pages"). Confirmed no active noindex logic anywhere in the current codebase except the intentional one on the 404 page. |
| Blocked, 403 | 66 | Minor, worth a look if it's not intentional. |
| Server error (5xx) | 42 | Minor. |
| Redirect error | 31 | Minor. |
| Redirect page | 7 | Minor. |
| Blocked, other 4xx | 3 | Minor. |
| Duplicate, Google picked a different canonical | 2 | Negligible. |

**Core Web Vitals (mobile only supplied):** 54 URLs flagged for INP over 200ms, 0 for LCP. No major red flags, but this is mobile-only — the desktop export wasn't included, worth grabbing if you want the full picture (Experience → Core Web Vitals → Desktop tab → Export).

**Performance (impressions only, last 3 months):** 1,562 total impressions, 99% Portugal, mobile-dominant (1,195 vs 358 desktop). Top pages are a mix of blog posts (`quanto-custa-limpar-sofa-profissional` leads at 217) and city-specific service pages — the blog is pulling real weight. Note: only "Impressions" was ticked on export, not clicks or average position — re-export with those two ticked if you want CTR and ranking-position data (same Performance report, same Export button).

**Who:** done — you supplied these
**Time:** done
**Changes:** none, this is measurement only

### [ ] 5. Google Business Profile pastes, if you want Layer 11 (Local) graded

Categories, services, service area from your GBP dashboard (About → Edit, Services → Edit). Reviews, rating, hours are pulled live already if you want a map-pack + review comparison against 2-3 real competitors.

**Who:** you, from your GBP dashboard
**Time:** ~2 min
**Changes:** none to the site

---

## What this audit did NOT measure

- **Semrush (Layers 2, 3, 4, 12 backlinks/keywords):** not connected. No free way to see referring domains, keyword rankings, or competitor traffic without it.
- **Search Console clicks/position (Layer 1):** the Performance export only had Impressions ticked — clicks and average position weren't included. Re-export to get CTR and real ranking positions.
- **Search Console Core Web Vitals, desktop (Layer 1):** only the mobile export was supplied.
- **Lighthouse (Layer 6):** not run this pass — needs either a headless Chrome available in this environment or your own local run (`npx lighthouse https://cleansolutions.com.pt/ --view`). Can run this next if useful.
- **On-page 80-check grade, GEO 38-check grade (Layers 5, 7):** not run in full against `references/on-page-seo.md` / `references/geo.md` this pass — the four items above surfaced from spot checks, not the complete checklist. Can run the full grid next on a chosen scope (recommend one-page-per-template given ~15k URLs).
- **Doorway/thin-page similarity (Layer 13):** `code/check_page_similarity.py` is in place but not run yet — would want to point it at a sample of freguesia pages (the highest-volume templated set) to check real similarity, not assume it from reading the generator code.
- **Google Business Profile / Local (Layer 11):** no GBP data supplied, map-pack/review comparison not run.
- **Live AI-surface test (Layer 7):** haven't asked ChatGPT/Perplexity/Google AI Mode "melhor limpeza de sofás no Porto" etc. and recorded who gets cited — worth doing given finding #2.

---

**Want me to:** run the full on-page + GEO checklists against a one-page-per-template sample, run Lighthouse, run the doorway-similarity script against freguesia pages, or wait for you to grab the Search Console exports first? Nothing above gets touched until you say which.
