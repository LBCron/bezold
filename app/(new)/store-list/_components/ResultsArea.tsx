"use client";

import { useState } from "react";
import styles from "./ResultsArea.module.css";
import StoreCard, {
  type StoreCard as StoreCardType,
} from "@/components/refactored/StoreCard";
import Dropdown, {
  type DropdownOption,
} from "@/components/refactored/Dropdown";
import { type Store, STORE_STATUS } from "@/types";
import { toCard } from "@/utils/store";

const sortOptions: DropdownOption[] = [
  { label: "頂讓金：低 → 高", value: "price-asc" },
  { label: "頂讓金：高 → 低", value: "price-desc" },
  { label: "最新上架", value: "newest" },
];

function sortStores(stores: Store[], sort: string): Store[] {
  const sorted = [...stores];
  if (sort === "price-asc") return sorted.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") return sorted.sort((a, b) => b.price - a.price);
  return sorted.sort((a, b) => b.createTime.getTime() - a.createTime.getTime());
}

// * the first row on mobile and desktop — loaded eagerly as LCP candidates
const ABOVE_THE_FOLD_CARDS = 2;

export default function ResultsArea({ stores }: { stores: Store[] }) {
  const [sort, setSort] = useState("newest");
  const approvedStores = stores.filter(
    (store) => store.status === STORE_STATUS.APPROVED,
  );
  const sortedStores = sortStores(approvedStores, sort);

  return (
    <div className={styles.area}>
      <div className={styles.controlbar}>
        <div className={styles.count}>
          <span className={styles.countNum}>
            共{" "}
            <span className={styles.countRange}>{approvedStores.length}</span>{" "}
            間
          </span>
        </div>
        <Dropdown
          label="排序"
          options={sortOptions}
          value={sort}
          onChange={setSort}
        />
      </div>

      <div className={styles.grid}>
        {sortedStores.map((store, index) => (
          <a
            key={store.id}
            href={`/store/${store.id}`}
            className={styles.cardLink}
          >
            <StoreCard
              card={toCard(store)}
              priority={index < ABOVE_THE_FOLD_CARDS}
              titleTag="h2"
            />
          </a>
        ))}
      </div>

      <div className={styles.saveCta}>
        <div>
          <div className={styles.saveCtaTitle}>沒找到合適的？</div>
          <div className={styles.saveCtaSub}>
            新店面每週持續上架 · 歡迎告訴我們你在找什麼，我們幫你留意
          </div>
        </div>
        <a href="/contact" className={styles.saveCtaBtn}>
          聯絡我們
        </a>
      </div>
    </div>
  );
}
