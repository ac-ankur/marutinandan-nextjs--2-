"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import gsap from "gsap";
import { getAllProducts } from "@/data/products";
import { usePricingMode } from "@/context/PricingModeContext";
import { useCart } from "@/context/CartContext";
import { shop, formatApiError } from "@/lib/api";
import { Search, Sparkles, RefreshCw, ShoppingBag, ArrowUpDown, Check, Loader2 } from "lucide-react";

/* ── Shared micro-button used inside every product card ── */
function CardAddButton({ onClick, loading, done, disabled }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); onClick(); }}
      disabled={disabled || loading || done}
      className={`
        relative flex items-center justify-center gap-1.5 overflow-hidden rounded-full
        px-4 py-2 text-xs font-semibold transition-all duration-300 flex-shrink-0
        ${
          done
            ? "bg-emerald-600 text-white"
            : disabled
            ? "cursor-not-allowed bg-ink/10 text-ink/40"
            : "bg-pine-900 text-cream hover:bg-pine-800 hover:shadow-[0_4px_14px_-4px_rgba(20,40,25,0.4)] active:scale-95"
        }
      `}
      aria-label={done ? "Added" : "Add to Bag"}
    >
      {/* shimmer */}
      {!done && !disabled && (
        <span className="absolute inset-0 translate-x-[-100%] skew-x-[-8deg] bg-white/10 transition-transform duration-500 group-hover/card:translate-x-[110%]" />
      )}
      {loading ? (
        <><Loader2 className="h-3.5 w-3.5 animate-spin" /><span>Adding…</span></>
      ) : done ? (
        <><Check className="h-3.5 w-3.5 stroke-[2.5]" /><span>Added!</span></>
      ) : (
        <><ShoppingBag className="h-3.5 w-3.5" /><span>Add to Bag</span></>
      )}
    </button>
  );
}

export default function ProductsGrid({ initialVariant = "all" }) {
  const { isDynamic, setPricingMode } = usePricingMode();
  const [filter, setFilter] = useState(initialVariant);
  const gridRef = useRef(null);

  // ---------------- STATIC MODE STATE ----------------
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

  // ---------------- DYNAMIC API MODE STATE ----------------
  const [dynamicProducts, setDynamicProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch dynamic categories
  useEffect(() => {
    if (isDynamic) {
      shop.categories().then((cats) => setCategories(cats || [])).catch(() => {});
    }
  }, [isDynamic]);

  // Fetch dynamic products from GET /products?sort=newest&page=1&pageSize=12
  const fetchDynamicProducts = useCallback(
    async (targetPage = 1, currentCat = selectedCategory, currentSort = sortBy, currentSearch = search) => {
      setLoading(true);
      setError("");
      try {
        const params = { page: targetPage, pageSize: 12, sort: currentSort };
        if (currentCat && currentCat !== "all") params.category = currentCat;
        if (currentSearch.trim()) params.search = currentSearch.trim();

        const res = await shop.products(params);
        setDynamicProducts(res?.items || []);
        setMeta(res?.meta || null);
        setPage(targetPage);
      } catch (err) {
        setError(formatApiError(err));
      } finally {
        setLoading(false);
      }
    },
    [selectedCategory, sortBy, search]
  );

  useEffect(() => {
    if (isDynamic) {
      fetchDynamicProducts(1, selectedCategory, sortBy, search);
    }
  }, [isDynamic, fetchDynamicProducts, selectedCategory, sortBy]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".product-card",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" }
      );
    }, gridRef);
    return () => ctx.revert();
  }, [filter, isDynamic, dynamicProducts]);

  // If in Dynamic Mode, render the Dynamic API Catalog
  if (isDynamic) {
    return (
      <div className="space-y-8">
        {/* API Filter Bar (Category, Search, Sort) matching Postman collection */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Categories Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                selectedCategory === "all"
                  ? "bg-pine-800 text-cream shadow-xs"
                  : "bg-cream-paper border border-ink/10 text-ink/70 hover:text-ink"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id || cat.slug}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  selectedCategory === cat.slug
                    ? "bg-pine-800 text-cream shadow-xs"
                    : "bg-cream-paper border border-ink/10 text-ink/70 hover:text-ink"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchDynamicProducts(1, selectedCategory, sortBy, search)}
                placeholder="Search products…"
                className="w-44 sm:w-56 rounded-full border border-ink/15 bg-cream-paper py-1.5 pl-8 pr-3 text-xs text-ink/80 outline-none focus:border-gold-deep"
              />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-full border border-ink/15 bg-cream-paper py-1.5 px-3 text-xs font-medium text-ink/80 outline-none focus:border-gold-deep cursor-pointer"
              >
                <option value="newest">Sort: Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Products Grid */}
        <div ref={gridRef} className="grid gap-7 sm:grid-cols-2">
          {loading ? (
            <div className="col-span-2 py-16 text-center text-sm text-ink/50">
              <RefreshCw className="mx-auto h-6 w-6 animate-spin text-gold-deep mb-2" />
              Fetching live products from API…
            </div>
          ) : error ? (
            <div className="col-span-2 rounded-2xl border border-rose-200 bg-rose-50/70 p-6 text-center text-rose-800">
              <p className="font-semibold text-sm">Failed to load dynamic API products</p>
              <p className="mt-1 text-xs text-rose-600">{error}</p>
              <button
                type="button"
                onClick={() => setPricingMode("static")}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-pine-800 px-5 py-2 text-xs font-semibold text-cream hover:bg-pine-900 shadow-sm"
              >
                Switch to Static Catalog
              </button>
            </div>
          ) : dynamicProducts.length === 0 ? (
            <div className="col-span-2 rounded-2xl border border-dashed border-ink/15 bg-cream-paper p-12 text-center text-ink/60">
              <ShoppingBag className="mx-auto h-8 w-8 text-ink/30 mb-2" />
              <p className="font-semibold text-pine-900 text-sm">No products found in live API</p>
              <p className="mt-1 text-xs text-ink/50">No catalog products match your search or category criteria.</p>
              <button
                type="button"
                onClick={() => setPricingMode("static")}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-pine-800 px-5 py-2 text-xs font-semibold text-cream hover:bg-pine-900 shadow-sm"
              >
                View Static Catalog
              </button>
            </div>
          ) : (
            dynamicProducts.map((p) => (
              <DynamicProductCard key={p.id || p.slug} product={p} />
            ))
          )}
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-ink/10 pt-4 text-xs text-ink/60">
            <span>
              Page {page} of {meta.totalPages} ({meta.total} products)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fetchDynamicProducts(page - 1, selectedCategory, sortBy, search)}
                disabled={page <= 1 || loading}
                className="rounded-full border border-ink/15 bg-cream-paper px-4 py-1.5 font-medium disabled:opacity-40 hover:bg-white transition-colors"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => fetchDynamicProducts(page + 1, selectedCategory, sortBy, search)}
                disabled={page >= meta.totalPages || loading}
                className="rounded-full border border-ink/15 bg-cream-paper px-4 py-1.5 font-medium disabled:opacity-40 hover:bg-white transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---------------- STATIC MODE RENDERING (UNCHANGED) ----------------
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

