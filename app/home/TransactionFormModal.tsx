"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useCurrency } from "@/lib/currency/currency-context";
import { CURRENCIES } from "@/lib/currency/currencies";
import { useTransactionStore } from "@/lib/stores/transaction-store";
import { CategorySelector } from "./CategorySelector";
import { createClient } from "@/lib/supabase/client";

interface Account {
  id: string;
  name: string;
}

interface Business {
  id: string;
  name: string;
}

interface TransactionFormModalProps {
  type: "income" | "expense";
  onClose: () => void;
}

export function TransactionFormModal({
  type,
  onClose,
}: TransactionFormModalProps) {
  const [formData, setFormData] = useState({
    description: "",
    amount: 0,
    categoryId: "",
    fromAccount: null,
    toAccount: null,
    businessId: "personal",
    date: new Date().toISOString().split("T")[0],
    tangibleAssets: false,
  });

  const [amountString, setAmountString] = useState("");

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { currentCurrency } = useCurrency();
  const { triggerRefetch } = useTransactionStore();
  const currency = CURRENCIES[currentCurrency as keyof typeof CURRENCIES];
  const currencySymbol = currency?.symbol || "$";

  // Fetch accounts and businesses from database
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

        // Fetch businesses
        const { data: businessesData, error: businessesError } = await supabase
          .from("businesses")
          .select("id, name")
          .eq("user_id", user.id)
          .eq("is_active", true);

        if (!accountsError && accountsData) {
          setAccounts(accountsData);
        }
        if (!businessesError && businessesData) {
          setBusinesses(businessesData);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
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

  const handleBusinessChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const businessId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      businessId,
      categoryId: "", // Reset category when business changes
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
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
        const ngnRate = CURRENCIES.NGN.rateToUSD; // 1 USD = 1550 NGN
        const valueInUSD = formData.amount / currency.rateToUSD;
        amountInNGN = valueInUSD * ngnRate;
      }

      // Determine if business transaction
      const isBusiness = formData.businessId !== "personal";

      const { error } = await supabase.from("transactions").insert([
        {
          user_id: user.id,
          type: type,
          description: formData.description,
          amount: amountInNGN,
          category_id: formData.categoryId || null,
          from_account_id: formData.fromAccount || null,
          to_account_id: formData.toAccount || null,
          business_id: isBusiness ? formData.businessId : null,
          is_business: isBusiness,
          tangible_assets: formData.tangibleAssets,
          transaction_date: formData.date,
        },
      ]);

      if (error) {
        console.error("Error creating transaction:", error);
        return;
      }

      // Trigger refetch in all cards
      console.log("✅ Transaction created successfully, triggering refetch...");
      // Wait a moment for database triggers to execute before refetching
      setTimeout(() => {
        console.log("⏰ Calling triggerRefetch after delay");
        triggerRefetch();
      }, 300);

      // Reset form and close
      setFormData({
        description: "",
        amount: 0,
        categoryId: "",
        fromAccount: null,
        toAccount: null,
        businessId: "personal",
        date: new Date().toISOString().split("T")[0],
        tangibleAssets: false,
      });
      setAmountString("");
      onClose();
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setSubmitting(false);
    }
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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, type } = e.target as any;
    const value = (
      e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    ).value;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            {type === "income" ? "Record Income" : "Record Expense"}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Description
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g., Client Payment, Grocery Shopping"
              className="w-full h-10 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
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

          {/* Business Type */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Type
            </label>
            <select
              name="businessId"
              value={formData.businessId}
              onChange={handleBusinessChange}
              className="w-full h-10 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="personal">Personal</option>
              {businesses.map((bus) => (
                <option key={bus.id} value={bus.id}>
                  {bus.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Category
            </label>
            <CategorySelector
              type={type}
              categoryType={
                formData.businessId === "personal" ? "personal" : "business"
              }
              selectedCategoryId={formData.categoryId}
              onSelectCategory={(categoryId) =>
                setFormData((prev) => ({ ...prev, categoryId }))
              }
            />
          </div>

          {/* Tangible Assets Checkbox */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="tangibleAssets"
              name="tangibleAssets"
              checked={formData.tangibleAssets}
              onChange={handleChange}
              className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
            <label
              htmlFor="tangibleAssets"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer"
            >
              Tangible Assets
            </label>
          </div>

          {/* From Account - Only for Expense */}
          {type === "expense" && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                From Account
              </label>
              <select
                name="fromAccount"
                value={formData.fromAccount || ""}
                onChange={handleChange}
                className="w-full h-10 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="">Select an account</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* To Account - Only for Income and not for Tangible Assets */}
          {type === "income" && !formData.tangibleAssets && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                To Account
              </label>
              <select
                name="toAccount"
                value={formData.toAccount || ""}
                onChange={handleChange}
                className="w-full h-10 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="">Select an account</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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
              className="w-full h-10 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || loading}
              className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                type === "income"
                  ? "bg-green-600 hover:bg-green-700 disabled:bg-green-400"
                  : "bg-red-600 hover:bg-red-700 disabled:bg-red-400"
              }`}
            >
              {submitting
                ? "Saving..."
                : type === "income"
                  ? "Record Income"
                  : "Record Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
