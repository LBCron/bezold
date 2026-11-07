import Section from "./Section";
import SectionTitle from "@/components/refactored/SectionTitle";
import styles from "./WhyUs.module.css";

const items: WhyUsItem[] = [
  {
    ico: "✓",
    variant: "A",
    title: "真實店家",
    desc: "刊登須提供店面照片與聯絡資料，並設有異常資訊檢舉機制。",
  },
  {
    ico: "$",
    variant: "B",
    title: "早鳥免費 · 永久不抽成",
    desc: "開站慶 12/1 前刊登 0 元；瀏覽永久免費、聯絡永久免費。買賣雙方直接談，平台不抽任何成交抽成。",
  },
  {
    ico: "直",
    variant: "C",
    title: "直接聯絡",
    desc: "看到喜歡的店，電話 / LINE 直接聯絡賣家，沒有中間人轉手、沒有資訊延遲。",
  },
];

export default function WhyUs() {
  return (
    <Section>
      <SectionTitle
        num="09"
        title="為什麼用我們"
        sub="— 不是分類廣告板，是有人陪跑的平台 —"
      />
      <div className={"grid gap-4 lg:grid-cols-3 grid-cols-1"}>
        {items.map((item) => {
          return <WhyUsItem key={item.ico} item={item} />;
        })}
      </div>
    </Section>
  );
}

type WhyUsItem = {
  ico: string;
  variant: "A" | "B" | "C";
  title: string;
  desc: string;
};

function WhyUsItem({ item }: { item: WhyUsItem }) {
  const { ico, variant, title, desc } = item;
  return (
    <div className={styles.item}>
      <div className={`${styles.ico} ${styles[`ico${variant}`]}`}>{ico}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}
