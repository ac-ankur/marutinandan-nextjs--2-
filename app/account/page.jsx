import { Suspense } from "react";
import ProfilePage from "@/components/auth/ProfilePage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export const metadata = {
  title: "My Account — Yugika Foods / Marutinandan",
  description:
    "Manage your Yugika Foods account — view profile, change password, track orders, and manage delivery addresses.",
  alternates: { canonical: "/account" },
};

export default function AccountPage() {
  return (
    <div className="relative min-h-screen bg-cream px-4 pb-20 pt-28 sm:px-6 sm:pt-36 lg:px-10 lg:pb-28">
      {/* Background ambiance */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-10 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gold/5 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        <ProtectedRoute>
          <Suspense fallback={<div className="py-12 text-center text-sm text-ink/50">Loading profile...</div>}>
            <ProfilePage />
          </Suspense>
        </ProtectedRoute>
      </div>
    </div>
  );
}
