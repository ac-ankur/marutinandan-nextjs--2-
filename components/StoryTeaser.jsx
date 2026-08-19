"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import RevealImage from "./RevealImage";

// Detailed SVG Illustrations
const ProcessGraphics = {
  seed: (
    <svg viewBox="0 0 200 200" fill="none" className="h-44 w-44 drop-shadow-2xl">
      {/* Background Glow */}
      <circle cx="100" cy="100" r="70" fill="#E8B031" fillOpacity="0.15" />
      {/* Leaf Base */}
      <path
        d="M50 140C50 140 80 150 120 120C160 90 150 50 150 50C150 50 110 50 80 80C50 110 50 140 50 140Z"
        fill="#2E1F18"
        stroke="#E8B031"
        strokeWidth="2"
      />
      <path d="M50 140Q90 110 150 50" stroke="#E8B031" strokeWidth="1.5" strokeDasharray="3 3" />
      {/* Mustard Seeds with depth */}
      <circle cx="90" cy="95" r="14" fill="url(#seedGrad1)" stroke="#F2C94C" strokeWidth="2" />
      <circle cx="120" cy="80" r="18" fill="url(#seedGrad2)" stroke="#F2C94C" strokeWidth="2" />
      <circle cx="115" cy="115" r="12" fill="url(#seedGrad1)" stroke="#F2C94C" strokeWidth="2" />
      <circle cx="75" cy="120" r="10" fill="url(#seedGrad2)" stroke="#F2C94C" strokeWidth="1.5" />
      {/* Highlights */}
      <circle cx="115" cy="74" r="4" fill="#FFF" fillOpacity="0.6" />
      <circle cx="86" cy="90" r="3" fill="#FFF" fillOpacity="0.6" />
      {/* Gradients */}
      <defs>
        <radialGradient id="seedGrad1" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#F2C94C" />
          <stop offset="100%" stopColor="#8C581E" />
        </radialGradient>
        <radialGradient id="seedGrad2" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#E8B031" />
          <stop offset="100%" stopColor="#5B3A2A" />
        </radialGradient>
      </defs>
    </svg>
  ),
  press: (
    <svg viewBox="0 0 200 200" fill="none" className="h-44 w-44 drop-shadow-2xl">
      {/* Outer Rotating Ring */}
      <motion.circle
        cx="100"
        cy="100"
        r="75"
        stroke="#E8B031"
        strokeWidth="2"
        strokeDasharray="8 8"
        strokeOpacity="0.4"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
      />
      {/* Traditional Wooden Mortar Container */}
      <path d="M60 90 L140 90 L125 150 L75 150 Z" fill="#2E1F18" stroke="#E8B031" strokeWidth="2" />
      <ellipse cx="100" cy="90" rx="40" ry="10" fill="#5B3A2A" stroke="#E8B031" strokeWidth="2" />
      {/* Oil Pool Inside */}
      <ellipse cx="100" cy="92" rx="32" ry="6" fill="#F2C94C" fillOpacity="0.8" />
      {/* Pressing Shaft / Pestle */}
      <motion.path
        d="M100 30 L100 90"
        stroke="#E8B031"
        strokeWidth="12"
        strokeLinecap="round"
        animate={{ y: [0, 4, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      />
      {/* Flowing Pure Oil Droplets */}
      <motion.path
        d="M100 150 Q100 165 100 175 C104 175 106 170 100 150 Z"
        fill="#F2C94C"
        animate={{ y: [0, 10, 0], opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      />
    </svg>
  ),
  bottle: (
    <svg viewBox="0 0 200 200" fill="none" className="h-44 w-44 drop-shadow-2xl">
      {/* Glow Aura */}
      <circle cx="100" cy="110" r="60" fill="#E8B031" fillOpacity="0.1" />
      {/* Glass Bottle Body */}
      <path
        d="M85 45 H115 V60 L125 75 V160 C125 165 120 170 115 170 H85 C80 170 75 165 75 160 V75 L85 60 Z"
        fill="#2E1F18"
        fillOpacity="0.8"
        stroke="#E8B031"
        strokeWidth="2"
      />
      {/* Oil Level Inside */}
      <path
        d="M77 95 Q100 90 123 95 V160 C123 163 120 168 115 168 H85 C80 168 77 163 77 160 Z"
        fill="url(#oilFill)"
      />
      {/* Bottle Cap */}
      <rect x="87" y="35" width="26" height="10" rx="2" fill="#E8B031" stroke="#FFF" strokeWidth="1" />
      {/* Quality Seal Stamp Badge */}
      <motion.g
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <circle cx="120" cy="130" r="22" fill="#E8B031" stroke="#2E1F18" strokeWidth="2" />
        <path d="M112 130 L118 136 L128 124" stroke="#2E1F18" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>
      {/* Glass Light Reflection */}
      <path d="M82 80 V150" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.3" />
      <defs>
        <linearGradient id="oilFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F2C94C" />
          <stop offset="100%" stopColor="#C88E12" />
        </linearGradient>
      </defs>
    </svg>
  ),
};

const STEPS = [
  {
    n: "01",
    title: "Seed Selection",
    desc: "Premium mustard",
    graphic: ProcessGraphics.seed,
    detail: "Carefully sourced high-grade mustard seeds checked for density and pure oil content.",
  },
  {
    n: "02",
    title: "Cold Pressing",
    desc: "Cold Kachi Ghani",
    graphic: ProcessGraphics.press,
    detail: "Extracted at low temperatures using traditional wooden Ghanis to preserve natural aroma.",
  },
  {
    n: "03",
    title: "Lab Testing & Bottle",
    desc: "Lab tested & sealed",
    graphic: ProcessGraphics.bottle,
    detail: "Strict quality clearance before being hermetically sealed in protective glass bottles.",
  },
];

export default function StoryTeaser() {
  const [activeStep, setActiveStep] = useState(0);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative bg-cream px-4 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
        
        {/* Left Interactive SVG Display Card */}
        <RevealImage direction="left" className="h-[360px] rounded-3xl sm:h-[440px] lg:h-[520px]">
          <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-[linear-gradient(160deg,#4a2e21,#231611)] p-8 shadow-2xl border border-gold/20">
            
            {/* Top Indicator */}
            <div className="flex justify-between items-start z-10">
              <div className="flex items-center gap-2 rounded-full bg-gold/10 px-3.5 py-1.5 backdrop-blur-md border border-gold/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
                </span>
                <span className="text-xs font-semibold text-gold-light tracking-wider uppercase">
                  Step {STEPS[activeStep].n} / 03
                </span>
              </div>

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold text-center text-xs font-bold text-pine-950 shadow-lg border-2 border-cream/20">
                100% <br /> PURE
              </div>
            </div>

            {/* Middle Animated SVG Illustration */}
            <div className="my-auto flex flex-col items-center justify-center text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, scale: 0.85, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, y: -15 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="flex flex-col items-center"
                >
                  <div className="relative flex items-center justify-center">
                    {STEPS[activeStep].graphic}
                  </div>
                  <h3 className="mt-2 font-display text-2xl font-semibold text-cream">
                    {STEPS[activeStep].title}
                  </h3>
                  <p className="mt-1 max-w-xs text-xs sm:text-sm text-cream/70 leading-relaxed">
                    {STEPS[activeStep].detail}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Info Bar & Indicators */}
            <div className="z-10 flex items-end justify-between border-t border-gold/15 pt-4">
              <div>
                <p className="font-display text-base sm:text-lg text-cream">
                  Since Generations
                </p>
                <p className="text-xs sm:text-sm italic text-gold-light">
                  The Kachi Ghani Way
                </p>
              </div>

              {/* Step Navigation Dots */}
              <div className="flex gap-2">
                {STEPS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveStep(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      activeStep === idx
                        ? "w-8 bg-gold"
                        : "w-2.5 bg-gold/30 hover:bg-gold/60"
                    }`}
                    aria-label={`Switch to step ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </RevealImage>

        {/* Right Info Section */}
        <div>
          <p className="flex items-center gap-3 text-lg uppercase tracking-[0.3em] text-gold-deep font-semibold">
            <span className="h-px w-8 bg-gold-deep" /> Our Promise
          </p>
          <h2 className="mt-4 font-display text-4xl leading-tight text-pine-900 sm:text-5xl">
            Purity isn't just a claim—it's our{" "}
            <span className="italic text-gold-deep">foundation.</span>
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink/70">
            At Yugika Foods, purity isn't just a claim—it's the foundation of everything we do. We are committed to delivering naturally processed edible oils that combine traditional wisdom with modern quality standards.
          </p>

          {/* Step Selector Buttons */}
          <div className="mt-10 grid gap-4 border-t border-ink/10 pt-8 sm:grid-cols-3">
            {STEPS.map((s, index) => (
              <button
                key={s.n}
                onClick={() => setActiveStep(index)}
                className={`group text-left transition-all p-3.5 rounded-2xl cursor-pointer ${
                  activeStep === index
                    ? "bg-gold/15 border-l-4 border-gold-deep shadow-sm"
                    : "opacity-60 hover:opacity-100 hover:bg-gold/5"
                }`}
              >
                <p className="font-display text-2xl font-bold text-gold-deep">{s.n}</p>
                <p className="mt-1 font-semibold text-pine-900 group-hover:text-gold-deep transition-colors">
                  {s.title}
                </p>
                <p className="text-xs text-ink/60 mt-0.5">{s.desc}</p>
              </button>
            ))}
          </div>

          <Link
            href="/about"
            data-cursor-hover
            className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-pine-800 underline decoration-gold decoration-2 underline-offset-4 hover:text-gold-deep transition-colors"
          >
            Learn more about us →
          </Link>
        </div>
      </div>
    </section>
  );
}