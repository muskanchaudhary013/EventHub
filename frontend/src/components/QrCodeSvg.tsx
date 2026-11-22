import React from "react";

interface QrCodeSvgProps {
  size?: "sm" | "lg";
  seed?: string;
}

export function QrCodeSvg({ size = "lg", seed = "EH-2025-HCK-9481" }: QrCodeSvgProps) {
  // Deterministic small bit variation based on pass seed while keeping the exact Stitch QR look
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 997;
  }

  if (size === "sm") {
    return (
      <svg
        className="w-full h-full text-on-surface"
        fill="currentColor"
        viewBox="0 0 40 40"
        aria-label={`QR Code for ${seed}`}
      >
        <rect height="12" rx="2" width="12" x="2" y="2" />
        <rect fill="#FFFFFF" height="8" width="8" x="4" y="4" />
        <rect height="4" width="4" x="6" y="6" />
        <rect height="12" rx="2" width="12" x="26" y="2" />
        <rect fill="#FFFFFF" height="8" width="8" x="28" y="4" />
        <rect height="4" width="4" x="30" y="6" />
        <rect height="12" rx="2" width="12" x="2" y="26" />
        <rect fill="#FFFFFF" height="8" width="8" x="4" y="28" />
        <rect height="4" width="4" x="6" y="30" />
        <circle cx="20" cy="20" r="3" fill="#FF5A5F" />
        <rect height="8" width="4" x="18" y="6" />
        <rect height="4" width="12" x="26" y="22" />
        <rect height="10" width="4" x="18" y="28" />
        <rect height="6" width="8" x="26" y="32" />
      </svg>
    );
  }

  const toggle = hash % 2 === 0;

  return (
    <svg
      className="w-48 h-48 sm:w-52 sm:h-52 text-on-surface"
      fill="currentColor"
      viewBox="0 0 100 100"
      aria-label={`QR Code for ${seed}`}
    >
      {/* Top-Left Finder */}
      <rect height="28" rx="3" width="28" x="5" y="5" />
      <rect fill="#FFFFFF" height="20" rx="2" width="20" x="9" y="9" />
      <rect height="12" rx="1.5" width="12" x="13" y="13" />
      {/* Top-Right Finder */}
      <rect height="28" rx="3" width="28" x="67" y="5" />
      <rect fill="#FFFFFF" height="20" rx="2" width="20" x="71" y="9" />
      <rect height="12" rx="1.5" width="12" x="75" y="13" />
      {/* Bottom-Left Finder */}
      <rect height="28" rx="3" width="28" x="5" y="67" />
      <rect fill="#FFFFFF" height="20" rx="2" width="20" x="9" y="71" />
      <rect height="12" rx="1.5" width="12" x="13" y="75" />

      {/* Timing & Matrix Data */}
      <rect height="4" width="4" x="37" y="10" />
      <rect height="4" width="4" x="45" y="10" />
      <rect height="4" width="4" x="53" y="10" />
      <rect height="4" width="4" x="10" y="37" />
      <rect height="4" width="4" x="10" y="45" />
      <rect height="4" width="4" x="10" y="53" />
      <rect height="8" width="8" x="37" y="37" />
      <rect height="4" width="4" x="49" y="37" />
      <rect height="4" width="8" x="57" y="37" />
      <rect height="8" width="4" x="37" y="49" />
      <rect height="10" width="10" x="45" y="45" />
      <rect height="6" width="6" x="59" y="45" />
      <rect height="4" width="4" x="69" y="37" />
      <rect height="4" width="8" x="77" y="37" />
      <rect height="8" width="6" x="89" y="37" />
      <rect height="4" width="8" x="37" y="61" />
      <rect height="8" width="4" x="49" y="61" />
      <rect height="8" width="6" x="57" y="57" />
      <rect height="4" width="8" x="69" y="49" />
      <rect height="8" width="4" x="81" y="49" />
      <rect height="6" width="6" x="69" y="61" />
      <rect height="4" width="16" x="79" y="61" />
      <rect height="6" width="6" x="37" y="73" />
      <rect height="4" width="6" x={toggle ? "47" : "45"} y="73" />
      <rect height="6" width="6" x="57" y="73" />
      <rect height="4" width="8" x="37" y="83" />
      <rect height="8" width="4" x="49" y="81" />
      <rect height="4" width="8" x="57" y="83" />
      <rect height="8" width="4" x="69" y="73" />
      <rect height="4" width="8" x="77" y="73" />
      <rect height="6" width="6" x="89" y="73" />
      <rect height="4" width="8" x="69" y="85" />
      <rect height="8" width="4" x="81" y="81" />
      <rect height="6" width="6" x="89" y="83" />
      {toggle ? (
        <rect height="5" width="5" x="22" y="44" />
      ) : (
        <rect height="5" width="5" x="24" y="52" />
      )}

      {/* Center Coral Punchout Badge */}
      <circle cx="50" cy="50" fill="#FF5A5F" r="10" />
      <polygon fill="#FFFFFF" points="46,45 56,50 46,55" />
    </svg>
  );
}
