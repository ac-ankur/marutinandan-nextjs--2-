"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Login failed");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-pine-950 px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-3xl bg-pine-900/60 p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-gold-light">Admin</p>
        <h1 className="mt-3 font-display text-3xl text-cream">Enquiry Dashboard</h1>
        <p className="mt-2 text-sm text-cream/60">Enter the admin password to continue.</p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="mt-6 w-full rounded-xl border border-cream/15 bg-pine-950/50 px-4 py-3 text-sm text-cream placeholder:text-cream/30 outline-none focus:border-gold"
        />
        {error && <p className="mt-3 text-sm text-red-300">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-gold px-6 py-3 text-sm font-semibold text-pine-950 transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {loading ? "Checking…" : "Sign In"}
        </button>

        <p className="mt-5 text-xs text-cream/40">
          Default password: <code className="text-cream/60">marutinandan2026</code> — set{" "}
          <code className="text-cream/60">ADMIN_PASSWORD</code> in your environment to change it.
        </p>
      </form>
    </div>
  );
}
