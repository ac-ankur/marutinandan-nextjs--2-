"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { formatApiError } from "@/lib/api";
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Sparkles, Building2 } from "lucide-react";

export default function AdminLoginGate({ onLoggedIn }) {
  const { user, login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const u = await login(email, password);
      if (u.role?.toUpperCase() !== "ADMIN") {
        setError("Access Denied: This account does not possess Administrator permissions.");
        return;
      }
      if (onLoggedIn) onLoggedIn(u);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail("admin@yugikafoods.com");
    setPassword("ChangeMe@123");
    setError("");
  };

  return (
    <div className="relative min-h-screen bg-slate-50 font-sans px-4 py-16 flex items-center justify-center text-slate-800">
      <div className="relative z-10 w-full max-w-md">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 shadow-xl">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-slate-50 p-1 shadow-sm">
              <span className="relative block h-14 w-14 overflow-hidden rounded-full">
                <Image
                  src="/images/yugika-logo.jpg"
                  alt="Yugika Foods Private Limited"
                  fill
                  className="object-cover"
                />
              </span>
            </div>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
              Enterprise Access
            </p>
            <h1 className="mt-1 font-sans text-xl font-bold tracking-tight text-slate-900">
              Yugika Foods Admin Portal
            </h1>
            <p className="mt-1.5 text-xs text-slate-500">
              Sign in with your administrative account to access operations, catalog, inventory, and order fulfillment.
            </p>
          </div>

          {/* Current user notice if authenticated as regular user */}
          {isAuthenticated && user && user.role?.toUpperCase() !== "ADMIN" && (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900">
              <p className="font-semibold">Signed in as: {user.email}</p>
              <p className="mt-0.5 text-[11px] text-amber-700">
                Role: {user.role || "CUSTOMER"}. Administrator permissions required. Sign in with an admin account below:
              </p>
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@yugikafoods.com"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2.5 pl-10 pr-3.5 text-xs text-slate-900 outline-none transition-all focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2.5 pl-10 pr-3.5 text-xs text-slate-900 outline-none transition-all focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-slate-800 disabled:opacity-50"
            >
              <span>{loading ? "Authenticating…" : "Sign In to Admin Portal"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Default Credentials</span>
              </span>
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-[11px] font-bold text-emerald-700 hover:underline"
              >
                Auto-fill
              </button>
            </div>
            <p className="mt-1 text-[11px] text-slate-600 font-mono">
              admin@yugikafoods.com / ChangeMe@123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
