"use client";

import { useState } from "react";
import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import { useWishlist } from "@/context/WishlistContext";
import { rupees } from "@/lib/api";
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Loader2,
  Package,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export default function UserWishlist() {
  const { items, count, loading, removeFromWishlist, moveToCart } = useWishlist();
  const [movingId, setMovingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState({});

  const handleMoveToCart = async (item) => {
    const productId = item.productId || item.product?.id || item.id;
    const variants = item.product?.variants || item.variants || [];
    const variantId =
      selectedVariants[productId] ||
      item.variantId ||
      variants[0]?.id ||
      variants[0]?.sku ||
      item.product?.skuBase ||
      productId;

    setMovingId(productId);
    try {
      await moveToCart(productId, variantId, 1);
    } catch (_) {
      // Toast shown in context
    } finally {
      setMovingId(null);
    }
  };

  const handleRemove = async (productId) => {
    setRemovingId(productId);
    try {
      await removeFromWishlist(productId);
    } catch (_) {
      // Toast shown in context
    } finally {
      setRemovingId(null);
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-ink/10 bg-white/60 p-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold-deep" />
        <p className="mt-3 text-sm text-ink/60">Loading your wishlist…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-ink/10 bg-white/60 p-12 text-center shadow-xs">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500 border border-rose-200">
          <Heart className="h-8 w-8" />
        </div>
        <h3 className="mt-4 font-display text-xl font-bold text-pine-950">
          Your Wishlist is Empty
        </h3>
        <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-ink/60">
          Save your favourite cold-pressed mustard oils here and order whenever you are ready.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-pine-900 px-5 py-3 text-xs font-semibold text-cream shadow-sm transition-all hover:bg-pine-800 hover:scale-[1.02]"
        >
          <span>Explore Products</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between rounded-2xl border border-ink/10 bg-white/80 px-5 py-3.5 shadow-xs">
        <div className="flex items-center gap-2.5">
          <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
          <h2 className="text-sm font-bold text-pine-950">Saved Items ({count})</h2>
        </div>
        <p className="text-xs text-ink/50 hidden sm:block">
          Move items to cart when you are ready to checkout
        </p>
      </div>

      {/* Grid of Wishlist Items */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const productId = item.productId || item.product?.id || item.id;
          const product = item.product || item;
          const name = product.name || "Cold Pressed Mustard Oil";
          const slug = product.slug || (typeof productId === "string" && !productId.includes("-") ? productId : "black-mustard-oil-1l");
          const image = product.image || product.images?.[0]?.url || "/images/blackmustard.png";
          const variants = product.variants || [];

          const pricePaise = product.pricePaise || (product.price ? product.price * 100 : 26500);
          const mrpPaise = product.mrpPaise || (product.mrp ? product.mrp * 100 : pricePaise);
          const hasDiscount = mrpPaise > pricePaise;

          const isMoving = movingId === productId;
          const isRemoving = removingId === productId;

          return (
            <div
              key={productId}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-ink/10 bg-white p-4 shadow-sm transition-all duration-300 hover:border-gold/50 hover:shadow-md"
            >
              {/* Top Row: Image & Remove Button */}
              <div>
                <div className="relative flex h-48 w-full items-center justify-center rounded-2xl bg-pine-950/5 p-4 overflow-hidden">
                  <SafeImage
                    src={image}
                    alt={name}
                    fill
                    className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                    sizes="200px"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemove(productId)}
                    disabled={isRemoving}
                    title="Remove from wishlist"
                    className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink/40 shadow-xs backdrop-blur-xs transition-all hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                  >
                    {isRemoving ? (
                      <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Details */}
                <div className="mt-4">
                  <Link
                    href={`/products/${slug}`}
                    className="group-hover:text-gold-deep transition-colors"
                  >
                    <h3 className="line-clamp-1 font-display text-base font-bold text-pine-950">
                      {name}
                    </h3>
                  </Link>

                  {/* Price Row */}
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-display text-lg font-bold text-pine-900">
                      {rupees(pricePaise)}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-ink/40 line-through">
                        {rupees(mrpPaise)}
                      </span>
                    )}
                  </div>

                  {/* Variant selector if multiple variants exist */}
                  {variants.length > 1 && (
                    <div className="mt-3">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-ink/45 block mb-1">
                        Select Pack
                      </label>
                      <select
                        value={selectedVariants[productId] || variants[0]?.id}
                        onChange={(e) =>
                          setSelectedVariants((prev) => ({
                            ...prev,
                            [productId]: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-ink/20 bg-cream-paper px-2.5 py-1.5 text-xs text-ink focus:border-pine-800 focus:outline-none"
                      >
                        {variants.map((v) => (
                          <option key={v.id || v.sku} value={v.id || v.sku}>
                            {v.label || v.sku} — {rupees(v.pricePaise || v.price * 100)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex items-center gap-2 pt-3 border-t border-ink/8">
                <button
                  type="button"
                  onClick={() => handleMoveToCart(item)}
                  disabled={isMoving || isRemoving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-pine-900 py-2.5 text-xs font-semibold text-cream shadow-xs transition-all hover:bg-pine-800 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {isMoving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Moving…</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-3.5 w-3.5" />
                      <span>Move to Cart</span>
                    </>
                  )}
                </button>

                <Link
                  href={`/products/${slug}`}
                  title="View product"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-ink/15 text-ink/60 hover:border-gold hover:text-pine-900 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
