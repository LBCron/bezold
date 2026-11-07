import Image from "next/image";
import {
  InstagramFilled,
  YoutubeFilled,
  FacebookFilled,
  LinkedinFilled,
  TeamOutlined,
} from "@ant-design/icons";
import ThreadsIcon from "@/components/icon/ThreadsIcon";
import { SOCIAL_LINKS } from "@/constant/socials";
import { CONTACT_EMAIL } from "@/constant/contact";
import Logo from "./Logo";
import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.brand}>
        <Logo light />
        <p>
          台灣店面頂讓媒合平台。
          <br />
          真實刊登 · 直接聯絡 · 永久不抽成。
        </p>
        <div className={styles.line}>
          <Image
            src="/bezold-line-qr.jpeg"
            alt="LINE QR code"
            width={50}
            height={50}
            className={styles.qr}
          />
          <div>
            客服 LINE
            <br />
            <b>bezoldtw</b>
            <br />
            09:00 – 21:00
          </div>
        </div>
        <div className={styles.email}>
          客服信箱
          <br />
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </div>
        <div className={styles.socials}>
          <a
            className={styles.socialLink}
            href={SOCIAL_LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <InstagramFilled />
          </a>
          <a
            className={styles.socialLink}
            href={SOCIAL_LINKS.youtube}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
          >
            <YoutubeFilled />
          </a>
          <a
            className={styles.socialLink}
            href={SOCIAL_LINKS.threads}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Threads"
          >
            <ThreadsIcon />
          </a>
          <a
            className={styles.socialLink}
            href={SOCIAL_LINKS.facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <FacebookFilled />
          </a>
          <a
            className={styles.socialLink}
            href={SOCIAL_LINKS.facebookGroup}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook 社團"
          >
            <TeamOutlined />
          </a>
          <a
            className={styles.socialLink}
            href={SOCIAL_LINKS.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <LinkedinFilled />
          </a>
        </div>
      </div>
      <div>
        <h2>找店</h2>
        <ul>
          <li>
            <a href="/store-list">所有店面</a>
          </li>
          <li>
            <a href="/store-list?tag=RECOMMENDED">精選專區</a>
          </li>
          <li>
            <a href="/store-list?tag=EMERGENCY">急售專區</a>
          </li>
        </ul>
      </div>
      <div>
        <h2>頂出</h2>
        <ul>
          <li>
            <a href="/sell">早鳥免費刊登</a>
          </li>
          <li>
            <a href="/store-example">刊登範例</a>
          </li>
          <li>
            <a href="/my-listings">賣家後台</a>
          </li>
        </ul>
      </div>
      <div>
        <h2>關於 / 支援</h2>
        <ul>
          <li>
            <a href="/store-guide">頂讓指南</a>
          </li>
          <li>
            <a href="/blog">創業部落格</a>
          </li>
          <li>
            <a href="/faq">常見問題</a>
          </li>
          <li>
            <a
              href="https://line.me/ti/p/~bezoldtw"
              target="_blank"
              rel="noopener noreferrer"
            >
              聯絡客服
            </a>
          </li>
          <li>
            <a href="/terms">服務條款</a>
          </li>
          <li>
            <a href="/privacy">隱私政策</a>
          </li>
          <li>
            <a href="/disclaimer">免責聲明</a>
          </li>
        </ul>
      </div>
      <div className={styles.legal}>
        <span>© 2026 bezold . tw · 必售！ 頂讓創業平台</span>
        <span>made in Taipei</span>
      </div>
    </footer>
  );
}
