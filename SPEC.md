# Initiative: SEO/AEO health-check fixes ([#101](https://github.com/v-salvator/bezold/issues/101))

## Capability map (approved 2026-11-07)

| Module id           | Responsibility                                                                                                          | Depends on        | Lands in PR for |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------- | --------------- |
| `indexing-fixes`    | Blog posts in the live sitemap, noindex 404 page, internal links (related stores, blog↔blog, footer), `lang`            | —                 | #102            |
| `store-metadata`    | Template-built store title/description (no truncated seller text); /store-guide title/description                       | —                 | #103            |
| `structured-data`   | FAQPage on /faq; BreadcrumbList on every store page, Product on priced ones; CollectionPage/ItemList on list pages      | —                 | #104            |
| `sell-content`      | /sell expanded to 800+ chars with FAQ; 「頂讓」 anchor links home ↔ /store-guide; 40–60 char definition on /store-guide | `structured-data` | #105            |
| `trust-pages`       | `/llms.txt`, `/about`, `/contact`, Organization `contactPoint`, footer links                                            | —                 | #106            |
| `store-list-paging` | /store-list paginated at 24 per page, card names as H3, first-page HTML < 200 KB                                        | `structured-data` | #106            |
| `ga-attribution`    | Events stop sending a `source` param that GA4 reads as traffic source (renamed `entry_point`)                           | —                 | #101 comment    |

Build order: `indexing-fixes` → `store-metadata` → `structured-data` → `sell-content`, `trust-pages` → `store-list-paging` → `ga-attribution`

#102 and #103 each got their own PR. Everything from `structured-data` on ships in **one PR** (decided 2026-11-07).

### Decisions

- **面議 stores** (price 0 + negotiable) get BreadcrumbList only — no Product. A Product with no `offers`, `review` or `aggregateRating` is an invalid rich result. Never fabricate ratings, reviews, shipping or return policies.
- **New copy** (/sell, /about, /contact, FAQ answers) is drafted by Claude from facts already on the site; anything that would need invented facts is left as a flagged `TODO` for the user to fill in the PR review.

### Manual — not code (the user does these)

