"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaShieldAlt, FaBolt, FaUsers, FaRegCheckCircle } from "react-icons/fa";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
      <header className="w-full py-6 px-12 flex justify-between items-center bg-black shadow-md mb-12">
        <div className="text-2xl font-bold tracking-wide">
          T<span className="text-blue-500">A</span>F
        </div>
        <nav className="space-x-6">
          <Link href="/login">
            <span className="hover:text-blue-500 cursor-pointer transition duration-300 ease-in-out">
              Login
            </span>
          </Link>
          <Link href="/signup">
            <span className="hover:text-blue-500 cursor-pointer transition duration-300 ease-in-out">
              Sign Up
            </span>
          </Link>
        </nav>
      </header>
      <main className="flex flex-col items-center justify-center flex-1 px-20 text-center">
        <section className="animate-fade-in-down">
          <h2 className="text-6xl font-extrabold mb-6 text-blue-500">
            Welcome to
          </h2>
          <h1 className="text-6xl font-extrabold mb-6">
            Tip <span className="text-blue-500"> A </span> Friend
          </h1>
          <p className="text-xl mb-12 max-w-xl mx-auto text-gray-300">
            Create and accept tasks from friends and get paid. Whether it's
            cleaning dishes, picking up a pet, or cooking a meal, Tip A Friend
            is here to make your life easier.
          </p>
          <Link href="/signup">
            <Button className="mb-8 bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105">
              Get Started
            </Button>
          </Link>
        </section>
        <section className="w-full mt-16">
          <h2 className="text-4xl font-bold mb-6 animate-fade-in-up text-blue-500">
            Features
          </h2>
          <div className="flex justify-around flex-wrap gap-6">
            <div className="bg-gray-800 text-white p-8 rounded-xl shadow-lg max-w-xs transform transition duration-300 ease-in-out hover:scale-105 animate-fade-in-left">
              <h3 className="text-2xl font-bold mb-4">Easy to Use</h3>
              <p>
                Create tasks easily and manage them with a user-friendly
                interface.
              </p>
            </div>
            <div className="bg-gray-800 text-white p-8 rounded-xl shadow-lg max-w-xs transform transition duration-300 ease-in-out hover:scale-105 animate-fade-in-up">
              <h3 className="text-2xl font-bold mb-4">Secure Payments</h3>
              <p>Use trusted payment gateways to ensure safe transactions.</p>
            </div>
            <div className="bg-gray-800 text-white p-8 rounded-xl shadow-lg max-w-xs transform transition duration-300 ease-in-out hover:scale-105 animate-fade-in-right">
              <h3 className="text-2xl font-bold mb-4">Real-Time Updates</h3>
              <p>Receive notifications and updates on your tasks instantly.</p>
            </div>
          </div>
        </section>
        <section className="w-full mt-16 animate-fade-in-up">
          <h2 className="text-4xl font-bold mb-6 text-blue-500">
            Why Choose Us?
          </h2>
          <div className="flex justify-around flex-wrap gap-6">
            <div className="bg-gray-800 text-white p-8 rounded-xl shadow-lg max-w-xs transform transition duration-300 ease-in-out hover:scale-105">
              <FaShieldAlt className="text-blue-500 text-4xl mb-4" />
              <h3 className="text-2xl font-bold mb-4">Secure</h3>
              <p>
                Top-notch security protocols to protect your data and
                transactions.
              </p>
            </div>
            <div className="bg-gray-800 text-white p-8 rounded-xl shadow-lg max-w-xs transform transition duration-300 ease-in-out hover:scale-105">
              <FaBolt className="text-blue-500 text-4xl mb-4" />
              <h3 className="text-2xl font-bold mb-4">Fast</h3>
              <p>
                Experience lightning-fast transactions and real-time updates.
              </p>
            </div>
            <div className="bg-gray-800 text-white p-8 rounded-xl shadow-lg max-w-xs transform transition duration-300 ease-in-out hover:scale-105">
              <FaUsers className="text-blue-500 text-4xl mb-4" />
              <h3 className="text-2xl font-bold mb-4">Community</h3>
              <p>
                Join a growing community of users who trust Tip A Friend for
                their tasks.
              </p>
            </div>
          </div>
        </section>
        <section className="w-full mt-16 bg-black py-12 animate-fade-in-up">
          <h2 className="text-4xl font-bold mb-6 text-blue-500">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8">
            <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg transform transition duration-300 ease-in-out hover:scale-105">
              <FaRegCheckCircle className="text-blue-500 text-4xl mb-4" />
              <h3 className="text-2xl font-bold mb-4">1. Sign Up</h3>
              <p>
                Create an account quickly and easily with our user-friendly
                registration process.
              </p>
            </div>
            <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg transform transition duration-300 ease-in-out hover:scale-105">
              <FaRegCheckCircle className="text-blue-500 text-4xl mb-4" />
              <h3 className="text-2xl font-bold mb-4">2. Connect</h3>
              <p>
                Connect with your friends and start sending and receiving tasks
                effortlessly.
              </p>
            </div>
            <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg transform transition duration-300 ease-in-out hover:scale-105">
              <FaRegCheckCircle className="text-blue-500 text-4xl mb-4" />
              <h3 className="text-2xl font-bold mb-4">3. Enjoy</h3>
              <p>
                Enjoy the seamless experience of managing tasks with your
                friends.
              </p>
            </div>
          </div>
        </section>
        <section className="w-full mt-16 animate-fade-in-up">
          <h2 className="text-4xl font-bold mb-6 text-blue-500">Our Mission</h2>
          <p className="text-xl max-w-3xl mx-auto text-gray-300">
            Our mission is to create an application where users can create
            friend connections that interact with one another by creating or
            accepting paid tasks. Whether it's cleaning dishes for $x, picking
            up a pet from the vet for $x, or any other task, Tip A Friend makes
            it possible.
          </p>
        </section>
        <section className="w-full mt-16 animate-fade-in-up">
          <h2 className="text-4xl font-bold mb-6 text-blue-500">
            Why Tip A Friend?
          </h2>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-800 text-white p-8 rounded-lg shadow-lg transform transition duration-300 ease-in-out hover:scale-105">
              <h3 className="text-2xl font-bold mb-4">More Safety</h3>
              <p>
                Only interact with trusted friends, ensuring a safer experience.
              </p>
            </div>
            <div className="bg-gray-800 text-white p-8 rounded-lg shadow-lg transform transition duration-300 ease-in-out hover:scale-105">
              <h3 className="text-2xl font-bold mb-4">More Enjoyable</h3>
              <p>
                Engage in tasks with friends, making the experience more
                enjoyable.
              </p>
            </div>
            <div className="bg-gray-800 text-white p-8 rounded-lg shadow-lg transform transition duration-300 ease-in-out hover:scale-105">
              <h3 className="text-2xl font-bold mb-4">More Interactive</h3>
              <p>Create and accept tasks in a dynamic and interactive way.</p>
            </div>
            <div className="bg-gray-800 text-white p-8 rounded-lg shadow-lg transform transition duration-300 ease-in-out hover:scale-105">
              <h3 className="text-2xl font-bold mb-4">Friends' Rates</h3>
              <p>Benefit from friends' rates, making tasks more affordable.</p>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full py-6 px-12 flex justify-between items-center bg-black shadow-md mt-16">
        <div className="text-sm">
          &copy; 2024 Tip A Friend. All rights reserved.
        </div>
        <nav className="space-x-6 text-sm">
          <Link href="/privacy">
            <span className="hover:text-blue-500 cursor-pointer transition duration-300 ease-in-out">
              Privacy Policy
            </span>
          </Link>
          <Link href="/terms">
            <span className="hover:text-blue-500 cursor-pointer transition duration-300 ease-in-out">
              Terms of Service
            </span>
          </Link>
          <Link href="/contact">
            <span className="hover:text-blue-500 cursor-pointer transition duration-300 ease-in-out">
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
