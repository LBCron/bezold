// * no `@/` imports here — tests/unit runs this file with plain `node --test`.

const graphemeSegmenter = new Intl.Segmenter("zh-Hant", {
  granularity: "grapheme",
});

// * cap text at maxLength visible characters, the ellipsis included. Counts
// * graphemes, not UTF-16 units: `.slice` can cut an emoji in half, and the
// * lone half renders as "�" on the client but not in server HTML, which
// * breaks hydration (/store-list cards)
export const truncateText = (text: string, maxLength: number) => {
  const graphemes = Array.from(
    graphemeSegmenter.segment(text),
    ({ segment }) => segment,
  );
  return graphemes.length > maxLength
    ? `${graphemes.slice(0, maxLength - 1).join("")}…`
    : text;
};
