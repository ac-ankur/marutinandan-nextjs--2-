import EnquiryForm from "@/components/EnquiryForm";
import ContactInfo from "@/components/ContactInfo";

export const metadata = {
  title: "Contact Us — Yugika Foods Private Limited",
  description:
    "Get in touch with Yugika Foods Private Limited. Whether you're a customer, distributor, retailer, or business partner, our team is here to assist you.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="bg-cream px-6 pb-24 pt-36 lg:px-10 lg:pt-36">
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-2">
        <div>
          <p className="text-xl uppercase tracking-[0.3em] text-gold-deep">Contact Us </p>
          <h1 className="mt-5 font-display text-5xl leading-tight text-pine-900 sm:text-6xl">
            Get in <span className="italic text-gold-deep">Touch.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-ink/70">
            We&apos;d love to hear from you. Whether you&apos;re a customer, distributor, retailer, or business partner, our team is here to assist you.
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
