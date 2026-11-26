"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AlarmClock,
  BadgeCheck,
  Ban,
  BatteryCharging,
  Check,
  CheckCircle2,
  Delete,
  Flag,
  Flashlight,
  HelpCircle,
  History,
  IdCard,
  Keyboard,
  Printer,
  QrCode,
  RefreshCw,
  ScanBarcode,
  ScanLine,
  ShieldAlert,
  ShieldCheck,
  Undo2,
  User,
  Users,
  Volume2,
  VolumeX,
  Wifi,
  X,
} from "lucide-react";
import { OpsShell } from "@/components/OpsShell";
import { ALEX_AVATAR_URL, SCANNER_BG_URL } from "@/lib/eventhub-data";
import { useEventHub } from "@/context/EventHubContext";
import { useAuth } from "@/context/AuthContext";

type ScanResultState = "valid" | "duplicate" | "invalid" | "late";

export default function VolunteerDashboardPage() {
  const { user } = useAuth();
  const { scanLogs, passes, checkInPass, addScanLog, undoLatestScan } = useEventHub();

  const [scanState, setScanState] = useState<ScanResultState>("valid");
  const [wedgeMode, setWedgeMode] = useState(true);
  const [torchOn, setTorchOn] = useState(false);
  const [audioOn, setAudioOn] = useState(true);
  const [camFlipped, setCamFlipped] = useState(false);
  const [manualCode, setManualCode] = useState("EH-2026-HCK-9481");
  const [shiftCount, setShiftCount] = useState(418);
  const [undoSeconds, setUndoSeconds] = useState(10);
  const [bannerToast, setBannerToast] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState({
    passId: "EH-2026-ENG-3190",
    holder: "Priya Sharma",
    time: "08:42:19 AM",
    gate: "Gate 1",
  });
  const [invalidInfo, setInvalidInfo] = useState({
    token: "FORGED-QR-0000",
    reason: "Invalid or unauthorized registration: forged, expired, or unregistered QR code.",
  });
  const [lastScannedAttendee, setLastScannedAttendee] = useState({
    name: "Alex Chen",
    role: "Lead Hacker",
    team: "Team SyntaxErrors • Table #B-14",
    passId: "EH-2026-HCK-9481",
    track: "HackCampus 2026",
    perks: "Valid & Verified Registration • Access Granted",
    time: "09:14:02 AM",
  });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (undoSeconds <= 0) return;
    const t = setTimeout(() => setUndoSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [undoSeconds]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setManualCode("");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const showToast = (msg: string) => {
    setBannerToast(msg);
    setTimeout(() => setBannerToast(null), 2800);
  };

  const triggerSimulated = (next: ScanResultState) => {
    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setScanState(next);
    setUndoSeconds(10);

    if (next === "valid") {
      setShiftCount((c) => Math.min(650, c + 1));
      setLastScannedAttendee({
        name: "Alex Chen",
        role: "Lead Hacker",
        team: "Team SyntaxErrors • Table #B-14",
        passId: "EH-2025-HCK-9481",
        track: "HackCampus 2025",
        perks: "Full Access Pass + Food Token",
        time: now,
      });
      addScanLog({
        id: `scan-${Date.now()}`,
        time: now.replace(/\s?[AP]M/, ""),
        attendee: "Alex Chen",
        subtitle: "(Team SyntaxErrors)",
        event: "HackCampus 2025",
        passId: "EH-2025-HCK-9481",
        status: "Valid",
      });
    } else if (next === "duplicate") {
      setDuplicateInfo({
        passId: "EH-2026-ENG-3190",
        holder: "Priya Sharma",
        time: "08:42:19 AM",
        gate: "Gate 1",
      });
      addScanLog({
        id: `scan-${Date.now()}`,
        time: now.replace(/\s?[AP]M/, ""),
        attendee: "Priya Sharma",
        event: "Stanford AI Summit",
        passId: "EH-2026-ENG-3190",
        status: "Duplicate",
      });
    } else if (next === "invalid") {
      setInvalidInfo({
        token: "EH-FORGED-9999",
        reason:
          "Cryptographic signature check failed. Forged, expired, or unregistered QR code.",
      });
      showToast("Blocked invalid / forged QR token");
    } else {
      addScanLog({
        id: `scan-${Date.now()}`,
        time: now.replace(/\s?[AP]M/, ""),
        attendee: "Jordan Rivera",
        event: "Algorithmic Game Design",
        passId: "EH-2026-DES-8114",
        status: "Late",
        lateMinutes: 14,
      });
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = manualCode.trim();
    if (!cleaned) return;
    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const verification = checkInPass(cleaned, "Gate 2 Turing Hall");
    setUndoSeconds(10);

    if (verification.status === "granted" && verification.pass) {
      const p = verification.pass;
      setScanState("valid");
      setShiftCount((c) => Math.min(650, c + 1));
      setLastScannedAttendee({
        name: p.holderName,
        role: p.teamName && p.teamName !== "Solo Entrant" ? "Team Leader" : "Solo Entrant",
        team: `${p.teamName || "Solo"} • ${p.booth || "Gate 2"}`,
        passId: p.passCode,
        track: p.eventTitle.split(":")[0],
        perks: "Valid & Verified Registration • Access Granted",
        time: now,
      });
      showToast(`Access Granted: ${p.holderName} (${p.passCode})`);
      return;
    }

    if (verification.status === "duplicate" && verification.pass) {
      const p = verification.pass;
      setScanState("duplicate");
      setDuplicateInfo({
        passId: p.passCode,
        holder: p.holderName,
        time: verification.firstCheckInTime || p.checkInTime || "08:42:19 AM",
        gate: verification.gateLocation || p.checkInGate || "Gate 2 Turing Hall",
      });
      showToast(`Duplicate Scan Blocked: ${p.passCode} already checked in`);
      return;
    }

    // Invalid or Unauthorized
    setScanState("invalid");
    setInvalidInfo({
      token: cleaned,
      reason: verification.message,
    });
    showToast(`Invalid / Unauthorized QR Code: ${cleaned}`);
  };

  const handleUndo = () => {
    const removed = undoLatestScan();
    if (removed) {
      setShiftCount((c) => Math.max(0, c - 1));
      setUndoSeconds(0);
      showToast(`Reverted scan for ${removed.attendee} (${removed.passId})`);
    }
  };

  const shiftPercent = ((shiftCount / 650) * 100).toFixed(1);

  return (
    <OpsShell
      allowedRoles={["volunteer"]}
      consoleTitle="Volunteer Gate Console"
      consoleBadge="Gate Ops"
    >
      <div className="flex flex-col w-full">
        {/* Operational Sub-Header Bar */}
        <div className="w-full bg-surface-container-lowest shadow-sm border-b border-[#E8E2D5] px-4 md:px-8 py-4 mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center justify-center w-2.5 h-2.5 rounded-full bg-tertiary-container animate-pulse" />
              <span className="text-label-token uppercase tracking-wider text-on-surface-variant">
                Gate Console Active • Gate 02 Turing Hall
              </span>
            </div>
            <h1 className="font-headline text-headline-md font-bold text-on-surface tracking-tight">
              Gate 2 Entrance Scanner — Turing Hall
            </h1>
            <p className="text-[13px] text-on-surface-variant flex items-center gap-1.5 mt-0.5">
              <IdCard className="w-4 h-4 text-primary" />
              <span>
                Logged in as{" "}
                <strong className="text-on-surface">
                  {user?.displayName || user?.email || "Gate Volunteer"}
                </strong>{" "}
                • North Foyer Station
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-surface-container-low px-4 py-2 rounded-xl flex items-center gap-3 border border-[#E8E2D5]/70">
              <div className="flex flex-col">
                <span className="text-label-token uppercase text-on-surface-variant">
                  Shift Progress
                </span>
                <span className="text-label-code font-bold text-on-surface">
                  {shiftCount}{" "}
                  <span className="text-on-surface-variant font-normal">
                    / 650 quota
                  </span>
                </span>
              </div>
              <div className="w-24 h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className="h-full bg-tertiary-container rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Number(shiftPercent))}%` }}
                />
              </div>
              <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-label-token font-bold">
                {Math.round(Number(shiftPercent))}% Done
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setWedgeMode((w) => !w)}
                className="px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-[13px] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ScanBarcode className="w-4 h-4" />
                <span className="hidden sm:inline">
                  Wedge Mode:{" "}
                  <strong className={wedgeMode ? "text-tertiary" : "text-error"}>
                    {wedgeMode ? "ON" : "OFF"}
                  </strong>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setHelpOpen(true)}
                title="Gate Protocols"
                className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {bannerToast && (
          <div className="px-4 md:px-8 mb-4">
            <div className="p-3 rounded-xl bg-on-surface text-surface text-[13px] font-medium flex items-center justify-between shadow-md">
              <span>{bannerToast}</span>
              <button
                type="button"
                onClick={() => setBannerToast(null)}
                className="opacity-70 hover:opacity-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Main 2-Column Split Console */}
        <div className="px-4 md:px-8 pb-10 grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-5 flex flex-col gap-4">
            <div className="bg-inverse-surface rounded-2xl p-4 text-inverse-on-surface shadow-xl flex flex-col relative overflow-hidden">
              <div className="flex items-center justify-between mb-3 z-10">
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-tertiary-container animate-ping" />
                  <span className="text-label-code text-tertiary-fixed">
                    CAMERA {camFlipped ? "02" : "01"} • 60 FPS
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTorchOn((v) => !v)}
                    title="Toggle Torch"
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${
                      torchOn
                        ? "bg-secondary-container text-on-secondary-container"
                        : "bg-black/40 hover:bg-black/70 text-inverse-on-surface"
                    }`}
                  >
                    <Flashlight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCamFlipped((v) => !v)}
                    title="Flip Camera"
                    className="p-2 rounded-lg bg-black/40 hover:bg-black/70 text-inverse-on-surface transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAudioOn((v) => !v)}
                    title="Toggle Scan Beep"
                    className="p-2 rounded-lg bg-black/40 hover:bg-black/70 text-inverse-on-surface transition-colors cursor-pointer"
                  >
                    {audioOn ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-error" />
                    )}
                  </button>
                </div>
              </div>

              <div className="relative w-full aspect-square rounded-xl bg-black overflow-hidden flex items-center justify-center shadow-inner">
                <div
                  className={`absolute inset-0 bg-cover bg-center transition-all duration-300 ${
                    torchOn ? "opacity-65 brightness-125" : "opacity-40 contrast-125"
                  }`}
                  style={{ backgroundImage: `url('${SCANNER_BG_URL}')` }}
                />

                <div className="relative w-60 h-60 sm:w-64 sm:h-64 z-20 flex items-center justify-center">
                  <div className="absolute top-0 left-0 w-7 h-7 border-t-4 border-l-4 border-tertiary-fixed rounded-tl-xs" />
                  <div className="absolute top-0 right-0 w-7 h-7 border-t-4 border-r-4 border-tertiary-fixed rounded-tr-xs" />
                  <div className="absolute bottom-0 left-0 w-7 h-7 border-b-4 border-l-4 border-tertiary-fixed rounded-bl-xs" />
                  <div className="absolute bottom-0 right-0 w-7 h-7 border-b-4 border-r-4 border-tertiary-fixed rounded-br-xs" />
                  <div className="absolute left-1 right-1 h-1 bg-tertiary-fixed shadow-[0_0_15px_#4edea3,0_0_30px_#4edea3] rounded-full animate-scan-sweep" />
                  <div className="opacity-25 flex items-center justify-center pointer-events-none">
                    <QrCode className="w-20 h-20 text-inverse-on-surface" />
                  </div>
                  <div className="absolute w-3 h-3 rounded-full border border-tertiary-fixed/60" />
                </div>

                <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md">
                  <span className="text-[12px] text-inverse-on-surface/90 flex items-center gap-1.5">
                    <ScanLine className="w-4 h-4 text-tertiary-fixed" />
                    Align QR code inside reticle
                  </span>
                  <span className="text-label-code text-[11px] text-inverse-on-surface/60">
                    AUTO-DETECT
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-1 flex items-center justify-between gap-2 flex-wrap">
                <span className="text-label-token text-inverse-on-surface/70 uppercase">
                  Trigger Simulated Scan:
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => triggerSimulated("valid")}
                    className="px-2.5 py-1 rounded bg-tertiary-container hover:bg-tertiary text-on-tertiary text-label-token font-bold transition-all cursor-pointer"
                  >
                    Valid
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerSimulated("duplicate")}
                    className="px-2.5 py-1 rounded bg-error hover:bg-error/90 text-on-error text-label-token font-bold transition-all cursor-pointer"
                  >
                    Duplicate
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerSimulated("invalid")}
                    className="px-2.5 py-1 rounded bg-[#7F1D1D] hover:bg-[#991B1B] text-white text-label-token font-bold transition-all cursor-pointer"
                  >
                    Invalid
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerSimulated("late")}
                    className="px-2.5 py-1 rounded bg-secondary-container hover:bg-secondary text-on-secondary-container hover:text-white text-label-token font-bold transition-all cursor-pointer"
                  >
                    Late
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-5 border border-[#E8E2D5] shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Keyboard className="w-5 h-5 text-primary" />
                  <h2 className="font-headline text-[18px] font-bold text-on-surface">
                    Manual Code Fallback
                  </h2>
                </div>
                <span className="text-label-token uppercase px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                  Rapid Wedge
                </span>
              </div>
              <p className="text-[13px] text-on-surface-variant mb-4">
                Type or scan physical badge bar code string if screen brightness
                or cracked glass prevents optical QR alignment.
              </p>

              <form onSubmit={handleManualSubmit} className="flex flex-col gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="EH-2025-XXXX-XXXX"
                  spellCheck={false}
                  autoComplete="off"
                  className="w-full px-4 py-3 rounded-lg bg-surface-container-low text-on-surface text-label-code uppercase tracking-wider outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container border border-outline-variant/30 transition-all"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-headline text-[14px] font-semibold flex items-center justify-center gap-1.5 transition-transform active:scale-[0.98] shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Validate Pass (Enter)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualCode("")}
                    title="Clear input"
                    className="p-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors cursor-pointer"
                  >
                    <Delete className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-[#E8E2D5] shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed shrink-0">
                  <Wifi className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-label-token uppercase text-on-surface-variant">
                    Gate Mesh
                  </span>
                  <span className="font-headline text-[13px] font-bold text-on-surface truncate">
                    Online
                  </span>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-[#E8E2D5] shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed shrink-0">
                  <BatteryCharging className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-label-token uppercase text-on-surface-variant">
                    HUD Battery
                  </span>
                  <span className="font-headline text-[13px] font-bold text-on-surface truncate">
                    94% Charging
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-7 flex flex-col gap-4">
            {scanState === "valid" && (
              <div className="bg-[#ECFDF5] border border-[#10B981]/25 rounded-2xl p-6 shadow-sm flex flex-col relative overflow-hidden">
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background pointer-events-none" />
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background pointer-events-none" />

                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#10B981] text-white">
                      <BadgeCheck className="w-5 h-5" />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-label-token font-bold text-[#065F46] uppercase tracking-wider">
                        Pass Validated • Access Granted
                      </span>
                      <span className="text-label-code text-[#047857]">
                        SCAN TIMESTAMP: Today at {lastScannedAttendee.time}
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#10B981] text-white text-label-token font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    <Check className="w-3.5 h-3.5" /> Valid Entry
                  </span>
                </div>

                <div className="bg-surface-container-lowest rounded-xl p-4 mb-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={ALEX_AVATAR_URL}
                      alt={lastScannedAttendee.name}
                      className="w-16 h-16 rounded-xl object-cover shadow-sm shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-headline text-[19px] font-bold text-on-surface truncate">
                          {lastScannedAttendee.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed text-label-token font-semibold uppercase">
                          {lastScannedAttendee.role}
                        </span>
                      </div>
                      <p className="text-[14px] text-on-surface-variant font-medium">
                        {lastScannedAttendee.team}
                      </p>
                      <span className="text-label-code text-primary font-bold mt-0.5">
                        {lastScannedAttendee.passId}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end text-left md:text-right shrink-0">
                    <span className="text-label-token uppercase text-on-surface-variant">
                      Authorized Track
                    </span>
                    <span className="font-headline text-[16px] font-bold text-on-surface">
                      {lastScannedAttendee.track}
                    </span>
                    <span className="text-label-code text-[#059669]">
                      {lastScannedAttendee.perks}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      showToast("Marked all 3 members of Team SyntaxErrors Present!")
                    }
                    className="w-full sm:flex-1 py-3 px-4 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white font-headline text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <Users className="w-4 h-4" />
                    <span>Mark Team Present (All 3 Members)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      showToast("Checked in Lead Hacker only (1 member)")
                    }
                    className="w-full sm:w-auto py-3 px-4 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    <span>Leader Only</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="w-full sm:w-auto py-3 px-4 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Badge</span>
                  </button>
                </div>
              </div>
            )}

            {scanState === "duplicate" && (
              <div className="bg-[#FEF2F2] border border-[#EF4444]/30 rounded-2xl p-6 shadow-sm flex flex-col relative overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#EF4444] text-white">
                      <Ban className="w-5 h-5" />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-label-token font-bold text-[#991B1B] uppercase tracking-wider">
                        Duplicate Scan Detected • Entry Refused
                      </span>
                      <span className="text-label-code text-[#B91C1C]">
                        INVESTIGATION REQUIRED
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#EF4444] text-white text-label-token font-bold uppercase tracking-wider shadow-sm">
                    Blocked #02
                  </span>
                </div>

                <div className="bg-surface-container-lowest rounded-xl p-4 mb-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="w-6 h-6 text-[#EF4444] shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <h4 className="font-headline text-[17px] font-bold text-on-surface">
                        Already Checked In at {duplicateInfo.gate}
                      </h4>
                      <p className="text-[13px] text-on-surface-variant mt-1">
                        Pass{" "}
                        <strong className="text-label-code text-on-surface">
                          {duplicateInfo.passId}
                        </strong>{" "}
                        ({duplicateInfo.holder}) was already checked in at{" "}
                        <strong className="text-on-surface">{duplicateInfo.time}</strong>.
                        Duplicate entry refused.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() =>
                      showToast("Incident escalated to Campus Security Desk #01")
                    }
                    className="px-4 py-2.5 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white text-[13px] font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <Flag className="w-4 h-4" />
                    <span>Confiscate Pass &amp; Escalate</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setScanState("valid")}
                    className="px-4 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface text-[13px] font-semibold hover:bg-surface-container transition-colors shadow-sm cursor-pointer"
                  >
                    Dismiss Notice
                  </button>
                </div>
              </div>
            )}

            {scanState === "invalid" && (
              <div className="bg-[#450A0A]/15 border border-[#EF4444]/40 rounded-2xl p-6 shadow-sm flex flex-col relative overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#DC2626] text-white">
                      <ShieldAlert className="w-5 h-5" />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-label-token font-bold text-[#DC2626] uppercase tracking-wider">
                        Invalid or Unauthorized Registration • Access Denied
                      </span>
                      <span className="text-label-code text-[#B91C1C]">
                        SERVER SIGNATURE VERIFICATION FAILED
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#DC2626] text-white text-label-token font-bold uppercase tracking-wider shadow-sm">
                    Unauthorized
                  </span>
                </div>

                <div className="bg-surface-container-lowest rounded-xl p-4 mb-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <Ban className="w-6 h-6 text-[#DC2626] shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <h4 className="font-headline text-[17px] font-bold text-on-surface">
                        Forged, Expired, or Unregistered QR Code
                      </h4>
                      <p className="text-[13px] text-on-surface-variant mt-1">
                        Token:{" "}
                        <strong className="text-label-code text-on-surface">
                          {invalidInfo.token}
                        </strong>
                        <br />
                        {invalidInfo.reason}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() =>
                      showToast("Logged unauthorized scan attempt to Security Audit")
                    }
                    className="px-4 py-2.5 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[13px] font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <Flag className="w-4 h-4" />
                    <span>Report Forged Pass</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setScanState("valid")}
                    className="px-4 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface text-[13px] font-semibold hover:bg-surface-container transition-colors shadow-sm cursor-pointer"
                  >
                    Clear Scanner
                  </button>
                </div>
              </div>
            )}

            {scanState === "late" && (
              <div className="bg-[#FEF3C7] border border-[#F59E0B]/30 rounded-2xl p-6 shadow-sm flex flex-col relative overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#F59E0B] text-white">
                      <AlarmClock className="w-5 h-5" />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-label-token font-bold text-[#92400E] uppercase tracking-wider">
                        Late Check-In Warning • Grace Window Expired
                      </span>
                      <span className="text-label-code text-[#B45309]">
                        SCANNED AT 09:14 AM (GRACE CLOSED 09:00 AM)
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#F59E0B] text-white text-label-token font-bold uppercase tracking-wider shadow-sm">
                    Flagged Late
                  </span>
                </div>

                <div className="bg-surface-container-lowest rounded-xl p-4 mb-4 shadow-sm flex items-center justify-between flex-wrap gap-3">
                  <div className="flex flex-col">
                    <h4 className="font-headline text-[17px] font-bold text-on-surface">
                      Jordan Rivera — Algorithmic Game Design
                    </h4>
                    <p className="text-[13px] text-on-surface-variant">
                      Pass Code:{" "}
                      <strong className="text-label-code text-on-surface">
                        EH-2025-DES-8114
                      </strong>
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-label-token font-bold">
                    Penalty Exempt Eligible
                  </span>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setShiftCount((c) => Math.min(650, c + 1));
                      setScanState("valid");
                      showToast("Volunteer override granted for Jordan Rivera");
                    }}
                    className="px-4 py-2.5 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-white text-[13px] font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Approve Overdue Admission</span>
                  </button>
                </div>
              </div>
            )}

            <div className="bg-surface-container-lowest rounded-2xl p-5 border border-[#E8E2D5] shadow-sm flex flex-col flex-1">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-2">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  <h2 className="font-headline text-[18px] font-bold text-on-surface">
                    Real-Time Scan Feed
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-label-token text-on-surface font-semibold">
                    Live Feed
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={scanLogs.length === 0}
                  className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-[13px] flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Undo2 className="w-4 h-4 text-primary" />
                  <span>
                    Undo Last Scan (
                    <span className="text-label-code text-primary font-bold">
                      {undoSeconds}s
                    </span>
                    )
                  </span>
                </button>
              </div>

              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant text-label-token uppercase tracking-wider">
                      <th className="py-2.5 px-3 rounded-l-lg">Time</th>
                      <th className="py-2.5 px-3">Attendee</th>
                      <th className="py-2.5 px-3">Track / Event</th>
                      <th className="py-2.5 px-3">Pass ID</th>
                      <th className="py-2.5 px-3 rounded-r-lg text-right">
                        Gate Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-[13px] divide-y divide-outline-variant/15">
                    {scanLogs.map((row) => (
                      <tr
                        key={row.id}
                        className={`hover:bg-surface-container-low/60 transition-colors ${
                          row.status === "Duplicate"
                            ? "bg-[#FEF2F2]/40"
                            : row.status === "Late"
                              ? "bg-[#FEF3C7]/25"
                              : ""
                        }`}
                      >
                        <td className="py-2.5 px-3 text-label-code font-semibold text-on-surface">
                          {row.time}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-on-surface">
                          {row.attendee}
                        </td>
                        <td className="py-2.5 px-3 text-on-surface-variant">
                          {row.event}
                        </td>
                        <td className="py-2.5 px-3 text-label-code text-on-surface-variant">
                          {row.passId}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {row.status === "Valid" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] text-label-token font-bold uppercase">
                              Valid
                            </span>
                          )}
                          {row.status === "Duplicate" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEF2F2] text-[#DC2626] text-label-token font-bold uppercase">
                              Duplicate
                            </span>
                          )}
                          {row.status === "Manual" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface text-label-token font-bold uppercase">
                              Manual
                            </span>
                          )}
                          {row.status === "Late" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706] text-label-token font-bold uppercase">
                              Late ({row.lateMinutes || 10}m)
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {helpOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setHelpOpen(false)}
        >
          <div
            className="w-full max-w-md bg-surface-container-lowest rounded-2xl border border-[#E8E2D5] shadow-2xl p-6 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-headline-sm font-bold text-on-surface">
                Volunteer Gate Protocols
              </h3>
              <button
                type="button"
                onClick={() => setHelpOpen(false)}
                className="p-1.5 rounded-full bg-surface-container cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <ul className="space-y-2 text-[13px] text-on-surface-variant">
              <li>1. Green flash confirms instant admission; issue NFC band.</li>
              <li>2. Red duplicate alert requires matching physical photo ID.</li>
              <li>3. Amber late arrivals within 20 minutes are penalty-exempt.</li>
            </ul>
          </div>
        </div>
      )}
    </OpsShell>
  );
}
