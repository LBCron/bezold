// * /store-list paging and sorting — the URL is the source of truth (?page,
// * ?sort, plus the filter params). No `@/` imports here — tests/unit runs
// * this file with plain `node --test`.

export const STORE_LIST_PAGE_SIZE = 24;

export const STORE_LIST_SORTS = ["newest", "price-asc", "price-desc"] as const;
export type StoreListSort = (typeof STORE_LIST_SORTS)[number];
const DEFAULT_SORT: StoreListSort = "newest";

type SearchParamValue = string | string[] | undefined;

// * anything but a positive whole number (missing, 0, "abc", repeated) is page 1
export const parsePage = (value: SearchParamValue) => {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return 1;
  return Math.max(1, Number(value));
};

export const parseSort = (value: SearchParamValue): StoreListSort =>
  STORE_LIST_SORTS.find((sort) => sort === value) ?? DEFAULT_SORT;

export const sortStores = <
  StoreLike extends { price: number; createTime: Date },
>(
  stores: StoreLike[],
  sort: StoreListSort,
): StoreLike[] => {
  const sorted = [...stores];
  if (sort === "price-asc") return sorted.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") return sorted.sort((a, b) => b.price - a.price);
  return sorted.sort((a, b) => b.createTime.getTime() - a.createTime.getTime());
};

// * null for a page past the end — the page 404s instead of rendering an
// * empty duplicate. An empty list is still one (empty) page.
export const paginate = <Item>(
  items: Item[],
  page: number,
  pageSize: number,
) => {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (page > totalPages) return null;

  const start = (page - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);
  return {
    items: pageItems,
    page,
    totalPages,
    totalItems,
    firstPosition: pageItems.length ? start + 1 : 0,
    lastPosition: start + pageItems.length,
  };
};

// * filters stay as they are; page 1 and the default sort are left out so
// * every listing state has one URL
export const storeListHref = (
  filters: Record<string, string>,
  { page, sort }: { page: number; sort: StoreListSort },
) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (key !== "page" && key !== "sort") params.set(key, value);
  }
  if (sort !== DEFAULT_SORT) params.set("sort", sort);
  if (page > 1) params.set("page", String(page));

  const query = params.toString();
  return query ? `/store-list?${query}` : "/store-list";
};
