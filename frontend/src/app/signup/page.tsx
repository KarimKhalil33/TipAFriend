"use client";

import { useState } from "react";
import { FaRegEnvelope, FaUser } from "react-icons/fa";
import { MdLockOutline } from "react-icons/md";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(email, username, password, displayName);
      router.push("/marketplace");
    } catch (error: any) {
      console.error("Registration error:", error);
      setError(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#090D21] flex flex-col">
      {/* Glow orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-80 h-80 bg-purple-600 rounded-full opacity-10 blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-indigo-600 rounded-full opacity-10 blur-3xl" />
      </div>

      <Navbar />

      <div className="flex-1 flex items-center justify-center px-6 py-8 relative z-10 overflow-y-auto">
        <div className="w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex my-4">
          {/* Left: Form */}
          <div className="w-full lg:w-7/12 bg-white p-10 lg:p-14 flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-1">
              Create account
            </h2>
            <p className="text-gray-500 mb-8 text-sm">
              Join your friends and start posting tasks today
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Username
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <input
                      type="text"
                      name="username"
                      placeholder="your_username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Display Name
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <input
                      type="text"
                      name="displayName"
                      placeholder="Your Name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <FaRegEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <MdLockOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 rounded-xl text-base shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500 lg:hidden">
              Already have an account?{" "}
              <Link href="/login">
                <span className="text-indigo-600 font-semibold hover:underline cursor-pointer">
                  Sign in
                </span>
              </Link>
            </p>
          </div>

          {/* Right: Branding */}
          <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-indigo-600 to-purple-700 p-12 flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full opacity-5" />
              <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-white rounded-full opacity-5" />
            </div>
            <div className="relative z-10">
              <Link href="/landing">
                <span className="text-2xl font-bold text-white tracking-wide cursor-pointer">
                  TAF
                </span>
              </Link>
            </div>
            <div className="relative z-10">
              <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight">
                Start earning
                <br />
                today.
              </h2>
              <p className="text-indigo-200 text-base leading-relaxed mb-6">
                Join your friends, post tasks you need done, and earn money by
                helping out.
              </p>
              <div className="space-y-3">
                {[
                  "Free to join",
                  "Friends-only network",
                  "Secure payments",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-indigo-100 text-sm"
                  >
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative z-10 text-indigo-200 text-sm">
              Already have an account?{" "}
              <Link href="/login">
                <span className="text-white font-semibold underline underline-offset-2 hover:text-indigo-100 cursor-pointer">
                  Sign in
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
