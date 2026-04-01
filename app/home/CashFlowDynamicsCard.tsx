"use client";

import * as Icons from "lucide-react";
import { useCurrency } from "@/lib/currency/currency-context";
import { CURRENCIES } from "@/lib/currency/currencies";
import { incomeCategories } from "./constants/incomeCategories";
import { expenseCategories } from "./constants/expenseCategories";

// Helper to get icon component
function getIconComponent(iconName: string) {
  const iconKey = iconName as keyof typeof Icons;
  const IconComponent = Icons[iconKey] as React.ComponentType<{
    className: string;
  }>;
  return IconComponent;
}

// Sample data - in a real app, this would come from backend
const categoryAmounts = {
  // Income
  personal_salary: 5000,
  personal_freelance: 2500,
  personal_investment: 1200,
  personal_refund: 0,
  personal_bonus: 0,
  personal_other: 300,
  business_sales: 8500,
  business_services: 3200,
  business_consulting: 4100,
  business_royalties: 560,
  business_subscription: 0,
  business_other: 0,

  // Expenses
  personal_groceries: 450,
  personal_utilities: 130,
  personal_transportation: 280,
  personal_entertainment: 150,
  personal_healthcare: 0,
  personal_shopping: 200,
  personal_dining: 320,
  personal_gas: 90,
  personal_rent: 1500,
  personal_phone: 80,
  business_supplies: 145,
  business_software: 99,
  business_marketing: 350,
  business_payroll: 2500,
  business_equipment: 450,
  business_travel: 200,
  business_client: 0,
  business_hosting: 45,
  business_professional: 150,
};

export function CashFlowDynamicsCard() {
  const { currentCurrency } = useCurrency();

  const formatCurrency = (value: number) => {
    const currency = CURRENCIES[currentCurrency as keyof typeof CURRENCIES];
    if (!currency) return value.toFixed(0);

    // Convert from USD to selected currency
    const usdToSelectedRate = currency.rateToUSD;
    const convertedValue = value * usdToSelectedRate;

    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(convertedValue);

    return `${currency.symbol}${formatted}`;
  };

  // Get personal and business income
  const personalIncome = incomeCategories.filter(
    (cat) => cat.subcategory === "personal",
  );
  const businessIncome = incomeCategories.filter(
    (cat) => cat.subcategory === "business",
  );

  // Get personal and business expenses
  const personalExpenses = expenseCategories.filter(
    (cat) => cat.subcategory === "personal",
  );
  const businessExpenses = expenseCategories.filter(
    (cat) => cat.subcategory === "business",
  );

  const renderCategoryItem = (
    category: (typeof incomeCategories)[0] | (typeof expenseCategories)[0],
  ) => {
    const IconComponent = getIconComponent(category.iconName);
    const amount =
      categoryAmounts[category.id as keyof typeof categoryAmounts] || 0;

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

  const calcPersonalIncome = personalIncome.reduce((sum, cat) => {
    return sum + (categoryAmounts[cat.id as keyof typeof categoryAmounts] || 0);
  }, 0);

  const calcBusinessIncome = businessIncome.reduce((sum, cat) => {
    return sum + (categoryAmounts[cat.id as keyof typeof categoryAmounts] || 0);
  }, 0);

  const calcPersonalExpenses = personalExpenses.reduce((sum, cat) => {
    return sum + (categoryAmounts[cat.id as keyof typeof categoryAmounts] || 0);
  }, 0);

  const calcBusinessExpenses = businessExpenses.reduce((sum, cat) => {
    return sum + (categoryAmounts[cat.id as keyof typeof categoryAmounts] || 0);
  }, 0);

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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="grid grid-cols-2 gap-4 border-t border-zinc-200 dark:border-zinc-700 px-6 py-4 bg-zinc-50 dark:bg-zinc-800">
        <div className="text-center">
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">
            Total Income
          </p>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            {formatCurrency(calcPersonalIncome + calcBusinessIncome)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">
            Total Expenses
          </p>
          <p className="text-lg font-bold text-red-600 dark:text-red-400">
            {formatCurrency(calcPersonalExpenses + calcBusinessExpenses)}
          </p>
        </div>
      </div>
    </div>
  );
}
