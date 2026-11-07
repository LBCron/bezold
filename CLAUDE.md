# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev     # start Next.js dev server (port 3000)
npm run build   # production build
npm run lint    # ESLint via next/core-web-vitals
npm run test:rules  # Firestore + Storage rules tests (emulators, needs Java 21)
```

The only tests are the security-rules tests in `tests/rules/` (Node's built-in `node --test`); app code has no test runner. Node version is pinned in `.nvmrc` (24) — run `nvm use` first.

## Environment

`.env` / `.env.development` (gitignored). `NEXT_PUBLIC_ENV_VERSION=dev` points at the mock collections; anything else uses prod. Client SDK reads `NEXT_PUBLIC_FIREBASE_*`; Admin SDK reads `FIREBASE_SERVER_*`. `NEXT_PUBLIC_APP_URL` builds absolute URLs (sitemap, robots, metadata, JSON-LD), and its hostname is the GA4 hostname filter for admin store analytics. `GA4_PROPERTY_ID` (server-only) enables `/api/admin/store-analytics`, which reads GA4 with the Admin SDK service account — see `docs/analytics-events.md` → Admin reporting.

## Architecture

**Bezold** is a Next.js 14 (App Router) marketplace for buying/selling startup businesses, targeting Taiwan. TypeScript throughout.

**Stack**: Next.js 14 · TypeScript · Jotai (state) · Tailwind CSS + CSS Modules · Ant Design 5 · Firebase (Firestore, Auth, Storage) · Motion.js

### Route groups

| Group        | Purpose                                                                                      |
| ------------ | -------------------------------------------------------------------------------------------- |
| `app/(new)/` | Primary public-facing site (root `/`) — home, browse, store detail, auth, sell, legal, guide |
| `app/admin/` | Admin dashboard (Firebase custom-claims gating)                                              |
| `app/api/`   | Route handlers (admin auth, stores)                                                          |

### Key directories

- `atoms/` — Jotai atoms. `SearchFilterAtom.ts` owns filter state (`cityAtom`, `tagAtom`, `amountFilterAtom`, `categoryAtom`); `BuyerClubAtom.ts` owns the buyer-club popup (`buyerClubOpenAtom`, `buyerClubSourceAtom`).
- `components/refactored/` — Shared design-system primitives (Button, Pill, Card, FormField, StoreCard, SectionTitle, Category, Link, Dropdown, MultiDropdown, TrackedLink). Each has a co-located `*.module.css`. **Before building any UI for a new route, check here first for reusable primitives.** When a new component built inside a route is generic enough (no route-specific logic or data), extract it here so future routes can reuse it.
- `app/(new)/_components/` — Site-wide sections and page-shell pieces (`SiteNav`, `SiteFooter`, `LaunchBanner`, `Section`, legal page parts).
- `components/animated/`, `components/SearchFilter/` — Feature-specific component groups.
- `content/blog/*.mdx` — Blog posts, read server-only by `lib/blog.ts`. `draft: true` posts are hidden only in production.
- `docs/analytics-events.md` — GA4 event reference; custom events go through `trackEvent()` from `firebase/client.ts`.
- `firebase/client.ts` — exports `db`, `storage`, `auth` (browser SDK).
- `firebase/server.ts` — exports `db`, `bucket`, `adminAuth` (Admin SDK, server-only).
- `hooks/` — `useAdminAuth` (Firebase auth + admin token), `useStoreAnalytics` (admin GA4 store metrics), `useCategoryKey`, `useAdminMenuKey`.
- `types/` — `Store`, `StoreDoc`, `User`, `StoreTag`, `StoreCategory`, `StoreStatus` interfaces.
- `lib/utils.ts` — exports `cn()` (clsx + tailwind-merge). `utils/className.ts` is a legacy duplicate with no importers; don't use it.
- `mocks/` — Mockaroo-generated mock data for development.

### Firebase collections

Environment variables switch between dev and prod Firestore collections (`mockStore`/`mockUser` vs `prodStore`/`prodUser`). Never hardcode collection names — use `COLLECTIONS.STORE` / `COLLECTIONS.USER` from `firebase/constants.ts`.

Queries that combine `where("field", "==", value)` with `orderBy("otherField")` require a **composite Firestore index**. Indexes live in `firestore.indexes.json` (repo root) — add a new composite query's index there in the same PR, for both the `mock*` and `prod*` collections. Never create or delete indexes in the Firebase console.

### Firebase Storage images

Images in Firestore are stored as raw Storage paths (e.g. `mockStore/{storeId}/1.png`), **not** download URLs.

- **Client components**: resolve with `getImageByPath()` / `getImagesByPath()` from `firebase/clientUtils/image.ts` (wraps `getDownloadURL`) before passing to `<Image src>`. Passing the raw path directly causes a `next/image` parse error. On failure these return the string `"no-image"`, not a URL — guard before rendering.
- **Server components**: use `getImagesByPath()` from `firebase/serverUtils/image.ts`, which resolves via Admin SDK signed URLs.

### Firestore write constraints

`updateDoc` rejects `undefined` values — Firestore will throw at runtime if any field is `undefined`. Always pass `""` for optional string fields that are empty, never `field || undefined`.

### API auth & seller contact

- Admin routes: client calls `authedFetch(idToken, …)` (`lib/authedFetch.ts`); server checks with `verifyAdminToken`. Member-only routes use `verifyUserToken` (any signed-in user).
- Seller contact (`userInfo` phone/LINE/Threads/email) must never reach the public payload — pass stores through `omitSellerContact()` (`utils/store.ts`) in any public page or endpoint. The only read path is `GET /api/stores/[storeId]/contact` (member-gated, returns empty for sold listings).

### Security rules

`firestore.rules` and `storage.rules` (repo root) are the source of truth — never edit rules in the Firebase console. The Admin SDK (server components, API routes, scripts) bypasses them; they only govern the browser SDK, which is used by sellers on their own data and by admins (`admin` custom claim).

- **A new client-side read or write needs a rule and a test.** Add an `assertSucceeds` test in `tests/rules/` that mirrors the exact payload the code sends — otherwise the call fails with `permission-denied` in production. Sellers can only write the fields listed in `sellFormKeys()` / `ownerEditableKeys()`, so a new seller-editable `Store` field must be added there too.
- Store photo limits (JPG/PNG/WebP/GIF, < 5 MB) live in both `constant/image.ts` and `isAllowedImage()` in `storage.rules` — change them together.
- Deploy (the user runs it): `npx firebase deploy --only firestore:rules,firestore:indexes,storage --project bezold`. One deploy covers dev and prod (same project). Never add `--force` — it deletes any index missing from `firestore.indexes.json`; if the CLI asks to delete an index, answer No.

## Styling rules

**CSS Modules handle paint; Tailwind handles layout — never mix both on the same element.**

- If a JSX element has a `styles.xxx` class, all its visual styles go in the CSS module. Do not add Tailwind utilities alongside it.
- Tailwind may be used freely on elements that carry no CSS module class (plain layout wrappers, spacing divs, responsive containers).
- Use CSS nesting syntax (`& .child`, `&.modifier`) — all existing modules already do this.
- CSS variable tokens (`--ink`, `--paper`, `--accent`, `--hand`, `--display`, `--mono`) are defined on the root wrapper div and cascade to all children — reference via `var(--token)`, never redefine per component.
- The `app/(new)/` route group defines an extended token set in `app/(new)/layout.module.css`: `--ink-2`, `--paper-2`, `--paper-3`, `--accent-2`, `--accent-3`, `--muted`, `--note`, `--brand`. Use these when building any page under `app/(new)/`.
- Never use `overflow: hidden` on a container that holds `<Dropdown>` or any other absolutely-positioned menu — the menu will be clipped. Apply `border-radius` to the child elements directly instead.
- When a CSS module class is applied to an `<a>` element, always add `text-decoration: none; color: inherit` to that class — browser link defaults otherwise override the design system styles.

## Component conventions

- **Page-level sections** → `app/<route>/_components/ComponentName.tsx` + co-located `ComponentName.module.css`. For complex sections use a folder: `ComponentName/index.tsx` + `ComponentName/ComponentName.module.css`.
- **Sub-components** (FaqItem, Step, WhyUsItem, etc.) go at the bottom of the parent file unless reused elsewhere or the file becomes hard to navigate.
- Use `cn()` from `@/lib/utils` for all conditional class name composition — never string template literals.
- Ant Design is configured with primary color `#ff4a31` via `ConfigProvider` in the root layout.
- **Optionally-clickable primitives** — shared components that are sometimes links and sometimes static accept `href?: string` and render as `<a>` when provided, `<div>` otherwise. See `Category.tsx` and the `District` sub-component in `Districts.tsx` for the established pattern.

### Page shell pattern

Every page under `app/(new)/` follows this structure:

```tsx
<>
  <LaunchBanner />
  <SiteNav activeLink="頁面名稱" /> {/* label must match navLinks exactly */}
  <div className="flex-1">
    <SectionA />
    <SectionB />
    ...
  </div>
  <SiteFooter />
