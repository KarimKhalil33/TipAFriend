"use client";

import { useState } from "react";
import { FaRegEnvelope } from "react-icons/fa";
import { MdLockOutline } from "react-icons/md";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <div className="bg-black bg-opacity-80 rounded-2xl shadow-2xl flex w-full max-w-4xl">
          <div className="w-full p-8 text-white">
            <div className="text-left font-bold text-2xl">
              T<span className="text-blue-500">A</span>F
            </div>
            <div className="py-10">
              <h2 className="text-4xl font-bold mb-2">Sign In</h2>
              <div className="border-2 w-20 border-blue-500 inline-block mb-2"></div>
              <p className="text-gray-400 my-3">Use your email account</p>
              <form
                onSubmit={handleSubmit}
                className="flex flex-col items-center space-y-6"
              >
                <div className="bg-gray-900 w-full max-w-md p-4 flex items-center rounded-md shadow-md">
                  <FaRegEnvelope className="text-gray-400 mr-3" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
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
                  className="w-full max-w-md bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-md transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Sign In
                </Button>
              </form>
              <div className="mt-6">
                <Link href="/signup">
                  <span className="text-blue-500 hover:underline cursor-pointer">
                    Don't have an account? Sign Up
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <style jsx>{`
        .bg-gradient-to-r {
          background: linear-gradient(to right, #1e3a8a, #3b82f6);
        }
      `}</style>
    </div>
  );
}
