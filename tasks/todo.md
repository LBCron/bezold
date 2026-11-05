# Tasks: 數位資產照片不公開＋表單隱私提醒

Spec: [`SPEC.md`](../SPEC.md) · Plan: [`tasks/plan.md`](plan.md)

## Task 1: 公開資料路徑不帶數位資產照片

**Description:** 數位資產在公開 server 讀取路徑上一律 `images: []`，不簽任何照片 URL；公開閘門和卡片再各擋一次。

**Acceptance criteria:**

- [x] server `getStoreById()` 遇到數位資產回 `images: []`、不呼叫 `getImagesByPath()`；實體店面照舊簽
- [x] `getDigitalAssets()` 回傳的每筆 `images` 都是 `[]`、不簽 URL
- [x] `omitSellerContact()` 對數位資產清空 `images`；`digitalAssetToCard()` 不帶 `image`

**Verification:**

- [x] `curl localhost:3000/api/stores/<數位資產 id>` → `images: []`
- [x] `/digital-assets`、首頁數位資產區：卡片是無圖樣式，HTML 搜不到 `storage.googleapis.com`／`firebasestorage`
- [x] `/store-list`、首頁實體店卡片照片照常
- [x] lint 通過

**Dependencies:** None

**Files likely touched:**

- `firebase/serverUtils/store.ts`
- `utils/store.ts`

**Estimated scope:** S

## Task 2: 數位資產刊登頁拿掉圖庫

**Description:** `/store/[storeId]` 的數位資產不 render `StoreGallery`；`og:image`、JSON-LD 因 `images` 為空而退回 `bezold-og.png`。移除 `StoreGallery` 用不到的 `isDigital` 分支。

**Acceptance criteria:**

- [x] 數位資產刊登頁沒有圖庫區塊，版面從麵包屑 → 標題列 → 數據列，不留空白
- [x] `og:image` 和 JSON-LD `image` 是 `bezold-og.png`
- [x] `StoreGallery` 的 `isDigital` prop、`SLOT_LABELS.digital` 移除；實體刊登頁、`/store-example` 圖庫不變

**Verification:**

- [x] view-source 數位資產刊登頁：搜不到照片 URL，`og:image` 正確
- [ ] 實體店面刊登頁圖庫、lightbox 照常
- [ ] 手機寬度截圖確認版面
- [x] lint、build 通過

**Dependencies:** Task 1

**Files likely touched:**

- `app/(new)/store/[storeId]/page.tsx`
- `app/(new)/store/[storeId]/_components/StoreGallery.tsx`

**Estimated scope:** S

## Checkpoint: 照片

- [x] 公開頁面、API、OG 都沒有數位資產照片 URL；實體店面不變
- [ ] 管理員 `StoreDetailDrawer`、`/my-listings` 縮圖仍看得到數位資產照片
- [x] lint、build 通過

## Task 3: 資產名稱／資產描述的公開提醒＋placeholder

**Description:** `FormField` 加 `notice?: React.ReactNode` slot（label 和 input 之間）。兩則提醒存成 `constant/digitalAsset.ts` 常數，在 `DigitalFieldsSection` 的「資產名稱」「資產描述」上方顯示；placeholder 改為 `例：手作飾品電商＋社群`。

**Acceptance criteria:**

- [x] `ASSET_NAME_PUBLIC_WARNING`、`ASSET_DESCRIPTION_PUBLIC_WARNING` 文字與 SPEC.md 一致，各兩行分開顯示
- [x] 兩則提醒都在欄位標題下、輸入框上方，使用 `.warning` 樣式和 `role="note"`
- [x] 不傳 `notice` 的 `FormField` 外觀完全不變

**Verification:**

- [x] `/sell?type=digital`、`/my-listings/edit/<數位資產 id>` 截圖（桌機＋手機寬度）
- [ ] 抽查一個實體表單的 `FormField`（`/sell` 實體、登入頁）沒變
- [x] lint 通過

**Dependencies:** None

**Files likely touched:**

- `components/refactored/FormField.tsx`
- `constant/digitalAsset.ts`
- `components/storeForm/DigitalFieldsSection.tsx`

**Estimated scope:** S

## Task 4: 照片上傳區文案

**Description:** 數位資產的照片上傳區不再暗示買家看得到，依 SPEC.md B 段改文案。

**Acceptance criteria:**

- [x] `/sell` 數位第二步：heading `上傳照片（選填）`、note 為 SPEC.md 的新文字
- [x] `/my-listings` 編輯頁 heading（數位）：`照片（不公開）`
- [x] `ListingCard` 縮圖 label（數位）：`照片`；實體仍是 `店面照`

**Verification:**

- [ ] `/sell?type=digital` 送出後的上傳步驟、`/my-listings`、編輯頁截圖
- [x] lint 通過

**Dependencies:** None

**Files likely touched:**

- `app/(new)/sell/_components/SellForm.tsx`
- `app/(new)/my-listings/edit/[storeId]/_components/EditListingForm.tsx`
- `app/(new)/my-listings/_components/ListingCard.tsx`

**Estimated scope:** S

## Checkpoint: Complete

- [ ] SPEC.md 的 Success Criteria 全部打勾
- [x] `npm run build`、lint 通過
- [x] `npm run test:rules` 通過（或註明跑不了）
- [ ] 給你 review，再 commit
