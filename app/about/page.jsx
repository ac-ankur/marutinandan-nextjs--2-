import Image from "next/image";
import Link from "next/link";
import { company, brands } from "@/data/company";

export const metadata = {
  title: "About Us — Yugika Foods Private Limited",
  description: "Yugika Foods Private Limited is passionate about bringing purity back to everyday cooking.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="bg-cream px-6 pb-24 pt-36 lg:px-10 lg:pt-44">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold-deep">About Yugika Foods</p>
        <h1 className="mt-5 font-display text-5xl leading-tight text-pine-900 sm:text-6xl">
          Pure. Honest. <span className="italic text-gold-deep">Cold-Pressed.</span>
        </h1>
        <div className="mx-auto mt-8 flex max-w-3xl flex-col gap-6 text-base leading-relaxed text-ink/75">
          <p>
            At Yugika Foods Private Limited, we are passionate about bringing purity back to everyday cooking. Inspired by India&apos;s age-old tradition of cold-pressed oil extraction, we believe that food should remain as close to nature as possible—free from excessive processing, chemical refining, and unnecessary additives.
          </p>
          <p>
            Our journey is built on a simple philosophy: deliver naturally nutritious edible oils that preserve the authentic taste, aroma, and nutritional goodness of every seed.
          </p>
          <p>
            Using traditional cold-pressed extraction methods, we carefully preserve essential nutrients, antioxidants, and the rich flavour that nature intended.
          </p>
          <p>
            Today, we proudly manufacture premium Black Mustard Oil and Yellow Mustard Oil under our trusted brands, with the same uncompromising commitment to quality, purity, and transparency.
          </p>
          <p>
            As we continue to grow, our vision is to expand our portfolio with premium cold-pressed Groundnut Oil, Sesame Oil, Sunflower Oil, and other naturally processed edible products while remaining true to the values that define our company.
          </p>
        </div>
      </div>

      <div className="mx-auto mt-24 max-w-5xl">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gold-deep">— Our Core Values —</p>
          <h2 className="mt-4 font-display text-4xl text-pine-900 sm:text-5xl">
            What drives <span className="italic text-gold-deep">us.</span>
          </h2>
        </div>
        
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl bg-cream-paper p-8 text-center transition-shadow hover:shadow-[0_20px_50px_-25px_rgba(21,56,38,0.2)]">
            <h3 className="font-display text-2xl text-pine-900">Purity</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">Every bottle reflects our commitment to natural goodness.</p>
          </div>
          <div className="rounded-3xl bg-cream-paper p-8 text-center transition-shadow hover:shadow-[0_20px_50px_-25px_rgba(21,56,38,0.2)]">
            <h3 className="font-display text-2xl text-pine-900">Quality</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">Premium ingredients. Premium processes. Premium products.</p>
          </div>
          <div className="rounded-3xl bg-cream-paper p-8 text-center transition-shadow hover:shadow-[0_20px_50px_-25px_rgba(21,56,38,0.2)]">
            <h3 className="font-display text-2xl text-pine-900">Integrity</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">Honest manufacturing with complete transparency.</p>
          </div>
          <div className="rounded-3xl bg-cream-paper p-8 text-center transition-shadow hover:shadow-[0_20px_50px_-25px_rgba(21,56,38,0.2)]">
            <h3 className="font-display text-2xl text-pine-900">Sustainability</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">Responsible sourcing and environmentally conscious practices.</p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-24 max-w-5xl">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gold-deep">— Our Brands —</p>
          <h2 className="mt-4 font-display text-4xl text-pine-900 sm:text-5xl">
            Trusted Brands. <span className="italic text-gold-deep">One Commitment.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ink/75">
            Yugika Foods Private Limited proudly offers its premium cold-pressed edible oils through trusted brands built on the same foundation of purity, quality, and authenticity.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-2">
          <div className="rounded-3xl bg-cream-paper p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/60 font-display text-lg text-pine-800">
              {brands.marutinandan.logo.initials}
            </div>
            <h3 className="mt-5 font-display text-2xl text-pine-900">Marutinandan</h3>
            <p className="mt-4 text-sm leading-relaxed text-ink/70">
              A trusted brand inspired by traditional values, offering premium cold-pressed edible oils crafted with care and consistency.
            </p>
          </div>

          <div className="rounded-3xl bg-pine-950 p-8 text-cream">
            <div className="relative h-14 w-14 overflow-hidden rounded-full border border-gold-light/60">
              <Image src={brands.yugika.logo.src} alt="Yugika logo" fill className="object-cover" sizes="56px" />
            </div>
            <h3 className="mt-5 font-display text-2xl text-cream">Yugika Gold</h3>
            <p className="mt-4 text-sm leading-relaxed text-cream/70">
              A premium brand representing the same uncompromising quality, developed to serve customers seeking naturally processed edible oils with trusted quality.
            </p>
          </div>
        </div>

        <p className="mx-auto mt-12 max-w-3xl text-center text-sm font-medium text-ink/70">
          Regardless of the brand name on the bottle, every product is manufactured with the same commitment to purity, traditional extraction, and stringent quality standards.
        </p>
      </div>

      <div className="mx-auto mt-24 max-w-2xl text-center">
        <p className="text-sm text-ink/60">
          Want to discuss a bulk / export order or become a distributor?
        </p>
        <Link
          href="/contact"
          data-cursor-hover
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-pine-800 px-7 py-3.5 text-sm font-medium text-cream transition-transform hover:scale-[1.02]"
        >
          Get in Touch →
        </Link>
      </div>
    </div>
  );
}
