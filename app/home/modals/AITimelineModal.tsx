"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { AILoadingSteps } from "./components/AILoadingSteps";
import { AIResultsDisplay } from "./components/AIResultsDisplay";
import { TimeRangeSelector } from "./components/TimeRangeSelector";
import { useAIAnalytics } from "@/lib/hooks/useAIAnalytics";
import { useTokenStore } from "@/lib/tokens/token-store";
import { useAuth } from "@/lib/auth/auth-context";
import { TOKEN_PRICES, TimeRange } from "@/lib/tokens/constants";
import { AlertCircle } from "lucide-react";

interface AITimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTokenModal?: () => void;
  transactions?: any[];
  accountingSummary?: any;
}

export function AITimelineModal({
  isOpen,
  onClose,
  onOpenTokenModal,
  transactions,
  accountingSummary,
}: AITimelineModalProps) {
  const { loading, error, results, currentStep, analyzeTransactions } =
    useAIAnalytics();
  const { user } = useAuth();
  const { tokens, fetchTokenBalance, deductTokens } = useTokenStore();

  const [hasStarted, setHasStarted] = useState(false);
  const [selectedRange, setSelectedRange] = useState<TimeRange>("1m");
  const [showRangeSelector, setShowRangeSelector] = useState(true);
  const [insufficientTokens, setInsufficientTokens] = useState(false);

  useEffect(() => {
    if (user?.id && isOpen) {
      fetchTokenBalance(user.id);
    }
  }, [user?.id, isOpen, fetchTokenBalance]);

  const requiredTokens =
    TOKEN_PRICES.find((p) => p.range === selectedRange)?.tokens ?? 0;

  const hasEnoughTokens = (tokens?.balance ?? 0) >= requiredTokens;

  const handleStartAnalysis = async () => {
    if (!user?.id || !transactions || !accountingSummary) return;

    if (!hasEnoughTokens) {
      setInsufficientTokens(true);
      onOpenTokenModal?.();
      return;
    }

    setHasStarted(true);
    setShowRangeSelector(false);

    // Filter transactions by date range
    const filteredTransactions = filterTransactionsByRange(
      transactions,
      selectedRange,
    );

    // Start analysis (tokens deducted in API endpoint)
    analyzeTransactions(filteredTransactions, accountingSummary, user.id).catch(
      (err) => {
        console.error("Analysis error:", err);
        setHasStarted(false);
        setShowRangeSelector(true);
      },
    );
  };

  const handleClose = () => {
    setHasStarted(false);
    setShowRangeSelector(true);
    setInsufficientTokens(false);
    onClose();
  };

  const filterTransactionsByRange = (txns: any[], range: TimeRange): any[] => {
    const now = new Date();
    const daysAgo = range === "1m" ? 30 : range === "3m" ? 90 : 180;
    const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    return txns.filter((txn) => {
      const txnDate = new Date(txn.transaction_date);
      return txnDate >= cutoffDate;
    });
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
          onClick={handleClose}
        >
          <motion.div
            className="bg-white dark:bg-zinc-900 rounded-t-lg md:rounded-lg p-6 shadow-lg w-full md:w-auto md:max-w-2xl h-screen md:h-auto md:max-h-[85vh] overflow-y-auto"
            initial={{ scale: 0.95, opacity: 0, y: 100 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 100 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {showRangeSelector ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                    AI Financial Analysis
                  </h2>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Choose the time period for deep financial insights
                  </p>
                </div>

                <TimeRangeSelector
                  selectedRange={selectedRange}
                  onSelect={setSelectedRange}
                  disabled={loading}
                />

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <span className="font-semibold">Analysis Value:</span> Get
                    insights for your{" "}
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      last{" "}
                      {selectedRange === "1m"
                        ? "30 days"
                        : selectedRange === "3m"
                          ? "90 days"
                          : "180 days"}
                    </span>
                  </p>
                </div>

                {insufficientTokens && (
                  <motion.div
                    className="mt-4 flex items-center gap-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                        You need more tokens
                      </h3>
                      <p className="text-sm text-orange-800 dark:text-orange-200">
                        Get additional tokens to analyze this period
                      </p>
                    </div>
                  </motion.div>
                )}

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-50 rounded-lg font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStartAnalysis}
                    disabled={loading}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      !loading
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "bg-purple-400 text-white cursor-not-allowed"
                    }`}
                  >
                    {loading ? "Analyzing..." : "Start Analysis"}
                  </button>
                </div>
              </motion.div>
            ) : error ? (
              <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-900 dark:text-red-100">
                    Analysis Error
                  </h3>
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {error}
                  </p>
                </div>
              </div>
            ) : loading || !results ? (
              <AILoadingSteps currentStep={currentStep} />
            ) : (
              <AIResultsDisplay results={results} onClose={handleClose} />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
