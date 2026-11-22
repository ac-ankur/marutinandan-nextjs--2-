"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
    if (h.includes("100ml") || h.includes("100 ml")) return "/images/1l_yellow_mustard_front.png";
    if (h.includes("15") || h.includes("15l") || h.includes("tin"))  return "/images/15l_yellow_mustard.png";
    if (h.includes("5l") || h.includes("5 l") || h.includes("jar") || h.includes("can"))  return "/images/5l_yellow_mustard_front.png";
    if (h.includes("1l") || h.includes("1 l") || h.includes("bottle"))  return "/images/1l_yellow_mustard_front.png";
    return "/images/yellowmustard.png";
  }

  // Black mustard oil (default) — match size if mentioned
  if (h.includes("100ml") || h.includes("100 ml")) return "/images/1l_black_mustard_front.png";
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
 * Minimal image loading overlay that keeps attention on the image area.
 */
function BrandImageLoader({ isCompact = false }) {
  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none select-none"
      aria-hidden="true"
    >
      <span className={`relative flex items-center justify-center ${isCompact ? "h-6 w-6" : "h-10 w-10"}`}>
        <span className="absolute inset-0 animate-spin rounded-full border border-gold-light/35 border-t-gold-light" />
        <svg
          viewBox="0 0 24 30"
          fill="none"
          className={`${isCompact ? "h-2.5 w-2" : "h-4 w-3.5"} drop-shadow-sm`}
        >
          <path
            d="M12 1.5C12 1.5 21 13.3 21 19.1a9 9 0 1 1-18 0C3 13.3 12 1.5 12 1.5Z"
            fill="#D99A24"
            stroke="#F2D58A"
            strokeWidth="1.2"
          />
          <path d="M8.2 15.2c-.8 1.5-1.1 3-.7 4.5" stroke="#FFF4D6" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </span>
    </div>
  );
}

/**
 * SafeImage — drop-in replacement for next/image with loading states & fallbacks.
 *
 * • Local paths (e.g. `/images/foo.png`) → rendered via next/image for optimized delivery.
 * • External URLs → rendered via a plain <img> tag so Next.js doesn't throw
 *   the "Invalid src prop - hostname not configured" error.
 * • Shows a minimal spinner and clears the previous image during loading,
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
  const loadTimeoutRef = useRef(null);

  // Reset error and set loading on src change
  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
    clearTimeout(loadTimeoutRef.current);
    if (isExternal(src)) {
      loadTimeoutRef.current = setTimeout(() => {
        setHasError(true);
        setIsLoading(false);
      }, 10000);
    }
    return () => clearTimeout(loadTimeoutRef.current);
  }, [src]);

  const handleLoad = useCallback(
    (e) => {
      clearTimeout(loadTimeoutRef.current);
      setIsLoading(false);
      externalOnLoad?.(e);
    },
    [externalOnLoad]
  );

  const handleError = useCallback(
    (e) => {
      clearTimeout(loadTimeoutRef.current);
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
