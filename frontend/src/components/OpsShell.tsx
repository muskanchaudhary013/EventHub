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
import { BRAND_LOGO_URL } from "@/lib/eventhub-data";
import { DashboardRole, useAuth } from "@/context/AuthContext";
import { AuthGuard } from "./AuthGuard";

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
          { href: "/", label: "Explore Events", icon: CalendarDays },
          { href: "/faq", label: "FAQ & Help", icon: HelpCircle },
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
    <div className="h-full flex flex-col pt-6 pb-6 bg-[#FAF7F0]">
      <div className="px-6 mb-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 whitespace-nowrap">
          <img
            src={BRAND_LOGO_URL}
            alt="EventHub Brand Logo"
            className="h-7 w-auto object-contain shrink-0"
          />
          <span className="font-headline text-[20px] font-bold tracking-tight text-on-surface">
            EventHub
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
          className="lg:hidden p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 mb-2">
        <span className="text-label-token uppercase text-on-surface-variant tracking-wider px-2">
          {roleBadgeLabel}
        </span>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
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
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-[13px] whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-primary-container text-on-primary font-semibold shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              }`}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pt-4 border-t border-[#E8E2D5] space-y-2">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-surface-container-low">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 text-on-primary font-headline text-xs font-bold">
            {userInitials}
          </div>
          <div className="flex flex-col min-w-0 leading-tight">
            <span className="text-[12.5px] font-semibold text-on-surface truncate">
              {user?.displayName || "EventHub Member"}
            </span>
            <span className="text-[11px] text-on-surface-variant truncate">
              {user?.email || "Authenticated"}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-[#E8E2D5] bg-surface-container-lowest text-[12.5px] font-semibold text-on-surface-variant hover:text-error hover:border-error/30 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <AuthGuard allowedRoles={allowedRoles}>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 h-full w-64 border-r border-[#E8E2D5] z-50">
        {SidebarContent}
      </aside>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-64 max-w-[82vw] h-full border-r border-[#E8E2D5] shadow-2xl z-10">
            {SidebarContent}
          </aside>
        </div>
      )}

      <div className="lg:pl-64 min-h-screen flex flex-col">
        <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-[#FAF7F0]/95 backdrop-blur-md border-b border-[#E8E2D5] shadow-[0_1px_8px_rgba(24,24,27,0.04)] z-40 flex items-center justify-between gap-2 px-3 sm:px-5 lg:px-6">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="lg:hidden p-2 rounded-lg border border-[#E8E2D5] bg-surface-container-lowest text-on-surface shrink-0 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-headline text-[16px] sm:text-[18px] font-bold text-on-surface truncate">
              {consoleTitle}
            </span>
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-label-token uppercase whitespace-nowrap shrink-0">
              {consoleBadge}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <Link
              href="/passes#retrieve"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#E8E2D5] bg-surface-container-lowest text-[13px] font-medium text-on-surface hover:bg-surface-container-low transition-colors whitespace-nowrap shrink-0"
            >
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline">Find Pass</span>
            </Link>
            <button
              type="button"
              aria-label="Notifications"
              className="relative p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors shrink-0 cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary-container ring-2 ring-surface-container-lowest" />
            </button>
            <div className="hidden sm:flex w-8 h-8 rounded-full bg-primary items-center justify-center shrink-0 text-on-primary font-headline text-xs font-bold">
              {userInitials}
            </div>
          </div>
        </header>

        <main className="relative pt-16 bg-background min-h-screen flex-1">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
