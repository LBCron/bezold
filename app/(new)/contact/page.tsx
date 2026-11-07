import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { pageMetadata } from "@/utils/seo";
import { CONTACT_EMAIL } from "@/constant/contact";
import { SOCIAL_LINKS } from "@/constant/socials";
import LaunchBanner from "@/app/(new)/_components/LaunchBanner";
import SiteNav from "@/app/(new)/_components/SiteNav";
import SiteFooter from "@/app/(new)/_components/SiteFooter";
import LegalHero from "@/app/(new)/_components/LegalHero";
import LegalProse from "@/app/(new)/_components/LegalProse";
import Section from "@/app/(new)/_components/Section";
import SectionTitle from "@/components/refactored/SectionTitle";
import styles from "./page.module.css";

export const metadata: Metadata = pageMetadata({
  title: "聯絡我們",
  description: `聯絡 Bezold 頂讓必售：客服 LINE bezoldtw（09:00 – 21:00）、Email ${CONTACT_EMAIL}，以及 Instagram、Threads、Facebook 社群。`,
  path: "/contact",
});

const LINE_URL = "https://line.me/ti/p/~bezoldtw";

const socials = [
  { label: "Instagram", href: SOCIAL_LINKS.instagram },
  { label: "Threads", href: SOCIAL_LINKS.threads },
  { label: "Facebook 粉絲專頁", href: SOCIAL_LINKS.facebook },
  { label: "Facebook 社團", href: SOCIAL_LINKS.facebookGroup },
  { label: "YouTube", href: SOCIAL_LINKS.youtube },
  { label: "LinkedIn", href: SOCIAL_LINKS.linkedin },
];

export default function ContactPage() {
  return (
    <>
      <LaunchBanner />
      <SiteNav />
      <div className="flex-1">
        <LegalHero
          badge="聯絡我們"
          title="聯絡我們"
          sub="刊登、找店、合作，都歡迎來聊"
        />

        <Section variant="default">
          <SectionTitle num="01" title="客服 LINE" sub="— 最快的聯絡方式 —" />
          <div className={styles.line}>
            <Image
              src="/bezold-line-qr.jpeg"
              alt="Bezold 客服 LINE QR code"
              width={120}
              height={120}
              className={styles.qr}
            />
            <LegalProse>
              <p>
                LINE ID：<b>bezoldtw</b>
                <br />
                服務時間：09:00 – 21:00
              </p>
              <p>
                <a href={LINE_URL} target="_blank" rel="noopener noreferrer">
                  加入客服 LINE
                </a>
              </p>
            </LegalProse>
          </div>
        </Section>

        <Section variant="alt">
          <SectionTitle num="02" title="Email" />
          <LegalProse>
            <p>
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </p>
            <p>合作、媒體與一般詢問，歡迎來信。</p>
          </LegalProse>
        </Section>

        <Section variant="default">
          <SectionTitle num="03" title="常見需求" />
          <LegalProse>
            <p>
              · <b>刊登或收費問題</b>：先看<Link href="/faq">常見問題</Link>
              ，大多數問題都有解答。
            </p>
            <p>
              · <b>檢舉問題刊登</b>
              ：按刊登頁的「檢舉」，或透過客服 LINE
              說明刊登編號與問題內容，平台會在 24 小時內處理。
            </p>
            <p>
              · <b>找不到合適的店</b>
              ：新店面每週持續上架，歡迎告訴我們你在找什麼，我們幫你留意。
            </p>
          </LegalProse>
        </Section>

        <Section variant="alt">
          <SectionTitle num="04" title="追蹤我們" />
          <LegalProse>
            {socials.map(({ label, href }) => (
              <p key={label}>
                ·{" "}
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {label}
                </a>
              </p>
            ))}
          </LegalProse>
        </Section>
      </div>
      <SiteFooter />
    </>
  );
}
