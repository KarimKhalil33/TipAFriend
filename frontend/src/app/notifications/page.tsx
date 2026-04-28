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
      return { icon: FaUserPlus, color: "bg-blue-100 text-blue-600" };
    case "post_liked":
      return { icon: FaHeart, color: "bg-rose-100 text-rose-600" };
    case "new_post":
    case "post_created":
      return {
        icon: FaExclamationCircle,
        color: "bg-emerald-100 text-emerald-600",
      };
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
      return { icon: FaBell, color: "bg-gray-100 text-gray-600" };
  }
};

const actionUrlFor = (notification: Notification): string => {
  const type = notification.type?.toLowerCase() || "";

  if (notification.conversationId || type.includes("message")) {
    const params = new URLSearchParams();
    if (notification.conversationId)
      params.set("conversationId", String(notification.conversationId));
    if (notification.actorUserId)
      params.set("userId", String(notification.actorUserId));
    if (notification.postId) params.set("postId", String(notification.postId));
    if (notification.taskAssignmentId)
      params.set("taskAssignmentId", String(notification.taskAssignmentId));
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
  const {
    notifications,
    unreadCount,
    loading,
    error,
    refresh,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [actorMap, setActorMap] = useState<Record<number, User>>({});

  // Fetch any actor users we don't have cached yet
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
          } catch {
            return null;
          }
        }),
      );
      if (cancelled) return;
      setActorMap((prev) => {
        const next = { ...prev };
        results.forEach((r) => {
          if (r) next[r[0]] = r[1];
        });
        return next;
      });
    })();
    return () => {
      cancelled = true;
    };
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
    if (filter === "unread") {
      list = list.filter((n) => !n.read);
    }
    return list;
  }, [notifications, filter, postIdFilter]);

  const grouped = useMemo(() => {
    const groups: { day: string; items: Notification[] }[] = [];
    filtered.forEach((n) => {
      const day = dayLabel(n.createdAt);
      const last = groups[groups.length - 1];
      if (last && last.day === day) {
        last.items.push(n);
      } else {
        groups.push({ day, items: [n] });
      }
    });
    return groups;
  }, [filtered]);

  const handleClick = async (n: Notification) => {
    if (!n.read) await markAsRead(n.id);
    const url = actionUrlFor(n);
    if (url) router.push(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white text-gray-900">
      <Navbar />

      <main className="px-4 max-w-3xl mx-auto pb-8 pt-4 sm:pt-6">
        {/* Header */}
        <div className="mb-6">
          <Link href="/marketplace">
            <div className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-3 transition-colors cursor-pointer text-sm">
              <FaArrowLeft />
              <span>Back to Marketplace</span>
            </div>
          </Link>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                Notifications
                {unreadCount > 0 && (
                  <span className="bg-blue-500 text-white text-sm font-semibold rounded-full px-3 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Stay updated on tasks, messages, and friends.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => refresh()}
                className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                title="Refresh"
              >
                <FaSyncAlt className="text-xs" />
                Refresh
              </button>
              <button
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaCheckDouble className="text-xs" />
                Mark all read
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm mb-4">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-5 flex bg-white rounded-xl border border-gray-200 p-1 w-fit shadow-sm">
          <button
            onClick={() => setFilter("all")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "unread"
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>

        {/* List */}
        {loading && notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Loading notifications...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
            <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
              <FaBell className="text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">
              {filter === "unread"
                ? "You're all caught up"
                : "No notifications yet"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {filter === "unread"
                ? "Check back later for new updates."
                : "We'll let you know when something happens."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map((group) => (
              <div key={group.day}>
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
                  {group.day}
                </h2>
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100 shadow-sm">
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
                        className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                          !n.read ? "bg-blue-50/40" : ""
                        }`}
                      >
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${color}`}
                        >
                          <Icon className="text-base" />
                        </div>
                        <button
                          onClick={() => handleClick(n)}
                          className="flex-1 min-w-0 text-left cursor-pointer"
                          disabled={!url && n.read}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              {showActor && (
                                <p className="text-sm font-semibold text-gray-900">
                                  {actorName}
                                </p>
                              )}
                              {n.title && !showActor && (
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  {n.title}
                                </p>
                              )}
                              {n.title && showActor && n.title !== actorName && (
                                <p className="text-xs font-medium text-gray-600 truncate">
                                  {n.title}
                                </p>
                              )}
                              <p
                                className={`text-sm ${
                                  !n.read ? "text-gray-900" : "text-gray-600"
                                }`}
                              >
                                {n.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {formatRelative(n.createdAt)}
                              </p>
                            </div>
                            {!n.read && (
                              <span className="flex-shrink-0 mt-1 w-2.5 h-2.5 rounded-full bg-blue-500" />
                            )}
                          </div>
                        </button>
                        {!n.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(n.id);
                            }}
                            className="flex-shrink-0 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                            title="Mark as read"
                          >
                            <FaCheck />
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
