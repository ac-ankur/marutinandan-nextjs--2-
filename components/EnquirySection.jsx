"use client";

import { useState } from "react";
import { MousePointerClick } from "lucide-react";
import PixelSwap from "./PixelSwap";
import EnquiryForm from "@/components/EnquiryForm";
import ContactInfo from "@/components/ContactInfo";

/* Decorative Central Wheat & Botanical Wreath Frame */
function CentralWreathFrame({ className }) {
  return (
    <svg viewBox="0 0 700 420" className={className} fill="none">
      <style>{`
        @keyframes swayWreath {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.015); }
        }
        .animate-wreath { transform-origin: center; animation: swayWreath 6s ease-in-out infinite; }
      `}</style>
      <g className="animate-wreath" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        {/* Outer Laurel / Wheat Arcs */}
        <path d="M 120 210 C 120 80, 240 30, 350 30 C 460 30, 580 80, 580 210 C 580 340, 460 390, 350 390 C 240 390, 120 340, 120 210 Z" opacity="0.4" strokeDasharray="4 4" />
        <path d="M 140 210 C 140 95, 245 48, 350 48 C 455 48, 560 95, 560 210 C 560 325, 455 372, 350 372 C 245 372, 140 325, 140 210 Z" opacity="0.8" />
        
        {/* Wheat Heads Left */}
        {[60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x = 350 - Math.cos(rad) * 210;
          const y = 210 - Math.sin(rad) * 160;
          return (
            <g key={`left-wheat-${i}`} transform={`translate(${x}, ${y}) rotate(${angle - 90})`}>
              <path d="M 0 0 C -4 -8, -8 -12, -12 -14" opacity="0.7" />
              <path d="M 0 0 C 4 -8, 8 -12, 12 -14" opacity="0.7" />
              <ellipse cx="0" cy="-6" rx="4" ry="7" fill="currentColor" opacity="0.8" />
            </g>
          );
        })}

        {/* Wheat Heads Right */}
        {[-60, -30, 0, 30, 60, 90, 120, 150, 180, 210, 240].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x = 350 + Math.cos(rad) * 210;
          const y = 210 - Math.sin(rad) * 160;
          return (
            <g key={`right-wheat-${i}`} transform={`translate(${x}, ${y}) rotate(${-angle + 90})`}>
              <path d="M 0 0 C -4 -8, -8 -12, -12 -14" opacity="0.7" />
              <path d="M 0 0 C 4 -8, 8 -12, 12 -14" opacity="0.7" />
              <ellipse cx="0" cy="-6" rx="4" ry="7" fill="currentColor" opacity="0.8" />
            </g>
          );
        })}

        {/* Ornate Flourishes */}
        <path d="M 310 32 C 330 20, 370 20, 390 32" strokeWidth="1.8" />
        <path d="M 310 388 C 330 400, 370 400, 390 388" strokeWidth="1.8" />
      </g>
    </svg>
  );
}

/* Detailed Botanical Mustard Plant Illustration */
function DetailedMustardPlant({ className }) {
  return (
    <svg viewBox="0 0 240 360" className={className} fill="none">
      <style>{`
        @keyframes plantBreathe {
          0%, 100% { transform: rotate(-1.5deg) translateY(0); }
          50% { transform: rotate(1.5deg) translateY(-4px); }
        }
        .animate-botanical { transform-origin: 120px 340px; animation: plantBreathe 5s ease-in-out infinite; }
      `}</style>
      <g className="animate-botanical" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        {/* Main Stem */}
        <path d="M 120 350 C 118 260, 125 180, 115 40" strokeWidth="2.2" />

        {/* Main Jagged Mustard Leaves */}
        {/* Lower Left Leaf */}
        <path d="M 120 280 C 80 270, 40 290, 20 260 C 35 245, 55 250, 70 240 C 50 220, 30 225, 25 200 C 55 205, 80 220, 118 245" fill="currentColor" fillOpacity="0.12" />
        <path d="M 120 280 C 80 270, 40 290, 20 260" />
        {/* Lower Right Leaf */}
        <path d="M 120 260 C 160 250, 200 270, 220 240 C 205 225, 185 230, 170 220 C 190 200, 210 205, 215 180 C 185 185, 160 200, 119 225" fill="currentColor" fillOpacity="0.12" />

        {/* Branching Stems */}
        <path d="M 118 210 C 90 170, 60 140, 45 110" />
        <path d="M 117 170 C 145 135, 170 110, 185 85" />
        <path d="M 116 120 C 95 90, 75 75, 65 55" />

        {/* Flower Blossoms (Clusters of 4-petal mustard blooms) */}
        {[
          { x: 115, y: 40 }, { x: 105, y: 30 }, { x: 125, y: 25 }, { x: 115, y: 15 },
          { x: 45, y: 110 }, { x: 38, y: 100 }, { x: 52, y: 95 },
          { x: 185, y: 85 }, { x: 192, y: 75 }, { x: 178, y: 70 },
          { x: 65, y: 55 }, { x: 58, y: 48 }
        ].map((pt, i) => (
          <g key={`flower-${i}`} transform={`translate(${pt.x}, ${pt.y})`}>
            <circle cx="0" cy="-4" r="3" fill="currentColor" opacity="0.85" />
            <circle cx="-4" cy="0" r="3" fill="currentColor" opacity="0.85" />
            <circle cx="4" cy="0" r="3" fill="currentColor" opacity="0.85" />
            <circle cx="0" cy="4" r="3" fill="currentColor" opacity="0.85" />
            <circle cx="0" cy="0" r="1.8" fill="currentColor" />
          </g>
        ))}
      </g>
    </svg>
  );
}

