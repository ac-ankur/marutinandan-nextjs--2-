"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";

const STATS = [
  {
    value: "100%",
    label: "Pure & natural — nothing added, nothing taken away.",
    icon: PureDropIcon,
  },
  {
    value: "0°",
    label: "Heat used in pressing. The seed is never cooked.",
    icon: NoHeatIcon,
  },
  {
    value: "Zero",
    label: "Hexane, solvents, or refining agents. Just seed and steel.",
    icon: NoChemicalIcon,
  },
  {
    value: "Every Batch",
    label: "Checked for purity before it leaves the mill.",
    icon: ShieldIcon,
  },
];

export default function Hero() {
  const rootRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3, defaults: { ease: "power3.out" } });
      tl.fromTo(".hero-eyebrow", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 })
        .fromTo(".hero-tagline", { opacity: 0 }, { opacity: 1, duration: 0.7 }, "-=0.4")
        .fromTo(".hero-line", { yPercent: 110 }, { yPercent: 0, duration: 0.9, stagger: 0.1 }, "-=0.5")
        .fromTo(".hero-swash", { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.7, ease: "power2.out" }, "-=0.3")
        .fromTo(".hero-copy", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, "-=0.4")
        .fromTo(".hero-cta", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08 }, "-=0.4")
        .fromTo(
          ".hero-blob",
          { scale: 0.85, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1, ease: "back.out(1.4)" },
          "-=0.6"
        )
        .fromTo(".hero-ring", { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.9 }, "-=0.9")
        .fromTo(
          ".hero-branch",
          { strokeDasharray: "1000 1000", strokeDashoffset: "1000", opacity: 0 },
          { strokeDasharray: "1000 1000", strokeDashoffset: "0", opacity: 1, duration: 1.1, ease: "power2.inOut" },
          "-=0.6"
        )
        .fromTo(".hero-leaf-drift", { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12 }, "-=0.5")
        .fromTo(".hero-chip", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.55, stagger: 0.15, ease: "back.out(1.6)" }, "-=0.5")
        .fromTo(".hero-vertical-tag", { opacity: 0 }, { opacity: 1, duration: 0.8 }, "-=0.4")
        .fromTo(".hero-transition-leaf", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.06 }, "-=0.3")
        .fromTo(".hero-stat", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08 }, "-=0.1");

      gsap.to(".hero-ring", { rotate: 360, duration: 50, ease: "none", repeat: -1 });
      gsap.to(".hero-leaf-spin", { rotate: 360, duration: 22, ease: "none", repeat: -1 });

      gsap.to(".hero-chip-float", {
        y: -10,
        duration: 2.6,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        stagger: 0.4,
      });

      gsap.to(".hero-leaf-sway", {
        rotate: 6,
        transformOrigin: "top center",
        duration: 3.2,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        stagger: 0.5,
      });

      const onMove = (e) => {
        const { innerWidth, innerHeight } = window;
        const relX = (e.clientX / innerWidth - 0.5) * 2;
        const relY = (e.clientY / innerHeight - 0.5) * 2;
        gsap.to(".hero-blob", { x: relX * 8, y: relY * 6, duration: 0.8, ease: "power2.out" });
        gsap.to(".hero-glow", { x: relX * -18, y: relY * -12, duration: 1.2, ease: "power2.out" });
      };
      rootRef.current.addEventListener("mousemove", onMove);
      return () => rootRef.current?.removeEventListener("mousemove", onMove);
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="relative overflow-hidden bg-cream pb-0 pt-28 sm:pt-32">
      {/* Ambient glow */}
      <div className="hero-glow pointer-events-none absolute -left-32 top-10 h-[26rem] w-[26rem] rounded-full bg-gold/25 blur-[110px]" />
      <div className="hero-glow pointer-events-none absolute -right-24 top-40 h-[22rem] w-[22rem] rounded-full bg-pine-700/15 blur-[100px]" />

      {/* Grain */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
        <filter id="heroGrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#heroGrain)" />
      </svg>

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:px-10">
        {/* Left: copy — kept clean, no decorative leaves over the text */}
        <div className="relative text-center lg:text-left">
          {/* Subtle brand mark in place of the old text-only eyebrow pill */}
          <div className="hero-eyebrow inline-flex items-center gap-2.5  bg-gold/5 px-4 py-3 shadow-[0_10px_30px_-22px_rgba(21,56,38,0.2)]">
            <Image
              src="/images/ghar-ghar-ka-tel.png"
              alt="Ghar Ghar Ka Tel"
              width={220}
              height={80}
              className="h-10 w-auto object-contain"
              priority
            />
          </div>

        

          <h1 className="mt-2 font-display leading-[1.05] text-pine-900 text-[clamp(2.25rem,5.5vw,4rem)]">
            <span className="block overflow-hidden">
              <span className="hero-line block">100% Pure. Natural.</span>
            </span>
            <span className="relative block overflow-hidden pb-2">
              <span className="hero-line relative z-10 block italic text-gold-deep">Cold-Pressed.</span>
              <Swash className="hero-swash absolute -bottom-1 left-1/2 h-3 w-40 origin-left -translate-x-1/2 text-gold/70 lg:left-0 lg:translate-x-0" />
            </span>
          </h1>

          <p className="hero-copy mx-auto mt-5 max-w-md text-base leading-relaxed text-ink/70 lg:mx-0">
           At Yugika Foods Private Limited, we believe that good health begins with pure ingredients. Our premium cold-pressed edible oils are produced using advanced low-temperature extraction methods that preserve natural nutrients, authentic aroma, and rich flavour—bringing wholesome goodness to every kitchen.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
            <Link
              href="/products"
              data-cursor-hover
              className="hero-cta group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-pine-800 px-7 py-3.5 text-sm font-medium uppercase tracking-wide text-cream transition-all hover:bg-pine-700"
            >
              <span className="relative z-10 flex items-center gap-2">
                Explore Products
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </span>
              <span className="absolute inset-0 -translate-x-full bg-gold-deep/40 transition-transform duration-500 group-hover:translate-x-0" />
            </Link>
            <Link
              href="/about"
              data-cursor-hover
              className="hero-cta group inline-flex items-center gap-1.5 text-sm font-medium text-pine-900 underline decoration-gold/50 decoration-2 underline-offset-4 transition-colors hover:text-pine-700 hover:decoration-gold"
            >
              Learn how it&apos;s made
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>

        {/* Right: organic-shaped photo with ring, leaves, floating chips, vertical tagline */}
        <div className="relative mx-auto flex h-[340px] w-full max-w-[380px] items-center justify-center sm:h-[420px] sm:max-w-[440px] lg:h-[480px] lg:max-w-none">
          {/* Decorative leaves now live in the open space around the photo, not over any text */}
          <LeafBranch className="pointer-events-none absolute -right-8 -top-6 hidden h-24 w-24 rotate-90 text-pine-700/25 lg:block" />
          <DriftingLeaves />

          <div className="hero-ring absolute inset-[-4%] rounded-full border border-dashed border-gold-deep/35" />

          <div className="hero-blob absolute inset-0 bg-[#DCE9D8] [border-radius:62%_38%_55%_45%/55%_45%_55%_45%]" />

          <div className="hero-blob absolute inset-[6%] overflow-hidden [border-radius:58%_42%_50%_50%/50%_50%_50%_50%] shadow-[0_30px_70px_-25px_rgba(21,56,38,0.4)]">
            <Image
              src="/images/hero-bg.jpg"
              alt="Mustard field in golden bloom"
              fill
              priority
              sizes="(max-width: 1024px) 440px, 500px"
              className="object-cover [filter:saturate(1.15)_contrast(1.03)]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-pine-900/25 via-transparent to-transparent" />
          </div>

          {/* Floating sticker chips */}
          <div className="hero-chip hero-chip-float absolute -left-4 top-8 flex items-center gap-2 rounded-2xl bg-cream px-3.5 py-2.5 shadow-[0_18px_40px_-18px_rgba(21,56,38,0.5)] sm:-left-8">
            <PureDropIcon className="h-5 w-5 text-gold-deep" />
            <span className="text-xs font-medium text-pine-900">100% Natural</span>
          </div>

          <div className="hero-chip hero-chip-float absolute -right-3 bottom-10 flex items-center gap-2 rounded-2xl bg-pine-900 px-3.5 py-2.5 shadow-[0_18px_40px_-18px_rgba(21,56,38,0.5)] sm:-right-6">
            <NoHeatIcon className="h-5 w-5 text-gold-light" />
            <span className="text-xs font-medium text-cream">Never Heated</span>
          </div>

          <LeafGlyph className="hero-leaf-spin absolute -right-2 top-2 h-6 w-6 text-gold-deep sm:right-2" />
          <LeafGlyph className="hero-leaf-spin absolute -left-1 bottom-2 h-4 w-4 text-pine-700" />

        </div>
      </div>

      {/* Curved transition with a trailing vine into the stat band */}
      <div className="relative z-10 mt-16 overflow-hidden sm:mt-20">
        <svg
          className="block w-full text-pine-900/[0.06]"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          style={{ height: "60px" }}
        >
          <path
            fill="currentColor"
            d="M0,40 C240,90 480,0 720,20 C960,40 1200,90 1440,30 L1440,80 L0,80 Z"
          />
        </svg>
        <VineTrail className="pointer-events-none absolute inset-x-0 -top-2 mx-auto hidden h-6 w-full max-w-5xl text-pine-700/25 lg:block" />
        <TransitionLeaves />

        <div className="bg-pine-900/[0.06] pb-14 pt-2 sm:pb-16">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 sm:px-6 lg:grid-cols-4 lg:px-10">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="hero-stat group rounded-2xl bg-cream p-5 text-center shadow-[0_10px_30px_-18px_rgba(21,56,38,0.25)] transition-transform hover:-translate-y-1.5 hover:shadow-[0_18px_40px_-18px_rgba(21,56,38,0.35)] sm:p-6"
              >
                <s.icon className="mx-auto h-7 w-7 text-gold-deep transition-colors group-hover:text-pine-800" />
                <p className="mt-3 font-display text-2xl text-pine-800 sm:text-3xl">{s.value}</p>
                <p className="mx-auto mt-2 max-w-[14rem] text-xs leading-snug text-ink/60 sm:text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Decorative botanical elements ---------- */

function LeafBranch({ className = "" }) {
  return (
    <svg className={`hero-branch-wrap ${className}`} viewBox="0 0 100 100" fill="none">
      <path
        className="hero-branch"
        d="M8 8C20 22 30 34 34 52C38 70 48 82 62 90"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M18 18c6-2 11 1 13 7-6 2-11-1-13-7z" fill="currentColor" opacity="0.7" />
      <path d="M30 40c6-3 12 0 15 6-6 3-12 0-15-6z" fill="currentColor" opacity="0.6" />
      <path d="M42 62c6-2 12 1 14 7-6 2-12-1-14-7z" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

function TransitionLeaves({ className = "" }) {
  // Scattered sprigs across the band above the stat cards, filling the open space
  const leaves = [
    { top: "-6%", left: "6%", size: 16, rotate: -18, className: "text-pine-700/35", sway: true },
    { top: "18%", left: "22%", size: 10, rotate: 30, className: "text-gold-deep/30", sway: false },
    { top: "-14%", left: "38%", size: 13, rotate: -8, className: "text-pine-700/25", sway: true },
    { top: "10%", left: "58%", size: 11, rotate: 22, className: "text-gold/40", sway: false },
    { top: "-8%", left: "74%", size: 15, rotate: -25, className: "text-pine-700/30", sway: true },
    { top: "16%", left: "90%", size: 10, rotate: 12, className: "text-gold-deep/35", sway: false },
  ];
  return (
    <div className={`pointer-events-none absolute inset-x-0 -top-10 hidden h-24 lg:block ${className}`}>
      {leaves.map((l, i) => (
        <span
          key={i}
          className={`hero-transition-leaf absolute ${l.sway ? "hero-leaf-sway" : ""} ${l.className}`}
          style={{ top: l.top, left: l.left, transform: `rotate(${l.rotate}deg)` }}
        >
          <LeafGlyph style={{ width: l.size, height: l.size }} />
        </span>
      ))}
    </div>
  );
}

function VineTrail({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 960 24" fill="none" preserveAspectRatio="none">
      <path d="M0 12C160 2 240 22 400 12S640 2 800 12 960 12 960 12" stroke="currentColor" strokeWidth="1.5" fill="none" />
      {[80, 240, 400, 560, 720, 880].map((x, i) => (
        <path
          key={x}
          d={`M${x} 12c4-4 9-3 11 1-4 4-9 3-11-1z`}
          fill="currentColor"
          opacity={i % 2 === 0 ? 0.5 : 0.35}
        />
      ))}
    </svg>
  );
}

function LeafGlyph({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M4 20C4 10 10 4 20 4c0 10-6 16-16 16z"
        fill="currentColor"
        opacity="0.85"
      />
      <path d="M5 19C9 13 13 9 19 5" stroke="#F8F1DE" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

function DriftingLeaves() {
  // Repositioned into the open margins around the photo blob, clear of the vertical tag and chips
  const positions = [
    { top: "-9%", left: "48%", size: 14, delay: 0, className: "text-gold-deep/60" },
    { top: "6%", left: "-6%", size: 11, delay: 0.7, className: "text-pine-700/45" },
    { top: "96%", left: "10%", size: 12, delay: 1.3, className: "text-gold/55" },
  ];
  return (
    <>
      {positions.map((p, i) => (
        <span
          key={i}
          className={`hero-leaf-drift hero-leaf-sway absolute hidden animate-[float_6.5s_ease-in-out_infinite] lg:block ${p.className}`}
          style={{ top: p.top, left: p.left, animationDelay: `${p.delay}s` }}
        >
          <LeafGlyph className="h-full w-full" style={{ width: p.size, height: p.size }} />
        </span>
      ))}
    </>
  );
}

function Swash({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 160 12" fill="none" preserveAspectRatio="none">
      <path
        d="M2 8C30 2 70 2 80 6C90 10 120 3 158 5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

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
    <svg viewBox="0 0 46 60" fill="none" className={className}>
      <path
        d="M23 2C23 2 43 30 43 42C43 53.0457 34.0457 60 23 60C11.9543 60 3 53.0457 3 42C3 30 23 2 23 2Z"
        stroke="currentColor"
        strokeWidth="3.5"
      />
    </svg>
  );
}