"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getDashboardPath, useAuth } from "@/context/AuthContext";

export default function DashboardIndexPage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (role) {
      const target = getDashboardPath(role);
      router.replace(target);
      if (typeof window !== "undefined") {
        setTimeout(() => {
          if (window.location.pathname !== target) {
            window.location.assign(target);
          }
        }, 150);
      }
      return;
    }
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    router.replace("/login?selectRole=1");
  }, [loading, user, role, router]);

  return (
    <div className="min-h-screen bg-[#fbf9f4] dark:bg-[#13111c] flex items-center justify-center p-6 text-stone-900 dark:text-white">
      <div className="bg-white dark:bg-[#181523] border border-amber-500/20 rounded-2xl p-8 max-w-sm w-full text-center space-y-3 shadow-xl">
        <Loader2 className="w-7 h-7 animate-spin text-[#d97706] dark:text-[#f59e0b] mx-auto" />
        <p className="text-[16px] font-bold text-stone-900 dark:text-white">
          Opening your EventHub workspace...
        </p>
      </div>
    </div>
  );
}
