import LabReportTable from "@/components/LabReportTable";

export const metadata = {
  title: "Lab Report — NABL Tested Purity",
  description:
    "View Marutinandan's independently verified lab test results for Black and Yellow cold pressed mustard oil, certified by an NABL & ISO/IEC 17025 accredited laboratory.",
  alternates: { canonical: "/lab-report" },
};

export default function LabReportPage() {
  return (
    <div className="bg-pine-950 px-6 pb-24 pt-36 lg:px-10 lg:pt-44">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold-light">🧪 Lab Verified</p>
        <h1 className="mt-5 font-display text-5xl leading-tight text-cream sm:text-6xl">
          Purity, <span className="italic text-gold-light">quantified.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-cream/70">
          Independently tested and certified by FAST LABS — a NABL &amp; ISO/IEC 17025 accredited laboratory.
          Every parameter, transparent.
        </p>
      </div>

      <div className="mx-auto mt-16 max-w-5xl">
        <LabReportTable compact />

        <div className="mt-10 grid gap-4 text-xs text-cream/50 sm:grid-cols-3">
          <p>Test reference: FSSR-2011 / IS:548</p>
          <p>Report ref: FAST LABS FL/04/026</p>
          <p>BLQ = Below Limit of Quantification</p>
        </div>
      </div>
    </div>
  );
}
