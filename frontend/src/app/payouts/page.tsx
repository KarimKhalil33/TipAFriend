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
  FaExclamationTriangle,
  FaExternalLinkAlt,
  FaLock,
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
        // Backend not deployed yet
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
      // Stripe hosts the onboarding form; redirect the whole tab.
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
  const notStarted = !status?.hasAccount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white text-gray-900">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 pt-6 pb-10">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-sm"
        >
          <FaArrowLeft />
          Back to Profile
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FaUniversity className="text-blue-600" />
            Get Paid
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Connect your bank to receive money for completed tasks. Powered by
            Stripe.
          </p>
        </div>

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
            {/* Status card */}
            <div
              className={`border rounded-2xl p-5 ${
                ready
                  ? "bg-emerald-50 border-emerald-200"
                  : inProgress
                    ? "bg-amber-50 border-amber-200"
                    : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 text-2xl ${
                    ready
                      ? "text-emerald-600"
                      : inProgress
                        ? "text-amber-600"
                        : "text-gray-400"
                  }`}
                >
                  {ready ? <FaCheckCircle /> : <FaExclamationTriangle />}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-900">
                    {ready
                      ? "Payouts active"
                      : inProgress
                        ? "Verification in progress"
                        : "Payouts not set up"}
                  </h2>
                  <p className="text-sm text-gray-700 mt-1">
                    {ready
                      ? "You can receive payments. Funds land in your linked bank account, usually within 2 business days."
                      : inProgress
                        ? "Stripe is reviewing your details. This usually finishes in a few minutes. Refresh below to check again."
                        : "Until you set this up, people can't pay you for completed tasks."}
                  </p>

                  {status?.requirementsDue &&
                    status.requirementsDue.length > 0 && (
                      <div className="mt-3 text-xs text-amber-800">
                        <p className="font-medium">Stripe still needs:</p>
                        <ul className="list-disc list-inside">
                          {status.requirementsDue.slice(0, 5).map((r) => (
                            <li key={r}>{r.replace(/_/g, " ")}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {status?.disabledReason && (
                    <p className="mt-2 text-xs text-red-700">
                      Reason: {status.disabledReason.replace(/_/g, " ")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
              {notStarted && (
                <Button
                  onClick={startOnboarding}
                  disabled={working}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
                >
                  <FaLock className="inline mr-2 text-sm" />
                  {working ? "Redirecting to Stripe..." : "Set up payouts"}
                </Button>
              )}
              {inProgress && (
                <>
                  <Button
                    onClick={startOnboarding}
                    disabled={working}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
                  >
                    {working ? "Redirecting..." : "Continue Stripe onboarding"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={refreshStatus}
                    disabled={working}
                    className="w-full"
                  >
                    Refresh status
                  </Button>
                </>
              )}
              {ready && (
                <Button
                  onClick={openDashboard}
                  disabled={working}
                  variant="outline"
                  className="w-full"
                >
                  <FaExternalLinkAlt className="inline mr-2 text-xs" />
                  Open Stripe payout dashboard
                </Button>
              )}
            </div>

            {/* What to expect */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-900 mb-2">
                What you&apos;ll need
              </h3>
              <ul className="text-sm text-gray-700 space-y-1.5 list-disc list-inside">
                <li>Your legal name and date of birth</li>
                <li>Your address</li>
                <li>Last 4 digits of your SIN (Canada) or SSN (US)</li>
                <li>A bank account or debit card to deposit funds into</li>
              </ul>
              <p className="text-xs text-gray-500 mt-3">
                This information goes directly to Stripe, not to TipAFriend. We
                never see or store your bank details or government ID.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
