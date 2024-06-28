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
      const res = await fetch("/api/signup", {
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
        setError(data.error);
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An unexpected error occurred");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-white">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <div className="bg-black rounded-2xl shadow-2xl flex w-2/3 max-w-4xl">
          <div className="w-3/5 p-5 text-white">
            <div className="text-left font-bold text-xl">
              T<span className="text-blue-900">A</span>F
            </div>
            <div className="py-10">
              <h2 className="text-3xl font-bold mb-2">Create an Account</h2>
              <div className="border-2 w-20 border-white inline-block mb-2"></div>
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
                className="flex flex-col items-center"
              >
                <div className="bg-gray-900 w-64 p-2 flex items-center mb-3">
                  <FaRegEnvelope className="text-gray-400 m-2" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-900 text-white outline-none flex-1"
                  />
                </div>
                <div className="bg-gray-900 w-64 p-2 flex items-center mb-3">
                  <MdLockOutline className="text-gray-400 m-2" />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-900 text-white outline-none flex-1"
                  />
                </div>
                <div className="bg-gray-900 w-64 p-2 flex items-center mb-3">
                  <FaRegEnvelope className="text-gray-400 m-2" />
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
                  className="border-2 border-white rounded-full px-12 py-2 inline-block font-semibold hover:bg-white hover:text-black"
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
    </div>
  );
}
