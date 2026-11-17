"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, MailCheck } from "lucide-react";
import { auth, formatApiError } from "@/lib/api";

export default function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const requestStarted = useRef(false);
  const [status, setStatus] = useState(token ? "verifying" : "error");
  const [error, setError] = useState(
    token ? "" : "This verification link is missing its token. Request a new verification email."
  );

  useEffect(() => {
    if (!token || requestStarted.current) return;
    requestStarted.current = true;

    auth.verifyEmail(token).then(
      () => setStatus("success"),
      (err) => {
        setError(formatApiError(err));
        setStatus("error");
      }
    );
  }, [token]);

  const complete = status === "success";

  return (
    <section className="rounded-3xl border border-gold/25 bg-cream-paper p-7 shadow-[0_25px_70px_-25px_rgba(21,56,38,0.25)] sm:p-10">
      <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold-deep">
        {status === "verifying" ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : complete ? (
          <CheckCircle2 className="h-6 w-6" />
        ) : (
          <MailCheck className="h-6 w-6" />
        )}
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-deep">Account security</p>
      <h1 className="mt-2 font-display text-3xl font-medium text-pine-950 sm:text-4xl">
        {status === "verifying"
          ? "Verifying your email"
          : complete
            ? "Email verified"
            : "Could not verify email"}
      </h1>

      {status === "verifying" ? (
        <p className="mt-3 text-sm leading-6 text-ink/70">Please wait while we confirm your email address.</p>
      ) : complete ? (
        <>
          <p className="mt-3 text-sm leading-6 text-ink/70">
            Your email address is verified. You can now sign in to your account.
          </p>
          <Link href="/login" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-pine-900 px-5 py-3 text-sm font-semibold text-cream transition hover:bg-pine-950">
            Go to sign in <ArrowRight className="h-4 w-4" />
          </Link>
        </>
      ) : (
        <>
          <div role="alert" className="mt-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <p className="mt-4 text-sm leading-6 text-ink/70">
            The link may have expired or already been used. Sign in or request another verification email from your account.
          </p>
          <Link href="/login" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-pine-900 px-5 py-3 text-sm font-semibold text-cream transition hover:bg-pine-950">
            Go to sign in <ArrowRight className="h-4 w-4" />
          </Link>
        </>
      )}
    </section>
  );
}
