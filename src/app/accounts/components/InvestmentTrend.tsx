"use client";

import React, { useEffect, useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "@/util/supabase/client";
import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";

interface InvestmentTrendPoint {
  month: string;
  amount: number;
}

const InvestmentTrend: React.FC = () => {
  const [data, setData] = useState<InvestmentTrendPoint[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < 640);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const load = async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData.user) {
        return;
      }

      const userId = userData.user.id;

      const { data: accounts, error: accountsError } = await supabase
        .from("Account")
        .select("id, category")
        .eq("user_id", userId);

      if (accountsError || !accounts) {
        return;
      }

      const investmentAccountIds = (accounts as any[])
        .filter((acc) => acc.category === "investment")
        .map((acc) => acc.id);

      const now = new Date();
      const startRange = startOfMonth(subMonths(now, 11));
      const endRange = endOfMonth(now);

      if (investmentAccountIds.length === 0) {
        const emptySeries: InvestmentTrendPoint[] = Array.from({
          length: 12,
        }).map((_, idx) => {
          const monthDate = startOfMonth(subMonths(now, 11 - idx));
          return {
            month: format(monthDate, "MMM"),
            amount: 0,
          };
        });
        setData(emptySeries);
        return;
      }

      const { data: txs, error: txError } = await supabase
        .from("Transaction")
        .select("amount, type, date, account_id")
        .eq("user_id", userId)
        .in("account_id", investmentAccountIds)
        .gte("date", startRange.toISOString())
        .lte("date", endRange.toISOString());

      if (txError || !txs) {
        return;
      }

      const monthMap = new Map<string, number>();

      // Initialize all 12 months with zero
      for (let i = 11; i >= 0; i--) {
        const monthDate = startOfMonth(subMonths(now, i));
        const key = format(monthDate, "yyyy-MM");
        monthMap.set(key, 0);
      }

      (txs as any[]).forEach((tx) => {
        const d = new Date(tx.date);
        const key = format(d, "yyyy-MM");
        if (!monthMap.has(key)) return;

        const current = monthMap.get(key) ?? 0;
        const amount = Number(tx.amount) || 0;

        if (tx.type === "income") {
          monthMap.set(key, current + amount);
        } else if (tx.type === "expense") {
          monthMap.set(key, current - amount);
        }
      });

      const series: InvestmentTrendPoint[] = Array.from(monthMap.entries())
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([key, value]) => {
          const monthDate = new Date(key + "-01T00:00:00");
          return {
            month: format(monthDate, "MMM"),
            amount: value,
          };
        });

      setData(series);
    };

    load();
  }, []);

  const formatYAxis = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value.toString();
  };

  return (
    <div className="w-full bg-white p-4 rounded-2xl border border-gray-200">
      {/* Title */}
      <div className="text-center mb-3">
        <Paragraph1 className="text-lg sm:text-xl font-bold text-gray-900">
          Investments
        </Paragraph1>
      </div>

      {/* Chart */}
      <div className="w-full h-55 [220px] sm:h-75 [300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 12, left: 0, bottom: 10 }}
          >
            <CartesianGrid horizontal={false} stroke="#E5E7EB" />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine
              tick={{ fontSize: 11, fill: "#111827" }}
              interval={isMobile ? 3 : 1} // fewer ticks on mobile
            />

            {/* Hide Y-axis on mobile */}
            <YAxis
              className="hidden sm:block"
              tickFormatter={formatYAxis}
              tickLine={false}
              axisLine
              tick={{ fontSize: 12, fill: "#111827" }}
            />

            <Tooltip
              formatter={(value) =>
                typeof value === "number"
                  ? [`₦${value.toLocaleString()}`, "Amount"]
                  : ["₦0", "Amount"]
              }
              contentStyle={{
                borderRadius: "10px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                fontSize: "12px",
              }}
            />

            <Line
              type="linear"
              dataKey="amount"
              stroke="#A3D139"
              strokeWidth={2}
              dot={false} // cleaner on mobile
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer label */}
      <div className="text-center mt-2">
        <Paragraph1 className="text-xs sm:text-sm font-medium text-gray-400">
          Amount (NGN)
        </Paragraph1>
      </div>
    </div>
  );
};

export default InvestmentTrend;
