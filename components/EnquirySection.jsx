"use client";

import { useState } from "react";
import { MousePointerClick } from "lucide-react";
import PixelSwap from "./PixelSwap";
import EnquiryForm from "@/components/EnquiryForm";
import ContactInfo from "@/components/ContactInfo";

/* Hand-drawn 4-petal mustard flower, same construction as the Rai Gold
   doodles — a small centre disc with four rounded petals at 90°.
   Uses currentColor so it inherits real Tailwind theme colors via
   the wrapping element's text-* class instead of a guessed hex. */
function MustardFlower({ className }) {
  return (
    <svg viewBox="0 0 60 60" className={className} fill="none">
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M30 6 C36 14 36 20 30 26 C24 20 24 14 30 6Z" />
        <path d="M30 54 C24 46 24 40 30 34 C36 40 36 46 30 54Z" />
        <path d="M6 30 C14 24 20 24 26 30 C20 36 14 36 6 30Z" />
        <path d="M54 30 C46 36 40 36 34 30 C40 24 46 24 54 30Z" />
      </g>
      <circle cx="30" cy="30" r="4.5" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

function OilDrop({ className }) {
  return (
    <svg viewBox="0 0 40 52" className={className} fill="none">
      <path
        d="M20 2C20 2 4 24 4 34a16 16 0 0 0 32 0C36 24 20 2 20 2Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M13 34a7 7 0 0 0 7 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

function SunBurst({ className }) {
  return (
    <svg viewBox="0 0 80 80" className={className} fill="none">
      <circle cx="40" cy="40" r="12" stroke="currentColor" strokeWidth="1.4" />
      {Array.from({ length: 10 }).map((_, i) => {
        const angle = (i / 10) * Math.PI * 2;
        const x1 = 40 + Math.cos(angle) * 20;
        const y1 = 40 + Math.sin(angle) * 20;
        const x2 = 40 + Math.cos(angle) * 32;
        const y2 = 40 + Math.sin(angle) * 32;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.7"
          />
        );
      })}
    </svg>
  );
}

/* Loosely scattered "field row" strokes to suggest tilled earth without
   drawing a literal landscape. */
function FieldLines({ className }) {
  return (
    <svg viewBox="0 0 220 40" className={className} fill="none">
      {[0, 1, 2, 3].map((i) => (
        <path
          key={i}
          d={`M0 ${8 + i * 9} C 55 ${2 + i * 9}, 165 ${14 + i * 9}, 220 ${8 + i * 9}`}
          stroke="currentColor"
          strokeWidth="1"
          opacity={0.25 + i * 0.06}
        />
      ))}
    </svg>
  );
}

function EnquiryPrompt() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-pine-950 px-6 text-center">
      {/* doodle field, kept behind the copy and faded at the edges */}
      <MustardFlower className="absolute left-[8%] top-[14%] h-14 w-14 text-gold-light opacity-70 sm:h-20 sm:w-20" />
      <MustardFlower className="absolute right-[10%] top-[22%] h-10 w-10 text-gold-light opacity-50 sm:h-14 sm:w-14" />
      <MustardFlower className="absolute bottom-[16%] left-[16%] h-10 w-10 text-gold-light opacity-40 sm:h-12 sm:w-12" />
      <OilDrop className="absolute bottom-[12%] right-[12%] h-14 w-auto text-gold-light opacity-60 sm:h-20" />
      <SunBurst className="absolute -right-4 -top-4 h-24 w-24 text-gold-light opacity-30 sm:h-32 sm:w-32" />
      <FieldLines className="absolute bottom-0 left-1/2 h-10 w-[85%] -translate-x-1/2 text-gold-light opacity-80" />

      <p className="relative text-lg uppercase tracking-[0.3em] text-gold-light/80">
        — Reach Us —
      </p>
      <h2 className="relative mt-4 max-w-md font-display text-4xl leading-tight text-cream sm:text-5xl">
        Have any <span className="italic text-gold-light">enquiry?</span>
      </h2>
      <p className="relative mt-5 max-w-sm text-sm leading-relaxed text-cream/60">
        Customer, distributor, retailer or partner — click below and our
        details will unfold right here.
      </p>

      <span className="relative mt-9 inline-flex items-center gap-2 rounded-full border border-gold-light/40 px-6 py-3 text-sm font-medium text-gold-light">
        <MousePointerClick size={16} strokeWidth={2} className="animate-pulse" />
        Click to get in touch
      </span>
    </div>
  );
}

function ContactReveal() {
  return (
    <div
      // Stop click/keydown here so PixelSwap's outer "click to reveal"
      // handler never sees events from inside the live form. Without this,
      // its keydown handler preventDefaults every Enter/Space it catches —
      // which would swallow spacebar in the message textarea and Enter in
      // the name/phone/email fields.
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      className="flex h-full w-full flex-col justify-center bg-cream px-6 py-16 sm:px-10"
    >
      <div className="mx-auto grid w-full mt-15 max-w-6xl gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold-deep">— Contact Us —</p>
          <h2 className="mt-4 font-display text-3xl leading-tight text-pine-900 sm:text-4xl">
            Get in <span className="italic text-gold-deep">Touch.</span>
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-ink/70">
            We&apos;d love to hear from you. Whether you&apos;re a customer,
            distributor, retailer, or business partner, our team is here to
            assist you.
          </p>
          <div className="mt-8">
            <ContactInfo />
          </div>
        </div>
        <EnquiryForm />
      </div>
    </div>
  );
}

export default function EnquirySection() {
  // Controlled + one-way: once the form is revealed, a stray click on the
  // padding around an input shouldn't pixelate it back to the doodle.
  const [open, setOpen] = useState(false);

  return (
    <section id="order" className="bg-cream py-18 lg:py-30">
      <PixelSwap
        trigger="click"
        active={open}
        onActiveChange={(next) => next && setOpen(true)}
        firstContent={<EnquiryPrompt />}
        secondContent={<ContactReveal />}
        pixelSize={56}
        pixelRadius={6}
        pixelScale={0.4}
        pixelSpin={2}
        duration={850}
        pixelDuration={320}
        pattern="spiral"
        randomness={0.12}
        fade
        aspectRatio="auto"
        className="min-h-[960px] cursor-pointer focus-visible:ring-2 focus-visible:ring-gold-light focus-visible:ring-offset-2 sm:min-h-[880px] lg:min-h-[750px]"
      />
    </section>
  );
}
