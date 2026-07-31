"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function Preloader() {
  const wrapRef = useRef(null);
  const dropRef = useRef(null);
  const countRef = useRef(null);
  const panelTopRef = useRef(null);
  const panelBotRef = useRef(null);
  const liquidRef = useRef(null);
  const waveGroupRef = useRef(null);
  const [done, setDone] = useState(false);

  // useLayoutEffect instead of useEffect: this runs synchronously before the
  // browser paints, so there's no visible frame where the preloader sits
  // static before the animation kicks in.
  useLayoutEffect(() => {
    if (sessionStorage.getItem("mn_preloaded") === "1") {
      setDone(true);
      return;
    }

    const DROP_H = 60; // matches the svg viewBox height

    const counter = { val: 0 };

    // Liquid starts fully empty (rect sits entirely below the clipped shape).
    // Plain attribute writes here, not gsap.set — gsap.set would add an
    // inline CSS "transform" style that permanently overrides the
    // setAttribute("transform", ...) calls in onUpdate below (CSS always
    // wins over the SVG presentation attribute), which is why the wave
    // surface used to freeze in place instead of rising with the liquid.
    liquidRef.current.setAttribute("y", DROP_H);
    liquidRef.current.setAttribute("height", DROP_H + 10);
    waveGroupRef.current.setAttribute("transform", `translate(0, ${DROP_H})`);

    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem("mn_preloaded", "1");
        setDone(true);
      },
    });

    tl.fromTo(
      dropRef.current,
      { y: -60, opacity: 0, scale: 0.6 },
      { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: "back.out(1.7)" }
    )
      .to(
        counter,
        {
          val: 100,
          duration: 1.4,
          ease: "power2.inOut",
          onUpdate: () => {
            const pct = counter.val;

            if (countRef.current) {
              countRef.current.textContent = String(Math.floor(pct)).padStart(3, "0");
            }

            // Oil rising inside the drop, driven off the same tween as the
            // counter so the number and the fill level never drift apart.
            const fillY = DROP_H - (DROP_H * pct) / 100;
            if (liquidRef.current) {
              liquidRef.current.setAttribute("y", fillY);
            }
            if (waveGroupRef.current) {
              waveGroupRef.current.setAttribute("transform", `translate(0, ${fillY})`);
            }
          },
        },
        "-=0.2"
      )
      // small elastic "settle" on the surface once it's full
      .to(
        waveGroupRef.current,
        { scaleY: 1.3, duration: 0.18, ease: "power1.out", transformOrigin: "50% 100%" },
        ">-0.05"
      )
      .to(waveGroupRef.current, { scaleY: 1, duration: 0.35, ease: "elastic.out(1, 0.4)" })
      .to(dropRef.current, { y: -18, duration: 0.4, ease: "power2.out" }, "-=0.3")
      .to([panelTopRef.current], { yPercent: -100, duration: 0.9, ease: "power4.inOut" }, "+=0.05")
      .to([panelBotRef.current], { yPercent: 100, duration: 0.9, ease: "power4.inOut" }, "<")
      .set(wrapRef.current, { display: "none" });

    return () => tl.kill();
  }, []);

  if (done) return null;

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            try {
              if (sessionStorage.getItem("mn_preloaded") === "1") {
                document.documentElement.style.setProperty('--preloader-display', 'none');
              } else {
                document.documentElement.style.setProperty('--preloader-display', 'flex');
              }
            } catch (e) {}
          `,
        }}
      />
      <div
        ref={wrapRef}
        className="fixed inset-0 z-[100] flex-col items-center justify-center"
        style={{ display: "var(--preloader-display, flex)" }}
        aria-hidden="true"
      >
        <div
          ref={panelTopRef}
          className="absolute inset-0 bg-pine-950"
          style={{ top: 0, height: "50%", willChange: "transform" }}
        />
        <div
          ref={panelBotRef}
          className="absolute inset-0 bg-pine-950"
          style={{ top: "50%", height: "50%", willChange: "transform" }}
        />

        <div className="relative z-10 flex flex-col items-center gap-4">
          <svg
            ref={dropRef}
            width="46"
            height="60"
            viewBox="0 0 46 60"
            fill="none"
            style={{
              opacity: 0,
              transform: "translateY(-60px) scale(0.6)",
              transformOrigin: "50% 50%",
              willChange: "transform, opacity",
            }}
          >
            <defs>
              <linearGradient id="preloaderGrad" x1="3" y1="2" x2="43" y2="60" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F0CB6E" />
                <stop offset="1" stopColor="#D3A02E" />
              </linearGradient>
              <linearGradient id="preloaderWaveGrad" x1="0" y1="0" x2="46" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FCE7B8" />
                <stop offset="1" stopColor="#F0CB6E" />
              </linearGradient>
              <clipPath id="dropClip">
                <path d="M23 2C23 2 43 30 43 42C43 53.0457 34.0457 60 23 60C11.9543 60 3 53.0457 3 42C3 30 23 2 23 2Z" />
              </clipPath>
            </defs>

            {/* faint outline of the drop, always visible */}
            <path
              d="M23 2C23 2 43 30 43 42C43 53.0457 34.0457 60 23 60C11.9543 60 3 53.0457 3 42C3 30 23 2 23 2Z"
              stroke="rgba(240,203,110,0.3)"
              strokeWidth="1.5"
            />

            {/* liquid fill, clipped to the drop shape */}
            <g clipPath="url(#dropClip)">
              <rect ref={liquidRef} x="0" y="60" width="46" height="70" fill="url(#preloaderGrad)" />
              <g ref={waveGroupRef}>
                <path
                  d="M-10 0 Q 8 -5 23 0 T 56 0 V 8 H -10 Z"
                  fill="url(#preloaderWaveGrad)"
                  opacity="0.85"
                />
              </g>
            </g>

            {/* outline redrawn on top so the fill never bleeds past the edge visually */}
            <path
              d="M23 2C23 2 43 30 43 42C43 53.0457 34.0457 60 23 60C11.9543 60 3 53.0457 3 42C3 30 23 2 23 2Z"
              stroke="rgba(240,203,110,0.5)"
              strokeWidth="1"
              fill="none"
            />
          </svg>

          <div className="flex items-baseline gap-2 font-display text-cream">
            <span ref={countRef} className="text-3xl tracking-widest tabular-nums">
              000
            </span>
            <span className="text-xs uppercase tracking-[0.3em] text-gold-light">Pressing</span>
          </div>
        </div>
      </div>
    </>
  );
}