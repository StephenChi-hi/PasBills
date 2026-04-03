"use client";

import { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { useCurrency } from "@/lib/currency/currency-context";
import { CURRENCIES } from "@/lib/currency/currencies";
import { useTransactionStore } from "@/lib/stores/transaction-store";
import { getIncomeCategoryById } from "./constants/incomeCategories";
import { getExpenseCategoryById } from "./constants/expenseCategories";
import { getAccountName } from "./constants/accounts";
import { getBusinessById } from "./constants/businesses";
import { EditTransactionModal } from "./EditTransactionModal";
import { createClient } from "@/lib/supabase/client";

interface Account {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  categoryId: string;
  from: string; // account id
  to: string; // account id
  businessId?: string; // which business this transaction is for
  date: string;
  isInternal?: boolean; // true if between own accounts
}

interface TransactionListCardProps {
  transactions?: Transaction[];
}

interface DatabaseTransaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category_id: string;
  from_account_id: string;
  to_account_id: string;
  business_id: string;
  is_business: boolean;
  transaction_date: string;
}

// Helper to get icon component
function getIconComponent(iconName: string) {
  const iconKey = iconName as keyof typeof Icons;
  const IconComponent = Icons[iconKey] as React.ComponentType<{
    className: string;
  }>;
  return IconComponent || Icons.HelpCircle;
}