- `http://bezold.com.tw/` already returns 308 (not 500) but takes two hops (`http://bezold.com.tw` → `https://bezold.com.tw` → `https://www.…`). Collapsing to one hop is a Vercel Domains / DNS setting.
- GSC: resubmit the sitemap, request indexing for /blog, /faq, /store-list, /sell, re-validate 「頁面會重新導向」.
- Ask the sellers of `/store/LFkiSI3OhzcEtJ4V3e9V` and `/store/Z1SpiBt99CiQE59CMNjS` for more content.
- Threads UTM checklist (#101 comment, 2026-11-06).

Module specs are written one at a time, in build order. `indexing-fixes` → [#110](https://github.com/v-salvator/bezold/pull/110) (merged), `store-metadata` → [#111](https://github.com/v-salvator/bezold/pull/111). This file holds the map plus the specs still being built.

---

# Module specs: remaining modules — one PR (#104, #105, #106, #101 GA)

Approved 2026-11-07: everything left in the map ships in one PR, built in this order: `structured-data` → `sell-content` → `trust-pages` → `store-list-paging` → `ga-attribution`. Each module below has its own acceptance criteria, and the build keeps one commit per task.

## Decisions (2026-11-07)

- **/store-list**: paginate at 24 per page (`?page=N`), move sorting into the URL (`?sort=`), and send the client only card data.
- **GA**: rename the `source` event parameter to `entry_point`.
- **/about**: built from site facts only. The founding-story section is a commented-out placeholder for you to fill in; the page ships without it.
- **Thin store pages**: no automatic noindex. #103's template descriptions add facts, and you contact the 2 sellers yourself.
- **Merchant listing warnings** (no shipping, returns or ratings): accepted. Never fabricate those fields. The `Offer` doesn't name Bezold as `seller`, because the shop owner is the seller.
- **FAQPage rich results**: since 2023 Google only shows them for government and health sites, so this schema helps AI answers and validation, not visible rich results. It must still pass Rich Results Test.

---

## `structured-data` ([#104](https://github.com/v-salvator/bezold/issues/104))

Findings: /faq, /store-list, /digital-assets and /blog have no JSON-LD. Store pages emit Product only when they have a price, and none emits BreadcrumbList. Several /faq answers are JSX (bold text, line breaks), so they have no plain-text form for the schema.

### Acceptance criteria

1. **Pure builders** in `utils/structuredData.ts` (no runtime `@/` imports, unit-tested): `faqPageJsonLd(items)`, `breadcrumbJsonLd(crumbs)`, `itemListPageJsonLd({ name, url, itemUrls })`.
2. **/faq** emits one `FAQPage` covering every question on the page. Each answer's text matches the visible answer: JSX answers get a hand-written `text` that the type system requires whenever `a` isn't a plain string.
3. **Every store page** (physical, digital, 面議, sold) emits a `BreadcrumbList` that mirrors `StoreBreadcrumb`: 首頁 → 我要找店 (or 數位資產) → store name, with absolute URLs except the last item. Product stays as is, priced listings only.
4. **/store-list** (current page's stores), **/digital-assets** and **/blog** each emit a `CollectionPage` with `mainEntity: ItemList` of absolute item URLs, in display order.
5. Output is valid JSON-LD (checked locally by parsing every `application/ld+json` block on the page).

---

## `sell-content` ([#105](https://github.com/v-salvator/bezold/issues/105))

Findings: /sell is the main conversion page (1,280 key events in 90 days), but GSC says 「已檢索－目前尚未建立索引」. `EmailVerifiedGate` renders `null` until auth resolves, so a crawler sees only the H1 and one line, about 283 characters. /store-guide's hero already defines 頂讓 in about 50 characters, which covers #105's definition item. The homepage doesn't link to /store-guide outside the nav.

### Acceptance criteria

1. **/sell server-rendered content outside the gate**, visible signed-out and below the form: 刊登流程 (steps), 費用說明 (早鳥前 3 個月免費刊登；瀏覽、聯絡永久免費；成交永久不抽成；之後的收費另行公告), 刊登須知 (at least 3 photos, JPG/PNG/WebP/GIF under 5 MB from `constant/image.ts`, accurate info, valid contact), 5–8 FAQ, and a CTA. Every fact comes from /faq or the code. No made-up store counts or success stories.
2. Signed-out `/sell` HTML body text is **≥ 800 CJK characters**. The FAQ also emits `FAQPage` (builder from `structured-data`).
3. **「頂讓」 anchor links**: the homepage links to `/store-guide` with anchor text containing 頂讓 (e.g. 「第一次頂讓？看頂讓指南 →」) in a body section, not the nav, and /store-guide links back to `/` with anchor text containing 頂讓 (e.g. 「瀏覽全台頂讓店面」).
4. The #43 note (「店面頂讓」 topic page belongs to #43) is a comment on #43. I draft it, and you OK it before it's posted.

---

## `trust-pages` ([#106](https://github.com/v-salvator/bezold/issues/106))

Findings: `/llms.txt`, `/about` and `/contact` return 404. The Organization JSON-LD has `email` but no `contactPoint` or address. The store-list 「聯絡我們」 button points at `/store-guide#contact`.

### Acceptance criteria

1. **`/llms.txt`** returns 200 `text/plain`. It's a route handler generated at build time (`force-static`, so no runtime `fs` read), with a one-line summary, the main pages, every published blog post, /about and /contact.
2. **`/about`**: what Bezold is, how listings are reviewed (same day, at most 24 h, email notice), fees, the no-intermediary model, how to contact us. Site facts only. The founding-story section stays a commented-out placeholder.
3. **`/contact`**: email `hello@bezold.com.tw` (`mailto:`), LINE `bezoldtw` with its link and QR code (`public/bezold-line-qr.jpeg`), hours 09:00–21:00, social links. No form.
4. Both pages use the page shell, `pageMetadata()`, footer links (關於我們 / 聯絡我們) and sitemap entries. The store-list 「聯絡我們」 button points to `/contact`.
5. **Organization JSON-LD** gains `contactPoint` (`customer support`, email, LINE URL, `areaServed: "TW"`, `availableLanguage: "zh-Hant"`) and `address: { addressCountry: "TW" }`. No street address, phone or company ID is invented.

---

## `store-list-paging` ([#106](https://github.com/v-salvator/bezold/issues/106))

Findings: production /store-list is 602 KB. The client component `ResultsArea` receives every approved store as a full `Store` (descriptions included) and sorts it in the browser. Card names are H2 (101 of them).

### Acceptance criteria

1. **`?page=N`**: 24 stores per page, 1-based. A missing or invalid value means page 1; a page beyond the last one returns 404. Filters (`city`, `category`, `tag`, `amountMin`, `amountMax`) and `sort` are kept in every pagination link.
2. **`?sort=`**: `newest` (default), `price-asc` or `price-desc`, applied on the server before paging. Changing the 排序 dropdown pushes the URL with the new sort and page reset to 1. Submitting filters resets to page 1 and keeps the sort. The `SearchBar` hydration `useEffect` is preserved.
3. **Pagination UI**: a new shared `components/refactored/Pagination.tsx` (+ module CSS) with crawlable `<a href>` links (prev / numbers / next) and `aria-current` on the current page, hidden when there's only one page. The count shows the total plus the range shown (e.g. 共 111 間 · 第 1–24 間).
4. **Slim payload**: the page sends `ResultsArea` only the current page's card data (`toCard()` output + id), never full stores. Card titles render as H3.
5. **Metadata**: page 1 keeps canonical `/store-list`; page N > 1 gets canonical `/store-list?page=N` and the title suffix 「第 N 頁」. ItemList is the current page.
6. Pure helpers (`parsePage`, `parseSort`, `sortStores`, `paginate`) live in `utils/storeListPaging.ts` with unit tests.
7. **Size**: production first-page HTML < 200 KB, checked after deploy (mock data has only 6 stores). Before that, a local estimate: measured bytes per card × 24 + shell.

---

## `ga-attribution` ([#101 comment](https://github.com/v-salvator/bezold/issues/101#issuecomment-6608982596))

Findings: the code has no internal `utm_*` links. The GA4 session sources `fab`, `contact_gate_blur` and `auto` are the values of a custom event parameter named **`source`**, which GA4 reads as a traffic-source field, so these events rewrite the session's source/medium. It's sent by `sign_up`, `verification_email_sent`, `buyer_club_popup_impression` and `buyer_club_popup_dismiss`.

### Acceptance criteria

1. Those 4 events send `entry_point` instead of `source`, with the same values. No event sends a param named `source`, `medium`, `campaign`, `term` or `content` (checked by grep over every `trackEvent` call).
2. `docs/analytics-events.md` is updated: param tables, the values table header, and a note explaining why `source` is not allowed.
3. Manual, for you: register `entry_point` as an event-scoped custom dimension in GA4 Admin (old reports keep `source`), then compare Unassigned / (not set) 2 weeks after deploy.

---

## Tech Stack · Commands · Structure

Same as the earlier modules. Next.js 14.2.4, TypeScript, CSS Modules + Tailwind, Node test runner for pure helpers, no new dependencies.

```bash
nvm use
npm run test:unit
npx tsc --noEmit -p .
npx eslint --no-eslintrc -c .eslintrc.json --ext .ts,.tsx app components constant types utils hooks lib firebase
npx prettier --write <changed files>
npm run build                      # main checkout's .env symlinked temporarily
npm run dev                        # .env.development → mock collections
# every JSON-LD block on a page parses:
curl -s localhost:3000/faq | python3 -c "import sys,re,json;[json.loads(b) for b in re.findall(r'<script type=\"application/ld\+json\">(.*?)</script>',sys.stdin.read())];print('ok')"
```

New files: `utils/structuredData.ts`, `utils/storeListPaging.ts` (+ tests in `tests/unit/`), `app/(new)/sell/_components/*` content sections, `app/(new)/about/`, `app/(new)/contact/`, `app/llms.txt/route.ts`, `components/refactored/Pagination.tsx`.

## Code Style

Same conventions as the earlier modules: `// *` comments explain why, readable names, CSS Modules for paint and Tailwind for layout, `cn()`, page shell, `pageMetadata()`, and JSON-LD rendered through the existing `JsonLd` component:

```tsx
<JsonLd
  data={breadcrumbJsonLd([
    { name: "首頁", url: `${appUrl}/` },
    { name: "我要找店", url: `${appUrl}/store-list` },
    { name: store.storeName },
  ])}
/>
```

## Testing Strategy

- **Unit (test-first)**: JSON-LD builders; pagination/sort helpers (bounds, invalid input, stable order, link params).
- **Dev server**: JSON-LD parses on every touched page; /faq question count = FAQPage count; signed-out /sell body text ≥ 800 chars; /store-list `?page`, `?sort`, filters and out-of-range 404; /about, /contact, /llms.txt return 200; screenshots on desktop and mobile; no new console or server errors.
- **After deploy (you)**: Rich Results Test on /faq and one store page; GSC breadcrumbs report; `curl -s https://www.bezold.com.tw/store-list | wc -c` < 200 KB; GA4 custom dimension.

## Boundaries

- **Always**: one commit per task; prettier + eslint; `omitSellerContact()` on anything public; URL params stay the source of truth on /store-list; push or open the PR only after your review.
- **Ask first**: posting the #43 comment; any new Firestore index; changing robots rules; adding dependencies.
- **Never**: fabricate ratings, reviews, shipping or return data, store counts, testimonials, company registration or a founding story; ship visible TODO text; drop the `SearchBar` hydration effect.

## Success Criteria

All module acceptance criteria above. Long-term (you): /faq and store pages pass Rich Results Test, GSC shows a Breadcrumbs report, /sell gets indexed, 「頂讓」 ranks top 10 within 6–8 weeks, store-list HTML is down by more than half, and `fab` / `contact_gate_blur` / `auto` stop appearing as session sources.

## Open Questions

None.
