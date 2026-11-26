"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  CalendarDays,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  QrCode,
  Search,
  Ticket,
  X,
} from "lucide-react";
import { DashboardRole, useAuth } from "@/context/AuthContext";
import { AuthGuard } from "./AuthGuard";
import "../app/home.css";

interface OpsShellProps {
  children: React.ReactNode;
  allowedRoles?: DashboardRole[];
  consoleTitle?: string;
  consoleBadge?: string;
}

export function OpsShell({
  children,
  allowedRoles,
  consoleTitle = "Organizer Console",
  consoleBadge = "Live Ops",
}: OpsShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems =
    role === "student"
      ? [
          {
            href: "/dashboard/student",
            label: "Student Dashboard",
            icon: GraduationCap,
          },
          { href: "/passes", label: "My QR Passes", icon: Ticket },
          { href: "/", label: "Discover Events", icon: CalendarDays },
          { href: "/faq", label: "FAQs & Help", icon: HelpCircle },
        ]
      : role === "volunteer"
        ? [
            {
              href: "/dashboard/volunteer",
              label: "Gate Scanner HUD",
              icon: QrCode,
            },
            { href: "/", label: "Events Feed", icon: CalendarDays },
            { href: "/passes", label: "Participant Passes", icon: Ticket },
            { href: "/faq", label: "Gate Guidelines", icon: HelpCircle },
          ]
        : [
            {
              href: "/dashboard/organizer",
              label: "Overview KPI",
              icon: LayoutDashboard,
            },
            { href: "/", label: "Events Feed", icon: CalendarDays },
            { href: "/passes", label: "Participant Passes", icon: Ticket },
            { href: "/faq", label: "Help & Protocols", icon: HelpCircle },
          ];

  const handleSignOut = async () => {
    setSidebarOpen(false);
    await signOut();
    router.push("/");
  };

  const userInitials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || "EH";

  const roleBadgeLabel =
    role === "student"
      ? "Student Account"
      : role === "volunteer"
        ? "Volunteer Account"
        : "Organizer Account";

  const SidebarContent = (
    <div className="h-full flex flex-col pt-6 pb-6 bg-[#0E0B1A] text-white">
      <div className="px-6 mb-6 flex items-center justify-between">
        <Link href="/" className="eh-brand text-white">
          <img src="/logo.png" alt="EventHub" className="eh-brand-logo" style={{ width: 30, height: 30 }} />
          <span>
            EVENT<span className="accent">HUB</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
          className="lg:hidden p-1.5 rounded-lg text-white/70 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/35">
          {roleBadgeLabel}
        </span>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13.5px] whitespace-nowrap transition-all ${
                isActive
                  ? "bg-gradient-to-r from-[#c084fc] via-[#9333ea] to-[#7c3aed] text-white font-bold shadow-md shadow-purple-600/30"
                  : "text-white/70 hover:bg-purple-500/10 hover:text-white"
              }`}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pt-4 border-t border-purple-500/15 space-y-2">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-white/5 border border-purple-500/15">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c084fc] to-[#7c3aed] flex items-center justify-center shrink-0 text-white font-bold text-xs">
            {userInitials}
          </div>
          <div className="flex flex-col min-w-0 leading-tight">
            <span className="text-[12.5px] font-semibold text-white truncate">
              {user?.displayName || "EventHub Member"}
            </span>
            <span className="text-[11px] text-white/60 truncate">
              {user?.email || "Authenticated"}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-purple-500/20 bg-white/5 text-[12.5px] font-semibold text-white/80 hover:text-red-400 hover:border-red-400/40 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <AuthGuard allowedRoles={allowedRoles}>
      <aside className="hidden lg:block fixed left-0 top-0 h-full w-64 border-r border-purple-500/15 z-50">
        {SidebarContent}
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-64 max-w-[82vw] h-full border-r border-purple-500/20 shadow-2xl z-10">
            {SidebarContent}
          </aside>
        </div>
      )}

      <div className="lg:pl-64 min-h-screen flex flex-col bg-[#090712] text-white">
        <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-[#0E0B1A]/90 backdrop-blur-md border-b border-purple-500/15 shadow-[0_4px_25px_rgba(0,0,0,0.6)] z-40 flex items-center justify-between gap-2 px-3 sm:px-5 lg:px-6">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="lg:hidden p-2 rounded-xl border border-purple-500/20 bg-white/5 text-white shrink-0 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-[17px] sm:text-[18px] font-bold text-white tracking-tight truncate">
              {consoleTitle}
            </span>
            <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/35 text-xs font-bold uppercase whitespace-nowrap shrink-0">
              {consoleBadge}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/passes#retrieve"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-purple-500/25 bg-purple-500/10 text-[12.5px] font-semibold text-purple-200 hover:bg-purple-500/20 transition-all whitespace-nowrap shrink-0"
            >
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline">Find Pass</span>
            </Link>
            <button
              type="button"
              aria-label="Notifications"
              className="relative p-2 rounded-full text-white/70 hover:bg-white/10 hover:text-white transition-colors shrink-0 cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#c084fc] ring-2 ring-[#0E0B1A]" />
            </button>
            <div className="hidden sm:flex w-8 h-8 rounded-full bg-gradient-to-br from-[#c084fc] to-[#7c3aed] items-center justify-center shrink-0 text-white font-bold text-xs">
              {userInitials}
            </div>
          </div>
        </header>

        <main className="relative pt-16 bg-[#090712] min-h-screen flex-1 text-white">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
