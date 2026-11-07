import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { getRelatedStores, getStoreById } from "@/firebase/serverUtils";
import { STORE_STATUS, type StoreStatus } from "@/types";
import { BASE_OPEN_GRAPH } from "@/constant/seo";
import {
  storeOffer,
  storePageDescription,
  storePageTitle,
  toMetaDescription,
} from "@/utils/seo";
import { isDigitalAsset, omitSellerContact } from "@/utils/store";
import LaunchBanner from "@/app/(new)/_components/LaunchBanner";
import SiteNav from "@/app/(new)/_components/SiteNav";
import SiteFooter from "@/app/(new)/_components/SiteFooter";
import FeaturedListings from "@/app/(new)/_components/FeaturedListings";
import StoreBreadcrumb from "./_components/StoreBreadcrumb";
import StoreGallery from "./_components/StoreGallery";
import StoreTitleRow from "./_components/StoreTitleRow";
import StoreDescription from "./_components/StoreDescription";
import StorePriceCard from "./_components/StorePriceCard";
import DigitalStatsBar from "./_components/DigitalStatsBar";
import DigitalHolderCard from "./_components/DigitalHolderCard";
import DigitalTransferNotes from "./_components/DigitalTransferNotes";
import BuyerClubPopup from "./_components/BuyerClubPopup";
import JsonLd from "@/app/(new)/_components/JsonLd";
import { breadcrumbJsonLd } from "@/utils/structuredData";
import styles from "./page.module.css";

interface StorePageProps {
  params: { storeId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

// * only live and sold listings belong in search — drafts, pending and
// * rejected pages stay reachable by direct link but are noindexed
const INDEXABLE_STATUSES: (StoreStatus | undefined)[] = [
  STORE_STATUS.APPROVED,
  STORE_STATUS.SOLD,
];

// * Firestore throws INVALID_ARGUMENT on reserved ids like "__foo__", which
// * would surface as a 500 — treat them as missing so the page 404s instead
const RESERVED_DOC_ID = /^__.*__$/;

const findStore = (storeId: string) =>
  RESERVED_DOC_ID.test(storeId) ? null : getStoreById(storeId);

export async function generateMetadata(
  { params }: StorePageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { storeId } = await params;
  const store = await findStore(storeId);
  const canonicalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/store/${storeId}`;

  if (!store) notFound();

  const storeTitle = storePageTitle(store);
  const storeDescription = storePageDescription(store);

  return {
    title: storeTitle,
    description: storeDescription,
    ...(!INDEXABLE_STATUSES.includes(store.status)
      ? { robots: { index: false, follow: false } }
      : {}),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      ...BASE_OPEN_GRAPH,
      title: storeTitle,
      // * digital assets keep their longer share-card excerpt
      description: isDigitalAsset(store)
        ? toMetaDescription(store.description, 200)
        : storeDescription,
      url: canonicalUrl,
      images: store.images.length ? store.images : [...BASE_OPEN_GRAPH.images],
    },
  };
}

export default async function StoreDetailPage({
  params,
  searchParams,
}: StorePageProps) {
  const { storeId } = await params;
  const { modal } = await searchParams;
  const fetchedStore = await findStore(storeId);

  if (!fetchedStore) notFound();

  // Seller contact never reaches the served HTML — SellerContactGate fetches the
  // real values client-side once the viewer is a signed-in member.
  const store = omitSellerContact(fetchedStore);

  // `?modal=buyer-club` force-opens the buyer club popup (used for paid ad
  // landings) and bypasses the once-per-day suppression.
  const forceOpenBuyerClub = modal === "buyer-club";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const storeUrl = `${appUrl}/store/${storeId}`;
  // * 面議 (price 0 + negotiable) has no price to advertise, and a Product
  // * without offers is an invalid rich result — skip the JSON-LD entirely
  const offer = storeOffer(store, storeUrl);
  const isDigital = isDigitalAsset(store);
  // * internal links to other live listings so crawlers (and buyers) keep
  // * going — physical stores only; digital assets have their own list
  const relatedStores = isDigital
    ? []
    : (await getRelatedStores(store)).map(omitSellerContact);

  return (
    <>
      {/* * mirrors StoreBreadcrumb — every store page, priced or not */}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "首頁", url: `${appUrl}/` },
          isDigital
            ? { name: "數位資產", url: `${appUrl}/digital-assets` }
            : { name: "我要找店", url: `${appUrl}/store-list` },
          { name: store.storeName },
        ])}
      />
      {offer && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Product",
            name: store.storeName,
            description: store.description,
            image: store.images.length
              ? store.images
              : [`${appUrl}/bezold-og.png`],
            url: storeUrl,
            offers: offer,
          }}
        />
      )}
      <LaunchBanner />
      <SiteNav activeLink={isDigital ? "數位資產" : "我要找店"} />
      <main className={styles.main}>
        <StoreBreadcrumb store={store} />
        {/* digital-asset photos are for Bezold review only — no gallery */}
        {!isDigital && <StoreGallery images={store.images} tags={store.tags} />}
        <StoreTitleRow store={store} />
        {isDigital && <DigitalStatsBar store={store} />}
        <div className={styles.mainCol}>
          <StoreDescription description={store.description} />
          {isDigital ? (
            <>
              <DigitalHolderCard store={store} />
              <DigitalTransferNotes />
            </>
          ) : (
            <StorePriceCard store={store} />
          )}
        </div>
      </main>
      <FeaturedListings
        stores={relatedStores}
        num="→"
        title="你可能也有興趣"
        sub="— 同地區、同類型的頂讓店面 —"
        more="看全部店面 →"
        moreHref="/store-list"
      />
      <SiteFooter />
      <BuyerClubPopup forceOpen={forceOpenBuyerClub} isDigital={isDigital} />
    </>
  );
}
