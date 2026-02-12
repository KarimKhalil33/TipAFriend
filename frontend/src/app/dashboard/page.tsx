"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaClock,
  FaDollarSign,
  FaUser,
  FaPlus,
  FaFilter,
  FaHeart,
  FaComment,
} from "react-icons/fa";

interface Task {
  id: number;
  title: string;
  description: string;
  price: number;
  currency: string;
  location: string;
  timePosted: string;
  scheduledTime: string;
  category: string;
  poster: {
    name: string;
    avatar: string;
    rating: number;
  };
  type: "request" | "offer";
}

export default function DashboardPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for tasks - mixed requests and offers
  const [tasks] = useState<Task[]>([
    {
      id: 1,
      title: "Need someone to clean my apartment",
      description:
        "Looking for someone to deep clean my 2-bedroom apartment. Must bring own supplies.",
      price: 80,
      currency: "USD",
      location: "United States, New York, Downtown Manhattan",
      timePosted: "2 hours ago",
      scheduledTime: "Feb 15, 2026 at 2:00 PM EST",
      category: "cleaning",
      poster: {
        name: "Sarah M.",
        avatar: "SM",
        rating: 4.8,
      },
      type: "request",
    },
    {
      id: 2,
      title: "Offering pet sitting services",
      description:
        "Experienced pet sitter available for weekends. Great with dogs and cats!",
      price: 45,
      currency: "CAD",
      location: "Canada, Toronto, Midtown",
      timePosted: "4 hours ago",
      scheduledTime: "Feb 14, 2026 at 6:00 PM EST",
      category: "pet-care",
      poster: {
        name: "Mike R.",
        avatar: "MR",
        rating: 4.9,
      },
      type: "offer",
    },
    {
      id: 3,
      title: "Grocery shopping needed",
      description:
        "Need someone to do grocery shopping for elderly parent. List will be provided.",
      price: 35,
      currency: "USD",
      location: "United States, Boston, Uptown",
      timePosted: "1 day ago",
      scheduledTime: "Feb 13, 2026 at 10:00 AM EST",
      category: "shopping",
      poster: {
        name: "Emma L.",
        avatar: "EL",
        rating: 4.7,
      },
      type: "request",
    },
    {
      id: 4,
      title: "Available for moving help",
      description:
        "Strong and reliable, available to help with furniture moving. Own truck available.",
      price: 120,
      currency: "CAD",
      location: "Canada, Vancouver, West End",
      timePosted: "3 hours ago",
      scheduledTime: "Feb 16, 2026 at 9:00 AM PST",
      category: "moving",
      poster: {
        name: "James T.",
        avatar: "JT",
        rating: 4.6,
      },
      type: "offer",
    },
    {
      id: 5,
      title: "Need meal prep cooking",
      description:
        "Looking for someone to prepare 5 healthy meals. Ingredients will be provided.",
      price: 75,
      currency: "EUR",
      location: "Germany, Berlin, East Side",
      timePosted: "6 hours ago",
      scheduledTime: "Feb 14, 2026 at 4:00 PM CET",
      category: "cooking",
      poster: {
        name: "Lisa K.",
        avatar: "LK",
        rating: 4.8,
      },
      type: "request",
    },
    {
      id: 6,
      title: "Offering house cleaning services",
      description:
        "Professional cleaner available weekdays. Eco-friendly products used.",
      price: 95,
      currency: "AUD",
      location: "Australia, Sydney, Downtown",
      timePosted: "1 day ago",
      scheduledTime: "Feb 17, 2026 at 11:00 AM AEDT",
      category: "cleaning",
      poster: {
        name: "Ana C.",
        avatar: "AC",
        rating: 4.9,
      },
      type: "offer",
    },
  ]);

  const categories = [
    { id: "all", name: "All Categories", count: tasks.length },
    {
      id: "cleaning",
      name: "Cleaning",
      count: tasks.filter((t) => t.category === "cleaning").length,
    },
    {
      id: "pet-care",
      name: "Pet Care",
      count: tasks.filter((t) => t.category === "pet-care").length,
    },
    {
      id: "shopping",
      name: "Shopping",
      count: tasks.filter((t) => t.category === "shopping").length,
    },
    {
      id: "moving",
      name: "Moving",
      count: tasks.filter((t) => t.category === "moving").length,
    },
    {
      id: "cooking",
      name: "Cooking",
      count: tasks.filter((t) => t.category === "cooking").length,
    },
  ];

  const types = [
    { id: "all", name: "All Posts", count: tasks.length },
    {
      id: "request",
      name: "Requests",
      count: tasks.filter((t) => t.type === "request").length,
    },
    {
      id: "offer",
      name: "Offers",
      count: tasks.filter((t) => t.type === "offer").length,
    },
  ];

  const filteredTasks = tasks.filter((task) => {
    const matchesCategory =
      selectedCategory === "all" || task.category === selectedCategory;
    const matchesType = selectedType === "all" || task.type === selectedType;
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white text-gray-900">
      {/* Background Wave Pattern */}
      <div
        className="absolute inset-0 z-0"
        style={{ height: "100%", minHeight: "100vh" }}
      >
        <svg
          className="absolute top-0 left-0 w-full opacity-15"
          height="100%"
          viewBox="0 0 1000 1000"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          style={{ height: "100%", minHeight: "100vh" }}
        >
          <path
            d="M0,300 Q250,200 500,300 T1000,300 L1000,0 L0,0 Z"
            fill="currentColor"
            className="text-gray-300"
          />
          <path
            d="M0,500 Q250,400 500,500 T1000,500 L1000,300 Q750,400 500,300 T0,300 Z"
            fill="currentColor"
            className="text-gray-400"
          />
        </svg>
      </div>

      <Navbar />

      <main className="relative z-10 pt-20 px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-gray-800">
              Your Dashboard
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Browse tasks from your friends network - find help or offer your
              services
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search tasks in your network..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <Button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3">
                  <FaFilter className="mr-2" />
                  Filters
                </Button>
                <Link href="/create-post">
                  <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3">
                    <FaPlus className="mr-2" />
                    Post Task
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Type Filter */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Blue Header */}
                <div
                  className="p-6 pb-4"
                  style={{ backgroundColor: "rgb(9, 13, 33)" }}
                >
                  <h3 className="text-xl font-bold text-white">Type</h3>
                </div>
                {/* White Content */}
                <div className="p-6 pt-4 bg-white">
                  <div className="space-y-2">
                    {types.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                          selectedType === type.id
                            ? "text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                        style={
                          selectedType === type.id
                            ? { backgroundColor: "rgb(9, 13, 33)" }
                            : {}
                        }
                      >
                        <div className="flex justify-between items-center">
                          <span>{type.name}</span>
                          <span className="text-sm opacity-75">
                            ({type.count})
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Categories Filter */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Blue Header */}
                <div
                  className="p-6 pb-4"
                  style={{ backgroundColor: "rgb(9, 13, 33)" }}
                >
                  <h3 className="text-xl font-bold text-white">Categories</h3>
                </div>
                {/* White Content */}
                <div className="p-6 pt-4 bg-white">
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                          selectedCategory === category.id
                            ? "text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                        style={
                          selectedCategory === category.id
                            ? { backgroundColor: "rgb(9, 13, 33)" }
                            : {}
                        }
                      >
                        <div className="flex justify-between items-center">
                          <span>{category.name}</span>
                          <span className="text-sm opacity-75">
                            ({category.count})
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tasks Grid */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white rounded-2xl shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden"
                  >
                    {/* Type Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          task.type === "request"
                            ? "bg-blue-500 text-white"
                            : "bg-green-500 text-white"
                        }`}
                      >
                        {task.type === "request" ? "Request" : "Offer"}
                      </span>
                    </div>

                    {/* Blue Header Section */}
                    <div
                      className="p-6 pb-4"
                      style={{ backgroundColor: "rgb(9, 13, 33)" }}
                    >
                      <div className="flex justify-between items-start pr-20">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: "rgb(9, 13, 33)" }}
                          >
                            <span className="text-white font-bold text-sm">
                              {task.poster.avatar}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-white font-semibold">
                              {task.poster.name}
                            </h4>
                            <div className="flex items-center gap-1">
                              <FaUser className="text-yellow-400 text-xs" />
                              <span className="text-yellow-400 text-sm">
                                {task.poster.rating}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* White Content Section */}
                    <div className="p-6 pt-4 bg-white">
                      {/* Task Content */}
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">
                          {task.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {task.description}
                        </p>
                      </div>

                      {/* Task Details */}
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <FaMapMarkerAlt />
                          <span>{task.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaClock />
                          <span>{task.scheduledTime}</span>
                        </div>
                      </div>

                      {/* Price and Actions */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1 text-green-500">
                          <span className="text-lg">
                            {task.currency === "USD" ||
                            task.currency === "CAD" ||
                            task.currency === "AUD"
                              ? "$"
                              : task.currency === "EUR"
                                ? "€"
                                : task.currency === "GBP"
                                  ? "£"
                                  : "$"}
                          </span>
                          <span className="text-2xl font-bold">
                            {task.price}
                          </span>
                          <span className="text-sm font-medium text-gray-600">
                            {task.currency}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            className={`px-4 py-2 text-sm ${
                              task.type === "request"
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "bg-green-600 hover:bg-green-700"
                            } text-white`}
                          >
                            {task.type === "request"
                              ? "Help Out"
                              : "View Details"}
                          </Button>
                          <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                            <FaHeart />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-blue-400 transition-colors">
                            <FaComment />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* No Results */}
              {filteredTasks.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No tasks found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
