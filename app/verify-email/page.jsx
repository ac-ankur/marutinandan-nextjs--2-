import { Suspense } from "react";
import VerifyEmailForm from "@/components/auth/VerifyEmailForm";

export const metadata = {
  title: "Verify Email — Yugika Foods",
  description: "Verify your Yugika Foods account email address.",
  robots: { index: false, follow: false },
};

export default function VerifyEmailPage() {
  return (
    <main className="relative min-h-screen bg-cream px-4 pb-20 pt-28 sm:px-6 sm:pt-36 lg:px-10 lg:pb-28">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gold/5 blur-[120px]" />
      </div>
      <div className="relative z-10 mx-auto max-w-xl">
        <Suspense fallback={<div className="flex min-h-[400px] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-pine-800 border-t-transparent" /></div>}>
          <VerifyEmailForm />
        </Suspense>
      </div>
    </main>
  );
}
