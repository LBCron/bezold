import Section from "./Section";
import SectionTitle from "@/components/refactored/SectionTitle";
import Pill from "@/components/refactored/Pill";
import styles from "./HowItWorks.module.css";

const buyerSteps: Step[] = [
  {
    number: 1,
    type: "BUYER",
    title: "搜尋 / 收藏",
    desc: "用條件找店，收藏喜歡的。匿名瀏覽，不留資料。",
  },
  {
    number: 2,
    type: "BUYER",
    title: "直接聯絡賣家",
    desc: "看到喜歡的店？直接打電話 / LINE 給賣家，自己約看店、自己談價。",
  },
];

const sellerSteps: Step[] = [
  {
    number: 1,
    type: "SELLER",
    title: "免費刊登（早鳥）",
    desc: "5 分鐘填好店況、上傳照片。開站慶 12/1 前 0 元，當天上架。",
  },
  {
    number: 2,
    type: "SELLER",
    title: "等買家來電",
    desc: "有興趣的買家會直接聯絡你，平台不抽成、不收費。",
  },
];

export default function HowItWorks() {
  return (
    <Section variant="dark">
      <SectionTitle
        num="08"
        title="運作方式 · 簡單兩步"
        sub="— 我們先把買賣雙方湊在一起，剩下你們自己談 —"
        more="第一次頂讓？看頂讓指南 →"
        moreHref="/store-guide"
        dark
      />
      <div className={"grid gap-4 relative grid-cols-2 lg:grid-cols-4"}>
        {buyerSteps.map((step) => {
          return <Step key={step.number} step={step} />;
        })}
        {sellerSteps.map((step) => {
          return <Step key={step.number} step={step} />;
        })}
      </div>
      <div className={styles.footer}>
        <span>
          <b>未來功能</b> · 之後會推出：站內訊息 NDA · 履約保證金 · 合約模板 ·
          專人陪跑顧問
        </span>
        <Pill variant="outlineLight">敬請期待</Pill>
      </div>
    </Section>
  );
}

type Step = {
  number: number;
  type: "BUYER" | "SELLER";
  title: string;
  desc: string;
};

function Step({ step }: { step: Step }) {
  const { number, type, title, desc } = step;
  return (
    <div
      className={`${styles.step} ${type === "BUYER" ? styles.buyer : styles.seller}`}
    >
      <span className={styles.number}>{number}</span>
      <span className={styles.type}>{type}</span>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.desc}>{desc}</p>
    </div>
  );
}
