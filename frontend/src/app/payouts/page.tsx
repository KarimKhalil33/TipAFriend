"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ApiError, PayoutStatus, stripeConnectApi } from "@/lib/api";
import { FaArrowLeft, FaCheckCircle, FaExternalLinkAlt, FaSyncAlt, FaUniversity } from "react-icons/fa";

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
        setError("Payouts are not enabled on the server yet. Ask the admin to ship the Stripe Connect endpoints.");
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
  const inProgress = !!status?.hasAccount && !ready && !!status?.detailsSubmitted;

  const primaryLabel = ready
    ? "Manage payouts on Stripe"
    : inProgress
      ? working ? "Opening Stripe..." : "Finish on Stripe"
      : working ? "Opening Stripe..." : "Connect your bank";

  const primaryAction = ready ? openDashboard : startOnboarding;

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
          <Link href="/profile">
            <span className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors text-sm cursor-pointer w-fit">
              <FaArrowLeft className="text-xs" />
              Back to Profile
            </span>
          </Link>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <FaUniversity />
            </div>
            <h1 className="text-4xl font-extrabold text-white">Get paid</h1>
          </div>
          <p className="text-gray-300 text-sm mt-1">Connect a bank once. Stripe handles the rest.</p>
        </div>
      </div>

      <main className="px-4 max-w-lg mx-auto pb-12 -mt-6 relative z-10 space-y-4">

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            <p className="text-red-700 text-sm font-medium mb-0.5">Something went wrong</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="flex items-center gap-3 text-gray-400">
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Checking your payout status...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Status card */}
            <div className={`rounded-2xl px-5 py-4 border flex items-center gap-3 ${
              ready
                ? "bg-emerald-50 border-emerald-200"
                : inProgress
                  ? "bg-amber-50 border-amber-200"
                  : "bg-white border-gray-100 shadow-sm"
            }`}>
              {ready ? (
                <FaCheckCircle className="text-emerald-500 text-xl shrink-0" />
              ) : (
                <div className={`w-3 h-3 rounded-full shrink-0 ${inProgress ? "bg-amber-400" : "bg-gray-300"}`} />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${ready ? "text-emerald-800" : inProgress ? "text-amber-800" : "text-gray-700"}`}>
                  {ready
                    ? "Payouts active"
                    : inProgress
                      ? "Verification in progress"
                      : "Not connected yet"}
                </p>
                <p className={`text-xs mt-0.5 ${ready ? "text-emerald-700" : inProgress ? "text-amber-700" : "text-gray-500"}`}>
                  {ready
                    ? "You're ready to receive money from completed tasks."
                    : inProgress
                      ? "Stripe is reviewing your details. This usually takes a minute."
                      : "Connect a bank account to start receiving payments."}
                </p>
              </div>
              <button
                onClick={refreshStatus}
                disabled={working}
                title="Refresh status"
                className="text-gray-400 hover:text-gray-700 disabled:opacity-50 p-1.5 hover:bg-gray-100 rounded-lg transition-all"
              >
                <FaSyncAlt className="text-xs" />
              </button>
            </div>

            {/* Primary action */}
            <button
              onClick={primaryAction}
              disabled={working}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl text-base shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {ready && <FaExternalLinkAlt className="text-xs opacity-80" />}
              {primaryLabel}
            </button>

            {/* What does Stripe ask for */}
            {!ready && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">What to expect</p>
                <div className="space-y-2">
                  {[
                    "Your name and date of birth",
                    "Address and last 4 digits of your SIN/SSN",
                    "A bank account or debit card for deposits",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                        <svg className="w-2.5 h-2.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  This goes straight to Stripe — TipAFriend never sees or stores it.
                </p>
              </div>
            )}

            {/* Requirements due */}
            {status?.requirementsDue && status.requirementsDue.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-2">Stripe still needs</p>
                <ul className="space-y-1">
                  {status.requirementsDue.slice(0, 5).map((r) => (
                    <li key={r} className="flex items-center gap-2 text-sm text-amber-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      {r.replace(/_/g, " ")}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
