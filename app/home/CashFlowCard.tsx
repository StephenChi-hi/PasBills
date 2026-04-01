"use client";

import { useCurrency } from "@/lib/currency/currency-context";
import { CURRENCIES } from "@/lib/currency/currencies";

interface CashFlowCardProps {
  inflow?: number;
  outflow?: number;
}

export function CashFlowCard({
  inflow = 8500.75,
  outflow = 3200.25,
}: CashFlowCardProps) {
  const { currentCurrency } = useCurrency();

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

  const total = inflow + outflow;
  const inflowPercent = (inflow / total) * 100;
  const outflowPercent = (outflow / total) * 100;
  const netFlow = inflow - outflow;
  const isPositive = netFlow >= 0;

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
          Total Flow: {formatCurrency(total)}
        </p>
        <div className="flex h-2 w-full overflow-hidden rounded-full shadow-inner">
          <div
            className="bg-gradient-to-r from-green-500 to-green-600 transition-all duration-300"
            style={{ width: `${inflowPercent}%` }}
            title={`Inflow: ${inflowPercent.toFixed(1)}%`}
          />
          <div
            className="bg-gradient-to-r from-red-500 to-red-600 transition-all duration-300"
            style={{ width: `${outflowPercent}%` }}
            title={`Outflow: ${outflowPercent.toFixed(1)}%`}
          />
        </div>
      </div>

      {/* Percentage Labels */}
      <div className="flex justify-between text-xs font-semibold mb-4">
        <span className="text-green-600 dark:text-green-400">
          {inflowPercent.toFixed(1)}%
        </span>
        <span className="text-red-600 dark:text-red-400">
          {outflowPercent.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
