"use client";

import { useEffect, useRef } from "react";
import { createScope, animate, stagger } from "animejs";
import { Droplet, Wheat, Leaf, ShieldCheck, ArrowUpRight } from "lucide-react";

const REASONS = [
  {
    icon: Droplet,
    accent: "#c7a14a",
    title: "Traditional Cold-Pressed Extraction",
    desc: "Every drop is extracted at low temperatures to preserve natural nutrients, antioxidants, aroma, and flavour.",
  },
  {
    icon: Wheat,
    accent: "#8a9a5b",
    title: "Carefully Selected Seeds",
    desc: "We source premium-quality seeds from trusted suppliers to ensure consistent quality and purity.",
  },
  {
    icon: Leaf,
    accent: "#4f7a5c",
    title: "Naturally Nutritious",
    desc: "Our oils retain their natural goodness without harsh refining or chemical solvent extraction.",
  },
  {
    icon: ShieldCheck,
    accent: "#b5673a",
    title: "Quality You Can Trust",
    desc: "From sourcing to packaging, every batch is produced under stringent quality and hygiene standards.",
  },
];

export default function WhyUs() {
  const rootRef = useRef(null);
  const gridRef = useRef(null);
  const cardRefs = useRef([]);
  const iconRefs = useRef([]);
  const blobRefs = useRef([]);
  const underlineRef = useRef(null);
  const scopeRef = useRef(null);
  const hasEnteredRef = useRef(false);

  useEffect(() => {
    scopeRef.current = createScope({ root: rootRef.current }).add(() => {
      // Ambient drifting background blobs
      blobRefs.current.forEach((blob, i) => {
        if (!blob) return;
        animate(blob, {
          translateX: i % 2 === 0 ? [0, 40, -20, 0] : [0, -30, 20, 0],
          translateY: i % 2 === 0 ? [0, -30, 20, 0] : [0, 30, -20, 0],
          scale: [1, 1.15, 0.95, 1],
          duration: 14000 + i * 2000,
          ease: "inOutSine",
          loop: true,
        });
      });

      // Entrance: cards + label underline, triggered on scroll into view
      const grid = gridRef.current;
      if (!grid) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !hasEnteredRef.current) {
              hasEnteredRef.current = true;

              animate(underlineRef.current, {
                scaleX: [0, 1],
                duration: 700,
                ease: "outQuad",
              });

              animate(cardRefs.current, {
                opacity: [0, 1],
                translateY: [50, 0],
                scale: [0.9, 1],
                rotate: (_, i) => [i % 2 === 0 ? -3 : 3, 0],
                duration: 900,
                delay: stagger(130),
                ease: "outElastic(1, .7)",
              });

              animate(iconRefs.current, {
                scale: [0, 1],
                rotate: [-90, 0],
                duration: 800,
                delay: stagger(130, { start: 200 }),
                ease: "outBack",
              });

              observer.disconnect();
            }
          });
        },
        { threshold: 0.2 }
      );

      observer.observe(grid);
    });

    return () => scopeRef.current?.revert();
  }, []);

  const handleCardMove = (i) => (e) => {
    const card = cardRefs.current[i];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    card.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  const handleCardEnter = (i) => () => {
    animate(cardRefs.current[i], {
      translateY: -10,
      scale: 1.02,
      duration: 450,
      ease: "outQuad",
    });
    animate(iconRefs.current[i], {
      rotate: [0, 12, -8, 0],
      scale: [1, 1.15, 1],
      duration: 600,
      ease: "outElastic(1, .5)",
    });
  };

  const handleCardLeave = (i) => () => {
    animate(cardRefs.current[i], {
      translateY: 0,
      scale: 1,
      duration: 500,
      ease: "outQuad",
    });
  };

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden bg-cream px-6 py-20 lg:px-10"
    >
      {/* Ambient background blobs */}
      <div
        ref={(el) => (blobRefs.current[0] = el)}
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, #c7a14a, transparent 70%)" }}
      />
      <div
        ref={(el) => (blobRefs.current[1] = el)}
        className="pointer-events-none absolute -bottom-40 -right-20 h-[28rem] w-[28rem] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #4f7a5c, transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="relative inline-block text-lg uppercase tracking-[0.3em] text-gold-deep">
              — Why Us —
              <span
                ref={underlineRef}
                className="absolute -bottom-1 left-0 h-px w-full origin-left bg-gold-deep"
                style={{ transform: "scaleX(0)" }}
              />
            </p>
            <h2 className="mt-4 font-display text-4xl leading-tight text-pine-900 sm:text-5xl">
              Why Choose <span className="italic text-gold-deep">Yugika Foods?</span>
            </h2>
          </div>
        </div>

        <div ref={gridRef} className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((r, i) => {
            const Icon = r.icon;
            return (
              <div
                key={r.title}
                ref={(el) => (cardRefs.current[i] = el)}
                onMouseMove={handleCardMove(i)}
                onMouseEnter={handleCardEnter(i)}
                onMouseLeave={handleCardLeave(i)}
                className="group relative overflow-hidden rounded-[2rem] border border-ink/10 bg-white/50 p-7 opacity-0 shadow-[0_8px_30px_-15px_rgba(21,56,38,0.25)] backdrop-blur-xl"
                style={{ "--mx": "50%", "--my": "50%" }}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(220px circle at var(--mx) var(--my), ${r.accent}22, transparent 70%)`,
                  }}
                />

                

                <div className="relative">
                  <div
                    ref={(el) => (iconRefs.current[i] = el)}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: `${r.accent}1a`, color: r.accent }}
                  >
                    <Icon size={22} strokeWidth={1.75} />
                  </div>

                  <h3 className="mt-6 font-display text-xl text-pine-900">{r.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink/65">{r.desc}</p>

                 
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}