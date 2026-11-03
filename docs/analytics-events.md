# Analytics Events

## Overview

The site uses **Firebase Analytics (GA4)**. Initialization is browser-only and
lazy — see [`firebase/client.ts`](../firebase/client.ts) (`getAnalyticsClient`,
`trackEvent`). Page views are sent automatically by
[`components/AnalyticsTracker.tsx`](../components/AnalyticsTracker.tsx), mounted
once in the root layout. All custom events go through the `trackEvent()` helper,
which safely no-ops on the server and on unsupported browsers.

`AnalyticsTracker` is the **only** source of `page_view`. Analytics is initialized
with `send_page_view: false` so gtag doesn't also send one on load. In the GA4
console, keep Enhanced measurement → Page views → "Page changes based on browser
history events" **off**, or every client-side navigation is counted twice.

---

## Event reference

| Event                          | When it fires                                                                                     | Parameters                                                   | Fired from                                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `page_view`                    | Every client-side route change (App Router). Excludes `/admin/*`.                                 | `page_path`, `page_location`, `page_title`                   | [`AnalyticsTracker.tsx`](../components/AnalyticsTracker.tsx)                                       |
| `sell_cta_click`               | User clicks any "免費刊登" CTA                                                                    | `cta_location`                                               | See CTA table below                                                                                |
| `store_listing_submit`         | A store listing is **successfully created** (after the Firestore write)                           | `store_id`, `category`, `city`, `listing_type`               | [`SellForm.tsx`](<../app/(new)/sell/_components/SellForm.tsx>)                                     |
| `store_listing_edit`           | A store listing is **successfully updated** (after the Firestore write)                           | `store_id`, `category`, `city`, `listing_type`               | [`EditListingForm.tsx`](<../app/(new)/my-listings/edit/[storeId]/_components/EditListingForm.tsx>) |
| `sign_up`                      | An account is **successfully created** (auth + user doc)                                          | `method` (`"email"`), `source`                               | [`signup.ts`](../lib/auth/signup.ts) (every signup surface)                                        |
| `verification_email_sent`      | A verification email is sent (signup or resend)                                                   | `trigger`, `source`                                          | [`verification.ts`](../lib/auth/verification.ts)                                                   |
| `email_verified`               | The first time this page session sees the account flip to verified                                | `detected_by` (`page_load` / `manual_check`)                 | [`useEmailVerification.ts`](../hooks/useEmailVerification.ts)                                      |
| `newsletter_view`              | The homepage newsletter block scrolls into view                                                   | `location` (`"home_after_hero"`)                             | [`Newsletter.tsx`](<../app/(new)/_components/Newsletter.tsx>)                                      |
| `acceleration_cta_click`       | User clicks any 頂讓加速包 (acceleration package) CTA                                             | `plan`                                                       | See CTA table below                                                                                |
| `editor_pick_guide_click`      | User clicks a link to the 編輯精選 rules page (`/policy/editor-pick`)                             | `location`                                                   | See location table below                                                                           |
| `editor_pick_extend_click`     | On the 編輯精選 page, user clicks "了解延長精選" (→ LINE)                                         | —                                                            | [`EpExposure.tsx`](<../app/(new)/policy/editor-pick/_components/EpExposure.tsx>)                   |
| `editor_pick_cta_click`        | On the 編輯精選 page, user clicks the final CTA "前往我的刊登"                                    | `cta_location` (`"final"`)                                   | [`EpFinalCta.tsx`](<../app/(new)/policy/editor-pick/_components/EpFinalCta.tsx>)                   |
| `buyer_club_popup_impression`  | The buyer club popup opens, however it was opened                                                 | `source`                                                     | [`BuyerClubPopup.tsx`](<../app/(new)/store/[storeId]/_components/BuyerClubPopup.tsx>)              |
| `buyer_club_popup_dismiss`     | The popup is closed without signing up                                                            | `source`                                                     | [`BuyerClubPopup.tsx`](<../app/(new)/store/[storeId]/_components/BuyerClubPopup.tsx>)              |
| `contact_gate_view`            | A logged-out visitor sees the locked seller contact block (once per page view)                    | `store_id`                                                   | [`SellerContactGate.tsx`](<../app/(new)/store/[storeId]/_components/SellerContactGate.tsx>)        |
| `contact_gate_click`           | One of the three locks on the seller contact block is clicked                                     | `store_id`, `trigger`                                        | [`SellerContactGate.tsx`](<../app/(new)/store/[storeId]/_components/SellerContactGate.tsx>)        |
| `seller_contact_phone`         | A **signed-in** member taps 「撥打賣家電話」 (unlocked)                                           | `store_id`                                                   | [`SellerContactGate.tsx`](<../app/(new)/store/[storeId]/_components/SellerContactGate.tsx>)        |
| `seller_contact_line`          | A **signed-in** member taps 「加 LINE 聯繫」 (unlocked)                                           | `store_id`                                                   | [`SellerContactGate.tsx`](<../app/(new)/store/[storeId]/_components/SellerContactGate.tsx>)        |
| `seller_contact_threads`       | A **signed-in** member taps 「到 Threads 私訊賣家」 (unlocked)                                    | `store_id`                                                   | [`SellerContactGate.tsx`](<../app/(new)/store/[storeId]/_components/SellerContactGate.tsx>)        |
| `digital_inquiry_click`        | 「我有興趣，想申請了解」 is clicked on a digital asset (logged out it opens the buyer club popup) | `store_id`, `signed_in`                                      | [`InquiryCta.tsx`](<../app/(new)/store/[storeId]/_components/InquiryCta.tsx>)                      |
| `digital_inquiry_submit`       | A member's digital-asset inquiry is **successfully saved** (POST 2xx)                             | `store_id`, `has_message`                                    | [`InquiryCta.tsx`](<../app/(new)/store/[storeId]/_components/InquiryCta.tsx>)                      |
| `digital_launch_threads_click` | 「追蹤 Threads，搶先看最新消息」 on a 數位資產 pre-launch teaser (opens Threads in a new tab)     | `location` (same values as the teaser `cta_location`s below) | [`LaunchCtas.tsx`](<../app/(new)/_components/DigitalAssetsLaunch/LaunchCtas.tsx>)                  |