</>
```

- Pass `activeLink` matching the **exact label string** from the `navLinks` array in `SiteNav.tsx` — this highlights the current page.
- The inner wrapper must be `<div className="flex-1">` (or omitted entirely) — **never** wrap sections in a `max-width` constrained frame div. The `Section` component handles its own full-width background colors; a constrained wrapper causes dark/alt sections to render as floating boxes instead of full-width bands.

### Route group URL paths

`app/(new)/` is the primary site served at root paths — `/sell`, `/my-listings`, `/store-list`, `/faq`, etc. The `/new/` segment is a Next.js route group name only and never appears in URLs. Never include `/new/` in `router.push`, `href`, or `redirect` query param values.

### Adding fields to the Store type

Any new field on `Store` / `StoreDoc` requires updating **five** places:

1. `app/(new)/sell/_components/SellForm.tsx` — public sell form inputs + submit payload
2. `app/admin/store/create/StoreBaseForm.tsx` — admin create form
3. `app/admin/store/edit/[storeId]/page.tsx` — admin edit form + `handleUpdateStore` payload (use conditional spreading to avoid writing `undefined` via `updateDoc`)
4. `utils/store.ts` `storeToCard()` — if the field should appear on store list cards
5. `firestore.rules` — add it to `sellFormKeys()` (sellers set it on `/sell`) and/or `ownerEditableKeys()` (sellers edit it on `/my-listings`), plus a test in `tests/rules/stores.test.ts`. Admin-only fields need no rule change.

### Search filter state pattern

URL params are the source of truth for filter state in `/store-list`. Two rules:

1. **Navigation into store-list** — always build a `URLSearchParams` object and call `router.push('/store-list?...')`. Never write to Jotai atoms cross-page. Supported params: `city`, `category`, `tag`, `amountMin`, `amountMax`.

2. **SearchBar hydration** — `SearchBar.tsx` runs a `useEffect([], [])` on mount that reads `useSearchParams()` and sets `cityAtom`, `tagAtom`, `categoryAtom`, `amountFilterAtom` so the dropdowns reflect the current URL. This must be preserved whenever SearchBar is modified.

## Pull requests

### Before/after screenshots

Any PR that changes what a page shows (UI, layout, or user-facing copy) gets before/after screenshots in its description. Use the `before-and-after` skill: capture with `agent-browser`, format with its `format.mjs`, upload with `gh pr edit --attach`. Changes with nothing to look at (`/llms.txt`, metadata, logic) need none.

- **Before = the base branch, served on its own port.** `git worktree add --detach <scratchpad>/before-main origin/main`, symlink this checkout's `node_modules` into it, copy `.env.development`, and run `npx next dev -p 3001` there; this branch stays on port 3000. Remove the worktree afterwards.
- **Capture sections, not full pages.** Element screenshots (`agent-browser screenshot <selector>`) come out blank below the first viewport on this site. Instead, set the viewport to the section's height plus padding, scroll the section to the top, wait ~1.5 s for the scroll-in animation, then take a plain viewport screenshot. Use `set viewport <w> <h> 2` for sharp CJK text, and include a 375 px mobile shot when layout could wrap.
- **Locating a section by text**: skip `<script>` elements. Next.js inlines the page payload in scripts, so a text search otherwise matches those first.
- **`/sell` while signed out**: the page redirects to the login form client-side, but the guide is in the server HTML. Block scripts with `agent-browser network route "**/*" --abort --resource-type script` before opening it.
- **Placement**: the formatter appends its marked block to the end of the body. To place it after `## Summary` and before `## Test plan`, first insert an empty `<!-- before-and-after:start -->` / `<!-- before-and-after:end -->` pair there; later runs replace the block in place.
- Never commit the captures. Check that both images in a pair have the same pixel size and that no `./captures/` path remains in the published body.
