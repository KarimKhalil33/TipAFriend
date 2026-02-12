"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import {
  FaShieldAlt,
  FaBolt,
  FaUsers,
  FaRegCheckCircle,
  FaStar,
  FaThumbsUp,
} from "react-icons/fa";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white text-gray-900">
      {/* Subtle Wave Background */}
      <div
        className="absolute inset-0 z-0"
        style={{ height: "100%", minHeight: "100vh" }}
      >
        {/* Gentle flowing waves */}
        <svg
          className="absolute top-0 left-0 w-full opacity-15"
          height="100%"
          viewBox="0 0 1000 1000"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          style={{ height: "100%", minHeight: "100vh" }}
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
          <path
            d="M0,900 Q250,800 500,900 T1000,900 L1000,700 Q750,800 500,700 T0,700 Z"
            fill="currentColor"
            className="text-gray-400"
          />
          <path
            d="M0,1000 Q250,950 500,1000 T1000,1000 L1000,900 Q750,950 500,900 T0,900 Z"
            fill="currentColor"
            className="text-gray-300"
          />
        </svg>

        {/* Additional repeating pattern for extended content */}
        <svg
          className="absolute top-0 left-0 w-full opacity-10"
          height="200%"
          viewBox="0 0 1000 2000"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          style={{ height: "200%" }}
        >
          <path
            d="M0,1200 Q250,1100 500,1200 T1000,1200 L1000,1000 Q750,1100 500,1000 T0,1000 Z"
            fill="currentColor"
            className="text-gray-300"
          />
          <path
            d="M0,1500 Q250,1400 500,1500 T1000,1500 L1000,1200 Q750,1300 500,1200 T0,1200 Z"
            fill="currentColor"
            className="text-gray-400"
          />
          <path
            d="M0,1800 Q250,1700 500,1800 T1000,1800 L1000,1500 Q750,1600 500,1500 T0,1500 Z"
            fill="currentColor"
            className="text-gray-300"
          />
          <path
            d="M0,2000 Q250,1950 500,2000 T1000,2000 L1000,1800 Q750,1900 500,1800 T0,1800 Z"
            fill="currentColor"
            className="text-gray-400"
          />
        </svg>
      </div>
      <Navbar />
      <main className="relative z-10 flex flex-col items-center justify-center pt-20 px-8 text-center pb-8">
        {/* Hero + Features Combined Section */}
        <section className="w-full max-w-7xl mx-auto mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            {/* Main Hero */}
            <div
              className="lg:col-span-2 animate-fade-in-down rounded-3xl shadow-2xl p-12 transform hover:scale-105 transition-transform duration-500"
              style={{ backgroundColor: "rgb(9, 13, 33)" }}
            >
              <h2 className="text-4xl font-bold mb-3 text-white">Welcome to</h2>
              <h1 className="text-5xl font-extrabold mb-6 text-white">
                Tip <span className="text-white"> A </span> Friend
              </h1>
              <p className="text-lg mb-8 text-gray-300">
                Create and accept tasks from friends and get paid. Whether it's
                cleaning dishes, picking up a pet, or cooking a meal, Tip A
                Friend is here to make your life easier.
              </p>
              <Link href="/signup">
                <Button className="bg-gray-900 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:opacity-90">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Quick Features - Staggered */}
            <div className="space-y-6">
              <div
                className="text-white p-6 rounded-2xl shadow-xl transform transition duration-300 ease-in-out hover:scale-105 animate-fade-in-right -rotate-2 hover:rotate-0"
                style={{
                  backgroundColor: "rgb(9, 13, 33)",
                  marginLeft: "10px",
                }}
              >
                <h3 className="text-xl font-bold mb-2 text-white">
                  Easy to Use
                </h3>
                <p className="text-sm text-gray-300">
                  User-friendly interface for quick task management
                </p>
              </div>
              <div
                className="text-white p-6 rounded-2xl shadow-xl transform transition duration-300 ease-in-out hover:scale-105 animate-fade-in-right rotate-1 hover:rotate-0"
                style={{
                  backgroundColor: "rgb(9, 13, 33)",
                  marginRight: "15px",
                  animationDelay: "0.2s",
                }}
              >
                <h3 className="text-xl font-bold mb-2 text-white">
                  Secure Payments
                </h3>
                <p className="text-sm text-gray-300">
                  Trusted payment gateways for safe transactions
                </p>
              </div>
              <div
                className="text-white p-6 rounded-2xl shadow-xl transform transition duration-300 ease-in-out hover:scale-105 animate-fade-in-right -rotate-1 hover:rotate-0"
                style={{
                  backgroundColor: "rgb(9, 13, 33)",
                  marginLeft: "20px",
                  animationDelay: "0.4s",
                }}
              >
                <h3 className="text-xl font-bold mb-2 text-white">
                  Real-Time Updates
                </h3>
                <p className="text-sm text-gray-300">
                  Instant notifications on task progress
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How to Use TAF Section */}
        <section className="w-full max-w-7xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-800">
              How to Use TAF
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started with Tip A Friend in just a few simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div
              className="text-center p-8 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300 animate-fade-in-up"
              style={{ backgroundColor: "rgb(9, 13, 33)" }}
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-gray-800">1</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">Sign Up</h3>
              <p className="text-gray-300">
                Create your account and build your profile to get started with
                the community
              </p>
            </div>

            {/* Step 2 */}
            <div
              className="text-center p-8 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300 animate-fade-in-up"
              style={{
                backgroundColor: "rgb(9, 13, 33)",
                animationDelay: "0.1s",
              }}
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-gray-800">2</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">Add Friends</h3>
              <p className="text-gray-300">
                Connect with your friends to create a trusted network for task
                sharing
              </p>
            </div>

            {/* Step 3 */}
            <div
              className="text-center p-8 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300 animate-fade-in-up"
              style={{
                backgroundColor: "rgb(9, 13, 33)",
                animationDelay: "0.2s",
              }}
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-gray-800">3</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">
                Create Tasks
              </h3>
              <p className="text-gray-300">
                Post tasks you need help with or browse tasks from friends you
                can complete
              </p>
            </div>

            {/* Step 4 */}
            <div
              className="text-center p-8 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300 animate-fade-in-up"
              style={{
                backgroundColor: "rgb(9, 13, 33)",
                animationDelay: "0.3s",
              }}
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-gray-800">4</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">Get Paid</h3>
              <p className="text-gray-300">
                Complete tasks and earn money, or pay friends for helping you
                out
              </p>
            </div>
          </div>

          {/* Additional Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div
              className="p-8 rounded-2xl shadow-xl transform rotate-1 hover:rotate-0 transition-all duration-300"
              style={{ backgroundColor: "rgb(9, 13, 33)" }}
            >
              <FaRegCheckCircle className="text-4xl text-white mb-4" />
              <h3 className="text-2xl font-bold mb-4 text-white">
                Task Examples
              </h3>
              <ul className="text-gray-300 space-y-2">
                <li>• Cleaning dishes - $15</li>
                <li>• Pet pickup from vet - $25</li>
                <li>• Grocery shopping - $20</li>
                <li>• House sitting - $40</li>
                <li>• Cooking a meal - $30</li>
              </ul>
            </div>

            <div
              className="p-8 rounded-2xl shadow-xl transform -rotate-1 hover:rotate-0 transition-all duration-300"
              style={{ backgroundColor: "rgb(9, 13, 33)" }}
            >
              <FaShieldAlt className="text-4xl text-white mb-4" />
              <h3 className="text-2xl font-bold mb-4 text-white">
                Safety Features
              </h3>
              <ul className="text-gray-300 space-y-2">
                <li>• Friends-only network</li>
                <li>• Secure payment processing</li>
                <li>• Task completion tracking</li>
                <li>• Review and rating system</li>
                <li>• 24/7 support available</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Mission + Benefits Combined */}
        <section className="w-full max-w-7xl mx-auto mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Mission Statement - Larger with tilt */}
            <div
              className="lg:col-span-2 rounded-3xl p-10 shadow-2xl transform hover:scale-105 transition-transform duration-500 animate-fade-in-left"
              style={{ backgroundColor: "rgb(9, 13, 33)" }}
            >
              <h2 className="text-4xl font-bold mb-6 text-white">
                Our Mission
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg">
                Our mission is to create an application where users can create
                friend connections that interact with one another by creating or
                accepting paid tasks. Whether it's cleaning dishes for $x,
                picking up a pet from the vet for $x, or any other task, Tip A
                Friend makes it possible.
              </p>
            </div>

            {/* Benefits Grid - Staggered Heights */}
            <div className="lg:col-span-3">
              <h2 className="text-4xl font-bold mb-10 text-gray-800 text-center">
                Why Tip A Friend?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  className="text-white p-8 rounded-2xl shadow-xl transform -rotate-1 hover:rotate-0 transition-all duration-300 animate-fade-in-up"
                  style={{
                    backgroundColor: "rgb(9, 13, 33)",
                    marginTop: "0px",
                  }}
                >
                  <h3 className="text-xl font-bold mb-3 text-white">
                    More Safety
                  </h3>
                  <p className="text-gray-300">
                    Only interact with trusted friends, ensuring a safer
                    experience.
                  </p>
                </div>
                <div
                  className="text-white p-8 rounded-2xl shadow-xl transform rotate-1 hover:rotate-0 transition-all duration-300 animate-fade-in-up"
                  style={{
                    backgroundColor: "rgb(9, 13, 33)",
                    marginTop: "20px",
                    animationDelay: "0.1s",
                  }}
                >
                  <h3 className="text-xl font-bold mb-3 text-white">
                    More Enjoyable
                  </h3>
                  <p className="text-gray-300">
                    Engage in tasks with friends, making the experience more
                    enjoyable.
                  </p>
                </div>
                <div
                  className="text-white p-8 rounded-2xl shadow-xl transform rotate-2 hover:rotate-0 transition-all duration-300 animate-fade-in-up"
                  style={{
                    backgroundColor: "rgb(9, 13, 33)",
                    marginTop: "10px",
                    animationDelay: "0.2s",
                  }}
                >
                  <h3 className="text-xl font-bold mb-3 text-white">
                    More Interactive
                  </h3>
                  <p className="text-gray-300">
                    Create and accept tasks in a dynamic and interactive way.
                  </p>
                </div>
                <div
                  className="text-white p-8 rounded-2xl shadow-xl transform -rotate-2 hover:rotate-0 transition-all duration-300 animate-fade-in-up"
                  style={{
                    backgroundColor: "rgb(9, 13, 33)",
                    marginTop: "30px",
                    animationDelay: "0.3s",
                  }}
                >
                  <h3 className="text-xl font-bold mb-3 text-white">
                    Friends' Rates
                  </h3>
                  <p className="text-gray-300">
                    Benefit from friends' rates, making tasks more affordable.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full py-6 px-8 flex justify-between items-center bg-white bg-opacity-95 shadow-lg mt-8 backdrop-filter backdrop-blur-lg relative z-20">
        <div className="text-sm text-gray-600">
          &copy; 2024 Tip A Friend. All rights reserved.
        </div>
        <nav className="space-x-6 text-sm">
          <Link href="/privacy">
            <span className="hover:text-blue-600 cursor-pointer transition duration-300 ease-in-out text-gray-700">
              Privacy Policy
            </span>
          </Link>
          <Link href="/terms">
            <span className="hover:text-blue-600 cursor-pointer transition duration-300 ease-in-out text-gray-700">
              Terms of Service
            </span>
          </Link>
          <Link href="/contact">
            <span className="hover:text-blue-600 cursor-pointer transition duration-300 ease-in-out text-gray-700">
              Contact Us
            </span>
          </Link>
        </nav>
      </footer>
      <style jsx>{`
        .animate-fade-in-down {
          animation: fadeInDown 1s ease-out;
        }
        .animate-fade-in-up {
          animation: fadeInUp 1s ease-out;
        }
        .animate-fade-in-left {
          animation: fadeInLeft 1s ease-out;
        }
        .animate-fade-in-right {
          animation: fadeInRight 1s ease-out;
        }
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
