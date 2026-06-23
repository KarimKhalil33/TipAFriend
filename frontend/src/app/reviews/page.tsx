"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { ApiError, Review, reviewsApi } from "@/lib/api";
import { FaArrowLeft, FaStar, FaCheckCircle } from "react-icons/fa";

const ratingLabels: Record<number, string> = {
  1: "Bad",
  2: "Poor",
  3: "Okay",
  4: "Good",
  5: "Excellent",
};

export default function ReviewsPage() {
  const params = useSearchParams();
  const postId = Number(params.get("postId") || "0");
  const initialTaskAssignmentId = Number(params.get("taskAssignmentId") || "0");
  const [taskAssignmentIdInput, setTaskAssignmentIdInput] = useState(
    initialTaskAssignmentId > 0 ? String(initialTaskAssignmentId) : "",
  );
  const taskAssignmentId = Number(taskAssignmentIdInput || "0");
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const canSubmit = taskAssignmentId > 0 && rating >= 1 && rating <= 5 && !existingReview;

  useEffect(() => {
    const loadExistingReview = async () => {
      if (taskAssignmentId <= 0) return;
      try {
        const review = await reviewsApi.getReviewByTask(taskAssignmentId);
        setExistingReview(review);
      } catch (err: any) {
        const typedError = err as ApiError;
        if (typedError.code !== "REVIEW_NOT_FOUND" && typedError.code !== "NOT_FOUND") {
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
      await reviewsApi.createReview({ taskAssignmentId, rating, comment: comment || undefined });
      try {
        const refreshed = await reviewsApi.getReviewByTask(taskAssignmentId);
        setExistingReview(refreshed);
      } catch {}
      setComment("");
    } catch (err: any) {
      const typedError = err as ApiError;
      if (typedError.code === "DUPLICATE_REVIEW") {
        setError("You have already reviewed this task.");
        try {
          const existing = await reviewsApi.getReviewByTask(taskAssignmentId);
          setExistingReview(existing);
        } catch {}
      } else {
        setError(typedError.message || "Failed to submit review");
      }
    } finally {
      setLoading(false);
    }
  };

  const displayRating = hovered || rating;
  const alreadyReviewed = !!existingReview;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      {/* Dark header */}
      <div className="bg-[#090D21] pt-20 pb-16 px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-20 w-64 h-64 bg-indigo-600 rounded-full opacity-10 blur-3xl" />
          <div className="absolute bottom-0 left-10 w-64 h-64 bg-yellow-400 rounded-full opacity-5 blur-3xl" />
        </div>
        <div className="max-w-lg mx-auto relative z-10">
          <Link href="/profile">
            <span className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors text-sm cursor-pointer w-fit">
              <FaArrowLeft className="text-xs" />
              Back to Profile
            </span>
          </Link>
          <h1 className="text-4xl font-extrabold text-white mb-1">
            {alreadyReviewed ? "Review submitted" : "Leave a review"}
          </h1>
          <p className="text-gray-300 text-sm">
            {alreadyReviewed
              ? "You've already reviewed this task."
              : "How did your helper do? Your feedback helps the community."}
          </p>
        </div>
      </div>

      <main className="px-4 max-w-lg mx-auto pb-12 -mt-6 relative z-10 space-y-4">

        {/* No task context */}
        {taskAssignmentId <= 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-amber-800 text-sm">
            <p className="font-semibold mb-1">No task selected</p>
            <p>Open a completed task from your profile and tap the review button to get here automatically.</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            <p className="text-red-700 text-sm font-medium mb-0.5">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Already reviewed — display the submitted review */}
        {alreadyReviewed ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 text-3xl">
              <FaCheckCircle />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Thanks for the feedback!</h2>
              <div className="flex justify-center gap-1 mt-2 mb-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <FaStar key={s} className={`text-2xl ${s <= existingReview.rating ? "text-yellow-400" : "text-gray-200"}`} />
                ))}
              </div>
              <p className="text-xs text-gray-500">{ratingLabels[existingReview.rating]}</p>
              {existingReview.comment && (
                <p className="text-sm text-gray-600 mt-3 italic">&quot;{existingReview.comment}&quot;</p>
              )}
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Link href="/profile">
                <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 rounded-xl text-sm hover:scale-[1.02] transition-all shadow-md">
                  Back to Profile
                </button>
              </Link>
              {postId > 0 && (
                <Link href={`/posts/${postId}`}>
                  <button className="w-full border border-gray-200 text-gray-600 font-medium py-3 rounded-xl text-sm hover:bg-gray-50 transition-all">
                    View Post
                  </button>
                </Link>
              )}
            </div>
          </div>
        ) : taskAssignmentId > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">

            {/* Star rating */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Your rating</p>
              <div className="flex gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <FaStar
                      className={`text-4xl transition-colors ${
                        star <= displayRating ? "text-yellow-400" : "text-gray-200"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm font-medium text-gray-600">{ratingLabels[displayRating] || ""}</p>
            </div>

            {/* Comment */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Comment <span className="font-normal normal-case">(optional)</span></p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="What did they do well? Anything they could improve?"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Hidden fallback input for task assignment ID when not pre-filled */}
            {initialTaskAssignmentId <= 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Task ID</p>
                <input
                  type="number"
                  value={taskAssignmentIdInput}
                  onChange={(e) => setTaskAssignmentIdInput(e.target.value)}
                  placeholder="Enter task assignment ID"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            <button
              onClick={submitReview}
              disabled={loading || !canSubmit}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl text-base shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        ) : null}

      </main>
    </div>
  );
}
