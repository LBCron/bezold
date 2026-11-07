import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildPlaceLabel,
  buildStoreDescription,
  buildStoreTitle,
  stripEmoji,
  toFeeFact,
} from "../../utils/storeMeta.ts";

describe("buildPlaceLabel", () => {
  it("joins city, district and category label", () => {
    assert.equal(
      buildPlaceLabel({
        city: "新北市",
        district: "三重區",
        categoryLabel: "餐飲",
      }),
      "新北市三重區餐飲",
    );
  });

  it("skips missing parts without leaving gaps", () => {
    assert.equal(buildPlaceLabel({ city: "新竹縣" }), "新竹縣");
    assert.equal(buildPlaceLabel({ categoryLabel: "服飾" }), "服飾");
    assert.equal(buildPlaceLabel({}), "");
  });
});

describe("buildStoreTitle", () => {
  it("prefixes a live listing with 【頂讓】", () => {
    assert.equal(
      buildStoreTitle({
        storeName: "巴地越南小吃",
        placeLabel: "新北市三重區餐飲",
        isSold: false,
      }),
      "【頂讓】巴地越南小吃｜新北市三重區餐飲店面頂讓",
    );
  });

  it("prefixes a sold listing with 【已頂讓】", () => {
    assert.equal(
      buildStoreTitle({
        storeName: "巴地越南小吃",
        placeLabel: "新北市",
        isSold: true,
      }),
      "【已頂讓】巴地越南小吃｜新北市店面頂讓",
    );
  });

  it("still reads naturally with no place label", () => {
    assert.equal(
      buildStoreTitle({ storeName: "小店", placeLabel: "", isSold: false }),
      "【頂讓】小店｜店面頂讓",
    );
  });
});

describe("toFeeFact", () => {
  it("prefixes a price with 頂讓金", () => {
    assert.equal(toFeeFact("NT$ 50 萬"), "頂讓金 NT$ 50 萬");
  });

  it("keeps the 可面議 note on a price", () => {
    assert.equal(
      toFeeFact("NT$ 50 萬（可面議）"),
      "頂讓金 NT$ 50 萬（可面議）",
    );
  });

  it("turns 面議 into 頂讓金面議", () => {
    assert.equal(toFeeFact("面議"), "頂讓金面議");
  });

  it("keeps 免頂讓金 as is", () => {
    assert.equal(toFeeFact("免頂讓金"), "免頂讓金");
  });
});

describe("stripEmoji", () => {
  it("removes emoji and collapses the whitespace they leave", () => {
    assert.equal(
      stripEmoji("✨小資創業首選 🔥黃金店面T字路口"),
      "小資創業首選 黃金店面T字路口",
    );
  });

  it("removes variation selectors and joiners", () => {
    assert.equal(stripEmoji("好店❤️推薦👨‍🍳"), "好店推薦");
  });

  it("keeps CJK text and full-width punctuation", () => {
    assert.equal(
      stripEmoji("經營多年，客源穩定。[設備齊全]～歡迎！"),
      "經營多年，客源穩定。[設備齊全]～歡迎！",
    );
  });
});

describe("buildStoreDescription", () => {
  it("leads with the facts sentence, then the seller excerpt", () => {
    assert.equal(
      buildStoreDescription({
        placeLabel: "新北市三重區餐飲",
        facts: ["頂讓金 NT$ 50 萬", "15 坪", "含設備"],
        location: "中誠街30號",
        sellerText: "越南小吃店頂讓，經營多年。",
        isSold: false,
      }),
      "新北市三重區餐飲店面頂讓：頂讓金 NT$ 50 萬、15 坪、含設備，位於中誠街30號。越南小吃店頂讓，經營多年。",
    );
  });

  it("leaves out the location clause when there is no address", () => {
    assert.equal(
      buildStoreDescription({
        placeLabel: "新竹縣",
        facts: ["頂讓金面議"],
        location: "",
        sellerText: "",
        isSold: false,
      }),
      "新竹縣店面頂讓：頂讓金面議。",
    );
  });

  it("says a sold listing was closed and lists its other facts", () => {
    assert.equal(
      buildStoreDescription({
        placeLabel: "臺北市",
        facts: ["50 坪"],
        location: "",
        sellerText: "",
        isSold: true,
      }),
      "臺北市店面已頂讓成交：50 坪。",
    );
  });

  it("says a sold listing was closed even with no facts", () => {
    assert.equal(
      buildStoreDescription({
        placeLabel: "臺北市",
        facts: [],
        location: "民生東路1號",
        sellerText: "",
        isSold: true,
      }),
      "臺北市店面已頂讓成交，位於民生東路1號。",
    );
  });

  it("strips emoji from the seller excerpt", () => {
    assert.equal(
      buildStoreDescription({
        placeLabel: "新北市",
        facts: ["免頂讓金"],
        location: "",
        sellerText: "✨小資創業首選 🔥黃金店面",
        isSold: false,
      }),
      "新北市店面頂讓：免頂讓金。小資創業首選 黃金店面",
    );
  });

  it("cuts a long seller excerpt with … and stays within 150 characters", () => {
    const description = buildStoreDescription({
      placeLabel: "臺北市內湖區餐飲",
      facts: ["頂讓金 NT$ 120 萬"],
      location: "",
      sellerText: "設備齊全".repeat(60),
      isSold: false,
    });

    assert.equal(description.length, 150);
    assert.ok(description.endsWith("…"));
    assert.ok(
      description.startsWith(
        "臺北市內湖區餐飲店面頂讓：頂讓金 NT$ 120 萬。設備齊全",
      ),
    );
  });

  it("drops the excerpt when fewer than 20 characters of space remain", () => {
    const longLocation = "很長的地址".repeat(25);

    const description = buildStoreDescription({
      placeLabel: "臺北市",
      facts: ["免頂讓金"],
      location: longLocation,
      sellerText: "這段不應該出現",
      isSold: false,
    });

    assert.ok(!description.includes("這段不應該出現"));
    assert.ok(description.length <= 150);
  });

  it("caps an over-long facts sentence at 150 characters", () => {
    const description = buildStoreDescription({
      placeLabel: "臺北市",
      facts: ["免頂讓金"],
      location: "很長的地址".repeat(40),
      sellerText: "",
      isSold: false,
    });

    assert.equal(description.length, 150);
    assert.ok(description.endsWith("…"));
  });
});
