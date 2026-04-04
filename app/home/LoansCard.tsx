"use client";

import { useState, useEffect } from "react";
import { Plus, TrendingDown, TrendingUp } from "lucide-react";
import { useCurrency } from "@/lib/currency/currency-context";
import { CURRENCIES } from "@/lib/currency/currencies";
import { AddLoanModal } from "./AddLoanModal";
import { EditLoanModal } from "./EditLoanModal";
import { useAuth } from "@/lib/auth/auth-context";
import { getUserLoans } from "@/lib/supabase/loans";

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
  account: string; // Account name
  accountId: string; // Account ID involved
  transactionType: "personal" | "business"; // Personal or Business
  businessId?: string; // If business type
}

interface LoansCardProps {
  loans?: Loan[];
}

export function LoansCard({ loans = [] }: LoansCardProps) {
  const [loanList, setLoanList] = useState<Loan[]>(
    loans.length > 0 ? loans : [],
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const { currentCurrency } = useCurrency();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(!user);

  // Load active loans from database
  useEffect(() => {
    async function loadLoans() {
      if (!user) return;

      try {
        setIsLoading(true);
        const data = await getUserLoans(user.id);
        if (data && data.length > 0) {
          // Filter to only show active loans (not settled or defaulted)
          const activeLoans = data.filter(
            (loan: any) => loan.status === "active",
          );

          if (activeLoans.length > 0) {
            // Transform database loans to component format
            const transformedLoans = activeLoans.map((loan: any) => ({
              ...loan,
              loanType: loan.loan_type,
              counterpartyName: loan.counterparty_name,
              principalAmount: loan.principal_amount,
              interestRate: loan.interest_rate,
              borrowedDate: loan.borrowed_date,
              dueDate: loan.due_date,
              totalPaid: loan.amount_paid,
              transactionType: loan.transaction_type,
              businessId: loan.business_id,
              account: "Account", // TODO: Fetch account name from accounts table
              accountId: loan.account_id,
              amount: loan.total_amount_due,
            }));
            setLoanList(transformedLoans);
          } else {
            setLoanList([]);
          }
        } else {
          setLoanList([]);
        }
      } catch (error) {
        console.error("Error loading loans:", error);
        setLoanList([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadLoans();
  }, [user]);

  const formatCurrency = (value: number) => {
    const currency = CURRENCIES[currentCurrency as keyof typeof CURRENCIES];
    if (!currency) return value.toFixed(0);

    // Database stores amounts in NGN, convert to selected currency
    // NGN → USD: divide by NGN rate
    // USD → selected currency: multiply by currency rate
    const ngnRate = CURRENCIES.NGN.rateToUSD; // 1550
    const valueInUSD = value / ngnRate;
    const convertedValue = valueInUSD * currency.rateToUSD;

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
      <div className="rounded-lg max:h-screen overflow-hidden overflow-y-auto   border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
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
                            {loan.transactionType}
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
                            {loan.transactionType}
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
              {isLoading
                ? "Loading loans..."
                : "No active loans. Add one to get started!"}
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
