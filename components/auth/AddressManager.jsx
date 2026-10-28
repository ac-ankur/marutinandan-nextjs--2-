"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Phone,
  User,
  Home,
  Building,
  Check,
  X,
  Loader2,
  Star,
} from "lucide-react";
import { account, formatApiError } from "@/lib/api";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Chandigarh",
  "Jammu and Kashmir",
  "Ladakh",
  "Puducherry",
];

const INITIAL_FORM_STATE = {
  name: "",
  phone: "",
  line1: "",
  line2: "",
  landmark: "",
  city: "",
  state: "Uttar Pradesh",
  pincode: "",
  isDefault: false,
};

export default function AddressManager() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formServerError, setFormServerError] = useState("");

  // Delete confirmation
  const [deletingId, setDeletingId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Fetch addresses on mount
  const fetchAddresses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await account.addresses();
      const list = Array.isArray(res) ? res : res?.addresses || [];
      setAddresses(list);
    } catch (err) {
      console.error("Failed to load addresses:", err);
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  function notify(msg) {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 4000);
  }

  function openAddModal() {
    setEditingAddressId(null);
    setFormData(INITIAL_FORM_STATE);
    setFormErrors({});
    setFormServerError("");
    setIsFormOpen(true);
  }

  function openEditModal(addr) {
    setEditingAddressId(addr.id);
    setFormData({
      name: addr.name || "",
      phone: addr.phone || "",
      line1: addr.line1 || "",
      line2: addr.line2 || "",
      landmark: addr.landmark || "",
      city: addr.city || "",
      state: addr.state || "Uttar Pradesh",
      pincode: addr.pincode || "",
      isDefault: !!addr.isDefault,
    });
    setFormErrors({});
    setFormServerError("");
    setIsFormOpen(true);
  }

  function closeFormModal() {
    setIsFormOpen(false);
    setEditingAddressId(null);
    setFormData(INITIAL_FORM_STATE);
    setFormErrors({});
    setFormServerError("");
  }

  // Validate form fields
  function validate() {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = "Recipient name is required";
    } else if (formData.name.trim().length < 2) {
      errs.name = "Name must be at least 2 characters";
    }

    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (!cleanPhone) {
      errs.phone = "Phone number is required";
    } else if (cleanPhone.length !== 10) {
      errs.phone = "Phone must be exactly 10 digits";
    } else if (!/^[6-9]/.test(cleanPhone)) {
      errs.phone = "Phone must start with 6, 7, 8, or 9";
    }

    if (!formData.line1.trim()) {
      errs.line1 = "Address line 1 is required";
    }
    if (!formData.city.trim()) {
      errs.city = "City is required";
    }
    if (!formData.state.trim()) {
      errs.state = "State is required";
    }

    const cleanPin = formData.pincode.replace(/\D/g, "");
    if (!cleanPin) {
      errs.pincode = "PIN code is required";
    } else if (cleanPin.length !== 6) {
      errs.pincode = "PIN code must be exactly 6 digits";
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setFormServerError("");

    const payload = {
      name: formData.name.trim(),
      phone: formData.phone.replace(/\D/g, ""),
      line1: formData.line1.trim(),
      line2: formData.line2.trim() || undefined,
      landmark: formData.landmark.trim() || undefined,
      city: formData.city.trim(),
      state: formData.state.trim(),
      pincode: formData.pincode.replace(/\D/g, ""),
      isDefault: Boolean(formData.isDefault),
    };

    try {
      if (editingAddressId) {
        await account.updateAddress(editingAddressId, payload);
        notify("Address updated successfully!");
      } else {
        await account.addAddress(payload);
        notify("Address added successfully!");
      }
      closeFormModal();
      await fetchAddresses();
    } catch (err) {
      console.error("Address operation failed:", err);
      // Map field errors if any
      if (err?.details?.fieldErrors) {
        const mapped = {};
        for (const [k, v] of Object.entries(err.details.fieldErrors)) {
          if (Array.isArray(v) && v.length) mapped[k] = v[0];
        }
        setFormErrors((prev) => ({ ...prev, ...mapped }));
      }
      setFormServerError(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    setActionLoadingId(id);
    try {
      await account.deleteAddress(id);
      notify("Address removed.");
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      setDeletingId(null);
    } catch (err) {
      alert(formatApiError(err));
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleSetDefault(addr) {
    setActionLoadingId(addr.id);
    try {
      await account.updateAddress(addr.id, {
        name: addr.name,
        phone: addr.phone,
        line1: addr.line1,
        line2: addr.line2 || undefined,
        landmark: addr.landmark || undefined,
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        isDefault: true,
      });
      notify("Default address updated!");
      await fetchAddresses();
    } catch (err) {
      alert(formatApiError(err));
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gold" />
            <h2 className="font-display text-xl font-medium text-pine-950">Saved Delivery Addresses</h2>
          </div>
          <p className="mt-1 text-xs text-ink/65">
            Manage your residential and shipping addresses for smooth order checkouts.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-pine-900 px-5 py-2.5 text-xs font-semibold text-cream shadow-md transition-all hover:bg-pine-800 hover:scale-[1.02] active:scale-95"
        >
          <Plus className="h-4 w-4 text-gold-light" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Global Alerts */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 p-4 text-xs font-medium text-green-800 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchAddresses}
            className="underline hover:text-red-950 font-semibold text-[11px]"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-3xl border border-gold/20 bg-cream-paper p-8">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-gold" />
            <span className="text-xs text-ink/50">Fetching your addresses…</span>
          </div>
        </div>
      ) : addresses.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gold/40 bg-cream-paper/60 p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-pine-900/5 text-pine-900">
            <MapPin className="h-7 w-7 text-gold" />
          </div>
          <h3 className="mt-4 font-display text-base font-semibold text-pine-950">No addresses saved yet</h3>
          <p className="mt-1 max-w-sm text-xs text-ink/60">
            Add a shipping address so you can quickly place orders for authentic wood-pressed oils.
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-gold/50 bg-pine-900 px-5 py-2.5 text-xs font-semibold text-cream hover:bg-pine-800 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 text-gold-light" />
            Add First Address
          </button>
        </div>
      ) : (
        /* Addresses Grid */
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => {
            const isDeleting = deletingId === addr.id;
            const isActing = actionLoadingId === addr.id;

            return (
              <div
                key={addr.id}
                className={`group relative flex flex-col justify-between rounded-3xl border p-5 transition-all shadow-sm ${
                  addr.isDefault
                    ? "border-gold/60 bg-cream-paper ring-1 ring-gold/40"
                    : "border-gold/20 bg-cream-paper/70 hover:border-gold/40 hover:bg-cream-paper"
                }`}
              >
                <div>
                  {/* Top Bar with Name & Default Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pine-900/10 text-pine-900">
                        <Home className="h-3.5 w-3.5" />
                      </span>
                      <h4 className="font-semibold text-sm text-pine-950 truncate max-w-[170px]">
                        {addr.name}
                      </h4>
                    </div>

                    {addr.isDefault ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 border border-gold/50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-pine-950">
                        <Star className="h-3 w-3 fill-gold text-gold" />
                        Default
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={isActing}
                        onClick={() => handleSetDefault(addr)}
                        className="text-[11px] font-medium text-ink/50 hover:text-pine-900 hover:underline"
                      >
                        Set as default
                      </button>
                    )}
                  </div>

                  {/* Address Body */}
                  <div className="mt-3.5 space-y-1 text-xs text-ink/75 leading-relaxed">
                    <p className="font-medium text-ink">{addr.line1}</p>
                    {addr.line2 && <p>{addr.line2}</p>}
                    {addr.landmark && (
                      <p className="text-[11px] text-ink/60 italic">Landmark: {addr.landmark}</p>
                    )}
                    <p>
                      {addr.city}, {addr.state} —{" "}
                      <span className="font-semibold text-pine-950">{addr.pincode}</span>
                    </p>

                    <p className="pt-2 flex items-center gap-1.5 text-xs text-ink font-medium">
                      <Phone className="h-3 w-3 text-gold" />
                      +91 {addr.phone}
                    </p>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-5 pt-3 border-t border-ink/8 flex items-center justify-between">
                  {isDeleting ? (
                    <div className="flex items-center gap-2 w-full justify-between animate-in fade-in">
                      <span className="text-[11px] text-red-700 font-medium">Delete address?</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDeletingId(null)}
                          className="rounded-lg border border-ink/15 px-2 py-1 text-[10px] text-ink/70 hover:bg-ink/5"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isActing}
                          onClick={() => handleDelete(addr.id)}
                          className="rounded-lg bg-red-600 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-red-700"
                        >
                          {isActing ? "Deleting…" : "Yes, Delete"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => openEditModal(addr)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-pine-900 hover:text-gold-deep transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingId(addr.id)}
                        className="inline-flex items-center gap-1 text-xs text-ink/40 hover:text-red-700 transition-colors"
                        title="Delete address"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Add / Edit Address */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-gold/40 bg-cream p-6 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-ink/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pine-900 text-cream">
                  <Building className="h-4 w-4 text-gold-light" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-pine-950">
                    {editingAddressId ? "Edit Delivery Address" : "Add New Delivery Address"}
                  </h3>
                  <p className="text-[11px] text-ink/60">
                    Fill in your shipping details for doorstep deliveries
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeFormModal}
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink/40 hover:bg-ink/5 hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form Error Banner */}
            {formServerError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{formServerError}</span>
              </div>
            )}

            {/* Address Form */}
            <form onSubmit={handleFormSubmit} className="mt-4 space-y-3.5">
              {/* Recipient Name & Phone */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink/75">
                    Recipient Full Name <span className="text-gold-deep">*</span>
                  </label>
                  <div className="relative mt-1">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink/40">
                      <User className="h-3.5 w-3.5" />
                    </span>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="e.g. Ramesh Sharma"
                      className={`w-full rounded-xl border bg-white py-2.5 pl-9 pr-3 text-xs text-ink placeholder:text-ink/35 outline-none transition-all ${
                        formErrors.name
                          ? "border-red-400 focus:border-red-500 ring-1 ring-red-400/40"
                          : "border-ink/15 focus:border-gold focus:ring-1 focus:ring-gold/30"
                      }`}
                    />
                  </div>
                  {formErrors.name && (
                    <p className="mt-1 text-[10px] text-red-600 font-medium">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink/75">
                    Phone Number <span className="text-gold-deep">*</span>
                  </label>
                  <div className="relative mt-1">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[11px] font-semibold text-ink/50">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={formData.phone}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "");
                        setFormData((prev) => ({ ...prev, phone: digits }));
                      }}
                      placeholder="10-digit number"
                      className={`w-full rounded-xl border bg-white py-2.5 pl-11 pr-3 text-xs text-ink placeholder:text-ink/35 outline-none transition-all ${
                        formErrors.phone
                          ? "border-red-400 focus:border-red-500 ring-1 ring-red-400/40"
                          : "border-ink/15 focus:border-gold focus:ring-1 focus:ring-gold/30"
                      }`}
                    />
                  </div>
                  {formErrors.phone && (
                    <p className="mt-1 text-[10px] text-red-600 font-medium">{formErrors.phone}</p>
                  )}
                </div>
              </div>

              {/* Address Line 1 */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink/75">
                  Flat, House No., Building, Apartment <span className="text-gold-deep">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.line1}
                  onChange={(e) => setFormData((prev) => ({ ...prev, line1: e.target.value }))}
                  placeholder="e.g. 12 Sector 62 or B-402, Royal Palms"
                  className={`mt-1 w-full rounded-xl border bg-white px-3 py-2.5 text-xs text-ink placeholder:text-ink/35 outline-none transition-all ${
                    formErrors.line1
                      ? "border-red-400 focus:border-red-500 ring-1 ring-red-400/40"
                      : "border-ink/15 focus:border-gold focus:ring-1 focus:ring-gold/30"
                  }`}
                />
                {formErrors.line1 && (
                  <p className="mt-1 text-[10px] text-red-600 font-medium">{formErrors.line1}</p>
                )}
              </div>

              {/* Address Line 2 & Landmark */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink/75">
                    Area, Street, Sector (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.line2}
                    onChange={(e) => setFormData((prev) => ({ ...prev, line2: e.target.value }))}
                    placeholder="e.g. Near Metro or Phase 2"
                    className="mt-1 w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-xs text-ink placeholder:text-ink/35 outline-none transition-all focus:border-gold focus:ring-1 focus:ring-gold/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink/75">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.landmark}
                    onChange={(e) => setFormData((prev) => ({ ...prev, landmark: e.target.value }))}
                    placeholder="e.g. Opp. Park or Near SBI Bank"
                    className="mt-1 w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-xs text-ink placeholder:text-ink/35 outline-none transition-all focus:border-gold focus:ring-1 focus:ring-gold/30"
                  />
                </div>
              </div>

              {/* City, State & PIN Code */}
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink/75">
                    City / Town <span className="text-gold-deep">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                    placeholder="e.g. Noida"
                    className={`mt-1 w-full rounded-xl border bg-white px-3 py-2.5 text-xs text-ink placeholder:text-ink/35 outline-none transition-all ${
                      formErrors.city
                        ? "border-red-400 focus:border-red-500 ring-1 ring-red-400/40"
                        : "border-ink/15 focus:border-gold focus:ring-1 focus:ring-gold/30"
                    }`}
                  />
                  {formErrors.city && (
                    <p className="mt-1 text-[10px] text-red-600 font-medium">{formErrors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink/75">
                    State <span className="text-gold-deep">*</span>
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-ink/15 bg-white px-2.5 py-2.5 text-xs text-ink outline-none transition-all focus:border-gold focus:ring-1 focus:ring-gold/30"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink/75">
                    PIN Code <span className="text-gold-deep">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={formData.pincode}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      setFormData((prev) => ({ ...prev, pincode: digits }));
                    }}
                    placeholder="6 digits"
                    className={`mt-1 w-full rounded-xl border bg-white px-3 py-2.5 text-xs text-ink placeholder:text-ink/35 outline-none transition-all ${
                      formErrors.pincode
                        ? "border-red-400 focus:border-red-500 ring-1 ring-red-400/40"
                        : "border-ink/15 focus:border-gold focus:ring-1 focus:ring-gold/30"
                    }`}
                  />
                  {formErrors.pincode && (
                    <p className="mt-1 text-[10px] text-red-600 font-medium">{formErrors.pincode}</p>
                  )}
                </div>
              </div>

              {/* Set as Default checkbox */}
              <label className="flex items-center gap-2.5 pt-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isDefault: e.target.checked }))}
                  className="h-4 w-4 rounded border-ink/20 text-pine-900 focus:ring-gold accent-pine-900"
                />
                <span className="text-xs font-medium text-pine-950">
                  Set as default delivery address for future orders
                </span>
              </label>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-ink/10">
                <button
                  type="button"
                  onClick={closeFormModal}
                  className="rounded-full border border-ink/20 bg-cream-paper px-4 py-2 text-xs font-semibold text-ink/75 hover:bg-ink/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-full bg-pine-900 px-5 py-2 text-xs font-semibold text-cream shadow-md transition-all hover:bg-pine-800 disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving…</span>
                    </>
                  ) : (
                    <span>{editingAddressId ? "Save Changes" : "Add Address"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
