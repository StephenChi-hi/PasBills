"use client";

import { X, Plus } from "lucide-react";
import { useState } from "react";
import { useCurrency } from "@/lib/currency/currency-context";
import { CURRENCIES } from "@/lib/currency/currencies";

export interface SubAccount {
  id: string;
  name: string;
  balance: number;
}

interface AccountModalProps {
  isOpen: boolean;
  accountName: string;
  accountColor: string;
  subAccounts: SubAccount[];
  totalBalance: number;
  onClose: () => void;
  onAddAccount: (name: string, balance: number) => void;
}

export function AccountModal({
  isOpen,
  accountName,
  accountColor,
  subAccounts,
  totalBalance,
  onClose,
  onAddAccount,
}: AccountModalProps) {
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountBalance, setNewAccountBalance] = useState("");
  const { currentCurrency } = useCurrency();

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAccountName.trim() && newAccountBalance.trim()) {
      onAddAccount(newAccountName, parseFloat(newAccountBalance));
      setNewAccountName("");
      setNewAccountBalance("");
      setIsAddingAccount(false);
    }
  };

  const colorBgMap: Record<string, string> = {
    blue: "bg-white dark:bg-black -950 border-blue-200 dark:border-blue-800",
    green:
      "bg-white -50 dark:bg-black -950 border-green-200 dark:border-green-800",
    purple:
      "bg-white-50 dark:bg-black -950 border-purple-200 dark:border-purple-800",
    orange:
      "bg-white -5 0 dark:bg-black - 950 border-orange-200 dark:border-orange-800",
    red: "bg-white-50 dark:bg-black -950 border-red-200 dark:border-red-800",
  };

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
      <div
        className={`w-full max-w-md rounded-lg border p-6 shadow-xl ${
          colorBgMap[accountColor] || colorBgMap.blue
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            {accountName}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6 rounded-lg bg-white/50 p-4 dark:bg-zinc-900/50">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Total Balance
          </p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {formatCurrency(totalBalance)}
          </p>
        </div>

        <p className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Sub-Accounts
        </p>

        <div className="mb-4 space-y-2 max-h-64 overflow-y-auto">
          {subAccounts.map((account) => {
            const percentage =
              totalBalance > 0
                ? ((account.balance / totalBalance) * 100).toFixed(1)
                : "0.0";

            return (
              <div
                key={account.id}
                className="flex items-center justify-between rounded border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {account.name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {percentage}% of total
                  </p>
                </div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {formatCurrency(account.balance)}
                </p>
              </div>
            );
          })}
        </div>

        {isAddingAccount ? (
          <form onSubmit={handleAddAccount} className="space-y-3">
            <input
              type="text"
              placeholder="Account name (e.g., PalmPay Wallet)"
              value={newAccountName}
              onChange={(e) => setNewAccountName(e.target.value)}
              className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
              autoFocus
            />
            <input
              type="number"
              placeholder="Balance"
              value={newAccountBalance}
              onChange={(e) => setNewAccountBalance(e.target.value)}
              step="0.01"
              className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-700"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingAccount(false);
                  setNewAccountName("");
                  setNewAccountBalance("");
                }}
                className="flex-1 rounded border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingAccount(true)}
            className="w-full rounded border-2 border-dashed border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-700"
          >
            <div className="flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" />
              Add Account
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
