"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { admin, formatApiError } from "@/lib/api";
import ConfirmModal from "@/components/admin/ConfirmModal";
import {
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
} from "lucide-react";

export default function OffersTab() {
  const [offers, setOffers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    offer: null,
    loading: false,
  });

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [offData, catData, prodData] = await Promise.all([
        admin.offers(),
        admin.categories(),
        admin.products({ pageSize: 100 }),
      ]);
      setOffers(offData || []);
      setCategories(catData || []);
      setProducts(prodData.items || []);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const handleDelete = (offer) => {
    setConfirmState({
      isOpen: true,
      offer,
      loading: false,
    });
  };

  const executeDelete = async () => {
    const { offer } = confirmState;
    if (!offer) return;
    setConfirmState((prev) => ({ ...prev, loading: true }));
    try {
      await admin.deleteOffer(offer.id);
      setSuccess(`Offer "${offer.name}" was removed.`);
      fetchOffers();
      setTimeout(() => setSuccess(""), 4000);
      setConfirmState({ isOpen: false, offer: null, loading: false });
    } catch (err) {
      setError(formatApiError(err));
      setConfirmState({ isOpen: false, offer: null, loading: false });
    }
  };

  const handleToggleActive = async (offer) => {
    try {
      await admin.updateOffer(offer.id, { isActive: !offer.isActive });
      fetchOffers();
    } catch (err) {
      setError(formatApiError(err));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Promotions & Offers</h2>
          <p className="text-xs text-slate-500">
            Launch site-wide, category-wide, or product-specific automatic discount campaigns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Offer Campaign</span>
          </button>

          <button
            type="button"
            onClick={fetchOffers}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Offers Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
          ))}
        </div>
      ) : offers.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500 shadow-sm">
          <Sparkles className="mx-auto h-8 w-8 text-slate-300 mb-2" />
          <p className="font-semibold text-slate-900 text-sm">No promotional offers active</p>
          <p className="mt-1 text-slate-400">Create automated discount campaigns for festivals, seasonal sales, or bundle specials.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((o) => {
            const isPercent = o.type === "PERCENT";
            const valLabel = isPercent ? `${o.value}% OFF` : `₹${(o.value / 100).toFixed(0)} OFF`;

            return (
              <div
                key={o.id}
                className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                      Scope: {o.scope}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(o)}
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                        o.isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}
                    >
                      {o.isActive ? "ACTIVE" : "PAUSED"}
                    </button>
                  </div>

                  <h3 className="mt-3 text-base font-bold text-slate-900">
                    {o.name}
                  </h3>
                  <p className="text-2xl font-bold text-emerald-700 mt-1">
                    {valLabel}
                  </p>

                  <div className="mt-3 space-y-1 text-[11px] text-slate-500 border-t border-slate-100 pt-2.5">
                    {o.startsAt && (
                      <div className="flex justify-between">
                        <span>Starts:</span>
                        <span className="text-slate-800">{new Date(o.startsAt).toLocaleDateString("en-IN")}</span>
                      </div>
                    )}
                    {o.endsAt && (
                      <div className="flex justify-between text-amber-700">
                        <span>Ends:</span>
                        <span>{new Date(o.endsAt).toLocaleDateString("en-IN")}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleDelete(o)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-800 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Offer Modal */}
      {showCreateModal && (
        <CreateOfferModal
          categories={categories}
          products={products}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            setSuccess("Promotional offer published successfully!");
            fetchOffers();
            setTimeout(() => setSuccess(""), 4000);
          }}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title="Delete Promotional Offer"
        message={
          <span>
            Are you sure you want to delete offer{" "}
            <strong className="font-bold text-slate-900">&ldquo;{confirmState.offer?.name}&rdquo;</strong>?
          </span>
        }
        subMessage="The associated promotional discount will no longer be applied during checkout."
        confirmText="Delete Offer"
        variant="danger"
        loading={confirmState.loading}
        onConfirm={executeDelete}
        onClose={() => setConfirmState({ isOpen: false, offer: null, loading: false })}
      />
    </div>
  );
}

function ModalPortal({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted || typeof document === "undefined") return null;
  return createPortal(children, document.body);
}

/* ------------------- MODAL: Create Offer ------------------- */
function CreateOfferModal({ categories, products, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    type: "PERCENT",
    value: 10,
    scope: "ALL",
    categoryId: categories[0]?.id || "",
    productId: products[0]?.id || "",
    startsAt: "",
    endsAt: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        value: form.type === "PERCENT" ? Number(form.value) : Math.round(Number(form.value) * 100),
        scope: form.scope,
        categoryId: form.scope === "CATEGORY" ? form.categoryId : null,
        productId: form.scope === "PRODUCT" ? form.productId : null,
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : undefined,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
        isActive: true,
      };

      await admin.createOffer(payload);
      onSuccess();
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
      <div
        data-lenis-prevent
        className="flex flex-col w-full max-w-md max-h-[90vh] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <h3 className="text-base font-bold text-slate-900">New Promotional Offer</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Campaign Name *</label>
              <input
                type="text"
                value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Festive Super Saver"
              required
              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Discount Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-600"
              >
                <option value="PERCENT">Percentage (%)</option>
                <option value="FLAT">Flat ₹ per unit</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Value *</label>
              <input
                type="number"
                value={form.value}
                onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))}
                required
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 font-bold outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Applicable Scope</label>
            <select
              value={form.scope}
              onChange={(e) => setForm((p) => ({ ...p, scope: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-600"
            >
              <option value="ALL">Entire Store (All Products)</option>
              <option value="CATEGORY">Specific Category Only</option>
              <option value="PRODUCT">Single Product Only</option>
            </select>
          </div>

          {form.scope === "CATEGORY" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Category</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-600"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {form.scope === "PRODUCT" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Product</label>
              <select
                value={form.productId}
                onChange={(e) => setForm((p) => ({ ...p, productId: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-600"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                value={form.startsAt}
                onChange={(e) => setForm((p) => ({ ...p, startsAt: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                value={form.endsAt}
                onChange={(e) => setForm((p) => ({ ...p, endsAt: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          </div>

          <div className="flex items-center justify-end gap-2 px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-50"
            >
              {loading ? "Creating…" : "Publish Offer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  </ModalPortal>
  );
}
