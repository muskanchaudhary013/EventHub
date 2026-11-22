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
  const [fullName, setFullName] = useState("Alex Rivera");
  const [email, setEmail] = useState("arivera@cs.stanford.edu");
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

  const isEduEmail = email.includes("@") && email.toLowerCase().includes(".edu");

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "idle") return;
    setStatus("submitting");
    setTimeout(() => {
      const pass = registerPass({
        event,
        holderName: fullName.trim() || "Alex Rivera",
        holderEmail: email.trim() || "arivera@cs.stanford.edu",
        isTeam: regType === "team",
        teamName: teamName.trim() || undefined,
      });
      setIssuedPass(pass);
      setStatus("done");
    }, 650);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-surface-container-lowest rounded-3xl border border-outline-variant/40 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-tertiary animate-pulse" />
            <span className="text-label-token uppercase font-bold text-on-surface">
              Instant Pass Dispatch • 30s Check-In
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="p-6 space-y-4 overflow-y-auto">
          {/* Event Header Context */}
          <div>
            <span className="text-label-code text-primary uppercase font-bold">
              {event.trackCode}
            </span>
            <h3 className="font-headline text-headline-md font-bold text-on-surface mt-0.5">
              {event.title}
            </h3>
            <div className="flex flex-wrap items-center gap-4 text-on-surface-variant text-[13px] mt-1.5">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {event.dateFull}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {event.venue}
              </span>
            </div>
          </div>

          {/* Registration Switch */}
          <div className="p-1 bg-surface-container-low rounded-xl flex items-center text-[13px] font-semibold">
            <button
              type="button"
              onClick={() => setRegType("solo")}
              className={`flex-1 py-2 rounded-lg text-center transition-all cursor-pointer ${
                regType === "solo"
                  ? "bg-surface-container-lowest text-on-surface shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Solo Participant
            </button>
            <button
              type="button"
              onClick={() => setRegType("team")}
              className={`flex-1 py-2 rounded-lg text-center transition-all cursor-pointer ${
                regType === "team"
                  ? "bg-surface-container-lowest text-on-surface shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Squad / Team (Up to 4)
            </button>
          </div>

          {/* Inputs */}
          <div className="space-y-3">
            <div>
              <label className="block text-label-token uppercase text-on-surface-variant mb-1">
                Student Lead Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant/40 text-[15px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container focus:bg-surface-container-lowest"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-label-token uppercase text-on-surface-variant">
                  College .EDU Email
                </label>
                <span
                  className={`text-label-code text-[11px] flex items-center gap-1 font-semibold ${
                    isEduEmail ? "text-tertiary" : "text-on-surface-variant"
                  }`}
                >
                  {isEduEmail ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Valid College Record
                    </>
                  ) : (
                    <>
                      <Info className="w-3.5 h-3.5" />
                      Enter .edu domain
                    </>
                  )}
                </span>
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant/40 text-[15px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container focus:bg-surface-container-lowest"
              />
            </div>

            {regType === "team" && (
              <div>
                <label className="block text-label-token uppercase text-on-surface-variant mb-1">
                  Team / Squad Codename
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. NeuralHacks-0x"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant/40 text-[15px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container focus:bg-surface-container-lowest"
                />
              </div>
            )}
          </div>

          {/* Tactile Perforated QR Pass Preview */}
          <div className="w-full bg-surface-container-low rounded-2xl p-4 border border-outline-variant/40 relative">
            {/* Semicircular perforation cutouts */}
            <div className="hidden sm:block absolute -left-2.5 top-[56px] w-5 h-5 rounded-full bg-surface-container-lowest border-r border-outline-variant/40" />
            <div className="hidden sm:block absolute -right-2.5 top-[56px] w-5 h-5 rounded-full bg-surface-container-lowest border-l border-outline-variant/40" />

            <div className="flex items-center justify-between pb-3 border-b border-dashed border-outline-variant/60">
              <div>
                <span className="text-label-token uppercase text-on-surface-variant">
                  Pass Preview
                </span>
                <p className="text-label-code font-bold text-on-surface">
                  {issuedPass ? issuedPass.passCode : "HASH: #88F9-2A4C-GATE1"}
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-label-token uppercase font-bold">
                {issuedPass ? "Issued Live" : "Instant Pass"}
              </span>
            </div>

            <div className="flex items-center justify-between pt-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[14px] font-bold text-on-surface">
                  {fullName || "Alex Rivera"}
                </span>
                <span className="text-label-code text-[12px] text-on-surface-variant">
                  Stanford ID: 9940210
                </span>
                <span className="text-label-token uppercase text-primary font-bold">
                  Gate Status: Pre-Accredited
                </span>
              </div>
              <div className="w-20 h-20 bg-surface-container-lowest p-1.5 rounded-lg border border-outline-variant/30 flex items-center justify-center shrink-0 shadow-sm">
                <QrCodeSvg size="sm" seed={issuedPass?.passCode || event.trackCode} />
              </div>
            </div>
          </div>

          {/* CTA */}
          {status === "done" && issuedPass ? (
            <div className="space-y-2.5">
              <div className="w-full py-3 rounded-xl bg-tertiary-container text-white text-[15px] font-bold flex items-center justify-center gap-2 shadow-sm">
                <Check className="w-5 h-5" />
                <span>Pass Issued ({issuedPass.passCode})</span>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/passes"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-lg bg-on-surface text-surface text-[14px] font-semibold text-center hover:opacity-90 transition-opacity"
                >
                  Open in My Passes →
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-lg bg-surface-container text-on-surface text-[14px] font-semibold hover:bg-surface-container-high cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full py-3.5 rounded-xl bg-primary-container text-on-primary hover:bg-[#E0484D] active:scale-[0.98] transition-all text-[15px] font-bold flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 cursor-pointer"
            >
              {status === "submitting" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Dispatching Cryptographic Pass...</span>
                </>
              ) : (
                <>
                  <BadgeCheck className="w-5 h-5" />
                  <span>Generate &amp; Add Pass to Wallet</span>
                </>
              )}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
