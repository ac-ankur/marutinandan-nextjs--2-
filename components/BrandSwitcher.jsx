"use client";

import { useBrand } from "./BrandProvider";
import { brands } from "@/data/company";

export default function BrandSwitcher({ className = "" }) {
  const { brandKey, setBrandKey } = useBrand();

  return (
    <div className={`flex items-center rounded-full border border-ink/15 bg-cream-paper/70 p-1 text-xs ${className}`}>
      {Object.values(brands).map((b) => (
        <button
          key={b.key}
          type="button"
          onClick={() => setBrandKey(b.key)}
          data-cursor-hover
          title={b.market}
          className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
            brandKey === b.key ? "bg-pine-800 text-cream" : "text-ink/55 hover:text-ink"
          }`}
        >
          {b.name}
        </button>
      ))}
    </div>
  );
}
