"use client";

import { useCurrency } from "@/lib/currency/currency-context";
import { CURRENCIES } from "@/lib/currency/currencies";

interface BalanceCardProps {
  liquidBalance?: number;
  netWorth?: number;
}

export function BalanceCard({
  liquidBalance = 0,
  netWorth = 0,
}: BalanceCardProps) {
  const { currentCurrency } = useCurrency();

  const formatCurrency = (value: number) => {
    const currency = CURRENCIES[currentCurrency as keyof typeof CURRENCIES];
    if (!currency) return value.toFixed(2);

    // Value comes from DB in NGN, convert to selected currency
    // First: NGN to USD, then USD to selected currency
    const ngnRate = CURRENCIES.NGN.rateToUSD; // 1 USD = 1550 NGN
    const valueInUSD = value / ngnRate;
    const convertedValue = valueInUSD * currency.rateToUSD;

    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(convertedValue);

    return `${currency.symbol}${formatted}`;
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
        Financial Summary
      </h3>

      <div className="mt-6 space-y-4">
        {/* Liquid Balance */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Liquid Balance
            </p>
            <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(liquidBalance)}
            </p>
          </div>
        </div>

        <div className="border-t border-zinc-200 dark:border-zinc-700" />

        {/* Net Worth */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Net Worth:{" "}
              <span className=" font-bold">{formatCurrency(netWorth)}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
