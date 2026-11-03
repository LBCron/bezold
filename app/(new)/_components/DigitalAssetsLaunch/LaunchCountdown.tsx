"use client";

import { useEffect, useState } from "react";
import {
  launchCountdownParts,
  msUntilDigitalAssetsLaunch,
} from "@/utils/digitalAsset";
import styles from "./DigitalAssetsLaunch.module.css";

// * minutes are the smallest unit, so a few ticks a minute is plenty
const TICK_MS = 15_000;

export default function LaunchCountdown({ initialMs }: { initialMs: number }) {
  // * the server's figure first, so hydration matches; then the browser clock
  const [remainingMs, setRemainingMs] = useState(initialMs);

  useEffect(() => {
    const update = () => setRemainingMs(msUntilDigitalAssetsLaunch());
    update();
    const timer = setInterval(update, TICK_MS);
    return () => clearInterval(timer);
  }, []);

  const { days, hours, minutes } = launchCountdownParts(remainingMs);
  const units = [
    { label: "天", value: days },
    { label: "時", value: hours },
    { label: "分", value: minutes },
  ];

  return (
    <div
      className={styles.countdown}
      role="timer"
      aria-label={`距離上線還有 ${days} 天 ${hours} 時 ${minutes} 分`}
    >
      {units.map(({ label, value }) => (
        <span key={label} className={styles.unit} aria-hidden>
          <b className={styles.unitValue}>{value}</b>
          {label}
        </span>
      ))}
    </div>
  );
}
