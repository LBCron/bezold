import { isDigitalAssetsLaunched } from "@/utils/digitalAsset";
import LaunchBannerRotator from "./LaunchBannerRotator";

// * many pages are statically built, so the rotator re-checks the launch in
// * the browser — this is only its starting point
export default function LaunchBanner() {
  return <LaunchBannerRotator serverLaunched={isDigitalAssetsLaunched()} />;
}
