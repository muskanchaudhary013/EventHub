"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type ThemeMode = "dark" | "light";

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem("eh-theme") as ThemeMode | null) || "dark";
    const initial: ThemeMode = saved === "light" ? "light" : "dark";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const next: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("eh-theme", next);
  };

  const isLight = mounted && theme === "light";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isLight}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
      onClick={toggleTheme}
      className={`eh-theme-toggle ${isLight ? "is-light" : "is-dark"}`}
    >
      <span className="eh-theme-track-icon dark-icon" aria-hidden="true">
        <Moon className="w-3.5 h-3.5" />
      </span>
      <span className="eh-theme-track-icon light-icon" aria-hidden="true">
        <Sun className="w-3.5 h-3.5" />
      </span>
      <span className="eh-theme-thumb" aria-hidden="true">
        {isLight ? (
          <Sun className="w-3.5 h-3.5" />
        ) : (
          <Moon className="w-3.5 h-3.5" />
        )}
      </span>
    </button>
  );
}
