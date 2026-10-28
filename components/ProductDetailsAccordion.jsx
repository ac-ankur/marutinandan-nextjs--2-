"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

function AccordionItem({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-ink/10 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-4 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold uppercase tracking-[0.12em] text-ink/75">{title}</span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-ink/40 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${open ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailsAccordion({ product }) {
  const allFeatures = product.variantData?.features ?? [];

  return (
    <div className="rounded-3xl border border-ink/10 bg-white/60 px-6 py-2 lg:px-8">

      {/* Product Description */}
      <AccordionItem title="Product Description" defaultOpen={true}>
        <p className="whitespace-pre-line text-sm leading-relaxed text-ink/70">
          {product.fullDescription}
        </p>
      </AccordionItem>

      {/* Key Features / Benefits */}
      <AccordionItem title="Key Features & Benefits">
        <ul className="space-y-2.5">
          {allFeatures.map((f) => (
            <li key={f} className="flex items-start gap-3 text-sm text-ink/70">
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-gold-deep/40 text-[11px] text-gold-deep">
                ✓
              </span>
              {f}
            </li>
          ))}
        </ul>
      </AccordionItem>

      {/* Best Suited For */}
      <AccordionItem title="Best Suited For">
        <p className="text-sm leading-relaxed text-ink/70">{product.suitability}</p>
      </AccordionItem>

      {/* Product Specifications */}
      <AccordionItem title="Specifications">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { label: "Type", value: "Cold Pressed (Kachi Ghani)" },
            { label: "Variant", value: product.variantData?.name },
            { label: "Pack Size", value: `${product.size} ${product.stockUnit}` },
            { label: "SKU", value: product.skuBase },
            { label: "Certification", value: "FSSAI · NABL Accredited" },
            { label: "Shelf Life", value: "12 months from manufacture" },
            { label: "Pungency", value: product.variantData?.pungency ? `Allyl Isothiocyanate ${product.variantData.pungency}` : "—" },
            { label: "Processing", value: "Single-pressed, No solvent, No hexane" },
            { label: "Additives", value: "None — 100% Pure" },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-cream-paper px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.12em] text-ink/45">{label}</p>
              <p className="mt-1 text-sm font-medium text-pine-900">{value}</p>
            </div>
          ))}
        </div>
      </AccordionItem>

      {/* Shipping & Returns */}
      <AccordionItem title="Shipping & Returns">
        <div className="space-y-3 text-sm text-ink/70">
          <p>
            <strong className="text-pine-900">Free shipping</strong> on all orders above ₹499.
            Orders below ₹499 have a flat ₹60 shipping fee.
          </p>
          <p>
            <strong className="text-pine-900">Delivery time:</strong> 2–6 working days depending on your location.
            Enter your pincode above to get an estimate.
          </p>
          <p>
            <strong className="text-pine-900">Returns:</strong> We accept returns within 7 days of delivery if the product is
            sealed and in original condition. Opened products are eligible only if defective.
          </p>
        </div>
      </AccordionItem>
    </div>
  );
}