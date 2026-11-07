// * no `@/` imports here — tests/unit runs this file with plain `node --test`.
// * The caller passes only approved physical listings; this just orders,
// * dedupes and caps them.

interface PickRelatedStoresInput<StoreLike extends { id: string }> {
  currentStoreId: string;
  sameCity: StoreLike[];
  sameCategory: StoreLike[];
  limit?: number;
}

// * same city first (closest substitute for a buyer), topped up with the same
// * category, never the store being viewed, each listing at most once
export const pickRelatedStores = <StoreLike extends { id: string }>({
  currentStoreId,
  sameCity,
  sameCategory,
  limit = 6,
}: PickRelatedStoresInput<StoreLike>): StoreLike[] => {
  const seenIds = new Set([currentStoreId]);
  const related: StoreLike[] = [];

  for (const store of [...sameCity, ...sameCategory]) {
    if (related.length === limit) break;
    if (seenIds.has(store.id)) continue;
    seenIds.add(store.id);
    related.push(store);
  }

  return related;
};
