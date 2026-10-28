"use client";

import { useAuth } from "@/context/AuthContext";
import AdminLoginGate from "@/components/admin/AdminLoginGate";
import AdminConsole from "@/components/admin/AdminConsole";
import { Shield } from "lucide-react";

export default function AdminPage() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pine-900 text-gold-light animate-pulse shadow-md">
            <Shield className="h-6 w-6" />
          </div>
          <p className="text-xs text-ink/60 font-medium">Verifying administrator credentials…</p>
        </div>
      </div>
    );
  }

  // If not logged in, or if logged in as regular customer without ADMIN role
  if (!isAuthenticated || user?.role?.toUpperCase() !== "ADMIN") {
    return <AdminLoginGate />;
  }

  // Authenticated as ADMIN
  return <AdminConsole />;
}
