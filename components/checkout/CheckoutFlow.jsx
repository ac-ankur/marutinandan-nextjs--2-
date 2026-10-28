"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { cart as cartApi, account, orders as ordersApi, rupees, formatApiError } from "@/lib/api";
import {
  ShoppingBag,
  MapPin,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Truck,
  Plus,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Package,
  FileDown,
  Loader2,
  Lock,
  Check,
  Sparkles,
  Phone,
} from "lucide-react";

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

const INITIAL_ADDRESS_FORM = {
  name: "",
  phone: "",
  line1: "",
  line2: "",
  landmark: "",
  city: "",
  state: "Rajasthan",
  pincode: "",
  isDefault: true,
};

const CHECKOUT_STEPS = [
  {
    num: 1,
    title: "Review Bag",
    desc: "Cart & Stock",
    detail: "Verified with live warehouse inventory",
    icon: ShoppingBag,
  },
  {
    num: 2,
    title: "Delivery Address",
    desc: "Delivery Details",
    detail: "Saved & new shipping destinations",
    icon: MapPin,
  },
  {
    num: 3,
    title: "Payment Gateway",
    desc: "Online / Gateway",
    detail: "256-bit encrypted secure payment",
    icon: CreditCard,
  },
  {
    num: 4,
    title: "Order Confirmed",
    desc: "Order Placed",
    detail: "Live tracking & instant GST invoice",
    icon: CheckCircle2,
  },
];

