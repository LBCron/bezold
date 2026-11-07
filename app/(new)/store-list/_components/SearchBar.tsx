"use client";

import styles from "./SearchBar.module.css";
import { Search } from "lucide-react";
import Button from "@/components/refactored/Button";
import Dropdown from "@/components/refactored/Dropdown";
import MultiDropdown from "@/components/refactored/MultiDropdown";
import { useAtom } from "jotai";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useTransition } from "react";
import {
  cityAtom,
  tagAtom,
  amountFilterAtom,
  categoryAtom,
} from "@/atoms/SearchFilterAtom";
import { cityItems, amountItems } from "@/components/SearchFilter/DropDowns";
import { STORE_TAGS } from "@/constant/storeTags";
import { STORE_CATEGORIES } from "@/constant/storeType";

const toOptions = (items: { label: string; key: string }[]) =>
  items.map((item) => ({ label: item.label, value: item.key }));

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [cities, setCities] = useAtom(cityAtom);
  const [tag, setTag] = useAtom(tagAtom);
  const [amountFilter, setAmountFilter] = useAtom(amountFilterAtom);
  const [category, setCategory] = useAtom(categoryAtom);

  useEffect(() => {
    const cityParam = searchParams.get("city");
    const tagParam = searchParams.get("tag");
    const categoryParam = searchParams.get("category");
    const amountMinParam = searchParams.get("amountMin");
    const amountMaxParam = searchParams.get("amountMax");

    if (cityParam) {
      const cityKeys = cityParam.split(",");
      setCities(cityItems.filter((item) => cityKeys.includes(item.key)));
    }
    if (tagParam) setTag(STORE_TAGS.find((item) => item.key === tagParam));
    if (categoryParam)
      setCategory(STORE_CATEGORIES.find((item) => item.key === categoryParam));
    if (amountMinParam || amountMaxParam) {
      const min = amountMinParam ? Number(amountMinParam) : 0;
      const max = amountMaxParam
        ? Number(amountMaxParam)
        : Number.POSITIVE_INFINITY;
      setAmountFilter(
        amountItems.find(
          (item) => item.value[0] === min && item.value[1] === max,
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (cities.length > 0)
      params.set("city", cities.map((item) => item.key).join(","));
    if (tag?.key && tag.key !== "all") params.set("tag", tag.key);
    if (category?.key) params.set("category", category.key);
    if (amountFilter?.value) {
      const [min, max] = amountFilter.value;
      if (min) params.set("amountMin", String(min));
      if (max !== Number.POSITIVE_INFINITY)
        params.set("amountMax", String(max));
    }
    // * a new filter starts again from page 1 but keeps the chosen sort
    const sort = searchParams.get("sort");
    if (sort) params.set("sort", sort);
    startTransition(() => {
      router.push(`/store-list?${params.toString()}`);
      // The App Router client cache is keyed by pathname, not searchParams, so
      // navigating between filtered variants of /store-list can reuse a stale
      // RSC payload (e.g. arriving from home's tag=RECOMMENDED link). refresh()
      // forces the server component to re-run with the new params.
      router.refresh();
    });
  };

  return (
    <div className={styles.searchbar}>
      <MultiDropdown
        label="地區"
        options={toOptions(cityItems)}
        value={cities.map((item) => item.key)}
        onChange={(cityKeys) =>
          setCities(cityItems.filter((item) => cityKeys.includes(item.key)))
        }
      />
      <Dropdown
        label="Tag"
        options={toOptions(STORE_TAGS)}
        value={tag?.key ?? ""}
        onChange={(value) =>
          setTag(STORE_TAGS.find((item) => item.key === value))
        }
      />
      <Dropdown
        label="行業"
        options={toOptions(STORE_CATEGORIES)}
        value={category?.key ?? ""}
        onChange={(value) =>
          setCategory(STORE_CATEGORIES.find((item) => item.key === value))
        }
      />
      <Dropdown
        label="頂讓金"
        options={toOptions(amountItems)}
        value={amountFilter?.key ?? ""}
        onChange={(value) =>
          setAmountFilter(amountItems.find((item) => item.key === value))
        }
      />
      <Button onClick={handleSearch} disabled={isPending}>
        {isPending ? (
          "搜尋中…"
        ) : (
          <>
            <Search size={16} strokeWidth={2.5} aria-hidden />
            搜尋
          </>
        )}
      </Button>
    </div>
  );
}
