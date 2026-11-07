import {
  Caveat,
  Kalam,
  Gloria_Hallelujah,
  JetBrains_Mono,
  Rubik_Mono_One,
} from "next/font/google";
import styles from "../layout.module.css";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-caveat",
  display: "swap",
});
const kalam = Kalam({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-kalam",
  display: "swap",
});
const gloria = Gloria_Hallelujah({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-gloria",
  display: "swap",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-jetbrains",
  display: "swap",
});
const rubikMono = Rubik_Mono_One({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-rubik-mono",
  display: "swap",
});

// * the (new) site's font + token wrapper — shared by the (new) layout and
// * the root not-found page, which renders outside that layout
export default function SiteRoot({ children }: { children: React.ReactNode }) {
  const fontVars = `${caveat.variable} ${kalam.variable} ${gloria.variable} ${jetbrains.variable} ${rubikMono.variable}`;

  return <div className={`${styles.root} ${fontVars}`}>{children}</div>;
}
