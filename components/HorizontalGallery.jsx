"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function HorizontalGallery({ items }) {
  const [activeHover, setActiveHover] = useState(null);
  const [activeFocusedIndex, setActiveFocusedIndex] = useState(0);

  // Track hover position for individual card zoom lens
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50, pxX: 0, pxY: 0 });
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const cardRefs = useRef([]);
  const imageRefs = useRef([]); // NEW: refs scoped to just the image wrapper

  // IntersectionObserver to handle the 3D focus animation on mobile scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            setActiveFocusedIndex(index);
          }
        });
      },
      {
        threshold: 0.6, // Card must be 60% visible to trigger focus
      }
    );

    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [items]);

  // Tilt now tracks the whole card (kept as-is, feels nicer for the 3D lift)
  const handleCardMouseMove = (e, index) => {
    const card = cardRefs.current[index];
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = -((mouseY - centerY) / centerY) * 8; // Max 8 deg rotation
    const rotateY = ((mouseX - centerX) / centerX) * 8;

    setTilt({ rx: rotateX, ry: rotateY });
  };

  // Zoom lens now tracks ONLY the image wrapper, not the full card
  const handleImageMouseMove = (e, index) => {
    const imageEl = imageRefs.current[index];
    if (!imageEl) return;

    const rect = imageEl.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const percentX = (mouseX / rect.width) * 100;
    const percentY = (mouseY / rect.height) * 100;

    setActiveHover(index);
    setZoomPos({ x: percentX, y: percentY, pxX: mouseX, pxY: mouseY });
  };

  const handleImageMouseLeave = () => {
    setActiveHover(null);
  };

  const handleCardMouseLeave = () => {
    setTilt({ rx: 0, ry: 0 });
  };

  const LENS_SIZE = 130;
  const ZOOM_LEVEL = 2.2;

  return (
    <section className="relative overflow-hidden bg-pine-950 py-14">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-4 max-w-2xl">
          <p className="text-lg uppercase tracking-[0.3em] text-gold-light">Explore</p>
          <h2 className="mt-2 font-display text-3xl text-cream lg:text-4xl">
            Every bottle, <span className="italic text-gold-light">every size.</span>
          </h2>
        </div>
      </div>

      <div className="flex w-full gap-6 overflow-x-auto snap-x snap-mandatory py-12 px-6 lg:px-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        {items.map((item, index) => {
          const isHovered = activeHover === index;
          const isFocusedMobile = activeFocusedIndex === index;

          return (
            <Link
              href={`/products/${item.slug}`}
              key={`${item.slug}-${index}`}
              ref={(el) => (cardRefs.current[index] = el)}
              data-index={index}
              data-cursor-hover
              onMouseMove={(e) => handleCardMouseMove(e, index)}
              onMouseLeave={handleCardMouseLeave}
              style={{
                perspective: "1000px",
                transform: tilt.rx || tilt.ry
                  ? `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateY(-6px)`
                  : "perspective(1000px) rotateX(0deg) rotateY(0deg)",
              }}
              className="gallery-card group relative flex h-[440px] w-[85vw] max-w-[300px] shrink-0 snap-center flex-col justify-end overflow-hidden rounded-3xl border border-cream/10 bg-gradient-to-b from-pine-800 to-pine-900 p-7 text-left whitespace-normal transition-all duration-300 ease-out lg:h-[480px] lg:w-[340px] lg:max-w-[340px]"
            >
              {/* Glow ambient background */}
              <div
                className="pointer-events-none absolute right-6 top-6 h-28 w-28 rounded-full opacity-80 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: item.variantData.accent }}
              />

              {/* Product Image Wrapper with Mobile 3D Pop-Out & Desktop Lift */}
              {/* This div is now the ONLY area that triggers/clips the zoom lens */}
              <div
                ref={(el) => (imageRefs.current[index] = el)}
                onMouseMove={(e) => handleImageMouseMove(e, index)}
                onMouseLeave={handleImageMouseLeave}
                className="relative z-10 mb-6 flex h-72 justify-center overflow-hidden rounded-xl"
              >
                <div
                  className={`relative w-full transition-transform duration-500 ease-out ${
                    isFocusedMobile
                      ? "scale-110 -translate-y-4 drop-shadow-[0_25px_25px_rgba(0,0,0,0.75)] sm:scale-100 sm:translate-y-0"
                      : "scale-95 opacity-85 sm:scale-100 sm:opacity-100"
                  } ${isHovered ? "sm:scale-105 sm:-translate-y-2" : ""}`}
                >
                  <Image
                    src={item.image}
                    alt={`${item.variantData.name} - ${item.size}`}
                    fill
                    className="object-contain object-center drop-shadow-xl"
                    sizes="(max-width: 768px) 300px, 340px"
                    priority
                  />
                </div>

                {/* Desktop Magnifying Lens Overlay — now positioned/clipped to the image box only */}
                {isHovered && (
                  <div
                    className="pointer-events-none absolute z-30 hidden rounded-full border border-gold-light/60 shadow-2xl sm:block"
                    style={{
                      width: `${LENS_SIZE}px`,
                      height: `${LENS_SIZE}px`,
                      left: `${zoomPos.pxX - LENS_SIZE / 2}px`,
                      top: `${zoomPos.pxY - LENS_SIZE / 2}px`,
                      backgroundImage: `url(${item.image})`,
                      backgroundRepeat: "no-repeat",
                      backgroundSize: `${ZOOM_LEVEL * 100}%`,
                      backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                    }}
                  />
                )}
              </div>

              {/* Product Details */}
              <div className="relative z-10">
                <p className="text-xs uppercase tracking-[0.25em] text-gold-light">
                  {item.size} · {item.stockUnit}
                </p>
                <h3 className="mt-2 font-display text-2xl text-cream">{item.variantData.name}</h3>
                <p className="mt-2 text-sm text-cream/60">{item.variantData.tagline}</p>
                <div className="mt-5 flex items-center justify-end border-t border-cream/10 pt-4">
                  <span className="text-xs text-cream/70 transition-colors group-hover:text-cream">
                    View SKU →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}