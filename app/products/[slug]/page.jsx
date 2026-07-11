import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug, products } from "@/data/products";
import LabReportTable from "@/components/LabReportTable";
import EnquiryForm from "@/components/EnquiryForm";
import ProductSkuBadge from "@/components/ProductSkuBadge";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }) {
  const product = getProductBySlug(params.slug);
  if (!product) return {};

  const title = `${product.variantData.name} — ${product.size} ${product.stockUnit}`;
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

  const otherSizes = products.filter((p) => p.variant === product.variant && p.slug !== product.slug);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.variantData.name} — ${product.size} ${product.stockUnit}`,
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
    <div className="bg-cream px-6 pb-24 pt-36 lg:px-10 lg:pt-44">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <div className="mx-auto max-w-6xl">
        <nav className="mb-10 flex items-center gap-2 text-sm text-ink/50">
          <Link href="/products" className="hover:text-pine-800">Products</Link>
          <span>/</span>
          <span className="text-ink/80">{product.variantData.name} · {product.size}</span>
        </nav>

        <div className="grid gap-14 lg:grid-cols-2">
          <div className="relative flex h-[420px] items-center justify-center rounded-3xl bg-pine-950 lg:h-[520px]">
            <div
              className="absolute h-56 w-56 rounded-full opacity-30 blur-3xl"
              style={{ background: product.variantData.accent }}
            />
            <svg width="160" height="208" viewBox="0 0 46 60" fill="none" className="relative z-10 drop-shadow-2xl">
              <path
                d="M23 2C23 2 43 30 43 42C43 53.0457 34.0457 60 23 60C11.9543 60 3 53.0457 3 42C3 30 23 2 23 2Z"
                fill={product.variantData.accent}
              />
              <ellipse cx="16" cy="26" rx="4.5" ry="9" fill="#fff" opacity="0.3" />
            </svg>
            <span className="absolute bottom-6 rounded-full bg-cream/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-cream/70">
              {product.size} · {product.stockUnit}
            </span>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold-deep">{product.variantData.tagline}</p>
            <h1 className="mt-4 font-display text-4xl text-pine-900 sm:text-5xl">
              {product.variantData.name}
            </h1>
            <p className="mt-2 font-display text-xl italic text-ink/60">
              {product.size} {product.stockUnit}
            </p>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-ink/70">{product.description}</p>

            <ul className="mt-6 space-y-2.5">
              {product.variantData.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-ink/70">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-gold-deep/40 text-gold-deep">
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex items-center gap-6">
              <span className="font-display text-4xl text-gold-deep">₹{product.mrp}</span>
              <span className="text-sm text-ink/50">MRP, inclusive of taxes</span>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
              <ProductSkuBadge product={product} />
              <SpecRow label="Pack" value={`${product.size} ${product.stockUnit}`} />
              <SpecRow label="Certification" value="FSSAI · NABL" />
              <SpecRow label="Shelf Life" value="12 months" />
            </div>

            <p className="mt-6 rounded-xl bg-gold/10 px-4 py-3 text-sm text-gold-deep">{product.suitability}</p>

            <a
              href="#enquire"
              data-scroll-to="#enquire"
              data-cursor-hover
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-pine-800 px-7 py-3.5 text-sm font-medium text-cream transition-transform hover:scale-[1.02]"
            >
              Enquire About This Pack →
            </a>

            {otherSizes.length > 0 && (
              <div className="mt-10 border-t border-ink/10 pt-6">
                <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Other sizes</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {otherSizes.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/products/${s.slug}`}
                      className="rounded-full border border-ink/15 px-4 py-2 text-sm text-ink/70 transition-colors hover:border-gold-deep hover:text-pine-800"
                    >
                      {s.size} {s.stockUnit}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-24 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold-deep">Product Description</p>
            <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-ink/70">
              {product.fullDescription}
            </p>
          </div>
          <div className="rounded-3xl bg-cream-paper p-7">
            <p className="text-xs uppercase tracking-[0.25em] text-gold-deep">Best Suited For</p>
            <p className="mt-4 text-sm leading-relaxed text-ink/70">{product.suitability}</p>
          </div>
        </div>

        <div className="mt-24 rounded-3xl bg-pine-950 p-8 lg:p-12">
          <LabReportTable compact />
        </div>

        <div id="enquire" className="mt-24 scroll-mt-28">
          <h2 className="text-center font-display text-3xl text-pine-900 sm:text-4xl">
            Enquire about <span className="italic text-gold-deep">{product.variantData.name}</span>
          </h2>
          <div className="mx-auto mt-10 max-w-2xl">
            <EnquiryForm defaultProduct={`${product.variantData.name} · ${product.size} ${product.stockUnit}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecRow({ label, value }) {
  return (
    <div className="rounded-xl bg-cream-paper px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.15em] text-ink/45">{label}</p>
      <p className="mt-1 font-medium text-pine-900">{value}</p>
    </div>
  );
}
