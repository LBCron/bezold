"use client";

import { useState } from "react";
import Section from "./Section";
import SectionTitle from "@/components/refactored/SectionTitle";
import styles from "./Faq.module.css";
import { cn } from "@/lib/utils";

type FaqItem = { q: string; a: React.ReactNode };

const items: FaqItem[] = [
  {
    q: "刊登要錢嗎？早鳥之後怎麼收費？",
    a: (
      <>
        <b>開站慶 · 2026/12/1 前完全免費刊登</b>（早鳥限定）。
        <br />
        12/1 起預計開始收取刊登費，金額確認後另行公告，早鳥用戶會優先通知。
        <br />
        瀏覽永久免費 · 買賣雙方聯絡永久免費 · 成交永久不抽成。
      </>
    ),
  },
  {
    q: "頂讓金、押金、月租分別是什麼？",
    a: (
      <>
        <b>頂讓金</b>：買方一次性付給賣方，買斷商譽、設備與裝潢殘值。
        <br />
        <b>押金</b>
        ：付給房東的可退保證金，通常為 2–3 個月租金，租約到期無損壞可退回。
        <br />
        <b>月租</b>：租約接手後每月給房東的租金。
        <br />
        三者相加才是接手一間店的完整初期資金需求。
      </>
    ),
  },
  {
    q: "怎麼確認店家的資訊是真的？",
    a: (
      <>
        平台要求每筆刊登附上店面照片與有效聯絡方式。建議：
        <br />
        · 親自到場看店，觀察實際人流與狀況
        <br />
        · 向賣家索取近 3 個月帳本或水電帳單
        <br />· 向房東確認租約與轉租同意
      </>
    ),
  },
  {
    q: "房東不同意轉租怎麼辦？",
    a: "先確認租約中是否有「不得轉讓」條款。若有，需先取得房東書面同意，否則即使完成頂讓交易，房東仍可依約終止租約。建議在刊登前先與房東溝通，並將同意書納入頂讓合約附件。",
  },
  {
    q: "交接時設備清點怎麼做才不會後悔？",
    a: (
      <>
        交接前逐項列出設備清單（冰箱、爐台、POS
        機、招牌、桌椅⋯），雙方確認數量與狀況並拍照存證，附於合約中。
        <br />
        交接當日當場點收，有問題當場提出，簽字確認後即視為完成交接。
      </>
    ),
  },
  {
    q: "遇到不誠實的買家 / 賣家怎麼辦？",
    a: "立即中止交易，保留所有對話紀錄與金流憑證。可透過客服 LINE 向平台舉報，平台有權下架相關刊登並列入黑名單。若涉及財物損失，建議同步向消保官或警察機關申訴。",
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Section variant="alt">
      <SectionTitle
        num="10"
        title="常見問題"
        sub="— 第一次接手 / 頂出？這些先看 —"
        more="完整 FAQ →"
        moreHref="/faq"
      />
      <div className={"flex flex-col gap-2"}>
        {items.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <FaqItem
              key={i}
              item={item}
              isOpen={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : i)}
            />
          );
        })}
      </div>
    </Section>
  );
}

function FaqItem({
  item,
  isOpen,
  onClick,
}: {
  item: FaqItem;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className={styles.item}>
      <button
        type="button"
        className={cn(styles.question, isOpen && styles.open)}
        onClick={onClick}
        aria-expanded={isOpen}
      >
        <span>{item.q}</span>
        <span className={styles.plus}>{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && <div className={styles.body}>{item.a}</div>}
    </div>
  );
}
