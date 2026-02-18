"use client";

import { useState, useEffect, useCallback } from "react";
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

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"my-posts" | "accepted">(
    "my-posts",
  );
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [acceptedPosts, setAcceptedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
  }, [isAuthenticated, router]);

  const loadMyPosts = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Implement getUserPosts API call
      // const response = await postsApi.getUserPosts(user.id);
      // setMyPosts(response);
      setMyPosts([]); // Placeholder until API is implemented
      setError("");
    } catch (error: any) {
      console.error("Error loading my posts:", error);
      setError("Failed to load your posts.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadAcceptedPosts = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Implement getAcceptedPosts API call
      // const response = await postsApi.getAcceptedPosts(user.id);
      // setAcceptedPosts(response);
      setAcceptedPosts([]); // Placeholder until API is implemented
      setError("");
    } catch (error: any) {
      console.error("Error loading accepted posts:", error);
      setError("Failed to load accepted posts.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "my-posts") {
      loadMyPosts();
    } else {
      loadAcceptedPosts();
    }
  }, [activeTab, loadMyPosts, loadAcceptedPosts]);

  if (!isAuthenticated) {
    return null;
  }

  const currentPosts = activeTab === "my-posts" ? myPosts : acceptedPosts;

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
          {/* Profile Header */}
          <div className="text-center mb-12">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
              <span className="text-white font-bold text-2xl">
                {user?.displayName?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-2 text-gray-800">
              {user?.displayName || "User"}
            </h1>
            <p className="text-xl text-gray-600">
              @{user?.username || "username"}
            </p>
            <p className="text-lg text-gray-500 mt-2">
              Your Profile & Activity
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-2xl shadow-xl p-2 mb-8 max-w-md mx-auto">
            <div className="flex">
              <button
                onClick={() => setActiveTab("my-posts")}
                className={`flex-1 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === "my-posts"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                My Posts
              </button>
              <button
                onClick={() => setActiveTab("accepted")}
                className={`flex-1 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === "accepted"
                    ? "bg-green-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Accepted Tasks
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {myPosts.length}
              </div>
              <div className="text-gray-600">Posts Created</div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {acceptedPosts.length}
              </div>
              <div className="text-gray-600">Tasks Accepted</div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {user?.email ? "✓" : "✗"}
              </div>
              <div className="text-gray-600">Profile Complete</div>
            </div>
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div
              className="p-6 pb-4"
              style={{ backgroundColor: "rgb(9, 13, 33)" }}
            >
              <h2 className="text-2xl font-bold text-white">
                {activeTab === "my-posts" ? "My Posts" : "Accepted Tasks"}
              </h2>
              <p className="text-gray-300 mt-1">
                {activeTab === "my-posts"
                  ? "Posts you've created"
                  : "Tasks you've accepted to help with"}
              </p>
            </div>

            {/* Content */}
            <div className="p-6 bg-white">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="text-lg text-gray-600">Loading...</div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-600">{error}</p>
                  <Button
                    onClick={
                      activeTab === "my-posts" ? loadMyPosts : loadAcceptedPosts
                    }
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </div>
              ) : currentPosts.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-gray-400 text-6xl mb-4">
                    {activeTab === "my-posts" ? "📝" : "🤝"}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    {activeTab === "my-posts"
                      ? "No posts yet"
                      : "No accepted tasks yet"}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {activeTab === "my-posts"
                      ? "Create your first post to get started!"
                      : "Accept some tasks from the marketplace to help others!"}
                  </p>
                  {activeTab === "my-posts" && (
                    <Link href="/create-post">
                      <Button className="bg-green-600 hover:bg-green-700 text-white">
                        <FaPlus className="mr-2" />
                        Create Your First Post
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentPosts.map((post) => (
                    <div
                      key={post.id}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                    >
                      {/* Post Header */}
                      <div className="flex justify-between items-start mb-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            post.type === "REQUEST"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {post.type === "REQUEST" ? "Request" : "Offer"}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            post.status === "OPEN"
                              ? "bg-green-100 text-green-800"
                              : post.status === "ACCEPTED"
                                ? "bg-blue-100 text-blue-800"
                                : post.status === "IN_PROGRESS"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : post.status === "COMPLETED"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {post.status.replace("_", " ")}
                        </span>
                      </div>

                      {/* Post Content */}
                      <h3 className="text-lg font-bold text-gray-800 mb-2">
                        {post.title}
                      </h3>
                      {post.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {post.description}
                        </p>
                      )}

                      {/* Post Details */}
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-4">
                        {post.locationName && (
                          <div className="flex items-center gap-1">
                            <FaMapMarkerAlt />
                            <span>{post.locationName}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <FaClock />
                          <span>
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Category and Price */}
                      <div className="flex justify-between items-center">
                        {post.category && (
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            {post.category.replace("_", " ")}
                          </span>
                        )}
                        {post.price && (
                          <div className="flex items-center gap-1 text-green-600">
                            <FaDollarSign />
                            <span className="font-bold">{post.price}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // TODO: Navigate to post details or edit
                              console.log("View post:", post.id);
                            }}
                          >
                            View Details
                          </Button>
                          {activeTab === "my-posts" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // TODO: Navigate to edit post
                                console.log("Edit post:", post.id);
                              }}
                            >
                              Edit
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
