import Link from "next/link";
import RevealImage from "./RevealImage";

const STEPS = [
  { n: "01", title: "Seed", desc: "Premium mustard" },
  { n: "02", title: "Press", desc: "Cold Kachi Ghani" },
  { n: "03", title: "Bottle", desc: "Lab tested & sealed" },
];

export default function StoryTeaser() {
  return (
    <section className="relative bg-cream px-4 py-16 sm:px-6 sm:py-24 lg:px-10 lg:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <RevealImage direction="left" className="h-[280px] rounded-3xl sm:h-[360px] lg:h-[520px]">
          <div className="relative flex h-full w-full items-end bg-[linear-gradient(160deg,#5b3a2a,#2e1f18)] p-8">
            <div className="absolute right-6 top-6 flex h-16 w-16 items-center justify-center rounded-full bg-gold text-xs font-semibold text-pine-950">
              100% <br /> PURE
            </div>
            <div className="grid grid-cols-3 gap-3 opacity-90">
              {Array.from({ length: 9 }).map((_, i) => (
                <span key={i} className="h-6 w-10 rounded-sm bg-gold/70" />
              ))}
            </div>
            <p className="absolute bottom-8 left-8 font-display text-2xl text-cream">
              Since Generations
              <br />
              <span className="text-gold-light italic">The Kachi Ghani Way</span>
            </p>
          </div>
        </RevealImage>

        <div>
          <p className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-gold-deep">
            <span className="h-px w-8 bg-gold-deep" /> Our Story
          </p>
          <h2 className="mt-4 font-display text-4xl leading-tight text-pine-900 sm:text-5xl">
            Pressed the way <span className="italic text-gold-deep">tradition</span> intended.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink/70">
            For generations, mustard oil has been the soul of Indian kitchens. We honour that heritage with
            Kachi Ghani — the ancient, low-temperature single-press method that keeps the seed&apos;s aroma,
            colour and nutrition intact. No heat refining. No chemicals. No shortcuts.
          </p>

          <div className="mt-10 grid gap-6 border-t border-ink/10 pt-8 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n}>
                <p className="font-display text-2xl text-gold-deep">{s.n}</p>
                <p className="mt-1 font-medium text-pine-900">{s.title}</p>
                <p className="text-sm text-ink/60">{s.desc}</p>
              </div>
            ))}
          </div>

          <Link
            href="/story"
            data-cursor-hover
            className="mt-10 inline-flex items-center gap-2 text-sm font-medium text-pine-800 underline decoration-gold decoration-2 underline-offset-4"
          >
            Read the full story →
          </Link>
        </div>
      </div>
    </section>
  );
}
