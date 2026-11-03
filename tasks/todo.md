# Tasks: 後台一鍵下載所有店家資料（CSV）

Spec: [`SPEC.md`](../SPEC.md) · Plan: [`tasks/plan.md`](plan.md)

## Task 1: CSV 產生器 + 單元測試

**Description:** 新增純函式 `utils/storeCsv.ts`，把已經整理好的 `Store[]`（含 `userInfo`）轉成 SPEC 定義的 CSV 字串，並提供檔名函式。另外新增 Node 內建 test runner 的單元測試和 `test:unit` script。

**Acceptance criteria:**

- [ ] `toStoreCsv(stores, { appUrl })` 回傳開頭是 BOM 的字串，換行用 CRLF，標題列的 30 個欄位順序和 SPEC 的表格一樣
- [ ] 跳脫、空值、陣列 `|`、布林、台北時間 `YYYY-MM-DD HH:mm`、公式前綴 `'`（只加在自由文字欄位），都符合 SPEC
- [ ] `exportFileName(now)` 用台北日期回傳 `bezold-sellers-YYYYMMDD.csv`

**Verification:**

- [ ] `npm run test:unit` 通過，涵蓋 SPEC T1 列出的每一種情況
- [ ] `npx prettier --write`、lint 0 錯誤

**Dependencies:** None

**Files likely touched:**

- `utils/storeCsv.ts`（新增）
- `tests/unit/storeCsv.test.ts`（新增）
- `package.json`（`test:unit`）

**Estimated scope:** Small

## Task 2: Export API

**Description:** 新增 `getStoresForExport()`：讀取草稿以外的全部店家，再批次讀進賣家資料（沒有 email 的用 Auth email 補）。新增 `GET /api/admin/stores/export`：檢查管理員權限 → 把 `status`／`listingType` 整理好 → `toStoreCsv` → 寫 `admin_store_export` log → 回傳附件。另外把 `bezold-sellers-*.csv` 加進 `.gitignore`。

**Acceptance criteria:**

- [ ] 不帶 token 回 401；非管理員回 403；管理員回 200，有 `Content-Type: text/csv; charset=utf-8`、`Content-Disposition: attachment; filename="bezold-sellers-YYYYMMDD.csv"`、`Cache-Control: no-store`、`X-Row-Count`
- [ ] 資料列數 = mock 裡草稿以外的店家數；`id` 不重複；賣家欄位和後台 drawer 一致
- [ ] 每次成功下載都寫一行 `admin_store_export` JSON log（adminUid、adminEmail、rowCount、exportedAt），裡面沒有店家資料

**Verification:**

- [ ] 確認 `.env.development` 的 `NEXT_PUBLIC_ENV_VERSION=dev` 後跑 `npm run dev`
- [ ] 用 curl 檢查 401／403；用管理員 token 檢查 200 和 header（SPEC T5）
- [ ] dev server 終端機出現 log 行（SPEC T6）
- [ ] `npm run build` 通過

**Dependencies:** Task 1

**Files likely touched:**

- `firebase/serverUtils/store.ts`（`getStoresForExport`）
- `app/api/admin/stores/export/route.ts`（新增）
- `.gitignore`

**Estimated scope:** Small

## Checkpoint: API

- [ ] `npm run test:unit` 通過
- [ ] curl 401／403／200 正確，log 行正確

## Task 3: 後台下載按鈕

**Description:** 在 `/admin/store/list` 工具列最後加一顆「下載所有店家資料（CSV）」的 `AntButton`。按下後用 `authedFetch` 拿 blob，用暫時的 object URL 觸發下載（檔名取自 `Content-Disposition`）。下載中顯示 loading，`idToken` 還沒拿到時 disabled，成功和失敗都要有訊息。

**Acceptance criteria:**

- [ ] 按一下就下載 `bezold-sellers-YYYYMMDD.csv`，不受搜尋、篩選、分頁、勾選影響
- [ ] 下載中按鈕是 loading、不能重複按；成功顯示「已下載 N 筆」，失敗顯示「下載失敗，請稍後再試」
- [ ] 下載後 object URL 有 revoke

**Verification:**

- [ ] 瀏覽器實際下載；用 Excel／Numbers 打開，中文正常、欄位對齊、有換行的描述留在同一格（SPEC T2）
- [ ] 列數 = 後台列表「所有狀態＋所有類型」的總數；抽 3 筆和 drawer 比對（SPEC T3、T4）
- [ ] lint 0 錯誤、`npm run build` 通過（SPEC T7）

**Dependencies:** Task 2

**Files likely touched:**

- `app/admin/store/list/page.tsx`

**Estimated scope:** XS

## Checkpoint: Complete

- [ ] SPEC T1–T7 全部通過
- [ ] 停下讓你看過，再 commit；一個 PR，描述連結 #99，不貼任何真實資料
