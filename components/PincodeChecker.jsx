"use client";

import { useEffect, useState } from "react";
import { MapPin, Loader2, CheckCircle, XCircle, Truck } from "lucide-react";
import { useProductVariant } from "@/context/ProductVariantContext";
import { formatApiError, shipping as shippingApi } from "@/lib/api";

export default function PincodeChecker() {
  const selectedVariant = useProductVariant()?.variant;
  const [pincode, setPincode] = useState("");
  const [status, setStatus] = useState(null); // null | "loading" | "ok" | "no" | "error"
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setStatus(null);
    setResult(null);
    setErrorMessage("");
  }, [selectedVariant?.id]);

  const check = async () => {
    if (!/^\d{6}$/.test(pincode)) return;
    if (!selectedVariant?.id) {
      setStatus("error");
      setErrorMessage("Delivery checking is temporarily unavailable for this product.");
      return;
    }
    setStatus("loading");
    setResult(null);
    setErrorMessage("");
    try {
      const response = await shippingApi.serviceability(pincode, selectedVariant.id, 1);
      const data = response?.serviceability ?? response;
      if (data?.serviceable) {
        setResult(data);
        setStatus("ok");
      } else {
        setStatus("no");
      }
    } catch (error) {
      if (error?.code === "PINCODE_NOT_SERVICEABLE") {
        setStatus("no");
      } else {
        setErrorMessage(formatApiError(error));
        setStatus("error");
      }
    }
  };

  return (
    <div className="mt-5 rounded-2xl border border-ink/10 bg-white/60 px-4 py-4">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="h-4 w-4 text-pine-800 flex-shrink-0" />
        <span className="text-sm font-semibold text-ink/80">Check Delivery</span>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={pincode}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 6);
            setPincode(v);
            if (status) { setStatus(null); setResult(null); setErrorMessage(""); }
          }}
          onKeyDown={(e) => e.key === "Enter" && check()}
          placeholder="Enter 6-digit pincode"
          className="flex-1 rounded-xl border border-ink/20 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/35 focus:border-pine-700 focus:outline-none focus:ring-2 focus:ring-pine-700/15 transition-all"
        />
        <button
          type="button"
          onClick={check}
          disabled={pincode.length !== 6 || status === "loading" || !selectedVariant?.id}
          className="rounded-xl bg-pine-900 px-4 py-2.5 text-sm font-semibold text-cream transition-all hover:bg-pine-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "loading"
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : "Check"
          }
        </button>
      </div>

      {status === "ok" && result && (
        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5">
          <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
          <div className="text-sm">
            <p className="font-semibold text-emerald-800">Delivery Available!</p>
            {(result.estimatedDelivery || result.estimatedDeliveryDays || result.courierName) && (
              <p className="mt-0.5 text-emerald-700">
                <Truck className="mr-1 inline h-3.5 w-3.5" />
                {result.estimatedDelivery && <>Expected by <strong>{result.estimatedDelivery}</strong></>}
                {result.estimatedDeliveryDays && <span className="text-emerald-600">{result.estimatedDelivery ? " · " : ""}{result.estimatedDeliveryDays} working days</span>}
                {result.courierName && <span className="text-emerald-600">{result.estimatedDelivery || result.estimatedDeliveryDays ? " · " : ""}{result.courierName}</span>}
              </p>
            )}
            <p className="mt-1 text-xs text-emerald-600">✦ Free shipping on orders of ₹5,000 or more</p>
          </div>
        </div>
      )}

      {status === "no" && (
        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5">
          <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-500" />
          <div className="text-sm">
            <p className="font-semibold text-rose-700">Not serviceable yet</p>
            <p className="mt-0.5 text-xs text-rose-600">We&apos;re expanding! Try a nearby pincode or contact us.</p>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5">
          <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
          <p className="text-sm text-amber-800">{errorMessage || "We couldn't check delivery right now. Please try again."}</p>
        </div>
      )}
    </div>
  );
}
