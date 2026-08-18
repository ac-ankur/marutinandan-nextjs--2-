"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
    <section className="bg-pine-900 px-4 py-10 sm:px-6 sm:py-24 lg:px-10 lg:py-22">
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

        <div className="mt-12 grid items-center gap-10 sm:mt-16 lg:grid-cols-2 lg:gap-14">
          <div ref={dropRef} className="relative mx-auto flex w-full max-w-xl items-center justify-center lg:max-w-2xl">
            <span className="absolute -top-6 left-2 text-2xl text-gold-light/40">✽</span>
            <span className="absolute right-4 top-2 text-xl text-gold-light/40">✽</span>
            <div
              className="absolute h-96 w-96 rounded-full opacity-35 blur-3xl pointer-events-none"
              style={{ background: data.accent }}
            />
            <div
              className="relative h-[460px] w-full max-w-[480px] sm:h-[540px] sm:max-w-[560px] lg:h-[600px] lg:max-w-[600px]"
              style={{
                WebkitMaskImage: "radial-gradient(ellipse 68% 68% at 50% 50%, black 30%, rgba(0, 0, 0, 0.75) 52%, transparent 72%)",
                maskImage: "radial-gradient(ellipse 68% 68% at 50% 50%, black 30%, rgba(0, 0, 0, 0.75) 52%, transparent 72%)",
              }}
            >
              <Image
                src={data.image || (active === "black" ? "/images/blackmustard.png" : "/images/yellowmustard.png")}
                alt={data.name}
                fill
                className="object-contain drop-shadow-2xl transition-transform duration-300 scale-115"
                sizes="(max-width: 768px) 480px, 600px"
                priority
              />
            </div>
            <div className="absolute right-0 top-6 z-10 rounded-2xl border border-gold-light/30 bg-pine-950/85 px-5 py-4 text-center backdrop-blur-md shadow-2xl sm:right-2 sm:top-10 lg:-right-4 lg:top-12">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-gold-light">Pungency</p>
              <p className="font-display text-3xl text-gold-light">{data.pungency}</p>
              <p className="text-[10px] text-cream/60">Allyl Isothiocyanate</p>
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
