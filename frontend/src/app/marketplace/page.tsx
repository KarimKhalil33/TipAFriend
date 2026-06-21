"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { postsApi, usersApi, Post, User, tasksApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaClock,
  FaUser,
  FaPlus,
  FaHeart,
  FaComment,
} from "react-icons/fa";

interface FeedResponse {
  content: Post[];
  totalElements: number;
  totalPages: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  CLEANING: "bg-blue-50 text-blue-700",
  PET_CARE: "bg-orange-50 text-orange-700",
  ERRANDS: "bg-green-50 text-green-700",
  MOVING: "bg-purple-50 text-purple-700",
  TUTORING: "bg-indigo-50 text-indigo-700",
  TECH_HELP: "bg-teal-50 text-teal-700",
  OTHER: "bg-gray-100 text-gray-600",
};

export default function MarketplacePage() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "hire";
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState<"all" | "REQUEST" | "OFFER">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [includeMyPosts, setIncludeMyPosts] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [authorMap, setAuthorMap] = useState<Record<number, User>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingPostId, setActionLoadingPostId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
  }, [isAuthenticated, router]);

  const loadFeed = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { page, size: 10, sort: "createdAt,desc" };
      if (selectedType !== "all") params.type = selectedType;
      if (selectedCategory !== "all") params.category = selectedCategory;

      const response = await postsApi.getFeed(params);
      let nextPosts = response.content;

      if (includeMyPosts) {
        const myPosts = await postsApi.getUserPosts().catch(() => [] as Post[]);
        const merged = [...myPosts, ...response.content];
        nextPosts = Array.from(new Map(merged.map((p) => [p.id, p])).values());
      }

      setPosts(nextPosts);
      setTotalPages(response.totalPages);
      setError("");

      const missingAuthorIds = nextPosts
        .filter((post: Post) => !post.author?.displayName || !post.author?.username)
        .map((post: Post) => post.author?.id || (post as any).authorId)
        .filter((id: number | undefined): id is number => !!id);

      const uniqueMissingIds = Array.from(new Set(missingAuthorIds));
      if (uniqueMissingIds.length > 0) {
        const userResults = await Promise.all(
          uniqueMissingIds.map((id) => usersApi.getUser(id).catch(() => null)),
        );
        const newMap: Record<number, User> = {};
        userResults.forEach((u) => { if (u && u.id) newMap[u.id] = u; });
        setAuthorMap((prev) => ({ ...prev, ...newMap }));
      }
    } catch (error: any) {
      console.error("Error loading feed:", error);
      setError("Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [selectedType, selectedCategory, page, includeMyPosts]);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit",
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return "Just now";
  };

  if (!isAuthenticated) return null;

  const acceptPost = async (postId: number) => {
    try {
      setActionLoadingPostId(postId);
      await tasksApi.acceptPost(postId);
      router.push("/profile");
    } catch (error: any) {
      setError(error.message || "Failed to accept post");
    } finally {
      setActionLoadingPostId(null);
    }
  };

  const filteredPosts = posts
    .filter(
      (post) =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.description && post.description.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    .map((post) => {
      if (
        (!post.author?.displayName || !post.author?.username) &&
        (post.author?.id || (post as any).authorId) &&
        authorMap[post.author?.id || (post as any).authorId]
      ) {
        const authorId = post.author?.id || (post as any).authorId;
        return { ...post, author: authorMap[authorId] };
      }
      return post;
    });

  const categories = [
    { id: "all", name: "All Categories", count: posts.length },
    { id: "CLEANING", name: "Cleaning", count: posts.filter((p) => p.category === "CLEANING").length },
    { id: "PET_CARE", name: "Pet Care", count: posts.filter((p) => p.category === "PET_CARE").length },
    { id: "ERRANDS", name: "Errands", count: posts.filter((p) => p.category === "ERRANDS").length },
    { id: "MOVING", name: "Moving", count: posts.filter((p) => p.category === "MOVING").length },
    { id: "TUTORING", name: "Tutoring", count: posts.filter((p) => p.category === "TUTORING").length },
    { id: "TECH_HELP", name: "Tech Help", count: posts.filter((p) => p.category === "TECH_HELP").length },
    { id: "OTHER", name: "Other", count: posts.filter((p) => p.category === "OTHER").length },
  ];

  const types = [
    { id: "all", name: "All Posts", count: posts.length },
    { id: "REQUEST", name: "Requests", count: posts.filter((p) => p.type === "REQUEST").length },
    { id: "OFFER", name: "Offers", count: posts.filter((p) => p.type === "OFFER").length },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      {/* Compact dark header */}
      <div className="bg-[#090D21] pt-20 pb-16 px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-20 w-64 h-64 bg-indigo-600 rounded-full opacity-10 blur-3xl" />
          <div className="absolute bottom-0 left-20 w-64 h-64 bg-purple-600 rounded-full opacity-10 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-4xl font-extrabold text-white mb-2">Marketplace</h1>
          <p className="text-gray-300 text-sm">
            Browse tasks from your friends network — find help or offer your services
          </p>
        </div>
      </div>

      <main className="px-8 pb-12 -mt-6 relative z-10">
        <div className="max-w-7xl mx-auto">

          {/* Search + action bar */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Search tasks in your network..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 text-gray-800 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
                />
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                <button
                  onClick={() => setIncludeMyPosts((prev) => !prev)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    includeMyPosts
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {includeMyPosts ? "✓ My Posts Shown" : "Include My Posts"}
                </button>
                <Link href="/create-post">
                  <button className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all duration-200 hover:scale-105">
                    <FaPlus className="text-xs" />
                    Post Task
                  </button>
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar filters */}
            <div className="lg:col-span-1 space-y-4">
              {/* Type filter */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-700 text-xs uppercase tracking-wider">
                    Post Type
                  </h3>
                </div>
                <div className="p-3">
                  {types.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedType(t.id as "all" | "REQUEST" | "OFFER")}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-200 flex justify-between items-center ${
                        selectedType === t.id
                          ? "bg-indigo-50 text-indigo-700 font-semibold"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span>{t.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        selectedType === t.id
                          ? "bg-indigo-100 text-indigo-600"
                          : "bg-gray-100 text-gray-400"
                      }`}>
                        {t.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories filter */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-700 text-xs uppercase tracking-wider">
                    Category
                  </h3>
                </div>
                <div className="p-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-200 flex justify-between items-center ${
                        selectedCategory === cat.id
                          ? "bg-indigo-50 text-indigo-700 font-semibold"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        selectedCategory === cat.id
                          ? "bg-indigo-100 text-indigo-600"
                          : "bg-gray-100 text-gray-400"
                      }`}>
                        {cat.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Posts grid */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="flex justify-center items-center py-24">
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Loading posts...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                  <p className="text-red-600 text-sm mb-3">{error}</p>
                  <button
                    onClick={() => loadFeed()}
                    className="text-sm text-indigo-600 font-medium hover:underline"
                  >
                    Try Again
                  </button>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-1">No posts found</h3>
                  <p className="text-gray-400 text-sm">
                    Be the first to create a post or adjust your filters.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredPosts.map((post) => {
                    const authorId = post.author?.id || (post as any).authorId;
                    const isOwnPost = !!user?.id && authorId === user.id;
                    const isRequest = post.type === "REQUEST";

                    return (
                      <div
                        key={post.id}
                        className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 overflow-hidden flex flex-col border-l-4 ${
                          isRequest ? "border-l-indigo-500" : "border-l-emerald-500"
                        }`}
                      >
                        {/* Author row */}
                        <div className="p-5 pb-3">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-sm">
                                  {post.author?.displayName
                                    ? post.author.displayName.charAt(0).toUpperCase()
                                    : <FaUser className="text-xs" />}
                                </span>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 text-sm leading-tight">
                                  {post.author?.displayName || "Unknown User"}
                                </p>
                                <p className="text-gray-400 text-xs">
                                  @{post.author?.username || "unknown"}
                                </p>
                              </div>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              isRequest
                                ? "bg-indigo-50 text-indigo-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}>
                              {isRequest ? "Request" : "Offer"}
                            </span>
                          </div>

                          {/* Title + description */}
                          <h3 className="text-base font-bold text-gray-900 mb-1.5 leading-snug">
                            {post.title}
                          </h3>
                          {post.description && (
                            <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                              {post.description}
                            </p>
                          )}
                        </div>

                        {/* Meta */}
                        <div className="px-5 py-2 flex flex-wrap gap-3 text-xs text-gray-400">
                          {post.locationName && (
                            <span className="flex items-center gap-1">
                              <FaMapMarkerAlt />
                              {post.locationName}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <FaClock />
                            {getTimeAgo(post.createdAt)}
                          </span>
                          {post.scheduledTime && (
                            <span className="flex items-center gap-1 text-indigo-400">
                              <FaClock />
                              Scheduled: {formatDate(post.scheduledTime)}
                            </span>
                          )}
                        </div>

                        {/* Chips */}
                        <div className="px-5 py-2 flex gap-2 flex-wrap">
                          {post.category && (
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              CATEGORY_COLORS[post.category] || "bg-gray-100 text-gray-600"
                            }`}>
                              {post.category.replace("_", " ")}
                            </span>
                          )}
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            post.status === "OPEN" ? "bg-emerald-50 text-emerald-700" :
                            post.status === "ACCEPTED" ? "bg-blue-50 text-blue-700" :
                            post.status === "IN_PROGRESS" ? "bg-amber-50 text-amber-700" :
                            post.status === "COMPLETED" ? "bg-purple-50 text-purple-700" :
                            "bg-gray-100 text-gray-600"
                          }`}>
                            {post.status.replace("_", " ")}
                          </span>
                        </div>

                        {/* Footer: price + actions */}
                        <div className="mt-auto px-5 py-4 border-t border-gray-50 flex justify-between items-center">
                          {post.price ? (
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-extrabold text-emerald-600">
                                ${post.price}
                              </span>
                              <span className="text-xs text-gray-400">
                                {post.paymentType || "FIXED"}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 italic">Negotiable</span>
                          )}

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setError("Likes are not implemented yet.")}
                              className="p-2 text-gray-300 hover:text-red-400 transition-colors rounded-lg hover:bg-red-50"
                            >
                              <FaHeart className="text-sm" />
                            </button>
                            <button
                              onClick={() =>
                                isOwnPost
                                  ? router.push(`/messages?postId=${post.id}${(post as any).accepterId ? `&userId=${(post as any).accepterId}` : ""}`)
                                  : router.push(`/messages?userId=${post.author?.id || ""}&postId=${post.id}`)
                              }
                              className="p-2 text-gray-300 hover:text-indigo-400 transition-colors rounded-lg hover:bg-indigo-50"
                            >
                              <FaComment className="text-sm" />
                            </button>
                            <button
                              disabled={actionLoadingPostId === post.id}
                              onClick={() => {
                                if (isOwnPost) { router.push(`/posts/${post.id}`); return; }
                                if (isRequest) { acceptPost(post.id); return; }
                                router.push(`/messages?userId=${post.author?.id || ""}&postId=${post.id}`);
                              }}
                              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                                isOwnPost
                                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                  : isRequest
                                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm"
                                    : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm"
                              }`}
                            >
                              {actionLoadingPostId === post.id
                                ? "Working..."
                                : isOwnPost
                                  ? "View"
                                  : isRequest
                                    ? "Help Out"
                                    : "Message"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-3">
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-500">
                    Page {page + 1} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page === totalPages - 1}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
