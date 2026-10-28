import CheckoutFlow from "@/components/checkout/CheckoutFlow";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export const metadata = {
  title: "Secure Checkout — Yugika Foods / Marutinandan",
  description:
    "Complete your order of 100% pure cold-pressed oils. Verify cart, choose delivery address, and proceed with secure checkout.",
  alternates: { canonical: "/checkout" },
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return (
    <div className="relative min-h-screen bg-cream px-4 pb-20 pt-24 sm:px-6 sm:pt-32 lg:px-8 lg:pb-28">
      {/* Background ambient gold/green glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-10 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gold/5 blur-[120px]" />
        <div className="absolute right-10 top-40 h-[300px] w-[300px] rounded-full bg-forest/5 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <ProtectedRoute>
          <CheckoutFlow />
        </ProtectedRoute>
      </div>
    </div>
  );
}
