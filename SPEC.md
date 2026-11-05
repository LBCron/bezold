# Spec: 數位資產頂讓 — 照片不公開＋表單隱私提醒

## Objective

數位資產是匿名刊登：買家不該從公開頁面認出是哪個賣場、帳號或品牌。目前有兩個漏洞：

1. **封面照片會公開**：賣家上傳的封面照（`images`）會出現在刊登頁圖庫、列表卡片、OG 圖和 JSON-LD。照片常帶有賣場名、Logo 或帳號，等於洩漏身分。
2. **表單沒提醒哪些欄位會公開**：賣家常在「資產名稱」直接填賣場名（連 placeholder 都示範「手作飾品蝦皮賣場」），或在描述留聯絡方式。

這次的調整：

- 數位資產的**所有照片不公開**：只給 Bezold 管理員核對，潛在買家支付賣家資料解鎖費後由 Bezold 私訊提供（和營收截圖、資產連結同一套流程，網站外手動處理）。賣家本人在自己的後台仍看得到自己上傳的。公開頁面、公開 API 一律不出現。
- 在賣家填寫的表單（`/sell` 和 `/my-listings` 編輯頁）加上兩則公開提醒。

使用者：數位資產賣家（填表）、潛在買家（看公開頁）、Bezold 管理員（核對照片）。

### 已確認的決定

| #   | 決定                                                                                                           |
| --- | -------------------------------------------------------------------------------------------------------------- |
| D1  | **保留**賣家上傳照片的功能（選填），但改為不公開；網站上只有管理員和賣家本人看得到，付費買家由 Bezold 私訊提供 |
| D2  | 公開刊登頁的數位資產**整個拿掉圖庫區塊**，頁面直接從麵包屑 → 標題列 → 數據列。實體店面不變                     |
| D3  | 「資產名稱」placeholder 改為 `例：手作飾品電商＋社群`                                                          |
| D4  | 營收截圖（`verificationImages`）本來就只給管理員／賣家，這次不動                                               |
| D5  | 不搬資料、不刪檔：既有數位資產的 `images` 和 Storage 檔案原地保留，只在讀取端擋掉。管理員後台照舊看得到        |

## 要改的地方

### A. 照片不公開

公開讀取數位資產的路徑只有三條，全部經過 server（Admin SDK 簽 URL，簽出的 URL 不受 `storage.rules` 管）。所以擋法是**數位資產在公開路徑上不簽 URL、`images` 給空陣列**：

| 路徑                                                           | 現在                               | 改成                                                                                  |
| -------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------- |
| `/store/[storeId]`（`getStoreById` → `omitSellerContact`）     | 簽全部照片，圖庫＋OG＋JSON-LD 都用 | 數位資產 `images: []`；不 render `StoreGallery`；OG／JSON-LD 退回預設 `bezold-og.png` |
| `GET /api/stores/[storeId]`（同上）                            | 回傳簽好的照片 URL                 | 數位資產 `images: []`                                                                 |
| `getDigitalAssets()`（首頁數位資產區、`/digital-assets` 列表） | 簽封面，卡片顯示                   | 不簽，卡片走既有的「數位資產」無圖樣式                                                |

做法：

- `omitSellerContact()`（`utils/store.ts`）本來就是公開資料的唯一閘門（已經清掉 `assetUrl`、`verificationImages`）→ 數位資產再加清 `images`。這同時涵蓋刊登頁和 API。
- `firebase/serverUtils/store.ts`：`getDigitalAssets()` 不再呼叫 `resolveStoreImages`，回傳的數位資產 `images` 一律 `[]`；server 版 `getStoreById()` 遇到數位資產回 `images: []`、不簽照片。這也擋住 `generateMetadata()` —— 它用的是沒經過 `omitSellerContact()` 的 store，現在 `og:image` 會拿到簽好的照片 URL。
- `digitalAssetToCard()` 的 `image` 一律 `undefined`（雙保險：即使哪天上游忘了清，卡片也不顯示）。
- `app/(new)/store/[storeId]/page.tsx`：`isDigital` 時不 render `<StoreGallery>`。`StoreGallery` 的 `isDigital` prop 和 `SLOT_LABELS.digital` 變成沒人用 → 一併移除。

