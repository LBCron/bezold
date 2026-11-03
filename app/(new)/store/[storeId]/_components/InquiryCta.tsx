"use client";

import { useEffect, useRef, useState } from "react";
import NextLink from "next/link";
import { onIdTokenChanged, type User as FirebaseUser } from "firebase/auth";
import { useAtomValue, useSetAtom } from "jotai";
import Button from "@/components/refactored/Button";
import { auth, trackEvent } from "@/firebase/client";
import { verifyEmailHref } from "@/lib/auth/verification";
import { buyerClubOpenAtom, buyerClubSourceAtom } from "@/atoms/BuyerClubAtom";
import { INQUIRY_MESSAGE_MAX_LENGTH } from "@/constant/inquiry";
import { inquiryErrorMessage } from "@/utils/inquiry";
import styles from "./InquiryCta.module.css";

type CtaStatus =
  | "loading"
  | "signedOut"
  | "unverified"
  | "idle"
  | "composing"
  | "submitting"
  | "submitted";

const CTA_LABEL = "我有興趣，想申請了解";

// * a digital asset's only way in: the buyer asks, the platform matches. Logged
// * out → buyer club popup; signed in but unverified → /verify-email; member →
// * optional note + 送出申請. GET tells us whether this member already asked.
export default function InquiryCta({ storeId }: { storeId: string }) {
  const [status, setStatus] = useState<CtaStatus>("loading");
  const [message, setMessage] = useState("");
  const [errorText, setErrorText] = useState<string | null>(null);
  const userRef = useRef<FirebaseUser | null>(null);
  const isBuyerClubOpen = useAtomValue(buyerClubOpenAtom);
  const setBuyerClubOpen = useSetAtom(buyerClubOpenAtom);
  const setBuyerClubSource = useSetAtom(buyerClubSourceAtom);

  useEffect(() => {
    let active = true;
    // * onIdTokenChanged so signing up in the popup flips the CTA in place
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      userRef.current = firebaseUser;
      if (!firebaseUser) return active && setStatus("signedOut");
      if (!firebaseUser.emailVerified) return active && setStatus("unverified");
      try {
        const response = await fetch(`/api/stores/${storeId}/inquiry`, {
          headers: {
            authorization: `Bearer ${await firebaseUser.getIdToken()}`,
          },
        });
        const { submitted } = response.ok
          ? await response.json()
          : { submitted: false };
        if (active) setStatus(submitted ? "submitted" : "idle");
      } catch {
        // * can't tell — let them try; a repeat POST is harmless
        if (active) setStatus("idle");
      }
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [storeId]);

  const handleClick = () => {
    trackEvent("digital_inquiry_click", {
      store_id: storeId,
      signed_in: status !== "signedOut",
    });
    if (status === "signedOut") {
      // * an already-open popup (today's auto-open) is left alone
      if (isBuyerClubOpen) return;
      setBuyerClubSource("digital_inquiry");
      setBuyerClubOpen(true);
      return;
    }
    setErrorText(null);
    setStatus("composing");
  };

  const postInquiry = async (
    firebaseUser: FirebaseUser,
    forceRefresh = false,
  ) =>
    fetch(`/api/stores/${storeId}/inquiry`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await firebaseUser.getIdToken(forceRefresh)}`,
      },
      body: JSON.stringify({ message }),
    });

  const handleSubmit = async () => {
    const firebaseUser = userRef.current;
    if (!firebaseUser) return setStatus("signedOut");
    setStatus("submitting");
    setErrorText(null);
    try {
      let response = await postInquiry(firebaseUser);
      // * a just-verified member may hold a token minted before
      // * email_verified flipped — refresh once and retry
      if (response.status === 403)
        response = await postInquiry(firebaseUser, true);
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setErrorText(inquiryErrorMessage(response.status, body?.error));
        setStatus("composing");
        return;
      }
      trackEvent("digital_inquiry_submit", {
        store_id: storeId,
        has_message: message.trim().length > 0,
      });
      setStatus("submitted");
    } catch {
      setErrorText(inquiryErrorMessage(0));
      setStatus("composing");
    }
  };

  const isComposing = status === "composing" || status === "submitting";

  return (
    <div className={styles.cta}>
      {status === "loading" && (
        <span className={styles.skeleton} aria-busy="true" />
      )}

      {status === "submitted" && (
        <Button className={styles.button} disabled>
          已送出申請，我們會盡快與你聯絡
        </Button>
      )}

      {status === "unverified" && (
        <NextLink
          href={verifyEmailHref(`/store/${storeId}`)}
          className={styles.link}
          onClick={() =>
            trackEvent("digital_inquiry_click", {
              store_id: storeId,
              signed_in: true,
            })
          }
        >
          <Button className={styles.button}>驗證信箱後即可申請</Button>
        </NextLink>
      )}

      {(status === "signedOut" || status === "idle") && (
        <Button className={styles.button} onClick={handleClick}>
          {CTA_LABEL}
        </Button>
      )}

      {isComposing && (
        <div className={styles.composer}>
          <label className={styles.label} htmlFor={`inquiry-${storeId}`}>
            想先讓我們知道的事（選填）
          </label>
          <textarea
            id={`inquiry-${storeId}`}
            className={styles.textarea}
            rows={4}
            maxLength={INQUIRY_MESSAGE_MAX_LENGTH}
            placeholder="例如：預算、預計接手時間、想了解的數據"
            value={message}
            disabled={status === "submitting"}
            onChange={(event) => setMessage(event.target.value)}
          />
          <div className={styles.counter}>
            {message.length}/{INQUIRY_MESSAGE_MAX_LENGTH}
          </div>
          {errorText && (
            <p className={styles.error} role="alert">
              {errorText}
            </p>
          )}
          <div className={styles.actions}>
            <Button
              variant="ghost"
              disabled={status === "submitting"}
              onClick={() => setStatus("idle")}
            >
              取消
            </Button>
            <Button
              className={styles.submit}
              disabled={status === "submitting"}
              onClick={handleSubmit}
            >
              {status === "submitting" ? "送出中…" : "送出申請"}
            </Button>
          </div>
        </div>
      )}

      <p className={styles.note}>
        送出後 Bezold
        會私訊你賣家資料解鎖費的金額和付款方式。付款後即可收到後台截圖和賣家聯絡方式；解鎖費不保證成交。
      </p>
    </div>
  );
}
