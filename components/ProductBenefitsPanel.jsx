"use client";

import Link from "next/link";
import { ShieldCheck, Flame, HeartPulse, Sparkles, Check, X, ArrowRight, Award } from "lucide-react";

export default function ProductBenefitsPanel({ product, crossFlavour = [] }) {
  const isYellow = product.variant === "yellow";
  const otherVariantName = isYellow ? "Black Mustard Oil" : "Yellow Mustard Oil";
  const otherVariantPungency = isYellow ? "Sharp & High Pungency (0.36%)" : "Mild & Golden (0.30%)";

  return (
    <div className="space-y-4">
      {/* 1. Cross-sell: Same size, other variety */}
      {crossFlavour.length > 0 && (
        <div className="rounded-2xl border border-gold-deep/20 bg-gradient-to-br from-white/90 via-cream-paper to-white/70 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-pine-900 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-gold-deep" />
              Also Available in {isYellow ? "Black Variant" : "Yellow Variant"}
            </span>
            <span className="text-[10px] rounded-full bg-gold/20 px-2 py-0.5 font-semibold text-gold-deep">
              Alternative
            </span>
          </div>

          {crossFlavour.map((p) => (
            <Link
              key={p.slug}
              href={`/products/${p.slug}`}
              className="group flex items-center gap-3.5 rounded-xl border border-ink/10 bg-white p-3 transition-all hover:border-gold-deep hover:shadow-md"
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg p-1"
                style={{ background: p.variant === "yellow" ? "#FFF8E7" : "#1A2E20" }}
              >
                <span
                  className="h-5 w-5 rounded-full ring-2 ring-white shadow-sm"
                  style={{ background: p.variant === "yellow" ? "#E7C25C" : "#6B4500" }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-bold text-pine-900 group-hover:text-gold-deep transition-colors">
                  {otherVariantName}
                </p>
                <p className="text-xs text-ink/55">
                  {otherVariantPungency} · <strong className="text-pine-900 font-semibold">₹{p.mrp}</strong>
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-gold-deep group-hover:translate-x-0.5 transition-transform">
                <span>Switch</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* 2. 4 Purity & Quality Trust Badges */}
      <div className="grid grid-cols-2 gap-2.5">
        {[
          {
            icon: "🧪",
            title: "NABL Lab Tested",
            sub: "Batch tested for zero adulteration",
          },
          {
            icon: "🌿",
            title: "100% Cold Pressed",
            sub: "Traditional Kachi Ghani at < 45°C",
          },
          {
            icon: "🚫",
            title: "Zero Argemone",
            sub: "No mineral oil, no synthetic colours",
          },
          {
            icon: "📦",
            title: "Tamper-Proof Seal",
            sub: "Locks aroma, freshness & pungency",
          },
        ].map(({ icon, title, sub }) => (
          <div
            key={title}
            className="flex items-start gap-2.5 rounded-xl border border-ink/8 bg-white/70 p-3 transition-all hover:bg-white hover:shadow-sm"
          >
            <span className="text-xl leading-none select-none">{icon}</span>
            <div>
              <p className="text-xs font-bold text-pine-950">{title}</p>
              <p className="text-[11px] text-ink/55 leading-tight mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 3. The Cold-Pressed vs Refined Comparison Card */}
      <div className="rounded-2xl border border-ink/10 bg-white/80 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3 border-b border-ink/8 pb-2">
          <p className="text-xs font-bold uppercase tracking-wider text-pine-900 flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-gold-deep" />
            The Cold-Pressed Difference
          </p>
          <span className="text-[10px] text-ink/45 font-medium">Why it matters</span>
        </div>

        <div className="space-y-2.5 text-xs">
          {/* Row 1: Heat */}
          <div className="rounded-lg bg-cream-paper p-2.5">
            <div className="flex items-center justify-between text-[11px] font-semibold">
              <span className="text-emerald-800 flex items-center gap-1">
                <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[3]" />
                Marutinandan Kachi Ghani
              </span>
              <span className="text-rose-700 flex items-center gap-1">
                <X className="h-3.5 w-3.5 text-rose-500 stroke-[3]" />
                Refined / Solvent Oil
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-ink/65">
              <span>Single cold-pressed below 45°C</span>
              <span>Heated to 200°C+ with Hexane</span>
            </div>
          </div>

          {/* Row 2: Nutrients */}
          <div className="rounded-lg bg-cream-paper p-2.5">
            <div className="flex items-center justify-between text-[11px] font-semibold">
              <span className="text-emerald-800 flex items-center gap-1">
                <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[3]" />
                Natural Nutrients Intact
              </span>
              <span className="text-rose-700 flex items-center gap-1">
                <X className="h-3.5 w-3.5 text-rose-500 stroke-[3]" />
                Nutrients Stripped
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-ink/65">
              <span>Rich in Omega-3, MUFA & Vit. E</span>
              <span>Bleached, deodorized chemically</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Culinary Best Uses Quick Strip */}
      <div className="rounded-2xl border border-ink/10 bg-cream-paper p-3.5">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-pine-900 flex items-center gap-1.5">
          <Flame className="h-3.5 w-3.5 text-gold-deep" />
          Best Suited For
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs text-ink/75">
          <div className="flex items-center gap-2 rounded-lg bg-white/70 px-2.5 py-1.5">
            <span>🍲</span>
            <span className="font-medium text-[11px]">Tadka & Curries</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white/70 px-2.5 py-1.5">
            <span>🥒</span>
            <span className="font-medium text-[11px]">Pickles & Achars</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white/70 px-2.5 py-1.5">
            <span>🍳</span>
            <span className="font-medium text-[11px]">High Heat Frying (250°C)</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white/70 px-2.5 py-1.5">
            <span>💆</span>
            <span className="font-medium text-[11px]">Hair & Body Massage</span>
          </div>
        </div>
      </div>

      {/* 5. Direct from Mill Guarantee Link */}
      <div className="flex items-center justify-between rounded-xl border border-emerald-600/20 bg-emerald-50/60 px-3.5 py-2.5 text-xs text-emerald-900">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-medium text-[11px]">
            100% Direct from Mill · Verified Lab Report
          </span>
        </div>
        <Link
          href="/lab-report"
          className="font-bold text-emerald-700 hover:text-emerald-900 underline text-[11px] shrink-0"
        >
          View Lab Report →
        </Link>
      </div>
    </div>
  );
}
