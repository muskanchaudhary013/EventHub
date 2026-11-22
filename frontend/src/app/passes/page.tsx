"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AtSign,
  BadgeCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Cpu,
  Download,
  Info,
  Lock,
  Mail,
  MapPin,
  Palette,
  Printer,
  QrCode,
  Send,
  Terminal,
  Timer,
  Wallet,
  Zap,
} from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { QrCodeSvg } from "@/components/QrCodeSvg";
import { useEventHub } from "@/context/EventHubContext";

export default function DigitalPassesPage() {
  const { passes } = useEventHub();
  const [activePassId, setActivePassId] = useState<string>(passes[0]?.id || "pass-1");
  const [copied, setCopied] = useState(false);
  const [walletSaved, setWalletSaved] = useState(false);
  const [emailedTeam, setEmailedTeam] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySent, setRecoverySent] = useState(false);

  const activePass =
    passes.find((p) => p.id === activePassId) || passes[0];

  const secondaryPasses = passes.filter((p) => p.id !== activePass?.id);

  const handleCopy = () => {
    if (!activePass) return;
    navigator.clipboard?.writeText(activePass.passCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownloadJsonTicket = () => {
    if (!activePass) return;
    const blob = new Blob(
      [
        `EventHub Cryptographic Gate Pass\n================================\nEvent: ${activePass.eventTitle}\nPass Token: ${activePass.passCode}\nHolder: ${activePass.holderName} (${activePass.holderEmail})\nTeam: ${activePass.teamName || "Solo"} (${activePass.booth || "General"})\nVenue: ${activePass.venue}\nDates: ${activePass.dateRange}\nSignature: ${activePass.sigHash}\n`,
      ],
      { type: "text/plain;charset=utf-8" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activePass.passCode}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

      <main className="w-full pt-16 flex-1">
        <div className="relative w-full overflow-hidden px-4 md:px-8 py-6 md:py-8">
          {/* Ambient blobs matching Stitch */}
          <div className="absolute -top-32 -right-24 w-96 h-96 rounded-full bg-primary-container/10 blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 -left-20 w-80 h-80 rounded-full bg-tertiary-container/10 blur-3xl pointer-events-none" />

          {/* Header Section */}
          <div className="max-w-6xl mx-auto mb-6 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-label-token uppercase font-semibold">
                    Offline Access Verified
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-label-code text-on-surface-variant text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container animate-pulse" />
                    Live Sync Active
                  </span>
                </div>
                <h1 className="font-headline text-headline-lg font-extrabold text-on-surface tracking-tight">
                  Your Digital Event Passes &amp; Badges
                </h1>
                <p className="text-[15px] text-on-surface-variant max-w-2xl mt-1">
                  Present scannable QR tokens at campus gate scanners for
                  instant check-in. Passes work offline and store cryptographic
                  entry validation directly on your device.
                </p>
              </div>

              {/* Confirmed Pass Counter Pill */}
              <div className="flex items-center gap-3 bg-surface-container-lowest px-4 py-2.5 rounded-xl shadow-sm border border-[#E8E2D5] shrink-0">
                <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary-container font-headline text-[20px] font-bold">
                  {passes.length}
                </div>
                <div className="flex flex-col">
                  <span className="text-label-code text-on-surface font-semibold">
                    Confirmed Passes
                  </span>
                  <span className="text-[12px] text-on-surface-variant">
                    Stanford Fall Fest 2025
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
            {/* Primary Pass Showcase (Col 1-8) */}
            <div className="lg:col-span-8 space-y-4">
              {/* Multi-Pass Tab Selector */}
              <div className="flex items-center gap-1.5 bg-surface-container-low p-1.5 rounded-xl w-fit max-w-full overflow-x-auto no-scrollbar">
                {passes.map((p) => {
                  const selected = p.id === activePass?.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setActivePassId(p.id);
                        setCopied(false);
                        setWalletSaved(false);
                        setEmailedTeam(false);
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-label-token uppercase flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                        selected
                          ? "bg-surface-container-lowest shadow-sm font-bold text-on-surface"
                          : "text-on-surface-variant hover:text-on-surface font-semibold"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          p.dotColor === "coral"
                            ? "bg-primary-container"
                            : "bg-tertiary-container"
                        }`}
                      />
                      <span>{p.shortTabLabel}</span>
                    </button>
                  );
                })}
              </div>

              {/* High-Tactility Perforated QR Pass Card */}
              {activePass && (
                <div className="relative bg-surface-container-lowest rounded-2xl shadow-md border border-[#E8E2D5] overflow-hidden">
                  {/* Dark Obsidian Header Strip */}
                  <div className="relative bg-gradient-to-r from-on-surface to-inverse-surface p-5 sm:p-6 text-on-primary">
                    <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 overflow-hidden pointer-events-none">
                      <svg
                        className="w-full h-full fill-current text-surface-container-lowest"
                        viewBox="0 0 100 100"
                      >
                        <polygon points="0 0, 100 0, 100 100" />
                        <circle cx="50" cy="50" r="30" />
                      </svg>
                    </div>
                    <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 mb-3">
                      <span className="px-3 py-1 rounded-full bg-primary-container text-on-primary text-label-token uppercase font-bold tracking-wider">
                        {activePass.trackLabel}
                      </span>
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-container/20 text-tertiary-fixed text-label-token uppercase font-bold">
                        <BadgeCheck className="w-3.5 h-3.5" />
                        <span>Registered &amp; Confirmed</span>
                      </div>
                    </div>
                    <h2 className="font-headline text-headline-lg font-bold tracking-tight text-white mb-2">
                      {activePass.eventTitle}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-surface-variant">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {activePass.dateRange}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {activePass.gateTime}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {activePass.venue}
                      </span>
                    </div>
                  </div>

                  {/* Card Body: Perforated Split Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-12 relative">
                    {/* Left Ticket Body (7 cols) */}
                    <div className="md:col-span-7 p-5 sm:p-6 space-y-4">
                      {/* Team Designation */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-label-token uppercase text-on-surface-variant">
                            Team Designation
                          </span>
                          <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface text-label-code text-xs">
                            {activePass.booth || "Booth B-14"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center font-headline font-bold text-on-secondary-fixed shrink-0">
                            {(activePass.teamName || "SE")
                              .split(" ")
                              .map((s) => s[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-headline text-[18px] font-bold text-on-surface">
                              {activePass.teamName || "Team SyntaxErrors"}
                            </h3>
                            <p className="text-[13px] text-on-surface-variant">
                              {activePass.tierLabel}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Primary Holder */}
                      <div className="p-3 rounded-xl bg-surface-container-low space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-label-token uppercase text-on-surface-variant font-semibold">
                            Primary Pass Holder (Lead)
                          </span>
                          <span className="text-label-token uppercase text-tertiary font-bold">
                            Primary Contact
                          </span>
                        </div>
                        <div className="font-headline text-[17px] font-bold text-on-surface">
                          {activePass.holderName}
                        </div>
                        <div className="text-label-code text-xs text-on-surface-variant">
                          {activePass.holderEmail}
                        </div>
                      </div>

                      {/* Accredited Teammates */}
                      {activePass.teammates.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-label-token uppercase text-on-surface-variant font-semibold">
                            Accredited Teammates
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {activePass.teammates.map((tm) => (
                              <div
                                key={tm.name}
                                className="flex items-center gap-2.5 p-2.5 rounded-lg bg-surface-container-lowest border border-[#E8E2D5]/70 shadow-2xs"
                              >
                                {tm.icon === "palette" ? (
                                  <Palette className="w-4 h-4 text-primary-container shrink-0" />
                                ) : tm.icon === "cpu" ? (
                                  <Cpu className="w-4 h-4 text-secondary shrink-0" />
                                ) : (
                                  <Terminal className="w-4 h-4 text-tertiary shrink-0" />
                                )}
                                <div className="truncate">
                                  <div className="text-[13px] font-semibold text-on-surface truncate">
                                    {tm.name}
                                  </div>
                                  <div className="text-label-token uppercase text-on-surface-variant">
                                    {tm.role}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Security Pass ID */}
                      <div className="pt-1">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-high/60">
                          <div className="flex flex-col">
                            <span className="text-label-token uppercase text-on-surface-variant">
                              Unique Pass Token
                            </span>
                            <span className="text-label-code font-bold text-on-surface text-sm sm:text-base tracking-wider">
                              {activePass.passCode}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleCopy}
                            className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface text-label-token uppercase font-bold transition-all shadow-sm cursor-pointer"
                          >
                            {copied ? "Copied!" : "Copy ID"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right QR Ticket Section (5 cols) with Vertical Perforation Divider */}
                    <div className="md:col-span-5 p-5 sm:p-6 flex flex-col items-center justify-between text-center bg-surface-container-low/40 border-t md:border-t-0 md:border-l-2 border-dashed border-outline-variant/60 relative">
                      {/* Semicircular cutouts on vertical perforation seam (desktop) */}
                      <div className="hidden md:block absolute -left-3 -top-3 w-6 h-6 rounded-full bg-background border-b border-outline-variant/30" />
                      <div className="hidden md:block absolute -left-3 -bottom-3 w-6 h-6 rounded-full bg-background border-t border-outline-variant/30" />

                      {/* Countdown Badge */}
                      <div className="w-full flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-label-token uppercase font-bold mb-3">
                        <Timer className="w-3.5 h-3.5" />
                        <span>{activePass.countdownLabel}</span>
                      </div>

                      {/* QR Code with Coral Corner Brackets */}
                      <div className="relative p-4 bg-surface-container-lowest rounded-2xl shadow-md my-2 group">
                        <div className="absolute top-2 left-2 w-5 h-5 border-t-4 border-l-4 border-primary-container rounded-tl-xs pointer-events-none transition-all group-hover:scale-110" />
                        <div className="absolute top-2 right-2 w-5 h-5 border-t-4 border-r-4 border-primary-container rounded-tr-xs pointer-events-none transition-all group-hover:scale-110" />
                        <div className="absolute bottom-2 left-2 w-5 h-5 border-b-4 border-l-4 border-primary-container rounded-bl-xs pointer-events-none transition-all group-hover:scale-110" />
                        <div className="absolute bottom-2 right-2 w-5 h-5 border-b-4 border-r-4 border-primary-container rounded-br-xs pointer-events-none transition-all group-hover:scale-110" />

                        <QrCodeSvg size="lg" seed={activePass.passCode} />

                        <div className="mt-2 text-center">
                          <span className="text-label-token uppercase text-on-surface-variant font-bold">
                            Fast Gate Scan Token
                          </span>
                        </div>
                      </div>

                      {/* Verification Hash */}
                      <div className="w-full flex items-center justify-between px-3 py-1.5 rounded bg-surface-container text-on-surface-variant text-label-code text-[11px] truncate mt-2">
                        <span className="font-semibold">SIG:</span>
                        <span className="truncate ml-1 font-mono">
                          {activePass.sigHash}
                        </span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-tertiary ml-1 shrink-0" />
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="p-4 bg-surface-container-high/40 flex flex-wrap items-center justify-between gap-3 border-t border-[#E8E2D5]/60 no-print">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDownloadJsonTicket}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary-container text-on-primary text-[13px] font-semibold hover:bg-primary transition-all shadow-sm active:scale-95 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Pass</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setWalletSaved(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface text-[13px] font-semibold hover:bg-surface-container transition-colors shadow-sm border border-[#E8E2D5] cursor-pointer"
                      >
                        <Wallet className="w-4 h-4" />
                        <span>
                          {walletSaved
                            ? "Saved to Wallet ✓"
                            : "Save to Apple / Google Wallet"}
                        </span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEmailedTeam(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-on-surface text-[13px] transition-colors shadow-sm border border-[#E8E2D5] cursor-pointer"
                      >
                        <Mail className="w-4 h-4" />
                        <span className="hidden sm:inline">
                          {emailedTeam ? "Sent to Team ✓" : "Email Teammates"}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => window.print()}
                        title="Print Friendly View"
                        className="p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-on-surface transition-colors shadow-sm border border-[#E8E2D5] cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Secondary Passes in Wallet */}
              {secondaryPasses.map((sp) => (
                <div
                  key={sp.id}
                  className="bg-surface-container-lowest rounded-2xl shadow-sm border border-[#E8E2D5] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-secondary-fixed flex items-center justify-center shrink-0 text-on-secondary-fixed">
                      <Cpu className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-label-token uppercase font-bold">
                          {sp.status}
                        </span>
                        <span className="text-label-code text-xs text-on-surface-variant">
                          {sp.passCode}
                        </span>
                      </div>
                      <h3 className="font-headline text-[18px] font-bold text-on-surface">
                        {sp.eventTitle}
                      </h3>
                      <p className="text-[13px] text-on-surface-variant">
                        {sp.tierLabel} · {sp.holderName} · {sp.venue} ·{" "}
                        {sp.dateRange}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActivePassId(sp.id)}
                    className="px-4 py-2 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container font-headline text-[13px] font-semibold transition-colors flex items-center gap-1.5 shrink-0 self-end sm:self-center cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>View QR</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Sidebar: Quick Lookup & Operational Guidance (Col 9-12) */}
            <div className="lg:col-span-4 space-y-4">
              {/* Retrieve Pass by Email Card */}
              <div
                id="retrieve"
                className="bg-surface-container-lowest rounded-2xl shadow-sm border border-[#E8E2D5] p-5 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-on-primary-fixed shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-headline text-[18px] font-bold text-on-surface">
                      Retrieve Pass by Email
                    </h3>
                    <p className="text-[12px] text-on-surface-variant">
                      Self-service digital recovery link
                    </p>
                  </div>
                </div>

                <form
                  className="space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setRecoverySent(true);
                  }}
                >
                  <div>
                    <label
                      htmlFor="campusEmail"
                      className="block text-label-token uppercase text-on-surface-variant font-semibold mb-1"
                    >
                      Campus Institutional Email
                    </label>
                    <div className="relative">
                      <AtSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                      <input
                        id="campusEmail"
                        type="email"
                        required
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        placeholder="alex.chen@campus.edu"
                        className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-surface-container-low text-on-surface text-[13px] focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container border border-transparent focus:border-primary-container"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-lg bg-surface-container-highest text-on-surface hover:bg-primary-container hover:text-on-primary font-headline text-[13px] font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Magic Link &amp; Pass</span>
                  </button>

                  {recoverySent && (
                    <div className="p-3 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed text-xs flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                      <p>
                        Pass recovery packet sent to{" "}
                        <strong>{recoveryEmail || "your inbox"}</strong>!
                        Offline snapshot refreshed.
                      </p>
                    </div>
                  )}
                </form>

                <div className="pt-1 flex items-start gap-2 text-on-surface-variant">
                  <Lock className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                  <p className="text-xs">
                    Lost your physical badge? Gate volunteers accept phone
                    displays with valid photo identification.
                  </p>
                </div>
              </div>

              {/* Venue & Gate Instructions */}
              <div className="bg-surface-container-low rounded-2xl border border-[#E8E2D5] p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary-container" />
                  <h4 className="font-headline text-[17px] font-bold text-on-surface">
                    Campus Gate Instructions
                  </h4>
                </div>
                <ul className="space-y-2 text-xs text-on-surface-variant">
                  {[
                    "Set phone brightness to 100% when presenting QR token to optical barcode scanner.",
                    "Team members must check in together or have individual tokens ready in mobile wallet.",
                    "Hardware hackathon entrants: proceed directly to Turing Hall Loading Bay for equipment tagging.",
                  ].map((step, idx) => (
                    <li key={step} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-[10px] text-on-surface shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-1">
                  <Link
                    href="/faq"
                    className="inline-flex items-center gap-1 text-label-token uppercase text-primary-container font-bold hover:underline"
                  >
                    Check accreditation guidelines →
                  </Link>
                </div>
              </div>

              {/* Lab Safety Pass Mini Banner */}
              <div className="bg-gradient-to-br from-secondary-fixed to-secondary-container p-5 rounded-2xl text-on-secondary-container space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-label-token uppercase font-bold text-on-secondary-fixed-variant">
                    Lab Safety Pass
                  </span>
                  <Zap className="w-5 h-5" />
                </div>
                <p className="text-[14px] font-semibold">
                  Turing Hardware Bay Certified
                </p>
                <p className="text-xs opacity-90">
                  Soldering irons, oscilloscopes, and 3D printing stations
                  cleared for Team SyntaxErrors.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
