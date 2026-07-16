import ProductsGrid from "@/components/ProductsGrid";

export const metadata = {
  title: "Products — Premium Cold-Pressed Edible Oils",
  description:
    "Browse Yugika Foods' full range of premium cold-pressed edible oils — naturally processed, combining traditional extraction with modern quality standards.",
  alternates: { canonical: "/products" },
};

export default function ProductsPage({ searchParams }) {
  const initialVariant = searchParams?.variant === "yellow" ? "yellow" : searchParams?.variant === "black" ? "black" : "all";

  return (
    <div className="bg-cream px-6 pb-24 pt-36 lg:px-10 lg:pt-44">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold-deep">Products</p>
        <h1 className="mt-5 font-display text-5xl leading-tight text-pine-900 sm:text-6xl">
          Premium <span className="italic text-gold-deep">Cold-Pressed</span> Edible Oils
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink/70">
          Yugika Foods proudly offers naturally processed edible oils that combine traditional extraction with modern quality standards.
        </p>
      </div>

      <div className="mx-auto mt-16 max-w-4xl">
        <ProductsGrid initialVariant={initialVariant} />
      </div>
    </div>
  );
}