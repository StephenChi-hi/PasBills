"use client";

import { useState, useEffect } from "react";
import { X, Trash2 } from "lucide-react";
import { useCurrency } from "@/lib/currency/currency-context";
import { CURRENCIES } from "@/lib/currency/currencies";
import { useTransactionStore } from "@/lib/stores/transaction-store";
import { CategorySelector } from "./CategorySelector";
import { createClient } from "@/lib/supabase/client";
import type { Transaction } from "./TransactionListCard";

interface Account {
  id: string;
  name: string;
}

interface Business {
  id: string;
  name: string;
}

interface EditTransactionModalProps {
  transaction: Transaction;
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
}

export function EditTransactionModal({
  transaction,
  onClose,
  onSave,
  onDelete,
}: EditTransactionModalProps) {
  const [formData, setFormData] = useState({
    description: transaction.description,
    amount: transaction.amount,
    categoryId: transaction.categoryId,
    fromAccount: transaction.from,
    toAccount: transaction.to,
    businessId: transaction.businessId || "personal",
    date:
      transaction.date.includes("ago") || transaction.date.includes("day")
        ? new Date().toISOString().split("T")[0]
        : transaction.date,
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { currentCurrency } = useCurrency();
  const { triggerRefetch } = useTransactionStore();
  const currency = CURRENCIES[currentCurrency as keyof typeof CURRENCIES];
  const currencySymbol = currency?.symbol || "$";

  // Fetch accounts and businesses
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
        const { data: accountsData } = await supabase
          .from("accounts")
          .select("id, name")
          .eq("user_id", user.id)
          .eq("is_active", true);

        // Fetch businesses
        const { data: businessesData } = await supabase
          .from("businesses")
          .select("id, name")
          .eq("user_id", user.id)
          .eq("is_active", true);

        if (accountsData) setAccounts(accountsData);
        if (businessesData) setBusinesses(businessesData);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBusinessChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const businessId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      businessId,
      categoryId: "", // Reset category when business changes
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const supabase = createClient();

      // Convert amount from current currency to NGN
      let amountInNGN = formData.amount;
      if (currentCurrency !== "NGN") {
        const ngnRate = CURRENCIES.NGN.rateToUSD;
        const valueInUSD = formData.amount / currency.rateToUSD;
        amountInNGN = valueInUSD * ngnRate;
      }

      // Determine if business transaction
      const isBusiness = formData.businessId !== "personal";

      const { error } = await supabase
        .from("transactions")
        .update({
          description: formData.description,
          amount: amountInNGN,
          category_id: formData.categoryId || null,
          from_account_id: formData.fromAccount || null,
          to_account_id: formData.toAccount || null,
          business_id: isBusiness ? formData.businessId : null,
          is_business: isBusiness,
          transaction_date: formData.date,
        })
        .eq("id", transaction.id);

      if (error) {
        console.error("Error updating transaction:", error);
        return;
      }

      // Trigger refetch in all cards
      console.log("✅ Transaction updated successfully, triggering refetch...");
      // Wait a moment for database triggers to execute before refetching
      setTimeout(() => {
        console.log("⏰ Calling triggerRefetch after delay");
        triggerRefetch();
      }, 300);

      onSave({
        ...transaction,
        description: formData.description,
        amount: formData.amount,
        categoryId: formData.categoryId,
        from: formData.fromAccount,
        to: formData.toAccount,
        businessId: formData.businessId,
        date: formData.date,
      });
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", transaction.id);

      if (error) {
        console.error("Error deleting transaction:", error);
        return;
      }

      // Trigger refetch in all cards
      console.log("✅ Transaction deleted successfully, triggering refetch...");
      // Wait a moment for database triggers to execute before refetching
      setTimeout(() => {
        console.log("⏰ Calling triggerRefetch after delay");
        triggerRefetch();
      }, 300);

      onDelete(transaction.id);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Edit Transaction
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-700 bg-red-50 dark:bg-red-900/20">
            <p className="text-sm text-red-900 dark:text-red-200 mb-4">
              Are you sure you want to delete this transaction? This action
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={submitting}
                className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="flex-1 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-sm font-medium text-white"
              >
                {submitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        {!showDeleteConfirm && (
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
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Amount ({currencySymbol})
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="personal">Personal</option>
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name}
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
                type={transaction.type}
                categoryType={
                  formData.businessId === "personal" ? "personal" : "business"
                }
                selectedCategoryId={formData.categoryId}
                onSelectCategory={(categoryId) =>
                  setFormData((prev) => ({ ...prev, categoryId }))
                }
              />
            </div>

            {/* From Account - Only for Expense */}
            {transaction.type === "expense" && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  From Account
                </label>
                <select
                  name="fromAccount"
                  value={formData.fromAccount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* To Account - Only for Income */}
            {transaction.type === "income" && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  To Account
                </label>
                <select
                  name="toAccount"
                  value={formData.toAccount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
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
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={submitting}
                className="flex-shrink-0 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || loading}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium"
              >
                {submitting ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
