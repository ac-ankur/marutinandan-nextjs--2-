"use client";

import { useEffect, useState } from "react";
import { reviews } from "@/lib/api";
import { Star } from "lucide-react";

export default function ProductHeroRating({ product }) {
  const [rating, setRating] = useState({ average: 0, count: 0 });

  useEffect(() => {
    let active = true;
    const candidates = [];
    if (product?.slug) candidates.push(product.slug);
    const base = product?.slug?.replace(/-\d+l$/i, "");
    if (base && !candidates.includes(base)) candidates.push(base);
    if (product?.variant) {
      const vSlug = `${product.variant}-mustard-oil`;
      if (!candidates.includes(vSlug)) candidates.push(vSlug);
    }

    async function loadSummary() {
      for (const slug of candidates) {
        try {
          const res = await reviews.list(slug, 1);
          if (res?.summary && active) {
            setRating({
              average: Number(res.summary.average || 0),
              count: Number(res.summary.count || 0),
            });
            break;
          }
        } catch {
          // ignore
        }
      }
    }

    loadSummary();
    return () => {
      active = false;
    };
  }, [product]);

  const avg = Number(rating.average || 0).toFixed(1);
  const count = rating.count;

  return (
    <a
      href="#reviews"
      className="inline-flex items-center gap-2 group transition-all"
      title="View Customer Reviews"
    >
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => {
          const isFilled = count > 0 && i < Math.round(rating.average);
          return (
            <Star
              key={i}
              className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                isFilled
                  ? "fill-amber-400 text-amber-500 drop-shadow-[0_1px_2px_rgba(245,158,11,0.3)]"
                  : "text-amber-200 fill-amber-50"
              }`}
            />
          );
        })}
      </div>

      <div className="flex items-center gap-1.5 text-xs">
        <span className="font-bold text-pine-900 group-hover:text-amber-700 transition-colors">
          {count > 0 ? avg : "5.0"}
        </span>
        <span className="text-ink/40">·</span>
        <span className="text-ink/70 underline underline-offset-4 decoration-ink/20 group-hover:decoration-amber-500 group-hover:text-pine-900 transition-colors">
          {count > 0 ? `${count} ${count === 1 ? "review" : "reviews"}` : "Reviews"}
        </span>
      </div>
    </a>
  );
}
