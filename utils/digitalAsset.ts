import {
  type DigitalAssetTab,
  type DigitalAssetType,
  type Store,
  ALL_DIGITAL_ASSET_TYPES,
  DIGITAL_ASSET_TYPE,
} from "@/types";
import { DIGITAL_ASSETS_LAUNCH_AT } from "@/constant/digitalAsset";

const DIGITAL_ASSET_TYPE_VALUES: string[] = Object.values(DIGITAL_ASSET_TYPE);

// * ?type= on /digital-assets — anything unrecognised (or repeated) is 全部
export const toDigitalAssetTab = (value: unknown): DigitalAssetTab =>
  typeof value === "string" && DIGITAL_ASSET_TYPE_VALUES.includes(value)
    ? (value as DigitalAssetType)
    : ALL_DIGITAL_ASSET_TYPES;

export const filterByDigitalAssetTab = <
  Item extends Pick<Store, "digitalTypes">,
>(
  items: Item[],
  tab: DigitalAssetTab,
) =>
  tab === ALL_DIGITAL_ASSET_TYPES
    ? items
    : items.filter((item) => item.digitalTypes?.includes(tab));

export const digitalAssetListHref = (tab: DigitalAssetTab) =>
  tab === ALL_DIGITAL_ASSET_TYPES
    ? "/digital-assets"
    : `/digital-assets?${new URLSearchParams({ type: tab })}`;

const DIGITAL_ASSETS_LAUNCH_TIME = new Date(DIGITAL_ASSETS_LAUNCH_AT).getTime();

export const msUntilDigitalAssetsLaunch = (now = Date.now()) =>
  Math.max(0, DIGITAL_ASSETS_LAUNCH_TIME - now);

export const isDigitalAssetsLaunched = (now = Date.now()) =>
  msUntilDigitalAssetsLaunch(now) === 0;

// * 0–5 凌晨, 6–11 上午, 12 中午, 13–17 下午, 18+ 晚上
const dayPeriod = (hour: number) => {
  if (hour < 6) return "凌晨";
  if (hour < 12) return "上午";
  if (hour === 12) return "中午";
  if (hour < 18) return "下午";
  return "晚上";
};

/**
 * The launch moment in Taipei time, e.g. { date: "10/29", weekday: "四",
 * time: "晚上 10 點" } — for 「10/29（四）晚上 10 點上線」 style copy.
 */
export const digitalAssetsLaunchLabels = () => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("zh-TW", {
      timeZone: "Asia/Taipei",
      month: "numeric",
      day: "numeric",
      weekday: "narrow",
      hour: "numeric",
      minute: "numeric",
      hourCycle: "h23",
    })
      .formatToParts(DIGITAL_ASSETS_LAUNCH_TIME)
      .map(({ type, value }) => [type, value]),
  );
  const hour = Number(parts.hour);
  const minute = Number(parts.minute);
  return {
    month: parts.month,
    day: parts.day,
    date: `${parts.month}/${parts.day}`,
    weekday: parts.weekday,
    time: `${dayPeriod(hour)} ${hour % 12 || 12} 點${minute ? ` ${minute} 分` : ""}`,
  };
};

// * whole days / hours / minutes left, for the homepage countdown
export const launchCountdownParts = (ms: number) => {
  const totalMinutes = Math.floor(ms / 60_000);
  return {
    days: Math.floor(totalMinutes / 1440),
    hours: Math.floor((totalMinutes % 1440) / 60),
    minutes: totalMinutes % 60,
  };
};
