import { type StoreCard } from "@/components/refactored/StoreCard";
import {
  type Store,
  type SellerContact,
  type DigitalAssetType,
  type ListingType,
  LISTING_TYPE,
  STORE_STATUS,
} from "@/types";
import { RIBBON_DISPLAY, RIBBON_PRIORITY } from "@/constant/storeDisplay";
import { EQUIPMENT_LABEL } from "@/constant/storeEquipment";
import { DIGITAL_ASSET_TYPE_LABEL } from "@/constant/digitalAsset";

export function formatPriceParts(price: number): {
  amount: string;
  unit: string;
} {
  if (price < 10_000) return { amount: `NT$ ${price}`, unit: "元" };
  if (price < 100_000_000)
    return { amount: `NT$ ${Math.round(price / 10_000)}`, unit: "萬" };
  return {
    amount: `NT$ ${(price / 100_000_000).toFixed(2).replace(/\.?0+$/, "")}`,
    unit: "億",
  };
}

export function formatPrice(price: number): string {
  const { amount, unit } = formatPriceParts(price);
  return `${amount} ${unit}`;
}

// * single source of truth for the buyer-facing 頂讓金 label across all cards.
// * price 0 + negotiable = 面議; price 0 + !negotiable = 免頂讓金 (free transfer);
// * price > 0 + negotiable = 可面議. `undefined` is treated as false.
export function formatPriceDisplay(
  price: number,
  priceNegotiable?: boolean,
): string {
  if (price === 0) return priceNegotiable ? "面議" : "免頂讓金";
  const base = formatPrice(price);
  return priceNegotiable ? `${base}（可面議）` : base;
}

// * digital assets may list a price range: `price` is the lower bound and
// * `priceMax` the upper. Anything that isn't a real range (no upper bound,
// * upper <= lower, lower 0) falls back to the single-price label.
export function formatPriceRange(
  price: number,
  priceMax?: number,
  priceNegotiable?: boolean,
): string {
  if (!(price > 0 && priceMax && priceMax > price))
    return formatPriceDisplay(price, priceNegotiable);

  const low = formatPriceParts(price);
  const high = formatPriceParts(priceMax);
  const highAmount = high.amount.replace(/^NT\$ /, "");

  let range: string;
  if (low.unit !== high.unit)
    range = `${low.amount} ${low.unit}–${highAmount} ${high.unit}`;
  else if (low.amount === high.amount)
    // * bounds that round to the same label (50.1 萬–50.4 萬) read as one price
    return formatPriceDisplay(price, priceNegotiable);
  else range = `${low.amount}–${highAmount} ${high.unit}`;

  return priceNegotiable ? `${range}（可面議）` : range;
}

// * listingType is absent on every store created before digital assets
// * existed — treat missing as physical so no backfill is needed
export const isDigitalAsset = (store: Pick<Store, "listingType">) =>
  store.listingType === LISTING_TYPE.DIGITAL;

export const listingTypeOf = (
  store: Pick<Store, "listingType">,
): ListingType =>
  isDigitalAsset(store) ? LISTING_TYPE.DIGITAL : LISTING_TYPE.PHYSICAL;

// * "電商 · 社群" — the digital stand-in for a store's location line
export const formatDigitalTypes = (digitalTypes?: DigitalAssetType[]) =>
  (digitalTypes ?? [])
    .map((type) => DIGITAL_ASSET_TYPE_LABEL[type])
    .join(" · ");

function tagRibbon(store: Store): StoreCard["ribbon"] {
  const tags = store.tags ?? [];
  const ribbonTag = RIBBON_PRIORITY.find((tag) => tags.includes(tag));
  return ribbonTag ? RIBBON_DISPLAY[ribbonTag] : undefined;
}

export function storeToCard(store: Store): StoreCard {
  const ribbon = tagRibbon(store);

  const locationParts = [store.city, store.location || store.district].filter(
    Boolean,
  );
  const location =
    locationParts.length > 0 ? locationParts.join(" · ") : undefined;

  const price = formatPriceDisplay(store.price, store.priceNegotiable);

  let rentSpec = "租金 —";
  if (store.monthlyRent) {
    const { amount, unit } = formatPriceParts(store.monthlyRent);
    rentSpec =
      unit === "元"
        ? `租金 NT$ ${store.monthlyRent.toLocaleString()}/月`
        : `租金 ${amount} ${unit}/月`;
  }

  const specs: StoreCard["specs"] = [
    { iconName: "ruler", label: store.areaPing ? `${store.areaPing} 坪` : "—" },
    { iconName: "banknote", label: rentSpec },
    {
      iconName: "package",
      label: store.equipment ? EQUIPMENT_LABEL[store.equipment] : "—",
    },
  ];

  return {
    ribbon,
    image: store.images?.[0],
    title: store.storeName,
    location,
    description: store.description || undefined,
    specs,
    price,
  };
}

