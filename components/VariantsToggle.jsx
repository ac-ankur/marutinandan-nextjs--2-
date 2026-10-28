"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { variants } from "@/data/products";

const PRODUCT_SLIDES = {
  black: [
    {
      src: "/images/1l_black_mustard_front.png",
      tag: "1L Bottle",
      name: "1 Litre PET Bottle",
      subtitle: "Convenient for daily cooking & tadka",
      sizeKey: "1l",
    },
    {
      src: "/images/2l_black_mustard.png",
      tag: "2L Can",
      name: "2 Litre Can",
      subtitle: "Smart household stock-up with easy carry handle",
      sizeKey: "2l",
    },
    {
      src: "/images/5l_black_mustard_front.png",
      tag: "5L Can",
      name: "5 Litre Can",
      subtitle: "Family value pack for festive & bulk cooking",
      sizeKey: "5l",
    },
    {
      src: "/images/15l_black_mustard.png",
      tag: "15L Tin",
      name: "15 Litre Commercial Tin",
      subtitle: "Heavy-duty tin for restaurants, caterers & bulk kitchens",
      sizeKey: "15l",
    },
  ],
  yellow: [
    {
      src: "/images/1l_yellow_mustard_front.png",
      tag: "1L Bottle",
      name: "1 Litre PET Bottle",
      subtitle: "Light, everyday cooking, marinades & salads",
      sizeKey: "1l",
    },
    {
      src: "/images/2l_black_mustard.png",
      tag: "2L Can",
      name: "2 Litre Can",
      subtitle: "Milder mustard flavour for regular kitchen stock-up",
      sizeKey: "2l",
    },
    {
      src: "/images/5l_yellow_mustard_front.png",
      tag: "5L Can",
      name: "5 Litre Can",
      subtitle: "Family value pack with gentle golden taste",
      sizeKey: "5l",
    },
    {
      src: "/images/15l_yellow_mustard.png",
      tag: "15L Tin",
      name: "15 Litre Commercial Tin",
      subtitle: "Bulk supply for chefs, caterers & commercial food service",
      sizeKey: "15l",
    },
  ],
};

