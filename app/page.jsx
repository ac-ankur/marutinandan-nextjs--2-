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
import { futureProducts } from "@/data/company";

export const metadata = {
  title: "Yugika Foods Private Limited — Premium Cold-Pressed Edible Oils",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const products = getAllProducts();

  return (
    <>
      <Hero />
      <WhyUs />
      <VariantsToggle />
      <HorizontalGallery items={products} />
      
      <section className="bg-cream px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gold-deep">— Coming Soon —</p>
          <h2 className="mt-4 font-display text-4xl text-pine-900 sm:text-5xl">
            More Premium <span className="italic text-gold-deep">Cold-Pressed Oils.</span>
          </h2>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-3">
          {futureProducts.map((p) => (
            <div key={p.key} className="rounded-3xl bg-cream-paper p-8 text-center transition-shadow hover:shadow-[0_20px_50px_-25px_rgba(21,56,38,0.2)]">
              <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-medium text-gold-deep">{p.status}</span>
              <h3 className="mt-5 font-display text-2xl text-pine-900">{p.name}</h3>
            </div>
          ))}
        </div>
      </section>

      <StoryTeaser />

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
            <p className="text-xs uppercase tracking-[0.3em] text-gold-deep">— Contact Us —</p>
            <h2 className="mt-4 font-display text-4xl leading-tight text-pine-900 sm:text-5xl">
              Get in <span className="italic text-gold-deep">Touch.</span>
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink/70">
              We&apos;d love to hear from you. Whether you&apos;re a customer, distributor, retailer, or business partner, our team is here to assist you.
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
