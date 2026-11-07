import type { Metadata } from "next";
import { pageMetadata } from "@/utils/seo";
import LaunchBanner from "../_components/LaunchBanner";
import SiteNav from "../_components/SiteNav";
import SiteFooter from "../_components/SiteFooter";
import GuideHero from "./_components/GuideHero";
import GlossaryGrid from "./_components/GlossaryGrid";
import BuyerSteps from "./_components/BuyerSteps";
import SellerSteps from "./_components/SellerSteps";
import PitfallsList from "./_components/PitfallsList";
import GuideCta from "./_components/GuideCta";
import styles from "./page.module.css";

export const metadata: Metadata = pageMetadata({
  title: "頂讓是什麼？頂讓流程、頂讓金與注意事項一次看懂",
  description:
    "頂讓是把已在營運的店面，連同客群、設備與租約一起轉手給新老闆。頂讓金怎麼算、買店與頂出 4 步驟流程、常見地雷，第一次接手店面也能一頁看懂。",
  path: "/store-guide",
});

export default function StoreGuidePage() {
  return (
    <>
      <LaunchBanner />
      <SiteNav activeLink="頂讓指南" />
      <div className={styles.frame}>
        <GuideHero />
        <GlossaryGrid />
        <BuyerSteps />
        <SellerSteps />
        <PitfallsList />
        <GuideCta />
      </div>
      <SiteFooter />
    </>
  );
}
