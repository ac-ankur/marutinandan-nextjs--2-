"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { variants } from "@/data/products";

export default function VariantsToggle() {
  const [active, setActive] = useState("black");
  const panelRef = useRef(null);
  const dropRef = useRef(null);
  const isFirstRender = useRef(true);

  const data = variants[active];

  const switchTo = (key) => {
    if (key === active) return;
    gsap.to([panelRef.current, dropRef.current], {
      opacity: 0,
      y: 12,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => setActive(key),
    });
  };

  // Animate the panel back in every time the active variant changes
  // (including the very first mount), instead of relying on a DOM
  // load event that never fires on a <div>.
  useEffect(() => {
    gsap.fromTo(
      [panelRef.current, dropRef.current],
      { opacity: 0, y: isFirstRender.current ? 20 : -12 },
      { opacity: 1, y: 0, duration: isFirstRender.current ? 0.8 : 0.4, ease: "power2.out" }
    );
    isFirstRender.current = false;
  }, [active]);

  return (
    <section className="bg-pine-900 px-4 py-16 sm:px-6 sm:py-24 lg:px-10 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <p className="text-center text-xs uppercase tracking-[0.3em] text-gold-light">— Our Products —</p>
        <h2 className="mt-4 text-center font-display text-4xl text-cream sm:text-5xl">
          Currently <span className="italic text-gold-light">Available.</span>
        </h2>

        <div className="mx-auto mt-10 flex w-full max-w-[320px] flex-wrap justify-center rounded-full bg-pine-950/50 p-1.5 sm:w-fit sm:max-w-none">
          {Object.values(variants).map((v) => (
            <button
              key={v.key}
              onClick={() => switchTo(v.key)}
              data-cursor-hover
              className={`rounded-full px-6 py-2.5 text-sm font-medium transition-colors ${
                active === v.key ? "bg-gold text-pine-950" : "text-cream/70 hover:text-cream"
              }`}
            >
              {v.name}
            </button>
          ))}
        </div>

        <div className="mt-12 grid items-center gap-10 sm:mt-16 lg:grid-cols-2 lg:gap-16">
          <div ref={dropRef} className="relative mx-auto flex justify-center">
            <span className="absolute -top-8 left-6 text-2xl">✽</span>
            <span className="absolute right-8 top-0 text-xl">✽</span>
            <div
              className="absolute h-64 w-64 rounded-full opacity-30 blur-3xl"
              style={{ background: data.accent }}
            />
            <svg width="220" height="286" viewBox="0 0 46 60" fill="none" className="relative drop-shadow-2xl">
              <path
                d="M23 2C23 2 43 30 43 42C43 53.0457 34.0457 60 23 60C11.9543 60 3 53.0457 3 42C3 30 23 2 23 2Z"
                fill={data.accent}
              />
              <ellipse cx="16" cy="26" rx="4.5" ry="9" fill="#fff" opacity="0.35" />
            </svg>
            <div className="absolute -right-4 top-10 rounded-2xl bg-pine-950/60 px-5 py-4 text-center backdrop-blur sm:-right-10">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gold-light">Pungency</p>
              <p className="font-display text-3xl text-gold-light">{data.pungency}</p>
              <p className="text-[10px] text-cream/50">Allyl Isothiocyanate</p>
            </div>
          </div>

          <div ref={panelRef}>
            <p className="font-display text-lg italic text-gold-light">{data.tagline}</p>
            <h3 className="mt-2 font-display text-4xl text-cream">
              {active === "black" ? "Black" : "Yellow"}
              <br />
              <span className="italic text-gold-light">Mustard Oil</span>
            </h3>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-cream/70">{data.shortDescription}</p>

            <ul className="mt-7 space-y-3">
              {data.features.slice(0, 5).map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-cream/80">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-gold-light/50 text-gold-light">
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href={`/products?variant=${active}`}
              data-cursor-hover
              className="mt-9 inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-pine-950 transition-transform hover:scale-[1.02]"
            >
              View Pack Sizes →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
