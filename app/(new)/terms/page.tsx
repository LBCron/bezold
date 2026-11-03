import type { Metadata } from "next";
import { pageMetadata } from "@/utils/seo";
import Link from "next/link";
import LaunchBanner from "@/app/(new)/_components/LaunchBanner";
import SiteNav from "@/app/(new)/_components/SiteNav";
import SiteFooter from "@/app/(new)/_components/SiteFooter";
import LegalHero from "@/app/(new)/_components/LegalHero";
import LegalProse from "@/app/(new)/_components/LegalProse";
import Section from "@/app/(new)/_components/Section";
import SectionTitle from "@/components/refactored/SectionTitle";

export const metadata: Metadata = pageMetadata({
  title: "服務條款",
  description:
    "Bezold 頂讓必售 平台服務條款，規範買賣雙方使用本平台之權利與義務。",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <LaunchBanner />
      <SiteNav />
      <div className="flex-1">
        <LegalHero
          badge="服務條款"
          title="服務條款"
          effectiveDate="2026 年 10 月 3 日"
        />

        <Section variant="default">
          <SectionTitle num="01" title="平台說明" />
          <LegalProse>
            <p>
              Bezold 頂讓必售（以下簡稱「本平台」）由 bezold
              營運，提供台灣店面頂讓資訊之刊登、搜尋與媒合服務。
            </p>
            <p>
              <b>本平台為純媒合平台，不介入買賣雙方之任何交易。</b>
              刊登店面之賣家與有意承接之買家，雙方直接洽談、議價與簽約，本平台不擔任中間人、代理人或保證人角色，亦不對任何交易結果負責。
            </p>
          </LegalProse>
        </Section>

        <Section variant="alt">
          <SectionTitle num="02" title="帳號與資格" />
          <LegalProse>
            <p>使用本平台之刊登功能，您須符合以下條件：</p>
            <p>
              · <b>年齡</b>：須年滿 18 歲，或在法定代理人同意下使用。
            </p>
            <p>
              · <b>資料真實</b>
              ：帳號資訊（姓名、電話、聯絡方式）須為真實有效資料，不得冒用他人身份。
            </p>
            <p>
              · <b>帳號不得轉讓</b>
              ：帳號為個人使用，不得出售、轉讓或共用。
            </p>
            <p>本平台保留在不另行通知的情況下，暫停或終止違規帳號之權利。</p>
          </LegalProse>
        </Section>

        <Section variant="default">
          <SectionTitle num="03" title="刊登規範" />
          <LegalProse>
            <p>刊登店面時，您同意遵守以下規範：</p>
            <p>
              · 僅限台灣境內<b>實體</b>店面，虛擬商店或純線上業務不在受理範圍。
            </p>
            <p>· 刊登內容須真實正確，禁止虛偽不實、誇大或誤導性描述。</p>
            <p>· 禁止重複刊登相同店面。</p>
            <p>
              ·
              刊登照片須為本店實際拍攝，不得使用他人圖片或與實際店況嚴重不符之照片。
            </p>
            <p>
              · 禁止刊登涉及違法行業、賭博、色情或其他違反中華民國法令之內容。
            </p>
            <p>
              本平台保留審核、修改或下架任何不符規範刊登之權利，無需事先通知。
            </p>
          </LegalProse>
        </Section>

        <Section variant="alt">
          <SectionTitle num="04" title="使用者行為" />
          <LegalProse>
            <p>使用本平台時，您不得從事以下行為：</p>
            <p>· 騷擾、恐嚇或欺詐其他用戶。</p>
            <p>· 散布惡意程式、病毒或任何有害程式碼。</p>
            <p>
              ·
              以爬蟲、自動化程式或其他非正常方式大量擷取平台資料，未經書面授權不得商業利用。
            </p>
            <p>· 假冒本平台或其他用戶之身份進行通訊或交易。</p>
            <p>· 任何妨礙平台正常運作之行為。</p>
          </LegalProse>
        </Section>

        <Section variant="default">
          <SectionTitle num="05" title="平台角色與交易責任" />
          <LegalProse>
            <p>
              本平台提供頂讓資訊刊登與媒合服務；除另有書面約定外，非交易當事人、代理人或履約保證人。使用者應於付款或簽約前，自行查證刊登資訊、交易對象之身分與權限，以及租約、設備、財務與交接條件。
            </p>
            <p>
              本平台之資訊確認、精選、評分及估值，其範圍與限制詳見
              <Link href="/disclaimer">《免責聲明與交易提醒》</Link>
              ，該聲明為本服務條款之一部分，應一併閱讀。本平台依法或依約應負之責任，不因上述聲明而免除。
            </p>
          </LegalProse>
        </Section>

        <Section variant="alt">
          <SectionTitle num="06" title="數位資產賣家資料解鎖費" />
          <LegalProse>
            <ol>
              <li>
                <b>適用範圍：</b>本條適用於本平台「數位資產頂讓」類別之刊登。
              </li>
              <li>
                <b>費用：</b>
                買家申請取得數位資產刊登之詳細資料時，應由買家支付賣家資料解鎖費。金額為該刊登價格之百分之零點五（0.5%）；價格為區間者，以區間下限計算。每筆刊登最低新臺幣
                500 元、最高新臺幣 5,000 元；未標示價格（面議）之刊登，以新臺幣
                500 元計。
              </li>
              <li>
                <b>付款：</b>本平台以私訊與買家約定付款方式（例如 LINE
                轉帳），於確認收款後提供資料。
              </li>
              <li>
                <b>提供內容：</b>
                賣家提供予本平台之後台營收或數據截圖、資產連結，以及賣家聯絡方式。
              </li>
              <li>
                <b>費用性質：</b>
                賣家資料解鎖費為取得前款資料之對價，非仲介費、服務費或交易保證金。本平台不介入買賣雙方之洽談、交易及移轉，亦不保證成交。前款資料由賣家提供，本平台僅核對截圖與資產連結之對應，不保證其內容正確、完整。
              </li>
              <li>
                <b>退費：</b>
                賣家資料解鎖費原則上不予退還。經本平台查證，所提供資料與實際情況顯著不符者，本平台得退還已付費用，但應扣除新臺幣
                500 元之作業費用；已付金額為新臺幣 500 元者，不予退還。
              </li>
              <li>
                <b>保密：</b>
                買家取得之資料僅供評估該筆交易使用，不得轉傳、公開或作其他用途。違反者，本平台得停止其帳號使用，並保留法律追訴權。
              </li>
              <li>
                <b>賣家：</b>
                賣家刊登數位資產免費，本條費用概不向賣家收取。賣家刊登數位資產，即同意本平台將其提供之截圖、資產連結及聯絡方式，提供予已支付賣家資料解鎖費之買家。
              </li>
            </ol>
          </LegalProse>
        </Section>

        <Section variant="default">
          <SectionTitle num="07" title="智慧財產權" />
          <LegalProse>
            <p>
              本平台之名稱、商標、標誌、設計、介面及全部內容，其智慧財產權歸
              bezold 所有，未經書面授權不得重製、修改或商業使用。
            </p>
            <p>
              用戶上傳之文字描述、照片等內容，著作權歸用戶本人所有。用戶刊登內容時，即授予本平台在服務範圍內免費展示、重製及傳輸之授權，直至該刊登下架為止。
            </p>
          </LegalProse>
        </Section>

        <Section variant="alt">
          <SectionTitle num="08" title="服務變更與中斷" />
          <LegalProse>
            <p>
              本平台保留隨時修改、暫停或終止部分或全部服務之權利。若屬重大變更，將提前至少{" "}
              <b>7 日</b>於平台公告，緊急情況（如資安事件）除外。
            </p>
            <p>
              因系統維護、天災、網路中斷等不可抗力因素導致服務暫時中斷，本平台不承擔賠償責任。
            </p>
          </LegalProse>
        </Section>

        <Section variant="default">
          <SectionTitle num="09" title="條款修改" />
          <LegalProse>
            <p>
              本平台得視業務需要修改本服務條款，修改後將於平台公告。
              <b>於公告後繼續使用本平台，即視為您已同意修改後之條款。</b>
            </p>
            <p>建議您定期查閱本頁面以了解最新條款內容。</p>
          </LegalProse>
        </Section>

        <Section variant="alt">
          <SectionTitle num="10" title="準據法與管轄" />
          <LegalProse>
            <p>
              本服務條款之解釋與適用，以<b>中華民國法律</b>為準據法。
            </p>
            <p>
              因本條款或使用本平台所生之爭議，雙方同意以<b>台灣台北地方法院</b>
              為第一審管轄法院。
            </p>
          </LegalProse>
        </Section>
      </div>
      <SiteFooter />
    </>
  );
}
