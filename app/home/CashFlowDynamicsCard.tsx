"use client";

import { useState } from "react";
import * as Icons from "lucide-react";
import { useCurrency } from "@/lib/currency/currency-context";
import { CURRENCIES } from "@/lib/currency/currencies";
import { useTransactionStore } from "@/lib/stores/transaction-store";

interface Category {
  id: string;
  name: string;
  icon: string;
  type: "income" | "expense";
  category_type: "personal" | "business";
}

interface CategoryAmount {
  [categoryId: string]: number;
}

// Helper to get icon component
function getIconComponent(iconName: string) {
  const iconKey = iconName as keyof typeof Icons;
  const IconComponent = Icons[iconKey] as React.ComponentType<{
    className: string;
  }>;
  return IconComponent || Icons.HelpCircle;
}

export function CashFlowDynamicsCard({
  categories: propCategories = [],
  transactions: propTransactions = [],
}: {
  categories?: Category[];
  transactions?: any[];
}) {
  const { currentCurrency } = useCurrency();

  // Build category amounts from transactions (use camelCase: categoryId)
  const categoryAmounts: CategoryAmount = {};
  (propTransactions || []).forEach((tx: any) => {
    if (tx.categoryId) {
      categoryAmounts[tx.categoryId] =
        (categoryAmounts[tx.categoryId] || 0) + tx.amount;
    }
  });

  const formatCurrency = (value: number) => {
    const currency = CURRENCIES[currentCurrency as keyof typeof CURRENCIES];
    if (!currency) return value.toFixed(0);

    // Database stores amount in NGN, convert to selected currency
    // NGN → USD: divide by NGN rate
    // USD → selected currency: multiply by currency rate
    const ngnRate = CURRENCIES.NGN.rateToUSD; // 1550
    const valueInUSD = value / ngnRate;
    const convertedValue = valueInUSD * currency.rateToUSD;

    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(convertedValue);

    return `${currency.symbol}${formatted}`;
  };

  // Get categories grouped by type and category_type
  // This ensures we get separate category arrays for income vs expense, even if they have the same name
  const personalIncome = propCategories.filter(
    (cat) => cat.type === "income" && cat.category_type === "personal",
  );
  const businessIncome = propCategories.filter(
    (cat) => cat.type === "income" && cat.category_type === "business",
  );
  const personalExpenses = propCategories.filter(
    (cat) => cat.type === "expense" && cat.category_type === "personal",
  );
  const businessExpenses = propCategories.filter(
    (cat) => cat.type === "expense" && cat.category_type === "business",
  );

  const renderCategoryItem = (category: Category) => {
    const IconComponent = getIconComponent(category.icon);
    const amount = categoryAmounts[category.id] || 0;

    if (amount === 0) return null;

    return (
      <div
        key={category.id}
        className="flex items-center justify-between p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex-shrink-0 text-zinc-600 dark:text-zinc-400">
            {IconComponent && <IconComponent className="h-4 w-4" />}
          </div>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 truncate">
            {category.name}
          </p>
        </div>
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 flex-shrink-0 ml-2">
          {formatCurrency(amount)}
        </p>
      </div>
    );
  };

  const calcPersonalIncome = personalIncome.reduce(
    (sum, cat) => sum + (categoryAmounts[cat.id] || 0),
    0,
  );
  const calcBusinessIncome = businessIncome.reduce(
    (sum, cat) => sum + (categoryAmounts[cat.id] || 0),
    0,
  );
  const calcPersonalExpenses = personalExpenses.reduce(
    (sum, cat) => sum + (categoryAmounts[cat.id] || 0),
    0,
  );
  const calcBusinessExpenses = businessExpenses.reduce(
    (sum, cat) => sum + (categoryAmounts[cat.id] || 0),
    0,
  );

  return (
    <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
        <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
          Cash Flow Dynamics
        </h3>
      </div>

      {/* Main Grid - Personal and Business Rows */}
      <div className="space-y-6 p-6">
        {/* PERSONAL ROW */}
        <div>
          <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest mb-4 pb-3 border-b border-zinc-200 dark:border-zinc-700">
            Personal
          </h4>
          <div className="grid grid-cols-2 gap-6">
            {/* Personal Income - Left */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">
                  Income
                </p>
                <p className="text-sm font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(calcPersonalIncome)}
                </p>
              </div>
              <div className="space-y-1">
                {personalIncome.map((cat) => renderCategoryItem(cat))}
                {personalIncome.every((cat) => !categoryAmounts[cat.id]) && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    No income recorded
                  </p>
                )}
              </div>
            </div>

            {/* Personal Expenses - Right */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">
                  Expenses
                </p>
                <p className="text-sm font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(calcPersonalExpenses)}
                </p>
              </div>
              <div className="space-y-1">
                {personalExpenses.map((cat) => renderCategoryItem(cat))}
                {personalExpenses.every((cat) => !categoryAmounts[cat.id]) && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    No expenses recorded
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* BUSINESS ROW */}
        <div>
          <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest mb-4 pb-3 border-b border-zinc-200 dark:border-zinc-700">
            Business
          </h4>
          <div className="grid grid-cols-2 gap-6">
            {/* Business Income - Left */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">
                  Income
                </p>
                <p className="text-sm font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(calcBusinessIncome)}
                </p>
              </div>
              <div className="space-y-1">
                {businessIncome.map((cat) => renderCategoryItem(cat))}
                {businessIncome.every((cat) => !categoryAmounts[cat.id]) && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    No income recorded
                  </p>
                )}
              </div>
            </div>

            {/* Business Expenses - Right */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">
                  Expenses
                </p>
                <p className="text-sm font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(calcBusinessExpenses)}
                </p>
              </div>
              <div className="space-y-1">
                {businessExpenses.map((cat) => renderCategoryItem(cat))}
                {businessExpenses.every((cat) => !categoryAmounts[cat.id]) && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    No expenses recorded
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
