"use client";

import React, { useEffect, useState } from "react";
import RecentTransactions, { Transaction } from "./RecentTransactions";
import { supabase } from "@/util/supabase/client";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

const TransactionsDemo = () => {
  const [items, setItems] = useState<Transaction[]>([]);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData.user) return;

      const { data, error } = await supabase
        .from("Transaction")
        .select("id, amount, type, date")
        .eq("user_id", userData.user.id)
        .order("date", { ascending: false })
        .limit(5);

      if (error || !data) return;

      const mapped: Transaction[] = (data as any[]).map((tx) => ({
        id: tx.id,
        title: tx.type === "income" ? "Income" : "Expense",
        date: format(new Date(tx.date), "MMM d"),
        amount: Number(tx.amount) || 0,
        type: tx.type,
        // Map into one of the known categories just for icon styling
        category: tx.type === "income" ? "bonus" : "certificate",
      }));

      setItems(mapped);
    };

    load();
  }, []);

  return (
    <RecentTransactions
      transactions={items}
      onViewAll={() => router.push("/transactions")}
    />
  );
};

export default TransactionsDemo;
