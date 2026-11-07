import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/utils/seo";
import { CONTACT_EMAIL } from "@/constant/contact";
import LaunchBanner from "@/app/(new)/_components/LaunchBanner";
import SiteNav from "@/app/(new)/_components/SiteNav";
import SiteFooter from "@/app/(new)/_components/SiteFooter";
import LegalHero from "@/app/(new)/_components/LegalHero";
import LegalProse from "@/app/(new)/_components/LegalProse";
import Section from "@/app/(new)/_components/Section";
import SectionTitle from "@/components/refactored/SectionTitle";

export const metadata: Metadata = pageMetadata({
  title: "關於我們",
  description:
    "Bezold 頂讓必售（頂讓網）是全台店面頂讓平台：賣家刊登、Bezold 審核、買家直接聯絡賣家。平台不作為中間人，成交永久不抽成。",
  path: "/about",
});

// * site facts only — everything here also appears on /faq, /store-guide or
// * the listing forms
export default function AboutPage() {
  return (
    <>
      <LaunchBanner />
      <SiteNav />
      <div className="flex-1">
        <LegalHero
          badge="關於我們"
          title="關於 Bezold 頂讓必售"
          sub="全台店面頂讓平台，讓好店找到下一位老闆"
        />

        <Section variant="default">
          <SectionTitle num="01" title="Bezold 是什麼" />
          <LegalProse>
            <p>
              Bezold
              頂讓必售（頂讓網）是全台店面頂讓平台。賣家刊登想頂讓的店面，買家依縣市、行業、頂讓金篩選，找到合適的店後直接聯絡賣家。
            </p>
            <p>
              「頂讓」是把一間已在營運的店面，連同客群、設備、租約一起轉手給新老闆。比從零創業省下籌備時間，比買加盟少去龐大加盟金。不知道從哪裡開始，可以先看
              <Link href="/store-guide">頂讓指南</Link>。
            </p>
            <p>
              除了實體店面，也有電商賣場、社群帳號、網站等
              <Link href="/digital-assets">數位資產頂讓</Link>。
            </p>
          </LegalProse>
        </Section>

        {/* TODO(you): 成立緣由 — the founding story. Fill in real facts, then
            uncomment; the page ships without it until then.
        <Section variant="alt">
          <SectionTitle num="02" title="為什麼做 Bezold" />
          <LegalProse>
            <p>…</p>
          </LegalProse>
        </Section>
        */}

        <Section variant="alt">
          <SectionTitle num="02" title="我們怎麼審核刊登" />
          <LegalProse>
            <p>
              每則刊登送出後都由 Bezold 審核，通常當天完成，最遲 24
              小時內；審核通過後以 EMAIL 通知賣家，並立即對外公開。
            </p>
            <p>
              平台要求每筆刊登附上店面照片與有效聯絡方式。數位資產另需上傳後台營收等核對截圖，這些截圖不會出現在公開頁面。
            </p>
            <p>
              發現問題刊登，可以按刊登頁的「檢舉」或聯絡客服，平台會在 24
              小時內處理，有權下架相關刊登並列入黑名單。
            </p>
          </LegalProse>
        </Section>

        <Section variant="default">
          <SectionTitle num="03" title="媒合，不是仲介" />
          <LegalProse>
            <p>
              Bezold
              只負責讓買賣雙方遇見彼此：平台不作為中間人，不轉達訊息、不介入談判，買賣雙方自行洽談頂讓金、交接日期與設備條件，並自行簽約。
            </p>
            <p>
              <b>費用</b>
              ：開站慶早鳥 2026/12/1
              前完全免費刊登；瀏覽與買賣雙方聯絡永久免費；成交永久不抽成。
            </p>
          </LegalProse>
        </Section>

        <Section variant="alt">
          <SectionTitle num="04" title="聯絡我們" />
          <LegalProse>
            <p>
              客服 LINE <b>bezoldtw</b>（09:00 – 21:00），或寄信到{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              。更多方式請見<Link href="/contact">聯絡我們</Link>。
            </p>
          </LegalProse>
        </Section>
      </div>
      <SiteFooter />
    </>
  );
}
