# Tasks: `indexing-fixes` (SEO #102)

Spec: [`SPEC.md`](../SPEC.md) · Plan: [`tasks/plan.md`](plan.md)

## Task 1: Get blog posts into the regenerated sitemap

**Description:** Confirm why production `sitemap.xml` has no `/blog/*` URLs although `app/sitemap.ts` maps `getAllPostsMeta()`, then fix it. Start with the tracing hypothesis: after `npm run build`, check whether the sitemap route's `.nft.json` lists `content/blog/*.mdx`. If it doesn't, add `experimental.outputFileTracingIncludes` for the sitemap route. If tracing isn't the cause, switch to the pre-approved fallback (build-time JSON of blog metadata, imported by the sitemap).

**Acceptance criteria:**

- [x] Root cause written down with evidence (trace contents before/after, or the fallback's reason) for the PR description
- [x] After the fix, the sitemap route's trace (or bundle) includes the blog metadata source
- [x] Each blog URL keeps `lastModified` from `updatedAt`

**Verification:**

- [x] `npm run build` succeeds
- [x] `find .next/server/app -name '*.nft.json' -path '*sitemap*' -exec grep -l 'content/blog' {} \;` prints the sitemap trace (tracing route)
- [ ] Final proof at Checkpoint B: preview deployment `curl -s <preview>/sitemap.xml | grep -c '/blog/'` → 6

**Dependencies:** None

**Files likely touched:**

- `next.config.js`
- `app/sitemap.ts` (only if the fallback is needed, plus a generator under `scripts/` and `package.json` prebuild)

**Estimated scope:** XS (S with fallback)

## Task 2: Root 404 page with noindex

**Description:** Add `app/not-found.tsx` so unmatched URLs and `notFound()` calls render a branded 404 that tells crawlers not to index it. It uses the page shell (`LaunchBanner`, `SiteNav`, `SiteFooter`), a short message, and links to `/`, `/store-list`, `/blog`. Wrap it in the `(new)` root class so the design tokens apply.

**Acceptance criteria:**

- [ ] `/no-such-page` and `/store/doesNotExist` return HTTP 404
- [ ] HTML has a robots meta with `noindex`, title `找不到頁面｜頂讓網 Bezold`, and its own description (not `SITE_DESCRIPTION`)
- [ ] Renders with the site's fonts and colors; links to `/`, `/store-list`, `/blog` work

**Verification:**

- [ ] `curl -s -o /dev/null -w '%{http_code}' localhost:3000/no-such-page` → 404
- [ ] `curl -s localhost:3000/no-such-page | grep -o '<meta name="robots"[^>]*>'` shows `noindex`; same for `/store/doesNotExist`
- [ ] Browser preview screenshot looks like the rest of the site (desktop + mobile)
- [ ] eslint + prettier clean

**Dependencies:** None

**Files likely touched:**

- `app/not-found.tsx` (new)
- `app/not-found.module.css` (new)

**Estimated scope:** S

## Task 3: Footer 頂讓指南 link + `lang="zh-Hant-TW"`

**Description:** Add a 頂讓指南 → `/store-guide` link to `SiteFooter` (next to 創業部落格 / 常見問題) and change `<html lang>` in the root layout to `zh-Hant-TW`.

**Acceptance criteria:**

- [ ] Footer on every `(new)` page links `/store-guide` with the label 頂讓指南, styled like its neighbors
- [ ] `<html lang="zh-Hant-TW">`

**Verification:**

- [ ] `curl -s localhost:3000/ | grep -o 'lang="[^"]*"\|href="/store-guide"'` shows both
- [ ] Footer screenshot (desktop + mobile), no layout shift
- [ ] eslint + prettier clean

**Dependencies:** None

**Files likely touched:**

- `app/(new)/_components/SiteFooter.tsx`
- `app/layout.tsx`

**Estimated scope:** XS

## Checkpoint A: After Tasks 1–3

- [ ] `npm run build` succeeds; sitemap trace contains blog sources
- [ ] 404 noindex + footer link + lang verified locally
- [ ] Local commit per task

## Task 4: `pickRelatedStores()` pure function + unit tests

**Description:** Test-first, add a pure function in `utils/` that takes the current store, same-city candidates and same-category candidates, and returns up to `limit` (default 6) related stores. Same city first, then same category, deduped, never the current store, only approved physical listings. Add `limit` / `excludeId`-style options to `getStores()` that apply in memory before image signing, so the page signs only the covers it shows.

**Acceptance criteria:**

- [ ] Same-city stores come first, topped up from same-category stores, no duplicates, max `limit`
- [ ] Excludes the current store and anything not `APPROVED` or digital
- [ ] Returns `[]` when nothing matches; stores without `city` or `category` skip that source

**Verification:**

- [ ] `npm run test:unit` — new `tests/unit/relatedStores.test.ts` passes (written failing first)
- [ ] Existing `storeCsv` tests still pass; eslint + prettier clean

**Dependencies:** None

**Files likely touched:**

- `utils/relatedStores.ts` (new)
- `tests/unit/relatedStores.test.ts` (new)
- `firebase/serverUtils/store.ts` (`getStores` options + `getRelatedStores` wrapper)

**Estimated scope:** S

## Task 5: Related-stores section on store pages

**Description:** Render 「你可能也有興趣」 at the bottom of physical store pages using `getRelatedStores()` from Task 4 and `FeaturedListings` (or a thin wrapper if its props don't fit). Data passes through `omitSellerContact()`. Digital-asset pages and stores with 0 matches render nothing.

**Acceptance criteria:**

- [ ] Physical store page shows 4–6 related store cards linking to `/store/<id>`, never the current store
- [ ] Section absent on digital-asset pages and when there are no matches
- [ ] Served HTML of the section has no seller phone, LINE, Threads or email

**Verification:**

- [ ] Browser preview: a store in a busy city (cards shown), a store with no matches (hidden), a 面議 store, a digital asset (hidden)
- [ ] `curl -s localhost:3000/store/<id>` → no seller contact strings in the related cards
- [ ] No new Firestore index error in the server logs; `npm run build` succeeds

**Dependencies:** Task 4

**Files likely touched:**

- `app/(new)/store/[storeId]/page.tsx`
- `app/(new)/store/[storeId]/_components/RelatedStores.tsx` (new, only if a wrapper is needed)

**Estimated scope:** S

## Task 6: Second related post on 2 blog posts

**Description:** `first-business` and `how-to-pay-takeover-fee` each link only one other post in frontmatter `related`. Add a relevant second `/blog/*` post to each, keeping their existing entries.

**Acceptance criteria:**

- [ ] Both posts list ≥ 2 `/blog/*` entries in `related`; all 6 posts now do
- [ ] Every `related` href resolves (no 404)

**Verification:**

- [ ] `grep -A8 '^related' content/blog/*.mdx | grep -c 'href: "/blog/'` per post ≥ 2
- [ ] Open both posts in the preview; 延伸閱讀 links work

**Dependencies:** None

**Files likely touched:**

- `content/blog/first-business.mdx`
- `content/blog/how-to-pay-takeover-fee.mdx`

**Estimated scope:** XS

## Checkpoint B: Complete

- [ ] Every spec acceptance criterion met locally
- [ ] `npm run test:unit`, `npm run build`, eslint, prettier clean
- [ ] User reviews the local commits
- [ ] With the user's OK: push branch → Vercel preview `sitemap.xml` has 6 `/blog/` URLs → open PR for #102 (`Closes #102`)
