"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Wheat, Filter, Droplets, Waves, FlaskConical, PackageCheck } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const icons = [Wheat, Filter, Droplets, Waves, FlaskConical, PackageCheck];

export default function ProcessTimeline({ steps }) {
  return (
    <>
      <DesktopZigzag steps={steps} />
      <MobileTimeline steps={steps} />
    </>
  );
}

/* ---------------- Ambient Step Visuals Component ---------------- */
function StepBackgroundVisuals({ index }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const targets = containerRef.current?.querySelectorAll("[data-anim]");
      if (!targets || targets.length === 0) return;

      // Animate based on the specific phase type
      if (index === 0) {
        // Wheat / Farmland: Floating seeds lifting upwards gently
        gsap.fromTo(targets, 
          { y: 30, opacity: 0, scale: 0.5 },
          { y: -20, opacity: 0.6, scale: 1, duration: 2, stagger: 0.3, repeat: -1, yoyo: true, ease: "sine.inOut" }
        );
      } else if (index === 1) {
        // Filter / Cleaning: Particles falling through a barrier line
        gsap.fromTo(targets,
          { y: -10, opacity: 0 },
          { y: 40, opacity: [0, 0.8, 0], duration: 1.5, stagger: 0.2, repeat: -1, ease: "power1.in" }
        );
      } else if (index === 2) {
        // Droplets: Vertical dripping motion
        gsap.fromTo(targets,
          { y: -15, scaleY: 0.3, opacity: 0 },
          { y: 35, scaleY: 1, opacity: 1, duration: 1.2, stagger: 0.4, repeat: -1, ease: "bounce.out" }
        );
      } else if (index === 3) {
        // Waves: Concentric ripple expansions
        gsap.fromTo(targets,
          { scale: 0.4, opacity: 0.8 },
          { scale: 1.8, opacity: 0, duration: 2.2, stagger: 0.5, repeat: -1, ease: "power1.out" }
        );
      } else if (index === 4) {
        // Flask / Processing: Micro bubbles rising
        gsap.fromTo(targets,
          { y: 20, x: "random(-10, 10)", opacity: 0 },
          { y: -30, opacity: 0.7, duration: 1.8, stagger: 0.2, repeat: -1, ease: "power2.out" }
        );
      } else if (index === 5) {
        // Package / Check: Conveyor slide/pulse indicator
        gsap.fromTo(targets,
          { x: -20, opacity: 0 },
          { x: 20, opacity: 0.9, duration: 1.4, repeat: -1, ease: "sine.inOut" }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [index]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0 opacity-40">
      {/* Step 0: Wheat Seeds */}
      {index === 0 && (
        <>
          <span data-anim className="absolute top-4 left-6 w-2 h-3 bg-gold-deep rounded-full transform rotate-45" />
          <span data-anim className="absolute top-8 right-12 w-2 h-3 bg-gold-deep rounded-full transform -rotate-12" />
          <span data-anim className="absolute bottom-2 left-1/3 w-2 h-3 bg-gold-deep rounded-full transform rotate-12" />
        </>
      )}

      {/* Step 1: Filter Cleaning Particles */}
      {index === 1 && (
        <div className="absolute inset-x-0 top-1/2 flex justify-around px-4">
          <span data-anim className="w-1.5 h-1.5 bg-pine-600 rounded-full" />
          <span data-anim className="w-2 h-2 bg-gold-deep rounded-full" />
          <span data-anim className="w-1 h-1 bg-pine-800 rounded-full" />
        </div>
      )}

      {/* Step 2: Liquid Droplets */}
      {index === 2 && (
        <div className="absolute right-4 top-2 flex flex-col gap-6">
          <span data-anim className="w-2 h-4 bg-pine-600 rounded-full" />
          <span data-anim className="w-2 h-4 bg-gold-deep rounded-full" />
        </div>
      )}

      {/* Step 3: Waves / Ripping Rings */}
      {index === 3 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div data-anim className="absolute w-24 h-24 border border-pine-500 rounded-full" />
          <div data-anim className="absolute w-24 h-24 border border-gold-deep rounded-full" />
        </div>
      )}

      {/* Step 4: Processing Bubbles */}
      {index === 4 && (
        <div className="absolute bottom-4 left-1/4 flex gap-8">
          <span data-anim className="w-2 h-2 border border-pine-700 rounded-full" />
          <span data-anim className="w-3 h-3 border border-gold-deep rounded-full" />
          <span data-anim className="w-1.5 h-1.5 border border-pine-900 rounded-full" />
        </div>
      )}

      {/* Step 5: Package / Check Lines */}
      {index === 5 && (
        <div className="absolute bottom-2 left-6 right-6 h-0.5 bg-gold-light/20">
          <div data-anim className="w-4 h-full bg-gold-deep rounded" />
        </div>
      )}
    </div>
  );
}

