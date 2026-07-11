import RevealImage from "@/components/RevealImage";

export const metadata = {
  title: "Our Story — The Kachi Ghani Way",
  description:
    "Discover how Marutinandan presses mustard oil the traditional Kachi Ghani way — single cold-pressed, no heat, no chemicals, honouring generations of Indian kitchens.",
  alternates: { canonical: "/story" },
};

const CHAPTERS = [
  {
    tag: "01 — The Seed",
    title: "Chosen at the source.",
    body: "Every batch begins with mustard seed sourced directly from trusted growing belts, selected for oil content and pressed close to harvest — while the aroma is at its peak.",
    direction: "left",
  },
  {
    tag: "02 — The Press",
    title: "Cold, slow, deliberate.",
    body: "The Kachi Ghani method presses seeds at low speed and low friction heat, so the oil is drawn out gently rather than extracted with solvents or high temperatures — keeping nutrients and pungency intact.",
    direction: "right",
  },
  {
    tag: "03 — The Bottle",
    title: "Sealed only after it's proven.",
    body: "Before a single bottle is sealed, the batch is verified at an NABL & ISO/IEC 17025 accredited lab against FSSAI standards for moisture, rancidity, acid value and more.",
    direction: "left",
  },
];

export default function StoryPage() {
  return (
    <div className="bg-cream pb-24 pt-36 lg:pt-44">
      <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
        <p className="text-xs uppercase tracking-[0.3em] text-gold-deep">Our Story</p>
        <h1 className="mt-5 font-display text-5xl leading-tight text-pine-900 sm:text-6xl">
          Pressed the way <span className="italic text-gold-deep">tradition</span> intended.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ink/70">
          For generations, mustard oil has been the soul of Indian kitchens. We honour that heritage with
          Kachi Ghani — the ancient, low-temperature single-press method that keeps the seed&apos;s aroma,
          colour and nutrition intact.
        </p>
      </div>

      <div className="mx-auto mt-24 max-w-6xl space-y-28 px-6 lg:px-10">
        {CHAPTERS.map((c) => (
          <div
            key={c.tag}
            className={`grid items-center gap-12 lg:grid-cols-2 ${
              c.direction === "right" ? "lg:[&>*:first-child]:order-2" : ""
            }`}
          >
            <RevealImage direction={c.direction} className="h-[360px] rounded-3xl lg:h-[440px]">
              <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(160deg,#1B4530,#0F2B1E)]">
                <span className="font-display text-6xl text-gold/30">{c.tag.split(" ")[0]}</span>
              </div>
            </RevealImage>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-gold-deep">{c.tag}</p>
              <h2 className="mt-4 font-display text-3xl text-pine-900 sm:text-4xl">{c.title}</h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-ink/70">{c.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
