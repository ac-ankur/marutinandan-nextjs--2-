"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Trash2, AlertTriangle, X, Loader2 } from "lucide-react";

/**
 * ConfirmModal
 * A modern, accessible replacement for window.confirm() / window.alert() in Admin Console.
 *
 * Props:
 * - isOpen (boolean): controls visibility
 * - title (string): modal header, e.g. "Deactivate Product"
 * - message (string | ReactNode): explanatory text or target item name
 * - confirmText (string): e.g. "Deactivate", "Delete", "Confirm" (default "Delete")
 * - cancelText (string): default "Cancel"
 * - variant ("danger" | "warning"): default "danger"
 * - loading (boolean): shows spinner on confirm button
 * - onConfirm (function): callback when user clicks confirm
 * - onClose (function): callback to cancel / dismiss
 */
export default function ConfirmModal({
  isOpen,
  title = "Are you sure?",
  message = "This action will delete the selected item.",
  subMessage,
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
  onConfirm,
  onClose,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, loading, onClose]);

  if (!mounted || !isOpen || typeof document === "undefined") return null;

  const isDanger = variant === "danger";

  return createPortal(
    <div
      className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100 transition-all transform animate-in zoom-in-95 duration-150">
        {/* Close Icon */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          aria-label="Close dialog"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6">
          {/* Header Icon + Title */}
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border ${
                isDanger
                  ? "bg-rose-50 text-rose-600 border-rose-100"
                  : "bg-amber-50 text-amber-600 border-amber-100"
              }`}
            >
              {isDanger ? (
                <Trash2 className="h-6 w-6 stroke-[2]" />
              ) : (
                <AlertTriangle className="h-6 w-6 stroke-[2]" />
              )}
            </div>

            <div className="min-w-0 flex-1 pt-1">
              <h3
                id="confirm-modal-title"
                className="text-base font-bold text-slate-900 leading-snug"
              >
                {title}
              </h3>
              <div className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                {message}
              </div>

              {subMessage && (
                <p className="mt-2 text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-lg p-2.5">
                  {subMessage}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 active:scale-95 transition-all disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md active:scale-95 transition-all disabled:opacity-60 ${
                isDanger
                  ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                  : "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing…</span>
                </>
              ) : (
                <span>{confirmText}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
