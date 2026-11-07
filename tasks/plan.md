# Implementation Plan: `indexing-fixes` (SEO #102)

Spec: [`SPEC.md`](../SPEC.md) · Tasks: [`tasks/todo.md`](todo.md) · Issue: [v-salvator/bezold#102](https://github.com/v-salvator/bezold/issues/102) (parent [#101](https://github.com/v-salvator/bezold/issues/101))

## Overview

The first module of the #101 SEO initiative. It gets the 6 blog posts into the **live** sitemap (the code already lists them, but production serves 0), gives unknown URLs a real noindex 404, and adds internal links Google can follow: footer → /store-guide, a related-stores section on store pages, and a second related post on the 2 blog posts that link only one. It also sets `lang` to `zh-Hant-TW`. The whole module lands as one PR for #102.

## Architecture Decisions

- **Sitemap: diagnose before fixing.** Hypothesis: when the sitemap is regenerated on Vercel (`revalidate = 3600`), Next's file tracing hasn't bundled `content/blog/`, so `lib/blog.ts` finds no folder and returns `[]`. First fix: `experimental.outputFileTracingIncludes` for the sitemap route. Pre-approved fallback if tracing isn't the cause: generate blog metadata at build time as a JSON module the sitemap imports.
- **Root `app/not-found.tsx`**, not `app/(new)/not-found.tsx`. Only the root file catches unmatched URLs. It also handles `notFound()` from `/store/[storeId]`. The root layout doesn't provide the `(new)` design tokens, so the page wraps itself in the same root class `app/(new)/layout.tsx` uses.
- **Related-store selection is a pure function** in `utils/` (unit-tested). The Firestore part reuses `getStores()`, whose city and category queries already have composite indexes. No new index, no rules change.
- **Sign images only for the stores shown.** `getStores()` signs images for every match. To avoid signing ~20 covers to show 6, add `limit` / `excludeId` options that apply in memory **before** `resolveStoreImages` (the same place the status filter already runs).
- **Reuse `FeaturedListings`** for the section UI. It already takes `stores`, `title`, `sub`, `moreHref` and wraps `Section` + `StoreCard`, so no new component unless its props don't fit.

## Dependency Graph

```
T1 sitemap fix ─────────────┐
T2 not-found page ──────────┤
T3 footer link + lang ──────┼──→ Checkpoint A (build) ──→ T4 → T5 ──→ T6 ──→ Checkpoint B ──→ PR (asks first)
                            │      T4 pickRelatedStores (pure + tests)
                            │      T5 related stores on store page (needs T4)
                            │      T6 blog related posts
```

T1–T3 and T6 are independent. T5 needs T4. T1 goes first because it's the riskiest.

## Task List

### Phase 1: Site-wide indexing

- [ ] Task 1: Get blog posts into the regenerated sitemap
- [ ] Task 2: Root 404 page with noindex
- [ ] Task 3: Footer 頂讓指南 link + `lang="zh-Hant-TW"`

### Checkpoint A

- [ ] `npm run build` clean; trace contains `content/blog`; 404 meta verified locally

### Phase 2: Internal links

- [ ] Task 4: `pickRelatedStores()` pure function + unit tests
- [ ] Task 5: Related-stores section on store pages
- [ ] Task 6: Second related post on 2 blog posts

### Checkpoint B (complete)

- [ ] All spec acceptance criteria met locally; `npm run test:unit` + build + lint clean
- [ ] User reviews the local commits → OK to push → Vercel preview: `sitemap.xml` has 6 `/blog/` URLs → PR for #102

## Risks and Mitigations

| Risk                                                                                              | Impact | Mitigation                                                                                                                       |
| ------------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Tracing isn't the cause of the empty blog list                                                    | Med    | Pre-approved fallback: build-time JSON module                                                                                    |
| Sitemap fix can only be proven on Vercel; that needs a push                                       | Med    | Push only after you've reviewed the commits; verify on the preview before opening the PR                                         |
| `metadata` export on `not-found.tsx` behaves differently in Next 14.2.4                           | Med    | Verify the rendered `<meta name="robots">` with curl; if ignored, look for another supported way before touching the root layout |
| Store pages are dynamic, so related stores add 1–2 Firestore reads + up to 6 image signs per view | Low    | `limit` before signing; image URLs are already cached in memory (`downloadUrlCache`); add `unstable_cache` only if reads matter  |
| Dev server may read prod data                                                                     | Low    | Check `NEXT_PUBLIC_ENV_VERSION` in `.env.development` before browsing                                                            |

## Open Questions

None. The heading (「你可能也有興趣」) and the sitemap fallback were settled in the spec.
