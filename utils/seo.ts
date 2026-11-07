import type { Metadata } from "next";
import { BASE_OPEN_GRAPH } from "@/constant/seo";
import { STORE_CATEGORIES } from "@/constant/storeType";
import { EQUIPMENT_LABEL } from "@/constant/storeEquipment";
import { STORE_CATEGORY, STORE_STATUS, type Store } from "@/types";
import { formatPrice, formatPriceDisplay, isDigitalAsset } from "@/utils/store";
import {
  buildPlaceLabel,
  buildStoreDescription,
  buildStoreTitle,
  toFeeFact,
} from "@/utils/storeMeta";
import { truncateText } from "@/utils/text";

interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
  images?: string[];
}

// * title / description / canonical / og in one call, so a page can never
// * silently inherit the homepage's canonical or share card again
export const pageMetadata = ({
  title,
  description,
  path,
  images,
}: PageMetadataInput): Metadata => ({
  title,
  description,
  alternates: { canonical: path },
  openGraph: {
    ...BASE_OPEN_GRAPH,
    title,
    description,
    url: path,
    images: images ?? [...BASE_OPEN_GRAPH.images],
  },
});

// * flatten line breaks and cap the length for <meta name="description">
export const toMetaDescription = (text: string, maxLength = 120) =>
  truncateText(text.replace(/\s+/g, " ").trim(), maxLength);

// * 其他 says nothing in a title — only real categories are named
const categoryLabel = (category?: string) =>
  category === STORE_CATEGORY.OTHERS
    ? undefined
    : STORE_CATEGORIES.find(({ key }) => key === category)?.label;

const storePlaceLabel = (
  store: Pick<Store, "city" | "district" | "category">,
) =>
  buildPlaceLabel({
    city: store.city,
    district: store.district,
    categoryLabel: categoryLabel(store.category),
  });

export const storePageTitle = (
  store: Pick<
    Store,
    "storeName" | "city" | "district" | "category" | "listingType" | "status"
  >,
) =>
  isDigitalAsset(store)
    ? `${store.storeName}｜數位資產頂讓`
    : buildStoreTitle({
        storeName: store.storeName,
        placeLabel: storePlaceLabel(store),
        isSold: store.status === STORE_STATUS.SOLD,
      });

// * physical listings: a facts sentence from structured data, then the
// * seller's text. Digital assets keep the plain excerpt of their description.
export const storePageDescription = (store: Store) => {
  if (isDigitalAsset(store)) return toMetaDescription(store.description);

  const isSold = store.status === STORE_STATUS.SOLD;
  const facts = [
    !isSold &&
      toFeeFact(formatPriceDisplay(store.price, store.priceNegotiable)),
    store.areaPing && `${store.areaPing} 坪`,
    store.monthlyRent && `月租 ${formatPrice(store.monthlyRent)}`,
    store.equipment && EQUIPMENT_LABEL[store.equipment],
  ].filter((fact): fact is string => !!fact);

  return buildStoreDescription({
    placeLabel: storePlaceLabel(store),
    facts,
    location: store.location ?? "",
    sellerText: store.description ?? "",
    isSold,
  });
};

// * schema.org offer for the store Product. A digital price range becomes an
// * AggregateOffer (lowPrice / highPrice). 面議 (price 0 + negotiable) has no
// * price to advertise — null, and the page skips the JSON-LD entirely.
export const storeOffer = (
  store: Pick<
    Store,
    "price" | "priceMax" | "priceNegotiable" | "currency" | "status"
  >,
  url: string,
) => {
  if (store.price === 0 && store.priceNegotiable) return null;

  // * sold listings stay indexed as closed deals
  const availability =
    store.status === STORE_STATUS.SOLD
      ? "https://schema.org/SoldOut"
      : "https://schema.org/InStock";
  const isRange =
    store.price > 0 && !!store.priceMax && store.priceMax > store.price;

  return isRange
    ? {
        "@type": "AggregateOffer",
        priceCurrency: store.currency,
        lowPrice: store.price,
        highPrice: store.priceMax,
        availability,
        url,
      }
    : {
        "@type": "Offer",
        priceCurrency: store.currency,
        price: store.price,
        availability,
        url,
      };
};
