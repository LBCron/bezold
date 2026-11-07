import Link from "next/link";
import Section from "../../_components/Section";
import SectionTitle from "@/components/refactored/SectionTitle";
import FaqCategory from "../../faq/_components/FaqCategory";
import type { FaqItem } from "../../faq/_components/faqItem";
import styles from "./SellGuide.module.css";

// * server-rendered below the form and outside EmailVerifiedGate, so
// * signed-out visitors and crawlers see what listing involves — every fact
// * here mirrors /faq or the form itself
const steps = [
  {
    title: "註冊並驗證信箱",
    desc: "用 Email 註冊帳號，點擊驗證信中的連結，就能開始刊登。",
  },
  {
    title: "填寫店面資料",
    desc: "填寫店名、地址、行業類型、月租、頂讓金與店況說明，上傳店面照片並留下聯絡方式，整個過程約 5 分鐘。",
  },
  {
    title: "送出審核",
    desc: "通常當天審核完成，最遲 24 小時內。審核通過後會以 EMAIL 通知你。",
  },
  {
    title: "上架，等買家聯絡",
    desc: "刊登立即對外公開，買家直接與你聯絡、自己談條件。之後可在「我的刊登」隨時修改或下架。",
  },
];

const fees = [
  "開站慶 · 早鳥 2026/12/1 前完全免費刊登。",
  "12/1 起預計開始收取刊登費，金額確認後另行公告，早鳥用戶會優先通知。",
  "瀏覽永久免費，買賣雙方聯絡永久免費。",
  "成交永久不抽成，平台不作為中間人，不介入你和買家的談判。",
  "修改店況、更新照片或下架，都不收任何費用。",
];

const rules = [
  "建議上傳至少 3 張店面照片，格式為 JPG、PNG、WebP 或 GIF，每張小於 5 MB；想登上首頁「編輯精選」，需上傳至少 5 張清晰照片。",
  "請據實填寫月租、頂讓金、坪數與設備狀況。附上近期帳本等數字的店，更容易成交，也較少被壓價。",
  "留下至少一種有效聯絡方式（電話、LINE、Threads 或 Email），買家才能找到你。",
  "若租約有「不得轉讓」條款，建議刊登前先與房東溝通，取得書面同意。",
  "刊登須為真實存在、可以頂讓的店面；不實刊登經查證後，平台有權下架。",
];

export default function SellGuide({ faqItems }: { faqItems: FaqItem[] }) {
  return (
    <>
      <Section>
        <SectionTitle
          num="01"
          title="刊登流程"
          sub="— 四個步驟，最快當天上架 —"
        />
        <ol className={styles.steps}>
          {steps.map((step, index) => (
            <li key={step.title} className={styles.step}>
              <span className={styles.stepNum}>{index + 1}</span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
            </li>
          ))}
        </ol>
      </Section>
      <Section variant="alt">
        <SectionTitle
          num="02"
          title="費用說明"
          sub="— 早鳥免費，永久不抽成 —"
        />
        <ul className={styles.list}>
          {fees.map((fee) => (
            <li key={fee}>{fee}</li>
          ))}
        </ul>
      </Section>
      <Section>
        <SectionTitle
          num="03"
          title="刊登須知"
          sub="— 資訊越完整，越快遇到對的買家 —"
        />
        <ul className={styles.list}>
          {rules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </Section>
      <FaqCategory
        sectionNum="04"
        title="刊登常見問題"
        sub="— 收費、上架、定價、房東 —"
        variant="alt"
        items={faqItems}
      />
      <Section>
        <div className={styles.cta}>
          <p className={styles.ctaTitle}>第一次頂讓店面？</p>
          <p className={styles.ctaSub}>
            先看頂讓金怎麼算、交接要注意什麼，再回來刊登也不遲。
          </p>
          <div className={styles.ctaActions}>
            <a href="#sell-form" className={styles.primary}>
              開始刊登 ↑
            </a>
            <Link href="/store-guide" className={styles.secondary}>
              看頂讓指南
            </Link>
            <Link href="/faq" className={styles.secondary}>
              更多常見問題
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
