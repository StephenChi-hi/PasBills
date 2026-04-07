"use client";

import { useCurrency } from "@/lib/currency/currency-context";
import { CURRENCIES } from "@/lib/currency/currencies";

interface CashFlowCardProps {
  inflow?: number;
  outflow?: number;
}

export function CashFlowCard({ inflow = 0, outflow = 0 }: CashFlowCardProps) {
  const { currentCurrency } = useCurrency();

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

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
        Transaction Comparison
      </h3>

      {/* Amount Comparison Row */}
      <div className="mt-6 grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
            Inflow
          </p>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(inflow)}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
            Outflow
          </p>
          <p className="text-xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(outflow)}
          </p>
        </div>
      </div>

      {/* Horizontal Stacked Bar */}
      <div className="mb-4">
        <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium mb-2">
          Total Flow: {formatCurrency(inflow + outflow)}
        </p>
        {inflow + outflow > 0 ? (
          <div className="flex h-2 w-full overflow-hidden rounded-full shadow-inner">
            <div
              className="bg-gradient-to-r from-green-500 to-green-600 transition-all duration-300"
              style={{
                width: `${(inflow / (inflow + outflow)) * 100}%`,
              }}
              title={`Inflow: ${((inflow / (inflow + outflow)) * 100).toFixed(1)}%`}
            />
            <div
              className="bg-gradient-to-r from-red-500 to-red-600 transition-all duration-300"
              style={{
                width: `${(outflow / (inflow + outflow)) * 100}%`,
              }}
              title={`Outflow: ${((outflow / (inflow + outflow)) * 100).toFixed(1)}%`}
            />
          </div>
        ) : (
          <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full" />
        )}
      </div>

      {/* Percentage Labels */}
      <div className="flex justify-between text-xs font-semibold mb-4">
        <span className="text-green-600 dark:text-green-400">
          {inflow + outflow > 0
            ? ((inflow / (inflow + outflow)) * 100).toFixed(1)
            : "0"}
          %
        </span>
        <span className="text-red-600 dark:text-red-400">
          {inflow + outflow > 0
            ? ((outflow / (inflow + outflow)) * 100).toFixed(1)
            : "0"}
          %
        </span>
      </div>
    </div>
  );
}
