"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function HorizontalGallery({ items }) {
  const wrapRef = useRef(null);
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const track = trackRef.current;
      const distance = () => Math.max(track.scrollWidth - window.innerWidth, 0);

      const trackTween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top top",
          end: () => `+=${distance()}`,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      gsap.utils.toArray(".gallery-card").forEach((card) => {
        gsap.fromTo(
          card,
          { opacity: 0.4, scale: 0.92 },
          {
            opacity: 1,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "left 90%",
              end: "left 40%",
              scrub: true,
              horizontal: true,
              containerAnimation: trackTween,
            },
          }
        );
      });
    }, wrapRef);

    return () => ctx.revert();
  }, [items]);

  // Wrapper is tall enough to give the sticky panel room to scroll through;
  // no gsap pin / DOM restructuring involved, so React's own unmount/route
  // transitions never fight with GSAP over node ownership.
  return (
    <div ref={wrapRef} className="relative" style={{ height: `${items.length * 42 + 60}vh` }}>
      <section ref={sectionRef} className="sticky top-0 h-screen overflow-hidden bg-pine-950">
        <div className="absolute left-6 top-8 z-10 lg:left-10 lg:top-10">
          <p className="text-xs uppercase tracking-[0.3em] text-gold-light">Scroll to explore</p>
          <h2 className="mt-2 max-w-md font-display text-3xl text-cream lg:text-4xl">
            Every bottle, <span className="italic text-gold-light">every size.</span>
          </h2>
        </div>
        <div
          ref={trackRef}
          className="flex h-full w-max items-center gap-6 px-6 pt-24 will-change-transform lg:gap-10 lg:px-10"
        >
          {items.map((item) => (
            <Link
              href={`/products/${item.slug}`}
              key={item.slug}
              data-cursor-hover
              className="gallery-card group relative flex h-[420px] w-[300px] flex-shrink-0 flex-col justify-end overflow-hidden rounded-3xl border border-cream/10 bg-gradient-to-b from-pine-800 to-pine-900 p-7 transition-transform hover:-translate-y-1 lg:h-[480px] lg:w-[340px]"
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
      </section>
    </div>
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
