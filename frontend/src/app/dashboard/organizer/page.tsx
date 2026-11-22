"use client";

import React, { useMemo, useState } from "react";
import {
  BadgeCheck,
  Calendar,
  Clock,
  DoorOpen,
  Download,
  Filter,
  History,
  Layers,
  PlusCircle,
  Radio,
  RefreshCw,
  Search,
  Shield,
  TrendingUp,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { OpsShell } from "@/components/OpsShell";
import { QrCodeSvg } from "@/components/QrCodeSvg";
import { AttendeeRecord, INITIAL_EVENTS } from "@/lib/eventhub-data";
import { useEventHub } from "@/context/EventHubContext";

export default function OrganizerDashboardPage() {
  const { attendees, latestAudit, overrideAttendeeStatus, addEvent } =
    useEventHub();

  const [selectedDay, setSelectedDay] = useState("d1");
  const [searchTerm, setSearchTerm] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [previewAttendee, setPreviewAttendee] = useState<AttendeeRecord | null>(
    null
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newVenue, setNewVenue] = useState("Turing Hall Stage B");
  const [newCapacity, setNewCapacity] = useState(120);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const filteredAttendees = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return attendees.filter((a) => {
      if (eventFilter !== "all" && a.eventKey !== eventFilter) return false;
      if (statusFilter !== "all" && a.status.toLowerCase() !== statusFilter)
        return false;
      if (typeFilter !== "all" && a.type.toLowerCase() !== typeFilter)
        return false;
      if (q) {
        const hay =
          `${a.name} ${a.passId} ${a.email} ${a.teamInfo} ${a.event}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [attendees, searchTerm, eventFilter, statusFilter, typeFilter]);

  const presentCount =
    2719 + attendees.filter((a) => a.status === "Present").length - 2;

  const handleExportCsv = () => {
    const header =
      "Pass ID,Name,Email,Event,Track,Type,Status,Scan Time,Gate\n";
    const rows = filteredAttendees
      .map(
        (a) =>
          `"${a.passId}","${a.name}","${a.email}","${a.event}","${a.track}","${a.typeLabel}","${a.statusLabel}","${a.scanTime}","${a.gateLocation}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "eventhub-attendance-2025.csv";
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredAttendees.length} records to CSV`);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addEvent({
      ...INITIAL_EVENTS[1],
      id: `custom-${Date.now()}`,
      trackCode: `EVT-${Math.floor(10 + Math.random() * 89)}`,
      title: newTitle.trim(),
      subtitle: "Organizer Created Track",
      venue: newVenue.trim() || "Main Quad",
      capacityCount: Number(newCapacity) || 100,
      registeredCount: 1,
      statusBadge: "Just Published",
      statusTone: "emerald",
      featured: false,
    });
    setNewTitle("");
    setCreateOpen(false);
    showToast("New event published live to Explore Events feed!");
  };

  return (
    <OpsShell
      allowedRoles={["organizer"]}
      consoleTitle="Organizer Console"
      consoleBadge="Live Ops"
    >
      <div className="flex flex-col w-full">
        {/* Top Command & Action Bar */}
        <div className="px-4 md:px-6 py-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-surface-container-low border-b border-[#E8E2D5]">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-headline text-headline-lg font-bold text-on-surface tracking-tight">
                Event Management &amp; Live Attendance Console
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-label-token uppercase font-semibold">
                <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
                TechFest 2025 Live Edition
              </span>
            </div>
            <p className="text-[13px] text-on-surface-variant flex flex-wrap items-center gap-2.5">
              <span>Real-time gate telemetry</span>
              <span className="inline-block w-1 h-1 rounded-full bg-on-surface-variant" />
              <span className="text-label-code">Zone 1-4 Active</span>
              <span className="inline-block w-1 h-1 rounded-full bg-on-surface-variant" />
              <span className="text-tertiary font-medium flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5" />
                Live attendance updates enabled
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center bg-surface-container-lowest border border-[#E8E2D5] shadow-2xs rounded-lg px-3 py-2 gap-2 text-on-surface">
              <Calendar className="w-4 h-4 text-on-surface-variant" />
              <select
                aria-label="Event Day"
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="bg-transparent text-[13px] text-on-surface focus:outline-none cursor-pointer pr-1"
              >
                <option value="d1">Day 2: Saturday, Oct 18 (Today)</option>
                <option value="d2">Day 1: Friday, Oct 17</option>
                <option value="d3">Day 3: Sunday, Oct 19</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary-container text-on-primary text-[13px] font-semibold shadow-sm hover:bg-primary transition-all active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Event</span>
            </button>
          </div>
        </div>

        {toast && (
          <div className="px-4 md:px-6 pt-4">
            <div className="p-3 rounded-xl bg-on-surface text-surface text-[13px] font-medium flex items-center justify-between">
              <span>{toast}</span>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="px-4 md:px-6 py-6 flex flex-col gap-6">
          {/* 4 KPI Metrics Row */}
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="bg-surface-container-lowest rounded-xl p-5 border border-[#E8E2D5] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-label-token uppercase text-on-surface-variant">
                  Total Registrations
                </span>
                <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 flex flex-col">
                <span className="text-metric-kpi text-on-surface">
                  {(3842 + (attendees.length - 5)).toLocaleString()}
                </span>
                <div className="mt-1 flex items-center gap-1.5 text-label-code text-tertiary">
                  <TrendingUp className="w-4 h-4" />
                  <span>+14.2%</span>
                  <span className="text-on-surface-variant font-sans text-[13px]">
                    vs TechFest &apos;24
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-2 border-t border-outline-variant/20 flex justify-between text-label-code text-on-surface-variant">
                <span>Capacity: 4,000 max</span>
                <span className="text-primary font-semibold">96.0% Booked</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-5 border border-[#E8E2D5] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-label-token uppercase text-on-surface-variant">
                  Live Gate Check-ins
                </span>
                <div className="w-8 h-8 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center">
                  <DoorOpen className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="text-metric-kpi text-on-surface">
                    {presentCount.toLocaleString()}
                  </span>
                  <span className="text-label-code text-tertiary font-bold">
                    70.8%
                  </span>
                </div>
                <div className="mt-2.5 w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-tertiary h-full rounded-full"
                    style={{ width: "70.8%" }}
                  />
                </div>
              </div>
              <div className="mt-4 pt-2 border-t border-outline-variant/20 flex justify-between text-label-code text-on-surface-variant">
                <span>Remaining off-site</span>
                <span className="text-on-surface font-semibold">
                  1,123 passes
                </span>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-5 border border-[#E8E2D5] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-label-token uppercase text-on-surface-variant">
                  Participant Split
                </span>
                <div className="w-8 h-8 rounded-lg bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-metric-kpi text-on-surface">2,722</span>
                  <span className="text-label-code text-secondary font-bold">
                    71% Teams
                  </span>
                </div>
                <div className="flex items-center justify-between text-[13px] text-on-surface-variant">
                  <span>Solo Attendees:</span>
                  <span className="text-label-code text-on-surface font-semibold">
                    1,120 (29%)
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-2 flex items-center gap-1">
                <div
                  className="h-2 rounded-l-full bg-secondary"
                  style={{ width: "71%" }}
                />
                <div
                  className="h-2 rounded-r-full bg-surface-variant"
                  style={{ width: "29%" }}
                />
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-5 border border-[#E8E2D5] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-label-token uppercase text-on-surface-variant">
                  Late &amp; Blocked Scans
                </span>
                <div className="w-8 h-8 rounded-lg bg-error-container text-on-error-container flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="text-metric-kpi text-error">3</span>
                  <span className="text-[13px] font-semibold text-error">
                    Duplicate Blocked
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-label-code text-secondary">
                  <Clock className="w-4 h-4" />
                  <span>42 Late Arrivals</span>
                  <span className="text-on-surface-variant font-sans text-[12px]">
                    flagged today
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-2 border-t border-outline-variant/20 flex justify-between text-label-code text-on-surface-variant">
                <span>Security status</span>
                <span className="text-tertiary font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                  Hardware Secured
                </span>
              </div>
            </div>
          </section>

          {/* Venue Load & Sector Capacity */}
          <section className="bg-surface-container-lowest rounded-xl p-5 border border-[#E8E2D5] shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-5">
              <div>
                <h2 className="font-headline text-[18px] font-bold text-on-surface">
                  Venue Load &amp; Sector Capacity
                </h2>
                <p className="text-[13px] text-on-surface-variant">
                  Sensor gates tracking real-time occupancy limits across campus
                  grounds.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {[
                {
                  name: "Main Auditorium",
                  sub: "Keynotes & Hackathon Opening Stage",
                  badge: "Amber Alert 94%",
                  badgeStyle: "bg-error-container text-on-error-container",
                  ping: true,
                  seats: "1,410 / 1,500 seats",
                  left: "90 Left",
                  leftColor: "text-error",
                  barColor: "bg-error",
                  pct: 94,
                  gate: "Gate 1 & 2",
                  flow: "+18 / min",
                },
                {
                  name: "Turing Lab Complex",
                  sub: "RoboWars Arena & Hardware Labs",
                  badge: "78% Capacity",
                  badgeStyle: "bg-secondary-fixed text-on-secondary-fixed",
                  ping: false,
                  seats: "780 / 1,000 seats",
                  left: "220 Left",
                  leftColor: "text-secondary",
                  barColor: "bg-secondary-container",
                  pct: 78,
                  gate: "West Portal",
                  flow: "+6 / min",
                },
                {
                  name: "Sports Complex Pavilion",
                  sub: "PixelCraft Expo & Sponsor Pavilion",
                  badge: "52% Capacity",
                  badgeStyle: "bg-tertiary-fixed text-on-tertiary-fixed",
                  ping: false,
                  seats: "780 / 1,500 seats",
                  left: "720 Available",
                  leftColor: "text-tertiary",
                  barColor: "bg-tertiary",
                  pct: 52,
                  gate: "Field Entry South",
                  flow: "+3 / min",
                },
              ].map((v) => (
                <div
                  key={v.name}
                  className="p-4 rounded-xl bg-surface-container-low border border-[#E8E2D5]/70 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[15px] font-bold text-on-surface">
                        {v.name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-label-token uppercase font-bold flex items-center gap-1 ${v.badgeStyle}`}
                      >
                        {v.ping && (
                          <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping" />
                        )}
                        {v.badge}
                      </span>
                    </div>
                    <p className="text-[13px] text-on-surface-variant mt-0.5">
                      {v.sub}
                    </p>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-label-code mb-1">
                      <span className="text-on-surface">{v.seats}</span>
                      <span className={`font-bold ${v.leftColor}`}>
                        {v.left}
                      </span>
                    </div>
                    <div className="w-full bg-surface-variant h-3 rounded-full overflow-hidden">
                      <div
                        className={`${v.barColor} h-full rounded-full`}
                        style={{ width: `${v.pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="mt-4 pt-2 flex items-center justify-between text-on-surface-variant text-label-code">
                    <span className="flex items-center gap-1">
                      <Radio className="w-3.5 h-3.5" />
                      {v.gate}
                    </span>
                    <span className="text-on-surface font-medium">
                      Flow: {v.flow}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Attendee Registry */}
          <section className="bg-surface-container-lowest rounded-xl border border-[#E8E2D5] shadow-sm overflow-hidden">
            <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="font-headline text-[18px] font-bold text-on-surface">
                  Attendee Registry &amp; Pass Access
                </h2>
                <p className="text-[13px] text-on-surface-variant">
                  Live filter, manual check-in override, and pass validation
                  auditing.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[220px] flex-1 sm:flex-none">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, pass ID, email..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface-container-low text-on-surface text-[13px] placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary-container"
                  />
                </div>

                <div className="flex items-center bg-surface-container-low rounded-lg px-2.5 py-2 text-on-surface">
                  <Layers className="w-4 h-4 text-on-surface-variant mr-1.5" />
                  <select
                    aria-label="Event Filter"
                    value={eventFilter}
                    onChange={(e) => setEventFilter(e.target.value)}
                    className="bg-transparent text-[13px] focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Events</option>
                    <option value="hackcampus">HackCampus 48h</option>
                    <option value="robowars">RoboWars Arena</option>
                    <option value="pixelcraft">PixelCraft UI/UX</option>
                    <option value="cyberpulse">CyberPulse CTF</option>
                  </select>
                </div>

                <div className="flex items-center bg-surface-container-low rounded-lg px-2.5 py-2 text-on-surface">
                  <Filter className="w-4 h-4 text-on-surface-variant mr-1.5" />
                  <select
                    aria-label="Status Filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent text-[13px] focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="present">Checked In (Present)</option>
                    <option value="pending">Pending Scan</option>
                    <option value="late">Late Arrival</option>
                    <option value="blocked">Flagged / Blocked</option>
                  </select>
                </div>

                <div className="flex items-center bg-surface-container-low rounded-lg px-2.5 py-2 text-on-surface">
                  <Users className="w-4 h-4 text-on-surface-variant mr-1.5" />
                  <select
                    aria-label="Type Filter"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="bg-transparent text-[13px] focus:outline-none cursor-pointer"
                  >
                    <option value="all">Solo &amp; Team</option>
                    <option value="solo">Solo Only</option>
                    <option value="team">Team Only</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-surface-container-low text-on-surface-variant text-label-token uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-5">Pass ID</th>
                    <th className="py-3 px-4">Participant / Team</th>
                    <th className="py-3 px-4">Event &amp; Track</th>
                    <th className="py-3 px-4">Type / Size</th>
                    <th className="py-3 px-4">Gate Status</th>
                    <th className="py-3 px-4">Check-in Scan</th>
                    <th className="py-3 px-5 text-right">Quick Override</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/15 text-on-surface">
                  {filteredAttendees.map((a) => (
                    <tr
                      key={a.id}
                      className={`hover:bg-surface-container-low transition-colors ${
                        a.status === "Blocked" ? "bg-error-container/25" : ""
                      }`}
                    >
                      <td className="py-3.5 px-5 text-label-code font-bold text-on-surface">
                        {a.passId}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-[12px] shrink-0">
                            {a.initials}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[14px] font-semibold truncate">
                              {a.name}
                            </span>
                            <span className="text-label-token text-on-surface-variant truncate">
                              {a.teamInfo}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-on-surface">
                            {a.event}
                          </span>
                          <span className="text-on-surface-variant text-label-token">
                            {a.track}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface text-label-token">
                          {a.typeLabel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-token uppercase font-bold ${
                            a.status === "Present"
                              ? "bg-tertiary-fixed text-on-tertiary-fixed"
                              : a.status === "Late"
                                ? "bg-secondary-fixed text-on-secondary-fixed"
                                : a.status === "Blocked"
                                  ? "bg-error-container text-on-error-container"
                                  : "bg-surface-container-highest text-on-surface-variant"
                          }`}
                        >
                          {a.statusLabel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-label-code text-on-surface-variant">
                        <span className="text-on-surface font-medium">
                          {a.scanTime}
                        </span>
                        <span className="block text-[11px]">
                          {a.gateLocation}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        {a.status === "Pending" ? (
                          <button
                            type="button"
                            onClick={() => {
                              overrideAttendeeStatus(
                                a.id,
                                "Present",
                                "Manual admin check-in override at Control Desk"
                              );
                              showToast(`Marked ${a.name} Present`);
                            }}
                            className="px-2.5 py-1 rounded bg-tertiary text-on-tertiary hover:opacity-90 text-label-token uppercase cursor-pointer"
                          >
                            Override
                          </button>
                        ) : a.status === "Blocked" ? (
                          <button
                            type="button"
                            onClick={() => {
                              overrideAttendeeStatus(
                                a.id,
                                "Present",
                                "Verified physical university photo ID"
                              );
                              showToast(`Cleared block for ${a.name}`);
                            }}
                            className="px-2.5 py-1 rounded bg-error text-on-error hover:opacity-90 text-label-token uppercase cursor-pointer"
                          >
                            Clear Audit
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPreviewAttendee(a)}
                            className="px-2.5 py-1 rounded bg-surface-container-high hover:bg-surface-container text-label-token text-on-surface cursor-pointer"
                          >
                            Pass
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Bottom Audit Trail & Export */}
          <section className="bg-surface-container-lowest rounded-xl p-5 border border-[#E8E2D5] shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3 max-w-2xl">
              <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface shrink-0 mt-0.5">
                <History className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-label-token uppercase text-primary font-bold">
                    Latest Audit Event
                  </span>
                  <span className="text-label-code text-on-surface-variant">
                    {latestAudit.time}
                  </span>
                </div>
                <p className="text-[13px] text-on-surface mt-0.5">
                  Admin <strong>{latestAudit.actor}</strong> updated Pass{" "}
                  <strong className="text-label-code">
                    {latestAudit.passId}
                  </strong>{" "}
                  to{" "}
                  <span className="px-1.5 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-semibold text-[11px]">
                    {latestAudit.status}
                  </span>
                  .
                </p>
                <span className="text-on-surface-variant text-label-code text-[11px] mt-0.5">
                  Reason: {latestAudit.reason}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full lg:w-auto shrink-0">
              <button
                type="button"
                onClick={() => showToast("All 4 gate batches verified ✓")}
                className="flex-1 lg:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-container text-on-surface text-[13px] font-semibold transition-colors cursor-pointer"
              >
                <BadgeCheck className="w-4 h-4" />
                <span>Verify Batches</span>
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                className="flex-1 lg:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg bg-primary-container text-on-primary text-[13px] font-semibold shadow-sm hover:bg-primary transition-all active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Attendance (CSV)</span>
              </button>
            </div>
          </section>
        </div>
      </div>

      {previewAttendee && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewAttendee(null)}
        >
          <div
            className="w-full max-w-sm bg-surface-container-lowest rounded-2xl border border-[#E8E2D5] shadow-2xl p-6 text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-label-token uppercase text-primary font-bold">
                Pass Inspection
              </span>
              <button
                type="button"
                onClick={() => setPreviewAttendee(null)}
                className="p-1 rounded-full bg-surface-container cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mx-auto w-48 h-48 p-3 bg-surface-container-low rounded-2xl flex items-center justify-center">
              <QrCodeSvg size="lg" seed={previewAttendee.passId} />
            </div>
            <div>
              <h3 className="font-headline text-headline-sm font-bold text-on-surface">
                {previewAttendee.name}
              </h3>
              <p className="text-label-code text-primary font-bold">
                {previewAttendee.passId}
              </p>
              <p className="text-[13px] text-on-surface-variant mt-1">
                {previewAttendee.event} • {previewAttendee.track}
              </p>
            </div>
          </div>
        </div>
      )}

      {createOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setCreateOpen(false)}
        >
          <form
            onSubmit={handleCreateEvent}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-surface-container-lowest rounded-2xl border border-[#E8E2D5] shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-headline-sm font-bold text-on-surface">
                Create New Event Track
              </h3>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="p-1 rounded-full bg-surface-container cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-label-token uppercase text-on-surface-variant mb-1">
                Event Title
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Quantum Systems Lightning Talk"
                className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant/40 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary-container"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-label-token uppercase text-on-surface-variant mb-1">
                  Campus Venue
                </label>
                <input
                  type="text"
                  value={newVenue}
                  onChange={(e) => setNewVenue(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant/40 text-[14px]"
                />
              </div>
              <div>
                <label className="block text-label-token uppercase text-on-surface-variant mb-1">
                  Seat Capacity
                </label>
                <input
                  type="number"
                  min={10}
                  max={2000}
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant/40 text-[14px]"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-primary-container hover:bg-[#E0484D] text-on-primary font-bold text-[14px] cursor-pointer"
            >
              Publish Event to Discovery Feed
            </button>
          </form>
        </div>
      )}
    </OpsShell>
  );
}
