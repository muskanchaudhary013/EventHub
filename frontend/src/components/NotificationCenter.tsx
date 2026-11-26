"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCheck,
  ExternalLink,
  Info,
  Megaphone,
  Radio,
  Send,
  Ticket,
  Trash2,
  X,
} from "lucide-react";
import { useEventHub } from "@/context/EventHubContext";
import { useAuth } from "@/context/AuthContext";
import { NotificationCategory, NotificationItem, NotificationType } from "@/lib/eventhub-data";

interface NotificationCenterProps {
  className?: string;
  buttonClassName?: string;
}

export function NotificationCenter({ className = "", buttonClassName = "" }: NotificationCenterProps) {
  const { role } = useAuth();
  const {
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearReadNotifications,
    sendBroadcastNotification,
  } = useEventHub();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "passes" | "announcements" | "alerts">("all");
  const [showBroadcastForm, setShowBroadcastForm] = useState(false);

  // Broadcast state
  const [bTitle, setBTitle] = useState("");
  const [bMessage, setBMessage] = useState("");
  const [bType, setBType] = useState<NotificationType>("event");
  const [bAudience, setBAudience] = useState<"all" | "student" | "volunteer">("all");
  const [bSubmitting, setBSubmitting] = useState(false);
  const [bSuccessToast, setBSuccessToast] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close on Escape or click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (activeTab === "unread") return !n.read;
      if (activeTab === "passes") return n.category === "registration" || n.category === "gate_scan" || n.type === "pass" || n.type === "gate";
      if (activeTab === "announcements") return n.category === "announcement" || n.type === "event";
      if (activeTab === "alerts") return n.category === "security" || n.type === "warning" || n.type === "urgent";
      return true;
    });
  }, [notifications, activeTab]);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bTitle.trim() || !bMessage.trim()) return;

    setBSubmitting(true);
    try {
      await sendBroadcastNotification(
        bTitle.trim(),
        bMessage.trim(),
        bType,
        bAudience === "all" ? undefined : bAudience,
        bAudience === "student" ? "/passes" : "/"
      );
      setBTitle("");
      setBMessage("");
      setShowBroadcastForm(false);
      setBSuccessToast(true);
      setTimeout(() => setBSuccessToast(false), 3000);
    } finally {
      setBSubmitting(false);
    }
  };

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return "just now";
    try {
      const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
      if (diffSec < 60) return "just now";
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      return `${Math.floor(diffSec / 86400)}d ago`;
    } catch {
      return "recently";
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "pass":
        return <Ticket className="w-4 h-4 text-amber-400" />;
      case "gate":
      case "success":
        return <CheckCircle2Icon className="w-4 h-4 text-emerald-400" />;
      case "warning":
      case "urgent":
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case "event":
        return <Megaphone className="w-4 h-4 text-amber-500" />;
      default:
        return <Info className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Bell Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`Notifications (${unreadNotificationCount} unread)`}
        aria-expanded={isOpen}
        className={`relative p-2 rounded-full transition-colors cursor-pointer ${
          buttonClassName ||
          "text-stone-600 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 hover:text-stone-900 dark:hover:text-white"
        }`}
      >
        <Bell className="w-4 h-4" />
        {unreadNotificationCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#f59e0b] text-black font-extrabold text-[10px] leading-[17px] text-center ring-2 ring-[#0E0B1A] animate-pulse">
            {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          ref={panelRef}
          role="region"
          aria-label="Notification Center"
          className="fixed sm:absolute right-2 sm:right-0 top-16 sm:top-full mt-2 w-[calc(100vw-16px)] sm:w-[420px] max-h-[82vh] flex flex-col rounded-2xl bg-[#0E0B1A] border border-amber-500/25 shadow-2xl text-white z-50 overflow-hidden backdrop-blur-xl animate-in fade-in duration-200"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-amber-500/20 bg-black/20 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight">Notifications</span>
              {unreadNotificationCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[11px] font-bold">
                  {unreadNotificationCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadNotificationCount > 0 && (
                <button
                  type="button"
                  onClick={markAllNotificationsAsRead}
                  title="Mark all as read"
                  className="p-1.5 rounded-lg text-white/60 hover:text-amber-300 hover:bg-white/5 transition-colors cursor-pointer text-xs flex items-center gap-1 font-medium"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mark read</span>
                </button>
              )}

              {/* Broadcast toggle (Organizers or admin) */}
              <button
                type="button"
                onClick={() => setShowBroadcastForm((v) => !v)}
                title="Create campus announcement"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 font-medium ${
                  showBroadcastForm
                    ? "bg-amber-500 text-black font-bold"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Broadcast</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close notifications"
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Organizer Announcement Broadcast Drawer */}
          {showBroadcastForm && (
            <form
              onSubmit={handleBroadcast}
              className="p-3.5 bg-amber-950/25 border-b border-amber-500/30 flex flex-col gap-2.5 shrink-0 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300 flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                  Live Campus Broadcast
                </span>
                <span className="text-[10px] text-white/50">Sends instant alert to users</span>
              </div>

              <input
                type="text"
                placeholder="Announcement Title (e.g. Hackathon Round 1 Briefing)"
                value={bTitle}
                onChange={(e) => setBTitle(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-amber-500/30 text-white placeholder-white/40 focus:outline-none focus:border-amber-400 text-xs"
              />

              <textarea
                placeholder="Broadcast message body details..."
                value={bMessage}
                onChange={(e) => setBMessage(e.target.value)}
                rows={2}
                required
                className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-amber-500/30 text-white placeholder-white/40 focus:outline-none focus:border-amber-400 text-xs resize-none"
              />

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-white/60">Target:</label>
                  <select
                    value={bAudience}
                    onChange={(e) => setBAudience(e.target.value as any)}
                    className="bg-black/60 border border-amber-500/30 rounded px-1.5 py-0.5 text-[11px] text-white"
                  >
                    <option value="all">Everyone</option>
                    <option value="student">Students Only</option>
                    <option value="volunteer">Volunteers Only</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-white/60">Type:</label>
                  <select
                    value={bType}
                    onChange={(e) => setBType(e.target.value as any)}
                    className="bg-black/60 border border-amber-500/30 rounded px-1.5 py-0.5 text-[11px] text-white"
                  >
                    <option value="event">Event Alert</option>
                    <option value="urgent">Urgent Warning</option>
                    <option value="info">General Info</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={bSubmitting}
                  className="ml-auto inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-xs hover:from-amber-300 hover:to-amber-400 transition-all cursor-pointer shadow-sm shadow-amber-500/30 disabled:opacity-50"
                >
                  <Send className="w-3 h-3" />
                  <span>{bSubmitting ? "Broadcasting..." : "Send"}</span>
                </button>
              </div>
            </form>
          )}

          {/* Success Banner if sent */}
          {bSuccessToast && (
            <div className="px-4 py-2 bg-emerald-500/20 border-b border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 shrink-0">
              <Check className="w-3.5 h-3.5" />
              <span>Announcement successfully broadcast to campus attendees!</span>
            </div>
          )}

          {/* Category Tabs */}
          <div className="px-3 py-2 border-b border-amber-500/15 bg-black/10 flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-2.5 py-1 rounded-lg transition-all font-semibold whitespace-nowrap cursor-pointer ${
                activeTab === "all"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("unread")}
              className={`px-2.5 py-1 rounded-lg transition-all font-semibold whitespace-nowrap cursor-pointer ${
                activeTab === "unread"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              Unread ({unreadNotificationCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("passes")}
              className={`px-2.5 py-1 rounded-lg transition-all font-semibold whitespace-nowrap cursor-pointer ${
                activeTab === "passes"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              Passes & Gate
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("announcements")}
              className={`px-2.5 py-1 rounded-lg transition-all font-semibold whitespace-nowrap cursor-pointer ${
                activeTab === "announcements"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              Announcements
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("alerts")}
              className={`px-2.5 py-1 rounded-lg transition-all font-semibold whitespace-nowrap cursor-pointer ${
                activeTab === "alerts"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              Alerts
            </button>
          </div>

          {/* Notification Items List */}
          <div className="flex-1 overflow-y-auto divide-y divide-amber-500/10 overscroll-contain">
            {filteredNotifications.length === 0 ? (
              <div className="py-10 px-4 flex flex-col items-center justify-center text-center text-white/50">
                <Bell className="w-8 h-8 mb-2 opacity-30 text-amber-400" />
                <p className="text-sm font-medium">No notifications in this tab</p>
                <p className="text-xs text-white/40 mt-0.5">
                  Check back for live gate scans, registrations, and fest updates
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 flex items-start gap-3 transition-colors ${
                    notif.read ? "bg-transparent opacity-80 hover:opacity-100" : "bg-amber-500/[0.06]"
                  } hover:bg-white/[0.04] group`}
                >
                  {/* Type Icon */}
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10 shrink-0 mt-0.5">
                    {getNotificationIcon(notif.type)}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-[12.5px] font-bold text-white tracking-tight truncate">
                        {notif.title}
                      </span>
                      <span className="text-[10.5px] text-white/40 shrink-0">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>

                    <p className="text-[11.5px] text-white/70 leading-relaxed break-words">
                      {notif.message}
                    </p>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      {notif.link ? (
                        <Link
                          href={notif.link}
                          onClick={() => {
                            if (!notif.read) markNotificationAsRead(notif.id);
                            setIsOpen(false);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 hover:text-amber-200 transition-colors"
                        >
                          <span>Open details</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span />
                      )}

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        {!notif.read && (
                          <button
                            type="button"
                            onClick={() => markNotificationAsRead(notif.id)}
                            title="Mark as read"
                            className="p-1 rounded-md text-white/40 hover:text-emerald-400 hover:bg-white/10 transition-colors cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => deleteNotification(notif.id)}
                          title="Delete notification"
                          className="p-1 rounded-md text-white/40 hover:text-rose-400 hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Unread dot */}
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0 mt-1.5 shadow-[0_0_8px_#f59e0b]" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-amber-500/20 bg-black/30 flex items-center justify-between text-xs text-white/50 shrink-0">
            <span className="flex items-center gap-1.5 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Ops Stream
            </span>

            <button
              type="button"
              onClick={clearReadNotifications}
              className="text-[11px] text-white/50 hover:text-white transition-colors cursor-pointer underline underline-offset-2"
            >
              Clear read
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckCircle2Icon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
