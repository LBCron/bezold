# Spec: 後台一鍵下載所有店家資料（CSV）

來源：[v-salvator/bezold#99](https://github.com/v-salvator/bezold/issues/99)

## Objective

自動確認信系統（#98）需要一份完整的店家名單，才能依上架時間排程寄信。目前後台沒辦法一次拿到所有店家資料。

這次在後台店家列表頁加一個按鈕，管理員按一下就能下載**所有刊登＋賣家聯絡資料**，存成 CSV。這個檔案可以匯入自動寄信系統，也能直接用 Excel 打開。

使用者：Bezold 管理員（Firebase `admin` custom claim）。

### 已確認的決定

| #   | 決定                                                                                                                                                |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | **欄位名稱照 Firebase 的 key**（`storeName`、`monthlyRent`、`userInfo.email`…），不照 issue 的 `title`、`rent`、`owner_email`。對照表見下方「欄位」 |
| D2  | 上架時間用 `createTime`，不新增 `approvedTime` 欄位，資料模型不變                                                                                   |
| D3  | 範圍：**草稿以外的全部刊登**（pending／approved／rejected／sold，實體＋數位），和後台列表「所有狀態」的筆數一致                                     |
| D4  | 列舉值用 **Firestore 原始值**（`approved`、`RESTAURANT`、`EMERGENCY\|RECOMMENDED`），不轉成中文標籤                                                 |
| D5  | 下載紀錄**只寫 server log**（一行結構化 JSON），不新增 Firestore 集合、不做後台檢視頁                                                               |

### 連帶影響（不在這個 repo）

因為 D1、D4，CSV 的欄位名稱和值跟 issue 寫的不同，自動寄信系統的 `import_stores.py` 需要對應調整（欄位對照見下表），否則 issue 的驗收條件「格式錯誤 0 筆」不會過。這部分由你在自動寄信系統那邊處理。

## Tech Stack

- Next.js 14（App Router）· TypeScript · Ant Design 5（後台）· Firebase Admin SDK
- 時區轉換用內建 `Intl.DateTimeFormat`（`Asia/Taipei`），同 `lib/analytics/fetchStoreAnalytics.ts`
- **不加任何套件**

## Commands

```bash
nvm use

# 格式化、lint、build（每個任務完成前都要跑）
npx prettier --write <changed files>
npx eslint --no-eslintrc -c .eslintrc.json --ext .ts,.tsx app components constant types utils hooks lib firebase atoms
npm run build

# CSV 產生器的單元測試（新增，Node 內建 test runner，不用 emulator）
npm run test:unit

# 本機驗證（先確認 .env.development 的 NEXT_PUBLIC_ENV_VERSION=dev，讀 mockStore / mockUser）
npm run dev

# API 權限檢查
curl -i http://localhost:3000/api/admin/stores/export                                   # → 401
curl -i -H "Authorization: Bearer <非管理員 idToken>" http://localhost:3000/api/admin/stores/export  # → 403
```

## Project Structure

| 檔案                                   | 變更 | 內容                                                                                                                                                                       |
| -------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `utils/storeCsv.ts`                    | 新增 | 純函式：欄位定義 `STORE_CSV_COLUMNS`、`toStoreCsv(rows)`（BOM、CRLF、RFC 4180 跳脫）、`formatTaipeiTime()`、`exportFileName()`。**只用 `import type`**，讓 Node 直接跑測試 |
| `app/api/admin/stores/export/route.ts` | 新增 | `GET`：`verifyAdminToken` → 讀所有店家與賣家 → 產生 CSV → 寫 log → 回傳附件                                                                                                |
| `app/admin/store/list/page.tsx`        | 修改 | 工具列加「下載所有店家資料（CSV）」按鈕                                                                                                                                    |
| `tests/unit/storeCsv.test.ts`          | 新增 | `node --test` 單元測試                                                                                                                                                     |
| `package.json`                         | 修改 | 加 `"test:unit": "node --test tests/unit/*.test.ts"`                                                                                                                       |
| `.gitignore`                           | 修改 | 加 `bezold-sellers-*.csv`，避免把下載的個資檔 commit 進 repo                                                                                                               |

不需要改 `firestore.rules`、`storage.rules`、`firestore.indexes.json`：只透過 Admin SDK 讀整個集合，沒有 client 讀寫，也沒有複合查詢。

## 規格

### API：`GET /api/admin/stores/export`

1. `verifyAdminToken(req)`；失敗直接回它的 401／403。
2. `db.collection(COLLECTIONS.STORE).get()` 讀全部，排除 `status === "draft"`。
3. 收集不重複的 `user` uid，用 `db.getAll(...refs)` 一次讀 `COLLECTIONS.USER` 的賣家文件（不要每間店各查一次）。
4. 賣家文件沒有 `email` 時，用 `adminAuth.getUsers()`（每批最多 100 個 uid）補 Firebase Auth 的 email。
5. 找不到賣家文件的店照樣輸出，賣家欄位留空。
6. 依 `createTime` 由新到舊排序，同時間用 `id` 排。
7. 寫 log（見下方「下載紀錄」），再回傳：

| Header                | 值                                                   |
| --------------------- | ---------------------------------------------------- |
| `Content-Type`        | `text/csv; charset=utf-8`                            |
| `Content-Disposition` | `attachment; filename="bezold-sellers-YYYYMMDD.csv"` |
| `Cache-Control`       | `no-store`                                           |
| `X-Row-Count`         | 資料列數（給按鈕顯示「已下載 N 筆」）                |

- 日期用**台北時間**的今天。
- route 加 `export const dynamic = "force-dynamic"`，確保不會被靜態化或快取。
- 讀取失敗回 500 `{ error: "Failed to export stores" }`，並 `console.error`（不印出店家資料）。

### 後台按鈕

- 放在 `/admin/store/list` 工具列（搜尋、篩選那一排）的最後面，用 `AntButton`，文字「下載所有店家資料（CSV）」。
- 按下後 `authedFetch(idToken, "/api/admin/stores/export")` → `res.blob()` → 用暫時的 `URL.createObjectURL` 和 `<a download>` 觸發下載，下載後馬上 `revokeObjectURL`。檔名從 `Content-Disposition` 取。
- 下載中按鈕顯示 loading、不能重複按；`idToken` 還沒拿到時 disabled。
- 成功 `messageApi.success("已下載 N 筆")`（N 從 response header `X-Row-Count` 取）；失敗 `messageApi.error("下載失敗，請稍後再試")`。
- 不受頁面上的搜尋、篩選、分頁、勾選影響：永遠下載全部。

### CSV 格式

- UTF-8 開頭加 BOM（`﻿`）；換行用 CRLF；第一列是欄位名稱。
- 欄位有 `,`、`"`、換行時用雙引號包起來，裡面的 `"` 變成 `""`（描述常有換行，要留在同一格）。
- 一間店一列；`id` 不會重複。
- 空值（欄位不存在、`undefined`、`null`）輸出空字串，不輸出 `undefined` 或 `null`。
- 陣列用 `|` 串接；布林輸出 `true`／`false`；數字原樣輸出（`areaPing` 可以有小數）。
- 時間格式 `YYYY-MM-DD HH:mm`，台北時間，例如 `2026-07-23 14:00`。
- **公式注入防護**：賣家自由輸入的文字欄位（`storeName`、`location`、`description`、`userInfo.userName`）若開頭是 `=`、`+`、`-`、`@`、Tab 或 CR，前面加 `'`，避免 Excel 當成公式執行。電話、email、LINE ID 等聯絡欄位不處理（`+886…`、`@xxx` 要原樣給寄信系統）。

### 欄位

依序輸出。對照欄是 issue #99 原本的欄位名稱。

| #   | 欄位                  | 來源                                              | issue 對照                  | 格式                                      |
| --- | --------------------- | ------------------------------------------------- | --------------------------- | ----------------------------------------- |
| 1   | `id`                  | 店家 doc id                                       | `store_id`                  | 唯一                                      |
| 2   | `storeName`           | store                                             | `title`                     | 文字                                      |
| 3   | `status`              | store；不存在時輸出 `pending`（同後台列表的判斷） | `status`                    | `pending`／`approved`／`rejected`／`sold` |
| 4   | `listingType`         | `listingTypeOf(store)`                            | —                           | `physical`／`digital`                     |
| 5   | `city`                | store                                             | `city`                      | 數位資產為空                              |
| 6   | `district`            | store                                             | `district`                  | 數位資產為空                              |
| 7   | `location`            | store                                             | —                           | 文字                                      |
| 8   | `category`            | store                                             | `industry`                  | `RESTAURANT` 等原始值                     |
| 9   | `tags`                | store                                             | （issue 的 `急售`／`精選`） | `EMERGENCY\|RECOMMENDED`                  |
| 10  | `digitalTypes`        | store                                             | —                           | `SOCIAL\|WEBSITE`                         |
| 11  | `price`               | store                                             | `price`                     | 整數（數位資產是區間下限）                |
| 12  | `priceMax`            | store                                             | —                           | 整數                                      |
| 13  | `priceNegotiable`     | store                                             | —                           | `true`／`false`                           |
| 14  | `currency`            | store                                             | —                           | 文字                                      |
| 15  | `monthlyRent`         | store                                             | `rent`                      | 整數                                      |
| 16  | `areaPing`            | store                                             | `size_ping`                 | 數字                                      |
| 17  | `equipment`           | store                                             | —                           | `all`／`none`／`partial`                  |
| 18  | `operatingYears`      | store                                             | —                           | 數字                                      |
| 19  | `monthlyRevenue`      | store                                             | —                           | 整數                                      |
| 20  | `storeUrl`            | `${NEXT_PUBLIC_APP_URL}/store/${id}`              | `store_url`                 | 完整網址                                  |
| 21  | `description`         | store                                             | `raw_description`           | 文字，可含換行                            |
| 22  | `createTime`          | store                                             | `listed_at`（D2）           | `YYYY-MM-DD HH:mm` 台北時間               |
| 23  | `updateTime`          | store                                             | `updated_at`                | 同上                                      |
| 24  | `user`                | store（賣家 uid）                                 | —                           | 文字                                      |
| 25  | `userInfo.userName`   | user doc                                          | `owner_name`                | 文字                                      |
| 26  | `userInfo.email`      | user doc，沒有時用 Firebase Auth email            | `owner_email`               | 文字                                      |
| 27  | `userInfo.phone`      | user doc                                          | `owner_phone`               | 文字                                      |
| 28  | `userInfo.lineId`     | user doc                                          | `owner_line_id`             | 文字                                      |
| 29  | `userInfo.threadsId`  | user doc                                          | （「其他聯絡方式」）        | 文字                                      |
| 30  | `userInfo.createTime` | user doc                                          | `created_at`                | `YYYY-MM-DD HH:mm` 台北時間               |

**Firebase 沒有、這次不輸出的 issue 欄位**：`plan`（沒有付費方案）、`highlights`（沒有這個欄位；最接近的是 `tags`）、`marketing_opt_out`（沒有記錄）、`contact_name`／`contact_phone`／`contact_email`（沒有「聯絡人不是店主」的欄位）。匯入系統會略過不認得的欄位，缺的欄位要由匯入端當成空白。

**刻意不輸出**：`images`、`verificationImages`、`assetUrl`（不是聯絡資料，且屬於後台專用資訊）、`buyerProfile` 等買家偏好。

### 下載紀錄

每次成功產生 CSV，在回傳前寫一行：

```ts
console.info(
  JSON.stringify({
    event: "admin_store_export",
    adminUid: decoded.uid,
    adminEmail: decoded.email ?? "",
    rowCount: rows.length,
    exportedAt: new Date().toISOString(),
  }),
);
```

只記錄誰、什麼時候、幾筆，**不記錄任何店家或賣家資料**。正式站從 hosting 的 runtime logs 搜尋 `admin_store_export` 查看；本機看 dev server 的終端機。

## Code Style

沿用專案寫法：`// *` 註解、完整變數名稱（不用 `v`、`k`、`e`）、轉換資料的函式放 `utils/`、靜態值放 `constant/`、API 用 `verifyAdminToken` + `NextResponse`。

```ts
// utils/storeCsv.ts
// * only `import type` here — tests/unit runs this file with plain `node --test`,
// * which cannot resolve the `@/` alias at runtime
import type { Store } from "@/types";

const FORMULA_PREFIXES = ["=", "+", "-", "@", "\t", "\r"];

// * seller-typed free text could start with "=" and run as a formula in Excel
const guardFormula = (value: string) =>
  FORMULA_PREFIXES.some((prefix) => value.startsWith(prefix))
    ? `'${value}`
    : value;

const escapeCell = (value: string) =>
  /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
```

## Testing Strategy

App 沒有測試框架；這次新增一支**不需要任何套件**的單元測試（Node 24 內建 `node --test`，直接跑 `.ts`），只測 `utils/storeCsv.ts` 這個純函式。API 和按鈕用本機 dev（`NEXT_PUBLIC_ENV_VERSION=dev`，讀 `mockStore` / `mockUser`）驗證。

| #   | 驗證                                                                                                                                                                                                                                                                                                   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| T1  | `npm run test:unit`：開頭有 BOM、CRLF、標題列順序和上表一致；含 `,`、`"`、換行的值正確跳脫；空值是空字串；陣列用 `\|`；UTC `2026-07-23T06:00:00Z` → `2026-07-23 14:00`；`=SUM(A1)` 的店名變成 `'=SUM(A1)`，`+886…` 的電話不變；檔名 `bezold-sellers-YYYYMMDD.csv` 以台北日期計算（UTC 16:30 已是隔天） |
| T2  | 本機後台按按鈕 → 下載 `bezold-sellers-20261103.csv`（以當天日期為準）；用 Excel／Numbers 打開中文正常、欄位對齊、有換行的描述留在同一格                                                                                                                                                                |
| T3  | 資料列數 = 後台列表「所有狀態＋所有類型」的總筆數；`id` 沒有重複；草稿不在檔案裡；數位資產在檔案裡                                                                                                                                                                                                     |
| T4  | 隨機抽 3 筆，和後台 drawer 裡的店名、價格、賣家電話／email 一致；沒有 user doc email 的賣家有補上 Auth email                                                                                                                                                                                           |
| T5  | curl 不帶 token → 401；非管理員 token → 403；管理員 → 200，header 有 `Cache-Control: no-store` 和 `Content-Disposition: attachment`                                                                                                                                                                    |
| T6  | dev server 終端機有一行 `admin_store_export`，`rowCount` 和 T3 一致，裡面沒有任何店家資料                                                                                                                                                                                                              |
| T7  | lint 0 錯誤、`npm run build` 通過                                                                                                                                                                                                                                                                      |

## Boundaries

- **Always**
  - API 第一步就是 `verifyAdminToken`；按鈕藏起來不算權限檢查
  - 回應加 `Cache-Control: no-store`；CSV 只在記憶體產生、直接回傳
  - 集合名稱用 `COLLECTIONS.*`；賣家資料用一次 `getAll` 讀，不要每間店查一次
  - 改過的檔案都跑 prettier；本機測試前確認 `NEXT_PUBLIC_ENV_VERSION=dev`
  - 驗證完先停下讓你看，再 commit；用 worktree branch + PR，不直接動 main
- **Ask first**
  - 用正式資料（`prodStore` / `prodUser`）跑下載
  - 加任何套件；新增上表以外的欄位（例如 `userInfo.remark`）
  - 改動 `Store` / `User` 的資料模型
- **Never**
  - 把下載的 CSV commit 進 repo、貼到 issue／PR，或放進 `public/`
  - 產生公開或可分享的下載連結；把檔案寫到 Storage、磁碟、雲端硬碟，或寄到信箱
  - 在 log 或錯誤訊息裡印出店家、賣家資料
  - 讓這個 endpoint 被快取或靜態化

## Success Criteria

1. 管理員在後台按一下就下載到 `bezold-sellers-YYYYMMDD.csv`，Excel 直接打開中文正常、欄位對齊（T2）。
2. 檔案包含草稿以外的全部刊登，筆數和後台列表總數一致，一間店一列（T3）。
3. 欄位名稱和值照 Firebase 的 key 與原始值，內容和後台資料一致（T1、T4）。
4. 非管理員直接打 API 會被拒絕，回應不會被快取（T5）。
5. 每次下載都在 server log 留下管理員、時間、筆數（T6）。
6. lint、build、單元測試全過（T1、T7）。

## Open Questions

1. `userInfo.remark`（使用者文件上的備註）要不要也輸出？目前不輸出，因為它不是聯絡資料，可能含有內部備註。
