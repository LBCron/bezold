import type { Metadata } from "next";
import { pageMetadata } from "@/utils/seo";
import SiteNav from "@/app/(new)/_components/SiteNav";
import SiteFooter from "@/app/(new)/_components/SiteFooter";
import EmailVerifiedGate from "@/app/(new)/_components/EmailVerifiedGate";
import SellForm from "./_components/SellForm";
import { LISTING_TYPE } from "@/types";
import { isDigitalAssetsLaunched } from "@/utils/digitalAsset";
import styles from "./page.module.css";

export const metadata: Metadata = pageMetadata({
  title: "免費刊登頂讓店面",
  description: "在 Bezold 頂讓必售 免費刊登您的頂讓店面，快速找到合適買家。",
  path: "/sell",
});

export default function SellPage({
  searchParams,
}: {
  searchParams: { type?: string | string[] };
}) {
  // * the homepage / list page 「刊登數位資產」 links land on ?type=digital
  const isDigital = searchParams.type === LISTING_TYPE.DIGITAL;
  const sellPath = isDigital ? "/sell?type=digital" : "/sell";

  return (
    <>
      <SiteNav activeLink="我要頂出" />
      <main className={styles.main}>
        <h1 className={styles.heading}>
          限時<strong>免費刊登</strong>
        </h1>
        <p className={styles.subheading}>
          填寫以下資料，審核後即可上架。完全免費，沒有中間人。
        </p>
        <EmailVerifiedGate
          source="sell_gate"
          redirectPath={sellPath}
          title="刊登前請先驗證信箱"
          context={
            isDigital
              ? "驗證完成後就能刊登你的數位資產"
              : "驗證完成後就能刊登你的店面"
          }
        >
          <SellForm
            initialListingType={
              isDigital ? LISTING_TYPE.DIGITAL : LISTING_TYPE.PHYSICAL
            }
            digitalAssetsLaunched={isDigitalAssetsLaunched()}
          />
        </EmailVerifiedGate>
      </main>
      <SiteFooter />
    </>
  );
}
