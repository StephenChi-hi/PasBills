"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/util/supabase/client";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

interface TxRow {
  type: "income" | "expense" | "transfer";
  amount: number;
  category_id: string | null;
}

interface CategoryRow {
  id: string;
  name: string;
  kind: string;
}

const COLORS = [
  "#0ea5e9",
  "#f97316",
  "#22c55e",
  "#6366f1",
  "#ec4899",
  "#facc15",
  "#14b8a6",
  "#ef4444",
];

const InsightsPage: React.FC = () => {
  const [byCategory, setByCategory] = useState<
    { name: string; value: number }[]
  >([]);
  const [incomeVsExpense, setIncomeVsExpense] = useState<
    { name: string; income: number; expense: number }[]
  >([]);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) return;

    const { data: tx, error: txError } = await supabase
      .from("Transaction")
      .select("type, amount, category_id")
      .eq("user_id", userData.user.id);

    const { data: cats, error: catError } = await supabase
      .from("Category")
      .select("id, name, kind")
      .is("user_id", null);

    if (txError || catError || !tx || !cats) return;

    const txRows = tx as unknown as TxRow[];
    const catRows = cats as unknown as CategoryRow[];

    const catMap = new Map<string, string>();
    catRows.forEach((c) => catMap.set(c.id, c.name));

    const byCatAgg = new Map<string, number>();
    let incomeTotal = 0;
    let expenseTotal = 0;

    txRows.forEach((t) => {
      if (t.type === "transfer") return;
      const signed = t.type === "expense" ? -t.amount : t.amount;
      const name = t.category_id
        ? (catMap.get(t.category_id) ?? "Uncategorised")
        : "Uncategorised";
      byCatAgg.set(name, (byCatAgg.get(name) ?? 0) + signed);
      if (t.type === "income") incomeTotal += t.amount;
      if (t.type === "expense") expenseTotal += t.amount;
    });

    setByCategory(
      Array.from(byCatAgg.entries())
        .map(([name, value]) => ({ name, value: Math.abs(value) }))
        .filter((x) => x.value > 0),
    );

    setIncomeVsExpense([
      {
        name: "This Period",
        income: incomeTotal,
        expense: expenseTotal,
      },
    ]);
  };

  return (
    <main className="w-full py-6 space-y-6">
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <Paragraph1 className="text-xs text-gray-500 mb-1">
            Income vs Expenses
          </Paragraph1>
          <Paragraph2 className="text-2xl font-bold text-gray-900 mb-4">
            Cash Flow
          </Paragraph2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeVsExpense}>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip />
                <Bar
                  dataKey="income"
                  stackId="a"
                  fill="#22c55e"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="expense"
                  stackId="a"
                  fill="#ef4444"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <Paragraph1 className="text-xs text-gray-500 mb-1">
            Where your money goes
          </Paragraph1>
          <Paragraph2 className="text-2xl font-bold text-gray-900 mb-4">
            Spending by Category
          </Paragraph2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={70}
                >
                  {byCategory.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </main>
  );
};

export default InsightsPage;
