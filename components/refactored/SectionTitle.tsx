import styles from "./SectionTitle.module.css";
import cn from "classnames";
import TrackedLink from "./TrackedLink";

export default function SectionTitle({
  num,
  title,
  sub,
  badge,
  subLink,
  more,
  moreHref,
  dark = false,
}: {
  num: string;
  title: string;
  /** Rendered right after the title, e.g. a `NEW` Pill. */
  badge?: React.ReactNode;
  sub?: string;
  /**
   * Optional inline link rendered right after `sub` (e.g. "如何成為編輯精選？→").
   * Pass `event` to fire a GA event on click.
   */
  subLink?: {
    label: string;
    href: string;
    event?: string;
    eventParams?: Record<string, unknown>;
  };
  more?: string;
  moreHref?: string;
  dark?: boolean;
}) {
  return (
    <div className={styles.wrap}>
      <div className={styles.left}>
        <span className={cn(styles.num, dark && styles.numDark)}>{num}</span>
        <h2 className={styles.h}>{title}</h2>
        {badge}
        {sub && (
          <span className={cn(styles.sub, dark && styles.subDark)}>{sub}</span>
        )}
        {subLink &&
          (subLink.event ? (
            <TrackedLink
              className={styles.subLink}
              href={subLink.href}
              event={subLink.event}
              params={subLink.eventParams}
            >
              {subLink.label}
            </TrackedLink>
          ) : (
            <a className={styles.subLink} href={subLink.href}>
              {subLink.label}
            </a>
          ))}
      </div>
      {more && (
        <a className={cn(styles.more, dark && styles.moreDark)} href={moreHref}>
          {more}
        </a>
      )}
    </div>
  );
}
