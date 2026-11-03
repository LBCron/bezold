"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";
import { auth, trackEvent } from "@/firebase/client";
import {
  getUserById,
  editUserById,
  createStoreDoc,
} from "@/firebase/clientUtils";
import StoreImageUpload from "./StoreImageUpload";
import Button from "@/components/refactored/Button";
import Card from "@/components/refactored/Card";
import StoreFieldsSection from "@/components/storeForm/StoreFieldsSection";
import DigitalFieldsSection from "@/components/storeForm/DigitalFieldsSection";
import ContactFieldsSection from "@/components/storeForm/ContactFieldsSection";
import VerificationImageUpload from "@/components/storeForm/VerificationImageUpload";
import {
  type StoreFields,
  type BossFields,
  emptyStoreFields,
  emptyBossFields,
  physicalFormFields,
  validateStoreForm,
} from "@/components/storeForm/formTypes";
import styles from "@/components/storeForm/storeForm.module.css";
import {
  type ListingType,
  type Store,
  LISTING_TYPE,
  STORE_STATUS,
} from "@/types";
import { normalizeThreadsId } from "@/utils/user";
import {
  DIGITAL_ASSET_EMPTY_LOCATION,
  digitalAssetWriteFields,
} from "@/utils/store";
import { digitalAssetsLaunchLabels } from "@/utils/digitalAsset";

const LISTING_TYPE_OPTIONS: {
  value: ListingType;
  label: string;
  glyph: string;
}[] = [
  { value: LISTING_TYPE.PHYSICAL, label: "實體店面", glyph: "店" },
  { value: LISTING_TYPE.DIGITAL, label: "數位資產", glyph: "網" },
];