/* Antique Wooden Screw Oil Press Machine (Kolhu / Screw Press) */
function VintageScrewPress({ className }) {
  return (
    <svg viewBox="0 0 200 220" className={className} fill="none">
      <style>{`
        @keyframes screwTurn {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(3px); }
        }
        .animate-screw { animation: screwTurn 3s ease-in-out infinite; }
      `}</style>
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        {/* Heavy Wooden Frame Base */}
        <rect x="25" y="180" width="150" height="20" rx="3" fill="currentColor" fillOpacity="0.15" />
        <path d="M 15 200 H 185" strokeWidth="2" />

        {/* Vertical Side Pillars */}
        <rect x="35" y="60" width="16" height="120" rx="2" fill="currentColor" fillOpacity="0.1" />
        <rect x="149" y="60" width="16" height="120" rx="2" fill="currentColor" fillOpacity="0.1" />
        <path d="M 25 60 H 175" strokeWidth="2" />

        {/* Pressing Barrel / Mortar Container */}
        <rect x="60" y="110" width="80" height="70" rx="4" fill="currentColor" fillOpacity="0.2" />
        {[120, 135, 150, 165].map((y) => (
          <path key={y} d={`M 60 ${y} H 140`} opacity="0.5" />
        ))}

        {/* Central Threaded Screw Spindle & Top Turning Handle */}
        <g className="animate-screw">
          <path d="M 100 20 V 110" strokeWidth="3" />
          {[35, 45, 55, 65, 75, 85, 95, 105].map((y) => (
            <path key={y} d={`M 92 ${y} L 108 ${y - 3}`} strokeWidth="1.5" opacity="0.8" />
          ))}
          {/* Top Wooden Lever Wheel */}
          <ellipse cx="100" cy="20" rx="45" ry="8" fill="currentColor" fillOpacity="0.2" strokeWidth="1.8" />
          <circle cx="55" cy="20" r="4" fill="currentColor" />
          <circle cx="145" cy="20" r="4" fill="currentColor" />
        </g>

        {/* Golden Oil Spout & Collection Catch */}
        <path d="M 100 180 V 192" strokeWidth="2" />
        <circle cx="100" cy="195" r="2.5" fill="currentColor" className="animate-ping" />
      </g>
    </svg>
  );
}

/* Mortar, Pestle & Floating Golden Mustard Seeds */
function MortarAndSeeds({ className }) {
  return (
    <svg viewBox="0 0 180 140" className={className} fill="none">
      <style>{`
        @keyframes seedFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(6deg); }
        }
        .animate-seeds { animation: seedFloat 4s ease-in-out infinite; }
      `}</style>
      <g stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        {/* Mortar Bowl */}
        <path d="M 40 60 C 40 105, 120 105, 120 60 Z" fill="currentColor" fillOpacity="0.15" strokeWidth="1.6" />
        <ellipse cx="80" cy="60" rx="40" ry="10" fill="currentColor" fillOpacity="0.2" />
        <path d="M 50 100 H 110" strokeWidth="2" />

        {/* Pestle */}
        <path d="M 95 25 L 70 70" strokeWidth="4.5" />
        <circle cx="98" cy="22" r="6" fill="currentColor" opacity="0.8" />

        {/* Scattered Mustard Seeds */}
        <g className="animate-seeds">
          {[
            { x: 135, y: 50, r: 3 }, { x: 148, y: 62, r: 2.5 }, { x: 130, y: 72, r: 3.5 },
            { x: 158, y: 78, r: 2 }, { x: 142, y: 88, r: 3 }, { x: 122, y: 92, r: 2.5 },
            { x: 25, y: 75, r: 3 }, { x: 18, y: 88, r: 2.5 }
          ].map((pt, i) => (
            <circle key={`seed-${i}`} cx={pt.x} cy={pt.y} r={pt.r} fill="currentColor" opacity="0.85" />
          ))}
        </g>
      </g>
    </svg>
  );
}

