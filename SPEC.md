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

Module specs are written one at a time, in build order. This file holds the map plus the **current** module's spec, which is replaced when the next module starts.

---

# Module spec: `indexing-fixes` ([#102](https://github.com/v-salvator/bezold/issues/102))

## Objective

GSC reports 22 pages as 「已探索－尚未建立索引」, including /blog, /faq and /store-list. Google knows these pages but isn't crawling them. This module gives the crawler a complete sitemap and more internal paths into these pages, and stops 404 pages from asking to be indexed.

Findings from 2026-11-07 (code on `main` vs live site):

| #102 item                        | Code today                                                                                                       | Live today                                                | Work                           |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------ |
| Blog posts in sitemap            | `app/sitemap.ts` already maps `getAllPostsMeta()` (since 2026-07-09)                                             | `/sitemap.xml` has **0** `/blog/*` URLs                   | Find and fix the runtime cause |
| 404 noindex                      | No `app/not-found.tsx`; 404s inherit the root `robots: index, follow`                                            | `/about` → 404 with `index, follow`, homepage description | Add `app/not-found.tsx`        |
| Nav / footer → blog, faq, guide  | Nav links all three; footer links /blog and /faq, **not** /store-guide                                           | same                                                      | Add 頂讓指南 to footer         |
| Related stores on store page     | None                                                                                                             | none                                                      | New section                    |
| Each post links ≥ 2 posts + list | `Cta` links /store-list on every post; `first-business` and `how-to-pay-takeover-fee` link only **1** other post | same                                                      | Add a 2nd related post to each |
| http 500                         | n/a                                                                                                              | 308, two hops                                             | Manual (see map)               |
| `lang`                           | `zh-Hant`                                                                                                        | same                                                      | `zh-Hant-TW`                   |

**Working hypothesis for the sitemap.** `app/sitemap.ts` revalidates hourly, so on Vercel it is regenerated inside a serverless function. `lib/blog.ts` reads `content/blog/` from disk via `process.cwd()`. If Next's output file tracing doesn't bundle that folder into the sitemap function, `fs.existsSync(BLOG_DIR)` is false and the post list comes back empty. `/blog` (`revalidate = 60`) does list posts live, so tracing evidently works for that route. The difference has to be confirmed before fixing.

### Acceptance criteria

1. **Sitemap**: the cause is identified with evidence (build trace or preview deployment). After the fix, the sitemap of a Vercel preview deployment lists all 6 `/blog/<slug>` URLs, each with `<lastmod>` from `updatedAt`.
2. **404**: an unknown URL returns HTTP 404, and its HTML has `<meta name="robots" content="noindex, follow">` (or `noindex`), a title of `找不到頁面｜頂讓網 Bezold`, and its own description (not the homepage one). The page renders the site shell (`LaunchBanner`, `SiteNav`, `SiteFooter`) with links to `/`, `/store-list`, `/blog`. `notFound()` from `/store/[storeId]` hits the same page.
3. **Footer**: `SiteFooter` links to `/store-guide` (label 頂讓指南).
4. **Related stores**: every physical store page ends with a 「你可能也有興趣」 section (neutral, since same-category top-ups can be in other cities) showing 4–6 other **approved** physical stores, using `StoreCard`:
   - same city first, topped up with same category; never the current store, never sold/pending/draft/digital;
   - section hidden when there are 0 matches;
   - data passes through `omitSellerContact()`; images resolved server-side;
   - uses existing Firestore indexes (no new composite query).
   - Digital-asset pages don't get this section in this module.
5. **Blog**: `first-business` and `how-to-pay-takeover-fee` each list ≥ 2 other `/blog/*` posts in `related`.
6. `<html lang="zh-Hant-TW">`.
7. `npm run build` passes; eslint and prettier are clean on changed files.

## Tech Stack

Next.js 14.2.4 App Router, TypeScript, Firebase Admin SDK (server), CSS Modules (paint) + Tailwind (layout). No new dependencies.

## Commands

