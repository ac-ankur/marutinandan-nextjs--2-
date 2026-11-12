"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, Truck } from "lucide-react";
import { shippingSettings, formatApiError } from "@/lib/api";

export default function ShippingSettingsTab() {
  const [codEnabled, setCodEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await shippingSettings.get();
      setCodEnabled(Boolean(data?.codEnabled));
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const save = async (nextValue) => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const data = await shippingSettings.update(nextValue);
      setCodEnabled(Boolean(data?.codEnabled ?? nextValue));
      setSuccess(`Cash on delivery ${nextValue ? "enabled" : "disabled"}.`);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Shipping & Payment Settings</h2>
          <p className="mt-1 text-xs text-slate-500">Control whether customers can select cash on delivery at checkout.</p>
        </div>
        <button type="button" onClick={loadSettings} disabled={loading || saving} aria-label="Refresh settings" className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {error && <div role="alert" className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
      {success && <div role="status" className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800"><CheckCircle2 className="h-4 w-4 shrink-0" />{success}</div>}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Truck className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Cash on delivery</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">When enabled, COD appears only when the checkout API reports it as available. Address serviceability is checked with a shipping quote.</p>
              </div>
              <button type="button" disabled={loading || saving} onClick={() => save(!codEnabled)} aria-pressed={codEnabled} className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:cursor-wait disabled:opacity-50 ${codEnabled ? "bg-emerald-600" : "bg-slate-300"}`}>
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${codEnabled ? "translate-x-6" : "translate-x-1"}`} />
                <span className="sr-only">{codEnabled ? "Disable" : "Enable"} cash on delivery</span>
              </button>
            </div>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status: {loading ? <Loader2 className="inline h-3 w-3 animate-spin" /> : codEnabled ? <span className="text-emerald-700">Enabled</span> : <span>Disabled</span>}</p>
            {saving && <p className="mt-1 text-[11px] text-slate-400">Saving setting…</p>}
          </div>
        </div>
      </section>
      <p className="text-[11px] leading-5 text-slate-500">Checkout uses the customer payment-options endpoint as its source of truth. Changes take effect as soon as the API returns the updated setting.</p>
    </div>
  );
}
