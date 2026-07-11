"use client";

import { useState } from "react";
import { variants, labFootnote, labLab } from "@/data/products";

const ROWS = [
  { key: "type", label: "Type" },
  { key: "moisture", label: "Moisture" },
  { key: "rancidity", label: "Rancidity" },
  { key: "saponification", label: "Saponification Value" },
  { key: "unsaponifiable", label: "Unsaponifiable Matter" },
  { key: "iodine", label: "Iodine Value" },
  { key: "acid", label: "Acid Value" },
  { key: "mineralOil", label: "Mineral Oil" },
  { key: "argemone", label: "Argemone Oil" },
  { key: "refractiveIndex", label: "Refractive Index at 40°C" },
  { key: "peroxide", label: "Peroxide Value" },
  { key: "hcn", label: "Test for Hydrocyanic Acid" },
  { key: "syntheticColours", label: "Synthetic Colours" },
  { key: "allylIsothiocyanate", label: "Allyl Isothiocyanate (Pungency)" },
  { key: "eColi", label: "E. coli" },
  { key: "salmonella", label: "Salmonella sp." },
  { key: "aerobicCount", label: "Aerobic Mesophilic Count" },
];

export default function LabReportTable({ compact = false }) {
  const [active, setActive] = useState("black");
  const data = variants[active];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        {!compact && (
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold-light">🧪 Lab Verified</p>
            <h2 className="mt-3 font-display text-4xl text-cream sm:text-5xl">
              Purity, <span className="italic text-gold-light">quantified.</span>
            </h2>
            <p className="mt-3 max-w-xl text-sm text-cream/60">
              Independently tested and certified by {labLab}. The values below apply to all pack sizes
              of this variant.
            </p>
          </div>
        )}
        <div className="flex rounded-full bg-pine-950/50 p-1.5">
          {Object.values(variants).map((v) => (
            <button
              key={v.key}
              onClick={() => setActive(v.key)}
              data-cursor-hover
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                active === v.key ? "bg-gold text-pine-950" : "text-cream/70 hover:text-cream"
              }`}
            >
              {v.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-cream/10">
        <table className="w-full min-w-[560px] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-pine-950/40 text-xs uppercase tracking-[0.15em] text-gold-light">
              <th className="px-6 py-4 font-medium">Parameter</th>
              <th className="px-6 py-4 font-medium">Result</th>
              <th className="px-6 py-4 font-medium">FSSAI Std.</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr
                key={row.key}
                className={`border-t border-cream/10 ${i % 2 === 0 ? "bg-pine-900/40" : "bg-pine-900/20"}`}
              >
                <td className="px-6 py-4 font-medium text-cream">{row.label}</td>
                <td className="px-6 py-4 text-gold-light">{data.lab[row.key].result}</td>
                <td className="px-6 py-4 text-cream/60">{data.lab[row.key].std}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-cream/40">{labFootnote}</p>
    </div>
  );
}
