"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { returns as returnsApi, formatApiError } from "@/lib/api";
import { AlertTriangle, Loader2, Upload, X } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ReturnClaimModal({ order, onClose, onSubmitted }) {
  const [reason, setReason] = useState("DAMAGED");
  const [packagingCondition, setPackagingCondition] = useState("UNKNOWN");
  const [preferredResolution, setPreferredResolution] = useState("REFUND");
  const [description, setDescription] = useState("");
  const [quantities, setQuantities] = useState({});
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const photoInputRef = useRef(null);
  const items = order.items || [];
  if (typeof document === "undefined") return null;

  const handlePhotos = (event) => {
    const selected = Array.from(event.target.files || []);
    event.target.value = "";
    const invalid = selected.find((file) => !ALLOWED_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE);
    if (invalid) {
      setError("Photos must be JPG, PNG, or WebP files, no larger than 5 MB each.");
      return;
    }
    const existingKeys = new Set(photos.map((file) => `${file.name}-${file.size}-${file.lastModified}`));
    const newPhotos = selected.filter((file) => !existingKeys.has(`${file.name}-${file.size}-${file.lastModified}`));
    if (photos.length + newPhotos.length > 5) {
      setError(`You can attach up to 5 photos total. ${photos.length} already selected.`);
      return;
    }
    setError("");
    setPhotos((current) => [...current, ...newPhotos]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const selectedItems = items
      .map((item) => ({ orderItemId: item.id, quantity: Number(quantities[item.id] || 0) }))
      .filter((item) => item.orderItemId && item.quantity > 0);
    if (!selectedItems.length) return setError("Select at least one affected item and quantity.");
    if (!photos.length) return setError("Add at least one photo showing the affected item or packaging.");

    setLoading(true);
    setError("");
    try {
      const ref = order.orderNumber || order.id;
      const result = await returnsApi.submit(ref, {
        reason,
        packagingCondition,
        preferredResolution,
        description: description.trim(),
        items: selectedItems,
        photos,
      });
      await onSubmitted(result?.returnCase || result?.claim || result);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[180] flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:p-6">
      <div
        data-lenis-prevent
        className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-gold/30 bg-cream-paper shadow-2xl"
      >
        <header className="flex flex-shrink-0 items-start justify-between gap-4 border-b border-ink/8 px-5 py-5 sm:px-8 sm:py-6">
          <div>
            <div className="flex items-center gap-2 text-amber-800"><AlertTriangle className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-wider">Damage or leakage claim</span></div>
            <h2 className="mt-2 font-display text-2xl font-bold text-pine-950">Order #{order.orderNumber || order.id}</h2>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-ink/65">Report damaged or leaking goods within 24 hours of delivery. Your request will be reviewed by our team.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close claim form" className="rounded-full p-2 text-ink/50 hover:bg-ink/10"><X className="h-5 w-5" /></button>
        </header>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="cart-drawer-scroll min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5 sm:px-8 sm:py-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-pine-950">Issue type
              <select value={reason} onChange={(e) => setReason(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-ink/15 bg-white px-3 text-sm font-normal">
                <option value="DAMAGED">Damaged goods</option><option value="LEAKING">Leaking goods</option>
              </select>
            </label>
            <label className="block text-sm font-semibold text-pine-950">Package condition
              <select value={packagingCondition} onChange={(e) => setPackagingCondition(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-ink/15 bg-white px-3 text-sm font-normal">
                <option value="UNKNOWN">Not sure</option><option value="SEALED">Sealed</option><option value="OPENED_DAMAGED">Opened / damaged</option><option value="LEAKING">Leaking</option>
              </select>
            </label>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-pine-950">Affected items and quantities</legend>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={item.id || index} className="flex items-center justify-between gap-3 rounded-xl border border-ink/10 bg-white px-3 py-2.5">
                  <div className="min-w-0"><p className="truncate text-sm font-semibold text-pine-950">{item.productName || item.name || "Order item"}</p><p className="text-xs text-ink/55">{item.variantLabel || item.sku || ""} · ordered {item.quantity}</p></div>
                  <select aria-label={`Affected quantity for ${item.productName || item.name || "item"}`} value={quantities[item.id] || 0} onChange={(e) => setQuantities((current) => ({ ...current, [item.id]: Number(e.target.value) }))} disabled={!item.id} className="h-10 w-20 rounded-lg border border-ink/15 bg-white px-2 text-sm disabled:opacity-50">
                    <option value={0}>0</option>{Array.from({ length: item.quantity || 1 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-pine-950">Preferred resolution</legend>
            <div className="flex flex-wrap gap-3">
              {[ ["REFUND", "Refund"], ["REPLACEMENT", "Replacement"] ].map(([value, label]) => (
                <label key={value} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm ${preferredResolution === value ? "border-pine-800 bg-pine-900/5 font-semibold text-pine-950" : "border-ink/10 bg-white text-ink/70"}`}>
                  <input type="radio" name="preferredResolution" value={value} checked={preferredResolution === value} onChange={() => setPreferredResolution(value)} />{label}
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-ink/55">This is your preference; the final outcome is decided after review.</p>
          </fieldset>

          <label className="block text-sm font-semibold text-pine-950">Details <span className="font-normal text-ink/50">(optional, up to 1000 characters)</span>
            <textarea value={description} maxLength={1000} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-ink/15 bg-white p-3 text-sm font-normal leading-relaxed" placeholder="Tell us what happened…" />
          </label>

          <div className="rounded-2xl border border-dashed border-gold/50 bg-white/60 p-4 text-sm text-pine-950 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="flex items-center gap-2 font-semibold"><Upload className="h-4 w-4 text-gold-deep" />Photos <span className="font-normal text-ink/55">(1–5 required)</span></p><p className="mt-1 text-xs text-ink/55">JPG, PNG or WebP · up to 5 MB each</p></div>
              <button type="button" onClick={() => photoInputRef.current?.click()} disabled={photos.length >= 5} className="rounded-full bg-pine-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-pine-950 disabled:cursor-not-allowed disabled:opacity-50">{photos.length ? `Add more photos (${photos.length}/5)` : "Choose photos"}</button>
            </div>
            <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handlePhotos} className="sr-only" />
            {photos.length > 0 && <ul className="mt-4 space-y-2">{photos.map((photo, index) => <li key={`${photo.name}-${photo.size}-${photo.lastModified}`} title={photo.name} className="flex min-w-0 items-center gap-2 rounded-lg border border-ink/8 bg-white px-3 py-2 text-xs text-ink/70"><span className="h-2 w-2 flex-shrink-0 rounded-full bg-emerald-600" /><span className="min-w-0 flex-1 truncate">{photo.name}</span><span className="flex-shrink-0 text-[10px] text-ink/45">{(photo.size / (1024 * 1024)).toFixed(1)} MB</span><button type="button" onClick={() => setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index))} aria-label={`Remove ${photo.name}`} className="rounded-full p-1 text-ink/45 hover:bg-rose-50 hover:text-rose-700"><X className="h-3.5 w-3.5" /></button></li>)}</ul>}
          </div>

          {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}
          </div>
          <div className="flex flex-shrink-0 flex-col-reverse gap-3 border-t border-ink/10 bg-cream-paper px-5 py-4 sm:flex-row sm:justify-end sm:px-8">
            <button type="button" onClick={onClose} disabled={loading} className="rounded-full border border-ink/15 px-5 py-3 text-sm font-semibold text-ink">Cancel</button>
            <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-full bg-pine-900 px-6 py-3 text-sm font-semibold text-white disabled:opacity-50">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}{loading ? "Submitting…" : "Submit claim"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
