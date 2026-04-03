"use client";

import { useState } from "react";
import { Plus, ArrowDownCircle, ArrowUpCircle, Zap, Recycle, RecycleIcon, ArrowRightLeft } from "lucide-react";
import { TransactionFormModal } from "./TransactionFormModal";
import { TransferTransactionModal } from "./TransferTransactionModal";

export function BottomNav() {
  const [showMenu, setShowMenu] = useState(false);
  const [showIncome, setShowIncome] = useState(false);
  const [showExpense, setShowExpense] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);

  const handleIncome = () => {
    setShowMenu(false);
    setShowIncome(true);
  };

  const handleExpense = () => {
    setShowMenu(false);
    setShowExpense(true);
  };

  const handleTransfer = () => {
    setShowMenu(false);
    setShowTransfer(true);
  };

  return (
    <>
      {/* Floating Action Button - Left Side */}
      <div className="fixed right-6 bottom-6 z-40">
        {/* Menu Options */}
        {showMenu && (
          <div className="absolute bottom-20 right-0 bg-white dark:bg-zinc-900 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 p-2 w-48 space-y-2">
            {/* Income Option */}
            <button
              onClick={handleIncome}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-green-50 dark:bg-green-950 hover:bg-green-100 dark:hover:bg-green-900 text-green-700 dark:text-green-300 font-medium transition-colors"
            >
              <ArrowDownCircle className="h-5 w-5" />
              <span>Add Income</span>
            </button>

            {/* Expense Option */}
            <button
              onClick={handleExpense}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950 hover:bg-red-100 dark:hover:bg-red-900 text-red-700 dark:text-red-300 font-medium transition-colors"
            >
              <ArrowUpCircle className="h-5 w-5" />
              <span>Add Expense</span>
            </button>

            {/* Transfer Option */}
            <button
              onClick={handleTransfer}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium transition-colors"
            >
              <ArrowRightLeft className="h-5 w-5" />
              <span>Transfer</span>
            </button>
          </div>
        )}

        {/* Plus Button */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="relative w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
        >
          <Plus
            className={`h-6 w-6 transition-transform duration-300 ${
              showMenu ? "rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Income Transaction Modal */}
      {showIncome && (
        <TransactionFormModal
          type="income"
          onClose={() => setShowIncome(false)}
        />
      )}

      {/* Expense Transaction Modal */}
      {showExpense && (
        <TransactionFormModal
          type="expense"
          onClose={() => setShowExpense(false)}
        />
      )}

      {/* Transfer Transaction Modal */}
      {showTransfer && (
        <TransferTransactionModal onClose={() => setShowTransfer(false)} />
      )}
    </>
  );
}
