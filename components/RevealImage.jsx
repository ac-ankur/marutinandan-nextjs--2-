"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function RevealImage({ children, className = "", direction = "left" }) {
  const wrapRef = useRef(null);
  const curtainRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        imgRef.current,
        { scale: 1.25 },
        {
          scale: 1,
          duration: 1.4,
          ease: "power3.out",
          scrollTrigger: { trigger: wrapRef.current, start: "top 85%" },
        }
      );
      gsap.fromTo(
        curtainRef.current,
        { scaleX: direction === "left" ? 0 : 1 },
        {
          scaleX: direction === "left" ? 1 : 0,
          duration: 0.9,
          ease: "power4.inOut",
          transformOrigin: direction === "left" ? "left" : "right",
          scrollTrigger: { trigger: wrapRef.current, start: "top 85%" },
        }
      );
      gsap.fromTo(
        curtainRef.current,
        { scaleX: 1 },
        {
          scaleX: 0,
          duration: 0.9,
          delay: 0.35,
          ease: "power4.inOut",
          transformOrigin: direction === "left" ? "right" : "left",
          scrollTrigger: { trigger: wrapRef.current, start: "top 85%" },
        }
      );
    }, wrapRef);

    return () => ctx.revert();
  }, [direction]);

  return (
    <div ref={wrapRef} className={`relative overflow-hidden ${className}`}>
      <div ref={imgRef} className="h-full w-full">
        {children}
      </div>
      <div ref={curtainRef} className="absolute inset-0 bg-gold" />
    </div>
  );
}
