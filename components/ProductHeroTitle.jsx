"use client";

import { useProductVariant } from "@/context/ProductVariantContext";
import { getPackPackaging } from "@/data/products";

export default function ProductHeroTitle({ initialProduct }) {
  const productVariant = useProductVariant();
  const dynamicProduct = productVariant?.product;
  const dynamicVariant = productVariant?.variant;

  const name = dynamicProduct?.name || initialProduct?.variantData?.name || "Cold Pressed Mustard Oil";
  const rawSize = dynamicVariant?.label || initialProduct?.size || "";
  const unit = getPackPackaging(rawSize || initialProduct?.stockUnit || initialProduct?.slug);
  const sizeText = rawSize ? `${rawSize} ${unit}` : "";
  const tagline = dynamicProduct?.category?.name || initialProduct?.variantData?.tagline || "100% Pure Cold Pressed (Kachi Ghani)";
  const description = dynamicProduct?.description || initialProduct?.description;

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.25em] text-gold-deep">
        {tagline}
      </p>
      <h1 className="mt-3 font-display text-3xl font-bold text-pine-900 sm:text-4xl">
        {name}
      </h1>
      {sizeText && (
        <p className="mt-1 text-base text-ink/55">
          {sizeText}
        </p>
      )}
      {description && (
        <p className="mt-4 text-sm leading-relaxed text-ink/65">
          {description}
        </p>
      )}
    </div>
  );
}
