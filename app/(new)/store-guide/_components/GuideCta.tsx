import Link from "next/link";
import Section from "../../_components/Section";
import styles from "./GuideCta.module.css";

export default function GuideCta() {
  return (
    <Section variant="alt">
      <div className={styles.wrap}>
        <h3 className={styles.title}>準備好了嗎？</h3>
        <p className={styles.sub}>搜尋合適的店，或把你的店介紹給對的人。</p>
        <p className={styles.sub}>
          也可以回到{" "}
          <Link href="/" className={styles.inlineLink}>
            頂讓網 Bezold 首頁
          </Link>
          ，看編輯精選與急售中的頂讓店面。
        </p>
        <div className={styles.actions}>
          <Link href="/store-list" className={styles.primary}>
            瀏覽店面
          </Link>
          <Link href="/sell" className={styles.secondary}>
            我要頂出 →
          </Link>
        </div>
      </div>
    </Section>
  );
}
