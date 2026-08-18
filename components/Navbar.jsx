"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import BrandSwitcher from "./BrandSwitcher";
import { company } from "@/data/company";

gsap.registerPlugin(ScrollTrigger);

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/products", label: "Products" },
  { href: "/our-process", label: "Our Process" },
  { href: "/lab-report", label: "Quality" },
  { href: "/why-cold-pressed", label: "Why Cold-Pressed" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const navRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, delay: 1.7, ease: "power3.out" }
    );
  }, []);

  useEffect(() => {
    const SCROLL_THRESHOLD = 20;

    const handleScroll = () => {
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => setScrolled(self.scroll() > SCROLL_THRESHOLD),
      onRefresh: (self) => setScrolled(self.scroll() > SCROLL_THRESHOLD),
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      st.kill();
    };
  }, []);

  // Split the legal name into a bold "brand" word + a small letter-spaced suffix
  // e.g. "Yugika Foods Private Limited" -> "YUGIKA" / "FOODS PRIVATE LIMITED"
  const nameParts = company.legalName.toUpperCase().split(" ");
  const brandWord = nameParts[0];
  const brandSuffix = nameParts.slice(1).join(" ");

  return (
    <header
      ref={navRef}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-out ${
        scrolled || open
          ? "bg-cream shadow-md border-b border-gold/20"
          : "bg-transparent shadow-none"
      }`}
    >
      <div className={`mx-auto flex max-w-7xl items-center justify-between px-4 transition-all duration-300 ${
        scrolled
          ? "py-2 sm:py-2.5 lg:px-10"
          : "py-3 sm:py-3.5 lg:px-10"
      }`}>
        <Link href="/" className="group flex min-w-0 items-center gap-3 sm:gap-4" data-cursor-hover>
          {/* Logo */}
          <div className={`relative flex-shrink-0 rounded-full border border-gold/50 bg-white p-0.5 shadow-lg shadow-pine-950/20 ring-2 ring-gold/70 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:ring-gold ${
            scrolled ? "scale-90" : "scale-100"
          }`}>
            <span className={`relative block overflow-hidden rounded-full transition-all duration-300 ${
              scrolled
                ? "h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14"
                : "h-14 w-14 sm:h-[4.5rem] sm:w-[4.5rem] lg:h-20 lg:w-20"
            }`}>
              <Image
                src="/images/yugika-logo.jpg"
                alt="Yugika Foods Private Limited logo"
                fill
                className="object-cover"
                sizes="80px"
                priority
              />
            </span>
          </div>

          {/* Divider */}
          <span className={`hidden flex-shrink-0 w-px bg-gold/40 transition-all duration-300 sm:block ${
            scrolled ? "h-6 lg:h-8" : "h-10 lg:h-12"
          }`} aria-hidden="true" />

          {/* Brand lockup: big bold word + small tracked suffix, single line each */}
          <span className="flex min-w-0 flex-col justify-center leading-none">
            <span className={`whitespace-nowrap font-display font-bold tracking-wide text-pine-900 drop-shadow-[0_1px_0_rgba(255,255,255,0.75)] transition-all duration-300 group-hover:text-pine-700 ${
              scrolled ? "text-lg sm:text-xl lg:text-2xl" : "text-2xl sm:text-3xl lg:text-[2.5rem]"
            }`}>
              {brandWord}
            </span>
            {brandSuffix && (
              <span className={`mt-1 whitespace-nowrap font-semibold uppercase tracking-[0.3em] text-pine-700/80 transition-all duration-300 ${
                scrolled ? "text-[8px] sm:text-[9px] lg:text-[0.7rem] lg:tracking-[0.3em]" : "text-[10px] sm:text-xs lg:mt-1.5 lg:text-[0.8rem] lg:tracking-[0.35em]"
              }`}>
                {brandSuffix}
              </span>
            )}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              data-cursor-hover
              className="relative text-md font-medium text-ink/80 transition-colors hover:text-pine-900 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-gold after:transition-all after:duration-300 hover:after:w-full"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <button
          className="ml-2 flex h-10 w-10 flex-shrink-0 flex-col items-center justify-center gap-1.5 lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span className={`h-px w-6 bg-pine-900 transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`h-px w-6 bg-pine-900 transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`h-px w-6 bg-pine-900 transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </div>

      <div
        className={`lg:hidden overflow-hidden bg-cream transition-[max-height] duration-500 ease-in-out ${
          open ? "max-h-[32rem]" : "max-h-0"
        }`}
      >
        <div className="flex flex-col gap-4 px-4 pb-6 sm:px-6">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-base text-ink/80">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}