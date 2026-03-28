"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Formik, Form, Field } from "formik";
import { supabase } from "@/util/supabase/client";
import { Paragraph1 } from "@/common/ui/Text";
import { format } from "date-fns";
import CategoryDropdown from "./CategoryDropdown";
import AccountDropdown from "./AccountDropdown";
import { incomeCategories } from "@/data/categories";
import { Wallet } from "lucide-react";

interface Account {
  id: string;
  name: string;
  balance: number;
}

interface Category {
  id: string;
  name: string;
}

interface IncomeFormValues {
  amount: number;
  categoryId: string;
  accountId: string;
  date: string;
  notes: string;
  photoUrl: string;
}

export default function AddIncomeForm() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
    fetchCategories();
  }, []);

  const fetchAccounts = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error(userError);
      return;
    }
    const { data, error } = await supabase
      .from("Account")
      .select("*")
      .eq("user_id", userData?.user?.id);
    console.log("Fetched accounts:", data);

    if (error) console.error(error);
    else setAccounts(data as Account[]);
  };

  const fetchCategories = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      console.error(userError);
      return;
    }

    const userId = userData.user.id;

    let { data, error } = await supabase
      .from("Category")
      .select("id, name")
      .eq("kind", "income")
      .eq("user_id", userId);

    if (error) {
      console.error(error);
      return;
    }

    let existing = (data ?? []) as Category[];

    const existingNames = new Set(existing.map((c) => c.name.toLowerCase()));

    const missingDefaults = incomeCategories.filter(
      (def) => !existingNames.has(def.name.toLowerCase()),
    );

    if (missingDefaults.length > 0) {
      const now = new Date().toISOString();

      const seedRows = missingDefaults.map((cat) => ({
        user_id: userId,
        kind: "income",
        name: cat.name,
        icon_key: cat.name,
        updated_at: now,
      }));

      const { error: seedError } = await supabase
        .from("Category")
        .insert(seedRows);

      if (seedError) {
        console.error(seedError);
      } else {
        const { data: refreshed, error: refreshError } = await supabase
          .from("Category")
          .select("id, name")
          .eq("kind", "income")
          .eq("user_id", userId);

        if (!refreshError && refreshed) {
          existing = refreshed as Category[];
        }
      }
    }

    setCategories(existing);
  };

  const initialValues: IncomeFormValues = {
    amount: 0,
    categoryId: "",
    accountId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    notes: "",
    photoUrl: "",
  };

  const categoryOptions = useMemo(() => {
    return categories.map((cat) => {
      const meta = incomeCategories.find((c) => c.name === cat.name);
      return {
        id: cat.id,
        name: cat.name,
        icon: meta ? <meta.icon className="w-5 h-5 text-gray-700" /> : null,
        color: "bg-gray-100",
      };
    });
  }, [categories]);

  const accountOptions = useMemo(
    () =>
      accounts.map((acc) => ({
        id: acc.id,
        name: `${acc.name} (Balance: ₦${acc.balance.toLocaleString()})`,
        icon: <Wallet className="w-5 h-5 text-gray-700" />,
      })),
    [accounts],
  );

  const handleSubmit = async (values: IncomeFormValues) => {
    if (!values.accountId || !values.categoryId)
      return alert("Select account and category!");
    setLoading(true);

    try {
      const account = accounts.find(
        (a) => a.id.toString() === values.accountId,
      );
      if (!account) throw new Error("Account not found");

      // Credit account balance
      const newBalance = account.balance + values.amount;
      await supabase
        .from("Account")
        .update({ balance: newBalance })
        .eq("id", account.id);

      // Record transaction
      const { data: userData } = await supabase.auth.getUser();
      await supabase.from("Transaction").insert([
        {
          user_id: userData?.user?.id,
          account_id: account.id,
          category_id: values.categoryId,
          type: "income", // <-- here is income
          amount: values.amount,
          date: values.date,
          notes: values.notes,
          photo_url: values.photoUrl,
        },
      ]);

      alert("Income recorded successfully!");
      fetchAccounts();
    } catch (err) {
      console.error(err);
      alert("Failed to record income");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {({ values, setFieldValue }) => (
          <>
            <Form className="space-y-4">
              <div>
                <Paragraph1 className="block mb-1">Amount</Paragraph1>
                <Field
                  type="number"
                  name="amount"
                  className="w-full border p-2 rounded-xl border-gray-200"
                />
              </div>

              <div>
                <Paragraph1 className="block mb-1">Category</Paragraph1>
                <CategoryDropdown
                  selected={
                    categoryOptions.find((c) => c.id === values.categoryId) ||
                    null
                  }
                  categories={categoryOptions}
                  onSelect={(cat) => {
                    setFieldValue("categoryId", cat.id);
                  }}
                />
              </div>

              <div>
                <Paragraph1 className="block mb-1">Account</Paragraph1>
                <AccountDropdown
                  selected={
                    accountOptions.find((a) => a.id === values.accountId) ||
                    null
                  }
                  accounts={accountOptions}
                  onSelect={(acc) => {
                    setFieldValue("accountId", acc.id);
                  }}
                />
              </div>

              <div>
                <Paragraph1 className="block mb-1">Date</Paragraph1>
                <Field
                  type="date"
                  name="date"
                  className="w-full border p-2 rounded-xl border-gray-200"
                />
              </div>

              <div>
                <Paragraph1 className="block mb-1">Notes</Paragraph1>
                <Field
                  as="textarea"
                  name="notes"
                  className="w-full border p-2 rounded-xl border-gray-200"
                />
              </div>

              <div>
                <Paragraph1 className="block mb-1">Attach Photo URL</Paragraph1>
                <Field
                  type="text"
                  name="photoUrl"
                  placeholder="https://..."
                  className="w-full border p-2 rounded-xl border-gray-200"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white p-2 rounded"
                disabled={loading}
              >
                {loading ? "Saving..." : "Add Income"}
              </button>
            </Form>
          </>
        )}
      </Formik>
    </div>
  );
}
