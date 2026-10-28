"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * ProtectedRoute wraps pages that require authentication.
 *
 * Props:
 *   - allowedRoles (optional): array of role strings (e.g. ["ADMIN", "CUSTOMER"]).
 *     If provided, only users whose `user.role` is in the list may access the page.
 *     If omitted, any authenticated user can access.
 *   - redirectTo: where to send unauthenticated users (default: "/login")
 *   - children: the page content to render when authorised
 */
export default function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/login",
}) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // still hydrating

    if (!isAuthenticated) {
      router.replace(`${redirectTo}?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (allowedRoles && allowedRoles.length > 0) {
      const userRole = user?.role?.toUpperCase();
      if (!userRole || !allowedRoles.map((r) => r.toUpperCase()).includes(userRole)) {
        router.replace("/");
      }
    }
  }, [loading, isAuthenticated, user, allowedRoles, redirectTo, router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-pine-800 border-t-transparent" />
          <p className="text-xs text-ink/50">Loading your account…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role?.toUpperCase();
    if (!userRole || !allowedRoles.map((r) => r.toUpperCase()).includes(userRole)) {
      return null;
    }
  }

  return children;
}
