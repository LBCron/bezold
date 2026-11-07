// * kept out of the "use client" FaqCategory so server pages can build the
// * FAQPage JSON-LD from the same items

// * a JSX answer (bold, line breaks) has no plain-text form, so it must carry
// * `text` — the schema answer, worded exactly like what the page shows
export type FaqItem =
  { q: string; a: string } | { q: string; a: React.ReactNode; text: string };

export const faqAnswerText = (item: FaqItem) =>
  "text" in item ? item.text : item.a;

export const toFaqSchemaItems = (items: FaqItem[]) =>
  items.map((item) => ({ question: item.q, answer: faqAnswerText(item) }));
