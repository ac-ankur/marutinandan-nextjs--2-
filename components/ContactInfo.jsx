"use client";

import { MapPin, Phone, Mail, Globe } from "lucide-react";

function WhatsAppIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.67-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.572-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.461c-1.926 0-3.704-.52-5.234-1.423l-.375-.222-3.889 1.02.104-3.79-.247-.393a9.92 9.92 0 0 1-1.523-5.293c0-5.485 4.463-9.948 9.948-9.948 5.483 0 9.946 4.463 9.946 9.948 0 5.484-4.463 9.947-9.946 9.947m0-21.728C5.834.115.115 5.834.115 12.87c0 2.25.586 4.444 1.7 6.375L0 25.741l6.671-1.751a12.7 12.7 0 0 0 6.1 1.554h.005c7.037 0 12.756-5.719 12.756-12.756 0-3.408-1.328-6.611-3.738-9.022A12.68 12.68 0 0 0 12.051.115" />
    </svg>
  );
}

export default function ContactInfo() {
  return (
    <div className="space-y-3 sm:space-y-4">
      <Row
        icon={<MapPin size={20} strokeWidth={2} />}
        value={
          <>
            Yugika Foods Private Limited<br/>
            Khasra No. 498, Ganeshdham Colony<br/>
            Mudi Jahangeerpuri, Etmadpur<br/>
            Agra – 283202, UP, India
          </>
        }
      />
      <Row
        icon={<Phone size={20} strokeWidth={2} />}
        value={
          <div className="flex flex-col gap-2">
            <span className="font-medium text-pine-900">+91 90587 04492</span>
            <a
              href="https://wa.me/919828407444"
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#25D366] px-3.5 py-1.5 text-xs font-bold text-pine-950 shadow-sm transition-all duration-200 hover:scale-105 hover:bg-[#20ba5a] hover:shadow-md"
              aria-label="Message +91 98284 07444 on WhatsApp"
            >
              <WhatsAppIcon className="h-4 w-4 fill-current text-pine-950" />
              <span>WhatsApp: +91 98284 07444</span>
            </a>
          </div>
        }
        compact
      />
      <Row icon={<Mail size={20} strokeWidth={2} />} 
      // label="Email"
       value="yugikafoods@gmail.com" compact />
      <Row icon={<Globe size={20} strokeWidth={2} />}
      //  label="Website" 
      value="www.yugikafoods.com" compact />
    </div>
  );
}

function Row({ icon, label, value, compact = false }) {
  return (
    <div className={`flex items-start gap-3 rounded-2xl bg-cream-paper px-4 sm:px-5 sm:gap-4 ${compact ? "py-3 sm:py-3.5" : "py-3.5 sm:py-4"}`}>
      <span className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-pine-800 text-cream mt-0.5">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        {label && <p className="text-xs uppercase tracking-[0.15em] text-ink/50">{label}</p>}
        {typeof value === "string" ? (
          <p className="font-medium text-pine-900 text-sm sm:text-base break-all">{value}</p>
        ) : (
          <div className="text-sm sm:text-base">{value}</div>
        )}
      </div>
    </div>
  );
}
