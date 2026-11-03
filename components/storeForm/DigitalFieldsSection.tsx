"use client";

import FormField from "@/components/refactored/FormField";
import Pill from "@/components/refactored/Pill";
import {
  DIGITAL_ASSET_TYPES,
  NO_CREDENTIALS_WARNING,
} from "@/constant/digitalAsset";
import type { DigitalAssetType } from "@/types";
import { formatPriceRange } from "@/utils/store";
import type { StoreFields, StoreFieldChange } from "./formTypes";
import styles from "./storeForm.module.css";

// * "" or a valid number ≥ 0 → that number; anything else → null (no preview)
const toPreviewNumber = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

// * the digital counterpart of StoreFieldsSection, shared by /sell and the
// * /my-listings edit page
export default function DigitalFieldsSection({
  store,
  onChange,
}: {
  store: StoreFields;
  onChange: StoreFieldChange;
}) {
  const toggleType = (type: DigitalAssetType) =>
    onChange(
      "digitalTypes",
      store.digitalTypes.includes(type)
        ? store.digitalTypes.filter((selected) => selected !== type)
        : [...store.digitalTypes, type],
    );

  // * live preview of the buyer-facing price (invalid or not-yet-filled
  // * input → no preview, rather than a misleading 免頂讓金)
  const priceValue = toPreviewNumber(store.price);
  const priceMaxValue = toPreviewNumber(store.priceMax);
  const hasPriceInput = Boolean(store.price.trim()) || store.priceNegotiable;
  const pricePreview =
    hasPriceInput && priceValue !== null && priceMaxValue !== null
      ? formatPriceRange(priceValue, priceMaxValue, store.priceNegotiable)
      : null;

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>數位資產資料</h2>

      <p className={styles.warning} role="note">
        {NO_CREDENTIALS_WARNING}
      </p>

      <FormField
        id="storeName"
        label="資產名稱"
        placeholder="例：手作飾品蝦皮賣場＋FB 社團"
        value={store.storeName}
        onChange={(event) => onChange("storeName", event.target.value)}
      />

      <div className={styles.field}>
        <span className={styles.label} id="digitalTypesLabel">
          資產類型
          <span className={styles.optionalBadge}>（可複選）</span>
        </span>
        <div
          className={styles.pillGroup}
          role="group"
          aria-labelledby="digitalTypesLabel"
        >
          {DIGITAL_ASSET_TYPES.map(({ key, label }) => {
            const isSelected = store.digitalTypes.includes(key);
            return (
              <button
                key={key}
                type="button"
                className={styles.pillToggle}
                aria-pressed={isSelected}
                onClick={() => toggleType(key)}
              >
                <Pill variant={isSelected ? "solid" : "default"}>{label}</Pill>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="description">
          資產描述
        </label>
        <textarea
          id="description"
          className={styles.textarea}
          placeholder="請描述經營內容、粉絲或會員數、營收來源、轉讓原因等資訊"
          value={store.description}
          onChange={(event) => onChange("description", event.target.value)}
        />
      </div>

      <div className={styles.field}>
        <div className={styles.twoCol}>
          <FormField
            id="price"
            label="價格（TWD）"
            placeholder="例：500000"
            value={store.price}
            onChange={(event) => onChange("price", event.target.value)}
          />
          <FormField
            id="priceMax"
            label={
              <>
                價格上限
                <span className={styles.optionalBadge}>（選填）</span>
              </>
            }
            placeholder="例：1000000"
            value={store.priceMax}
            onChange={(event) => onChange("priceMax", event.target.value)}
          />
        </div>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={store.priceNegotiable}
            onChange={(event) =>
              onChange("priceNegotiable", event.target.checked)
            }
          />
          價格可議（買家洽談）
        </label>
        <p className={styles.readonlyNote}>
          填上限即顯示價格區間；留空並勾選可議即為「面議」。
          {pricePreview && (
            <>
              {" "}
              買家會看到：<b>{pricePreview}</b>
            </>
          )}
        </p>
      </div>

      <div className={styles.twoCol}>
        <FormField
          id="operatingYears"
          label={
            <>
              經營時間（年）
              <span className={styles.optionalBadge}>（選填）</span>
            </>
          }
          placeholder="例：3 或 0.5"
          value={store.operatingYears}
          onChange={(event) => onChange("operatingYears", event.target.value)}
        />
        <FormField
          id="monthlyRevenue"
          label={
            <>
              平均月營收（TWD）
              <span className={styles.optionalBadge}>（選填）</span>
            </>
          }
          placeholder="例：80000"
          value={store.monthlyRevenue}
          onChange={(event) => onChange("monthlyRevenue", event.target.value)}
        />
      </div>

      <div className={styles.field}>
        <FormField
          id="assetUrl"
          label="資產連結"
          placeholder="https://"
          value={store.assetUrl}
          onChange={(event) => onChange("assetUrl", event.target.value)}
        />
        <p className={styles.readonlyNote}>
          不會出現在公開頁面。Bezold
          用來查核；潛在買家支付賣家資料解鎖費後，也會收到這個連結。
        </p>
        <p className={styles.warning} role="note">
          {NO_CREDENTIALS_WARNING}
        </p>
      </div>
    </section>
  );
}
