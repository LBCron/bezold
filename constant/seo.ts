export const SITE_NAME = "Bezold 頂讓必售";

// * moved from app/layout.tsx so pages and helpers share one copy
export const SITE_TITLE = "頂讓網｜全台店面頂讓平台 - Bezold 頂讓必售";
export const SITE_DESCRIPTION =
  "頂讓網 Bezold — 全台店面頂讓平台。買家直接接手已有客群、設備、營運的店面；賣家把心血交給合適的人。店面頂讓、生意頂讓真實刊登，2026/12/1 前免費刊登，永久不抽成。";

// * Next replaces (not merges) the parent's openGraph when a page sets its
// * own, so every page-level openGraph must start from this base.
export const BASE_OPEN_GRAPH = {
  siteName: SITE_NAME,
  type: "website" as const,
  locale: "zh_TW",
  images: ["/bezold-og.png"],
};
