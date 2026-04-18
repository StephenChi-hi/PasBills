"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Coins, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useCurrency } from "@/lib/currency/currency-context";
import { TOKEN_PACKAGES } from "@/lib/tokens/constants";
import { CURRENCIES } from "@/lib/currency/currencies";

interface TokenPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TokenPurchaseModal({
  isOpen,
  onClose,
}: TokenPurchaseModalProps) {
  const { user } = useAuth();
  const { currentCurrency } = useCurrency();
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get currency data
  const selectedCurrencyData =
    CURRENCIES[currentCurrency as keyof typeof CURRENCIES];
  const ngnData = CURRENCIES.NGN;

  // Convert price from NGN (base) to selected currency
  const convertPrice = (priceInNGN: number): number => {
    if (!ngnData || !selectedCurrencyData) return priceInNGN;
    return (priceInNGN / ngnData.rateToUSD) * selectedCurrencyData.rateToUSD;
  };

  const currencySymbol = selectedCurrencyData?.symbol || "₦";

  const handlePayment = async (
    pkg: (typeof TOKEN_PACKAGES)[0],
    index: number,
  ) => {
    if (!user?.id || !user.email) {
      setError("User information not available");
      return;
    }

    setSelectedPackage(index);
    setLoading(true);
    setError("");

    try {
      console.log("🚀 MODAL: Starting payment flow");
      console.log("   Selected package index:", index);
      console.log("   Package tokens:", pkg.tokens, typeof pkg.tokens);
      console.log("   Package price:", pkg.price);
      console.log("   Email:", user.email);

      // Call initialize endpoint
      const initResponse = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          amount: pkg.price,
          tokens: pkg.tokens,
          email: user.email,
        }),
      });

      if (!initResponse.ok) {
        const errorData = await initResponse.json();
        throw new Error(errorData.error || "Failed to initialize payment");
      }

      const paymentData = await initResponse.json();
      const authorizationUrl = paymentData.data.authorizationUrl;

      if (!authorizationUrl) {
        throw new Error("No authorization URL received");
      }

      console.log("✅ Redirecting to Paystack checkout...");
      // Redirect to Paystack - the rest happens server-side
      window.location.href = authorizationUrl;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Payment initialization failed";
      console.error("❌ Error:", errorMsg);
      setError(errorMsg);
      setLoading(false);
      setSelectedPackage(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex flex-col justify-end md:justify-center items-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white dark:bg-zinc-900 rounded-t-lg md:rounded-lg p-6 shadow-lg w-full md:w-auto md:max-w-2xl h-screen md:h-auto md:max-h-[85vh] overflow-y-auto"
            initial={{ scale: 0.95, opacity: 0, y: 100 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 100 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <Coins className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  Buy Tokens
                </h2>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400">
                Choose a package to get started
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {TOKEN_PACKAGES.map((pkg, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => setSelectedPackage(idx)}
                  disabled={loading}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    selectedPackage === idx
                      ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                      : "border-zinc-200 dark:border-zinc-700 hover:border-yellow-300 dark:hover:border-yellow-600"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                        {pkg.label}
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {currencySymbol}
                        {convertPrice(pkg.price).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                        {pkg.tokens}
                      </span>
                      <ArrowRight className="w-4 h-4 text-zinc-400" />
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {error && (
              <motion.div
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-lg p-4 mb-6 flex gap-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 dark:text-red-200">
                  {error}
                </p>
              </motion.div>
            )}

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-lg p-4 mb-6">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                <span className="font-semibold">ℹ️ Note:</span> You'll be
                redirected to Paystack to complete payment. After successful
                payment, tokens will be automatically added to your account.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-50 rounded-lg font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedPackage !== null) {
                    handlePayment(
                      TOKEN_PACKAGES[selectedPackage],
                      selectedPackage,
                    );
                  }
                }}
                disabled={loading || selectedPackage === null}
                className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Proceed to Payment"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
