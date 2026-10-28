import {
  Shield,
  Database,
  Eye,
  Clock,
  Lock,
  UserCheck,
  Users,
  Link2,
  Bell,
  Mail,
  Phone,
  MapPin,
  Cookie,
  FileText,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Yugika Foods Private Limited",
  description:
    "Privacy Policy of Yugika Foods Private Limited. Learn how we collect, use, share and protect your personal information at yugikafoods.com.",
  alternates: { canonical: "/privacy-policy" },
};

/* ---------- section data ---------- */
const SECTION_ICONS = {
  1: Database,
  2: Eye,
  3: Users,
  4: Cookie,
  5: Clock,
  6: Lock,
  7: UserCheck,
  8: Users,
  9: Link2,
  10: Bell,
  11: Mail,
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
  return <p className="text-[0.94rem] leading-relaxed text-ink/70">{children}</p>;
}

function BulletList({ items }) {
  return (
    <ul className="space-y-2 pl-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-[0.94rem] leading-relaxed text-ink/70">
          <ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-gold-deep" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-cream px-5 pb-28 pt-36 sm:px-6 lg:px-10 lg:pt-36">
      {/* ───── Hero ───── */}
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold-deep sm:text-sm">Legal</p>
        <h1 className="mt-4 font-display text-4xl leading-tight text-pine-900 sm:text-5xl lg:text-[3.25rem]">
          Privacy <span className="italic text-gold-deep">Policy</span>
        </h1>
        <p className="mt-4 text-sm text-ink/55 sm:text-base">
          Yugika Foods Private Limited · Last updated: 26 October 2026
        </p>
        <p className="mx-auto mt-5 max-w-2xl text-[0.94rem] leading-relaxed text-ink/65">
          This policy explains how Yugika Foods Private Limited (&ldquo;Yugika Foods&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) collects, uses, shares and protects your personal information when you visit{" "}
          <a href="https://yugikafoods.com" className="font-medium text-pine-800 underline decoration-gold/40 underline-offset-2 hover:text-gold-deep transition-colors">
            yugikafoods.com
          </a>{" "}
          or buy from us. It is written to comply with the Information Technology Act, 2000, the rules made under it, and the Digital Personal Data Protection Act, 2023, as applicable.
        </p>
      </div>

      {/* ───── Content ───── */}
      <div className="mx-auto mt-16 max-w-3xl space-y-14 sm:mt-20">

        {/* ── 1. Information we collect ── */}
        <section className="space-y-5">
          <SectionHeading number={1} title="Information We Collect" icon={Database} />

          <div className="rounded-2xl border border-ink/10 bg-white/70 p-5 sm:p-6 space-y-5 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-pine-900 mb-2">Information you give us</h3>
              <BulletList
                items={[
                  <>
                    <strong className="text-ink/85">Account details:</strong> name, email address, phone number and password (stored only as a one-way hash; we cannot read it).
                  </>,
                  <>
                    <strong className="text-ink/85">Delivery details:</strong> shipping addresses, recipient name and phone number.
                  </>,
                  <>
                    <strong className="text-ink/85">Order details:</strong> products ordered, amounts, coupon codes used, order history and invoices.
                  </>,
                  <>
                    <strong className="text-ink/85">Reviews and messages:</strong> product reviews you post and messages you send through our contact form.
                  </>,
                ]}
              />
            </div>

            <div className="border-t border-ink/8 pt-4">
              <h3 className="text-sm font-bold text-pine-900 mb-2">Sign in with Google</h3>
              <Paragraph>
                If you choose &ldquo;Continue with Google&rdquo;, Google shares with us your name, email address, profile picture and whether your email is verified. We do not receive your Google password and do not access your contacts, mail or files.
              </Paragraph>
            </div>

            <div className="border-t border-ink/8 pt-4">
              <h3 className="text-sm font-bold text-pine-900 mb-2">Payment information</h3>
              <Paragraph>
                Payments are processed by our payment partner. We do not see or store your card number, CVV, UPI PIN or net banking credentials. We receive only the payment status, a transaction reference and the amount.
              </Paragraph>
            </div>

            <div className="border-t border-ink/8 pt-4">
              <h3 className="text-sm font-bold text-pine-900 mb-2">Information collected automatically</h3>
              <BulletList
                items={[
                  "Technical data such as IP address, browser type, device information and pages visited, used for security, fraud prevention and to keep the site working.",
                  "Sign-in session tokens stored in your browser so that you stay logged in and your cart works.",
                ]}
              />
            </div>
          </div>
        </section>

        {/* ── 2. How we use your information ── */}
        <section className="space-y-5">
          <SectionHeading number={2} title="How We Use Your Information" icon={Eye} />
          <BulletList
            items={[
              "To create and manage your account and verify your email.",
              "To process, pack, ship, track and deliver your orders, and to issue invoices.",
              "To take payments, process refunds and prevent fraud.",
              "To send service messages: order confirmation, shipping and delivery updates, password resets and security alerts.",
              "To answer your enquiries and provide support.",
              "To show verified product reviews.",
              "To meet legal, tax and accounting obligations (for example GST invoicing).",
              "To improve our website and products.",
            ]}
          />
          <div className="rounded-xl border border-gold/25 bg-gold/5 px-4 py-3">
            <Paragraph>
              We send marketing messages only if you have agreed, and you can opt out at any time using the unsubscribe link or by writing to us.
            </Paragraph>
          </div>
        </section>

        {/* ── 3. Who we share it with ── */}
        <section className="space-y-5">
          <SectionHeading number={3} title="Who We Share It With" icon={Users} />
          <Paragraph>
            We do not sell your personal information. We share it only with service providers who help us run the store, and only what they need:
          </Paragraph>

          <div className="overflow-hidden rounded-2xl border border-ink/10 shadow-xs">
            <table className="w-full text-left text-[0.88rem]">
              <thead>
                <tr className="bg-pine-900 text-cream">
                  <th className="px-5 py-3 font-semibold">Who</th>
                  <th className="px-5 py-3 font-semibold">Why</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/8 bg-white/70">
                {[
                  ["Payment gateway", "To process payments and refunds"],
                  ["Shipping & courier partners", "To deliver your order (name, address, phone, order contents)"],
                  ["Email service provider", "To send you order and account emails"],
                  ["Cloud hosting & database providers", "To store and serve our website and data securely"],
                  ["Google", "Only if you use Sign in with Google"],
                  ["Authorities", "Where required by law, court order or to protect our rights and users"],
                ].map(([who, why]) => (
                  <tr key={who} className="hover:bg-cream-paper transition-colors">
                    <td className="px-5 py-3 font-medium text-pine-900">{who}</td>
                    <td className="px-5 py-3 text-ink/65">{why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Paragraph>
            These providers may process data on servers in or outside India and are expected to protect it and use it only for the service they provide to us. If our business is sold or reorganised, your information may be transferred to the new owner under the same protections.
          </Paragraph>
        </section>

        {/* ── 4. Cookies ── */}
        <section className="space-y-5">
          <SectionHeading number={4} title="Cookies and Similar Technologies" icon={Cookie} />
          <Paragraph>
            We use only what is needed to run the store: storage in your browser for your login session and cart. If we add analytics or advertising tools, we will update this policy and, where required, ask for your consent. You can clear or block cookies in your browser settings, but you may not be able to log in or check out.
          </Paragraph>
        </section>

        {/* ── 5. How long we keep it ── */}
        <section className="space-y-5">
          <SectionHeading number={5} title="How Long We Keep It" icon={Clock} />
          <Paragraph>
            We keep account information while your account is active. Order, invoice and payment records are kept for the period required by Indian tax and company law (generally up to 8 years). Contact-form messages are kept as long as needed to resolve your query. After that, data is deleted or anonymised.
          </Paragraph>
        </section>

        {/* ── 6. How we protect it ── */}
        <section className="space-y-5">
          <SectionHeading number={6} title="How We Protect It" icon={Lock} />
          <Paragraph>
            We use HTTPS encryption, hashed passwords, access controls, rate limiting and activity logs for administrative actions. No system is completely secure, so please use a strong, unique password and keep it private. If a breach affecting you occurs, we will notify you and the authorities as the law requires.
          </Paragraph>
        </section>

        {/* ── 7. Your rights and choices ── */}
        <section className="space-y-5">
          <SectionHeading number={7} title="Your Rights and Choices" icon={UserCheck} />
          <Paragraph>Subject to applicable law, you may:</Paragraph>
          <BulletList
            items={[
              <>Access and correct your information (most of it can be edited under <Link href="/account" className="font-medium text-pine-800 underline decoration-gold/40 underline-offset-2 hover:text-gold-deep transition-colors">My Account</Link>).</>,
              "Ask us to delete your account and personal data, except records we must legally keep.",
              "Withdraw consent for marketing or other optional processing.",
              "Nominate someone to exercise your rights if you are unable to, as the DPDP Act provides.",
              "Raise a complaint with us, and if unresolved, with the Data Protection Board of India once it is operational.",
            ]}
          />
          <div className="rounded-xl border border-gold/25 bg-gold/5 px-4 py-3">
            <Paragraph>
              To exercise these rights, email{" "}
              <a href="mailto:yugikafoods@gmail.com" className="font-medium text-pine-800 underline decoration-gold/40 underline-offset-2">
                yugikafoods@gmail.com
              </a>
              . We may need to verify your identity first and will respond within a reasonable time.
            </Paragraph>
          </div>
        </section>

        {/* ── 8. Children ── */}
        <section className="space-y-5">
          <SectionHeading number={8} title="Children" icon={Shield} />
          <Paragraph>
            Our store is meant for adults. We do not knowingly collect personal data from anyone under 18. If you believe a child has given us information, contact us and we will delete it.
          </Paragraph>
        </section>

        {/* ── 9. Third-party links ── */}
        <section className="space-y-5">
          <SectionHeading number={9} title="Third-Party Links" icon={Link2} />
          <Paragraph>
            Our site may link to other websites. We are not responsible for their privacy practices; please read their policies.
          </Paragraph>
        </section>

        {/* ── 10. Changes to this policy ── */}
        <section className="space-y-5">
          <SectionHeading number={10} title="Changes to This Policy" icon={Bell} />
          <Paragraph>
            We may update this policy from time to time. The latest version is always on this page with its date. Significant changes will be notified by email or a notice on the site.
          </Paragraph>
        </section>

        {/* ── 11. Contact and grievances ── */}
        <section className="space-y-5">
          <SectionHeading number={11} title="Contact and Grievances" icon={Mail} />

          <div className="rounded-2xl border border-ink/10 bg-white/70 p-5 sm:p-6 space-y-4 shadow-xs">
            <h3 className="font-display text-lg font-bold text-pine-900">
              Yugika Foods Private Limited
            </h3>

            <div className="space-y-3 text-[0.94rem] text-ink/70">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" />
                <span>Khasra No. 498, Ganeshdham Colony Mudi Jahangeerpuri, Etmadpur Agra – 283202, UP, India</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-gold-deep" />
                <a href="mailto:yugikafoods@gmail.com" className="font-medium text-pine-800 underline decoration-gold/40 underline-offset-2 hover:text-gold-deep transition-colors">
                  yugikafoods@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-gold-deep" />
                <span>
                  <a href="tel:+919058704491" className="font-medium text-pine-800 hover:text-gold-deep transition-colors">+91 9058704491</a>
                  <span className="text-ink/45 text-xs ml-1.5">(Mon – Fri, 10 AM – 6 PM IST)</span>
                </span>
              </div>
            </div>

            <div className="border-t border-ink/8 pt-4">
              <h4 className="text-sm font-bold text-pine-900 mb-1">Grievance Officer</h4>
              <Paragraph>
                Mr. Ankit Solanki —{" "}
                <a href="mailto:yugikafoods@gmail.com" className="font-medium text-pine-800 underline decoration-gold/40 underline-offset-2 hover:text-gold-deep transition-colors">
                  yugikafoods@gmail.com
                </a>
                {" & "}
                <a href="tel:+919058704491" className="font-medium text-pine-800 hover:text-gold-deep transition-colors">+91 9058704491</a>
              </Paragraph>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3">
              <p className="text-[0.88rem] text-emerald-800">
                We aim to acknowledge complaints within <strong>48 hours</strong> and resolve them within <strong>30 days</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* ── Back link ── */}
        <div className="border-t border-ink/10 pt-10 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-pine-900 px-6 py-3 text-sm font-semibold text-cream shadow-sm transition-all hover:bg-pine-800 hover:scale-[1.02] active:scale-[0.98]"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