// Format date from ISO format
function formatTransactionDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    const daysAgo = Math.floor(
      (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysAgo < 7) {
      return `${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}

export function TransactionListCard({
  transactions: propTransactions,
}: TransactionListCardProps) {
  const [displayCount, setDisplayCount] = useState(10);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [transactionsList, setTransactionsList] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [accountsMap, setAccountsMap] = useState<Record<string, Account>>({});
  const [categoriesMap, setCategoriesMap] = useState<Record<string, Category>>(
    {},
  );
  const { currentCurrency } = useCurrency();
  const { refetchTrigger } = useTransactionStore();
  const ITEMS_PER_PAGE = 10;

  // Fetch transactions from database
  useEffect(() => {
    console.log(
      "🔄 TransactionListCard useEffect triggered, refetchTrigger =",
      refetchTrigger,
    );
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        console.log("Fetching transactions for user:", user.id);

        // Fetch accounts
        const { data: accountsData } = await supabase
          .from("accounts")
          .select("id, name")
          .eq("user_id", user.id);

        if (accountsData) {
          const accMap = accountsData.reduce(
            (acc, a) => ({ ...acc, [a.id]: a }),
            {} as Record<string, Account>,
          );
          setAccountsMap(accMap);
        }

        // Fetch categories
        const { data: categoriesData } = await supabase
          .from("categories")
          .select("id, name, icon")
          .or(`user_id.is.null,user_id.eq.${user.id}`);

        if (categoriesData) {
          const catMap = categoriesData.reduce(
            (acc, c) => ({ ...acc, [c.id]: c }),
            {} as Record<string, Category>,
          );
          setCategoriesMap(catMap);
        }

        // Fetch transactions
        const { data: txData, error } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("transaction_date", { ascending: false })
          .limit(100);

        if (error) {
          console.error("Error fetching transactions:", error);
          setLoading(false);
          return;
        }

        // Transform database transactions to Transaction interface
        const transformedTransactions: Transaction[] = (txData || []).map(
          (tx: DatabaseTransaction) => ({
            id: tx.id,
            description: tx.description,
            amount: tx.amount,
            type: tx.type,
            categoryId: tx.category_id || "",
            from: tx.from_account_id || "",
            to: tx.to_account_id || "",
            businessId: tx.business_id,
            date: formatTransactionDate(tx.transaction_date),
            isInternal:
              !tx.is_business && tx.from_account_id && tx.to_account_id
                ? true
                : false,
          }),
        );

        console.log(
          "Transformed transactions:",
          transformedTransactions.length,
        );
        setTransactionsList(transformedTransactions);
      } catch (err) {
        console.error("Error in fetchTransactions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [refetchTrigger]);

  const formatCurrency = (value: number) => {
    const currency = CURRENCIES[currentCurrency as keyof typeof CURRENCIES];
    if (!currency) return value.toFixed(2);

    // Database stores amount in NGN, convert to selected currency
    // NGN → USD: divide by NGN rate
    // USD → selected currency: multiply by currency rate
    const ngnRate = CURRENCIES.NGN.rateToUSD; // 1550
    const valueInUSD = value / ngnRate;
    const convertedValue = valueInUSD * currency.rateToUSD;

    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(convertedValue);

    return `${currency.symbol}${formatted}`;
  };

  const toggleViewMore = () => {
    setDisplayCount(displayCount + ITEMS_PER_PAGE);
  };

  const toggleViewLess = () => {
    setDisplayCount(10);
  };

  const handleSaveTransaction = (updatedTransaction: Transaction) => {
    setTransactionsList((prev) =>
      prev.map((t) =>
        t.id === updatedTransaction.id ? updatedTransaction : t,
      ),
    );
    setSelectedTransaction(null);
    console.log("Transaction updated:", updatedTransaction);
  };

  const handleDeleteTransaction = (transactionId: string) => {
    setTransactionsList((prev) => prev.filter((t) => t.id !== transactionId));
    setSelectedTransaction(null);
    console.log("Transaction deleted:", transactionId);
  };

  const visibleTransactions = transactionsList.slice(0, displayCount);
  const hasMore = transactionsList.length > displayCount;
  const showingMore = displayCount > 10;

  return (
    <div className="rounded-lg border border-zinc-200 h-screen overflow-y-auto   bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
          Recent Transactions
        </h3>
      </div>

      <div className="mt-4 space-y-3 flex-1">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Loading transactions...
            </p>
          </div>
        ) : transactionsList.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No transactions yet
            </p>
          </div>
        ) : (
          visibleTransactions.map((transaction) => {
            const isIncome = transaction.type === "income";
            const category = categoriesMap[transaction.categoryId];
            const business = transaction.businessId
              ? getBusinessById(transaction.businessId)
              : null;
            const isInternal = transaction.isInternal;

            const CategoryIcon = category?.icon
              ? getIconComponent(category.icon)
              : null;

            return (
              <div
                key={transaction.id}
                onClick={() => setSelectedTransaction(transaction)}
                className="flex flex-col gap-2 rounded-md border p-3 transition-colors border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  {/* Left side: Icon and details */}
                  <div className="flex flex-1 items-start gap-3 min-w-0">
                    {/* Category Icon */}
                    <div
                      className={`inline-block font-medium px-2 py-1 rounded ${
                        isIncome
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
                      }`}
                      // className="mt-1 flex-shrink-0"
                    >
                      {CategoryIcon ? (
                        <CategoryIcon className="h-5 w-5 " />
                      ) : (
                        <div className="h-5 w-5" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1  min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                          {transaction.description}
                        </p>
                        {isInternal && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-200 px-2 py-0.5 text-xs font-semibold text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                            Internal
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 flex flex-col sm:flex-row sm:gap-4">
                        {/* Category & Business info */}
                        <p className="text-xs">
                          <span>
                            {category?.name} {transaction.description}
                          </span>
                          {business && business.id !== "personal" && (
                            <span className="ml-2 text-zinc-600 dark:text-zinc-400">
                              • {business.name}
                            </span>
                          )}
                        </p>
                        {/* From/To accounts */}
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {accountsMap[transaction.from]?.name || "Unknown"} →{" "}
                          {accountsMap[transaction.to]?.name || "Unknown"}
                        </p>
                        {/* Date */}
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {transaction.date}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="ml-2 text-right flex-shrink-0">
                    <p
                      className={`text-sm font-semibold ${
                        isIncome
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination buttons at bottom */}
      {(hasMore || showingMore) && (
        <div className="mt-4 flex gap-2 justify-center">
          {showingMore && (
            <button
              onClick={toggleViewLess}
              className="px-3 py-1.5 text-xs font-medium rounded text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View Less
            </button>
          )}
          {hasMore && (
            <button
              onClick={toggleViewMore}
              className="px-3 py-1.5 text-xs font-medium rounded text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View More
            </button>
          )}
        </div>
      )}

      {/* Edit Transaction Modal */}
      {selectedTransaction && (
        <EditTransactionModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onSave={handleSaveTransaction}
          onDelete={handleDeleteTransaction}
        />
      )}
    </div>
  );
}
