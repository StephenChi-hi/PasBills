"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useCurrency } from "@/lib/currency/currency-context";
import { CURRENCIES } from "@/lib/currency/currencies";
import { AddBusinessModal } from "./AddBusinessModal";
import { EditBusinessModal } from "./EditBusinessModal";
import { Transaction } from "./TransactionListCard";

interface Business {
  id: string;
  name: string;
  revenue: number;
  expenses: number;
  status: "profit" | "loss";
  description?: string;
}

interface BusinessesCardProps {
  businesses?: Business[];
  transactions?: Transaction[];
}

export function BusinessesCard({
  businesses = [
    {
      id: "1",
      name: "Digital Agency",
      revenue: 45000,
      expenses: 28000,
      status: "profit",

      description:
        "Web design, branding, and digital marketing services for small to medium businesses",
    },
    {
      id: "2",
      name: "SaaS Product",
      revenue: 32500,
      expenses: 18000,
      status: "profit",
      description:
        "Cloud-based project management software with recurring subscription model",
    },
    {
      id: "3",
      name: "Consulting",
      revenue: 22000,
      expenses: 8500,
      status: "profit",
      description:
        "Business strategy and technology consulting for enterprise clients",
    },
    {
      id: "4",
      name: "E-Commerce",
      revenue: 15000,
      expenses: 18000,
      status: "loss",
      description: "Online store selling handmade artisan products",
    },
  ],
  transactions = [],
}: BusinessesCardProps) {
  const [businessList, setBusinessList] = useState<Business[]>(businesses);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(
    null,
  );
  const [transactionList, setTransactionList] = useState(transactions);
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

  // Calculate revenue and expenses for a business from transactions
  const calculateBusinessMetrics = (businessId: string) => {
    const revenue = transactionList
      .filter((t) => t.businessId === businessId && t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactionList
      .filter((t) => t.businessId === businessId && t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return { revenue, expenses };
  };

  const handleAddBusiness = (name: string, description: string) => {
    const newBusiness: Business = {
      id: `${Date.now()}`,
      name,
      description,
      revenue: 0,
      expenses: 0,
      status: "profit",
    };
    setBusinessList([...businessList, newBusiness]);
  };

  const handleSaveBusiness = (updatedBusiness: Business) => {
    setBusinessList((prev) =>
      prev.map((b) => (b.id === updatedBusiness.id ? updatedBusiness : b)),
    );
    setSelectedBusiness(null);
    console.log("Business updated:", updatedBusiness);
  };

  const handleDeleteBusiness = (businessId: string) => {
    setBusinessList((prev) => prev.filter((b) => b.id !== businessId));
    setSelectedBusiness(null);
    console.log("Business deleted:", businessId);
  };

  const totalRevenue = businessList.reduce((sum, b) => {
    const { revenue } = calculateBusinessMetrics(b.id);
    return sum + revenue;
  }, 0);

  const totalExpenses = businessList.reduce((sum, b) => {
    const { expenses } = calculateBusinessMetrics(b.id);
    return sum + expenses;
  }, 0);

  const totalProfit = totalRevenue - totalExpenses;

  return (
    <>
      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
            Businesses
          </h3>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {businessList.map((business) => {
            const { revenue, expenses } = calculateBusinessMetrics(business.id);
            const profit = revenue - expenses;
            const isProfit = profit >= 0;
            const margin =
              revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : "0";

            return (
              <div
                key={business.id}
                onClick={() => setSelectedBusiness(business)}
                className="rounded-md border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800 cursor-pointer transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex justify-between">
                      <div>
                        {" "}
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {business.name}
                        </p>
                      </div>
                    </div>
                    {business.description && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                        {business.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-zinc-500 dark:text-zinc-400">Revenue</p>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(revenue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-500 dark:text-zinc-400">Expenses</p>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(expenses)}
                    </p>
                  </div>
                </div>

                <div className="mt-2 border-t border-zinc-200 dark:border-zinc-700 pt-2 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Profit/Loss
                    </p>
                    <p
                      className={`text-sm font-bold ${
                        isProfit
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {isProfit ? "+" : ""}
                      {formatCurrency(profit)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Margin
                    </p>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {margin}%
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 border-t border-zinc-200 dark:border-zinc-700 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">
              Total Revenue
            </span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {formatCurrency(totalRevenue)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">
              Total Expenses
            </span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {formatCurrency(totalExpenses)}
            </span>
          </div>
          <div className="flex justify-between text-sm border-t border-zinc-200 dark:border-zinc-700 pt-2">
            <span className="text-zinc-600 dark:text-zinc-400 font-semibold">
              Total Profit
            </span>
            <span
              className={`text-sm font-bold ${
                totalProfit >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {totalProfit >= 0 ? "+" : ""}
              {formatCurrency(totalProfit)}
            </span>
          </div>
        </div>
      </div>

      <AddBusinessModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddBusiness={handleAddBusiness}
      />

      {selectedBusiness && (
        <EditBusinessModal
          business={{
            ...selectedBusiness,
            revenue: calculateBusinessMetrics(selectedBusiness.id).revenue,
            expenses: calculateBusinessMetrics(selectedBusiness.id).expenses,
          }}
          onClose={() => setSelectedBusiness(null)}
          onSave={handleSaveBusiness}
          onDelete={handleDeleteBusiness}
        />
      )}
    </>
  );
}
