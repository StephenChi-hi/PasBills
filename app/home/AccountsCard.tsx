"use client";

import { useState, useEffect } from "react";
import { useCurrency } from "@/lib/currency/currency-context";
import { CURRENCIES } from "@/lib/currency/currencies";
import { useTransactionStore } from "@/lib/stores/transaction-store";
import { createClient } from "@/lib/supabase/client";
import { AccountModal, type SubAccount } from "./AccountModal";

interface Account {
  id: string;
  name: string;
  balance: number;
  type: string;
  color?: string;
  currency?: string;
}

interface AccountsCardProps {
  accounts?: Account[];
}

// Mock sub-accounts data - in production this would come from your database
const mockSubAccounts: Record<string, SubAccount[]> = {
  "1": [
    { id: "check-1", name: "Primary Account", balance: 8200.5 },
    { id: "check-2", name: "Paycheck Account", balance: 4299.75 },
  ],
  "2": [
    { id: "save-1", name: "Emergency Fund", balance: 25000 },
    { id: "save-2", name: "Vacation Fund", balance: 15000 },
    { id: "save-3", name: "Investment Fund", balance: 5000.75 },
  ],
  "3": [
    { id: "biz-1", name: "Operations", balance: 35230.5 },
    { id: "biz-2", name: "Payroll", balance: 28000 },
    { id: "biz-3", name: "Marketing", balance: 15000 },
  ],
  "4": [
    { id: "inv-1", name: "Stocks Portfolio", balance: 40000 },
    { id: "inv-2", name: "Crypto Holdings", balance: 15000 },
    { id: "inv-3", name: "ETF Index", balance: 10000 },
  ],
  "5": [{ id: "cash-1", name: "Wallet", balance: 2500 }],
  "6": [
    { id: "crypto-1", name: "Bitcoin Wallet", balance: 12000 },
    { id: "crypto-2", name: "Ethereum Wallet", balance: 8000 },
    { id: "crypto-3", name: "Altcoins", balance: 3000 },
  ],
};

