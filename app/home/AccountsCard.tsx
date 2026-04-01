"use client";

import { useState } from "react";
import { useCurrency } from "@/lib/currency/currency-context";
import { CURRENCIES } from "@/lib/currency/currencies";
import { AccountModal, type SubAccount } from "./AccountModal";

interface Account {
  id: string;
  name: string;
  balance: number;
  type: string;
  color?: string;
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
};

export function AccountsCard({
  accounts = [
    {
      id: "5",
      name: "Cash",
      balance: 2500,
      type: "Cash",
      color: "red",
    },
    {
      id: "1",
      name: "Primary Checking",
      balance: 12500.25,
      type: "Checking",
      color: "blue",
    },
    {
      id: "2",
      name: "Savings Account",
      balance: 45000.75,
      type: "Savings",
      color: "green",
    },
    {
      id: "3",
      name: "Business Account",
      balance: 78230.5,
      type: "Business",
      color: "purple",
    },
    {
      id: "4",
      name: "Investment Account",
      balance: 65000,
      type: "Investment",
      color: "orange",
    },
  ],
}: AccountsCardProps) {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );
  const [subAccounts, setSubAccounts] =
    useState<Record<string, SubAccount[]>>(mockSubAccounts);
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

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const colorClasses: Record<string, string> = {
    blue: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
    green: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
    purple:
      "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400",
    orange:
      "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400",
    red: "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400",
  };

  const barColorMap: Record<string, string> = {
    blue: "from-blue-300 to-blue-600",
    green: "from-green-300 to-green-600",
    purple: "from-purple-300 to-purple-600",
    orange: "from-orange-300 to-orange-600",
    red: "from-red-300 to-red-600",
  };

  const handleAddAccount = (name: string, balance: number) => {
    const account = accounts.find((a) => a.id === selectedAccountId);
    if (account && selectedAccountId) {
      const newSubAccount: SubAccount = {
        id: `${selectedAccountId}-${Date.now()}`,
        name,
        balance,
      };
      setSubAccounts((prev) => ({
        ...prev,
        [selectedAccountId]: [
          ...(prev[selectedAccountId] || []),
          newSubAccount,
        ],
      }));
    }
  };

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  const selectedSubAccounts = selectedAccountId
    ? subAccounts[selectedAccountId] || []
    : [];

  return (
    <>
      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
          Your Accounts
        </h3>

        <div className="mt-6 space-y-3">
          {accounts.map((account) => {
            const colorClass = colorClasses[account.color || "blue"];
            const percentage = (account.balance / totalBalance) * 100;
            const barGradient = barColorMap[account.color || "blue"];

            return (
              <div
                key={account.id}
                onClick={() => setSelectedAccountId(account.id)}
                className="space-y-1 cursor-pointer rounded-lg transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 p-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`rounded-full p-2 ${colorClass}`}>
                      <div className="h-3 w-3 rounded-full bg-current" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {account.name}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {account.type}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(account.balance)}
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

        <div className="mt-4 border-t border-zinc-200 dark:border-zinc-700 pt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Total Balance
            </p>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {formatCurrency(totalBalance)}
            </p>
          </div>
        </div>
      </div>

      {selectedAccount && (
        <AccountModal
          isOpen={selectedAccountId !== null}
          accountName={selectedAccount.name}
          accountColor={selectedAccount.color || "blue"}
          subAccounts={selectedSubAccounts}
          totalBalance={selectedAccount.balance}
          onClose={() => setSelectedAccountId(null)}
          onAddAccount={handleAddAccount}
        />
      )}
    </>
  );
}
