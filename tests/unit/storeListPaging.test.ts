import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  paginate,
  parsePage,
  parseSort,
  sortStores,
  storeListHref,
} from "../../utils/storeListPaging.ts";

describe("parsePage", () => {
  it("reads a positive whole number", () => {
    assert.equal(parsePage("3"), 3);
  });

  it("falls back to page 1 for anything else", () => {
    for (const value of [undefined, "", "0", "-2", "abc", "2.5", ["2", "3"]]) {
      assert.equal(parsePage(value), 1, String(value));
    }
  });
});

describe("parseSort", () => {
  it("accepts the three known sorts", () => {
    assert.equal(parseSort("price-asc"), "price-asc");
    assert.equal(parseSort("price-desc"), "price-desc");
    assert.equal(parseSort("newest"), "newest");
  });

  it("defaults to newest", () => {
    assert.equal(parseSort(undefined), "newest");
    assert.equal(parseSort("cheapest"), "newest");
    assert.equal(parseSort(["price-asc"]), "newest");
  });
});

describe("sortStores", () => {
  const stores = [
    { id: "old-cheap", price: 10, createTime: new Date("2026-01-01") },
    { id: "new-pricey", price: 90, createTime: new Date("2026-03-01") },
    { id: "mid", price: 50, createTime: new Date("2026-02-01") },
  ];

  it("sorts newest first by default", () => {
    assert.deepEqual(
      sortStores(stores, "newest").map((store) => store.id),
      ["new-pricey", "mid", "old-cheap"],
    );
  });

  it("sorts by price both ways", () => {
    assert.deepEqual(
      sortStores(stores, "price-asc").map((store) => store.id),
      ["old-cheap", "mid", "new-pricey"],
    );
    assert.deepEqual(
      sortStores(stores, "price-desc").map((store) => store.id),
      ["new-pricey", "mid", "old-cheap"],
    );
  });

  it("does not reorder the input", () => {
    sortStores(stores, "price-asc");
    assert.equal(stores[0].id, "old-cheap");
    assert.equal(stores[1].id, "new-pricey");
  });
});

describe("paginate", () => {
  const items = Array.from({ length: 50 }, (_, index) => index + 1);

  it("returns the requested page with its 1-based range", () => {
    assert.deepEqual(paginate(items, 2, 24), {
      items: items.slice(24, 48),
      page: 2,
      totalPages: 3,
      totalItems: 50,
      firstPosition: 25,
      lastPosition: 48,
    });
  });

  it("returns a short last page", () => {
    const result = paginate(items, 3, 24);
    assert.deepEqual(result?.items, [49, 50]);
    assert.equal(result?.lastPosition, 50);
  });

  it("returns null for a page past the end", () => {
    assert.equal(paginate(items, 4, 24), null);
  });

  it("treats an empty list as one empty page", () => {
    assert.deepEqual(paginate([], 1, 24), {
      items: [],
      page: 1,
      totalPages: 1,
      totalItems: 0,
      firstPosition: 0,
      lastPosition: 0,
    });
    assert.equal(paginate([], 2, 24), null);
  });
});

describe("storeListHref", () => {
  it("keeps filters and adds page and sort", () => {
    assert.equal(
      storeListHref(
        { city: "臺北市", tag: "EMERGENCY" },
        { page: 2, sort: "price-asc" },
      ),
      "/store-list?city=%E8%87%BA%E5%8C%97%E5%B8%82&tag=EMERGENCY&sort=price-asc&page=2",
    );
  });

  it("leaves out page 1 and the default sort", () => {
    assert.equal(
      storeListHref({ category: "RESTAURANT" }, { page: 1, sort: "newest" }),
      "/store-list?category=RESTAURANT",
    );
    assert.equal(storeListHref({}, { page: 1, sort: "newest" }), "/store-list");
  });

  it("drops any page or sort already in the filters", () => {
    assert.equal(
      storeListHref(
        { city: "新北市", page: "5", sort: "price-desc" },
        { page: 2, sort: "newest" },
      ),
      "/store-list?city=%E6%96%B0%E5%8C%97%E5%B8%82&page=2",
    );
  });
});
