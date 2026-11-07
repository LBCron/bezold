# Tasks: remaining SEO/AEO modules (#104, #105, #106, #101 GA)

Spec: [`SPEC.md`](../SPEC.md) · Plan: [`tasks/plan.md`](plan.md)

Each task: acceptance criteria from the matching SPEC section · verify with `npm run test:unit` (where there are tests), tsc, eslint, prettier, and a dev-server check · one commit.

## structured-data (#104)

- [x] **T1 JSON-LD builders + unit tests**: `faqPageJsonLd`, `breadcrumbJsonLd`, `itemListPageJsonLd` in `utils/structuredData.ts`; `tests/unit/structuredData.test.ts` written first. Files: 2.
- [x] **T2 /faq FAQPage**: `FaqItem` type requires `text` for JSX answers; page emits one FAQPage over all questions. Verify: JSON-LD parses; question count = Question count. Files: `faq/page.tsx`, `FaqCategory.tsx`.
- [x] **T3 Store BreadcrumbList**: every store page (physical / digital / sold) emits a breadcrumb that mirrors `StoreBreadcrumb`. Files: store `page.tsx`.
- [x] **T4 ItemList on /digital-assets and /blog**: CollectionPage + ItemList of absolute URLs in display order. Files: 2 pages.

**Checkpoint A**: unit tests, tsc, lint clean; JSON-LD parses on /faq, a store page, /digital-assets, /blog.

## sell-content (#105)

- [x] **T5 /sell content + FAQPage**: steps, fees, rules, 5–8 FAQ, CTA, rendered outside the gate; signed-out body ≥ 800 CJK chars. Files: `sell/page.tsx`, new `sell/_components/SellGuide.tsx` (+ css).
- [x] **T6 「頂讓」 anchor links**: homepage body → /store-guide, /store-guide → `/`. Files: one home section, `GuideCta.tsx`.

## trust-pages (#106)

- [x] **T7 `/llms.txt`**: force-static route handler from `getAllPostsMeta()`. Verify: 200 `text/plain`, lists all 6 posts; build output marks it static.
- [x] **T8 /about + /contact**: pages, footer links, sitemap entries, store-list 「聯絡我們」 → `/contact`. Verify: 200, screenshots desktop + mobile.
- [ ] **T9 Organization contactPoint + address country**: home JSON-LD. Verify: parses.

**Checkpoint B**: build passes; /sell signed-out char count; /llms.txt, /about, /contact return 200.

## store-list-paging (#106)

- [ ] **T10 Paging helpers + unit tests**: `parsePage`, `parseSort`, `sortStores`, `paginate`, `pageHref` in `utils/storeListPaging.ts`; tests first.
- [ ] **T11 Pagination primitive**: `components/refactored/Pagination.tsx` + css; crawlable links, `aria-current`, hidden for 1 page.
- [ ] **T12 /store-list on server paging**: server sorts + pages; `ResultsArea` gets one page of cards; sort dropdown pushes URL; SearchBar keeps sort, resets page; H3 titles; canonical/title for page > 1; out-of-range 404; ItemList for the current page. Verify: filters + sort + page combinations, SearchBar hydration, per-card byte estimate.

## ga-attribution (#101)

- [ ] **T13 Rename `source` → `entry_point`**: 4 events + `docs/analytics-events.md`. Verify: grep shows no `trackEvent` with `source` / `medium` / `campaign` / `term` / `content`.

## Checkpoint: Complete

- [ ] `npm run test:unit`, tsc, eslint, `npm run build` clean; dev checks above
- [ ] #43 comment drafted for your OK
- [ ] You review → push → one PR
