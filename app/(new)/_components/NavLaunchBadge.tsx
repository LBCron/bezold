"use client";

import useDigitalAssetsLaunched from "@/hooks/useDigitalAssetsLaunched";
import { digitalAssetsLaunchLabels } from "@/utils/digitalAsset";
import styles from "./NavLaunchBadge.module.css";

// * 「10/29」 beside 數位資產 until launch — decided in the browser, since
// * the nav is on statically built pages too
export default function NavLaunchBadge({
  serverLaunched,
}: {
  serverLaunched: boolean;
}) {
  const launched = useDigitalAssetsLaunched(serverLaunched);
  if (launched) return null;

  const { date } = digitalAssetsLaunchLabels();
  return <span className={styles.badge}>{date}</span>;
}
