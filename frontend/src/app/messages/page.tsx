"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Conversation, messagingApi, Message, User } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  FaPaperPlane,
  FaSearch,
  FaArrowLeft,
  FaTasks,
  FaUserCircle,
  FaSyncAlt,
  FaCommentDots,
  FaChevronDown,
} from "react-icons/fa";

const normalizeMessage = (raw: any): Message => ({
  id: Number(raw?.id || 0),
  body: String(raw?.body || ""),
  createdAt: raw?.createdAt || new Date().toISOString(),
  senderId: Number(raw?.senderId || raw?.sender?.id || 0),
  conversationId: Number(raw?.conversationId || raw?.conversation?.id || 0),
  sender: raw?.sender,
  conversation: raw?.conversation,
});

const normalizeConversation = (raw: any): Conversation => ({
  id: Number(raw?.id || 0),
  type: raw?.type || "DIRECT",
  taskAssignmentId: raw?.taskAssignmentId ?? raw?.taskAssignment?.id ?? null,
  taskAssignment: raw?.taskAssignment,
  participants: Array.isArray(raw?.participants) ? raw.participants : [],
  lastMessage: raw?.lastMessage ? normalizeMessage(raw.lastMessage) : undefined,
  unreadCount: Number(raw?.unreadCount || 0),
  updatedAt: raw?.updatedAt,
  createdAt: raw?.createdAt || new Date().toISOString(),
});

const initialsOf = (name?: string) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "?";
};

const colorForId = (id: number) => {
  const palette = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-amber-500",
    "bg-cyan-500",
    "bg-indigo-500",
    "bg-rose-500",
  ];
  return palette[Math.abs(id) % palette.length];
};

const formatRelative = (iso?: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString();
};

const formatDayLabel = (iso: string) => {
  const date = new Date(iso);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return "Today";
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
};

const taskLabelOf = (conv?: Conversation | null) => {
  if (!conv) return null;
  const ta = conv.taskAssignment;
  if (ta?.post?.title) return ta.post.title;
  if (conv.taskAssignmentId) return `Task #${conv.taskAssignmentId}`;
  return null;
};

