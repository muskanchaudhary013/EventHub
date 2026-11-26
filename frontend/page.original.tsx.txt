"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  Calendar,
  ChevronDown,
  Map,
  MapPin,
  QrCode,
  RotateCcw,
  Search,
  Terminal,
  UserCheck,
  X,
} from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { QuickRegistrationModal } from "@/components/QuickRegistrationModal";
import { EventItem, TrackCategory } from "@/lib/eventhub-data";
import { useEventHub } from "@/context/EventHubContext";

const TRACK_CHIPS: Array<{ id: TrackCategory; label: string }> = [
  { id: "all", label: "All Tracks (7)" },
  { id: "hackathon", label: "Hackathons & AI (2)" },
  { id: "robotics", label: "Robotics & Hardware (2)" },
  { id: "design", label: "Design & UI/UX (1)" },
  { id: "cultural", label: "Cultural & Music (1)" },
  { id: "esports", label: "Esports & Gaming (1)" },
];

export default function EventDiscoveryPage() {
  const { events, bookmarkedIds, toggleBookmark } = useEventHub();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<TrackCategory>("all");
  const [dateFilter, setDateFilter] = useState<"all" | "fri" | "sat" | "sun">("all");
  const [teamFilter, setTeamFilter] = useState<"all" | "solo" | "team">("all");
  const [entryFilter, setEntryFilter] = useState<"all" | "free" | "paid">("all");
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [rulebookOpen, setRulebookOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const featuredEvent = useMemo(
    () => events.find((e) => e.featured) || events[0],
    [events]
  );

  const filteredGridEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return events
      .filter((e) => !e.featured)
      .filter((e) => {
        if (activeCategory !== "all" && e.category !== activeCategory) return false;
        if (dateFilter !== "all" && e.dateFilter !== dateFilter) return false;
        if (teamFilter === "solo" && e.teamType === "team") return false;
        if (teamFilter === "team" && e.teamType === "solo") return false;
        if (entryFilter !== "all" && e.entryType !== entryFilter) return false;
        if (q) {
          const hay =
            `${e.title} ${e.description} ${e.categoryLabel} ${e.venue} ${e.trackCode}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });
  }, [events, searchQuery, activeCategory, dateFilter, teamFilter, entryFilter]);

  const resetFilters = () => {
    setSearchQuery("");
    setActiveCategory("all");
    setDateFilter("all");
    setTeamFilter("all");
    setEntryFilter("all");
  };

  const featuredPercent = Math.round(
    (featuredEvent.registeredCount / featuredEvent.capacityCount) * 100
  );
  const featuredSpotsLeft = Math.max(
    0,
    featuredEvent.capacityCount - featuredEvent.registeredCount
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

      <main className="w-full pt-16 flex-1">
        {/* Top Broadcast Ticker Banner */}
        <div className="w-full bg-secondary-fixed text-on-secondary-fixed py-2.5 px-4 md:px-8 flex items-center justify-between shadow-xs overflow-hidden">
          <div className="flex items-center gap-3 mx-auto overflow-x-auto whitespace-nowrap no-scrollbar py-0.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary text-label-token uppercase font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-error" />
              Live Pulse
            </span>
            <p className="text-label-code tracking-tight font-semibold flex items-center gap-2.5">
              <span>2,410 Students Registered</span>
              <span className="opacity-40">•</span>
              <span>14 Live Tracks Operational</span>
              <span className="opacity-40">•</span>
              <span>Gate Check-ins Open in 01h 48m</span>
              <span className="opacity-40">•</span>
              <span className="text-secondary font-bold">
                NFC Band Pairing Station 04 Active
              </span>
            </p>
          </div>
        </div>

        {/* Hero Headline & Dynamic Stats Deck */}
        <section className="w-full px-4 md:px-8 py-8 md:py-10 relative overflow-hidden bg-surface-container-low">
          <div className="absolute -right-24 -top-24 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 -bottom-24 w-80 h-80 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto flex flex-col gap-6 relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="max-w-3xl space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-highest text-on-surface-variant text-label-token uppercase">
                  <Terminal className="w-3.5 h-3.5 text-primary" />
                  <span>Stanford TechFest 2025 • Official Portal</span>
                </div>
                <h1 className="font-display-hero text-display-hero text-on-surface">
                  Discover. Register. Scan. Manage.
                  <span className="block text-primary-container">
                    The College Fest Experience, Engineered.
                  </span>
                </h1>
                <p className="text-[17px] leading-7 text-on-surface-variant max-w-2xl pt-1">
                  Real-time multi-track accreditation, sub-second gate check-in
                  manifests, and instant cryptographic passes for 5,000+
                  collegiate competitors.
                </p>
              </div>

              {/* KPI Strip */}
              <div className="grid grid-cols-3 gap-3 bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-[#E8E2D5] shrink-0">
                <div className="flex flex-col pr-3 border-r border-outline-variant/30">
                  <span className="text-label-token uppercase text-on-surface-variant">
                    Live Tracks
                  </span>
                  <span className="text-metric-kpi text-on-surface mt-0.5">
                    14
                  </span>
                  <span className="text-label-code text-[11px] text-tertiary font-medium">
                    98% filled
                  </span>
                </div>
                <div className="flex flex-col px-3 border-r border-outline-variant/30">
                  <span className="text-label-token uppercase text-on-surface-variant">
                    Prize Pot
                  </span>
                  <span className="text-metric-kpi text-primary mt-0.5">
                    $48k
                  </span>
                  <span className="text-label-code text-[11px] text-on-surface-variant">
                    Across 6 tracks
                  </span>
                </div>
                <div className="flex flex-col pl-3">
                  <span className="text-label-token uppercase text-on-surface-variant">
                    Avg Gate Tap
                  </span>
                  <span className="text-metric-kpi text-tertiary-container mt-0.5">
                    0.4s
                  </span>
                  <span className="text-label-code text-[11px] text-tertiary font-medium">
                    NFC / QR Sync
                  </span>
                </div>
              </div>
            </div>

            {/* Search & Multi-Filter Control Console */}
            <div className="w-full bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-[#E8E2D5] space-y-4">
              <div className="relative w-full flex items-center">
                <Search className="w-5 h-5 absolute left-4 text-on-surface-variant" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search hackathons, robotics, dance, gaming, guest lectures..."
                  className="w-full pl-12 pr-24 py-3.5 bg-surface-container-low rounded-xl text-[15px] text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary-container focus:bg-surface-container-lowest transition-all"
                />
                <div className="absolute right-3.5 flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container-high text-on-surface-variant text-label-code">
                  <span className="text-xs">⌘</span>
                  <span>K</span>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
                {/* Track Selector Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
                  {TRACK_CHIPS.map((chip) => {
                    const isActive = activeCategory === chip.id;
                    return (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => setActiveCategory(chip.id)}
                        className={`px-3.5 py-1.5 rounded-full text-label-token uppercase transition-all whitespace-nowrap cursor-pointer ${
                          isActive
                            ? "bg-on-surface text-surface shadow-sm"
                            : "bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                        }`}
                      >
                        {chip.label}
                      </button>
                    );
                  })}
                </div>

                {/* Secondary Dropdown Filters */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                  <div className="relative">
                    <select
                      aria-label="Date Filter"
                      value={dateFilter}
                      onChange={(e) =>
                        setDateFilter(
                          e.target.value as "all" | "fri" | "sat" | "sun"
                        )
                      }
                      className="appearance-none bg-surface-container-low pl-3 pr-8 py-1.5 rounded-lg text-[13px] text-on-surface font-medium focus:outline-none focus:ring-1 focus:ring-primary-container cursor-pointer"
                    >
                      <option value="all">Today &amp; Weekend</option>
                      <option value="fri">Fri, Oct 24 Only</option>
                      <option value="sat">Sat, Oct 25 Only</option>
                      <option value="sun">Sun, Oct 26 Only</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-on-surface-variant pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
                  </div>

                  <div className="relative">
                    <select
                      aria-label="Team Type Filter"
                      value={teamFilter}
                      onChange={(e) =>
                        setTeamFilter(e.target.value as "all" | "solo" | "team")
                      }
                      className="appearance-none bg-surface-container-low pl-3 pr-8 py-1.5 rounded-lg text-[13px] text-on-surface font-medium focus:outline-none focus:ring-1 focus:ring-primary-container cursor-pointer"
                    >
                      <option value="all">Team Type: All</option>
                      <option value="solo">Solo Only</option>
                      <option value="team">Teams Allowed (2-5)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-on-surface-variant pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
                  </div>

                  <div className="relative">
                    <select
                      aria-label="Entry Fee Filter"
                      value={entryFilter}
                      onChange={(e) =>
                        setEntryFilter(e.target.value as "all" | "free" | "paid")
                      }
                      className="appearance-none bg-surface-container-low pl-3 pr-8 py-1.5 rounded-lg text-[13px] text-on-surface font-medium focus:outline-none focus:ring-1 focus:ring-primary-container cursor-pointer"
                    >
                      <option value="all">Entry: All</option>
                      <option value="free">Free Entry Only</option>
                      <option value="paid">Sponsored / Paid Pass</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-on-surface-variant pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
                  </div>

                  <button
                    type="button"
                    onClick={resetFilters}
                    title="Reset Filters"
                    className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Showcase */}
        <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-10 flex flex-col gap-10">
          {/* FEATURED FLAGSHIP HERO EVENT */}
          <div className="w-full bg-surface-container-lowest rounded-3xl p-4 md:p-6 shadow-md border border-[#E8E2D5] hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Visual Column */}
              <div className="lg:col-span-6 relative rounded-2xl overflow-hidden min-h-[300px] lg:min-h-[380px] flex flex-col justify-between p-4">
                <img
                  src={featuredEvent.imageUrl}
                  alt={featuredEvent.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-on-surface/90 via-on-surface/40 to-transparent" />

                <div className="relative z-10 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest/95 backdrop-blur text-label-token uppercase text-primary font-bold shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-primary-container animate-ping" />
                    {featuredEvent.categoryLabel}
                  </span>
                  <button
                    type="button"
                    aria-label="Bookmark HackCampus 2025"
                    onClick={() => toggleBookmark(featuredEvent.id)}
                    className="w-9 h-9 rounded-full bg-surface-container-lowest/90 backdrop-blur text-on-surface flex items-center justify-center hover:bg-surface-container-lowest transition-colors shadow-sm cursor-pointer"
                  >
                    {bookmarkedIds.includes(featuredEvent.id) ? (
                      <BookmarkCheck className="w-5 h-5 text-primary-container" />
                    ) : (
                      <Bookmark className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <div className="relative z-10 space-y-2 text-surface">
                  <span className="text-label-code bg-surface-container-highest/30 backdrop-blur-md px-2.5 py-1 rounded-md text-surface-bright inline-block">
                    Track Code: {featuredEvent.trackCode}
                  </span>
                  <p className="text-[13px] text-surface-container-high line-clamp-2">
                    {featuredEvent.organizerNote}
                  </p>
                </div>
              </div>

              {/* Details Column */}
              <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  {/* Badges Bar */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] text-[#D97706] text-label-token uppercase font-bold">
                      <span className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" />
                      Only {featuredSpotsLeft} Spots Left
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant text-label-token uppercase font-medium">
                      {featuredEvent.teamSpec}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-label-token uppercase font-bold">
                      {featuredEvent.prizeLabel}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface text-label-token uppercase font-semibold">
                      Free Entry
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <div>
                    <h2 className="font-headline text-headline-lg text-on-surface font-extrabold hover:text-primary transition-colors">
                      {featuredEvent.title}
                    </h2>
                    <p className="text-[15px] text-on-surface-variant mt-2 leading-relaxed">
                      {featuredEvent.description}
                    </p>
                  </div>

                  {/* Logistics Specs */}
                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-outline-variant/30">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-label-token uppercase text-on-surface-variant">
                          Dates
                        </span>
                        <span className="text-[13px] font-semibold text-on-surface truncate">
                          {featuredEvent.dateShort}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-label-token uppercase text-on-surface-variant">
                          Venue
                        </span>
                        <span className="text-[13px] font-semibold text-on-surface truncate">
                          {featuredEvent.venue}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Live Allocation Progress */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-label-code">
                      <span className="text-on-surface-variant">
                        {featuredEvent.quotaLabel}
                      </span>
                      <span className="text-on-surface font-bold">
                        {featuredEvent.registeredCount} /{" "}
                        {featuredEvent.capacityCount} {featuredEvent.quotaUnit}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-container rounded-full transition-all duration-500"
                        style={{ width: `${featuredPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedEvent(featuredEvent)}
                    className="w-full sm:w-auto flex-1 px-6 py-3 rounded-lg bg-primary-container text-on-primary hover:bg-[#E0484D] active:scale-[0.98] transition-all text-[15px] font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <UserCheck className="w-5 h-5" />
                    <span>{featuredEvent.ctaLabel}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRulebookOpen(true)}
                    className="w-full sm:w-auto px-4 py-3 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container-high transition-colors text-[15px] font-semibold flex items-center justify-center gap-1.5 border border-[#E8E2D5] cursor-pointer"
                  >
                    <span>View Rulebook &amp; Schedule</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* COMPETITIVE TRACKS & LIVE FESTS MATRIX */}
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-outline-variant/30 pb-3 gap-2">
              <div>
                <h3 className="font-headline text-headline-md text-on-surface font-bold">
                  Competitive Tracks &amp; Live Fests
                </h3>
                <p className="text-[13px] text-on-surface-variant">
                  Real-time seat quotas synced with campus gate accreditation
                  authority.
                </p>
              </div>
              <span className="text-label-code text-on-surface-variant">
                Showing {filteredGridEvents.length} curated track
                {filteredGridEvents.length === 1 ? "" : "s"}
              </span>
            </div>

            {filteredGridEvents.length === 0 ? (
              <div className="bg-surface-container-lowest rounded-2xl p-10 border border-[#E8E2D5] text-center space-y-3">
                <p className="font-headline text-headline-sm font-bold text-on-surface">
                  No tracks match your active filters
                </p>
                <p className="text-[14px] text-on-surface-variant">
                  Try clearing your search query or switching to All Tracks.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-4 py-2 rounded-lg bg-primary-container text-on-primary text-[13px] font-semibold cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredGridEvents.map((ev) => {
                  const pct = Math.min(
                    100,
                    Math.round((ev.registeredCount / ev.capacityCount) * 100)
                  );
                  const isBookmarked = bookmarkedIds.includes(ev.id);
                  const badgeClass =
                    ev.statusTone === "amber"
                      ? "bg-[#FEF3C7] text-[#D97706]"
                      : ev.statusTone === "crimson"
                        ? "bg-error-container text-on-error-container"
                        : ev.statusTone === "emerald"
                          ? "bg-tertiary-fixed text-on-tertiary-fixed"
                          : "bg-surface-container-highest text-on-surface";

                  const prizeClass =
                    ev.prizeTone === "primary"
                      ? "text-primary font-bold"
                      : ev.prizeTone === "tertiary"
                        ? "text-tertiary-container font-bold"
                        : "text-on-surface font-bold";

                  return (
                    <div
                      key={ev.id}
                      className="bg-surface-container-lowest rounded-2xl p-4 border border-[#E8E2D5] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div className="space-y-3">
                        <div className="relative w-full h-44 rounded-xl overflow-hidden bg-surface-container">
                          <img
                            src={ev.imageUrl}
                            alt={ev.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <span
                            className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-label-token uppercase font-bold shadow-sm ${badgeClass}`}
                          >
                            {ev.statusBadge}
                          </span>
                          <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-surface-container-lowest/90 backdrop-blur text-label-token uppercase text-on-surface font-semibold">
                            {ev.categoryLabel}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-on-surface-variant text-label-token uppercase pb-1">
                            <span className="truncate pr-2">{ev.subtitle}</span>
                            <span className={`shrink-0 ${prizeClass}`}>
                              {ev.prizeLabel}
                            </span>
                          </div>
                          <h4 className="font-headline text-[18px] font-bold text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                            {ev.title}
                          </h4>
                          <p className="text-[13px] leading-5 text-on-surface-variant mt-1 line-clamp-2">
                            {ev.description}
                          </p>
                        </div>

                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between text-label-code text-[12px]">
                            <span className="text-on-surface-variant">
                              {ev.quotaLabel}
                            </span>
                            <span className="text-on-surface font-semibold">
                              {ev.registeredCount} / {ev.capacityCount}{" "}
                              {ev.quotaUnit}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${ev.progressColor}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-on-surface-variant text-[13px] pt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {ev.dateShort}
                          </span>
                          <span className="flex items-center gap-1 truncate ml-2">
                            <MapPin className="w-4 h-4 shrink-0" />
                            <span className="truncate">{ev.venue}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-4 border-t border-outline-variant/30 mt-4">
                        <button
                          type="button"
                          onClick={() => setSelectedEvent(ev)}
                          className="flex-1 py-2.5 rounded-lg bg-surface-container-highest hover:bg-primary-container hover:text-on-primary transition-all text-[13px] font-bold text-on-surface flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>{ev.ctaLabel}</span>
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Bookmark ${ev.title}`}
                          onClick={() => toggleBookmark(ev.id)}
                          className="p-2.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                        >
                          {isBookmarked ? (
                            <BookmarkCheck className="w-4 h-4 text-primary-container" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Campus Gate Navigation & Accreditation Hubs Strip */}
          <div className="w-full bg-surface-container p-5 rounded-2xl border border-[#E8E2D5] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                <Map className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-headline text-headline-sm font-bold text-on-surface">
                  Campus Gate Navigation &amp; Accreditation Hubs
                </h4>
                <p className="text-[13px] text-on-surface-variant">
                  Gate A (Main Quad), Gate B (Sports Complex), and Gate C
                  (Turing Hall) support instant NFC wristband syncing.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/faq"
                className="px-4 py-2 rounded-lg bg-surface-container-lowest border border-[#E8E2D5] text-[13px] font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
              >
                Gate Guide &amp; FAQ
              </Link>
              <Link
                href="/login?next=/scanner"
                className="px-4 py-2 rounded-lg bg-on-surface text-surface text-[13px] font-semibold hover:bg-on-surface/90 transition-colors flex items-center gap-1"
              >
                <span>Volunteer Gate Login</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />

      <QuickRegistrationModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />

      {/* Rulebook Modal */}
      {rulebookOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setRulebookOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-surface-container-lowest rounded-3xl border border-[#E8E2D5] shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-label-token uppercase text-primary font-bold">
                  HACK-AI-01 • Official Rulebook
                </span>
                <h3 className="font-headline text-headline-md font-bold text-on-surface">
                  HackCampus 2025 Schedule
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRulebookOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <ul className="space-y-2.5 text-[14px] text-on-surface-variant">
              <li className="p-3 rounded-xl bg-surface-container-low">
                <strong className="text-on-surface block font-mono text-xs">
                  FRI OCT 24 · 08:30 AM
                </strong>
                Gate Check-in, NFC Band Pairing &amp; Hardware Bay Tagging at
                Turing Hall.
              </li>
              <li className="p-3 rounded-xl bg-surface-container-low">
                <strong className="text-on-surface block font-mono text-xs">
                  FRI OCT 24 · 11:00 AM
                </strong>
                Opening Keynote &amp; Hacking Begins (36-Hour Sprint).
              </li>
              <li className="p-3 rounded-xl bg-surface-container-low">
                <strong className="text-on-surface block font-mono text-xs">
                  SUN OCT 26 · 02:00 PM
                </strong>
                Live Demo Expo, Jury Evaluation &amp; $12,500 Prize Pool Awards.
              </li>
            </ul>
            <button
              type="button"
              onClick={() => {
                setRulebookOpen(false);
                setSelectedEvent(featuredEvent);
              }}
              className="w-full py-3 rounded-xl bg-primary-container text-on-primary font-bold text-[14px] hover:bg-[#E0484D] cursor-pointer"
            >
              Proceed to Registration
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
