"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import BrandSwitcher from "./BrandSwitcher";
import { company } from "@/data/company";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import {
  UserRound,
  LogOut,
  Shield,
  ShoppingBag,
  Heart,
  MessageCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/products", label: "Products" },
  { href: "/our-process", label: "Our Process" },
  { href: "/lab-report", label: "Quality" },
  // { href: "/why-cold-pressed", label: "Why Cold-Pressed" },
  { href: "/contact", label: "Contact" },
];

const AUTHENTICATED_HIDDEN_LINKS = new Set([
  "/about",
  "/our-process",
  "/lab-report",
  "/why-cold-pressed",
  "/contact",
]);

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { itemCount, openCart } = useCart();
  const { count: wishlistCount } = useWishlist();
  const navRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);

  const isAdmin = pathname?.startsWith("/admin");
  const visibleLinks = user
    ? LINKS.filter((link) => !AUTHENTICATED_HIDDEN_LINKS.has(link.href))
    : LINKS;

  useEffect(() => {
    if (isAdmin || !navRef.current) return;
    gsap.fromTo(
      navRef.current,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, delay: 1.7, ease: "power3.out" }
    );
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) return;
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
  }, [isAdmin]);

  // Do not render storefront navbar on /admin routes to avoid overlapping the admin console
  if (isAdmin) {
    return null;
  }

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
          {visibleLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              data-cursor-hover
              className="relative text-md font-medium text-ink/80 transition-colors hover:text-pine-900 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-gold after:transition-all after:duration-300 hover:after:w-full"
            >
              {l.label}
            </Link>
          ))}

          {/* User Account / Sign In */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdown((prev) => !prev)}
                aria-expanded={userDropdown}
                aria-haspopup="menu"
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold text-pine-950 shadow-sm transition-all ${
                  userDropdown
                    ? "border-gold bg-white shadow-md"
                    : "border-pine-800/15 bg-white/70 hover:border-gold/70 hover:bg-white hover:shadow-md"
                }`}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-pine-700 to-pine-950 text-[10px] text-cream ring-2 ring-gold/30">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </span>
                <span className="max-w-[100px] truncate">{user.name?.split(" ")[0] || "Account"}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-pine-800/60 transition-transform ${userDropdown ? "rotate-180" : ""}`} />
              </button>

              {userDropdown && (
                <div
                  onMouseLeave={() => setUserDropdown(false)}
                  role="menu"
                  className="absolute right-0 top-full mt-3 w-64 overflow-hidden rounded-3xl border border-white/80 bg-white/95 p-2 shadow-[0_20px_60px_-18px_rgba(20,54,34,0.35)] ring-1 ring-pine-950/5 backdrop-blur-xl"
                >
                  <div className="relative mb-1 overflow-hidden rounded-2xl bg-gradient-to-br from-pine-900 to-pine-800 px-4 py-4 text-white">
                    <span className="absolute -right-5 -top-8 h-24 w-24 rounded-full border-[14px] border-white/5" aria-hidden="true" />
                    <div className="relative flex items-center gap-3">
                      <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 font-display text-lg font-semibold text-gold-light shadow-inner">
                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{user.name || "Welcome"}</p>
                        <p className="mt-0.5 truncate text-[11px] text-white/65">{user.email}</p>
                      </div>
                    </div>
                    {user.role && (
                      <span className="relative mt-3 inline-flex rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-gold-light">
                        {user.role}
                      </span>
                    )}
                  </div>
                  <Link
                    href="/account"
                    onClick={() => setUserDropdown(false)}
                    role="menuitem"
                    className="group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-pine-50"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-pine-50 text-pine-800 transition-colors group-hover:bg-white">
                      <UserRound className="h-4 w-4" />
                    </span>
                    <span className="flex-1">My Account</span>
                    <ChevronRight className="h-4 w-4 text-pine-900/25 transition-transform group-hover:translate-x-0.5 group-hover:text-pine-800" />
                  </Link>
                  <Link
                    href="/account?tab=wishlist"
                    onClick={() => setUserDropdown(false)}
                    role="menuitem"
                    className="group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-rose-50 hover:text-rose-700"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-500 transition-colors group-hover:bg-white">
                      <Heart className="h-4 w-4 fill-current" />
                    </span>
                    <span className="flex-1">My Wishlist</span>
                    {wishlistCount > 0 ? (
                      <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                        {wishlistCount}
                      </span>
                    ) : (
                      <ChevronRight className="h-4 w-4 text-pine-900/25 transition-transform group-hover:translate-x-0.5 group-hover:text-rose-600" />
                    )}
                  </Link>
                  <Link
                    href="/contact"
                    onClick={() => setUserDropdown(false)}
                    role="menuitem"
                    className="group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-gold/10 hover:text-pine-900"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/10 text-gold-deep transition-colors group-hover:bg-white">
                      <MessageCircle className="h-4 w-4" />
                    </span>
                    <span className="flex-1">Contact Us</span>
                    <ChevronRight className="h-4 w-4 text-pine-900/25 transition-transform group-hover:translate-x-0.5 group-hover:text-pine-800" />
                  </Link>
                  {user.role?.toUpperCase() === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setUserDropdown(false)}
                      role="menuitem"
                      className="group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-pine-50"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-pine-50 text-pine-800 group-hover:bg-white">
                        <Shield className="h-4 w-4" />
                      </span>
                      <span className="flex-1">Admin Dashboard</span>
                      <ChevronRight className="h-4 w-4 text-pine-900/25 transition-transform group-hover:translate-x-0.5 group-hover:text-pine-800" />
                    </Link>
                  )}
                  <div className="mx-2 my-2 border-t border-pine-900/10" />
                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdown(false);
                      logout();
                    }}
                    role="menuitem"
                    className="group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-colors group-hover:bg-white">
                      <LogOut className="h-4 w-4" />
                    </span>
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              data-cursor-hover
              className="group relative inline-flex h-8 items-center gap-1.5 overflow-hidden rounded-full border border-gold/70 bg-gradient-to-br from-pine-800 via-pine-900 to-pine-950 px-3 text-[11px] font-semibold tracking-wide text-cream shadow-[0_4px_12px_rgba(10,72,35,0.2)] transition-all duration-300 before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:transition-transform before:duration-700 hover:-translate-y-0.5 hover:border-gold-light hover:shadow-[0_8px_18px_rgba(10,72,35,0.28)] hover:before:translate-x-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream active:translate-y-0"
            >
              <span className="relative flex h-5 w-5 items-center justify-center rounded-full border border-gold/35 bg-gold/15 text-gold-light transition-colors group-hover:bg-gold/25">
                <UserRound className="h-3 w-3" />
              </span>
              <span className="relative">Sign In</span>
              <ChevronRight className="relative h-3 w-3 text-gold-light/80 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          )}

          {/* Desktop Wishlist Trigger */}
          <Link
            href="/account?tab=wishlist"
            className="relative flex items-center justify-center rounded-full border border-pine-800/20 bg-pine-900/5 p-2 text-pine-950 transition-all hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
            aria-label="Wishlist"
            title="My Wishlist"
          >
            <Heart className={`h-4 w-4 ${wishlistCount > 0 ? "fill-rose-500 text-rose-500" : "text-pine-900"}`} />
            {wishlistCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs animate-in zoom-in-50">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Desktop Cart Trigger */}
          <button
            type="button"
            onClick={openCart}
            className="relative flex items-center justify-center rounded-full border border-pine-800/20 bg-pine-900/5 p-2 text-pine-950 transition-all hover:border-gold hover:bg-gold/15"
            aria-label="Open Shopping Bag"
            title="Shopping Bag"
          >
            <ShoppingBag className="h-4 w-4 text-pine-900" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold-deep text-[10px] font-bold text-white shadow-xs animate-in zoom-in-50">
                {itemCount}
              </span>
            )}
          </button>
        </nav>

        {/* Mobile Header Actions (Wishlist + Cart + Hamburger) */}
        <div className="flex items-center gap-1 lg:hidden">
          <Link
            href="/account?tab=wishlist"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-pine-900 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            aria-label="Wishlist"
            title="My Wishlist"
          >
            <Heart className={`h-5 w-5 ${wishlistCount > 0 ? "fill-rose-500 text-rose-500" : ""}`} />
            {wishlistCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs">
                {wishlistCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={openCart}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-pine-900 hover:bg-gold/15 transition-colors"
            aria-label="Open Shopping Bag"
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold-deep text-[10px] font-bold text-white shadow-xs">
                {itemCount}
              </span>
            )}
          </button>

          <button
            className="flex h-10 w-10 flex-shrink-0 flex-col items-center justify-center gap-1.5"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <span className={`h-px w-6 bg-pine-900 transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`h-px w-6 bg-pine-900 transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`h-px w-6 bg-pine-900 transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      <div
        className={`lg:hidden overflow-hidden bg-cream transition-[max-height] duration-500 ease-in-out ${
          open ? "max-h-[36rem]" : "max-h-0"
        }`}
      >
        <div className="flex flex-col gap-4 px-4 pb-6 sm:px-6">
          {visibleLinks.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-base text-ink/80">
              {l.label}
            </Link>
          ))}

          <div className="border-t border-gold/20 pt-3">
            {user ? (
              <div className="overflow-hidden rounded-3xl border border-pine-900/10 bg-white shadow-lg shadow-pine-950/5">
                <div className="flex items-center gap-3 bg-gradient-to-r from-pine-900 to-pine-800 px-4 py-4 text-white">
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 font-display text-lg font-semibold text-gold-light">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{user.name || "Welcome"}</p>
                    <p className="truncate text-xs text-white/65">{user.email}</p>
                  </div>
                  {user.role && (
                    <span className="rounded-full border border-white/15 bg-white/10 px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-gold-light">
                      {user.role}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 p-3">
                  <Link
                    href="/account"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-pine-900 px-3 py-3 text-xs font-semibold text-cream shadow-sm transition-colors hover:bg-pine-800"
                  >
                    <UserRound className="h-4 w-4" />
                    My Account
                  </Link>
                  <Link
                    href="/contact"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-gold/30 bg-gold/10 px-3 py-3 text-xs font-semibold text-pine-900 transition-colors hover:bg-gold/20"
                  >
                    <MessageCircle className="h-4 w-4 text-gold-deep" />
                    Contact Us
                  </Link>
                  <Link
                    href="/account?tab=wishlist"
                    onClick={() => setOpen(false)}
                    className="col-span-2 flex items-center justify-between rounded-2xl bg-rose-50/80 px-3 py-3 text-xs font-semibold text-pine-950 transition-colors hover:bg-rose-100"
                  >
                    <span className="flex items-center gap-2">
                      <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                      My Wishlist
                    </span>
                    {wishlistCount > 0 && (
                      <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                  {user.role?.toUpperCase() === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setOpen(false)}
                      className="col-span-2 flex items-center justify-center gap-2 rounded-2xl border border-pine-900/10 bg-pine-50 px-3 py-3 text-xs font-semibold text-pine-900 transition-colors hover:bg-pine-100"
                    >
                      <Shield className="h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      logout();
                    }}
                    className="col-span-2 flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-3 py-3 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-full bg-pine-900 py-2.5 text-center text-xs font-semibold text-cream"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-full border border-gold/60 bg-cream-paper py-2.5 text-center text-xs font-semibold text-pine-950"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}