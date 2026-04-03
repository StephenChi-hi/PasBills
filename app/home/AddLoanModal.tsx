"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { createLoan, convertToNGN } from "@/lib/supabase/loans";
import { createClient } from "@/lib/supabase/client";
import { useCurrency } from "@/lib/currency/currency-context";
import { CURRENCIES } from "@/lib/currency/currencies";
import { useTransactionStore } from "@/lib/stores/transaction-store";

interface Account {
  id: string;
  name: string;
}

interface Business {
  id: string;
  name: string;
}

interface Loan {
  id: string;
  loanType: "borrowed" | "lent";
  counterpartyName: string;
  amount: number;
  principalAmount: number;
  interestRate: number;
  status: "active" | "settled" | "defaulted";
  borrowedDate: string;
  dueDate?: string;
  totalPaid: number;
  currency: string;
  description?: string;
  account: string;
  accountId: string;
  transactionType: "personal" | "business";
  businessId?: string;
}

interface AddLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (loan: Loan) => void;
}

export function AddLoanModal({ isOpen, onClose, onAdd }: AddLoanModalProps) {
  const { currentCurrency } = useCurrency();
  const { triggerRefetch } = useTransactionStore();
  const [loanType, setLoanType] = useState<"borrowed" | "lent">("borrowed");
  const [counterpartyName, setCounterpartyName] = useState("");
  const [principalAmount, setPrincipalAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [description, setDescription] = useState("");
  const [borrowedDate, setBorrowedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [dueDate, setDueDate] = useState("");
  const [account, setAccount] = useState("");
  const [transactionType, setTransactionType] = useState<
    "personal" | "business"
  >("personal");
  const [businessId, setBusinessId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  // Fetch accounts and businesses from database
  const [accountsList, setAccountsList] = useState<Account[]>([]);
  const [businessesList, setBusinessesList] = useState<Business[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
          setIsLoadingOptions(false);
          return;
        }

        // Fetch accounts
        const { data: accountsData, error: accountsError } = await supabase
          .from("accounts")
          .select("id, name")
          .eq("user_id", authUser.id)
          .eq("is_active", true);

        // Fetch businesses
        const { data: businessesData, error: businessesError } = await supabase
          .from("businesses")
          .select("id, name")
          .eq("user_id", authUser.id)
          .eq("is_active", true);

        if (!accountsError && accountsData) {
          setAccountsList(accountsData);
          if (accountsData.length > 0) {
            setAccount(accountsData[0].id);
          }
        }
        if (!businessesError && businessesData) {
          setBusinessesList(businessesData);
          if (businessesData.length > 0) {
            setBusinessId(businessesData[0].id);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoadingOptions(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!counterpartyName.trim() || !principalAmount) {
      alert("Please fill in required fields");
      return;
    }

    try {
      setIsLoading(true);

      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        alert("You must be logged in to create a loan");
        setIsLoading(false);
        return;
      }

      const amount = parseFloat(principalAmount);
      const interest = parseFloat(interestRate) || 0;
      const totalDue = amount + (amount * interest) / 100;

      // Get user's currency object and convert to NGN
      const userCurrency =
        CURRENCIES[currentCurrency as keyof typeof CURRENCIES];
      if (!userCurrency) {
        alert("Invalid currency selected");
        return;
      }
      const principalAmountNGN = convertToNGN(amount, userCurrency);
      const totalDueNGN = convertToNGN(totalDue, userCurrency);

      // Create loan in database with NGN amounts
      const createdLoan = await createLoan(authUser.id, {
        loanType,
        counterpartyName,
        principalAmount: principalAmountNGN,
        interestRate: interest,
        totalAmountDue: totalDueNGN,
        borrowedDate,
        dueDate: dueDate || undefined,
        currency: "NGN",
        description: description || undefined,
        accountId: account,
        transactionType,
        businessId: transactionType === "business" ? businessId : undefined,
      });

      // Find account name for the loan object to display
      const accountName =
        accountsList.find((a) => a.id === account)?.name || account;

      const newLoan: Loan = {
        id: createdLoan.id,
        loanType,
        counterpartyName,
        amount: totalDueNGN,
        principalAmount: principalAmountNGN,
        interestRate: interest,
        status: "active",
        borrowedDate,
        dueDate: dueDate || undefined,
        totalPaid: 0,
        currency: "NGN",
        description: description || undefined,
        account: accountName,
        accountId: account,
        transactionType,
        businessId: transactionType === "business" ? businessId : undefined,
      };

      onAdd(newLoan);
      resetForm();
      triggerRefetch();
      onClose();
    } catch (error) {
      console.error("Error creating loan:", error);
      alert("Failed to create loan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCounterpartyName("");
    setPrincipalAmount("");
    setInterestRate("");
    setDescription("");
    setBorrowedDate(new Date().toISOString().split("T")[0]);
    setDueDate("");
    if (accountsList.length > 0) {
      setAccount(accountsList[0].id);
    }
    setTransactionType("personal");
    if (businessesList.length > 0) {
      setBusinessId(businessesList[0].id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg max-w-md w-full mx-4 max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-700 sticky top-0 bg-white dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Add Loan/Credit
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Loan Type */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Type
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setLoanType("borrowed")}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  loanType === "borrowed"
                    ? "bg-red-600 text-white"
                    : "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                }`}
              >
                Credit In
              </button>
              <button
                type="button"
                onClick={() => setLoanType("lent")}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  loanType === "lent"
                    ? "bg-green-600 text-white"
                    : "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                }`}
              >
                Credit Out
              </button>
            </div>
          </div>

          {/* Counterparty Name */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Person/Entity Name *
            </label>
            <input
              type="text"
              value={counterpartyName}
              onChange={(e) => setCounterpartyName(e.target.value)}
              placeholder="John Doe, ABC Company, etc."
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Principal Amount */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Amount *
            </label>
            <input
              type="number"
              value={principalAmount}
              onChange={(e) => setPrincipalAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Interest Rate */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Interest Rate (%) - Optional
            </label>
            <input
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Account */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Account
            </label>
            <select
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              disabled={isLoadingOptions || accountsList.length === 0}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-zinc-100 disabled:cursor-not-allowed dark:disabled:bg-zinc-800"
            >
              {isLoadingOptions ? (
                <option>Loading accounts...</option>
              ) : accountsList.length === 0 ? (
                <option>No accounts available</option>
              ) : (
                accountsList.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Type
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setTransactionType("personal")}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  transactionType === "personal"
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                }`}
              >
                Personal
              </button>
              <button
                type="button"
                onClick={() => setTransactionType("business")}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  transactionType === "business"
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                }`}
              >
                Business
              </button>
            </div>
          </div>

          {/* Business (if type = business) */}
          {transactionType === "business" && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Business
              </label>
              <select
                value={businessId}
                onChange={(e) => setBusinessId(e.target.value)}
                disabled={isLoadingOptions || businessesList.length === 0}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-zinc-100 disabled:cursor-not-allowed dark:disabled:bg-zinc-800"
              >
                {isLoadingOptions ? (
                  <option>Loading businesses...</option>
                ) : businessesList.length === 0 ? (
                  <option>No businesses available</option>
                ) : (
                  businessesList.map((bus) => (
                    <option key={bus.id} value={bus.id}>
                      {bus.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          {/* Borrowed Date */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Date
            </label>
            <input
              type="date"
              value={borrowedDate}
              onChange={(e) => setBorrowedDate(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Due Date - Optional
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Notes
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any notes about this loan..."
              rows={3}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || isLoadingOptions || !account}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {isLoading ? "Creating..." : "Add Loan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
