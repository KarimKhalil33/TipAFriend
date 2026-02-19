"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  FaArrowLeft,
  FaHeart,
  FaComment,
  FaUserPlus,
  FaCheck,
  FaExclamationCircle,
  FaDollarSign,
} from "react-icons/fa";
import { notificationsApi } from "@/lib/api";
import type { Notification } from "@/lib/api";

export default function NotificationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postIdFilter = Number(searchParams.get("postId") || "0");
  const [filter, setFilter] = useState("all"); // "all", "unread"
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const rawData = await notificationsApi.getNotifications();

      const list = Array.isArray(rawData)
        ? rawData
        : Array.isArray((rawData as any)?.content)
          ? (rawData as any).content
          : [];

      const normalized = list.map((n: any) => ({
        ...n,
        read: n.read ?? n.isRead ?? false,
        message: n.message || n.title || "Notification",
      }));

      const filteredByPost = postIdFilter
        ? normalized.filter(
            (n: any) =>
              Number(n.postId || 0) === postIdFilter ||
              String(n.message || "").includes(`#${postIdFilter}`),
          )
        : normalized;

      setNotifications(filteredByPost);
    } catch (err: any) {
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [postIdFilter]);

  const getNotificationIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "friend_request":
      case "friend_request_received":
        return <FaUserPlus className="text-blue-500" />;
      case "post_liked":
        return <FaHeart className="text-red-500" />;
      case "new_post":
      case "post_created":
        return <FaExclamationCircle className="text-green-500" />;
      case "message":
      case "new_message":
        return <FaComment className="text-purple-500" />;
      case "post_accepted":
      case "task_accepted":
        return <FaCheck className="text-green-600" />;
      case "payment_received":
      case "payment_succeeded":
        return <FaDollarSign className="text-green-500" />;
      case "task_completed":
      case "task_in_progress":
        return <FaCheck className="text-blue-500" />;
      default:
        return <FaExclamationCircle className="text-gray-500" />;
    }
  };

  const getActionUrl = (notification: Notification): string => {
    const type = notification.type?.toLowerCase() || "";

    if (notification.conversationId || type.includes("message")) {
      return notification.conversationId
        ? `/messages?conversationId=${notification.conversationId}`
        : notification.actorUserId
          ? `/messages?userId=${notification.actorUserId}`
          : "/messages";
    }

    if (type.includes("friend")) {
      return "/profile";
    }

    if (notification.postId) {
      return `/posts/${notification.postId}`;
    }

    if (type.includes("payment")) {
      return "/payments";
    }

    if (notification.taskAssignmentId && type.includes("task_completed")) {
      return `/reviews?taskAssignmentId=${notification.taskAssignmentId}`;
    }

    return notification.postId
      ? `/notifications?postId=${notification.postId}`
      : "/notifications";
  };

  const getInitials = (notification: Notification) => {
    const source =
      notification.user?.displayName || notification.user?.username || "U";
    return source.charAt(0).toUpperCase();
  };

  const formatTime = (createdAt: string) => {
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString();
  };

  const filteredNotifications = notifications.filter(
    (notification) => filter === "all" || !notification.read,
  );

  const markAsRead = async (notificationId: number) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
      );
    } catch (err) {
      // Optionally show error
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    const url = getActionUrl(notification);
    if (url !== "/notifications") {
      router.push(url);
    }
  };

  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications
          .filter((n) => !n.read)
          .map((n) => notificationsApi.markAsRead(n.id)),
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      // Optionally show error
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 text-lg">Loading notifications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-white text-gray-900 overflow-y-auto">
      {/* Background Wave Pattern */}
      <div className="absolute inset-0 z-0">
        <svg
          className="absolute top-0 left-0 w-full h-full opacity-10"
          viewBox="0 0 1000 1000"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0,300 Q250,200 500,300 T1000,300 L1000,0 L0,0 Z"
            fill="currentColor"
            className="text-gray-300"
          />
        </svg>
      </div>

      <Navbar />

      <main className="relative z-10 pt-24 px-4 max-w-4xl mx-auto pb-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/marketplace">
            <div className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors cursor-pointer">
              <FaArrowLeft />
              <span>Back to Dashboard</span>
            </div>
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Notifications
              </h1>
              <p className="text-gray-600">
                Stay updated on your friend activity
              </p>
            </div>
            <button
              onClick={markAllAsRead}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Mark all as read
            </button>
            <button
              onClick={loadNotifications}
              className="ml-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex bg-white rounded-lg shadow-sm border overflow-hidden w-fit">
            <button
              onClick={() => setFilter("all")}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              All Notifications
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                filter === "unread"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Unread Only
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <button
                key={notification.id}
                className={`bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-all cursor-pointer ${
                  !notification.read ? "border-l-4 border-blue-500" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: "rgb(9, 13, 33)" }}
                  >
                    {getInitials(notification)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        {notification.title ? (
                          <h3 className="text-sm font-semibold text-gray-900 mb-0.5">
                            {notification.title}
                          </h3>
                        ) : null}
                        <p
                          className={`text-gray-800 ${!notification.read ? "font-medium" : ""}`}
                        >
                          {notification.message}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <FaCheck className="text-6xl mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No {filter === "unread" ? "unread" : ""} notifications
              </h3>
              <p className="text-gray-500">
                {filter === "unread"
                  ? "You're all caught up! Check back later for updates."
                  : "You don't have any notifications yet."}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