/* Vintage Glass Oil Bottle with Cork Stopper */
function VintageOilBottle({ className }) {
  return (
    <svg viewBox="0 0 120 220" className={className} fill="none">
      <style>{`
        @keyframes bottleGlow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .animate-glow { animation: bottleGlow 3s ease-in-out infinite; }
      `}</style>
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        {/* Cork Stopper */}
        <path d="M 52 20 H 68 L 65 32 H 55 Z" fill="currentColor" opacity="0.7" />

        {/* Glass Bottle Neck & Collar */}
        <path d="M 50 32 H 70 V 60 L 30 90 V 190 C 30 200, 40 205, 60 205 C 80 205, 90 200, 90 190 V 90 L 70 60 V 32" fill="currentColor" fillOpacity="0.08" />
        <path d="M 46 44 H 74" opacity="0.6" />

        {/* Liquid Oil Fill Level */}
        <path d="M 32 110 C 50 115, 70 105, 88 110 V 188 C 88 196, 78 200, 60 200 C 42 200, 32 196, 32 188 Z" fill="currentColor" fillOpacity="0.25" />

        {/* Vintage Label Outline */}
        <rect x="42" y="125" width="36" height="48" rx="2" strokeWidth="1.1" fill="currentColor" fillOpacity="0.1" />
        <path d="M 47 137 H 73" opacity="0.6" strokeWidth="1" />
        <path d="M 50 147 H 70" opacity="0.6" strokeWidth="1" />
        <path d="M 47 157 H 73" opacity="0.6" strokeWidth="1" />

        {/* Glass Reflection Lines */}
        <path d="M 38 95 V 175" opacity="0.4" strokeDasharray="12 6" />
      </g>
    </svg>
  );
}

