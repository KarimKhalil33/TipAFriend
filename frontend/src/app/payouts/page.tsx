"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  ApiError,
  PayoutStatus,
  stripeConnectApi,
} from "@/lib/api";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaExternalLinkAlt,
  FaSyncAlt,
  FaUniversity,
} from "react-icons/fa";

export default function PayoutsPage() {
  const [status, setStatus] = useState<PayoutStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  const refreshStatus = async () => {
    try {
      setError("");
      const next = await stripeConnectApi.getStatus();
      setStatus(next);
    } catch (err: any) {
      const e = err as ApiError;
      if (e.status === 404) {
        setError(
          "Payouts are not enabled on the server yet. Ask the admin to ship the Stripe Connect endpoints.",
        );
      } else {
        setError(e.message || "Failed to load payout status.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  const startOnboarding = async () => {
    setWorking(true);
    setError("");
    try {
      const { url } = await stripeConnectApi.createOnboardingLink();
      window.location.assign(url);
    } catch (err: any) {
      setError(err?.message || "Couldn't start Stripe onboarding.");
      setWorking(false);
    }
  };

  const openDashboard = async () => {
    setWorking(true);
    setError("");
    try {
      const { url } = await stripeConnectApi.createDashboardLink();
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err: any) {
      setError(err?.message || "Couldn't open Stripe dashboard.");
    } finally {
      setWorking(false);
    }
  };

  const ready = !!status?.payoutsEnabled;
  const inProgress =
    !!status?.hasAccount && !ready && !!status?.detailsSubmitted;

  const primaryLabel = ready
    ? "Manage payouts on Stripe"
    : inProgress
      ? working
        ? "Opening Stripe..."
        : "Finish on Stripe"
      : working
        ? "Opening Stripe..."
        : "Connect bank";

  const primaryAction = ready ? openDashboard : startOnboarding;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white text-gray-900">
      <Navbar />
      <main className="max-w-md mx-auto px-4 pt-6 pb-10">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm"
        >
          <FaArrowLeft />
          Back to Profile
        </Link>

        <div className="flex items-center gap-3 mb-1">
          <FaUniversity className="text-blue-600 text-2xl" />
          <h1 className="text-2xl font-bold">Get paid</h1>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Connect a bank once. Stripe handles the rest.
        </p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 text-sm text-gray-500">
            Checking your payout status...
          </div>
        ) : (
          <div className="space-y-4">
            {/* Compact status pill */}
            <div
              className={`rounded-2xl px-4 py-3 text-sm flex items-center gap-2 border ${
                ready
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : inProgress
                    ? "bg-amber-50 border-amber-200 text-amber-800"
                    : "bg-gray-50 border-gray-200 text-gray-700"
              }`}
            >
              {ready && <FaCheckCircle className="shrink-0" />}
              <span className="flex-1">
                {ready
                  ? "Payouts are active. You're ready to receive money."
                  : inProgress
                    ? "Stripe is reviewing your details. This usually takes a minute."
                    : "Not connected yet."}
              </span>
              <button
                onClick={refreshStatus}
                disabled={working}
                title="Refresh status"
                className="text-gray-500 hover:text-gray-900 disabled:opacity-50"
              >
                <FaSyncAlt className="text-xs" />
              </button>
            </div>

            {/* Single primary action */}
            <Button
              onClick={primaryAction}
              disabled={working}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold text-base"
            >
              {ready && <FaExternalLinkAlt className="inline mr-2 text-xs" />}
              {primaryLabel}
            </Button>

            {/* Tiny disclosure — nothing in the user's way */}
            {!ready && (
              <details className="text-xs text-gray-500 px-1">
                <summary className="cursor-pointer hover:text-gray-700 select-none">
                  What does Stripe ask for?
                </summary>
                <p className="mt-2 leading-relaxed">
                  Your name, date of birth, address, last 4 of your SIN/SSN,
                  and a bank account or debit card. This goes straight to
                  Stripe — TipAFriend never sees or stores it.
                </p>
              </details>
            )}

            {/* Only show requirements if Stripe is actively asking for something */}
            {status?.requirementsDue && status.requirementsDue.length > 0 && (
              <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="font-medium mb-1">Stripe still needs:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {status.requirementsDue.slice(0, 5).map((r) => (
                    <li key={r}>{r.replace(/_/g, " ")}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

