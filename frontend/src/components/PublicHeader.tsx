"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  QrCode,
  Search,
  User,
  X,
} from "lucide-react";
import { BRAND_LOGO_URL } from "@/lib/eventhub-data";
import {
  getDashboardLabel,
  getDashboardPath,
  useAuth,
} from "@/context/AuthContext";

const PUBLIC_NAV_LINKS = [
  { href: "/", label: "Explore Events", exact: true },
  { href: "/passes", label: "My Passes" },
  { href: "/faq", label: "FAQ & Help" },
];

export function PublicHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, loading, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActiveLink = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleSignOut = async () => {
    setMobileOpen(false);
    await signOut();
    router.push("/");
  };

  const assignedDashboardHref = role ? getDashboardPath(role) : "/login?selectRole=1";
  const assignedDashboardLabel = role ? getDashboardLabel(role) : "Choose Dashboard";

  const DashboardIcon =
    role === "student"
      ? GraduationCap
      : role === "volunteer"
        ? QrCode
        : LayoutDashboard;

  const userInitials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || "EH";

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 bg-[#FAF7F0]/95 backdrop-blur-md border-b border-[#E8E2D5] shadow-[0_1px_8px_rgba(24,24,27,0.04)]">
        <div className="h-16 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Left: Brand + Clean Public Nav */}
          <div className="flex items-center gap-6 lg:gap-8 min-w-0">
            <Link
              href="/"
              className="flex items-center gap-2.5 shrink-0 whitespace-nowrap"
            >
              <img
                src={BRAND_LOGO_URL}
                alt="EventHub Brand Logo"
                className="h-8 w-auto object-contain shrink-0"
              />
              <div className="flex flex-col leading-none">
                <span className="font-headline text-[19px] font-bold tracking-tight text-on-surface">
                  EventHub
                </span>
                <span className="text-[10px] font-mono font-semibold tracking-wider uppercase text-on-surface-variant hidden sm:inline-block mt-0.5">
                  Campus Events
                </span>
              </div>
            </Link>

            <nav
              aria-label="Primary Navigation"
              className="hidden md:flex items-center gap-6 h-16"
            >
              {PUBLIC_NAV_LINKS.map((item) => {
                const active = isActiveLink(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`h-full flex items-center whitespace-nowrap shrink-0 text-[14px] transition-colors border-b-2 ${
                      active
                        ? "text-primary-container font-headline font-semibold border-primary-container"
                        : "text-on-surface-variant hover:text-on-surface font-medium border-transparent"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {/* User's Assigned Dashboard Link — Only visible after Firebase Auth */}
              {user && (
                <Link
                  href={assignedDashboardHref}
                  className={`h-full flex items-center gap-1.5 whitespace-nowrap shrink-0 text-[14px] transition-colors border-b-2 ${
                    pathname.startsWith("/dashboard")
                      ? "text-primary-container font-headline font-semibold border-primary-container"
                      : "text-on-surface-variant hover:text-on-surface font-medium border-transparent"
                  }`}
                >
                  <DashboardIcon className="w-4 h-4" />
                  <span>{assignedDashboardLabel}</span>
                </Link>
              )}
            </nav>
          </div>

          {/* Right: Find Pass + Auth Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/passes#retrieve"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8E2D5] bg-surface-container-lowest text-[13px] font-semibold text-on-surface hover:bg-surface-container-low transition-colors whitespace-nowrap shrink-0"
            >
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span>Find Pass</span>
            </Link>

            {loading ? (
              <div className="w-24 h-9 rounded-lg bg-surface-container animate-pulse" />
            ) : user ? (
              <div className="hidden md:flex items-center gap-2.5 pl-2 border-l border-[#E8E2D5]">
                <Link
                  href={assignedDashboardHref}
                  className="flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-on-primary font-headline text-[12px] font-bold flex items-center justify-center shrink-0">
                    {userInitials}
                  </div>
                  <div className="hidden xl:flex flex-col leading-tight max-w-[140px]">
                    <span className="text-[12.5px] font-semibold text-on-surface truncate">
                      {user.displayName || "Member"}
                    </span>
                    <span className="text-[10px] font-mono uppercase text-primary font-semibold truncate">
                      {role || "Setup Role"}
                    </span>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8E2D5] bg-surface-container-lowest text-[12.5px] font-semibold text-on-surface-variant hover:text-error hover:border-error/30 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13.5px] font-semibold text-on-surface hover:bg-surface-container transition-colors whitespace-nowrap"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/login?mode=signup"
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-primary-container hover:bg-[#E0484D] text-on-primary text-[13.5px] font-semibold shadow-xs transition-all active:scale-[0.98] whitespace-nowrap"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              aria-label="Toggle Menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg border border-[#E8E2D5] bg-surface-container-lowest text-on-surface hover:bg-surface-container-low transition-colors shrink-0 cursor-pointer"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-40">
          <div
            className="absolute inset-0 bg-black/35 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative bg-[#FAF7F0] border-b border-[#E8E2D5] shadow-xl px-4 py-4 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <nav className="space-y-1">
              {PUBLIC_NAV_LINKS.map((item) => {
                const active = isActiveLink(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors ${
                      active
                        ? "bg-primary-container text-on-primary shadow-xs"
                        : "text-on-surface hover:bg-surface-container"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {user && (
                <Link
                  href={assignedDashboardHref}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors ${
                    pathname.startsWith("/dashboard")
                      ? "bg-primary-container text-on-primary shadow-xs"
                      : "text-on-surface hover:bg-surface-container"
                  }`}
                >
                  <DashboardIcon className="w-4 h-4" />
                  <span>{assignedDashboardLabel}</span>
                </Link>
              )}
            </nav>

            <div className="pt-3 border-t border-[#E8E2D5] space-y-2">
              <Link
                href="/passes#retrieve"
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-[#E8E2D5] bg-surface-container-lowest text-[13px] font-semibold text-on-surface"
              >
                <Search className="w-4 h-4" />
                <span>Find Pass by Email</span>
              </Link>

              {user ? (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low border border-[#E8E2D5]/70">
                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0 text-on-primary font-bold text-xs">
                      {userInitials}
                    </div>
                    <div className="flex flex-col leading-tight min-w-0">
                      <span className="text-[13px] font-semibold text-on-surface truncate">
                        {user.displayName || "Member"}
                      </span>
                      <span className="text-[11px] font-mono uppercase text-primary font-semibold truncate">
                        {role ? getDashboardLabel(role) : "Assign Dashboard"}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-error-container/60 text-error text-[13px] font-semibold cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[#E8E2D5] bg-surface-container-lowest text-[13px] font-semibold text-on-surface"
                  >
                    <User className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    href="/login?mode=signup"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center py-2.5 rounded-xl bg-primary-container text-on-primary text-[13px] font-semibold"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
