"use client";

import React, { useEffect, useState } from "react";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import MonthlySpendingGraph from "./MonthlySpendingGraph";
import { supabase } from "@/util/supabase/client";
import { startOfMonth, endOfMonth, format } from "date-fns";

interface DailyPoint {
  day: string;
  amount: number;
}

const SpendingTracker: React.FC = () => {
  const currencySymbol = "₦";
  const [totalSpending, setTotalSpending] = useState(0);
  const [projectedSpending, setProjectedSpending] = useState(0);
  const [dailyData, setDailyData] = useState<DailyPoint[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData.user) return;

      const now = new Date();
      const start = startOfMonth(now);
      const end = endOfMonth(now);

      const { data, error } = await supabase
        .from("Transaction")
        .select("amount, date")
        .eq("user_id", userData.user.id)
        .eq("type", "expense")
        .gte("date", start.toISOString())
        .lte("date", end.toISOString());

      if (error || !data) return;

      const byDay = new Map<string, number>();
      let total = 0;

      data.forEach((tx: any) => {
        const d = new Date(tx.date);
        const key = d.getDate().toString();
        const amount = Number(tx.amount) || 0;
        total += amount;
        byDay.set(key, (byDay.get(key) ?? 0) + amount);
      });

      const points: DailyPoint[] = Array.from(byDay.entries())
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([day, amount]) => ({ day, amount }));

      setTotalSpending(total);
      // Simple projection: same as current for now
      setProjectedSpending(total);
      setDailyData(points);
    };

    load();
  }, []);

  const monthLabel = format(new Date(), "MMMM");

  return (
    <div className="font-sans w-full  bg-[#F4F5F7] py-4 p-2 sm:p-6 rounded-2xl border border-gray-200">
      {/* Header Info */}
      <div className="mb-6">
        <Paragraph1 className="text-gray-500 text-sm  mb-1">
          Spending in {monthLabel}
        </Paragraph1>
        <Paragraph2 className="text-3xl font-bold text-gray-900 mb-4">
          {currencySymbol}
          {totalSpending.toLocaleString()}
        </Paragraph2>
        <Paragraph1 className="text-sm  text-gray-800">
          Projected {currencySymbol}
          {projectedSpending.toLocaleString()}
        </Paragraph1>
      </div>

      {/* Graph Section */}
      <MonthlySpendingGraph currencySymbol={currencySymbol} data={dailyData} />
    </div>
  );
};

export default SpendingTracker;
