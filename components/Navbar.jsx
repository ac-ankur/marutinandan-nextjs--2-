"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import BrandSwitcher from "./BrandSwitcher";
import { company } from "@/data/company";

const LINKS = [
  { href: "/story", label: "Story" },
  { href: "/products", label: "Products" },
  { href: "/lab-report", label: "Lab Report" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const navRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, delay: 1.7, ease: "power3.out" }
    );
  }, []);

  return (
    <header
      ref={navRef}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-cream/90 backdrop-blur-md shadow-[0_1px_0_rgba(36,27,16,0.08)]" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link href="/" className="group flex items-center gap-3" data-cursor-hover>
          <span className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-gold/60">
            <Image src="/images/yugika-logo.jpg" alt="Yugika Foods Private Limited logo" fill className="object-cover" sizes="40px" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg tracking-wide text-pine-900">{company.legalName.toUpperCase()}</span>
            {/* <span className="text-[10px] uppercase tracking-[0.28em] text-gold-deep">{company.headerTagline}</span> */}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              data-cursor-hover
              className="relative text-sm font-medium text-ink/80 transition-colors hover:text-pine-900 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-gold after:transition-all after:duration-300 hover:after:w-full"
            >
              {l.label}
            </Link>
          ))}
          <BrandSwitcher />
          <Link
            href="/contact"
            data-cursor-hover
            className="rounded-full bg-pine-800 px-5 py-2.5 text-sm font-medium text-cream transition-transform hover:scale-[1.03] hover:bg-pine-700"
          >
            Order Now
          </Link>
        </nav>

        <button
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span className={`h-px w-6 bg-pine-900 transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`h-px w-6 bg-pine-900 transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`h-px w-6 bg-pine-900 transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </div>

      <div
        className={`md:hidden overflow-hidden bg-cream transition-[max-height] duration-500 ease-in-out ${
          open ? "max-h-[32rem]" : "max-h-0"
        }`}
      >
        <div className="flex flex-col gap-4 px-6 pb-6">
          <BrandSwitcher className="w-fit" />
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-base text-ink/80">
              {l.label}
            </Link>
          ))}
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="rounded-full bg-pine-800 px-5 py-2.5 text-center text-sm font-medium text-cream"
          >
            Order Now
          </Link>
        </div>
      </div>
    </header>
  );
}