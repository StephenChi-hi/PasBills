"use client";

import { useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, X } from "lucide-react";
import { TransactionFormModal } from "./TransactionFormModal";

export function BottomNav() {
  const [showIncome, setShowIncome] = useState(false);
  const [showExpense, setShowExpense] = useState(false);

  return (
    <>
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 justify-center">
            {/* Income Button */}
            <button
              onClick={() => setShowIncome(true)}
              className="flex items-center gap-2 px-12 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors"
            >
              <ArrowDownCircle className="h-5 w-5" />
              In
            </button>

            {/* Expense Button */}
            <button
              onClick={() => setShowExpense(true)}
              className="flex items-center gap-2 px-12 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
            >
              <ArrowUpCircle className="h-5 w-5" />
              Out
            </button>
          </div>
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
    </>
  );
}
