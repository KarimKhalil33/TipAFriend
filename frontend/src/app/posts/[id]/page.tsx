"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { postsApi, Post } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function PostDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const postId = Number(params?.id || "0");

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!postId) {
        setLoading(false);
        setError("Invalid post ID");
        return;
      }
      try {
        setLoading(true);
        const data = await postsApi.getPost(postId);
        setPost(data);
      } catch (err: any) {
        setError(err.message || "Failed to load post details");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [postId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white text-gray-900">
      <Navbar />
      <main className="max-w-3xl mx-auto pt-24 px-4 pb-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Post Details</h1>
          <Link href="/profile" className="text-blue-600 hover:text-blue-700">
            Back to Profile
          </Link>
        </div>

        {loading ? (
          <div className="text-gray-600">Loading...</div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700">
            {error}
          </div>
        ) : post ? (
          <div className="bg-white border rounded-xl p-5 space-y-3">
            <div className="text-sm text-gray-500">#{post.id}</div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {post.title}
            </h2>
            <p className="text-gray-700">
              {post.description || "No description"}
            </p>
            <div className="text-sm text-gray-600">Type: {post.type}</div>
            <div className="text-sm text-gray-600">Status: {post.status}</div>
            <div className="text-sm text-gray-600">
              Category: {post.category || "N/A"}
            </div>
            <div className="text-sm text-gray-600">
              Location: {post.locationName || "N/A"}
            </div>
            <div className="text-sm text-gray-600">
              Price: {post.price ?? "N/A"}
            </div>
            <div className="text-sm text-gray-600">
              Author:{" "}
              {post.author?.displayName || post.author?.username || "Unknown"}
            </div>

            <div className="pt-3">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => router.push(`/create-post?editId=${post.id}`)}
              >
                Edit Post
              </Button>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
