"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, ArrowRight, Check, CheckCircle2, Leaf, Loader2, MailCheck, ShieldCheck, Sparkles } from "lucide-react";
import { auth, formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const { isAuthenticated, loading: authLoading, refreshUser } = useAuth();
  const requestStarted = useRef(false);
  const [status, setStatus] = useState(token ? "verifying" : "error");
  const [error, setError] = useState(
    token ? "" : "This verification link is missing its token. Request a new verification email."
  );

  useEffect(() => {
    if (!token || authLoading || requestStarted.current) return;
    requestStarted.current = true;

    async function verify() {
      try {
        await auth.verifyEmail(token);
        if (isAuthenticated) await refreshUser();
        setStatus("success");
      } catch (err) {
        setError(formatApiError(err));
        setStatus("error");
      }
    }

    verify();
  }, [authLoading, isAuthenticated, refreshUser, token]);

  const complete = status === "success";
  const destination = isAuthenticated ? "/account" : "/login";
  const actionLabel = isAuthenticated ? "Return to my account" : "Sign in to your account";

  return (
    <section className="overflow-hidden rounded-[2rem] border border-gold/25 bg-[#fffdf8] shadow-[0_35px_100px_-45px_rgba(21,56,38,0.35)]">
      <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative z-10 px-7 py-10 sm:px-12 sm:py-14 lg:px-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-pine-900/10 bg-white/80 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-pine-900">
            <ShieldCheck className="h-3.5 w-3.5 text-gold-deep" />
            Yugika Foods · Account security
          </div>

          <div className={`mt-9 flex h-16 w-16 items-center justify-center rounded-[1.35rem] ${
            status === "error" ? "bg-rose-50 text-rose-600" : "bg-gold/15 text-gold-deep"
          }`}>
            {status === "verifying" ? (
              <Loader2 className="h-7 w-7 animate-spin" />
            ) : complete ? (
              <CheckCircle2 className="h-8 w-8" />
            ) : (
              <MailCheck className="h-8 w-8" />
            )}
          </div>

          <p className="mt-7 text-xs font-semibold uppercase tracking-[0.28em] text-gold-deep">
            {complete ? "A warm welcome to the family" : "One quick security check"}
          </p>
          <h1 className="mt-3 max-w-lg font-display text-4xl font-medium leading-[1.12] text-pine-950 sm:text-5xl">
            {status === "verifying"
              ? "Confirming it’s really you."
              : complete
                ? "Your email is verified."
                : "We couldn’t verify this link."}
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-ink/65">
            {status === "verifying"
              ? "We’re securely confirming your email address. This should only take a moment."
              : complete
                ? isAuthenticated
                  ? "You’re all set—and already signed in. Your account is verified and ready to use."
                  : "You’re all set. Your email is confirmed, and your account is ready whenever you are."
                : "This verification link may have expired or already been used. Request a fresh email from your account and try again."}
          </p>

          {status === "error" && (
            <div role="alert" className="mt-6 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-800">
              <AlertCircle className="mt-1 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {status !== "verifying" && (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {complete ? (
                <Link href={destination} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-pine-900 px-5 py-3 text-sm font-semibold text-cream shadow-lg shadow-pine-950/10 transition hover:-translate-y-0.5 hover:bg-pine-950">
                  {actionLabel} <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link href={isAuthenticated ? "/account" : "/login"} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-pine-900 px-5 py-3 text-sm font-semibold text-cream shadow-lg shadow-pine-950/10 transition hover:-translate-y-0.5 hover:bg-pine-950">
                  {isAuthenticated ? "Back to my account" : "Go to sign in"} <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              {complete && (
                <Link href="/products" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-pine-900/15 bg-white px-5 py-3 text-sm font-semibold text-pine-900 transition hover:border-pine-900/30 hover:bg-cream">
                  Explore our products
                </Link>
              )}
            </div>
          )}

          {complete && (
            <div className="mt-9 flex flex-wrap gap-x-5 gap-y-2 border-t border-pine-900/10 pt-5 text-xs font-medium text-ink/55">
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-pine-800" /> Email confirmed</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-pine-800" /> Account secured</span>
            </div>
          )}
        </div>

        <div className="relative hidden min-h-[520px] overflow-hidden bg-gradient-to-br from-[#f5ebd0] via-[#f9f3e5] to-[#e6eedf] lg:flex lg:items-center lg:justify-center">
          <div className="absolute -right-28 -top-20 h-80 w-80 rounded-full border border-gold/20" />
          <div className="absolute -right-12 -top-4 h-64 w-64 rounded-full border border-gold/25" />
          <div className="absolute -bottom-36 -left-20 h-96 w-96 rounded-full border border-pine-900/10" />
          <div className="absolute left-12 top-16 text-gold-deep/60"><Sparkles className="h-6 w-6" /></div>
          <div className="absolute bottom-28 right-14 text-pine-800/50"><Leaf className="h-7 w-7" /></div>

          <div className="relative flex h-72 w-72 items-center justify-center rounded-full border border-white/80 bg-white/30 shadow-[0_30px_90px_-40px_rgba(21,56,38,0.35)] backdrop-blur-sm">
            <div className="absolute inset-5 rounded-full border border-gold/25" />
            <div className="absolute inset-10 rounded-full border border-pine-900/10" />
            <div className="flex h-36 w-36 items-center justify-center rounded-full bg-[#fffdf8] text-pine-900 shadow-xl shadow-pine-950/10">
              {status === "verifying" ? (
                <Loader2 className="h-14 w-14 animate-spin text-gold-deep" />
              ) : complete ? (
                <CheckCircle2 className="h-16 w-16 stroke-[1.25] text-pine-800" />
              ) : (
                <MailCheck className="h-14 w-14 stroke-[1.25] text-gold-deep" />
              )}
            </div>
            <div className="absolute -bottom-4 rounded-full border border-gold/20 bg-[#fffdf8] px-5 py-2.5 text-xs font-semibold tracking-wide text-pine-900 shadow-lg">
              {complete ? "Your account, beautifully secured" : "Trusted by Yugika Foods"}
            </div>
          </div>
          <div className="absolute bottom-10 left-10 max-w-[190px] text-xs leading-5 text-pine-950/55">
            Thoughtfully made. Carefully delivered. Always yours.
          </div>
        </div>
      </div>
    </section>
  );
}
