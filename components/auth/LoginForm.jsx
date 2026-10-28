"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { auth, formatApiError } from "@/lib/api";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [googleNotice, setGoogleNotice] = useState("");

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotTouched, setForgotTouched] = useState(false);
  const [forgotFieldError, setForgotFieldError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotServerError, setForgotServerError] = useState("");

  function validate(values = formData) {
    const errs = {};
    const email = (values.email || "").trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      errs.email = "Email address is required";
    } else if (!emailRegex.test(email)) {
      errs.email = "Please enter a valid email address (e.g. name@example.com)";
    }

    if (!values.password) {
      errs.password = "Password is required";
    }

    return errs;
  }

  function handleBlur(field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errs = validate(formData);
    setErrors((prev) => ({ ...prev, [field]: errs[field] || "" }));
  }

  function handleChange(e) {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    if (touched[name]) {
      const errs = validate(updated);
      setErrors((prev) => ({ ...prev, [name]: errs[name] || "" }));
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setServerError("");

    setTouched({
      email: true,
      password: true,
    });

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      const loggedInUser = await login(formData.email.trim(), formData.password);
      // If the user is an admin, always send them to the admin dashboard
      if (loggedInUser?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push(redirectUrl);
      }
    } catch (err) {
      console.error("Login failed:", err);
      setServerError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleClick() {
    setGoogleNotice(
      "Google Sign-In configuration is ready. It will activate once the Google Client ID is configured in your settings."
    );
    setTimeout(() => setGoogleNotice(""), 6000);
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    setForgotServerError("");
    setForgotTouched(true);

    const email = forgotEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setForgotFieldError("Email address is required");
      return;
    }
    if (!emailRegex.test(email)) {
      setForgotFieldError("Please enter a valid email address");
      return;
    }

    setForgotFieldError("");
    setForgotLoading(true);

    try {
      await auth.forgotPassword(email);
      setForgotSuccess(true);
    } catch (err) {
      setForgotServerError(err?.message || "Unable to send password reset email. Please verify your address.");
    } finally {
      setForgotLoading(false);
    }
  }

  return (
    <div className="relative mx-auto w-full max-w-5xl">
      <div className="grid items-stretch gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Left Side: Brand Story & Trust Card */}
        <div className="flex flex-col justify-between rounded-3xl bg-pine-950 p-8 sm:p-10 text-cream shadow-xl lg:col-span-5 relative overflow-hidden">
          {/* Subtle decorative background glow */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-pine-800/40 blur-3xl" />

          <div className="relative z-10">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-full border border-gold/40 bg-white p-0.5 shadow-md">
                <Image
                  src="/images/yugika-logo.jpg"
                  alt="Yugika Foods logo"
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div>
                <p className="font-display text-xl font-bold tracking-wide text-cream">Yugika Foods</p>
                <p className="text-[10px] uppercase tracking-[0.25em] text-gold-light">Marutinandan</p>
              </div>
            </div>

            <div className="mt-10 sm:mt-12">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-medium text-gold-light">
                <Sparkles className="h-3.5 w-3.5 text-gold" />
                Pure &amp; Lab-Tested
              </span>
              <h2 className="mt-4 font-display text-3xl font-normal leading-tight text-cream sm:text-4xl">
                Taste the tradition of <span className="italic text-gold-light">Pure Kachi Ghani.</span>
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-cream/70">
                Sign in to manage your orders, download GST invoices, save delivery addresses, and enjoy farm-fresh cold-pressed mustard oil.
              </p>
            </div>
          </div>

          {/* Trust badges */}
          <div className="relative z-10 mt-10 border-t border-cream/10 pt-6">
            <div className="space-y-3.5 text-xs text-cream/80">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-pine-900 border border-gold/30 text-gold-light">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <span>100% NABL Lab Tested Purity Guarantee</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-pine-900 border border-gold/30 text-gold-light">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span>Direct Cold Press · No Solvents, No Heat</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Sign In Form */}
        <div className="rounded-3xl border border-gold/25 bg-cream-paper p-7 sm:p-10 shadow-[0_25px_70px_-25px_rgba(21,56,38,0.25)] lg:col-span-7">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-deep">Member Access</p>
            <h1 className="mt-2 font-display text-3xl font-medium text-pine-950 sm:text-4xl">
              Welcome <span className="italic text-gold-deep">Back</span>
            </h1>
            <p className="mt-1 text-sm text-ink/70">
              Please enter your credentials to access your account.
            </p>
          </div>

          {/* Continue with Google button */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleGoogleClick}
              className="group flex w-full items-center justify-center gap-3 rounded-full border border-ink/15 bg-white px-5 py-3 text-sm font-medium text-ink shadow-sm transition-all hover:border-gold hover:bg-cream hover:shadow-md"
            >
              {/* Google colorful G logo */}
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {googleNotice && (
              <p className="rounded-xl border border-gold/30 bg-gold/10 px-3.5 py-2 text-xs text-gold-deep">
                {googleNotice}
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="w-full border-t border-ink/10" />
            <span className="absolute bg-cream-paper px-3 text-xs uppercase tracking-wider text-ink/45">
              or sign in with email
            </span>
          </div>

          {/* Server Error Alert */}
          {serverError && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600 mt-0.5" />
              <span className="flex-1">{serverError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} noValidate className="space-y-4">
            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink/75">
                Email Address <span className="text-gold-deep">*</span>
              </label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink/40">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur("email")}
                  placeholder="name@example.com"
                  className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm text-ink placeholder:text-ink/35 outline-none transition-all ${
                    touched.email && errors.email
                      ? "border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-ink/15 bg-white focus:border-gold focus:ring-2 focus:ring-gold/30"
                  }`}
                />
              </div>
              {touched.email && errors.email && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink/75">
                  Password <span className="text-gold-deep">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-gold-deep hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink/40">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur("password")}
                  placeholder="••••••••"
                  className={`w-full rounded-xl border py-3 pl-10 pr-10 text-sm text-ink placeholder:text-ink/35 outline-none transition-all ${
                    touched.password && errors.password
                      ? "border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-ink/15 bg-white focus:border-gold focus:ring-2 focus:ring-gold/30"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-ink/40 hover:text-ink"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-ink/70">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-ink/20 text-pine-900 accent-pine-900 focus:ring-gold"
                />
                <span>Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-pine-900 py-3.5 text-sm font-medium text-cream shadow-md shadow-pine-950/20 transition-all hover:bg-pine-800 hover:scale-[1.01] disabled:opacity-60"
            >
              {loading ? (
                <span>Signing in…</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Signup */}
          <div className="mt-7 text-center text-xs text-ink/70">
            Don&apos;t have an account?{" "}
            <Link
              href={`/signup${redirectUrl !== "/" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
              className="font-semibold text-pine-900 underline hover:text-gold-deep"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-gold/30 bg-cream-paper p-6 sm:p-8 shadow-2xl">
            <h3 className="font-display text-2xl font-normal text-pine-950">Reset Password</h3>
            <p className="mt-2 text-xs leading-relaxed text-ink/70">
              Enter your registered email address and we&apos;ll send you instructions to reset your password.
            </p>

            {forgotSuccess ? (
              <div className="mt-5 space-y-4">
                <div className="flex items-center gap-2 rounded-xl bg-pine-900/10 p-3 text-xs text-pine-900">
                  <CheckCircle2 className="h-4 w-4 text-pine-800 flex-shrink-0" />
                  <span>Password reset instructions have been sent to your email.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSuccess(false);
                    setForgotEmail("");
                    setForgotTouched(false);
                    setForgotFieldError("");
                  }}
                  className="w-full rounded-full bg-pine-900 py-2.5 text-xs font-semibold text-cream"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} noValidate className="mt-5 space-y-4">
                {forgotServerError && (
                  <p className="rounded-xl bg-red-100 p-2.5 text-xs text-red-700">{forgotServerError}</p>
                )}
                <div>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => {
                      setForgotEmail(e.target.value);
                      if (forgotTouched) setForgotFieldError("");
                    }}
                    onBlur={() => setForgotTouched(true)}
                    placeholder="Enter your email"
                    className={`w-full rounded-xl border p-3 text-sm text-ink outline-none transition-all ${
                      forgotTouched && forgotFieldError
                        ? "border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                        : "border-ink/20 bg-white focus:border-gold"
                    }`}
                  />
                  {forgotTouched && forgotFieldError && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{forgotFieldError}</span>
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(false);
                      setForgotFieldError("");
                      setForgotServerError("");
                    }}
                    className="flex-1 rounded-full border border-ink/20 py-2.5 text-xs font-semibold text-ink/70 hover:bg-cream"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 rounded-full bg-pine-900 py-2.5 text-xs font-semibold text-cream hover:bg-pine-800 disabled:opacity-60"
                  >
                    {forgotLoading ? "Sending…" : "Send Link"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
