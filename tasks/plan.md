# Implementation Plan: 數位資產照片不公開＋表單隱私提醒

Spec: [`SPEC.md`](../SPEC.md) · Tasks: [`tasks/todo.md`](todo.md)

## Overview

兩條獨立的線：

1. **照片不公開（Task 1–2）**：數位資產的 `images` 在所有公開 server 路徑上變成 `[]`、不簽 URL；刊登頁拿掉圖庫。
2. **表單提醒（Task 3–4）**：「資產名稱」「資產描述」上方加公開提醒、改 placeholder；照片上傳區改文案。

先做照片（風險較高、是真的資料外洩），再做文案。

## Architecture Decisions

- **在 server 讀取端擋，不在 render 端擋。** Admin SDK 簽出的 URL 不受 `storage.rules` 管，只要 URL 出現在 server 回應裡就算外洩。所以數位資產在 server `getStoreById()`、`getDigitalAssets()` 直接回 `images: []`，連 URL 都不產生。
  - server 版 `getStoreById()`（`firebase/serverUtils`）只被三個公開路徑用：`/store/[storeId]`、`GET /api/stores/[storeId]`、`/api/stores/[storeId]/contact`（不用照片）。管理員和 `/my-listings` 用的是 client 版 `getStoreById()`（`firebase/clientUtils`），不受影響。
  - 這也一併修掉 `generateMetadata()` 的漏洞 —— 它用的是**沒經過** `omitSellerContact()` 的 store，`og:image` 會直接拿到簽好的照片 URL。
- **`omitSellerContact()` 和 `digitalAssetToCard()` 再各擋一次**（雙保險）。`omitSellerContact()` 本來就是公開資料的閘門；`digitalAssetToCard()` 不帶 `image`，卡片自動走既有的 `photoLabel: "數位資產"` 無圖樣式。
- **提醒放在 label 和 input 之間 → 替 `FormField` 加 `notice?: React.ReactNode` slot。** `FormField` 已有 `hint`，但它在 input 下方。新增 `notice` 在 `<label>` 之後、`inputWrap` 之前 render，別的表單也能用。「資產描述」本來就是手寫 `<label>` ＋ `<textarea>`，直接插 `<p className={styles.warning}>`。
- **提醒樣式沿用 `storeForm.module.css` 的 `.warning`**，所以 `notice` 由呼叫端傳整個元素進來（`<p className={styles.warning} role="note">…</p>`），`FormField` 不需要知道樣式。

## Task List

### Phase 1: 照片不公開

- [x] Task 1: 公開資料路徑不帶數位資產照片
- [x] Task 2: 數位資產刊登頁拿掉圖庫

### Checkpoint: 照片

- [x] 公開頁面、API、OG 都沒有數位資產照片 URL；實體店面不變
- [x] lint、build 通過

### Phase 2: 表單提醒

- [x] Task 3: 資產名稱／資產描述的公開提醒＋placeholder
- [x] Task 4: 照片上傳區文案

### Checkpoint: Complete

- [ ] SPEC.md 的 Success Criteria 全部打勾
- [x] `npm run test:rules` 通過（或註明跑不了）
- [ ] 給你 review，再 commit

## Risks and Mitigations

| Risk                                                                           | Impact | Mitigation                                                                                              |
| ------------------------------------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------- |
| 漏掉某條公開路徑（例如 `generateMetadata`、JSON-LD），照片 URL 還是出現在 HTML | High   | 在 server 讀取端直接回 `[]`，再用 view-source／curl 搜 `storage.googleapis.com`、`firebasestorage` 驗證 |
| 誤傷實體店面照片                                                               | High   | 所有改動都用 `isDigitalAsset()` 判斷；Checkpoint 回歸檢查實體刊登頁和 `/store-list`                     |
| 誤傷管理員／賣家看照片                                                         | Med    | 只改 server 版函式；admin 和 `/my-listings` 走 client SDK。Checkpoint 實際打開 `StoreDetailDrawer` 確認 |
| dev server 讀到 prod 資料                                                      | Med    | 開始前確認 `.env.development` 是 `NEXT_PUBLIC_ENV_VERSION=dev`                                          |
| mock 資料裡沒有「有照片的數位資產」，驗不到                                    | Low    | 用 `/my-listings` 編輯頁替一筆 mock 數位資產上傳照片後再驗                                              |

## Open Questions

無。
