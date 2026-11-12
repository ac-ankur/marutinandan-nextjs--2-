import {
  MapPin,
  Clock,
  Truck,
  Search,
  AlertTriangle,
  PackageCheck,
  Mail,
  Phone,
  Calendar,
  Globe,
  IndianRupee,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Shipping & Delivery Policy — Yugika Foods Private Limited",
  description:
    "Shipping and Delivery Policy of Yugika Foods Private Limited. Learn how orders are processed, dispatch timelines, shipping rates, and delivery across India.",
  alternates: { canonical: "/shipping-policy" },
};

function SectionHeading({ number, title, icon: Icon }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pine-900 text-cream shadow-sm">
        {Icon ? <Icon className="h-4.5 w-4.5" /> : <span className="text-sm font-bold">{number}</span>}
      </div>
      <h2 className="font-display text-2xl font-bold text-pine-900 sm:text-[1.65rem] leading-snug">
        {number}. {title}
      </h2>
    </div>
  );
}

function Paragraph({ children }) {
  return <p className="text-[0.94rem] leading-relaxed text-ink/75">{children}</p>;
}

function BulletList({ items }) {
  return (
    <ul className="space-y-2.5 pl-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-[0.94rem] leading-relaxed text-ink/75">
          <ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-gold-deep" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ShippingPolicyPage() {
  return (
    <div className="bg-cream px-5 pb-28 pt-36 sm:px-6 lg:px-10 lg:pt-36">
      {/* ───── Hero Header ───── */}
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold-deep sm:text-sm font-semibold">
          Logistics &amp; Fulfillment
        </p>
        <h1 className="mt-4 font-display text-4xl leading-tight text-pine-900 sm:text-5xl lg:text-[3.25rem]">
          Shipping &amp; <span className="italic text-gold-deep">Delivery</span>
        </h1>
        <p className="mt-4 text-sm text-ink/55 sm:text-base">
          Yugika Foods Private Limited · Last updated: 26 October 2026
        </p>
        <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-ink/10 bg-white/60 p-5 shadow-xs">
          <p className="text-[0.95rem] leading-relaxed text-ink/70">
            How and when your Yugika Foods order reaches you. We carefully bottle, seal, and cushion every batch of our cold-pressed mustard oil so it arrives fresh and safe at your doorstep.
          </p>
        </div>
      </div>

      {/* ───── Key Highlights Bar ───── */}
      <div className="mx-auto mt-10 max-w-3xl">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          <div className="rounded-2xl border border-ink/10 bg-white/70 p-4 text-center shadow-xs">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-pine-900/10 text-pine-900">
              <Truck className="h-5 w-5 text-pine-900" />
            </div>
            <p className="mt-2 text-xs font-semibold text-pine-900 uppercase tracking-wider">Free Shipping</p>
            <p className="text-xs text-ink/65 mt-0.5">On all orders above ₹5,000</p>
          </div>

          <div className="rounded-2xl border border-ink/10 bg-white/70 p-4 text-center shadow-xs">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-pine-900/10 text-pine-900">
              <Clock className="h-5 w-5 text-pine-900" />
            </div>
            <p className="mt-2 text-xs font-semibold text-pine-900 uppercase tracking-wider">Quick Dispatch</p>
            <p className="text-xs text-ink/65 mt-0.5">Packed in 1–2 business days</p>
          </div>

          <div className="rounded-2xl border border-ink/10 bg-white/70 p-4 text-center shadow-xs">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-pine-900/10 text-pine-900">
              <ShieldCheck className="h-5 w-5 text-pine-900" />
            </div>
            <p className="mt-2 text-xs font-semibold text-pine-900 uppercase tracking-wider">Secure Packaging</p>
            <p className="text-xs text-ink/65 mt-0.5">Leak-proof oil protection</p>
          </div>
        </div>
      </div>

      {/* ───── Sections Content ───── */}
      <div className="mx-auto mt-14 max-w-3xl space-y-12 sm:mt-16">

        {/* ── 1. Where we deliver ── */}
        <section className="space-y-4">
          <SectionHeading number={1} title="Where We Deliver" icon={Globe} />
          <div className="rounded-2xl border border-ink/10 bg-white/70 p-5 sm:p-6 space-y-3 shadow-xs">
            <Paragraph>
              We ship across India to all pin codes serviceable by our verified express courier partners (including surface and air logistics networks).
            </Paragraph>
            <BulletList
              items={[
                "During checkout, entering your delivery pin code instantly validates carrier coverage in real-time.",
                "If our courier partners are unable to service your address for any logistical reason, our customer care team will notify you promptly and issue a 100% refund of any amount paid.",
                "Domestic Only: We currently fulfill domestic retail orders within India only. For international export enquiries, please contact us through our export desk.",
              ]}
            />
          </div>
        </section>

        {/* ── 2. Processing and delivery time ── */}
        <section className="space-y-4">
          <SectionHeading number={2} title="Processing and Delivery Time" icon={Clock} />
          <div className="rounded-2xl border border-ink/10 bg-white/70 p-5 sm:p-6 space-y-5 shadow-xs">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-cream/70 p-4 border border-ink/5 space-y-1">
                <span className="text-xs uppercase tracking-wider text-gold-deep font-bold">Step 1: Order Processing</span>
                <p className="text-sm font-semibold text-pine-900">1 to 2 Business Days</p>
                <p className="text-xs text-ink/70 leading-relaxed pt-1">
                  Orders are inspected, cushioned, and handed to the courier partner within 24–48 hours of payment confirmation (excluding Sundays and national holidays).
                </p>
              </div>

              <div className="rounded-xl bg-cream/70 p-4 border border-ink/5 space-y-1">
                <span className="text-xs uppercase tracking-wider text-gold-deep font-bold">Step 2: Transit &amp; Delivery</span>
                <p className="text-sm font-semibold text-pine-900">3 to 7 Business Days</p>
                <p className="text-xs text-ink/70 leading-relaxed pt-1">
                  Typical transit timeline following dispatch. Metro cities and central hubs receive priority delivery, while remote regions or hilly areas may require slightly longer.
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-amber-50/70 border border-amber-200/60 p-4 text-[0.88rem] text-amber-900 leading-relaxed">
              <strong>Please Note:</strong> Delivery timelines are realistic operational estimates, not absolute contractual guarantees. External disruptions such as severe inclement weather, road transport strikes, state border checks, festive peak seasons, or courier congestion may occasionally cause transit delays beyond our control.
            </div>
          </div>
        </section>

        {/* ── 3. Shipping charges ── */}
        <section className="space-y-4">
          <SectionHeading number={3} title="Shipping Charges" icon={IndianRupee} />
          <div className="rounded-2xl border border-ink/10 bg-white/70 p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
              <p className="text-emerald-900 font-semibold text-sm">
                🎉 Free Standard Shipping on all orders of ₹5,000 and above!
              </p>
            </div>
            <BulletList
              items={[
                "For cart orders under ₹5,000, shipping charges are calculated transparently based on total consignment weight, volumetric dimensions, and destination pin code tier.",
                "The exact shipping fee is computed and clearly displayed on the checkout page before you make any payment.",
                "Zero Hidden Costs: There are no hidden handling, packaging, or fuel surcharge fees added at any point.",
              ]}
            />
          </div>
        </section>

        {/* ── 4. Tracking ── */}
        <section className="space-y-4">
          <SectionHeading number={4} title="Tracking Your Order" icon={Search} />
          <div className="rounded-2xl border border-ink/10 bg-white/70 p-5 sm:p-6 space-y-4 shadow-xs">
            <Paragraph>
              As soon as your shipment is dispatched from our fulfillment center, we send an automated dispatch confirmation via email and SMS containing:
            </Paragraph>
            <BulletList
              items={[
                "Courier partner name (e.g. Delhivery, Blue Dart, DTDC, etc.)",
                "Consignment Tracking / Airway Bill (AWB) number",
                "Direct tracking link to follow your parcel's live transit milestones in real time",
              ]}
            />
            <Paragraph>
              You can also check real-time progress anytime by logging into your account under <strong>My Account &gt; Orders</strong>.
            </Paragraph>
          </div>
        </section>

        {/* ── 5. Delivery attempts and address errors ── */}
        <section className="space-y-4">
          <SectionHeading number={5} title="Delivery Attempts &amp; Address Errors" icon={AlertTriangle} />
          <div className="rounded-2xl border border-ink/10 bg-white/70 p-5 sm:p-6 space-y-4 shadow-xs">
            <BulletList
              items={[
                "Please verify that you provide a complete, valid shipping address (including house/flat number, street, landmark, city, state, and correct 6-digit pin code) along with an active phone number accessible on delivery day.",
                "Our courier partners typically make up to 2–3 delivery attempts before classifying a parcel as undeliverable. If a delivery cannot be concluded due to an incorrect address or non-availability of recipient, the parcel is marked for Return to Origin (RTO).",
                "Address Changes: Once an order has been manifested and handed to the courier, the delivery address cannot be modified or re-routed mid-transit.",
                "Parcels returned to us due to address errors or recipient refusal are handled in accordance with our Refund & Return Policy.",
              ]}
            />
          </div>
        </section>

        {/* ── 6. Receiving your parcel ── */}
        <section className="space-y-4">
          <SectionHeading number={6} title="Receiving Your Parcel" icon={PackageCheck} />
          <div className="rounded-2xl border border-ink/10 bg-white/70 p-5 sm:p-6 space-y-4 shadow-xs">
            <Paragraph>
              Edible oils require careful handling during transport. Please follow these precautions when accepting delivery:
            </Paragraph>
            <BulletList
              items={[
                "Inspect the external carton before signing or giving OTP: Ensure the security tape and box are intact and undamaged.",
                "If the package is visibly squashed, opened, torn, or shows signs of oil leakage, please immediately point it out to the delivery executive and take photos/video of the parcel before receiving.",
                "In case of any transit damage or leaking bottle, please notify our customer care team within 48 hours of delivery with photo proof as described in our Refund & Return Policy for an immediate free replacement or refund.",
              ]}
            />
          </div>
        </section>

        {/* ── 7. Contact us ── */}
        <section className="space-y-4">
          <SectionHeading number={7} title="Contact Us" icon={Mail} />
          <div className="rounded-2xl border border-ink/10 bg-white/70 p-5 sm:p-6 space-y-4 shadow-xs">
            <h3 className="font-display text-lg font-bold text-pine-900">
              Yugika Foods Private Limited
            </h3>
            <div className="space-y-3 text-[0.94rem] text-ink/75">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" />
                <span>Khasra No. 498, Ganeshdham Colony Mudi Jahangeerpuri, Etmadpur, Agra – 283202, UP, India</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-gold-deep" />
                <a href="mailto:yugikafoods@gmail.com" className="font-medium text-pine-800 underline decoration-gold/40 hover:text-gold-deep transition-colors">
                  yugikafoods@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-gold-deep" />
                <span>
                  <a href="tel:+919058704491" className="font-medium text-pine-800 hover:text-gold-deep transition-colors">+91 9058704491</a>
                  <span className="text-ink/45 text-xs ml-2">(Monday to Friday, 10:00 AM to 6:00 PM IST)</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer Navigation Buttons ── */}
        <div className="border-t border-ink/10 pt-10 flex flex-wrap items-center justify-center gap-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-pine-900 px-6 py-3 text-sm font-semibold text-cream shadow-sm transition-all hover:bg-pine-800 hover:scale-[1.02] active:scale-[0.98]"
          >
            Back to Home
          </Link>
          <Link
            href="/refund-policy"
            className="inline-flex items-center gap-2 rounded-2xl border border-ink/15 bg-white px-6 py-3 text-sm font-semibold text-pine-900 shadow-sm transition-all hover:bg-cream hover:scale-[1.02] active:scale-[0.98]"
          >
            Refund &amp; Returns
          </Link>
          <Link
            href="/terms-and-conditions"
            className="inline-flex items-center gap-2 rounded-2xl border border-ink/15 bg-white px-6 py-3 text-sm font-semibold text-pine-900 shadow-sm transition-all hover:bg-cream hover:scale-[1.02] active:scale-[0.98]"
          >
            Terms &amp; Conditions
          </Link>
          <Link
            href="/privacy-policy"
            className="inline-flex items-center gap-2 rounded-2xl border border-ink/15 bg-white px-6 py-3 text-sm font-semibold text-pine-900 shadow-sm transition-all hover:bg-cream hover:scale-[1.02] active:scale-[0.98]"
          >
            Privacy Policy
          </Link>
        </div>

      </div>
    </div>
  );
}
