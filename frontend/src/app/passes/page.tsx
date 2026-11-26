"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Copy,
  Download,
  Mail,
  Palette,
  ShieldCheck,
  Terminal,
  Ticket,
  Wallet,
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

  return (
    <div className="eh">
      <PublicHeader />

      <main className="container">
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
                      background: p.dotColor === "coral" ? "#c084fc" : "#34d399",
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
                  <h2 style={{ fontSize: 24, fontWeight: 800, margin: "10px 0 0", color: "#fff" }}>
                    {activePass.eventTitle}
                  </h2>
                </div>
                <span
                  style={{
                    background: "rgba(52, 211, 153, 0.16)",
                    color: "#34d399",
                    border: "1px solid rgba(52, 211, 153, 0.45)",
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
                  borderTop: "1px dashed rgba(192, 132, 252, 0.25)",
                  borderBottom: "1px dashed rgba(192, 132, 252, 0.25)",
                  fontSize: 13.5,
                }}
              >
                <div>
                  <small style={{ color: "var(--muted)", display: "block", marginBottom: 2 }}>
                    Accredited Attendee
                  </small>
                  <strong style={{ color: "#fff" }}>{activePass.holderName}</strong>
                  <span style={{ display: "block", color: "var(--muted)", fontSize: 12 }}>
                    {activePass.holderEmail}
                  </span>
                </div>
                <div>
                  <small style={{ color: "var(--muted)", display: "block", marginBottom: 2 }}>
                    Venue &amp; Entry
                  </small>
                  <strong style={{ color: "#fff" }}>{activePass.venue}</strong>
                  <span style={{ display: "block", color: "var(--muted)", fontSize: 12 }}>
                    {activePass.gateTime}
                  </span>
                </div>
                <div>
                  <small style={{ color: "var(--muted)", display: "block", marginBottom: 2 }}>
                    Fest Dates
                  </small>
                  <strong style={{ color: "#fff" }}>{activePass.dateRange}</strong>
                </div>
                <div>
                  <small style={{ color: "var(--muted)", display: "block", marginBottom: 2 }}>
                    Registration Tier
                  </small>
                  <strong style={{ color: "#fff" }}>{activePass.tierLabel}</strong>
                </div>
              </div>

              {activePass.teammates && activePass.teammates.length > 0 && (
                <div style={{ paddingTop: 14 }}>
                  <small style={{ color: "var(--muted)", display: "block", marginBottom: 8 }}>
                    Team Squad: <strong style={{ color: "#e9d5ff" }}>{activePass.teamName}</strong>
                  </small>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {activePass.teammates.map((m) => (
                      <span
                        key={m.name}
                        style={{
                          background: "rgba(139, 92, 246, 0.14)",
                          border: "1px solid rgba(168, 85, 247, 0.28)",
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
                    color: "#fff",
                  }}
                >
                  {activePass.passCode}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4, wordBreak: "break-all" }}>
                  Signed Token: {activePass.sigHash}
                </div>
                <div style={{ fontSize: 11.5, color: "#34d399", marginTop: 6 }}>
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
                <button type="button" className="eh-btn-outline" onClick={handleCopy}>
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
              </div>
            </div>

            {/* Right Column: Instructions & Pass Retrieval */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="eh-glass-card">
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <ShieldCheck className="w-5 h-5" style={{ color: "#34d399" }} />
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Gate Check-In Protocol</h3>
                </div>
                <p style={{ color: "var(--muted)", fontSize: 13.5, lineHeight: 1.65, margin: 0 }}>
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
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <Mail className="w-5 h-5" style={{ color: "#c084fc" }} />
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Lookup Your Pass On-Screen</h3>
                </div>
                <p style={{ color: "var(--muted)", fontSize: 13.5, margin: "0 0 14px", lineHeight: 1.55 }}>
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
                  <button type="submit" className="eh-btn-primary" style={{ width: "100%" }}>
                    {recoverySent ? "Pass Loaded On-Screen ✓" : "Find & Display Pass"}
                    {!recoverySent && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div className="eh-empty" style={{ maxWidth: 560, margin: "30px auto" }}>
            <h3 style={{ color: "#fff", margin: "0 0 8px" }}>No Active Passes Yet</h3>
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