/* Astronomical Harvest & Season Calendar Dial */
function HarvestCalendarDial({ className }) {
  return (
    <svg viewBox="0 0 260 260" className={className} fill="none">
      <style>{`
        @keyframes dialRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-dial { transform-origin: 130px 130px; animation: dialRotate 45s linear infinite; }
      `}</style>
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
        {/* Outer Celestial Ring */}
        <circle cx="130" cy="130" r="120" strokeWidth="1.6" opacity="0.8" />
        <circle cx="130" cy="130" r="108" opacity="0.5" strokeDasharray="3 3" />
        <circle cx="130" cy="130" r="88" strokeWidth="1.4" opacity="0.7" />

        {/* Rotating Zodiac / Harvest Wheel Markings */}
        <g className="animate-dial">
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i / 24) * Math.PI * 2;
            const x1 = 130 + Math.cos(angle) * 88;
            const y1 = 130 + Math.sin(angle) * 88;
            const x2 = 130 + Math.cos(angle) * 108;
            const y2 = 130 + Math.sin(angle) * 108;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} opacity="0.6" />;
          })}
          {/* Inner Harvest Constellation Dots */}
          {[30, 75, 120, 165, 210, 255, 300, 345].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const cx = 130 + Math.cos(rad) * 65;
            const cy = 130 + Math.sin(rad) * 65;
            return <circle key={i} cx={cx} cy={cy} r="2.5" fill="currentColor" opacity="0.75" />;
          })}
        </g>

        {/* Sun Center Motif */}
        <circle cx="130" cy="130" r="24" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const x1 = 130 + Math.cos(angle) * 24;
          const y1 = 130 + Math.sin(angle) * 24;
          const x2 = 130 + Math.cos(angle) * 38;
          const y2 = 130 + Math.sin(angle) * 38;
          return <line key={`sun-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} opacity="0.8" strokeWidth="1.3" />;
        })}
      </g>
    </svg>
  );
}

/* Authentic Wax Stamp Seal Badge */
function WaxSealBadge({ className }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <style>{`
        @keyframes sealPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-seal { transform-origin: center; animation: sealPulse 4s ease-in-out infinite; }
      `}</style>
      <g className="animate-seal" stroke="currentColor">
        {/* Scalloped Outer Wax Edge */}
        <path
          d="M 50 5 C 56 5, 59 10, 65 12 C 71 14, 76 11, 81 16 C 86 21, 83 26, 88 32 C 93 38, 98 41, 98 48 C 98 55, 93 58, 88 64 C 83 70, 86 75, 81 80 C 76 85, 71 82, 65 84 C 59 86, 56 91, 50 91 C 44 91, 41 86, 35 84 C 29 82, 24 85, 19 80 C 14 75, 17 70, 12 64 C 7 58, 2 55, 2 48 C 2 41, 7 38, 12 32 C 17 26, 14 21, 19 16 C 24 11, 29 14, 35 12 C 41 10, 44 5, 50 5 Z"
          fill="currentColor"
          fillOpacity="0.25"
          strokeWidth="1.8"
        />
        <circle cx="50" cy="48" r="34" strokeWidth="1.4" opacity="0.8" />
        <circle cx="50" cy="48" r="30" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
        {/* Central Crown / Brand Emblem */}
        <path d="M 38 54 L 42 42 L 50 48 L 58 42 L 62 54 Z" fill="currentColor" opacity="0.8" />
        <path d="M 38 58 H 62" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

/* Vintage Service Bell & Calligraphy Quill for Customer Support */
function CustomerSupportQuill({ className }) {
  return (
    <svg viewBox="0 0 160 160" className={className} fill="none">
      <style>{`
        @keyframes quillSway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-5deg); }
        }
        .animate-quill { transform-origin: 100px 120px; animation: quillSway 3.5s ease-in-out infinite; }
      `}</style>
      <g stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        {/* Inkwell */}
        <rect x="80" y="105" width="40" height="35" rx="4" fill="currentColor" fillOpacity="0.2" />
        <path d="M 88 105 V 98 H 112 V 105" />

        {/* Feather Quill Pen */}
        <g className="animate-quill">
          <path d="M 96 100 C 70 60, 40 30, 20 10 C 30 25, 45 45, 50 65 C 55 50, 70 35, 96 100 Z" fill="currentColor" fillOpacity="0.15" />
          <path d="M 96 100 C 65 55, 35 25, 20 10" strokeWidth="1.8" />
        </g>
      </g>
    </svg>
  );
}

function EnquiryPrompt() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#0a2f1d] px-6 text-center select-none">
      {/* Background Decorative Layer */}
      <HarvestCalendarDial className="absolute -right-12 -top-12 h-64 w-64 text-gold-light opacity-25 sm:h-96 sm:w-96" />
      <CentralWreathFrame className="absolute left-1/2 top-1/2 h-[520px] w-[880px] -translate-x-1/2 -translate-y-1/2 text-gold-light opacity-40 pointer-events-none" />

      {/* Left Hand Artistry Elements */}
      <DetailedMustardPlant className="absolute left-[3%] top-[12%] h-72 w-auto text-gold-light opacity-65 sm:h-96 lg:left-[5%]" />
      <VintageScrewPress className="absolute left-[4%] bottom-[8%] h-44 w-auto text-gold-light opacity-50 sm:h-56 lg:left-[7%]" />

      {/* Right Hand Heritage Elements */}
      <VintageOilBottle className="absolute right-[5%] bottom-[10%] h-52 w-auto text-gold-light opacity-60 sm:h-64 lg:right-[8%]" />
      <MortarAndSeeds className="absolute right-[18%] top-[14%] h-32 w-auto text-gold-light opacity-45 sm:h-40" />
      <CustomerSupportQuill className="absolute left-[20%] top-[8%] h-32 w-auto text-gold-light opacity-40" />

      {/* Bottom Center Wax Seal Stamp */}
      <WaxSealBadge className="absolute bottom-[6%] left-1/2 h-16 w-16 -translate-x-1/2 text-gold-light opacity-80 sm:h-20 sm:w-20" />

      {/* Foreground Content Box */}
      <div className="relative z-10 my-auto flex flex-col items-center max-w-lg">
        <p className="relative text-xs font-semibold tracking-[0.35em] uppercase text-gold-light/80 sm:text-sm">
          — Reach Us —
        </p>
        <h2 className="relative mt-4 font-display text-4xl leading-tight text-cream sm:text-5xl lg:text-6xl">
          Have any <span className="italic text-gold-light font-serif">enquiry?</span>
        </h2>
        <p className="relative mt-5 max-w-md text-sm leading-relaxed text-cream/75 sm:text-base">
          Customer, distributor, retailer or partner — click below and our details will unfold right here.
        </p>

        <span className="relative mt-8 inline-flex items-center gap-2.5 rounded-full border border-gold-light/50 bg-pine-900/60 px-7 py-3.5 text-sm font-medium tracking-wide text-gold-light shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-gold-light hover:text-pine-950">
          <MousePointerClick size={18} strokeWidth={2} className="animate-pulse" />
          Click to get in touch
        </span>
      </div>
    </div>
  );
}

function ContactReveal() {
  return (
    <div
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