export function digitalAssetToCard(store: Store): StoreCard {
  const ribbon: StoreCard["ribbon"] =
    store.status === STORE_STATUS.SOLD
      ? { label: "已頂讓", variant: "sold" }
      : tagRibbon(store);

  const specs: StoreCard["specs"] = [
    {
      iconName: "clock",
      label:
        store.operatingYears != null
          ? `經營 ${store.operatingYears} 年`
          : "經營 —",
    },
    {
      iconName: "trendingUp",
      label:
        store.monthlyRevenue != null
          ? `月營收 ${formatPrice(store.monthlyRevenue)}`
          : "月營收 —",
    },
  ];

  // * no image: digital-asset photos never reach a public card
  return {
    ribbon,
    photoLabel: "數位資產",
    title: store.storeName,
    location: formatDigitalTypes(store.digitalTypes) || undefined,
    description: store.description || undefined,
    specs,
    price: formatPriceRange(store.price, store.priceMax, store.priceNegotiable),
  };
}

export function toCard(store: Store): StoreCard {
  return isDigitalAsset(store) ? digitalAssetToCard(store) : storeToCard(store);
}

// * ── Digital asset writes ──────────────────────────────────────────────────
// * form inputs hold raw strings; numbers are parsed here so both admin forms
// * (and later the seller form) write the same shape

type DigitalAssetFormValues = Pick<
  Partial<Store>,
  "digitalTypes" | "assetUrl"
> & {
  operatingYears?: number | string;
  monthlyRevenue?: number | string;
  priceMax?: number | string;
};

// * "" / undefined / non-numeric → undefined, so the field is left out
const parseOptionalNumber = (value?: number | string): number | undefined => {
  if (value === undefined || String(value).trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

// * digital assets have no location — strings are "" (never undefined, which
// * updateDoc rejects) so physical queries and forms never match them
export const DIGITAL_ASSET_EMPTY_LOCATION = {
  city: "",
  district: "",
  location: "",
  category: "",
};

export function digitalAssetWriteFields(values: DigitalAssetFormValues) {
  const operatingYears = parseOptionalNumber(values.operatingYears);
  const monthlyRevenue = parseOptionalNumber(values.monthlyRevenue);
  return {
    listingType: LISTING_TYPE.DIGITAL,
    digitalTypes: values.digitalTypes ?? [],
    assetUrl: (values.assetUrl ?? "").trim(),
    // * 0 = no range — lets a cleared upper bound overwrite the old one
    priceMax: parseOptionalNumber(values.priceMax) ?? 0,
    ...(operatingYears !== undefined ? { operatingYears } : {}),
    ...(monthlyRevenue !== undefined ? { monthlyRevenue } : {}),
  };
}

export const genDefaultStore = () => {
  return {
    storeName: "",
    location: "",
    description: "",
    price: 1000000,
    currency: "TWD",
  };
};

// * ── Seller contact ────────────────────────────────────────────────────────
// * Real phone / LINE / Threads / email never reach a logged-out visitor's HTML or the
// * public store API — the fields are blanked, including whether the seller
// * filled them in at all. Signed-in members read the real values from
// * GET /api/stores/[id]/contact (see SellerContactGate).

const EMPTY_CONTACT: SellerContact = {
  phone: "",
  lineId: "",
  threadsId: "",
  email: "",
};

// * assetUrl (admin-only) and verificationImages (admin/owner-only) go through
// * the same gate — blanked when present, never added when absent. Digital
// * assets are anonymous: even the seller's name and photos are dropped.
export function omitSellerContact(store: Store): Store {
  const publicStore = { ...store };
  if (isDigitalAsset(store)) {
    delete publicStore.userInfo;
    publicStore.images = [];
  } else if (store.userInfo)
    publicStore.userInfo = { ...store.userInfo, ...EMPTY_CONTACT };
  if (store.assetUrl !== undefined) publicStore.assetUrl = "";
  if (store.verificationImages !== undefined)
    publicStore.verificationImages = [];
  return publicStore;
}
