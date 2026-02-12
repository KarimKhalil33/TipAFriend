"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
  location: string;
  timePosted: string;
  category: string;
  poster: {
    name: string;
    avatar: string;
    rating: number;
  };
  urgent: boolean;
}

export default function MarketplacePage() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "hire";
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for tasks
  const [tasks] = useState<Task[]>([
    {
      id: 1,
      title: "Need someone to clean my apartment",
      description:
        "Looking for someone to deep clean my 2-bedroom apartment. Must bring own supplies.",
      price: 80,
      location: "Downtown",
      timePosted: "2 hours ago",
      category: "cleaning",
      poster: {
        name: "Sarah M.",
        avatar: "SM",
        rating: 4.8,
      },
      urgent: true,
    },
    {
      id: 2,
      title: "Pet sitting for the weekend",
      description:
        "Need someone to watch my golden retriever while I'm out of town. Very friendly dog!",
      price: 120,
      location: "Midtown",
      timePosted: "4 hours ago",
      category: "pet-care",
      poster: {
        name: "Mike R.",
        avatar: "MR",
        rating: 4.9,
      },
      urgent: false,
    },
    {
      id: 3,
      title: "Grocery shopping and delivery",
      description:
        "Need someone to do grocery shopping for elderly parent. List will be provided.",
      price: 35,
      location: "Uptown",
      timePosted: "1 day ago",
      category: "shopping",
      poster: {
        name: "Emma L.",
        avatar: "EL",
        rating: 4.7,
      },
      urgent: false,
    },
    {
      id: 4,
      title: "Help with moving furniture",
      description:
        "Moving to new apartment, need help with heavy furniture. Truck provided.",
      price: 100,
      location: "West End",
      timePosted: "3 hours ago",
      category: "moving",
      poster: {
        name: "James T.",
        avatar: "JT",
        rating: 4.6,
      },
      urgent: true,
    },
    {
      id: 5,
      title: "Cooking meal prep for the week",
      description:
        "Looking for someone to prepare 5 healthy meals. Ingredients will be provided.",
      price: 90,
      location: "East Side",
      timePosted: "6 hours ago",
      category: "cooking",
      poster: {
        name: "Lisa K.",
        avatar: "LK",
        rating: 4.8,
      },
      urgent: false,
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

  const filteredTasks = tasks.filter((task) => {
    const matchesCategory =
      selectedCategory === "all" || task.category === selectedCategory;
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
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
              {type === "hire" ? "Find Help" : "Offer Help"}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {type === "hire"
                ? "Browse available helpers and get tasks done by trusted friends"
                : "Help your friends with tasks and earn money in your spare time"}
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div
            className="bg-white rounded-2xl shadow-xl p-6 mb-8"
            style={{ backgroundColor: "rgb(9, 13, 33)" }}
          >
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3">
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
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <div
                className="bg-white rounded-2xl shadow-xl p-6"
                style={{ backgroundColor: "rgb(9, 13, 33)" }}
              >
                <h3 className="text-xl font-bold text-white mb-4">
                  Categories
                </h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                        selectedCategory === category.id
                          ? "bg-blue-600 text-white"
                          : "text-gray-300 hover:bg-gray-800"
                      }`}
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

            {/* Tasks Grid */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white rounded-2xl shadow-xl p-6 hover:scale-105 transition-all duration-300"
                    style={{ backgroundColor: "rgb(9, 13, 33)" }}
                  >
                    {/* Task Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
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
                      {task.urgent && (
                        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          Urgent
                        </span>
                      )}
                    </div>

                    {/* Task Content */}
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-white mb-2">
                        {task.title}
                      </h3>
                      <p className="text-gray-300 text-sm line-clamp-2">
                        {task.description}
                      </p>
                    </div>

                    {/* Task Details */}
                    <div className="flex flex-wrap gap-3 text-sm text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <FaMapMarkerAlt />
                        <span>{task.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaClock />
                        <span>{task.timePosted}</span>
                      </div>
                    </div>

                    {/* Price and Actions */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 text-green-400">
                        <FaDollarSign />
                        <span className="text-2xl font-bold">{task.price}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm">
                          {type === "hire" ? "View Details" : "Apply"}
                        </Button>
                        <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                          <FaHeart />
                        </button>
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
                    Try adjusting your search or category filters
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
