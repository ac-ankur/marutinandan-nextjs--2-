import EnquiryForm from "@/components/EnquiryForm";
import ContactInfo from "@/components/ContactInfo";

export const metadata = {
  title: "Contact — Place an Order",
  description:
    "Get in touch with Marutinandan for retail and bulk / HoReCa orders of cold pressed mustard oil. Call, WhatsApp or email our sales team.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="bg-cream px-6 pb-24 pt-36 lg:px-10 lg:pt-44">
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold-deep">— Place an Order —</p>
          <h1 className="mt-5 font-display text-5xl leading-tight text-pine-900 sm:text-6xl">
            Bring purity <span className="italic text-gold-deep">home.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-ink/70">
            Send us your requirement and our team will reach out with pricing, availability and delivery
            details. For bulk / HoReCa orders, please mention your monthly quantity.
          </p>

          <div className="mt-9">
            <ContactInfo />
          </div>
        </div>

        <EnquiryForm />
      </div>
    </div>
  );
}
