"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { admin, rupees, formatApiError } from "@/lib/api";
import ConfirmModal from "@/components/admin/ConfirmModal";
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Edit2,
  Eye,
  Calendar,
  Users,
  X,
  Clock,
  Sparkles,
} from "lucide-react";

export default function CouponsTab() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);
  const [detailsCoupon, setDetailsCoupon] = useState(null);
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    coupon: null,
    loading: false,
  });

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await admin.coupons();
      setCoupons(Array.isArray(data) ? data : data?.items || data?.coupons || []);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleDelete = (coupon) => {
    setConfirmState({
      isOpen: true,
      coupon,
      loading: false,
    });
  };

  const executeDelete = async () => {
    const { coupon } = confirmState;
    if (!coupon) return;
    setConfirmState((prev) => ({ ...prev, loading: true }));
    try {
      await admin.deleteCoupon(coupon.id);
      setSuccess(`Coupon ${coupon.code} was deleted.`);
      fetchCoupons();
      setTimeout(() => setSuccess(""), 4000);
      setConfirmState({ isOpen: false, coupon: null, loading: false });
    } catch (err) {
      setError(formatApiError(err));
      setConfirmState({ isOpen: false, coupon: null, loading: false });
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      // Matches PATCH /admin/coupons/:id
      await admin.updateCoupon(coupon.id, { isActive: !coupon.isActive });
      setSuccess(`Coupon ${coupon.code} status updated.`);
      fetchCoupons();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(formatApiError(err));
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Coupons & Discounts</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage percentage and flat discounts, usage limits, active status, and track redemption logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-all shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Coupon</span>
          </button>

          <button
            type="button"
            onClick={fetchCoupons}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-xs"
            title="Refresh coupons"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Coupons Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500 shadow-xs">
          <Tag className="mx-auto h-8 w-8 text-slate-300 mb-2" />
          <p className="font-semibold text-slate-900 text-sm">No coupons found in catalog</p>
          <p className="mt-1 text-slate-400">Click &quot;Create Coupon&quot; to configure your first discount code.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coupons.map((c) => {
            const isPercent = c.type === "PERCENT";
            const discountLabel = isPercent
              ? `${c.value}% OFF`
              : `${rupees(c.value)} OFF`;

            return (
              <div
                key={c.id}
                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold tracking-wider text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                      {c.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(c)}
                      className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold transition-all ${
                        c.isActive
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                      }`}
                      title="Click to toggle active status"
                    >
                      {c.isActive ? "ACTIVE" : "INACTIVE"}
                    </button>
                  </div>

                  <p className="mt-3.5 text-2xl font-bold tracking-tight text-slate-900">
                    {discountLabel}
                  </p>
                  <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                    {c.description || "Promotional coupon code"}
                  </p>

                  <div className="mt-4 space-y-1.5 text-[11px] text-slate-500 border-t border-slate-100 pt-3">
                    <div className="flex justify-between">
                      <span>Min Order:</span>
                      <span className="font-semibold text-slate-800">
                        {c.minOrderPaise ? rupees(c.minOrderPaise) : "No minimum"}
                      </span>
                    </div>
                    {c.maxDiscountPaise && (
                      <div className="flex justify-between">
                        <span>Max Discount Cap:</span>
                        <span className="font-semibold text-slate-800">{rupees(c.maxDiscountPaise)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Total Redemptions:</span>
                      <span className="font-semibold text-slate-800">
                        {c.usedCount ?? 0} / {c.usageLimit ?? "∞"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Per User Limit:</span>
                      <span className="font-semibold text-slate-800">
                        {c.perUserLimit ? `${c.perUserLimit} use(s)` : "1 use"}
                      </span>
                    </div>
                    {c.expiresAt && (
                      <div className="flex justify-between text-amber-700">
                        <span>Valid Until:</span>
                        <span>{new Date(c.expiresAt).toLocaleDateString("en-IN")}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setDetailsCoupon(c)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                    title="View Coupon Usages"
                  >
                    <Eye className="h-3.5 w-3.5 text-slate-400" />
                    <span>Usages</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditCoupon(c)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                      title="Update Coupon (PATCH /admin/coupons/:id)"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c)}
                      className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Coupon"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Create Coupon (POST /admin/coupons) */}
      {showCreateModal && (
        <CreateCouponModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            setSuccess("Coupon code published successfully!");
            fetchCoupons();
            setTimeout(() => setSuccess(""), 4000);
          }}
        />
      )}

      {/* MODAL 2: Edit Coupon (PATCH /admin/coupons/:id) */}
      {editCoupon && (
        <EditCouponModal
          coupon={editCoupon}
          onClose={() => setEditCoupon(null)}
          onSuccess={() => {
            setEditCoupon(null);
            setSuccess("Coupon updated successfully!");
            fetchCoupons();
            setTimeout(() => setSuccess(""), 4000);
          }}
        />
      )}

      {/* MODAL 3: Coupon Details & Usages (GET /admin/coupons/:id) */}
      {detailsCoupon && (
        <CouponDetailsModal
          coupon={detailsCoupon}
          onClose={() => setDetailsCoupon(null)}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title="Delete Coupon"
        message={
          <span>
            Are you sure you want to delete coupon{" "}
            <strong className="font-bold text-slate-900">&ldquo;{confirmState.coupon?.code}&rdquo;</strong>?
          </span>
        }
        subMessage="Customers will no longer be able to redeem this coupon code at checkout."
        confirmText="Delete Coupon"
        variant="danger"
        loading={confirmState.loading}
        onConfirm={executeDelete}
        onClose={() => setConfirmState({ isOpen: false, coupon: null, loading: false })}
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

/* ------------------- MODAL: Create Coupon (POST /admin/coupons) ------------------- */
function CreateCouponModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    code: "DIWALI10",
    description: "10% off Diwali",
    type: "PERCENT", // "PERCENT" or "FLAT"
    value: 10,
    minOrderRs: 500, // in Rs -> converted to paise (50000)
    maxDiscountRs: 200, // in Rs -> converted to paise (20000)
    startsAt: "",
    expiresAt: "",
    usageLimit: 100,
    perUserLimit: 1,
    isActive: true,
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
      // Matches Postman Screenshots 2 & 3:
      // For PERCENT: value is percentage number (e.g. 10)
      // For FLAT: value is in paise (e.g. 5000 paise = Rs 50)
      const numValue = Number(form.value);
      const computedValue =
        form.type === "PERCENT"
          ? numValue
          : Math.round(numValue * 100);

      const payload = {
        code: form.code.trim().toUpperCase(),
        description: form.description.trim() || undefined,
        type: form.type,
        value: computedValue,
        minOrderPaise: form.minOrderRs ? Math.round(Number(form.minOrderRs) * 100) : 0,
        maxDiscountPaise:
          form.type === "PERCENT" && form.maxDiscountRs
            ? Math.round(Number(form.maxDiscountRs) * 100)
            : undefined,
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : undefined,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        perUserLimit: form.perUserLimit ? Number(form.perUserLimit) : 1,
        isActive: Boolean(form.isActive),
      };

      await admin.createCoupon(payload);
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
          <div>
            <h3 className="text-base font-bold text-slate-900">Create New Coupon</h3>
            <p className="text-[11px] text-slate-400">Configure discount type, caps, validity, and limits</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3.5">
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800">
                {error}
              </div>
            )}

            {/* Coupon Code */}
            <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Coupon Code *</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
              placeholder="e.g. DIWALI10 or FLAT50"
              required
              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 uppercase font-mono font-bold outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="e.g. 10% off Diwali or Rs 50 off"
              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-600"
            />
          </div>

          {/* Discount Type & Value */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Discount Type</label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    type: e.target.value,
                    value: e.target.value === "PERCENT" ? 10 : 50,
                  }))
                }
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-600"
              >
                <option value="PERCENT">PERCENT (%)</option>
                <option value="FLAT">FLAT (₹ Amount)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {form.type === "PERCENT" ? "Percent Value (%) *" : "Flat Discount (₹) *"}
              </label>
              <input
                type="number"
                value={form.value}
                onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))}
                required
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 font-bold outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Minimum Spend & Max Cap */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Min Order Spend (₹)</label>
              <input
                type="number"
                value={form.minOrderRs}
                onChange={(e) => setForm((p) => ({ ...p, minOrderRs: e.target.value }))}
                placeholder="500"
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-600"
              />
            </div>

            {form.type === "PERCENT" ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Max Cap (₹)</label>
                <input
                  type="number"
                  value={form.maxDiscountRs}
                  onChange={(e) => setForm((p) => ({ ...p, maxDiscountRs: e.target.value }))}
                  placeholder="200"
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-600"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Per User Limit</label>
                <input
                  type="number"
                  value={form.perUserLimit}
                  onChange={(e) => setForm((p) => ({ ...p, perUserLimit: e.target.value }))}
                  placeholder="1"
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-600"
                />
              </div>
            )}
          </div>

          {form.type === "PERCENT" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Per User Limit</label>
              <input
                type="number"
                value={form.perUserLimit}
                onChange={(e) => setForm((p) => ({ ...p, perUserLimit: e.target.value }))}
                placeholder="1"
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-600"
              />
            </div>
          )}

          {/* Usage Limit & Validity Dates */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Total Usage Limit</label>
            <input
              type="number"
              value={form.usageLimit}
              onChange={(e) => setForm((p) => ({ ...p, usageLimit: e.target.value }))}
              placeholder="100"
              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-600"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Starts At (Optional)</label>
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => setForm((p) => ({ ...p, startsAt: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expires At (Optional)</label>
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Is Active */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="createCouponActive"
              checked={form.isActive}
              onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="createCouponActive" className="text-xs font-semibold text-slate-800">
              Active for customer redemption
            </label>
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
              {loading ? "Publishing…" : "Publish Coupon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  </ModalPortal>
  );
}

/* ------------------- MODAL: Edit Coupon (PATCH /admin/coupons/:id) ------------------- */
function EditCouponModal({ coupon, onClose, onSuccess }) {
  const [form, setForm] = useState({
    usageLimit: coupon.usageLimit ?? 200,
    isActive: coupon.isActive !== false,
    description: coupon.description || "",
    minOrderRs: coupon.minOrderPaise ? coupon.minOrderPaise / 100 : "",
    maxDiscountRs: coupon.maxDiscountPaise ? coupon.maxDiscountPaise / 100 : "",
    perUserLimit: coupon.perUserLimit ?? 1,
    expiresAt: coupon.expiresAt ? coupon.expiresAt.substring(0, 16) : "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Matches Screenshot 5:
      // PATCH /admin/coupons/:id with { usageLimit: 200, isActive: true, ... }
      const payload = {
        usageLimit: form.usageLimit !== "" ? Number(form.usageLimit) : undefined,
        isActive: Boolean(form.isActive),
        description: form.description.trim() || undefined,
        minOrderPaise: form.minOrderRs !== "" ? Math.round(Number(form.minOrderRs) * 100) : undefined,
        maxDiscountPaise: form.maxDiscountRs !== "" ? Math.round(Number(form.maxDiscountRs) * 100) : undefined,
        perUserLimit: form.perUserLimit !== "" ? Number(form.perUserLimit) : undefined,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
      };

      await admin.updateCoupon(coupon.id, payload);
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
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Update Coupon</h3>
            <p className="text-[11px] text-slate-500 font-mono font-bold mt-0.5">{coupon.code}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Usage Limit</label>
              <input
                type="number"
                value={form.usageLimit}
                onChange={(e) => setForm((p) => ({ ...p, usageLimit: e.target.value }))}
                placeholder="200"
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-600 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Per User Limit</label>
              <input
                type="number"
                value={form.perUserLimit}
                onChange={(e) => setForm((p) => ({ ...p, perUserLimit: e.target.value }))}
                placeholder="1"
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-600"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Min Spend (₹)</label>
              <input
                type="number"
                value={form.minOrderRs}
                onChange={(e) => setForm((p) => ({ ...p, minOrderRs: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date</label>
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Active status */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="editCouponActive"
              checked={form.isActive}
              onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="editCouponActive" className="text-xs font-semibold text-slate-800">
              Active for customer redemption
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-50"
            >
              {loading ? "Updating…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  </ModalPortal>
  );
}

/* ------------------- MODAL: Coupon Details & Usages (GET /admin/coupons/:id) ------------------- */
function CouponDetailsModal({ coupon, onClose }) {
  const [data, setData] = useState(coupon);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDetails() {
      try {
        // Matches GET /admin/coupons/{{couponId}}
        const res = await admin.coupon(coupon.id);
        if (res) setData(res);
      } catch (err) {
        setError(formatApiError(err));
      } finally {
        setLoading(false);
      }
    }
    loadDetails();
  }, [coupon.id]);

  const usages = data.usages || data.redemptions || [];

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Coupon Details & Usages</h3>
              <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                {data.code}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {data.description || "Promotional discount"}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800">
            {error}
          </div>
        )}

        {/* Overview Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-center">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400">Discount</span>
            <p className="text-sm font-bold text-slate-900">
              {data.type === "PERCENT" ? `${data.value}%` : rupees(data.value)}
            </p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400">Total Uses</span>
            <p className="text-sm font-bold text-emerald-700">
              {data.usedCount ?? usages.length} / {data.usageLimit ?? "∞"}
            </p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400">Per User</span>
            <p className="text-sm font-bold text-slate-900">
              {data.perUserLimit || 1} max
            </p>
          </div>
        </div>

        {/* Usages Table */}
        <div className="mt-4">
          <p className="text-xs font-semibold text-slate-700 mb-2">
            Usage History ({usages.length})
          </p>
          <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
            {loading ? (
              <p className="py-6 text-center text-xs text-slate-400">Loading usage history…</p>
            ) : usages.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400 italic">
                No orders have redeemed this coupon code yet.
              </p>
            ) : (
              usages.map((u, idx) => (
                <div
                  key={u.id || idx}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      Order: #{u.orderNumber || u.orderId || "—"}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {u.userEmail || u.userName || "Customer"} &bull;{" "}
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "—"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-700">
                      -{rupees(u.discountPaise || u.discount || 0)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </ModalPortal>
  );
}
