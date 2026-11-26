"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  AttendeeRecord,
  DigitalPass,
  EventItem,
  INITIAL_EVENTS,
  NotificationCategory,
  NotificationItem,
  NotificationType,
  ScanLogEntry,
} from "@/lib/eventhub-data";
import {
  generateSecureQrToken,
  verifyQrToken,
  VerificationResult,
} from "@/lib/qr-security";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { NotificationToast } from "@/components/NotificationToast";

export interface AuditEntry {
  time: string;
  actor: string;
  passId: string;
  status: string;
  reason: string;
}

export interface ActiveToastItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
}

interface EventHubContextValue {
  events: EventItem[];
  passes: DigitalPass[];
  scanLogs: ScanLogEntry[];
  attendees: AttendeeRecord[];
  bookmarkedIds: string[];
  latestAudit: AuditEntry | null;
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  activeToast: ActiveToastItem | null;
  dismissToast: () => void;
  refreshData: () => Promise<void>;
  toggleBookmark: (eventId: string) => void;
  registerPass: (input: {
    event: EventItem;
    holderName: string;
    holderEmail: string;
    isTeam: boolean;
    teamName?: string;
    holderPhone?: string;
    teammatesList?: Array<{ name: string; phone?: string; role?: string }>;
    paymentMethod?: string;
  }) => DigitalPass;
  addEvent: (event: EventItem) => void;
  checkInPass: (qrOrCode: string, gateLocation?: string) => VerificationResult;
  addScanLog: (entry: ScanLogEntry) => void;
  undoLatestScan: () => ScanLogEntry | null;
  overrideAttendeeStatus: (attendeeId: string, newStatus: AttendeeRecord["status"], reason: string) => void;
  addNotification: (input: {
    recipient?: string;
    title: string;
    message: string;
    type?: NotificationType;
    category?: NotificationCategory;
    link?: string;
    metadata?: Record<string, any>;
  }) => NotificationItem;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearReadNotifications: () => void;
  sendBroadcastNotification: (
    title: string,
    message: string,
    type?: NotificationType,
    targetRole?: string,
    link?: string
  ) => Promise<void>;
}

const EventHubContext = createContext<EventHubContextValue | null>(null);

