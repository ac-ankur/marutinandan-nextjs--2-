"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { brands } from "@/data/company";

const BrandContext = createContext({
  brandKey: "marutinandan",
  brand: brands.marutinandan,
  setBrandKey: () => {},
});

export function BrandProvider({ children }) {
  const [brandKey, setBrandKey] = useState("marutinandan");

  useEffect(() => {
    const stored = window.localStorage.getItem("mn_brand");
    if (stored && brands[stored]) setBrandKey(stored);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("mn_brand", brandKey);
  }, [brandKey]);

  const brand = brands[brandKey] || brands.marutinandan;

  return (
    <BrandContext.Provider value={{ brandKey, brand, setBrandKey }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  return useContext(BrandContext);
}
