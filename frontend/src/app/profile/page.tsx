"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import {
  postsApi,
  Post,
  friendsApi,
  usersApi,
  User,
  FriendRequest,
  tasksApi,
  paymentsApi,
  ApiError,
} from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaClock,
  FaPlus,
  FaUserPlus,
  FaUserFriends,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

const CATEGORY_COLORS: Record<string, string> = {
  CLEANING: "bg-blue-50 text-blue-700",
  PET_CARE: "bg-orange-50 text-orange-700",
  ERRANDS: "bg-green-50 text-green-700",
  MOVING: "bg-purple-50 text-purple-700",
  TUTORING: "bg-indigo-50 text-indigo-700",
  TECH_HELP: "bg-teal-50 text-teal-700",
  OTHER: "bg-gray-100 text-gray-600",
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"my-posts" | "accepted" | "friends">("my-posts");
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [acceptedPosts, setAcceptedPosts] = useState<Post[]>([]);
  const [paymentStatusByTask, setPaymentStatusByTask] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<number[]>([]);
  const [friendUsers, setFriendUsers] = useState<User[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [stats, setStats] = useState({ postsCreated: 0, tasksAccepted: 0, friends: 0 });

  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => { clearTimeout(timeout); func(...args); };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const debouncedSearchUsers = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) { setSearchResults([]); return; }
      try {
        setSearchLoading(true);
        const results = await usersApi.searchUsers(query);
        setSearchResults(results.filter((u) => u.id !== user?.id));
      } catch (error: any) {
        setError(`Search failed: ${error.message}`);
      } finally {
        setSearchLoading(false);
      }
    }, 300),
    [user],
  );

  useEffect(() => {
    if (!isAuthenticated) { router.push("/login"); return; }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const loadMe = async () => {
      try {
        const me = await usersApi.getMe();
        setProfileUser(me);
      } catch { setProfileUser(user || null); }
    };
    if (isAuthenticated) loadMe();
  }, [isAuthenticated, user]);

  useEffect(() => {
    const preloadStats = async () => {
      if (!isAuthenticated) return;
      try {
        const [myPostsData, acceptedData, friendsData] = await Promise.all([
          postsApi.getUserPosts().catch(() => [] as Post[]),
          postsApi.getAcceptedPosts().catch(() => [] as Post[]),
          friendsApi.getFriends().catch(() => [] as number[]),
        ]);
        setStats({ postsCreated: myPostsData.length, tasksAccepted: acceptedData.length, friends: friendsData.length });
        setMyPosts((prev) => (prev.length ? prev : myPostsData));
        setAcceptedPosts((prev) => (prev.length ? prev : acceptedData));
        setFriends((prev) => (prev.length ? prev : friendsData));
      } catch {}
    };
    preloadStats();
  }, [isAuthenticated]);

  const checkedTaskIdsRef = useRef<Set<number>>(new Set());
  useEffect(() => {
    const completedTaskIds = myPosts
      .filter((p) => p.status === "COMPLETED")
      .map((p) => Number((p as any).taskAssignmentId || 0))
      .filter((id) => id > 0 && !checkedTaskIdsRef.current.has(id));
    if (completedTaskIds.length === 0) return;
    for (const id of completedTaskIds) checkedTaskIdsRef.current.add(id);
    let cancelled = false;
    (async () => {
      const entries: Array<[number, string]> = [];
      await Promise.all(
        completedTaskIds.map(async (taskId) => {
          try {
            const payment = await paymentsApi.getPaymentByTask(taskId);
            entries.push([taskId, payment?.status || "NONE"]);
          } catch (err: any) {
            const e = err as ApiError;
            if (e.code === "PAYMENT_NOT_FOUND" || e.status === 404) {
              entries.push([taskId, "NONE"]);
            } else {
              checkedTaskIdsRef.current.delete(taskId);
            }
          }
        }),
      );
      if (cancelled || entries.length === 0) return;
      setPaymentStatusByTask((prev) => {
        const next = { ...prev };
        for (const [taskId, status] of entries) next[taskId] = status;
        return next;
      });
    })();
    return () => { cancelled = true; };
  }, [myPosts]);

  const loadMyPosts = useCallback(async () => {
    try {
      setLoading(true);
      const posts = await postsApi.getUserPosts();
      setMyPosts(posts);
      setStats((prev) => ({ ...prev, postsCreated: posts.length }));
      setError("");
    } catch (error: any) { setError("Failed to load your posts."); }
    finally { setLoading(false); }
  }, []);

  const loadAcceptedPosts = useCallback(async () => {
    try {
      setLoading(true);
      const posts = await postsApi.getAcceptedPosts();
      setAcceptedPosts(posts);
      setStats((prev) => ({ ...prev, tasksAccepted: posts.length }));
      setError("");
    } catch (error: any) { setError("Failed to load accepted posts."); }
    finally { setLoading(false); }
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
      } catch {
        listError = true;
        friendIds = await friendsApi.getFriends();
        if (Array.isArray(friendIds) && friendIds.length > 0) {
          const userResults = await Promise.all(friendIds.map((id) => usersApi.getUser(id).catch(() => null)));
          friendsList = userResults.filter((u): u is User => !!u);
        } else { friendsList = []; }
      }
      setFriendUsers(friendsList);
      setFriends(friendIds);
      setStats((prev) => ({ ...prev, friends: friendIds.length }));
      const [incomingData, outgoingData] = await Promise.all([
        friendsApi.getIncomingRequests(),
        friendsApi.getOutgoingRequests(),
      ]);
      setIncomingRequests(incomingData);
      setOutgoingRequests(outgoingData);
      setError(listError ? "Some friend details may be missing." : "");
    } catch (error: any) { setError("Failed to load friends data."); }
    finally { setLoading(false); }
  }, []);

  const sendFriendRequest = async (userId: number) => {
    try { await friendsApi.sendFriendRequest(userId); loadFriends(); }
    catch (error: any) { setError(`Failed to send friend request: ${error.message}`); }
  };

  const acceptFriendRequest = async (requestId: number) => {
    try { await friendsApi.acceptFriendRequest(requestId); loadFriends(); }
    catch {}
  };

  const declineFriendRequest = async (requestId: number) => {
    try { await friendsApi.declineFriendRequest(requestId); loadFriends(); }
    catch {}
  };

  const removeFriend = async (friendId: number) => {
    try { await friendsApi.removeFriend(friendId); await loadFriends(); }
    catch (error: any) { setError(error.message || "Failed to remove friend"); }
  };

  const viewPostDetails = (postId: number) => router.push(`/posts/${postId}`);
  const editPostQuick = (post: Post) => router.push(`/create-post?editId=${post.id}`);

  const updateTaskStatus = async (post: Post, status: "in-progress" | "complete") => {
    const candidates = [(post as any).taskAssignmentId, (post as any).taskId, post.id].filter((id) => !!id && !Number.isNaN(Number(id)));
    if (candidates.length === 0) { setError("Task ID is missing for this accepted post."); return; }
    let lastError: any = null;
    for (const candidate of candidates) {
      try {
        if (status === "in-progress") { await tasksApi.markInProgress(Number(candidate)); }
        else { await tasksApi.markComplete(Number(candidate)); }
        await loadAcceptedPosts();
        setError(""); return;
      } catch (error: any) { lastError = error; }
    }
    setError(lastError?.message || "Failed to update task status");
  };

  const createPayment = async (post: Post) => {
    const taskAssignmentId = Number((post as any).taskAssignmentId || 0);
    const payeeId = Number((post as any).accepterId || 0);
    if (!payeeId || !taskAssignmentId) { setError("Payment details are not ready on this post yet. Refresh and try again."); return; }
    try {
      const existing = await paymentsApi.getPaymentByTask(taskAssignmentId);
      if (existing?.status === "SUCCEEDED") {
        setPaymentStatusByTask((prev) => ({ ...prev, [taskAssignmentId]: "SUCCEEDED" }));
        setError("This task has already been paid. Leave a review instead."); return;
      }
    } catch (err: any) {
      const e = err as ApiError;
      if (e.code !== "PAYMENT_NOT_FOUND" && e.status !== 404) {}
    }
    const query = new URLSearchParams({ postId: String(post.id), payeeId: String(payeeId), amount: String(post.price || ""), taskAssignmentId: String(taskAssignmentId) }).toString();
    router.push(`/payments?${query}`);
  };

  const createReview = async (post: Post) => {
    const taskAssignmentId = Number((post as any).taskAssignmentId || 0);
    if (!taskAssignmentId) { setError("Review details are not ready on this post yet. Refresh and try again."); return; }
    const query = new URLSearchParams({ taskAssignmentId: String(taskAssignmentId), postId: String(post.id) }).toString();
    router.push(`/reviews?${query}`);
  };

  const openMessagesForPost = (post: Post) => {
    const targetUserId = Number((post as any).accepterId || 0);
    const query = new URLSearchParams({ postId: String(post.id) });
    if (targetUserId > 0) query.set("userId", String(targetUserId));
    router.push(`/messages?${query.toString()}`);
  };

  useEffect(() => {
    if (activeTab === "my-posts") loadMyPosts();
    else if (activeTab === "accepted") loadAcceptedPosts();
    else if (activeTab === "friends") loadFriends();
  }, [activeTab, loadMyPosts, loadAcceptedPosts, loadFriends]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && activeTab === "my-posts") loadMyPosts();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [activeTab, loadMyPosts]);

  if (!isAuthenticated) return null;

  const currentPosts = activeTab === "my-posts" ? myPosts : acceptedPosts;
  const canMarkInProgress = (post: Post) => ["ACCEPTED", "OPEN"].includes(post.status);
  const canMarkComplete = (post: Post) => ["ACCEPTED", "IN_PROGRESS"].includes(post.status);
  const canPay = (post: Post) => {
    const taskId = Number((post as any).taskAssignmentId || 0);
    if (post.status !== "COMPLETED") return false;
    if (!post.price) return false;
    if (!taskId) return false;
    if (Number((post as any).accepterId || 0) <= 0) return false;
    if (paymentStatusByTask[taskId] === "SUCCEEDED") return false;
    return true;
  };
  const canReview = (post: Post) => post.status === "COMPLETED" && Number((post as any).taskAssignmentId || 0) > 0;

  const getNextStepLabel = (post: Post) => {
    if (activeTab === "accepted") {
      if (canMarkInProgress(post)) return "Mark as in progress when you start.";
      if (canMarkComplete(post)) return "Mark complete when you finish.";
      return "This accepted task is complete.";
    }
    if (post.status === "OPEN") return "Waiting for someone to accept.";
    if (["ACCEPTED", "IN_PROGRESS"].includes(post.status)) return "Task in progress — pay and review when done.";
    if (post.status === "COMPLETED") {
      const hasTaskId = Number((post as any).taskAssignmentId || 0) > 0;
      const hasAccepter = Number((post as any).accepterId || 0) > 0;
      if (!hasTaskId || !hasAccepter) return "Waiting for final task details. Refresh once.";
      return canPay(post) ? "Pay your helper, then leave a review." : "Leave a review for your helper.";
    }
    return "Review details to continue.";
  };

  const displayName = profileUser?.displayName || user?.displayName || "User";
  const username = profileUser?.username || user?.username || "username";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      {/* Profile hero banner */}
      <div className="bg-[#090D21] pt-20 pb-8 px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-20 w-64 h-64 bg-indigo-600 rounded-full opacity-10 blur-3xl" />
          <div className="absolute bottom-0 left-10 w-64 h-64 bg-purple-600 rounded-full opacity-10 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Avatar + name */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-xl">
              <span className="text-white font-bold text-3xl">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-extrabold text-white">{displayName}</h1>
              <p className="text-gray-400 text-sm mt-0.5">@{username}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Posts Created", value: stats.postsCreated, color: "text-white" },
              { label: "Tasks Accepted", value: stats.tasksAccepted, color: "text-emerald-400" },
              { label: "Friends", value: stats.friends, color: "text-purple-400" },
              { label: "Pending", value: incomingRequests.length, color: "text-orange-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="px-8 pb-12 relative z-10">
        <div className="max-w-7xl mx-auto">

          {/* Get Paid strip */}
          <div className="mt-6 mb-5">
            <Link
              href="/payouts"
              className="flex items-center justify-between gap-3 bg-white border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all rounded-2xl px-5 py-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                  $
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Set Up Payouts</p>
                  <p className="text-xs text-gray-400">Connect Stripe to receive payments for completed tasks</p>
                </div>
              </div>
              <span className="text-indigo-600 text-sm font-semibold flex-shrink-0">Manage →</span>
            </Link>
          </div>

          {/* Tab nav */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 mb-5 flex gap-1">
            <button
              onClick={() => setActiveTab("my-posts")}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === "my-posts"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              My Posts
            </button>
            <button
              onClick={() => setActiveTab("accepted")}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === "accepted"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Accepted Tasks
            </button>
            <button
              onClick={() => setActiveTab("friends")}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 relative ${
                activeTab === "friends"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <FaUserFriends className="inline mr-1.5 text-xs" />
              Friends
              {incomingRequests.length > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
                  {incomingRequests.length}
                </span>
              )}
            </button>
          </div>

          {/* Tab content header */}
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {activeTab === "my-posts" ? "My Posts" : activeTab === "accepted" ? "Accepted Tasks" : "Friends & Connections"}
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">
                {activeTab === "my-posts"
                  ? "Posts you've created"
                  : activeTab === "accepted"
                    ? "Tasks you've taken on"
                    : "Manage your connections"}
              </p>
            </div>
            <button
              onClick={activeTab === "my-posts" ? loadMyPosts : activeTab === "accepted" ? loadAcceptedPosts : loadFriends}
              className="text-sm text-indigo-600 font-medium hover:underline"
            >
              Refresh
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-5">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Friends tab */}
          {activeTab === "friends" ? (
            <div className="space-y-6">
              {/* Search */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Find Friends</h3>
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    placeholder="Search by username or display name..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); debouncedSearchUsers(e.target.value); }}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm text-gray-900 placeholder-gray-400"
                  />
                </div>
                {searchLoading && (
                  <div className="mt-3 flex items-center gap-2 text-gray-400 text-sm">
                    <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    Searching...
                  </div>
                )}
                {searchResults.length > 0 && (
                  <div className="mt-3 space-y-2 max-h-52 overflow-y-auto">
                    {searchResults.map((searchUser) => (
                      <div key={searchUser.id || Math.random()} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-bold">
                              {searchUser.displayName?.charAt(0)?.toUpperCase() || "?"}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{searchUser.displayName || "Unknown User"}</div>
                            <div className="text-xs text-gray-400">@{searchUser.username || "unknown"}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => { if (searchUser?.id) sendFriendRequest(searchUser.id); }}
                          disabled={friends.includes(searchUser?.id) || outgoingRequests.some((req) => req.toUser?.id === searchUser?.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            friends.includes(searchUser?.id)
                              ? "bg-emerald-100 text-emerald-700 cursor-default"
                              : outgoingRequests.some((req) => req.toUser?.id === searchUser?.id)
                                ? "bg-gray-100 text-gray-500 cursor-default"
                                : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:scale-105"
                          }`}
                        >
                          {friends.includes(searchUser?.id) ? "Friends" :
                           outgoingRequests.some((req) => req.toUser?.id === searchUser?.id) ? "Sent" :
                           <><FaUserPlus className="inline mr-1 text-xs" />Add</>}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Incoming requests */}
              {incomingRequests.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Incoming Requests
                    <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">{incomingRequests.length}</span>
                  </h3>
                  <div className="space-y-3">
                    {incomingRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold">
                              {request.fromUser?.displayName?.charAt(0)?.toUpperCase() || "?"}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{request.fromUser?.displayName || "Unknown User"}</div>
                            <div className="text-xs text-gray-500">@{request.fromUser?.username || "unknown"}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{new Date(request.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => acceptFriendRequest(request.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-all"
                          >
                            <FaCheck className="text-xs" /> Accept
                          </button>
                          <button
                            onClick={() => declineFriendRequest(request.id)}
                            className="flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition-all"
                          >
                            <FaTimes className="text-xs" /> Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Friends list */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Your Friends
                  <span className="ml-2 bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">{friendUsers.length}</span>
                </h3>
                {friendUsers.length === 0 ? (
                  <div className="text-center py-10">
                    <FaUserFriends className="text-4xl mx-auto mb-3 text-gray-200" />
                    <p className="text-gray-400 text-sm">No friends yet. Search for people to add!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {friendUsers.map((friend) => (
                      <div key={friend.id} className="flex items-center justify-between gap-4 p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold">{friend.displayName?.charAt(0).toUpperCase() || "?"}</span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{friend.displayName || "Unknown User"}</div>
                            <div className="text-xs text-gray-400">@{friend.username || "unknown"}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFriend(friend.id)}
                          className="text-xs text-red-400 hover:text-red-600 border border-red-100 hover:border-red-200 px-3 py-1.5 rounded-lg transition-all"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Outgoing requests */}
              {outgoingRequests.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Sent Requests
                    <span className="ml-2 bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">{outgoingRequests.length}</span>
                  </h3>
                  <div className="space-y-2">
                    {outgoingRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-300 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-bold">{request.toUser?.displayName?.charAt(0)?.toUpperCase() || "?"}</span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-800 text-sm">{request.toUser?.displayName || "Unknown User"}</div>
                            <div className="text-xs text-gray-400">@{request.toUser?.username || "unknown"}</div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">Pending</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          ) : loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="flex items-center gap-3 text-gray-400">
                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            </div>

          ) : currentPosts.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
              <div className="text-5xl mb-4">{activeTab === "my-posts" ? "📝" : "🤝"}</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">
                {activeTab === "my-posts" ? "No posts yet" : "No accepted tasks yet"}
              </h3>
              <p className="text-gray-400 text-sm mb-5">
                {activeTab === "my-posts"
                  ? "Create your first post to get started!"
                  : "Accept some tasks from the marketplace to help others!"}
              </p>
              {activeTab === "my-posts" && (
                <Link href="/create-post">
                  <button className="flex items-center gap-2 mx-auto bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:scale-105 transition-all shadow-md">
                    <FaPlus className="text-xs" />
                    Create Your First Post
                  </button>
                </Link>
              )}
            </div>

          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {currentPosts.map((post) => {
                const isRequest = post.type === "REQUEST";
                return (
                  <div
                    key={post.id}
                    className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col border-l-4 ${
                      isRequest ? "border-l-indigo-500" : "border-l-emerald-500"
                    }`}
                  >
                    {/* Header: type + status */}
                    <div className="p-5 pb-3">
                      <div className="flex justify-between items-center mb-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isRequest ? "bg-indigo-50 text-indigo-700" : "bg-emerald-50 text-emerald-700"
                        }`}>
                          {isRequest ? "Request" : "Offer"}
                        </span>
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

                      <h3 className="text-base font-bold text-gray-900 mb-1.5 leading-snug">{post.title}</h3>
                      {post.description && (
                        <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">{post.description}</p>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="px-5 py-2 flex flex-wrap gap-3 text-xs text-gray-400">
                      {post.locationName && (
                        <span className="flex items-center gap-1"><FaMapMarkerAlt />{post.locationName}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <FaClock />{new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Category + price row */}
                    <div className="px-5 py-2 flex items-center justify-between">
                      <div className="flex gap-2 flex-wrap">
                        {post.category && (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[post.category] || "bg-gray-100 text-gray-600"}`}>
                            {post.category.replace("_", " ")}
                          </span>
                        )}
                      </div>
                      {post.price && (
                        <span className="text-lg font-extrabold text-emerald-600">${post.price}</span>
                      )}
                    </div>

                    {/* Next step hint */}
                    <div className="px-5 py-2">
                      <p className="text-xs text-gray-400 italic">{getNextStepLabel(post)}</p>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto px-5 py-4 border-t border-gray-50 flex flex-wrap gap-2">
                      <button
                        onClick={() => viewPostDetails(post.id)}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all"
                      >
                        View
                      </button>

                      {activeTab === "my-posts" && (
                        <>
                          <button
                            onClick={() => editPostQuick(post)}
                            disabled={post.status !== "OPEN"}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => openMessagesForPost(post)}
                            className="px-3 py-1.5 border border-indigo-100 rounded-lg text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-all"
                          >
                            Messages
                          </button>
                          {canPay(post) && (
                            <button
                              onClick={() => createPayment(post)}
                              className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg text-xs font-semibold hover:scale-105 transition-all shadow-sm"
                            >
                              Pay
                            </button>
                          )}
                          {canReview(post) && (
                            <button
                              onClick={() => createReview(post)}
                              className="px-3 py-1.5 border border-purple-100 rounded-lg text-xs font-medium text-purple-600 hover:bg-purple-50 transition-all"
                            >
                              Review
                            </button>
                          )}
                        </>
                      )}

                      {activeTab === "accepted" && (
                        <>
                          {canMarkInProgress(post) && (
                            <button
                              onClick={() => updateTaskStatus(post, "in-progress")}
                              className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-xs font-semibold hover:scale-105 transition-all shadow-sm"
                            >
                              Start Task
                            </button>
                          )}
                          {canMarkComplete(post) && (
                            <button
                              onClick={() => updateTaskStatus(post, "complete")}
                              className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg text-xs font-semibold hover:scale-105 transition-all shadow-sm"
                            >
                              Mark Complete
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
