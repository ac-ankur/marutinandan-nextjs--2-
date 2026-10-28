"use client";

import { useState, useCallback, useEffect } from "react";
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
 * SafeImage — drop-in replacement for next/image.
 *
 * • Local paths (e.g. `/images/foo.png`) → rendered via next/image for optimized delivery.
 * • External URLs → rendered via a plain <img> tag so Next.js doesn't throw
 *   the "Invalid src prop - hostname not configured" error.
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
  className,
  style,
  priority,
  draggable,
  fallbackHint,
  onError: externalOnError,
  ...rest
}) {
  const hint = fallbackHint || alt || "";
  const staticFallback = getStaticFallback(hint);

  // Track whether current src has failed
  const [hasError, setHasError] = useState(false);

  // Reset error if src changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const handleError = useCallback(
    (e) => {
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

  // For local paths: render via NextImage
  if (!isExternal(effectiveSrc)) {
    return (
      <NextImage
        src={effectiveSrc}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={sizes}
        className={className}
        style={style}
        priority={priority}
        draggable={draggable}
        onError={handleError}
        {...rest}
      />
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

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={effectiveSrc}
      alt={alt}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      className={className}
      style={imgStyle}
      draggable={draggable}
      onError={handleError}
      loading={priority ? "eager" : "lazy"}
      {...rest}
    />
  );
}
