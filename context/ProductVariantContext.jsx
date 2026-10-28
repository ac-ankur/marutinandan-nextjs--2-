"use client";

import { createContext, useContext, useMemo, useState } from "react";

const ProductVariantContext = createContext(null);

export function ProductVariantProvider({ children }) {
  const [selection, setSelection] = useState({ product: null, variant: null });
  const value = useMemo(() => ({ ...selection, setSelection }), [selection]);

  return (
    <ProductVariantContext.Provider value={value}>
      {children}
    </ProductVariantContext.Provider>
  );
}

export function useProductVariant() {
  return useContext(ProductVariantContext);
}
