// * no `@/` imports here — tests/unit runs this file with plain `node --test`.
// * utils/seo.ts resolves a Store into these plain strings (category label,
// * price wording, facts) before calling in.

const MAX_DESCRIPTION_LENGTH = 150;
// * below this the excerpt is too short to say anything — leave it out
const MIN_EXCERPT_LENGTH = 20;

// * pictographs plus the invisible pieces emoji are built from: variation
// * selectors, zero-width joiners, keycaps and flag letters
const EMOJI_PATTERN =
  /[\p{Extended_Pictographic}\u{FE0E}\u{FE0F}\u{200D}\u{20E3}\u{1F1E6}-\u{1F1FF}]/gu;

export const stripEmoji = (text: string) =>
  text.replace(EMOJI_PATTERN, "").replace(/\s+/g, " ").trim();

const truncate = (text: string, maxLength: number) =>
  text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;

export const buildPlaceLabel = ({
  city,
  district,
  categoryLabel,
}: {
  city?: string;
  district?: string;
  categoryLabel?: string;
}) => [city, district, categoryLabel].filter(Boolean).join("");

// * 【已頂讓】 keeps closed deals honest in search results
export const buildStoreTitle = ({
  storeName,
  placeLabel,
  isSold,
}: {
  storeName: string;
  placeLabel: string;
  isSold: boolean;
}) =>
  `${isSold ? "【已頂讓】" : "【頂讓】"}${storeName}｜${placeLabel}店面頂讓`;

// * formatPriceDisplay() wording → the fee fact: 面議 / 免頂讓金 read as
// * phrases on their own, a price needs the 頂讓金 label in front
export const toFeeFact = (priceDisplay: string) => {
  if (priceDisplay === "面議") return "頂讓金面議";
  if (priceDisplay === "免頂讓金") return priceDisplay;
  return `頂讓金 ${priceDisplay}`;
};

interface StoreDescriptionInput {
  placeLabel: string;
  // * already formatted, in display order — fee first for a live listing
  facts: string[];
  location: string;
  sellerText: string;
  isSold: boolean;
}

// * facts first — the part Google always shows — then the seller's own
// * words, emoji stripped, in whatever space is left
export const buildStoreDescription = ({
  placeLabel,
  facts,
  location,
  sellerText,
  isSold,
}: StoreDescriptionInput) => {
  const lead = isSold ? `${placeLabel}店面已頂讓成交` : `${placeLabel}店面頂讓`;
  const factList = facts.length > 0 ? `：${facts.join("、")}` : "";
  const locationClause = location ? `，位於${location}` : "";
  const factsSentence = truncate(
    `${lead}${factList}${locationClause}。`,
    MAX_DESCRIPTION_LENGTH,
  );

  const excerpt = stripEmoji(sellerText);
  const remaining = MAX_DESCRIPTION_LENGTH - factsSentence.length;
  if (!excerpt || remaining < MIN_EXCERPT_LENGTH) return factsSentence;

  return `${factsSentence}${truncate(excerpt, remaining)}`;
};