```bash
nvm use
npm run dev                      # http://localhost:3000
npm run build                    # also writes .next/server/**/*.nft.json traces
npx eslint --no-eslintrc -c .eslintrc.json <changed files>
npx prettier --write <changed files>

# sitemap trace check (after build)
find .next/server/app -name '*.nft.json' -path '*sitemap*' -exec grep -l 'content/blog' {} \;

# preview / prod checks
curl -s <deployment>/sitemap.xml | grep -c '/blog/'          # expect 6
curl -s -o /dev/null -w '%{http_code}\n' <deployment>/no-such-page   # expect 404
curl -s <deployment>/no-such-page | grep -o '<meta name="robots"[^>]*>'
```

## Project Structure

```
app/sitemap.ts                                  → sitemap (fix lives here or in next.config.js)
next.config.js                                  → outputFileTracingIncludes if tracing is the cause
lib/blog.ts                                     → reads content/blog/*.mdx
app/not-found.tsx                               → NEW root 404 (covers unmatched URLs + notFound())
app/layout.tsx                                  → <html lang>
app/(new)/_components/SiteFooter.tsx            → add 頂讓指南 link
app/(new)/store/[storeId]/page.tsx              → render related stores
app/(new)/store/[storeId]/_components/RelatedStores.tsx (+ .module.css)  → NEW section
firebase/serverUtils/store.ts                   → related-stores query helper (reuse getStores)
content/blog/{first-business,how-to-pay-takeover-fee}.mdx → add a related post
```

## Code Style

Follow the existing server-component pattern. `// *` comments explain why, readable names, `cn()` for conditional classes, CSS module for paint and Tailwind only on bare wrappers:

```tsx
// * same city first, then same category — only approved physical listings,
// * so a sold or pending store never shows up as a live recommendation
export default async function RelatedStores({ store }: { store: Store }) {
  const relatedStores = await getRelatedStores(store);
  if (relatedStores.length === 0) return null;

  return (
    <Section>
      <SectionTitle>你可能也有興趣</SectionTitle>
      <div className={styles.grid}>
        {relatedStores.map((relatedStore) => (
          <StoreCard key={relatedStore.id} {...storeToCard(relatedStore)} />
        ))}
      </div>
    </Section>
  );
}
```

## Testing Strategy

This module doesn't touch Firestore/Storage rules (everything runs on the Admin SDK), so there are no rules tests. Verification:

- **Related-store selection**: a pure function in `utils/` with unit tests in `tests/unit/` (`npm run test:unit`, Node's built-in runner, same setup as `storeCsv.test.ts`), written test-first.
- **Sitemap**: build-trace inspection locally, then curl the Vercel preview deployment. `next start` locally always has the files on disk, so it can't prove the fix.
- **404, footer, related stores, lang**: `npm run dev` + built-in browser preview (`read_page` / `get_page_text`), plus curl for status code and robots meta. Check a store in a city with several listings, one with none (section hidden), and a 面議 store.
- **Blog**: open both edited posts and confirm the 延伸閱讀 links resolve.
- Check dev data first: `.env.development` decides whether the dev server reads mock or prod collections.

## Boundaries

- **Always**: prettier + eslint on every changed file; page-shell pattern on the 404; `omitSellerContact()` on every store that reaches the HTML; no `/new/` in hrefs; commit to the worktree branch and wait for review before pushing or opening the PR.
- **Ask first**: any new Firestore composite index; changing `robots.ts`; editing `vercel.json`, DNS or Vercel settings; adding dependencies; changing the sitemap's priorities or which statuses it includes.
- **Never**: commit to `main`; edit indexes or rules in the Firebase console; deploy; show seller contact in related-store cards; noindex real store pages as a side effect.

## Success Criteria

- Preview deployment: `sitemap.xml` has 11 static + 6 blog + store URLs.
- Unknown URL: 404 + noindex + own title/description.
- Footer links /store-guide; store pages show related stores (or nothing when there are no matches).
- Both thin-linked posts link ≥ 2 posts.
- Long-term (#102, user checks GSC 4–6 weeks after deploy): 「已探索－尚未建立索引」 clearly below 22, and /blog and /faq indexed.

## Open Questions

None. Resolved 2026-11-07:

- **Related-stores heading**: neutral 「你可能也有興趣」.
- **Sitemap fallback** (pre-approved): if file tracing turns out not to be the cause, generate the blog metadata at build time (a JSON module the sitemap imports) instead of reading `content/blog/` at runtime. No further check-in needed before switching.
