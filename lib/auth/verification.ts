import { sendEmailVerification } from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";
import { auth, trackEvent } from "@/firebase/client";

// * Email-verification helpers shared by every surface that sends or checks the
// * verification link (/verify-email, the signup flows, the listing gates).

export const DEFAULT_REDIRECT = "/store-list";
export const RESEND_COOLDOWN_SECONDS = 60;

// Firebase error codes → zh-TW copy for sending the verification email.
export const VERIFY_ERRORS: Record<string, string> = {
  "auth/too-many-requests": "寄送次數過多，請稍後再試",
  "auth/network-request-failed": "網路連線異常，請再試一次",
};

// Only same-site paths may be used as a post-verification destination — a
// full URL or protocol-relative "//host" would make /verify-email an open
// redirect.
export function safeRedirectPath(path: string | null | undefined): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return DEFAULT_REDIRECT;
  }
  return path;
}

export function verifyEmailHref(redirectPath: string): string {
  const params = new URLSearchParams({ redirect: redirectPath });
  return `/verify-email?${params.toString()}`;
}

interface SendVerificationOptions {
  redirectPath?: string;
  trigger: "signup" | "resend";
  // Which surface sent it — signup() source on signup, the current page on
  // resend. Analytics only.
  source: string;
}

// Sends (or re-sends) the verification email. The link passes through
// Firebase's hosted action page, whose "continue" button returns the user to
// /verify-email, which then forwards to `redirectPath`.
export async function sendVerification(
  user: FirebaseUser,
  { redirectPath = DEFAULT_REDIRECT, trigger, source }: SendVerificationOptions,
): Promise<void> {
  auth.languageCode = "zh-TW";
  const continueUrl = new URL(
    verifyEmailHref(safeRedirectPath(redirectPath)),
    window.location.origin,
  );
  await sendEmailVerification(user, { url: continueUrl.toString() });
  trackEvent("verification_email_sent", {
    trigger,
    entry_point: source,
  });
}

// user.emailVerified and the ID token's email_verified claim both stay stale
// until refreshed. reload() updates the former; getIdToken(true) mints a token
// with the new claim (what the API checks) and fires onIdTokenChanged, which
// is how every listening component learns about the change.
export async function refreshVerification(
  user: FirebaseUser,
): Promise<boolean> {
  await user.reload();
  await user.getIdToken(true);
  return user.emailVerified;
}
