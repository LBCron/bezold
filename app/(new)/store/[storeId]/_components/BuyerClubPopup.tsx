"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAtom } from "jotai";
import { onAuthStateChanged } from "firebase/auth";
import { auth, trackEvent } from "@/firebase/client";
import Dropdown from "@/components/refactored/Dropdown";
import FormField from "@/components/refactored/FormField";
import EyeIcon from "@/app/(new)/_components/EyeIcon";
import { cityItems, amountItems } from "@/components/SearchFilter/DropDowns";
import { buyerClubOpenAtom, buyerClubSourceAtom } from "@/atoms/BuyerClubAtom";
import {
  BUYER_CLUB_COPY,
  BUYER_CLUB_CATEGORIES,
  BUYER_CLUB_DIGITAL_COPY,
  BUYER_CLUB_DIGITAL_CATEGORY,
} from "@/constant/buyerClub";
import {
  buyerClubSignupSource,
  buyerConditionsError,
  isBuyerCityRequired,
  isVisitorOpenedSource,
} from "@/utils/buyerClub";
import {
  signup,
  AUTH_ERRORS,
  getStrength,
  isValidEmail,
  strengthColors,
  strengthLabels,
} from "@/lib/auth/signup";
import { RESEND_COOLDOWN_SECONDS } from "@/lib/auth/verification";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import VerifyEmailPanel from "@/app/(new)/_components/VerifyEmailPanel";
import styles from "./BuyerClubPopup.module.css";

const SUPPRESS_KEY = "buyerClubPopupSeen";

const categoryOptions = BUYER_CLUB_CATEGORIES.map((item) => ({
  label: item.label,
  value: item.key,
}));
const cityOptions = cityItems.map((item) => ({
  label: item.label as string,
  value: item.key,
}));
const amountOptions = amountItems.map((item) => ({
  label: item.label,
  value: item.key,
}));

