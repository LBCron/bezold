# Implementation Plan: `store-metadata` (SEO #103)

Spec: [`SPEC.md`](../SPEC.md) · Tasks: [`tasks/todo.md`](todo.md) · Issue: [v-salvator/bezold#103](https://github.com/v-salvator/bezold/issues/103) (parent [#101](https://github.com/v-salvator/bezold/issues/101))

## Overview

Store pages get titles and descriptions built from a template using the listing's structured data, instead of the seller's text cut off mid-sentence. /store-guide gets a description that defines 頂讓 in its first sentence. This branch is stacked on #110 (`indexing-fixes`).

## Architecture Decisions

- **Pure builders in `utils/storeMeta.ts`** take already-resolved strings (place label, fee label, facts, location, seller text) and have no runtime `@/` imports, so `node --test` can load them. Same pattern as `utils/storeCsv.ts`.
- **`utils/seo.ts` adapts a `Store`** to those inputs using the existing `STORE_CATEGORIES`, `EQUIPMENT_LABEL`, `formatPriceDisplay` and `formatPrice`, so price wording stays the same as on the cards.
- **Digital assets keep their current title and description.** Only the physical path changes.
- **One string for page and Open Graph.** `og:description` drops its separate 200-character cut and uses the same ≤ 150-character description.

## Task List

- [ ] Task 1: Pure title/description builders + unit tests
- [ ] Task 2: Store pages use the builders
- [ ] Task 3: /store-guide description

### Checkpoint: Complete

- [ ] Unit tests, tsc, lint, build clean; dev-server checks on priced / 面議 / free / sold / digital stores
- [ ] You review → push → PR for #103

## Risks and Mitigations

| Risk                                                           | Impact | Mitigation                                                                                                                          |
| -------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Emoji regex misses some symbols or strips CJK punctuation      | Low    | Use `\p{Extended_Pictographic}` + variation selectors / ZWJ only; unit-test with the 蘆洲 listing's ✨🔥 and full-width punctuation |
| Mock data lacks some field combinations                        | Low    | Unit tests cover every combination; dev check covers what mock data has                                                             |
| Stacked on #110: PR diff includes #110 commits until it merges | Low    | Open the PR against `main` and say so in the body; the diff shrinks once #110 merges                                                |

## Open Questions

None.
