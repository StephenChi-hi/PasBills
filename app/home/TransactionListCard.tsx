"use client";

import { useState } from "react";
import * as Icons from "lucide-react";
import { useCurrency } from "@/lib/currency/currency-context";
import { CURRENCIES } from "@/lib/currency/currencies";
import { getIncomeCategoryById } from "./constants/incomeCategories";
import { getExpenseCategoryById } from "./constants/expenseCategories";
import { getAccountName } from "./constants/accounts";
import { getBusinessById } from "./constants/businesses";

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

// Helper to get icon component
function getIconComponent(iconName: string) {
  const iconKey = iconName as keyof typeof Icons;
  const IconComponent = Icons[iconKey] as React.ComponentType<{
    className: string;
  }>;
  return IconComponent;
}

export function TransactionListCard({
  transactions = [
    {
      id: "1",
      description: "Freelance Project Payment",
      amount: 2500,
      type: "income",
      categoryId: "personal_freelance",
      from: "client_account",
      to: "primary_checking",
      businessId: "personal",
      date: "Today",
    },
    {
      id: "2",
      description: "Office Supplies",
      amount: 145.5,
      type: "expense",
      categoryId: "business_supplies",
      from: "primary_checking",
      to: "supplies_vendor",
      businessId: "digital_agency",
      date: "Today",
    },
    {
      id: "3",
      description: "Transfer to Savings",
      amount: 5000,
      type: "income",
      categoryId: "personal_salary",
      from: "primary_checking",
      to: "savings",
      isInternal: true,
      businessId: "personal",
      date: "Yesterday",
    },
    {
      id: "4",
      description: "Software Subscription",
      amount: 99,
      type: "expense",
      categoryId: "business_software",
      from: "primary_checking",
      to: "vendor_software",
      businessId: "saas_product",
      date: "2 days ago",
    },
    {
      id: "5",
      description: "Consulting Project",
      amount: 3200,
      type: "income",
      categoryId: "business_consulting",
      from: "client_account",
      to: "business",
      businessId: "consulting",
      date: "3 days ago",
    },
    {
      id: "6",
      description: "Internet Bill",
      amount: 79.99,
      type: "expense",
      categoryId: "personal_phone",
      from: "primary_checking",
      to: "isp_vendor",
      businessId: "personal",
      date: "4 days ago",
    },
    {
      id: "7",
      description: "Product Sales",
      amount: 1850,
      type: "income",
      categoryId: "business_sales",
      from: "customer_account",
      to: "business",
      businessId: "ecommerce",
      date: "5 days ago",
    },
    {
      id: "8",
      description: "Equipment Purchase",
      amount: 450,
      type: "expense",
      categoryId: "business_equipment",
      from: "business",
      to: "supplier_account",
      businessId: "digital_agency",
      date: "6 days ago",
    },
    {
      id: "9",
      description: "Utility Payment",
      amount: 125.5,
      type: "expense",
      categoryId: "personal_utilities",
      from: "primary_checking",
      to: "power_company",
      businessId: "personal",
      date: "7 days ago",
    },
    {
      id: "10",
      description: "Royalty Payment",
      amount: 560,
      type: "income",
      categoryId: "business_royalties",
      from: "publisher_account",
      to: "business",
      businessId: "content",
      date: "1 week ago",
    },
    {
      id: "11",
      description: "Client Retainer",
      amount: 2800,
      type: "income",
      categoryId: "business_consulting",
      from: "client_account",
      to: "business",
      businessId: "consulting",
      date: "1 week ago",
    },
    {
      id: "12",
      description: "Marketing Expenses",
      amount: 350,
      type: "expense",
      categoryId: "business_marketing",
      from: "business",
      to: "ad_platform",
      businessId: "digital_agency",
      date: "8 days ago",
    },
  ],
}: TransactionListCardProps) {
  const [displayCount, setDisplayCount] = useState(10);
  const { currentCurrency } = useCurrency();
  const ITEMS_PER_PAGE = 10;

  const formatCurrency = (value: number) => {
    const currency = CURRENCIES[currentCurrency as keyof typeof CURRENCIES];
    if (!currency) return value.toFixed(2);

    // Convert from USD to selected currency
    const usdToSelectedRate = currency.rateToUSD;
    const convertedValue = value * usdToSelectedRate;

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

  const visibleTransactions = transactions.slice(0, displayCount);
  const hasMore = transactions.length > displayCount;
  const showingMore = displayCount > 10;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
          Recent Transactions
        </h3>
      </div>

      <div className="mt-4 space-y-3 flex-1">
        {visibleTransactions.map((transaction) => {
          const isIncome = transaction.type === "income";
          const category = isIncome
            ? getIncomeCategoryById(transaction.categoryId)
            : getExpenseCategoryById(transaction.categoryId);
          const business = transaction.businessId
            ? getBusinessById(transaction.businessId)
            : null;
          const isInternal = transaction.isInternal;

          const CategoryIcon = category?.iconName
            ? getIconComponent(category.iconName)
            : null;

          return (
            <div
              key={transaction.id}
              className="flex flex-col gap-2 rounded-md border p-3 transition-colors border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800"
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
                        <span>{category?.name}</span>
                        {business && business.id !== "personal" && (
                          <span className="ml-2 text-zinc-600 dark:text-zinc-400">
                            • {business.name}
                          </span>
                        )}
                      </p>
                      {/* From/To accounts */}
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {getAccountName(transaction.from)} →{" "}
                        {getAccountName(transaction.to)}
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
        })}
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
    </div>
  );
}
