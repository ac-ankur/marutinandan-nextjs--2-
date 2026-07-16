"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";

const BADGES = ["100% Pure & Natural", "Cold Pressed", "No Chemical Refining", "No Artificial Preservatives"];

export default function Hero() {
  const rootRef = useRef(null);
  const dropRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 1.9, defaults: { ease: "power3.out" } });
      tl.fromTo(".hero-eyebrow", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 })
        .fromTo(".hero-line", { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: 0.12 }, "-=0.3")
        .fromTo(".hero-sub", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, "-=0.5")
        .fromTo(".hero-copy", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, "-=0.6")
        .fromTo(".hero-cta", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.1 }, "-=0.6")
        .fromTo(".hero-badge", { opacity: 0 }, { opacity: 1, duration: 0.5, stagger: 0.08 }, "-=0.4")
        .fromTo(
          ".hero-pillars > div",
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power2.out" },
          "-=0.3"
        )
        .fromTo(dropRef.current, { scale: 0, rotate: -25 }, { scale: 1, rotate: 0, duration: 1.1, ease: "elastic.out(1,0.6)" }, "-=1.4")
        .fromTo(ringRef.current, { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 1 }, "-=1");

      gsap.to(ringRef.current, { rotate: 360, duration: 40, ease: "none", repeat: -1 });

      gsap.to(dropRef.current, {
        y: -14,
        duration: 2.4,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });

      const onMove = (e) => {
        const { innerWidth, innerHeight } = window;
        const relX = (e.clientX / innerWidth - 0.5) * 2;
        const relY = (e.clientY / innerHeight - 0.5) * 2;
        gsap.to(dropRef.current, { x: relX * 22, rotate: relX * 8, duration: 0.6, ease: "power2.out" });
        gsap.to(ringRef.current, { x: relX * 10, y: relY * 10, duration: 0.8, ease: "power2.out" });
      };
      rootRef.current.addEventListener("mousemove", onMove);
      return () => rootRef.current?.removeEventListener("mousemove", onMove);
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="relative overflow-hidden pb-16 pt-28 sm:pb-20 sm:pt-40 lg:pb-32 lg:pt-52">
      <FloatingBlossoms />

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:gap-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-10">
        <div className="text-center sm:text-left">
          <div className="hero-eyebrow inline-flex items-center gap-2 rounded-full border border-pine-800/30 px-4 py-2 text-xs uppercase tracking-[0.2em] text-pine-800">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" /> Ghar Ghar Ka Tel
          </div>

          <h1 className="mt-8 font-display leading-[0.95] text-pine-900 text-[clamp(2.75rem,9vw,6.5rem)]">
            <span className="block overflow-hidden">
              <span className="hero-line block">Pure. Honest.</span>
            </span>
            <span className="block overflow-hidden">
              <span className="hero-line block text-gold-deep italic">Cold-Pressed.</span>
            </span>
          </h1>

          <p className="hero-sub mt-4 font-display text-3xl text-ink/70 sm:text-4xl">
            Premium Cold-Pressed <span className="text-pine-800">Edible Oils</span> for Healthy Everyday Cooking
          </p>

          <p className="hero-copy mt-6 max-w-lg text-base leading-relaxed text-ink/70">
            At <strong>Yugika Foods Private Limited</strong>, we believe that good health begins with pure ingredients. Our premium cold-pressed edible oils are produced using advanced low-temperature extraction methods that preserve natural nutrients, authentic aroma, and rich flavour—bringing wholesome goodness to every kitchen.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-4 sm:justify-start">
            <Link
              href="/products"
              data-cursor-hover
              className="hero-cta group inline-flex items-center gap-2 rounded-full bg-pine-800 px-7 py-3.5 text-sm font-medium text-cream transition-all hover:bg-pine-700"
            >
              Explore Products
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/about"
              data-cursor-hover
              className="hero-cta rounded-full border border-pine-800/40 px-7 py-3.5 text-sm font-medium text-pine-900 transition-colors hover:bg-pine-900 hover:text-cream"
            >
              Learn More
            </Link>
          </div>

          <div className="mt-12 hidden gap-x-8 gap-y-3 text-sm text-ink/70 lg:flex lg:flex-wrap">
            {BADGES.map((b) => (
              <span key={b} className="hero-badge flex items-center gap-2">
                <CheckIcon /> {b}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto flex h-[280px] w-full max-w-[320px] items-center justify-center sm:h-[360px] sm:max-w-[360px] lg:h-[520px] lg:w-[520px] lg:max-w-none">
          <div
            ref={ringRef}
            className="absolute inset-0 rounded-full border border-dashed border-gold-deep/40"
          />
          <div className="absolute inset-10 rounded-full border border-gold-deep/20" />
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-cream-paper shadow-[0_30px_80px_-30px_rgba(21,56,38,0.35)]">
            <span className="font-display text-sm tracking-[0.3em] text-pine-800/40">MN LOGO</span>
          </div>
          <svg
            ref={dropRef}
            className="absolute -bottom-4 right-8 drop-shadow-xl lg:right-14"
            width="120"
            height="156"
            viewBox="0 0 46 60"
            fill="none"
          >
            <path
              d="M23 2C23 2 43 30 43 42C43 53.0457 34.0457 60 23 60C11.9543 60 3 53.0457 3 42C3 30 23 2 23 2Z"
              fill="url(#heroDrop)"
            />
            <ellipse cx="17" cy="28" rx="4" ry="8" fill="#FCE9B8" opacity="0.7" />
            <defs>
              <linearGradient id="heroDrop" x1="3" y1="2" x2="43" y2="60" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F0CB6E" />
                <stop offset="1" stopColor="#C98F1F" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <div className="mx-auto mt-14 max-w-7xl px-4 sm:mt-16 sm:px-6 lg:px-10">
        <div className="hero-pillars grid gap-px overflow-hidden rounded-3xl border border-pine-900/10 bg-pine-900/10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => (
            <div key={p.title} className="group flex flex-col gap-3 bg-cream-paper p-6 transition-colors hover:bg-pine-900">
              <p.icon className="text-pine-800 transition-colors group-hover:text-gold-light" />
              <p className="font-display text-lg text-pine-900 transition-colors group-hover:text-cream">
                {p.title}
              </p>
              <p className="text-sm leading-relaxed text-ink/60 transition-colors group-hover:text-cream/70">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 flex justify-center">
        <div className="flex flex-col items-center gap-2 text-xs uppercase tracking-[0.3em] text-ink/40">
          <span>Scroll</span>
          <span className="h-8 w-px animate-pulse bg-ink/30" />
        </div>
      </div>
    </section>
  );
}

const PILLARS = [
  {
    title: "Zero Heat",
    desc: "Single-pressed at room temperature — the seed is never cooked, so nothing is lost.",
    icon: NoHeatIcon,
  },
  {
    title: "Zero Chemicals",
    desc: "No hexane, no solvents, no refining agents. Just seed and steel.",
    icon: NoChemicalIcon,
  },
  {
    title: "Zero Adulteration",
    desc: "No Argemone, no mineral oil, no synthetic colour — verified on every batch.",
    icon: ShieldIcon,
  },
  {
    title: "100% Pure",
    desc: "Nothing added, nothing taken away. Pure as it gets, drop for drop.",
    icon: PureDropIcon,
  },
];

function NoHeatIcon({ className = "" }) {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2v11a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="12" cy="17.5" r="1.4" fill="currentColor" />
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function NoChemicalIcon({ className = "" }) {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M9 2h6M10 2v6l-5 9.5A2 2 0 0 0 6.8 21h10.4a2 2 0 0 0 1.8-3.5L14 8V2" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M8 15h8" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon({ className = "" }) {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2.5l7.5 3v5.2c0 5-3.2 8.7-7.5 10.8-4.3-2.1-7.5-5.8-7.5-10.8V5.5l7.5-3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M8.5 12l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PureDropIcon({ className = "" }) {
  return (
    <svg width="26" height="34" viewBox="0 0 46 60" fill="none" className={className}>
      <path
        d="M23 2C23 2 43 30 43 42C43 53.0457 34.0457 60 23 60C11.9543 60 3 53.0457 3 42C3 30 23 2 23 2Z"
        stroke="currentColor"
        strokeWidth="2.4"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M3 8.5L6.2 11.5L13 4.5" stroke="#215539" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FloatingBlossoms() {
  const positions = [
    { top: "12%", left: "4%", size: 22, delay: 0 },
    { top: "68%", left: "8%", size: 16, delay: 0.6 },
    { top: "22%", left: "94%", size: 18, delay: 1.1 },
  ];
  return (
    <>
      {positions.map((p, i) => (
        <span
          key={i}
          className="absolute animate-[float_6s_ease-in-out_infinite] opacity-70"
          style={{ top: p.top, left: p.left, animationDelay: `${p.delay}s` }}
        >
          <svg width={p.size} height={p.size} viewBox="0 0 24 24" fill="#D3A02E">
            <path d="M12 2c1.5 2 1.5 4 0 6-1.5-2-1.5-4 0-6zM12 16c1.5 2 1.5 4 0 6-1.5-2-1.5-4 0-6zM2 12c2-1.5 4-1.5 6 0-2 1.5-4 1.5-6 0zM16 12c2-1.5 4-1.5 6 0-2 1.5-4 1.5-6 0zM5 5c2 0 3.5 1.5 4 4-2.5-.5-4-2-4-4zM15 15c2 0 3.5 1.5 4 4-2.5-.5-4-2-4-4zM19 5c-2 0-3.5 1.5-4 4 2.5-.5 4-2 4-4zM9 15c-2 0-3.5 1.5-4 4 2.5-.5 4-2 4-4z" />
          </svg>
        </span>
      ))}
    </>
  );
}
