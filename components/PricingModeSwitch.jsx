"use client";

import { usePricingMode } from "@/context/PricingModeContext";
import { Sparkles, Database, Layers } from "lucide-react";

export default function PricingModeSwitch({ compact = false, className = "" }) {
  const { pricingMode, setPricingMode, isDynamic, mounted } = usePricingMode();

  if (!mounted) {
    return (
      <div className={`h-9 w-48 animate-pulse rounded-full bg-ink/5 ${className}`} />
    );
  }

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-cream-paper p-1 text-xs shadow-xs ${className}`}
      >
        <button
          type="button"
          onClick={() => setPricingMode("static")}
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${
            !isDynamic
              ? "bg-pine-800 text-cream shadow-xs"
              : "text-ink/60 hover:text-ink"
          }`}
          title="Static Catalog (offline fixed specs)"
        >
          <Database className="h-3 w-3" />
          <span>Static</span>
        </button>

        <button
          type="button"
          onClick={() => setPricingMode("dynamic")}
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${
            isDynamic
              ? "bg-amber-600 text-white shadow-xs"
              : "text-ink/60 hover:text-ink"
          }`}
          title="Dynamic Live API (real-time price & stock)"
        >
          <Sparkles className="h-3 w-3" />
          <span>Live API</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1.5 rounded-full border border-ink/15 bg-cream-paper p-1.5 shadow-sm">
        <button
          type="button"
          onClick={() => setPricingMode("static")}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
            !isDynamic
              ? "bg-pine-800 text-cream shadow-sm"
              : "text-ink/65 hover:text-ink hover:bg-cream"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Static Catalog</span>
        </button>

        <button
          type="button"
          onClick={() => setPricingMode("dynamic")}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
            isDynamic
              ? "bg-amber-600 text-white shadow-sm"
              : "text-ink/65 hover:text-ink hover:bg-cream"
          }`}
        >
          <Sparkles className={`h-3.5 w-3.5 ${isDynamic ? "animate-pulse" : ""}`} />
          <span>Live API Pricing</span>
          {isDynamic && (
            <span className="flex h-1.5 w-1.5 rounded-full bg-white animate-ping" />
          )}
        </button>
      </div>

      <p className="text-[11px] text-ink/50 tracking-wide">
        {!isDynamic ? (
          <>Using <strong className="text-pine-800">Static Catalog</strong>: original product specs & fixed prices</>
        ) : (
          <>Using <strong className="text-amber-700">Dynamic API</strong>: real-time pricing & stock from live backend</>
        )}
      </p>
    </div>
  );
}
