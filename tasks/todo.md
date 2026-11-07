# Tasks: `store-metadata` (SEO #103)

Spec: [`SPEC.md`](../SPEC.md) · Plan: [`tasks/plan.md`](plan.md)

## Task 1: Pure title/description builders + unit tests

**Description:** Test-first, add `utils/storeMeta.ts` with `buildStoreTitle()` and `buildStoreDescription()` (plus an emoji-stripping helper) that take already-resolved strings and return the spec's title and description.

**Acceptance criteria:**

- [x] Title: 【頂讓】 or 【已頂讓】 + name + `｜{city}{district}{categoryLabel}店面頂讓`, with missing parts skipped cleanly
- [x] Description: facts sentence (sold variant without fee), then the emoji-free seller excerpt, ≤ 150 chars, `…` when cut, excerpt dropped when < 20 chars of space remain
- [x] Emoji, pictographs, variation selectors and ZWJ removed; CJK text and full-width punctuation kept

**Verification:**

- [x] `npm run test:unit` — `tests/unit/storeMeta.test.ts` written failing first, then passes; existing tests still pass
- [x] eslint + prettier clean

**Dependencies:** None

**Files likely touched:**

- `utils/storeMeta.ts` (new)
- `tests/unit/storeMeta.test.ts` (new)

**Estimated scope:** S

## Task 2: Store pages use the builders

**Description:** In `utils/seo.ts`, change `storePageTitle()` and add `storePageDescription()` so a physical `Store` is mapped to builder inputs (category label, fee label via `formatPriceDisplay`, 坪, 月租 via `formatPrice`, `EQUIPMENT_LABEL`, `location`, status). Digital assets keep their current title and description. `generateMetadata` uses them for the page and Open Graph.

**Acceptance criteria:**

- [x] Physical store pages render the template title and description in `<title>`, `meta description`, `og:title`, `og:description`
- [x] Digital-asset pages are unchanged
- [x] No other caller of the changed helpers breaks

**Verification:**

- [x] `tsc --noEmit` clean
- [x] Dev server: curl a priced, a 面議, a 免頂讓金, a sold (if mock has one) and a digital store; title, description and og tags match the spec

**Dependencies:** Task 1

**Files likely touched:**

- `utils/seo.ts`
- `app/(new)/store/[storeId]/page.tsx`

**Estimated scope:** S

## Task 3: /store-guide description

**Description:** Replace the /store-guide description with one that defines 頂讓 first, reusing the hero's definition, and mentions the 4-step flow. Title unchanged.

**Acceptance criteria:**

- [ ] The description's first sentence answers 「頂讓是什麼」; the title is unchanged

**Verification:**

- [ ] `curl -s localhost:3000/store-guide | grep -o '<meta name="description"[^>]*>'`

**Dependencies:** None

**Files likely touched:**

- `app/(new)/store-guide/page.tsx`

**Estimated scope:** XS

## Checkpoint: Complete

- [ ] `npm run test:unit`, `tsc`, eslint, `npm run build` clean
- [ ] You review the local commits
- [ ] With your OK: push → PR for #103 (`Refs #103`)
