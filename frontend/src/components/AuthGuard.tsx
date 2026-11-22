"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import {
  DashboardRole,
  getDashboardPath,
  useAuth,
} from "@/context/AuthContext";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: DashboardRole[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isRoleMismatch = Boolean(
    !loading && user && role && allowedRoles && !allowedRoles.includes(role)
  );

  useEffect(() => {
    if (loading) return;
    if (!user) {
      const nextParam = encodeURIComponent(pathname || "/dashboard");
      router.replace(`/login?next=${nextParam}`);
      return;
    }
    if (!role) {
      router.replace("/login?selectRole=1");
      return;
    }
    if (allowedRoles && !allowedRoles.includes(role)) {
      router.replace(getDashboardPath(role));
    }
  }, [loading, user, role, allowedRoles, router, pathname]);

  if (loading || !user || !role || isRoleMismatch) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-surface-container-lowest border border-[#E8E2D5] rounded-2xl p-8 max-w-sm w-full text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center mx-auto">
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <ShieldCheck className="w-6 h-6" />
            )}
          </div>
          <h2 className="font-headline text-[18px] font-bold text-on-surface">
            {loading
              ? "Verifying session..."
              : isRoleMismatch
                ? "Opening your assigned dashboard..."
                : "Sign in required"}
          </h2>
          <p className="text-[13px] text-on-surface-variant">
            {loading
              ? "Checking your EventHub account credentials."
              : isRoleMismatch
                ? "Redirecting you to the dashboard assigned to your account."
                : "Redirecting you to the secure login portal."}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
