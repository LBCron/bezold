import styles from "./Pagination.module.css";
import { cn } from "@/lib/utils";

// * every page is pinned once there are few; beyond that, the first, the last
// * and the neighbours of the current page, with gaps between
const ALWAYS_SHOW_ALL_UP_TO = 7;

const visiblePages = (page: number, totalPages: number): (number | "gap")[] => {
  if (totalPages <= ALWAYS_SHOW_ALL_UP_TO)
    return Array.from({ length: totalPages }, (_, index) => index + 1);

  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = Array.from(pages)
    .filter((pageNumber) => pageNumber >= 1 && pageNumber <= totalPages)
    .sort((a, b) => a - b);

  return sorted.flatMap((pageNumber, index) =>
    index > 0 && pageNumber - sorted[index - 1] > 1
      ? (["gap", pageNumber] as const)
      : [pageNumber],
  );
};

// * plain links (no client state) so crawlers can follow every page —
// * render it from a server component, which can pass `hrefFor`
export default function Pagination({
  page,
  totalPages,
  hrefFor,
  label = "分頁",
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
  label?: string;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav className={styles.pagination} aria-label={label}>
      {page > 1 ? (
        <a href={hrefFor(page - 1)} className={styles.step} rel="prev">
          ← 上一頁
        </a>
      ) : (
        <span className={cn(styles.step, styles.disabled)}>← 上一頁</span>
      )}
      <ol className={styles.pages}>
        {visiblePages(page, totalPages).map((pageNumber, index) =>
          pageNumber === "gap" ? (
            <li key={`gap-${index}`} className={styles.gap} aria-hidden>
              …
            </li>
          ) : (
            <li key={pageNumber}>
              <a
                href={hrefFor(pageNumber)}
                className={cn(
                  styles.page,
                  pageNumber === page && styles.current,
                )}
                aria-current={pageNumber === page ? "page" : undefined}
              >
                {pageNumber}
              </a>
            </li>
          ),
        )}
      </ol>
      {page < totalPages ? (
        <a href={hrefFor(page + 1)} className={styles.step} rel="next">
          下一頁 →
        </a>
      ) : (
        <span className={cn(styles.step, styles.disabled)}>下一頁 →</span>
      )}
    </nav>
  );
}
