"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

export default function ProductImageDisplay({ product }) {
  const [showBack, setShowBack] = useState(false);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Position tracked relative to the image element (0-100%) and container (px)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50, pxX: 0, pxY: 0 });

  const frameRef = useRef(null);
  const imageRef = useRef(null);
  const dragState = useRef(null);

  const activeSrc = showBack ? product.imageBack : product.image;
  const viewLabel = showBack ? "Back View" : "Front View";

  const zoomIn = () => {
    setScale((s) => Math.min(3, +(s + 0.3).toFixed(1)));
  };

  const zoomOut = () => {
    setScale((s) => {
      const next = Math.max(1, +(s - 0.3).toFixed(1));
      if (next === 1) setOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const resetZoom = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleMouseMove = (e) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (mouseX >= 0 && mouseX <= rect.width && mouseY >= 0 && mouseY <= rect.height) {
      setHovering(true);
      const percentX = (mouseX / rect.width) * 100;
      const percentY = (mouseY / rect.height) * 100;

      const containerRect = frameRef.current?.getBoundingClientRect();
      const pxX = containerRect ? e.clientX - containerRect.left : 0;
      const pxY = containerRect ? e.clientY - containerRect.top : 0;

      setZoomPos({ x: percentX, y: percentY, pxX, pxY });
    } else {
      setHovering(false);
    }
  };

  const onPointerDown = (e) => {
    if (scale === 1) return;
    if (e.target.closest("button")) return;
    dragState.current = { startX: e.clientX, startY: e.clientY, origin: offset };
  };

  const onPointerMove = (e) => {
    if (!dragState.current) return;
    const { startX, startY, origin } = dragState.current;
    setOffset({
      x: origin.x + (e.clientX - startX),
      y: origin.y + (e.clientY - startY),
    });
  };

  const onPointerUp = () => {
    dragState.current = null;
  };

  const LENS_SIZE = 160;
  const ZOOM_LEVEL = 2.5;

  return (
    <div className="relative flex flex-col items-center">
      {/* Main card wrapper */}
      <div
        ref={frameRef}
        onMouseLeave={() => {
          setHovering(false);
          onPointerUp();
        }}
        onMouseMove={handleMouseMove}
        onMouseDown={onPointerDown}
        onMouseMoveCapture={onPointerMove}
        onMouseUp={onPointerUp}
        className="group relative flex h-[420px] w-full items-center justify-center overflow-hidden rounded-2xl bg-pine-950 px-4 py-16 shadow-2xl transition-all sm:h-[560px] sm:rounded-3xl sm:px-6 sm:py-8 lg:h-[620px]"
      >
        {/* Glow ambient background */}
        <div
          className="pointer-events-none absolute h-72 w-72 rounded-full opacity-35 blur-3xl sm:h-96 sm:w-96"
          style={{ background: product.variantData.accent }}
        />

        {/* Top control bar: flip badge + zoom controls, stacked on mobile so nothing overlaps */}
        <div className="absolute inset-x-3 top-3 z-20 flex flex-wrap items-center justify-between gap-2 sm:inset-x-6 sm:top-6">
          {/* Front / Back View badge & flip button */}
          <button
            type="button"
            onClick={() => setShowBack(!showBack)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gold-light/30 bg-pine-900/80 px-3 py-1.5 text-[11px] font-semibold text-gold-light backdrop-blur-md transition-all hover:scale-105 hover:bg-pine-800 hover:shadow-lg sm:gap-2 sm:px-4 sm:py-2 sm:text-xs"
            title="Click to flip view"
          >
            <FlipIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>{viewLabel}</span>
            <span className="hidden sm:inline">(Click to Flip)</span>
          </button>

          {/* Zoom Controls */}
          <div className="flex shrink-0 items-center gap-1 rounded-full border border-gold-light/20 bg-pine-950/80 p-1 shadow-lg backdrop-blur-md sm:gap-2 sm:p-1.5">
            <button
              type="button"
              onClick={zoomOut}
              disabled={scale <= 1}
              title="Zoom Out (-)"
              aria-label="Zoom Out"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-cream/10 text-cream transition-all hover:bg-cream/20 disabled:opacity-30 sm:h-9 sm:w-9"
            >
              <MinusIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>

            <span
              onClick={resetZoom}
              title="Click to reset zoom"
              className="cursor-pointer px-0.5 text-[10px] font-medium text-gold-light hover:underline sm:px-2 sm:text-xs"
            >
              {Math.round(scale * 100)}%
            </span>

            <button
              type="button"
              onClick={zoomIn}
              disabled={scale >= 3}
              title="Zoom In (+)"
              aria-label="Zoom In"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-cream/10 text-cream transition-all hover:bg-cream/20 disabled:opacity-30 sm:h-9 sm:w-9"
            >
              <PlusIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>

            <div className="h-4 w-px bg-gold-light/30" />

            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              title="Full Screen Zoom"
              aria-label="Full Screen Zoom"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-gold font-bold text-pine-950 transition-all hover:scale-110 sm:h-9 sm:w-9"
            >
              <ZoomInIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>

        {/* Product Image Frame */}
        <div
          ref={imageRef}
          className="relative z-10 h-[260px] w-[190px] select-none transition-transform duration-200 ease-out sm:h-[440px] sm:w-[320px] lg:h-[500px] lg:w-[360px]"
          style={{
            cursor: scale > 1 ? (dragState.current ? "grabbing" : "grab") : "pointer",
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          }}
          onClick={() => {
            if (scale === 1) setShowBack(!showBack);
          }}
        >
          <Image
            key={activeSrc}
            src={activeSrc}
            alt={`${product.variantData.name} - ${viewLabel}`}
            fill
            className="object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)]"
            sizes="(max-width: 768px) 300px, 400px"
            priority
          />
        </div>

        {/* Circular Magnifying Glass Lens — desktop hover only, disabled on touch */}
        {hovering && scale === 1 && (
          <div
            className="pointer-events-none absolute z-30 hidden rounded-full border-2 border-gold-light/60 shadow-2xl sm:block"
            style={{
              width: `${LENS_SIZE}px`,
              height: `${LENS_SIZE}px`,
              left: `${zoomPos.pxX - LENS_SIZE / 2}px`,
              top: `${zoomPos.pxY - LENS_SIZE / 2}px`,
              backgroundImage: `url(${activeSrc})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: `${ZOOM_LEVEL * 100}%`,
              backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
            }}
          />
        )}

        {/* Bottom specification badge */}
        <div className="absolute bottom-3 z-20 flex max-w-[92%] flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-2xl border border-gold-light/20 bg-pine-950/80 px-3 py-1.5 text-center text-[10px] uppercase tracking-[0.14em] text-cream/80 backdrop-blur-md sm:max-w-none sm:rounded-full sm:px-5 sm:py-2.5 sm:text-xs sm:tracking-[0.18em]">
          <span className="font-semibold text-gold-light">{product.size}</span>
          <span>·</span>
          <span>{product.stockUnit}</span>
          <span className="hidden sm:inline">·</span>
          {/* Hint text swaps for touch vs. mouse users */}
          <span className="hidden text-gold-light/90 sm:inline">
            Hover to magnify · Use + / - to zoom
          </span>
          <span className="text-gold-light/90 sm:hidden">Tap + / - to zoom</span>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <LightboxModal
          src={activeSrc}
          title={`${product.variantData.name} — ${product.size} (${viewLabel})`}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}

/* Lightbox Modal */
function LightboxModal({ src, title, onClose }) {
  const [scale, setScale] = useState(1.4);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const dragState = useRef(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") zoomIn();
      if (e.key === "-") zoomOut();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, []);

  const zoomIn = () => setScale((s) => Math.min(3.5, +(s + 0.4).toFixed(1)));
  const zoomOut = () =>
    setScale((s) => {
      const next = Math.max(1, +(s - 0.4).toFixed(1));
      if (next === 1) setOffset({ x: 0, y: 0 });
      return next;
    });

  const onPointerDown = (e) => {
    if (e.target.closest("button")) return;
    dragState.current = { startX: e.clientX, startY: e.clientY, origin: offset };
  };

  const onPointerMove = (e) => {
    if (!dragState.current) return;
    const { startX, startY, origin } = dragState.current;
    setOffset({
      x: origin.x + (e.clientX - startX),
      y: origin.y + (e.clientY - startY),
    });
  };

  const onPointerUp = () => {
    dragState.current = null;
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex flex-col bg-pine-950/95 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex items-center justify-between gap-3 border-b border-gold-light/20 px-4 py-3 sm:px-6 sm:py-4">
        <span className="truncate text-xs font-semibold tracking-wide text-cream sm:text-sm">
          {title}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream/10 text-cream transition-colors hover:bg-cream/20 sm:h-10 sm:w-10"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>

      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden p-4 sm:p-6"
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerUp}
      >
        <div
          className="relative h-[60vh] w-full max-w-lg select-none sm:h-[70vh]"
          style={{
            cursor: dragState.current ? "grabbing" : "grab",
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transition: dragState.current ? "none" : "transform 0.2s ease-out",
          }}
        >
          <Image
            src={src}
            alt={title}
            fill
            className="object-contain drop-shadow-2xl"
            sizes="600px"
            draggable={false}
            priority
          />
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 border-t border-gold-light/20 pb-6 pt-3 sm:gap-4 sm:pb-8 sm:pt-4">
        <button
          type="button"
          onClick={zoomOut}
          disabled={scale <= 1}
          aria-label="Zoom Out"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-cream/10 text-cream transition-all hover:bg-cream/20 disabled:opacity-30 sm:h-11 sm:w-11"
        >
          <MinusIcon className="h-5 w-5" />
        </button>
        <span className="w-14 text-center text-sm font-semibold text-gold-light sm:w-16">
          {Math.round(scale * 100)}%
        </span>
        <button
          type="button"
          onClick={zoomIn}
          disabled={scale >= 3.5}
          aria-label="Zoom In"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-cream/10 text-cream transition-all hover:bg-cream/20 disabled:opacity-30 sm:h-11 sm:w-11"
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>
    </div>,
    document.body
  );
}

/* Icon components */
function FlipIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20 7h-9M14 3l4 4-4 4M4 17h9M10 21l-4-4 4-4" />
    </svg>
  );
}

function ZoomInIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3M11 8v6M8 11h6" />
    </svg>
  );
}

function PlusIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function MinusIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" {...props}>
      <path d="M5 12h14" />
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