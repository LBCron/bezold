// * schema.org JSON-LD builders. No `@/` imports here — tests/unit runs this
// * file with plain `node --test`. Pages pass absolute URLs in.

const CONTEXT = "https://schema.org";

// * answer text must match what the page shows — FAQPage is only valid for
// * Q&A that visitors can read
export const faqPageJsonLd = (
  items: { question: string; answer: string }[],
) => ({
  "@context": CONTEXT,
  "@type": "FAQPage",
  mainEntity: items.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
});

// * the last crumb is the current page, which Google wants without a URL
export const breadcrumbJsonLd = (crumbs: { name: string; url?: string }[]) => ({
  "@context": CONTEXT,
  "@type": "BreadcrumbList",
  itemListElement: crumbs.map(({ name, url }, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name,
    ...(url ? { item: url } : {}),
  })),
});

// * list pages: the items shown, in display order. positionOffset continues
// * the numbering on page 2+ of a paginated list.
export const itemListPageJsonLd = ({
  name,
  url,
  itemUrls,
  positionOffset = 0,
}: {
  name: string;
  url: string;
  itemUrls: string[];
  positionOffset?: number;
}) => ({
  "@context": CONTEXT,
  "@type": "CollectionPage",
  name,
  url,
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: itemUrls.length,
    itemListElement: itemUrls.map((itemUrl, index) => ({
      "@type": "ListItem",
      position: positionOffset + index + 1,
      url: itemUrl,
    })),
  },
});
