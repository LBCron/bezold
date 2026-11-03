"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import StoreCard, {
  type StoreCard as StoreCardType,
} from "@/components/refactored/StoreCard";
import Dropdown from "@/components/refactored/Dropdown";
import SellCtaLink from "@/app/(new)/_components/SellCtaLink";
import {
  DIGITAL_ASSET_TYPES,
  DIGITAL_ASSETS_SUBTITLE,
  TRANSFER_RISK_NOTICE,
} from "@/constant/digitalAsset";
import { type DigitalAssetTab, ALL_DIGITAL_ASSET_TYPES } from "@/types";
import { digitalAssetListHref, toDigitalAssetTab } from "@/utils/digitalAsset";
import { cn } from "@/lib/utils";
import styles from "./DigitalAssetResults.module.css";

export type DigitalAssetResult = {
  id: string;
  sold: boolean;
  card: StoreCardType;
};

// * the first row on mobile and desktop — loaded eagerly as LCP candidates
const ABOVE_THE_FOLD_CARDS = 2;

// * "" (the Dropdown's 不限) = 全部
const TYPE_OPTIONS = DIGITAL_ASSET_TYPES.map(({ key, label }) => ({
  label,
  value: key,
}));

export default function DigitalAssetResults({
  results,
  approvedCount,
  activeTab,
}: {
  results: DigitalAssetResult[];
  approvedCount: number;
  activeTab: DigitalAssetTab;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // * show the picked type right away, while the server filters
  const [pendingTab, setPendingTab] = useState<DigitalAssetTab | null>(null);
  const shownTab = isPending && pendingTab ? pendingTab : activeTab;

  // * one filter, so it applies on pick — no 搜尋 button like /store-list
  const handleSelect = (value: string) => {
    const tab = toDigitalAssetTab(value);
    if (tab === activeTab) return;
    setPendingTab(tab);
    startTransition(() => {
      router.push(digitalAssetListHref(tab), { scroll: false });
      // * same as /store-list's SearchBar: the client router cache can hand
      // * back a stale payload for another ?type= of this page (e.g. back to
      // * 全部), so make the server component re-run with the new params
      router.refresh();
    });
  };

  return (
    <>
      <div className={styles.crumbs}>
        <div className={styles.inner}>
          <div className={styles.trail}>
            <a href="/">首頁</a> / <a href="/digital-assets">數位資產</a>
          </div>
          <h1 className={styles.title}>
            數位資產頂讓 <em>共 {approvedCount} 件</em>
          </h1>
          <p className={styles.sub}>{DIGITAL_ASSETS_SUBTITLE}</p>
        </div>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.filterInner}>
          <Dropdown
            label="類型"
            options={TYPE_OPTIONS}
            value={shownTab === ALL_DIGITAL_ASSET_TYPES ? "" : shownTab}
            onChange={handleSelect}
          />
        </div>
      </div>

      <div className={styles.area}>
        {results.length > 0 ? (
          <div className={cn(styles.grid, isPending && styles.gridPending)}>
            {results.map(({ id, sold, card }, index) => (
              <a
                key={id}
                href={`/store/${id}`}
                className={cn(styles.cardLink, sold && styles.soldCard)}
              >
                <StoreCard
                  card={card}
                  priority={index < ABOVE_THE_FOLD_CARDS}
                  titleTag="h2"
                />
              </a>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <p className={styles.emptyText}>這個類型目前還沒有刊登</p>
            {activeTab !== ALL_DIGITAL_ASSET_TYPES && (
              <a
                className={styles.emptyLink}
                href={digitalAssetListHref(ALL_DIGITAL_ASSET_TYPES)}
              >
                看全部數位資產 →
              </a>
            )}
          </div>
        )}

        <div className={styles.sellCta}>
          <div>
            <div className={styles.sellCtaTitle}>也有數位資產想轉手？</div>
            <p className={styles.sellCtaSub}>{TRANSFER_RISK_NOTICE}</p>
          </div>
          <SellCtaLink
            ctaLocation="digital_assets_list"
            href="/sell?type=digital"
            className={styles.sellCtaBtn}
          >
            免費刊登數位資產
          </SellCtaLink>
        </div>
      </div>
    </>
  );
}
