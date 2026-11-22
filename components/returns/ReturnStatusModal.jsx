"use client";

import { createPortal } from "react-dom";
import { useState } from "react";
import { rupees } from "@/lib/api";
import AuthenticatedReturnPhotos from "./AuthenticatedReturnPhotos";
import { Clock3, Loader2, MapPin, RefreshCw, RotateCcw, X } from "lucide-react";

function readable(value) {
  return value ? String(value).replaceAll("_", " ") : "—";
}

function dateTime(value) {
  return value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";
}

const RETURN_STATUS_STYLE = {
  SUBMITTED: "border-sky-200 bg-sky-50 text-sky-800",
  UNDER_REVIEW: "border-amber-200 bg-amber-50 text-amber-800",
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-800",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-800",
  PICKUP_SCHEDULED: "border-indigo-200 bg-indigo-50 text-indigo-800",
  PICKUP_FAILED: "border-rose-200 bg-rose-50 text-rose-800",
  RECEIVED: "border-teal-200 bg-teal-50 text-teal-800",
  INSPECTED: "border-violet-200 bg-violet-50 text-violet-800",
  RESOLVED: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

export default function ReturnStatusModal({ order, returnCase, onClose, onRefresh }) {
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  if (typeof document === "undefined") return null;

  const handleRefresh = async () => {
    setRefreshing(true);
    setError("");
    try {
      await onRefresh();
    } catch (err) {
      setError(err.message || "Unable to refresh return and refund status.");
    } finally {
      setRefreshing(false);
    }
  };

  const refunds = order.refunds || [];
  const claimItems = returnCase?.items || returnCase?.selectedItems || [];

  return createPortal(
    <div className="fixed inset-0 z-[190] flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:p-6">
      <section data-lenis-prevent className="flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-gold/30 bg-cream-paper shadow-2xl">
        <header className="flex flex-shrink-0 items-start justify-between gap-4 border-b border-ink/10 px-5 py-5 sm:px-7">
          <div>
            <div className="flex items-center gap-2 text-pine-800"><RotateCcw className="h-4 w-4" /><p className="text-xs font-bold uppercase tracking-wider">Return & Refund Status</p></div>
            <h2 className="mt-1 font-display text-xl font-bold text-pine-950">Order #{order.orderNumber || order.id}</h2>
            <p className="mt-1 text-xs text-ink/55">Order status: {readable(order.status)} · Return and refund progress are tracked separately.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close return and refund status" className="rounded-full p-2 text-ink/50 transition hover:bg-ink/10"><X className="h-5 w-5" /></button>
        </header>

        <div className="cart-drawer-scroll min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">
          {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}

          <section className="rounded-2xl border border-gold/25 bg-white/70 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="text-[10px] font-bold uppercase tracking-wider text-pine-800">Return case</p><h3 className="mt-1 font-display text-lg font-bold text-pine-950">{returnCase ? (returnCase.reason === "LEAKING" ? "Leaking goods" : "Damaged goods") : "No return case found"}</h3></div>
              {returnCase?.status && <span className={`rounded-full border px-3 py-1.5 text-xs font-bold ${RETURN_STATUS_STYLE[returnCase.status] || "border-slate-200 bg-slate-50 text-slate-700"}`}>{readable(returnCase.status)}</span>}
            </div>

            {returnCase ? (
              <>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Detail label="Reason" value={readable(returnCase.reason)} />
                  <Detail label="Package condition" value={readable(returnCase.packagingCondition)} />
                  <Detail label="Preferred outcome" value={`${readable(returnCase.preferredResolution)} (preference only)`} />
                  <Detail label="Submitted" value={dateTime(returnCase.createdAt)} />
                  <Detail label="Last updated" value={dateTime(returnCase.updatedAt)} />
                  <Detail label="Reviewed" value={dateTime(returnCase.reviewedAt)} />
                  <Detail label="Resolved" value={dateTime(returnCase.resolvedAt)} />
                  <Detail label="Resolution" value={readable(returnCase.resolution)} />
                </div>

                {claimItems.length > 0 && <div className="mt-4 rounded-xl border border-ink/8 bg-cream/50 p-3.5"><p className="mb-2 text-xs font-bold text-pine-950">Affected items</p><div className="space-y-2">{claimItems.map((item, index) => { const product = item.orderItem || item; return <div key={item.id || item.orderItemId || index} className="flex flex-wrap justify-between gap-2 text-xs text-ink/70"><span>{product.productName || product.name || "Order item"}{product.variantLabel ? ` · ${product.variantLabel}` : ""}</span><span>Qty {item.quantity}</span></div>; })}</div></div>}
                {returnCase.description && <div className="mt-4"><p className="text-xs font-bold text-pine-950">Customer details</p><p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink/70">{returnCase.description}</p></div>}
                {returnCase.adminNote && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5"><p className="text-xs font-bold uppercase tracking-wide text-amber-900">Team update</p><p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-amber-950">{returnCase.adminNote}</p></div>}
                {returnCase.pickupReference && <div className="mt-4 flex items-start gap-2 rounded-xl border border-indigo-100 bg-indigo-50/70 p-3 text-sm text-indigo-950"><MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" /><span><strong>Pickup reference:</strong> {returnCase.pickupReference}</span></div>}
                {(returnCase.photos || []).length > 0 && <div className="mt-4"><p className="mb-2 text-xs font-bold text-pine-950">Submitted photos</p><AuthenticatedReturnPhotos caseId={returnCase.id} photos={returnCase.photos} /></div>}
              </>
            ) : <p className="mt-3 text-sm text-ink/60">No return request has been recorded for this order.</p>}
          </section>

          <section className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="text-[10px] font-bold uppercase tracking-wider text-indigo-800">Refund status</p><h3 className="mt-1 font-display text-lg font-bold text-indigo-950">{readable(order.refundStatus) === "—" ? "No refund update yet" : readable(order.refundStatus)}</h3></div>
              {order.totalRefundedPaise != null && <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-indigo-900">Refunded {rupees(order.totalRefundedPaise)}</span>}
            </div>
            {refunds.length > 0 ? <div className="mt-4 divide-y divide-indigo-100 rounded-xl border border-indigo-100 bg-white/80 px-3">{refunds.map((refund) => <div key={refund.id} className="grid gap-1 py-3 text-xs sm:grid-cols-[1fr_auto] sm:items-center"><div><p className="font-semibold text-indigo-950">{readable(refund.status)}</p><p className="mt-0.5 text-ink/55">Created {dateTime(refund.createdAt)}{refund.processedAt ? ` · Processed ${dateTime(refund.processedAt)}` : ""}</p>{refund.providerRefundId && <p className="mt-0.5 break-all text-[10px] text-ink/45">Reference: {refund.providerRefundId}</p>}</div><p className="font-bold text-pine-950">{rupees(refund.amountPaise)}</p></div>)}</div> : <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-indigo-950/70"><Clock3 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />{returnCase?.preferredResolution === "REFUND" ? "Refund is your requested outcome, but it is not approved or initiated yet. Refund records will appear here when processing starts." : "Refund records will appear here if a refund is initiated for this order."}</p>}
            {order.refundStatus === "PENDING" && <p className="mt-3 text-xs leading-relaxed text-indigo-950/70">Once processed, your bank may take 5–7 business days to reflect the refund.</p>}
          </section>
        </div>

        <footer className="flex flex-shrink-0 flex-col-reverse gap-3 border-t border-ink/10 bg-cream-paper px-5 py-4 sm:flex-row sm:justify-between sm:px-7">
          <button type="button" onClick={handleRefresh} disabled={refreshing} className="inline-flex items-center justify-center gap-2 rounded-full border border-gold/30 bg-white px-4 py-2.5 text-xs font-semibold text-pine-900 disabled:opacity-50">{refreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}Refresh status</button>
          <button type="button" onClick={onClose} className="rounded-full bg-pine-900 px-5 py-2.5 text-xs font-semibold text-cream hover:bg-pine-950">Close</button>
        </footer>
      </section>
    </div>,
    document.body
  );
}

function Detail({ label, value }) {
  return <div className="rounded-xl bg-cream/50 px-3 py-2.5"><p className="text-[10px] font-semibold uppercase tracking-wide text-ink/45">{label}</p><p className="mt-1 text-xs font-medium leading-relaxed text-pine-950">{value}</p></div>;
}
