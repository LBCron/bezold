import type { Metadata } from "next";
import Link from "next/link";
import SiteRoot from "./(new)/_components/SiteRoot";
import LaunchBanner from "./(new)/_components/LaunchBanner";
import SiteNav from "./(new)/_components/SiteNav";
import SiteFooter from "./(new)/_components/SiteFooter";
import Section from "./(new)/_components/Section";
import styles from "./not-found.module.css";

// * a 404 must not inherit the root layout's `index, follow` or the
// * homepage description — Google flagged /about as an indexable duplicate
export const metadata: Metadata = {
  title: "找不到頁面",
  description:
    "你要找的頁面不存在或已下架。回到頂讓網 Bezold 首頁，瀏覽全台頂讓店面或閱讀創業部落格。",
  robots: { index: false, follow: true },
};

// * root-level so it catches unmatched URLs as well as notFound() calls;
// * it renders outside the (new) layout, so it brings its own SiteRoot
export default function NotFound() {
  return (
    <SiteRoot>
      <LaunchBanner />
      <SiteNav />
      <div className="flex-1">
        <Section>
          <div className={styles.wrap}>
            <p className={styles.code}>404</p>
            <h1 className={styles.title}>找不到這個頁面</h1>
            <p className={styles.sub}>網址可能打錯了，或這則刊登已經下架。</p>
            <div className={styles.actions}>
              <Link href="/" className={styles.primary}>
                回到首頁
              </Link>
              <Link href="/store-list" className={styles.secondary}>
                瀏覽店面
              </Link>
              <Link href="/blog" className={styles.secondary}>
                創業部落格
              </Link>
            </div>
          </div>
        </Section>
      </div>
      <SiteFooter />
    </SiteRoot>
  );
}
