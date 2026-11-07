import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { truncateText } from "../../utils/text.ts";

// * true when a UTF-16 surrogate has lost its partner — the "�" that broke
// * /store-list hydration
const hasLoneSurrogate = (text: string) =>
  /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/.test(
    text,
  );

describe("truncateText", () => {
  it("leaves text within the limit unchanged", () => {
    assert.equal(truncateText("頂讓店面", 4), "頂讓店面");
  });

  it("cuts to the limit, counting the ellipsis", () => {
    assert.equal(truncateText("台北信義區寵物美容", 5), "台北信義…");
  });

  it("never splits an emoji at the cut", () => {
    // * 🐾 starts right at the cut point
    const result = truncateText("寄養合格場地條件 🐾 歡迎洽詢", 11);
    assert.equal(hasLoneSurrogate(result), false);
    assert.equal(result, "寄養合格場地條件 🐾…");
  });

  it("counts a joined emoji as one character", () => {
    assert.equal(truncateText("主廚👨‍🍳在店內料理", 4), "主廚👨‍🍳…");
  });
});
