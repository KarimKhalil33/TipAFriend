"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  FaArrowLeft,
  FaHeart,
  FaComment,
  FaUserPlus,
  FaCheck,
  FaCheckDouble,
  FaExclamationCircle,
  FaDollarSign,
  FaSyncAlt,
  FaBell,
} from "react-icons/fa";
import type { Notification, User } from "@/lib/api";
import { usersApi } from "@/lib/api";
import { useNotifications } from "@/contexts/NotificationsContext";

const formatRelative = (iso?: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

const dayLabel = (iso: string) => {
  const date = new Date(iso);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return "Today";
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
};

const iconForType = (type: string | undefined) => {
  switch (type?.toLowerCase()) {
    case "friend_request":
    case "friend_request_received":
      return { icon: FaUserPlus, color: "bg-indigo-100 text-indigo-600" };
    case "post_liked":
      return { icon: FaHeart, color: "bg-rose-100 text-rose-600" };
    case "new_post":
    case "post_created":
      return { icon: FaExclamationCircle, color: "bg-emerald-100 text-emerald-600" };
    case "message":
    case "new_message":
      return { icon: FaComment, color: "bg-purple-100 text-purple-600" };
    case "post_accepted":
    case "task_accepted":
      return { icon: FaCheck, color: "bg-emerald-100 text-emerald-600" };
    case "payment_received":
    case "payment_succeeded":
      return { icon: FaDollarSign, color: "bg-emerald-100 text-emerald-600" };
    case "task_completed":
    case "task_in_progress":
      return { icon: FaCheck, color: "bg-blue-100 text-blue-600" };
    default:
      return { icon: FaBell, color: "bg-gray-100 text-gray-500" };
  }
};

const actionUrlFor = (notification: Notification): string => {
  const type = notification.type?.toLowerCase() || "";
  if (notification.conversationId || type.includes("message")) {
    const params = new URLSearchParams();
    if (notification.conversationId) params.set("conversationId", String(notification.conversationId));
    if (notification.actorUserId) params.set("userId", String(notification.actorUserId));
    if (notification.postId) params.set("postId", String(notification.postId));
    if (notification.taskAssignmentId) params.set("taskAssignmentId", String(notification.taskAssignmentId));
    return params.toString() ? `/messages?${params.toString()}` : "/messages";
  }
  if (type.includes("friend")) return "/profile";
  if (type.includes("payment")) return "/payments";
  if (notification.taskAssignmentId && type.includes("task_completed"))
    return `/reviews?taskAssignmentId=${notification.taskAssignmentId}`;
  if (notification.postId) return `/posts/${notification.postId}`;
  return "";
};

export default function NotificationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postIdFilter = Number(searchParams.get("postId") || "0");
  const { notifications, unreadCount, loading, error, refresh, markAsRead, markAllAsRead } =
    useNotifications();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [actorMap, setActorMap] = useState<Record<number, User>>({});

  useEffect(() => {
    const ids = Array.from(
      new Set(
        notifications
          .map((n) => n.actorUserId)
          .filter((id): id is number => !!id && !actorMap[id]),
      ),
    );
    if (ids.length === 0) return;
    let cancelled = false;
    (async () => {
      const results = await Promise.all(
        ids.map(async (id) => {
          try {
            const u = await usersApi.getUser(id);
            return [id, u] as const;
          } catch { return null; }
        }),
      );
      if (cancelled) return;
      setActorMap((prev) => {
        const next = { ...prev };
        results.forEach((r) => { if (r) next[r[0]] = r[1]; });
        return next;
      });
    })();
    return () => { cancelled = true; };
  }, [notifications, actorMap]);

  const actorNameOf = (n: Notification): string | null => {
    if (!n.actorUserId) return null;
    const u = actorMap[n.actorUserId];
    if (!u) return null;
    return u.displayName || u.username || null;
  };

  const filtered = useMemo(() => {
    let list = notifications;
    if (postIdFilter) {
      list = list.filter(
        (n) =>
          Number(n.postId || 0) === postIdFilter ||
          String(n.message || "").includes(`#${postIdFilter}`),
      );
    }
    if (filter === "unread") list = list.filter((n) => !n.read);
    return list;
  }, [notifications, filter, postIdFilter]);

  const grouped = useMemo(() => {
    const groups: { day: string; items: Notification[] }[] = [];
    filtered.forEach((n) => {
      const day = dayLabel(n.createdAt);
      const last = groups[groups.length - 1];
      if (last && last.day === day) { last.items.push(n); }
      else { groups.push({ day, items: [n] }); }
    });
    return groups;
  }, [filtered]);

  const handleClick = async (n: Notification) => {
    if (!n.read) await markAsRead(n.id);
    const url = actionUrlFor(n);
    if (url) router.push(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      {/* Compact dark header */}
      <div className="bg-[#090D21] pt-20 pb-16 px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-20 w-64 h-64 bg-indigo-600 rounded-full opacity-10 blur-3xl" />
          <div className="absolute bottom-0 left-10 w-64 h-64 bg-purple-600 rounded-full opacity-10 blur-3xl" />
        </div>
        <div className="max-w-3xl mx-auto relative z-10">
          <Link href="/marketplace">
            <span className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors text-sm cursor-pointer w-fit">
              <FaArrowLeft className="text-xs" />
              Back to Marketplace
            </span>
          </Link>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-4xl font-extrabold text-white flex items-center gap-3">
                Notifications
                {unreadCount > 0 && (
                  <span className="bg-indigo-500 text-white text-sm font-semibold rounded-full px-3 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </h1>
              <p className="text-gray-300 text-sm mt-1">
                Stay updated on tasks, messages, and friends.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => refresh()}
                className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border border-white/20 text-gray-300 hover:bg-white/10 transition-all"
              >
                <FaSyncAlt className="text-xs" />
                Refresh
              </button>
              <button
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-md hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <FaCheckDouble className="text-xs" />
                Mark all read
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="px-4 max-w-3xl mx-auto pb-12 -mt-6 relative z-10">

        {/* Filter tabs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 mb-5 flex gap-1 w-fit">
          <button
            onClick={() => setFilter("all")}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              filter === "all"
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              filter === "unread"
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-red-600 text-sm mb-5">
            {error}
          </div>
        )}

        {/* Notification list */}
        {loading && notifications.length === 0 ? (
          <div className="flex justify-center items-center py-24">
            <div className="flex items-center gap-3 text-gray-400">
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Loading notifications...</span>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300 mb-4">
              <FaBell className="text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">
              {filter === "unread" ? "You're all caught up" : "No notifications yet"}
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              {filter === "unread"
                ? "Check back later for new updates."
                : "We'll let you know when something happens."}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {grouped.map((group) => (
              <div key={group.day}>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                  {group.day}
                </h2>
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-50 shadow-sm">
                  {group.items.map((n) => {
                    const { icon: Icon, color } = iconForType(n.type);
                    const url = actionUrlFor(n);
                    const actorName = actorNameOf(n);
                    const showActor =
                      actorName &&
                      !(n.title && n.title.includes(actorName)) &&
                      !(n.message && n.message.includes(actorName));

                    return (
                      <div
                        key={n.id}
                        className={`flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors ${
                          !n.read ? "bg-indigo-50/50" : ""
                        }`}
                      >
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                          <Icon className="text-base" />
                        </div>

                        {/* Content */}
                        <button
                          onClick={() => handleClick(n)}
                          className="flex-1 min-w-0 text-left"
                          disabled={!url && n.read}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              {showActor && (
                                <p className="text-sm font-semibold text-gray-900">{actorName}</p>
                              )}
                              {n.title && !showActor && (
                                <p className="text-sm font-semibold text-gray-900 truncate">{n.title}</p>
                              )}
                              {n.title && showActor && n.title !== actorName && (
                                <p className="text-xs font-medium text-gray-600 truncate">{n.title}</p>
                              )}
                              <p className={`text-sm leading-relaxed ${!n.read ? "text-gray-800" : "text-gray-500"}`}>
                                {n.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">{formatRelative(n.createdAt)}</p>
                            </div>
                            {!n.read && (
                              <span className="flex-shrink-0 mt-1.5 w-2 h-2 rounded-full bg-indigo-500" />
                            )}
                          </div>
                        </button>

                        {/* Mark read button */}
                        {!n.read && (
                          <button
                            onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                            className="flex-shrink-0 p-2 text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Mark as read"
                          >
                            <FaCheck className="text-xs" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
