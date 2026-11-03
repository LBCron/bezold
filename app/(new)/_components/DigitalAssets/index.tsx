import Section from "../Section";
import SellCtaLink from "../SellCtaLink";
import LaunchTeaserCard, { LaunchCtas } from "../DigitalAssetsLaunch";
import SectionTitle from "@/components/refactored/SectionTitle";
import StoreCard from "@/components/refactored/StoreCard";
import type { Store } from "@/types";
import { toCard } from "@/utils/store";
import { digitalAssetsLaunchLabels } from "@/utils/digitalAsset";
import styles from "./DigitalAssets.module.css";

const teaserPoints = (launchDate: string) => [
  "賣家免費刊登，匿名、公開頁面不顯示賣家資料",
  "每筆刊登都經 Bezold 核對營收截圖",
  `現在搶先刊登，${launchDate} 上線當天一起曝光`,
];

// * always rendered, even with no approved assets — the 04 slot stays put so
// * the section numbers after it never skip. Filtering by type lives on
// * /digital-assets; the homepage just shows the latest. Before launch the
// * listings give way to a teaser (no fee mention there).
export default function DigitalAssets({
  assets,
  launched,
}: {
  assets: Store[];
  launched: boolean;
}) {
  if (!launched) {
    const { date } = digitalAssetsLaunchLabels();
    return (
      <Section variant="alt">
        <SectionTitle
          num="04"
          title="數位資產頂讓"
          badge={<span className={styles.newBadge}>{date} 上線</span>}
          sub="— 讓線上的心血，也有下一章 —"
        />
        <LaunchTeaserCard dateCaption="上線" showCountdown>
          <p className={styles.teaserIntro}>
            電商賣場、FB 社團、IG
            帳號、網站、App……線上經營的心血，也能交給下一位接手的人。
          </p>
          <ul className={styles.teaserPoints}>
            {teaserPoints(date).map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <LaunchCtas location="home_digital_teaser" />
        </LaunchTeaserCard>
      </Section>
    );
  }

  return (
    <Section variant="alt">
      <SectionTitle
        num="04"
        title="數位資產頂讓"
        badge={<span className={styles.newBadge}>NEW</span>}
        sub="— 讓線上的心血，也有下一章 —"
        more="看全部數位資產 →"
        moreHref="/digital-assets"
      />

      {assets.length > 0 ? (
        <div className={styles.listings}>
          {assets.map((store) => (
            <a
              key={store.id}
              href={`/store/${store.id}`}
              className={styles.cardLink}
            >
              <StoreCard card={toCard(store)} />
            </a>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>數位資產刊登即將上架</p>
          <p className={styles.emptyText}>
            電商賣場、社群、網站、App……線上經營的心血，也能交給下一位接手。
          </p>
        </div>
      )}

      <div className={styles.footer}>
        <SellCtaLink
          ctaLocation="home_digital_assets"
          href="/sell?type=digital"
          className={styles.sellLink}
        >
          我也有數位資產想刊登 ↗
        </SellCtaLink>
      </div>
    </Section>
  );
}
