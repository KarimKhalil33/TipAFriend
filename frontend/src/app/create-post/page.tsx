"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { postsApi } from "@/lib/api";
import { parseDurationToMinutes, formatMinutesAsDuration } from "@/lib/duration";
import { FaArrowLeft, FaMapMarkerAlt, FaClock, FaDollarSign } from "react-icons/fa";

export default function CreatePostPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = Number(searchParams.get("editId") || "0");
  const isEditMode = !!editId;
  const [postType, setPostType] = useState("request");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    address: "",
    city: "",
    province: "",
    country: "",
    scheduledDate: "",
    scheduledTime: "",
    timezone: "EST",
    duration: "",
    price: "",
    currency: "USD",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [prefilling, setPrefilling] = useState(false);

  const categories = [
    { label: "Moving", value: "MOVING" },
    { label: "Pet Care", value: "PET_CARE" },
    { label: "Errands", value: "ERRANDS" },
    { label: "Cleaning", value: "CLEANING" },
    { label: "Tutoring", value: "TUTORING" },
    { label: "Tech Help", value: "TECH_HELP" },
    { label: "Other", value: "OTHER" },
  ];

  const timezones = ["EST", "CST", "MST", "PST", "GMT", "CET"];
  const currencies = ["USD", "CAD", "EUR", "GBP"];

  useEffect(() => {
    const loadPostForEdit = async () => {
      if (!isEditMode) return;
      try {
        setPrefilling(true);
        const post = await postsApi.getPost(editId);
        const locationParts = (post.locationName || "").split(",").map((s) => s.trim()).filter(Boolean);
        const scheduled = post.scheduledTime ? new Date(post.scheduledTime) : null;
        setPostType(post.type === "REQUEST" ? "request" : "offer");
        setFormData((prev) => ({
          ...prev,
          title: post.title || "",
          description: post.description || "",
          category: post.category || "",
          address: locationParts[0] || "",
          city: locationParts[1] || "",
          province: locationParts[2] || "",
          country: locationParts[3] || "",
          scheduledDate: scheduled ? scheduled.toISOString().slice(0, 10) : "",
          scheduledTime: scheduled
            ? `${String(scheduled.getHours()).padStart(2, "0")}:${String(scheduled.getMinutes()).padStart(2, "0")}`
            : "",
          duration: post.durationMinutes ? formatMinutesAsDuration(post.durationMinutes) : "",
          price: post.price ? String(post.price) : "",
        }));
      } catch (err: any) {
        setError(err.message || "Failed to load post for editing");
      } finally {
        setPrefilling(false);
      }
    };
    loadPostForEdit();
  }, [isEditMode, editId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const title = formData.title.trim();
    const description = formData.description.trim();
    if (!title || !description || !formData.category) {
      setError("Please fill in title, description, and category.");
      return;
    }
    if (title.length < 3 || title.length > 120) {
      setError("Title must be between 3 and 120 characters.");
      return;
    }
    if (description.length < 10 || description.length > 2000) {
      setError("Description must be between 10 and 2000 characters.");
      return;
    }

    let durationMinutes: number | undefined;
    if (formData.duration.trim()) {
      const parsed = parseDurationToMinutes(formData.duration);
      if (!parsed) {
        setError('Duration is not understood. Try e.g. "2h", "90m", "1h 30m", or "2:30".');
        return;
      }
      durationMinutes = parsed.totalMinutes;
    }

    let price: number | undefined;
    if (formData.price.trim()) {
      const parsedPrice = Number(formData.price);
      if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
        setError("Price must be a positive number.");
        return;
      }
      if (parsedPrice > 100000) {
        setError("Price seems too high. Please double-check.");
        return;
      }
      price = Math.round(parsedPrice * 100) / 100;
    }

    let scheduledTime: string | undefined;
    if (formData.scheduledDate && formData.scheduledTime) {
      const dt = new Date(`${formData.scheduledDate}T${formData.scheduledTime}:00`);
      if (Number.isNaN(dt.getTime())) {
        setError("Scheduled date/time is invalid.");
        return;
      }
      if (dt.getTime() < Date.now() - 5 * 60 * 1000) {
        setError("Scheduled time cannot be in the past.");
        return;
      }
      scheduledTime = `${formData.scheduledDate}T${formData.scheduledTime}:00`;
    } else if (formData.scheduledDate || formData.scheduledTime) {
      setError("Please provide both date and time, or leave both empty.");
      return;
    }

    setLoading(true);
    try {
      const locationParts = [
        formData.address?.trim(),
        formData.city?.trim(),
        formData.province?.trim(),
        formData.country?.trim(),
      ].filter(Boolean);
      const locationName = locationParts.length > 0 ? locationParts.join(", ") : undefined;

      const postData = {
        type: postType.toUpperCase() as "REQUEST" | "OFFER",
        title,
        description,
        category: formData.category as "CLEANING" | "MOVING" | "PET_CARE" | "ERRANDS" | "TUTORING" | "TECH_HELP" | "OTHER",
        locationName,
        scheduledTime,
        durationMinutes,
        paymentType: "FIXED" as const,
        price,
      };

      if (isEditMode) {
        await postsApi.updatePost(editId, postData);
      } else {
        await postsApi.createPost(postData);
      }
      router.push("/marketplace");
    } catch (error: any) {
      console.error("Error creating post:", error);
      setError(error.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 text-sm";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      {/* Compact dark header */}
      <div className="bg-[#090D21] pt-20 pb-16 px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-20 w-64 h-64 bg-indigo-600 rounded-full opacity-10 blur-3xl" />
          <div className="absolute bottom-0 left-20 w-64 h-64 bg-purple-600 rounded-full opacity-10 blur-3xl" />
        </div>
        <div className="max-w-3xl mx-auto relative z-10">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors text-sm"
          >
            <FaArrowLeft className="text-xs" />
            Back
          </button>
          <h1 className="text-4xl font-extrabold text-white mb-1">
            {isEditMode ? "Edit Post" : "Create Post"}
          </h1>
          <p className="text-gray-300 text-sm">
            {isEditMode
              ? "Update your post details"
              : "Share what you need help with or what you can offer"}
          </p>
        </div>
      </div>

      <main className="px-4 pb-12 -mt-6 relative z-10">
        <div className="max-w-3xl mx-auto">
          {prefilling && (
            <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              Loading post details...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Post Type */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Post Type
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPostType("request")}
                  className={`p-5 rounded-xl border-2 transition-all text-left ${
                    postType === "request"
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className={`text-base font-bold mb-1 ${postType === "request" ? "text-indigo-700" : "text-gray-800"}`}>
                    Request Help
                  </div>
                  <p className={`text-xs leading-relaxed ${postType === "request" ? "text-indigo-500" : "text-gray-400"}`}>
                    I need someone to help me with a task
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setPostType("offer")}
                  className={`p-5 rounded-xl border-2 transition-all text-left ${
                    postType === "offer"
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className={`text-base font-bold mb-1 ${postType === "offer" ? "text-emerald-700" : "text-gray-800"}`}>
                    Offer Help
                  </div>
                  <p className={`text-xs leading-relaxed ${postType === "offer" ? "text-emerald-500" : "text-gray-400"}`}>
                    I can help others with a specific task
                  </p>
                </button>
              </div>
            </div>

            {/* Basic Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Basic Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder={
                      postType === "request"
                        ? "e.g., Need help moving boxes"
                        : "e.g., Can walk your dog this afternoon"
                    }
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide more details about the task..."
                    rows={4}
                    className={`${inputClass} resize-none`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={inputClass}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-indigo-400" />
                Location
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange}
                    placeholder="123 Main Street" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange}
                    placeholder="Toronto" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Province / State</label>
                  <input type="text" name="province" value={formData.province} onChange={handleInputChange}
                    placeholder="ON" className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
                  <input type="text" name="country" value={formData.country} onChange={handleInputChange}
                    placeholder="Canada" className={inputClass} />
                </div>
              </div>
            </div>

            {/* Schedule & Duration */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FaClock className="text-indigo-400" />
                Schedule & Duration
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
                  <input type="date" name="scheduledDate" value={formData.scheduledDate}
                    onChange={handleInputChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Time</label>
                  <input type="time" name="scheduledTime" value={formData.scheduledTime}
                    onChange={handleInputChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Timezone</label>
                  <select name="timezone" value={formData.timezone} onChange={handleInputChange} className={inputClass}>
                    {timezones.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder='e.g. "2h", "90m", "1h 30m"'
                    inputMode="text"
                    autoComplete="off"
                    className={inputClass}
                  />
                  {(() => {
                    const trimmed = formData.duration.trim();
                    if (!trimmed) return (
                      <p className="mt-1.5 text-xs text-gray-400">
                        Use: <code className="bg-gray-100 px-1 rounded">2h</code>{" "}
                        <code className="bg-gray-100 px-1 rounded">90m</code>{" "}
                        <code className="bg-gray-100 px-1 rounded">1h 30m</code>
                      </p>
                    );
                    const parsed = parseDurationToMinutes(trimmed);
                    if (parsed) return (
                      <p className="mt-1.5 text-xs text-emerald-600">
                        ✓ {parsed.display} ({parsed.totalMinutes} min)
                      </p>
                    );
                    return (
                      <p className="mt-1.5 text-xs text-red-500">
                        Couldn&apos;t read that. Try{" "}
                        <code className="bg-red-50 px-1 rounded">2h</code> or{" "}
                        <code className="bg-red-50 px-1 rounded">90m</code>
                      </p>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FaDollarSign className="text-emerald-500" />
                Payment
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Price</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">$</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="25"
                      min="0"
                      step="0.01"
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
                  <select name="currency" value={formData.currency} onChange={handleInputChange} className={inputClass}>
                    {currencies.map((curr) => <option key={curr} value={curr}>{curr}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-4 pb-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-3 px-6 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md text-sm ${
                  postType === "request"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                    : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                }`}
              >
                {loading
                  ? isEditMode ? "Updating..." : "Creating..."
                  : isEditMode
                    ? "Update Post"
                    : `Create ${postType === "request" ? "Request" : "Offer"}`}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
