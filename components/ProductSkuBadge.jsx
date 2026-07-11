"use client";

import { useBrand } from "./BrandProvider";
import { getSku } from "@/data/products";

export default function ProductSkuBadge({ product }) {
  const { brand } = useBrand();
  return (
    <SpecRow label="SKU" value={getSku(product, brand)} />
  );
}

function SpecRow({ label, value }) {
  return (
    <div className="rounded-xl bg-cream-paper px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.15em] text-ink/45">{label}</p>
      <p className="mt-1 font-medium text-pine-900">{value}</p>
    </div>
  );
}
