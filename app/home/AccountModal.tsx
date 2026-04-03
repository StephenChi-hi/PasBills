"use client";

import { X, Plus } from "lucide-react";
import { useState } from "react";
import { useCurrency } from "@/lib/currency/currency-context";
import { CURRENCIES } from "@/lib/currency/currencies";
import { createClient } from "@/lib/supabase/client";

export interface SubAccount {
  id: string;
  name: string;
  balance: number;
  currency?: string;
}

interface AccountModalProps {
  isOpen: boolean;
  accountName: string;
  accountColor: string;
  accountType: string;
  subAccounts: SubAccount[];
  totalBalance: number;
  userId: string;
  onClose: () => void;
  onAddAccount: (name: string, balance: number, type: string) => void;
  onUpdateAccount?: (accountId: string, newName: string) => Promise<boolean>;
}

export function AccountModal({
  isOpen,
  accountName,
  accountColor,
  accountType,
  subAccounts,
  totalBalance,
  userId,
  onClose,
  onAddAccount,
  onUpdateAccount,
}: AccountModalProps) {
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountBalance, setNewAccountBalance] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editingAccountName, setEditingAccountName] = useState("");
  const { currentCurrency } = useCurrency();

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountName.trim() || !newAccountBalance.trim()) return;

    setIsLoading(true);
    try {
      const balanceValue = parseFloat(newAccountBalance);

      // Convert balance to NGN (base currency in DB)
      let balanceInNGN = balanceValue;
      if (currentCurrency !== "NGN") {
        const currency = CURRENCIES[currentCurrency as keyof typeof CURRENCIES];
        const ngnCurrency = CURRENCIES.NGN;
        if (currency && ngnCurrency) {
          // Convert: currentCurrency → USD → NGN
          const valueInUSD = balanceValue / currency.rateToUSD;
          balanceInNGN = valueInUSD * ngnCurrency.rateToUSD;
        }
      }

      const supabase = createClient();
      const { data, error } = await supabase
        .from("accounts")
        .insert([
          {
            user_id: userId,
            name: newAccountName,
            type: accountType,
            balance: balanceInNGN,
            currency: "NGN",
            is_active: true,
          },
        ])
        .select();

      if (error) {
        console.error("Error adding account:", error);
        return;
      }

      onAddAccount(newAccountName, balanceInNGN, accountType);
      setNewAccountName("");
      setNewAccountBalance("");
      setIsAddingAccount(false);
      // Close modal after adding so it refetches with real UUIDs
      onClose();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAccountName = async (accountId: string) => {
    if (!editingAccountName.trim() || !onUpdateAccount) return;

    setIsLoading(true);
    try {
      const success = await onUpdateAccount(accountId, editingAccountName);
      if (success) {
        setEditingAccountId(null);
        setEditingAccountName("");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
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
    teal: "bg-white dark:bg-black -950 border-teal-200 dark:border-teal-800",
    cash: "bg-white-50 dark:bg-black -950 border-red-200 dark:border-red-800",
    checking:
      "bg-white dark:bg-black -950 border-blue-200 dark:border-blue-800",
    savings:
      "bg-white -50 dark:bg-black -950 border-green-200 dark:border-green-800",
    business:
      "bg-white-50 dark:bg-black -950 border-purple-200 dark:border-purple-800",
    investment:
      "bg-white -5 0 dark:bg-black - 950 border-orange-200 dark:border-orange-800",
    crypto: "bg-white dark:bg-black -950 border-teal-200 dark:border-teal-800",
  };

  if (!isOpen) return null;

  const formatCurrency = (value: number, storedCurrency?: string) => {
    const currency = CURRENCIES[currentCurrency as keyof typeof CURRENCIES];
    if (!currency) return value.toFixed(2);

    // All accounts are stored in NGN, convert NGN → USD → selected currency
    if (!storedCurrency || storedCurrency === "NGN") {
      const ngnRate = CURRENCIES.NGN.rateToUSD; // 1 USD = 1550 NGN
      const valueInUSD = value / ngnRate;
      const convertedValue = valueInUSD * currency.rateToUSD;

      const formatted = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(convertedValue);

      return `${currency.symbol}${formatted}`;
    }

    // Fallback for any other stored currency
    const storedCurrencyObj =
      CURRENCIES[storedCurrency as keyof typeof CURRENCIES];
    if (!storedCurrencyObj) {
      const formatted = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
      return `${currency.symbol}${formatted}`;
    }

    const valueInUSD = value / storedCurrencyObj.rateToUSD;
    const convertedValue = valueInUSD * currency.rateToUSD;

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
            {formatCurrency(totalBalance, subAccounts[0]?.currency)}
          </p>
        </div>

        <p className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Accounts in {accountName}
        </p>

        <div className="mb-4 space-y-2 max-h-64 overflow-y-auto">
          {subAccounts.map((account) => {
            const percentage =
              totalBalance > 0
                ? ((account.balance / totalBalance) * 100).toFixed(1)
                : "0.0";

            const isEditing = editingAccountId === account.id;

            return (
              <div
                key={account.id}
                className="flex items-center justify-between rounded border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800"
              >
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editingAccountName}
                      onChange={(e) => setEditingAccountName(e.target.value)}
                      className="w-full rounded border border-blue-300 bg-white px-2 py-1 text-sm dark:border-blue-600 dark:bg-zinc-700 dark:text-zinc-50"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSaveAccountName(account.id);
                        } else if (e.key === "Escape") {
                          setEditingAccountId(null);
                          setEditingAccountName("");
                        }
                      }}
                      disabled={isLoading}
                    />
                  ) : (
                    <>
                      <p
                        className="text-sm font-medium text-zinc-900 dark:text-zinc-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                        onClick={() => {
                          setEditingAccountId(account.id);
                          setEditingAccountName(account.name);
                        }}
                      >
                        {account.name}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {percentage}% of total
                      </p>
                    </>
                  )}
                </div>
                {isEditing ? (
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => handleSaveAccountName(account.id)}
                      disabled={isLoading || !editingAccountName.trim()}
                      className="px-2 py-1 rounded bg-green-600 text-white text-xs hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingAccountId(null);
                        setEditingAccountName("");
                      }}
                      disabled={isLoading}
                      className="px-2 py-1 rounded bg-gray-400 text-white text-xs hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {formatCurrency(account.balance, account.currency)}
                  </p>
                )}
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
              disabled={isLoading}
            />
            <input
              type="number"
              placeholder="Balance"
              value={newAccountBalance}
              onChange={(e) => setNewAccountBalance(e.target.value)}
              step="0.01"
              className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
              disabled={isLoading}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Adding..." : "Add"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingAccount(false);
                  setNewAccountName("");
                  setNewAccountBalance("");
                }}
                disabled={isLoading}
                className="flex-1 rounded border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