**不動的地方**（這些是管理員／賣家本人的路徑，走 client SDK＋`storage.rules`，本來就只給 admin 或 owner）：

- 管理員：`StoreDetailDrawer`、`/admin/store/edit/[storeId]/image`
- 賣家：`/my-listings` 的 `ListingCard` 縮圖、編輯頁的照片上傳區
- `storage.rules`、`firestore.rules`：不需要改

### B. 照片上傳區的文案

照片不再給買家看，上傳區的文案要跟著改，不能再說「讓買家更了解」：

| 位置                                            | 現在                                                                                               | 改成                                                                                                                                   |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `/sell` 數位資產第二步 heading                  | 上傳封面照片（選填）                                                                               | 上傳照片（選填）                                                                                                                       |
| `/sell` 數位資產第二步 note                     | 資產資料已送出！可上傳賣場、社群或網站的封面圖讓買家更了解，也可略過。請勿上傳含帳號或個資的畫面。 | 資產資料已送出！可上傳賣場、社群或網站的畫面，僅供 Bezold 核對及付費買家查閱，不會公開顯示，也可略過。上傳前請遮住姓名、Email 等個資。 |
| `/my-listings` 編輯頁 heading（數位）           | 封面照片                                                                                           | 照片（不公開）                                                                                                                         |
| `/my-listings` `ListingCard` 縮圖 label（數位） | 封面圖                                                                                             | 照片                                                                                                                                   |

（照片 wording 已確認；note 的「僅供 Bezold 核對及付費買家查閱」和描述提醒第二行一致。）

### C. 表單公開提醒

兩則提醒放在 `components/storeForm/DigitalFieldsSection.tsx`，所以 `/sell` 和 `/my-listings` 編輯頁會同時出現。樣式沿用既有的 `styles.warning`（`role="note"`），放在**欄位標題下、輸入框上方**，讓賣家打字前就看到。

文字照你給的，存成 `constant/digitalAsset.ts` 的常數：

```ts
// * shown above 資產名稱 — the name is public, so describe the type, not the brand
export const ASSET_NAME_PUBLIC_WARNING = [
  "⚠️ 此欄位會公開顯示，請以類型描述資產，勿填入品牌名、帳號名稱或網址。",
  "例如：寫「手作飾品電商」，而非「○○手作飾品蝦皮賣場」。",
];

// * shown above 資產描述
export const ASSET_DESCRIPTION_PUBLIC_WARNING = [
  "⚠️ 描述內容會公開顯示，請勿留下電話、Email、LINE 等聯絡方式，或可辨識資產的品牌名、帳號。",
  "截圖與連結僅供 Bezold 核對及付費買家查閱；上傳前請遮住姓名、Email 等個資，並確認未包含密碼或驗證碼。",
];
```

每則兩行，各自一個 `<span>` 換行顯示（第二行是補充）。

另外：

- 「資產名稱」placeholder：`例：手作飾品蝦皮賣場＋FB 社團` → `例：手作飾品電商＋社群`（D3）。
- `FormField` 已有 `hint`，但在 input 下方 → 新增 `notice?: React.ReactNode` slot，在 label 和 input 之間 render（`components/refactored/FormField.tsx`，通用、別的表單也能用）。呼叫端傳入 `<p className={styles.warning} role="note">…</p>`，`FormField` 不碰樣式。

## Tech Stack

Next.js 14（App Router）· TypeScript · CSS Modules · Firebase Admin SDK（server 讀取）。不新增套件。

## Commands

```bash
nvm use
npm run dev          # 本機驗證（先確認 .env.development 是 NEXT_PUBLIC_ENV_VERSION=dev）
npx eslint --no-eslintrc -c .eslintrc.json "app/**/*.tsx" "components/**/*.tsx" "utils/**/*.ts" "firebase/**/*.ts" "constant/**/*.ts"
npm run build
npx prettier --write <changed files>
```

## Project Structure（會動到的檔案）

