"use client";

import { useState } from "react";
import { MapPin, Loader2, CheckCircle, XCircle, Truck } from "lucide-react";

// Estimated delivery days by first 2 digits of pincode (rough zones)
const DAYS_BY_PREFIX = {
  "11": 2, "12": 2, "13": 2, "14": 2, "15": 2, "16": 2, "17": 3,
  "18": 3, "19": 3, "20": 2, "21": 2, "22": 3, "23": 3, "24": 3,
  "25": 3, "26": 3, "27": 3, "28": 3, "29": 4, "30": 3, "31": 3,
  "32": 3, "33": 3, "34": 3, "35": 4, "36": 4, "37": 4, "38": 4,
  "39": 4, "40": 3, "41": 3, "42": 3, "43": 3, "44": 4, "45": 4,
  "46": 4, "47": 4, "48": 5, "49": 5, "50": 3, "51": 3, "52": 4,
  "53": 4, "54": 4, "55": 4, "56": 4, "57": 4, "58": 5, "59": 5,
  "60": 3, "61": 3, "62": 4, "63": 4, "64": 4, "65": 4, "66": 5,
  "67": 5, "68": 5, "69": 5, "70": 3, "71": 3, "72": 3, "73": 3,
  "74": 3, "75": 4, "76": 4, "77": 3, "78": 4, "79": 5, "80": 2,
  "81": 3, "82": 3, "83": 4, "84": 3, "85": 4, "86": 4, "87": 5,
  "88": 5, "89": 5, "90": 4, "91": 4, "92": 4, "93": 4, "94": 5,
  "95": 5, "96": 5, "97": 5, "98": 6, "99": 6,
};

function getDeliveryDays(pin) {
  const prefix = pin.slice(0, 2);
  return DAYS_BY_PREFIX[prefix] || 5;
}

function addWorkingDays(n) {
  const d = new Date();
  let added = 0;
  while (added < n) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) added++;
  }
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

export default function PincodeChecker() {
  const [pincode, setPincode] = useState("");
  const [status, setStatus] = useState(null); // null | "loading" | "ok" | "no"
  const [result, setResult] = useState(null);

  const check = () => {
    if (!/^\d{6}$/.test(pincode)) return;
    setStatus("loading");
    setTimeout(() => {
      if (pincode[0] === "0") {
        setStatus("no");
        setResult(null);
      } else {
        const days = getDeliveryDays(pincode);
        setStatus("ok");
        setResult({ days, date: addWorkingDays(days) });
      }
    }, 700);
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
            if (status) { setStatus(null); setResult(null); }
          }}
          onKeyDown={(e) => e.key === "Enter" && check()}
          placeholder="Enter 6-digit pincode"
          className="flex-1 rounded-xl border border-ink/20 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/35 focus:border-pine-700 focus:outline-none focus:ring-2 focus:ring-pine-700/15 transition-all"
        />
        <button
          type="button"
          onClick={check}
          disabled={pincode.length !== 6 || status === "loading"}
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
            <p className="mt-0.5 text-emerald-700">
              <Truck className="mr-1 inline h-3.5 w-3.5" />
              Expected by <strong>{result.date}</strong>{" "}
              <span className="text-emerald-600">({result.days} working days)</span>
            </p>
            <p className="mt-1 text-xs text-emerald-600">✦ Free shipping on orders above ₹499</p>
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
    </div>
  );
}
