"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { ApiError, paymentsApi, Payment } from "@/lib/api";
import { loadStripe } from "@stripe/stripe-js";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { FaLock, FaCheckCircle, FaArrowLeft } from "react-icons/fa";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

function StripeConfirmForm({
  clientSecret,
  onSuccess,
  onError,
}: {
  clientSecret: string;
  onSuccess: () => Promise<void>;
  onError: (message: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const confirmPayment = async () => {
    if (!stripe || !elements) return;
    const card = elements.getElement(CardElement);
    if (!card) return;
    try {
      setProcessing(true);
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      });
      if (result.error) {
        onError(result.error.message || "Payment failed");
        return;
      }
      if (result.paymentIntent?.status === "succeeded") {
        await onSuccess();
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
        <CardElement options={{ hidePostalCode: true, style: { base: { fontSize: "15px", color: "#111827", "::placeholder": { color: "#9ca3af" } } } }} />
      </div>
      <button
        onClick={confirmPayment}
        disabled={processing || !stripe}
        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl text-base shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
      >
        <FaLock className="text-xs opacity-80" />
        {processing ? "Processing..." : "Confirm Payment"}
      </button>
      <p className="text-center text-xs text-gray-400">
        Secured by Stripe · Your card info never touches our servers
      </p>
    </div>
  );
}

export default function PaymentsPage() {
  const params = useSearchParams();

  const initial = useMemo(
    () => ({
      postId: Number(params.get("postId") || "0"),
      payeeId: Number(params.get("payeeId") || "0"),
      amount: Number(params.get("amount") || "0"),
      taskAssignmentId: Number(params.get("taskAssignmentId") || "0"),
    }),
    [params],
  );

  const [postId] = useState(initial.postId);
  const [payeeId] = useState(initial.payeeId);
  const [amount] = useState(initial.amount);
  const [status, setStatus] = useState("FAILED");
  const [payment, setPayment] = useState<Payment | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const hasPrefill = initial.postId > 0 || initial.payeeId > 0 || initial.amount > 0;
  const hasFullPrefill = initial.postId > 0 && initial.payeeId > 0 && initial.amount > 0;
  const canCreatePayment = postId > 0 && payeeId > 0 && amount > 0 && !payment?.id;
  const isPaid = payment?.status === "SUCCEEDED";
  const hasPublishableKey = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  const toFriendlyError = (message: string) => {
    const text = (message || "").toLowerCase();
    if (!text || text.includes("unexpected error")) return "We couldn't start payment right now. Please try again in a moment.";
    if (text.includes("unauthorized") || text.includes("forbidden")) return "Your session expired. Please log in again and retry.";
    if (text.includes("not found")) return "This payment task could not be found. Please go back and click Pay again.";
    if (text.includes("amount")) return "Payment amount is invalid. Please refresh and try again.";
    return message;
  };

  useEffect(() => {
    const loadExistingPayment = async () => {
      if (initial.taskAssignmentId <= 0) return;
      try {
        setLoading(true);
        const existing = await paymentsApi.getPaymentByTask(initial.taskAssignmentId);
        if (existing?.id) {
          if (existing.status !== "SUCCEEDED") {
            try {
              const synced = await paymentsApi.syncPayment(existing.id);
              setPayment(synced);
              if (synced.status === "SUCCEEDED") setSuccess("Payment already confirmed.");
              return;
            } catch {}
          }
          setPayment(existing);
          if (existing.status === "SUCCEEDED") setSuccess("Payment already complete.");
        }
      } catch (err: any) {
        const typedError = err as ApiError;
        if (typedError.code !== "PAYMENT_NOT_FOUND" && typedError.code !== "NOT_FOUND") {
          setError(toFriendlyError(typedError.message || ""));
        }
      } finally {
        setLoading(false);
      }
    };
    loadExistingPayment();
  }, [initial.taskAssignmentId]);

  const createPayment = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      const created = await paymentsApi.createPayment({ postId, payeeId, amount });
      setPayment(created);
    } catch (err: any) {
      setError(toFriendlyError(err?.message || "Failed to create payment"));
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async () => {
    if (!payment?.id) return;
    try {
      setLoading(true);
      setError("");
      const updated = await paymentsApi.updatePaymentStatus(payment.id, { status });
      setPayment(updated);
      setSuccess(`Status updated to ${updated.status}.`);
    } catch (err: any) {
      setError(toFriendlyError(err?.message || "Failed to update status"));
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-4xl font-extrabold text-white mb-1">Pay Helper</h1>
          <p className="text-gray-300 text-sm">Secure payment powered by Stripe</p>
        </div>
      </div>

      <main className="px-4 max-w-lg mx-auto pb-12 -mt-6 relative z-10">

        {/* No payment context */}
        {!hasPrefill && !payment?.id && !loading && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <div className="text-5xl mb-4">💳</div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">No active payment</h2>
            <p className="text-sm text-gray-500 mb-6">
              To pay someone, open the completed task from your profile and click <strong>Pay</strong>.
            </p>
            <div className="flex flex-col gap-2">
              <Link href="/profile">
                <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 rounded-xl text-sm hover:scale-[1.02] transition-all shadow-md">
                  Go to Profile
                </button>
              </Link>
              <Link href="/marketplace">
                <button className="w-full border border-gray-200 text-gray-600 font-medium py-3 rounded-xl text-sm hover:bg-gray-50 transition-all">
                  Browse Marketplace
                </button>
              </Link>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-24">
            <div className="flex items-center gap-3 text-gray-400">
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Loading payment...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-4">
            <p className="text-red-700 text-sm font-medium mb-0.5">Payment error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Payment card */}
        {(hasPrefill || payment?.id) && !loading && (
          <div className="space-y-4">

            {/* Amount summary */}
            {!isPaid && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Payment Summary</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-gray-900">${amount}</span>
                  <span className="text-gray-400 text-sm">USD</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Task payment to your helper</p>
              </div>
            )}

            {/* Step 1: Create payment */}
            {!payment?.id && hasFullPrefill && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  This will securely initiate your payment. You&apos;ll enter card details in the next step.
                </p>
                <button
                  onClick={createPayment}
                  disabled={loading || !canCreatePayment}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl text-base shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? "Starting..." : "Continue to Payment"}
                </button>
              </div>
            )}

            {/* Step 2: Card / success */}
            {payment && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                {isPaid ? (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 text-3xl mb-4">
                      <FaCheckCircle />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Payment complete!</h2>
                    <p className="text-sm text-gray-500 mb-6">Your helper has been paid. Take a moment to leave a review.</p>
                    <div className="flex flex-col gap-2">
                      {initial.taskAssignmentId > 0 && (
                        <Link href={`/reviews?taskAssignmentId=${initial.taskAssignmentId}&postId=${postId}`}>
                          <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 rounded-xl text-sm hover:scale-[1.02] transition-all shadow-md">
                            Leave a Review
                          </button>
                        </Link>
                      )}
                      <Link href="/profile">
                        <button className="w-full border border-gray-200 text-gray-600 font-medium py-3 rounded-xl text-sm hover:bg-gray-50 transition-all">
                          Back to Profile
                        </button>
                      </Link>
                    </div>
                  </div>
                ) : payment.stripeClientSecret && hasPublishableKey ? (
                  <>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Card Details</p>
                    <Elements stripe={stripePromise}>
                      <StripeConfirmForm
                        clientSecret={payment.stripeClientSecret}
                        onError={setError}
                        onSuccess={async () => {
                          try {
                            const synced = await paymentsApi.syncPayment(payment.id);
                            setPayment(synced);
                            if (synced.status === "SUCCEEDED") setSuccess("Payment confirmed.");
                            else setSuccess("Payment received — finalizing...");
                          } catch (err: any) {
                            setError(err?.message || "Card charged, but confirmation failed. Refresh in a moment.");
                          }
                        }}
                      />
                    </Elements>
                  </>
                ) : (
                  <>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
                      <p className="font-semibold mb-1">Card checkout unavailable</p>
                      <p className="text-xs">
                        {!hasPublishableKey
                          ? "Stripe publishable key is missing."
                          : "Backend did not return a client secret."}
                        {" "}Configure Stripe keys for real card checkout.
                      </p>
                    </div>

                    {/* Dev/test mode */}
                    <div className="border-t border-gray-100 pt-4 space-y-3">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Test Mode</p>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        disabled={loading}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="FAILED">FAILED</option>
                        <option value="PROCESSING">PROCESSING</option>
                      </select>
                      <p className="text-xs text-gray-400">
                        SUCCEEDED is set by the Stripe webhook only. Use a test card (4242 4242 4242 4242) with real Stripe keys.
                      </p>
                      <button
                        onClick={updateStatus}
                        disabled={loading}
                        className="w-full border border-gray-200 text-gray-600 font-medium py-3 rounded-xl text-sm hover:bg-gray-50 transition-all disabled:opacity-50"
                      >
                        Update Test Status
                      </button>
                    </div>
                  </>
                )}

                {success && !isPaid && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-emerald-700 text-sm">
                    {success}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
