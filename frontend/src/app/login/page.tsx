"use client";

import { useState } from "react";
import { FaRegEnvelope } from "react-icons/fa";
import { MdLockOutline } from "react-icons/md";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        // Store the token in localStorage or context/state management
        localStorage.setItem("token", data.token);
        router.push("/dashboard"); // Redirect to the dashboard or home page
      } else {
        const data = await res.json();
        setError(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An unexpected error occurred");
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
        <div className="rounded-2xl shadow-2xl w-full max-w-4xl mx-4 my-8 overflow-hidden bg-white">
          {/* Blue Header Section */}
          <div
            className="p-8 text-center"
            style={{ backgroundColor: "rgb(9, 13, 33)" }}
          >
            <h2 className="text-4xl font-bold mb-2 text-white">Login</h2>
            <div className="border-2 w-20 border-blue-400 block mb-2 mx-auto"></div>
            <p className="text-gray-300 my-3">Use your email account</p>
          </div>

          {/* White Form Section */}
          <div className="p-8 bg-white">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col items-center space-y-6"
            >
              <div className="bg-gray-900 w-full max-w-md p-4 flex items-center rounded-md shadow-md">
                <FaRegEnvelope className="text-gray-400 mr-3" />
                <input
                  type="email"
                  name="email"
                  placeholder="Username/Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-900 text-white outline-none flex-1"
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
                />
              </div>
              {error && <p className="text-red-500">{error}</p>}
              <Button
                type="submit"
                className="w-full max-w-md text-white font-bold py-4 px-8 rounded-md transition duration-300 ease-in-out transform hover:scale-105 hover:opacity-90"
                style={{ backgroundColor: "rgb(9, 13, 33)" }}
              >
                Login
              </Button>
            </form>
            <div className="mt-6 text-center">
              <Link href="/signup">
                <span className="text-blue-600 hover:underline cursor-pointer">
                  Don't have an account? Sign Up
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
