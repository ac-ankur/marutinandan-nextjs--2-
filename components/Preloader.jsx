"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function Preloader() {
  const wrapRef = useRef(null);
  const dropRef = useRef(null);
  const countRef = useRef(null);
  const panelTopRef = useRef(null);
  const panelBotRef = useRef(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("mn_preloaded") === "1") {
      setDone(true);
      return;
    }

    const counter = { val: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem("mn_preloaded", "1");
        setDone(true);
      },
    });

    tl.set(wrapRef.current, { display: "flex" })
      .fromTo(
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
            if (countRef.current) {
              countRef.current.textContent = String(Math.floor(counter.val)).padStart(3, "0");
            }
          },
        },
        "-=0.2"
      )
      .to(dropRef.current, { y: -18, duration: 0.4, ease: "power2.out" }, "-=0.3")
      .to([panelTopRef.current], { yPercent: -100, duration: 0.9, ease: "power4.inOut" }, "+=0.05")
      .to([panelBotRef.current], { yPercent: 100, duration: 0.9, ease: "power4.inOut" }, "<")
      .set(wrapRef.current, { display: "none" });

    return () => tl.kill();
  }, []);

  if (done) return null;

  return (
    <div
      ref={wrapRef}
      className="fixed inset-0 z-[100] hidden flex-col items-center justify-center"
      aria-hidden="true"
    >
      <div ref={panelTopRef} className="absolute inset-0 bg-pine-950" style={{ top: 0, height: "50%" }} />
      <div ref={panelBotRef} className="absolute inset-0 bg-pine-950" style={{ top: "50%", height: "50%" }} />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <svg ref={dropRef} width="46" height="60" viewBox="0 0 46 60" fill="none">
          <path
            d="M23 2C23 2 43 30 43 42C43 53.0457 34.0457 60 23 60C11.9543 60 3 53.0457 3 42C3 30 23 2 23 2Z"
            fill="url(#preloaderGrad)"
          />
          <defs>
            <linearGradient id="preloaderGrad" x1="3" y1="2" x2="43" y2="60" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F0CB6E" />
              <stop offset="1" stopColor="#D3A02E" />
            </linearGradient>
          </defs>
        </svg>
        <div className="flex items-baseline gap-2 font-display text-cream">
          <span ref={countRef} className="text-3xl tracking-widest tabular-nums">
            000
          </span>
          <span className="text-xs uppercase tracking-[0.3em] text-gold-light">Pressing</span>
        </div>
      </div>
    </div>
  );
}
