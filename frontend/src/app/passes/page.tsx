"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Copy,
  Download,
  Loader2,
  Mail,
  Palette,
  ShieldCheck,
  Terminal,
  Ticket,
  Wallet,
} from "lucide-react";
import { OpsShell } from "@/components/OpsShell";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { QrCodeSvg } from "@/components/QrCodeSvg";
import { useAuth } from "@/context/AuthContext";
import { useEventHub } from "@/context/EventHubContext";
import { DigitalPass } from "@/lib/eventhub-data";
import { api } from "@/lib/api";
import "../home.css";

function DigitalPassesContent() {
  const { user, role, loading } = useAuth();
  const { passes } = useEventHub();
  const searchParams = useSearchParams();
  const passIdParam = searchParams.get("passId");

  const [retrievedPasses, setRetrievedPasses] = useState<DigitalPass[]>([]);
  const allPasses = useMemo(() => {
    const map = new Map<string, DigitalPass>();
    passes.forEach((p) => map.set(p.id, p));
    retrievedPasses.forEach((p) => map.set(p.id, p));
    return Array.from(map.values());
  }, [passes, retrievedPasses]);

  const [activePassId, setActivePassId] = useState<string>(
    passIdParam || allPasses[0]?.id || ""
  );
  const [copied, setCopied] = useState(false);
  const [walletSaved, setWalletSaved] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySent, setRecoverySent] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null);

  useEffect(() => {
    if (passIdParam && allPasses.some((p) => p.id === passIdParam)) {
      setActivePassId(passIdParam);
    } else if (!activePassId && allPasses.length > 0) {
      setActivePassId(allPasses[0].id);
    }
  }, [passIdParam, allPasses, activePassId]);

  const activePass = allPasses.find((p) => p.id === activePassId) || allPasses[0];

  const handleCopy = () => {
    if (!activePass) return;
    navigator.clipboard?.writeText(activePass.passCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTicket = () => {
    if (!activePass) return;
    const blob = new Blob(
      [
        `==================================================\n` +
          `EVENTHUB DIGITAL ENTRY PASS\n` +
          `==================================================\n` +
          `Event:       ${activePass.eventTitle}\n` +
          `Pass Token:  ${activePass.passCode}\n` +
          `Holder:      ${activePass.holderName} <${activePass.holderEmail}>\n` +
          `Track:       ${activePass.trackLabel}\n` +
          `Dates:       ${activePass.dateRange}\n` +
          `Gate:        ${activePass.gateTime}\n` +
          `Venue:       ${activePass.venue}\n` +
          `Status:      ${activePass.status}\n` +
          `Signature:   ${activePass.sigHash}\n` +
          `==================================================\n` +
          `Present this cryptographic pass at Gate Turnstiles.\n`,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090712] flex items-center justify-center p-6">
        <div className="bg-[#0E0B1A] border border-amber-500/20 rounded-2xl p-8 max-w-sm w-full text-center space-y-3 shadow-xl">
          <Loader2 className="w-7 h-7 animate-spin text-amber-500 mx-auto" />
          <p className="text-[14px] font-semibold text-stone-200">
            Loading your QR pass wallet...
          </p>
        </div>
      </div>
    );
  }

  // When authenticated, render directly within the Dashboard shell (OpsShell)
  if (user) {
    return (
      <OpsShell
        allowedRoles={["student", "volunteer", "organizer"]}
        consoleTitle={
          role === "student"
            ? "My QR Passes"
            : role === "volunteer"
              ? "Participant Passes"
              : "Participant Passes"
        }
        consoleBadge="Pass Wallet"
      >
        <div className="flex flex-col w-full">
          {/* Dashboard Command & Header Banner */}
          <div className="px-4 md:px-6 py-5 bg-surface-container-low border-b border-[#E8E2D5] dark:border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-headline text-[20px] sm:text-[22px] font-bold text-on-surface dark:text-white tracking-tight">
                  {role === "student"
                    ? "My Digital QR Passes & Badges"
                    : "Participant Entry Passes & Badges"}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-400/35 text-xs font-bold uppercase">
                  <Ticket className="w-3.5 h-3.5" />
                  Cryptographic Offline Access
                </span>
              </div>
              <p className="text-[13px] text-stone-600 dark:text-stone-400">
                Present your scannable QR token at gate turnstiles for sub-second check-in. Passes remain cached on your device even without campus Wi-Fi.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {role === "student" && (
                <Link
                  href="/dashboard/student"
                  className="px-4 py-2 rounded-xl border border-[#E8E2D5] dark:border-amber-500/30 bg-surface-container-lowest dark:bg-white/5 text-[13px] font-semibold text-on-surface dark:text-white hover:bg-surface-container transition-colors"
                >
                  ← Student Dashboard
                </Link>
              )}
              <Link
                href="/#events"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#d97706] text-black text-[13px] font-bold shadow-md shadow-amber-500/20 hover:opacity-95 transition-opacity"
              >
                Browse Events
              </Link>
            </div>
          </div>

          <div className="px-4 md:px-6 py-6 flex flex-col gap-6">
            {/* Multiple Passes Tabs */}
            {allPasses.length > 1 && (
              <div className="eh-pass-tabs" style={{ justifyContent: "flex-start", marginBottom: 0 }}>
                {allPasses.map((p) => {
                  const selected = p.id === activePass?.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      className={`eh-pass-tab ${selected ? "active" : ""}`}
                      onClick={() => {
                        setActivePassId(p.id);
                        setCopied(false);
                        setWalletSaved(false);
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background:
                            p.dotColor === "coral" ? "#f59e0b" : "#10b981",
                        }}
                      />
                      {p.shortTabLabel}
                    </button>
                  );
                })}
              </div>
            )}

            {activePass ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Primary Ticket Card */}
                <div className="lg:col-span-7 xl:col-span-8">
                  <div className="eh-ticket-card">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 12,
                        marginBottom: 18,
                      }}
                    >
                      <div>
                        <span className="eh-pill-badge">{activePass.trackLabel}</span>
                        <h2
                          style={{
                            fontSize: 24,
                            fontWeight: 800,
                            margin: "10px 0 0",
                            color: "var(--color-on-surface, #1c1917)",
                          }}
                        >
                          {activePass.eventTitle}
                        </h2>
                      </div>
                      <span
                        style={{
                          background: "rgba(16, 185, 129, 0.16)",
                          color: "#059669",
                          border: "1px solid rgba(16, 185, 129, 0.45)",
                          padding: "4px 12px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {activePass.status}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: 16,
                        padding: "18px 0",
                        borderTop: "1px dashed rgba(245, 158, 11, 0.35)",
                        borderBottom: "1px dashed rgba(245, 158, 11, 0.35)",
                        fontSize: 13.5,
                      }}
                    >
                      <div>
                        <small style={{ color: "var(--muted)", display: "block", marginBottom: 2 }}>
                          Accredited Attendee
                        </small>
                        <strong style={{ color: "var(--color-on-surface, #1c1917)" }}>
                          {activePass.holderName}
                        </strong>
                        <span style={{ display: "block", color: "var(--muted)", fontSize: 12 }}>
                          {activePass.holderEmail}
                        </span>
                      </div>
                      <div>
                        <small style={{ color: "var(--muted)", display: "block", marginBottom: 2 }}>
                          Venue &amp; Entry
                        </small>
                        <strong style={{ color: "var(--color-on-surface, #1c1917)" }}>
                          {activePass.venue}
                        </strong>
                        <span style={{ display: "block", color: "var(--muted)", fontSize: 12 }}>
                          {activePass.gateTime}
                        </span>
                      </div>
                      <div>
                        <small style={{ color: "var(--muted)", display: "block", marginBottom: 2 }}>
                          Fest Dates
                        </small>
                        <strong style={{ color: "var(--color-on-surface, #1c1917)" }}>
                          {activePass.dateRange}
                        </strong>
                      </div>
                      <div>
                        <small style={{ color: "var(--muted)", display: "block", marginBottom: 2 }}>
                          Registration Tier
                        </small>
                        <strong style={{ color: "var(--color-on-surface, #1c1917)" }}>
                          {activePass.tierLabel}
                        </strong>
                      </div>
                    </div>

                    {activePass.teammates && activePass.teammates.length > 0 && (
                      <div style={{ paddingTop: 14 }}>
                        <small style={{ color: "var(--muted)", display: "block", marginBottom: 8 }}>
                          Team Squad:{" "}
                          <strong style={{ color: "var(--color-on-surface, #1c1917)" }}>
                            {activePass.teamName}
                          </strong>
                        </small>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {activePass.teammates.map((m) => (
                            <span
                              key={m.name}
                              style={{
                                background: "rgba(245, 158, 11, 0.12)",
                                border: "1px solid rgba(245, 158, 11, 0.3)",
                                padding: "4px 12px",
                                borderRadius: 999,
                                fontSize: 12,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              {m.icon === "palette" ? (
                                <Palette className="w-3 h-3" />
                              ) : (
                                <Terminal className="w-3 h-3" />
                              )}
                              {m.name}{" "}
                              <span style={{ color: "var(--muted)" }}>({m.role})</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ textAlign: "center", marginTop: 24 }}>
                      <QrCodeSvg
                        value={activePass.qrToken || activePass.passCode}
                        size={190}
                        showActions={true}
                        pass={activePass}
                        downloadName={activePass.passCode}
                      />
                      <div
                        style={{
                          marginTop: 14,
                          fontFamily: "var(--font-jetbrains-mono), monospace",
                          fontWeight: 700,
                          fontSize: 16,
                          letterSpacing: "0.06em",
                          color: "var(--color-on-surface, #1c1917)",
                        }}
                      >
                        {activePass.passCode}
                      </div>
                      <div
                        style={{
                          fontSize: 11.5,
                          color: "var(--muted)",
                          marginTop: 4,
                          wordBreak: "break-all",
                        }}
                      >
                        Signed Token: {activePass.sigHash}
                      </div>
                      <div style={{ fontSize: 11.5, color: "#10b981", marginTop: 6 }}>
                        {activePass.teamName && activePass.teamName !== "Solo Entrant"
                          ? "Single Team Pass • Valid for entire registered squad (Leader Download)"
                          : "Single Solo Pass • No personal data embedded in QR"}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        gap: 10,
                        marginTop: 18,
                      }}
                    >
                      <button
                        type="button"
                        className="eh-btn-outline"
                        onClick={handleCopy}
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copied ? "Copied!" : "Copy Code"}
                      </button>
                      <button
                        type="button"
                        className="eh-btn-primary"
                        onClick={() => {
                          setWalletSaved(true);
                          setTimeout(() => setWalletSaved(false), 2400);
                        }}
                      >
                        <Wallet className="w-4 h-4" />
                        {walletSaved ? "Saved to Device ✓" : "Save to Device"}
                      </button>
                      <button
                        type="button"
                        className="eh-btn-outline"
                        onClick={handleDownloadTicket}
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Ticket (.txt)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Protocols & Fast Lookup */}
                <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-5">
                  <div className="eh-glass-card">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 12,
                      }}
                    >
                      <ShieldCheck className="w-5 h-5" style={{ color: "#10b981" }} />
                      <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
                        Gate Check-In Protocol
                      </h3>
                    </div>
                    <p
                      style={{
                        color: "var(--muted)",
                        fontSize: 13.5,
                        lineHeight: 1.65,
                        margin: 0,
                      }}
                    >
                      1. Download your QR pass as PNG or PDF directly from this screen.
                      <br />
                      2. Gate volunteers scan your cryptographically signed QR token once for instant entry verification.
                      <br />
                      3. Team registrations receive one unified QR pass for the entire squad. Duplicate scans are flagged with the original check-in timestamp.
                    </p>
                    <div style={{ marginTop: 18 }}>
                      <Link className="eh-btn-outline" href="/scanner">
                        Volunteer Gate Scanner
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  <div id="retrieve" className="eh-glass-card">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 10,
                      }}
                    >
                      <Mail className="w-5 h-5" style={{ color: "#d97706" }} />
                      <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
                        Lookup Pass On-Screen
                      </h3>
                    </div>
                    <p
                      style={{
                        color: "var(--muted)",
                        fontSize: 13.5,
                        margin: "0 0 14px",
                        lineHeight: 1.55,
                      }}
                    >
                      Need to pull up another QR pass on this device? Enter your registered email or Pass Code below to view and download it directly.
                    </p>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const query = recoveryEmail.trim();
                        if (!query) return;
                        setRecoveryMessage(null);
                        
                        // Check locally first
                        const match = allPasses.find(
                          (p) =>
                            p.holderEmail.toLowerCase() === query.toLowerCase() ||
                            p.passCode.toLowerCase() === query.toLowerCase()
                        );
                        if (match) {
                          setActivePassId(match.id);
                          setRecoverySent(true);
                          setRecoveryMessage("Pass loaded on screen!");
                          return;
                        }

                        // Query live MongoDB API
                        try {
                          const fetched = await api.getPasses(query);
                          if (fetched && fetched.length > 0) {
                            setRetrievedPasses((prev) => [...fetched, ...prev]);
                            setActivePassId(fetched[0].id);
                            setRecoverySent(true);
                            setRecoveryMessage(`Found ${fetched.length} pass(es) for ${query}`);
                          } else {
                            setRecoveryMessage("No active pass found for this email or code.");
                          }
                        } catch {
                          setRecoveryMessage("Could not connect to live server. Please check your network.");
                        }
                      }}
                      style={{ display: "flex", flexDirection: "column", gap: 12 }}
                    >
                      <input
                        type="text"
                        required
                        className="eh-input"
                        value={recoveryEmail}
                        onChange={(e) => {
                          setRecoveryEmail(e.target.value);
                          setRecoverySent(false);
                          setRecoveryMessage(null);
                        }}
                        placeholder="you@campus.edu or EH-2026-..."
                      />
                      {recoveryMessage && (
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: recoverySent ? "#10b981" : "#ef4444" }}>
                          {recoveryMessage}
                        </div>
                      )}
                      <button
                        type="submit"
                        className="eh-btn-primary"
                        style={{ width: "100%" }}
                      >
                        {recoverySent
                          ? "Pass Loaded On-Screen ✓"
                          : "Find & Display Pass"}
                        {!recoverySent && <ArrowRight className="w-4 h-4" />}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ) : (
              <div className="eh-empty" style={{ maxWidth: 560, margin: "30px auto" }}>
                <h3
                  style={{
                    color: "var(--color-on-surface, #1c1917)",
                    margin: "0 0 8px",
                  }}
                >
                  No Active Passes Yet
                </h3>
                <p style={{ margin: "0 0 18px" }}>
                  Explore Hack4Tech events and register solo or with a team to receive your instant QR pass.
                </p>
                <Link className="eh-btn-primary" href="/#events">
                  Explore Events
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </OpsShell>
    );
  }

  // Fallback for unauthenticated visitors
  return (
    <div className="eh">
      <PublicHeader />

      <main className="container">
        <div
          style={{
            margin: "20px 0 10px",
            padding: "14px 20px",
            background: "rgba(245, 158, 11, 0.12)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5 }}>
            <Ticket className="w-4 h-4 shrink-0" style={{ color: "#f59e0b" }} />
            <span>
              Have a student or attendee account? Sign in to view and manage your passes inside your EventHub Dashboard.
            </span>
          </div>
          <Link
            href="/login?next=%2Fpasses"
            className="eh-btn-primary"
            style={{ padding: "7px 16px", fontSize: 13 }}
          >
            Sign In to Dashboard →
          </Link>
        </div>

        <section className="eh-sub-hero">
          <div className="eh-sub-tag">
            <Ticket className="w-3.5 h-3.5" />
            Cryptographic Offline Access
          </div>
          <h1 className="eh-sub-h1">Your Event Passes &amp; QR Badges</h1>
          <p className="eh-sub-p">
            Present your scannable QR token at Hack4Tech gate turnstiles for sub-second check-in. Passes stay cached on your device even without campus Wi-Fi.
          </p>
        </section>

        {passes.length > 1 && (
          <div className="eh-pass-tabs">
            {passes.map((p) => {
              const selected = p.id === activePass?.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  className={`eh-pass-tab ${selected ? "active" : ""}`}
                  onClick={() => {
                    setActivePassId(p.id);
                    setCopied(false);
                    setWalletSaved(false);
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background:
                        p.dotColor === "coral" ? "#f59e0b" : "#10b981",
                    }}
                  />
                  {p.shortTabLabel}
                </button>
              );
            })}
          </div>
        )}

        {activePass ? (
          <div className="eh-pass-grid">
            {/* Primary Perforated Ticket */}
            <div className="eh-ticket-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                  marginBottom: 18,
                }}
              >
                <div>
                  <span className="eh-pill-badge">{activePass.trackLabel}</span>
                  <h2
                    style={{
                      fontSize: 24,
                      fontWeight: 800,
                      margin: "10px 0 0",
                      color: "var(--color-on-surface, #1c1917)",
                    }}
                  >
                    {activePass.eventTitle}
                  </h2>
                </div>
                <span
                  style={{
                    background: "rgba(16, 185, 129, 0.16)",
                    color: "#059669",
                    border: "1px solid rgba(16, 185, 129, 0.45)",
                    padding: "4px 12px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  {activePass.status}
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 16,
                  padding: "18px 0",
                  borderTop: "1px dashed rgba(245, 158, 11, 0.35)",
                  borderBottom: "1px dashed rgba(245, 158, 11, 0.35)",
                  fontSize: 13.5,
                }}
              >
                <div>
                  <small style={{ color: "var(--muted)", display: "block", marginBottom: 2 }}>
                    Accredited Attendee
                  </small>
                  <strong style={{ color: "var(--color-on-surface, #1c1917)" }}>
                    {activePass.holderName}
                  </strong>
                  <span style={{ display: "block", color: "var(--muted)", fontSize: 12 }}>
                    {activePass.holderEmail}
                  </span>
                </div>
                <div>
                  <small style={{ color: "var(--muted)", display: "block", marginBottom: 2 }}>
                    Venue &amp; Entry
                  </small>
                  <strong style={{ color: "var(--color-on-surface, #1c1917)" }}>
                    {activePass.venue}
                  </strong>
                  <span style={{ display: "block", color: "var(--muted)", fontSize: 12 }}>
                    {activePass.gateTime}
                  </span>
                </div>
                <div>
                  <small style={{ color: "var(--muted)", display: "block", marginBottom: 2 }}>
                    Fest Dates
                  </small>
                  <strong style={{ color: "var(--color-on-surface, #1c1917)" }}>
                    {activePass.dateRange}
                  </strong>
                </div>
                <div>
                  <small style={{ color: "var(--muted)", display: "block", marginBottom: 2 }}>
                    Registration Tier
                  </small>
                  <strong style={{ color: "var(--color-on-surface, #1c1917)" }}>
                    {activePass.tierLabel}
                  </strong>
                </div>
              </div>

              {activePass.teammates && activePass.teammates.length > 0 && (
                <div style={{ paddingTop: 14 }}>
                  <small style={{ color: "var(--muted)", display: "block", marginBottom: 8 }}>
                    Team Squad:{" "}
                    <strong style={{ color: "var(--color-on-surface, #1c1917)" }}>
                      {activePass.teamName}
                    </strong>
                  </small>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {activePass.teammates.map((m) => (
                      <span
                        key={m.name}
                        style={{
                          background: "rgba(245, 158, 11, 0.12)",
                          border: "1px solid rgba(245, 158, 11, 0.3)",
                          padding: "4px 12px",
                          borderRadius: 999,
                          fontSize: 12,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        {m.icon === "palette" ? (
                          <Palette className="w-3 h-3" />
                        ) : (
                          <Terminal className="w-3 h-3" />
                        )}
                        {m.name} <span style={{ color: "var(--muted)" }}>({m.role})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ textAlign: "center", marginTop: 24 }}>
                <QrCodeSvg
                  value={activePass.qrToken || activePass.passCode}
                  size={190}
                  showActions={true}
                  pass={activePass}
                  downloadName={activePass.passCode}
                />
                <div
                  style={{
                    marginTop: 14,
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontWeight: 700,
                    fontSize: 16,
                    letterSpacing: "0.06em",
                    color: "var(--color-on-surface, #1c1917)",
                  }}
                >
                  {activePass.passCode}
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: "var(--muted)",
                    marginTop: 4,
                    wordBreak: "break-all",
                  }}
                >
                  Signed Token: {activePass.sigHash}
                </div>
                <div style={{ fontSize: 11.5, color: "#10b981", marginTop: 6 }}>
                  {activePass.teamName && activePass.teamName !== "Solo Entrant"
                    ? "Single Team Pass • Valid for entire registered squad (Leader Download)"
                    : "Single Solo Pass • No personal data embedded in QR"}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 10,
                  marginTop: 18,
                }}
              >
                <button
                  type="button"
                  className="eh-btn-outline"
                  onClick={handleCopy}
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? "Copied!" : "Copy Code"}
                </button>
                <button
                  type="button"
                  className="eh-btn-primary"
                  onClick={() => {
                    setWalletSaved(true);
                    setTimeout(() => setWalletSaved(false), 2400);
                  }}
                >
                  <Wallet className="w-4 h-4" />
                  {walletSaved ? "Saved to Device ✓" : "Save to Device"}
                </button>
                <button
                  type="button"
                  className="eh-btn-outline"
                  onClick={handleDownloadTicket}
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Ticket (.txt)
                </button>
              </div>
            </div>

            {/* Right Column: Instructions & Pass Retrieval */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="eh-glass-card">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
                  <ShieldCheck className="w-5 h-5" style={{ color: "#10b981" }} />
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
                    Gate Check-In Protocol
                  </h3>
                </div>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: 13.5,
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  1. Download your QR pass as an image (PNG) or PDF right from the confirmation screen—QR passes are never emailed for security.
                  <br />
                  2. Gate volunteers scan your cryptographically signed QR token once for instant entry verification.
                  <br />
                  3. Team registrations receive one unified QR pass for the entire squad. Duplicate scans are flagged with the original check-in timestamp.
                </p>
                <div style={{ marginTop: 18 }}>
                  <Link className="eh-btn-outline" href="/scanner">
                    Volunteer Gate Scanner
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div id="retrieve" className="eh-glass-card">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <Mail className="w-5 h-5" style={{ color: "#d97706" }} />
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
                    Lookup Your Pass On-Screen
                  </h3>
                </div>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: 13.5,
                    margin: "0 0 14px",
                    lineHeight: 1.55,
                  }}
                >
                  Need to pull up your QR pass on this device? Enter your registered email or Pass Code below to view and download it directly (QR passes are never sent via email).
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const query = recoveryEmail.trim().toLowerCase();
                    if (!query) return;
                    const match = passes.find(
                      (p) =>
                        p.holderEmail.toLowerCase() === query ||
                        p.passCode.toLowerCase() === query
                    );
                    if (match) {
                      setActivePassId(match.id);
                    }
                    setRecoverySent(true);
                  }}
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  <input
                    type="text"
                    required
                    className="eh-input"
                    value={recoveryEmail}
                    onChange={(e) => {
                      setRecoveryEmail(e.target.value);
                      setRecoverySent(false);
                    }}
                    placeholder="you@campus.edu or EH-2026-HCK-9481"
                  />
                  <button
                    type="submit"
                    className="eh-btn-primary"
                    style={{ width: "100%" }}
                  >
                    {recoverySent
                      ? "Pass Loaded On-Screen ✓"
                      : "Find & Display Pass"}
                    {!recoverySent && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div className="eh-empty" style={{ maxWidth: 560, margin: "30px auto" }}>
            <h3 style={{ color: "var(--color-on-surface, #1c1917)", margin: "0 0 8px" }}>
              No Active Passes Yet
            </h3>
            <p style={{ margin: "0 0 18px" }}>
              Explore Hack4Tech events and register solo or with a team to receive your instant QR pass.
            </p>
            <Link className="eh-btn-primary" href="/#events">
              Explore Events
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}

export default function DigitalPassesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#090712] flex items-center justify-center p-6">
          <div className="bg-[#0E0B1A] border border-amber-500/20 rounded-2xl p-8 max-w-sm w-full text-center space-y-3 shadow-xl">
            <Loader2 className="w-7 h-7 animate-spin text-amber-500 mx-auto" />
            <p className="text-[14px] font-semibold text-stone-200">
              Loading pass console...
            </p>
          </div>
        </div>
      }
    >
      <DigitalPassesContent />
    </Suspense>
  );
}