/* ------------------- DYNAMIC PRODUCT CARD (API DRIVEN) ------------------- */
function DynamicProductCard({ product }) {
  const { addItem } = useCart();
  const variants = product.variants || [];
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id);
  const activeVariant = variants.find((v) => v.id === selectedVariantId) || variants[0];
  const [addState, setAddState] = useState("idle"); // idle | loading | done | error
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const activePrice = activeVariant ? activeVariant.price ?? (activeVariant.pricePaise / 100) : product.fromPrice;
  const activeMrp = activeVariant ? activeVariant.mrp ?? (activeVariant.mrpPaise / 100) : activePrice;
  const hasDiscount = activeMrp > activePrice;
  const isInStock = activeVariant?.inStock !== false;

  // Reset feedback when variant switches
  useEffect(() => { setAddState("idle"); }, [selectedVariantId]);

  const isYellow = product.name?.toLowerCase().includes("yellow") || product.slug?.includes("yellow");
  const fallbackImage = isYellow ? "/images/yellowmustard.png" : "/images/blackmustard.png";
  const variantImages = Array.isArray(activeVariant?.images)
    ? activeVariant.images.filter((image) => image?.url)
    : [];
  const displayImages = variantImages.length
    ? variantImages
    : product.images?.length
      ? product.images
      : [{ url: fallbackImage, alt: product.name }];
  const activeImage = displayImages[activeImageIndex] || displayImages[0];
  const displayImage = activeImage?.url || fallbackImage;

  const handleAdd = useCallback(async () => {
    if (!activeVariant?.id) return;
    setAddState("loading");
    try {
      await addItem(activeVariant.id, 1, {
        productName: product.name,
        productSlug: product.slug,
        variantLabel: activeVariant.label || activeVariant.sku,
        sku: activeVariant.sku,
        image: variantImages[0]?.url || product.images?.[0]?.url || fallbackImage,
        pricePaise: activeVariant.pricePaise ?? (activePrice * 100),
        mrpPaise: activeVariant.mrpPaise ?? (activeMrp * 100),
      });
      setAddState("done");
      setTimeout(() => setAddState("idle"), 2500);
    } catch (_) {
      setAddState("idle");
    }
  }, [activeVariant, product, addItem, activePrice, activeMrp, fallbackImage]);

  return (
    <div className="product-card group/card relative flex flex-col overflow-hidden rounded-[28px] border border-ink/10 bg-cream-paper p-7 shadow-[0_1px_2px_rgba(20,30,20,0.04)] transition-shadow duration-300 hover:shadow-[0_18px_40px_-24px_rgba(20,40,25,0.35)]">
      {/* Dynamic API Badge */}
      <div className="absolute right-6 top-6 z-20 flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
        <Sparkles className="h-2.5 w-2.5 text-amber-600" />
        <span>Live API</span>
      </div>

      <div className="relative flex h-56 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-white to-cream-paper">
        <div className="relative h-48 w-64">
          <SafeImage
            src={displayImage}
            alt={activeImage?.alt || product.name}
            fallbackHint={`${product.name} ${activeVariant?.label || ""}`}
            fill
            className="object-contain object-center transition-transform duration-300 ease-out group-hover/card:scale-105"
            sizes="(max-width: 768px) 256px, 256px"
          />
        </div>
      </div>

      {displayImages.length > 1 && (
        <div className="mt-3 flex justify-center gap-2" aria-label={`${activeVariant?.label || "Product"} images`}>
          {displayImages.map((image, index) => (
            <button
              key={`${image.url}-${index}`}
              type="button"
              onClick={() => setActiveImageIndex(index)}
              aria-label={`Show ${image.alt || `image ${index + 1}`}`}
              aria-pressed={activeImageIndex === index}
              className={`relative h-12 w-12 overflow-hidden rounded-lg border bg-white p-1 ${activeImageIndex === index ? "border-pine-800 ring-2 ring-pine-800/15" : "border-ink/15 hover:border-gold-deep/60"}`}
            >
              <SafeImage src={image.url} alt={image.alt || ""} fill className="object-contain" sizes="48px" />
            </button>
          ))}
        </div>
      )}

      <div className="relative z-10 mt-5">
        <span className="text-[10px] uppercase tracking-wider text-gold-deep font-semibold">
          {product.category?.name || "Cold Pressed Oils"}
        </span>
        <h3 className="font-display text-xl text-pine-900 mt-1">{product.name}</h3>
        <p className="mt-1 text-xs text-ink/60 line-clamp-2">{product.description}</p>

        {/* Live Variant Selector */}
        {variants.length > 0 && (
          <div className="mt-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-ink/45">
              Available sizes (Live Stock)
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {variants.map((v) => {
                const isSelected = activeVariant?.id === v.id;
                return (
                  <button
                    key={v.id || v.sku}
                    type="button"
                    onClick={() => {
                      setSelectedVariantId(v.id);
                      setActiveImageIndex(0);
                    }}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                      isSelected
                        ? "border-pine-800 bg-pine-800 text-cream"
                        : "border-ink/15 text-ink/70 hover:border-gold-deep hover:text-pine-800"
                    }`}
                  >
                    {v.label || v.sku}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Price, Link & Add to Bag */}
        <div className="mt-6 border-t border-ink/10 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl text-gold-deep">₹{activePrice}</span>
                {hasDiscount && (
                  <span className="text-xs text-ink/40 line-through">₹{activeMrp}</span>
                )}
              </div>
              {activeVariant && (
                <span className={`text-[10px] font-medium ${isInStock ? "text-emerald-700" : "text-rose-600"}`}>
                  {isInStock ? "● In Stock" : "● Out of Stock"}
                </span>
              )}
            </div>
            <Link
              href={`/products/${product.slug}`}
              className="text-xs font-semibold text-pine-800 underline decoration-gold decoration-2 underline-offset-4 hover:text-gold-deep transition-colors"
            >
              View details →
            </Link>
          </div>
          <CardAddButton
            onClick={handleAdd}
            loading={addState === "loading"}
            done={addState === "done"}
            disabled={!isInStock}
          />
        </div>
      </div>
    </div>
  );
}


function VariantCard({ group }) {
  const { addItem } = useCart();
  const sortedSizes = [...group.sizes].sort((a, b) => a.mrp - b.mrp);
  const [selectedSlug, setSelectedSlug] = useState(sortedSizes[0].slug);
  const selected = sortedSizes.find((s) => s.slug === selectedSlug) || sortedSizes[0];
  const [addState, setAddState] = useState("idle"); // idle | loading | done

  // Reset feedback when size switches
  useEffect(() => { setAddState("idle"); }, [selectedSlug]);

  // Build gallery — supports optional images array, falls back to front/back pair
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

  const handleAdd = useCallback(async () => {
    const guestVariantId = selected.skuBase || selected.slug;
    setAddState("loading");
    try {
      await addItem(guestVariantId, 1, {
        productName: group.variantData.name,
        productSlug: selected.slug,
        variantLabel: `${selected.size} ${selected.stockUnit}`,
        sku: selected.skuBase,
        image: selected.image,
        pricePaise: selected.mrp * 100,
        mrpPaise: selected.mrp * 100,
      });
      setAddState("done");
      setTimeout(() => setAddState("idle"), 2500);
    } catch (_) {
      setAddState("idle");
    }
  }, [selected, group, addItem]);

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

        <div className="mt-6 border-t border-ink/10 pt-4">
          <div className="flex items-center justify-between">
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
          <CardAddButton
            onClick={handleAdd}
            loading={addState === "loading"}
            done={addState === "done"}
            disabled={false}
          />
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
          <SafeImage
            key={active.src}
            src={active.src}
            alt={`${alt} — ${active.label || `photo ${activeIndex + 1}`}`}
            fallbackHint={alt}
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
              <SafeImage src={img.src} alt={img.label || `Photo ${i + 1}`} fallbackHint={alt} fill className="object-contain p-1" sizes="48px" />
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
          <SafeImage src={active.src} alt={alt} fallbackHint={alt} fill className="object-contain" sizes="480px" draggable={false} priority />
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