export default function VariantsToggle() {
  const [active, setActive] = useState("black");
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const panelRef = useRef(null);
  const dropRef = useRef(null);
  const isFirstRender = useRef(true);

  const data = variants[active];
  const slides = PRODUCT_SLIDES[active] || PRODUCT_SLIDES.black;

  // Reset slide to 0 when user toggles variant
  useEffect(() => {
    setActiveSlide(0);
  }, [active]);

  const nextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Autoplay slideshow every 3.8s (pauses on hover)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 3800);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const switchTo = (key) => {
    if (key === active) return;
    gsap.to([panelRef.current, dropRef.current], {
      opacity: 0,
      y: 12,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => {
        setActive(key);
        setActiveSlide(0);
      },
    });
  };

  useEffect(() => {
    gsap.fromTo(
      [panelRef.current, dropRef.current],
      { opacity: 0, y: isFirstRender.current ? 20 : -12 },
      { opacity: 1, y: 0, duration: isFirstRender.current ? 0.8 : 0.4, ease: "power2.out" }
    );
    isFirstRender.current = false;
  }, [active]);

  const currentSlideData = slides[activeSlide] || slides[0];

  return (
    <section className="bg-pine-900 px-4 py-10 sm:px-6 sm:py-24 lg:px-10 lg:py-22">
      <div className="mx-auto max-w-7xl">
        <p className="text-center text-lg uppercase tracking-[0.3em] text-gold-light">— Our Products —</p>
        <h2 className="mt-4 text-center font-display text-4xl text-cream sm:text-5xl">
          Currently <span className="italic text-gold-light">Available.</span>
        </h2>

        {/* Variant Switcher Pills */}
        <div className="mx-auto mt-10 flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-full bg-pine-950/50 p-1.5 no-scrollbar">
          {Object.values(variants).map((v) => (
            <button
              key={v.key}
              onClick={() => switchTo(v.key)}
              data-cursor-hover
              className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition-colors sm:px-6 sm:py-2.5 sm:text-sm ${
                active === v.key ? "bg-gold text-pine-950 shadow-md font-semibold" : "text-cream/70 hover:text-cream"
              }`}
            >
              {v.name}
            </button>
          ))}
        </div>

        <div className="mt-12 grid items-center gap-10 sm:mt-16 lg:grid-cols-2 lg:gap-14">
          
          {/* ───── Left Column: Product Slideshow ───── */}
          <div
            ref={dropRef}
            className="relative mx-auto flex w-full max-w-xl flex-col items-center justify-center lg:max-w-2xl"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Decorative Stars */}
            <span className="absolute -top-6 left-2 text-2xl text-gold-light/40 select-none">✽</span>
            <span className="absolute right-4 top-2 text-xl text-gold-light/40 select-none">✽</span>

            {/* Glowing Ambient Light Orbs */}
            <div
              className="absolute -left-10 top-6 h-72 w-72 rounded-full opacity-35 blur-[90px] pointer-events-none transition-colors duration-700"
              style={{ background: data.accent }}
            />
            <div
              className="absolute -right-6 bottom-2 h-80 w-80 rounded-full opacity-25 blur-[100px] pointer-events-none transition-colors duration-700"
              style={{ background: data.accent }}
            />

            {/* Main Stage Card */}
            <div className="relative w-full rounded-3xl border border-gold-light/15 bg-pine-950/60 p-4 sm:p-6 backdrop-blur-sm shadow-2xl overflow-hidden">
              
              {/* Top Bar: Slide Name / Tag & Pungency Badge */}
              <div className="flex items-center justify-between gap-3 relative z-10 mb-2">
                <div className="flex items-center gap-2 rounded-full border border-gold-light/25 bg-pine-900/80 px-3 py-1.5 backdrop-blur-md shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
                  <span className="text-xs font-medium text-gold-light tracking-wide">
                    {currentSlideData.name}
                  </span>
                </div>

                <div className="rounded-2xl border border-gold-light/30 bg-pine-950/85 px-3.5 py-1.5 text-center backdrop-blur-md shadow-lg sm:px-4 sm:py-2">
                  <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-gold-light">Pungency</p>
                  <p className="font-display text-lg sm:text-xl text-gold-light leading-tight">{data.pungency}</p>
                </div>
              </div>

              {/* Central Stage: Image Carousel */}
              <div className="relative h-[360px] w-full sm:h-[430px] lg:h-[460px] flex items-center justify-center">
                {/* Pedestal Shadow */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-black/50 blur-xl rounded-full pointer-events-none" />

                {slides.map((slide, idx) => (
                  <div
                    key={slide.src + idx}
                    className={`absolute inset-0 flex items-center justify-center p-4 transition-all duration-700 ease-out ${
                      idx === activeSlide
                        ? "opacity-100 scale-100 pointer-events-auto"
                        : "opacity-0 scale-95 pointer-events-none"
                    }`}
                  >
                    <div className="relative h-full w-full max-w-[420px]">
                      <Image
                        src={slide.src}
                        alt={`${data.name} - ${slide.name}`}
                        fill
                        className="object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.55)] transition-transform duration-700 hover:scale-105"
                        sizes="(max-width: 768px) 380px, 500px"
                        priority={idx === 0}
                      />
                    </div>
                  </div>
                ))}

                {/* Left Navigation Arrow */}
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Previous product image"
                  className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-gold-light/25 bg-pine-950/80 text-cream backdrop-blur-md shadow-lg transition-all hover:bg-gold hover:text-pine-950 hover:scale-110 active:scale-95"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {/* Right Navigation Arrow */}
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next product image"
                  className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-gold-light/25 bg-pine-950/80 text-cream backdrop-blur-md shadow-lg transition-all hover:bg-gold hover:text-pine-950 hover:scale-110 active:scale-95"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              {/* Subtitle Caption */}
              <p className="mt-1 text-center text-xs text-cream/70 sm:text-sm font-medium tracking-wide">
                {currentSlideData.subtitle}
              </p>

              {/* Pack Size Thumbnail / Selector Pills */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-2 border-t border-gold-light/10">
                {slides.map((s, idx) => (
                  <button
                    key={s.tag}
                    type="button"
                    onClick={() => setActiveSlide(idx)}
                    className={`group relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-all ${
                      idx === activeSlide
                        ? "bg-gold text-pine-950 font-bold shadow-md shadow-gold/20 scale-105"
                        : "bg-pine-900/60 text-cream/70 hover:text-cream hover:bg-pine-900 border border-gold-light/15"
                    }`}
                  >
                    <span>{s.tag}</span>
                  </button>
                ))}
              </div>

              {/* Slide Counter Dots */}
              <div className="mt-3 flex items-center justify-center gap-1.5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === activeSlide ? "w-6 bg-gold" : "w-1.5 bg-cream/30 hover:bg-cream/60"
                    }`}
                  />
                ))}
              </div>

            </div>
          </div>

          {/* ───── Right Column: Product Details ───── */}
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
              href={
                currentSlideData.sizeKey
                  ? `/products?variant=${active}&size=${currentSlideData.sizeKey}`
                  : `/products?variant=${active}`
              }
              data-cursor-hover
              className="mt-9 inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-pine-950 transition-transform hover:scale-[1.02] shadow-lg shadow-gold/20"
            >
              View Pack Sizes →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}