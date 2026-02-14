"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/util/supabase/client";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import { format } from "date-fns";
import { Plus } from "lucide-react";

interface BudgetRow {
  id: string;
  name: string;
  period: string;
  start_date: string | null;
  end_date: string | null;
  total_amount: number;
}

const BudgetsPage: React.FC = () => {
  const [budgets, setBudgets] = useState<BudgetRow[]>([]);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) return;

    const { data, error } = await supabase
      .from("Budget")
      .select("id, name, period, start_date, end_date, total_amount")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false });

    if (!error && data) setBudgets(data as unknown as BudgetRow[]);
  };

  return (
    <main className="w-full py-6 space-y-6">
      <section className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <Paragraph1 className="text-xs text-gray-500 mb-1">
            Active Budgets
          </Paragraph1>
          <Paragraph2 className="text-2xl font-bold text-gray-900">
            {budgets.length}
          </Paragraph2>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold">
          <Plus className="w-4 h-4" />
          New Budget
        </button>
      </section>

      <section className="space-y-3">
        {budgets.length === 0 && (
          <div className="text-center text-xs text-gray-500 py-10">
            No budgets yet. Use "New Budget" to start planning.
          </div>
        )}

        {budgets.map((b) => (
          <div
            key={b.id}
            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl"
          >
            <div>
              <Paragraph1 className="text-sm font-semibold text-gray-900">
                {b.name}
              </Paragraph1>
              <Paragraph1 className="text-[11px] text-gray-500">
                {b.period} •
                {b.start_date && b.end_date
                  ? ` ${format(new Date(b.start_date), "d MMM")} - ${format(
                      new Date(b.end_date),
                      "d MMM",
                    )}`
                  : " ongoing"}
              </Paragraph1>
            </div>
            <Paragraph1 className="text-sm font-bold text-gray-900">
              ₦{b.total_amount.toLocaleString()}
            </Paragraph1>
          </div>
        ))}
      </section>
    </main>
  );
};

export default BudgetsPage;
