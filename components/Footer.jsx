"use client";

import Image from "next/image";
import Link from "next/link";
import { company } from "@/data/company";

export default function Footer() {

  return (
    <footer className="bg-pine-950 px-4 pb-10 pt-16 text-cream/80 sm:px-6 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-gold/60">
              <Image src="/images/yugika-logo.jpg" alt="Yugika Foods Private Limited logo" fill className="object-cover" sizes="40px" />
            </span>
            <div>
              <p className="font-display text-lg text-cream">{company.legalName}</p>
              <p className="text-[10px] uppercase tracking-[0.28em] text-gold-light">Premium Cold-Pressed Edible Oils</p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream/60">
            Bringing you 100% pure cold pressed mustard oil, pressed the traditional Kachi Ghani way.
            Chemical-free. Lab-tested. Honestly delicious.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-light">Explore</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li><Link href="/" className="hover:text-cream">Home</Link></li>
            <li><Link href="/about" className="hover:text-cream">About Us</Link></li>
            <li><Link href="/products" className="hover:text-cream">Products</Link></li>
            <li><Link href="/our-process" className="hover:text-cream">Our Process</Link></li>
            <li><Link href="/lab-report" className="hover:text-cream">Quality</Link></li>
            <li><Link href="/why-cold-pressed" className="hover:text-cream">Why Cold-Pressed</Link></li>
            <li><Link href="/contact" className="hover:text-cream">Contact</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-light">Certifications</p>
          <ul className="mt-4 space-y-3 text-sm text-cream/70">
            <li>FSSAI Compliant</li>
            <li>NABL Lab Tested</li>
            <li>ISO/IEC 17025</li>
            <li>Kachi Ghani Cold Pressed</li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-14 flex max-w-7xl flex-col gap-3 border-t border-cream/10 pt-6 text-xs text-cream/50 md:flex-row md:items-center md:justify-between">
        <p>&copy; {new Date().getFullYear()} {company.legalName}. All rights reserved.</p>
        <p>Made with care in India</p>
      </div>
    </footer>
  );
}