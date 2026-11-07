import styles from "./HeroSplit.module.css";
import BuyerForm from "./BuyerForm";
import SellCtaLink from "../SellCtaLink";

export default function HeroSplit() {
  return (
    <section className={styles.hero}>
      <div className={styles.kicker}>
        — 頂讓網 · 全台店面頂讓平台 · 真實刊登 —
      </div>
      <h1 className={styles.title}>
        <span className={styles.titleLine}>
          <span className={styles.titleLineInner}>
            找一間<em>準備好</em>的店
          </span>
        </span>
        <span className={styles.titleLine}>
          <span className={styles.titleLineInner2}>開門就營業</span>
        </span>
      </h1>
      <p className={styles.sub}>
        Bezold 頂讓網 ·
        買家直接接手已有客群、設備、營運的店面，賣家把心血交給合適的人。
        <br />
        <b className={styles.subAccent}>開站慶 · 12/1 前免費刊登</b> · 真實店家
        · 買賣直接聯絡，沒有中間人。
      </p>

      <div className={styles.split}>
        <div className={`${styles.col} ${styles.buy}`}>
          <div className={styles.lab}>FOR BUYERS · 買家</div>
          <h2 className={styles.colTitle}>
            找店
            <br />
            接手就開張
          </h2>
          <p className={styles.lead}>真實刊登 · 直接聯絡賣家，不經中間人</p>
          <BuyerForm />
        </div>

        <div className={`${styles.col} ${styles.sell}`}>
          <div className={styles.lab}>FOR SELLERS · 賣家</div>
          <h2 className={styles.colTitle}>
            頂出
            <br />
            找到接手人
          </h2>
          <p className={styles.lead}>
            12/1 前免費刊登（限早鳥）· 買家直接聯絡你，0 抽成
          </p>
          <ol className={styles.steps}>
            <li>免費建立帳號</li>
            <li>5 分鐘填完刊登表</li>
            <li>上架，買家直接聯絡你</li>
          </ol>
          <SellCtaLink
            ctaLocation="hero"
            className={`${styles.btn} ${styles.btnMus}`}
          >
            立即免費刊登 →
          </SellCtaLink>
        </div>
      </div>
    </section>
  );
}
