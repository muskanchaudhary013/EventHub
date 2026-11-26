"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, User, X } from "lucide-react";
import { getDashboardPath, useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";

export function PublicHeader() {
  const pathname = usePathname();
  const { user, role } = useAuth();
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const prevScrollY = useRef(0);

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

  const dashboardHref = user && role ? getDashboardPath(role) : "/login";

  return (
    <div
      className={`eh-header-wrap ${isHeaderHidden ? "nav-hidden" : ""} ${
        isScrolled ? "nav-scrolled" : ""
      }`}
    >
      <header className="eh-header">
        <Link className="eh-brand" href="/">
          <img
            src="/logo.png"
            alt="EventHub Logo"
            className="eh-brand-logo"
          />
          <span>
            EVENT<span className="accent">HUB</span>
          </span>
        </Link>

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

        <div className="eh-header-actions">
          <ThemeToggle />
          <Link
            href={dashboardHref}
            className="eh-icon-btn"
            aria-label={user ? "Open Dashboard" : "Account"}
            title={user ? user.displayName || user.email || "Dashboard" : "Sign In"}
          >
            <User className="w-4 h-4" />
          </Link>
          <Link className="eh-signin-btn" href={dashboardHref}>
            {user ? "Dashboard" : "Sign In"}
          </Link>
          <button
            type="button"
            className="eh-icon-btn eh-mobile-toggle"
            aria-label="Toggle Menu"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div
          style={{
            borderTop: "1px solid rgba(168,85,247,0.18)",
            background: "rgba(11, 8, 22, 0.98)",
            padding: "16px 24px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <Link href="/" onClick={() => setMobileOpen(false)} style={{ fontWeight: pathname === "/" ? 700 : 500, color: "#fff" }}>
            Discover
          </Link>
          <Link href="/#events" onClick={() => setMobileOpen(false)} style={{ color: "#c4bddb" }}>
            Events
          </Link>
          <Link href="/#how-it-works" onClick={() => setMobileOpen(false)} style={{ color: "#c4bddb" }}>
            How It Works
          </Link>
          <Link href="/passes" onClick={() => setMobileOpen(false)} style={{ fontWeight: pathname === "/passes" ? 700 : 500, color: pathname === "/passes" ? "#fff" : "#c4bddb" }}>
            My Passes
          </Link>
          <Link href="/faq" onClick={() => setMobileOpen(false)} style={{ fontWeight: pathname === "/faq" ? 700 : 500, color: pathname === "/faq" ? "#fff" : "#c4bddb" }}>
            FAQs
          </Link>
        </div>
      )}
    </div>
  );
}
