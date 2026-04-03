"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { Download, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/auth-context";
import { useCurrency } from "@/lib/currency/currency-context";
import { CURRENCIES } from "@/lib/currency/currencies";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface Transaction {
  id: string;
  type: string;
  description: string;
  amount: number;
  category_id: string;
  transaction_date: string;
  created_at: string;
}

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants: Variants = {
  hidden: { scale: 0.95, opacity: 0, y: 20 },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 } as any,
  },
  exit: { scale: 0.95, opacity: 0, y: 20 },
};

export function DownloadTransactionsButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [format, setFormat] = useState<"pdf" | "csv" | "json">("pdf");
  const { user } = useAuth();
  const { currentCurrency } = useCurrency();

  // Get currency data and conversion rates
  const selectedCurrencyData =
    CURRENCIES[currentCurrency as keyof typeof CURRENCIES];
  const ngnData = CURRENCIES.NGN;

  // Convert amount from NGN (base) to selected currency
  const convertCurrency = (amountInNGN: number): number => {
    if (!ngnData || !selectedCurrencyData) return amountInNGN;
    // Formula: (amount / ngnRate) * selectedCurrencyRate
    return (amountInNGN / ngnData.rateToUSD) * selectedCurrencyData.rateToUSD;
  };

  const handleDownload = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Build query
      let query = supabase
        .from("transactions")
        .select(
          `
          id,
          type,
          description,
          amount,
          category_id,
          transaction_date,
          created_at
        `,
        )
        .eq("user_id", user.id)
        .order("transaction_date", { ascending: false });

      // Add date filters if provided
      if (startDate) {
        query = query.gte("transaction_date", startDate);
      }
      if (endDate) {
        query = query.lte("transaction_date", endDate);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw new Error(fetchError.message || "Failed to fetch transactions");
      }

      const transactions = (data || []) as Transaction[];

      if (transactions.length === 0) {
        setError("No transactions found for the selected date range");
        return;
      }

      // Download based on format
      switch (format) {
        case "pdf":
          downloadPDF(transactions);
          break;
        case "csv":
          downloadCSV(transactions);
          break;
        case "json":
          downloadJSON(transactions);
          break;
      }

      setIsOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to download transactions",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = (transactions: Transaction[]) => {
    const doc = new jsPDF();
    const currencySymbol = selectedCurrencyData?.symbol || "$";
    const pageWidth = doc.internal.pageSize.getWidth();

    const tableData = transactions.map((t) => [
      new Date(t.transaction_date).toLocaleDateString("en-US"),
      t.type.charAt(0).toUpperCase() + t.type.slice(1),
      t.description,
      convertCurrency(t.amount).toFixed(2),
    ]);

    // Calculate totals
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + convertCurrency(t.amount), 0);
    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + convertCurrency(t.amount), 0);
    const netFlow = totalIncome - totalExpense;

    // Title and metadata
    doc.setFontSize(14);
    doc.text("Transaction Report", 14, 15);

    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(
      `Currency: ${currentCurrency} (${currencySymbol}) | Generated: ${new Date().toLocaleDateString("en-US")}`,
      14,
      25,
    );

    // Table
    autoTable(doc, {
      head: [["Date", "Type", "Description", `Amount (${currencySymbol})`]],
      body: tableData,
      startY: 35,
      theme: "grid",
      headStyles: {
        fillColor: [51, 51, 51],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9,
        cellPadding: 2,
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 25 },
        2: { cellWidth: 80 },
        3: { cellWidth: 30, halign: "right" },
      },
      styles: {
        overflow: "linebreak",
        textColor: [0, 0, 0],
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    // Summary section
    const finalY = (doc as any).lastAutoTable.finalY + 12;
    doc.setFontSize(9);
    doc.setTextColor(0);
    doc.setFont("", "bold");
    doc.text("Summary:", 14, finalY);

    doc.setFont("", "normal");
    doc.setFontSize(8);
    doc.text(
      `Total Income: ${currencySymbol}${totalIncome.toFixed(2)}`,
      14,
      finalY + 6,
    );
    doc.text(
      `Total Expense: ${currencySymbol}${totalExpense.toFixed(2)}`,
      14,
      finalY + 12,
    );

    doc.setFont("", "bold");
    const netColor = netFlow >= 0 ? [34, 197, 94] : [239, 68, 68]; // Green for positive, red for negative
    doc.setTextColor(netColor[0], netColor[1], netColor[2]);
    doc.text(
      `Net Flow: ${currencySymbol}${netFlow.toFixed(2)}`,
      14,
      finalY + 18,
    );

    doc.save(
      `transactions_${currentCurrency}_${startDate || "all"}_${endDate || "all"}.pdf`,
    );
  };

  const downloadCSV = (transactions: Transaction[]) => {
    const currencySymbol = selectedCurrencyData?.symbol || "$";
    const headers = [
      "Date",
      "Type",
      "Description",
      `Amount (${currentCurrency})`,
    ];
    const rows = transactions.map((t) => [
      new Date(t.transaction_date).toLocaleDateString(),
      t.type,
      t.description,
      convertCurrency(t.amount).toFixed(2),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_${currentCurrency}_${startDate || "all"}_${endDate || "all"}.csv`;
    link.click();
  };

  const downloadJSON = (transactions: Transaction[]) => {
    const convertedTransactions = transactions.map((t) => ({
      ...t,
      amount: parseFloat(convertCurrency(t.amount).toFixed(2)),
    }));

    const jsonData = {
      metadata: {
        exportDate: new Date().toISOString(),
        currency: currentCurrency,
        currencySymbol: selectedCurrencyData?.symbol,
        transactionCount: convertedTransactions.length,
        dateRange: {
          start: startDate || "All",
          end: endDate || "All",
        },
      },
      transactions: convertedTransactions,
    };

    const jsonContent = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonContent], {
      type: "application/json;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_${currentCurrency}_${startDate || "all"}_${endDate || "all"}.json`;
    link.click();
  };

  return (
    <>
      {/* Download Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
      >
        <Download className="h-4 w-4" />
        Export Transactions
      </motion.button>

      {/* Export Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => !isLoading && setIsOpen(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-md w-full p-6 border border-zinc-200 dark:border-zinc-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Export Transactions
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                  className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Date Range */}
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Start Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Format Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Export Format
                </label>
                <div className="space-y-2">
                  {(["pdf", "csv", "json"] as const).map((fmt) => (
                    <label
                      key={fmt}
                      className="flex items-center cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="format"
                        value={fmt}
                        checked={format === fmt}
                        onChange={(e) =>
                          setFormat(e.target.value as "pdf" | "csv" | "json")
                        }
                        disabled={isLoading}
                        className="rounded border-zinc-300 text-blue-600 disabled:opacity-50"
                      />
                      <span className="ml-2 text-sm text-zinc-900 dark:text-zinc-50">
                        {fmt.toUpperCase()}
                        {fmt === "csv" && " / Excel"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg"
                >
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {error}
                  </p>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDownload}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </motion.div>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Export
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
