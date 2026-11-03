import {
  digitalAssetsLaunchLabels,
  msUntilDigitalAssetsLaunch,
} from "@/utils/digitalAsset";
import LaunchCountdown from "./LaunchCountdown";
import styles from "./DigitalAssetsLaunch.module.css";

export { default as LaunchCtas } from "./LaunchCtas";

/**
 * Pre-launch teaser card: the launch date on the left, the caller's pitch on
 * the right. Shared by homepage 04 and the /digital-assets teaser; remove
 * with the rest of the teaser once 數位資產頂讓 has launched.
 */
export default function LaunchTeaserCard({
  dateCaption,
  showCountdown = false,
  children,
}: {
  /** After 「星期四 晚上 10 點」, e.g. 上線 or 開放瀏覽. */
  dateCaption: string;
  showCountdown?: boolean;
  children: React.ReactNode;
}) {
  const { month, day, weekday, time } = digitalAssetsLaunchLabels();

  return (
    <div className={styles.card}>
      <div className={styles.dateBlock}>
        <span className={styles.kicker}>OPENING</span>
        <span className={styles.date}>
          {month}.{day}
        </span>
        <span className={styles.weekday}>
          星期{weekday} {time}
          {dateCaption}
        </span>
        {showCountdown && (
          <LaunchCountdown initialMs={msUntilDigitalAssetsLaunch()} />
        )}
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  );
}
