"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

const PricingModeContext = createContext({
  pricingMode: "static", // "static" | "dynamic"
  isDynamic: false,
  setPricingMode: () => {},
  togglePricingMode: () => {},
});

export const PRICING_MODE_KEY = "yugika_pricing_mode";

export function PricingModeProvider({ children }) {
  const [pricingMode, setPricingModeState] = useState("static");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PRICING_MODE_KEY);
      if (saved === "dynamic" || saved === "static") {
        setPricingModeState(saved);
      }
    } catch (_) {}
    setMounted(true);
  }, []);

  const setPricingMode = useCallback((mode) => {
    const nextMode = mode === "dynamic" ? "dynamic" : "static";
    setPricingModeState(nextMode);
    try {
      localStorage.setItem(PRICING_MODE_KEY, nextMode);
    } catch (_) {}
  }, []);

  const togglePricingMode = useCallback(() => {
    setPricingMode((prev) => (prev === "static" ? "dynamic" : "static"));
  }, [setPricingMode]);

  return (
    <PricingModeContext.Provider
      value={{
        pricingMode,
        isDynamic: pricingMode === "dynamic",
        setPricingMode,
        togglePricingMode,
        mounted,
      }}
    >
      {children}
    </PricingModeContext.Provider>
  );
}

export function usePricingMode() {
  return useContext(PricingModeContext);
}
