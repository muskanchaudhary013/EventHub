"use client";

import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Info,
  Megaphone,
  Ticket,
  X,
} from "lucide-react";
import { NotificationType } from "@/lib/eventhub-data";

interface NotificationToastProps {
  toast: {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    link?: string;
  } | null;
  onDismiss: () => void;
}

export function NotificationToast({ toast, onDismiss }: NotificationToastProps) {
  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case "pass":
        return <Ticket className="w-5 h-5 text-amber-400" />;
      case "gate":
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case "warning":
      case "urgent":
        return <AlertTriangle className="w-5 h-5 text-rose-400" />;
      case "event":
        return <Megaphone className="w-5 h-5 text-amber-500" />;
      default:
        return <Info className="w-5 h-5 text-amber-400" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case "pass":
        return "border-amber-500/40 shadow-amber-500/10";
      case "gate":
      case "success":
        return "border-emerald-500/40 shadow-emerald-500/10";
      case "warning":
      case "urgent":
        return "border-rose-500/40 shadow-rose-500/10";
      case "event":
        return "border-amber-500/40 shadow-amber-500/10";
      default:
        return "border-amber-500/30 shadow-amber-500/10";
    }
  };

  return (
    <div
      role="alert"
      className="fixed bottom-5 right-5 z-[100] max-w-sm sm:max-w-md w-[calc(100vw-40px)] pointer-events-auto animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div
        className={`flex items-start gap-3 p-4 rounded-2xl bg-[#141026]/95 text-white backdrop-blur-xl border ${getBorderColor()} shadow-2xl`}
      >
        <div className="shrink-0 p-2 rounded-xl bg-white/5 border border-white/10 mt-0.5">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400">
              Notification
            </span>
            <span className="text-[10px] text-white/40">• just now</span>
          </div>
          <h4 className="text-sm font-bold text-white tracking-tight leading-snug truncate">
            {toast.title}
          </h4>
          <p className="text-xs text-white/70 line-clamp-2 mt-0.5 leading-relaxed">
            {toast.message}
          </p>

          {toast.link && (
            <div className="mt-2.5 flex items-center gap-2">
              <Link
                href={toast.link}
                onClick={onDismiss}
                className="text-[11.5px] font-semibold text-amber-300 hover:text-amber-200 underline underline-offset-2 flex items-center gap-1 transition-colors"
              >
                View details →
              </Link>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss toast"
          className="shrink-0 p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
