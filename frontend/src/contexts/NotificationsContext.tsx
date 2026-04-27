"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { notificationsApi, type Notification } from "@/lib/api";
import { useAuth } from "./AuthContext";

const POLL_INTERVAL_MS = 15000;

const normalize = (n: any): Notification => ({
  ...n,
  read: n.read ?? n.isRead ?? false,
  message: n.message || n.title || "Notification",
});

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seenIdsRef = useRef<Set<number>>(new Set());
  const initializedRef = useRef(false);

  const showDesktopNotification = useCallback((n: Notification) => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    if (window.Notification.permission !== "granted") return;
    try {
      new window.Notification(n.title || "TipAFriend", {
        body: n.message,
        tag: `tipafriend-${n.id}`,
      });
    } catch {
      /* ignore */
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      seenIdsRef.current = new Set();
      initializedRef.current = false;
      return;
    }
    try {
      setError(null);
      const raw = (await notificationsApi.getNotifications()) as any;
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.content)
          ? raw.content
          : [];
      const items: Notification[] = list.map(normalize);
      items.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      // detect new unread to surface as desktop notifications
      if (initializedRef.current) {
        items.forEach((n) => {
          if (!n.read && !seenIdsRef.current.has(n.id)) {
            showDesktopNotification(n);
          }
        });
      }
      seenIdsRef.current = new Set(items.map((n) => n.id));
      initializedRef.current = true;

      setNotifications(items);
    } catch (err: any) {
      setError(err?.message || "Failed to load notifications");
    }
  }, [isAuthenticated, showDesktopNotification]);

  // Initial load + reset on auth change
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      seenIdsRef.current = new Set();
      initializedRef.current = false;
      return;
    }
    setLoading(true);
    refresh().finally(() => setLoading(false));

    // ask for desktop notification permission once
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      window.Notification.permission === "default"
    ) {
      window.Notification.requestPermission().catch(() => {});
    }
  }, [isAuthenticated, refresh]);

  // Poll
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      refresh().catch(() => {});
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isAuthenticated, refresh]);

  // Refresh on tab focus
  useEffect(() => {
    if (!isAuthenticated) return;
    const onFocus = () => {
      refresh().catch(() => {});
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [isAuthenticated, refresh]);

  const markAsRead = useCallback(
    async (id: number) => {
      // optimistic
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      try {
        await notificationsApi.markAsRead(id);
        // Re-fetch to confirm server state actually persisted
        await refresh();
      } catch (err) {
        console.error("[notifications] markAsRead failed", err);
        // rollback on failure
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: false } : n)),
        );
      }
    },
    [refresh],
  );

  const markAllAsRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await Promise.all(
      unread.map((n) => notificationsApi.markAsRead(n.id).catch(() => null)),
    );
    await refresh();
  }, [notifications, refresh]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications,
      unreadCount,
      loading,
      error,
      refresh,
      markAsRead,
      markAllAsRead,
    }),
    [
      notifications,
      unreadCount,
      loading,
      error,
      refresh,
      markAsRead,
      markAllAsRead,
    ],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error(
      "useNotifications must be used within NotificationsProvider",
    );
  }
  return ctx;
}
