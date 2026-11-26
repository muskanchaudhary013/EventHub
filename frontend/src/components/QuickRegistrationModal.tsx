"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Calendar,
  Loader2,
  MapPin,
  X,
} from "lucide-react";
import { DigitalPass, EventItem } from "@/lib/eventhub-data";
import { useEventHub } from "@/context/EventHubContext";
import { useAuth } from "@/context/AuthContext";
import { QrCodeSvg } from "./QrCodeSvg";

interface QuickRegistrationModalProps {
  event: EventItem | null;
  onClose: () => void;
}

export function QuickRegistrationModal({
  event,
  onClose,
}: QuickRegistrationModalProps) {
  const { user } = useAuth();
  const { registerPass } = useEventHub();
  const [regType, setRegType] = useState<"solo" | "team">("solo");
  const [fullName, setFullName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [teamName, setTeamName] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [issuedPass, setIssuedPass] = useState<DigitalPass | null>(null);

  useEffect(() => {
    if (!event) return;
    setStatus("idle");
    setIssuedPass(null);
    setRegType(event.teamType === "team" ? "team" : "solo");
    if (user?.displayName && !fullName) setFullName(user.displayName);
    if (user?.email && !email) setEmail(user.email);
  }, [event, user]);

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
        holderName: fullName.trim() || user?.displayName || "Participant",
        holderEmail: email.trim() || user?.email || "attendee@eventhub.live",
        isTeam: regType === "team",
        teamName: teamName.trim() || undefined,
      });
      setIssuedPass(pass);
      setStatus("done");
    }, 550);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        backgroundColor: "rgba(5, 3, 12, 0.8)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
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
          maxWidth: 530,
          background: "linear-gradient(165deg, #1f1b13 0%, #15130e 100%)",
          border: "1px solid rgba(245, 158, 11, 0.45)",
          borderRadius: 22,
          boxShadow: "0 24px 70px -10px rgba(217, 119, 6, 0.48)",
          overflow: "hidden",
          color: "#faf8f5",
          fontFamily: "var(--font-plus-jakarta), var(--font-inter), system-ui, sans-serif",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 22px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(255, 255, 255, 0.02)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#f59e0b",
                boxShadow: "0 0 10px #f59e0b",
              }}
            />
            <span style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#d97706" }}>
              Instant QR Pass Registration
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="eh-icon-btn"
            style={{ width: 32, height: 32 }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleConfirm} style={{ padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <span className="eh-pill-badge">{event.categoryLabel}</span>
            <h3 style={{ fontSize: 21, fontWeight: 800, margin: "10px 0 6px", color: "#fff" }}>
              {event.title}
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, color: "#a8a29e", fontSize: 13 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Calendar className="w-3.5 h-3.5" style={{ color: "#d97706" }} />
                {event.dateFull}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <MapPin className="w-3.5 h-3.5" style={{ color: "#d97706" }} />
                {event.venue}
              </span>
            </div>
          </div>

          {/* Solo / Team Switch */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 6,
              background: "rgba(15, 14, 11, 0.75)",
              border: "1px solid rgba(255,255,255,0.08)",
              padding: 4,
              borderRadius: 999,
            }}
          >
            <button
              type="button"
              onClick={() => setRegType("solo")}
              style={{
                background: regType === "solo" ? "linear-gradient(135deg, #fbbf24, #d97706)" : "transparent",
                color: regType === "solo" ? "#171511" : "#a8a29e",
                border: 0,
                borderRadius: 999,
                padding: "8px 14px",
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
                background: regType === "team" ? "linear-gradient(135deg, #fbbf24, #d97706)" : "transparent",
                color: regType === "team" ? "#171511" : "#a8a29e",
                border: 0,
                borderRadius: 999,
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Squad / Team
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#cfc9e4", marginBottom: 6 }}>
                Attendee Full Name
              </label>
              <input
                type="text"
                required
                className="eh-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#cfc9e4", marginBottom: 6 }}>
                Campus Email Address
              </label>
              <input
                type="email"
                required
                className="eh-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {regType === "team" && (
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#cfc9e4", marginBottom: 6 }}>
                  Team / Squad Name
                </label>
                <input
                  type="text"
                  className="eh-input"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Byte Busters"
                />
              </div>
            )}
          </div>

          {/* Live QR Pass Preview */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(245, 158, 11, 0.16), rgba(28, 25, 20, 0.9))",
              border: "1px solid rgba(245, 158, 11, 0.35)",
              borderRadius: 16,
              padding: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div>
              <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#34d399", fontWeight: 700 }}>
                {issuedPass ? "Pass Issued Live ✓" : "Pre-Accredited Gate Token"}
              </span>
              <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontWeight: 700, fontSize: 14.5, marginTop: 4, color: "#fff" }}>
                {issuedPass ? issuedPass.passCode : `EH-2026-${event.trackCode}`}
              </div>
              <small style={{ color: "#a69ec2", fontSize: 12 }}>
                {fullName} · {regType === "team" ? "Team Pass" : "Solo Pass"}
              </small>
            </div>
            <div style={{ flexShrink: 0 }}>
              <QrCodeSvg size={58} value={issuedPass?.qrToken || issuedPass?.passCode || event.trackCode} />
            </div>
          </div>

          {status === "done" && issuedPass ? (
            <div style={{ display: "flex", gap: 10 }}>
              <Link
                href="/passes"
                onClick={onClose}
                className="eh-btn-primary"
                style={{ flex: 1, textDecoration: "none" }}
              >
                Open in My Passes
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button type="button" onClick={onClose} className="eh-btn-outline">
                Done
              </button>
            </div>
          ) : (
            <button
              type="submit"
              disabled={status === "submitting"}
              className="eh-btn-primary"
              style={{ width: "100%", height: 46 }}
            >
              {status === "submitting" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Cryptographic Pass...
                </>
              ) : (
                <>
                  <BadgeCheck className="w-4 h-4" />
                  Confirm &amp; Get QR Pass
                </>
              )}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
