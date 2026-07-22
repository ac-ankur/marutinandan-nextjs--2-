import Link from "next/link";

export const metadata = {
  title: "Why Cold-Pressed? — Yugika Foods Private Limited",
  description: "Cold pressing is one of the oldest and most natural methods of oil extraction.",
  alternates: { canonical: "/why-cold-pressed" },
};

export default function WhyColdPressedPage() {
  const benefits = [
    "Naturally retains essential nutrients",
    "Preserves natural antioxidants",
    "Rich authentic aroma",
    "Traditional taste",
    "No harsh chemical solvent extraction",
    "Minimally processed",
  ];

  return (
    <div className="bg-cream px-6 pb-24 pt-36 lg:px-10 lg:pt-36">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-xl uppercase tracking-[0.3em] text-gold-deep">Why Cold-Pressed?</p>
        <h1 className="mt-5 font-display text-5xl leading-tight text-pine-900 sm:text-6xl">
          Closer to <span className="italic text-gold-deep">nature.</span>
        </h1>
        <div className="mx-auto mt-8 flex max-w-3xl flex-col gap-6 text-base leading-relaxed text-ink/75">
          <p>
            Cold pressing is one of the oldest and most natural methods of oil extraction.
          </p>
          <p>
            Unlike heavily refined oils, cold-pressed oils are extracted at controlled temperatures that help preserve their natural nutritional profile, authentic aroma, and characteristic flavour.
          </p>
        </div>
      </div>

      <div className="mx-auto mt-20 max-w-4xl">
        <div className="rounded-3xl bg-cream-paper p-8 sm:p-12">
          <h2 className="font-display text-3xl text-pine-900 text-center">Benefits of Cold-Pressed Oils</h2>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2">
            {benefits.map((b, idx) => (
              <li key={idx} className="flex items-start gap-4">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold-deep">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8.5L6.2 11.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="mt-1 text-sm font-medium text-ink/80">{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-12 text-center text-sm font-medium text-ink/70">
          Our commitment to traditional extraction allows us to deliver oils that stay closer to nature.
        </p>
      </div>

      <div className="mx-auto mt-24 max-w-2xl text-center">
        <Link
          href="/products"
          data-cursor-hover
          className="inline-flex items-center gap-2 rounded-full bg-pine-800 px-7 py-3.5 text-sm font-medium text-cream transition-transform hover:scale-[1.02]"
        >
          View Our Range →
        </Link>
      </div>
    </div>
  );
}
