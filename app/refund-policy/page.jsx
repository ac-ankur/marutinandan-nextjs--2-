import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Camera,
  IndianRupee,
  Truck,
  ShieldAlert,
  Mail,
  MapPin,
  Phone,
  ChevronRight,
  Check,
  X,
  Clock,
  Package,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Refund, Return & Cancellation Policy — Yugika Foods Private Limited",
  description:
    "Refund, Return and Cancellation Policy of Yugika Foods Private Limited. Learn how cancellations, returns, and refunds work for our cold-pressed edible oils.",
  alternates: { canonical: "/refund-policy" },
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

export default function RefundPolicyPage() {
  return (
    <div className="bg-cream px-5 pb-28 pt-36 sm:px-6 lg:px-10 lg:pt-36">
      {/* ───── Hero Header ───── */}
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold-deep sm:text-sm font-semibold">
          Customer Care &amp; Guarantees
        </p>
        <h1 className="mt-4 font-display text-4xl leading-tight text-pine-900 sm:text-5xl lg:text-[3.25rem]">
          Refund, Return &amp; <span className="italic text-gold-deep">Cancellation</span>
        </h1>
        <p className="mt-4 text-sm text-ink/55 sm:text-base">
          Yugika Foods Private Limited · Last updated: 26 October 2026
        </p>
        <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-ink/10 bg-white/60 p-5 shadow-xs">
          <p className="text-[0.95rem] leading-relaxed text-ink/70">
            We want you to be completely happy with every bottle. Because our products are 100% pure cold-pressed edible oils, returns work differently from clothing or electronics. This policy explains exactly what we do, how we protect you, and how fast resolutions happen.
          </p>
        </div>
      </div>

      {/* ───── Content ───── */}
      <div className="mx-auto mt-16 max-w-3xl space-y-12 sm:mt-20">

        {/* ── 1. Summary ── */}
        <section className="space-y-4">
          <SectionHeading number={1} title="Summary" icon={CheckCircle2} />
          <div className="rounded-2xl border border-ink/10 bg-white/70 p-5 sm:p-6 shadow-xs">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-cream/70 border border-ink/5 p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-pine-900 font-semibold text-sm">
                  <Clock className="h-4 w-4 text-gold-deep" />
                  <span>Cancellations Before Dispatch</span>
                </div>
                <p className="text-xs text-ink/70 leading-relaxed">
                  Cancel any time before the order is handed to the courier for a full 100% refund.
                </p>
              </div>

              <div className="rounded-xl bg-cream/70 border border-ink/5 p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-pine-900 font-semibold text-sm">
                  <Package className="h-4 w-4 text-gold-deep" />
                  <span>Consumable Food Items</span>
                </div>
                <p className="text-xs text-ink/70 leading-relaxed">
                  For food hygiene and safety reasons, we cannot accept returns of opened, used, or unwanted items.
                </p>
              </div>

              <div className="rounded-xl bg-cream/70 border border-ink/5 p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-pine-900 font-semibold text-sm">
                  <AlertCircle className="h-4 w-4 text-gold-deep" />
                  <span>Damaged or Defective Delivery</span>
                </div>
                <p className="text-xs text-ink/70 leading-relaxed">
                  If an item arrives damaged, leaking, wrong, or expired, we will replace it or refund you in full. Report within 48 hours of delivery.
                </p>
              </div>

              <div className="rounded-xl bg-cream/70 border border-ink/5 p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-pine-900 font-semibold text-sm">
                  <IndianRupee className="h-4 w-4 text-gold-deep" />
                  <span>Swift Refund Settlement</span>
                </div>
                <p className="text-xs text-ink/70 leading-relaxed">
                  Approved refunds are sent directly back to your original payment method within 5 to 7 business banking days.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. Cancellation ── */}
        <section className="space-y-4">
          <SectionHeading number={2} title="Cancellation" icon={XCircle} />
          <div className="rounded-2xl border border-ink/10 bg-white/70 p-5 sm:p-6 space-y-5 shadow-xs">
            <div>
              <h3 className="font-display text-base font-bold text-pine-900">Before your order is shipped</h3>
              <Paragraph>
                You can easily cancel an order while it is still in processing status. The full amount paid by you, including any applicable shipping charges, will be refunded immediately. If a coupon code was applied, it is released back to your account where promotional terms permit.
              </Paragraph>
            </div>

            <div className="border-t border-ink/8 pt-4">
              <h3 className="font-display text-base font-bold text-pine-900">After your order is shipped</h3>
              <Paragraph>
                Once an order has been packaged and handed over to our delivery courier partner, it is in transit and cannot be cancelled online. If you need to refuse delivery, please contact us first at{" "}
                <a href="mailto:yugikafoods@gmail.com" className="font-medium text-pine-800 underline decoration-gold/40 hover:text-gold-deep transition-colors">
                  yugikafoods@gmail.com
                </a>{" "}
                so we can provide specific guidance. (Please see Section 6 regarding refused shipments).
              </Paragraph>
            </div>

            <div className="border-t border-ink/8 pt-4">
              <h3 className="font-display text-base font-bold text-pine-900">Unpaid orders</h3>
              <Paragraph>
                If payment is not completed during checkout, the order is temporarily reserved for a brief duration and then automatically cancelled, with all stock released back into inventory. No charges are applied to unpaid orders.
              </Paragraph>
            </div>
          </div>
        </section>

        {/* ── 3. Returns and replacements ── */}
        <section className="space-y-4">
          <SectionHeading number={3} title="Returns and Replacements" icon={RotateCcw} />
          <div className="rounded-2xl border border-ink/10 bg-white/70 p-5 sm:p-6 space-y-6 shadow-xs">
            
            {/* What we accept */}
            <div>
              <div className="flex items-center gap-2 mb-3 text-emerald-800 font-bold text-base">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
                <span>What We Accept for Replacement or Refund</span>
              </div>
              <ul className="space-y-2.5 pl-1">
                {[
                  "The bottle, can, jar, or tin arrived physically broken, cracked, or leaking.",
                  "You received an incorrect item or different size from what was ordered.",
                  "An item was missing from your parcel shipment.",
                  "The product is expired or presents an verified quality defect upon delivery.",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-[0.93rem] text-ink/75">
                    <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-600 stroke-[2.5]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What we do not accept */}
            <div className="border-t border-ink/8 pt-5">
              <div className="flex items-center gap-2 mb-3 text-amber-900 font-bold text-base">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                  <X className="h-3.5 w-3.5 stroke-[3]" />
                </div>
                <span>What We Do Not Accept</span>
              </div>
              <ul className="space-y-2.5 pl-1">
                {[
                  "Bottles or containers that have been opened, broken seal, or used, unless a verified manufacturing defect is established.",
                  "Change of mind after delivery, or personal taste/aroma preference. Authentic Kachi Ghani cold-pressed mustard oil possesses an inherently pungent aroma and strong natural profile; this pungency is an authentic hallmark of purity, not a defect.",
                  "Damage caused after successful delivery, such as exposure to direct sunlight, high heat, dropping, or improper home storage.",
                  "Issues or damage claims submitted after 48 hours from the time of carrier delivery.",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-[0.93rem] text-ink/75">
                    <X className="mt-1 h-3.5 w-3.5 shrink-0 text-rose-500 stroke-[2.5]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </section>

        {/* ── 4. How to report a problem ── */}
        <section className="space-y-4">
          <SectionHeading number={4} title="How to Report a Problem" icon={Camera} />
          <div className="rounded-2xl border border-ink/10 bg-white/70 p-5 sm:p-6 space-y-4 shadow-xs">
            <Paragraph>
              To ensure speedy processing of replacement bottles or refunds, please follow these four simple steps:
            </Paragraph>

            <div className="space-y-3.5">
              <div className="flex items-start gap-3 rounded-xl bg-cream/60 p-3.5 border border-ink/5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pine-900 text-cream text-xs font-bold">1</span>
                <p className="text-[0.93rem] text-ink/75">
                  <strong>Report within 48 hours:</strong> Email us at{" "}
                  <a href="mailto:yugikafoods@gmail.com" className="font-medium text-pine-800 underline decoration-gold/40 hover:text-gold-deep transition-colors">
                    yugikafoods@gmail.com
                  </a>{" "}
                  or call{" "}
                  <a href="tel:+919058704491" className="font-medium text-pine-800 hover:text-gold-deep transition-colors">
                    +91 9058704491
                  </a>{" "}
                  mentioning your <strong>Order Number</strong>.
                </p>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-cream/60 p-3.5 border border-ink/5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pine-900 text-cream text-xs font-bold">2</span>
                <p className="text-[0.93rem] text-ink/75">
                  <strong>Provide photo / video evidence:</strong> Attach clear photos of the product bottle, the label with batch number &amp; dates, the outer packaging, and the courier shipping label. For cases of leakage or missing items, an unboxing video is especially helpful.
                </p>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-cream/60 p-3.5 border border-ink/5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pine-900 text-cream text-xs font-bold">3</span>
                <p className="text-[0.93rem] text-ink/75">
                  <strong>Keep packaging intact:</strong> Please retain the item and original packaging until we confirm resolution; our logistics team may schedule a reverse pickup inspection.
                </p>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-cream/60 p-3.5 border border-ink/5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pine-900 text-cream text-xs font-bold">4</span>
                <p className="text-[0.93rem] text-ink/75">
                  <strong>Fast team review:</strong> Our quality and customer care team reviews every inquiry and replies with resolution details within <strong>2 business days</strong>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. Refunds ── */}
        <section className="space-y-4">
          <SectionHeading number={5} title="Refunds" icon={IndianRupee} />
          <div className="rounded-2xl border border-ink/10 bg-white/70 p-5 sm:p-6 space-y-5 shadow-xs">
            
            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-ink/10">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-pine-900 text-cream">
                    <th className="py-3 px-4 font-semibold">Situation</th>
                    <th className="py-3 px-4 font-semibold">What You Receive</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/8 text-[0.91rem] text-ink/75">
                  <tr className="bg-white">
                    <td className="py-3 px-4 font-medium text-pine-950">Cancelled before shipping</td>
                    <td className="py-3 px-4">Full 100% refund including shipping charges</td>
                  </tr>
                  <tr className="bg-cream/40">
                    <td className="py-3 px-4 font-medium text-pine-950">Damaged, wrong, missing, or defective item (approved)</td>
                    <td className="py-3 px-4">Free replacement delivered, or full refund including shipping if you prefer or if item is out of stock</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="py-3 px-4 font-medium text-pine-950">Order lost in transit or undelivered (RTO)</td>
                    <td className="py-3 px-4">Full refund or free reshipment (your choice)</td>
                  </tr>
                  <tr className="bg-cream/40">
                    <td className="py-3 px-4 font-medium text-pine-950">Failed payment where money was debited</td>
                    <td className="py-3 px-4">Automatic reversal by your bank or payment provider, normally within 5 to 7 business banking days</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <BulletList
              items={[
                "All refunds are credited exclusively to the original payment method used during checkout (Credit/Debit Card, UPI, Net Banking, or Wallet). For fraud prevention and compliance reasons, we cannot issue refunds to alternate accounts or third parties.",
                "Settlement Timeline: We approve and trigger refunds immediately upon validation. Your issuing bank or payment gateway typically takes 5 to 7 business days to reflect the credited amount into your account statement.",
                "You will receive an automated email notification with the payment reference ID when the refund is initiated. If the credit does not appear after 7 business days, reach out to your bank with the reference ID or email us so we can trace it.",
                "Coupons and promotional discounts are refunded in exact proportion to the net amount actually paid.",
              ]}
            />
          </div>
        </section>

        {/* ── 6. Refused or undelivered parcels ── */}
        <section className="space-y-4">
          <SectionHeading number={6} title="Refused or Undelivered Parcels" icon={Truck} />
          <div className="rounded-2xl border border-ink/10 bg-white/70 p-5 sm:p-6 space-y-3 shadow-xs">
            <Paragraph>
              If a parcel is refused at the doorstep without a valid documented reason, or if a shipment returns to us because an incomplete/incorrect shipping address was provided or no recipient was available after multiple courier delivery attempts, we will issue a refund for the product value once the package is received back at our facility. Return shipping and original courier freight charges may be deducted from the refund in such circumstances.
            </Paragraph>
          </div>
        </section>

        {/* ── 7. Our right to decline ── */}
        <section className="space-y-4">
          <SectionHeading number={7} title="Our Right to Decline" icon={ShieldAlert} />
          <div className="rounded-2xl border border-ink/10 bg-white/70 p-5 sm:p-6 space-y-3 shadow-xs">
            <Paragraph>
              Yugika Foods reserves the right to decline any cancellation, return, or refund claim that falls outside the boundaries of this policy, lacks the necessary photographic or video verification requested, or appears to involve intentional fraud or repeated policy abuse. In any such instance, we will provide a clear, transparent written explanation of our determination.
            </Paragraph>
          </div>
        </section>

        {/* ── 8. Contact us ── */}
        <section className="space-y-4">
          <SectionHeading number={8} title="Contact Us" icon={Mail} />
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
            <p className="border-t border-ink/8 pt-3 text-xs text-ink/60">
              For unresolved complaints or escalations, please refer to our designated Grievance Officer details in our{" "}
              <Link href="/terms-and-conditions" className="font-medium text-pine-800 underline decoration-gold/40 hover:text-gold-deep">
                Terms &amp; Conditions
              </Link>.
            </p>
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
