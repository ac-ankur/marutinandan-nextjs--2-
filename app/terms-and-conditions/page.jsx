import {
  Building2,
  UserCheck,
  Droplets,
  ReceiptIndianRupee,
  ShoppingBag,
  CreditCard,
  Truck,
  Star,
  ShieldAlert,
  FileCheck,
  Scale,
  CloudLightning,
  Shield,
  RefreshCw,
  Gavel,
  Mail,
  MapPin,
  Phone,
  ChevronRight,
  Clock,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Terms & Conditions — Yugika Foods Private Limited",
  description:
    "Terms and Conditions governing the use of yugikafoods.com and purchases from Yugika Foods Private Limited.",
  alternates: { canonical: "/terms-and-conditions" },
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

export default function TermsAndConditionsPage() {
  return (
    <div className="bg-cream px-5 pb-28 pt-36 sm:px-6 lg:px-10 lg:pt-36">
      {/* ───── Hero Header ───── */}
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold-deep sm:text-sm font-semibold">Legal & Policies</p>
        <h1 className="mt-4 font-display text-4xl leading-tight text-pine-900 sm:text-5xl lg:text-[3.25rem]">
          Terms &amp; <span className="italic text-gold-deep">Conditions</span>
        </h1>
        <p className="mt-4 text-sm text-ink/55 sm:text-base">
          Yugika Foods Private Limited · Last updated: 26 October 2026
        </p>
        <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-ink/10 bg-white/60 p-5 shadow-xs">
          <p className="text-[0.94rem] leading-relaxed text-ink/70">
            These terms govern your use of{" "}
            <a
              href="https://yugikafoods.com"
              className="font-medium text-pine-800 underline decoration-gold/40 underline-offset-2 hover:text-gold-deep transition-colors"
            >
              https://yugikafoods.com
            </a>{" "}
            (the &ldquo;Site&rdquo;) and any purchase from <strong>Yugika Foods Private Limited</strong> (&ldquo;Yugika Foods&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). By using the Site or placing an order you agree to them. If you do not agree, please do not use the Site.
          </p>
        </div>
      </div>

      {/* ───── Sections Content ───── */}
      <div className="mx-auto mt-16 max-w-3xl space-y-12 sm:mt-20">

        {/* ── 1. About Us ── */}
        <section className="space-y-4">
          <SectionHeading number={1} title="About Us" icon={Building2} />
          <div className="rounded-2xl border border-ink/10 bg-white/70 p-5 sm:p-6 space-y-4 shadow-xs">
            <Paragraph>
              <strong>Yugika Foods Private Limited</strong> is an Indian private limited company engaged in manufacturing, packing, and marketing cold-pressed edible oils.
            </Paragraph>
            <div className="grid gap-3 pt-2 text-[0.92rem] text-ink/80 sm:grid-cols-2">
              <div className="rounded-xl bg-cream/70 p-3.5 border border-ink/5">
                <span className="block text-xs uppercase tracking-wider text-ink/50 font-medium">Registered Address</span>
                <span className="font-medium text-pine-900 mt-1 block">
                  Khasra No. 498, Ganeshdham Colony Mudi Jahangeerpuri, Etmadpur, Agra – 283202, UP, India
                </span>
              </div>
              <div className="space-y-2.5">
                <div className="rounded-xl bg-cream/70 p-3 border border-ink/5 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-ink/50 font-medium">GSTIN</span>
                  <span className="font-mono font-semibold text-pine-900 text-xs sm:text-sm">09AABCY7972R1Z5</span>
                </div>
                <div className="rounded-xl bg-cream/70 p-3 border border-ink/5 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-ink/50 font-medium">FSSAI Licence</span>
                  <span className="font-mono font-semibold text-pine-900 text-xs sm:text-sm">12726001000303</span>
                </div>
              </div>
            </div>
            <div className="pt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink/70">
              <div>
                Email:{" "}
                <a href="mailto:yugikafoods@gmail.com" className="font-medium text-pine-800 underline decoration-gold/40 hover:text-gold-deep transition-colors">
                  yugikafoods@gmail.com
                </a>
              </div>
              <div>
                Phone:{" "}
                <a href="tel:+919058704491" className="font-medium text-pine-800 hover:text-gold-deep transition-colors">
                  +91 9058704491
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. Eligibility and your account ── */}
        <section className="space-y-4">
          <SectionHeading number={2} title="Eligibility and Your Account" icon={UserCheck} />
          <div className="rounded-2xl border border-ink/10 bg-white/70 p-5 sm:p-6 space-y-4 shadow-xs">
            <BulletList
              items={[
                "You must be 18 years of age or older and legally capable of entering into a binding contract under Indian law to place an order.",
                "You agree to provide accurate, true, and complete information and maintain the confidentiality of your account credentials and password.",
                "You are responsible for all activities that occur under your account. You must notify us immediately if you suspect unauthorized access or any security breach.",
                "We reserve the right to suspend or terminate accounts that are suspected of fraudulent activity, abuse, or violation of these terms.",
              ]}
            />
          </div>
        </section>

        {/* ── 3. Products ── */}
        <section className="space-y-4">
          <SectionHeading number={3} title="Products" icon={Droplets} />
          <div className="rounded-2xl border border-ink/10 bg-white/70 p-5 sm:p-6 space-y-4 shadow-xs">
            <BulletList
              items={[
                "We manufacture and sell premium cold-pressed edible oils pressed using traditional Kachi Ghani methods. Product photographs, descriptions, colour tone, and natural aroma are indicative; because natural mustard seeds and organic produce vary across harvests, subtle batch-to-batch variations are natural and expected.",
                "Mustard oil possesses a natural, characteristic pungency and aroma. Please store sealed products in a cool, dark, dry place away from direct sunlight, and consume before the 'Best Before' date printed on the packaging.",
                "Net quantity, volume, batch numbers, nutritional metrics, manufacturing dates, and ingredients are as declared on the product label. Please read the label carefully before consumption, especially if you have known food sensitivities or allergies.",
                "Content published on our Site (including blogs, nutritional notes, and recipe recommendations) is for general information and culinary educational purposes only; it does not constitute medical, health, or dietary advice.",
              ]}
            />
          </div>
        </section>

        {/* ── 4. Prices and taxes ── */}
        <section className="space-y-4">
          <SectionHeading number={4} title="Prices and Taxes" icon={ReceiptIndianRupee} />
          <div className="rounded-2xl border border-ink/10 bg-white/70 p-5 sm:p-6 space-y-4 shadow-xs">
            <BulletList
              items={[
                "All prices quoted on the Site are in Indian Rupees (INR) and are inclusive of Goods and Services Tax (GST) unless explicitly specified otherwise. The itemized tax breakdown is clearly displayed on your final invoice.",
                "Applicable shipping or delivery fees, if any, are clearly calculated and presented at checkout before you authorize payment.",
                "Product prices and inventory availability are subject to change without prior notice. The price charged is the price verified on our servers at the moment your order is placed. In the rare event of a typographical or server pricing error, we reserve the right to cancel the affected order and issue a full refund.",
                "Promotional coupons, seasonal discounts, and vouchers are governed by their respective terms (validity periods, minimum order amounts, maximum caps, and single-use limits). Coupons cannot be converted into cash, transferred, or exchanged. We reserve the right to revoke coupons used in bad faith.",
              ]}
            />
          </div>
        </section>

        {/* ── 5. Placing an order ── */}
        <section className="space-y-4">
          <SectionHeading number={5} title="Placing an Order" icon={ShoppingBag} />
          <div className="rounded-2xl border border-ink/10 bg-white/70 p-5 sm:p-6 space-y-4 shadow-xs">
            <BulletList
              items={[
                "Your order placement constitutes an offer to purchase. A legally binding contract is confirmed only after we successfully receive payment and issue an order confirmation email/SMS with your Order ID.",
                "We reserve the right to decline, adjust, or cancel an order for reasons including out-of-stock items, unserviceable pin codes, courier restrictions, failed authorization, or suspected fraud. If you have already been charged, a prompt 100% refund will be credited back to your original payment method.",
                "During online checkout, item stock is briefly held for a limited window to enable transaction completion; if payment is not completed within that window, the order is automatically released and cancelled.",
              ]}
            />
          </div>
        </section>

        {/* ── 6. Payments ── */}
        <section className="space-y-4">
          <SectionHeading number={6} title="Payments" icon={CreditCard} />
          <div className="rounded-2xl border border-ink/10 bg-white/70 p-5 sm:p-6 space-y-4 shadow-xs">
            <Paragraph>
              All online payments are securely processed through RBI-authorized payment aggregator partners (supporting UPI, Net Banking, Debit/Credit Cards, and Wallets).
            </Paragraph>
            <BulletList
              items={[
                "Your card and sensitive payment credentials are encrypted and processed directly by the payment gateway adhering to PCI-DSS standards; Yugika Foods does not view or store your card numbers or CVV.",
                "In case your account is debited but the order fails to generate or confirm, the payment aggregator and your issuing bank automatically initiate a reversal, typically credited back within 5 to 7 business banking days.",
              ]}
            />
          </div>
        </section>

        {/* ── 7. Shipping, cancellation and refunds ── */}
        <section className="space-y-4">
          <SectionHeading number={7} title="Shipping, Cancellation and Refunds" icon={Truck} />
          <div className="rounded-2xl border border-ink/10 bg-white/70 p-5 sm:p-6 space-y-3 shadow-xs">
            <Paragraph>
              Our shipping procedures, transit timelines, cancellation policies, return eligibility, and refund mechanisms are detailed in our dedicated{" "}
              <Link href="/shipping-policy" className="font-semibold text-pine-900 underline decoration-gold/40 hover:text-gold-deep transition-colors">
                Shipping Policy
              </Link>{" "}
              and{" "}
              <Link href="/refund-policy" className="font-semibold text-pine-900 underline decoration-gold/40 hover:text-gold-deep transition-colors">
                Refund, Return &amp; Cancellation Policy
              </Link>
              , each of which is incorporated into and forms an integral part of these Terms &amp; Conditions.
            </Paragraph>
            <div className="rounded-xl bg-amber-50/70 border border-amber-200/60 p-4 text-[0.88rem] text-amber-900">
              Please inspect the external packaging upon delivery. If you notice severe damage or leakage, please take photos immediately and contact our customer support team within 24–48 hours for immediate assistance.
            </div>
          </div>
        </section>

        {/* ── 8. Reviews and user content ── */}
        <section className="space-y-4">
          <SectionHeading number={8} title="Reviews and User Content" icon={Star} />
          <div className="rounded-2xl border border-ink/10 bg-white/70 p-5 sm:p-6 space-y-4 shadow-xs">
            <BulletList
              items={[
                "Only verified customers who have genuinely purchased and received a product are invited to submit reviews and ratings. Reviews must be truthful, fair, and grounded in authentic personal experience.",
                "You agree not to post abusive, obscene, defamatory, misleading, deceptive, or infringing reviews. We reserve the right to moderate, hide, or remove any content violating these guidelines.",
                "By submitting a review, photo, testimonial, or rating, you grant Yugika Foods a perpetual, royalty-free, worldwide, non-exclusive license to display, reproduce, and reference it on our Site and promotional materials.",
              ]}
            />
          </div>
        </section>

        {/* ── 9. Acceptable use ── */}
        <section className="space-y-4">
          <SectionHeading number={9} title="Acceptable Use" icon={ShieldAlert} />
          <div className="rounded-2xl border border-ink/10 bg-white/70 p-5 sm:p-6 space-y-4 shadow-xs">
            <Paragraph>When interacting with the Site, you explicitly agree NOT to:</Paragraph>
            <BulletList
              items={[
                "Engage in any unlawful, fraudulent, or malicious activities.",
                "Attempt to breach, probe, compromise, hack, or overload our servers, network infrastructure, or databases.",
                "Scrape, harvest, copy, or index content, product pricing, or user data using automated crawlers, bots, or scripts without authorization.",
                "Manipulate coupon codes, inventory counts, or pricing logic, or attempt automated checkout hoarding.",
                "Impersonate any person, business entity, or representative of Yugika Foods.",
              ]}
            />
          </div>
        </section>

        {/* ── 10. Intellectual property ── */}
        <section className="space-y-4">
          <SectionHeading number={10} title="Intellectual Property" icon={FileCheck} />
          <div className="rounded-2xl border border-ink/10 bg-white/70 p-5 sm:p-6 space-y-4 shadow-xs">
            <Paragraph>
              The Site, our trademarks, brand names (including <strong>Marutinandan</strong> and <strong>Yugika</strong>), logos, product designs, bottle packaging artwork, photographs, graphical assets, website copy, and layout code are the exclusive intellectual property of <strong>Yugika Foods Private Limited</strong> or its licensed partners and are protected under Indian and international copyright and trademark laws.
            </Paragraph>
            <Paragraph>
              No content from this website may be copied, reproduced, republished, modified, distributed, or commercially exploited in any manner without prior written consent from Yugika Foods Private Limited.
            </Paragraph>
          </div>
        </section>

        {/* ── 11. Disclaimer and limitation of liability ── */}
        <section className="space-y-4">
          <SectionHeading number={11} title="Disclaimer and Limitation of Liability" icon={Scale} />
          <div className="rounded-2xl border border-ink/10 bg-white/70 p-5 sm:p-6 space-y-4 shadow-xs">
            <Paragraph>
              While we exercise rigorous care to keep the Site accurate, secure, and operational, the Site and all materials are provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without warranties of uninterrupted uptime or absolute error-free availability.
            </Paragraph>
            <BulletList
              items={[
                "To the maximum extent permitted by applicable Indian law, Yugika Foods and its directors, employees, or associates shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from the use or inability to use the Site or products.",
                "Our aggregate financial liability for any claim or dispute arising out of or related to an order shall strictly be limited to the actual purchase price paid by you for that specific order.",
                "Nothing in these Terms limits or excludes consumer rights guaranteed under the Consumer Protection Act, 2019, or any statutory liability that cannot lawfully be limited or excluded under Indian law.",
              ]}
            />
          </div>
        </section>

        {/* ── 12. Force majeure ── */}
        <section className="space-y-4">
          <SectionHeading number={12} title="Force Majeure" icon={CloudLightning} />
          <div className="rounded-2xl border border-ink/10 bg-white/70 p-5 sm:p-6 space-y-3 shadow-xs">
            <Paragraph>
              Yugika Foods will not be held liable or responsible for any failure, impediment, or delay in performing our delivery or service commitments caused by unforeseen events beyond our reasonable control. Such events include acts of God, extreme floods, earthquakes, strikes, civil commotion, lockdown, supply chain or freight disruptions, government orders, power outages, or carrier network blackouts.
            </Paragraph>
          </div>
        </section>

        {/* ── 13. Privacy ── */}
        <section className="space-y-4">
          <SectionHeading number={13} title="Privacy" icon={Shield} />
          <div className="rounded-2xl border border-ink/10 bg-white/70 p-5 sm:p-6 space-y-3 shadow-xs">
            <Paragraph>
              Your privacy is of utmost importance to us. How we collect, store, handle, and safeguard your personal information is governed by our dedicated{" "}
              <Link
                href="/privacy-policy"
                className="font-medium text-pine-800 underline decoration-gold/40 underline-offset-2 hover:text-gold-deep transition-colors"
              >
                Privacy Policy
              </Link>
              , which is drafted in compliance with the Digital Personal Data Protection Act, 2023 and the Information Technology Act, 2000.
            </Paragraph>
          </div>
        </section>

        {/* ── 14. Changes to these terms ── */}
        <section className="space-y-4">
          <SectionHeading number={14} title="Changes to These Terms" icon={RefreshCw} />
          <div className="rounded-2xl border border-ink/10 bg-white/70 p-5 sm:p-6 space-y-3 shadow-xs">
            <Paragraph>
              We reserve the right to amend, update, or revise these Terms &amp; Conditions periodically to reflect regulatory updates or changes in our operational procedures. Any changes become effective immediately upon posting to this page, marked with the updated date above. Orders placed following any such publication will be governed by the updated version.
            </Paragraph>
          </div>
        </section>

        {/* ── 15. Governing law and disputes ── */}
        <section className="space-y-4">
          <SectionHeading number={15} title="Governing Law and Disputes" icon={Gavel} />
          <div className="rounded-2xl border border-ink/10 bg-white/70 p-5 sm:p-6 space-y-3 shadow-xs">
            <Paragraph>
              These Terms &amp; Conditions and any contractual transactions conducted on the Site are governed by and construed in accordance with the laws of the Republic of India.
            </Paragraph>
            <Paragraph>
              Subject to applicable consumer protection laws, any dispute, controversy, or claim arising out of or related to these terms shall be submitted to the exclusive jurisdiction of the competent courts in <strong>Agra, Uttar Pradesh, India</strong>. We encourage you to first contact us directly so we may resolve any dispute expeditiously and amicably.
            </Paragraph>
          </div>
        </section>

        {/* ── 16. Grievance officer ── */}
        <section className="space-y-4">
          <SectionHeading number={16} title="Grievance Officer" icon={UserCheck} />
          <div className="rounded-2xl border border-ink/10 bg-white/70 p-5 sm:p-6 space-y-4 shadow-xs">
            <Paragraph>
              In accordance with the Information Technology Act, 2000 and the Consumer Protection (E-Commerce) Rules, 2020, consumer grievances can be escalated to our designated Grievance Redressal Officer:
            </Paragraph>
            <div className="rounded-xl border border-ink/8 bg-cream/60 p-4 space-y-2">
              <p className="font-semibold text-pine-900">Mr. Ankit Solanki</p>
              <p className="text-sm text-ink/75">Grievance Redressal Officer, Yugika Foods Private Limited</p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-sm">
                <div>
                  Email:{" "}
                  <a href="mailto:yugikafoods@gmail.com" className="font-medium text-pine-800 underline decoration-gold/40 hover:text-gold-deep transition-colors">
                    yugikafoods@gmail.com
                  </a>
                </div>
                <div>
                  Phone:{" "}
                  <a href="tel:+919058704491" className="font-medium text-pine-800 hover:text-gold-deep transition-colors">
                    +91 9058704491
                  </a>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3">
              <p className="text-[0.88rem] text-emerald-800">
                We acknowledge receipt of consumer complaints within <strong>48 hours</strong> and aim to resolve them within <strong>one month</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* ── 17. Contact us ── */}
        <section className="space-y-4">
          <SectionHeading number={17} title="Contact Us" icon={Mail} />
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
