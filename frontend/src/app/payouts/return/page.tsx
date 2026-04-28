"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { stripeConnectApi, PayoutStatus } from "@/lib/api";
import { FaCheckCircle, FaSpinner } from "react-icons/fa";

const POLL_INTERVAL_MS = 2500;
const MAX_POLLS = 24; // ~60s total

export default function PayoutsReturnPage() {
  const router = useRouter();
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
        if (next.payoutsEnabled) return; // done
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white text-gray-900">
      <Navbar />
      <main className="max-w-md mx-auto px-4 pt-12 pb-10 text-center">
        {ready ? (
          <>
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-3xl mb-4">
              <FaCheckCircle />
            </div>
            <h1 className="text-2xl font-bold">You&apos;re all set!</h1>
            <p className="text-sm text-gray-600 mt-2">
              Your bank is connected. You can now receive payments for
              completed tasks.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Link href="/marketplace">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Go to Marketplace
                </Button>
              </Link>
              <Link href="/payouts">
                <Button variant="outline" className="w-full">
                  Manage payouts
                </Button>
              </Link>
            </div>
          </>
        ) : exhausted ? (
          <>
            <h1 className="text-2xl font-bold">Verification still pending</h1>
            <p className="text-sm text-gray-600 mt-2">
              Stripe sometimes takes a few minutes (or asks for an ID photo)
              before payouts are enabled. You can come back later — we&apos;ll
              email you when you&apos;re ready.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Link href="/payouts">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Check status
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button variant="outline" className="w-full">
                  Back to Marketplace
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl mb-4">
              <FaSpinner className="animate-spin" />
            </div>
            <h1 className="text-2xl font-bold">Verifying your details...</h1>
            <p className="text-sm text-gray-600 mt-2">
              Stripe is finishing up. This usually takes less than a minute.
            </p>
            {error && (
              <p className="mt-3 text-sm text-red-600">{error}</p>
            )}
            <p className="mt-4 text-xs text-gray-400">
              Attempt {polls}/{MAX_POLLS}
            </p>
          </>
        )}
      </main>
    </div>
  );
}
