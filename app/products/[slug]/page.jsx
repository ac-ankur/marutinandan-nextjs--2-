import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug, products } from "@/data/products";
import LabReportTable from "@/components/LabReportTable";
import EnquiryForm from "@/components/EnquiryForm";
import ProductSkuBadge from "@/components/ProductSkuBadge";
import ProductImageDisplay from "@/components/ProductImageDisplay";
import ProductPricingSection from "@/components/ProductPricingSection";
import ProductReviewsSection from "@/components/reviews/ProductReviewsSection";
import ProductHeroRating from "@/components/reviews/ProductHeroRating";
import PincodeChecker from "@/components/PincodeChecker";
import ProductDetailsAccordion from "@/components/ProductDetailsAccordion";
import ProductBenefitsPanel from "@/components/ProductBenefitsPanel";
import { ProductVariantProvider } from "@/context/ProductVariantContext";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }) {
  const product = getProductBySlug(params.slug);
  if (!product) return {};
  const title = `${product.variantData.name} - ${product.size} ${product.stockUnit}`;
  const description = product.description;
  return {
    title,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { title, description, url: `/products/${product.slug}` },
  };
}

export default function ProductPage({ params }) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();

  // Same flavour, other sizes (for size pill selector)
  const otherSizes = products
    .filter((p) => p.variant === product.variant && p.slug !== product.slug)
    .map((p) => ({ slug: p.slug, size: p.size, stockUnit: p.stockUnit, mrp: p.mrp }));

  // Cross-flavour products (same size, different variety)
  const crossFlavour = products.filter(
    (p) => p.sizeKey === product.sizeKey && p.variant !== product.variant
  );

  // All other products for the "explore more" panel
  const relatedProducts = products
    .filter((p) => p.slug !== product.slug && p.variant !== product.variant)
    .slice(0, 3);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.variantData.name} - ${product.size} ${product.stockUnit}`,
    description: product.description,
    brand: { "@type": "Brand", name: "Marutinandan" },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.mrp,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="bg-cream px-4 pb-24 pt-36 lg:px-10 lg:pt-44">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <div className="mx-auto max-w-6xl">
        <nav className="mb-8 flex items-center gap-2 text-sm text-ink/50">
          <Link href="/products" className="hover:text-pine-800 transition-colors">Products</Link>
          <span>/</span>
          <span className="text-ink/80">{product.variantData.name} - {product.size}</span>
        </nav>

        <ProductVariantProvider>
          <div className="grid gap-10 lg:grid-cols-[1fr_480px] lg:items-start">

            {/* LEFT COLUMN — Product image and rich trust & benefits panel */}
            <div className="space-y-6">
              <ProductImageDisplay product={product} />
              <ProductBenefitsPanel product={product} crossFlavour={crossFlavour} />
            </div>

            <div className="flex flex-col gap-0">
              <p className="text-xs uppercase tracking-[0.25em] text-gold-deep">
                {product.variantData.tagline}
              </p>
              <h1 className="mt-3 font-display text-3xl font-bold text-pine-900 sm:text-4xl">
                {product.variantData.name}
              </h1>
              <p className="mt-1 text-base text-ink/55">
                {product.size} {product.stockUnit}
              </p>

              <div className="mt-3">
                <ProductHeroRating product={product} />
              </div>

              <p className="mt-4 text-sm leading-relaxed text-ink/65">
                {product.description}
              </p>

              <div className="mt-6">
                <ProductPricingSection product={product} otherSizes={otherSizes} />
              </div>

              <PincodeChecker />

              <div className="mt-6 rounded-2xl border border-ink/10 bg-white/50 px-4 py-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink/50">
                  Why Yugika?
                </p>
                <ul className="space-y-2">
                  {product.variantData.features.slice(0, 4).map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-ink/70">
                      <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-gold/20 text-[10px] font-bold text-gold-deep">
                        ✓
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <ProductSkuBadge product={product} />
                <div className="rounded-xl bg-cream-paper px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-ink/45">Pack</p>
                  <p className="mt-1 text-sm font-medium text-pine-900">{product.size} {product.stockUnit}</p>
                </div>
                <div className="rounded-xl bg-cream-paper px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-ink/45">Certification</p>
                  <p className="mt-1 text-sm font-medium text-pine-900">FSSAI - NABL</p>
                </div>
                <div className="rounded-xl bg-cream-paper px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-ink/45">Shelf Life</p>
                  <p className="mt-1 text-sm font-medium text-pine-900">12 months</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16">
            <ProductDetailsAccordion product={product} />
          </div>
        </ProductVariantProvider>

        <div className="mt-16 rounded-3xl bg-pine-950 p-8 lg:p-12">
          <LabReportTable compact />
        </div>

        <ProductReviewsSection product={product} />

        <div id="enquire" className="mt-24 scroll-mt-28">
          <h2 className="text-center font-display text-3xl text-pine-900 sm:text-4xl">
            Enquire about <span className="italic text-gold-deep">{product.variantData.name}</span>
          </h2>
          <div className="mx-auto mt-10 max-w-2xl">
            <EnquiryForm
              defaultProduct={`${product.variantData.name} - ${product.size} ${product.stockUnit}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}