"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { QuickRegistrationModal } from "@/components/QuickRegistrationModal";
import { QrCodeSvg } from "@/components/QrCodeSvg";
import { EventItem, TrackCategory } from "@/lib/eventhub-data";
import { useEventHub } from "@/context/EventHubContext";
import { getDashboardPath, useAuth } from "@/context/AuthContext";
import "./home.css";

// Fest start date: aligned with upcoming festival timeline (Fri Dec 11, 2026 09:00 IST)
const FEST_START_ISO = "2026-12-11T09:00:00+05:30";

const TRACKS: Array<{ id: TrackCategory; label: string; tile: string }> = [
  { id: "hackathon", label: "Hackathons & AI", tile: "linear-gradient(135deg,#ff4fd8,#3b1a7a)" },
  { id: "robotics", label: "Robotics & Hardware", tile: "linear-gradient(135deg,#ff9a3c,#5a2a10)" },
  { id: "design", label: "Design & UI/UX", tile: "linear-gradient(135deg,#8f7bff,#241a5a)" },
  { id: "cultural", label: "Cultural & Music", tile: "linear-gradient(135deg,#34e0a1,#0f4a45)" },
  { id: "esports", label: "Esports & Gaming", tile: "linear-gradient(135deg,#2fb7ff,#0f3558)" },
  { id: "all", label: "Everything", tile: "linear-gradient(135deg,#ffe14d,#7a4a00)" },
];

const bg = (e: EventItem) => ({ backgroundImage: `url(${e.imageUrl})` });
const dayLabel = (e: EventItem) => e.dateFilter.slice(0, 1).toUpperCase() + e.dateFilter.slice(1);

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
    d: String(Math.floor(x / 864e5)),
    h: p(Math.floor(x / 36e5) % 24),
    m: p(Math.floor(x / 6e4) % 60),
    s: p(Math.floor(x / 1e3) % 60),
  };
}

