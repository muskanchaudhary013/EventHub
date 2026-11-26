import { EventItem, DigitalPass, ScanLogEntry, AttendeeRecord, NotificationItem, INITIAL_EVENTS, INITIAL_PASSES, INITIAL_SCAN_LOGS, INITIAL_ATTENDEES, INITIAL_NOTIFICATIONS } from "./eventhub-data";

/**
 * Resolves the API URL for both server-side and client-side requests:
 * - Server-side (Vercel Functions / SSR): uses the injected `BACKEND_URL` service binding.
 * - Client-side (browser): uses the shared same-origin `/api` path routed by `vercel.json`,
 *   or `NEXT_PUBLIC_API_URL` if explicitly configured for standalone local dev.
 */
function buildApiUrl(endpoint: string): string {
  const normalized = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  if (typeof window === "undefined" && process.env.BACKEND_URL) {
    const base = process.env.BACKEND_URL.endsWith("/")
      ? process.env.BACKEND_URL
      : `${process.env.BACKEND_URL}/`;
    return new URL(`api${normalized}`, base).toString();
  }

  const publicBase = (process.env.NEXT_PUBLIC_API_URL || "/api").replace(/\/$/, "");
  return `${publicBase}${normalized}`;
}

/**
 * Safe fetch helper with graceful fallback to initial static mock data
 * when the backend API server is unreachable.
 */
async function safeFetch<T>(endpoint: string, options?: RequestInit, fallbackData?: T): Promise<T> {
  try {
    const res = await fetch(buildApiUrl(endpoint), {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    return (json.data ?? json) as T;
  } catch (error) {
    if (fallbackData !== undefined) {
      return fallbackData;
    }
    throw error;
  }
}

export const api = {
  // Events
  async getEvents(category?: string, day?: string): Promise<EventItem[]> {
    const params = new URLSearchParams();
    if (category && category !== "all") params.append("category", category);
    if (day && day !== "all") params.append("day", day);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return safeFetch<EventItem[]>(`/events${qs}`, { method: "GET" }, INITIAL_EVENTS);
  },

  async getEventById(id: string): Promise<EventItem | null> {
    return safeFetch<EventItem | null>(`/events/${id}`, { method: "GET" }, INITIAL_EVENTS.find((e) => e.id === id || e.trackCode === id) || null);
  },

  async createEvent(data: Partial<EventItem>): Promise<EventItem> {
    return safeFetch<EventItem>("/events", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Passes
  async getPasses(email?: string, userUid?: string): Promise<DigitalPass[]> {
    const params = new URLSearchParams();
    if (email) params.append("email", email);
    if (userUid) params.append("userUid", userUid);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return safeFetch<DigitalPass[]>(`/passes${qs}`, { method: "GET" }, []);
  },

  async createPass(data: Partial<DigitalPass> & { eventTitle: string; holderName: string; holderEmail: string }): Promise<DigitalPass> {
    return safeFetch<DigitalPass>("/passes", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Scans & Verification (Volunteers)
  async getScanLogs(): Promise<ScanLogEntry[]> {
    return safeFetch<ScanLogEntry[]>("/scans", { method: "GET" }, []);
  },

  async scanPass(passCode: string, gateLocation = "Gate 1"): Promise<{ success: boolean; status: string; message: string; pass?: DigitalPass }> {
    return safeFetch("/scans", {
      method: "POST",
      body: JSON.stringify({ passCode, gateLocation }),
    });
  },

  // Attendees & Gate Manifest (Organizers / Volunteers)
  async getAttendees(event?: string, status?: string): Promise<AttendeeRecord[]> {
    const params = new URLSearchParams();
    if (event && event !== "all") params.append("event", event);
    if (status && status !== "all") params.append("status", status);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return safeFetch<AttendeeRecord[]>(`/attendees${qs}`, { method: "GET" }, []);
  },

  async updateAttendeeStatus(passId: string, status: string, gateLocation?: string): Promise<{ success: boolean; data?: AttendeeRecord }> {
    return safeFetch(`/attendees/${encodeURIComponent(passId)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, gateLocation }),
    });
  },

  // Users & Sync
  async syncUser(userData: { firebaseUid: string; email: string; name?: string; role?: string; college?: string }) {
    return safeFetch("/users/sync", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  async getDashboardStats() {
    return safeFetch("/users/stats/overview", { method: "GET" }, {
      totalEvents: 0,
      totalPasses: 0,
      checkedInCount: 0,
      pendingCount: 0,
      totalScans: 0,
      attendanceRate: "0%",
    });
  },

  // Notifications
  async getNotifications(userUid?: string, role?: string, email?: string): Promise<{ data: NotificationItem[]; unreadCount: number }> {
    const params = new URLSearchParams();
    if (userUid) params.append("userUid", userUid);
    if (role) params.append("role", role);
    if (email) params.append("email", email);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return safeFetch<{ data: NotificationItem[]; unreadCount: number }>(
      `/notifications${qs}`,
      { method: "GET" },
      {
        data: [],
        unreadCount: 0,
      }
    );
  },

  async createNotification(data: Partial<NotificationItem>): Promise<NotificationItem> {
    return safeFetch<NotificationItem>("/notifications", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async markNotificationAsRead(id: string, userUid?: string): Promise<{ success: boolean }> {
    return safeFetch<{ success: boolean }>(`/notifications/${id}/read`, {
      method: "PATCH",
      body: JSON.stringify({ userUid }),
    });
  },

  async markAllNotificationsAsRead(userUid?: string, role?: string): Promise<{ success: boolean }> {
    return safeFetch<{ success: boolean }>("/notifications/read-all", {
      method: "PATCH",
      body: JSON.stringify({ userUid, role }),
    });
  },

  async deleteNotification(id: string): Promise<{ success: boolean }> {
    return safeFetch<{ success: boolean }>(`/notifications/${id}`, {
      method: "DELETE",
    });
  },

  async clearReadNotifications(userUid?: string): Promise<{ success: boolean }> {
    return safeFetch<{ success: boolean }>("/notifications/clear-read", {
      method: "DELETE",
      body: JSON.stringify({ userUid }),
    });
  },
};
