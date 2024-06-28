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

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:5000/api/flask/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        router.push("/login");
      } else {
        const data = await res.json();
        setError(data.message || "Failed to create user");
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
          <div className="w-3/5 p-8 text-white">
            <div className="text-left font-bold text-2xl">
              T<span className="text-blue-500">A</span>F
            </div>
            <div className="py-10">
              <h2 className="text-4xl font-bold mb-2">Create an Account</h2>
              <div className="border-2 w-20 border-blue-500 inline-block mb-2"></div>
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
              <p className="text-gray-400 my-3">
                or use your email for registration
              </p>
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
                <div className="bg-gray-900 w-full max-w-md p-4 flex items-center rounded-md shadow-md">
                  <FaRegEnvelope className="text-gray-400 mr-3" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-gray-900 text-white outline-none flex-1"
                  />
                </div>
                {error && <p className="text-red-500">{error}</p>}
                <Button
                  type="submit"
                  className="w-full max-w-md bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-md transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Sign Up
                </Button>
              </form>
            </div>
          </div>
          <div className="w-2/5 bg-white text-black rounded-tr-2xl rounded-br-2xl py-36 px-12">
            <h2 className="text-3xl font-bold mb-2">
              Already have an account?
            </h2>
            <div className="border-2 w-10 border-black inline-block mb-2"></div>
            <p className="mb-10">
              Sign in to access your account and start your journey with us.
            </p>
            <Link href="/login">
              <Button className="border-2 border-black rounded-full px-12 py-2 inline-block font-semibold hover:bg-black hover:text-white">
                Sign In
              </Button>
            </Link>
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
