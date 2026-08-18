"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { getAllProducts } from "@/data/products";

export default function ProductsGrid({ initialVariant = "all" }) {
  const [filter, setFilter] = useState(initialVariant);
  const gridRef = useRef(null);

  const allProducts = useMemo(() => getAllProducts(), []);

  // Group the flat product list into one entry per variant, each carrying
  // its list of available sizes (so we show one card per oil, not one per SKU).
  const grouped = useMemo(() => {
    const byVariant = {};
    allProducts.forEach((p) => {
      if (!byVariant[p.variant]) byVariant[p.variant] = { variant: p.variant, variantData: p.variantData, sizes: [] };
      byVariant[p.variant].sizes.push(p);
    });
    return Object.values(byVariant);
  }, [allProducts]);

  const filtered = filter === "all" ? grouped : grouped.filter((g) => g.variant === filter);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".product-card",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" }
      );
    }, gridRef);
    return () => ctx.revert();
  }, [filter]);

  return (
    <div>
      <div className="mx-auto flex w-full max-w-[320px] flex-wrap justify-center gap-2 rounded-full bg-cream-paper p-1.5 sm:w-fit sm:max-w-none">
        {[
          { key: "all", label: "All" },
          { key: "black", label: "Black" },
          { key: "yellow", label: "Yellow" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors sm:px-6 sm:py-2.5 ${
              filter === t.key ? "bg-pine-800 text-cream" : "text-ink/60 hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div ref={gridRef} className="mt-10 grid gap-7 sm:mt-14 md:grid-cols-2">
        {filtered.map((group) => (
          <VariantCard key={group.variant} group={group} />
        ))}
      </div>
    </div>
  );
}

function VariantCard({ group }) {
  const sortedSizes = [...group.sizes].sort((a, b) => a.mrp - b.mrp);
  const [selectedSlug, setSelectedSlug] = useState(sortedSizes[0].slug);
  const selected = sortedSizes.find((s) => s.slug === selectedSlug) || sortedSizes[0];

  // Build the gallery for the selected size. Supports an optional `images`
  // array on the product data (for more than two shots); falls back to the
  // existing front/back pair so nothing breaks if that field isn't there yet.
  const gallery = useMemo(() => {
    if (Array.isArray(selected.images) && selected.images.length) return selected.images;
    return [
      { src: selected.image, label: "Front" },
      { src: selected.imageBack, label: "Back" },
    ].filter((img) => img.src);
  }, [selected]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => setActiveIndex(0), [selected.slug]);

  return (
    <div className="product-card group/card relative flex flex-col overflow-hidden rounded-[28px] border border-ink/10 bg-cream-paper p-7 shadow-[0_1px_2px_rgba(20,30,20,0.04)] transition-shadow duration-300 hover:shadow-[0_18px_40px_-24px_rgba(20,40,25,0.35)]">
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover/card:opacity-35"
        style={{ background: group.variantData.accent }}
      />

      <ImageGallery
        gallery={gallery}
        activeIndex={activeIndex}
        onSelectIndex={setActiveIndex}
        onOpenLightbox={() => setLightboxOpen(true)}
        alt={group.variantData.name}
      />

      <div className="relative z-10">
        <h3 className="font-display text-xl text-pine-900">{group.variantData.name}</h3>
        <p className="mt-2 text-sm text-ink/60">{group.variantData.tagline}</p>

        <p className="mt-5 text-xs font-medium uppercase tracking-[0.15em] text-ink/45">Choose a size</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {sortedSizes.map((s) => (
            <button
              key={s.slug}
              onClick={() => setSelectedSlug(s.slug)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                selected.slug === s.slug
                  ? "border-pine-800 bg-pine-800 text-cream"
                  : "border-ink/15 text-ink/70 hover:border-gold-deep hover:text-pine-800"
              }`}
            >
              {s.size}
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-ink/10 pt-4">
          <div>
            <span className="font-display text-2xl text-gold-deep">₹{selected.mrp}</span>
            <span className="ml-2 text-xs text-ink/50">{selected.stockUnit}</span>
          </div>
          <Link
            href={`/products/${selected.slug}`}
            className="text-sm font-medium text-pine-800 underline decoration-gold decoration-2 underline-offset-4"
          >
            View details →
          </Link>
        </div>
      </div>

      {lightboxOpen && (
        <Lightbox
          gallery={gallery}
          startIndex={activeIndex}
          onIndexChange={setActiveIndex}
          alt={group.variantData.name}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Image gallery: main frame with a cursor-tracked hover-zoom lens, plus   */
/* small dots/thumbnails so it's obvious there's more than one shot.       */
/* ---------------------------------------------------------------------- */
function ImageGallery({ gallery, activeIndex, onSelectIndex, onOpenLightbox, alt }) {
  const frameRef = useRef(null);
  const [lensPos, setLensPos] = useState({ x: 50, y: 50 });
  const [hovering, setHovering] = useState(false);
  const active = gallery[activeIndex] || gallery[0];

  const handleMouseMove = (e) => {
    if (!frameRef.current) return;
    const rect = frameRef.current.getBoundingClientRect();
    setLensPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div className="relative z-10">
      <div
        ref={frameRef}
        className="group/frame relative flex h-56 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-white to-cream-paper"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onMouseMove={handleMouseMove}
      >
        <div className="relative h-48 w-64">
          <Image
            key={active.src}
            src={active.src}
            alt={`${alt} — ${active.label || `photo ${activeIndex + 1}`}`}
            fill
            className="object-contain object-center transition-transform duration-300 ease-out group-hover/frame:scale-105"
            sizes="(max-width: 768px) 256px, 256px"
            priority
          />
        </div>

        {/* Hover-zoom lens: a magnified peek of the image that follows the cursor */}
        {hovering && (
          <div
            className="pointer-events-none absolute inset-0 hidden opacity-0 transition-opacity duration-150 sm:block"
            style={{
              opacity: hovering ? 1 : 0,
              backgroundImage: `url(${active.src})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "250%",
              backgroundPosition: `${-(lensPos.x * 1.5)}px ${-(lensPos.y * 1.5)}px`,
              WebkitMaskImage: `radial-gradient(circle 75px at ${lensPos.x}px ${lensPos.y}px, black 97%, transparent 100%)`,
              maskImage: `radial-gradient(circle 75px at ${lensPos.x}px ${lensPos.y}px, black 97%, transparent 100%)`,
            }}
          />
        )}

        {gallery.length > 1 && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/60 px-2.5 py-1 text-[11px] font-medium text-cream backdrop-blur-sm">
            {activeIndex + 1}/{gallery.length} photos
          </span>
        )}

        <button
          type="button"
          onClick={onOpenLightbox}
          aria-label="Open zoom view"
          className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-pine-900/90 text-cream opacity-0 shadow-md transition-opacity duration-200 group-hover/frame:opacity-100 hover:bg-pine-800"
        >
          <ZoomInIcon className="h-4 w-4" />
        </button>
      </div>

      {gallery.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-3">
          {gallery.map((img, i) => (
            <button
              key={img.src + i}
              type="button"
              onClick={() => onSelectIndex(i)}
              aria-label={`Show ${img.label || `photo ${i + 1}`}`}
              className={`relative h-12 w-12 overflow-hidden rounded-xl border transition-all duration-200 ${
                i === activeIndex
                  ? "border-gold-deep ring-2 ring-gold-deep/30"
                  : "border-ink/10 opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={img.src} alt={img.label || `Photo ${i + 1}`} fill className="object-contain p-1" sizes="48px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Lightbox: full-screen viewer with explicit zoom in / zoom out controls  */
/* and click-drag panning once zoomed past 1x.                             */
/* ---------------------------------------------------------------------- */
function Lightbox({ gallery, startIndex, onIndexChange, alt, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const dragState = useRef(null);
  const active = gallery[index] || gallery[0];

  // Portal target isn't available during SSR, so only render once mounted
  // on the client — this also guarantees document.body exists.
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+") zoomIn();
      if (e.key === "-") zoomOut();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = (i) => {
    const next = (i + gallery.length) % gallery.length;
    setIndex(next);
    onIndexChange(next);
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const zoomIn = () => setScale((s) => Math.min(3, +(s + 0.5).toFixed(2)));
  const zoomOut = () =>
    setScale((s) => {
      const next = Math.max(1, +(s - 0.5).toFixed(2));
      if (next === 1) setOffset({ x: 0, y: 0 });
      return next;
    });

  const onPointerDown = (e) => {
    // Don't start dragging if clicking on a button or interactive element
    if (e.target.closest("button") || e.target.tagName === "BUTTON") return;
    if (scale === 1) return;
    dragState.current = { startX: e.clientX, startY: e.clientY, origin: offset };
  };
  const onPointerMove = (e) => {
    if (!dragState.current) return;
    const { startX, startY, origin } = dragState.current;
    setOffset({ x: origin.x + (e.clientX - startX), y: origin.y + (e.clientY - startY) });
  };
  const onPointerUp = () => {
    dragState.current = null;
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex flex-col bg-ink/90 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-sm font-medium text-cream/80">
          {alt} — {active.label || `Photo ${index + 1}`} ({index + 1}/{gallery.length})
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/10 text-cream hover:bg-cream/20"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>

      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden px-6 pb-6"
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerUp}
      >
        {gallery.length > 1 && (
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Previous photo"
            className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-cream/10 text-cream hover:bg-cream/20"
          >
            <ChevronIcon className="h-5 w-5 rotate-180" />
          </button>
        )}

        <div
          className="relative h-[60vh] w-full max-w-md select-none"
          style={{
            cursor: scale > 1 ? "grab" : "default",
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transition: dragState.current ? "none" : "transform 0.2s ease-out",
          }}
        >
          <Image src={active.src} alt={alt} fill className="object-contain" sizes="480px" draggable={false} priority />
        </div>

        {gallery.length > 1 && (
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Next photo"
            className="absolute right-4 flex h-10 w-10 items-center justify-center rounded-full bg-cream/10 text-cream hover:bg-cream/20"
          >
            <ChevronIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-center gap-3 pb-6">
        <button
          type="button"
          onClick={zoomOut}
          disabled={scale === 1}
          aria-label="Zoom out"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-cream/10 text-cream transition-opacity hover:bg-cream/20 disabled:opacity-30"
        >
          <MinusIcon className="h-4 w-4" />
        </button>
        <span className="w-14 text-center text-sm font-medium text-cream/80">{Math.round(scale * 100)}%</span>
        <button
          type="button"
          onClick={zoomIn}
          disabled={scale === 3}
          aria-label="Zoom in"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-cream/10 text-cream transition-opacity hover:bg-cream/20 disabled:opacity-30"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>
    </div>,
    document.body
  );
}

/* Small inline icon set — no extra dependency required. */
function ZoomInIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3M11 8v6M8 11h6" />
    </svg>
  );
}
function CloseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
function PlusIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function MinusIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <path d="M5 12h14" />
    </svg>
  );
}
function ChevronIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}