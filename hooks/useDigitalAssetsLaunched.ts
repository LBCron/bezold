"use client";

import { useEffect, useState } from "react";
import {
  isDigitalAssetsLaunched,
  msUntilDigitalAssetsLaunch,
} from "@/utils/digitalAsset";

// * setTimeout overflows past 2^31 - 1 ms (~24.8 days) and fires at once —
// * wait at most this long, then check again
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

/**
 * Whether 數位資產頂讓 has launched, for client UI on pages that may be
 * statically built. Starts from the server's answer (so hydration matches),
 * re-checks with the browser clock, then flips on its own at launch.
 */
export default function useDigitalAssetsLaunched(serverLaunched: boolean) {
  const [launched, setLaunched] = useState(serverLaunched);

  useEffect(() => {
    // * the launch only goes one way — never flip back to the teaser
    if (launched) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const check = () => {
      if (isDigitalAssetsLaunched()) {
        setLaunched(true);
        return;
      }
      timer = setTimeout(
        check,
        Math.min(msUntilDigitalAssetsLaunch(), MAX_TIMEOUT_MS),
      );
    };
    check();
    return () => clearTimeout(timer);
  }, [launched]);

  return launched;
}
