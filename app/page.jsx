import Hero from "@/components/Hero";
import StoryTeaser from "@/components/StoryTeaser";
import VariantsToggle from "@/components/VariantsToggle";
import HorizontalGallery from "@/components/HorizontalGallery";
import WhyUs from "@/components/WhyUs";
import LabReportTable from "@/components/LabReportTable";
import EnquiryForm from "@/components/EnquiryForm";
import ContactInfo from "@/components/ContactInfo";
import Link from "next/link";
import { getAllProducts } from "@/data/products";

export const metadata = {
  title: "Marutinandan — Pure Cold Pressed Mustard Oil (Kachi Ghani)",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const products = getAllProducts();

  return (
    <>
      <Hero />
      <StoryTeaser />
      <VariantsToggle />
      <HorizontalGallery items={products} />
      <WhyUs />

      <section className="bg-pine-950 px-6 py-24 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <LabReportTable />
          <div className="mt-10 text-center">
            <Link
              href="/lab-report"
              data-cursor-hover
              className="inline-flex items-center gap-2 rounded-full border border-gold-light/40 px-7 py-3 text-sm font-medium text-gold-light transition-colors hover:bg-gold-light/10"
            >
              View Full Lab Report →
            </Link>
          </div>
        </div>
      </section>

      <section id="order" className="bg-cream px-6 py-24 lg:px-10 lg:py-32">
        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold-deep">— Place an Order —</p>
            <h2 className="mt-4 font-display text-4xl leading-tight text-pine-900 sm:text-5xl">
              Bring purity <span className="italic text-gold-deep">home.</span>
            </h2>
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
      </section>
    </>
  );
}
