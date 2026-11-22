"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { company } from "@/data/company";

export default function Footer() {
  const pathname = usePathname();

  // Hide storefront footer on admin console routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-pine-950 px-4 pb-12 pt-16 text-cream/80 sm:px-6 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-10 text-center md:text-left md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="flex flex-col items-center md:items-start">
          <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-center gap-3.5 sm:gap-4">
            <div className="relative flex-shrink-0 rounded-full bg-white p-1 shadow-md shadow-black/25 ring-2 ring-gold/70 border border-gold/40">
              <span className="relative block h-14 w-14 overflow-hidden rounded-full sm:h-16 sm:w-16">
                <Image src="/images/yugika-logo.jpg" alt="Yugika Foods Private Limited logo" fill className="object-cover" sizes="80px" />
              </span>
            </div>
            <div>
              <p className="font-display text-xl font-bold text-cream sm:text-2xl">{company.legalName}</p>
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-gold-light mt-0.5">Ghar Ghar Ka Tel</p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream/60 mx-auto md:mx-0">
            Bringing you 100% pure cold pressed mustard oil, pressed the traditional Kachi Ghani way.
            Chemical-free. Lab-tested. Honestly delicious.
          </p>
        </div>

        <div className="flex flex-col items-center md:items-start">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-light">Explore</p>
          <ul className="mt-4 space-y-3 text-sm flex flex-col items-center md:items-start">
            <li><Link href="/" className="hover:text-cream transition-colors">Home</Link></li>
            <li><Link href="/about" className="hover:text-cream transition-colors">About Us</Link></li>
            <li><Link href="/products" className="hover:text-cream transition-colors">Products</Link></li>
            <li><Link href="/our-process" className="hover:text-cream transition-colors">Our Process</Link></li>
            <li><Link href="/lab-report" className="hover:text-cream transition-colors">Quality</Link></li>
            <li><Link href="/why-cold-pressed" className="hover:text-cream transition-colors">Why Cold-Pressed</Link></li>
            <li><Link href="/contact" className="hover:text-cream transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div className="flex flex-col items-center md:items-start">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-light">Certifications</p>
          <ul className="mt-4 space-y-3 text-sm text-cream/70 flex flex-col items-center md:items-start">
            <li>FSSAI Compliant</li>
            <li>NABL Lab Tested</li>
            <li>Kachi Ghani Cold Pressed</li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center gap-4 border-t border-cream/10 pt-6 text-xs text-cream/50 md:flex-row md:items-center md:justify-between text-center md:text-left">
        <p>&copy; {new Date().getFullYear()} {company.legalName}. All rights reserved.</p>
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-2.5 gap-y-1.5 text-center">
          <Link href="/terms-and-conditions" className="hover:text-cream transition-colors">
            Terms &amp; Conditions
          </Link>
          <span className="text-gold-light/40 select-none">•</span>
          <Link href="/privacy-policy" className="hover:text-cream transition-colors">
            Privacy Policy
          </Link>
          <span className="text-gold-light/40 select-none">•</span>
          <Link href="/shipping-policy" className="hover:text-cream transition-colors">
            Shipping Policy
          </Link>
          <span className="text-gold-light/40 select-none">•</span>
          <Link href="/refund-policy" className="hover:text-cream transition-colors">
            Refund &amp; Cancellation
          </Link>
          <span className="text-gold-light/40 select-none">•</span>
          <span className="text-cream/60">Made with care in India</span>
        </div>
      </div>
    </footer>
  );
}