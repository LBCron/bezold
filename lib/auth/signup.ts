import { createUserWithEmailAndPassword } from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, trackEvent } from "@/firebase/client";
import { COLLECTIONS } from "@/firebase/constants";
import { buyerProfileFields } from "@/lib/user/buyerProfile";
import { sendVerification } from "@/lib/auth/verification";
import type { BuyerProfile } from "@/types/User";

// * Shared account-creation logic used by BOTH the /signup page and the buyer
// * club popup. Keep the auth + user-doc write here so the two surfaces never
// * diverge on error handling, tracked fields, or the doc shape.

// Firebase auth error codes → user-facing zh-TW copy. Shared so every signup
// surface reports errors identically.
export const AUTH_ERRORS: Record<string, string> = {
  "auth/email-already-in-use": "此電子信箱已被註冊",
  "auth/invalid-email": "電子信箱格式不正確",
  "auth/weak-password": "密碼強度不足，請至少使用 6 個字元",
  "auth/too-many-requests": "嘗試次數過多，請稍後再試",
};

export function getStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const strengthColors = [
  "",
  "var(--accent)",
  "var(--accent-3)",
  "var(--accent-3)",
  "var(--accent-2)",
];
export const strengthLabels = ["", "弱", "普通", "良好", "強"];

export interface SignupParams {
  name: string;
  email: string;
  password: string;
  // Contact channels — written to the top-level user doc (same fields the sell
  // form uses). Default to "" when the caller supplies none.
  phone?: string;
  lineId?: string;
  // Buyer-intent preferences, written as a nested `buyerProfile` map. Omitted
  // from the doc entirely when absent (the /signup page passes none) so
  // `buyerProfile == null` cleanly means "no buyer profile".
  buyerProfile?: BuyerProfile;
  // Signup-source attribution.
  fromBuyerClub?: boolean;
  // Analytics attribution — which surface created the account.
  source?: string;
  // Where the verification link should land the user once verified.
  redirectPath?: string;
}

export interface SignupResult {
  user: FirebaseUser;
  // False when the account was created but the verification email failed to
  // send — the caller should still continue; /verify-email offers a resend.
  verificationSent: boolean;
}

// Creates the Firebase Auth account, writes the user doc, fires the sign_up
// event, then sends the verification email. Throws on account-creation failure
// (callers map err.code via AUTH_ERRORS); a failed verification email does not
// throw, since the account already exists. Does NOT navigate — the caller
// decides whether to redirect or stay put.
export async function signup({
  name,
  email,
  password,
  phone = "",
  lineId = "",
  buyerProfile,
  fromBuyerClub = false,
  source = "signup_page",
  redirectPath,
}: SignupParams): Promise<SignupResult> {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, COLLECTIONS.USER, user.uid), {
    userName: name,
    phone,
    email,
    lineId,
    // Welds buyerProfile + hasBuyerProfile (or marks hasBuyerProfile:false).
    ...buyerProfileFields(buyerProfile),
    fromBuyerClub,
    createTime: serverTimestamp(),
    updateTime: serverTimestamp(),
  });
  trackEvent("sign_up", { method: "email", entry_point: source });

  let verificationSent = true;
  try {
    await sendVerification(user, { redirectPath, trigger: "signup", source });
  } catch {
    verificationSent = false;
  }
  return { user, verificationSent };
}
