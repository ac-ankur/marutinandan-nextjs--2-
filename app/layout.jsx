import { Playfair_Display, Jost } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import Preloader from "@/components/Preloader";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { BrandProvider } from "@/components/BrandProvider";

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const body = Jost({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.marutinandan.in";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Marutinandan — Pure Cold Pressed Mustard Oil (Kachi Ghani)",
    template: "%s | Marutinandan",
  },
  description:
    "Marutinandan is 100% pure, cold pressed Kachi Ghani mustard oil. No heat, no chemicals, no solvents — every batch NABL lab-tested for purity. Black & Yellow variants.",
  keywords: [
    "cold pressed mustard oil",
    "kachi ghani mustard oil",
    "black mustard oil",
    "yellow mustard oil",
    "pure mustard oil India",
    "Marutinandan",
  ],
  openGraph: {
    title: "Marutinandan — Pure Cold Pressed Mustard Oil",
    description:
      "100% pure, cold pressed Kachi Ghani mustard oil. No heat, no chemicals, no solvents. NABL lab-tested.",
    url: SITE_URL,
    siteName: "Marutinandan",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Marutinandan — Pure Cold Pressed Mustard Oil",
    description: "100% pure, cold pressed Kachi Ghani mustard oil. NABL lab-tested, FSSAI compliant.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Marutinandan",
  url: SITE_URL,
  logo: `${SITE_URL}/images/logo.png`,
  description:
    "Marutinandan produces 100% pure cold pressed Kachi Ghani mustard oil, NABL lab-tested and FSSAI compliant.",
  sameAs: [],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="font-body antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <GoogleAnalytics />
        <Preloader />
        <BrandProvider>
          <SmoothScroll>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </SmoothScroll>
        </BrandProvider>
      </body>
    </html>
  );
}