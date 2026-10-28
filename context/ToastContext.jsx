"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { AlertCircle, CheckCircle2, X, Info } from "lucide-react";

const ToastContext = createContext({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

let toastIdCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    clearTimeout(timersRef.current[id]);
    delete timersRef.current[id];
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message, type = "error", duration = 4500) => {
      const id = ++toastIdCounter;
      setToasts((prev) => [...prev.slice(-4), { id, message, type }]); // keep max 5
      timersRef.current[id] = setTimeout(() => removeToast(id), duration);
      return id;
    },
    [removeToast]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(clearTimeout);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[99999] flex flex-col items-end gap-2.5 pointer-events-none w-full max-w-sm px-4 sm:px-0">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({ toast, removeToast }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const config = {
    error: {
      bg: "bg-rose-950/95 border-rose-400/40",
      icon: <AlertCircle className="h-4 w-4 text-rose-300 flex-shrink-0" />,
      text: "text-rose-50",
    },
    success: {
      bg: "bg-emerald-950/95 border-emerald-400/40",
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-300 flex-shrink-0" />,
      text: "text-emerald-50",
    },
    info: {
      bg: "bg-pine-950/95 border-gold/40",
      icon: <Info className="h-4 w-4 text-gold-light flex-shrink-0" />,
      text: "text-cream",
    },
  }[toast.type] || {
    bg: "bg-pine-950/95 border-gold/40",
    icon: <AlertCircle className="h-4 w-4 text-amber-300 flex-shrink-0" />,
    text: "text-cream",
  };

  return (
    <div
      className={`pointer-events-auto flex w-full items-start gap-2.5 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-md transition-all duration-300 ${
        config.bg
      } ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      {config.icon}
      <p className={`flex-1 text-xs font-medium leading-relaxed ${config.text}`}>
        {toast.message}
      </p>
      <button
        type="button"
        onClick={() => removeToast(toast.id)}
        className="flex-shrink-0 rounded-full p-0.5 text-white/40 hover:text-white/80 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
