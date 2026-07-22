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
    // Measure immediately, then again on the next couple of frames and once
    // fonts finish loading — text reflow after font swap shifts dot
    // positions, and a single measurement can catch stale layout.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps]);

  useEffect(() => {
    if (!pathD) return;

    // Recalculate ScrollTrigger positions any time the measured path
    // (and therefore layout) changes.
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
                {fromLeft && <StepCard s={s} Icon={Icon} align="right" />}
              </div>

              <div className="flex justify-center">
                <span
                  ref={(el) => (dotRefs.current[idx] = el)}
                  className="h-6 w-6 rounded-full border-4 border-gold-deep bg-cream shadow-sm"
                />
              </div>

              <div>
                {!fromLeft && <StepCard s={s} Icon={Icon} align="left" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepCard({ s, Icon, align }) {
  const isRight = align === "right";
  return (
    <div className={`inline-flex max-w-md items-start gap-4 ${isRight ? "flex-row-reverse text-right" : ""}`}>
      <span
        data-icon
        className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-pine-800 text-cream shadow-sm"
      >
        <Icon size={22} strokeWidth={1.75} />
      </span>
      <div>
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
            <div key={idx} ref={(el) => (stepRefs.current[idx] = el)} className="relative">
              <span className="absolute -left-[41px] top-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-gold-deep bg-pine-800 text-cream">
                <Icon size={16} strokeWidth={1.75} />
              </span>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">{s.step}</p>
              <h3 className="mt-2 font-display text-2xl text-pine-900">{s.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-ink/70">{s.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}