"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDashboardPath, useAuth } from "@/context/AuthContext";

export function PublicHeader() {
  const pathname = usePathname();
  const { user, role } = useAuth();
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const prevScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);

      if (currentScrollY > 75) {
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
  }, []);

  return (
    <div className={`nav-sticky-wrap ${isHeaderHidden ? "nav-hidden" : ""} ${isScrolled ? "nav-scrolled" : ""}`}>
      <header className="nav">
        <Link className="logo" href="/">
          <i />EventHub
        </Link>
        <nav aria-label="Main">
          <Link className={pathname === "/" ? "on" : ""} href="/">
            Home
          </Link>
          <Link className={pathname === "/#events" ? "on" : ""} href="/#events">
            Events
          </Link>
          <Link className={pathname === "/passes" ? "on" : ""} href="/passes">
            My Passes
          </Link>
          <Link className={pathname === "/faq" ? "on" : ""} href="/faq">
            FAQ
          </Link>
        </nav>
        <div className="r">
          <Link className="pill hide" href="/login?selectRole=1">
            Create event
          </Link>
          <Link className="pill" href={user && role ? getDashboardPath(role) : "/login"}>
            {user ? "Dashboard" : "Sign in"}
          </Link>
        </div>
      </header>
    </div>
  );
}