export default function SellForm({
  initialListingType = LISTING_TYPE.PHYSICAL,
  digitalAssetsLaunched,
}: {
  /** From /sell?type=digital — the seller can still switch before submitting. */
  initialListingType?: ListingType;
  /** Decided by the server page; before launch 數位資產 shows the 搶先刊登 note. */
  digitalAssetsLaunched: boolean;
}) {
  const router = useRouter();
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [store, setStore] = useState<StoreFields>(() =>
    emptyStoreFields(initialListingType),
  );
  const [boss, setBoss] = useState<BossFields>(emptyBossFields());
  const isDigital = store.listingType === LISTING_TYPE.DIGITAL;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdStoreId, setCreatedStoreId] = useState<string | null>(null);
  const [screenshotCount, setScreenshotCount] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        // * come back to the same form type after signing in
        const sellPath =
          initialListingType === LISTING_TYPE.DIGITAL
            ? "/sell?type=digital"
            : "/sell";
        router.push(`/login?${new URLSearchParams({ redirect: sellPath })}`);
        return;
      }
      setAuthUser(firebaseUser);

      const userDoc = await getUserById(firebaseUser.uid);
      setBoss({
        userName: userDoc?.userName ?? "",
        phone: userDoc?.phone ?? "",
        email: firebaseUser.email ?? "",
        lineId: userDoc?.lineId ?? "",
        threadsId: userDoc?.threadsId ?? "",
        remark: userDoc?.remark ?? "",
      });

      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [router, initialListingType]);

  function setStoreField<K extends keyof StoreFields>(
    key: K,
    value: StoreFields[K],
  ) {
    setStore((previous) => ({ ...previous, [key]: value }));
  }

  function setBossField<K extends keyof BossFields>(
    key: K,
    value: BossFields[K],
  ) {
    setBoss((previous) => ({ ...previous, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!authUser) return;

    const result = validateStoreForm(store, boss);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const { priceValue } = result;

    setError(null);
    setSubmitting(true);

    try {
      await editUserById(authUser.uid, {
        userName: boss.userName,
        phone: boss.phone,
        email: boss.email,
        lineId: boss.lineId,
        threadsId: normalizeThreadsId(boss.threadsId),
        remark: boss.remark,
      });
    } catch (err) {
      console.error("????????", err);
      setError("更新聯絡人資料失敗，請稍後再試");
      setSubmitting(false);
      return;
    }

    try {
      const sharedFields = {
        tags: [],
        currency: "TWD",
        user: authUser.uid,
        images: [],
        status: STORE_STATUS.PENDING,
      };
      // * digital: exactly the keys firestore.rules sellFormKeys() allows —
      // * no location (""), no physical extras, screenshots come later
      const storePayload = isDigital
        ? {
            storeName: store.storeName,
            description: store.description,
            price: priceValue,
            priceNegotiable: store.priceNegotiable,
            ...DIGITAL_ASSET_EMPTY_LOCATION,
            ...digitalAssetWriteFields(store),
            ...sharedFields,
          }
        : {
            ...physicalFormFields(store),
            ...sharedFields,
            price: priceValue,
            ...(store.areaPing ? { areaPing: Number(store.areaPing) } : {}),
            ...(store.monthlyRent
              ? { monthlyRent: Number(store.monthlyRent) }
              : {}),
            ...(store.equipment ? { equipment: store.equipment } : {}),
          };
      const storeRef = await createStoreDoc(storePayload as unknown as Store);
      trackEvent("store_listing_submit", {
        store_id: storeRef.id,
        category: store.category || "unspecified",
        city: store.city || "unspecified",
        listing_type: store.listingType,
      });
      setCreatedStoreId(storeRef.id);
    } catch {
      setError(
        isDigital ? "刊登數位資產失敗，請稍後再試" : "刊登店面失敗，請稍後再試",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (createdStoreId && isDigital) {
    // * photos are optional, the revenue screenshots are not — there is no
    // * 略過 here, and 完成刊登 waits for the first screenshot
    return (
      <Card className="w-full max-w-[640px]">
        <div className={styles.form}>
          <StoreImageUpload
            storeId={createdStoreId}
            heading="上傳封面照片（選填）"
            note="資產資料已送出！可上傳賣場、社群或網站的封面圖讓買家更了解，也可略過。請勿上傳含帳號或個資的畫面。"
          />
          <VerificationImageUpload
            storeId={createdStoreId}
            onImagesChanged={setScreenshotCount}
          />
          {screenshotCount === 0 && (
            <p className={styles.readonlyNote}>
              至少上傳 1 張核對截圖，才能完成刊登。
            </p>
          )}
          <div className={styles.actions}>
            <Button
              variant="mus"
              disabled={screenshotCount === 0}
              onClick={() => router.push("/my-listings")}
            >
              完成刊登
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (createdStoreId) {
    return (
      <Card className="w-full max-w-[640px]">
        <StoreImageUpload
          storeId={createdStoreId}
          onDone={() => router.push("/my-listings")}
        />
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-[640px]">
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <span className={styles.label} id="listingTypeLabel">
            我要頂讓
          </span>
          <div
            className={styles.typeSwitch}
            role="radiogroup"
            aria-labelledby="listingTypeLabel"
          >
            {LISTING_TYPE_OPTIONS.map(({ value, label, glyph }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={store.listingType === value}
                className={styles.typeOption}
                onClick={() => {
                  setError(null);
                  setStoreField("listingType", value);
                }}
              >
                <span className={styles.typeGlyph} aria-hidden>
                  {glyph}
                </span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {isDigital && !digitalAssetsLaunched && <EarlyListingNote />}

        {isDigital ? (
          <DigitalFieldsSection store={store} onChange={setStoreField} />
        ) : (
          <StoreFieldsSection store={store} onChange={setStoreField} showTags />
        )}

        <ContactFieldsSection boss={boss} onChange={setBossField} />

        {!isDigital && (
          <div className={styles.featuredCallout}>
            <span className={styles.featuredIcon} aria-hidden>
              ✦
            </span>
            <div className={styles.featuredBody}>
              <p className={styles.featuredTitle}>
                想登上首頁{" "}
                <span className={styles.featuredHl}>「編輯精選」</span>？
              </p>
              <p className={styles.featuredText}>
                上傳至少 5 張清晰照片、完整填寫資料與聯絡方式，即有機會獲選。
              </p>
              <a
                href="/policy/editor-pick"
                className={styles.featuredLink}
                onClick={() =>
                  trackEvent("editor_pick_guide_click", {
                    location: "sell_form",
                  })
                }
              >
                查看完整入選條件 →
              </a>
            </div>
          </div>
        )}

        {error && <p className={styles.errorMsg}>{error}</p>}

        <div className={styles.actions}>
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              router.push(isDigital ? "/digital-assets" : "/store-list")
            }
          >
            取消
          </Button>
          <Button type="submit" variant="mus" disabled={submitting}>
            {submitting ? "提交中..." : "免費刊登"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function EarlyListingNote() {
  const { date, weekday, time } = digitalAssetsLaunchLabels();
  return (
    <p className={styles.earlyNote}>
      ✦ 搶先刊登：數位資產頂讓 {date}（{weekday}）{time}
      正式上線。現在送出、審核通過的刊登，會在上線當天一起曝光。刊登免費，賣家資料解鎖費由潛在買家支付。
    </p>
  );
}
