"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/util/supabase/client";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";

interface TxRow {
  id: string;
  type: "income" | "expense" | "transfer";
  amount: number;
  date: string;
  notes: string | null;
}

const TransactionsPage: React.FC = () => {
  const [items, setItems] = useState<TxRow[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData.user) return;

      const { data, error } = await supabase
        .from("Transaction")
        .select("id, type, amount, date, notes")
        .eq("user_id", userData.user.id)
        .order("date", { ascending: false });

      if (error || !data) return;

      setItems(
        (data as any[]).map((t) => ({
          id: t.id,
          type: t.type,
          amount: Number(t.amount) || 0,
          date: t.date,
          notes: t.notes ?? null,
        })),
      );
    };

    load();
  }, []);

  return (
    <main className="w-full py-6">
      <div className="mb-4 flex items-center justify-between">
        <Paragraph3 className="text-xl font-bold text-gray-900">
          All Transactions
        </Paragraph3>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-4">
        {items.length === 0 ? (
          <Paragraph1 className="text-sm text-gray-500">
            No transactions yet.
          </Paragraph1>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-3 text-sm"
              >
                <div>
                  <Paragraph1 className="font-semibold text-gray-900 capitalize">
                    {tx.type}
                  </Paragraph1>
                  <Paragraph1 className="text-xs text-gray-400">
                    {new Date(tx.date).toLocaleDateString()}
                  </Paragraph1>
                  {tx.notes && (
                    <Paragraph1 className="text-xs text-gray-500 mt-1">
                      {tx.notes}
                    </Paragraph1>
                  )}
                </div>
                <Paragraph1
                  className={`font-bold ${
                    tx.type === "income"
                      ? "text-emerald-600"
                      : tx.type === "expense"
                        ? "text-gray-900"
                        : "text-blue-600"
                  }`}
                >
                  {tx.type === "income"
                    ? "+ "
                    : tx.type === "expense"
                      ? "- "
                      : ""}
                  ₦{tx.amount.toLocaleString()}
                </Paragraph1>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default TransactionsPage;
