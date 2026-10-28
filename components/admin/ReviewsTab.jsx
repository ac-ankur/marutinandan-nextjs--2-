"use client";

import { useEffect, useState, useCallback } from "react";
import { admin, formatApiError } from "@/lib/api";
import ConfirmModal from "@/components/admin/ConfirmModal";
import {
  Star,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Trash2,
  MessageSquare,
} from "lucide-react";

export default function ReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [visibleFilter, setVisibleFilter] = useState("ALL"); // "ALL", "true", "false"
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    review: null,
    loading: false,
  });

  const fetchReviews = useCallback(async (targetPage = 1, currentFilter = visibleFilter) => {
    setLoading(true);
    setError("");
    try {
      const params = { page: targetPage, pageSize: 20 };
      if (currentFilter === "true") params.visible = "true";
      if (currentFilter === "false") params.visible = "false";

      const res = await admin.reviews(params);
      setReviews(res.items || res.reviews || []);
      setMeta(res.meta || null);
      setPage(targetPage);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, [visibleFilter]);

  useEffect(() => {
    fetchReviews(1, visibleFilter);
  }, [fetchReviews, visibleFilter]);

  const handleToggleVisibility = async (review) => {
    const currentVis = review.visible !== undefined ? review.visible : (review.isVisible ?? true);
    const nextVis = !currentVis;
    setActionLoadingId(review.id);
    try {
      await admin.toggleReviewVisibility(review.id, nextVis);
      setSuccess(`Review visibility updated to ${nextVis ? "Published" : "Hidden"}.`);
      fetchReviews(page, visibleFilter);
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = (review) => {
    setConfirmState({
      isOpen: true,
      review,
      loading: false,
    });
  };

  const executeDelete = async () => {
    const { review } = confirmState;
    if (!review) return;
    setConfirmState((prev) => ({ ...prev, loading: true }));
    try {
      await admin.deleteReview(review.id);
      setSuccess("Review removed successfully.");
      fetchReviews(page, visibleFilter);
      setTimeout(() => setSuccess(""), 4000);
      setConfirmState({ isOpen: false, review: null, loading: false });
    } catch (err) {
      setError(formatApiError(err));
      setConfirmState({ isOpen: false, review: null, loading: false });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Reviews Moderation</h2>
          <p className="text-xs text-slate-500">
            Moderate customer product feedback, verify ratings, and publish genuine experiences.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchReviews(page, visibleFilter)}
          disabled={loading}
          className="flex h-9 w-9 items-center justify-center self-start sm:self-auto rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          title="Refresh reviews"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
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

      {/* Visibility Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {[
          { key: "ALL", label: "All Reviews" },
          { key: "true", label: "Visible / Published" },
          { key: "false", label: "Hidden / Draft" },
        ].map((pill) => (
          <button
            key={pill.key}
            type="button"
            onClick={() => {
              setVisibleFilter(pill.key);
              fetchReviews(1, pill.key);
            }}
            className={`rounded-lg px-3.5 py-1.5 font-medium whitespace-nowrap transition-all ${
              visibleFilter === pill.key
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading customer reviews…</div>
          ) : reviews.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              <Star className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p className="font-semibold text-slate-900 text-sm">No reviews found</p>
              <p className="mt-1 text-slate-400">Customer feedback matching this filter will appear here.</p>
            </div>
          ) : (
            reviews.map((r) => {
              const stars = Array.from({ length: 5 }, (_, i) => i < (r.rating || 5));
              const isVis = r.visible !== undefined ? r.visible : (r.isVisible ?? true);
              const isActionLoading = actionLoadingId === r.id;

              return (
                <div key={r.id} className="p-5 hover:bg-slate-50/70 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center text-amber-500">
                          {stars.map((filled, idx) => (
                            <Star
                              key={idx}
                              className={`h-3.5 w-3.5 ${
                                filled ? "fill-amber-400 text-amber-400" : "text-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-semibold text-slate-900 text-xs">
                          {r.title || "Customer Review"}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                            isVis
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {isVis ? "PUBLISHED" : "HIDDEN"}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 mt-1">
                        By <span className="font-medium text-slate-800">{r.authorName || r.user?.name || "Verified Customer"}</span> • Product:{" "}
                        <span className="font-semibold text-slate-900">
                          {r.product?.name || r.productName || "Product"}
                        </span>
                        {r.createdAt && (
                          <span className="text-slate-400">
                            {" "}• {new Date(r.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(r)}
                        disabled={isActionLoading}
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
                          isVis
                            ? "border border-slate-300 text-slate-700 hover:bg-slate-50"
                            : "bg-emerald-600 text-white hover:bg-emerald-700"
                        }`}
                        title={isVis ? "Hide review from store" : "Publish review on store"}
                      >
                        {isVis ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        <span>{isVis ? "Hide" : "Publish"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(r)}
                        disabled={isActionLoading}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                        title="Delete Review"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {(r.content || r.comment || r.review) && (
                    <p className="mt-2 text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                      {r.content || r.comment || r.review}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3 text-xs">
            <span className="text-slate-500">
              Showing page {page} of {meta.totalPages} ({meta.total} reviews)
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => fetchReviews(page - 1, visibleFilter)}
                disabled={page <= 1 || loading}
                className="rounded-lg border border-slate-300 px-3 py-1 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => fetchReviews(page + 1, visibleFilter)}
                disabled={page >= meta.totalPages || loading}
                className="rounded-lg border border-slate-300 px-3 py-1 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title="Delete Review"
        message={
          <span>
            Are you sure you want to permanently remove this review by{" "}
            <strong className="font-bold text-slate-900">&ldquo;{confirmState.review?.userName || "Anonymous"}&rdquo;</strong>?
          </span>
        }
        subMessage="This customer review and rating will be permanently deleted from the database."
        confirmText="Delete Review"
        variant="danger"
        loading={confirmState.loading}
        onConfirm={executeDelete}
        onClose={() => setConfirmState({ isOpen: false, review: null, loading: false })}
      />
    </div>
  );
}