function todayKey(): string {
  // Local YYYY-MM-DD, not UTC — the once-per-day boundary must fall at the
  // visitor's local midnight. toISOString() would roll over at 00:00 UTC
  // (08:00 in Taiwan), re-opening the popup mid-morning after a dismiss.
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function suppressedToday(): boolean {
  try {
    return localStorage.getItem(SUPPRESS_KEY) === todayKey();
  } catch {
    return false;
  }
}

function markSuppressed(): void {
  try {
    localStorage.setItem(SUPPRESS_KEY, todayKey());
  } catch {
    // Private mode / storage disabled — popup just won't be suppressed. Fine.
  }
}

export default function BuyerClubPopup({
  forceOpen,
  isDigital,
}: {
  forceOpen: boolean;
  isDigital: boolean;
}) {
  // Gate everything on the FIRST resolved auth callback — reading
  // auth.currentUser synchronously would flash the popup for logged-in members
  // while Firebase restores the persisted session.
  const [authReady, setAuthReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Open state + entry point live in atoms so the seller contact gate — a
  // sibling subtree on the same page — can open this popup.
  const [open, setOpen] = useAtom(buyerClubOpenAtom);
  const [source, setSource] = useAtom(buyerClubSourceAtom);
  const pathname = usePathname();

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [category, setCategory] = useState("");
  const [budgetKey, setBudgetKey] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [lineId, setLineId] = useState("");
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Set once an account is created here: the popup stays open on a "check
  // your inbox" step instead of closing the moment the visitor is signed in.
  const [signedUp, setSignedUp] = useState<{
    verificationSent: boolean;
  } | null>(null);
  // The auth listener below fires mid-signup (before signup() resolves) and
  // would otherwise close the popup; a ref because that closure is stale.
  const keepOpenAfterSignup = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      const loggedIn = Boolean(firebaseUser);
      setIsLoggedIn(loggedIn);
      setAuthReady(true);
      if (loggedIn) {
        if (!keepOpenAfterSignup.current) setOpen(false);
        return;
      }
      // Logged-out visitor: force-open (paid ad link) bypasses the daily cap;
      // organic visits respect it.
      const shouldOpen = forceOpen || !suppressedToday();
      const autoSource = forceOpen ? "url_force" : "auto";
      setSource(autoSource);
      setOpen(shouldOpen);
      if (shouldOpen) {
        // An organic auto-open counts as today's one showing — mark it now so
        // the cap holds even if the visitor navigates away without dismissing
        // (otherwise every store page would re-open it and re-fire impressions).
        // A force-open (ad landing) deliberately doesn't consume the cap.
        if (!forceOpen) markSuppressed();
        trackEvent("buyer_club_popup_impression", {
          entry_point: autoSource,
        });
      }
    });
    return () => {
      unsubscribe();
      // The atom outlives this component — leaving it open would flash the
      // popup on the next store page before auth resolves there.
      setOpen(false);
    };
  }, [forceOpen, setOpen, setSource]);

  // Lock body scroll while the popup is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") handleDismiss();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, signedUp]);

  // Opened from the locked seller contact block or a digital asset's inquiry
  // button — the visitor asked for this one, so the daily auto-open cap does
  // not apply to it.
  const isVisitorOpened = isVisitorOpenedSource(source);
  const cityRequired = isBuyerCityRequired(category);
  // Digital assets are anonymous — never promise the seller's contact details,
  // whichever entry point opened the popup on that page.
  const copy = isDigital ? BUYER_CLUB_DIGITAL_COPY : BUYER_CLUB_COPY;

  // A digital-asset inquiry means the buyer is after a digital asset —
  // preselect it (an earlier choice in this page view is kept).
  useEffect(() => {
    if (open && source === "digital_inquiry")
      setCategory((current) => current || BUYER_CLUB_DIGITAL_CATEGORY);
  }, [open, source]);
  // Signing in always returns to the listing being read.
  const loginHref = `/login?redirect=${pathname}`;

  // Leaving the "check your inbox" step — the visitor keeps browsing as a
  // signed-in, not-yet-verified member.
  function finishVerifyStep() {
    keepOpenAfterSignup.current = false;
    setSignedUp(null);
    setOpen(false);
  }

  function handleDismiss() {
    if (signedUp) {
      finishVerifyStep();
      return;
    }
    setOpen(false);
    // A popup the visitor opened themselves must not consume the day's
    // auto-open allowance — the cap only governs uninvited interruptions.
    if (!isVisitorOpened) markSuppressed();
    trackEvent("buyer_club_popup_dismiss", { entry_point: source });
  }

  const strength = getStrength(password);
  const emailHint =
    emailTouched && email.length > 0 && !isValidEmail(email)
      ? "請輸入有效的電子信箱格式"
      : undefined;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setError("請填寫稱呼");
      return;
    }
    if (!isValidEmail(email)) {
      setError("請輸入有效的電子信箱");
      return;
    }
    if (password.length < 6) {
      setError("密碼請至少使用 6 個字元");
      return;
    }
    const conditionsError = buyerConditionsError({ category, budgetKey, city });
    if (conditionsError) {
      setError(conditionsError);
      return;
    }
    if (!phone.trim() && !lineId.trim()) {
      setError("請至少填寫一種聯繫方式（電話或 LINE ID）");
      return;
    }
    if (!terms) {
      setError("請先同意服務條款與隱私政策");
      return;
    }
    setError(null);
    setLoading(true);
    keepOpenAfterSignup.current = true;
    try {
      const { verificationSent } = await signup({
        name,
        email,
        password,
        phone,
        lineId,
        source: buyerClubSignupSource(source),
        fromBuyerClub: true,
        buyerProfile: {
          category,
          city,
          budgetKey,
        },
        // The verification link brings the visitor back to this listing.
        redirectPath: pathname,
      });
      setSignedUp({ verificationSent });
    } catch (err) {
      keepOpenAfterSignup.current = false;
      const code = (err as { code?: string }).code ?? "";
      setError(AUTH_ERRORS[code] ?? "發生未知錯誤，請再試一次");
    } finally {
      setLoading(false);
    }
  }

  // Nothing until auth resolves, and never for logged-in members — except the
  // visitor who is signing up right here (loading) or was just signed up.
  if (!authReady || (isLoggedIn && !loading && !signedUp)) return null;

  if (!open) {
    return (
      <button
        type="button"
        className={styles.fab}
        onClick={() => {
          setSource("fab");
          setOpen(true);
          trackEvent("buyer_club_popup_impression", {
            entry_point: "fab",
          });
        }}
        aria-label="尋找適合你的下一間店"
      >
        <span className={styles.fabText}>尋找適合你的下一間店</span>
        <span className={styles.fabBadge} aria-hidden="true">
          B
        </span>
      </button>
    );
  }

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="buyerClubTitle"
      onClick={handleDismiss}
    >
      <div
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={styles.closeBtn}
          onClick={handleDismiss}
          aria-label="關閉"
        >
          ✕
        </button>

        <aside className={styles.aside}>
          <p className={styles.brand}>✦ BEZOLD BUYER CLUB</p>
          <h2 className={styles.asideTitle}>
            {copy.asideTitle[0]}
            <br />
            {copy.asideTitle[1]}
          </h2>
          <p className={styles.asideLede}>{copy.asideLede}</p>
          <ul className={styles.benefits}>
            {copy.benefits.map((benefit, index) => (
              <li key={benefit}>
                <span className={styles.benefitNum}>
                  {String(index + 1).padStart(2, "0")}
                </span>{" "}
                {benefit}
              </li>
            ))}
          </ul>
          <span className={styles.watermark} aria-hidden="true">
            B
          </span>
        </aside>

        <div className={styles.formPanel}>
          {loading && (
            <div className={styles.loadingOverlay}>
              <div className={styles.spinner} />
              <p className={styles.loadingText}>建立帳號中，請稍候...</p>
            </div>
          )}
          {signedUp ? (
            <VerifyStep
              redirectPath={pathname}
              verificationSent={signedUp.verificationSent}
              context={copy.verifyContext}
              onDone={finishVerifyStep}
            />
          ) : (
            <>
              <h3 id="buyerClubTitle" className={styles.formTitle}>
                建立你的買家條件
              </h3>
              <p className={styles.formSub}>填寫約 1 分鐘，標示 * 為必填。</p>

              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.row}>
                  <FormField
                    id="bc-name"
                    label={<RequiredLabel>稱呼</RequiredLabel>}
                    placeholder="怎麼稱呼您？"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>
                      <RequiredLabel>想找的頂讓類型</RequiredLabel>
                    </span>
                    <Dropdown
                      label="類型"
                      options={categoryOptions}
                      value={category}
                      onChange={setCategory}
                      placeholder="請選擇"
                    />
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>
                      <RequiredLabel>預算範圍</RequiredLabel>
                    </span>
                    <Dropdown
                      label="預算"
                      options={amountOptions}
                      value={budgetKey}
                      onChange={setBudgetKey}
                      placeholder="請選擇預算範圍"
                    />
                  </div>
                  <div className={styles.field}>
                    <span className={styles.fieldLabel}>
                      {cityRequired ? (
                        <RequiredLabel>希望地區（縣市）</RequiredLabel>
                      ) : (
                        // * digital assets have no location — "" = 不限地區
                        "希望地區（縣市，選填）"
                      )}
                    </span>
                    <Dropdown
                      label="地區"
                      options={cityOptions}
                      value={city}
                      onChange={setCity}
                      placeholder="請選擇"
                    />
                  </div>
                </div>

                <div>
                  <span className={styles.fieldLabel}>
                    <RequiredLabel>聯繫方式</RequiredLabel>
                    <span className={styles.hintNote}>
                      電話與 LINE ID 至少填一項
                    </span>
                  </span>
                  <div className={styles.row}>
                    <FormField
                      id="bc-phone"
                      label="電話"
                      type="text"
                      placeholder="例：0912345678"
                      autoComplete="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                    />
                    <FormField
                      id="bc-line"
                      label="LINE ID"
                      placeholder="您的 LINE ID"
                      value={lineId}
                      onChange={(event) => setLineId(event.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.divider} />

                <div className={styles.row}>
                  <FormField
                    id="bc-email"
                    label={<RequiredLabel>登入電子信箱</RequiredLabel>}
                    type="email"
                    placeholder="your@email.com"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    hint={emailHint}
                  />
                  <FormField
                    id="bc-password"
                    label={<RequiredLabel>設定密碼</RequiredLabel>}
                    type={showPassword ? "text" : "password"}
                    placeholder="至少 6 個字元"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    suffix={
                      <button
                        className={styles.eyeBtn}
                        type="button"
                        aria-label={showPassword ? "隱藏密碼" : "顯示密碼"}
                        onClick={() => setShowPassword((previous) => !previous)}
                      >
                        <EyeIcon visible={showPassword} />
                      </button>
                    }
                  />
                </div>

                {password.length > 0 && (
                  <div className={styles.strengthRow}>
                    <div className={styles.strengthBar}>
                      {[0, 1, 2, 3].map((index) => (
                        <span
                          key={index}
                          className={styles.strengthSegment}
                          style={{
                            background:
                              index < strength
                                ? strengthColors[strength]
                                : undefined,
                          }}
                        />
                      ))}
                    </div>
                    <span
                      className={styles.strengthLabel}
                      style={{ color: strengthColors[strength] }}
                    >
                      {strengthLabels[strength]}
                    </span>
                  </div>
                )}

                <label className={styles.checkboxRow}>
                  <input
                    className={styles.checkbox}
                    type="checkbox"
                    checked={terms}
                    onChange={(event) => setTerms(event.target.checked)}
                  />
                  <span>
                    我同意{" "}
                    <Link
                      className={styles.termsLink}
                      href="/terms"
                      target="_blank"
                    >
                      服務條款
                    </Link>{" "}
                    與{" "}
                    <Link
                      className={styles.termsLink}
                      href="/privacy"
                      target="_blank"
                    >
                      隱私政策
                    </Link>
                  </span>
                </label>

                {error && <p className={styles.errorMsg}>{error}</p>}

                <button
                  type="submit"
                  className={styles.submit}
                  disabled={loading}
                >
                  {loading ? copy.submitLoading : copy.submit}
                </button>

                <p className={styles.loginHint}>
                  已經有帳號？{" "}
                  <Link className={styles.loginLink} href={loginHref}>
                    由此登入
                  </Link>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function VerifyStep({
  redirectPath,
  verificationSent,
  context,
  onDone,
}: {
  redirectPath: string;
  verificationSent: boolean;
  context: string;
  onDone: () => void;
}) {
  const verification = useEmailVerification({
    source: "buyer_club_popup",
    redirectPath,
    initialCooldown: verificationSent ? RESEND_COOLDOWN_SECONDS : 0,
  });
  const { isVerified } = verification;

  // Verified in another tab while this step is open — nothing left to do
  // here; the contact block unlocks on its own.
  useEffect(() => {
    if (isVerified) onDone();
  }, [isVerified, onDone]);

  return (
    <VerifyEmailPanel
      verification={verification}
      title="差一步就完成"
      context={context}
      headingId="buyerClubTitle"
    >
      <button type="button" className={styles.browseBtn} onClick={onDone}>
        先逛逛
      </button>
    </VerifyEmailPanel>
  );
}

function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children} <span className={styles.required}>*</span>
    </>
  );
}
