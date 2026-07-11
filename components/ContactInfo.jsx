"use client";

import { useBrand } from "./BrandProvider";

export default function ContactInfo() {
  const { brand } = useBrand();

  return (
    <div className="space-y-4">
      <Row icon="📞" label="Call / WhatsApp" value={`${brand.name} Sales`} />
      <Row icon="✉️" label="Email" value={`orders@${brand.name.toLowerCase()}.in`} />
      <Row icon="📍" label="Origin" value="Made in India · FSSAI Compliant" />
    </div>
  );
}

function Row({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-cream-paper px-5 py-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pine-800 text-cream">
        {icon}
      </span>
      <div>
        <p className="text-xs uppercase tracking-[0.15em] text-ink/50">{label}</p>
        <p className="font-medium text-pine-900">{value}</p>
      </div>
    </div>
  );
}
