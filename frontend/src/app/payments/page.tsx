"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { paymentsApi, Payment } from "@/lib/api";
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
          "Payment record created. Next: choose a status in the fallback section and update it.",
        );
      } else {
        setSuccess(
          "Payment record created. Next: enter card details and confirm payment below.",
        );
      }
    } catch (err: any) {
      setError(err.message || "Failed to create payment");
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
      setError(err.message || "Failed to update payment status");
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
          Step 1: Create payment record. Step 2: Confirm card payment (Stripe).
          If Stripe keys are missing, use fallback status update.
        </div>

        {hasPrefill && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-indigo-800 mb-4 text-sm">
            This screen was pre-filled from your completed task.
            {initial.taskAssignmentId > 0
              ? ` Task Assignment: #${initial.taskAssignmentId}.`
              : ""}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 mb-4">
            {success}
          </div>
        )}

        <div className="bg-white border rounded-xl p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Post ID (the job/task being paid)
            </label>
            <input
              type="number"
              value={postId}
              onChange={(e) => setPostId(Number(e.target.value))}
              className="w-full border rounded px-3 py-2"
              placeholder="Example: 42"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payee User ID (the helper receiving money)
            </label>
            <input
              type="number"
              value={payeeId}
              onChange={(e) => setPayeeId(Number(e.target.value))}
              className="w-full border rounded px-3 py-2"
              placeholder="Example: 17"
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
            />
          </div>

          <Button
            onClick={createPayment}
            disabled={loading || !postId || !payeeId || !amount}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            1) Create Payment Record
          </Button>

          {payment && (
            <div className="border-t pt-3 mt-3 space-y-2">
              <div className="text-sm text-gray-700">
                Payment ID: {payment.id}
              </div>
              <div className="text-sm text-gray-700">
                Current Status: {payment.status}
              </div>

              {payment.stripeClientSecret &&
              process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? (
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
                <div className="text-xs text-gray-500">
                  Stripe client secret or publishable key missing.
                </div>
              )}

              <div className="text-sm font-medium text-gray-800">
                Fallback (testing/manual)
              </div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border rounded px-3 py-2"
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
                2) Update Payment Status
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
