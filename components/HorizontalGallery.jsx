"use client";

import Link from "next/link";

export default function HorizontalGallery({ items }) {
  const loopItems = [...items, ...items];

  return (
    <section className="relative overflow-hidden bg-pine-950 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-gold-light">Explore</p>
          <h2 className="mt-2 font-display text-3xl text-cream lg:text-4xl">
            Every bottle, <span className="italic text-gold-light">every size.</span>
          </h2>
        </div>
      </div>

      <div className="overflow-hidden">
        <div className="scroll-loop whitespace-nowrap py-12">
          {loopItems.map((item, index) => (
            <Link
              href={`/products/${item.slug}`}
              key={`${item.slug}-${index}`}
              data-cursor-hover
              className="gallery-card group relative inline-flex h-[420px] w-[300px] flex-col justify-end overflow-hidden rounded-3xl border border-cream/10 bg-gradient-to-b from-pine-800 to-pine-900 p-7 text-left transition-transform hover:-translate-y-1 lg:h-[480px] lg:w-[340px]"
            >
              <div
                className="absolute right-6 top-6 h-24 w-24 rounded-full opacity-80 blur-2xl"
                style={{ background: item.variantData.accent }}
              />
              <div className="relative z-10 mb-6 flex justify-center">
                <DropletIcon color={item.variantData.accent} />
              </div>
              <div className="relative z-10">
                <p className="text-xs uppercase tracking-[0.25em] text-gold-light">
                  {item.size} · {item.stockUnit}
                </p>
                <h3 className="mt-2 font-display text-2xl text-cream">{item.variantData.name}</h3>
                <p className="mt-2 text-sm text-cream/60">{item.variantData.tagline}</p>
                <div className="mt-5 flex items-center justify-between border-t border-cream/10 pt-4">
                  <span className="font-display text-lg text-gold-light">₹{item.mrp}</span>
                  <span className="text-xs text-cream/70 group-hover:text-cream">View SKU →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function DropletIcon({ color = "#D3A02E", size = 56 }) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 46 60" fill="none">
      <path
        d="M23 2C23 2 43 30 43 42C43 53.0457 34.0457 60 23 60C11.9543 60 3 53.0457 3 42C3 30 23 2 23 2Z"
        fill={color}
        opacity="0.92"
      />
    </svg>
  );
}
