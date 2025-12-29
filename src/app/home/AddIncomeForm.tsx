"use client";

import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import { supabase } from "@/util/supabase/client";
import { incomeCategories } from "@/data/categories";
import { Paragraph1 } from "@/common/ui/Text";
import { format } from "date-fns";

interface Account {
  id: string;
  name: string;
  balance: number;
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error(userError);
      return;
    }
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", userData?.user?.id);
    console.log("Fetched accounts:", data);

    if (error) console.error(error);
    else setAccounts(data as Account[]);
  };

  const initialValues: IncomeFormValues = {
    amount: 0,
    categoryId: "",
    accountId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    notes: "",
    photoUrl: "",
  };

  const handleSubmit = async (values: IncomeFormValues) => {
    if (!values.accountId || !values.categoryId)
      return alert("Select account and category!");
    setLoading(true);

    try {
const account = accounts.find((a) => a.id.toString() === values.accountId);
      if (!account) throw new Error("Account not found");

      // Credit account balance
      const newBalance = account.balance + values.amount;
      await supabase
        .from("accounts")
        .update({ balance: newBalance })
        .eq("id", account.id);

      // Record transaction
      const { data: userData } = await supabase.auth.getUser();
      await supabase.from("transactions").insert([
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
        {({ values, handleChange }) => (
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
              <Field
                as="select"
                name="categoryId"
                className="w-full border p-2 rounded-xl border-gray-200"
              >
                <option value="">Select Category</option>
                {incomeCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Field>
            </div>

            <div>
              <Paragraph1 className="block mb-1">Account</Paragraph1>
              <Field
                as="select"
                name="accountId"
                className="w-full border p-2 rounded-xl border-gray-200"
              >
                <option value="">Select Account</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (Balance: ${acc.balance})
                  </option>
                ))}
              </Field>
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
        )}
      </Formik>
    </div>
  );
}
