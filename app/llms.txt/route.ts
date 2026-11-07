import { getAllPostsMeta } from "@/lib/blog";
import { CONTACT_EMAIL } from "@/constant/contact";

// * built once at build time — content/blog is read here, never at runtime
// * (a revalidating route can't see that folder on Vercel; see the sitemap)
export const dynamic = "force-static";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL!;

const MAIN_PAGES = [
  ["找店", "/store-list", "全台頂讓店面列表，可依縣市、行業、頂讓金篩選"],
  ["數位資產", "/digital-assets", "電商賣場、社群帳號、網站等數位資產頂讓"],
  ["我要頂出", "/sell", "刊登流程、費用說明與刊登須知"],
  ["頂讓指南", "/store-guide", "頂讓是什麼、頂讓金怎麼算、買店與頂出流程"],
  ["常見問題", "/faq", "刊登、收費、交接與安全的常見問題"],
  ["關於我們", "/about", "Bezold 是什麼、刊登怎麼審核"],
  ["聯絡我們", "/contact", "Email 與 LINE 客服"],
];

export function GET() {
  const posts = getAllPostsMeta();

  const body = [
    "# Bezold 頂讓必售（頂讓網）",
    "",
    "> 全台店面頂讓平台。買家直接聯絡賣家，平台不作為中間人；2026/12/1 前免費刊登，成交永久不抽成。",
    "",
    "## 主要頁面",
    "",
    ...MAIN_PAGES.map(
      ([label, path, summary]) =>
        `- [${label}](${BASE_URL}${path})：${summary}`,
    ),
    "",
    "## 創業部落格",
    "",
    ...posts.map(
      (post) =>
        `- [${post.title}](${BASE_URL}/blog/${post.slug})：${post.description}`,
    ),
    "",
    "## 聯絡",
    "",
    `- Email：${CONTACT_EMAIL}`,
    "- LINE：bezoldtw（https://line.me/ti/p/~bezoldtw）",
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
