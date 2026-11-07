"use client";

import { useState } from "react";
import Section from "../../_components/Section";
import SectionTitle from "@/components/refactored/SectionTitle";
import type { SectionVariant } from "../../_components/Section";
import { cn } from "@/lib/utils";
import styles from "./FaqCategory.module.css";
import type { FaqItem } from "./faqItem";

export type { FaqItem };

type Props = {
  sectionNum: string;
  title: string;
  sub: string;
  variant: SectionVariant;
  items: FaqItem[];
};

export default function FaqCategory({
  sectionNum,
  title,
  sub,
  variant,
  items,
}: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <Section variant={variant}>
      <SectionTitle num={sectionNum} title={title} sub={sub} />
      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <FaqItem
            key={index}
            item={item}
            isOpen={openIndex === index}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
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
      {/* * always in the DOM so crawlers read the answer (FAQPage needs it on
          the page); `hidden` keeps the accordion closed */}
      <div className={styles.body} hidden={!isOpen}>
        {item.a}
      </div>
    </div>
  );
}
