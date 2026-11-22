"use client";

import React, { createContext, useContext, useState } from "react";
import {
  AttendeeRecord,
  DigitalPass,
  EventItem,
  INITIAL_ATTENDEES,
  INITIAL_EVENTS,
  INITIAL_PASSES,
  INITIAL_SCAN_LOGS,
  ScanLogEntry,
} from "@/lib/eventhub-data";

interface AuditEntry {
  time: string;
  actor: string;
  passId: string;
  status: string;
  reason: string;
}

interface EventHubContextValue {
  events: EventItem[];
  passes: DigitalPass[];
  scanLogs: ScanLogEntry[];
  attendees: AttendeeRecord[];
  bookmarkedIds: string[];
  latestAudit: AuditEntry;
  toggleBookmark: (eventId: string) => void;
  registerPass: (input: {
    event: EventItem;
    holderName: string;
    holderEmail: string;
    isTeam: boolean;
    teamName?: string;
  }) => DigitalPass;
  addEvent: (event: EventItem) => void;
  addScanLog: (entry: ScanLogEntry) => void;
  undoLatestScan: () => ScanLogEntry | null;
  overrideAttendeeStatus: (attendeeId: string, newStatus: AttendeeRecord["status"], reason: string) => void;
}

const EventHubContext = createContext<EventHubContextValue | null>(null);

export function EventHubProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [passes, setPasses] = useState<DigitalPass[]>(INITIAL_PASSES);
  const [scanLogs, setScanLogs] = useState<ScanLogEntry[]>(INITIAL_SCAN_LOGS);
  const [attendees, setAttendees] = useState<AttendeeRecord[]>(INITIAL_ATTENDEES);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(["hackcampus-2025"]);
  const [latestAudit, setLatestAudit] = useState<AuditEntry>({
    time: "09:21:42 AM",
    actor: "David K.",
    passId: "#1102",
    status: "Present",
    reason:
      "Hardware camera failure at Turnstile 1 • Verified student physical ID card",
  });

  const toggleBookmark = (eventId: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId]
    );
  };

  const registerPass: EventHubContextValue["registerPass"] = ({
    event,
    holderName,
    holderEmail,
    isTeam,
    teamName,
  }) => {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    const prefix = event.trackCode.split("-")[0] || "EVT";
    const passCode = `EH-2025-${prefix}-${suffix}`;
    const newPass: DigitalPass = {
      id: `pass-${Date.now()}`,
      passCode,
      eventTitle: event.title,
      trackLabel: event.categoryLabel,
      shortTabLabel: event.title.split(":")[0],
      dateRange: event.dateFull,
      gateTime: "Gates open 08:30 AM",
      venue: event.venue,
      teamName: isTeam ? teamName || "Campus Squad" : "Solo Entrant",
      booth: `Desk #${String.fromCharCode(65 + (suffix % 6))}-${(suffix % 24) + 1}`,
      tierLabel: isTeam
        ? "Squad Accredited · Fast Track"
        : "Solo Participant · Verified .EDU",
      holderName: holderName || "Alex Rivera",
      holderEmail: holderEmail || "arivera@cs.stanford.edu",
      teammates: isTeam
        ? [
            { name: "Samira Lin", role: "Systems Eng", icon: "terminal" },
            { name: "Devon Brooks", role: "Product Design", icon: "palette" },
          ]
        : [],
      countdownLabel: "Instant Gate Ready",
      sigHash: `sha256:${suffix.toString(16)}9a3c9e...${(suffix * 7).toString(16).slice(0, 6)}`,
      status: "Confirmed",
      dotColor: "coral",
    };

    setPasses((prev) => [newPass, ...prev]);
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === event.id
          ? {
              ...ev,
              registeredCount: Math.min(ev.capacityCount, ev.registeredCount + 1),
            }
          : ev
      )
    );

    const initials = (holderName || "AR")
      .split(" ")
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const newAttendee: AttendeeRecord = {
      id: `att-${Date.now()}`,
      passId: passCode,
      initials,
      name: holderName || "Alex Rivera",
      email: holderEmail || "arivera@cs.stanford.edu",
      teamInfo: isTeam ? `Team: ${teamName || "Campus Squad"}` : "Solo Participant",
      event: event.title.split(":")[0],
      eventKey: "hackcampus",
      track: event.categoryLabel,
      type: isTeam ? "Team" : "Solo",
      typeLabel: isTeam ? "Team (3 pax)" : "Solo",
      status: "Pending",
      statusLabel: "Pending",
      scanTime: "Unscanned",
      gateLocation: "Registered online",
    };
    setAttendees((prev) => [newAttendee, ...prev]);

    return newPass;
  };

  const addEvent = (event: EventItem) => {
    setEvents((prev) => [event, ...prev]);
  };

  const addScanLog = (entry: ScanLogEntry) => {
    setScanLogs((prev) => [entry, ...prev]);
  };

  const undoLatestScan = () => {
    let removed: ScanLogEntry | null = null;
    setScanLogs((prev) => {
      if (prev.length === 0) return prev;
      removed = prev[0];
      return prev.slice(1);
    });
    return removed;
  };

  const overrideAttendeeStatus = (
    attendeeId: string,
    newStatus: AttendeeRecord["status"],
    reason: string
  ) => {
    const nowTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const fullTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setAttendees((prev) =>
      prev.map((a) => {
        if (a.id !== attendeeId) return a;
        setLatestAudit({
          time: fullTime,
          actor: "Campus Lead",
          passId: a.passId,
          status: newStatus,
          reason,
        });
        return {
          ...a,
          status: newStatus,
          statusLabel:
            newStatus === "Present"
              ? "Present"
              : newStatus === "Late"
                ? "Late (Override)"
                : newStatus === "Blocked"
                  ? "Scan Blocked"
                  : "Pending",
          scanTime: nowTime,
          gateLocation: "Admin Override Desk",
        };
      })
    );
  };

  return (
    <EventHubContext.Provider
      value={{
        events,
        passes,
        scanLogs,
        attendees,
        bookmarkedIds,
        latestAudit,
        toggleBookmark,
        registerPass,
        addEvent,
        addScanLog,
        undoLatestScan,
        overrideAttendeeStatus,
      }}
    >
      {children}
    </EventHubContext.Provider>
  );
}

export function useEventHub() {
  const ctx = useContext(EventHubContext);
  if (!ctx) {
    throw new Error("useEventHub must be used within EventHubProvider");
  }
  return ctx;
}
