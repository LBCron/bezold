import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Store } from "@/types";
import {
  STORE_CSV_COLUMNS,
  exportFileName,
  formatTaipeiTime,
  toStoreCsv,
} from "../../utils/storeCsv.ts";

const APP_URL = "https://www.bezold.com.tw";

const BASE_STORE: Store = {
  id: "AbCdEfGhIj0123456789",
  storeName: "西屯早午餐店頂讓",
  location: "台中市西屯區",
  description: "早午餐店",
  price: 330000,
  currency: "TWD",
  createTime: new Date("2026-07-23T06:00:00Z"),
  updateTime: new Date("2026-10-01T01:30:00Z"),
  images: ["mockStore/AbCdEfGhIj0123456789/1.png"],
  status: "approved",
  listingType: "physical",
  city: "台中市",
  district: "西屯區",
  category: "RESTAURANT",
  tags: ["EMERGENCY", "RECOMMENDED"],
  monthlyRent: 21000,
  areaPing: 40.5,
  priceNegotiable: false,
  user: "seller-uid",
  userInfo: {
    id: "seller-uid",
    userName: "王老闆",
    phone: "+886912000000",
    email: "owner-001@example.com",
    lineId: "@example_line",
    createTime: new Date("2026-07-20T02:00:00Z"),
    updateTime: new Date("2026-07-20T02:00:00Z"),
  },
};

// * parses the CSV this module writes (quoted cells may hold "," and CRLF)
const parseCsv = (csv: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let index = 0; index < csv.length; index++) {
    const char = csv[index];
    if (inQuotes) {
      if (char === '"' && csv[index + 1] === '"') {
        cell += '"';
        index++;
      } else if (char === '"') inQuotes = false;
      else cell += char;
    } else if (char === '"') inQuotes = true;
    else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\r" && csv[index + 1] === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      index++;
    } else cell += char;
  }
  return rows;
};

const rowsOf = (stores: Store[]) =>
  parseCsv(toStoreCsv(stores, { appUrl: APP_URL }).slice(1));

const cellOf = (store: Store, key: string) => {
  const [header, row] = rowsOf([store]);
  return row[header.indexOf(key)];
};

