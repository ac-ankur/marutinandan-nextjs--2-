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
  UserRound,
  Phone,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatApiError } from "@/lib/api";

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    password: false,
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [googleNotice, setGoogleNotice] = useState("");

  // Validation function for a specific field or all fields
  function validate(fieldValues = formData, terms = agreeTerms) {
    const errs = {};

    // Name validation
    if ("name" in fieldValues) {
      const name = (fieldValues.name || "").trim();
      if (!name) {
        errs.name = "Full name is required";
      } else if (name.length < 2) {
        errs.name = "Name must be at least 2 characters long";
      } else if (!/^[a-zA-Z\s.'-]+$/.test(name)) {
        errs.name = "Name can only contain letters and spaces";
      }
    }

    // Email validation
    if ("email" in fieldValues) {
      const email = (fieldValues.email || "").trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email) {
        errs.email = "Email address is required";
      } else if (!emailRegex.test(email)) {
        errs.email = "Please enter a valid email address (e.g. name@example.com)";
      }
    }

    // Phone validation
    if ("phone" in fieldValues) {
      const phone = (fieldValues.phone || "").trim();
      if (!phone) {
        errs.phone = "Phone number is required";
      } else if (phone.length !== 10) {
        errs.phone = "Phone number must be exactly 10 digits";
      } else if (!/^[6-9]\d{9}$/.test(phone)) {
        errs.phone = "Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9";
      }
    }

    // Password validation
    if ("password" in fieldValues) {
      const password = fieldValues.password || "";
      if (!password) {
        errs.password = "Password is required";
      } else if (password.length < 6) {
        errs.password = "Password must be at least 6 characters long";
      }
    }

    // Terms validation
    if (!terms) {
      errs.agreeTerms = "You must agree to the Terms of Service to proceed";
    }

    return errs;
  }

  function handleBlur(field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const fieldErrors = validate(formData, agreeTerms);
    setErrors((prev) => ({
      ...prev,
      [field]: fieldErrors[field] || "",
    }));
  }

  function handleChange(e) {
    const { name, value } = e.target;

    let updatedValue = value;

    // Strict phone number filter: only allow digits up to 10 characters
    if (name === "phone") {
      updatedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    const updatedFormData = { ...formData, [name]: updatedValue };
    setFormData(updatedFormData);

    // If the field was already touched, re-validate in real-time
    if (touched[name]) {
      const fieldErrors = validate(updatedFormData, agreeTerms);
      setErrors((prev) => ({
        ...prev,
        [name]: fieldErrors[name] || "",
      }));
    }
  }

  function handleTermsChange(e) {
    const checked = e.target.checked;
    setAgreeTerms(checked);
    setTouched((prev) => ({ ...prev, agreeTerms: true }));
    if (!checked) {
      setErrors((prev) => ({ ...prev, agreeTerms: "You must agree to the Terms of Service to proceed" }));
    } else {
      setErrors((prev) => ({ ...prev, agreeTerms: "" }));
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    setServerError("");

    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      phone: true,
      password: true,
      agreeTerms: true,
    });

    const validationErrors = validate(formData, agreeTerms);
    setErrors(validationErrors);

    // If there are any errors, halt submission
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
      };

      await register(payload);
      router.push(redirectUrl);
    } catch (err) {
      console.error("Signup failed:", err);

      // Map backend fieldErrors to inline field errors
      if (err?.details?.fieldErrors && typeof err.details.fieldErrors === "object") {
        const backendFieldErrors = {};
        const backendTouched = {};
        for (const [field, msgs] of Object.entries(err.details.fieldErrors)) {
          if (Array.isArray(msgs) && msgs.length > 0) {
            backendFieldErrors[field] = msgs[0];
            backendTouched[field] = true;
          }
        }
        if (Object.keys(backendFieldErrors).length > 0) {
          setErrors((prev) => ({ ...prev, ...backendFieldErrors }));
          setTouched((prev) => ({ ...prev, ...backendTouched }));
        }
      }

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

  return (
    <div className="relative mx-auto w-full max-w-5xl">
      <div className="grid items-stretch gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Left Side: Brand Story & Heritage Card */}
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
                Pure Heritage &amp; Quality
              </span>
              <h2 className="mt-4 font-display text-3xl font-normal leading-tight text-cream sm:text-4xl">
                Join our family of <span className="italic text-gold-light">pure wellness.</span>
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-cream/70">
                Create an account to track your orders, get notified about fresh small-batch pressings, and save delivery preferences.
              </p>
            </div>
          </div>

          {/* Member perks */}
          <div className="relative z-10 mt-10 border-t border-cream/10 pt-6">
            <div className="space-y-3.5 text-xs text-cream/80">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-pine-900 border border-gold/30 text-gold-light">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span>Fast &amp; Secure Order Checkout</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-pine-900 border border-gold/30 text-gold-light">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <span>Direct Batch Test Lab Reports Access</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="rounded-3xl border border-gold/25 bg-cream-paper p-7 sm:p-10 shadow-[0_25px_70px_-25px_rgba(21,56,38,0.25)] lg:col-span-7">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-deep">New Customer</p>
            <h1 className="mt-2 font-display text-3xl font-medium text-pine-950 sm:text-4xl">
              Create an <span className="italic text-gold-deep">Account</span>
            </h1>
            <p className="mt-1 text-sm text-ink/70">
              Fill in your details below to register.
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
              or register with email
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
          <form onSubmit={handleSignup} noValidate className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink/75">
                Full Name <span className="text-gold-deep">*</span>
              </label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink/40">
                  <UserRound className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={() => handleBlur("name")}
                  placeholder="e.g. Ramesh Sharma"
                  className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm text-ink placeholder:text-ink/35 outline-none transition-all ${
                    touched.name && errors.name
                      ? "border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-ink/15 bg-white focus:border-gold focus:ring-2 focus:ring-gold/30"
                  }`}
                />
              </div>
              {touched.name && errors.name && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            {/* Email & Phone Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
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

              {/* Phone Number */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink/75">
                    Phone Number <span className="text-gold-deep">*</span>
                  </label>
                  <span className="text-[11px] text-ink/40">10 Digits</span>
                </div>
                <div className="relative mt-1.5 flex rounded-xl border transition-all overflow-hidden focus-within:ring-2 focus-within:ring-gold/30 focus-within:border-gold">
                  {/* +91 badge */}
                  <span className="flex items-center gap-1 bg-cream-deep/40 px-3 py-3 text-xs font-semibold text-pine-900 border-r border-ink/10 select-none">
                    <Phone className="h-3.5 w-3.5 text-pine-800" />
                    <span>+91</span>
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    name="phone"
                    maxLength={10}
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={() => handleBlur("phone")}
                    placeholder="9876543210"
                    className={`w-full bg-white py-3 px-3 text-sm text-ink placeholder:text-ink/35 outline-none ${
                      touched.phone && errors.phone
                        ? "bg-red-50/20 border-red-400"
                        : ""
                    }`}
                  />
                </div>
                {touched.phone && errors.phone && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink/75">
                Password <span className="text-gold-deep">*</span>
              </label>
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
                  placeholder="At least 6 characters"
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
              {touched.password && errors.password ? (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{errors.password}</span>
                </p>
              ) : (
                <p className="mt-1 text-[11px] text-ink/50">
                  Use at least 6 characters.
                </p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs leading-relaxed text-ink/70">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={handleTermsChange}
                  className="mt-0.5 h-4 w-4 rounded border-ink/20 text-pine-900 accent-pine-900 focus:ring-gold"
                />
                <span>
                  I agree to the Terms of Service and understand my data will be processed according to the Privacy Policy.
                </span>
              </label>
              {touched.agreeTerms && errors.agreeTerms && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{errors.agreeTerms}</span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-pine-900 py-3.5 text-sm font-medium text-cream shadow-md shadow-pine-950/20 transition-all hover:bg-pine-800 hover:scale-[1.01] disabled:opacity-60"
            >
              {loading ? (
                <span>Creating account…</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Sign In */}
          <div className="mt-7 text-center text-xs text-ink/70">
            Already have an account?{" "}
            <Link
              href={`/login${redirectUrl !== "/" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
              className="font-semibold text-pine-900 underline hover:text-gold-deep"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
