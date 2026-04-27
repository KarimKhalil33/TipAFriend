"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { ApiError, paymentsApi, Payment } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { loadStripe } from "@stripe/stripe-js";
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
);

function StripeConfirmForm({
  clientSecret,
  paymentId,
  onSuccess,
  onError,
}: {
  clientSecret: string;
  paymentId: number;
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
        onError(result.error.message || "Stripe confirmation failed");
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
    <div className="border rounded-lg p-3 space-y-3">
      <div className="text-sm text-gray-700">
        Secure card payment for payment #{paymentId}
      </div>
      <div className="border rounded px-3 py-2 bg-white">
        <CardElement options={{ hidePostalCode: true }} />
      </div>
      <Button
        onClick={confirmPayment}
        disabled={processing || !stripe}
        className="bg-indigo-600 hover:bg-indigo-700 text-white"
      >
        {processing ? "Processing..." : "Confirm Card Payment"}
      </Button>
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

  const [postId, setPostId] = useState(initial.postId);
  const [payeeId, setPayeeId] = useState(initial.payeeId);
  const [amount, setAmount] = useState(initial.amount);
  const [status, setStatus] = useState("SUCCEEDED");
  const [payment, setPayment] = useState<Payment | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const hasPrefill =
    initial.postId > 0 || initial.payeeId > 0 || initial.amount > 0;
  const hasFullPrefill =
    initial.postId > 0 && initial.payeeId > 0 && initial.amount > 0;
  const canCreatePayment =
    postId > 0 && payeeId > 0 && amount > 0 && !payment?.id;
  const isPaid = payment?.status === "SUCCEEDED";
  const hasPublishableKey =
    !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  const toFriendlyError = (message: string) => {
    const text = (message || "").toLowerCase();
    if (!text || text.includes("unexpected error")) {
      return "We couldn't start payment right now. Please try again in a moment.";
    }
    if (text.includes("unauthorized") || text.includes("forbidden")) {
      return "Your session expired. Please log in again and retry payment.";
    }
    if (text.includes("not found")) {
      return "This payment task could not be found. Please go back and open Pay again from your post.";
    }
    if (text.includes("amount")) {
      return "Payment amount is invalid for this task. Please refresh and try again.";
    }
    return message;
  };

  useEffect(() => {
    const loadExistingPayment = async () => {
      if (initial.taskAssignmentId <= 0) return;

      try {
        setLoading(true);
        const existing = await paymentsApi.getPaymentByTask(
          initial.taskAssignmentId,
        );
        if (existing?.id) {
          setPayment(existing);
          setSuccess(
            `Existing payment #${existing.id} loaded for this task.`,
          );
        }
      } catch (err: any) {
        const typedError = err as ApiError;
        if (
          typedError.code !== "PAYMENT_NOT_FOUND" &&
          typedError.code !== "NOT_FOUND"
        ) {
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
      const created = await paymentsApi.createPayment({
        postId,
        payeeId,
        amount,
      });
      setPayment(created);
      if (!created.stripeClientSecret) {
        setSuccess(
          "Payment record created. Stripe checkout is not available in this environment, so use Test Mode below to complete this payment.",
        );
      } else {
        setSuccess(
          "Payment record created. Next: enter card details and confirm payment below.",
        );
      }
    } catch (err: any) {
      setError(
        toFriendlyError(err?.message || "Failed to create payment"),
      );
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async () => {
    if (!payment?.id) return;
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      const updated = await paymentsApi.updatePaymentStatus(payment.id, {
        status,
      });
      setPayment(updated);
      setSuccess(`Payment status updated to ${updated.status}.`);
    } catch (err: any) {
      setError(
        toFriendlyError(err?.message || "Failed to update payment status"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white text-gray-900">
      <Navbar />
      <main className="max-w-2xl mx-auto pt-24 px-4 pb-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Payments</h1>
          <Link href="/profile" className="text-blue-600 hover:text-blue-700">
            Back to Profile
          </Link>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-800 mb-4 text-sm">
          You&apos;re almost done. Confirm payment securely, then continue to review.
        </div>

        {hasFullPrefill && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-indigo-800 mb-4 text-sm">
            Ready to pay ${amount} for this completed task.
          </div>
        )}

        {!canCreatePayment && !payment?.id && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 mb-4 text-sm">
            Payment details are missing. Please go back to Profile and click Pay from the completed post again.
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 mb-4">
            <p className="font-medium mb-1">Couldn&apos;t start payment</p>
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 mb-4">
            {success}
          </div>
        )}

        <div className="bg-white border rounded-xl p-4 space-y-3">
          {!hasFullPrefill && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Post ID
                </label>
                <input
                  type="number"
                  value={postId}
                  onChange={(e) => setPostId(Number(e.target.value))}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Example: 42"
                  readOnly={initial.postId > 0}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Helper User ID
                </label>
                <input
                  type="number"
                  value={payeeId}
                  onChange={(e) => setPayeeId(Number(e.target.value))}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Example: 17"
                  readOnly={initial.payeeId > 0}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (USD)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Example: 25"
                  readOnly={initial.amount > 0}
                  disabled={loading}
                />
              </div>
            </>
          )}

          <Button
            onClick={createPayment}
            disabled={loading || !canCreatePayment}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {hasFullPrefill ? "Continue to Secure Payment" : "Create Payment"}
          </Button>

          {payment && (
            <div className="border-t pt-3 mt-3 space-y-2">
              <div className="text-sm text-gray-700">
                Payment reference: #{payment.id}
              </div>
              <div className="text-sm text-gray-700">
                Status: {payment.status}
              </div>

              {payment.stripeClientSecret &&
              hasPublishableKey ? (
                <>
                  <div className="text-sm font-medium text-gray-800">
                    Step 2: Pay with Card
                  </div>
                  <Elements stripe={stripePromise}>
                    <StripeConfirmForm
                      clientSecret={payment.stripeClientSecret}
                      paymentId={payment.id}
                      onError={setError}
                      onSuccess={async () => {
                        const updated = await paymentsApi.updatePaymentStatus(
                          payment.id,
                          {
                            status: "SUCCEEDED",
                          },
                        );
                        setPayment(updated);
                        setSuccess("Stripe payment confirmed.");
                      }}
                    />
                  </Elements>
                </>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-sm space-y-2">
                  <p className="font-medium">Card checkout is unavailable right now.</p>
                  {!hasPublishableKey ? (
                    <p>
                      Frontend Stripe publishable key is missing.
                    </p>
                  ) : (
                    <p>
                      Backend did not return a Stripe client secret for this payment.
                    </p>
                  )}
                  <p>
                    Use the Test Mode section below to finish payment in local/dev,
                    or configure Stripe keys for real card checkout.
                  </p>
                </div>
              )}

              {!payment.stripeClientSecret && (
                <>
                  <div className="text-sm font-medium text-gray-800">
                    Test Mode (local development)
                  </div>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    disabled={loading}
                  >
                    <option value="SUCCEEDED">SUCCEEDED</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="FAILED">FAILED</option>
                  </select>
                  <Button
                    onClick={updateStatus}
                    disabled={loading}
                    variant="outline"
                  >
                    Confirm Test Payment
                  </Button>
                </>
              )}

              {isPaid && (
                <div className="pt-2 border-t mt-3">
                  <p className="text-sm text-green-700 mb-3">
                    Payment complete. Continue to leave your review.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {initial.taskAssignmentId > 0 && (
                      <Link
                        href={`/reviews?taskAssignmentId=${initial.taskAssignmentId}&postId=${postId}`}
                      >
                        <Button className="bg-green-600 hover:bg-green-700 text-white">
                          Leave Review
                        </Button>
                      </Link>
                    )}
                    <Link href="/profile">
                      <Button variant="outline">Back to Profile</Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
