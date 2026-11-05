import { db } from "@/firebase/server";
import {
  LISTING_TYPE,
  Store,
  STORE_CATEGORY,
  STORE_STATUS,
  STORE_TAG,
  type StoreStatus,
} from "@/types";
import { getImagesByPath } from "./image";
import { getUserById, getUsersByIds, timestampToDate } from "./user";
import { COLLECTIONS } from "@/firebase/constants";
import { isDigitalAsset } from "@/utils/store";

const COLLECTION = COLLECTIONS.STORE;

// * shared shape mapping — Firestore Timestamps → Date, doc id folded in.
const mapDocsToStores = (
  snapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
): Store[] =>
  snapshot.docs.map((doc) => {
    const storeData = doc.data();
    return {
      id: doc.id,
      ...storeData,
      createTime: storeData.createTime.toDate(),
      updateTime: storeData.updateTime.toDate(),
    } as Store;
  });

// * physical lists skip digital assets in memory — `where("listingType", "!=",
// * "digital")` would also drop every legacy doc that has no listingType.
// * Always filter before slicing so digital assets don't eat the count.
const physicalOnly = (stores: Store[]): Store[] =>
  stores.filter((store) => !isDigitalAsset(store));

// * resolve raw Storage paths to visible download URLs, mutating in place.
// * coverOnly: list cards only show images[0], so skip resolving (and
// * serializing) the rest — store.images becomes [coverUrl]
const resolveStoreImages = async (
  stores: Store[],
  { coverOnly = false }: { coverOnly?: boolean } = {},
): Promise<Store[]> => {
  await Promise.all(
    stores.map(async (store) => {
      if (store?.images?.length > 0) {
        const imagePaths = coverOnly ? store.images.slice(0, 1) : store.images;
        store.images = await getImagesByPath(imagePaths);
      }
    }),
  );
  return stores;
};

// Store related

interface GetStoresOptions {
  // * public pages pass the statuses they may show; admin passes nothing
  statuses?: StoreStatus[];
  // * public lists only need the cover image
  coverOnly?: boolean;
}

export const getStores = async (
  searchObj: Record<string, string>,
  { statuses, coverOnly }: GetStoresOptions = {},
) => {
  const storesRef = db.collection(COLLECTION);

  // * default search object to reduce the firestore compound index
  const defaultSearchObj = {
    category: "all",
    amountMin: 0,
  };
  const mergedSearchObj = { ...defaultSearchObj, ...searchObj };

  const storesWithQueryRef = Object.entries(mergedSearchObj).reduce(
    (ref, [searchObjKey, searchValue]) => {
      switch (searchObjKey) {
        case "city": {
          // * multi-select — "city" is a comma-separated list of city names.
          // * `in` reuses the same composite index as `==` (Taiwan has ~22
          // * cities, well under Firestore's 30-value `in` limit).
          const cityList = String(searchValue).split(",").filter(Boolean);
          if (cityList.length === 0) return ref;
          return ref.where("city", "in", cityList);
        }
        // case "district":
        //   if (searchValue === "all") return ref.where("district", "in", []);
        //   return ref.where("district", "==", searchValue);
        case "tag":
          if (searchValue === "all") return ref;
          return ref.where("tags", "array-contains", searchValue);
        case "amountMin":
          return ref.where(
            "price",
            ">=",
            parseInt(searchValue as string) * 10000,
          );
        case "amountMax":
          if (searchValue === "Infinity") return ref;
          return ref.where(
            "price",
            "<=",
            parseInt(searchValue as string) * 10000,
          );
        case "category":
          if (searchValue === "all")
            return ref.where("category", "in", Object.values(STORE_CATEGORY));
          return ref.where("category", "==", searchValue);
        default:
          return ref;
      }
    },
    storesRef as FirebaseFirestore.Query<FirebaseFirestore.DocumentData>,
  );
  const snapshot = await storesWithQueryRef.orderBy("createTime", "desc").get();

  // * filter in memory — an extra `where` would need a new composite index —
  // * and before signing images, so hidden stores cost nothing
  const stores = physicalOnly(mapDocsToStores(snapshot)).filter(
    (store) => !statuses || (!!store.status && statuses.includes(store.status)),
  );
  return resolveStoreImages(stores, { coverOnly });
};

export const getStoreById = async (storeId: string) => {
  const storeRef = db.collection(COLLECTION).doc(storeId);
  const doc = await storeRef.get();
  if (!doc.exists) {
    return null;
  } else {
    const storeData = doc.data();
    // TODO: might not get all images, only get the first one
    const images = await getImagesByPath(storeData!.images);

    let userData = undefined;
    if (storeData?.user) {
      userData = await getUserById(storeData!.user);
    }

    const store = {
      id: doc.id,
      ...storeData,
      createTime: storeData!.createTime.toDate(),
      updateTime: storeData!.updateTime.toDate(),
      images: images,
      userInfo: userData,
    } as Store;
    return store;
  }
};