describe("toStoreCsv", () => {
  it("starts with a BOM, ends rows with CRLF and writes the header first", () => {
    const csv = toStoreCsv([BASE_STORE], { appUrl: APP_URL });
    assert.ok(csv.startsWith("﻿"));
    assert.ok(csv.endsWith("\r\n"));
    assert.equal(csv.split("\r\n").length, 3); // * header, one row, trailing ""
    const [header] = rowsOf([BASE_STORE]);
    assert.deepEqual(
      header,
      STORE_CSV_COLUMNS.map((column) => column.key),
    );
  });

  it("writes the spec's 30 columns in order", () => {
    assert.deepEqual(
      STORE_CSV_COLUMNS.map((column) => column.key),
      [
        "id",
        "storeName",
        "status",
        "listingType",
        "city",
        "district",
        "location",
        "category",
        "tags",
        "digitalTypes",
        "price",
        "priceMax",
        "priceNegotiable",
        "currency",
        "monthlyRent",
        "areaPing",
        "equipment",
        "operatingYears",
        "monthlyRevenue",
        "storeUrl",
        "description",
        "createTime",
        "updateTime",
        "user",
        "userInfo.userName",
        "userInfo.email",
        "userInfo.phone",
        "userInfo.lineId",
        "userInfo.threadsId",
        "userInfo.createTime",
      ],
    );
  });

  it("writes one row per store", () => {
    const second = { ...BASE_STORE, id: "second" };
    const [, ...rows] = rowsOf([BASE_STORE, second]);
    assert.deepEqual(
      rows.map((row) => row[0]),
      [BASE_STORE.id, "second"],
    );
  });

  it("formats values the way the spec says", () => {
    assert.equal(cellOf(BASE_STORE, "tags"), "EMERGENCY|RECOMMENDED");
    assert.equal(cellOf(BASE_STORE, "price"), "330000");
    assert.equal(cellOf(BASE_STORE, "areaPing"), "40.5");
    assert.equal(cellOf(BASE_STORE, "priceNegotiable"), "false");
    assert.equal(
      cellOf(BASE_STORE, "storeUrl"),
      `${APP_URL}/store/${BASE_STORE.id}`,
    );
    assert.equal(cellOf(BASE_STORE, "createTime"), "2026-07-23 14:00");
    assert.equal(cellOf(BASE_STORE, "updateTime"), "2026-10-01 09:30");
    assert.equal(cellOf(BASE_STORE, "userInfo.email"), "owner-001@example.com");
    assert.equal(cellOf(BASE_STORE, "userInfo.createTime"), "2026-07-20 10:00");
  });

  it("writes missing values as empty cells", () => {
    const digital: Store = {
      ...BASE_STORE,
      city: undefined,
      tags: undefined,
      priceMax: undefined,
      userInfo: undefined,
    };
    assert.equal(cellOf(digital, "city"), "");
    assert.equal(cellOf(digital, "tags"), "");
    assert.equal(cellOf(digital, "priceMax"), "");
    assert.equal(cellOf(digital, "digitalTypes"), "");
    assert.equal(cellOf(digital, "userInfo.email"), "");
    assert.equal(cellOf(digital, "userInfo.createTime"), "");
    assert.doesNotMatch(
      toStoreCsv([digital], { appUrl: APP_URL }),
      /undefined|null/,
    );
  });

  it("quotes cells holding commas, quotes or line breaks", () => {
    const store = {
      ...BASE_STORE,
      storeName: '早午餐, "好吃"',
      description: "第一行\r\n第二行\n第三行",
    };
    const csv = toStoreCsv([store], { appUrl: APP_URL });
    assert.ok(csv.includes('"早午餐, ""好吃"""'));
    assert.equal(cellOf(store, "storeName"), '早午餐, "好吃"');
    assert.equal(cellOf(store, "description"), "第一行\r\n第二行\n第三行");
  });

  it("prefixes free text that Excel would run as a formula", () => {
    for (const prefix of ["=", "+", "-", "@", "\t", "\r"]) {
      const store = { ...BASE_STORE, storeName: `${prefix}SUM(A1)` };
      assert.equal(cellOf(store, "storeName"), `'${prefix}SUM(A1)`);
    }
    const store = {
      ...BASE_STORE,
      location: "=cmd",
      description: "-1 折",
      userInfo: { ...BASE_STORE.userInfo!, userName: "@王" },
    };
    assert.equal(cellOf(store, "location"), "'=cmd");
    assert.equal(cellOf(store, "description"), "'-1 折");
    assert.equal(cellOf(store, "userInfo.userName"), "'@王");
  });

  it("leaves contact fields as they are", () => {
    assert.equal(cellOf(BASE_STORE, "userInfo.phone"), "+886912000000");
    assert.equal(cellOf(BASE_STORE, "userInfo.lineId"), "@example_line");
  });
});

describe("formatTaipeiTime", () => {
  it("converts to Asia/Taipei in YYYY-MM-DD HH:mm", () => {
    assert.equal(
      formatTaipeiTime(new Date("2026-07-23T06:00:00Z")),
      "2026-07-23 14:00",
    );
    assert.equal(
      formatTaipeiTime(new Date("2026-11-03T16:05:00Z")),
      "2026-11-04 00:05",
    );
  });

  it("returns an empty string for a missing or invalid date", () => {
    assert.equal(formatTaipeiTime(undefined), "");
    assert.equal(formatTaipeiTime(new Date("not a date")), "");
  });
});

describe("exportFileName", () => {
  it("uses the Taipei date", () => {
    assert.equal(
      exportFileName(new Date("2026-11-03T15:59:00Z")),
      "bezold-sellers-20261103.csv",
    );
    // * 16:30 UTC is already the next day in Taipei
    assert.equal(
      exportFileName(new Date("2026-11-03T16:30:00Z")),
      "bezold-sellers-20261104.csv",
    );
  });
});
