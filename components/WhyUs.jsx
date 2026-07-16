"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const REASONS = [
  {
    title: "Traditional Cold-Pressed Extraction",
    desc: "Every drop is extracted at low temperatures to preserve natural nutrients, antioxidants, aroma, and flavour.",
  },
  {
    title: "Carefully Selected Seeds",
    desc: "We source premium-quality seeds from trusted suppliers to ensure consistent quality and purity.",
  },
  {
    title: "Naturally Nutritious",
    desc: "Our oils retain their natural goodness without harsh refining or chemical solvent extraction.",
  },
  {
    title: "Quality You Can Trust",
    desc: "From sourcing to packaging, every batch is produced under stringent quality and hygiene standards.",
  },
];

export default function WhyUs() {
  const gridRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".why-card",
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: gridRef.current, start: "top 80%" },
        }
      );
    }, gridRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="bg-cream px-6 py-24 lg:px-10 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold-deep">— Why Us —</p>
            <h2 className="mt-4 max-w-lg font-display text-4xl leading-tight text-pine-900 sm:text-5xl">
              Why Choose <span className="italic text-gold-deep">Yugika Foods?</span>
            </h2>
          </div>
        </div>

        <div ref={gridRef} className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((r, i) => (
            <div
              key={r.title}
              className="why-card group rounded-3xl border border-ink/10 bg-cream-paper p-7 transition-shadow hover:shadow-[0_20px_50px_-25px_rgba(21,56,38,0.35)]"
            >
              <span className="font-display text-3xl text-gold-deep">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-5 font-display text-xl text-pine-900">{r.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/65">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