export default function EventDiscoveryPage() {
  const { events, bookmarkedIds, toggleBookmark } = useEventHub();
  const { user, role } = useAuth();
  const cd = useCountdown(FEST_START_ISO);

  const [ci, setCi] = useState(0);
  const [cat, setCat] = useState<TrackCategory>("all");
  const [q, setQ] = useState("");
  const [day, setDay] = useState<"all" | "fri" | "sat" | "sun">("all");
  const [team, setTeam] = useState<"all" | "solo" | "team">("all");
  const [selected, setSelected] = useState<EventItem | null>(null);
  const [scans, setScans] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [scanTime, setScanTime] = useState("");

  // Smart sticky header: hide when scrolling down, reveal when scrolling up
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let prevScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);

      if (currentScrollY > 75) {
        if (currentScrollY > prevScrollY + 6) {
          setIsHeaderHidden(true);
        } else if (currentScrollY < prevScrollY - 6) {
          setIsHeaderHidden(false);
        }
      } else {
        setIsHeaderHidden(false);
      }
      prevScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth touch & mouse drag swipe for the event carousel
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const didDrag = useRef(false);
  const lastWheelTime = useRef(0);

  const n = events.length;
  const featured = events.find((e) => e.featured) || events[0];
  const slides = useMemo(
    () => [-2, -1, 0, 1, 2].map((o) => ({ o, e: events[(((ci + o) % n) + n) % n] })),
    [events, ci, n]
  );

  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    dragStartX.current = clientX;
    didDrag.current = false;
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    const delta = clientX - dragStartX.current;
    if (Math.abs(delta) > 6) {
      didDrag.current = true;
    }
    const dampened = Math.sign(delta) * Math.min(Math.abs(delta), 130);
    setDragOffset(dampened);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset < -35) {
      setCi((prev) => (prev + 1) % n);
    } else if (dragOffset > 35) {
      setCi((prev) => (prev - 1 + n) % n);
    }
    setDragOffset(0);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) > 20) {
      const now = Date.now();
      if (now - lastWheelTime.current > 350) {
        lastWheelTime.current = now;
        if (e.deltaX > 0) {
          setCi((prev) => (prev + 1) % n);
        } else {
          setCi((prev) => (prev - 1 + n) % n);
        }
      }
    }
  };

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return events.filter((e) => {
      if (cat !== "all" && e.category !== cat) return false;
      if (day !== "all" && e.dateFilter !== day) return false;
      if (team === "solo" && e.teamType === "team") return false;
      if (team === "team" && e.teamType === "solo") return false;
      return !s || `${e.title} ${e.venue} ${e.categoryLabel} ${e.trackCode}`.toLowerCase().includes(s);
    });
  }, [events, cat, day, team, q]);

  const totalReg = events.reduce((a, e) => a + e.registeredCount, 0);
  const totalCap = events.reduce((a, e) => a + e.capacityCount, 0);

  const scanDemo = () => {
    setScanning(false);
    requestAnimationFrame(() => setScanning(true));
    setTimeout(() => {
      if (scans === 0) setScanTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      setScans((c) => c + 1);
    }, 850);
  };

  return (
    <div className="eh">
      <div className="app" id="top">
        <div className={`nav-sticky-wrap ${isHeaderHidden ? "nav-hidden" : ""} ${isScrolled ? "nav-scrolled" : ""}`}>
          <header className="nav">
            <Link className="logo" href="/"><i />EventHub</Link>
            <nav aria-label="Main">
              <Link className="on" href="/">Home</Link>
              <a href="#events">Events</a>
              <Link href="/passes">My Passes</Link>
              <Link href="/faq">FAQ</Link>
            </nav>
            <div className="r">
              <Link className="pill hide" href="/login?selectRole=1">Create event</Link>
              <Link className="pill" href={user && role ? getDashboardPath(role) : "/login"}>
                {user ? "Dashboard" : "Sign in"}
              </Link>
            </div>
          </header>
        </div>

        <section className="hero pad">
          <h1>One pass gets you <b>in!</b></h1>
          <p>Find your event, register alone or with your team, and walk in with a single scan.</p>
          <div className="cd" aria-label="Time until the fest starts">
            <div><b>{cd.d}</b>Days</div><div><b>{cd.h}</b>Hours</div>
            <div><b>{cd.m}</b>Minutes</div><div><b>{cd.s}</b>Seconds</div>
          </div>
          <div className="cdl">until the fest begins</div>
          <div
            className={`car ${isDragging ? "grabbing" : ""}`}
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
            <button className="arr p" aria-label="Previous event" onClick={(e) => { e.stopPropagation(); setCi((ci - 1 + n) % n); }}>‹</button>
            <div
              className="car-track"
              style={{
                transform: `translateX(${dragOffset}px)`,
                transition: isDragging ? "none" : "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              {slides.map(({ o, e }) => (
                <button
                  key={o}
                  className={`sl${o === 0 ? " c" : ""}${Math.abs(o) === 1 ? " s" : ""}`}
                  style={bg(e)}
                  aria-label={o === 0 ? `Register for ${e.title}` : `Show ${e.title}`}
                  onClick={() => {
                    if (didDrag.current) return;
                    o === 0 ? setSelected(e) : setCi((ci + o + n) % n);
                  }}
                >
                  <div className="dt">{dayLabel(e)}</div>
                  <div className="ov" />
                  <div className="tx">
                    <h3>{e.title}</h3>
                    <small>{e.venue}, {e.registeredCount}/{e.capacityCount} registered</small>
                  </div>
                </button>
              ))}
            </div>
            <button className="arr n" aria-label="Next event" onClick={(e) => { e.stopPropagation(); setCi((ci + 1) % n); }}>›</button>
          </div>
          <div className="car-hint">
            <span>‹ Swipe left or right to explore events ›</span>
          </div>
        </section>

        <section className="sec pad ctr" id="events">
          <h2 className="ttl">Trending at the fest</h2>
          <div className="bar">
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events or venues" aria-label="Search events" />
            <select value={cat} onChange={(e) => setCat(e.target.value as TrackCategory)} aria-label="Track">
              <option value="all">All tracks</option>
              <option value="hackathon">Hackathons &amp; AI</option>
              <option value="robotics">Robotics &amp; Hardware</option>
              <option value="design">Design &amp; UI/UX</option>
              <option value="cultural">Cultural &amp; Music</option>
              <option value="esports">Esports &amp; Gaming</option>
            </select>
            <select value={day} onChange={(e) => setDay(e.target.value as typeof day)} aria-label="Day">
              <option value="all">Any day</option><option value="fri">Fri</option><option value="sat">Sat</option><option value="sun">Sun</option>
            </select>
            <select value={team} onChange={(e) => setTeam(e.target.value as typeof team)} aria-label="Team size">
              <option value="all">Solo or team</option><option value="solo">Solo</option><option value="team">Team</option>
            </select>
          </div>
          <div className="grid">
            {list.length === 0 && <div className="empty">No events match. Clear a filter or try another track.</div>}
            {list.map((e) => {
              const left = e.capacityCount - e.registeredCount;
              const saved = bookmarkedIds.includes(e.id);
              return (
                <article key={e.id} className="ev" style={bg(e)}>
                  <div className="ov" />
                  <div className="dt">{dayLabel(e)}</div>
                  <button className="main" onClick={() => setSelected(e)} aria-label={`Register for ${e.title}`}>
                    <div className="tx">
                      <small>{e.venue}</small><h3>{e.title}</h3>
                      <div className="mini"><i style={{ width: `${Math.round((e.registeredCount / e.capacityCount) * 100)}%` }} /></div>
                      <div className="seat"><span className={left <= 10 ? "low" : ""}>{left ? `${left} seats left` : "Full"}</span><span>{e.teamSpec}</span></div>
                    </div>
                  </button>
                  <button className="star" aria-pressed={saved} aria-label={saved ? "Remove bookmark" : "Bookmark event"} onClick={() => toggleBookmark(e.id)}>{saved ? "★" : "☆"}</button>
                </article>
              );
            })}
          </div>
        </section>

        <section className="pass-sec pad" id="pass">
          <div>
            <h2>Your pass, your ticket in</h2>
            <p>Every registration gets a unique QR pass. Volunteers scan it once at the gate. Scan it twice and the gate tells them it was already used.</p>
          </div>
          <div className="pw">
            <div className="pass">
              <small>Event pass (demo)</small><h3>{featured.title}</h3>
              <div className="meta"><div><small>Holder</small><b>Your name here</b></div><div><small>Venue</small><b>{featured.venue.split("&")[0]}</b></div></div>
              <div className={`qr${scanning ? " sc" : ""}`}><QrCodeSvg seed={featured.trackCode} /></div>
              <div className="code">{featured.trackCode}</div>
            </div>
            <button className="btn" onClick={scanDemo}>Try the gate scanner</button>
            <div className={`res${scans === 1 ? " ok" : scans > 1 ? " dup" : ""}`} aria-live="polite">
              {scans === 0 ? "Scan the pass to see what the gate sees." : scans === 1 ? `Valid. Checked in at ${scanTime}.` : `Already checked in at ${scanTime}. Entry blocked.`}
            </div>
          </div>
        </section>

        <section className="pad">
          <div className="live">
            <div><h2>Know what’s filling up</h2><p>Organizers see registrations per track in real time, then switch to live check-in counts once the gates open.</p></div>
            <div>
              <div className="big">{totalReg} <small>/ {totalCap} seats registered</small></div>
              <div className="mini"><i style={{ width: `${Math.round((totalReg / totalCap) * 100)}%` }} /></div>
              {TRACKS.filter((t) => t.id !== "all").map((t) => {
                const es = events.filter((e) => e.category === t.id);
                const r = es.reduce((a, e) => a + e.registeredCount, 0), c = es.reduce((a, e) => a + e.capacityCount, 0);
                return (
                  <div className="rw" key={t.id}><span>{t.label}</span><div className="mini"><i style={{ width: `${c ? Math.round((r / c) * 100) : 0}%` }} /></div><b>{r}</b></div>
                );
              })}
            </div>
          </div>
          <div className="cta">
            <div><h3>Running an event?</h3><p>Create it once, open registration, and let EventHub handle passes, check-in, and exports.</p></div>
            <Link className="btn" href="/login?selectRole=1">Create event</Link>
          </div>
        </section>

        <footer>
          <div><div className="logo" style={{ marginBottom: 12, color: "#fff" }}><i />EventHub</div>Discover, register, scan, and manage every Hack4Tech event on one platform. Built by Team Byte Busters.</div>
          <div><h4>Tracks</h4>{TRACKS.slice(0, 5).map((t) => <a key={t.id} href="#events" onClick={() => setCat(t.id)}>{t.label}</a>)}</div>
          <div><h4>Platform</h4><Link href="/passes">Event passes</Link><Link href="/scanner">Gate scanner</Link><Link href="/admin">Live attendance</Link></div>
          <div><h4>Help</h4><Link href="/passes">Find my pass</Link><Link href="/faq">FAQ</Link><Link href="/login">Sign in</Link></div>
          <div className="cp">© 2026 EventHub. All rights reserved.</div>
        </footer>
      </div>

      <QuickRegistrationModal event={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
