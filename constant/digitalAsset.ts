import {
  DIGITAL_ASSET_TYPE,
  type DigitalAssetType,
} from "@/types/DigitalAsset";

// * official 數位資產頂讓 launch (Taipei time). Before it, the entry points
// * show a teaser; at this moment they switch on their own — no deploy needed.
export const DIGITAL_ASSETS_LAUNCH_AT = "2026-10-29T22:00:00+08:00";

// * display order of the type tabs / pills
export const DIGITAL_ASSET_TYPES: { key: DigitalAssetType; label: string }[] = [
  { key: DIGITAL_ASSET_TYPE.SOCIAL, label: "社群" },
  { key: DIGITAL_ASSET_TYPE.WEBSITE, label: "網站／內容平台" },
  { key: DIGITAL_ASSET_TYPE.ECOMMERCE, label: "電商" },
  { key: DIGITAL_ASSET_TYPE.APP, label: "App" },
  { key: DIGITAL_ASSET_TYPE.SAAS, label: "SaaS" },
  { key: DIGITAL_ASSET_TYPE.NEWSLETTER, label: "電子報／會員社群" },
  { key: DIGITAL_ASSET_TYPE.DIGITAL_PRODUCT, label: "數位產品／品牌" },
  { key: DIGITAL_ASSET_TYPE.OTHERS, label: "其他" },
];

export const DIGITAL_ASSET_TYPE_LABEL = Object.fromEntries(
  DIGITAL_ASSET_TYPES.map(({ key, label }) => [key, label]),
) as Record<DigitalAssetType, string>;

// * /digital-assets header line, on both the list and the pre-launch teaser
export const DIGITAL_ASSETS_SUBTITLE =
  "電商、社群、網站、App……匿名刊登，每筆都經 Bezold 核對營收截圖；有興趣可在刊登頁申請查看賣家資料。";

// * fixed caption under every 平均月營收 figure — sellers can't edit it
export const REVENUE_DISCLAIMER = "賣家提供，未經 Bezold 查核";

export const NO_CREDENTIALS_WARNING = "請勿提供密碼、驗證碼或其他登入資訊。";

export const TRANSFER_RISK_NOTICE =
  "刊登與移轉方式須依資產權利及相關平台規範確認。填寫表單時，請勿提供密碼、驗證碼或其他登入資訊。";

export const DIGITAL_TRANSFER_NOTES: { title: string; body: string }[] = [
  {
    title: "付費查看詳細資料",
    body: "公開頁面只顯示概要。潛在買家支付賣家資料解鎖費（價格下限的 0.5%，最低 500 元、最多 5,000 元）後，Bezold 會私訊提供後台截圖、資產連結和賣家聯絡方式，由雙方自行洽談。",
  },
  {
    title: "解鎖費不保證成交",
    body: "賣家資料解鎖費不是仲介費，原則上不退費。Bezold 不介入雙方交易，也不保證成交。",
  },
  {
    title: "移轉範圍需雙方確認",
    body: "帳號、社群、網域、商品與客戶名單等移轉項目，以及是否符合各平台規範，需由買賣雙方逐項確認。",
  },
  {
    title: "金額為賣家提供",
    body: "營收與價格皆由賣家提供，未經 Bezold 查核，請在交易前自行核對。",
  },
  {
    title: "請勿提供登入資訊",
    body: NO_CREDENTIALS_WARNING,
  },
];

export const VERIFICATION_IMAGE_TITLE = "營收與數據截圖（必填）";

export const VERIFICATION_IMAGE_GUIDE = [
  "請上傳後台的營收報表或數據截圖。例如蝦皮賣家中心的月營收、Shopify／電商後台的訂單報表、FB 社團洞察報告、GA 流量、App 下載數。",
  "截圖要看得到帳號或賣場名稱，方便我們對應你填的資產連結。",
  "不會出現在公開頁面。Bezold 用來核對資料；潛在買家支付賣家資料解鎖費後，也會收到這些截圖（費用由潛在買家付，刊登免費）。",
  "請遮住個資，不要截到密碼或驗證碼。",
];
