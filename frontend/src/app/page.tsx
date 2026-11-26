"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Mail,
  MapPin,
  QrCode,
  Search,
  Users,
} from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { QuickRegistrationModal } from "@/components/QuickRegistrationModal";
import { EventItem, TrackCategory } from "@/lib/eventhub-data";
import { useEventHub } from "@/context/EventHubContext";
import "./home.css";

// Aligned with upcoming Hack4Tech fest start (Fri Dec 11, 2026 09:00 IST)
const FEST_START_ISO = "2026-12-11T09:00:00+05:30";

const HOME_FAQS = [
  {
    q: "Can I register for multiple events?",
    a: "Yes! You can register for as many Hack4Tech tracks, workshops, and competitions as you like, as long as their schedules don't overlap. Every registration issues its own unique digital QR pass in your My Passes wallet.",
  },
  {
    q: "Is team registration mandatory for all events?",
    a: "Not at all. Some events are solo-only (like PromptCraft & Keynotes), some support both solo and team squads (like HackCampus & PixelCraft), and team events like RoboWars or Valorant let you register your entire squad under one lead pass.",
  },
  {
    q: "How do I retrieve my QR pass?",
    a: "Open the My Passes page from the navigation bar or click 'Retrieve Pass' above. You can view all active passes offline, download them, or enter your registered campus email to have your pass resent immediately.",
  },
];

function useCountdown(iso: string) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const t = new Date(iso).getTime();
    const tick = () => setLeft(Math.max(0, t - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [iso]);
  const x = left ?? 0;
  const p = (n: number) => String(n).padStart(2, "0");
  return {
    d: p(Math.floor(x / 864e5)),
    h: p(Math.floor(x / 36e5) % 24),
    m: p(Math.floor(x / 6e4) % 60),
    s: p(Math.floor(x / 1e3) % 60),
  };
}

