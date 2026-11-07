"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./ResultsArea.module.css";
import StoreCard, {
  type StoreCard as StoreCardType,
} from "@/components/refactored/StoreCard";
import Dropdown, {
  type DropdownOption,
} from "@/components/refactored/Dropdown";
import { type StoreListSort, storeListHref } from "@/utils/storeListPaging";

const sortOptions: DropdownOption[] = [
  { label: "頂讓金：低 → 高", value: "price-asc" },
  { label: "頂讓金：高 → 低", value: "price-desc" },
  { label: "最新上架", value: "newest" },
];

// * the first row on mobile and desktop — loaded eagerly as LCP candidates
const ABOVE_THE_FOLD_CARDS = 2;

// * the server sorts and pages; this only renders one page of card data
// * (never full stores — that payload made the page ~600 KB)
export default function ResultsArea({
  cards,
  totalItems,
  firstPosition,
  lastPosition,
  sort,
  pagination,
}: {
  cards: { id: string; card: StoreCardType }[];
  totalItems: number;
  firstPosition: number;
  lastPosition: number;
  sort: StoreListSort;
  pagination: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // * the URL is the source of truth — a new sort starts again at page 1
  const handleSortChange = (nextSort: string) => {
    const filters = Object.fromEntries(searchParams.entries());
    startTransition(() => {
      router.push(
        storeListHref(filters, { page: 1, sort: nextSort as StoreListSort }),
      );
      // * same stale-RSC-cache workaround as SearchBar's handleSearch
      router.refresh();
    });
  };

  return (
    <div className={styles.area}>
      <div className={styles.controlbar}>
        <div className={styles.count}>
          <span className={styles.countNum}>
            共 <span className={styles.countRange}>{totalItems}</span> 間
            {totalItems > 0 && ` · 第 ${firstPosition}–${lastPosition} 間`}
          </span>
        </div>
        <Dropdown
          label="排序"
          options={sortOptions}
          value={sort}
          onChange={handleSortChange}
        />
      </div>

      <div className={styles.grid}>
        {cards.map(({ id, card }, index) => (
          <a key={id} href={`/store/${id}`} className={styles.cardLink}>
            <StoreCard card={card} priority={index < ABOVE_THE_FOLD_CARDS} />
          </a>
        ))}
      </div>

      {pagination}

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