> Conversion events (`store_listing_submit`, `sign_up`) fire **only on success**,
> so failed or invalid attempts are not counted.

### Buyer club `source` / `contact_gate_click` `trigger` values

One popup serves two jobs: the daily invitation to join the buyer club, and the
unlock step for a seller's contact details. `source` is what separates them —
in GA4 it answers "does the contact gate convert better than the auto-open?".

| Value                    | Where it comes from                                |
| ------------------------ | -------------------------------------------------- |
| `auto`                   | The popup's once-per-day auto-open                 |
| `url_force`              | `?modal=buyer-club` (paid ad landings)             |
| `fab`                    | The floating button shown after a dismiss          |
| `contact_gate_blur`      | The lock over the blurred contact lines            |
| `contact_gate_cta_phone` | The locked "撥打賣家電話" button                   |
| `contact_gate_cta_line`  | The locked "加 LINE 聯繫" button                   |
| `digital_inquiry`        | A digital asset's 「我有興趣」 button (logged out) |

The same three `contact_gate_*` values are the `trigger` on
`contact_gate_click`, and a signup that starts there carries them on `sign_up`
as `source` — so the funnel view → click → sign_up can be read per entry point.

---

### Email verification — `verification_email_sent` / `email_verified`

The funnel `sign_up` → `verification_email_sent` (`trigger: "signup"`) →
`email_verified` shows how many new accounts finish verifying.

| Parameter     | Value               | Meaning                                                                       |
| ------------- | ------------------- | ----------------------------------------------------------------------------- |
| `trigger`     | `signup`            | Sent automatically right after the account was created                        |
| `trigger`     | `resend`            | The user pressed 「重新寄送驗證信」                                           |
| `source`      | _signup `source`_   | With `trigger: "signup"`, the same `source` as that account's `sign_up` event |
| `source`      | `verify_email_page` | Resent from `/verify-email`                                                   |
| `source`      | `buyer_club_popup`  | Resent from the buyer club popup's check-your-inbox step                      |
| `source`      | `sell_gate`         | Resent from the gate on `/sell`                                               |
| `source`      | `my_listings_gate`  | Resent from the gate on `/my-listings`                                        |
| `source`      | `edit_listing_gate` | Resent from the gate on `/my-listings/edit/[storeId]`                         |
| `detected_by` | `page_load`         | Noticed by the automatic re-check (page load or returning to the tab)         |
| `detected_by` | `manual_check`      | Noticed when the user pressed 「我已完成驗證」                                |

---

### `sell_cta_click` — `cta_location` values

