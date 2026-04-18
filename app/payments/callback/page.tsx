"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { useTokenStore } from "@/lib/tokens/token-store";
import { Check, AlertCircle, Loader } from "lucide-react";
import { useEffect, useState } from "react";

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { fetchTokenBalance } = useTokenStore();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const reference = searchParams.get("reference");

        if (!reference) {
          throw new Error("No payment reference found");
        }

        // Wait for user to be authenticated
        if (!user?.id) {
          console.log("⏳ Waiting for user authentication...");
          // Wait a bit and retry if user isn't loaded yet
          await new Promise((resolve) => setTimeout(resolve, 1000));

          if (!user?.id) {
            throw new Error("User not authenticated. Please log in again.");
          }
        }

        const userId = user.id;
        console.log(
          "🔄 Verifying payment with reference:",
          reference,
          "for user:",
          userId,
        );

        // Verify payment with backend
        const verifyResponse = await fetch("/api/payments/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reference,
            userId,
          }),
        });

        const verifyData = await verifyResponse.json();
        console.log("📥 Verification response:", verifyData);

        if (!verifyResponse.ok) {
          throw new Error(verifyData.error || "Payment verification failed");
        }

        console.log("✅ Payment verified successfully");

        // Refresh token balance
        await fetchTokenBalance(userId);
        console.log("✅ Token balance updated");

        setStatus("success");
        setMessage(
          "Payment successful! Tokens have been added to your account.",
        );

        // Redirect to home after 3 seconds
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Unknown error occurred";
        console.error("❌ Payment verification error:", errorMsg);
        setStatus("error");
        setMessage(errorMsg);
      }
    };

    verifyPayment();
  }, [searchParams, user, fetchTokenBalance, router]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 rounded-lg p-8 shadow-lg max-w-md w-full mx-4">
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="animate-spin mb-4">
              <Loader className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              Verifying Payment
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              Please wait while we verify your payment...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-4 mb-4">
              <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              Success!
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">
              {message}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              Redirecting to dashboard...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-4 mb-4">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              Verification Failed
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">
              {message}
            </p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Return to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallback() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-8 shadow-lg max-w-md w-full mx-4">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="animate-spin mb-4">
                <Loader className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                Loading...
              </p>
            </div>
          </div>
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
