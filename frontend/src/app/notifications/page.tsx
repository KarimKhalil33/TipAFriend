"use client";

import { useState } from "react";
import Link from "next/link";
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

export default function NotificationsPage() {
  const [filter, setFilter] = useState("all"); // "all", "unread"

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      type: "friend_request",
      message: "Alex Johnson sent you a friend request",
      time: "2 hours ago",
      isRead: false,
      avatar: "AJ",
      actionUrl: "/friends/requests",
    },
    {
      id: 2,
      type: "post_liked",
      message: 'Sarah Johnson liked your post "Need help moving boxes"',
      time: "4 hours ago",
      isRead: false,
      avatar: "SJ",
      actionUrl: "/dashboard",
    },
    {
      id: 3,
      type: "new_post",
      message: 'Mike Chen posted a new offer: "Can walk your dog Tuesday 3PM"',
      time: "6 hours ago",
      isRead: true,
      avatar: "MC",
      actionUrl: "/dashboard",
    },
    {
      id: 4,
      type: "message",
      message: "Emma Wilson sent you a message about grocery shopping",
      time: "8 hours ago",
      isRead: false,
      avatar: "EW",
      actionUrl: "/messages/1",
    },
    {
      id: 5,
      type: "post_accepted",
      message: "Your moving help request was accepted by David Kim",
      time: "1 day ago",
      isRead: true,
      avatar: "DK",
      actionUrl: "/dashboard",
    },
    {
      id: 6,
      type: "payment_received",
      message: "You received 25 CAD payment from Emma Wilson",
      time: "2 days ago",
      isRead: true,
      avatar: "EW",
      actionUrl: "/payments",
    },
    {
      id: 7,
      type: "task_completed",
      message: "Task completed! Please rate your experience with Mike Chen",
      time: "3 days ago",
      isRead: true,
      avatar: "MC",
      actionUrl: "/reviews/new",
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "friend_request":
        return <FaUserPlus className="text-blue-500" />;
      case "post_liked":
        return <FaHeart className="text-red-500" />;
      case "new_post":
        return <FaExclamationCircle className="text-green-500" />;
      case "message":
        return <FaComment className="text-purple-500" />;
      case "post_accepted":
        return <FaCheck className="text-green-600" />;
      case "payment_received":
        return <FaDollarSign className="text-green-500" />;
      case "task_completed":
        return <FaCheck className="text-blue-500" />;
      default:
        return <FaExclamationCircle className="text-gray-500" />;
    }
  };

  const filteredNotifications = notifications.filter(
    (notification) => filter === "all" || !notification.isRead,
  );

  const markAsRead = (notificationId: number) => {
    // In real app, this would be an API call
    console.log("Marking notification as read:", notificationId);
  };

  const markAllAsRead = () => {
    // In real app, this would be an API call
    console.log("Marking all notifications as read");
  };

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
              <div
                key={notification.id}
                className={`bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-all cursor-pointer ${
                  !notification.isRead ? "border-l-4 border-blue-500" : ""
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: "rgb(9, 13, 33)" }}
                  >
                    {notification.avatar}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p
                        className={`text-gray-800 ${!notification.isRead ? "font-medium" : ""}`}
                      >
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {notification.time}
                    </p>
                  </div>
                </div>
              </div>
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

        {/* Load More (for future pagination) */}
        {filteredNotifications.length > 0 && (
          <div className="text-center py-8">
            <button className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-8 py-3 rounded-lg transition-colors">
              Load More Notifications
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
