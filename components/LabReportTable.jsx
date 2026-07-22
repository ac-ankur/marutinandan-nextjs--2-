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

export default function LabReportTable({ compact = false, variant = "dark" }) {
  const isLight = variant === "light";
  const tone = isLight
    ? {
        tabTrack: "bg-pine-900/8", tabIdle: "text-pine-900/65 hover:text-pine-900", tabActive: "bg-pine-800 text-cream shadow-sm",
        table: "border-pine-900/15", head: "bg-cream-deep/65 text-gold-deep", rowEven: "bg-cream-paper", rowOdd: "bg-cream-deep/35",
        border: "border-pine-900/10", label: "text-pine-900", result: "text-gold-deep", standard: "text-ink/65", note: "text-ink/50",
      }
    : {
        tabTrack: "bg-pine-950/50", tabIdle: "text-cream/70 hover:text-cream", tabActive: "bg-gold text-pine-950",
        table: "border-cream/10", head: "bg-pine-950/40 text-gold-light", rowEven: "bg-pine-900/40", rowOdd: "bg-pine-900/20",
        border: "border-cream/10", label: "text-cream", result: "text-gold-light", standard: "text-cream/60", note: "text-cream/40",
      };
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
        <div className={`flex rounded-full p-1.5 ${tone.tabTrack}`}>
          {Object.values(variants).map((v) => (
            <button
              key={v.key}
              onClick={() => setActive(v.key)}
              data-cursor-hover
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                active === v.key ? tone.tabActive : tone.tabIdle
              }`}
            >
              {v.name}
            </button>
          ))}
        </div>
      </div>

      <div className={`mt-8 overflow-x-auto rounded-2xl border ${tone.table}`}>
        <table className="w-full min-w-[560px] border-collapse text-left text-sm">
          <thead>
            <tr className={`text-xs uppercase tracking-[0.15em] ${tone.head}`}>
              <th className="px-6 py-4 font-medium">Parameter</th>
              <th className="px-6 py-4 font-medium">Result</th>
              <th className="px-6 py-4 font-medium">FSSAI Std.</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr
                key={row.key}
                className={`border-t ${tone.border} ${i % 2 === 0 ? tone.rowEven : tone.rowOdd}`}
              >
                <td className={`px-6 py-4 font-medium ${tone.label}`}>{row.label}</td>
                <td className={`px-6 py-4 ${tone.result}`}>{data.lab[row.key].result}</td>
                <td className={`px-6 py-4 ${tone.standard}`}>{data.lab[row.key].std}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className={`mt-4 text-xs leading-relaxed ${tone.note}`}>{labFootnote}</p>
    </div>
  );
}
