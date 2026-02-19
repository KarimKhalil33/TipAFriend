"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { reviewsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function ReviewsPage() {
  const params = useSearchParams();
  const [taskAssignmentId, setTaskAssignmentId] = useState(
    Number(params.get("taskAssignmentId") || "0"),
  );
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submitReview = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await reviewsApi.createReview({
        taskAssignmentId,
        rating,
        comment: comment || undefined,
      });

      setSuccess("Review submitted.");
      setComment("");
    } catch (err: any) {
      setError(err.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white text-gray-900">
      <Navbar />
      <main className="max-w-2xl mx-auto pt-24 px-4 pb-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Leave Review</h1>
          <Link href="/profile" className="text-blue-600 hover:text-blue-700">
            Back to Profile
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 mb-4">
            {success}
          </div>
        )}

        <div className="bg-white border rounded-xl p-4 space-y-3">
          <input
            type="number"
            value={taskAssignmentId}
            onChange={(e) => setTaskAssignmentId(Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
            placeholder="Task Assignment ID"
          />

          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
          >
            <option value={5}>5 - Excellent</option>
            <option value={4}>4 - Good</option>
            <option value={3}>3 - Okay</option>
            <option value={2}>2 - Poor</option>
            <option value={1}>1 - Bad</option>
          </select>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border rounded px-3 py-2"
            rows={4}
            placeholder="Share your experience..."
          />

          <Button
            onClick={submitReview}
            disabled={loading || !taskAssignmentId}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Submit Review
          </Button>
        </div>
      </main>
    </div>
  );
}
