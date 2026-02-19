"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { postsApi } from "@/lib/api";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaClock,
  FaDollarSign,
  FaImage,
  FaPlus,
} from "react-icons/fa";

export default function CreatePostPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = Number(searchParams.get("editId") || "0");
  const isEditMode = !!editId;
  const [postType, setPostType] = useState("request"); // "request" or "offer"
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

        const locationParts = (post.locationName || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

        const scheduled = post.scheduledTime
          ? new Date(post.scheduledTime)
          : null;

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
            ? `${String(scheduled.getHours()).padStart(2, "0")}:${String(
                scheduled.getMinutes(),
              ).padStart(2, "0")}`
            : "",
          duration: post.durationMinutes ? String(post.durationMinutes) : "",
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic validation
    if (!formData.title || !formData.description || !formData.category) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      // Convert form data to API format
      const scheduledTime =
        formData.scheduledDate && formData.scheduledTime
          ? `${formData.scheduledDate}T${formData.scheduledTime}:00`
          : undefined;

      const locationParts = [
        formData.address?.trim(),
        formData.city?.trim(),
        formData.province?.trim(),
        formData.country?.trim(),
      ].filter(Boolean);

      const locationName =
        locationParts.length > 0 ? locationParts.join(", ") : undefined;

      const postData = {
        type: postType.toUpperCase() as "REQUEST" | "OFFER",
        title: formData.title,
        description: formData.description,
        category: formData.category as
          | "CLEANING"
          | "MOVING"
          | "PET_CARE"
          | "ERRANDS"
          | "TUTORING"
          | "TECH_HELP"
          | "OTHER",
        locationName,
        scheduledTime,
        durationMinutes: formData.duration
          ? parseInt(formData.duration)
          : undefined,
        paymentType: "FIXED" as const,
        price: formData.price ? parseFloat(formData.price) : undefined,
      };

      console.log("Creating post:", postData);

      if (isEditMode) {
        await postsApi.updatePost(editId, postData);
      } else {
        await postsApi.createPost(postData);
      }

      // Redirect to marketplace on success
      router.push("/marketplace");
    } catch (error: any) {
      console.error("Error creating post:", error);
      setError(error.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-white text-gray-900 overflow-y-auto">
      {/* Background Wave Pattern */}
      <div className="absolute inset-0 z-0">
        <svg
          className="absolute top-0 left-0 w-full h-full opacity-10"
          viewBox="0 0 1000 1000"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0,300 Q250,200 500,300 T1000,300 L1000,0 L0,0 Z"
            fill="currentColor"
            className="text-gray-300"
          />
        </svg>
      </div>

      <Navbar />

      <main className="relative z-10 pt-24 px-4 max-w-4xl mx-auto pb-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <FaArrowLeft />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isEditMode ? "Edit Post" : "Create New Post"}
          </h1>
          <p className="text-gray-600">
            {isEditMode
              ? "Update your post details"
              : "Share what you need help with or what you can offer"}
          </p>
        </div>

        {prefilling && (
          <div className="mb-4 text-sm text-gray-600">
            Loading post details...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Post Type Selection */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Post Type
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPostType("request")}
                className={`p-6 rounded-xl border-2 transition-all ${
                  postType === "request"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <h3 className="font-semibold text-lg mb-2">Request Help</h3>
                <p className="text-sm">I need someone to help me with a task</p>
              </button>
              <button
                type="button"
                onClick={() => setPostType("offer")}
                className={`p-6 rounded-xl border-2 transition-all ${
                  postType === "offer"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <h3 className="font-semibold text-lg mb-2">Offer Help</h3>
                <p className="text-sm">
                  I can help others with a specific task
                </p>
              </button>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide more details about the task..."
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <FaMapMarkerAlt className="text-blue-500" />
              Location
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Main Street"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Toronto"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Province/State
                </label>
                <input
                  type="text"
                  name="province"
                  value={formData.province}
                  onChange={handleInputChange}
                  placeholder="ON"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Canada"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Time & Duration */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <FaClock className="text-blue-500" />
              Schedule & Duration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  name="scheduledTime"
                  value={formData.scheduledTime}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="e.g., 2 hours, 30 minutes"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <FaDollarSign className="text-green-500" />
              Payment
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="25"
                  min="0"
                  step="0.01"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {currencies.map((curr) => (
                    <option key={curr} value={curr}>
                      {curr}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300 py-3 px-6 rounded-lg font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white transition duration-300 ${
                postType === "request"
                  ? "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
                  : "bg-green-600 hover:bg-green-700 disabled:bg-green-400"
              }`}
            >
              {loading
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                  ? "Update Post"
                  : `Create ${postType === "request" ? "Request" : "Offer"}`}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
