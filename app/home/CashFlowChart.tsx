"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/auth-context";
import { useTransactionStore } from "@/lib/stores/transaction-store";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ChartData {
  date: string;
  day: number;
  income: number;
  expense: number;
  net: number;
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function CashFlowChart() {
  const { user } = useAuth();
  const { refetchTrigger } = useTransactionStore();
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const currentDate = new Date();

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        const supabase = createClient();

        // Get the first and last day of the selected month
        const firstDay = new Date(selectedYear, selectedMonth, 1);
        const lastDay = new Date(selectedYear, selectedMonth + 1, 0);

        const { data: transactions, error } = await supabase
          .from("transactions")
          .select("type, amount, transaction_date")
          .eq("user_id", user.id)
          .gte("transaction_date", firstDay.toISOString().split("T")[0])
          .lte("transaction_date", lastDay.toISOString().split("T")[0]);

        if (error) throw error;

        // Initialize chart data for all days in the month
        const dayCount = lastDay.getDate();
        const chartData: { [key: number]: ChartData } = {};

        for (let day = 1; day <= dayCount; day++) {
          chartData[day] = {
            date: `${monthNames[selectedMonth].slice(0, 3)} ${day}`,
            day,
            income: 0,
            expense: 0,
            net: 0,
          };
        }

        // Aggregate transactions by day
        if (transactions) {
          transactions.forEach((tx) => {
            const date = new Date(tx.transaction_date);
            const day = date.getDate();
            if (chartData[day]) {
              if (tx.type === "income") {
                chartData[day].income += parseFloat(tx.amount as any);
              } else if (tx.type === "expense") {
                chartData[day].expense += parseFloat(tx.amount as any);
              }
              chartData[day].net =
                chartData[day].income - chartData[day].expense;
            }
          });
        }

        const sortedData = Object.values(chartData).sort(
          (a, b) => a.day - b.day,
        );
        setData(sortedData);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user?.id, selectedMonth, selectedYear, refetchTrigger]);

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const isCurrentMonth =
    selectedMonth === currentDate.getMonth() &&
    selectedYear === currentDate.getFullYear();

  const isLastMonth =
    (selectedMonth === 11 && selectedYear === new Date().getFullYear()) ||
    selectedMonth === new Date().getMonth() - 1;

  const totalIncome = data.reduce((sum, d) => sum + d.income, 0);
  const totalExpense = data.reduce((sum, d) => sum + d.expense, 0);
  const netFlow = totalIncome - totalExpense;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6"
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
          Analysis
        </h3>

        {/* Month/Year Selector */}
        <div className="flex items-center justify-between mb-4 gap-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
          </button>

          <div className="text-center">
            <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {monthNames[selectedMonth]} {selectedYear}
            </div>
            {isCurrentMonth && (
              <div className="text-xs text-green-600 dark:text-green-400">
                Current Month
              </div>
            )}
          </div>

          <button
            onClick={handleNextMonth}
            disabled={isCurrentMonth}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <div className="text-xs text-green-600 dark:text-green-400 font-semibold">
              Total Income
            </div>
            <div className="text-lg font-bold text-green-700 dark:text-green-300">
              {totalIncome.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
            <div className="text-xs text-red-600 dark:text-red-400 font-semibold">
              Total Expense
            </div>
            <div className="text-lg font-bold text-red-700 dark:text-red-300">
              {totalExpense.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>

          <div
            className={`rounded-lg p-3 ${
              netFlow >= 0
                ? "bg-blue-50 dark:bg-blue-900/20"
                : "bg-orange-50 dark:bg-orange-900/20"
            }`}
          >
            <div
              className={`text-xs font-semibold ${
                netFlow >= 0
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-orange-600 dark:text-orange-400"
              }`}
            >
              Net Flow
            </div>
            <div
              className={`text-lg font-bold ${
                netFlow >= 0
                  ? "text-blue-700 dark:text-blue-300"
                  : "text-orange-700 dark:text-orange-300"
              }`}
            >
              {netFlow.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="flex items-center justify-center h-80">
          <div className="text-zinc-500 dark:text-zinc-400">
            Loading chart...
          </div>
        </div>
      ) : data.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              style={{ fontSize: "12px" }}
              tick={{ fill: "#9ca3af" }}
            />
            <YAxis
              stroke="#9ca3af"
              style={{ fontSize: "12px" }}
              tick={{ fill: "#9ca3af" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#e5e7eb",
              }}
              formatter={(value: any) =>
                value !== undefined && value !== null
                  ? (value as number).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "0.00"
              }
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", r: 4 }}
              activeDot={{ r: 6 }}
              name="Income"
              isAnimationActive={true}
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: "#ef4444", r: 4 }}
              activeDot={{ r: 6 }}
              name="Expenses"
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-80">
          <div className="text-zinc-500 dark:text-zinc-400">
            No transactions this month
          </div>
        </div>
      )}

      {/* Year Navigation */}
      <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-700">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-3 py-2 rounded-lg text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 border border-zinc-300 dark:border-zinc-700 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          {[...Array(3)].map((_, i) => {
            const year = new Date().getFullYear() - 2 + i;
            return (
              <option key={year} value={year}>
                {year}
              </option>
            );
          })}
        </select>
      </div>
    </motion.div>
  );
}
