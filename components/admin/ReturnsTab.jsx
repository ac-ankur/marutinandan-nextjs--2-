"use client";

import { useCallback, useEffect, useState } from "react";
import { admin, formatApiError } from "@/lib/api";
import AuthenticatedReturnPhotos from "@/components/returns/AuthenticatedReturnPhotos";
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, RotateCcw } from "lucide-react";

const CLAIM_STATUSES = ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "PICKUP_SCHEDULED", "PICKUP_FAILED", "RECEIVED", "INSPECTED", "RESOLVED"];

export default function ReturnsTab() {
  const [filter, setFilter] = useState("ALL");
  const [claims, setClaims] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [nextStatus, setNextStatus] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [pickupReference, setPickupReference] = useState("");
  const [resolution, setResolution] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const selectedClaim = claims.find((claim) => claim.id === selectedId) || null;

  const loadClaims = useCallback(async (status = filter) => {
    setLoading(true);
    setError("");
    try {
      const result = await admin.returnCases(status);
      const list = Array.isArray(result) ? result : result?.returnCases || result?.items || result?.claims || [];
      setClaims(list);
      setSelectedId((current) => list.some((claim) => claim.id === current) ? current : list[0]?.id || "");
    } catch (err) {
      setError(formatApiError(err));
      setClaims([]);
      setSelectedId("");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { loadClaims(filter); }, [loadClaims]);

  useEffect(() => {
    setNextStatus(selectedClaim?.status || "");
    setAdminNote("");
    setPickupReference(selectedClaim?.pickupReference || "");
    setResolution(selectedClaim?.resolution || "");
  }, [selectedId, selectedClaim?.status, selectedClaim?.pickupReference, selectedClaim?.resolution]);

  const submitReview = async (event) => {
    event.preventDefault();
    if (!selectedClaim || !nextStatus) return;
    if (["REJECTED", "PICKUP_FAILED"].includes(nextStatus) && !adminNote.trim()) {
      setError("Add a staff note when rejecting a claim or recording a failed pickup.");
      return;
    }
    if (nextStatus === "PICKUP_SCHEDULED" && !pickupReference.trim()) {
      setError("Enter the manually scheduled pickup reference.");
      return;
    }
    if (nextStatus === "RESOLVED" && !resolution) {
      setError("Select the completed resolution before closing this claim.");
      return;
    }

    const payload = { status: nextStatus };
    if (adminNote.trim()) payload.adminNote = adminNote.trim();
    if (nextStatus === "PICKUP_SCHEDULED") payload.pickupReference = pickupReference.trim();
    if (nextStatus === "RESOLVED") payload.resolution = resolution;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await admin.updateReturnCase(selectedClaim.id, payload);
      setSuccess(`Claim status updated to ${nextStatus.replaceAll("_", " ")}.`);
      await loadClaims(filter);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const items = selectedClaim?.items || selectedClaim?.selectedItems || [];
  const photos = selectedClaim?.photos || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h2 className="text-xl font-bold tracking-tight text-slate-900">Returns & Damage Claims</h2><p className="mt-1 text-xs text-slate-500">Review customer evidence and record each manual pickup and inspection step.</p></div>
        <div className="flex gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700">
            <option value="ALL">All statuses</option>{CLAIM_STATUSES.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
          </select>
          <button type="button" onClick={() => loadClaims(filter)} disabled={loading} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh</button>
        </div>
      </div>

      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><AlertCircle className="mr-2 inline h-4 w-4" />{error}</div>}
      {success && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"><CheckCircle2 className="mr-2 inline h-4 w-4" />{success}</div>}

      <div className="grid gap-5 xl:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.6fr)]">
        <section className="space-y-3">
          <div className="flex items-center justify-between"><h3 className="text-sm font-bold text-slate-900">Claims queue</h3><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{claims.length}</span></div>
          {loading && <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading claims…</div>}
          {!loading && claims.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500"><RotateCcw className="mx-auto mb-2 h-6 w-6 text-slate-400" />No claims in this view.</div>}
          {!loading && claims.map((claim) => (
            <button key={claim.id} type="button" onClick={() => { setSelectedId(claim.id); setError(""); setSuccess(""); }} className={`w-full rounded-2xl border p-4 text-left transition ${selectedId === claim.id ? "border-emerald-500 bg-emerald-50/70 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}>
              <div className="flex items-start justify-between gap-2"><p className="font-semibold text-slate-900">{claim.reason === "LEAKING" ? "Leaking goods" : "Damaged goods"}</p><span className="text-[10px] font-bold uppercase text-slate-500">{String(claim.status || "SUBMITTED").replaceAll("_", " ")}</span></div>
              <p className="mt-1 truncate text-xs text-slate-500">Claim #{claim.id}</p>
              <p className="mt-2 text-xs text-slate-600">{claim.createdAt ? new Date(claim.createdAt).toLocaleString("en-IN") : "Recently submitted"}</p>
            </button>
          ))}
        </section>

        <section>
          {!selectedClaim ? (
            <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Choose a claim to review its details.</div>
          ) : (
            <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div><p className="text-xs font-semibold text-slate-500">Claim #{selectedClaim.id}</p><h3 className="mt-1 text-lg font-bold text-slate-900">{selectedClaim.reason === "LEAKING" ? "Leaking goods" : "Damaged goods"}</h3><p className="mt-1 text-xs text-slate-500">Package condition: {String(selectedClaim.packagingCondition || "UNKNOWN").replaceAll("_", " ")}</p></div>
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">{String(selectedClaim.status || "SUBMITTED").replaceAll("_", " ")}</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4"><h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-700">Claimed items</h4>{items.map((item, index) => <p key={item.orderItemId || item.id || index} className="text-sm text-slate-700">{item.productName || item.name || item.orderItem?.productName || "Order item"} · qty {item.quantity}</p>)}<p className="mt-2 text-xs text-slate-500">Customer preference: {selectedClaim.preferredResolution || "Not specified"} (not an approval)</p></div>
                <div className="rounded-xl bg-slate-50 p-4"><h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-700">Workflow notes</h4><p className="text-sm text-slate-700">{selectedClaim.adminNote || "No staff note recorded yet."}</p>{selectedClaim.pickupReference && <p className="mt-2 text-xs text-slate-600">Pickup reference: {selectedClaim.pickupReference}</p>}{selectedClaim.resolution && <p className="mt-1 text-xs text-slate-600">Resolution: {selectedClaim.resolution}</p>}</div>
              </div>
              {selectedClaim.description && <div><h4 className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-700">Customer details</h4><p className="text-sm leading-relaxed text-slate-600">{selectedClaim.description}</p></div>}
              {photos.length > 0 && <div><h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-700">Customer evidence</h4><AuthenticatedReturnPhotos caseId={selectedClaim.id} photos={photos} adminView /></div>}

              <form onSubmit={submitReview} className="space-y-4 border-t border-slate-100 pt-5">
                <h4 className="text-sm font-bold text-slate-900">Record review or workflow update</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-xs font-semibold text-slate-700">New status
                    <select value={nextStatus} onChange={(e) => setNextStatus(e.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal">
                      {CLAIM_STATUSES.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
                    </select>
                  </label>
                  {nextStatus === "PICKUP_SCHEDULED" && <label className="block text-xs font-semibold text-slate-700">Manual pickup reference <span className="text-rose-600">*</span><input value={pickupReference} onChange={(e) => setPickupReference(e.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal" placeholder="Shiprocket reverse pickup reference" /></label>}
                  {nextStatus === "RESOLVED" && <label className="block text-xs font-semibold text-slate-700">Completed resolution <span className="text-rose-600">*</span><select value={resolution} onChange={(e) => setResolution(e.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal"><option value="">Select resolution</option><option value="REFUND">Refund completed</option><option value="REPLACEMENT">Replacement completed</option></select></label>}
                </div>
                <label className="block text-xs font-semibold text-slate-700">Staff note { ["REJECTED", "PICKUP_FAILED"].includes(nextStatus) && <span className="text-rose-600">(required)</span> }
                  <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} rows={3} className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal" placeholder="Decision, pickup details, or customer follow-up…" />
                </label>
                <div className="flex justify-end"><button type="submit" disabled={saving || !nextStatus} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}{saving ? "Saving…" : "Save review"}</button></div>
                <p className="text-[11px] leading-relaxed text-slate-500">Pickup booking, refunds, replacements, and restocking are handled manually. Only mark a claim resolved after the chosen outcome is complete.</p>
              </form>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
