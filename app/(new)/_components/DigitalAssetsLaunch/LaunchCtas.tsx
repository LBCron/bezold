import SellCtaLink from "../SellCtaLink";
import TrackedLink from "@/components/refactored/TrackedLink";
import { SOCIAL_LINKS } from "@/constant/socials";
import styles from "./DigitalAssetsLaunch.module.css";

// * the two teaser CTAs — `location` tells the placements apart in GA4
export default function LaunchCtas({ location }: { location: string }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      <SellCtaLink
        ctaLocation={location}
        href="/sell?type=digital"
        className={styles.ctaPrimary}
      >
        搶先刊登數位資產
      </SellCtaLink>
      <TrackedLink
        event="digital_launch_threads_click"
        params={{ location }}
        href={SOCIAL_LINKS.threads}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.ctaGhost}
      >
        追蹤 Threads，搶先看最新消息
      </TrackedLink>
    </div>
  );
}
