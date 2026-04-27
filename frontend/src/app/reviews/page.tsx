"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { ApiError, Review, reviewsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function ReviewsPage() {
  const params = useSearchParams();
  const postId = Number(params.get("postId") || "0");
  const initialTaskAssignmentId = Number(params.get("taskAssignmentId") || "0");
  const [taskAssignmentIdInput, setTaskAssignmentIdInput] = useState(
    initialTaskAssignmentId > 0 ? String(initialTaskAssignmentId) : "",
  );
  const taskAssignmentId = Number(taskAssignmentIdInput || "0");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const canSubmit =
    taskAssignmentId > 0 && rating >= 1 && rating <= 5 && !existingReview;

  useEffect(() => {
    const loadExistingReview = async () => {
      if (taskAssignmentId <= 0) return;
      try {
        const review = await reviewsApi.getReviewByTask(taskAssignmentId);
        setExistingReview(review);
        setSuccess("You already submitted a review for this task.");
      } catch (err: any) {
        const typedError = err as ApiError;
        if (
          typedError.code !== "REVIEW_NOT_FOUND" &&
          typedError.code !== "NOT_FOUND"
        ) {
          setError(typedError.message || "Failed to load existing review.");
        }
      }
    };

    loadExistingReview();
  }, [taskAssignmentId]);

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

      try {
        const refreshed = await reviewsApi.getReviewByTask(taskAssignmentId);
        setExistingReview(refreshed);
      } catch {
        // If lookup fails, still keep success message from create.
      }
      setSuccess("Review submitted.");
      setComment("");
    } catch (err: any) {
      const typedError = err as ApiError;
      if (typedError.code === "DUPLICATE_REVIEW") {
        setError("You have already reviewed this task.");
        try {
          const existing = await reviewsApi.getReviewByTask(taskAssignmentId);
          setExistingReview(existing);
        } catch {
          // keep duplicate message only
        }
      } else {
        setError(typedError.message || "Failed to submit review");
      }
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

        {taskAssignmentId > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-indigo-800 mb-4 text-sm">
            Reviewing completed task #{taskAssignmentId}
            {postId > 0 ? ` for post #${postId}.` : "."}
          </div>
        )}

        {taskAssignmentId <= 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 mb-4 text-sm">
            Review not ready yet. Open Review from a completed post in your profile so task details are auto-filled.
          </div>
        )}

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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Assignment ID
            </label>
            <input
              type="number"
              value={taskAssignmentIdInput}
              onChange={(e) => setTaskAssignmentIdInput(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Task Assignment ID"
              readOnly={initialTaskAssignmentId > 0}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating
            </label>
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comment (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border rounded px-3 py-2"
              rows={4}
              placeholder="Share your experience..."
            />
          </div>

          <Button
            onClick={submitReview}
            disabled={loading || !canSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? "Submitting..." : "Submit Review"}
          </Button>

          {existingReview && (
            <div className="border rounded-lg p-3 bg-gray-50">
              <p className="text-sm font-semibold text-gray-800 mb-1">
                Existing Review
              </p>
              <p className="text-sm text-gray-700">
                Rating: {existingReview.rating}/5
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {existingReview.comment || "No comment provided."}
              </p>
            </div>
          )}

          {success && (
            <div className="pt-3 border-t mt-3">
              <div className="flex flex-wrap gap-2">
                <Link href="/profile">
                  <Button variant="outline">Back to Profile</Button>
                </Link>
                {postId > 0 && (
                  <Link href={`/posts/${postId}`}>
                    <Button variant="outline">View Post</Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