export function EventHubProvider({ children }: { children: React.ReactNode }) {
  const { user, role } = useAuth();

  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [passes, setPasses] = useState<DigitalPass[]>([]);
  const [scanLogs, setScanLogs] = useState<ScanLogEntry[]>([]);
  const [attendees, setAttendees] = useState<AttendeeRecord[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeToast, setActiveToast] = useState<ActiveToastItem | null>(null);
  const [latestAudit, setLatestAudit] = useState<AuditEntry | null>(null);

  // Initialize bookmarks from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("eventhub_bookmarks");
      if (stored) {
        setBookmarkedIds(JSON.parse(stored));
      }
    } catch {
      // ignore storage access errors
    }
  }, []);

  // Fetch live database records on mount and when authentication role changes
  const refreshData = async () => {
    try {
      const [liveEvents, livePasses, liveAttendees, liveScans, liveNotifs] = await Promise.all([
        api.getEvents().catch(() => INITIAL_EVENTS),
        api.getPasses(role === "student" ? user?.email || undefined : undefined, role === "student" ? user?.uid || undefined : undefined).catch(() => []),
        api.getAttendees().catch(() => []),
        api.getScanLogs().catch(() => []),
        api.getNotifications(user?.uid, role || undefined, user?.email || undefined).catch(() => ({ data: [], unreadCount: 0 })),
      ]);

      if (liveEvents && liveEvents.length > 0) {
        setEvents(liveEvents);
      }
      setPasses(livePasses || []);
      setAttendees(liveAttendees || []);
      setScanLogs(liveScans || []);
      if (liveNotifs && liveNotifs.data) {
        setNotifications(liveNotifs.data);
      }
    } catch (err) {
      console.warn("[EventHub] Live data fetch warning:", err);
    }
  };

  useEffect(() => {
    refreshData();
  }, [user?.email, user?.uid, role]);

  // Auto-dismiss toast after 4.5 seconds
  useEffect(() => {
    if (!activeToast) return;
    const t = setTimeout(() => {
      setActiveToast(null);
    }, 4500);
    return () => clearTimeout(t);
  }, [activeToast]);

  const dismissToast = () => setActiveToast(null);

  const toggleBookmark = (eventId: string) => {
    setBookmarkedIds((prev) => {
      const updated = prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId];
      try {
        localStorage.setItem("eventhub_bookmarks", JSON.stringify(updated));
      } catch {
        // ignore storage errors
      }
      return updated;
    });
  };

  const addNotification: EventHubContextValue["addNotification"] = ({
    recipient = "all",
    title,
    message,
    type = "info",
    category = "general",
    link = "",
    metadata = {},
  }) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      recipient,
      title,
      message,
      type,
      category,
      link,
      read: false,
      metadata,
      createdAt: new Date().toISOString(),
    };

    setNotifications((prev) => [newNotif, ...prev]);

    setActiveToast({
      id: newNotif.id,
      title: newNotif.title,
      message: newNotif.message,
      type: newNotif.type,
      link: newNotif.link,
    });

    api.createNotification({
      recipient,
      title,
      message,
      type,
      category,
      link,
      metadata,
    }).catch(() => {});

    return newNotif;
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    api.markNotificationAsRead(id, user?.uid).catch(() => {});
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    api.markAllNotificationsAsRead(user?.uid, role || undefined).catch(() => {});
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    api.deleteNotification(id).catch(() => {});
  };

  const clearReadNotifications = () => {
    setNotifications((prev) => prev.filter((n) => !n.read));
    api.clearReadNotifications(user?.uid).catch(() => {});
  };

  const sendBroadcastNotification = async (
    title: string,
    message: string,
    type: NotificationType = "event",
    targetRole?: string,
    link?: string
  ) => {
    const recipient = targetRole ? `role:${targetRole}` : "all";
    addNotification({
      recipient,
      title,
      message,
      type,
      category: "announcement",
      link: link || "/",
    });
  };

  const registerPass: EventHubContextValue["registerPass"] = ({
    event,
    holderName,
    holderEmail,
    isTeam,
    teamName,
    teammatesList,
    holderPhone,
  }) => {
    const cleanHolderName = holderName.trim() || user?.displayName || "Participant";
    const cleanHolderEmail = holderEmail.trim() || user?.email || "attendee@eventhub.live";
    const suffix = Math.floor(1000 + Math.random() * 9000);
    const prefix = event.trackCode ? event.trackCode.split("-")[0] : "EVT";
    const passCode = `EH-2026-${prefix}-${suffix}`;
    const qrToken = generateSecureQrToken(passCode, event.id);

    const newPass: DigitalPass = {
      id: `pass-${Date.now()}`,
      passCode,
      qrToken,
      eventTitle: event.title,
      trackLabel: event.categoryLabel || "General Track",
      shortTabLabel: event.title.split(":")[0],
      dateRange: event.dateFull || "Upcoming Fest",
      gateTime: "Gates open 08:30 AM",
      venue: event.venue,
      teamName: isTeam ? teamName || "Squad" : "Solo Participant",
      booth: `Desk #${String.fromCharCode(65 + (suffix % 6))}-${(suffix % 24) + 1}`,
      tierLabel: isTeam
        ? `${(teammatesList?.length || 0) + 1} Member Squad · Fast Track`
        : "Solo Participant · Verified Attendee",
      holderName: cleanHolderName,
      holderEmail: cleanHolderEmail,
      teammates: isTeam && teammatesList && teammatesList.length > 0
        ? teammatesList.map((m, idx) => ({
            name: m.name || `Teammate ${idx + 1}`,
            role: m.role || "Member",
            icon: (idx % 2 === 0 ? "terminal" : "palette") as "terminal" | "palette",
          }))
        : [],
      countdownLabel: "Instant Gate Ready",
      sigHash: `sha256:${suffix.toString(16)}9a3c9e...${(suffix * 7).toString(16).slice(0, 6)}`,
      status: "Confirmed",
      dotColor: "emerald",
    };

    setPasses((prev) => [newPass, ...prev.filter(p => p.passCode !== newPass.passCode)]);
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === event.id || ev.trackCode === event.trackCode
          ? {
              ...ev,
              registeredCount: ev.registeredCount + 1,
            }
          : ev
      )
    );

    const initials = cleanHolderName
      .split(" ")
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AT";

    const newAttendee: AttendeeRecord = {
      id: `att-${Date.now()}`,
      passId: passCode,
      initials,
      name: cleanHolderName,
      email: cleanHolderEmail,
      teamInfo: isTeam ? `Team: ${teamName || "Squad"}` : "Solo Participant",
      event: event.title.split(":")[0],
      eventKey: (event.category as any) || "general",
      track: event.categoryLabel || "General Track",
      type: isTeam ? "Team" : "Solo",
      typeLabel: isTeam ? `Team (${(teammatesList?.length || 0) + 1} pax)` : "Solo",
      status: "Pending",
      statusLabel: "Pending",
      scanTime: "Unscanned",
      gateLocation: "Registered online",
    };
    setAttendees((prev) => [newAttendee, ...prev.filter(a => a.passId !== passCode)]);

    // Persist live registration to MongoDB backend API
    api.createPass({
      eventId: (event as any)._id || event.id,
      eventTitle: event.title,
      trackLabel: event.categoryLabel,
      shortTabLabel: event.title.split(":")[0],
      dateRange: event.dateFull,
      venue: event.venue,
      holderName: cleanHolderName,
      holderEmail: cleanHolderEmail,
      userUid: user?.uid,
      teamName: isTeam ? teamName || "Squad" : "Solo Participant",
      tierLabel: newPass.tierLabel,
      teammates: newPass.teammates,
    }).then((created) => {
      if (created && created.passCode) {
        setPasses((prev) => prev.map(p => p.passCode === newPass.passCode ? { ...p, ...created } : p));
      }
    }).catch((err) => {
      console.warn("[EventHub] Backend pass persist warning:", err);
    });

    // Instant confirmation notification
    addNotification({
      recipient: cleanHolderEmail,
      title: `Pass Confirmed: ${event.title.split(":")[0]}`,
      message: `Your entry pass (${passCode}) is active. Gates open at ${newPass.gateTime} at ${event.venue}.`,
      type: "pass",
      category: "registration",
      link: "/passes",
      metadata: { passCode, eventId: event.id },
    });

    return newPass;
  };

  const addEvent = (event: EventItem) => {
    setEvents((prev) => [event, ...prev]);
    api.createEvent(event).then((created) => {
      if (created) {
        setEvents((prev) => prev.map(e => e.id === event.id ? { ...e, ...created } : e));
      }
    }).catch((err) => {
      console.warn("[EventHub] Backend event create warning:", err);
    });
  };

  const checkInPass = (
    qrOrCode: string,
    gateLocation = "Gate 1 Turing Hall"
  ): VerificationResult => {
    const result = verifyQrToken(qrOrCode, passes);
    const nowTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // Send scan verification to live backend API
    api.scanPass(qrOrCode, gateLocation).catch((err) => {
      console.warn("[EventHub] Backend scan verification warning:", err);
    });

    if (result.status === "granted" && result.pass) {
      const matchedPass = result.pass as DigitalPass;
      setPasses((prev) =>
        prev.map((p) =>
          p.id === matchedPass.id || p.passCode === matchedPass.passCode
            ? {
                ...p,
                status: "Checked In",
                checkInTime: nowTime,
                checkInGate: gateLocation,
              }
            : p
        )
      );
      setAttendees((prev) =>
        prev.map((a) =>
          a.passId.toUpperCase() === matchedPass.passCode.toUpperCase()
            ? {
                ...a,
                status: "Present",
                statusLabel: "Present",
                scanTime: nowTime,
                gateLocation,
              }
            : a
        )
      );
      setScanLogs((prev) => [
        {
          id: `scan-${Date.now()}`,
          time: nowTime.replace(/\s?[AP]M/, ""),
          attendee: matchedPass.holderName,
          subtitle:
            matchedPass.teamName && matchedPass.teamName !== "Solo Participant" && matchedPass.teamName !== "Solo Entrant"
              ? `(${matchedPass.teamName})`
              : undefined,
          event: matchedPass.eventTitle.split(":")[0],
          passId: matchedPass.passCode,
          status: "Valid",
        },
        ...prev,
      ]);

      // Trigger gate check-in notification
      addNotification({
        recipient: matchedPass.holderEmail || "all",
        title: `Gate Check-In Confirmed`,
        message: `Access granted for ${matchedPass.eventTitle} at ${gateLocation}. Welcome to the fest!`,
        type: "gate",
        category: "gate_scan",
        link: "/passes",
        metadata: { passCode: matchedPass.passCode, gateLocation },
      });
    } else if (result.status === "duplicate" && result.pass) {
      const matchedPass = result.pass as DigitalPass;
      setScanLogs((prev) => [
        {
          id: `scan-${Date.now()}`,
          time: nowTime.replace(/\s?[AP]M/, ""),
          attendee: matchedPass.holderName,
          subtitle: `Duplicate (${result.firstCheckInTime || "Earlier"})`,
          event: matchedPass.eventTitle.split(":")[0],
          passId: matchedPass.passCode,
          status: "Duplicate",
        },
        ...prev,
      ]);

      // Security duplicate scan warning notification
      addNotification({
        recipient: "role:organizer",
        title: `Duplicate Gate Entry Warning`,
        message: `Duplicate check-in attempted for ${matchedPass.holderName} (${matchedPass.passCode}) at ${gateLocation}.`,
        type: "warning",
        category: "security",
        link: "/dashboard/volunteer",
        metadata: { passCode: matchedPass.passCode, gateLocation },
      });
    }

    return result;
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
    const target = attendees.find(a => a.id === attendeeId || a.passId === attendeeId);
    if (!target) return;

    const nowTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const fullTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    setLatestAudit({
      time: fullTime,
      actor: user?.displayName || "Campus Lead",
      passId: target.passId,
      status: newStatus,
      reason,
    });

    setAttendees((prev) =>
      prev.map((a) => {
        if (a.id !== attendeeId && a.passId !== attendeeId) return a;
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

    // Persist override to backend API
    api.updateAttendeeStatus(target.passId, newStatus, "Admin Override Desk").catch(() => {});

    addNotification({
      recipient: "role:organizer",
      title: `Admin Status Override: ${target.name}`,
      message: `Pass ${target.passId} status set to "${newStatus}". Reason: ${reason}`,
      type: "info",
      category: "system",
      link: "/dashboard/organizer",
    });
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  return (
    <EventHubContext.Provider
      value={{
        events,
        passes,
        scanLogs,
        attendees,
        bookmarkedIds,
        latestAudit,
        notifications,
        unreadNotificationCount,
        activeToast,
        dismissToast,
        refreshData,
        toggleBookmark,
        registerPass,
        addEvent,
        checkInPass,
        addScanLog,
        undoLatestScan,
        overrideAttendeeStatus,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        clearReadNotifications,
        sendBroadcastNotification,
      }}
    >
      {children}
      <NotificationToast toast={activeToast} onDismiss={dismissToast} />
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
