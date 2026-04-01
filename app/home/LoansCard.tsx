"use client";

import { useState } from "react";
import { Plus, TrendingDown, TrendingUp } from "lucide-react";
import { useCurrency } from "@/lib/currency/currency-context";
import { CURRENCIES } from "@/lib/currency/currencies";
import { AddLoanModal } from "./AddLoanModal";
import { EditLoanModal } from "./EditLoanModal";

interface Loan {
  id: string;
  loanType: "borrowed" | "lent";
  counterpartyName: string;
  amount: number;
  principalAmount: number;
  interestRate: number;
  status: "active" | "settled" | "defaulted";
  borrowedDate: string;
  dueDate?: string;
  totalPaid: number;
  currency: string;
  description?: string;
  account: string; // Account ID involved
  transactionType: "personal" | "business"; // Personal or Business
  businessId?: string; // If business type
  category: string; // Category ID
}

interface LoansCardProps {
  loans?: Loan[];
}

export function LoansCard({ loans = [] }: LoansCardProps) {
  // Demo loans for preview
  const demoLoans: Loan[] = [
    {
      id: "demo-1",
      loanType: "borrowed",
      counterpartyName: "Sarah Johnson",
      amount: 1500,
      principalAmount: 1500,
      interestRate: 5,
      status: "active",
      borrowedDate: "2026-02-15",
      dueDate: "2026-06-15",
      totalPaid: 600,
      currency: "USD",
      description: "Car repair help",
      account: "Checking",
      transactionType: "personal",
      category: "personal-loan",
    },
    {
      id: "demo-2",
      loanType: "lent",
      counterpartyName: "Tech Startup Inc",
      amount: 5000,
      principalAmount: 5000,
      interestRate: 8,
      status: "active",
      borrowedDate: "2026-01-10",
      dueDate: "2026-12-10",
      totalPaid: 1250,
      currency: "USD",
      description: "Business venture fund",
      account: "Business",
      transactionType: "business",
      businessId: "startup-xyz",
      category: "business-loan",
    },
    
  ];

  const [loanList, setLoanList] = useState<Loan[]>(
    loans.length > 0 ? loans : demoLoans,
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const { currentCurrency } = useCurrency();

  const formatCurrency = (value: number) => {
    const currency = CURRENCIES[currentCurrency as keyof typeof CURRENCIES];
    if (!currency) return value.toFixed(0);

    const usdToSelectedRate = currency.rateToUSD;
    const convertedValue = value * usdToSelectedRate;

    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(convertedValue);

    return `${currency.symbol}${formatted}`;
  };

  const borrowedLoans = loanList.filter(
    (l) => l.loanType === "borrowed" && l.status !== "settled",
  );
  const lentLoans = loanList.filter(
    (l) => l.loanType === "lent" && l.status !== "settled",
  );

  const totalCreditIn = borrowedLoans.reduce(
    (sum, l) => sum + (l.principalAmount - l.totalPaid),
    0,
  );
  const totalCreditOut = lentLoans.reduce(
    (sum, l) => sum + (l.principalAmount - l.totalPaid),
    0,
  );

  const handleAddLoan = (loanData: Loan) => {
    const newLoan: Loan = {
      ...loanData,
      id: `${Date.now()}`,
    };
    setLoanList([...loanList, newLoan]);
    setIsAddModalOpen(false);
  };

  const handleSaveLoan = (updatedLoan: Loan) => {
    setLoanList((prev) =>
      prev.map((l) => (l.id === updatedLoan.id ? updatedLoan : l)),
    );
    setSelectedLoan(null);
  };

  const handleDeleteLoan = (loanId: string) => {
    setLoanList((prev) => prev.filter((l) => l.id !== loanId));
    setSelectedLoan(null);
  };

  return (
    <>
      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
            Credits & Loans
          </h3>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        </div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Credit In (Left) */}
          <div>
            <div className="rounded-md border border-blue-200 bg-blue-50 p-3 mb-4 dark:border-blue-900 dark:bg-blue-950">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Credit In
                </p>
              </div>
              <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
                {formatCurrency(totalCreditIn)}
              </p>
            </div>

            {borrowedLoans.length > 0 ? (
              <div className="space-y-2">
                {borrowedLoans.map((loan) => {
                  const remaining = loan.principalAmount - loan.totalPaid;
                  const progressPercent =
                    (loan.totalPaid / loan.principalAmount) * 100;

                  return (
                    <div
                      key={loan.id}
                      onClick={() => setSelectedLoan(loan)}
                      className="rounded-md border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800 cursor-pointer transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {loan.counterpartyName}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {loan.category} • {loan.transactionType}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            {formatCurrency(remaining)}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            remaining
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  No borrowed loans
                </p>
              </div>
            )}
          </div>

          {/* Credit Out (Right) */}
          <div>
            <div className="rounded-md border border-green-200 bg-green-50 p-3 mb-4 dark:border-green-900 dark:bg-green-950">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                <p className="text-xs text-green-600 dark:text-green-400">
                  Credit Out
                </p>
              </div>
              <p className="text-sm font-bold text-green-700 dark:text-green-300">
                {formatCurrency(totalCreditOut)}
              </p>
            </div>

            {lentLoans.length > 0 ? (
              <div className="space-y-2">
                {lentLoans.map((loan) => {
                  const remaining = loan.principalAmount - loan.totalPaid;
                  const progressPercent =
                    (loan.totalPaid / loan.principalAmount) * 100;

                  return (
                    <div
                      key={loan.id}
                      onClick={() => setSelectedLoan(loan)}
                      className="rounded-md border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800 cursor-pointer transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {loan.counterpartyName}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {loan.category} • {loan.transactionType}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(remaining)}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            remaining
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5">
                        <div
                          className="bg-green-600 h-1.5 rounded-full transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  No lent loans
                </p>
              </div>
            )}
          </div>
        </div>

        {loanList.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No loans yet. Add one to get started!
            </p>
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <AddLoanModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddLoan}
        />
      )}

      {selectedLoan && (
        <EditLoanModal
          loan={selectedLoan}
          onClose={() => setSelectedLoan(null)}
          onSave={handleSaveLoan}
          onDelete={handleDeleteLoan}
        />
      )}
    </>
  );
}
