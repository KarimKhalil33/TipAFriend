"use client";

import { useState } from "react";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaGoogle,
  FaRegEnvelope,
} from "react-icons/fa";
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
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-white text-gray-900">
      {/* Background Wave Pattern */}
      <div className="absolute inset-0 z-0">
        <svg
          className="absolute top-0 left-0 w-full h-full opacity-15"
          viewBox="0 0 1000 1000"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0,300 Q250,200 500,300 T1000,300 L1000,0 L0,0 Z"
            fill="currentColor"
            className="text-gray-300"
          />
          <path
            d="M0,500 Q250,400 500,500 T1000,500 L1000,300 Q750,400 500,300 T0,300 Z"
            fill="currentColor"
            className="text-gray-400"
          />
          <path
            d="M0,700 Q250,600 500,700 T1000,700 L1000,500 Q750,600 500,500 T0,500 Z"
            fill="currentColor"
            className="text-gray-500"
          />
        </svg>
        <svg
          className="absolute bottom-0 left-0 w-full h-full opacity-15"
          viewBox="0 0 1000 1000"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0,1000 Q250,900 500,1000 T1000,1000 L1000,800 Q750,700 500,800 T0,800 Z"
            fill="currentColor"
            className="text-gray-400"
          />
        </svg>
      </div>
      <Navbar />
      <div className="absolute inset-0 flex items-center justify-center z-10 overflow-y-auto pt-20">
        <div
          className="rounded-2xl shadow-2xl flex w-full max-w-4xl mx-4 my-8"
          style={{ backgroundColor: "rgb(9, 13, 33)" }}
        >
          <div className="w-3/5 p-8 text-white">
            <div className="py-10">
              <h2 className="text-4xl font-bold mb-2 text-center">
                Create an Account
              </h2>
              <div className="border-2 w-20 border-blue-400 block mb-2 mx-auto"></div>
              <div className="flex justify-center my-2">
                <a
                  href="#"
                  className="border-2 border-gray-700 rounded-full p-3 mx-1 hover:text-blue-700"
                >
                  <FaFacebookF className="text-sm" />
                </a>
                <a
                  href="#"
                  className="border-2 border-gray-700 rounded-full p-3 mx-1 hover:text-blue-700"
                >
                  <FaLinkedinIn className="text-sm" />
                </a>
                <a
                  href="#"
                  className="border-2 border-gray-700 rounded-full p-3 mx-1 hover:text-blue-700"
                >
                  <FaGoogle className="text-sm" />
                </a>
              </div>
              <p className="text-gray-400 my-3 text-center">
                or use your email for registration
              </p>
              <form
                onSubmit={handleSubmit}
                className="flex flex-col items-center space-y-6"
              >
                <div className="bg-gray-900 w-full max-w-md p-4 flex items-center rounded-md shadow-md">
                  <FaRegEnvelope className="text-gray-400 mr-3" />
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-gray-900 text-white outline-none flex-1"
                    required
                  />
                </div>
                <div className="bg-gray-900 w-full max-w-md p-4 flex items-center rounded-md shadow-md">
                  <FaRegEnvelope className="text-gray-400 mr-3" />
                  <input
                    type="text"
                    name="displayName"
                    placeholder="Display Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-gray-900 text-white outline-none flex-1"
                    required
                  />
                </div>
                <div className="bg-gray-900 w-full max-w-md p-4 flex items-center rounded-md shadow-md">
                  <FaRegEnvelope className="text-gray-400 mr-3" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-900 text-white outline-none flex-1"
                    required
                  />
                </div>
                <div className="bg-gray-900 w-full max-w-md p-4 flex items-center rounded-md shadow-md">
                  <MdLockOutline className="text-gray-400 mr-3" />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-900 text-white outline-none flex-1"
                    required
                    minLength={6}
                  />
                </div>
                {error && <p className="text-red-500">{error}</p>}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full max-w-md text-white font-bold py-4 px-8 rounded-md transition duration-300 ease-in-out transform hover:scale-105 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "rgb(9, 13, 33)" }}
                >
                  {loading ? "Creating Account..." : "Sign Up"}
                </Button>
              </form>
            </div>
          </div>
          <div className="w-2/5 bg-gray-50 text-gray-800 rounded-tr-2xl rounded-br-2xl py-36 px-12">
            <h2 className="text-3xl font-bold mb-2">
              Already have an account?
            </h2>
            <div className="border-2 w-10 border-gray-800 inline-block mb-2"></div>
            <p className="mb-10">
              Sign in to access your account and start your journey with us.
            </p>
            <Link href="/login">
              <Button className="border-2 border-gray-800 rounded-full px-12 py-2 inline-block font-semibold hover:bg-gray-800 hover:text-white">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
