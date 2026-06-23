"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { stripeConnectApi, PayoutStatus } from "@/lib/api";
import { FaCheckCircle } from "react-icons/fa";

const POLL_INTERVAL_MS = 2500;
const MAX_POLLS = 24; // ~60s total

export default function PayoutsReturnPage() {
  const [status, setStatus] = useState<PayoutStatus | null>(null);
  const [polls, setPolls] = useState(0);
  const [error, setError] = useState("");
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;

    const poll = async (attempt: number) => {
      if (cancelled.current) return;
      try {
        const next = await stripeConnectApi.getStatus();
        setStatus(next);
        setPolls(attempt);
        if (next.payoutsEnabled) return;
        if (attempt >= MAX_POLLS) return;
        setTimeout(() => poll(attempt + 1), POLL_INTERVAL_MS);
      } catch (err: any) {
        setError(err?.message || "Failed to check status.");
      }
    };

    poll(1);
    return () => {
      cancelled.current = true;
    };
  }, []);

  const ready = !!status?.payoutsEnabled;
  const exhausted = polls >= MAX_POLLS;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      {/* Dark header */}
      <div className="bg-[#090D21] pt-20 pb-16 px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-20 w-64 h-64 bg-indigo-600 rounded-full opacity-10 blur-3xl" />
          <div className="absolute bottom-0 left-10 w-64 h-64 bg-emerald-600 rounded-full opacity-10 blur-3xl" />
        </div>
        <div className="max-w-lg mx-auto relative z-10">
          <h1 className="text-4xl font-extrabold text-white mb-1">
            {ready ? "You're all set!" : exhausted ? "Almost there" : "Setting up..."}
          </h1>
          <p className="text-gray-300 text-sm">
            {ready
              ? "Your bank is connected and ready to receive payments."
              : exhausted
                ? "Stripe is still verifying your details."
                : "Stripe is finishing up. This usually takes less than a minute."}
          </p>
        </div>
      </div>

      <main className="px-4 max-w-lg mx-auto pb-12 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">

          {ready ? (
            <>
              <div className="w-20 h-20 mx-auto rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 text-4xl mb-5">
                <FaCheckCircle />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Bank connected!</h2>
              <p className="text-sm text-gray-500 mb-6">
                You can now receive payments for every task you complete. Head to the marketplace and start helping.
              </p>
              <div className="flex flex-col gap-2">
                <Link href="/marketplace">
                  <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl text-base shadow-lg transition-all hover:scale-[1.02]">
                    Browse Marketplace
                  </button>
                </Link>
                <Link href="/payouts">
                  <button className="w-full border border-gray-200 text-gray-600 font-medium py-3 rounded-xl text-sm hover:bg-gray-50 transition-all">
                    Manage Payouts
                  </button>
                </Link>
              </div>
            </>
          ) : exhausted ? (
            <>
              <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-100 flex items-center justify-center text-amber-500 text-4xl mb-5">
                ⏳
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Verification pending</h2>
              <p className="text-sm text-gray-500 mb-6">
                Stripe sometimes takes a few minutes — or may ask for an ID photo — before enabling payouts. We&apos;ll notify you once you&apos;re approved.
              </p>
              <div className="flex flex-col gap-2">
                <Link href="/payouts">
                  <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl text-base shadow-lg transition-all hover:scale-[1.02]">
                    Check Status
                  </button>
                </Link>
                <Link href="/marketplace">
                  <button className="w-full border border-gray-200 text-gray-600 font-medium py-3 rounded-xl text-sm hover:bg-gray-50 transition-all">
                    Back to Marketplace
                  </button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 mx-auto rounded-2xl bg-indigo-50 flex items-center justify-center mb-5">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying your details</h2>
              <p className="text-sm text-gray-500">
                Stripe is finishing up. This usually takes less than a minute.
              </p>
              {error && (
                <p className="mt-4 text-sm text-red-600">{error}</p>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
