"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { messagingApi, Message } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const userIdParam = Number(searchParams.get("userId") || "0");
  const conversationIdParam = Number(searchParams.get("conversationId") || "0");
  const postIdParam = Number(searchParams.get("postId") || "0");
  const { user } = useAuth();

  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageBody, setMessageBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMessages = async (id: number) => {
    const raw = (await messagingApi.getMessages(id)) as any;
    const items: Message[] = Array.isArray(raw) ? raw : raw?.content || [];
    setMessages(
      items.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
    );
  };

  useEffect(() => {
    const initConversation = async () => {
      if (conversationIdParam) {
        try {
          setLoading(true);
          setConversationId(conversationIdParam);
          await loadMessages(conversationIdParam);
        } catch (err: any) {
          setError(err.message || "Failed to load conversation");
        } finally {
          setLoading(false);
        }
        return;
      }

      if (!userIdParam || !user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const participantIds = Array.from(new Set([user.id, userIdParam])).sort(
          (a, b) => a - b,
        );

        if (participantIds.length < 2) {
          setError("You cannot create a direct conversation with yourself.");
          setLoading(false);
          return;
        }

        let conversation = null as any;
        let lastError: any = null;

        try {
          conversation = await messagingApi.createConversation({
            type: "DIRECT",
            participantIds,
          });
        } catch (err: any) {
          lastError = err;
        }

        if (!conversation) {
          throw lastError || new Error("Failed to create conversation");
        }

        setConversationId(conversation.id);
        await loadMessages(conversation.id);
      } catch (err: any) {
        setError(err.message || "Failed to load conversation");
      } finally {
        setLoading(false);
      }
    };

    initConversation();
  }, [userIdParam, conversationIdParam, user?.id]);

  useEffect(() => {
    if (!conversationId) return;

    const interval = setInterval(() => {
      loadMessages(conversationId).catch(() => {
        // Keep silent during polling to avoid noisy UX
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [conversationId]);

  const sendMessage = async () => {
    if (!conversationId || !messageBody.trim()) return;

    try {
      await messagingApi.sendMessage({
        conversationId,
        body: messageBody.trim(),
      });
      setMessageBody("");
      await loadMessages(conversationId);
    } catch (err: any) {
      setError(err.message || "Failed to send message");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white text-gray-900">
      <Navbar />
      <main className="max-w-3xl mx-auto pt-24 px-4 pb-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Messages</h1>
          <Link
            href="/marketplace"
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Marketplace
          </Link>
        </div>

        {!userIdParam && !conversationIdParam && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
            Open a chat from a marketplace post.
          </div>
        )}

        {postIdParam > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-800 mb-4 text-sm">
            Chat context: Post #{postIdParam}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-gray-600">Loading conversation...</div>
        ) : (
          <div className="bg-white border rounded-xl p-4">
            <div className="flex justify-end mb-2">
              <Button
                variant="outline"
                onClick={() => conversationId && loadMessages(conversationId)}
              >
                Refresh
              </Button>
            </div>
            <div className="space-y-3 max-h-[420px] overflow-y-auto mb-4">
              {messages.length === 0 ? (
                <p className="text-gray-500">No messages yet.</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg border ${
                      msg.sender?.id === user?.id
                        ? "bg-blue-50 border-blue-200"
                        : "bg-gray-50"
                    }`}
                  >
                    <div className="text-xs text-gray-500 mb-1">
                      {msg.sender?.displayName || msg.sender?.username} ·{" "}
                      {new Date(msg.createdAt).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-800">{msg.body}</div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <input
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
              />
              <Button
                onClick={sendMessage}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Send
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
