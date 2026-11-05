# Spec: Contact email in the site footer (金流申請)

## Objective

The payment provider we are applying to (金流申請) requires the website to show a contact email. Today the site only shows the LINE support account, so the application can't pass review.

Show **hello@bezold.com.tw** on every page by adding it to `SiteFooter`, which renders on `/` and every other page under `app/(new)/`. A reviewer opening the homepage must be able to read the full address as plain text, without clicking or hovering.

Also add the address to the homepage `Organization` JSON-LD so search engines get the same contact point.

Users:

- **Payment provider reviewer**: opens the homepage, scrolls to the footer, sees the email.
- **Visitors**: can click the address to open their mail app (`mailto:`).

Out of scope: company name, 統一編號, phone, and address (the provider only asks for email); a contact form; a new contact page.

## Tech Stack

Next.js 14 App Router, TypeScript, CSS Modules (paint) + Tailwind (layout). No new dependencies.

## Commands

```bash
nvm use
npm run dev    # http://localhost:3000
npm run build
npx eslint --no-eslintrc -c .eslintrc.json "app/(new)/_components/SiteFooter.tsx" "app/(new)/page.tsx" constant/contact.ts
npx prettier --write <changed files>
```

## Project Structure

| File                                          | Change                                                                                                            |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `constant/contact.ts` (new)                   | `export const CONTACT_EMAIL = "hello@bezold.com.tw";` — one source for the address, next to `constant/socials.ts` |
| `app/(new)/_components/SiteFooter.tsx`        | Add a 客服信箱 block in the brand column, directly under the LINE box                                             |
| `app/(new)/_components/SiteFooter.module.css` | Style for the email block (`.email`), matching `.line` (mono 11px, `#cfc8b8`, address in `var(--paper)`)          |
| `app/(new)/page.tsx`                          | Add `email: CONTACT_EMAIL` to the `Organization` JSON-LD                                                          |

## Code Style

Footer markup, following the existing LINE block:

```tsx
import { CONTACT_EMAIL } from "@/constant/contact";

<div className={styles.email}>
  客服信箱
  <br />
  <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
</div>;
```

```css
.email {
  margin-top: 10px;
  font-family: var(--mono);
  font-size: 11px;
  color: #cfc8b8;

  & a {
    text-decoration: none;
    color: var(--paper);
    font-weight: 700;

    &:hover {
      text-decoration: underline;
    }
  }
}
```

- The `<a>` inside the module class sets `text-decoration` and `color` (CLAUDE.md rule for links).
- No Tailwind on elements that carry `styles.*`.
- The visible text is the full address, not a label like 「寫信給我們」.

## Testing Strategy

The app has no test runner and this change touches no security rules, so verification is manual in the browser preview:

1. `/` desktop width: footer shows 客服信箱 + `hello@bezold.com.tw` under the LINE box.
2. `/` at 375px (mobile): the address is fully visible, no overflow or wrapping mid-address.
3. Another page (e.g. `/faq`): the same footer email is there.
4. The link's `href` is `mailto:hello@bezold.com.tw`.
5. View source on `/`: the Organization JSON-LD contains `"email":"hello@bezold.com.tw"`.
6. `npm run build` and eslint pass; prettier run on changed files.

## Boundaries

- **Always:** keep the address in `constant/contact.ts` and import it; run prettier on changed files; verify in the preview before handing over for review.
- **Ask first:** adding any other business details (company name, 統編, phone, address); changing the LINE block or footer column layout; adding a GA4 event for email clicks.
- **Never:** show `bezoldtw@gmail.com` on the site; touch DNS or email forwarding settings; commit before the user reviews.

## Success Criteria

- [ ] `hello@bezold.com.tw` is visible as plain text in the footer on `/` and on other `app/(new)/` pages, at desktop and 375px widths.
- [ ] Clicking it opens `mailto:hello@bezold.com.tw`.
- [ ] Homepage Organization JSON-LD includes `email: "hello@bezold.com.tw"`.
- [ ] The address is defined once, in `constant/contact.ts`.
- [ ] Build and lint pass.

## Open Questions

None. Placement, address, scope (email only), and JSON-LD were confirmed on 2026-11-04.
