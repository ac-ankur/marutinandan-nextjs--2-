"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const lenisRef = useRef(null);

  useEffect(() => {
    if (isAdmin) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
      touchMultiplier: 1.1,
      prevent: (node) =>
        Boolean(
          node?.closest?.("[data-lenis-prevent]") ||
          node?.closest?.(".cart-drawer-scroll")
        ),
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const onTick = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    // Automatically pause Lenis when a modal or drawer locks body scroll
    const handleBodyOverflow = () => {
      const isLocked =
        document.body.style.overflow === "hidden" ||
        document.documentElement.style.overflow === "hidden";
      if (isLocked) {
        lenis.stop();
      } else {
        lenis.start();
      }
    };

    handleBodyOverflow();
    const observer = new MutationObserver(handleBodyOverflow);
    observer.observe(document.body, { attributes: true, attributeFilter: ["style"] });

    // Let any element opt into anchor-smooth-scroll with data-scroll-to
    const handleClick = (e) => {
      const target = e.target.closest("[data-scroll-to]");
      if (!target) return;
      const sel = target.getAttribute("data-scroll-to");
      const el = document.querySelector(sel);
      if (el) {
        e.preventDefault();
        lenis.scrollTo(el, { offset: -90, duration: 1.4 });
      }
    };
    document.addEventListener("click", handleClick);

    return () => {
      observer.disconnect();
      document.removeEventListener("click", handleClick);
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, [isAdmin]);

  return <>{children}</>;
}
