import Section from "./Section";
import styles from "./TrustBar.module.css";

export default function TrustBar() {
  return (
    <Section variant="trust">
      <div className={styles.trust}>
        <div className={styles.item}>
          <b>2,481</b>
          <span>目前刊登店數</span>
        </div>
        <div className={styles.item}>
          <b>
            <em>136</em>
          </b>
          <span>本月新上架</span>
        </div>
        <div className={styles.item}>
          <b>
            0<small className={styles.unit}> 元</small>
          </b>
          <span>早鳥刊登費 (12/1 前)</span>
        </div>
        <div className={styles.item}>
          <b>0%</b>
          <span>平台抽成</span>
        </div>
      </div>
    </Section>
  );
}
