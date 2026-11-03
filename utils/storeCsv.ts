// * only `import type` here — tests/unit runs this file with plain `node --test`,
// * which cannot resolve the `@/` alias at runtime. The caller resolves
// * status / listingType defaults before passing stores in.
import type { Store } from "@/types";

// * mirrors ANALYTICS_TIMEZONE (constant/storeAnalytics.ts), which can't be
// * imported here for the reason above
const TIMEZONE = "Asia/Taipei";

const BOM = "﻿";
const LINE_BREAK = "\r\n";

const FORMULA_PREFIXES = ["=", "+", "-", "@", "\t", "\r"];

type CellValue = string | number | boolean | Date | string[] | null | undefined;

interface StoreCsvColumn {
  key: string;
  value: (store: Store, appUrl: string) => CellValue;
  // * seller-typed free text could start with "=" and run as a formula in
  // * Excel. Contact fields are left alone: "+886…" and "@id" must stay as is
  freeText?: boolean;
}

// * column keys follow the Firestore field paths (see SPEC.md → 欄位)
export const STORE_CSV_COLUMNS: StoreCsvColumn[] = [
  { key: "id", value: (store) => store.id },
  { key: "storeName", value: (store) => store.storeName, freeText: true },
  { key: "status", value: (store) => store.status },
  { key: "listingType", value: (store) => store.listingType },
  { key: "city", value: (store) => store.city },
  { key: "district", value: (store) => store.district },
  { key: "location", value: (store) => store.location, freeText: true },
  { key: "category", value: (store) => store.category },
  { key: "tags", value: (store) => store.tags },
  { key: "digitalTypes", value: (store) => store.digitalTypes },
  { key: "price", value: (store) => store.price },
  { key: "priceMax", value: (store) => store.priceMax },
  { key: "priceNegotiable", value: (store) => store.priceNegotiable },
  { key: "currency", value: (store) => store.currency },
  { key: "monthlyRent", value: (store) => store.monthlyRent },
  { key: "areaPing", value: (store) => store.areaPing },
  { key: "equipment", value: (store) => store.equipment },
  { key: "operatingYears", value: (store) => store.operatingYears },
  { key: "monthlyRevenue", value: (store) => store.monthlyRevenue },
  {
    key: "storeUrl",
    value: (store, appUrl) => `${appUrl}/store/${store.id}`,
  },
  { key: "description", value: (store) => store.description, freeText: true },
  { key: "createTime", value: (store) => store.createTime },
  { key: "updateTime", value: (store) => store.updateTime },
  { key: "user", value: (store) => store.user },
  {
    key: "userInfo.userName",
    value: (store) => store.userInfo?.userName,
    freeText: true,
  },
  { key: "userInfo.email", value: (store) => store.userInfo?.email },
  { key: "userInfo.phone", value: (store) => store.userInfo?.phone },
  { key: "userInfo.lineId", value: (store) => store.userInfo?.lineId },
  { key: "userInfo.threadsId", value: (store) => store.userInfo?.threadsId },
  { key: "userInfo.createTime", value: (store) => store.userInfo?.createTime },
];

const taipeiParts = (date: Date) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const partOf = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return {
    year: partOf("year"),
    month: partOf("month"),
    day: partOf("day"),
    hour: partOf("hour"),
    minute: partOf("minute"),
  };
};

const isValidDate = (date: Date | undefined): date is Date =>
  date instanceof Date && !Number.isNaN(date.getTime());

// * "YYYY-MM-DD HH:mm" in Taipei time; "" when the date is missing
export function formatTaipeiTime(date: Date | undefined): string {
  if (!isValidDate(date)) return "";
  const { year, month, day, hour, minute } = taipeiParts(date);
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

export function exportFileName(now: Date): string {
  const { year, month, day } = taipeiParts(now);
  return `bezold-sellers-${year}${month}${day}.csv`;
}

const formatCell = (value: CellValue): string => {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return formatTaipeiTime(value);
  if (Array.isArray(value)) return value.join("|");
  return String(value);
};

const guardFormula = (value: string) =>
  FORMULA_PREFIXES.some((prefix) => value.startsWith(prefix))
    ? `'${value}`
    : value;

const escapeCell = (value: string) =>
  /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;

// * UTF-8 BOM so Excel opens the Chinese text correctly; CRLF line breaks
export function toStoreCsv(
  stores: Store[],
  { appUrl }: { appUrl: string },
): string {
  const header = STORE_CSV_COLUMNS.map((column) => column.key);
  const rows = stores.map((store) =>
    STORE_CSV_COLUMNS.map((column) => {
      const cell = formatCell(column.value(store, appUrl));
      return escapeCell(column.freeText ? guardFormula(cell) : cell);
    }),
  );
  return (
    BOM +
    [header, ...rows].map((row) => row.join(",")).join(LINE_BREAK) +
    LINE_BREAK
  );
}
