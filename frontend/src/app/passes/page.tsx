"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Cpu,
  Download,
  Info,
  Lock,
  Mail,
  MapPin,
  Palette,
  QrCode,
  Share2,
  ShieldCheck,
  Sparkles,
  Terminal,
  Ticket,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { QrCodeSvg } from "@/components/QrCodeSvg";
import { useEventHub } from "@/context/EventHubContext";
import "../home.css";

export default function DigitalPassesPage() {
  const { passes } = useEventHub();
  const [activePassId, setActivePassId] = useState<string>(passes[0]?.id || "pass-1");
  const [copied, setCopied] = useState(false);
  const [walletSaved, setWalletSaved] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySent, setRecoverySent] = useState(false);

  const activePass = passes.find((p) => p.id === activePassId) || passes[0];
  const secondaryPasses = passes.filter((p) => p.id !== activePass?.id);

  const handleCopy = () => {
    if (!activePass) return;
    navigator.clipboard?.writeText(activePass.passCode).catch(() => { });
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
        `Present this cryptographic pass at Gate Turnstiles.\n`
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
    <div className="eh">
      <div className="app" id="top">
        <PublicHeader />

        <main className="pad">
          {/* Header Title Banner */}
          <div className="page-title-wrap">
            <div className="page-tag">
              <Ticket style={{ width: 14, height: 14 }} />
              Instant Gate Pass Verification
            </div>
            <h1 className="page-h1">Your Digital Passes &amp; QR Badges</h1>
            <p className="page-sub">
              Present your scannable QR tokens at campus gate turnstiles for fast sub-second check-in. Passes work 100% offline and store verified cryptographic proofs.
            </p>
          </div>

          {/* Pass Selector Tabs */}
          {passes.length > 1 && (
            <div className="pass-tabs-bar" style={{ justifyContent: "center" }}>
              {passes.map((p) => {
                const isSelected = p.id === activePass?.id;
                return (
                  <button
                    key={p.id}
                    className={`pass-tab-btn ${isSelected ? "active" : ""}`}
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
                        background: p.dotColor === "coral" ? "var(--mag)" : "var(--mint)",
                      }}
                    />
                    {p.shortTabLabel}
                  </button>
                );
              })}
            </div>
          )}

          {activePass ? (
            <div className="pass-hero-grid">
              {/* Primary High-Contrast Perforated Ticket Pass */}
              <div className="pass-card-big">
                {/* Header Strip inside Ticket */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <span
                      style={{
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: ".08em",
                        color: "var(--mag)",
                        fontWeight: 700,
                      }}
                    >
                      {activePass.trackLabel}
                    </span>
                    <h2 style={{ fontSize: 24, fontWeight: 800, margin: "4px 0 0" }}>
                      {activePass.eventTitle}
                    </h2>
                  </div>
                  <span
                    style={{
                      background: "rgba(61,220,151,.2)",
                      color: "var(--mint)",
                      border: "1px solid var(--mint)",
                      padding: "4px 12px",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {activePass.status}
                  </span>
                </div>

                {/* Key Meta Details Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 16,
                    padding: "16px 0",
                    borderTop: "1px dashed rgba(255,255,255,.2)",
                    borderBottom: "1px dashed rgba(255,255,255,.2)",
                    fontSize: 13,
                  }}
                >
                  <div>
                    <small style={{ color: "var(--muted)", display: "block" }}>Accredited Attendee</small>
                    <b style={{ fontSize: 15 }}>{activePass.holderName}</b>
                    <span style={{ display: "block", color: "var(--muted)", fontSize: 12 }}>{activePass.holderEmail}</span>
                  </div>
                  <div>
                    <small style={{ color: "var(--muted)", display: "block" }}>Venue &amp; Entry</small>
                    <b style={{ fontSize: 15 }}>{activePass.venue}</b>
                    <span style={{ display: "block", color: "var(--muted)", fontSize: 12 }}>{activePass.gateTime}</span>
                  </div>
                  <div>
                    <small style={{ color: "var(--muted)", display: "block" }}>Fest Dates</small>
                    <b style={{ fontSize: 14 }}>{activePass.dateRange}</b>
                  </div>
                  <div>
                    <small style={{ color: "var(--muted)", display: "block" }}>Registration Tier</small>
                    <b style={{ fontSize: 14 }}>{activePass.tierLabel}</b>
                  </div>
                </div>

                {/* Teammates List (if team) */}
                {activePass.teammates && activePass.teammates.length > 0 && (
                  <div style={{ padding: "14px 0 0" }}>
                    <small style={{ color: "var(--muted)", display: "block", marginBottom: 8 }}>
                      Team Squad: <b>{activePass.teamName}</b>
                    </small>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {activePass.teammates.map((m) => (
                        <span
                          key={m.name}
                          style={{
                            background: "rgba(255,255,255,.08)",
                            padding: "4px 12px",
                            borderRadius: 999,
                            fontSize: 12,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          {m.icon === "palette" ? <Palette style={{ width: 12, height: 12 }} /> : <Terminal style={{ width: 12, height: 12 }} />}
                          {m.name} <span style={{ opacity: 0.6 }}>({m.role})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scannable High-Contrast QR Code */}
                <div style={{ textAlign: "center", marginTop: 22 }}>
                  <div className="qr" style={{ margin: "0 auto 12px" }}>
                    <QrCodeSvg seed={activePass.passCode} />
                  </div>
                  <div style={{ font: "700 16px ui-monospace,Menlo,monospace", letterSpacing: ".06em" }}>
                    {activePass.passCode}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, wordBreak: "break-all" }}>
                    {activePass.sigHash}
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="pass-actions" style={{ justifyContent: "center" }}>
                  <button className="btn-secondary" onClick={handleCopy}>
                    <Copy style={{ width: 15, height: 15 }} />
                    {copied ? "Pass Code Copied!" : "Copy Token"}
                  </button>
                  <button className="btn-secondary" onClick={handleDownloadTicket}>
                    <Download style={{ width: 15, height: 15 }} />
                    Download Ticket
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setWalletSaved(true);
                      setTimeout(() => setWalletSaved(false), 2400);
                    }}
                  >
                    <Wallet style={{ width: 15, height: 15 }} />
                    {walletSaved ? "Saved to Apple Wallet ✓" : "Add to Wallet"}
                  </button>
                </div>
              </div>

              {/* Right Column: Pass Security & Recovery */}
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {/* Gate Security Notice */}
                <div
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--line)",
                    borderRadius: 20,
                    padding: 24,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <ShieldCheck style={{ width: 22, height: 22, color: "var(--mint)" }} />
                    <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Gate Instructions</h3>
                  </div>
                  <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                    1. Have this screen open or save your token to your offline wallet.<br />
                    2. Volunteers at <b>Gate 1 &amp; Gate 2</b> will point their scanner at your QR code.<br />
                    3. Turnstiles unlock instantly upon the first valid scan.<br />
                    4. Duplicate scans trigger a gate block; keep your pass confidential!
                  </p>
                  <div style={{ marginTop: 16 }}>
                    <Link className="btn" style={{ fontSize: 13, padding: "8px 20px" }} href="/scanner">
                      Open Scanner HUD →
                    </Link>
                  </div>
                </div>

                {/* Find / Retrieve Pass by Email */}
                <div
                  id="retrieve"
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--line)",
                    borderRadius: 20,
                    padding: 24,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <Mail style={{ width: 20, height: 20, color: "var(--mag)" }} />
                    <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>Retrieve Existing Pass</h3>
                  </div>
                  <p style={{ color: "var(--muted)", fontSize: 13, margin: "0 0 14px" }}>
                    Registered under another student email or teammate's account? Enter your email to resend your pass link.
                  </p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (recoveryEmail.trim()) {
                        setRecoverySent(true);
                      }
                    }}
                    style={{ display: "flex", flexDirection: "column", gap: 10 }}
                  >
                    <input
                      type="email"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      placeholder="alex.chen@campus.edu"
                      required
                      style={{
                        background: "rgba(20,20,25,.8)",
                        border: "1.5px solid var(--line)",
                        borderRadius: 12,
                        color: "#fff",
                        padding: "10px 14px",
                        fontSize: 13,
                      }}
                    />
                    <button className="btn" type="submit" style={{ padding: "9px 18px", fontSize: 13 }}>
                      {recoverySent ? "Recovery Link Sent to Inbox ✓" : "Email My Pass"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty" style={{ margin: "40px auto", maxWidth: 600 }}>
              <h3>No Active Passes Found</h3>
              <p style={{ marginTop: 8 }}>You haven't claimed any fest passes yet. Explore events to register solo or team!</p>
              <Link className="btn" style={{ marginTop: 16 }} href="/#events">
                Explore Fest Events →
              </Link>
            </div>
          )}
        </main>

        <PublicFooter />
      </div>
    </div>
  );
}