export default function CheckoutFlow() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { refreshCart } = useCart();

  // Active Checkout Step:
  // 1: Cart & Issues review
  // 2: Choose / Add Delivery Address
  // 3: Payment simulation
  // 4: Order Confirmed
  const [step, setStep] = useState(1);

  // Data states
  const [cartData, setCartData] = useState(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState("");

  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState("");

  // Add Address Form modal / drawer
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressFormData, setAddressFormData] = useState(INITIAL_ADDRESS_FORM);
  const [addressFormErrors, setAddressFormErrors] = useState({});
  const [addressFormSaving, setAddressFormSaving] = useState(false);

  // Order & Payment states
  const [createdOrder, setCreatedOrder] = useState(null);
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [invoiceDownloading, setInvoiceDownloading] = useState(false);

  // Step 1: Load latest cart & server-calculated total (GET /api/v1/cart)
  const fetchLatestCart = useCallback(async () => {
    setCartLoading(true);
    setCartError("");
    try {
      const data = await cartApi.get();
      setCartData(data);
      if (user) {
        setAddressFormData((prev) => ({
          ...prev,
          name: prev.name || user.name || "",
          phone: prev.phone || user.phone || "",
        }));
      }
    } catch (err) {
      setCartError(formatApiError(err));
    } finally {
      setCartLoading(false);
    }
  }, [user]);

  // Step 2: Load saved addresses (GET /api/v1/users/me/addresses)
  const fetchAddresses = useCallback(async () => {
    setAddressesLoading(true);
    try {
      const data = await account.addresses();
      const list = Array.isArray(data) ? data : data?.addresses || [];
      setAddresses(list);

      if (list.length > 0 && !selectedAddressId) {
        const defaultAddr = list.find((a) => a.isDefault) || list[0];
        setSelectedAddressId(defaultAddr.id);
      } else if (list.length === 0) {
        setShowAddressForm(true);
      }
    } catch (err) {
      console.error("Failed to load addresses:", err);
    } finally {
      setAddressesLoading(false);
    }
  }, [selectedAddressId]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLatestCart();
      fetchAddresses();
    }
  }, [isAuthenticated, fetchLatestCart, fetchAddresses]);

  // Handle Adding New Address (POST /api/v1/users/me/addresses)
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!addressFormData.name.trim()) errors.name = "Full name is required";
    if (!addressFormData.phone.trim() || addressFormData.phone.replace(/\D/g, "").length < 10) {
      errors.phone = "Valid 10-digit mobile number is required";
    }
    if (!addressFormData.line1.trim()) errors.line1 = "Address line 1 is required";
    if (!addressFormData.city.trim()) errors.city = "City is required";
    if (!addressFormData.state.trim()) errors.state = "State is required";
    if (!addressFormData.pincode.trim() || !/^\d{6}$/.test(addressFormData.pincode.trim())) {
      errors.pincode = "Valid 6-digit postal code is required";
    }

    if (Object.keys(errors).length > 0) {
      setAddressFormErrors(errors);
      return;
    }

    setAddressFormSaving(true);
    setAddressFormErrors({});
    try {
      const saved = await account.addAddress({
        name: addressFormData.name.trim(),
        phone: addressFormData.phone.replace(/\D/g, ""),
        line1: addressFormData.line1.trim(),
        line2: addressFormData.line2.trim(),
        landmark: addressFormData.landmark.trim(),
        city: addressFormData.city.trim(),
        state: addressFormData.state.trim(),
        postalCode: addressFormData.pincode.trim(),
        pincode: addressFormData.pincode.trim(),
        isDefault: Boolean(addressFormData.isDefault),
      });

      const newId = saved?.id || saved?._id;
      await fetchAddresses();
      if (newId) setSelectedAddressId(newId);
      setShowAddressForm(false);
      setAddressFormData(INITIAL_ADDRESS_FORM);
    } catch (err) {
      setAddressFormErrors({ form: formatApiError(err) });
    } finally {
      setAddressFormSaving(false);
    }
  };

  // Step 3: Create Order (POST /api/v1/orders/checkout)
  const handleProceedToCreateOrder = async () => {
    if (!selectedAddressId) {
      setCheckoutError("Please select or add a delivery address to continue.");
      return;
    }

    setCheckoutSubmitting(true);
    setCheckoutError("");
    try {
      const order = await ordersApi.checkout(selectedAddressId, "ONLINE");
      setCreatedOrder(order);
      refreshCart();
      setStep(3);
    } catch (err) {
      setCheckoutError(formatApiError(err));
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  // Step 4: Simulate Payment (POST /api/v1/payments/simulate/<order-id>)
  const handleSimulatePayment = async (outcome = "success") => {
    if (!createdOrder?.id) return;

    setPaymentSubmitting(true);
    setPaymentError("");
    try {
      await ordersApi.simulatePayment(createdOrder.id, outcome);
      const updated = await ordersApi.get(createdOrder.id).catch(() => ({
        ...createdOrder,
        status: "PAID",
      }));
      setCreatedOrder(updated);
      setStep(4);
    } catch (err) {
      setPaymentError(formatApiError(err));
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const handleDownloadInvoice = async () => {
    const orderIdentifier = createdOrder?.orderNumber || createdOrder?.id;
    if (!orderIdentifier) return;
    setInvoiceDownloading(true);
    try {
      await ordersApi.downloadInvoice(
        orderIdentifier,
        `Invoice-${orderIdentifier}.pdf`
      );
    } catch (err) {
      alert(formatApiError(err));
    } finally {
      setInvoiceDownloading(false);
    }
  };

  if (authLoading || cartLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-gold-deep" />
        <p className="font-display text-sm text-pine-900">Validating bag & server pricing…</p>
      </div>
    );
  }

  const items = cartData?.items || [];
  const issues = cartData?.issues || [];
  const canCheckout = cartData?.canCheckout !== false && items.length > 0 && issues.length === 0;

  const subtotalPaise = cartData?.subtotalPaise || 0;
  const discountPaise = cartData?.discountPaise || 0;
  const shippingPaise = cartData?.shippingPaise || 0;
  const totalPaise = cartData?.totalPaise || Math.max(0, subtotalPaise - discountPaise + shippingPaise);

  return (
    <div className="mx-auto w-full max-w-7xl animate-fadeIn">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* ================= LEFT COLUMN: VERTICAL PROGRESS STEPPER ================= */}
        <aside className="w-full lg:w-80 xl:w-[330px] shrink-0 lg:sticky lg:top-28 space-y-5">
          <div className="rounded-[30px] border border-gold/30 bg-gradient-to-b from-white via-cream-paper/95 to-cream-paper p-6 sm:p-7 shadow-[0_12px_36px_-16px_rgba(20,40,25,0.12)] backdrop-blur-md">
            {/* Header with Progress Bar */}
            <div className="border-b border-ink/8 pb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-[10px] font-bold tracking-widest text-gold-deep uppercase">
                    Checkout Flow
                  </span>
                </div>
                <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-[11px] font-bold text-pine-900">
                  Step {step} of 4
                </span>
              </div>
              <h2 className="font-display text-xl font-bold text-pine-950 mt-1.5">
                Order Progress
              </h2>
              {/* Animated Progress Bar */}
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-600 via-gold-deep to-gold transition-all duration-700 ease-out"
                  style={{ width: `${((step - 1) / 3) * 100}%` }}
                />
              </div>
            </div>

            {/* Vertical Steps List with Connected Line */}
            <div className="relative mt-6 space-y-5">
              {/* Continuous Vertical Track Line behind the circles */}
              <div className="absolute left-[21px] top-4 bottom-4 w-0.5 bg-ink/10 -translate-x-1/2" aria-hidden="true">
                <div
                  className="w-full bg-gradient-to-b from-emerald-600 via-gold-deep to-gold transition-all duration-700 ease-out"
                  style={{
                    height: `${Math.min(100, Math.max(0, ((step - 1) / 3) * 100))}%`,
                  }}
                />
              </div>

              {CHECKOUT_STEPS.map((s) => {
                const isActive = step === s.num;
                const isCompleted = step > s.num;
                const StepIcon = s.icon;
                const canClick = isCompleted;

                return (
                  <div
                    key={s.num}
                    onClick={() => {
                      if (canClick) setStep(s.num);
                    }}
                    className={`relative flex items-start gap-3.5 rounded-2xl p-2.5 -m-2.5 transition-all duration-300 group ${
                      canClick ? "cursor-pointer hover:bg-gold/10 hover:shadow-xs" : ""
                    } ${isActive ? "bg-gradient-to-r from-gold/15 via-gold/5 to-transparent shadow-xs" : ""}`}
                  >
                    {/* Step Circle with micro-animation */}
                    <div className="relative flex-shrink-0 z-10">
                      {isActive && (
                        <span className="absolute -inset-1.5 rounded-full bg-gold/25 animate-ping opacity-75" />
                      )}
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                          isCompleted
                            ? "bg-emerald-600 text-white shadow-md ring-2 ring-emerald-500/30 group-hover:scale-105"
                            : isActive
                            ? "bg-pine-900 text-gold-light ring-4 ring-gold/30 shadow-[0_0_20px_rgba(184,134,11,0.35)] scale-105"
                            : "bg-white border-2 border-ink/15 text-ink/40 shadow-2xs"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="h-5 w-5 stroke-[2.5]" />
                        ) : (
                          <StepIcon className="h-5 w-5" />
                        )}
                      </div>
                    </div>

                    {/* Text & Status */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center justify-between gap-1.5">
                        <p
                          className={`font-display text-sm font-bold tracking-tight transition-colors ${
                            isActive
                              ? "text-pine-950"
                              : isCompleted
                              ? "text-emerald-900 group-hover:text-emerald-700"
                              : "text-ink/40"
                          }`}
                        >
                          {s.title}
                        </p>
                        {isActive && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold text-gold-deep">
                            <span className="h-1.5 w-1.5 rounded-full bg-gold-deep animate-pulse" />
                            Active
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                            Done
                          </span>
                        )}
                      </div>

                      <p
                        className={`text-xs mt-0.5 transition-colors ${
                          isActive
                            ? "text-pine-800/90 font-medium"
                            : isCompleted
                            ? "text-ink/60"
                            : "text-ink/35"
                        }`}
                      >
                        {s.desc}
                      </p>

                      {isActive && (
                        <p className="text-[10px] font-medium text-gold-deep mt-1 flex items-center gap-1 animate-in fade-in duration-300">
                          <Sparkles className="h-3 w-3 flex-shrink-0" />
                          <span>{s.detail}</span>
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trust & Guarantee Box */}
          <div className="rounded-2xl border border-ink/8 bg-white/80 p-4 shadow-2xs space-y-2.5 text-xs text-ink/75">
            <div className="flex items-center gap-2 font-bold text-pine-950">
              <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>Trust & Security</span>
            </div>
            <div className="space-y-2 text-[11px] text-ink/65 divide-y divide-ink/6 pt-0.5">
              <div className="flex items-center gap-2 pt-1.5">
                <Lock className="h-3.5 w-3.5 text-gold-deep flex-shrink-0" />
                <span>256-Bit SSL Encrypted Checkout</span>
              </div>
              <div className="flex items-center gap-2 pt-1.5">
                <Package className="h-3.5 w-3.5 text-gold-deep flex-shrink-0" />
                <span>Wood-churned, fresh Alwar dispatch</span>
              </div>
              <div className="flex items-center gap-2 pt-1.5">
                <Truck className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                <span>Express courier delivery across India</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ================= RIGHT COLUMN: STEPS DETAILS ================= */}
        <main className="flex-1 w-full min-w-0">
          {/* STEP 1 & 2: Main Interactive Checkout Grid */}
          {step < 3 && (
            <div className="grid gap-6 xl:grid-cols-12 items-start">
              {/* Left Column: Flow Details */}
              <div className="xl:col-span-7 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Step 1: Cart Verification & Issues */}
            {step === 1 && (
              <div className="rounded-3xl border border-gold/25 bg-gradient-to-b from-white via-cream-paper/80 to-cream-paper p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-ink/8 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gold/20 text-gold-deep">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-display text-xl font-bold text-pine-950">
                        1. Verify Order Items
                      </h2>
                      <p className="text-xs text-ink/60">
                        Live server prices and warehouse inventory verified
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold-deep">
                    {items.length} item{items.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Stock or Cart Issues Alert */}
                {issues.length > 0 && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-2 text-xs text-amber-900">
                    <div className="flex items-center gap-2 font-bold text-amber-800">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                      <span>Action Required Before Checkout</span>
                    </div>
                    <ul className="list-inside list-disc space-y-1 text-amber-800/90 pl-1">
                      {issues.map((iss, i) => (
                        <li key={i}>{typeof iss === "string" ? iss : iss.message || "Item issue detected"}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Empty Cart Warning */}
                {items.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold-deep">
                      <ShoppingBag className="h-7 w-7" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-pine-950">Your bag is empty</h3>
                    <p className="text-xs text-ink/60">
                      Please add products to your bag before checking out.
                    </p>
                    <Link
                      href="/products"
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-pine-900 px-6 py-2.5 text-xs font-semibold text-cream hover:bg-pine-950 transition-all"
                    >
                      Browse Products
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-ink/8">
                    {items.map((item) => {
                      const isYellow =
                        item.productName?.toLowerCase().includes("yellow") ||
                        item.productSlug?.includes("yellow");
                      const defaultImage = isYellow
                        ? "/images/yellowmustard.png"
                        : "/images/blackmustard.png";
                      const imgSrc = item.image || defaultImage;
                      const unitPrice = item.unitPrice || (item.unitPricePaise ? item.unitPricePaise / 100 : 0);
                      const lineTotal = item.lineTotalPaise
                        ? item.lineTotalPaise / 100
                        : unitPrice * item.quantity;

                      return (
                        <div key={item.id || item.itemId} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                          <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-2xl border border-ink/10 bg-cream-paper p-1">
                            <SafeImage
                              src={imgSrc}
                              alt={item.productName || "Product"}
                              fallbackHint={item.productName}
                              fill
                              className="object-contain p-1"
                              sizes="64px"
                            />
                          </div>

                          <div className="flex flex-1 flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-display text-sm font-bold text-pine-950 leading-tight">
                                  {item.productName}
                                </h4>
                                <span className="font-display text-sm font-bold text-pine-900">
                                  ₹{lineTotal}
                                </span>
                              </div>
                              <p className="text-[11px] text-ink/50 mt-0.5">
                                Variant: {item.variantLabel || item.size || item.sku || "Standard"}
                              </p>
                            </div>

                            <div className="flex items-center justify-between text-xs text-ink/60">
                              <span>Quantity: <strong className="text-pine-950 font-bold">{item.quantity}</strong></span>
                              <span>₹{unitPrice} / unit</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Free Delivery Banner */}
                <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-800">
                  <Truck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>
                    {shippingPaise === 0 ? (
                      <strong>🎉 Free Standard Shipping applied to this order!</strong>
                    ) : (
                      <span>Standard delivery applied. Free shipping above ₹1,000.</span>
                    )}
                  </span>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!canCheckout}
                    className="flex items-center gap-2 rounded-2xl bg-pine-900 px-6 py-3 text-xs font-semibold text-cream shadow-md transition-all hover:bg-pine-950 hover:shadow-lg disabled:opacity-40"
                  >
                    <span>Proceed to Delivery Address</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Choose / Add Delivery Address */}
            {step === 2 && (
              <div className="rounded-3xl border border-gold/25 bg-gradient-to-b from-white via-cream-paper/80 to-cream-paper p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-ink/8 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gold/20 text-gold-deep">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-display text-xl font-bold text-pine-950">
                        2. Delivery Address
                      </h2>
                      <p className="text-xs text-ink/60">
                        Where should we dispatch your freshly pressed oil?
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddressForm((p) => !p)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-cream px-3 py-1.5 text-xs font-semibold text-pine-900 hover:bg-gold/15 transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{showAddressForm ? "Cancel" : "Add Address"}</span>
                  </button>
                </div>

                {checkoutError && (
                  <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600" />
                    <span>{checkoutError}</span>
                  </div>
                )}

                {/* Inline New Address Form */}
                {showAddressForm && (
                  <form
                    onSubmit={handleSaveAddress}
                    className="rounded-2xl border border-gold/30 bg-white p-5 space-y-4 shadow-sm"
                  >
                    <div className="flex items-center gap-2 font-display text-sm font-bold text-pine-950 border-b border-ink/8 pb-2">
                      <MapPin className="h-4 w-4 text-gold-deep" />
                      <span>Add New Delivery Destination</span>
                    </div>

                    {addressFormErrors.form && (
                      <p className="text-xs font-medium text-rose-700">{addressFormErrors.form}</p>
                    )}

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-ink/70 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={addressFormData.name}
                          onChange={(e) => setAddressFormData((p) => ({ ...p, name: e.target.value }))}
                          placeholder="e.g. Ankur Chauhan"
                          className="w-full rounded-xl border border-ink/15 bg-white p-2.5 text-xs text-ink outline-none focus:border-gold-deep focus:ring-1 focus:ring-gold/30"
                        />
                        {addressFormErrors.name && (
                          <p className="text-[10px] text-rose-600 mt-0.5">{addressFormErrors.name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-ink/70 mb-1">
                          Phone Number (10 Digits) *
                        </label>
                        <input
                          type="tel"
                          required
                          value={addressFormData.phone}
                          onChange={(e) => setAddressFormData((p) => ({ ...p, phone: e.target.value }))}
                          placeholder="e.g. 9888918822"
                          className="w-full rounded-xl border border-ink/15 bg-white p-2.5 text-xs text-ink outline-none focus:border-gold-deep focus:ring-1 focus:ring-gold/30"
                        />
                        {addressFormErrors.phone && (
                          <p className="text-[10px] text-rose-600 mt-0.5">{addressFormErrors.phone}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-ink/70 mb-1">
                        Street Address / Flat / Building *
                      </label>
                      <input
                        type="text"
                        required
                        value={addressFormData.line1}
                        onChange={(e) => setAddressFormData((p) => ({ ...p, line1: e.target.value }))}
                        placeholder="House / Flat No, Street name"
                        className="w-full rounded-xl border border-ink/15 bg-white p-2.5 text-xs text-ink outline-none focus:border-gold-deep focus:ring-1 focus:ring-gold/30"
                      />
                      {addressFormErrors.line1 && (
                        <p className="text-[10px] text-rose-600 mt-0.5">{addressFormErrors.line1}</p>
                      )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-ink/70 mb-1">
                          Area / Colony (Optional)
                        </label>
                        <input
                          type="text"
                          value={addressFormData.line2}
                          onChange={(e) => setAddressFormData((p) => ({ ...p, line2: e.target.value }))}
                          placeholder="Colony, Sector"
                          className="w-full rounded-xl border border-ink/15 bg-white p-2.5 text-xs text-ink outline-none focus:border-gold-deep"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-ink/70 mb-1">
                          Landmark (Optional)
                        </label>
                        <input
                          type="text"
                          value={addressFormData.landmark}
                          onChange={(e) => setAddressFormData((p) => ({ ...p, landmark: e.target.value }))}
                          placeholder="Near temple, metro, etc."
                          className="w-full rounded-xl border border-ink/15 bg-white p-2.5 text-xs text-ink outline-none focus:border-gold-deep"
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-ink/70 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          required
                          value={addressFormData.city}
                          onChange={(e) => setAddressFormData((p) => ({ ...p, city: e.target.value }))}
                          placeholder="e.g. Alwar / Jaipur"
                          className="w-full rounded-xl border border-ink/15 bg-white p-2.5 text-xs text-ink outline-none focus:border-gold-deep"
                        />
                        {addressFormErrors.city && (
                          <p className="text-[10px] text-rose-600 mt-0.5">{addressFormErrors.city}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-ink/70 mb-1">
                          State *
                        </label>
                        <select
                          value={addressFormData.state}
                          onChange={(e) => setAddressFormData((p) => ({ ...p, state: e.target.value }))}
                          className="w-full rounded-xl border border-ink/15 bg-white p-2.5 text-xs text-ink outline-none focus:border-gold-deep"
                        >
                          {INDIAN_STATES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-ink/70 mb-1">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          required
                          value={addressFormData.pincode}
                          onChange={(e) => setAddressFormData((p) => ({ ...p, pincode: e.target.value }))}
                          placeholder="6-digit PIN"
                          className="w-full rounded-xl border border-ink/15 bg-white p-2.5 text-xs text-ink outline-none focus:border-gold-deep"
                        />
                        {addressFormErrors.pincode && (
                          <p className="text-[10px] text-rose-600 mt-0.5">{addressFormErrors.pincode}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="rounded-xl px-4 py-2 text-xs font-semibold text-ink/60 hover:bg-ink/5"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={addressFormSaving}
                        className="flex items-center gap-1.5 rounded-xl bg-pine-900 px-5 py-2 text-xs font-semibold text-cream hover:bg-pine-950 disabled:opacity-50"
                      >
                        {addressFormSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                        <span>Save & Use Address</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Saved Address Cards */}
                <div className="space-y-3">
                  {addresses.length === 0 && !showAddressForm && (
                    <div className="rounded-2xl border border-dashed border-ink/20 p-8 text-center space-y-2">
                      <MapPin className="mx-auto h-7 w-7 text-gold-deep" />
                      <p className="text-xs font-semibold text-pine-950">No saved addresses found</p>
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(true)}
                        className="rounded-full bg-pine-900 px-4 py-2 text-xs font-semibold text-cream"
                      >
                        Add Delivery Address
                      </button>
                    </div>
                  )}

                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                          isSelected
                            ? "border-gold-deep bg-gold/10 ring-2 ring-gold-deep/20 shadow-xs"
                            : "border-ink/10 bg-white/90 hover:border-gold/40 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="selectedAddress"
                              checked={isSelected}
                              onChange={() => setSelectedAddressId(addr.id)}
                              className="mt-1 h-4 w-4 accent-emerald-700"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-pine-950 text-sm">
                                  {addr.name || addr.fullName}
                                </p>
                                {addr.isDefault && (
                                  <span className="rounded-md bg-gold/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gold-deep">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-ink/75 mt-1">
                                {addr.line1}
                                {addr.line2 ? `, ${addr.line2}` : ""}
                                {addr.landmark ? `, Near ${addr.landmark}` : ""}
                              </p>
                              <p className="text-xs text-ink/75">
                                {addr.city}, {addr.state} —{" "}
                                <strong className="text-pine-950">{addr.postalCode || addr.pincode}</strong>
                              </p>
                              <p className="text-[11px] text-ink/50 mt-1 flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                +91 {addr.phone}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between border-t border-ink/8 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-ink/60 hover:text-pine-950"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Cart</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleProceedToCreateOrder}
                    disabled={!selectedAddressId || checkoutSubmitting}
                    className="flex items-center gap-2 rounded-2xl bg-pine-900 px-6 py-3 text-xs font-semibold text-cream shadow-md transition-all hover:bg-pine-950 hover:shadow-lg disabled:opacity-40"
                  >
                    {checkoutSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Creating Order…</span>
                      </>
                    ) : (
                      <>
                        <span>Place Order & Pay</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Server-Calculated Order Summary */}
          <div className="xl:col-span-5 space-y-6 xl:sticky xl:top-28">
            <div className="rounded-3xl border border-gold/30 bg-gradient-to-b from-white via-cream-paper/85 to-cream-paper p-6 sm:p-7 shadow-sm space-y-5">
              <div className="border-b border-ink/8 pb-4">
                <h3 className="font-display text-lg font-bold text-pine-950">
                  Server Order Summary
                </h3>
                <p className="text-xs text-ink/60">
                  Values verified directly via <code className="text-[10px] bg-ink/5 px-1 py-0.5 rounded">GET /api/v1/cart</code>
                </p>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2.5 text-xs text-ink/75">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-pine-950">{rupees(subtotalPaise)}</span>
                </div>

                {discountPaise > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Coupon Discount</span>
                    <span>-{rupees(discountPaise)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Standard Delivery</span>
                  <span>
                    {shippingPaise === 0 ? (
                      <strong className="text-emerald-700 font-bold uppercase tracking-wider text-[11px]">Free</strong>
                    ) : (
                      rupees(shippingPaise)
                    )}
                  </span>
                </div>

                {cartData?.gstIncludedPaise > 0 && (
                  <div className="flex justify-between text-[11px] text-ink/50">
                    <span>Estimated GST (5% Included)</span>
                    <span>{rupees(cartData.gstIncludedPaise)}</span>
                  </div>
                )}

                <div className="border-t border-ink/10 pt-3 flex items-center justify-between">
                  <div>
                    <span className="font-display text-base font-bold text-pine-950 block">
                      Total Payable
                    </span>
                    <span className="text-[10px] text-ink/40">Includes all applicable taxes</span>
                  </div>
                  <span className="font-display text-2xl font-bold text-gold-deep">
                    {rupees(totalPaise)}
                  </span>
                </div>
              </div>

              {/* Safety Badges */}
              <div className="space-y-2 rounded-2xl bg-white/70 border border-ink/8 p-3 text-[11px] text-ink/65">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>100% Secure Checkout via 256-bit Encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gold-deep flex-shrink-0" />
                  <span>Fresh wood-churned cold press directly from Alwar, Rajasthan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Payment Gateway Simulation */}
      {step === 3 && createdOrder && (
        <div className="mx-auto max-w-2xl rounded-3xl border border-gold/30 bg-gradient-to-b from-white via-cream-paper/90 to-cream-paper p-6 sm:p-10 shadow-lg space-y-6">
          <div className="text-center space-y-2 border-b border-ink/8 pb-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/20 text-gold-deep">
              <CreditCard className="h-7 w-7" />
            </div>
            <h2 className="font-display text-2xl font-bold text-pine-950">
              Payment Gateway
            </h2>
            <p className="text-xs text-ink/60">
              Order <strong className="text-pine-950">#{createdOrder.orderNumber || createdOrder.id}</strong> has been created on the server!
            </p>
          </div>

          {/* Amount Badge */}
          <div className="flex items-center justify-between rounded-2xl border border-gold/25 bg-gold/10 p-4">
            <div>
              <p className="text-xs font-semibold text-pine-950">Amount Payable</p>
              <p className="text-[11px] text-ink/60">Server-calculated total</p>
            </div>
            <p className="font-display text-2xl font-bold text-gold-deep">
              {rupees(createdOrder.totalPaise || totalPaise)}
            </p>
          </div>

          {/* Simulated Mode Info */}
          <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-xs text-sky-900 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-sky-950">
              <Sparkles className="h-4 w-4 text-sky-600 flex-shrink-0" />
              <span>Simulated Payment Gateway Active</span>
            </div>
            <p className="text-sky-800/80">
              This environment uses simulated payment endpoints (<code className="text-[10px] bg-sky-100 px-1 py-0.5 rounded">POST /api/v1/payments/simulate/:orderId</code>) so you can test complete end-to-end checkout.
            </p>
          </div>

          {paymentError && (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600" />
              <span>{paymentError}</span>
            </div>
          )}

          {/* Payment Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => handleSimulatePayment("success")}
              disabled={paymentSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-700 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-emerald-800 hover:scale-[1.01] disabled:opacity-50"
            >
              {paymentSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Authorizing Payment…</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Simulate Payment Success (Pay {rupees(createdOrder.totalPaise || totalPaise)})</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSimulatePayment("failure")}
              disabled={paymentSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white py-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-all disabled:opacity-50"
            >
              <span>Test Failure Simulation</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Order Confirmed Screen */}
      {step === 4 && createdOrder && (
        <div className="mx-auto max-w-2xl rounded-3xl border border-emerald-300/80 bg-gradient-to-b from-white via-cream-paper to-white p-6 sm:p-10 shadow-xl text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm animate-bounce">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div className="space-y-1.5">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Payment Successful & Confirmed
            </span>
            <h2 className="font-display text-3xl font-bold text-pine-950 mt-2">
              Thank You for Your Order!
            </h2>
            <p className="text-xs text-ink/65">
              Order <strong className="text-pine-950">#{createdOrder.orderNumber || createdOrder.id}</strong> has been confirmed and forwarded to our cold-press mill in Rajasthan.
            </p>
          </div>

          {/* Order Details Card */}
          <div className="rounded-2xl border border-ink/8 bg-white/90 p-5 text-left text-xs space-y-2.5">
            <div className="flex justify-between border-b border-ink/6 pb-2">
              <span className="text-ink/50">Order Number</span>
              <span className="font-bold text-pine-950">#{createdOrder.orderNumber || createdOrder.id}</span>
            </div>
            <div className="flex justify-between border-b border-ink/6 pb-2">
              <span className="text-ink/50">Amount Paid</span>
              <span className="font-bold text-emerald-700">{rupees(createdOrder.totalPaise || totalPaise)}</span>
            </div>
            <div className="flex justify-between border-b border-ink/6 pb-2">
              <span className="text-ink/50">Payment Method</span>
              <span className="font-semibold text-pine-950">Online Payment (Settled)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/50">Order Status</span>
              <span className="font-bold text-emerald-700 uppercase tracking-wide">
                {createdOrder.status || "PAID"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid gap-3 sm:grid-cols-2 pt-2">
            <button
              type="button"
              onClick={handleDownloadInvoice}
              disabled={invoiceDownloading}
              className="flex items-center justify-center gap-2 rounded-2xl border border-gold/30 bg-white py-3 text-xs font-semibold text-pine-900 shadow-xs hover:bg-gold/10 transition-all disabled:opacity-50"
            >
              {invoiceDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin text-gold-deep" />
              ) : (
                <FileDown className="h-4 w-4 text-gold-deep" />
              )}
              <span>Download Tax Invoice (PDF)</span>
            </button>

            <Link
              href="/account"
              className="flex items-center justify-center gap-2 rounded-2xl bg-pine-900 py-3 text-xs font-semibold text-cream shadow-md hover:bg-pine-950 transition-all"
            >
              <Package className="h-4 w-4" />
              <span>Track in My Orders</span>
            </Link>
          </div>

            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-deep hover:underline"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}
        </main>
      </div>
    </div>
  );
}
