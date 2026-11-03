import type { Metadata } from "next";
import { pageMetadata } from "@/utils/seo";
import LaunchBanner from "@/app/(new)/_components/LaunchBanner";
import SiteNav from "@/app/(new)/_components/SiteNav";
import SiteFooter from "@/app/(new)/_components/SiteFooter";
import DigitalAssetResults from "./_components/DigitalAssetResults";
import DigitalAssetsTeaser from "./_components/DigitalAssetsTeaser";
import { getDigitalAssets } from "@/firebase/serverUtils/store";
import { STORE_STATUS } from "@/types";
import { toCard } from "@/utils/store";
import {
  filterByDigitalAssetTab,
  isDigitalAssetsLaunched,
  toDigitalAssetTab,
} from "@/utils/digitalAsset";

// * the pre-launch teaser returns before reading searchParams, which would let
// * Next build this page statically and keep the teaser past launch
export const dynamic = "force-dynamic";

const PAGE_TITLE = "數位資產頂讓｜電商、社群、網站轉讓 - Bezold";

export const metadata: Metadata = {
  ...pageMetadata({
    title: PAGE_TITLE,
    description:
      "瀏覽電商賣場、FB 社團、網站、App、SaaS 等數位資產頂讓。匿名刊登，每筆都經 Bezold 核對營收截圖；有興趣可在刊登頁申請查看賣家資料。",
    path: "/digital-assets",
  }),
  // * the spec's full title — skip the root "｜頂讓網 Bezold" template
  title: { absolute: PAGE_TITLE },
};

interface PageProps {
  searchParams: { type?: string | string[] };
}

export default async function DigitalAssetsPage({ searchParams }: PageProps) {
  // * rendered per request, so this flips on the first request after launch
  if (!isDigitalAssetsLaunched()) {
    return (
      <>
        <LaunchBanner />
        <SiteNav activeLink="數位資產" />
        <div className="flex-1">
          <DigitalAssetsTeaser />
        </div>
        <SiteFooter />
      </>
    );
  }

  // * ?type= is the only source of the filter; unknown values mean 全部
  const activeTab = toDigitalAssetTab(searchParams.type);

  const assets = await getDigitalAssets({
    statuses: [STORE_STATUS.APPROVED, STORE_STATUS.SOLD],
    coverOnly: true,
  });
  const tabAssets = filterByDigitalAssetTab(assets, activeTab);
  const approvedAssets = tabAssets.filter(
    (store) => store.status === STORE_STATUS.APPROVED,
  );
  const soldAssets = tabAssets.filter(
    (store) => store.status === STORE_STATUS.SOLD,
  );

  // * approved first, then sold — each keeps the query's newest-first order
  const results = [...approvedAssets, ...soldAssets].map((store) => ({
    id: store.id,
    sold: store.status === STORE_STATUS.SOLD,
    card: toCard(store),
  }));

  return (
    <>
      <LaunchBanner />
      <SiteNav activeLink="數位資產" />
      <div className="flex-1">
        <DigitalAssetResults
          results={results}
          approvedCount={approvedAssets.length}
          activeTab={activeTab}
        />
      </div>
      <SiteFooter />
    </>
  );
}
