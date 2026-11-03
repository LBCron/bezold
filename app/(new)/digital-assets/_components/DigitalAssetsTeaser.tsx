import LaunchTeaserCard, {
  LaunchCtas,
} from "@/app/(new)/_components/DigitalAssetsLaunch";
import {
  DIGITAL_ASSET_TYPES,
  DIGITAL_ASSETS_SUBTITLE,
} from "@/constant/digitalAsset";
import { digitalAssetsLaunchLabels } from "@/utils/digitalAsset";
import resultsStyles from "./DigitalAssetResults.module.css";
import styles from "./DigitalAssetsTeaser.module.css";

// * no amounts here — the fee is explained on each listing's page
const STEPS = [
  {
    title: "賣家免費刊登",
    body: "填寫資產資料、資產連結，上傳後台營收或數據截圖。刊登不收任何費用。",
  },
  {
    title: "Bezold 核對",
    body: "確認截圖與資產連結相符，通過後公開概要；截圖、連結和賣家資料不公開。",
  },
  {
    title: "潛在買家申請",
    body: "在有興趣的刊登頁面送出申請，取得賣家資料後，雙方自行洽談。申請方式和費用寫在每筆刊登的頁面上。",
  },
];

// * /digital-assets before launch: replaces the type filter and the empty
// * list. Remove after launch along with the rest of the teaser.
export default function DigitalAssetsTeaser() {
  const { date } = digitalAssetsLaunchLabels();

  return (
    <>
      <div className={resultsStyles.crumbs}>
        <div className={resultsStyles.inner}>
          <div className={resultsStyles.trail}>
            <a href="/">首頁</a> / <a href="/digital-assets">數位資產</a>
          </div>
          <h1 className={resultsStyles.title}>
            數位資產頂讓 <em>{date} 開放</em>
          </h1>
          <p className={resultsStyles.sub}>{DIGITAL_ASSETS_SUBTITLE}</p>
        </div>
      </div>

      <div className={resultsStyles.area}>
        <div className="grid gap-[18px]">
          <LaunchTeaserCard dateCaption="開放瀏覽">
            <p className={styles.typesTitle}>可以頂讓的類型</p>
            <ul className={styles.chips}>
              {DIGITAL_ASSET_TYPES.map(({ key, label }) => (
                <li key={key} className={styles.chip}>
                  {label}
                </li>
              ))}
            </ul>
            <LaunchCtas location="digital_assets_teaser" />
          </LaunchTeaserCard>

          <ol className={styles.steps}>
            {STEPS.map(({ title, body }, index) => (
              <li key={title} className={styles.step}>
                <span className={styles.stepNum}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <b className={styles.stepTitle}>{title}</b>
                <p className={styles.stepBody}>{body}</p>
              </li>
            ))}
          </ol>

          <p className={styles.finePrint}>
            賣家刊登免費。Bezold 不介入雙方交易，也不保證成交。
          </p>
        </div>
      </div>
    </>
  );
}
