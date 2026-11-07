import Section from "./Section";
import styles from "./LegalHero.module.css";

// * legal pages show their effective date; /about and /contact pass a
// * plain subtitle instead
export default function LegalHero({
  badge,
  title,
  effectiveDate,
  sub,
}: {
  badge: string;
  title: string;
  effectiveDate?: string;
  sub?: string;
}) {
  return (
    <Section variant="dark">
      <div className={styles.wrap}>
        <span className={styles.badge}>{badge}</span>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.sub}>
          — {effectiveDate ? `最後更新：${effectiveDate}` : sub} —
        </p>
      </div>
    </Section>
  );
}
