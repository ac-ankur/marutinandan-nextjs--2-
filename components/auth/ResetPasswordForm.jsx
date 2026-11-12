"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Lock, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { auth, formatApiError } from "@/lib/api";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (!token) {
      setError("This reset link is missing its token. Request a new password reset link.");
      return;
    }
    if (password.length < 8) {
      setError("Use a password with at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await auth.resetPassword(token, password);
      setComplete(true);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-gold/25 bg-cream-paper p-7 shadow-[0_25px_70px_-25px_rgba(21,56,38,0.25)] sm:p-10">
      <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold-deep">
        {complete ? <CheckCircle2 className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-deep">Account security</p>
      <h1 className="mt-2 font-display text-3xl font-medium text-pine-950 sm:text-4xl">
        {complete ? "Password updated" : "Reset your password"}
      </h1>

      {complete ? (
        <div>
          <p className="mt-3 text-sm leading-6 text-ink/70">Your password has been changed. Sign in with your new password to continue.</p>
          <Link href="/login" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-pine-900 px-5 py-3 text-sm font-semibold text-cream transition hover:bg-pine-950">
            Go to sign in <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-3 text-sm leading-6 text-ink/70">Choose a new password for your Yugika Foods account.</p>
          {error && (
            <div role="alert" className="mt-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="new-password" className="mb-1.5 block text-xs font-semibold text-pine-950">New password</label>
              <div className="relative">
                <input id="new-password" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-ink/15 bg-white px-4 py-3 pr-20 text-sm text-ink outline-none transition focus:border-gold-deep focus:ring-2 focus:ring-gold/20" />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute inset-y-0 right-3 text-xs font-semibold text-pine-800" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button>
              </div>
              <p className="mt-1 text-[11px] text-ink/50">Use at least 8 characters.</p>
            </div>
            <div>
              <label htmlFor="confirm-password" className="mb-1.5 block text-xs font-semibold text-pine-950">Confirm new password</label>
              <input id="confirm-password" type={showPassword ? "text" : "password"} autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-gold-deep focus:ring-2 focus:ring-gold/20" />
            </div>
            <button type="submit" disabled={loading || !token} className="flex w-full items-center justify-center gap-2 rounded-xl bg-pine-900 px-5 py-3.5 text-sm font-semibold text-cream transition hover:bg-pine-950 disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating password…</> : <>Update password <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>
          {!token && <p className="mt-4 text-center text-xs text-ink/60">Need a new link? <Link href="/login" className="font-semibold text-pine-900 underline">Return to sign in</Link> and request a reset email.</p>}
        </>
      )}
    </section>
  );
}
