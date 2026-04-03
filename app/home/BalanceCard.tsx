"use client";

import { useEffect, useState } from "react";
import { useCurrency } from "@/lib/currency/currency-context";
import { CURRENCIES } from "@/lib/currency/currencies";
import { useTransactionStore } from "@/lib/stores/transaction-store";
import { createClient } from "@/lib/supabase/client";

interface BalanceCardProps {
  liquidBalance?: number;
  netWorth?: number;
}

export function BalanceCard({
  liquidBalance: initialLiquidBalance = 0,
  netWorth: initialNetWorth = 0,
}: BalanceCardProps) {
  const { currentCurrency } = useCurrency();
  const [liquidBalance, setLiquidBalance] = useState(initialLiquidBalance);
  const [netWorth, setNetWorth] = useState(initialNetWorth);
  const [loading, setLoading] = useState(true);
  const { refetchTrigger } = useTransactionStore();

  useEffect(() => {
    console.log(
      "🔄 BalanceCard useEffect triggered, refetchTrigger =",
      refetchTrigger,
    );
    const fetchBalance = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("balance")
          .select("liquid_balance, net_worth")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching balance:", error);
          setLoading(false);
          return;
        }

        if (data) {
          setLiquidBalance(data.liquid_balance);
          setNetWorth(data.net_worth);
        }
      } catch (err) {
        console.error("Error fetching balance:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [refetchTrigger]);

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
              {loading ? "Loading..." : formatCurrency(liquidBalance)}
            </p>
          </div>
        </div>

        <div className="border-t border-zinc-200 dark:border-zinc-700" />

        {/* Net Worth */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Net Worth:{" "}
              <span className=" font-bold">
                {loading ? "Loading..." : formatCurrency(netWorth)}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
