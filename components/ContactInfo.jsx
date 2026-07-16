"use client";


export default function ContactInfo() {
  return (
    <div className="space-y-4">
      <Row
        icon="📍"
        label="Address"
        value={
          <>
            Yugika Foods Private Limited<br/>
            Khasra No. 498, Ganeshdham Colony<br/>
            Mudi Jahangeerpuri, Etmadpur<br/>
            Agra – 282005, UP, India
          </>
        }
      />
      <Row icon="📞" label="Phone" value="+91 90587 04492" />
      <Row icon="✉️" label="Email" value="yugikafoods@gmail.com" />
      <Row icon="🌐" label="Website" value="www.yugikafoods.com" />
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