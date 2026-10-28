"use client";

import { useEffect, useState, useCallback } from "react";
import { usePricingMode } from "@/context/PricingModeContext";
import { useCart } from "@/context/CartContext";
import PricingModeSwitch from "@/components/PricingModeSwitch";
import { shop, wishlist as wishlistApi, formatApiError } from "@/lib/api";
import { useProductVariant } from "@/context/ProductVariantContext";
import { ShoppingBag, Check, Loader2, AlertTriangle, Heart, Shield, RotateCcw, BadgeCheck } from "lucide-react";
import Link from "next/link";

/* ------------------------------------------------------------------
   Add to Cart button with idle / loading / done states
   ------------------------------------------------------------------ */
function AddToBagButton({ onClick, loading, done, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading || done}
      className={`
        group relative flex flex-1 items-center justify-center gap-2.5 overflow-hidden rounded-2xl
        py-4 text-sm font-bold tracking-wide shadow-sm transition-all duration-300
        ${done
          ? "bg-emerald-600 text-white"
          : disabled
          ? "cursor-not-allowed bg-ink/10 text-ink/40"
          : "bg-pine-900 text-cream hover:bg-pine-800 hover:shadow-[0_8px_28px_-6px_rgba(20,40,25,0.4)] hover:scale-[1.01] active:scale-[0.99]"
        }
      `}
    >
      {!done && !disabled && (
        <span className="absolute inset-0 translate-x-[-100%] skew-x-[-12deg] bg-white/10 transition-transform duration-500 group-hover:translate-x-[110%]" />
      )}
      {loading ? (
        <><Loader2 className="h-4 w-4 animate-spin" /><span>Adding...</span></>
      ) : done ? (
        <><Check className="h-4 w-4 stroke-[2.5]" /><span>Added to Bag!</span></>
      ) : (
        <><ShoppingBag className="h-4 w-4" /><span>{disabled ? "Out of Stock" : "Add to Bag"}</span></>
      )}
    </button>
  );
}

import { useWishlist } from "@/context/WishlistContext";

/* ------------------------------------------------------------------
   Wishlist button – animated heart (Uiverse.io style)
   ------------------------------------------------------------------ */
function WishlistButton({ productId, productName, productMeta }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [wLoading, setWLoading] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const wishlisted = isInWishlist(productId);

  const toggle = useCallback(async () => {
    setWLoading(true);
    try {
      await toggleWishlist(productId, { name: productName, ...productMeta });
      setAnimKey((k) => k + 1); // re-trigger CSS animation
    } catch {
      // toast shown in context
    } finally {
      setWLoading(false);
    }
  }, [toggleWishlist, productId, productName, productMeta]);

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={wLoading}
      title={wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
      aria-label={wishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
      className={`heart-btn ${wishlisted ? "wishlisted" : ""}`}
    >
      {wLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-rose-500" />
      ) : (
        <div className="heart-svg-wrap" key={animKey}>
          {/* Outline heart */}
          <svg viewBox="0 0 24 24" className="heart-outline" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Zm-3.585,18.4a2.973,2.973,0,0,1-3.83,0C4.947,16.006,2,11.87,2,8.967a4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,11,8.967a1,1,0,0,0,2,0,4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,22,8.967C22,11.87,19.053,16.006,13.915,20.313Z" />
          </svg>
          {/* Filled heart */}
          <svg viewBox="0 0 24 24" className="heart-filled" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Z" />
          </svg>
          {/* Celebration particles */}
          <svg className="heart-celebrate" width="100" height="100" xmlns="http://www.w3.org/2000/svg">
            <polygon points="10,10 20,20" />
            <polygon points="10,50 20,50" />
            <polygon points="20,80 30,70" />
            <polygon points="90,10 80,20" />
            <polygon points="90,50 80,50" />
            <polygon points="80,80 70,70" />
          </svg>
        </div>
      )}
    </button>
  );
}


/* ------------------------------------------------------------------
   Main Buy Panel
   ------------------------------------------------------------------ */
