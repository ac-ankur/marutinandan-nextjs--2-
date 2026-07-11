"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { getAllProducts } from "@/data/products";

export default function ProductsGrid({ initialVariant = "all" }) {
  const [filter, setFilter] = useState(initialVariant);
  const gridRef = useRef(null);

  const allProducts = useMemo(() => getAllProducts(), []);

  // Group the flat product list into one entry per variant, each carrying
  // its list of available sizes (so we show one card per oil, not one per SKU).
  const grouped = useMemo(() => {
    const byVariant = {};
    allProducts.forEach((p) => {
      if (!byVariant[p.variant]) byVariant[p.variant] = { variant: p.variant, variantData: p.variantData, sizes: [] };
      byVariant[p.variant].sizes.push(p);
    });
    return Object.values(byVariant);
  }, [allProducts]);

  const filtered = filter === "all" ? grouped : grouped.filter((g) => g.variant === filter);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".product-card",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" }
      );
    }, gridRef);
    return () => ctx.revert();
  }, [filter]);

  return (
    <div>
      <div className="mx-auto flex w-full max-w-[320px] flex-wrap justify-center gap-2 rounded-full bg-cream-paper p-1.5 sm:w-fit sm:max-w-none">
        {[
          { key: "all", label: "All" },
          { key: "black", label: "Black" },
          { key: "yellow", label: "Yellow" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors sm:px-6 sm:py-2.5 ${
              filter === t.key ? "bg-pine-800 text-cream" : "text-ink/60 hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div ref={gridRef} className="mt-10 grid gap-7 sm:mt-14 md:grid-cols-2">
        {filtered.map((group) => (
          <VariantCard key={group.variant} group={group} />
        ))}
      </div>
    </div>
  );
}

function VariantCard({ group }) {
  const sortedSizes = [...group.sizes].sort((a, b) => a.mrp - b.mrp);
  const [selectedSlug, setSelectedSlug] = useState(sortedSizes[0].slug);
  const selected = sortedSizes.find((s) => s.slug === selectedSlug) || sortedSizes[0];

  return (
    <div className="product-card relative flex flex-col overflow-hidden rounded-3xl border border-ink/10 bg-cream-paper p-7">
      <div
        className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-3xl"
        style={{ background: group.variantData.accent }}
      />
      <div className="relative z-10 flex items-center justify-center py-4">
        <svg width="80" height="104" viewBox="0 0 46 60" fill="none">
          <path
            d="M23 2C23 2 43 30 43 42C43 53.0457 34.0457 60 23 60C11.9543 60 3 53.0457 3 42C3 30 23 2 23 2Z"
            fill={group.variantData.accent}
          />
        </svg>
      </div>

      <div className="relative z-10">
        <h3 className="font-display text-xl text-pine-900">{group.variantData.name}</h3>
        <p className="mt-2 text-sm text-ink/60">{group.variantData.tagline}</p>

        <p className="mt-5 text-xs font-medium uppercase tracking-[0.15em] text-ink/45">Choose a size</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {sortedSizes.map((s) => (
            <button
              key={s.slug}
              onClick={() => setSelectedSlug(s.slug)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                selected.slug === s.slug
                  ? "border-pine-800 bg-pine-800 text-cream"
                  : "border-ink/15 text-ink/70 hover:border-gold-deep hover:text-pine-800"
              }`}
            >
              {s.size}
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-ink/10 pt-4">
          <div>
            <span className="font-display text-2xl text-gold-deep">₹{selected.mrp}</span>
            <span className="ml-2 text-xs text-ink/50">{selected.stockUnit}</span>
          </div>
          <Link
            href={`/products/${selected.slug}`}
            className="text-sm font-medium text-pine-800 underline decoration-gold decoration-2 underline-offset-4"
          >
            View details →
          </Link>
        </div>
      </div>
    </div>
  );
}