export default function EventDiscoveryPage() {
  const { events, bookmarkedIds, toggleBookmark } = useEventHub();
  const cd = useCountdown(FEST_START_ISO);

  const [ci, setCi] = useState(0);
  const [cat, setCat] = useState<TrackCategory>("all");
  const [q, setQ] = useState("");
  const [day, setDay] = useState<"all" | "fri" | "sat" | "sun">("all");
  const [team, setTeam] = useState<"all" | "solo" | "team">("all");
  const [sortBy, setSortBy] = useState<"featured" | "popular" | "seats">("featured");
  const [selected, setSelected] = useState<EventItem | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Swipe / Drag state for Happening Soon carousel
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const didDrag = useRef(false);
  const lastWheelTime = useRef(0);

  const n = events.length || 1;
  const activeEvent = events[ci % n] || events[0];
  const prevEvent = events[(ci - 1 + n) % n] || events[0];
  const nextEvent = events[(ci + 1) % n] || events[0];

  const goPrev = () => setCi((p) => (p - 1 + n) % n);
  const goNext = () => setCi((p) => (p + 1) % n);

  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    dragStartX.current = clientX;
    didDrag.current = false;
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    const delta = clientX - dragStartX.current;
    if (Math.abs(delta) > 6) didDrag.current = true;
    setDragOffset(Math.sign(delta) * Math.min(Math.abs(delta), 120));
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset < -36) goNext();
    else if (dragOffset > 36) goPrev();
    setDragOffset(0);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) > 22) {
      const now = Date.now();
      if (now - lastWheelTime.current > 350) {
        lastWheelTime.current = now;
        if (e.deltaX > 0) goNext();
        else goPrev();
      }
    }
  };

  const filteredEvents = useMemo(() => {
    const s = q.trim().toLowerCase();
    const res = events.filter((e) => {
      if (cat !== "all" && e.category !== cat) return false;
      if (day !== "all" && e.dateFilter !== day) return false;
      if (team === "solo" && e.teamType === "team") return false;
      if (team === "team" && e.teamType === "solo") return false;
      return (
        !s ||
        `${e.title} ${e.venue} ${e.categoryLabel} ${e.trackCode} ${e.description}`
          .toLowerCase()
          .includes(s)
      );
    });

    if (sortBy === "popular") {
      return [...res].sort((a, b) => b.registeredCount - a.registeredCount);
    }
    if (sortBy === "seats") {
      return [...res].sort(
        (a, b) => a.capacityCount - a.registeredCount - (b.capacityCount - b.registeredCount)
      );
    }
    return res;
  }, [events, cat, day, team, q, sortBy]);

  return (
    <div className="eh">
      <PublicHeader />

      {/* Cosmic Hero Banner */}
      <section className="eh-hero">
        <div className="eh-hero-aurora" />
        {/* Subtle Decorative Cosmic Light Arc SVG */}
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 340"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            opacity: 0.48,
          }}
        >
          <defs>
            <linearGradient id="ehArc" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0" />
              <stop offset="45%" stopColor="#fbbf24" stopOpacity="0.65" />
              <stop offset="85%" stopColor="#d97706" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M -40 240 Q 420 340 820 120 T 1500 80"
            fill="none"
            stroke="url(#ehArc)"
            strokeWidth="2"
          />
          <path
            d="M -60 110 Q 380 310 920 210 T 1520 40"
            fill="none"
            stroke="url(#ehArc)"
            strokeWidth="1.2"
            opacity="0.55"
          />
        </svg>

        <div className="container">
          <div className="eh-hero-grid">
            <div>
              <h1>
                Discover. Register.
                <span className="hl">Experience.</span>
              </h1>
              <p className="eh-hero-sub">
                Your gateway to every Hack4Tech event.
              </p>
            </div>

            <div className="eh-countdown-card" aria-label="Next event countdown">
              <div className="eh-countdown-label">Next Event Starts In</div>
              <div className="eh-countdown-row">
                <div className="eh-countdown-cell">
                  <b>{cd.d}</b>
                  <span>Days</span>
                </div>
                <div className="eh-countdown-cell">
                  <b>{cd.h}</b>
                  <span>Hours</span>
                </div>
                <div className="eh-countdown-cell">
                  <b>{cd.m}</b>
                  <span>Minutes</span>
                </div>
                <div className="eh-countdown-cell">
                  <b>{cd.s}</b>
                  <span>Seconds</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="container">
        {/* Section 1: Happening Soon (3D Swipeable Coverflow Carousel) */}
        <section className="eh-section" id="happening-soon">
          <div className="eh-sec-head">
            <div className="eh-sec-title-group">
              <span className="eh-sec-bar" />
              <div>
                <h2>Happening Soon</h2>
                <p>Events starting in the next 14 days</p>
              </div>
            </div>
            <div className="eh-arrow-group">
              <button
                type="button"
                className="eh-circle-arr"
                aria-label="Previous featured event"
                onClick={goPrev}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="eh-circle-arr"
                aria-label="Next featured event"
                onClick={goNext}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {activeEvent && (
            <>
              <div
                className={`eh-carousel-stage ${isDragging ? "grabbing" : ""}`}
                onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
                onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
                onTouchEnd={handleDragEnd}
                onTouchCancel={handleDragEnd}
                onMouseDown={(e) => handleDragStart(e.clientX)}
                onMouseMove={(e) => handleDragMove(e.clientX)}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onWheel={handleWheel}
              >
                {/* Left Recessed Preview Card */}
                <button
                  type="button"
                  className="eh-side-card left"
                  style={{ backgroundImage: `url(${prevEvent.imageUrl})` }}
                  onClick={() => {
                    if (!didDrag.current) goPrev();
                  }}
                  aria-label={`Show ${prevEvent.title}`}
                >
                  <div className="eh-side-card-ov">
                    <h4>{prevEvent.title.split(":")[0]}</h4>
                    <small>{prevEvent.dateShort}</small>
                  </div>
                </button>

                {/* Center Active Glowing Split Card */}
                <div
                  className="eh-carousel-track"
                  style={{
                    transform: `translateX(${dragOffset}px)`,
                    transition: isDragging
                      ? "none"
                      : "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <div className="eh-featured-card">
                    <div className="eh-featured-inner">
                      <div
                        className="eh-featured-media"
                        style={{ backgroundImage: `url(${activeEvent.imageUrl})` }}
                      >
                        <div className="eh-featured-media-text">
                          <strong>{activeEvent.title.split(":")[0]}</strong>
                          <span>{activeEvent.subtitle || "Think. Build. Innovate."}</span>
                        </div>
                      </div>

                      <div className="eh-featured-body">
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          <span className="eh-pill-badge">{activeEvent.categoryLabel}</span>
                          <h3>{activeEvent.title}</h3>
                          <div className="eh-meta-inline">
                            <span>
                              <Calendar className="w-3.5 h-3.5" style={{ color: "#d97706" }} />
                              {activeEvent.dateFull}
                            </span>
                            <span>
                              <MapPin className="w-3.5 h-3.5" style={{ color: "#d97706" }} />
                              {activeEvent.venue}
                            </span>
                          </div>
                          <p className="eh-featured-desc">{activeEvent.description}</p>
                        </div>

                        <div className="eh-featured-footer">
                          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            <span className="eh-seats-label">
                              <Users className="w-4 h-4" style={{ color: "#d97706" }} />
                              {activeEvent.registeredCount}/{activeEvent.capacityCount} Seats
                            </span>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#d97706" }}>
                              Fee: {activeEvent.feeLabel}
                            </span>
                          </div>
                          <Link
                            href={`/register/${activeEvent.id}`}
                            className="eh-btn-primary"
                          >
                            View Event
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Recessed Preview Card */}
                <button
                  type="button"
                  className="eh-side-card right"
                  style={{ backgroundImage: `url(${nextEvent.imageUrl})` }}
                  onClick={() => {
                    if (!didDrag.current) goNext();
                  }}
                  aria-label={`Show ${nextEvent.title}`}
                >
                  <div className="eh-side-card-ov">
                    <h4>{nextEvent.title.split(":")[0]}</h4>
                    <small>{nextEvent.dateShort}</small>
                  </div>
                </button>
              </div>

              {/* Pagination Dots */}
              <div className="eh-dots" role="tablist" aria-label="Featured event slides">
                {events.map((ev, idx) => (
                  <button
                    key={ev.id}
                    type="button"
                    className={`eh-dot ${idx === ci % n ? "active" : ""}`}
                    aria-label={`View slide ${idx + 1}: ${ev.title}`}
                    onClick={() => setCi(idx)}
                  />
                ))}
              </div>
            </>
          )}
        </section>

        {/* Section 2: Explore All Events */}
        <section className="eh-section" id="events">
          <div className="eh-sec-head">
            <div className="eh-sec-title-group">
              <span className="eh-sec-bar" />
              <h2>Explore All Events</h2>
            </div>
          </div>

          <div className="eh-filter-bar">
            <div className="eh-search-wrap">
              <Search className="w-4 h-4" />
              <input
                type="search"
                className="eh-search-input"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search events..."
                aria-label="Search events"
              />
            </div>

            <select
              className="eh-select-pill primary"
              value={cat}
              onChange={(e) => setCat(e.target.value as TrackCategory)}
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              <option value="hackathon">Hackathon &amp; AI</option>
              <option value="robotics">Robotics &amp; Hardware</option>
              <option value="design">Design &amp; UI/UX</option>
              <option value="cultural">Cultural &amp; Music</option>
              <option value="esports">Esports &amp; Gaming</option>
            </select>

            <select
              className="eh-select-pill"
              value={day}
              onChange={(e) => setDay(e.target.value as typeof day)}
              aria-label="Filter by date"
            >
              <option value="all">Date</option>
              <option value="fri">Fri Dec 11</option>
              <option value="sat">Sat Dec 12</option>
              <option value="sun">Sun Dec 13</option>
            </select>

            <select
              className="eh-select-pill"
              value={team}
              onChange={(e) => setTeam(e.target.value as typeof team)}
              aria-label="Filter by solo or team"
            >
              <option value="all">Solo / Team</option>
              <option value="solo">Solo Only</option>
              <option value="team">Team Squad</option>
            </select>

            <select
              className="eh-select-pill"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              aria-label="Sort events"
            >
              <option value="featured">Sort By</option>
              <option value="popular">Most Popular</option>
              <option value="seats">Filling Fastest</option>
            </select>
          </div>

          <div className="eh-events-grid">
            {filteredEvents.length === 0 && (
              <div className="eh-empty">
                No events match your current filters. Clear a filter or search for another keyword.
              </div>
            )}

            {filteredEvents.map((e) => {
              const saved = bookmarkedIds.includes(e.id);
              return (
                <article key={e.id} className="eh-event-card">
                  <div
                    className="eh-card-media"
                    style={{ backgroundImage: `url(${e.imageUrl})` }}
                  >
                    <button
                      type="button"
                      className="eh-card-star"
                      aria-pressed={saved}
                      aria-label={saved ? "Remove bookmark" : "Bookmark event"}
                      onClick={() => toggleBookmark(e.id)}
                    >
                      {saved ? "★" : "☆"}
                    </button>
                    <span className="eh-card-badge">{e.categoryLabel}</span>
                  </div>

                  <div className="eh-card-body">
                    <h3>{e.title}</h3>
                    <div className="eh-card-meta">
                      <span>
                        <Calendar className="w-3.5 h-3.5" style={{ color: "#d97706" }} />
                        {e.dateFull}
                      </span>
                      <span>
                        <MapPin className="w-3.5 h-3.5" style={{ color: "#d97706" }} />
                        {e.venue}
                      </span>
                    </div>

                    <div className="eh-card-foot">
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <span className="eh-seats-label" style={{ fontSize: 12 }}>
                          <Users className="w-3.5 h-3.5" style={{ color: "#d97706" }} />
                          {e.registeredCount}/{e.capacityCount} Seats
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#d97706" }}>
                          {e.feeLabel}
                        </span>
                      </div>
                      <Link
                        href={`/register/${e.id}`}
                        className="eh-btn-outline"
                      >
                        Register
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Section 3: How EventHub Works */}
        <section className="eh-section" id="how-it-works">
          <div className="eh-sec-head">
            <div className="eh-sec-title-group">
              <span className="eh-sec-bar" />
              <h2>How EventHub Works</h2>
            </div>
          </div>

          <div className="eh-steps-row">
            <div className="eh-step-item">
              <div className="eh-step-icon">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h4>1. Discover Events</h4>
                <p>Explore the latest Hack4Tech events and opportunities.</p>
              </div>
            </div>

            <div className="eh-step-chevron" aria-hidden="true">
              <ChevronRight className="w-5 h-5" />
            </div>

            <div className="eh-step-item">
              <div className="eh-step-icon">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4>2. Register Solo or as a Team</h4>
                <p>Sign up in seconds, with flexible team options.</p>
              </div>
            </div>

            <div className="eh-step-chevron" aria-hidden="true">
              <ChevronRight className="w-5 h-5" />
            </div>

            <div className="eh-step-item">
              <div className="eh-step-icon">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h4>3. Get Your QR Pass</h4>
                <p>Receive your unique pass and get ready to attend!</p>
              </div>
            </div>
          </div>

          {/* Glowing Retrieve Pass Banner */}
          <div className="eh-retrieve-banner">
            <div className="eh-retrieve-left">
              <div className="eh-retrieve-icon">
                <Mail className="w-5 h-5" />
              </div>
              <strong>Already registered? Find your event pass</strong>
            </div>
            <Link className="eh-btn-primary" href="/passes#retrieve">
              Retrieve Pass
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Section 4: FAQs Accordion */}
        <section className="eh-section" id="faqs">
          <div className="eh-sec-head">
            <div className="eh-sec-title-group">
              <span className="eh-sec-bar" />
              <h2>FAQs</h2>
            </div>
            <Link className="eh-btn-outline" href="/faq">
              All FAQs
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="eh-faq-list">
            {HOME_FAQS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={item.q} className={`eh-faq-item ${isOpen ? "open" : ""}`}>
                  <button
                    type="button"
                    className="eh-faq-trigger"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                  >
                    <span>{item.q}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {isOpen && <div className="eh-faq-answer">{item.a}</div>}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <PublicFooter />
      <QuickRegistrationModal event={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
