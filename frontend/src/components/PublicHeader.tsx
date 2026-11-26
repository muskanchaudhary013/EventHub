"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  Compass,
  HelpCircle,
  Layers,
  LogOut,
  Menu,
  QrCode,
  Ticket,
  User,
  X,
} from "lucide-react";
import { getDashboardPath, useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationCenter } from "@/components/NotificationCenter";

export function PublicHeader() {
  const pathname = usePathname();
  const { user, role, signOut } = useAuth();
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const prevScrollY = useRef(0);

  // Auto-close mobile menu on route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Handle smart sticky scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 18);

      if (currentScrollY > 75 && !mobileOpen) {
        if (currentScrollY > prevScrollY.current + 6) {
          setIsHeaderHidden(true);
        } else if (currentScrollY < prevScrollY.current - 6) {
          setIsHeaderHidden(false);
        }
      } else {
        setIsHeaderHidden(false);
      }
      prevScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mobileOpen]);

  // Lock body scroll & listen for Escape key when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  const dashboardHref = user && role ? getDashboardPath(role) : "/login";

  const userInitials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || "EH";

  const roleLabel =
    role === "student"
      ? "Student Attendee"
      : role === "volunteer"
        ? "Gate Volunteer"
        : role === "organizer"
          ? "Fest Organizer"
          : "Verified Account";

  return (
    <div
      className={`eh-header-wrap ${isHeaderHidden ? "nav-hidden" : ""} ${
        isScrolled ? "nav-scrolled" : ""
      }`}
    >
      <header className="eh-header">
        <Link className="eh-brand" href="/" onClick={() => setMobileOpen(false)}>
          <img
            src="/logo.png"
            alt="EventHub Logo"
            className="eh-brand-logo"
          />
          <span>
            EVENT<span className="accent">HUB</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="eh-nav" aria-label="Main Navigation">
          <Link className={pathname === "/" ? "on" : ""} href="/">
            Discover
          </Link>
          <Link href="/#events">Events</Link>
          <Link href="/#how-it-works">How It Works</Link>
          <Link className={pathname === "/passes" ? "on" : ""} href="/passes">
            My Passes
          </Link>
          <Link className={pathname === "/faq" ? "on" : ""} href="/faq">
            FAQs
          </Link>
        </nav>

        {/* Header Action Controls */}
        <div className="eh-header-actions">
          <ThemeToggle />
          <NotificationCenter buttonClassName="eh-icon-btn" />

          {/* Desktop/Tablet User Profile Link */}
          <Link
            href={dashboardHref}
            className="eh-icon-btn eh-header-user-btn"
            aria-label={user ? "Open Dashboard" : "Sign In"}
            title={user ? user.displayName || user.email || "Dashboard" : "Sign In"}
          >
            {user ? (
              <span style={{ fontSize: 11.5, fontWeight: 800, color: "inherit" }}>
                {userInitials}
              </span>
            ) : (
              <User className="w-4 h-4" />
            )}
          </Link>

          {/* Dashboard / Sign In Pill (hidden on <=640px to preserve space) */}
          {user ? (
            <div className="eh-header-dash-btn">
              <Link className="eh-signin-btn" href={dashboardHref}>
                Dashboard
              </Link>
              <button
                type="button"
                onClick={() => signOut()}
                className="eh-icon-btn"
                aria-label="Log Out"
                title="Log Out"
                style={{ cursor: "pointer" }}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="eh-header-dash-btn">
              <Link className="eh-signin-btn" href="/login">
                Sign In
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            className="eh-icon-btn eh-mobile-toggle"
            aria-label={mobileOpen ? "Close Menu" : "Open Navigation Menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Backdrop Overlay when Mobile Drawer is Open */}
      {mobileOpen && (
        <div
          className="eh-mobile-drawer-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Responsive Mobile Drawer */}
      {mobileOpen && (
        <div className="eh-mobile-drawer" role="dialog" aria-modal="true">
          {/* User Profile / Auth State Block */}
          {user ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="eh-mobile-user-card">
                <div className="eh-mobile-user-avatar">{userInitials}</div>
                <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "inherit" }}>
                      {user.displayName || "EventHub Member"}
                    </span>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        padding: "2px 8px",
                        borderRadius: 999,
                        background: "rgba(245, 158, 11, 0.18)",
                        color: "var(--color-primary, #d97706)",
                        border: "1px solid rgba(245, 158, 11, 0.3)",
                      }}
                    >
                      {roleLabel}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: "var(--muted, #57534e)", marginTop: 1 }} className="truncate">
                    {user.email || "Authenticated"}
                  </span>
                </div>
              </div>

              <Link
                href={dashboardHref}
                onClick={() => setMobileOpen(false)}
                className="eh-mobile-btn-primary"
              >
                <span>Open {roleLabel ? roleLabel.replace(" Attendee", "").replace("Fest ", "") : "Workspace"} Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="eh-mobile-btn-primary"
              >
                <span>Sign In / Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Navigation Links with Icons */}
          <div className="eh-mobile-nav-group">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className={`eh-mobile-link ${pathname === "/" ? "active" : ""}`}
            >
              <Compass className="w-4 h-4 text-amber-500" />
              <span>Discover Events</span>
            </Link>

            <Link
              href="/#events"
              onClick={() => setMobileOpen(false)}
              className="eh-mobile-link"
            >
              <CalendarDays className="w-4 h-4 text-amber-500" />
              <span>Explore All Tracks</span>
            </Link>

            <Link
              href="/#how-it-works"
              onClick={() => setMobileOpen(false)}
              className="eh-mobile-link"
            >
              <Layers className="w-4 h-4 text-amber-500" />
              <span>How It Works</span>
            </Link>

            <Link
              href="/passes"
              onClick={() => setMobileOpen(false)}
              className={`eh-mobile-link ${pathname === "/passes" ? "active" : ""}`}
            >
              <Ticket className="w-4 h-4 text-amber-500" />
              <span>My QR Passes Wallet</span>
            </Link>

            <Link
              href="/faq"
              onClick={() => setMobileOpen(false)}
              className={`eh-mobile-link ${pathname === "/faq" ? "active" : ""}`}
            >
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <span>FAQs &amp; Turnstile Rules</span>
            </Link>

            {(role === "volunteer" || role === "organizer") && (
              <Link
                href="/scanner"
                onClick={() => setMobileOpen(false)}
                className={`eh-mobile-link ${pathname === "/scanner" ? "active" : ""}`}
              >
                <QrCode className="w-4 h-4 text-amber-500" />
                <span>Gate Turnstile Scanner</span>
              </Link>
            )}
          </div>

          {/* Footer Area with Sign Out when authenticated */}
          {user && (
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                signOut();
              }}
              className="eh-mobile-logout-btn"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out ({user.displayName || user.email})</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
