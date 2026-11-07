import type { Metadata } from "next";
import { pageMetadata } from "@/utils/seo";
import LaunchBanner from "../_components/LaunchBanner";
import SiteNav from "../_components/SiteNav";
import SiteFooter from "../_components/SiteFooter";
import FaqHero from "./_components/FaqHero";
import FaqCategory from "./_components/FaqCategory";
import FaqCta from "./_components/FaqCta";
import { toFaqSchemaItems } from "./_components/faqItem";
import {
  buyerFaq,
  digitalAssetsFaq,
  platformFaq,
  processFaq,
  safetyFaq,
  sellerFaq,
} from "./_components/faqData";
import JsonLd from "../_components/JsonLd";
import { faqPageJsonLd } from "@/utils/structuredData";
import styles from "./page.module.css";

export const metadata: Metadata = pageMetadata({
  title: "常見問題",
  description:
    "關於頂讓平台的刊登、買賣流程、費用、安全保障等常見問題一次解答。",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <>
      <JsonLd
        data={faqPageJsonLd(
          toFaqSchemaItems([
            ...platformFaq,
            ...buyerFaq,
            ...sellerFaq,
            ...processFaq,
            ...safetyFaq,
            ...digitalAssetsFaq,
          ]),
        )}
      />
      <LaunchBanner />
      <SiteNav activeLink="常見問題" />
      <main className={styles.frame}>
        <FaqHero />
        <FaqCategory
          sectionNum="01"
          title="平台與刊登"
          sub="— 上架、修改、收費一次說清楚 —"
          variant="default"
          items={platformFaq}
        />
        <FaqCategory
          sectionNum="02"
          title="買家常見問題"
          sub="— 第一次找店接手，這些先看 —"
          variant="alt"
          items={buyerFaq}
        />
        <FaqCategory
          sectionNum="03"
          title="賣家常見問題"
          sub="— 定價、房東、撤刊都在這 —"
          variant="default"
          items={sellerFaq}
        />
        <FaqCategory
          sectionNum="04"
          title="頂讓流程"
          sub="— 從名詞到交接，逐步拆解 —"
          variant="alt"
          items={processFaq}
        />
        <FaqCategory
          sectionNum="05"
          title="安全與爭議"
          sub="— 遇到問題？這樣處理 —"
          variant="default"
          items={safetyFaq}
        />
        <FaqCategory
          sectionNum="06"
          title="數位資產頂讓"
          sub="— 解鎖費、退費、賣家截圖 —"
          variant="alt"
          items={digitalAssetsFaq}
        />
        <FaqCta />
      </main>
      <SiteFooter />
    </>
  );
}
