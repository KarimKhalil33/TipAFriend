"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { postsApi, Post } from "@/lib/api";
import { useRouter } from "next/navigation";
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

interface FeedResponse {
  content: Post[];
  totalElements: number;
  totalPages: number;
}

export default function MarketplacePage() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "hire";
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState<"all" | "REQUEST" | "OFFER">(
    "all",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
  }, [isAuthenticated, router]);

  const loadFeed = useCallback(async () => {
  const loadFeed = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        size: 10,
        sort: "createdAt,desc",
      };

      if (selectedType !== "all") {
        params.type = selectedType;
      }

      if (selectedCategory !== "all") {
        params.category = selectedCategory;
      }

      const response = await postsApi.getFeed(params);
      setPosts(response.content);
      setTotalPages(response.totalPages);
      setError("");
    } catch (error: any) {
      console.error("Error loading feed:", error);
      setError("Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [selectedType, selectedCategory, page]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else {
      return "Just now";
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.description &&
        post.description.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const categories = [
    { id: "all", name: "All Categories", count: posts.length },
    {
      id: "CLEANING",
      name: "Cleaning",
      count: posts.filter((p) => p.category === "CLEANING").length,
    },
    {
      id: "PET_CARE",
      name: "Pet Care",
      count: posts.filter((p) => p.category === "PET_CARE").length,
    },
    {
      id: "ERRANDS",
      name: "Errands",
      count: posts.filter((p) => p.category === "ERRANDS").length,
    },
    {
      id: "MOVING",
      name: "Moving",
      count: posts.filter((p) => p.category === "MOVING").length,
    },
    {
      id: "TUTORING",
      name: "Tutoring",
      count: posts.filter((p) => p.category === "TUTORING").length,
    },
    {
      id: "TECH_HELP",
      name: "Tech Help",
      count: posts.filter((p) => p.category === "TECH_HELP").length,
    },
    {
      id: "OTHER",
      name: "Other",
      count: posts.filter((p) => p.category === "OTHER").length,
    },
  ];

  const types = [
    { id: "all", name: "All Posts", count: posts.length },
    {
      id: "REQUEST",
      name: "Requests",
      count: posts.filter((p) => p.type === "REQUEST").length,
    },
    {
      id: "OFFER",
      name: "Offers",
      count: posts.filter((p) => p.type === "OFFER").length,
    },
  ];

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
              Marketplace
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Browse tasks from your friends network - find help or offer your services
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
                <div
                  className="p-6 pb-4"
                  style={{ backgroundColor: "rgb(9, 13, 33)" }}
                >
                  <h3 className="text-xl font-bold text-white">Type</h3>
                </div>
                <div className="p-6 pt-4 bg-white">
                  <div className="space-y-2">
                    {types.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id as "all" | "REQUEST" | "OFFER")}
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
                <div
                  className="p-6 pb-4"
                  style={{ backgroundColor: "rgb(9, 13, 33)" }}
                >
                  <h3 className="text-xl font-bold text-white">Categories</h3>
                </div>
                <div className="p-6 pt-4 bg-white">
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id as string)}
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

            {/* Posts Grid */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="text-lg text-gray-600">Loading posts...</div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-600">{error}</p>
                  <Button onClick={() => loadFeed()} className="mt-2">
                    Try Again
                  </Button>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-gray-400 text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No posts found
                  </h3>
                  <p className="text-gray-500">
                    Be the first to create a post or adjust your filters.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredPosts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white rounded-2xl shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden"
                    >
                      {/* Type Badge */}
                      <div className="absolute top-4 right-4 z-10">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            post.type === "REQUEST"
                              ? "bg-blue-500 text-white"
                              : "bg-green-500 text-white"
                          }`}
                        >
                          {post.type === "REQUEST" ? "Request" : "Offer"}
                        </span>
                      </div>

                      {/* Blue Header Section */}
                      <div
                        className="p-6 pb-4"
                        style={{ backgroundColor: "rgb(9, 13, 33)" }}
                      >
                        <div className="flex justify-between items-start pr-20">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                              <span className="text-white font-bold text-sm">
                                {post.author.displayName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h4 className="text-white font-semibold">
                                {post.author.displayName}
                              </h4>
                              <div className="flex items-center gap-1">
                                <FaUser className="text-yellow-400 text-xs" />
                                <span className="text-yellow-400 text-sm">
                                  @{post.author.username}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* White Content Section */}
                      <div className="p-6 pt-4 bg-white">
                        <div className="mb-4">
                          <h3 className="text-lg font-bold text-gray-800 mb-2">
                            {post.title}
                          </h3>
                          {post.description && (
                            <p className="text-gray-600 text-sm line-clamp-2">
                              {post.description}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-4">
                          {post.locationName && (
                            <div className="flex items-center gap-1">
                              <FaMapMarkerAlt />
                              <span>{post.locationName}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <FaClock />
                            <span>{getTimeAgo(post.createdAt)}</span>
                          </div>
                          {post.scheduledTime && (
                            <div className="flex items-center gap-1 text-blue-600">
                              <FaClock />
                              <span>Scheduled: {formatDate(post.scheduledTime)}</span>
                            </div>
                          )}
                        </div>

                        {post.category && (
                          <div className="mb-4">
                            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                              {post.category.replace('_', ' ')}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          {post.price ? (
                            <div className="flex items-center gap-1 text-green-500">
                              <FaDollarSign />
                              <span className="text-2xl font-bold">
                                {post.price}
                              </span>
                              <span className="text-sm font-medium text-gray-600">
                                {post.paymentType || 'FIXED'}
                              </span>
                            </div>
                          ) : (
                            <div className="text-gray-500 text-sm">
                              Price negotiable
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button
                              className={`px-4 py-2 text-sm ${
                                post.type === "REQUEST"
                                  ? "bg-blue-600 hover:bg-blue-700"
                                  : "bg-green-600 hover:bg-green-700"
                              } text-white`}
                              onClick={() => {
                                console.log('Post clicked:', post.id);
                              }}
                            >
                              {post.type === "REQUEST" ? "Help Out" : "View Details"}
                            </Button>
                            <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                              <FaHeart />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-blue-400 transition-colors">
                              <FaComment />
                            </button>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            post.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                            post.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-800' :
                            post.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                            post.status === 'COMPLETED' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {post.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  <Button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4">
                    Page {page + 1} of {totalPages}
                  </span>
                  <Button
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page === totalPages - 1}
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