export const getHighlightedStores = async () => {
  const storesRef = db.collection(COLLECTION);

  const snapshot = await storesRef
    .where("tags", "array-contains", STORE_TAG.RECOMMENDED)
    .orderBy("createTime", "desc")
    .get();

  // * limit to 9 approved stores — filter before slicing so unapproved
  // * stores don't eat into the displayed count
  const approvedStores = physicalOnly(mapDocsToStores(snapshot))
    .filter((store) => store.status === STORE_STATUS.APPROVED)
    .slice(0, 9);

  return resolveStoreImages(approvedStores, { coverOnly: true });
};

export const getEmergencyStores = async () => {
  const storesRef = db.collection(COLLECTION);

  const snapshot = await storesRef
    .where("tags", "array-contains", STORE_TAG.EMERGENCY)
    .orderBy("createTime", "desc")
    .get();

  // * limit to 9 approved stores — filter before slicing so unapproved
  // * stores don't eat into the displayed count
  const approvedStores = physicalOnly(mapDocsToStores(snapshot))
    .filter((store) => store.status === STORE_STATUS.APPROVED)
    .slice(0, 9);

  return resolveStoreImages(approvedStores, { coverOnly: true });
};

export const getSoldStores = async () => {
  const storesRef = db.collection(COLLECTION);

  // * single-field equality query — no composite index needed; sort in memory
  const snapshot = await storesRef
    .where("status", "==", STORE_STATUS.SOLD)
    .get();

  // * newest transfers first — updateTime records when the status flipped to
  // * sold (via updateStoreStatus), unlike createTime which is the listing date.
  const soldStores = physicalOnly(mapDocsToStores(snapshot))
    .sort((a, b) => b.updateTime.getTime() - a.updateTime.getTime())
    .slice(0, 9);

  return resolveStoreImages(soldStores, { coverOnly: true });
};

interface GetDigitalAssetsOptions {
  statuses: StoreStatus[];
  limit?: number;
  coverOnly?: boolean;
}

// * status is part of the query so hidden (pending / draft / rejected) assets
// * are never read. Needs the composite index listingType ASC, status ASC,
// * createTime DESC (firestore.indexes.json) — `==` and `in` share it.
export const getDigitalAssets = async ({
  statuses,
  limit,
  coverOnly,
}: GetDigitalAssetsOptions): Promise<Store[]> => {
  try {
    const digitalRef = db
      .collection(COLLECTION)
      .where("listingType", "==", LISTING_TYPE.DIGITAL);
    const statusRef =
      statuses.length === 1
        ? digitalRef.where("status", "==", statuses[0])
        : digitalRef.where("status", "in", statuses);
    const orderedRef = statusRef.orderBy("createTime", "desc");
    const snapshot = await (limit ? orderedRef.limit(limit) : orderedRef).get();

    // * images resolve after the limit, so only displayed covers are signed
    return await resolveStoreImages(mapDocsToStores(snapshot), { coverOnly });
  } catch (error) {
    // * e.g. index not built yet — callers render their empty state, not a 500
    console.error("getDigitalAssets failed", error);
    return [];
  }
};

// TODO: create store

// * createTime desc, id as the tie-breaker; a store missing createTime sorts last
const newestFirst = (left: Store, right: Store) => {
  const timeDifference =
    (right.createTime?.getTime() ?? 0) - (left.createTime?.getTime() ?? 0);
  return timeDifference || left.id.localeCompare(right.id);
};

// * admin CSV export (#99): every store except drafts, physical and digital,
// * with its seller joined in one batched read. Images stay raw paths. No
// * orderBy — it would silently drop any doc missing createTime.
export const getStoresForExport = async (): Promise<Store[]> => {
  const snapshot = await db.collection(COLLECTION).get();
  const stores = snapshot.docs
    .map((doc) => {
      const storeData = doc.data();
      return {
        id: doc.id,
        ...storeData,
        createTime: timestampToDate(storeData.createTime),
        updateTime: timestampToDate(storeData.updateTime),
      } as Store;
    })
    .filter((store) => store.status !== STORE_STATUS.DRAFT);

  const sellerIds = Array.from(
    new Set(stores.flatMap((store) => (store.user ? [store.user] : []))),
  );
  const sellers = await getUsersByIds(sellerIds);

  return stores
    .map((store) => ({
      ...store,
      userInfo: store.user ? sellers.get(store.user) : undefined,
    }))
    .sort(newestFirst);
};
