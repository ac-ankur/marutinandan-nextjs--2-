"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { CheckCircle2, Mail, MapPin, Package, Phone, Send, UserRound, X } from "lucide-react";
import { getAllProducts } from "@/data/products";

export default function EnquiryForm({ defaultProduct = "" }) {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState("");
  const successRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const form = e.target;
    const payload = {
      name: form.name.value,
      phone: form.phone.value,
      email: form.email.value,
      product: form.product.value,
      quantity: form.quantity.value,
      deliveryAddress: form.delivery_address.value,
      message: form.message.value,
      honeypot: form.company_website.value,
    };

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Unable to submit the enquiry.");
      setStatus("success");
      form.reset();
      requestAnimationFrame(() => {
        if (successRef.current) {
          gsap.fromTo(successRef.current, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" });
        }
      });
    } catch (err) {
      setStatus("error");
      console.error("Unable to submit enquiry:", err);
      setError("We couldn't send your enquiry right now. Please try again in a moment or contact us on WhatsApp.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl bg-cream-paper p-5 shadow-[0_30px_80px_-40px_rgba(21,56,38,0.35)] sm:p-7 lg:p-8">
      {/* honeypot field, hidden from real users */}
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="hidden" />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" required icon={<UserRound className="h-4 w-4" />}>
          <input name="name" required placeholder="Your full name" className="form-input" />
        </Field>
        <Field label="Phone" required icon={<Phone className="h-4 w-4" />}>
          <input name="phone" required placeholder="+91 XXXXX XXXXX" className="form-input" />
        </Field>
      </div>

      <div className="mt-5">
        <Field label="Email" icon={<Mail className="h-4 w-4" />}>
          <input type="email" name="email" placeholder="you@email.com" className="form-input" />
        </Field>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Field label="Product" icon={<Package className="h-4 w-4" />}>
          <select name="product" defaultValue={defaultProduct} className="form-input">
            <option value="">Select a product</option>
            {getAllProducts().map((p) => (
              <option key={p.slug} value={`${p.variantData.name} · ${p.size} ${p.stockUnit}`}>
                {p.variant === "black" ? "Black" : "Yellow"} Mustard Oil · {p.size} {p.stockUnit}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Quantity" icon={<Package className="h-4 w-4" />}>
          <input name="quantity" placeholder="e.g. 5 packs / month" className="form-input" />
        </Field>
      </div>

      <div className="mt-5">
        <Field label="Delivery address" icon={<MapPin className="h-4 w-4" />}>
          <textarea
            name="delivery_address"
            rows={2}
            placeholder="House / street / city / PIN code"
            className="form-input resize-none"
          />
        </Field>
      </div>

      <div className="mt-5">
        <Field label="Message" icon={<Send className="h-4 w-4" />}>
          <textarea
            name="message"
            rows={2}
            placeholder="Bulk requirement or any notes"
            className="form-input resize-none"
          />
        </Field>
      </div>

      <div className="mt-5 flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-xs text-ink/50">We respect your privacy. No spam, ever.</p>
        <button
          type="submit"
          disabled={status === "loading"}
          data-cursor-hover
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-pine-800 px-7 py-3.5 text-sm font-medium text-cream transition-transform hover:scale-[1.02] disabled:opacity-60 sm:w-auto"
        >
          {status === "loading" ? "Sending…" : "Send Enquiry"} <span>→</span>
        </button>
      </div>

      {status === "success" && (
        <div
          ref={successRef}
          role="status"
          aria-live="polite"
          className="fixed inset-x-4 top-28 z-[60] mx-auto flex max-w-lg items-center gap-3 rounded-2xl border border-pine-700/20 bg-pine-800 px-4 py-4 text-cream shadow-[0_20px_60px_-20px_rgba(21,56,38,0.6)] sm:inset-x-auto sm:right-6 sm:top-32 sm:w-[32rem] sm:px-5"
        >
          <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-gold-light" aria-hidden="true" />
          <p className="flex-1 text-sm font-medium leading-relaxed">
            Thank you! Your enquiry has been received. We&apos;ll reach out shortly.
          </p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="rounded-full p-1 text-cream/75 transition-colors hover:bg-white/10 hover:text-cream"
            aria-label="Dismiss confirmation"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      )}

      {status === "error" && (
        <p className="mt-5 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-700">{error}</p>
      )}
    </form>
  );
}

function Field({ label, required, icon, children }) {
  return (
    <label className="block text-sm">
      <span className="flex items-center gap-2 font-medium text-ink/80">
        {icon && <span className="text-pine-800">{icon}</span>}
        {label} {required && <span className="text-gold-deep">*</span>}
      </span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}
