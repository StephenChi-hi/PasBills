"use client";

import { useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, ArrowRightLeft } from "lucide-react";
import { TransactionFormModal } from "./TransactionFormModal";
import { TransferTransactionModal } from "./TransferTransactionModal";

export function BottomNav() {
  const [showIncome, setShowIncome] = useState(false);
  const [showExpense, setShowExpense] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);

  return (
    <>
      {/* Floating Center Navigation - Glassmorphism */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-4 px-6 py-4 rounded-full backdrop-blur-md bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 shadow-lg">
          {/* Income Button */}
          <button
            onClick={() => setShowIncome(true)}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-green-500/90 hover:bg-green-600 dark:bg-green-600/90 dark:hover:bg-green-700 text-white font-medium transition-colors shadow-md"
          >
            <ArrowDownCircle className="h-5 w-5" />
            <span className="text-sm">Income</span>
          </button>

          {/* Expense Button */}
          <button
            onClick={() => setShowExpense(true)}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-red-500/90 hover:bg-red-600 dark:bg-red-600/90 dark:hover:bg-red-700 text-white font-medium transition-colors shadow-md"
          >
            <ArrowUpCircle className="h-5 w-5" />
            <span className="text-sm">Expense</span>
          </button>

          {/* Transfer Button */}
          <button
            onClick={() => setShowTransfer(true)}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-500/90 hover:bg-blue-600 dark:bg-blue-600/90 dark:hover:bg-blue-700 text-white font-medium transition-colors shadow-md"
          >
            <ArrowRightLeft className="h-5 w-5" />
            <span className="text-sm">Transfer</span>
          </button>
        </div>
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
