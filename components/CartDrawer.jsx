"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { rupees, formatApiError } from "@/lib/api";
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Tag,
  ArrowRight,
  Truck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

export default function CartDrawer() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const {
    cart,
    itemCount,
    loading,
    actionLoadingId,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [drawerError, setDrawerError] = useState("");
  const [itemErrors, setItemErrors] = useState({});
  const [itemMaxStock, setItemMaxStock] = useState({});

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        closeCart();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeCart]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleUpdateQuantity = async (itemId, qty) => {
    const maxAvailable = itemMaxStock[itemId];
    if (maxAvailable !== undefined && qty > maxAvailable) {
      const msg = `Only ${maxAvailable} left in stock`;
      setDrawerError(msg);
      setItemErrors((prev) => ({ ...prev, [itemId]: msg }));
      return;
    }

    setItemErrors((prev) => {
      const copy = { ...prev };
      delete copy[itemId];
      return copy;
    });
    setDrawerError("");

    try {
      await updateQuantity(itemId, qty);
    } catch (err) {
      const errMsg = formatApiError(err);
      setDrawerError(errMsg);
      setItemErrors((prev) => ({ ...prev, [itemId]: errMsg }));
      const avail = err?.details?.available ?? err?.error?.details?.available;
      if (avail !== undefined) {
        setItemMaxStock((prev) => ({ ...prev, [itemId]: avail }));
      }
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeItem(itemId);
      setItemErrors((prev) => {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      });
      setDrawerError("");
    } catch (err) {
      setDrawerError(formatApiError(err));
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    setCouponSuccess("");
    try {
      await applyCoupon(couponCode.trim());
      setCouponSuccess(`Coupon ${couponCode.toUpperCase()} applied!`);
      setCouponCode("");
      setTimeout(() => setCouponSuccess(""), 4000);
    } catch (err) {
      setCouponError(formatApiError(err));
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    setCouponLoading(true);
    try {
      await removeCoupon();
      setCouponSuccess("Coupon removed.");
      setTimeout(() => setCouponSuccess(""), 3000);
    } catch (err) {
      setCouponError(formatApiError(err));
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCheckoutClick = () => {
    if (cart?.canCheckout === false || (Array.isArray(cart?.issues) && cart.issues.length > 0)) {
      const firstIssue = cart?.issues?.[0]?.message || (typeof cart?.issues?.[0] === "string" ? cart?.issues?.[0] : null) || "Some items exceed available stock. Please adjust quantities before checkout.";
      setDrawerError(firstIssue);
      return;
    }
    closeCart();
    if (isAuthenticated) {
      router.push("/checkout");
    } else {
      router.push("/login?redirect=/checkout");
    }
  };

  const items = cart?.items || [];
  const subtotalPaise = cart?.subtotalPaise || 0;
  const discountPaise = cart?.discountPaise || 0;
  const shippingPaise = cart?.shippingPaise || 0;
  const totalPaise = cart?.totalPaise || 0;
  const freeShippingThreshold = 100000; // ₹1,000 in paise
  const progressPercent = Math.min(100, Math.round((subtotalPaise / freeShippingThreshold) * 100));
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotalPaise);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 z-50 bg-pine-950/60 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <div
        data-lenis-prevent
        className={`fixed inset-y-0 right-0 z-[60] flex h-full max-h-screen w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-out sm:border-l sm:border-ink/10 ${
          isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex-shrink-0 flex items-center justify-between border-b border-ink/10 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-pine-900" />
            <h2 className="font-display text-lg font-bold text-pine-900">
              Shopping Bag
            </h2>
            {itemCount > 0 && (
              <span className="rounded-full bg-gold/20 px-2 py-0.5 text-xs font-bold text-gold-deep">
                {itemCount}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={closeCart}
            className="rounded-full p-1.5 text-ink/40 hover:bg-ink/5 hover:text-ink transition-colors"
            aria-label="Close cart drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free Delivery Goal Tracker */}
        {itemCount > 0 && (
          <div className="flex-shrink-0 border-b border-ink/10 bg-cream/70 px-5 py-3 sm:px-6">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-1.5 text-pine-900">
                <Truck className="h-3.5 w-3.5 text-gold-deep" />
                {remainingForFreeShipping > 0 ? (
                  <span>
                    Add <strong className="text-gold-deep">{rupees(remainingForFreeShipping)}</strong> more for <strong className="text-emerald-700">Free Delivery</strong>
                  </span>
                ) : (
                  <span className="text-emerald-700 font-bold">
                    🎉 You have unlocked Free Delivery!
                  </span>
                )}
              </span>
              <span className="text-[10px] text-ink/50">{progressPercent}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
              <div
                className="h-full rounded-full bg-gold-deep transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Messages / Alerts */}
        {couponSuccess && (
          <div className="flex-shrink-0 mx-5 mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800 flex items-center gap-2 sm:mx-6">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span>{couponSuccess}</span>
          </div>
        )}

        {couponError && (
          <div className="flex-shrink-0 mx-5 mt-3 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800 flex items-center gap-2 sm:mx-6">
            <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
            <span>{couponError}</span>
          </div>
        )}

        {/* Inventory / Drawer Error Alert Banner */}
        {drawerError && (
          <div className="flex-shrink-0 mx-5 mt-3 rounded-2xl border border-rose-300 bg-rose-50/95 p-3 text-xs text-rose-900 shadow-sm flex items-start gap-2.5 sm:mx-6 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-rose-950">Inventory Notice</p>
              <p className="text-rose-800 text-[11px] mt-0.5 font-medium">{drawerError}</p>
            </div>
            <button
              type="button"
              onClick={() => setDrawerError("")}
              className="text-rose-400 hover:text-rose-700 transition-colors p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Server Cart Issues (e.g. from GET /cart issues) */}
        {Array.isArray(cart?.issues) && cart.issues.length > 0 && !drawerError && (
          <div className="flex-shrink-0 mx-5 mt-3 rounded-2xl border border-amber-300 bg-amber-50/95 p-3 text-xs text-amber-900 shadow-sm sm:mx-6 space-y-1 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
              <span>Stock Issue Detected</span>
            </div>
            <ul className="list-disc list-inside text-[11px] text-amber-800 font-medium space-y-0.5">
              {cart.issues.map((iss, i) => (
                <li key={i}>{typeof iss === "string" ? iss : iss.message || "Stock limited"}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Cart Items List */}
        <div
          data-lenis-prevent
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-4 divide-y divide-ink/10 sm:px-6 cart-drawer-scroll"
        >
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cream-paper border border-ink/10 text-ink/30 mb-4 shadow-inner">
                <ShoppingBag className="h-8 w-8 text-gold-deep" />
              </div>
              <p className="font-display text-lg font-semibold text-pine-900">
                Your bag is empty
              </p>
              <p className="mt-1 text-xs text-ink/60 max-w-xs">
                Explore our pure cold-pressed mustard oils, freshly pressed in small batches.
              </p>
              <button
                type="button"
                onClick={() => {
                  closeCart();
                  router.push("/products");
                }}
                className="mt-6 rounded-full bg-pine-800 px-6 py-2.5 text-xs font-semibold text-cream hover:bg-pine-900 shadow-sm transition-all hover:scale-[1.02]"
              >
                Browse Products
              </button>
            </div>
          ) : (
            items.map((item) => {
              const itemId = item.itemId || item.id;
              const isItemBusy = actionLoadingId === itemId;
              const unitPrice = item.unitPrice || (item.unitPricePaise ? item.unitPricePaise / 100 : 0);
              const lineTotal = item.lineTotalPaise
                ? item.lineTotalPaise / 100
                : unitPrice * item.quantity;

              const isYellow =
                item.productName?.toLowerCase().includes("yellow") ||
                item.productSlug?.includes("yellow");
              const defaultImage = isYellow
                ? "/images/yellowmustard.png"
                : "/images/blackmustard.png";
              const imgSrc = item.image || defaultImage;

              return (
                <div key={itemId} className="flex gap-4 py-4">
                  {/* Thumbnail */}
                  <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-ink/10 bg-cream-paper p-1">
                    <SafeImage
                      src={imgSrc}
                      alt={item.productName || "Product"}
                      fallbackHint={item.productName || item.productSlug || ""}
                      fill
                      className="object-contain p-1"
                      sizes="64px"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-display text-sm font-bold text-pine-900 leading-tight">
                          {item.productName}
                        </h4>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(itemId)}
                          disabled={isItemBusy}
                          className="text-ink/30 hover:text-rose-600 transition-colors p-1 disabled:opacity-40"
                          title="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[11px] text-ink/60">
                          Pack: <span className="font-semibold text-slate-800">{item.variantLabel || item.sku}</span>
                        </p>
                        {itemMaxStock[itemId] !== undefined && item.quantity >= itemMaxStock[itemId] && (
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">
                            Max in stock
                          </span>
                        )}
                      </div>
                      {item.sku && (
                        <p className="font-mono text-[9px] text-ink/40">SKU: {item.sku}</p>
                      )}

                      {/* Inline Item Stock Error / Warning */}
                      {itemErrors[itemId] && (
                        <div className="mt-1.5 flex items-center gap-1.5 rounded-lg bg-rose-50 border border-rose-200/90 px-2.5 py-1 text-[11px] font-semibold text-rose-700 animate-in fade-in">
                          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 text-rose-600" />
                          <span>{itemErrors[itemId]}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-2.5 flex items-center justify-between">
                      {/* Quantity Stepper */}
                      <div className="flex items-center rounded-lg border border-ink/15 bg-cream/50 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(itemId, item.quantity - 1)}
                          disabled={isItemBusy}
                          className="flex h-7 w-7 items-center justify-center text-ink/70 hover:bg-cream hover:text-ink disabled:opacity-40"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-pine-950">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(itemId, item.quantity + 1)}
                          disabled={isItemBusy || (itemMaxStock[itemId] !== undefined && item.quantity >= itemMaxStock[itemId])}
                          className="flex h-7 w-7 items-center justify-center text-ink/70 hover:bg-cream hover:text-ink disabled:opacity-40"
                          title={itemMaxStock[itemId] !== undefined && item.quantity >= itemMaxStock[itemId] ? `Maximum available in stock: ${itemMaxStock[itemId]}` : "Increase quantity"}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <span className="font-display text-sm font-bold text-pine-900">
                          ₹{lineTotal}
                        </span>
                        {item.quantity > 1 && (
                          <p className="text-[10px] text-ink/40">₹{unitPrice} each</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer & Order Summary */}
        {items.length > 0 && (
          <div className="flex-shrink-0 border-t border-ink/10 bg-cream/40 p-5 space-y-4 sm:p-6">
            {/* Coupon Promo Row */}
            {cart?.coupon ? (
              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                  <Tag className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Coupon: {cart.coupon.code}</span>
                  <span className="text-emerald-700">(-{rupees(discountPaise)})</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  disabled={couponLoading}
                  className="text-[11px] font-bold text-rose-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink/40" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon (e.g. FLAT50)"
                    className="w-full rounded-xl border border-ink/20 bg-white py-1.5 pl-8 pr-3 text-xs text-ink/80 outline-none uppercase placeholder:normal-case focus:border-gold-deep"
                  />
                </div>
                <button
                  type="submit"
                  disabled={couponLoading || !couponCode.trim()}
                  className="rounded-xl bg-pine-900 px-4 py-1.5 text-xs font-semibold text-cream hover:bg-pine-800 transition-colors disabled:opacity-40"
                >
                  Apply
                </button>
              </form>
            )}

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs text-ink/70">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-pine-950">{rupees(subtotalPaise)}</span>
              </div>

              {discountPaise > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Discount</span>
                  <span>-{rupees(discountPaise)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Standard Delivery</span>
                <span>
                  {shippingPaise === 0 ? (
                    <strong className="text-emerald-700 uppercase tracking-wider text-[11px]">Free</strong>
                  ) : (
                    rupees(shippingPaise)
                  )}
                </span>
              </div>

              {cart?.gstIncludedPaise > 0 && (
                <div className="flex justify-between text-[11px] text-ink/45">
                  <span>Estimated GST (5% Included)</span>
                  <span>{rupees(cart.gstIncludedPaise)}</span>
                </div>
              )}

              <div className="border-t border-ink/10 pt-2 flex justify-between font-display text-base font-bold text-pine-900">
                <span>Total Amount</span>
                <span className="text-gold-deep text-lg">{rupees(totalPaise)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleCheckoutClick}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-pine-800 py-3 text-sm font-semibold text-cream shadow-md transition-all hover:bg-pine-900 hover:scale-[1.01]"
              >
                <span>{isAuthenticated ? "Proceed to Checkout" : "Sign In & Checkout"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="flex items-center justify-between px-1 text-[11px]">
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-ink/40 hover:text-rose-600 transition-colors"
                >
                  Empty bag
                </button>
                <span className="text-ink/40">100% Secure Checkout</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
