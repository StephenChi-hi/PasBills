"use client";

import { useState } from "react";
import { X, Trash2, Plus } from "lucide-react";
import { useCurrency } from "@/lib/currency/currency-context";
import { CURRENCIES } from "@/lib/currency/currencies";

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
  account: string;
  transactionType: "personal" | "business";
  businessId?: string;
  category: string;
}

interface Payment {
  id: string;
  amount: number;
  date: string;
  notes?: string;
}

interface EditLoanModalProps {
  loan: Loan;
  onClose: () => void;
  onSave: (loan: Loan) => void;
  onDelete: (loanId: string) => void;
}

export function EditLoanModal({
  loan,
  onClose,
  onSave,
  onDelete,
}: EditLoanModalProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [paymentNotes, setPaymentNotes] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

  const remainingAmount = loan.principalAmount - loan.totalPaid;
  const progressPercent = (loan.totalPaid / loan.principalAmount) * 100;
  const isSettled = remainingAmount <= 0;

  const handleAddPayment = () => {
    if (!paymentAmount || isNaN(parseFloat(paymentAmount))) {
      alert("Enter a valid payment amount");
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (amount > remainingAmount) {
      alert(
        `Payment cannot exceed remaining amount: ${formatCurrency(remainingAmount)}`,
      );
      return;
    }

    const newPayment: Payment = {
      id: `${Date.now()}`,
      amount,
      date: paymentDate,
      notes: paymentNotes || undefined,
    };

    setPayments([...payments, newPayment]);

    // Update loan total paid
    const updatedLoan: Loan = {
      ...loan,
      totalPaid: loan.totalPaid + amount,
      status:
        loan.totalPaid + amount >= loan.principalAmount ? "settled" : "active",
    };
    onSave(updatedLoan);

    // Reset form
    setPaymentAmount("");
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setPaymentNotes("");
  };

  const handleDeletePayment = (paymentId: string) => {
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment) return;

    setPayments(payments.filter((p) => p.id !== paymentId));

    const updatedLoan: Loan = {
      ...loan,
      totalPaid: loan.totalPaid - payment.amount,
      status: "active",
    };
    onSave(updatedLoan);
  };

  const handleDeleteLoan = () => {
    onDelete(loan.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg max-w-md w-full mx-4 max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-700 sticky top-0 bg-white dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {loan.counterpartyName}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Loan Details */}
          <div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Type
                </span>
                <span
                  className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    loan.loanType === "borrowed"
                      ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
                      : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                  }`}
                >
                  {loan.loanType === "borrowed" ? "I Borrowed" : "I Lent"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Principal
                </span>
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(loan.principalAmount)}
                </span>
              </div>

              {loan.interestRate > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    Interest Rate
                  </span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {loan.interestRate}%
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Total Amount Due
                </span>
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(loan.amount)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Paid So Far
                </span>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(loan.totalPaid)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Remaining
                </span>
                <span
                  className={`text-sm font-bold ${
                    loan.loanType === "borrowed"
                      ? "text-red-600 dark:text-red-400"
                      : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {formatCurrency(remainingAmount)}
                </span>
              </div>

              {loan.dueDate && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    Due Date
                  </span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {new Date(loan.dueDate).toLocaleDateString()}
                  </span>
                </div>
              )}

              {loan.description && (
                <div className="flex justify-between items-start">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    Notes
                  </span>
                  <span className="text-sm text-zinc-900 dark:text-zinc-100 text-right max-w-xs">
                    {loan.description}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Account
                </span>
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {loan.account}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Type
                </span>
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 capitalize">
                  {loan.transactionType}
                </span>
              </div>

              {loan.businessId && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    Business
                  </span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {loan.businessId}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Category
                </span>
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {loan.category}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between mb-2">
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Progress
                </span>
                <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                  {progressPercent.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    loan.loanType === "borrowed" ? "bg-red-600" : "bg-green-600"
                  }`}
                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Payments Section */}
          {!isSettled && (
            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                Record Payment
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                    max={remainingAmount}
                    step="0.01"
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="Optional payment notes..."
                    rows={2}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <button
                  onClick={handleAddPayment}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Payment
                </button>
              </div>
            </div>
          )}

          {/* Payment History */}
          {payments.length > 0 && (
            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                Payment History
              </h3>
              <div className="space-y-2">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex justify-between items-start p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {new Date(payment.date).toLocaleDateString()}
                      </p>
                      {payment.notes && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1">
                          {payment.notes}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeletePayment(payment.id)}
                      className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settled Badge */}
          {isSettled && (
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900 rounded-lg p-4text-center">
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                ✓ Fully Settled
              </p>
            </div>
          )}

          {/* Delete Button */}
          <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-950 font-medium text-sm transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete Loan
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  Are you sure you want to delete this loan? This action cannot
                  be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-3 py-2 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800 font-medium text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteLoan}
                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm transition-colors"
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
