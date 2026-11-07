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
| `ga-attribution`    | Internal links stop carrying `utm_*`; replaced by GA custom events                                                      | —                 | #101 comment    |

Build order: `indexing-fixes` → `store-metadata` → `structured-data` → `sell-content`, `trust-pages` → `store-list-paging` → `ga-attribution`

One PR per sub-issue: #106 carries both `trust-pages` and `store-list-paging`; `ga-attribution` gets its own PR referencing #101.

### Decisions

- **面議 stores** (price 0 + negotiable) get BreadcrumbList only — no Product. A Product with no `offers`, `review` or `aggregateRating` is an invalid rich result. Never fabricate ratings, reviews, shipping or return policies.
- **New copy** (/sell, /about, /contact, FAQ answers) is drafted by Claude from facts already on the site; anything that would need invented facts is left as a flagged `TODO` for the user to fill in the PR review.

### Manual — not code (the user does these)

- `http://bezold.com.tw/` already returns 308 (not 500) but takes two hops (`http://bezold.com.tw` → `https://bezold.com.tw` → `https://www.…`). Collapsing to one hop is a Vercel Domains / DNS setting.
- GSC: resubmit the sitemap, request indexing for /blog, /faq, /store-list, /sell, re-validate 「頁面會重新導向」.
- Ask the sellers of `/store/LFkiSI3OhzcEtJ4V3e9V` and `/store/Z1SpiBt99CiQE59CMNjS` for more content.
- Threads UTM checklist (#101 comment, 2026-11-06).

Module specs are written one at a time, in build order. `indexing-fixes` → [#110](https://github.com/v-salvator/bezold/pull/110). This file holds the map plus the **current** module's spec, which is replaced when the next module starts.

---

# Module spec: `store-metadata` ([#103](https://github.com/v-salvator/bezold/issues/103))

## Objective

Several pages get many impressions but few clicks. People searching for a shop's name or street address find its listing, but the result doesn't tell them it's a takeover listing (頂讓案), and the description is the seller's text cut off mid-sentence, sometimes with emoji or as short as 4 characters. This module builds store-page titles and descriptions from a template using the listing's structured data, and sharpens the /store-guide description.

Findings (2026-11-07, live site):

| Page                                           | Title today                                                        | Description today                         |
| ---------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------- |
| `/store/HUluGiOrAjMfT5N1Oqzg` (巴地越南小吃)   | `巴地越南小吃｜新北市店面頂讓｜頂讓網 Bezold`                      | seller text, no fee, no address           |
| `/store/11QZiOt9J1orpBHXkd34` (尚豪汽車精洗)   | `尚豪汽車精洗｜新竹縣店面頂讓｜頂讓網 Bezold`                      | `汽車美容` (4 chars)                      |
| `/store/00HZfgN80EAplNHZD82X` (新北蘆洲小吃店) | `新北蘆洲小吃店｜新北市店面頂讓｜頂讓網 Bezold`                    | starts with `✨`, has `🔥`, cut with `…`  |
| `/store-guide`                                 | `頂讓是什麼？頂讓流程、頂讓金與注意事項一次看懂…` (set 2026-10-18) | doesn't define 頂讓 in its first sentence |

- The GSC query 「中誠街30號」 (167 impressions, 0.6% CTR) is the address of the 巴地越南小吃 page, so both CTR problems in #103 are the same page.
- Most of /store-guide's 1.53% CTR was measured before its 2026-10-18 title change.

### Decisions (2026-11-07)

- **Description** = a facts sentence built from structured data, then the start of the seller's text with emoji stripped, ≤ 150 chars in total.
- **Sold listings** get the title prefix 【已頂讓】; live listings get 【頂讓】.
- **Address** goes in the description only. The title stays short.
- **/store-guide**: change the description only; keep the October title.
- Digital-asset titles and descriptions are unchanged (out of scope).

### Acceptance criteria

1. **Physical store title** (the layout appends `｜頂讓網 Bezold`):
   `{【頂讓】|【已頂讓】}{storeName}｜{city}{district}{categoryLabel}店面頂讓`
   - `categoryLabel` comes from `STORE_CATEGORIES` (餐飲 / 服飾 / 工廠 / 百貨); omitted for 其他 or unknown.
   - Missing `city` or `district` is skipped without leaving gaps or stray separators.
   - Example (illustrative district, fee and size): `【頂讓】巴地越南小吃｜新北市三重區餐飲店面頂讓｜頂讓網 Bezold`
2. **Physical store description**, at most 150 characters:
   - **Facts sentence**: `{city}{district}{categoryLabel}店面頂讓：{fee}{、N 坪}{、月租 NT$ X 萬}{、含設備…}{，位於{location}}。`
     - `fee`: `頂讓金 NT$ 50 萬`, or `頂讓金 NT$ 50 萬（可面議）`, `頂讓金面議` or `免頂讓金`. Wording reuses `formatPriceDisplay`.
     - Each optional part appears only when the field has a value. Equipment uses `EQUIPMENT_LABEL`.
     - Sold listings: the sentence reads `…店面已頂讓成交` and the fee is left out.
   - **Seller excerpt**: the seller's `description` with emoji, pictographs and variation selectors removed and whitespace collapsed. It fills the remaining space, ending in `…` if cut, and is left out if fewer than 20 characters of space remain.
   - Only facts from the data. Never claim 客群, 設備 or anything else the listing doesn't state.
   - Example (illustrative district, fee and size): `新北市三重區餐飲店面頂讓：頂讓金 NT$ 50 萬、15 坪、含設備，位於中誠街30號。越南小吃店頂讓，經營多年，客源穩定，鄰近工業區及住宅區…`
3. `og:title` and `og:description` use the same strings as the page.
4. **/store-guide description** answers 「頂讓是什麼」 first, reusing the page's own definition, for example: `頂讓是把已在營運的店面，連同客群、設備與租約一起轉手給新老闆。頂讓金怎麼算、買店與頂出 4 步驟流程、常見地雷，第一次接手店面也能一頁看懂。`
5. `npm run test:unit`, `tsc`, eslint and `npm run build` pass.

## Tech Stack

Unchanged from the initiative: Next.js 14.2.4 App Router, TypeScript, Node's built-in test runner for pure functions. No new dependencies.

## Commands

```bash
nvm use
npm run test:unit
npx tsc --noEmit -p .
npx eslint --no-eslintrc -c .eslintrc.json <changed files>
npx prettier --write <changed files>
npm run build        # needs the main checkout's .env symlinked temporarily
npm run dev          # .env.development → mock collections
curl -s localhost:3000/store/<id> | grep -o '<title>[^<]*</title>\|<meta name="description"[^>]*>\|<meta property="og:[a-z]*"[^>]*>'
```

## Project Structure

```
utils/storeMeta.ts                   → NEW pure builders (no runtime @/ imports, like storeCsv.ts)
tests/unit/storeMeta.test.ts         → NEW unit tests
utils/seo.ts                         → storePageTitle / storePageDescription: Store → builder inputs
app/(new)/store/[storeId]/page.tsx   → generateMetadata uses the new helpers
app/(new)/store-guide/page.tsx       → new description
```

## Code Style

Pure builders take already-resolved strings, so tests need no Firestore or `@/` imports. `utils/seo.ts` adapts a `Store` using the existing label maps and `formatPriceDisplay`:

```ts
// * facts first — the part Google always shows — then the seller's own words
export const buildStoreDescription = ({
  placeLabel,
  facts,
  location,
  sellerText,
  isSold,
}: StoreDescriptionInput) => {
  const lead = isSold
    ? `${placeLabel}店面已頂讓成交`
    : `${placeLabel}店面頂讓：${facts.join("、")}`;
  const factsSentence = `${lead}${location ? `，位於${location}` : ""}。`;
  return appendExcerpt(factsSentence, stripEmoji(sellerText), MAX_LENGTH);
};
```

## Testing Strategy

- **Unit (`tests/unit/storeMeta.test.ts`, test-first)**: title for live vs sold, missing city/district/category, 其他 omitted; each fee variant; optional facts present or absent; sold description; emoji stripping; excerpt cutting and the 20-char floor; never longer than 150 characters.
- **Dev server (mock data)**: curl the title, description and og tags for a priced, a 面議, a free-transfer (免頂讓金), a sold and a digital store (unchanged).
- **After deploy (you)**: the 3 example pages in the findings table show the new title and description. GSC CTR is compared 4 weeks later.

## Boundaries

- **Always**: prettier + eslint; unit tests before implementation; one commit per task; push or open a PR only after your review.
- **Ask first**: changing the layout title template (`%s｜頂讓網 Bezold`); touching digital-asset titles; changing /store-guide's title.
- **Never**: invent listing facts; edit seller content in Firestore; noindex store pages as part of this module.

## Success Criteria

- Every physical store page has a template title with 【頂讓】 or 【已頂讓】 and a description that leads with fee, size and address, with no emoji and no mid-sentence 4-character stubs.
- /store-guide description defines 頂讓 in its first sentence.
- Long-term (#103, you check GSC 4 weeks after deploy): 巴地越南小吃 page CTR > 3%, /store-guide CTR > 3%.

## Open Questions

None. All four decisions above were made on 2026-11-07.