export function AccountsCard({ accounts = [] }: AccountsCardProps) {
  const [selectedAccountType, setSelectedAccountType] = useState<string | null>(
    null,
  );
  const [accountsList, setAccountsList] = useState<Account[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { currentCurrency } = useCurrency();
  const { refetchTrigger } = useTransactionStore();

  const accountTypes = [
    { key: "cash", label: "Cash", color: "red" },
    { key: "checking", label: "Checking", color: "blue" },
    { key: "savings", label: "Savings", color: "green" },
    { key: "business", label: "Business", color: "purple" },
    { key: "investment", label: "Investment", color: "orange" },
    { key: "crypto", label: "Crypto", color: "teal" },
  ];

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!userId) return;

      try {
        setIsLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase
          .from("accounts")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching accounts:", error);
          return;
        }

        const formattedAccounts: Account[] = (data || []).map((acc: any) => ({
          id: acc.id,
          name: acc.name,
          balance: acc.balance,
          type: acc.type.charAt(0).toUpperCase() + acc.type.slice(1),
          color: acc.type,
          currency: acc.currency,
        }));

        setAccountsList(formattedAccounts);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccounts();
  }, [userId, refetchTrigger]);

  const formatCurrency = (value: number, storedCurrency?: string) => {
    const currency = CURRENCIES[currentCurrency as keyof typeof CURRENCIES];
    if (!currency) return value.toFixed(2);

    // If no stored currency or stored currency matches current, just format without conversion
    if (!storedCurrency || storedCurrency === currentCurrency) {
      const formatted = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
      return `${currency.symbol}${formatted}`;
    }

    // Convert from stored currency to USD, then to selected currency
    const storedCurrencyObj =
      CURRENCIES[storedCurrency as keyof typeof CURRENCIES];
    if (!storedCurrencyObj) {
      // If we can't find the stored currency, assume it was USD
      const convertedValue = value * currency.rateToUSD;
      const formatted = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(convertedValue);
      return `${currency.symbol}${formatted}`;
    }

    // Convert from stored currency to USD
    const valueInUSD = value / storedCurrencyObj.rateToUSD;
    // Convert from USD to selected currency
    const convertedValue = valueInUSD * currency.rateToUSD;

    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(convertedValue);

    return `${currency.symbol}${formatted}`;
  };

  const totalBalance = accountsList.reduce((sum, acc) => sum + acc.balance, 0);

  // Group accounts by type and calculate totals
  const accountsByType = accountTypes.reduce(
    (acc, typeObj) => {
      acc[typeObj.key] = accountsList.filter(
        (account) => account.type.toLowerCase() === typeObj.key,
      );
      return acc;
    },
    {} as Record<string, Account[]>,
  );

  const getTypeBalance = (type: string) => {
    return (accountsByType[type] || []).reduce(
      (sum, acc) => sum + acc.balance,
      0,
    );
  };

  const colorClasses: Record<string, string> = {
    blue: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
    green: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
    purple:
      "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400",
    orange:
      "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400",
    red: "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400",
    teal: "bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-400",
    cash: "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400",
    checking: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
    savings:
      "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
    business:
      "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400",
    investment:
      "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400",
    crypto: "bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-400",
  };

  const barColorMap: Record<string, string> = {
    blue: "from-blue-300 to-blue-600",
    green: "from-green-300 to-green-600",
    purple: "from-purple-300 to-purple-600",
    orange: "from-orange-300 to-orange-600",
    red: "from-red-300 to-red-600",
    teal: "from-teal-300 to-teal-600",
    cash: "from-red-300 to-red-600",
    checking: "from-blue-300 to-blue-600",
    savings: "from-green-300 to-green-600",
    business: "from-purple-300 to-purple-600",
    investment: "from-orange-300 to-orange-600",
    crypto: "from-teal-300 to-teal-600",
  };

  const handleAddAccount = async (
    name: string,
    balance: number,
    type: string,
  ) => {
    // Refetch accounts to get the newly added account with real UUID from database
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching accounts:", error);
        return;
      }

      const formattedAccounts: Account[] = (data || []).map((acc: any) => ({
        id: acc.id,
        name: acc.name,
        balance: acc.balance,
        type: acc.type.charAt(0).toUpperCase() + acc.type.slice(1),
        color: acc.type,
        currency: acc.currency,
      }));

      setAccountsList(formattedAccounts);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleUpdateAccount = async (accountId: string, newName: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("accounts")
        .update({ name: newName })
        .eq("id", accountId)
        .eq("user_id", userId);

      if (error) {
        console.error("Error updating account:", error);
        return false;
      }

      // Update local state
      setAccountsList((prev) =>
        prev.map((acc) =>
          acc.id === accountId ? { ...acc, name: newName } : acc,
        ),
      );
      return true;
    } catch (error) {
      console.error("Error:", error);
      return false;
    }
  };

  // Get accounts for the selected type
  const typeAccounts = selectedAccountType
    ? accountsByType[selectedAccountType] || []
    : [];
  const typeLabel =
    accountTypes.find((t) => t.key === selectedAccountType)?.label || "";
  const typeColor =
    accountTypes.find((t) => t.key === selectedAccountType)?.color || "blue";
  const typeBalance = selectedAccountType
    ? getTypeBalance(selectedAccountType)
    : 0;

  return (
    <>
      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
          Your Accounts
        </h3>

        {isLoading ? (
          <p className="mt-6 text-center text-sm text-zinc-500">
            Loading accounts...
          </p>
        ) : (
          <div className="mt-6 space-y-3">
            {accountTypes.map(({ key, label, color }) => {
              const typeBalance = getTypeBalance(key);
              const colorClass = colorClasses[color];
              const barGradient = barColorMap[color];
              const percentage =
                totalBalance > 0 ? (typeBalance / totalBalance) * 100 : 0;

              return (
                <div
                  key={key}
                  onClick={() => setSelectedAccountType(key)}
                  className="space-y-1 cursor-pointer rounded-lg transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 p-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`rounded-full p-2 ${colorClass}`}>
                        <div className="h-3 w-3 rounded-full bg-current" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {label}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {(accountsByType[key] || []).length} account
                          {(accountsByType[key] || []).length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(
                        typeBalance,
                        accountsByType[key]?.[0]?.currency,
                      )}
                    </p>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                    <div
                      className={`bg-gradient-to-r ${barGradient} h-full rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 text-right">
                    {percentage.toFixed(1)}% of total
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 border-t border-zinc-200 dark:border-zinc-700 pt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Total Balance
            </p>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {formatCurrency(totalBalance, currentCurrency)}
            </p>
          </div>
        </div>
      </div>

      {selectedAccountType && (
        <AccountModal
          isOpen={selectedAccountType !== null}
          accountName={typeLabel}
          accountColor={typeColor}
          accountType={selectedAccountType}
          subAccounts={typeAccounts.map((acc) => ({
            id: acc.id,
            name: acc.name,
            balance: acc.balance,
            currency: acc.currency,
          }))}
          totalBalance={typeBalance}
          userId={userId}
          onClose={() => setSelectedAccountType(null)}
          onAddAccount={handleAddAccount}
          onUpdateAccount={handleUpdateAccount}
        />
      )}
    </>
  );
}
