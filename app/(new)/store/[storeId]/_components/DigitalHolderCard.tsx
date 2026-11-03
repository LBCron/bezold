import Link from "next/link";
import { UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Store, STORE_STATUS } from "@/types";
import { STORE_TAG } from "@/types/StoreTags";
import { NO_CREDENTIALS_WARNING } from "@/constant/digitalAsset";
import { formatPriceRange } from "@/utils/store";
import InquiryCta from "./InquiryCta";
import priceCardStyles from "./StorePriceCard.module.css";
import styles from "./DigitalHolderCard.module.css";

// Reports and support both go to the LINE 客服 account (same as StorePriceCard).
const LINE_SUPPORT_URL = "https://line.me/ti/p/~bezoldtw";

// * digital assets are anonymous: no seller name, no contact gate. Buyers
// * apply through the platform and pay the 賣家資料解鎖費 before Bezold
// * shares the seller's screenshots, asset link and contact details.
export default function DigitalHolderCard({ store }: { store: Store }) {
  const { price, priceMax, priceNegotiable, tags } = store;
  const isSold = store.status === STORE_STATUS.SOLD;
  const isUrgent = !isSold && tags?.includes(STORE_TAG.EMERGENCY);

  return (
    <div className={priceCardStyles.card}>
      <div className={styles.holder}>
        <div className={cn(priceCardStyles.avatar, styles.anonymousAvatar)}>
          <UserRound size={30} strokeWidth={2} />
        </div>
        <div>
          <div className={priceCardStyles.sellerName}>
            數位資產持有人
            <small>支付賣家資料解鎖費後，提供後台截圖與賣家聯絡方式</small>
          </div>
          <div className={priceCardStyles.badges}>
            <span className={priceCardStyles.badge}>
              <span className={priceCardStyles.dot} />
              付費查看
            </span>
            {isUrgent && (
              <span className={cn(priceCardStyles.badge, priceCardStyles.warm)}>
                <span className={priceCardStyles.dot} />
                急售標記
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={isSold ? priceCardStyles.priceRowSold : undefined}>
        <div>
          <span className={priceCardStyles.label}>頂讓金額 ASKING</span>
          <div className={cn(priceCardStyles.price, styles.rangePrice)}>
            {formatPriceRange(price, priceMax, priceNegotiable)}
          </div>
        </div>
        {isSold && (
          <div className={priceCardStyles.soldNotice}>
            此資產已頂讓，不再開放申請
          </div>
        )}
      </div>

      {!isSold && <InquiryCta storeId={store.id} />}

      <div className={priceCardStyles.trust}>
        <b>資訊與交易提醒</b>
        <p>
          Bezold
          提供數位資產刊登與媒合服務；除另有書面約定外，非交易當事人或履約保證人。營收、數據與價格由賣家提供，未經
          Bezold 查核，請於交易前自行核對。
        </p>
        <p>
          帳號、社群與網域的移轉受各平台規範限制，移轉範圍需雙方書面確認。
          {NO_CREDENTIALS_WARNING}詳見
          <Link href="/disclaimer">完整免責聲明</Link>。
        </p>
      </div>

      <div className={priceCardStyles.report}>
        資訊有疑慮？{" "}
        <a href={LINE_SUPPORT_URL} target="_blank" rel="noopener noreferrer">
          檢舉此物件
        </a>{" "}
        ·{" "}
        <a href={LINE_SUPPORT_URL} target="_blank" rel="noopener noreferrer">
          聯絡客服
        </a>
      </div>
    </div>
  );
}