| `cta_location`          | Placement                                                     | Component                                                                                      |
| ----------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `nav`                   | Nav bar "＋ 限時免費刊登" button                              | [`SellButton.tsx`](<../app/(new)/_components/SellButton.tsx>)                                  |
| `hero`                  | Homepage hero "立即免費刊登" link                             | [`HeroSplit/index.tsx`](<../app/(new)/_components/HeroSplit/index.tsx>)                        |
| `seller_cta_section`    | "搶早鳥免費刊登" section button                               | [`SellerCta.tsx`](<../app/(new)/_components/SellerCta.tsx>)                                    |
| `store_example_banner`  | Store-example page banner link                                | [`ExampleBanner.tsx`](<../app/(new)/store-example/_components/ExampleBanner.tsx>)              |
| `my_listings_empty`     | My-listings empty-state link                                  | [`MyListingsContent.tsx`](<../app/(new)/my-listings/_components/MyListingsContent.tsx>)        |
| `home_digital_assets`   | Homepage 04 「我也有數位資產想刊登 ↗」                        | [`DigitalAssets/index.tsx`](<../app/(new)/_components/DigitalAssets/index.tsx>)                |
| `digital_assets_list`   | `/digital-assets` 「免費刊登數位資產」 button                 | [`DigitalAssetResults.tsx`](<../app/(new)/digital-assets/_components/DigitalAssetResults.tsx>) |
| `launch_banner`         | Top banner 「搶先刊登 →」 (pre-launch 數位資產 message)       | [`LaunchBannerRotator.tsx`](<../app/(new)/_components/LaunchBannerRotator.tsx>)                |
| `home_digital_teaser`   | Homepage 04 teaser 「搶先刊登數位資產」 (before launch)       | [`LaunchCtas.tsx`](<../app/(new)/_components/DigitalAssetsLaunch/LaunchCtas.tsx>)              |
| `digital_assets_teaser` | `/digital-assets` teaser 「搶先刊登數位資產」 (before launch) | [`LaunchCtas.tsx`](<../app/(new)/_components/DigitalAssetsLaunch/LaunchCtas.tsx>)              |

Plain-link CTAs use the shared [`SellCtaLink`](<../app/(new)/_components/SellCtaLink.tsx>)
component (NextLink + `trackEvent`). The two auth-branching buttons
(`SellButton`, `SellerCta`) call `trackEvent` inline in their click handlers,
since they route to `/sell` or `/login?redirect=/sell` depending on auth state.

### `acceleration_cta_click` — `plan` values

Fired by every CTA in the seller-facing 頂讓加速包 (acceleration package) flow.
The `plan` param records **which button** was clicked; every CTA opens the same
Google Form (`ACCELERATION_FORM_URL`), so `plan` is the only signal of intent.

| `plan`   | Placement                                                  | Component                                                                                 |
| -------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `banner` | My-listings banner "查看加速方案" link (→ `/acceleration`) | [`AccelerationBanner.tsx`](<../app/(new)/my-listings/_components/AccelerationBanner.tsx>) |
| `hero`   | `/acceleration` hero "查看加速方案" button (→ Google Form) | [`HeroPromo.tsx`](<../app/(new)/acceleration/_components/HeroPromo.tsx>)                  |
| `basic`  | 基礎加速包 card "選擇基礎方案" button (→ Google Form)      | [`PackageGrid.tsx`](<../app/(new)/acceleration/_components/PackageGrid.tsx>)              |
| `hot`    | 熱門加速包 card "選擇熱門方案" button (→ Google Form)      | [`PackageGrid.tsx`](<../app/(new)/acceleration/_components/PackageGrid.tsx>)              |
| `urgent` | 急售加速包 card "選擇急售方案" button (→ Google Form)      | [`PackageGrid.tsx`](<../app/(new)/acceleration/_components/PackageGrid.tsx>)              |

> The `banner` CTA navigates to the `/acceleration` page (not the form); the
> `hero` / `basic` / `hot` / `urgent` CTAs open the Google Form in a new tab via
> the shared [`AccelerationCta`](<../app/(new)/acceleration/_components/AccelerationCta.tsx>)
> component. Because the form is one shared link, `plan` is how you distinguish
> "clicked the banner" from "clicked the 熱門 plan" in GA4.

### `editor_pick_guide_click` — `location` values

Both entry points into the 編輯精選 rules page fire the same event; `location`
records where the click came from.

