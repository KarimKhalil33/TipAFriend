"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import {
  postsApi,
  Post,
  friendsApi,
  usersApi,
  User,
  FriendRequest,
} from "@/lib/api";
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
  FaUserPlus,
  FaUserFriends,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

interface FeedResponse {
  content: Post[];
  totalElements: number;
  totalPages: number;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<
    "my-posts" | "accepted" | "friends"
  >("my-posts");
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [acceptedPosts, setAcceptedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Friends state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<number[]>([]);
  const [friendUsers, setFriendUsers] = useState<User[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // Simple debounce function
  function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Debounce search function
  const debouncedSearchUsers = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        setSearchLoading(true);
        const results = await usersApi.searchUsers(query);
        console.log("Search results received:", results);
        console.log("First result structure:", results[0]);
        setSearchResults(results.filter((u) => u.id !== user?.id)); // Exclude self
      } catch (error: any) {
        console.error("Error searching users:", error);
        setError(`Search failed: ${error.message}`);
      } finally {
        setSearchLoading(false);
      }
    }, 300),
    [user],
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
  }, [isAuthenticated, router]);

  const loadMyPosts = useCallback(async () => {
    try {
      setLoading(true);
      const posts = await postsApi.getUserPosts();
      setMyPosts(posts);
      setError("");
    } catch (error: any) {
      console.error("Error loading my posts:", error);
      setError("Failed to load your posts.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAcceptedPosts = useCallback(async () => {
    try {
      setLoading(true);
      const posts = await postsApi.getAcceptedPosts();
      setAcceptedPosts(posts);
      setError("");
    } catch (error: any) {
      console.error("Error loading accepted posts:", error);
      setError("Failed to load accepted posts.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFriends = useCallback(async () => {
    try {
      setLoading(true);
      let friendsList: User[] = [];
      let friendIds: number[] = [];
      let listError = false;
      try {
        friendsList = await friendsApi.getFriendsList();
        friendIds = friendsList.map((u) => u.id);
      } catch (err) {
        // fallback to /api/friends (IDs) if /api/friends/list fails
        listError = true;
        friendIds = await friendsApi.getFriends();
        if (Array.isArray(friendIds) && friendIds.length > 0) {
          const userResults = await Promise.all(
            friendIds.map((id) => usersApi.getUser(id).catch(() => null)),
          );
          friendsList = userResults.filter((u): u is User => !!u);
        } else {
          friendsList = [];
        }
      }
      setFriendUsers(friendsList);
      setFriends(friendIds);
      const [incomingData, outgoingData] = await Promise.all([
        friendsApi.getIncomingRequests(),
        friendsApi.getOutgoingRequests(),
      ]);
      setIncomingRequests(incomingData);
      setOutgoingRequests(outgoingData);
      setError(listError ? "Some friend details may be missing." : "");
    } catch (error: any) {
      console.error("Error loading friends:", error);
      setError("Failed to load friends data.");
    } finally {
      setLoading(false);
    }
  }, []);

  const sendFriendRequest = async (userId: number) => {
    try {
      console.log(
        "Sending friend request to userId:",
        userId,
        "type:",
        typeof userId,
      );
      await friendsApi.sendFriendRequest(userId);
      loadFriends(); // Refresh data
    } catch (error: any) {
      console.error("Error sending friend request:", error);
      setError(`Failed to send friend request: ${error.message}`);
    }
  };

  const acceptFriendRequest = async (requestId: number) => {
    try {
      await friendsApi.acceptFriendRequest(requestId);
      loadFriends(); // Refresh data
    } catch (error: any) {
      console.error("Error accepting friend request:", error);
    }
  };

  const declineFriendRequest = async (requestId: number) => {
    try {
      await friendsApi.declineFriendRequest(requestId);
      loadFriends(); // Refresh data
    } catch (error: any) {
      console.error("Error declining friend request:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "my-posts") {
      loadMyPosts();
    } else if (activeTab === "accepted") {
      loadAcceptedPosts();
    } else if (activeTab === "friends") {
      loadFriends();
    }
  }, [activeTab, loadMyPosts, loadAcceptedPosts, loadFriends]);

  // Refresh posts when user comes back from create post page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && activeTab === "my-posts") {
        loadMyPosts();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [activeTab, loadMyPosts]);

  if (!isAuthenticated) {
    return null;
  }

  const currentPosts = activeTab === "my-posts" ? myPosts : acceptedPosts;
  console.log("friendUsers:", friendUsers);
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
          <div className="bg-white rounded-2xl shadow-xl p-2 mb-8 max-w-lg mx-auto">
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
              <button
                onClick={() => setActiveTab("friends")}
                className={`flex-1 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === "friends"
                    ? "bg-purple-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <FaUserFriends className="inline mr-1" />
                Friends
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                {friends.length}
              </div>
              <div className="text-gray-600">Friends</div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {incomingRequests.length}
              </div>
              <div className="text-gray-600">Pending Requests</div>
            </div>
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div
              className="p-6 pb-4"
              style={{ backgroundColor: "rgb(9, 13, 33)" }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {activeTab === "my-posts"
                      ? "My Posts"
                      : activeTab === "accepted"
                        ? "Accepted Tasks"
                        : "Friends & Connections"}
                  </h2>
                  <p className="text-gray-300 mt-1">
                    {activeTab === "my-posts"
                      ? "Posts you've created"
                      : activeTab === "accepted"
                        ? "Tasks you've accepted to help with"
                        : "Manage your friends and friend requests"}
                  </p>
                </div>
                <Button
                  onClick={
                    activeTab === "my-posts"
                      ? loadMyPosts
                      : activeTab === "accepted"
                        ? loadAcceptedPosts
                        : loadFriends
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  Refresh
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 bg-white">
              {activeTab === "friends" ? (
                <div className="space-y-6">
                  {/* Search Users */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Find Friends</h3>
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search for users by username or display name..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          debouncedSearchUsers(e.target.value);
                        }}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Search Results */}
                    {searchLoading && (
                      <div className="mt-3 text-gray-500">Searching...</div>
                    )}
                    {searchResults.length > 0 && (
                      <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                        {searchResults.map((searchUser) => (
                          <div
                            key={searchUser.id || Math.random()}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                                <span className="text-white text-sm font-bold">
                                  {searchUser.displayName
                                    ?.charAt(0)
                                    ?.toUpperCase() || "?"}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">
                                  {searchUser.displayName || "Unknown User"}
                                </div>
                                <div className="text-sm text-gray-500">
                                  @{searchUser.username || "unknown"}
                                </div>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => {
                                if (searchUser?.id) {
                                  sendFriendRequest(searchUser.id);
                                }
                              }}
                              disabled={
                                friends.includes(searchUser?.id) ||
                                outgoingRequests.some(
                                  (req) => req.toUser?.id === searchUser?.id,
                                )
                              }
                              className={
                                friends.includes(searchUser?.id)
                                  ? "bg-green-500 text-white cursor-default"
                                  : outgoingRequests.some(
                                        (req) =>
                                          req.toUser?.id === searchUser?.id,
                                      )
                                    ? "bg-gray-400 text-white cursor-default"
                                    : "bg-blue-600 hover:bg-blue-700 text-white"
                              }
                            >
                              {friends.includes(searchUser?.id) ? (
                                "Friends"
                              ) : outgoingRequests.some(
                                  (req) => req.toUser?.id === searchUser?.id,
                                ) ? (
                                "Sent"
                              ) : (
                                <>
                                  <FaUserPlus className="mr-1" /> Add Friend
                                </>
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Incoming Friend Requests */}
                  {incomingRequests.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        Incoming Friend Requests ({incomingRequests.length})
                      </h3>
                      <div className="space-y-3">
                        {incomingRequests.map((request) => (
                          <div
                            key={request.id}
                            className="flex items-center justify-between p-4 border rounded-lg bg-blue-50"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                                <span className="text-white font-bold">
                                  {request.fromUser?.displayName
                                    ?.charAt(0)
                                    ?.toUpperCase() || "?"}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">
                                  {request.fromUser?.displayName ||
                                    "Unknown User"}
                                </div>
                                <div className="text-sm text-gray-500">
                                  @{request.fromUser?.username || "unknown"}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {new Date(
                                    request.createdAt,
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => acceptFriendRequest(request.id)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <FaCheck className="mr-1" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => declineFriendRequest(request.id)}
                                className="text-red-600 border-red-600 hover:bg-red-50"
                              >
                                <FaTimes className="mr-1" />
                                Decline
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Friends List */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Your Friends ({friendUsers.length})
                    </h3>
                    {friendUsers.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FaUserFriends className="text-4xl mx-auto mb-2 opacity-50" />
                        <p>No friends yet. Search for people to add!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {friendUsers.map((friend) => (
                          <div
                            key={friend.id}
                            className="flex items-center gap-4 p-4 border rounded-lg bg-white shadow-sm"
                          >
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                {friend.displayName?.charAt(0).toUpperCase() ||
                                  "?"}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {friend.displayName || "Unknown User"}
                              </div>
                              <div className="text-sm text-gray-500">
                                @{friend.username || "unknown"}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Outgoing Friend Requests */}
                  {outgoingRequests.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        Sent Requests ({outgoingRequests.length})
                      </h3>
                      <div className="space-y-2">
                        {outgoingRequests.map((request) => (
                          <div
                            key={request.id}
                            className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
                                <span className="text-white text-sm font-bold">
                                  {request.toUser?.displayName
                                    ?.charAt(0)
                                    ?.toUpperCase() || "?"}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">
                                  {request.toUser?.displayName ||
                                    "Unknown User"}
                                </div>
                                <div className="text-sm text-gray-500">
                                  @{request.toUser?.username || "unknown"}
                                </div>
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">
                              Pending
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="text-lg text-gray-600">Loading...</div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-600">{error}</p>
                  <Button
                    onClick={
                      activeTab === "my-posts"
                        ? loadMyPosts
                        : activeTab === "accepted"
                          ? loadAcceptedPosts
                          : loadFriends
                    }
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </div>
              ) : activeTab !== "friends" && currentPosts.length === 0 ? (
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
