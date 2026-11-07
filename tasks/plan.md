# Implementation Plan: remaining SEO/AEO modules (#104, #105, #106, #101 GA)

Spec: [`SPEC.md`](../SPEC.md) · Tasks: [`tasks/todo.md`](todo.md) · Parent: [v-salvator/bezold#101](https://github.com/v-salvator/bezold/issues/101)

## Overview

All five remaining modules ship in one PR, stacked on #111 (`store-metadata`). Build order follows the capability map: shared JSON-LD builders first, because `sell-content` and `store-list-paging` reuse them.

## Architecture Decisions

- **Pure helpers, unit-tested**: `utils/structuredData.ts` (JSON-LD) and `utils/storeListPaging.ts` (page/sort parsing, sorting, slicing). No runtime `@/` imports.
- **FAQ text is type-enforced**: `FaqItem` becomes `{ q, a: string } | { q, a: ReactNode, text: string }`, so a JSX answer can't ship without its schema text.
- **/sell content is server-rendered outside `EmailVerifiedGate`**, so crawlers and signed-out visitors see it.
- **`/llms.txt` is a `force-static` route handler**: generated at build time from `getAllPostsMeta()`, so it never reads files at runtime (unlike the sitemap bug in #110).
- **/store-list sorts and pages on the server**: the client `ResultsArea` gets card data for one page only; sort and page live in the URL; `Pagination` is a new shared primitive.
- **GA**: rename the `source` param to `entry_point`. Values stay the same, so funnels keep their meaning.

## Task List

See `tasks/todo.md` (T1–T12, checkpoints after each module).

## Risks and Mitigations

| Risk                                                            | Impact | Mitigation                                                                                        |
| --------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------- |
| FAQ schema text drifts from the visible JSX answer              | Med    | Type forces `text` next to the JSX; reviewed side by side in the diff                             |
| Server-side sort/paging breaks SearchBar or ActiveFilters       | Med    | Keep URL params as source of truth; keep the hydration effect; test filter + sort + page together |
| Store-list size can only be measured with production data       | Med    | Local per-card estimate; you check `wc -c` after deploy                                           |
| Renaming `source` breaks GA4 reports that use the old dimension | Low    | Same values under `entry_point`; you register the new dimension; documented                       |
| One big PR is slow to review                                    | Med    | One commit per task, grouped by module, so it can be reviewed commit by commit                    |

## Open Questions

None.
