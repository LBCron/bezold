import GuideSteps from "./GuideSteps";
import type { GuideStep } from "./GuideSteps";

const steps: GuideStep[] = [
  {
    number: 1,
    title: "整理店況",
    desc: "備妥近 3 個月營業額、月租金額、設備清單與店面照片。定好頂讓金再上架。",
  },
  {
    number: 2,
    title: "免費刊登",
    desc: "5 分鐘填好表單、上傳照片。早鳥 12/1 前 0 元，當天審核上架。",
  },
  {
    number: 3,
    title: "接受詢問",
    desc: "有興趣的買家直接來電或 LINE，自行安排看店時間，平台不介入談判。",
  },
  {
    number: 4,
    title: "簽約交接",
    desc: "與買家簽訂頂讓合約，移交設備清單，通知房東辦理租約過戶手續。",
  },
];

export default function SellerSteps() {
  return (
    <GuideSteps
      anchorId="seller"
      sectionNum="03"
      title="賣家流程"
      sub="— 五分鐘上架，買家自己來找你 —"
      variant="alt"
      type="SELLER"
      steps={steps}
    />
  );
}
