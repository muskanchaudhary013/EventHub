"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getDashboardPath, useAuth } from "@/context/AuthContext";

export default function DashboardIndexPage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!role) {
      router.replace("/login?selectRole=1");
      return;
    }
    router.replace(getDashboardPath(role));
  }, [loading, user, role, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="bg-surface-container-lowest border border-[#E8E2D5] rounded-2xl p-8 max-w-sm w-full text-center space-y-3 shadow-sm">
        <Loader2 className="w-7 h-7 animate-spin text-primary-container mx-auto" />
        <p className="font-headline text-[16px] font-bold text-on-surface">
          Opening your EventHub dashboard...
        </p>
      </div>
    </div>
  );
}
