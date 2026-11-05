# Implementation Plan: 後台一鍵下載所有店家資料（CSV）

Spec: [`SPEC.md`](../SPEC.md) · Tasks: [`tasks/todo.md`](todo.md) · Issue: [v-salvator/bezold#99](https://github.com/v-salvator/bezold/issues/99)

## Overview

管理員在 `/admin/store/list` 按一下，從 `GET /api/admin/stores/export` 下載草稿以外的全部刊登＋賣家聯絡資料（CSV）。欄位名稱照 Firebase key，列舉值用原始值，每次下載在 server log 留一行紀錄。一個 PR、三個任務。

## Architecture Decisions

- **CSV 格式化和資料讀取分開。** `utils/storeCsv.ts` 只做格式化（欄位、跳脫、BOM、時區、檔名），輸入是已經整理好的 `Store[]`（含 `userInfo`）。它只用 `import type`，所以 `node --test` 可以直接跑，不用 alias 解析或 build。
- **狀態和類型在 route 先處理好。** `status ?? "pending"`、`listingTypeOf(store)` 在進 `toStoreCsv` 之前算好（`utils/store.ts` 有 runtime 的 `@/` import，測試載入不了），`storeCsv.ts` 只負責輸出。
- **讀取放在 `firebase/serverUtils/store.ts` 的新函式 `getStoresForExport()`。** 重用現有的 `mapDocsToStores`（Timestamp → Date）。現有的 `getStores()` 不能用：它會濾掉數位資產，也會簽圖片網址。
- **賣家資料批次讀。** 用 `db.getAll(...refs)` 讀不重複的 uid，一次就好，不像 `getStoreById` 每間店各查一次。沒有 email 的人，用 `adminAuth.getUsers()` 每 100 個一批補上。
- **不改 rules 或 index。** 只用 Admin SDK 讀整個集合，沒有複合查詢。

## Task List

### Phase 1: CSV 產生器（風險最高的部分先做）

- [x] Task 1: `utils/storeCsv.ts` + 單元測試 + `test:unit` script

### Phase 2: API

- [x] Task 2: `GET /api/admin/stores/export`（讀取、權限、header、log）

### Checkpoint: API

- [x] `npm run test:unit` 通過；curl 401／403／200 都正確；log 有 `admin_store_export`

### Phase 3: 後台按鈕

- [x] Task 3: 店家列表頁「下載所有店家資料（CSV）」按鈕

### Checkpoint: Complete

- [x] SPEC T1–T7 全部通過；lint、build 通過
- [x] 停下讓你看過，再 commit、開 PR

## Risks and Mitigations

| Risk                                                                         | Impact | Mitigation                                                                                           |
| ---------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| Node 直接跑 `.ts` 時，`import type ... from "@/types"` 解析失敗              | Med    | Task 1 一開始就先跑一支最小的測試確認；不行的話，改成在 `storeCsv.ts` 裡定義需要的 type              |
| 舊資料缺 `createTime`／`updateTime`，`mapDocsToStores` 的 `.toDate()` 會丟錯 | Med    | Task 2 先在 mock 資料上跑一次；有缺的話，export 用自己的安全轉換（缺值 → 空字串），不改共用的 mapper |
| CSV 被 Excel 當成公式執行                                                    | Low    | 賣家自由文字欄位加 `'` 前綴（SPEC 已定義），單元測試涵蓋                                             |
| 本機 dev 連到正式資料                                                        | High   | 驗證前先確認 `.env.development` 的 `NEXT_PUBLIC_ENV_VERSION=dev`；要用正式資料一定先問你             |
| 匯入系統的 `import_stores.py` 不認新欄位名稱                                 | Med    | 不在這個 repo。SPEC 已附欄位對照表，由你在寄信系統那邊調整                                           |

## Open Questions

- `userInfo.remark` 要不要輸出（目前不輸出）。
