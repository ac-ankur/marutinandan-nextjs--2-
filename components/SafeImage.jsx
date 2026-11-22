"use client";

import { useState, useCallback, useEffect, useId } from "react";
import NextImage from "next/image";

/**
 * Determines the correct static fallback image based on product name / alt text / size hint.
 * Checks for keywords to pick the right local static image from /public/images/.
 */
export function getStaticFallback(hint = "") {
  const h = (typeof hint === "string" ? hint : "").toLowerCase();

  // Peanut / groundnut oil
  if (h.includes("peanut") || h.includes("groundnut") || h.includes("moongfali")) {
    return "/images/yugika-gold-peanut-oil.png";
  }

  // Yellow mustard oil — match size if mentioned
  if (h.includes("yellow") || h.includes("peeli") || h.includes("pili") || h.includes("ymo")) {
    if (h.includes("15") || h.includes("15l") || h.includes("tin"))  return "/images/15l_yellow_mustard.png";
    if (h.includes("5l") || h.includes("5 l") || h.includes("jar") || h.includes("can"))  return "/images/5l_yellow_mustard_front.png";
    if (h.includes("1l") || h.includes("1 l") || h.includes("bottle"))  return "/images/1l_yellow_mustard_front.png";
    return "/images/yellowmustard.png";
  }

  // Black mustard oil (default) — match size if mentioned
  if (h.includes("15") || h.includes("15l") || h.includes("tin"))  return "/images/15l_black_mustard.png";
  if (h.includes("5l") || h.includes("5 l") || h.includes("jar") || h.includes("can"))  return "/images/5l_black_mustard_front.png";
  if (h.includes("2l") || h.includes("2 l"))  return "/images/2l_black_mustard.png";
  if (h.includes("1l") || h.includes("1 l") || h.includes("bottle"))  return "/images/1l_black_mustard_front.png";

  return "/images/blackmustard.png";
}

/**
 * Returns true if the URL is an external (absolute http/https) URL.
 */
function isExternal(src) {
  if (!src || typeof src !== "string") return false;
  return src.startsWith("http://") || src.startsWith("https://");
}

/**
 * Brand-tailored image loader for Yugika Foods / Marutinandan.
 * Represents pure cold-pressed golden mustard oil:
 * - Compact mode: Sleek, non-overflowing miniature golden droplet with warm shimmer for thumbnails.
 * - Full mode: Rich golden amber droplet with concentric ripples, glowing highlights, and Kachi Ghani branding.
 */
