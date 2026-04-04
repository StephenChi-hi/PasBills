"use client";

import { useState, useEffect } from "react";
import { X, Zap } from "lucide-react";
import { useCurrency } from "@/lib/currency/currency-context";
import { CURRENCIES } from "@/lib/currency/currencies";
import { useTransactionStore } from "@/lib/stores/transaction-store";
import { createClient } from "@/lib/supabase/client";

interface Account {
  id: string;
  name: string;
}

interface TransferTransactionModalProps {
  onClose: () => void;
}

export function TransferTransactionModal({
  onClose,
}: TransferTransactionModalProps) {
  const [formData, setFormData] = useState({
    amount: 0,
    fromAccount: "",
    toAccount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [amountString, setAmountString] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { currentCurrency } = useCurrency();
  const { triggerRefetch } = useTransactionStore();
  const currency = CURRENCIES[currentCurrency as keyof typeof CURRENCIES];
  const currencySymbol = currency?.symbol || "$";

  // Fetch accounts from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        // Fetch accounts
        const { data: accountsData, error: accountsError } = await supabase
          .from("accounts")
          .select("id, name")
          .eq("user_id", user.id)
          .eq("is_active", true);

        if (!accountsError && accountsData) {
          setAccounts(accountsData);
        }
      } catch (err) {
        console.error("Error fetching accounts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatAmountDisplay = (str: string): string => {
    if (!str) return "";
    // Split by decimal point
    const parts = str.split(".");
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const decimalPart = parts[1] || "";
    return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
  };

  const handleAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // Remove all non-digits except decimal point, then ensure only one decimal
    const cleanedInput = input
      .replace(/[^0-9.]/g, "")
      .replace(/(\.)(?=.*\.)/g, "");

    setAmountString(cleanedInput);
    const parsedValue = parseFloat(cleanedInput) || 0;
    setFormData((prev) => ({
      ...prev,
      amount: parsedValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // Validate form
      if (!formData.fromAccount || !formData.toAccount) {
        setError("Please select both from and to accounts");
        setSubmitting(false);
        return;
      }

      if (formData.fromAccount === formData.toAccount) {
        setError("From and to accounts cannot be the same");
        setSubmitting(false);
        return;
      }

      if (formData.amount <= 0) {
        setError("Amount must be greater than 0");
        setSubmitting(false);
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error("User not authenticated");
        setSubmitting(false);
        return;
      }

      // Convert amount from current currency to NGN
      let amountInNGN = formData.amount;
      if (currentCurrency !== "NGN") {
        const ngnRate = CURRENCIES.NGN.rateToUSD;
        const valueInUSD = formData.amount / currency.rateToUSD;
        amountInNGN = valueInUSD * ngnRate;
      }

      // Fetch current balances
      const { data: fromAccountData, error: fetchFromError } = await supabase
        .from("accounts")
        .select("balance")
        .eq("id", formData.fromAccount)
        .single();

      const { data: toAccountData, error: fetchToError } = await supabase
        .from("accounts")
        .select("balance")
        .eq("id", formData.toAccount)
        .single();

      if (fetchFromError || fetchToError) {
        console.error(
          "Error fetching account balances:",
          fetchFromError || fetchToError,
        );
        setError("Failed to retrieve account balances. Please try again.");
        return;
      }

      // Update from account (deduct)
      const { error: updateFromError } = await supabase
        .from("accounts")
        .update({ balance: (fromAccountData.balance || 0) - amountInNGN })
        .eq("id", formData.fromAccount);

      // Update to account (add)
      const { error: updateToError } = await supabase
        .from("accounts")
        .update({ balance: (toAccountData.balance || 0) + amountInNGN })
        .eq("id", formData.toAccount);

      if (updateFromError || updateToError) {
        console.error(
          "Error updating balances:",
          updateFromError || updateToError,
        );
        setError("Failed to transfer. Please try again.");
        return;
      }

      console.log("✅ Transfer created successfully, triggering refetch...");
      setTimeout(() => {
        console.log("⏰ Calling triggerRefetch after delay");
        triggerRefetch();
      }, 300);

      // Reset form and close
      setFormData({
        amount: 0,
        fromAccount: "",
        toAccount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
      setAmountString("");
      onClose();
    } catch (err) {
      console.error("Error:", err);
      setError("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target as any;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) || 0 : value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50  sm:p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl sm:max-w-md w-full h-screen sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Transfer Money
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* From Account */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              From Account
            </label>
            <select
              name="fromAccount"
              value={formData.fromAccount}
              onChange={handleChange}
              className="w-full px-3 py-2 h-12 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              required
            >
              <option value="">Select account to transfer from</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          {/* To Account */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              To Account
            </label>
            <select
              name="toAccount"
              value={formData.toAccount}
              onChange={handleChange}
              className="w-full px-3 h-12 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              required
            >
              <option value="">Select account to transfer to</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Amount ({currencySymbol})
            </label>
            <input
              type="text"
              name="amount"
              value={formatAmountDisplay(amountString)}
              onChange={handleAmountInput}
              placeholder="0.00"
              inputMode="decimal"
              className="w-full h-10 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description (Optional) */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g., Monthly savings transfer"
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || loading}
              className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Transferring..." : "Transfer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
