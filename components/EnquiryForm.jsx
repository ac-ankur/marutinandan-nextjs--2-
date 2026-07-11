"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
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
      message: form.message.value,
      honeypot: form.company_website.value,
    };

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Something went wrong");
      setStatus("success");
      form.reset();
      requestAnimationFrame(() => {
        if (successRef.current) {
          gsap.fromTo(successRef.current, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" });
        }
      });
    } catch (err) {
      setStatus("error");
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl bg-cream-paper p-8 shadow-[0_30px_80px_-40px_rgba(21,56,38,0.35)] lg:p-10">
      {/* honeypot field, hidden from real users */}
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="hidden" />

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Name" required>
          <input name="name" required placeholder="Your full name" className="form-input" />
        </Field>
        <Field label="Phone" required>
          <input name="phone" required placeholder="+91 XXXXX XXXXX" className="form-input" />
        </Field>
      </div>

      <div className="mt-6">
        <Field label="Email">
          <input type="email" name="email" placeholder="you@email.com" className="form-input" />
        </Field>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <Field label="Product">
          <select name="product" defaultValue={defaultProduct} className="form-input">
            <option value="">Select a product</option>
            {getAllProducts().map((p) => (
              <option key={p.slug} value={`${p.variantData.name} · ${p.size} ${p.stockUnit}`}>
                {p.variant === "black" ? "Black" : "Yellow"} Mustard Oil · {p.size} {p.stockUnit}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Quantity">
          <input name="quantity" placeholder="e.g. 5 packs / month" className="form-input" />
        </Field>
      </div>

      <div className="mt-6">
        <Field label="Message">
          <textarea
            name="message"
            rows={4}
            placeholder="Delivery address / bulk requirement / any notes"
            className="form-input resize-none"
          />
        </Field>
      </div>

      <div className="mt-6 flex flex-col-reverse items-center gap-4 sm:flex-row sm:justify-between">
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
        <p ref={successRef} className="mt-5 rounded-xl bg-pine-800/10 px-4 py-3 text-sm text-pine-800">
          Thank you — we&apos;ve received your enquiry and will reach out shortly.
        </p>
      )}
      {status === "error" && (
        <p className="mt-5 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-700">{error}</p>
      )}
    </form>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-ink/80">
        {label} {required && <span className="text-gold-deep">*</span>}
      </span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}
