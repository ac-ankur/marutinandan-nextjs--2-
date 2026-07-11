"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CursorFollower() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const isFine = window.matchMedia("(pointer: fine)").matches;
    if (!isFine) return;

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { ...pos };

    gsap.set(dotRef.current, { xPercent: -50, yPercent: -50 });
    gsap.set(ringRef.current, { xPercent: -50, yPercent: -50 });

    const onMove = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      gsap.to(dotRef.current, { x: pos.x, y: pos.y, duration: 0.05, ease: "none" });
    };
    window.addEventListener("mousemove", onMove);

    const ticker = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.14;
      ringPos.y += (pos.y - ringPos.y) * 0.14;
      gsap.set(ringRef.current, { x: ringPos.x, y: ringPos.y });
    };
    gsap.ticker.add(ticker);

    const onEnterInteractive = () => gsap.to(ringRef.current, { scale: 2.1, opacity: 0.5, duration: 0.3 });
    const onLeaveInteractive = () => gsap.to(ringRef.current, { scale: 1, opacity: 1, duration: 0.3 });
    const interactiveEls = document.querySelectorAll("a, button, [data-cursor-hover]");
    interactiveEls.forEach((el) => {
      el.addEventListener("mouseenter", onEnterInteractive);
      el.addEventListener("mouseleave", onLeaveInteractive);
    });

    return () => {
      window.removeEventListener("mousemove", onMove);
      gsap.ticker.remove(ticker);
      interactiveEls.forEach((el) => {
        el.removeEventListener("mouseenter", onEnterInteractive);
        el.removeEventListener("mouseleave", onLeaveInteractive);
      });
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[90] hidden md:block" aria-hidden="true">
      <div
        ref={ringRef}
        className="absolute left-0 top-0 h-8 w-8 rounded-full border border-gold/70 mix-blend-difference"
      />
      <div ref={dotRef} className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-gold" />
    </div>
  );
}
