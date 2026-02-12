"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import {
  FaPlus,
  FaFilter,
  FaMapMarkerAlt,
  FaClock,
  FaDollarSign,
  FaUser,
  FaHeart,
  FaComments,
} from "react-icons/fa";

export default function DashboardPage() {
  const [filter, setFilter] = useState("all"); // "all", "requests", "offers"
  const [timeSort, setTimeSort] = useState("newest"); // "newest", "oldest", "scheduled"
  const [userName] = useState("John"); // This would come from auth context

  // Mock data - in real app this would come from API
  const friendsPosts = [
    {
      id: 1,
      type: "request",
      author: "Sarah Johnson",
      title: "Need help moving boxes",
      description:
        "Moving to new apartment, need help with heavy boxes and furniture",
      category: "Moving",
      location: "Downtown Toronto, ON, Canada",
      scheduledTime: "Feb 12, 2026 at 10:00 AM EST",
      timeAgo: "2h",
      price: "50 USD",
      duration: "3 hours",
      profileImg: "https://via.placeholder.com/40",
      initials: "SJ",
    },
    {
      id: 2,
      type: "offer",
      author: "Mike Chen",
      title: "Can walk your dog Tuesday 3PM",
      description:
        "Free Tuesday afternoon, can walk your dog around Central Park area",
      category: "Pet Care",
      location: "Central Park, New York, NY, USA",
      scheduledTime: "Feb 11, 2026 at 3:00 PM EST",
      timeAgo: "4h",
      price: "15 USD",
      duration: "1 hour",
      profileImg: "https://via.placeholder.com/40",
      initials: "MC",
    },
    {
      id: 3,
      type: "request",
      author: "Emma Wilson",
      title: "Grocery shopping help",
      description:
        "Need someone to pick up groceries, I'll provide list and payment",
      category: "Shopping",
      location: "Westside Vancouver, BC, Canada",
      scheduledTime: "Feb 11, 2026 at 6:00 PM PST",
      timeAgo: "6h",
      price: "25 CAD",
      duration: "1 hour",
      profileImg: "https://via.placeholder.com/40",
      initials: "EW",
    },
  ];

  const filteredPosts = friendsPosts
    .filter((post) => filter === "all" || post.type === filter)
    .sort((a, b) => {
      if (timeSort === "newest") {
        return (
          new Date(b.scheduledTime).getTime() -
          new Date(a.scheduledTime).getTime()
        );
      } else if (timeSort === "oldest") {
        return (
          new Date(a.scheduledTime).getTime() -
          new Date(b.scheduledTime).getTime()
        );
      } else {
        // "scheduled" - sort by how soon the scheduled time is
        const now = new Date().getTime();
        const aTime = new Date(a.scheduledTime).getTime();
        const bTime = new Date(b.scheduledTime).getTime();
        return Math.abs(aTime - now) - Math.abs(bTime - now);
      }
    });

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

      <main className="relative z-10 pt-24 px-4 max-w-6xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {userName}!
          </h1>
          <p className="text-gray-600">See what your friends need help with</p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          {/* Create Post Button */}
          <Link href="/create-post">
            <Button className="bg-gray-900 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition duration-300">
              <FaPlus className="text-sm" />
              Create Post
            </Button>
          </Link>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Sort Dropdown */}
            <select
              value={timeSort}
              onChange={(e) => setTimeSort(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="scheduled">Soonest Time</option>
            </select>

            {/* Filter Tabs */}
            <div className="flex bg-white rounded-lg shadow-sm border overflow-hidden">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  filter === "all"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                All Posts
              </button>
              <button
                onClick={() => setFilter("requests")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  filter === "requests"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                Requests
              </button>
              <button
                onClick={() => setFilter("offers")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  filter === "offers"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                Offers
              </button>
            </div>
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Post Header */}
              <div
                className="flex items-start justify-between mb-4 p-6 pb-4"
                style={{
                  background:
                    "linear-gradient(135deg, rgb(9, 13, 33) 0%, rgb(30, 41, 59) 100%)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white"
                    style={{ backgroundColor: "rgb(9, 13, 33)" }}
                  >
                    {post.initials}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{post.author}</h3>
                    <p className="text-sm text-gray-300">{post.timeAgo} ago</p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    post.type === "request"
                      ? "bg-blue-200 text-blue-800"
                      : "bg-green-200 text-green-800"
                  }`}
                >
                  {post.type === "request" ? "Request" : "Offer"}
                </span>
              </div>

              {/* Post Content */}
              <div className="mb-4 px-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {post.title}
                </h2>
                <p className="text-gray-600 mb-3">{post.description}</p>

                {/* Post Details */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <FaMapMarkerAlt className="text-blue-500" />
                    <span>{post.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaClock className="text-blue-500" />
                    <span>{post.scheduledTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">
                      Duration: {post.duration}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaDollarSign className="text-green-500" />
                    <span className="font-semibold">{post.price}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className="px-2 py-1 rounded text-xs text-white"
                      style={{ backgroundColor: "rgb(9, 13, 33)" }}
                    >
                      {post.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-6 pb-2 px-6 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors">
                    <FaHeart />
                    <span className="text-sm">Like</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
                    <FaComments />
                    <span className="text-sm">Message</span>
                  </button>
                </div>

                <Button
                  className={`py-2 px-6 rounded-lg font-semibold transition duration-300 ${
                    post.type === "request"
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  {post.type === "request" ? "Help Out" : "Hire"}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center py-8">
          <Button className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-8 py-3 rounded-lg">
            Load More Posts
          </Button>
        </div>
      </main>
    </div>
  );
}
