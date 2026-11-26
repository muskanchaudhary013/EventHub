"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Calendar,
  Check,
  CheckCircle2,
  Info,
  Loader2,
  MapPin,
  Sparkles,
  Ticket,
  X,
} from "lucide-react";
import { DigitalPass, EventItem } from "@/lib/eventhub-data";
import { useEventHub } from "@/context/EventHubContext";
import { QrCodeSvg } from "./QrCodeSvg";

interface QuickRegistrationModalProps {
  event: EventItem | null;
  onClose: () => void;
}

export function QuickRegistrationModal({
  event,
  onClose,
}: QuickRegistrationModalProps) {
  const { registerPass } = useEventHub();
  const [regType, setRegType] = useState<"solo" | "team">("solo");
  const [fullName, setFullName] = useState("Alex Chen");
  const [email, setEmail] = useState("alex.chen@campus.edu");
  const [teamName, setTeamName] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [issuedPass, setIssuedPass] = useState<DigitalPass | null>(null);

  useEffect(() => {
    if (!event) return;
    setStatus("idle");
    setIssuedPass(null);
    setRegType(event.teamType === "team" ? "team" : "solo");
  }, [event]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!event) return null;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "idle") return;
    setStatus("submitting");
    setTimeout(() => {
      const pass = registerPass({
        event,
        holderName: fullName.trim() || "Alex Chen",
        holderEmail: email.trim() || "alex.chen@campus.edu",
        isTeam: regType === "team",
        teamName: teamName.trim() || undefined,
      });
      setIssuedPass(pass);
      setStatus("done");
    }, 600);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 540,
          backgroundColor: "#181523",
          border: "1.5px solid rgba(214, 28, 255, 0.45)",
          borderRadius: 24,
          boxShadow: "0 0 60px rgba(214, 28, 255, 0.35)",
          overflow: "hidden",
          color: "#fff",
          fontFamily: "var(--font-montserrat), system-ui, sans-serif",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(255, 255, 255, 0.03)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--mag)",
                boxShadow: "0 0 10px var(--mag)",
              }}
            />
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--muted)" }}>
              Instant Pass Dispatch • 30s Check-In
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.1)",
              border: 0,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        <form onSubmit={handleConfirm} style={{ padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Event Context */}
          <div>
            <span style={{ color: "var(--mag)", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>
              {event.trackCode} • {event.categoryLabel}
            </span>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: "4px 0 6px" }}>
              {event.title}
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, color: "var(--muted)", fontSize: 13 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Calendar style={{ width: 14, height: 14 }} />
                {event.dateFull}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <MapPin style={{ width: 14, height: 14 }} />
                {event.venue}
              </span>
            </div>
          </div>

          {/* Registration Type Switcher */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 6,
              background: "rgba(0, 0, 0, 0.35)",
              padding: 4,
              borderRadius: 999,
            }}
          >
            <button
              type="button"
              onClick={() => setRegType("solo")}
              style={{
                background: regType === "solo" ? "var(--g)" : "transparent",
                color: "#fff",
                border: 0,
                borderRadius: 999,
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Solo Participant
            </button>
            <button
              type="button"
              onClick={() => setRegType("team")}
              style={{
                background: regType === "team" ? "var(--g)" : "transparent",
                color: "#fff",
                border: 0,
                borderRadius: 999,
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Squad / Team (Up to 4)
            </button>
          </div>

          {/* Input Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 6, textTransform: "uppercase" }}>
                Lead Attendee Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{
                  width: "100%",
                  background: "rgba(25, 22, 35, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: 12,
                  color: "#fff",
                  padding: "10px 14px",
                  fontSize: 14,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 6, textTransform: "uppercase" }}>
                Campus Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  background: "rgba(25, 22, 35, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: 12,
                  color: "#fff",
                  padding: "10px 14px",
                  fontSize: 14,
                  boxSizing: "border-box",
                }}
              />
            </div>

            {regType === "team" && (
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--muted)", marginBottom: 6, textTransform: "uppercase" }}>
                  Squad / Team Codename
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. QuantumLeap-0x"
                  style={{
                    width: "100%",
                    background: "rgba(25, 22, 35, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: 12,
                    color: "#fff",
                    padding: "10px 14px",
                    fontSize: 14,
                    boxSizing: "border-box",
                  }}
                />
              </div>
            )}
          </div>

          {/* Pass Preview Mini Card */}
          <div
            style={{
              background: "linear-gradient(135deg, #24143d, #19122c)",
              border: "1px solid rgba(214, 28, 255, 0.35)",
              borderRadius: 16,
              padding: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div>
              <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--mint)", fontWeight: 700 }}>
                {issuedPass ? "Pass Issued Live ✓" : "Pre-Accredited Gate Pass"}
              </span>
              <div style={{ font: "700 15px ui-monospace,Menlo,monospace", marginTop: 4 }}>
                {issuedPass ? issuedPass.passCode : `EH-2026-${event.trackCode}`}
              </div>
              <small style={{ color: "var(--muted)", fontSize: 12 }}>
                {fullName} • {regType === "team" ? "Squad Pass" : "Solo Pass"}
              </small>
            </div>
            <div style={{ width: 64, height: 64, background: "#fff", borderRadius: 8, padding: 4, flexShrink: 0 }}>
              <QrCodeSvg size="sm" seed={issuedPass?.passCode || event.trackCode} />
            </div>
          </div>

          {/* Actions */}
          {status === "done" && issuedPass ? (
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <Link
                href="/passes"
                onClick={onClose}
                className="btn"
                style={{ flex: 1, textAlign: "center", textDecoration: "none" }}
              >
                Open in My Passes →
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Done
              </button>
            </div>
          ) : (
            <button
              type="submit"
              disabled={status === "submitting"}
              className="btn"
              style={{ width: "100%", padding: "12px 24px", fontSize: 14 }}
            >
              {status === "submitting" ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Loader2 className="animate-spin" style={{ width: 18, height: 18 }} />
                  Dispatching Cryptographic Pass...
                </span>
              ) : (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <BadgeCheck style={{ width: 18, height: 18 }} />
                  Generate &amp; Claim Entry Pass
                </span>
              )}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