export default function ProductPricingSection({ product, otherSizes = [] }) {
  const { isDynamic } = usePricingMode();
  const { addItem } = useCart();
  const productVariantContext = useProductVariant();

  const [dynamicProduct, setDynamicProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [addState, setAddState] = useState("idle");
  const [addError, setAddError] = useState("");

  useEffect(() => {
    let active = true;
    if (isDynamic) {
      setLoading(true);
      setApiError("");
      shop.product(product.slug)
        .then((res) => {
          if (!active) return;
          const p = res?.product || res;
          if (p?.variants?.length > 0) {
            setDynamicProduct(p);
            setSelectedVariant(p.variants[0]);
          } else {
            shop.products({ page: 1, pageSize: 5 }).then((catalog) => {
              if (!active) return;
              const first = catalog?.items?.[0];
              if (first?.variants?.length) {
                setDynamicProduct(first);
                setSelectedVariant(first.variants[0]);
              }
            });
          }
        })
        .catch(() => { if (active) setApiError("Live pricing unavailable - showing catalogue price"); })
        .finally(() => { if (active) setLoading(false); });
    }
    return () => { active = false; };
  }, [isDynamic, product.slug]);

  useEffect(() => { setAddState("idle"); setAddError(""); }, [selectedVariant, isDynamic]);

  useEffect(() => {
    productVariantContext?.setSelection({
      product: isDynamic ? dynamicProduct : null,
      variant: isDynamic ? selectedVariant : null,
    });
  }, [dynamicProduct, selectedVariant, isDynamic]);

  const activePrice = selectedVariant
    ? selectedVariant.price ?? (selectedVariant.pricePaise / 100)
    : product.mrp;
  const activeMrp = selectedVariant
    ? selectedVariant.mrp ?? (selectedVariant.mrpPaise / 100)
    : product.mrp;
  const hasDiscount = isDynamic && activeMrp > activePrice;
  const discountPct = hasDiscount ? Math.round(((activeMrp - activePrice) / activeMrp) * 100) : 0;
  const isInStock = !isDynamic || selectedVariant?.inStock !== false;
  const isAddLoading = addState === "loading";
  const isAddDone = addState === "done";

  const handleAddDynamic = useCallback(async () => {
    if (!selectedVariant?.id) return;
    setAddState("loading"); setAddError("");
    try {
      await addItem(selectedVariant.id, 1, {
        productName: dynamicProduct?.name || product.variantData?.name,
        productSlug: dynamicProduct?.slug || product.slug,
        variantLabel: selectedVariant.label || selectedVariant.sku,
        sku: selectedVariant.sku,
        image: dynamicProduct?.images?.[0]?.url || product.image,
        pricePaise: selectedVariant.pricePaise ?? (activePrice * 100),
        mrpPaise: selectedVariant.mrpPaise ?? (activeMrp * 100),
      });
      setAddState("done");
      setTimeout(() => setAddState("idle"), 2500);
    } catch (err) {
      setAddState("error");
      setAddError(formatApiError(err) || "Could not add to bag.");
      setTimeout(() => setAddState("idle"), 3500);
    }
  }, [selectedVariant, dynamicProduct, product, addItem, activePrice, activeMrp]);

  const handleAddStatic = useCallback(async () => {
    const guestVariantId = product.skuBase || product.slug;
    setAddState("loading"); setAddError("");
    try {
      await addItem(guestVariantId, 1, {
        productName: product.variantData?.name || "Cold Pressed Mustard Oil",
        productSlug: product.slug,
        variantLabel: `${product.size} ${product.stockUnit}`,
        sku: product.skuBase,
        image: product.image,
        pricePaise: product.mrp * 100,
        mrpPaise: product.mrp * 100,
      });
      setAddState("done");
      setTimeout(() => setAddState("idle"), 2500);
    } catch (err) {
      setAddState("error");
      setAddError(formatApiError(err) || "Could not add to bag.");
      setTimeout(() => setAddState("idle"), 3500);
    }
  }, [product, addItem]);

  return (
    <div className="space-y-5">
      {/* Price block */}
      <div>
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="font-display text-4xl font-bold text-pine-900">
            Rs.{activePrice}
          </span>
          {hasDiscount && (
            <>
              <span className="text-lg text-ink/40 line-through">Rs.{activeMrp}</span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                {discountPct}% OFF
              </span>
            </>
          )}
        </div>
        <p className="mt-1 text-xs text-ink/50">
          {isDynamic ? "Incl. GST - Live Backend Price" : "MRP - Inclusive of all taxes"}
        </p>
      </div>

      {/* Mode indicator + toggle */}
      <div className="flex items-center justify-between rounded-xl border border-ink/8 bg-cream-paper px-3 py-2">
        <span className="text-xs text-ink/50">
          {isDynamic ? "Live pricing active" : "Static catalogue"}
        </span>
        <PricingModeSwitch compact={true} />
      </div>

      {/* Dynamic API variant selector */}
      {isDynamic && dynamicProduct?.variants?.length > 1 && (
        <div>
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-ink/50">
            Select Variant / Pack
          </p>
          <div className="flex flex-wrap gap-2">
            {dynamicProduct.variants.map((v) => {
              const isSelected = selectedVariant?.id === v.id;
              const vPrice = v.price ?? (v.pricePaise / 100);
              return (
                <button
                  key={v.id || v.sku}
                  type="button"
                  onClick={() => setSelectedVariant(v)}
                  className={`flex flex-col items-center rounded-2xl border-2 px-4 py-2.5 text-xs font-medium transition-all ${
                    isSelected
                      ? "border-pine-800 bg-pine-800 text-cream shadow-md"
                      : "border-ink/15 bg-white text-ink/80 hover:border-pine-600"
                  }`}
                >
                  <span className="font-bold">{v.label || v.sku}</span>
                  <span className={isSelected ? "text-cream/80 text-[11px]" : "text-pine-800 font-semibold text-[11px]"}>Rs.{vPrice}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Static size pills - same flavour, different sizes */}
      {otherSizes.length > 0 && (
        <div>
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-ink/50">
            Select Pack Size
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="flex flex-col items-center rounded-2xl border-2 border-pine-800 bg-pine-800 px-4 py-2.5 text-xs font-medium text-cream shadow-md">
              <span className="font-bold">{product.size}</span>
              <span className="text-cream/80 text-[11px]">Rs.{product.mrp}</span>
            </span>
            {otherSizes.map((s) => (
              <Link
                key={s.slug}
                href={`/products/${s.slug}`}
                className="flex flex-col items-center rounded-2xl border-2 border-ink/15 bg-white px-4 py-2.5 text-xs font-medium text-ink/80 transition-all hover:border-pine-600 hover:text-pine-900"
              >
                <span className="font-bold">{s.size}</span>
                <span className="text-pine-800 font-semibold text-[11px]">Rs.{s.mrp}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Stock status */}
      {isDynamic && selectedVariant && (
        <div className="flex items-center gap-2 text-sm">
          <span className={`h-2 w-2 rounded-full ${isInStock ? "bg-emerald-500" : "bg-rose-500"}`} />
          <span className={`font-medium ${isInStock ? "text-emerald-700" : "text-rose-600"}`}>
            {isInStock ? "In Stock" : "Out of Stock"}
          </span>
          {selectedVariant.available != null && (
            <span className="text-xs text-ink/40">- {selectedVariant.available} units left</span>
          )}
        </div>
      )}

      {/* API error */}
      {apiError && isDynamic && (
        <p className="flex items-center gap-1.5 text-xs text-amber-700">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
          {apiError}
        </p>
      )}

      {/* ADD TO BAG + WISHLIST row */}
      <div className="flex gap-3">
        <AddToBagButton
          onClick={isDynamic ? handleAddDynamic : handleAddStatic}
          loading={isAddLoading}
          done={isAddDone}
          disabled={!isInStock}
        />
        <WishlistButton
          productId={isDynamic ? dynamicProduct?.id || product.slug : product.slug}
          productName={product.variantData?.name}
          productMeta={{
            slug: product.slug,
            image: product.image,
            mrp: product.mrp,
            price: activePrice,
            variants: dynamicProduct?.variants || [],
          }}
        />
      </div>

      {addState === "error" && addError && (
        <p className="flex items-center gap-1.5 text-xs text-rose-600">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
          {addError}
        </p>
      )}

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-2 border-t border-ink/10 pt-4">
        {[
          { icon: Shield, label: "Secure Payment", sub: "100% safe" },
          { icon: RotateCcw, label: "Easy Returns", sub: "7-day policy" },
          { icon: BadgeCheck, label: "FSSAI & NABL", sub: "Lab tested" },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex flex-col items-center gap-1 rounded-xl bg-cream-paper px-2 py-2.5 text-center">
            <Icon className="h-4 w-4 text-pine-800" />
            <span className="text-[10px] font-semibold text-ink/70 leading-tight">{label}</span>
            <span className="text-[10px] text-ink/40">{sub}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
