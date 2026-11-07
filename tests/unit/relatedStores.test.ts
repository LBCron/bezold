import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { pickRelatedStores } from "../../utils/relatedStores.ts";

const ids = (stores: { id: string }[]) => stores.map((store) => store.id);

describe("pickRelatedStores", () => {
  it("puts same-city stores before same-category stores", () => {
    const related = pickRelatedStores({
      currentStoreId: "current",
      sameCity: [{ id: "city-1" }, { id: "city-2" }],
      sameCategory: [{ id: "category-1" }],
    });

    assert.deepEqual(ids(related), ["city-1", "city-2", "category-1"]);
  });

  it("never includes the current store", () => {
    const related = pickRelatedStores({
      currentStoreId: "current",
      sameCity: [{ id: "current" }, { id: "city-1" }],
      sameCategory: [{ id: "current" }, { id: "category-1" }],
    });

    assert.deepEqual(ids(related), ["city-1", "category-1"]);
  });

  it("lists a store found by both city and category only once", () => {
    const related = pickRelatedStores({
      currentStoreId: "current",
      sameCity: [{ id: "both" }, { id: "city-1" }],
      sameCategory: [{ id: "both" }, { id: "category-1" }],
    });

    assert.deepEqual(ids(related), ["both", "city-1", "category-1"]);
  });

  it("caps the result at 6 by default", () => {
    const sameCity = Array.from({ length: 5 }, (_, index) => ({
      id: `city-${index}`,
    }));
    const sameCategory = Array.from({ length: 5 }, (_, index) => ({
      id: `category-${index}`,
    }));

    const related = pickRelatedStores({
      currentStoreId: "current",
      sameCity,
      sameCategory,
    });

    assert.deepEqual(ids(related), [
      "city-0",
      "city-1",
      "city-2",
      "city-3",
      "city-4",
      "category-0",
    ]);
  });

  it("respects a custom limit", () => {
    const related = pickRelatedStores({
      currentStoreId: "current",
      sameCity: [{ id: "city-1" }, { id: "city-2" }, { id: "city-3" }],
      sameCategory: [],
      limit: 2,
    });

    assert.deepEqual(ids(related), ["city-1", "city-2"]);
  });

  it("returns an empty list when nothing else matches", () => {
    const related = pickRelatedStores({
      currentStoreId: "current",
      sameCity: [{ id: "current" }],
      sameCategory: [],
    });

    assert.deepEqual(related, []);
  });

  it("keeps the full store objects it was given", () => {
    const cityStore = { id: "city-1", storeName: "西屯早午餐店" };

    const [related] = pickRelatedStores({
      currentStoreId: "current",
      sameCity: [cityStore],
      sameCategory: [],
    });

    assert.equal(related, cityStore);
  });
});
