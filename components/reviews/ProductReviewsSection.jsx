"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { reviews, formatApiError } from "@/lib/api";
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
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
  Lock,
  ThumbsUp,
  Loader2,
} from "lucide-react";

/**
 * Helper to get candidate slugs to query against the backend API.
 * e.g. for "black-mustard-oil-1l": ["black-mustard-oil-1l", "black-mustard-oil"]
 */
function getCandidateSlugs(product) {
  const candidates = [];
  if (product?.slug) candidates.push(product.slug);
  const stripped = product?.slug?.replace(/-\d+l$/i, "");
  if (stripped && !candidates.includes(stripped)) candidates.push(stripped);
  if (product?.variant) {
    const vSlug = `${product.variant}-mustard-oil`;
    if (!candidates.includes(vSlug)) candidates.push(vSlug);
  }
  return candidates;
}

export default function ProductReviewsSection({ product }) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // API reviews list & summary
  const [reviewsData, setReviewsData] = useState({
    summary: { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
    items: [],
    meta: { page: 1, pageSize: 10, total: 0, totalPages: 1 },
  });
  const [workingSlug, setWorkingSlug] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // User review eligibility
  const [eligibility, setEligibility] = useState({
    canReview: false,
    alreadyReviewed: false,
    reason: null,
    myReview: null,
  });
  const [eligibilityLoading, setEligibilityLoading] = useState(false);

  // Filtering & Sorting
  const [ratingFilter, setRatingFilter] = useState("ALL"); // "ALL" or 5, 4, 3, 2, 1
  const [sortBy, setSortBy] = useState("recent"); // "recent", "highest", "lowest"

  // Modal & Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [formData, setFormData] = useState({ rating: 5, title: "", body: "" });
  const [formHoverRating, setFormHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Delete State
  const [deleteConfirmReview, setDeleteConfirmReview] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Feedback Toast
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  };

  /* ------------------------------------------------------------------ */
  /* Fetch reviews list (with automatic slug fallback if needed)         */
  /* ------------------------------------------------------------------ */
  const fetchReviews = useCallback(
    async (targetPage = 1) => {
      setLoading(true);
      const candidates = workingSlug ? [workingSlug] : getCandidateSlugs(product);

      let found = false;
      for (const slug of candidates) {
        try {
          const res = await reviews.list(slug, targetPage);
          if (res && res.summary !== undefined) {
            setWorkingSlug(slug);
            setReviewsData({
              summary: res.summary || { average: 0, count: 0, distribution: {} },
              items: res.items || [],
              meta: res.meta || { page: targetPage, pageSize: 10, total: res.items?.length || 0, totalPages: 1 },
            });
            setPage(targetPage);
            found = true;
            break;
          }
        } catch {
          // Continue to next candidate
        }
      }

      if (!found) {
        setWorkingSlug(candidates[0] || product?.slug);
        setReviewsData({
          summary: { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
          items: [],
          meta: { page: 1, pageSize: 10, total: 0, totalPages: 1 },
        });
      }
      setLoading(false);
    },
    [product, workingSlug]
  );

  /* ------------------------------------------------------------------ */
  /* Fetch User Eligibility                                             */
  /* ------------------------------------------------------------------ */
  const checkEligibility = useCallback(
    async (slugToUse) => {
      if (!isAuthenticated) {
        setEligibility({
          canReview: false,
          alreadyReviewed: false,
          reason: "Please sign in to write a review.",
          myReview: null,
        });
        return;
      }

      setEligibilityLoading(true);
      const candidates = slugToUse ? [slugToUse] : workingSlug ? [workingSlug] : getCandidateSlugs(product);

      for (const slug of candidates) {
        try {
          const res = await reviews.eligibility(slug);
          if (res) {
            setEligibility({
              canReview: Boolean(res.canReview),
              alreadyReviewed: Boolean(res.alreadyReviewed),
              reason: res.reason || null,
              myReview: res.myReview || null,
            });
            break;
          }
        } catch (err) {
          if (err?.status === 401) {
            setEligibility({
              canReview: false,
              alreadyReviewed: false,
              reason: "Please sign in to write a review.",
              myReview: null,
            });
            break;
          }
        }
      }
      setEligibilityLoading(false);
    },
    [isAuthenticated, workingSlug, product]
  );

  useEffect(() => {
    fetchReviews(1);
  }, [fetchReviews]);

  useEffect(() => {
    if (!authLoading) {
      checkEligibility(workingSlug);
    }
  }, [authLoading, isAuthenticated, workingSlug, checkEligibility]);

  /* ------------------------------------------------------------------ */
  /* Open Form: Write New or Edit Existing                              */
  /* ------------------------------------------------------------------ */
  const openWriteModal = () => {
    setEditingReviewId(null);
    setFormData({ rating: 5, title: "", body: "" });
    setFormHoverRating(0);
    setFormError("");
    setIsFormOpen(true);
  };

  const openEditModal = (reviewToEdit) => {
    const rev = reviewToEdit || eligibility.myReview;
    if (!rev) return;
    setEditingReviewId(rev.id);
    setFormData({
      rating: rev.rating || 5,
      title: rev.title || "",
      body: rev.body || rev.content || rev.comment || "",
    });
    setFormHoverRating(0);
    setFormError("");
    setIsFormOpen(true);
  };

  /* ------------------------------------------------------------------ */
  /* Submit Review (Create or Patch)                                    */
  /* ------------------------------------------------------------------ */
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.title?.trim()) {
      setFormError("Please enter a short review title");
      return;
    }
    if (!formData.body?.trim()) {
      setFormError("Please share your thoughts in the review details");
      return;
    }

    setSubmitting(true);
    const activeSlug = workingSlug || getCandidateSlugs(product)[0];

    try {
      if (editingReviewId) {
        await reviews.update(editingReviewId, {
          rating: Number(formData.rating),
          title: formData.title.trim(),
          body: formData.body.trim(),
        });
        showToast("success", "Your review has been updated successfully!");
      } else {
        await reviews.create(activeSlug, {
          rating: Number(formData.rating),
          title: formData.title.trim(),
          body: formData.body.trim(),
        });
        showToast("success", "Thank you! Your verified review has been submitted.");
      }

      setIsFormOpen(false);
      await fetchReviews(1);
      await checkEligibility(activeSlug);
    } catch (err) {
      setFormError(formatApiError(err) || "Failed to submit your review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* Delete Review                                                      */
  /* ------------------------------------------------------------------ */
  const handleDeleteReview = async () => {
    if (!deleteConfirmReview) return;
    setDeleting(true);
    const activeSlug = workingSlug || getCandidateSlugs(product)[0];

    try {
      await reviews.remove(deleteConfirmReview.id);
      showToast("success", "Your review has been removed.");
      setDeleteConfirmReview(null);
      await fetchReviews(1);
      await checkEligibility(activeSlug);
    } catch (err) {
      showToast("error", formatApiError(err) || "Failed to delete review. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* Filter & Sort Reviews for Display                                  */
  /* ------------------------------------------------------------------ */
  const filteredAndSortedReviews = useMemo(() => {
    let list = [...reviewsData.items];

    if (ratingFilter !== "ALL") {
      const target = Number(ratingFilter);
      list = list.filter((r) => Number(r.rating) === target);
    }

    if (sortBy === "highest") {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "lowest") {
      list.sort((a, b) => (a.rating || 0) - (b.rating || 0));
    } else {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return list;
  }, [reviewsData.items, ratingFilter, sortBy]);

  const summary = reviewsData.summary;
  const averageRating = Number(summary.average || 0).toFixed(1);
  const totalReviews = Number(summary.count || 0);

  const ratingDescriptions = {
    5: "5 - Exceptional quality & taste",
    4: "4 - Very good experience",
    3: "3 - Average",
    2: "2 - Needs improvement",
    1: "1 - Poor experience",
  };

  return (
    <section id="reviews" className="mt-24 scroll-mt-28">
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

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-ink/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 items-center gap-1.5 rounded-full bg-gold/15 px-3 text-[11px] font-bold uppercase tracking-wider text-amber-700">
              <Sparkles className="h-3 w-3 text-amber-500" />
              Verified Buyer Feedback
            </span>
          </div>
          <h2 className="mt-3 font-display text-3xl text-pine-900 sm:text-4xl">
            Customer <span className="italic text-gold-deep">Reviews & Ratings</span>
          </h2>
          <p className="mt-2 text-sm text-ink/70 max-w-xl">
            Read real cooking experiences and quality impressions from verified buyers of {product.variantData.name}.
          </p>
        </div>

        {/* Top Action / Eligibility Indicator */}
        <div className="flex items-center gap-3">
          {eligibility.alreadyReviewed ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                You Reviewed This
              </span>
              <button
                type="button"
                onClick={() => openEditModal(eligibility.myReview)}
                className="inline-flex items-center gap-1.5 rounded-full border border-pine-900/30 bg-white px-4 py-1.5 text-xs font-semibold text-pine-900 hover:bg-cream-paper transition-all"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Edit Review
              </button>
            </div>
          ) : eligibility.canReview ? (
            <button
              type="button"
              onClick={openWriteModal}
              className="inline-flex items-center gap-2 rounded-full bg-pine-900 px-6 py-2.5 text-xs font-semibold text-cream shadow-sm hover:bg-pine-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Edit3 className="h-3.5 w-3.5 text-gold-light" />
              Write a Review
            </button>
          ) : !isAuthenticated ? (
            <Link
              href={`/login?redirect=/products/${product.slug}#reviews`}
              className="inline-flex items-center gap-2 rounded-full border border-pine-900/40 bg-white px-5 py-2 text-xs font-semibold text-pine-900 hover:bg-cream-paper transition-all"
            >
              <Lock className="h-3 w-3 text-gold-deep" />
              Sign In to Review
            </Link>
          ) : null}
        </div>
      </div>

      {/* Overview & Breakdown Card: Responsive flex layout preventing narrow column squash */}
      <div className="mt-8 flex flex-col lg:flex-row items-stretch gap-6 rounded-3xl bg-cream-paper/90 border border-ink/10 p-6 sm:p-8 shadow-xs">
        {/* Left Column: Big Average Rating */}
        <div className="w-full lg:w-[260px] lg:shrink-0 flex flex-col justify-center items-center lg:items-start border-b lg:border-b-0 lg:border-r border-ink/10 pb-6 lg:pb-0 lg:pr-8 text-center lg:text-left">
          <p className="text-xs font-bold uppercase tracking-widest text-ink/50">Overall Rating</p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-5xl sm:text-6xl text-pine-950 font-bold tracking-tight">
              {totalReviews > 0 ? averageRating : "—"}
            </span>
            <span className="text-sm font-semibold text-ink/40">/ 5.0</span>
          </div>

          {/* Filled Amber Stars */}
          <div className="mt-3 flex items-center gap-1.5">
            {Array.from({ length: 5 }, (_, i) => {
              const ratingValue = Number(summary.average || 0);
              const isFilled = totalReviews > 0 && i < Math.floor(ratingValue);
              const isHalf = totalReviews > 0 && !isFilled && i < ratingValue;
              return (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    isFilled
                      ? "fill-amber-400 text-amber-500 drop-shadow-[0_1px_2px_rgba(245,158,11,0.3)]"
                      : isHalf
                      ? "fill-amber-300 text-amber-400"
                      : "text-amber-200 fill-amber-50"
                  }`}
                />
              );
            })}
          </div>

          <p className="mt-3 text-xs text-ink/60">
            {totalReviews > 0
              ? `Based on ${totalReviews} verified ${totalReviews === 1 ? "review" : "reviews"}`
              : "No customer reviews yet"}
          </p>

          <div className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs text-emerald-800">
            <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold text-[11px]">Verified Purchases Only</span>
          </div>
        </div>

        {/* Middle Column: Star Distribution Bars */}
        <div className="w-full lg:flex-1 flex flex-col justify-center space-y-2.5 py-1">
          <p className="text-xs font-bold uppercase tracking-wider text-ink/50 mb-1">
            Rating Distribution
          </p>
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = summary.distribution?.[stars] || 0;
            const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
            const isActive = ratingFilter === stars;

            return (
              <button
                key={stars}
                type="button"
                onClick={() => setRatingFilter(isActive ? "ALL" : stars)}
                className={`group flex items-center gap-3 text-xs w-full text-left rounded-xl px-3 py-2 transition-all ${
                  isActive
                    ? "bg-amber-100/70 ring-1 ring-amber-400/60"
                    : "hover:bg-amber-50/60"
                }`}
                title={`Filter by ${stars} stars`}
              >
                <div className="flex items-center gap-1.5 w-14 text-ink/80 font-semibold shrink-0">
                  <span>{stars}</span>
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500 shrink-0" />
                </div>

                <div className="relative h-2.5 flex-1 rounded-full bg-ink/10 overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 left-0 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-end gap-1.5 w-20 text-[11px] text-ink/50 shrink-0 text-right">
                  <span className="font-semibold text-ink/75">{count}</span>
                  <span>({percentage}%)</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Write a Review Status Card */}
        <div className="w-full lg:w-[320px] lg:shrink-0 flex flex-col justify-between rounded-2xl bg-white border border-ink/10 p-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <MessageSquare className="h-4 w-4" />
              </span>
              <p className="text-xs font-bold uppercase tracking-wider text-pine-900">
                Have you tried this?
              </p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink/70">
              Purchased and received <strong className="font-semibold text-pine-900">{product.variantData.name}</strong>? Share your culinary experience to help other cooks.
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-ink/5">
            {eligibilityLoading ? (
              <div className="flex items-center gap-2 text-xs text-ink/50 py-2">
                <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                <span>Checking purchase eligibility…</span>
              </div>
            ) : eligibility.alreadyReviewed ? (
              <div className="space-y-2.5">
                <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Your review is published</span>
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(eligibility.myReview)}
                    className="flex-1 rounded-xl bg-pine-900 py-2.5 text-center text-xs font-semibold text-cream hover:bg-pine-800 transition-colors shadow-xs"
                  >
                    Edit Review
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmReview(eligibility.myReview)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                    title="Delete review"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : eligibility.canReview ? (
              <button
                type="button"
                onClick={openWriteModal}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-pine-900 py-3 text-xs font-semibold text-cream hover:bg-pine-800 transition-all hover:shadow-md active:scale-98"
              >
                <Edit3 className="h-4 w-4 text-gold-light" />
                <span>Write Your Review</span>
              </button>
            ) : !isAuthenticated ? (
              <Link
                href={`/login?redirect=/products/${product.slug}#reviews`}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-pine-900/30 bg-pine-900/5 py-2.5 text-xs font-semibold text-pine-900 hover:bg-pine-900 hover:text-white transition-all"
              >
                <Lock className="h-3.5 w-3.5 text-amber-600" />
                <span>Sign In to Review</span>
              </Link>
            ) : (
              <div className="rounded-xl bg-cream-paper/90 border border-ink/10 p-3.5 text-xs space-y-1.5">
                <p className="font-semibold text-pine-900 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Delivered Orders Only</span>
                </p>
                <p className="text-[11px] text-ink/65 leading-relaxed">
                  {eligibility.reason || "Reviews are open to customers once the product order has been delivered."}
                </p>
                <div className="pt-1">
                  <Link href="/account/orders" className="text-amber-700 font-semibold text-xs hover:underline inline-flex items-center gap-1">
                    <span>View My Orders</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Filter & Sort Bar */}
      <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-ink/10 pb-4">
        {/* Star Rating Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-ink/50 mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" />
            Filter:
          </span>
          <button
            type="button"
            onClick={() => setRatingFilter("ALL")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              ratingFilter === "ALL"
                ? "bg-pine-900 text-cream shadow-xs"
                : "bg-cream-paper border border-ink/10 text-ink/70 hover:border-ink/30"
            }`}
          >
            All ({totalReviews})
          </button>
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = summary.distribution?.[stars] || 0;
            const isSelected = ratingFilter === stars;
            return (
              <button
                key={stars}
                type="button"
                onClick={() => setRatingFilter(isSelected ? "ALL" : stars)}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-amber-500 text-white shadow-xs"
                    : "bg-cream-paper border border-ink/10 text-ink/70 hover:border-ink/30"
                }`}
              >
                <span>{stars}</span>
                <Star className={`h-3 w-3 ${isSelected ? "fill-white text-white" : "fill-amber-400 text-amber-500"}`} />
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-ink/50 flex items-center gap-1">
            <ArrowUpDown className="h-3 w-3" />
            Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-ink/15 bg-white px-3 py-1.5 text-xs text-ink font-medium outline-none focus:border-pine-900"
          >
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="mt-6">
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="mx-auto h-6 w-6 text-amber-500 animate-spin" />
            <p className="text-xs text-ink/50">Loading customer reviews…</p>
          </div>
        ) : filteredAndSortedReviews.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-ink/15 bg-cream-paper/50 py-16 text-center px-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-display text-lg text-pine-900 font-semibold">
              {ratingFilter !== "ALL"
                ? `No ${ratingFilter}-Star Reviews Yet`
                : "No Reviews Yet for this Product"}
            </h3>
            <p className="mt-1 text-xs text-ink/60 max-w-sm mx-auto">
              {ratingFilter !== "ALL"
                ? "Try clearing your star rating filter to see all feedback."
                : "Be the first to share your cold-pressed cooking experience once your order arrives."}
            </p>
            {ratingFilter !== "ALL" && (
              <button
                type="button"
                onClick={() => setRatingFilter("ALL")}
                className="mt-4 inline-flex items-center gap-1 rounded-full border border-pine-900/30 px-4 py-1.5 text-xs font-semibold text-pine-900 hover:bg-cream-paper"
              >
                Reset Rating Filter
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedReviews.map((item) => {
              const isMine =
                (eligibility.myReview && eligibility.myReview.id === item.id) ||
                (user && item.userId === user.id);

              const stars = Array.from({ length: 5 }, (_, i) => i < (item.rating || 5));
              const authorName = item.author || item.authorName || item.user?.name || "Verified Customer";
              const initial = authorName.charAt(0).toUpperCase();

              return (
                <div
                  key={item.id}
                  className={`relative rounded-3xl border p-6 transition-all duration-300 ${
                    isMine
                      ? "border-amber-400 bg-white shadow-sm ring-1 ring-amber-300/40"
                      : "border-ink/10 bg-white hover:border-ink/20 hover:shadow-xs"
                  }`}
                >
                  {/* Top Row: User Avatar, Name, Rating, Date & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      {/* Avatar */}
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-pine-900 text-gold-light font-display text-sm font-bold shadow-xs">
                        {initial}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-sm text-pine-900">
                            {authorName}
                          </span>

                          {item.verifiedPurchase !== false && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                              <ShieldCheck className="h-3 w-3 text-emerald-600" />
                              Verified Buyer
                            </span>
                          )}

                          {isMine && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-300 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                              Your Review
                            </span>
                          )}
                        </div>

                        {/* Stars & Date */}
                        <div className="mt-1.5 flex items-center gap-2.5">
                          <div className="flex items-center gap-0.5">
                            {stars.map((filled, idx) => (
                              <Star
                                key={idx}
                                className={`h-3.5 w-3.5 ${
                                  filled ? "fill-amber-400 text-amber-500" : "text-amber-200 fill-amber-50"
                                }`}
                              />
                            ))}
                          </div>

                          {item.createdAt && (
                            <span className="text-[11px] text-ink/40">
                              {new Date(item.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Own review action buttons */}
                    {isMine && (
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="inline-flex items-center gap-1 rounded-lg border border-ink/15 px-2.5 py-1 text-xs font-semibold text-pine-900 hover:bg-cream-paper transition-colors"
                          title="Edit your review"
                        >
                          <Edit3 className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmReview(item)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete your review"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Review Content */}
                  <div className="mt-4 pl-0 sm:pl-[54px]">
                    {item.title && (
                      <h4 className="font-semibold text-pine-950 text-sm">
                        {item.title}
                      </h4>
                    )}
                    <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-ink/80">
                      {item.body || item.content || item.comment || item.review}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {reviewsData.meta?.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between border-t border-ink/10 pt-4 text-xs">
            <span className="text-ink/50">
              Showing page {page} of {reviewsData.meta.totalPages} ({reviewsData.meta.total} reviews)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fetchReviews(page - 1)}
                disabled={page <= 1 || loading}
                className="flex items-center gap-1 rounded-xl border border-ink/15 bg-white px-3 py-1.5 font-medium text-ink/70 hover:bg-cream-paper disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Previous</span>
              </button>
              <button
                type="button"
                onClick={() => fetchReviews(page + 1)}
                disabled={page >= reviewsData.meta.totalPages || loading}
                className="flex items-center gap-1 rounded-xl border border-ink/15 bg-white px-3 py-1.5 font-medium text-ink/70 hover:bg-cream-paper disabled:opacity-40"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Modal: Write or Edit Review                                       */}
      {/* ------------------------------------------------------------------ */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pine-950/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-lg rounded-3xl border border-ink/15 bg-cream p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-ink/5 text-ink/60 hover:bg-ink/10 hover:text-ink transition-colors"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700">
                {editingReviewId ? "Update Feedback" : "Share Experience"}
              </span>
              <h3 className="mt-1 font-display text-2xl text-pine-900 font-bold">
                {editingReviewId ? "Edit Your Review" : "Write a Customer Review"}
              </h3>
              <p className="mt-1 text-xs text-ink/60">
                For {product.variantData.name} ({product.size} {product.stockUnit})
              </p>
            </div>

            {/* Form Error */}
            {formError && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {/* Review Form */}
            <form onSubmit={handleSubmitReview} className="mt-5 space-y-4">
              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink/70 mb-1.5">
                  Your Overall Rating
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const activeVal = formHoverRating || formData.rating;
                      const isFilled = star <= activeVal;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setFormHoverRating(star)}
                          onMouseLeave={() => setFormHoverRating(0)}
                          onClick={() => setFormData((prev) => ({ ...prev, rating: star }))}
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
                    {ratingDescriptions[formHoverRating || formData.rating]}
                  </span>
                </div>
              </div>

              {/* Review Headline / Title */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink/70">
                    Review Headline
                  </label>
                  <span className="text-[10px] text-ink/40">
                    {formData.title?.length || 0}/100
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={100}
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Authentic pungent aroma, perfect for pickles & tadka"
                  required
                  className="w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-xs text-ink placeholder:text-ink/35 outline-none transition-all focus:border-pine-900 focus:ring-1 focus:ring-pine-900"
                />
              </div>

              {/* Review Body */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink/70">
                    Detailed Cooking & Quality Experience
                  </label>
                  <span className="text-[10px] text-ink/40">
                    {formData.body?.length || 0}/1000
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={1000}
                  value={formData.body}
                  onChange={(e) => setFormData((prev) => ({ ...prev, body: e.target.value }))}
                  placeholder="Share details about the oil's pungency, flavour in your dishes, purity, bottle packing, or delivery..."
                  required
                  className="w-full rounded-xl border border-ink/15 bg-white p-3.5 text-xs text-ink placeholder:text-ink/35 outline-none transition-all focus:border-pine-900 focus:ring-1 focus:ring-pine-900 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="mt-6 flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
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
                  <span>{submitting ? "Submitting…" : editingReviewId ? "Update Review" : "Publish Review"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Modal: Confirm Delete                                              */}
      {/* ------------------------------------------------------------------ */}
      {deleteConfirmReview && (
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
              &quot;{deleteConfirmReview.title || deleteConfirmReview.body}&quot;
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmReview(null)}
                disabled={deleting}
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteReview}
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
    </section>
  );
}
