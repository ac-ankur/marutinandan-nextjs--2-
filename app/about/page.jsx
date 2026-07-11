import Image from "next/image";
import Link from "next/link";
import { company, brands, futureProducts } from "@/data/company";

export const metadata = {
  title: "About Us — Yugika Foods Private Limited",
  description:
    "Yugika Foods Private Limited is the parent company behind Marutinandan (domestic) and Yugika (export) — cold pressed, lab-tested edible oils for kitchens in India and abroad.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="bg-cream px-6 pb-24 pt-36 lg:px-10 lg:pt-44">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold-deep">About Us</p>
        <h1 className="mt-5 font-display text-5xl leading-tight text-pine-900 sm:text-6xl">
          One promise. <span className="italic text-gold-deep">Two labels.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ink/70">{company.description}</p>
      </div>

      <div className="mx-auto mt-20 grid max-w-5xl gap-8 md:grid-cols-2">
        <div className="rounded-3xl bg-cream-paper p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/60 font-display text-lg text-pine-800">
            {brands.marutinandan.logo.initials}
          </div>
          <h2 className="mt-5 font-display text-2xl text-pine-900">Marutinandan</h2>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-gold-deep">{brands.marutinandan.market}</p>
          <p className="mt-4 text-sm leading-relaxed text-ink/70">
            Our domestic label for the Indian market. Every Marutinandan bottle carries the same Kachi
            Ghani cold pressed promise, packaged and priced for households, kirana stores and HoReCa
            buyers across India.
          </p>
        </div>

        <div className="rounded-3xl bg-pine-950 p-8 text-cream">
          <div className="relative h-14 w-14 overflow-hidden rounded-full border border-gold-light/60">
            <Image src={brands.yugika.logo.src} alt="Yugika logo" fill className="object-cover" sizes="56px" />
          </div>
          <h2 className="mt-5 font-display text-2xl text-cream">Yugika</h2>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-gold-light">{brands.yugika.market}</p>
          <p className="mt-4 text-sm leading-relaxed text-cream/70">
            Our export label for international markets. The same batches, the same NABL-tested purity —
            labelled as Yugika for customers and distributors outside India.
          </p>
        </div>
      </div>

      <div className="mx-auto mt-24 max-w-5xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold-deep">— Coming Soon —</p>
        <h2 className="mt-4 font-display text-4xl text-pine-900 sm:text-5xl">
          Beyond <span className="italic text-gold-deep">mustard oil.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-ink/70">
          Marutinandan and Yugika currently offer Black and Yellow Mustard Oil. Two more cold pressed
          oils are in the pipeline.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl gap-8 sm:grid-cols-2">
        {futureProducts.map((p) => (
          <div key={p.key} className="overflow-hidden rounded-3xl bg-cream-paper">
            <div className="flex h-48 items-center justify-center bg-pine-900/5">
              {p.image ? (
                <div className="relative h-32 w-32">
                  <Image src={p.image} alt={p.name} fill className="object-contain" sizes="128px" />
                </div>
              ) : (
                <SesameIcon />
              )}
            </div>
            <div className="p-6">
              <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-medium text-gold-deep">
                {p.status}
              </span>
              <h3 className="mt-3 font-display text-xl text-pine-900">{p.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">{p.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-20 max-w-2xl text-center">
        <p className="text-sm text-ink/60">
          Want to be notified when new products launch, or discuss a bulk / export order?
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

function SesameIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="30" fill="#F3E7C6" />
      {Array.from({ length: 10 }).map((_, i) => {
        const angle = (i / 10) * Math.PI * 2;
        const x = 32 + Math.cos(angle) * 14;
        const y = 32 + Math.sin(angle) * 14;
        return <ellipse key={i} cx={x} cy={y} rx="4" ry="2.4" fill="#D3A02E" transform={`rotate(${(angle * 180) / Math.PI} ${x} ${y})`} />;
      })}
    </svg>
  );
}