/* ---------------- Desktop: zigzag with measured SVG path ---------------- */
function DesktopZigzag({ steps }) {
  const containerRef = useRef(null);
  const pathRef = useRef(null);
  const stepRefs = useRef([]);
  const dotRefs = useRef([]);
  const [pathD, setPathD] = useState("");
  const [svgSize, setSvgSize] = useState({ width: 0, height: 0 });

  const computePath = () => {
    const container = containerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();

    const points = dotRefs.current
      .map((dot) => {
        if (!dot) return null;
        const r = dot.getBoundingClientRect();
        return {
          x: r.left + r.width / 2 - containerRect.left,
          y: r.top + r.height / 2 - containerRect.top,
        };
      })
      .filter(Boolean);

    if (points.length < 2 || containerRect.width === 0) return;

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const midY = (prev.y + curr.y) / 2;
      d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
    }
    setPathD(d);
    setSvgSize({ width: containerRect.width, height: containerRect.height });
  };

  useLayoutEffect(() => {
    computePath();
    const raf1 = requestAnimationFrame(() => {
      computePath();
      requestAnimationFrame(computePath);
    });

    if (document.fonts?.ready) {
      document.fonts.ready.then(computePath);
    }

    const ro = new ResizeObserver(() => computePath());
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", computePath);

    return () => {
      cancelAnimationFrame(raf1);
      ro.disconnect();
      window.removeEventListener("resize", computePath);
    };
  }, [steps]);

  useEffect(() => {
    if (!pathD) return;

    const ctx = gsap.context(() => {
      stepRefs.current.forEach((el, i) => {
        if (!el) return;
        const fromLeft = i % 2 === 0;

        gsap.fromTo(
          el,
          { opacity: 0, x: fromLeft ? -40 : 40, y: 20 },
          {
            opacity: 1,
            x: 0,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 82%",
              toggleActions: "play none none reverse",
            },
          }
        );

        const icon = el.querySelector("[data-icon]");
        if (icon) {
          gsap.fromTo(
            icon,
            { scale: 0, rotate: -20 },
            {
              scale: 1,
              rotate: 0,
              duration: 0.6,
              ease: "back.out(2.2)",
              delay: 0.15,
              scrollTrigger: {
                trigger: el,
                start: "top 82%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }

        const dot = dotRefs.current[i];
        if (dot) {
          gsap.fromTo(
            dot,
            { scale: 0 },
            {
              scale: 1,
              duration: 0.4,
              ease: "back.out(3)",
              scrollTrigger: {
                trigger: el,
                start: "top 82%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }
      });

      ScrollTrigger.refresh();
    }, containerRef);

    return () => ctx.revert();
  }, [pathD]);

  return (
    <div ref={containerRef} className="relative hidden md:block">
      {pathD && (
        <svg
          className="pointer-events-none absolute left-0 top-0"
          width={svgSize.width}
          height={svgSize.height}
          viewBox={`0 0 ${svgSize.width} ${svgSize.height}`}
          fill="none"
        >
          <path
            ref={pathRef}
            d={pathD}
            stroke="#b8863b"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )}

      <div className="space-y-24 lg:space-y-28">
        {steps.map((s, idx) => {
          const Icon = icons[idx % icons.length];
          const fromLeft = idx % 2 === 0;

          return (
            <div
              key={idx}
              ref={(el) => (stepRefs.current[idx] = el)}
              className="grid grid-cols-[1fr_64px_1fr] items-center gap-6 lg:gap-10"
            >
              <div className={fromLeft ? "text-right" : ""}>
                {fromLeft && <StepCard s={s} Icon={Icon} align="right" index={idx} />}
              </div>

              <div className="flex justify-center z-10">
                <span
                  ref={(el) => (dotRefs.current[idx] = el)}
                  className="h-6 w-6 rounded-full border-4 border-gold-deep bg-cream shadow-sm"
                />
              </div>

              <div>
                {!fromLeft && <StepCard s={s} Icon={Icon} align="left" index={idx} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepCard({ s, Icon, align, index }) {
  const isRight = align === "right";
  return (
    <div className={`relative inline-flex max-w-md items-start gap-4 p-4 rounded-xl bg-cream/30 border border-transparent hover:border-gold-light/20 transition-colors duration-300 ${isRight ? "flex-row-reverse text-right" : ""}`}>
      {/* Background Micro-Animation Canvas */}
      <StepBackgroundVisuals index={index} />
      
      <span
        data-icon
        className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-pine-800 text-cream shadow-sm z-10"
      >
        <Icon size={22} strokeWidth={1.75} />
      </span>
      <div className="z-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">{s.step}</p>
        <h3 className="mt-2 font-display text-2xl text-pine-900">{s.title}</h3>
        <p className="mt-3 text-base leading-relaxed text-ink/70">{s.desc}</p>
      </div>
    </div>
  );
}

/* ---------------- Mobile: simple straight timeline ---------------- */
function MobileTimeline({ steps }) {
  const containerRef = useRef(null);
  const lineRef = useRef(null);
  const stepRefs = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          transformOrigin: "top",
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
            end: "bottom 85%",
            scrub: 0.6,
          },
        }
      );

      stepRefs.current.forEach((el) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative ml-4 pl-8 md:hidden">
      <div className="absolute left-0 top-0 h-full w-px bg-gold-light/30" />
      <div ref={lineRef} className="absolute left-0 top-0 h-full w-px bg-gold-deep" />

      <div className="space-y-12">
        {steps.map((s, idx) => {
          const Icon = icons[idx % icons.length];
          return (
            <div key={idx} ref={(el) => (stepRefs.current[idx] = el)} className="relative p-3 rounded-lg bg-cream/20">
              <StepBackgroundVisuals index={idx} />
              
              <span className="absolute -left-[41px] top-4 flex h-8 w-8 items-center justify-center rounded-full border-4 border-gold-deep bg-pine-800 text-cream z-10">
                <Icon size={16} strokeWidth={1.75} />
              </span>
              <div className="z-10 relative">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">{s.step}</p>
                <h3 className="mt-2 font-display text-2xl text-pine-900">{s.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-ink/70">{s.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}