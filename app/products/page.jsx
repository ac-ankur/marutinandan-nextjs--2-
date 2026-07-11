import ProductsGrid from "@/components/ProductsGrid";

export const metadata = {
  title: "Products — Black & Yellow Cold Pressed Mustard Oil",
  description:
    "Browse Marutinandan's full range of cold pressed Kachi Ghani mustard oil — Black and Yellow variants in 1L, 2L, 5L and 15L pack sizes.",
  alternates: { canonical: "/products" },
};

export default function ProductsPage({ searchParams }) {
  const initialVariant = searchParams?.variant === "yellow" ? "yellow" : searchParams?.variant === "black" ? "black" : "all";

  return (
    <div className="bg-cream px-6 pb-24 pt-36 lg:px-10 lg:pt-44">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold-deep">Our Range</p>
        <h1 className="mt-5 font-display text-5xl leading-tight text-pine-900 sm:text-6xl">
          Every bottle, <span className="italic text-gold-deep">every size.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink/70">
          Choose between our sharp, aromatic Black Mustard Oil or the milder, everyday Yellow — each
          available in 1L, 2L, 5L and 15L packs.
        </p>
      </div>

      <div className="mx-auto mt-16 max-w-4xl">
        <ProductsGrid initialVariant={initialVariant} />
      </div>
    </div>
  );
}