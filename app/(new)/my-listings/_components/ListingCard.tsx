"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import NextLink from "next/link";
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase/client";
import { updateStoreStatus } from "@/firebase/clientUtils";
import { cn } from "@/lib/utils";
import { type Store, STORE_STATUS } from "@/types";
import { STORE_CATEGORIES } from "@/constant/storeType";
import { isDigitalAsset, toCard } from "@/utils/store";
import StatusBadge from "./StatusBadge";
import styles from "./ListingCard.module.css";

function formatDate(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "今天";
  if (diffDays === 1) return "昨天";
  if (diffDays < 30) return `${diffDays} 天前`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} 個月前`;
  return `${Math.floor(diffMonths / 12)} 年前`;
}

export default function ListingCard({ store }: { store: Store }) {
  const rawPath = store.images?.[0] ?? null;
  const [coverImage, setCoverImage] = useState<string | null>(
    rawPath?.startsWith("http") ? rawPath : null,
  );

  useEffect(() => {
    if (!rawPath || rawPath.startsWith("http")) return;
    getDownloadURL(ref(storage, rawPath))
      .then(setCoverImage)
      .catch(() => {});
  }, [rawPath]);
  const isDigital = isDigitalAsset(store);
  const card = toCard(store);
  const categoryEntry = STORE_CATEGORIES.find(
    (cat) => cat.key === store.category,
  );
  const categoryLabel = categoryEntry?.label ?? "";
  // * digital: the type labels stand in for city · district · category
  const meta = isDigital
    ? (card.location ?? "")
    : [store.city, store.district, categoryLabel].filter(Boolean).join(" · ");
  const thumbLabel = isDigital ? "照片" : "店面照";

  const [status, setStatus] = useState(store.status ?? STORE_STATUS.PENDING);
  const [confirmingSold, setConfirmingSold] = useState(false);
  const [markingSold, setMarkingSold] = useState(false);
  const [soldError, setSoldError] = useState(false);

  // * sellers may edit pending/approved listings and resubmit rejected ones;
  // * sold listings are final
  const canEdit =
    status === STORE_STATUS.PENDING ||
    status === STORE_STATUS.APPROVED ||
    status === STORE_STATUS.REJECTED;
  // * the seller left the /sell upload step before adding one — admins can't
  // * check the listing without it
  const needsScreenshots =
    isDigital && canEdit && (store.verificationImages ?? []).length === 0;

  const openConfirm = () => {
    setSoldError(false);
    setConfirmingSold(true);
  };

  const cancelConfirm = () => {
    setSoldError(false);
    setConfirmingSold(false);
  };

  const handleMarkSold = async () => {
    setMarkingSold(true);
    setSoldError(false);
    try {
      await updateStoreStatus(store.id, STORE_STATUS.SOLD);
      setStatus(STORE_STATUS.SOLD);
      setConfirmingSold(false);
    } catch {
      // * surface the failure so the seller knows to retry, not assume success
      setSoldError(true);
    } finally {
      setMarkingSold(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.thumb}>
        {coverImage ? (
          <Image
            src={coverImage}
            fill
            alt={thumbLabel}
            className={styles.img}
          />
        ) : (
          <span className={styles.thumbPlaceholder}>{thumbLabel}</span>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.top}>
          <h3 className={styles.name}>{store.storeName}</h3>
          <StatusBadge status={status} />
        </div>

        {meta && <p className={styles.meta}>{meta}</p>}

        <p className={styles.price}>{card.price}</p>

        {needsScreenshots && (
          <NextLink
            href={`/my-listings/edit/${store.id}`}
            className={styles.screenshotHint}
          >
            ⚠ 請補上核對截圖 →
          </NextLink>
        )}

        <div className={styles.footer}>
          <span className={styles.date}>{formatDate(store.createTime)}</span>
          <div className={styles.links}>
            {status === STORE_STATUS.APPROVED &&
              (confirmingSold ? (
                <>
                  <span
                    className={cn(
                      styles.confirmText,
                      soldError && styles.confirmError,
                    )}
                  >
                    {soldError ? "更新失敗，請重試" : "確認已頂讓？"}
                  </span>
                  <button
                    type="button"
                    className={styles.confirmYes}
                    onClick={handleMarkSold}
                    disabled={markingSold}
                  >
                    {markingSold ? "處理中…" : soldError ? "重試" : "確認"}
                  </button>
                  <button
                    type="button"
                    className={styles.confirmNo}
                    onClick={cancelConfirm}
                    disabled={markingSold}
                  >
                    取消
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className={styles.soldButton}
                  onClick={openConfirm}
                >
                  標示為已頂讓
                </button>
              ))}
            {canEdit && !confirmingSold && (
              <NextLink
                href={`/my-listings/edit/${store.id}`}
                className={styles.editLink}
              >
                編輯
              </NextLink>
            )}
            {status === STORE_STATUS.APPROVED && !confirmingSold && (
              <NextLink href={`/store/${store.id}`} className={styles.viewLink}>
                查看刊登 →
              </NextLink>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