function BrandImageLoader({ isCompact = false }) {
  const uniqueId = useId();
  const dropGradId = `drop-grad-${uniqueId.replace(/:/g, "")}`;
  const highlightGradId = `hl-grad-${uniqueId.replace(/:/g, "")}`;

  if (isCompact) {
    return (
      <div
        className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-b from-amber-50/90 via-cream/85 to-amber-100/60 backdrop-blur-[1px] pointer-events-none select-none overflow-hidden"
        aria-hidden="true"
      >
        {/* Subtle shimmer sweep */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/35 to-transparent animate-oil-shimmer pointer-events-none" />

        {/* Compact glowing droplet */}
        <div className="relative flex items-center justify-center">
          <span className="absolute -inset-1 rounded-full bg-amber-400/25 blur-[2px] animate-pulse" />
          <svg
            width="16"
            height="21"
            viewBox="0 0 46 60"
            fill="none"
            className="relative drop-shadow-[0_2px_4px_rgba(217,119,6,0.35)] animate-oil-pulse"
          >
            <defs>
              <linearGradient id={dropGradId} x1="23" y1="2" x2="23" y2="60" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FDE68A" />
                <stop offset="0.35" stopColor="#F59E0B" />
                <stop offset="1" stopColor="#B45309" />
              </linearGradient>
            </defs>
            <path
              d="M23 2C23 2 43 30 43 42C43 53.0457 34.0457 60 23 60C11.9543 60 3 53.0457 3 42C3 30 23 2 23 2Z"
              fill={`url(#${dropGradId})`}
            />
            {/* Curved gloss highlight */}
            <path
              d="M17 18C15 22 13 28 13 36C13 42 16 46 17 48"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.65"
            />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-cream/95 via-amber-50/80 to-cream/95 backdrop-blur-[2px] pointer-events-none select-none p-4 overflow-hidden"
      aria-hidden="true"
    >
      {/* Background warm gold radial glow */}
      <div className="absolute w-36 h-36 rounded-full bg-gradient-to-r from-amber-300/20 via-gold/15 to-transparent blur-2xl pointer-events-none" />

      {/* Shimmer sweep */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-100/40 to-transparent animate-oil-shimmer pointer-events-none" />

      {/* Droplet with ripples container */}
      <div className="relative flex items-center justify-center w-20 h-20">
        {/* Outer Ripple 1 */}
        <div className="absolute w-14 h-14 rounded-full border border-amber-500/35 animate-oil-ripple" />
        {/* Outer Ripple 2 (delayed) */}
        <div className="absolute w-14 h-14 rounded-full border border-gold-deep/30 animate-oil-ripple-delayed" />

        {/* Central Liquid Gold Droplet */}
        <div className="relative z-10 flex items-center justify-center animate-oil-pulse">
          <svg
            width="34"
            height="44"
            viewBox="0 0 46 60"
            fill="none"
            className="drop-shadow-[0_4px_10px_rgba(217,119,6,0.38)]"
          >
            <defs>
              <linearGradient id={dropGradId} x1="8" y1="2" x2="38" y2="58" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="25%" stopColor="#F59E0B" />
                <stop offset="70%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#92400E" />
              </linearGradient>
              <linearGradient id={highlightGradId} x1="14" y1="12" x2="18" y2="46" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#FDE68A" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            {/* Outer golden body */}
            <path
              d="M23 2C23 2 43 30 43 42C43 53.0457 34.0457 60 23 60C11.9543 60 3 53.0457 3 42C3 30 23 2 23 2Z"
              fill={`url(#${dropGradId})`}
              stroke="rgba(251,191,36,0.5)"
              strokeWidth="0.8"
            />
            {/* Glistening curved specular reflection */}
            <path
              d="M17 14C14 20 12 28 12 38C12 44 15 48 16 50"
              stroke={`url(#${highlightGradId})`}
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Micro top shine dot */}
            <circle cx="23" cy="9" r="1.5" fill="#FFFFFF" opacity="0.8" />
          </svg>
        </div>
      </div>

      {/* Brand Typography & Status */}
      <div className="relative z-10 flex flex-col items-center mt-1 text-center">
        <span className="text-[10px] font-serif font-bold tracking-[0.22em] uppercase text-pine-950/80">
          Kachi Ghani
        </span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
          <span className="text-[9px] font-sans font-medium tracking-[0.16em] uppercase text-amber-700/80">
            Cold-Pressing
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * SafeImage — drop-in replacement for next/image with loading states & fallbacks.
 *
 * • Local paths (e.g. `/images/foo.png`) → rendered via next/image for optimized delivery.
 * • External URLs → rendered via a plain <img> tag so Next.js doesn't throw
 *   the "Invalid src prop - hostname not configured" error.
 * • Shows an animated liquid gold droplet brand loader and clears the previous image during loading,
 *   preventing stale/old images from lingering.
 * • Adapts loader size automatically so thumbnails never overflow.
 * • If loading fails or src is empty → seamlessly falls back to a matching static product
 *   image from /public/images/.
 */
export default function SafeImage({
  src,
  alt = "",
  fill,
  width,
  height,
  sizes,
  className = "",
  style,
  priority,
  draggable,
  fallbackHint,
  onLoad: externalOnLoad,
  onError: externalOnError,
  showLoader = true,
  compact,
  ...rest
}) {
  const hint = fallbackHint || alt || "";
  const staticFallback = getStaticFallback(hint);

  // Track whether current src has failed
  const [hasError, setHasError] = useState(false);
  // Track loading state
  const [isLoading, setIsLoading] = useState(true);

  // Reset error and set loading on src change
  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const handleLoad = useCallback(
    (e) => {
      setIsLoading(false);
      externalOnLoad?.(e);
    },
    [externalOnLoad]
  );

  const handleError = useCallback(
    (e) => {
      setIsLoading(false);
      if (!hasError) {
        setHasError(true);
        if (e?.target) {
          e.target.onerror = null; // Prevent loop
          e.target.src = staticFallback;
        }
      }
      externalOnError?.(e);
    },
    [hasError, staticFallback, externalOnError]
  );

  // If no src provided or already errored, use the static fallback image
  const effectiveSrc = (!src || hasError) ? staticFallback : src;

  // Determine if this is a thumbnail / compact view to prevent overflow
  const isCompact =
    Boolean(compact) ||
    Boolean(sizes && /(?:48|56|64|72|80|96)\s*px/.test(sizes)) ||
    (typeof width === "number" && width <= 96) ||
    (typeof height === "number" && height <= 96);

  const loaderOverlay = isLoading && showLoader ? (
    <BrandImageLoader isCompact={isCompact} />
  ) : null;

  // For local paths: render via NextImage
  if (!isExternal(effectiveSrc)) {
    const nextImg = (
      <NextImage
        key={effectiveSrc}
        src={effectiveSrc}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={sizes}
        className={`${className} transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
        style={style}
        priority={priority}
        draggable={draggable}
        onLoad={handleLoad}
        onError={handleError}
        {...rest}
      />
    );

    if (fill) {
      return (
        <>
          {loaderOverlay}
          {nextImg}
        </>
      );
    }

    return (
      <span className="relative inline-flex items-center justify-center overflow-hidden" style={{ width, height, ...style }}>
        {loaderOverlay}
        {nextImg}
      </span>
    );
  }

  // For external URLs: use standard <img> to avoid Next.js unconfigured remote host crashes
  const imgStyle = {
    ...style,
    ...(fill
      ? {
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: style?.objectFit || "contain",
        }
      : {}),
  };

  const externalImg = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={effectiveSrc}
      src={effectiveSrc}
      alt={alt}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      className={`${className} transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
      style={imgStyle}
      draggable={draggable}
      onLoad={handleLoad}
      onError={handleError}
      loading={priority ? "eager" : "lazy"}
      {...rest}
    />
  );

  if (fill) {
    return (
      <>
        {loaderOverlay}
        {externalImg}
      </>
    );
  }

  return (
    <span className="relative inline-flex items-center justify-center overflow-hidden" style={{ width, height, ...style }}>
      {loaderOverlay}
      {externalImg}
    </span>
  );
}
