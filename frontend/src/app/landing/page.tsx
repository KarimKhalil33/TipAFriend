"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { healthApi } from "@/lib/api";
import {
  FaShieldAlt,
  FaBolt,
  FaUsers,
  FaRegCheckCircle,
  FaStar,
  FaMoneyBillWave,
  FaHandshake,
  FaLock,
} from "react-icons/fa";

export default function LandingPage() {
  const [apiHealthy, setApiHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    const checkHealth = async () => {
      try {
        const response = await healthApi.check();
        if (mounted) {
          const status = response?.status?.toLowerCase();
          setApiHealthy(status === "ok" || status === "up");
        }
      } catch {
        if (mounted) setApiHealthy(false);
      }
    };

    checkHealth();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#090D21] text-white">
        {/* Glow orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-16 left-16 w-80 h-80 bg-indigo-600 rounded-full opacity-10 blur-3xl" />
          <div className="absolute bottom-16 right-16 w-96 h-96 bg-purple-600 rounded-full opacity-10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-900 rounded-full opacity-5 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-8 pt-28 pb-28 text-center">
          {/* Status pill */}
          <div className="flex justify-center mb-8">
            <span
              className={`inline-flex items-center gap-2 text-xs px-4 py-2 rounded-full border backdrop-blur-sm ${
                apiHealthy === null
                  ? "text-gray-300 border-gray-600 bg-gray-800/30"
                  : apiHealthy
                    ? "text-emerald-300 border-emerald-500/40 bg-emerald-900/20"
                    : "text-red-300 border-red-500/40 bg-red-900/20"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  apiHealthy === null
                    ? "bg-gray-400"
                    : apiHealthy
                      ? "bg-emerald-400 animate-pulse"
                      : "bg-red-400"
                }`}
              />
              {apiHealthy === null
                ? "Connecting..."
                : apiHealthy
                  ? "All systems operational"
                  : "Service disrupted"}
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
            Help friends.
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Get tipped.
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Tip A Friend is the social platform where you post tasks, your
            friends complete them, and everyone gets paid. From grocery runs to
            pet pickups — it&apos;s help, with a tip.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-4 px-10 rounded-xl text-lg shadow-lg transition-all duration-300 hover:scale-105">
                Get Started Free
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 font-semibold py-4 px-10 rounded-xl text-lg transition-all duration-300 bg-white/5"
              >
                Sign In
              </Button>
            </Link>
          </div>

          {/* Trust pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-12">
            {[
              "Friends-only network",
              "Secure payments",
              "Real-time updates",
              "Review system",
            ].map((pill) => (
              <span
                key={pill}
                className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 border border-white/10 px-4 py-2 rounded-full"
              >
                <FaRegCheckCircle className="text-emerald-400 text-xs" />
                {pill}
              </span>
            ))}
          </div>
        </div>

        {/* Wave divider */}
        <svg
          viewBox="0 0 1440 80"
          className="w-full"
          preserveAspectRatio="none"
          height="80"
        >
          <path d="M0,40 Q360,80 720,40 T1440,40 L1440,80 L0,80 Z" fill="white" />
        </svg>
      </section>

      {/* How It Works */}
      <section className="py-24 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-indigo-600 tracking-widest uppercase">
              Simple process
            </span>
            <h2 className="text-4xl font-bold mt-2 text-gray-900">
              How it works
            </h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto">
              Get started in minutes and begin earning or getting help from your
              friends
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-11 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 z-0" />

            {[
              {
                step: "01",
                title: "Sign Up",
                desc: "Create your account and build your profile in seconds",
              },
              {
                step: "02",
                title: "Add Friends",
                desc: "Connect with people you trust to form your network",
              },
              {
                step: "03",
                title: "Post or Browse",
                desc: "Create tasks you need done or pick up tasks from friends",
              },
              {
                step: "04",
                title: "Get Paid",
                desc: "Complete tasks and earn, or pay friends who help you out",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative z-10 text-center group">
                <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-100 group-hover:shadow-indigo-200 group-hover:scale-110 transition-all duration-300">
                  <span className="text-2xl font-bold text-white">{step}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-indigo-600 tracking-widest uppercase">
              Why choose us
            </span>
            <h2 className="text-4xl font-bold mt-2 text-gray-900">
              Everything you need
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: FaLock,
                color: "bg-blue-50 text-blue-600",
                title: "Friends-Only Safety",
                desc: "Only interact with people you trust. No strangers, no uncertainty — just your real friend circle.",
              },
              {
                icon: FaMoneyBillWave,
                color: "bg-emerald-50 text-emerald-600",
                title: "Secure Payments",
                desc: "Powered by trusted payment gateways. Your money is protected every step of the way.",
              },
              {
                icon: FaBolt,
                color: "bg-purple-50 text-purple-600",
                title: "Instant Notifications",
                desc: "Real-time updates on task status, payment confirmations, and friend requests.",
              },
              {
                icon: FaHandshake,
                color: "bg-orange-50 text-orange-600",
                title: "Friend Rates",
                desc: "Affordable prices between friends. No inflated marketplace fees or stranger markups.",
              },
              {
                icon: FaStar,
                color: "bg-yellow-50 text-yellow-600",
                title: "Reviews & Ratings",
                desc: "Build your reputation with a transparent review system from people you actually know.",
              },
              {
                icon: FaUsers,
                color: "bg-pink-50 text-pink-600",
                title: "Community First",
                desc: "Built for real human connections — strengthen bonds while getting things done together.",
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div
                key={title}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300 group hover:-translate-y-1"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="text-xl" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Task Examples + CTA */}
      <section className="py-24 px-8 bg-[#090D21] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-700 rounded-full opacity-10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-700 rounded-full opacity-10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Task examples */}
            <div>
              <span className="text-sm font-semibold text-indigo-400 tracking-widest uppercase">
                Real examples
              </span>
              <h2 className="text-4xl font-bold mt-2 mb-8">
                Tasks people are posting
              </h2>
              <div className="space-y-3">
                {[
                  {
                    task: "Cleaning dishes",
                    price: "$15",
                    color:
                      "from-indigo-500/20 to-indigo-500/5 border-indigo-500/20",
                  },
                  {
                    task: "Pet pickup from vet",
                    price: "$25",
                    color:
                      "from-purple-500/20 to-purple-500/5 border-purple-500/20",
                  },
                  {
                    task: "Grocery shopping",
                    price: "$20",
                    color: "from-pink-500/20 to-pink-500/5 border-pink-500/20",
                  },
                  {
                    task: "House sitting",
                    price: "$40",
                    color:
                      "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20",
                  },
                  {
                    task: "Cooking a meal",
                    price: "$30",
                    color: "from-blue-500/20 to-blue-500/5 border-blue-500/20",
                  },
                ].map(({ task, price, color }) => (
                  <div
                    key={task}
                    className={`flex justify-between items-center px-5 py-4 rounded-xl bg-gradient-to-r border ${color}`}
                  >
                    <span className="text-gray-200">{task}</span>
                    <span className="font-bold text-white bg-white/10 px-3 py-1 rounded-lg text-sm">
                      {price}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="text-center lg:text-left">
              <h2 className="text-5xl font-extrabold mb-6 leading-tight">
                Ready to start
                <br />
                <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  earning?
                </span>
              </h2>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                Join your friends on Tip A Friend. Post your first task or
                accept one from someone you trust. It&apos;s free to join.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/signup">
                  <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-4 px-10 rounded-xl text-lg shadow-lg transition-all duration-300 hover:scale-105">
                    Join for Free
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 font-semibold py-4 px-10 rounded-xl text-lg transition-all duration-300 bg-white/5"
                  >
                    I have an account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 px-8 flex flex-col sm:flex-row justify-between items-center bg-white border-t border-gray-100">
        <div className="text-sm text-gray-400 mb-4 sm:mb-0">
          &copy; 2024 Tip A Friend. All rights reserved.
        </div>
        <nav className="flex gap-6 text-sm">
          <Link href="/privacy">
            <span className="text-gray-400 hover:text-indigo-600 cursor-pointer transition duration-300">
              Privacy Policy
            </span>
          </Link>
          <Link href="/terms">
            <span className="text-gray-400 hover:text-indigo-600 cursor-pointer transition duration-300">
              Terms of Service
            </span>
          </Link>
          <Link href="/contact">
            <span className="text-gray-400 hover:text-indigo-600 cursor-pointer transition duration-300">
              Contact
            </span>
          </Link>
        </nav>
      </footer>
    </div>
  );
}
