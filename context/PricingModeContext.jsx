"use client";

import { createContext, useContext } from "react";

const PricingModeContext = createContext({
  pricingMode: "dynamic",
  isDynamic: true,
  mounted: true,
});

export function PricingModeProvider({ children }) {
  return (
    <PricingModeContext.Provider
      value={{
        pricingMode: "dynamic",
        isDynamic: true,
        mounted: true,
      }}
    >
      {children}
    </PricingModeContext.Provider>
  );
}

export function usePricingMode() {
  return useContext(PricingModeContext);
}