```
utils/store.ts                                        → omitSellerContact 清 images、digitalAssetToCard 不帶 image
firebase/serverUtils/store.ts                         → getDigitalAssets / getStoreById 不簽數位資產照片
app/(new)/store/[storeId]/page.tsx                    → 數位資產不 render 圖庫
app/(new)/store/[storeId]/_components/StoreGallery.tsx → 移除 isDigital 分支
constant/digitalAsset.ts                              → 兩則提醒常數
components/storeForm/DigitalFieldsSection.tsx         → 插入提醒、改 placeholder
components/refactored/FormField.tsx                   → 新增 notice slot
app/(new)/sell/_components/SellForm.tsx               → 上傳區文案
app/(new)/my-listings/edit/[storeId]/_components/EditListingForm.tsx → 上傳區文案
app/(new)/my-listings/_components/ListingCard.tsx     → 縮圖 label
```

## Code Style

照既有慣例：CSS Module 管外觀、Tailwind 只管版面且不混用；條件 class 用 `cn()`；註解用 `// * ` 開頭、短句說「為什麼」；變數名不縮寫。文案常數放 `constant/`，資料轉換放 `utils/`。

```tsx
<div className={styles.field}>
  <label className={styles.label} htmlFor="description">
    資產描述
  </label>
  <p className={styles.warning} role="note">
    {ASSET_DESCRIPTION_PUBLIC_WARNING.map((line) => (
      <span key={line} className="block">{line}</span>
    ))}
  </p>
  <textarea id="description" … />
</div>
```

（`<span>` 沒有 module class，可以用 Tailwind `block`。）

## Testing Strategy

- App code 沒有測試框架；`storage.rules`／`firestore.rules` 沒改，所以不新增 rules 測試。
- `npm run test:rules` 跑一次確認沒被影響（需要 Java 21；跑不了就註明）。
- 手動驗證（dev 環境、mock 資料，用一筆**有 `images` 的數位資產**）：
  1. `/store/<數位資產 id>`：沒有圖庫區塊；view-source 搜不到 `firebasestorage`／`storage.googleapis.com` 照片 URL；`og:image` 是 `bezold-og.png`。
  2. `GET /api/stores/<數位資產 id>`：`images` 是 `[]`。
  3. 首頁數位資產區、`/digital-assets`：卡片顯示無圖樣式，HTML 不含照片 URL。
  4. 實體店面刊登頁、`/store-list` 卡片：照片照常顯示（回歸檢查）。
  5. 管理員 `StoreDetailDrawer`、`/admin/store/edit/<id>/image`：數位資產的照片照常看得到。
  6. `/sell?type=digital`、`/my-listings/edit/<id>`：兩則提醒在欄位標題下、輸入框上方；placeholder 已改；手機寬度不破版。
- `npm run build`、lint 通過。

## Boundaries

- **Always**：公開資料一律經 `omitSellerContact()`；改完跑 prettier；實作完先給你 review 再 commit；在 worktree branch 上做，開 PR，不碰 main。
- **Ask first**：刪除或搬移既有數位資產的 Storage 照片／`images` 欄位；改 `storage.rules`／`firestore.rules`；改實體店面的照片行為；文案（B 段）有任何不確定。
- **Never**：在公開路徑產生數位資產照片的 URL；動 Firebase console 的 rules／indexes；deploy。

## Success Criteria

- [x] 數位資產的照片 URL 不出現在任何公開頁面的 HTML、OG／JSON-LD、或 `/api/stores/[id]` 回應中（含既有、已上傳照片的刊登）
- [x] 數位資產刊登頁沒有圖庫區塊；列表卡片顯示無圖樣式
- [x] 實體店面的照片顯示完全不變
- [ ] 管理員後台、賣家自己的 `/my-listings` 仍看得到數位資產照片
- [x] `/sell` 和 `/my-listings` 編輯頁：資產名稱、資產描述上方各有一則提醒，文字與本 spec 一致
- [x] 資產名稱 placeholder 為 `例：手作飾品電商＋社群`
- [x] 照片上傳區文案不再暗示買家看得到
- [x] lint、build 通過

## Open Questions

無 — 照片 wording 和付費買家是否收到照片都已確認。
