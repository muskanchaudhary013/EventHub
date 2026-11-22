"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bookmark,
  Calendar,
  Clock,
  Copy,
  MapPin,
  QrCode,
  Ticket,
  Trophy,
} from "lucide-react";
import { OpsShell } from "@/components/OpsShell";
import { QrCodeSvg } from "@/components/QrCodeSvg";
import { QuickRegistrationModal } from "@/components/QuickRegistrationModal";
import { useAuth } from "@/context/AuthContext";
import { useEventHub } from "@/context/EventHubContext";
import { EventItem } from "@/lib/eventhub-data";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const { events, passes, bookmarkedIds } = useEventHub();
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [copied, setCopied] = useState(false);

  const primaryPass = passes[0];
  const bookmarkedEvents = events.filter((ev) => bookmarkedIds.includes(ev.id));

  const handleCopy = () => {
    if (!primaryPass) return;
    navigator.clipboard?.writeText(primaryPass.passCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <OpsShell
      allowedRoles={["student"]}
      consoleTitle="Student Dashboard"
      consoleBadge="Attendee"
    >
      <div className="flex flex-col w-full">
        {/* Welcome Banner */}
        <div className="px-4 md:px-6 py-5 bg-surface-container-low border-b border-[#E8E2D5] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-headline text-headline-lg font-bold text-on-surface tracking-tight">
                Welcome back, {user?.displayName || "Student"}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-label-token uppercase font-bold">
                <BadgeCheck className="w-3.5 h-3.5" />
                Verified Attendee
              </span>
            </div>
            <p className="text-[13.5px] text-on-surface-variant">
              Manage your registered tracks, present instant QR passes at campus
              gates, and track your schedule for Stanford TechFest 2025.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/"
              className="px-4 py-2.5 rounded-lg border border-[#E8E2D5] bg-surface-container-lowest text-[13px] font-semibold text-on-surface hover:bg-surface-container transition-colors"
            >
              Browse All Events
            </Link>
            <Link
              href="/passes"
              className="px-4 py-2.5 rounded-lg bg-primary-container hover:bg-[#E0484D] text-on-primary text-[13px] font-semibold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <QrCode className="w-4 h-4" />
              <span>Open Full Pass Wallet</span>
            </Link>
          </div>
        </div>

        <div className="px-4 md:px-6 py-6 flex flex-col gap-6">
          {/* 4 Student KPI Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="bg-surface-container-lowest rounded-xl p-5 border border-[#E8E2D5] shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-label-token uppercase text-on-surface-variant">
                  Active QR Passes
                </span>
                <div className="w-8 h-8 rounded-lg bg-primary-fixed text-on-primary-fixed flex items-center justify-center">
                  <Ticket className="w-4 h-4" />
                </div>
              </div>
              <p className="text-metric-kpi text-on-surface mt-3">
                {passes.length}
              </p>
              <p className="text-[12.5px] text-tertiary font-medium mt-1">
                Ready for offline gate scan
              </p>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-5 border border-[#E8E2D5] shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-label-token uppercase text-on-surface-variant">
                  Saved Tracks
                </span>
                <div className="w-8 h-8 rounded-lg bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center">
                  <Bookmark className="w-4 h-4" />
                </div>
              </div>
              <p className="text-metric-kpi text-on-surface mt-3">
                {bookmarkedEvents.length}
              </p>
              <p className="text-[12.5px] text-on-surface-variant mt-1">
                Bookmarked from Discovery
              </p>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-5 border border-[#E8E2D5] shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-label-token uppercase text-on-surface-variant">
                  Next Gate Opens
                </span>
                <div className="w-8 h-8 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-metric-kpi text-on-surface mt-3">08:30</p>
              <p className="text-[12.5px] text-on-surface-variant mt-1">
                Turing Hall • Oct 24, 2025
              </p>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-5 border border-[#E8E2D5] shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-label-token uppercase text-on-surface-variant">
                  Eligible Prize Pool
                </span>
                <div className="w-8 h-8 rounded-lg bg-surface-container-high text-on-surface flex items-center justify-center">
                  <Trophy className="w-4 h-4" />
                </div>
              </div>
              <p className="text-metric-kpi text-primary mt-3">$17.5k</p>
              <p className="text-[12.5px] text-on-surface-variant mt-1">
                Across your active tracks
              </p>
            </div>
          </section>

          {/* Main 2-Column Student Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 Cols: My Registered Events + Bookmarked Tracks */}
            <div className="lg:col-span-7 space-y-6">
              {/* My Registered Passes & Schedule */}
              <section className="bg-surface-container-lowest rounded-2xl border border-[#E8E2D5] shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-headline text-[18px] font-bold text-on-surface">
                      My Registered Events &amp; Passes
                    </h2>
                    <p className="text-[13px] text-on-surface-variant">
                      Confirmed seats linked to your student account.
                    </p>
                  </div>
                  <Link
                    href="/passes"
                    className="text-[13px] font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <span>Manage All</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="space-y-3">
                  {passes.map((pass) => (
                    <div
                      key={pass.id}
                      className="p-4 rounded-xl bg-surface-container-low border border-[#E8E2D5]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-label-token uppercase font-bold">
                            {pass.status}
                          </span>
                          <span className="text-label-code text-xs text-primary font-bold">
                            {pass.passCode}
                          </span>
                        </div>
                        <h3 className="font-headline text-[16px] font-bold text-on-surface">
                          {pass.eventTitle}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-[12.5px] text-on-surface-variant">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {pass.dateRange}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {pass.venue}
                          </span>
                        </div>
                      </div>
                      <Link
                        href="/passes"
                        className="px-3.5 py-2 rounded-lg bg-surface-container-lowest border border-[#E8E2D5] text-[13px] font-semibold text-on-surface hover:bg-primary-container hover:text-on-primary hover:border-primary-container transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-center"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>View QR</span>
                      </Link>
                    </div>
                  ))}
                </div>
              </section>

              {/* Bookmarked Tracks */}
              <section className="bg-surface-container-lowest rounded-2xl border border-[#E8E2D5] shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-headline text-[18px] font-bold text-on-surface">
                      Bookmarked &amp; Recommended Tracks
                    </h2>
                    <p className="text-[13px] text-on-surface-variant">
                      Instant 1-click registration before seat quotas fill up.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(bookmarkedEvents.length > 0
                    ? bookmarkedEvents
                    : events.slice(0, 2)
                  ).map((ev) => (
                    <div
                      key={ev.id}
                      className="p-4 rounded-xl bg-surface-container-low border border-[#E8E2D5]/80 flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <span className="text-label-token uppercase text-primary font-bold">
                          {ev.trackCode} • {ev.categoryLabel}
                        </span>
                        <h3 className="font-headline text-[15px] font-bold text-on-surface line-clamp-1">
                          {ev.title}
                        </h3>
                        <p className="text-[12.5px] text-on-surface-variant line-clamp-2">
                          {ev.description}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedEvent(ev)}
                        className="w-full py-2 rounded-lg bg-primary-container hover:bg-[#E0484D] text-on-primary text-[13px] font-semibold transition-colors cursor-pointer"
                      >
                        Quick Register
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right 5 Cols: Primary Digital QR Pass Preview */}
            <div className="lg:col-span-5">
              {primaryPass && (
                <div className="bg-surface-container-lowest rounded-2xl border border-[#E8E2D5] shadow-md overflow-hidden">
                  <div className="bg-gradient-to-r from-on-surface to-inverse-surface p-5 text-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary text-label-token uppercase font-bold">
                        Primary Gate Pass
                      </span>
                      <span className="text-label-token uppercase text-tertiary-fixed font-bold">
                        {primaryPass.status}
                      </span>
                    </div>
                    <h3 className="font-headline text-[19px] font-bold leading-snug">
                      {primaryPass.eventTitle}
                    </h3>
                    <p className="text-[12.5px] text-surface-variant">
                      {primaryPass.venue} • {primaryPass.dateRange}
                    </p>
                  </div>

                  <div className="p-5 flex flex-col items-center text-center space-y-4">
                    <div className="relative p-4 bg-surface-container-low rounded-2xl border border-[#E8E2D5]">
                      <div className="absolute top-2 left-2 w-4 h-4 border-t-3 border-l-3 border-primary-container" />
                      <div className="absolute top-2 right-2 w-4 h-4 border-t-3 border-r-3 border-primary-container" />
                      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-3 border-l-3 border-primary-container" />
                      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-3 border-r-3 border-primary-container" />
                      <QrCodeSvg size="lg" seed={primaryPass.passCode} />
                    </div>

                    <div className="w-full p-3 rounded-xl bg-surface-container-low flex items-center justify-between">
                      <div className="text-left">
                        <span className="text-label-token uppercase text-on-surface-variant block">
                          Pass Token
                        </span>
                        <span className="text-label-code font-bold text-on-surface">
                          {primaryPass.passCode}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container-lowest border border-[#E8E2D5] text-label-token uppercase text-on-surface font-bold cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copied ? "Copied" : "Copy"}</span>
                      </button>
                    </div>

                    <Link
                      href="/passes"
                      className="w-full py-2.5 rounded-xl bg-on-surface text-surface text-[13.5px] font-semibold hover:opacity-90 transition-opacity"
                    >
                      Open Printable Pass &amp; Wallet →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <QuickRegistrationModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </OpsShell>
  );
}
