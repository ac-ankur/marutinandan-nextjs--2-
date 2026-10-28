"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import { useAuth } from "@/context/AuthContext";
import { reviews, shop, orders as ordersApi, formatApiError } from "@/lib/api";
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Trash2,
  X,
  MessageSquare,
  Sparkles,
  Package,
  ArrowRight,
  ExternalLink,
  Loader2,
  ShoppingBag,
} from "lucide-react";

export default function UserReviews() {
  const { user, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [myReviews, setMyReviews] = useState([]);
  const [awaitingReview, setAwaitingReview] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState("reviews"); // "reviews" | "awaiting"

  // Edit / Write Modal state
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: "edit", // "edit" | "write"
    reviewId: null,
    productSlug: "",
    productName: "",
    productImage: "",
    rating: 5,
    title: "",
    body: "",
  });
  const [formHoverRating, setFormHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Toast notification
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  /* ------------------------------------------------------------------ */
  /* Fetch User Reviews & Products Awaiting Review                      */
  /* ------------------------------------------------------------------ */
  const loadUserReviewsData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);

    try {
      // 1. Fetch store catalog to know candidate products
      let catalogProducts = [];
      try {
        const catRes = await shop.products({ pageSize: 50 });
        catalogProducts = catRes?.items || catRes?.products || [];
      } catch (_) {}

      // Fallback defaults if catalog API is empty
      if (catalogProducts.length === 0) {
        catalogProducts = [
          {
            slug: "black-mustard-oil",
            name: "Black Mustard Oil",
            images: [{ url: "/images/1l_black_mustard_front.png" }],
          },
          {
            slug: "yellow-mustard-oil",
            name: "Yellow Mustard Oil",
            images: [{ url: "/images/1l_yellow_mustard_front.png" }],
          },
        ];
      }

      // Also check user's orders to catch any specific slugs
      try {
        const userOrdersRes = await ordersApi.list(1, 20);
        const orderItems = (userOrdersRes?.items || userOrdersRes?.orders || []).flatMap(
          (o) => o.items || []
        );
        for (const item of orderItems) {
          const itemSlug = item.productSlug || item.slug;
          if (itemSlug && !catalogProducts.some((p) => p.slug === itemSlug)) {
            catalogProducts.push({
              slug: itemSlug,
              name: item.productName || "Cold Pressed Mustard Oil",
              images: [{ url: item.image || "/images/1l_black_mustard_front.png" }],
            });
          }
        }
      } catch (_) {}

      // 2. Query eligibility for each product to collect myReview & canReview
      const collectedReviews = [];
      const collectedAwaiting = [];

      for (const prod of catalogProducts) {
        try {
          const elig = await reviews.eligibility(prod.slug);
          if (elig?.alreadyReviewed && elig?.myReview) {
            collectedReviews.push({
              ...elig.myReview,
              product: prod,
            });
          } else if (elig?.canReview) {
            collectedAwaiting.push(prod);
          }
        } catch (_) {}
      }

      setMyReviews(collectedReviews);
      setAwaitingReview(collectedAwaiting);
    } catch (err) {
      showToast("error", formatApiError(err) || "Failed to load your reviews.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadUserReviewsData();
  }, [loadUserReviewsData]);

  /* ------------------------------------------------------------------ */
  /* Modal Handlers                                                     */
  /* ------------------------------------------------------------------ */
  const openEditModal = (rev) => {
    setModalState({
      isOpen: true,
      mode: "edit",
      reviewId: rev.id,
      productSlug: rev.product?.slug || "",
      productName: rev.product?.name || "Product",
      productImage: rev.product?.images?.[0]?.url || "/images/1l_black_mustard_front.png",
      rating: rev.rating || 5,
      title: rev.title || "",
      body: rev.body || rev.content || rev.comment || "",
    });
    setFormHoverRating(0);
    setFormError("");
  };

  const openWriteModal = (prod) => {
    setModalState({
      isOpen: true,
      mode: "write",
      reviewId: null,
      productSlug: prod.slug,
      productName: prod.name || "Product",
      productImage: prod.images?.[0]?.url || "/images/1l_black_mustard_front.png",
      rating: 5,
      title: "",
      body: "",
    });
    setFormHoverRating(0);
    setFormError("");
  };

  const handleSubmitModal = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!modalState.title?.trim()) {
      setFormError("Please provide a headline for your review.");
      return;
    }
    if (!modalState.body?.trim()) {
      setFormError("Please share details about your cooking experience.");
      return;
    }

    setSubmitting(true);
    try {
      if (modalState.mode === "edit" && modalState.reviewId) {
        await reviews.update(modalState.reviewId, {
          rating: Number(modalState.rating),
          title: modalState.title.trim(),
          body: modalState.body.trim(),
        });
        showToast("success", "Your review was updated successfully!");
      } else {
        await reviews.create(modalState.productSlug, {
          rating: Number(modalState.rating),
          title: modalState.title.trim(),
          body: modalState.body.trim(),
        });
        showToast("success", "Thank you! Your verified review has been published.");
      }

      setModalState((prev) => ({ ...prev, isOpen: false }));
      await loadUserReviewsData();
    } catch (err) {
      setFormError(formatApiError(err) || "Failed to save review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await reviews.remove(deleteTarget.id);
      showToast("success", "Your review has been deleted.");
      setDeleteTarget(null);
      await loadUserReviewsData();
    } catch (err) {
      showToast("error", formatApiError(err) || "Failed to delete review.");
    } finally {
      setDeleting(false);
    }
  };

  const ratingDescriptions = {
    5: "5 - Exceptional quality & aroma",
    4: "4 - Very good experience",
    3: "3 - Average",
    2: "2 - Needs improvement",
    1: "1 - Poor experience",
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-medium shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${
            toast.type === "success"
              ? "bg-pine-950 text-emerald-300 border border-emerald-500/30"
              : "bg-rose-950 text-rose-200 border border-rose-500/30"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-400 flex-shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Banner / Stats Header */}
      <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-b from-white via-cream-paper/85 to-cream-paper p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 items-center gap-1.5 rounded-full bg-gold/15 px-3 text-[11px] font-bold uppercase tracking-wider text-amber-700">
                <Sparkles className="h-3 w-3 text-amber-500" />
                Customer Feedback
              </span>
            </div>
            <h2 className="mt-2 font-display text-2xl font-bold text-pine-900 sm:text-3xl">
              My <span className="italic text-gold-deep">Reviews</span>
            </h2>
            <p className="mt-1 text-xs text-ink/70 max-w-lg">
              Manage your verified ratings, update feedback, and share your cooking experiences with the community.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="rounded-2xl border border-ink/10 bg-white/90 px-4 py-2.5 text-center shadow-xs">
              <span className="block font-display text-2xl font-bold text-pine-900">
                {myReviews.length}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ink/50">
                Published
              </span>
            </div>
            {awaitingReview.length > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-center shadow-xs">
                <span className="block font-display text-2xl font-bold text-amber-700">
                  {awaitingReview.length}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-800">
                  Awaiting Review
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="mt-6 flex items-center gap-2 border-t border-ink/10 pt-4">
          <button
            type="button"
            onClick={() => setActiveSubTab("reviews")}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeSubTab === "reviews"
                ? "bg-pine-900 text-cream shadow-xs"
                : "bg-white/80 text-ink/70 hover:bg-cream-paper border border-ink/10"
            }`}
          >
            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <span>My Reviews ({myReviews.length})</span>
          </button>

          {awaitingReview.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveSubTab("awaiting")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                activeSubTab === "awaiting"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-white/80 text-ink/70 hover:bg-cream-paper border border-ink/10"
              }`}
            >
              <Package className="h-3.5 w-3.5" />
              <span>Awaiting Review ({awaitingReview.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="mx-auto h-7 w-7 text-amber-500 animate-spin" />
          <p className="text-xs text-ink/50">Loading your reviews and eligible purchases…</p>
        </div>
      ) : activeSubTab === "reviews" ? (
        myReviews.length === 0 ? (
          /* Empty State for Reviews */
          <div className="rounded-3xl border border-dashed border-ink/15 bg-cream-paper/70 py-16 text-center px-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <MessageSquare className="h-7 w-7" />
            </div>
            <h3 className="mt-4 font-display text-xl font-bold text-pine-900">
              No Reviews Written Yet
            </h3>
            <p className="mt-1.5 text-xs text-ink/65 max-w-md mx-auto leading-relaxed">
              Once your orders are delivered, you can share honest feedback on purity, aroma, and taste to help other cooks make healthy choices.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/account"
                className="inline-flex items-center gap-1.5 rounded-full border border-pine-900/30 bg-white px-5 py-2 text-xs font-semibold text-pine-900 hover:bg-cream-paper shadow-xs transition-colors"
              >
                <Package className="h-3.5 w-3.5" />
                <span>View My Orders</span>
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 rounded-full bg-pine-900 px-5 py-2 text-xs font-semibold text-cream hover:bg-pine-800 shadow-xs transition-colors"
              >
                <ShoppingBag className="h-3.5 w-3.5 text-gold-light" />
                <span>Browse Products</span>
              </Link>
            </div>
          </div>
        ) : (
          /* List of User's Published Reviews */
          <div className="space-y-4">
            {myReviews.map((rev) => {
              const stars = Array.from({ length: 5 }, (_, i) => i < (rev.rating || 5));
              const prodName = rev.product?.name || "Cold Pressed Mustard Oil";
              const prodImg = rev.product?.images?.[0]?.url || "/images/1l_black_mustard_front.png";

              return (
                <div
                  key={rev.id}
                  className="rounded-3xl border border-amber-300/60 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    {/* Left: Product & Rating Info */}
                    <div className="flex items-start gap-4">
                      {/* Product Thumbnail */}
                      <Link
                        href={`/products/${rev.product?.slug || ""}`}
                        className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-ink/10 bg-cream p-1 transition-transform hover:scale-105"
                      >
                        <SafeImage
                          src={prodImg}
                          alt={prodName}
                          fill
                          className="object-contain"
                          sizes="64px"
                        />
                      </Link>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/products/${rev.product?.slug || ""}`}
                            className="font-display text-base font-bold text-pine-900 hover:text-amber-700 transition-colors flex items-center gap-1"
                          >
                            <span>{prodName}</span>
                            <ExternalLink className="h-3 w-3 text-ink/40" />
                          </Link>

                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                            <ShieldCheck className="h-3 w-3 text-emerald-600" />
                            Verified Purchase
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              rev.isVisible !== false
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {rev.isVisible !== false ? "PUBLISHED" : "UNDER REVIEW"}
                          </span>
                        </div>

                        {/* Stars */}
                        <div className="mt-1.5 flex items-center gap-1 text-amber-500">
                          {stars.map((filled, idx) => (
                            <Star
                              key={idx}
                              className={`h-4 w-4 ${
                                filled ? "fill-amber-400 text-amber-500" : "text-amber-200 fill-amber-50"
                              }`}
                            />
                          ))}
                          <span className="text-xs font-bold text-pine-900 ml-1">
                            {rev.rating}.0
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Action Buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-start">
                      <button
                        type="button"
                        onClick={() => openEditModal(rev)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-ink/15 bg-white px-3 py-1.5 text-xs font-semibold text-pine-900 hover:bg-cream-paper transition-colors shadow-2xs"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Edit Review</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteTarget(rev)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Review"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Review Title & Body */}
                  <div className="mt-4 pt-3 border-t border-ink/8">
                    {rev.title && (
                      <h4 className="font-semibold text-sm text-pine-950">
                        {rev.title}
                      </h4>
                    )}
                    <p className="mt-1.5 whitespace-pre-line text-xs sm:text-sm text-ink/80 leading-relaxed bg-cream-paper/50 rounded-2xl p-4 border border-ink/5">
                      {rev.body || rev.content || rev.comment || rev.review}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Products Awaiting Review */
        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 flex items-center justify-between">
            <span className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              You have delivered orders ready to be reviewed!
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {awaitingReview.map((prod) => (
              <div
                key={prod.slug}
                className="flex items-center justify-between gap-4 rounded-3xl border border-ink/10 bg-white p-5 shadow-xs transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-ink/10 bg-cream p-1">
                    <SafeImage
                      src={prod.images?.[0]?.url || "/images/1l_black_mustard_front.png"}
                      alt={prod.name}
                      fill
                      className="object-contain"
                      sizes="56px"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-pine-900">{prod.name}</h4>
                    <p className="text-[11px] text-emerald-700 font-medium">Delivered & Verified</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openWriteModal(prod)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-pine-900 px-4 py-2 text-xs font-semibold text-cream hover:bg-pine-800 transition-colors shrink-0 shadow-xs"
                >
                  <Edit3 className="h-3.5 w-3.5 text-gold-light" />
                  <span>Review</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Modal: Write / Edit Review                                         */}
      {/* ------------------------------------------------------------------ */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pine-950/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-lg rounded-3xl border border-ink/15 bg-cream p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-ink/5 text-ink/60 hover:bg-ink/10 hover:text-ink transition-colors"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700">
                {modalState.mode === "edit" ? "Update Your Review" : "Share Experience"}
              </span>
              <h3 className="mt-1 font-display text-2xl font-bold text-pine-900">
                {modalState.mode === "edit" ? "Edit Product Review" : "Write a Review"}
              </h3>
              <p className="mt-1 text-xs text-ink/60">
                For <strong className="font-semibold text-pine-900">{modalState.productName}</strong>
              </p>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmitModal} className="mt-5 space-y-4">
              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1.5">
                  Your Overall Rating
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const activeVal = formHoverRating || modalState.rating;
                      const isFilled = star <= activeVal;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setFormHoverRating(star)}
                          onMouseLeave={() => setFormHoverRating(0)}
                          onClick={() => setModalState((prev) => ({ ...prev, rating: star }))}
                          className="p-1 transition-transform hover:scale-125 focus:outline-none"
                          aria-label={`Rate ${star} star`}
                        >
                          <Star
                            className={`h-7 w-7 transition-colors ${
                              isFilled
                                ? "fill-amber-400 text-amber-500 drop-shadow-[0_1px_3px_rgba(245,158,11,0.4)]"
                                : "text-amber-200 fill-amber-50 hover:text-amber-400"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs font-medium text-ink/60 ml-2">
                    {ratingDescriptions[formHoverRating || modalState.rating]}
                  </span>
                </div>
              </div>

              {/* Headline */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink/70">
                    Review Headline
                  </label>
                  <span className="text-[10px] text-ink/40">
                    {modalState.title?.length || 0}/100
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={100}
                  value={modalState.title}
                  onChange={(e) => setModalState((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Pure authentic taste and strong pungency"
                  required
                  className="w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-xs text-ink placeholder:text-ink/35 outline-none transition-all focus:border-pine-900 focus:ring-1 focus:ring-pine-900"
                />
              </div>

              {/* Review Details */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink/70">
                    Detailed Review
                  </label>
                  <span className="text-[10px] text-ink/40">
                    {modalState.body?.length || 0}/1000
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={1000}
                  value={modalState.body}
                  onChange={(e) => setModalState((prev) => ({ ...prev, body: e.target.value }))}
                  placeholder="Tell us about the aroma, tadka flavour, packaging quality, or how it compares to conventional oils..."
                  required
                  className="w-full rounded-xl border border-ink/15 bg-white p-3.5 text-xs text-ink placeholder:text-ink/35 outline-none transition-all focus:border-pine-900 focus:ring-1 focus:ring-pine-900 resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
                  disabled={submitting}
                  className="rounded-xl border border-ink/15 px-4 py-2.5 text-xs font-semibold text-ink/70 hover:bg-cream-paper transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-pine-900 px-6 py-2.5 text-xs font-semibold text-cream hover:bg-pine-800 transition-all shadow-sm disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{submitting ? "Saving…" : modalState.mode === "edit" ? "Update Review" : "Publish Review"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Modal: Confirm Delete                                              */}
      {/* ------------------------------------------------------------------ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pine-950/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl border border-rose-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">Delete this review?</h4>
                <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
              &quot;{deleteTarget.title || deleteTarget.body}&quot;
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>{deleting ? "Deleting…" : "Yes, Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
