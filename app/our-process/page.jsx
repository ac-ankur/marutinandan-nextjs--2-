import Link from "next/link";
import ProcessTimeline from "./ProcessTimeline";

export const metadata = {
  title: "Our Process — Yugika Foods Private Limited",
  description: "From Seed to Bottle: The careful journey to ensure purity, quality, and freshness.",
  alternates: { canonical: "/our-process" },
};

export default function OurProcessPage() {
  const steps = [
    {
      step: "Step 1",
      title: "Premium Seed Selection",
      desc: "Only carefully selected, high-quality seeds are chosen.",
    },
    {
      step: "Step 2",
      title: "Cleaning & Sorting",
      desc: "Seeds are cleaned to remove impurities while maintaining their natural integrity.",
    },
    {
      step: "Step 3",
      title: "Traditional Cold-Pressed Extraction",
      desc: "Our oils are extracted at low temperatures without harsh chemical solvents or excessive heat.",
    },
    {
      step: "Step 4",
      title: "Natural Filtration",
      desc: "The oil is naturally filtered to preserve its authentic flavour and nutritional value.",
    },
    {
      step: "Step 5",
      title: "Quality Testing",
      desc: "Each batch undergoes strict quality checks before packaging.",
    },
    {
      step: "Step 6",
      title: "Hygienic Packaging",
      desc: "The finished oil is hygienically packed to preserve freshness and purity.",
    },
  ];

  return (
    <div className="bg-cream px-6 pb-24 pt-36 lg:px-10 lg:pt-34">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-xl uppercase tracking-[0.3em] text-gold-deep">Our Process</p>
        <h1 className="mt-5 font-display text-5xl leading-tight text-pine-900 sm:text-6xl">
          From Seed to <span className="italic text-gold-deep">Bottle.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ink/75">
          Every bottle of Yugika Foods oil follows a carefully monitored journey to ensure purity, quality, and freshness.
        </p>
      </div>

      <div className="mx-auto mt-20 max-w-4xl">
        <ProcessTimeline steps={steps} />
      </div>

      <div className="mx-auto mt-24 max-w-2xl text-center">
        <Link
          href="/products"
          data-cursor-hover
          className="inline-flex items-center gap-2 rounded-full bg-pine-800 px-7 py-3.5 text-sm font-medium text-cream transition-transform hover:scale-[1.02]"
        >
          Explore Our Products →
        </Link>
      </div>
    </div>
  );
}