| `location`      | Placement                                                | Component                                                                                                |
| --------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `home_featured` | Homepage 編輯精選 section "如何成為編輯精選？→" sub-link | [`FeaturedListings.tsx`](<../app/(new)/_components/FeaturedListings.tsx>) (via `SectionTitle` `subLink`) |
| `sell_form`     | Sell-form callout "查看完整入選條件 →"                   | [`SellForm.tsx`](<../app/(new)/sell/_components/SellForm.tsx>)                                           |

> The homepage link renders through the shared
> [`TrackedLink`](../components/refactored/TrackedLink.tsx) (a generic NextLink +
> `trackEvent` wrapper — the design-system successor to `SellCtaLink`); the
> sell-form link calls `trackEvent` inline since `SellForm` is already a client
> component.

---

## Adding a new event

1. Call `trackEvent("event_name", { ...params })` from a client component,
   ideally at the point the action **succeeds** (not on raw click) for
   conversions.
2. Use `snake_case` event and parameter names.
3. Add a row to the reference table above.

---

## Dev / prod separation

Both environments share one measurement ID. Dev vs prod is separated **in GA4
reports** using the built-in **Hostname** dimension:

- `hostname = localhost` → development
- `hostname = <your domain>` → production

Add a report comparison/filter on Hostname (exclude `localhost` to see prod
only). No code or env changes are required for this.

---

## GA4 console setup (not code)

- **Key events (重要活動):** mark `sign_up` and `store_listing_submit` as key
  events (Admin → Key events) so they count as conversions.
- **Custom dimensions:** to break reports down by `cta_location`, `plan`,
  `category`, or `city`, register each as an event-scoped custom dimension
  (Admin → Custom definitions). Events still record without this; the params
  just won't be available as report dimensions until registered.
- **DebugView:** use Admin → DebugView (or the Realtime report) to confirm event
  names and parameters arrive exactly as expected.

---

## Admin reporting

The admin reads these events back per store through the GA4 Data API:

- **Store List** (`/admin/store/list`): 總瀏覽數 and 累計解鎖聯絡點擊率 columns.
- **Store Analytics** (`/admin/store/analytics`): 7 / 30 / 90-day KPIs,
  ranking and per-store trend.

Both call `GET /api/admin/store-analytics?range=7|30|90`:

- The endpoint is admin-only (`verifyAdminToken`).
- It makes one `batchRunReports` call, cached for 1 hour per range
  (`unstable_cache`).
- Code: [`lib/analytics/`](../lib/analytics) (constants in
  [`constant/storeAnalytics.ts`](../constant/storeAnalytics.ts)).

### Metric definitions

| Metric                     | Source                                                                                          | Window                                                     |
| -------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 總瀏覽數                   | `screenPageViews` on `/store/{storeId}`                                                         | `2026-07-04` (page-view tracking start) → yesterday        |
| 累計解鎖聯絡點擊率         | `contact_gate_click` ÷ `contact_gate_view` on `/store/{storeId}`                                | `2026-09-19` (contact-gate tracking start) → yesterday     |
| 瀏覽 / 不重複訪客 (period) | `screenPageViews` / `activeUsers`                                                               | last 7 / 30 / 90 full days, ending yesterday (Asia/Taipei) |
| 較前期                     | current vs previous same-length window                                                          | `—` when the previous window has 0                         |
| 會員聯絡                   | `seller_contact_phone` + `seller_contact_line` + `seller_contact_threads` on `/store/{storeId}` | same period window; recorded from `2026-10-10` (PR #78)    |

- Stores are matched by `pagePath`, so no `store_id` custom dimension is
  needed.
- Member contact taps use one event per channel (instead of a `channel`
  param), so the admin can split by channel without registering a GA4 custom
  dimension. Copying a number shown as plain text in the contact block is not
  tracked; only the buttons are.
- The contact gate only shows to logged-out visitors, so the click rate covers
  logged-out visitors only.
- GA4 data lags 24–48 hours.

### Hostname filter

Every report is filtered to the hostname of `NEXT_PUBLIC_APP_URL`:

- `npm run dev` → `localhost`
- Vercel production → `www.bezold.com.tw`
- Staging (`dev.bezold.com.tw`) shows little or no data, which is expected.

### Setup

1. **Google Cloud** (project `bezold`): enable **Google Analytics Data API**.
2. **GA4** → Admin → Property access management: add the service account in
   `FIREBASE_SERVER_CLIENT_EMAIL` as **Viewer**.
3. Set `GA4_PROPERTY_ID` (numeric property ID, server-only) in `.env`,
   `.env.development` and Vercel. Without it the endpoint returns 503 and the
   admin shows `—` / an error alert.
