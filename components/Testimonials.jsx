"use client";

import { useEffect, useRef, useState } from "react";
import { createScope, animate, stagger } from "animejs";
import { Star, Quote, CheckCircle2, Sparkles, HeartHandshake, ShieldCheck } from "lucide-react";

const TESTIMONIALS = [
  {
    id: 1,
    title: "Exceptional Quality!",
    rating: 5,
    content:
      "Marutinandan oils are very good in quality. I love that there are absolutely no harsh fumes or eye irritation during cooking. Highly recommended!",
    author: "Satisfied Home Cook",
    location: "India",
    tagline: "No Harsh Fumes · 100% Pure",
    badge: "Most Helpful Review",
    accent: "#E3922B",
  },
  {
    id: 2,
    title: "Authentic & Pure!",
    rating: 5,
    content:
      "Maruti Nandan mustard oil has that perfect strong aroma (jhal) and rich flavor needed for traditional cooking. It's totally non-sticky, completely unrefined, and makes every dish or pickle taste amazing. Totally worth it!",
    author: "Traditional Recipe Lover",
    location: "India",
    tagline: "Authentic Jhal Aroma · Unrefined",
    badge: "Verified Buyer",
    accent: "#F2B65C",
  },
];

export default function Testimonials() {
  const rootRef = useRef(null);
  const containerRef = useRef(null);
  const cardRefs = useRef([]);
  const starGroupRefs = useRef([]);
  const quoteIconRefs = useRef([]);
  const blobRefs = useRef([]);
  const scopeRef = useRef(null);
  const hasEnteredRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    scopeRef.current = createScope({ root: rootRef.current }).add(() => {
      // Floating ambient background glow circles
      blobRefs.current.forEach((blob, i) => {
        if (!blob) return;
        animate(blob, {
          translateX: i % 2 === 0 ? [0, 35, -25, 0] : [0, -30, 20, 0],
          translateY: i % 2 === 0 ? [0, -25, 20, 0] : [0, 30, -25, 0],
          scale: [1, 1.15, 0.92, 1],
          duration: 15000 + i * 3000,
          ease: "inOutSine",
          loop: true,
        });
      });

      // Scroll trigger reveal
      const container = containerRef.current;
      if (!container) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !hasEnteredRef.current) {
              hasEnteredRef.current = true;

              // Animate main cards entrance
              animate(cardRefs.current, {
                opacity: [0, 1],
                translateY: [40, 0],
                scale: [0.94, 1],
                duration: 900,
                delay: stagger(180),
                ease: "outElastic(1, .75)",
              });

              // Pop star icons in sequence
              animate(starGroupRefs.current, {
                scale: [0, 1],
                rotate: [-45, 0],
                duration: 700,
                delay: stagger(100, { start: 300 }),
                ease: "outBack",
              });

              // Rotate quote marks softly
              animate(quoteIconRefs.current, {
                rotate: [-20, 0],
                scale: [0.7, 1],
                duration: 800,
                delay: stagger(150, { start: 200 }),
                ease: "outQuad",
              });

              observer.disconnect();
            }
          });
        },
        { threshold: 0.15 }
      );

      observer.observe(container);
    });

    return () => scopeRef.current?.revert();
  }, []);

  const handleMouseMove = (index) => (e) => {
    const card = cardRefs.current[index];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  const handleMouseEnter = (index) => () => {
    setActiveIndex(index);
    animate(cardRefs.current[index], {
      translateY: -8,
      scale: 1.02,
      duration: 400,
      ease: "outQuad",
    });
  };

  const handleMouseLeave = (index) => () => {
    animate(cardRefs.current[index], {
      translateY: 0,
      scale: 1,
      duration: 450,
      ease: "outQuad",
    });
  };

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden bg-pine-950 px-6 py-12 text-cream lg:px-10 lg:py-16"
    >
      {/* Background ambient lighting */}
      <div
        ref={(el) => (blobRefs.current[0] = el)}
        className="pointer-events-none absolute -left-20 -top-20 h-[22rem] w-[22rem] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #E3922B, transparent 70%)" }}
      />
      <div
        ref={(el) => (blobRefs.current[1] = el)}
        className="pointer-events-none absolute -bottom-24 -right-24 h-[24rem] w-[24rem] rounded-full opacity-15 blur-3xl"
        style={{ background: "radial-gradient(circle, #1E5C33, transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-6xl">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1 backdrop-blur-md">
            <Sparkles className="h-3 w-3 text-gold-light animate-pulse" />
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold-light">
              Customer Feedbacks
            </span>
          </div>

          <h2 className="mt-3 font-display text-2xl leading-tight sm:text-4xl text-cream">
            Loved for Purity, <span className="italic text-gold-light">Trusted for Flavor.</span>
          </h2>
        </div>

        {/* Feedback Cards Grid */}
        <div
          ref={containerRef}
          className="mt-8 grid gap-6 lg:grid-cols-2 lg:gap-8"
        >
          {TESTIMONIALS.map((item, index) => {
            const isHighlighted = activeIndex === index;

            return (
              <div
                key={item.id}
                ref={(el) => (cardRefs.current[index] = el)}
                onMouseMove={handleMouseMove(index)}
                onMouseEnter={handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave(index)}
                className={`group relative overflow-hidden rounded-2xl border p-6 sm:p-7 transition-all duration-300 backdrop-blur-xl ${
                  isHighlighted
                    ? "border-gold/60 bg-gradient-to-b from-pine-900/90 via-pine-900/60 to-pine-950/80 shadow-[0_12px_35px_-12px_rgba(227,146,43,0.2)]"
                    : "border-cream/15 bg-pine-900/40 shadow-lg hover:border-gold/40"
                }`}
                style={{ "--mouse-x": "50%", "--mouse-y": "50%" }}
              >
                {/* Interactive cursor spotlight inside card */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(280px circle at var(--mouse-x) var(--mouse-y), ${item.accent}18, transparent 75%)`,
                  }}
                />

                {/* Top Header Badge & Star Rating */}
                <div className="relative flex flex-wrap items-center justify-between gap-3">
                  <div
                    ref={(el) => (starGroupRefs.current[index] = el)}
                    className="flex items-center gap-1 rounded-full bg-gold/15 px-3 py-1 border border-gold/30"
                  >
                    {[...Array(item.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5 fill-gold-light text-gold-light"
                      />
                    ))}
                    <span className="ml-1 text-[11px] font-bold tracking-wider text-gold-light">
                      5.0
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-full border border-pine-700 bg-pine-800/60 px-3 py-0.5 text-[11px] font-medium text-cream/90">
                    <CheckCircle2 className="h-3 w-3 text-gold" />
                    {item.badge}
                  </span>
                </div>

                {/* Main Quote Content */}
                <div className="relative mt-4">
                  <div
                    ref={(el) => (quoteIconRefs.current[index] = el)}
                    className="mb-2 inline-block rounded-xl bg-gold/10 p-2 text-gold-light border border-gold/20"
                  >
                    <Quote className="h-4 w-4 rotate-180" />
                  </div>

                  <h3 className="font-display text-lg font-semibold text-cream sm:text-xl">
                    &ldquo;{item.title}&rdquo;
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-cream/85 font-light sm:text-base sm:leading-relaxed">
                    {item.content}
                  </p>
                </div>

                {/* Footer Tagline & Customer Info */}
                <div className="relative mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-cream/10 pt-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-deep text-pine-950 font-bold text-sm shadow">
                      {item.author.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-cream text-sm leading-snug">
                        {item.author}
                      </p>
                      <p className="text-[11px] text-gold-light/90">
                        {item.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-cream/60 bg-cream/5 px-2.5 py-1 rounded-lg border border-cream/10">
                    <ShieldCheck className="h-3.5 w-3.5 text-gold-light" />
                    <span>Verified Feedback</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Trust Highlights */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-cream/70">
          <div className="flex items-center gap-1.5 rounded-full border border-cream/10 bg-cream/5 px-4 py-1.5 backdrop-blur-md">
            <CheckCircle2 className="h-3.5 w-3.5 text-gold" />
            <span>Zero Harsh Fumes & Eye Irritation</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-cream/10 bg-cream/5 px-4 py-1.5 backdrop-blur-md">
            <HeartHandshake className="h-3.5 w-3.5 text-gold" />
            <span>Authentic Jhal Aroma</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-cream/10 bg-cream/5 px-4 py-1.5 backdrop-blur-md">
            <ShieldCheck className="h-3.5 w-3.5 text-gold" />
            <span>100% Unrefined & Chemical-Free</span>
          </div>
        </div>
      </div>
    </section>
  );
}
