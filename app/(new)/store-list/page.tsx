import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageMetadata, toMetaDescription } from "@/utils/seo";
import styles from "./page.module.css";
import LaunchBanner from "@/app/(new)/_components/LaunchBanner";
import SiteNav from "@/app/(new)/_components/SiteNav";
import SiteFooter from "@/app/(new)/_components/SiteFooter";
import JsonLd from "@/app/(new)/_components/JsonLd";
import Pagination from "@/components/refactored/Pagination";
import Breadcrumbs from "./_components/Breadcrumbs";
import SearchBar from "./_components/SearchBar";
import ActiveFilters from "./_components/ActiveFilters";
import ResultsArea from "./_components/ResultsArea";
import { queryStores, resolveStoreImages } from "@/firebase/serverUtils";
import { STORE_STATUS } from "@/types";
import { toCard } from "@/utils/store";
import { itemListPageJsonLd } from "@/utils/structuredData";
import {
  STORE_LIST_PAGE_SIZE,
  paginate,
  parsePage,
  parseSort,
  sortStores,
  storeListHref,
} from "@/utils/storeListPaging";

const PAGE_TITLE = "全台頂讓店面列表";
// * comfortably more than the 2 lines a card shows at any width
const CARD_DESCRIPTION_LENGTH = 80;

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

// * page 2+ is its own canonical URL so its stores can be crawled; filtered
// * views keep pointing at the unfiltered list, as before
export function generateMetadata({ searchParams }: PageProps): Metadata {
  const page = parsePage(searchParams.page);
  return pageMetadata({
    title: page > 1 ? `${PAGE_TITLE}（第 ${page} 頁）` : PAGE_TITLE,
    description:
      "瀏覽全台頂讓店面。依地區、行業、頂讓金快速篩選，直接聯絡賣家，沒有中間人。",
    path: page > 1 ? `/store-list?page=${page}` : "/store-list",
  });
}

export default async function StoreListPage({ searchParams }: PageProps) {
  // * repeated params collapse to their first value
  const filters = Object.fromEntries(
    Object.entries(searchParams).flatMap(([key, value]) => {
      const firstValue = Array.isArray(value) ? value[0] : value;
      return firstValue === undefined ? [] : [[key, firstValue]];
    }),
  );
  const sort = parseSort(searchParams.sort);
  const page = parsePage(searchParams.page);

  // * sort and page on the server, then sign covers for this page only
  const stores = await queryStores(filters, [STORE_STATUS.APPROVED]);
  const result = paginate(sortStores(stores, sort), page, STORE_LIST_PAGE_SIZE);
  if (!result) notFound();

  const pageStores = await resolveStoreImages(result.items, {
    coverOnly: true,
  });
  // * cards clamp the description to 2 lines — send only a preview, not the
  // * seller's full text (it is serialized twice: HTML + RSC payload)
  const cards = pageStores.map((store) => {
    const card = toCard(store);
    return {
      id: store.id,
      card: {
        ...card,
        description:
          card.description &&
          toMetaDescription(card.description, CARD_DESCRIPTION_LENGTH),
      },
    };
  });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  return (
    <>
      <JsonLd
        data={itemListPageJsonLd({
          name: page > 1 ? `${PAGE_TITLE}（第 ${page} 頁）` : PAGE_TITLE,
          url: `${appUrl}${storeListHref(filters, { page, sort })}`,
          itemUrls: cards.map(({ id }) => `${appUrl}/store/${id}`),
          positionOffset: result.firstPosition - 1,
        })}
      />
      <LaunchBanner />
      <SiteNav activeLink="我要找店" />
      <main className={styles.main}>
        <Breadcrumbs count={result.totalItems} />
        <SearchBar />
        <ActiveFilters />
        <ResultsArea
          cards={cards}
          totalItems={result.totalItems}
          firstPosition={result.firstPosition}
          lastPosition={result.lastPosition}
          sort={sort}
          pagination={
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              hrefFor={(pageNumber) =>
                storeListHref(filters, { page: pageNumber, sort })
              }
              label="店面列表分頁"
            />
          }
        />
      </main>
      <SiteFooter />
    </>
  );
}
