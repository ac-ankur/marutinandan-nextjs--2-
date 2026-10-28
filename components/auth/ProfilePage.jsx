"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import {
  UserRound,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Calendar,
  BadgeCheck,
  AlertTriangle,
  Sparkles,
  KeyRound,
  ChevronRight,
  MapPin,
  LayoutDashboard,
  ExternalLink,
  ShoppingBag,
  FileText,
  Sliders,
  Award,
  Package,
  Copy,
  Check,
  Star,
  Heart,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { auth, formatApiError } from "@/lib/api";
import AddressManager from "./AddressManager";
import UserOrders from "./UserOrders";
import UserReviews from "./UserReviews";
import UserWishlist from "./UserWishlist";

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { count: wishlistCount } = useWishlist();

  // Active tab: "orders" | "wishlist" | "addresses" | "reviews" | "profile" | "admin"
  const tabParam = searchParams?.get("tab");
  const [activeTab, setActiveTab] = useState(
    tabParam && ["orders", "wishlist", "addresses", "reviews", "profile", "admin"].includes(tabParam)
      ? tabParam
      : "orders"
  );

  useEffect(() => {
    if (tabParam && ["orders", "wishlist", "addresses", "reviews", "profile", "admin"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Change password state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");

  // Logout state
  const [logoutLoading, setLogoutLoading] = useState(false);

  // Email copy state
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    if (!user?.email) return;
    try {
      navigator.clipboard?.writeText(user.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2200);
    } catch (_) {}
  };

  // Resend verification state
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState("");

  if (!user) return null;

  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Recently";

  const roleBadge = {
    ADMIN: {
      label: "Administrator",
      color: "bg-red-500/15 text-red-300 border-red-500/30",
      icon: <Shield className="h-3.5 w-3.5 text-red-400" />,
    },
    CUSTOMER: {
      label: "Valued Customer",
      color: "bg-gold/20 text-gold-light border-gold/40",
      icon: <Award className="h-3.5 w-3.5 text-gold-light" />,
    },
  };

  const badge = roleBadge[user.role?.toUpperCase()] || roleBadge.CUSTOMER;

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (passwordForm.newPassword.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPwError("New password and confirm password do not match.");
      return;
    }

    setPwLoading(true);
    try {
      await auth.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPwSuccess("Password changed successfully! Your session tokens have been refreshed.");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowCurrentPw(false);
      setShowNewPw(false);
      await refreshUser();
    } catch (err) {
      setPwError(formatApiError(err));
    } finally {
      setPwLoading(false);
    }
  }

  async function handleLogout() {
    setLogoutLoading(true);
    try {
      await logout();
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLogoutLoading(false);
    }
  }

  async function handleResendVerification() {
    setVerifyLoading(true);
    setVerifyMsg("");
    try {
      await auth.resendVerification();
      setVerifyMsg("Verification email sent! Check your inbox.");
    } catch (err) {
      setVerifyMsg(formatApiError(err));
    } finally {
      setVerifyLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* Profile Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-pine-950 p-6 sm:p-8 text-cream shadow-xl">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-pine-800/40 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {user.avatarUrl ? (
              <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-gold/60 shadow-lg sm:h-24 sm:w-24">
                <SafeImage src={user.avatarUrl} alt={user.name} fill className="object-cover" sizes="96px" />
              </div>
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold/60 bg-pine-900 text-3xl font-display font-bold text-gold-light shadow-lg sm:h-24 sm:w-24 sm:text-4xl">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </div>

          {/* Name & Meta */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-cream sm:text-3xl">{user.name}</h1>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${badge.color}`}
              >
                {badge.icon}
                {badge.label}
              </span>
            </div>

            <div className="mt-2 flex flex-col gap-1 text-xs text-cream/70 sm:flex-row sm:items-center sm:gap-4">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-gold-light" />
                {user.email}
              </span>
              {user.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-gold-light" />
                  +91 {user.phone}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-gold-light" />
                Joined {joinDate}
              </span>
            </div>

            {/* Status Badges Row */}
            <div className="mt-3 flex flex-wrap gap-2">
              {user.emailVerified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-900/40 px-2.5 py-1 text-[10px] font-semibold text-green-300 border border-green-700/40">
                  <BadgeCheck className="h-3 w-3" /> Email Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-900/40 px-2.5 py-1 text-[10px] font-semibold text-amber-300 border border-amber-700/40">
                  <AlertTriangle className="h-3 w-3" /> Email Not Verified
                </span>
              )}
              {user.googleLinked && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-900/40 px-2.5 py-1 text-[10px] font-semibold text-blue-300 border border-blue-700/40">
                  <svg className="h-3 w-3" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  </svg>
                  Google Linked
                </span>
              )}
              {user.hasPassword && (
                <span className="inline-flex items-center gap-1 rounded-full bg-cream/10 px-2.5 py-1 text-[10px] font-semibold text-cream/70 border border-cream/10">
                  <Lock className="h-3 w-3" /> Password Set
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Email Verification Warning */}
      {!user.emailVerified && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5 shadow-sm">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">Your email is not verified</p>
            <p className="mt-0.5 text-xs text-amber-800/80">
              Please verify your email address to unlock full account access including order checkout and invoice downloads.
            </p>
            {verifyMsg && (
              <p className="mt-2 text-xs font-medium text-amber-900">{verifyMsg}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={verifyLoading}
            className="flex-shrink-0 rounded-full bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-60 transition-colors shadow-sm"
          >
            {verifyLoading ? "Sending…" : "Resend Email"}
          </button>
        </div>
      )}

      {/* Navigation Tabs (Orders, Delivery Addresses, Profile, and Admin if role is ADMIN) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="inline-flex items-center gap-1.5 rounded-2xl border border-gold/25 bg-white/80 p-1.5 shadow-xs backdrop-blur-xs">
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "orders"
                ? "bg-pine-900 text-cream shadow-sm"
                : "text-ink/70 hover:bg-gold/15 hover:text-pine-950"
            }`}
          >
            <Package className="h-3.5 w-3.5" />
            <span>My Orders</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("wishlist")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "wishlist"
                ? "bg-pine-900 text-cream shadow-sm"
                : "text-ink/70 hover:bg-gold/15 hover:text-pine-950"
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${activeTab === "wishlist" ? "fill-rose-400 text-rose-400" : "text-rose-500 fill-rose-500"}`} />
            <span>My Wishlist</span>
            {wishlistCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-xs">
                {wishlistCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("addresses")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "addresses"
                ? "bg-pine-900 text-cream shadow-sm"
                : "text-ink/70 hover:bg-gold/15 hover:text-pine-950"
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>Delivery Addresses</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "reviews"
                ? "bg-pine-900 text-cream shadow-sm"
                : "text-ink/70 hover:bg-gold/15 hover:text-pine-950"
            }`}
          >
            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <span>My Reviews</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "profile"
                ? "bg-pine-900 text-cream shadow-sm"
                : "text-ink/70 hover:bg-gold/15 hover:text-pine-950"
            }`}
          >
            <UserRound className="h-3.5 w-3.5" />
            <span>Profile & Security</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab("admin")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === "admin"
                  ? "bg-red-800 text-white shadow-sm"
                  : "text-red-900 hover:bg-red-50"
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Admin Controls</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 0: My Orders */}
      {activeTab === "orders" && <UserOrders />}

      {/* TAB: My Wishlist */}
      {activeTab === "wishlist" && <UserWishlist />}

      {/* TAB: My Reviews */}
      {activeTab === "reviews" && <UserReviews />}

      {/* TAB 1: Profile & Security */}
      {activeTab === "profile" && (
        <div className="grid gap-6 lg:grid-cols-12 animate-fadeIn">
          {/* Left Column: Account Details (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-b from-white via-cream-paper/85 to-cream-paper p-6 sm:p-8 shadow-sm">
              {/* Subtle gold decorative glow */}
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold/15 blur-3xl" />

              {/* Card Header */}
              <div className="relative z-10 flex items-center justify-between border-b border-ink/8 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pine-900 text-gold-light shadow-sm">
                    <UserRound className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-pine-950">
                      Account Details
                    </h2>
                    <p className="text-xs text-ink/60">
                      Personal identity, contact information, and role
                    </p>
                  </div>
                </div>

                <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-300/80 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-800">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{user.emailVerified ? "Verified Account" : "Pending Verification"}</span>
                </div>
              </div>

              {/* Grid of Profile Details Tiles */}
              <div className="relative z-10 mt-6 grid gap-3.5 sm:grid-cols-2">
                {/* 1. Full Name */}
                <div className="group rounded-2xl border border-ink/8 bg-white/90 p-4 shadow-xs transition-all hover:border-gold/50 hover:shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink/45">
                      Full Name
                    </span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gold/15 text-gold-deep">
                      <UserRound className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <p className="font-semibold text-pine-950 text-sm truncate">
                    {user.name || "Valued Patron"}
                  </p>
                  <span className="mt-1 inline-block text-[10px] text-ink/50">
                    Primary Account Holder
                  </span>
                </div>

                {/* 2. Email Address */}
                <div className="group rounded-2xl border border-ink/8 bg-white/90 p-4 shadow-xs transition-all hover:border-gold/50 hover:shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink/45">
                      Email Address
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      title="Copy email to clipboard"
                      className="flex h-7 w-7 items-center justify-center rounded-xl bg-pine-900/5 text-pine-800 hover:bg-gold/20 hover:text-gold-deep transition-colors"
                    >
                      {copiedEmail ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  <p className="font-semibold text-pine-950 text-sm truncate" title={user.email}>
                    {user.email}
                  </p>
                  <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700">
                    <BadgeCheck className="h-3 w-3" />
                    {user.emailVerified ? "Verified Email" : "Awaiting Verification"}
                  </span>
                </div>

                {/* 3. Phone Number */}
                <div className="group rounded-2xl border border-ink/8 bg-white/90 p-4 shadow-xs transition-all hover:border-gold/50 hover:shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink/45">
                      Phone Number
                    </span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gold/15 text-gold-deep">
                      <Phone className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <p className="font-semibold text-pine-950 text-sm">
                    {user.phone ? `+91 ${user.phone}` : "Not provided"}
                  </p>
                  <span className="mt-1 inline-block text-[10px] text-ink/50">
                    Used for order delivery SMS
                  </span>
                </div>

                {/* 4. Member Since */}
                <div className="group rounded-2xl border border-ink/8 bg-white/90 p-4 shadow-xs transition-all hover:border-gold/50 hover:shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink/45">
                      Member Since
                    </span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gold/15 text-gold-deep">
                      <Calendar className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <p className="font-semibold text-pine-950 text-sm">
                    {joinDate}
                  </p>
                  <span className="mt-1 inline-block text-[10px] text-ink/50">
                    Rajasthan Cold-Press Family
                  </span>
                </div>
              </div>

              {/* Bottom Quick Perks Strip */}
              <div className="relative z-10 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/25 bg-gold/10 p-3.5 text-xs text-pine-950">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-gold-deep flex-shrink-0" />
                  <span className="font-medium">
                    Enjoy complimentary small-batch dispatch and priority support on all orders.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Security, Shortcuts & Sign Out (5 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Password & Security Card */}
            <div className="rounded-3xl border border-gold/30 bg-gradient-to-b from-white via-cream-paper/85 to-cream-paper p-6 sm:p-7 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gold/20 text-gold-deep">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-pine-950">
                      Security & Password
                    </h3>
                    <p className="text-xs text-ink/60">
                      Manage authentication credentials
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword((prev) => !prev);
                    setPwError("");
                    setPwSuccess("");
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                    showChangePassword
                      ? "bg-pine-900 text-cream"
                      : "bg-cream border border-gold/30 text-pine-900 hover:bg-gold/15"
                  }`}
                >
                  <span>{showChangePassword ? "Cancel" : "Change"}</span>
                  <ChevronRight
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      showChangePassword ? "rotate-90" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Collapsed State: Helpful summary */}
              {!showChangePassword && (
                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between rounded-2xl border border-ink/8 bg-white/80 p-3.5 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <Lock className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="font-semibold text-pine-950">Password Configured</p>
                        <p className="text-[10px] text-ink/50">Protected with high-entropy hashing</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </div>

                  <p className="text-[11px] text-ink/50 px-1">
                    Click “Change” above to update your account password at any time.
                  </p>
                </div>
              )}

              {/* Expanded State: Clean, polished password form */}
              {showChangePassword && (
                <form onSubmit={handleChangePassword} className="mt-5 space-y-3.5">
                  {pwSuccess && (
                    <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                      <span>{pwSuccess}</span>
                    </div>
                  )}
                  {pwError && (
                    <div className="flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
                      <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600" />
                      <span>{pwError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-ink/70 mb-1">
                      Current Password <span className="text-gold-deep">*</span>
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink/40">
                        <Lock className="h-4 w-4" />
                      </span>
                      <input
                        type={showCurrentPw ? "text" : "password"}
                        required
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                        }
                        placeholder="Current password"
                        className="w-full rounded-2xl border border-ink/15 bg-white py-2.5 pl-10 pr-10 text-xs text-ink placeholder:text-ink/35 outline-none transition-all focus:border-gold-deep focus:ring-2 focus:ring-gold/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPw((p) => !p)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-ink/40 hover:text-ink"
                      >
                        {showCurrentPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-ink/70 mb-1">
                      New Password <span className="text-gold-deep">*</span>
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink/40">
                        <Lock className="h-4 w-4" />
                      </span>
                      <input
                        type={showNewPw ? "text" : "password"}
                        required
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                        }
                        placeholder="At least 6 characters"
                        className="w-full rounded-2xl border border-ink/15 bg-white py-2.5 pl-10 pr-10 text-xs text-ink placeholder:text-ink/35 outline-none transition-all focus:border-gold-deep focus:ring-2 focus:ring-gold/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw((p) => !p)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-ink/40 hover:text-ink"
                      >
                        {showNewPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-ink/70 mb-1">
                      Confirm New Password <span className="text-gold-deep">*</span>
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink/40">
                        <ShieldCheck className="h-4 w-4" />
                      </span>
                      <input
                        type="password"
                        required
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                        }
                        placeholder="Re-type new password"
                        className="w-full rounded-2xl border border-ink/15 bg-white py-2.5 pl-10 pr-4 text-xs text-ink placeholder:text-ink/35 outline-none transition-all focus:border-gold-deep focus:ring-2 focus:ring-gold/20"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={pwLoading}
                    className="mt-2 w-full rounded-2xl bg-pine-900 py-3 text-xs font-semibold text-cream shadow-md transition-all hover:bg-pine-950 hover:shadow-lg disabled:opacity-60"
                  >
                    {pwLoading ? "Updating Credentials…" : "Save New Password"}
                  </button>
                </form>
              )}
            </div>

            {/* Account Shortcuts */}
            <div className="rounded-3xl border border-gold/25 bg-gradient-to-b from-white via-cream-paper/75 to-cream-paper p-5 sm:p-6 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-3 px-1">
                Account Quick Navigation
              </p>
              <div className="grid gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveTab("orders")}
                  className="flex items-center justify-between rounded-2xl border border-ink/8 bg-white/80 p-3 text-left transition-all hover:border-gold/50 hover:bg-gold/5 hover:translate-x-0.5"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/15 text-gold-deep">
                      <Package className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-pine-950">My Orders & Invoices</p>
                      <p className="text-[10px] text-ink/50">Track delivery status & GST invoices</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-ink/40" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("addresses")}
                  className="flex items-center justify-between rounded-2xl border border-ink/8 bg-white/80 p-3 text-left transition-all hover:border-gold/50 hover:bg-gold/5 hover:translate-x-0.5"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-pine-900/10 text-pine-900">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-pine-950">Delivery Addresses</p>
                      <p className="text-[10px] text-ink/50">Manage default delivery destination</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-ink/40" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("reviews")}
                  className="flex items-center justify-between rounded-2xl border border-ink/8 bg-white/80 p-3 text-left transition-all hover:border-gold/50 hover:bg-gold/5 hover:translate-x-0.5"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-pine-950">My Reviews & Ratings</p>
                      <p className="text-[10px] text-ink/50">View & edit feedback for delivered oils</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-ink/40" />
                </button>
              </div>
            </div>

            {/* Sign Out Card */}
            <div className="rounded-3xl border border-rose-200/60 bg-gradient-to-b from-white to-rose-50/30 p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-700 flex-shrink-0">
                    <LogOut className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold text-pine-950">
                      Sign Out
                    </h4>
                    <p className="text-[10px] text-ink/60">
                      End current session on this device
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={logoutLoading}
                  className="flex items-center gap-1.5 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 shadow-xs transition-all hover:bg-rose-100 hover:border-rose-400 active:scale-95 disabled:opacity-60 flex-shrink-0"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>{logoutLoading ? "Signing out…" : "Sign Out"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Delivery Addresses (CRUD) */}
      {activeTab === "addresses" && (
        <div className="rounded-3xl border border-gold/25 bg-cream-paper p-6 sm:p-8 shadow-sm">
          <AddressManager />
        </div>
      )}

      {/* TAB 3: Admin Management (Role-based access) */}
      {activeTab === "admin" && isAdmin && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-red-200 bg-red-50/60 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-800 text-white shadow-md">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-red-950">
                    Administrator Controls
                  </h2>
                  <p className="text-xs text-red-800/80">
                    Your account has elevated administrative permissions across the system.
                  </p>
                </div>
              </div>

              <Link
                href="/admin"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-red-800 px-5 py-2.5 text-xs font-semibold text-white shadow-md transition-all hover:bg-red-900"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Open Admin Dashboard</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-red-200/80 bg-white p-4">
                <div className="flex items-center gap-2 text-red-900 font-semibold text-xs">
                  <Sliders className="h-4 w-4 text-red-700" />
                  <span>Products & Categories</span>
                </div>
                <p className="mt-1 text-xs text-ink/70">
                  Manage oil SKUs, variants, prices, GST rates, and product categories.
                </p>
                <Link
                  href="/admin?tab=products"
                  className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-red-800 hover:underline"
                >
                  Manage catalog →
                </Link>
              </div>

              <div className="rounded-2xl border border-red-200/80 bg-white p-4">
                <div className="flex items-center gap-2 text-red-900 font-semibold text-xs">
                  <Package className="h-4 w-4 text-red-700" />
                  <span>Inventory & Stock</span>
                </div>
                <p className="mt-1 text-xs text-ink/70">
                  Live variant stock levels, low-stock thresholds, and stock adjustment logs.
                </p>
                <Link
                  href="/admin?tab=inventory"
                  className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-red-800 hover:underline"
                >
                  Manage inventory →
                </Link>
              </div>

              <div className="rounded-2xl border border-red-200/80 bg-white p-4">
                <div className="flex items-center gap-2 text-red-900 font-semibold text-xs">
                  <ShoppingBag className="h-4 w-4 text-red-700" />
                  <span>Orders & Fulfillment</span>
                </div>
                <p className="mt-1 text-xs text-ink/70">
                  Update shipment statuses (Paid, Packed, Shipped), invoices, and CSV export.
                </p>
                <Link
                  href="/admin?tab=orders"
                  className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-red-800 hover:underline"
                >
                  Manage orders →
                </Link>
              </div>

              <div className="rounded-2xl border border-red-200/80 bg-white p-4">
                <div className="flex items-center gap-2 text-red-900 font-semibold text-xs">
                  <UserRound className="h-4 w-4 text-red-700" />
                  <span>Users & Customers</span>
                </div>
                <p className="mt-1 text-xs text-ink/70">
                  Customer directory, lifetime spend, order history, and account moderation.
                </p>
                <Link
                  href="/admin?tab=users"
                  className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-red-800 hover:underline"
                >
                  View customers →
                </Link>
              </div>

              <div className="rounded-2xl border border-red-200/80 bg-white p-4">
                <div className="flex items-center gap-2 text-red-900 font-semibold text-xs">
                  <Sparkles className="h-4 w-4 text-red-700" />
                  <span>Coupons & Offers</span>
                </div>
                <p className="mt-1 text-xs text-ink/70">
                  Create discount voucher codes, minimum cart values, and promotional banners.
                </p>
                <Link
                  href="/admin?tab=coupons"
                  className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-red-800 hover:underline"
                >
                  Manage discounts →
                </Link>
              </div>

              <div className="rounded-2xl border border-red-200/80 bg-white p-4">
                <div className="flex items-center gap-2 text-red-900 font-semibold text-xs">
                  <FileText className="h-4 w-4 text-red-700" />
                  <span>Customer Inquiries</span>
                </div>
                <p className="mt-1 text-xs text-ink/70">
                  Review and follow up on trade, bulk, and customer order inquiries.
                </p>
                <Link
                  href="/admin?tab=enquiries"
                  className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-red-800 hover:underline"
                >
                  View inquiries →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
