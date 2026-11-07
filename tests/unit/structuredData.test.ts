import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  itemListPageJsonLd,
} from "../../utils/structuredData.ts";

describe("faqPageJsonLd", () => {
  it("turns each question into a Question with an accepted Answer", () => {
    assert.deepEqual(
      faqPageJsonLd([
        { question: "刊登要錢嗎？", answer: "前 3 個月免費。" },
        { question: "多久上架？", answer: "最遲 24 小時。" },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "刊登要錢嗎？",
            acceptedAnswer: { "@type": "Answer", text: "前 3 個月免費。" },
          },
          {
            "@type": "Question",
            name: "多久上架？",
            acceptedAnswer: { "@type": "Answer", text: "最遲 24 小時。" },
          },
        ],
      },
    );
  });
});

describe("breadcrumbJsonLd", () => {
  it("numbers crumbs from 1 and leaves the last item without a URL", () => {
    assert.deepEqual(
      breadcrumbJsonLd([
        { name: "首頁", url: "https://www.bezold.com.tw/" },
        { name: "我要找店", url: "https://www.bezold.com.tw/store-list" },
        { name: "巴地越南小吃" },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "首頁",
            item: "https://www.bezold.com.tw/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "我要找店",
            item: "https://www.bezold.com.tw/store-list",
          },
          { "@type": "ListItem", position: 3, name: "巴地越南小吃" },
        ],
      },
    );
  });
});

describe("itemListPageJsonLd", () => {
  it("wraps item URLs in a CollectionPage, in display order", () => {
    assert.deepEqual(
      itemListPageJsonLd({
        name: "全台頂讓店面列表",
        url: "https://www.bezold.com.tw/store-list",
        itemUrls: [
          "https://www.bezold.com.tw/store/b",
          "https://www.bezold.com.tw/store/a",
        ],
      }),
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "全台頂讓店面列表",
        url: "https://www.bezold.com.tw/store-list",
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: 2,
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              url: "https://www.bezold.com.tw/store/b",
            },
            {
              "@type": "ListItem",
              position: 2,
              url: "https://www.bezold.com.tw/store/a",
            },
          ],
        },
      },
    );
  });

  it("starts positions after an offset for later pages", () => {
    const jsonLd = itemListPageJsonLd({
      name: "全台頂讓店面列表",
      url: "https://www.bezold.com.tw/store-list?page=2",
      itemUrls: ["https://www.bezold.com.tw/store/c"],
      positionOffset: 24,
    });

    assert.equal(jsonLd.mainEntity.itemListElement[0].position, 25);
  });
});
