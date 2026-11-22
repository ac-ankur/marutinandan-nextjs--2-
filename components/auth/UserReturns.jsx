"use client";

import { useCallback, useEffect, useState } from "react";
import { returns as returnsApi, formatApiError, rupees } from "@/lib/api";
import AuthenticatedReturnPhotos from "@/components/returns/AuthenticatedReturnPhotos";
import { AlertCircle, RefreshCw, RotateCcw } from "lucide-react";

const statusColors = {
  SUBMITTED: "bg-sky-50 text-sky-800 border-sky-200",
  UNDER_REVIEW: "bg-amber-50 text-amber-800 border-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-800 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-800 border-rose-200",
  PICKUP_SCHEDULED: "bg-indigo-50 text-indigo-800 border-indigo-200",
  PICKUP_FAILED: "bg-rose-50 text-rose-800 border-rose-200",
  RECEIVED: "bg-teal-50 text-teal-800 border-teal-200",
  INSPECTED: "bg-violet-50 text-violet-800 border-violet-200",
  RESOLVED: "bg-emerald-50 text-emerald-800 border-emerald-200",
};

export default function UserReturns() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCases = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await returnsApi.list();
      setCases(Array.isArray(result) ? result : result?.returnCases || result?.items || result?.claims || []);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCases(); }, [loadCases]);

  return (
    <section className="space-y-5 animate-fadeIn">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="font-display text-xl font-bold text-pine-950">My Return Requests</h2><p className="mt-1 text-xs text-ink/60">Review progress, staff updates, and pickup details for your claims.</p></div>
        <button type="button" onClick={loadCases} disabled={loading} className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white px-4 py-2 text-xs font-semibold text-pine-900 disabled:opacity-50"><RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />Refresh</button>
      </div>
      {error && <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><AlertCircle className="mr-2 inline h-4 w-4" />{error}</div>}
      {loading && <div className="rounded-2xl border border-gold/20 bg-white/70 p-8 text-center text-sm text-ink/55">Loading your return requests…</div>}
      {!loading && !error && cases.length === 0 && <div className="rounded-2xl border border-dashed border-gold/40 bg-white/50 p-10 text-center"><RotateCcw className="mx-auto h-7 w-7 text-gold-deep" /><h3 className="mt-3 font-semibold text-pine-950">No return requests yet</h3><p className="mt-1 text-sm text-ink/60">Eligible damaged or leaking goods can be reported from the order details.</p></div>}
      {!loading && cases.map((claim) => {
        const items = claim.items || claim.selectedItems || [];
        const photos = claim.photos || [];
        return (
          <article key={claim.id} className="rounded-3xl border border-gold/25 bg-cream-paper p-5 shadow-xs sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ink/8 pb-4">
              <div><p className="text-xs font-semibold text-ink/55">Claim #{claim.id}</p><h3 className="mt-1 font-display text-lg font-bold text-pine-950">{claim.reason === "LEAKING" ? "Leaking goods" : "Damaged goods"}</h3><p className="mt-1 text-xs text-ink/55">Submitted {claim.createdAt ? new Date(claim.createdAt).toLocaleString("en-IN") : "recently"}</p></div>
              <span className={`rounded-full border px-3 py-1.5 text-xs font-bold ${statusColors[claim.status] || "bg-slate-50 text-slate-700 border-slate-200"}`}>{String(claim.status || "SUBMITTED").replaceAll("_", " ")}</span>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 text-sm text-ink/70">
                <p><span className="font-semibold text-pine-950">Package condition:</span> {String(claim.packagingCondition || "UNKNOWN").replaceAll("_", " ")}</p>
                <p><span className="font-semibold text-pine-950">Preferred outcome:</span> {claim.preferredResolution || "Not specified"} <span className="text-xs text-ink/50">(preference only)</span></p>
                {claim.pickupReference && <p><span className="font-semibold text-pine-950">Pickup reference:</span> {claim.pickupReference}</p>}
                {claim.resolution && <p><span className="font-semibold text-pine-950">Resolution:</span> {claim.resolution}</p>}
                {claim.adminNote && <div className="rounded-xl border border-gold/20 bg-white/70 p-3"><p className="text-xs font-bold uppercase tracking-wide text-pine-800">Team update</p><p className="mt-1 leading-relaxed">{claim.adminNote}</p></div>}
              </div>
              <div className="rounded-xl border border-ink/8 bg-white/60 p-3">
                <p className="mb-2 text-xs font-bold text-pine-950">Claimed items</p>
                {items.length ? items.map((item, index) => <p key={item.orderItemId || item.id || index} className="text-xs text-ink/70">{item.productName || item.name || item.orderItem?.productName || "Order item"} · qty {item.quantity}</p>) : <p className="text-xs text-ink/50">Item details unavailable</p>}
                {claim.totalRefundedPaise != null && <p className="mt-2 text-xs font-semibold text-pine-900">Refund recorded: {rupees(claim.totalRefundedPaise)}</p>}
              </div>
            </div>
            {claim.description && <p className="mt-4 text-sm leading-relaxed text-ink/70">{claim.description}</p>}
            {photos.length > 0 && <div className="mt-4"><p className="mb-2 text-xs font-bold text-pine-950">Submitted photos</p><AuthenticatedReturnPhotos caseId={claim.id} photos={photos} /></div>}
          </article>
        );
      })}
    </section>
  );
}
