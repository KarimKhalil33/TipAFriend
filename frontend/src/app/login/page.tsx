"use client";

import { useState } from "react";
import { FaRegEnvelope } from "react-icons/fa";
import { MdLockOutline } from "react-icons/md";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(username, password);
      router.push("/marketplace");
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#090D21] flex flex-col">
      {/* Glow orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-80 h-80 bg-indigo-600 rounded-full opacity-10 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600 rounded-full opacity-10 blur-3xl" />
      </div>

      <Navbar />

      <div className="flex-1 flex items-center justify-center px-6 py-8 relative z-10">
        <div className="w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex">
          {/* Left: Branding */}
          <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-indigo-600 to-purple-700 p-12 flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full opacity-5" />
              <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-white rounded-full opacity-5" />
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
                Welcome
                <br />
                back.
              </h2>
              <p className="text-indigo-200 text-base leading-relaxed">
                Sign in to see what tasks your friends have posted and start
                earning.
              </p>
            </div>
            <div className="relative z-10 text-indigo-200 text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/signup">
                <span className="text-white font-semibold underline underline-offset-2 hover:text-indigo-100 cursor-pointer">
                  Sign up free
                </span>
              </Link>
            </div>
          </div>

          {/* Right: Form */}
          <div className="w-full lg:w-7/12 bg-white p-10 lg:p-14 flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-1">Sign in</h2>
            <p className="text-gray-500 mb-8 text-sm">
              Enter your credentials to access your account
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <FaRegEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    name="username"
                    placeholder="your_username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 rounded-xl text-base shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500 lg:hidden">
              Don&apos;t have an account?{" "}
              <Link href="/signup">
                <span className="text-indigo-600 font-semibold hover:underline cursor-pointer">
                  Sign up free
                </span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
