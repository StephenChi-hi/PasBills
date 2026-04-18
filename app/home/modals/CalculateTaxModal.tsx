"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { AlertCircle, Flag } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useTokenStore } from "@/lib/tokens/token-store";
import { CURRENCIES, getFlagUrl } from "@/lib/currency/currencies";
import { createClient } from "@/lib/supabase/client";
import { CountrySelector } from "./components/CountrySelector";

interface CalculateTaxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTokenModal?: () => void;
  businesses?: any[];
}

interface TaxCalculationStep {
  name: string;
  label: string;
  icon: string;
}

const TAX_STEPS: TaxCalculationStep[] = [
  { name: "gathering", label: "Gathering transactions", icon: "📊" },
  { name: "organizing", label: "Organizing by category", icon: "📁" },
  { name: "calculating", label: "Calculating tax", icon: "🧮" },
  { name: "generating", label: "Generating report", icon: "📋" },
  { name: "done", label: "Done", icon: "✓" },
];

const TAX_COST = 500;

export function CalculateTaxModal({
  isOpen,
  onClose,
  onOpenTokenModal,
  businesses,
}: CalculateTaxModalProps) {
  const { user } = useAuth();
  const { tokens, fetchTokenBalance, deductTokens } = useTokenStore();

  const [selectedCountry, setSelectedCountry] = useState("NGN");
  const [selectedTaxType, setSelectedTaxType] = useState<
    "personal" | "business"
  >("personal");
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState("");
  const [insufficientTokens, setInsufficientTokens] = useState(false);

  const availableCountries = Object.keys(CURRENCIES);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    if (user?.id && isOpen) {
      fetchTokenBalance(user.id);
    }
  }, [user?.id, isOpen, fetchTokenBalance]);

  const hasEnoughTokens = (tokens?.balance ?? 0) >= TAX_COST;

  const handleCalculate = async () => {
    if (!user?.id) return;

    if (!hasEnoughTokens) {
      setInsufficientTokens(true);
      onOpenTokenModal?.();
      return;
    }

    if (selectedTaxType === "business" && !selectedBusiness) {
      setError("Please select a business");
      return;
    }

    setLoading(true);
    setError("");
    setCurrentStep(0);
    setResults(null);

    try {
      // Simulate step progression
      for (let i = 0; i < TAX_STEPS.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setCurrentStep(i);
      }

      // Fetch transactions for the year
      const supabase = createClient();
      const startDate = `${selectedYear}-01-01`;
      const endDate = `${selectedYear}-12-31`;

      let query = supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .gte("transaction_date", startDate)
        .lte("transaction_date", endDate);

      if (selectedTaxType === "business") {
        query = query.eq("business_id", selectedBusiness);
      } else {
        query = query.neq("is_business", true);
      }

      const { data: transactions, error: fetchError } = await query;

      if (fetchError) {
        setError("Failed to fetch transactions");
        setLoading(false);
        return;
      }

      // Call tax calculation API (token deduction happens here)
      const response = await fetch("/api/taxes/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactions: transactions || [],
          country: selectedCountry,
          year: selectedYear,
          taxType: selectedTaxType,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Failed to calculate tax");
        // Refresh token balance on error
        if (response.status === 403) {
          fetchTokenBalance(user.id);
        }
        setLoading(false);
        return;
      }

      const taxData = await response.json();
      setResults(taxData);
    } catch (err) {
      console.error("Tax calculation error:", err);
      setError("An error occurred during calculation");
    } finally {
      setLoading(false);
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
            {loading ? (
              // Loading State
              <div className="py-12 text-center">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-8">
                  Calculating Tax
                </h3>
                <div className="space-y-4">
                  {TAX_STEPS.map((step, idx) => (
                    <motion.div
                      key={step.name}
                      className={`flex items-center gap-4 p-4 rounded-lg ${
                        idx < currentStep
                          ? "bg-green-50 dark:bg-green-900/20"
                          : idx === currentStep
                            ? "bg-blue-50 dark:bg-blue-900/20"
                            : "bg-zinc-100 dark:bg-zinc-800"
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <span className="text-2xl">{step.icon}</span>
                      <span
                        className={`text-sm font-medium ${
                          idx < currentStep
                            ? "text-green-700 dark:text-green-300"
                            : idx === currentStep
                              ? "text-blue-700 dark:text-blue-300"
                              : "text-zinc-600 dark:text-zinc-400"
                        }`}
                      >
                        {step.label}
                      </span>
                      {idx === currentStep && (
                        <motion.div
                          className="ml-auto"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          ⚙️
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : results ? (
              // Results State
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
                  Tax Report
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Year:{" "}
                      <span className="font-semibold">{selectedYear}</span> |
                      Country:{" "}
                      <span className="font-semibold">
                        {
                          CURRENCIES[selectedCountry as keyof typeof CURRENCIES]
                            .country
                        }
                      </span>
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/50 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-200 mb-1">
                      Taxable Income
                    </p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {
                        CURRENCIES[selectedCountry as keyof typeof CURRENCIES]
                          .symbol
                      }
                      {results.taxableIncome?.toFixed(2)}
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700/50 rounded-lg">
                    <p className="text-sm text-purple-800 dark:text-purple-200 mb-1">
                      Estimated Tax
                    </p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                      {
                        CURRENCIES[selectedCountry as keyof typeof CURRENCIES]
                          .symbol
                      }
                      {results.estimatedTax?.toFixed(2)}
                    </p>
                  </div>

                  {results.breakdown && (
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                      <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                        Category Breakdown
                      </p>
                      <div className="space-y-2">
                        {Object.entries(results.breakdown).map(
                          ([key, value]: any) => (
                            <div
                              key={key}
                              className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400"
                            >
                              <span className="capitalize">{key}</span>
                              <span className="font-medium">
                                {
                                  CURRENCIES[
                                    selectedCountry as keyof typeof CURRENCIES
                                  ].symbol
                                }
                                {value.toFixed(2)}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setResults(null);
                      setCurrentStep(0);
                    }}
                    className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-50 rounded-lg font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    New Calculation
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              // Selection State
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
                  Calculate Tax
                </h2>

                <div className="space-y-4 mb-6">
                  {/* Country Selector */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                      Select Country
                    </label>
                    {/** Show only selected country card, with a button to open the grid selector **/}
                    {/** State: showCountryGrid controls whether to show the grid or just the selected card **/}
                    <CountrySelector
                      selectedCountry={selectedCountry}
                      setSelectedCountry={setSelectedCountry}
                      availableCountries={availableCountries}
                    />
                  </div>

                  {/* Tax Type Selector */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                      Tax Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(
                        [
                          { value: "personal", label: "Personal Tax" },
                          { value: "business", label: "Business Tax" },
                        ] as const
                      ).map((type) => (
                        <button
                          key={type.value}
                          onClick={() => {
                            setSelectedTaxType(type.value);
                            setSelectedBusiness("");
                          }}
                          className={`p-4 py-5 rounded-lg border-2 transition-all ${
                            selectedTaxType === type.value
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-zinc-200 dark:border-zinc-700 hover:border-blue-300"
                          }`}
                        >
                          <p className="font-medium text-zinc-900 dark:text-zinc-50">
                            {type.label}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Business Selector */}
                  {selectedTaxType === "business" && (
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Select Business
                      </label>
                      <select
                        value={selectedBusiness}
                        onChange={(e) => setSelectedBusiness(e.target.value)}
                        className="w-full px-4 py-3 h-11 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a business</option>
                        {businesses?.map((bus) => (
                          <option key={bus.id} value={bus.id}>
                            {bus.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Year Selector */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Tax Year
                    </label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="w-full px-4 py-3 h-11 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  {insufficientTokens && (
                    <motion.div
                      className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-orange-800 dark:text-orange-200">
                          You need {TAX_COST} tokens to calculate tax
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {error && (
                    <motion.div
                      className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-800 dark:text-red-200">
                        {error}
                      </p>
                    </motion.div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-50 rounded-lg font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCalculate}
                    disabled={loading || !hasEnoughTokens}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      hasEnoughTokens && !loading
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "bg-purple-400 text-white cursor-not-allowed"
                    }`}
                  >
                    {loading ? "Calculating..." : "Calculate Tax"}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
