import { Suspense } from "react";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata = {
  title: "Reset Password — Yugika Foods",
  description: "Choose a new password for your Yugika Foods account.",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <main className="relative min-h-screen bg-cream px-4 pb-20 pt-28 sm:px-6 sm:pt-36 lg:px-10 lg:pb-28">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gold/5 blur-[120px]" />
      </div>
      <div className="relative z-10 mx-auto max-w-xl">
        <Suspense fallback={<div className="flex min-h-[400px] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-pine-800 border-t-transparent" /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