interface PersonGroup {
  personId: number;
  person: User | null;
  personName: string;
  conversations: Conversation[];
  latestAt: number;
  totalUnread: number;
  lastMessageBody: string;
}

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const userIdParam = Number(searchParams.get("userId") || "0");
  const conversationIdParam = Number(searchParams.get("conversationId") || "0");
  const postIdParam = Number(searchParams.get("postId") || "0");
  const taskAssignmentIdParam = Number(
    searchParams.get("taskAssignmentId") || "0",
  );
  const { user } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  // messages keyed by conversationId
  const [messagesByConv, setMessagesByConv] = useState<
    Record<number, Message[]>
  >({});
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
  // which conversation a new message goes to. null = auto (most recent)
  const [composeTargetId, setComposeTargetId] = useState<number | null>(null);
  const [showTargetMenu, setShowTargetMenu] = useState(false);
  const [messageBody, setMessageBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [conversationNotice, setConversationNotice] = useState("");
  const [search, setSearch] = useState("");
  const [showSidebarOnMobile, setShowSidebarOnMobile] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const otherParticipantOf = useCallback(
    (conv: Conversation): User | null =>
      conv.participants?.find((p) => p.id !== user?.id) ||
      conv.participants?.[0] ||
      null,
    [user?.id],
  );

  // Build person groups: one entry per other participant
  const personGroups = useMemo<PersonGroup[]>(() => {
    const map = new Map<number, PersonGroup>();
    conversations.forEach((conv) => {
      const other = otherParticipantOf(conv);
      const personId = other?.id || -conv.id;
      const ts = new Date(
        conv.lastMessage?.createdAt || conv.updatedAt || conv.createdAt,
      ).getTime();
      const personName =
        other?.displayName || other?.username || `Conversation #${conv.id}`;

      const existing = map.get(personId);
      if (existing) {
        existing.conversations.push(conv);
        if (ts > existing.latestAt) {
          existing.latestAt = ts;
          existing.lastMessageBody = conv.lastMessage?.body || "";
        }
        existing.totalUnread += conv.unreadCount || 0;
      } else {
        map.set(personId, {
          personId,
          person: other,
          personName,
          conversations: [conv],
          latestAt: ts,
          totalUnread: conv.unreadCount || 0,
          lastMessageBody: conv.lastMessage?.body || "",
        });
      }
    });
    // sort each group's conversations by recency (newest first)
    map.forEach((g) => {
      g.conversations.sort((a, b) => {
        const aT = new Date(
          a.lastMessage?.createdAt || a.updatedAt || a.createdAt,
        ).getTime();
        const bT = new Date(
          b.lastMessage?.createdAt || b.updatedAt || b.createdAt,
        ).getTime();
        return bT - aT;
      });
    });
    return Array.from(map.values()).sort((a, b) => b.latestAt - a.latestAt);
  }, [conversations, otherParticipantOf]);

  const filteredPersonGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return personGroups;
    return personGroups.filter((g) => {
      if (g.personName.toLowerCase().includes(q)) return true;
      if (g.lastMessageBody.toLowerCase().includes(q)) return true;
      return g.conversations.some((c) =>
        (taskLabelOf(c) || "").toLowerCase().includes(q),
      );
    });
  }, [personGroups, search]);

  const selectedGroup = useMemo(
    () => personGroups.find((g) => g.personId === selectedPersonId) || null,
    [personGroups, selectedPersonId],
  );

  // All messages for the selected person, merged across conversations
  const mergedMessages = useMemo(() => {
    if (!selectedGroup) return [] as Message[];
    const all: Message[] = [];
    selectedGroup.conversations.forEach((conv) => {
      const list = messagesByConv[conv.id] || [];
      list.forEach((m) =>
        all.push({ ...m, conversationId: m.conversationId || conv.id }),
      );
    });
    return all.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [selectedGroup, messagesByConv]);

  const senderLabelFor = (msg: Message) => {
    const senderId = Number(msg.senderId || msg.sender?.id || 0);
    if (!senderId) return "System";
    if (senderId === user?.id)
      return user?.displayName || user?.username || "You";
    if (selectedGroup?.person?.id === senderId) {
      return (
        selectedGroup.person.displayName ||
        selectedGroup.person.username ||
        `User #${senderId}`
      );
    }
    return `User #${senderId}`;
  };

  const conversationOf = useCallback(
    (convId: number) =>
      selectedGroup?.conversations.find((c) => c.id === convId) || null,
    [selectedGroup],
  );

  const loadMessagesFor = useCallback(async (convId: number) => {
    const raw = (await messagingApi.getMessages(convId)) as any;
    const list = Array.isArray(raw) ? raw : raw?.content || [];
    const items: Message[] = list.map((item: any) => normalizeMessage(item));
    setMessagesByConv((prev) => ({
      ...prev,
      [convId]: items.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
    }));
  }, []);

  const loadAllMessagesForPerson = useCallback(
    async (group: PersonGroup) => {
      await Promise.all(
        group.conversations.map((c) => loadMessagesFor(c.id).catch(() => null)),
      );
    },
    [loadMessagesFor],
  );

  const loadConversations = useCallback(async () => {
    const raw = (await messagingApi.getConversations()) as any;
    const list = Array.isArray(raw) ? raw : raw?.content || [];
    const items: Conversation[] = list.map((item: any) =>
      normalizeConversation(item),
    );
    const sorted = [...items].sort((a, b) => {
      const aTime = new Date(
        a.lastMessage?.createdAt || a.updatedAt || a.createdAt,
      ).getTime();
      const bTime = new Date(
        b.lastMessage?.createdAt || b.updatedAt || b.createdAt,
      ).getTime();
      return bTime - aTime;
    });
    setConversations(sorted);
    return sorted;
  }, []);

  // Initial / param-driven loading
  useEffect(() => {
    const init = async () => {
      setError("");
      setConversationNotice("");
      try {
        setLoading(true);
        const convs = await loadConversations();

        // Resolve which person to select
        let targetPersonId: number | null = null;
        let targetConv: Conversation | undefined;

        if (conversationIdParam) {
          targetConv = convs.find((c) => c.id === conversationIdParam);
        }

        if (!targetConv && userIdParam && user?.id && user.id !== userIdParam) {
          // try to find existing conversation with this user
          targetConv = convs.find((c) =>
            c.participants?.some((p) => p.id === userIdParam),
          );

          if (!targetConv) {
            // create one
            try {
              const created: any = await messagingApi.getOrCreateConversation(
                taskAssignmentIdParam > 0
                  ? {
                      type: "TASK_THREAD",
                      taskAssignmentId: taskAssignmentIdParam,
                      participantIds: Array.from(
                        new Set([user.id, userIdParam]),
                      ),
                    }
                  : {
                      type: "DIRECT",
                      participantIds: [userIdParam],
                    },
              );
              if (created) {
                const norm = normalizeConversation(created);
                setConversations((prev) => {
                  if (prev.some((p) => p.id === norm.id)) return prev;
                  return [norm, ...prev];
                });
                targetConv = norm;
              }
            } catch (err: any) {
              setError(err?.message || "Failed to create conversation");
            }
          }
        }

        if (targetConv) {
          const other =
            targetConv.participants?.find((p) => p.id !== user?.id) ||
            targetConv.participants?.[0];
          targetPersonId = other?.id || -targetConv.id;
        } else if (convs.length > 0) {
          const first = convs[0];
          const other =
            first.participants?.find((p) => p.id !== user?.id) ||
            first.participants?.[0];
          targetPersonId = other?.id || -first.id;
        }

        if (targetPersonId !== null) {
          setSelectedPersonId(targetPersonId);
          setShowSidebarOnMobile(false);
          if (targetConv) {
            setComposeTargetId(targetConv.id);
          }
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationIdParam, userIdParam, taskAssignmentIdParam, user?.id]);

  // When the selected person changes, load all their messages
  useEffect(() => {
    if (!selectedGroup) return;
    loadAllMessagesForPerson(selectedGroup).catch(() => {});
  }, [selectedGroup, loadAllMessagesForPerson]);

  // Default compose target = most recent conversation in the group
  useEffect(() => {
    if (!selectedGroup) {
      setComposeTargetId(null);
      return;
    }
    setComposeTargetId((prev) => {
      // keep if still valid for this person
      if (prev && selectedGroup.conversations.some((c) => c.id === prev)) {
        return prev;
      }
      return selectedGroup.conversations[0]?.id || null;
    });
  }, [selectedGroup]);

  // Polling
  useEffect(() => {
    if (!selectedGroup) return;
    const interval = setInterval(() => {
      loadConversations().catch(() => {});
      loadAllMessagesForPerson(selectedGroup).catch(() => {});
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedGroup, loadConversations, loadAllMessagesForPerson]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mergedMessages.length, selectedPersonId]);

  const sendMessage = async () => {
    if (!composeTargetId || !messageBody.trim()) return;
    try {
      setSending(true);
      await messagingApi.sendMessage({
        conversationId: composeTargetId,
        body: messageBody.trim(),
      });
      setMessageBody("");
      await loadMessagesFor(composeTargetId);
      await loadConversations();
    } catch (err: any) {
      setError(err?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const composeTargetConv = composeTargetId
    ? conversationOf(composeTargetId)
    : null;
  const composeTargetLabel = composeTargetConv
    ? composeTargetConv.type === "DIRECT"
      ? "Direct message"
      : taskLabelOf(composeTargetConv) || "Task thread"
    : "—";

  // Group merged messages: by day, then by conversation context within day
  const groupedTimeline = useMemo(() => {
    type Item =
      | { kind: "day"; key: string; label: string }
      | {
          kind: "context";
          key: string;
          conversationId: number;
          label: string;
          isTask: boolean;
        }
      | {
          kind: "msg";
          key: string;
          msg: Message;
          showSender: boolean;
        };
    const items: Item[] = [];
    let currentDay = "";
    let currentConvId: number | null = null;
    let prevSenderId: number | null = null;

    mergedMessages.forEach((msg) => {
      const day = formatDayLabel(msg.createdAt);
      if (day !== currentDay) {
        items.push({ kind: "day", key: `day-${day}-${msg.id}`, label: day });
        currentDay = day;
        currentConvId = null;
        prevSenderId = null;
      }
      if (msg.conversationId && msg.conversationId !== currentConvId) {
        const conv = conversationOf(msg.conversationId);
        const isTask = (conv?.type || "") !== "DIRECT";
        const label = conv
          ? conv.type === "DIRECT"
            ? "Direct message"
            : taskLabelOf(conv) || `Task #${conv.taskAssignmentId}`
          : "Conversation";
        items.push({
          kind: "context",
          key: `ctx-${msg.id}-${msg.conversationId}`,
          conversationId: msg.conversationId,
          label,
          isTask,
        });
        currentConvId = msg.conversationId;
        prevSenderId = null;
      }
      const senderId = Number(msg.senderId || msg.sender?.id || 0);
      const showSender =
        senderId !== user?.id && senderId !== 0 && prevSenderId !== senderId;
      items.push({
        kind: "msg",
        key: `msg-${msg.id}`,
        msg,
        showSender,
      });
      prevSenderId = senderId;
    });
    return items;
  }, [mergedMessages, conversationOf, user?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white text-gray-900">
      <Navbar />
      <main className="max-w-6xl mx-auto pt-20 px-2 sm:px-4 pb-4">
        <div className="mb-4 px-2 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold">Messages</h1>
          <Link
            href="/marketplace"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Back to Marketplace
          </Link>
        </div>

        {error && (
          <div className="mb-3 mx-2 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            {error}
          </div>
        )}
        {conversationNotice && (
          <div className="mb-3 mx-2 bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-700 text-sm">
            {conversationNotice}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] h-[calc(100vh-200px)] min-h-[500px]">
            {/* Sidebar - one entry per person */}
            <aside
              className={`${
                showSidebarOnMobile ? "flex" : "hidden"
              } md:flex flex-col border-r border-gray-200 bg-gray-50/50`}
            >
              <div className="p-3 border-b border-gray-200 bg-white">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, message, or task..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-gray-50"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {loading && conversations.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500">
                    Loading conversations...
                  </div>
                ) : filteredPersonGroups.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-500">
                    {search
                      ? "No matches found."
                      : "No conversations yet. Open a chat from a task or marketplace."}
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {filteredPersonGroups.map((group) => {
                      const isActive = selectedPersonId === group.personId;
                      const taskCount = group.conversations.filter(
                        (c) => c.type !== "DIRECT",
                      ).length;
                      return (
                        <li key={group.personId}>
                          <button
                            onClick={() => {
                              setSelectedPersonId(group.personId);
                              setError("");
                              setShowSidebarOnMobile(false);
                            }}
                            className={`w-full text-left px-3 py-3 flex gap-3 transition-colors ${
                              isActive
                                ? "bg-blue-50 border-l-4 border-blue-500"
                                : "hover:bg-white border-l-4 border-transparent"
                            }`}
                          >
                            <div
                              className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-semibold ${colorForId(
                                group.personId,
                              )}`}
                            >
                              {initialsOf(group.personName)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p
                                  className={`truncate text-sm ${
                                    group.totalUnread > 0
                                      ? "font-semibold text-gray-900"
                                      : "font-medium text-gray-800"
                                  }`}
                                >
                                  {group.personName}
                                </p>
                                <span className="text-xs text-gray-400 flex-shrink-0">
                                  {formatRelative(
                                    new Date(group.latestAt).toISOString(),
                                  )}
                                </span>
                              </div>
                              {taskCount > 0 && (
                                <div className="flex items-center gap-1 mt-0.5 text-[11px] text-indigo-600">
                                  <FaTasks className="text-[9px]" />
                                  <span>
                                    {taskCount} task
                                    {taskCount > 1 ? "s" : ""}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center justify-between gap-2 mt-0.5">
                                <p
                                  className={`truncate text-xs ${
                                    group.totalUnread > 0
                                      ? "text-gray-700 font-medium"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {group.lastMessageBody || "No messages yet"}
                                </p>
                                {group.totalUnread > 0 && (
                                  <span className="flex-shrink-0 bg-blue-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                                    {group.totalUnread}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="p-2 border-t border-gray-200 bg-white">
                <Button
                  variant="outline"
                  className="w-full text-sm"
                  onClick={async () => {
                    await loadConversations();
                    if (selectedGroup)
                      await loadAllMessagesForPerson(selectedGroup);
                  }}
                >
                  <FaSyncAlt className="mr-2 text-xs" /> Refresh
                </Button>
              </div>
            </aside>

            {/* Chat panel */}
            <section
              className={`${
                showSidebarOnMobile ? "hidden" : "flex"
              } md:flex flex-col bg-white`}
            >
              {!selectedGroup ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-500">
                  <FaUserCircle className="text-6xl text-gray-300 mb-4" />
                  <p className="text-lg font-medium text-gray-700">
                    Select a conversation
                  </p>
                  <p className="text-sm mt-1">
                    Choose a person from the list to see all your messages with
                    them.
                  </p>
                </div>
              ) : (
                <>
                  {/* Chat header */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
                    <button
                      className="md:hidden text-gray-600 hover:text-gray-900"
                      onClick={() => setShowSidebarOnMobile(true)}
                      aria-label="Back to inbox"
                    >
                      <FaArrowLeft />
                    </button>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${colorForId(
                        selectedGroup.personId,
                      )}`}
                    >
                      {initialsOf(selectedGroup.personName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {selectedGroup.personName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedGroup.conversations.length} conversation
                        {selectedGroup.conversations.length > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50">
                    {mergedMessages.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-sm text-gray-500">
                        No messages yet. Say hi!
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {groupedTimeline.map((item) => {
                          if (item.kind === "day") {
                            return (
                              <div
                                key={item.key}
                                className="flex justify-center my-3"
                              >
                                <span className="text-[11px] uppercase tracking-wide text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
                                  {item.label}
                                </span>
                              </div>
                            );
                          }
                          if (item.kind === "context") {
                            return (
                              <div
                                key={item.key}
                                className="flex justify-center my-2"
                              >
                                <Link
                                  href={
                                    conversationOf(item.conversationId)
                                      ?.taskAssignment?.post?.id
                                      ? `/posts/${conversationOf(item.conversationId)?.taskAssignment?.post?.id}`
                                      : "#"
                                  }
                                  className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border ${
                                    item.isTask
                                      ? "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                                      : "bg-gray-100 text-gray-600 border-gray-200"
                                  }`}
                                >
                                  {item.isTask ? (
                                    <FaTasks className="text-[10px]" />
                                  ) : (
                                    <FaCommentDots className="text-[10px]" />
                                  )}
                                  <span className="truncate max-w-[260px]">
                                    {item.label}
                                  </span>
                                </Link>
                              </div>
                            );
                          }
                          // msg
                          const msg = item.msg;
                          const isMine =
                            Number(msg.senderId || msg.sender?.id) === user?.id;
                          return (
                            <div
                              key={item.key}
                              className={`flex ${
                                isMine ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[78%] sm:max-w-[65%] flex flex-col ${
                                  isMine ? "items-end" : "items-start"
                                }`}
                              >
                                {!isMine && item.showSender && (
                                  <span className="text-[11px] text-gray-500 mb-0.5 ml-2">
                                    {senderLabelFor(msg)}
                                  </span>
                                )}
                                <div
                                  className={`px-3.5 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words shadow-sm ${
                                    isMine
                                      ? "bg-blue-600 text-white rounded-br-md"
                                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                                  }`}
                                >
                                  {msg.body}
                                </div>
                                <span
                                  className={`text-[10px] mt-0.5 ${
                                    isMine
                                      ? "text-gray-400 mr-2"
                                      : "text-gray-400 ml-2"
                                  }`}
                                >
                                  {new Date(msg.createdAt).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  {/* Composer */}
                  <div className="p-3 border-t border-gray-200 bg-white space-y-2">
                    {/* Compose target picker (only when multiple convs exist) */}
                    {selectedGroup.conversations.length > 1 && (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowTargetMenu((s) => !s)}
                          className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-full px-2.5 py-1 transition-colors"
                        >
                          <span className="text-gray-500">Sending to:</span>
                          <span className="font-medium text-gray-800 max-w-[220px] truncate">
                            {composeTargetLabel}
                          </span>
                          <FaChevronDown className="text-[9px]" />
                        </button>
                        {showTargetMenu && (
                          <div className="absolute bottom-full mb-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[260px] max-h-64 overflow-y-auto">
                            {selectedGroup.conversations.map((c) => {
                              const isTask = c.type !== "DIRECT";
                              const label = isTask
                                ? taskLabelOf(c) ||
                                  `Task #${c.taskAssignmentId}`
                                : "Direct message";
                              const active = composeTargetId === c.id;
                              return (
                                <button
                                  key={c.id}
                                  onClick={() => {
                                    setComposeTargetId(c.id);
                                    setShowTargetMenu(false);
                                  }}
                                  className={`w-full text-left px-3 py-2 text-sm flex items-start gap-2 hover:bg-gray-50 ${
                                    active ? "bg-blue-50" : ""
                                  }`}
                                >
                                  {isTask ? (
                                    <FaTasks className="text-indigo-500 text-xs mt-0.5 flex-shrink-0" />
                                  ) : (
                                    <FaCommentDots className="text-gray-400 text-xs mt-0.5 flex-shrink-0" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="truncate text-gray-800">
                                      {label}
                                    </p>
                                    {c.taskAssignment?.status && (
                                      <p className="text-[10px] text-gray-500">
                                        {c.taskAssignment.status}
                                      </p>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-end gap-2">
                      <textarea
                        value={messageBody}
                        onChange={(e) => setMessageBody(e.target.value)}
                        placeholder="Type a message..."
                        rows={1}
                        className="flex-1 resize-none border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 max-h-32"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={
                          sending || !messageBody.trim() || !composeTargetId
                        }
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-11 h-11 p-0 flex items-center justify-center flex-shrink-0"
                        aria-label="Send"
                      >
                        <FaPaperPlane className="text-sm" />
                      </Button>
                    </div>
                    {postIdParam > 0 && (
                      <p className="text-xs text-gray-500">
                        Context: Post #{postIdParam}
                      </p>
                    )}
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
