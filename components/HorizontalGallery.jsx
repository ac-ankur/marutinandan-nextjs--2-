"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import SafeImage, { getStaticFallback } from "@/components/SafeImage";
import { shop } from "@/lib/api";
import { getPackPackaging } from "@/data/products";

export default function HorizontalGallery({ items: initialItems = [] }) {
  const [galleryItems, setGalleryItems] = useState(initialItems);
  const [activeHover, setActiveHover] = useState(null);
  const [activeFocusedIndex, setActiveFocusedIndex] = useState(0);

  // Track hover position for individual card zoom lens
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50, pxX: 0, pxY: 0 });
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const cardRefs = useRef([]);
  const imageRefs = useRef([]); // Scoped to just the image wrapper
  const galleryTrackRef = useRef(null);
  const edgeScrollDirectionRef = useRef(0);
  const edgeScrollFrameRef = useRef(null);

  // Fetch live catalog items from Live API
  useEffect(() => {
    let active = true;
    shop.products({ pageSize: 24 })
      .then((res) => {
        if (!active) return;
        const productsList = res?.items || [];
        if (productsList.length > 0) {
          const dynamicItems = [];
          productsList.forEach((prod) => {
            const isYellow = prod.name?.toLowerCase().includes("yellow") || prod.slug?.includes("yellow");
            const isPeanut = prod.name?.toLowerCase().includes("peanut") || prod.slug?.includes("peanut");
            const accent = isYellow ? "#E7C25C" : isPeanut ? "#E0A96D" : "#D3A02E";
            const fallbackImg = isPeanut
              ? "/images/yugika-gold-peanut-oil.png"
              : isYellow
              ? "/images/yellowmustard.png"
              : "/images/blackmustard.png";

            if (Array.isArray(prod.variants) && prod.variants.length > 0) {
              prod.variants.forEach((v) => {
                const img = v.images?.[0]?.url || prod.images?.[0]?.url || getStaticFallback(`${prod.name} ${v.label}`);
                const price = v.price ?? (v.pricePaise ? v.pricePaise / 100 : prod.fromPrice);
                const mrp = v.mrp ?? (v.mrpPaise ? v.mrpPaise / 100 : price);
                const unit = getPackPackaging(v.label || v.sku || prod.name);
                dynamicItems.push({
                  slug: prod.slug,
                  variantId: v.id,
                  image: img,
                  size: v.label || "1 Litre",
                  stockUnit: unit,
                  price,
                  mrp,
                  inStock: v.inStock !== false,
                  variantData: {
                    name: prod.name,
                    tagline: prod.description || "Strong. Aromatic. Traditional Kachi Ghani.",
                    accent,
                  },
                });
              });
            } else {
              const img = prod.images?.[0]?.url || fallbackImg;
              const unit = getPackPackaging(prod.name);
              dynamicItems.push({
                slug: prod.slug,
                image: img,
                size: "Standard",
                stockUnit: unit,
                price: prod.fromPrice,
                inStock: prod.inStock !== false,
                variantData: {
                  name: prod.name,
                  tagline: prod.description || "100% Pure Cold Pressed Mustard Oil",
                  accent,
                },
              });
            }
          });

          if (dynamicItems.length > 0) {
            setGalleryItems(dynamicItems);
          }
        }
      })
      .catch(() => {});

    return () => { active = false; };
  }, []);

  // Update galleryItems if parent props change and dynamicItems hasn't loaded
  useEffect(() => {
    if (initialItems && initialItems.length > 0 && galleryItems.length === 0) {
      setGalleryItems(initialItems);
    }
  }, [initialItems, galleryItems.length]);

  // Let desktop users scroll the gallery by hovering near either edge.
  const scrollAtEdge = () => {
    const track = galleryTrackRef.current;
    const direction = edgeScrollDirectionRef.current;

    if (track && direction) {
      track.scrollLeft += direction * 12;
      edgeScrollFrameRef.current = window.requestAnimationFrame(scrollAtEdge);
    } else {
      edgeScrollFrameRef.current = null;
    }
  };

  const handleGalleryMouseMove = (event) => {
    const track = galleryTrackRef.current;
    if (!track) return;

    const { left, width } = track.getBoundingClientRect();
    const relativeX = (event.clientX - left) / width;
    const edgeSize = 0.2;

    edgeScrollDirectionRef.current = relativeX < edgeSize ? -1 : relativeX > 1 - edgeSize ? 1 : 0;
    if (edgeScrollDirectionRef.current && !edgeScrollFrameRef.current) {
      edgeScrollFrameRef.current = window.requestAnimationFrame(scrollAtEdge);
    }
  };

  const stopEdgeScroll = () => {
    edgeScrollDirectionRef.current = 0;
    if (edgeScrollFrameRef.current) {
      window.cancelAnimationFrame(edgeScrollFrameRef.current);
      edgeScrollFrameRef.current = null;
    }
  };

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
  }, [galleryItems]);

  // Tilt tracks the whole card
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

  // Zoom lens tracks ONLY the image wrapper
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

      <div
        ref={galleryTrackRef}
        onMouseMove={handleGalleryMouseMove}
        onMouseLeave={stopEdgeScroll}
        className="gallery-scroll flex w-full gap-6 overflow-x-auto snap-x snap-mandatory py-12 px-6 lg:px-10"
      >
        {galleryItems.map((item, index) => {
          const isHovered = activeHover === index;
          const isFocusedMobile = activeFocusedIndex === index;
          const targetUrl = `/products/${item.slug}${item.variantId ? `?variant=${item.variantId}` : ""}`;

          return (
            <Link
              href={targetUrl}
              key={`${item.slug}-${item.variantId || index}`}
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
                style={{ background: item.variantData?.accent || "#D3A02E" }}
              />

              {/* Product Image Wrapper with Mobile 3D Pop-Out & Desktop Lift */}
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
                  <SafeImage
                    src={item.image}
                    alt={`${item.variantData?.name || "Product"} - ${item.size}`}
                    fallbackHint={`${item.variantData?.name || ""} ${item.size}`}
                    fill
                    className="object-contain object-center drop-shadow-xl"
                    sizes="(max-width: 768px) 300px, 340px"
                    priority
                  />
                </div>

                {/* Desktop Magnifying Lens Overlay */}
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
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.25em] text-gold-light">
                    {item.size} · {getPackPackaging(item.size || item.stockUnit || item.slug)}
                  </p>
                  {item.price != null && (
                    <span className="font-display text-base font-bold text-cream">
                      ₹{item.price}
                    </span>
                  )}
                </div>
                <h3 className="mt-2 font-display text-2xl text-cream line-clamp-1">{item.variantData?.name}</h3>
                <p className="mt-1 text-sm text-cream/60 line-clamp-2">{item.variantData?.tagline}</p>
                <div className="mt-5 flex items-center justify-between border-t border-cream/10 pt-4">
                  <span className={`text-xs font-medium ${item.inStock !== false ? "text-emerald-400" : "text-rose-400"}`}>
                    {item.inStock !== false ? "● In Stock" : "○ Out of Stock"}
                  </span>
                  <span className="text-xs text-cream/70 transition-colors group-hover:text-cream">
                    View Product →
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
