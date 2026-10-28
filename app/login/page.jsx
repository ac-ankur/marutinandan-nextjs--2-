import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Sign In — Yugika Foods / Marutinandan",
  description:
    "Sign in to your Yugika Foods account to access order tracking, invoices, wishlist, and quick checkout for pure cold-pressed mustard oil.",
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return (
    <div className="relative min-h-screen bg-cream px-4 pb-20 pt-28 sm:px-6 sm:pt-36 lg:px-10 lg:pb-28">
      {/* Decorative background ambiance */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-10 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gold/5 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <Suspense
          fallback={
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-pine-800 border-t-transparent" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
