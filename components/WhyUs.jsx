"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const REASONS = [
  {
    title: "Single Cold Press",
    desc: "Kachi Ghani milling keeps oil under low friction heat — nutrients and aroma stay locked in.",
  },
  {
    title: "Zero Additives",
    desc: "No hexane, no refining chemicals, no argemone oil, no mineral oil. Just the seed.",
  },
  {
    title: "Batch-Tested Purity",
    desc: "Every batch is verified by an NABL & ISO/IEC 17025 accredited lab before it reaches you.",
  },
  {
    title: "Farm-Direct Sourcing",
    desc: "Seeds are sourced directly from trusted growing belts, pressed close to harvest.",
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
              What makes every bottle <span className="italic text-gold-deep">different.</span>
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
