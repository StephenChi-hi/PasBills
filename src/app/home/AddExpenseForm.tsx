"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Formik, Form, Field } from "formik";
import { supabase } from "@/util/supabase/client";

import { Paragraph1 } from "@/common/ui/Text";
import { format } from "date-fns";
import CategoryDropdown from "./CategoryDropdown";
import AccountDropdown from "./AccountDropdown";
import { expenseCategories } from "@/data/categories";
import { getIconById } from "@/data/icons";
import { Wallet } from "lucide-react";

interface Account {
  id: string;
  name: string;
  balance: number;
}

interface Category {
  id: string;
  name: string;
  icon_key?: string;
}

interface ExpenseFormValues {
  amount: number;
  categoryId: string;
  accountId: string;
  date: string;
  notes: string;
  photoUrl: string;
}

export default function AddExpenseForm() {
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
      .select("id, name, icon_key")
      .eq("kind", "expense")
      .eq("user_id", userId);

    if (error) {
      console.error(error);
      return;
    }

    let existing = (data ?? []) as Category[];

    const existingNames = new Set(existing.map((c) => c.name.toLowerCase()));

    const missingDefaults = expenseCategories.filter(
      (def) => !existingNames.has(def.name.toLowerCase()),
    );

    if (missingDefaults.length > 0) {
      const now = new Date().toISOString();

      // Map category names to icon IDs for consistency
      const iconIdMap: { [key: string]: string } = {
        "Food & Drinks": "icon_3", // Coffee
        Groceries: "icon_2", // Shopping Cart
        "Dining Out": "icon_4", // Utensils
        Shopping: "icon_2", // Shopping Cart
        Transport: "icon_5", // Car
        Fuel: "icon_6", // Fuel
        "Housing / Rent": "icon_7", // Home
        "Home Utilities": "icon_8", // Zap
        "Internet & Phone": "icon_9", // Smartphone
        Subscriptions: "icon_10", // Subscription
        "Health & Medical": "icon_11", // Heart
        "Gifts & Donations": "icon_12", // Gift
        Education: "icon_13", // Book
        "Kids & Childcare": "icon_14", // Baby
        "Personal Care & Beauty": "icon_15", // Palette
        Entertainment: "icon_16", // Music
        "Movies & Shows": "icon_17", // Film
        Travel: "icon_18", // Plane
        "Car Maintenance": "icon_19", // Wrench
        "Parking & Tolls": "icon_20", // Parking
        Insurance: "icon_21", // Shield
        "Credit Card Payment": "icon_22", // Credit Card
        "Loan Repayment": "icon_22", // Credit Card
        "Business Expenses": "icon_24", // Briefcase
        "Office & Work": "icon_24", // Briefcase
        Pets: "icon_26", // Pet
        "Gym & Fitness": "icon_27", // Fitness
        "Streaming Services": "icon_17", // Film
        "Market & Foodstuff": "icon_2", // Shopping Cart
        Miscellaneous: "icon_30", // More
      };

      const seedRows = missingDefaults.map((cat) => ({
        user_id: userId,
        kind: "expense",
        name: cat.name,
        icon_key: iconIdMap[cat.name] || "icon_30",
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
          .select("id, name, icon_key")
          .eq("kind", "expense")
          .eq("user_id", userId);

        if (!refreshError && refreshed) {
          existing = refreshed as Category[];
        }
      }
    }

    setCategories(existing);
  };

  const initialValues: ExpenseFormValues = {
    amount: 0,
    categoryId: "",
    accountId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    notes: "",
    photoUrl: "",
  };

  const categoryOptions = useMemo(() => {
    return categories.map((cat) => {
      const iconId = cat.icon_key || "icon_30";
      const iconOption = getIconById(iconId);
      return {
        id: cat.id,
        name: cat.name,
        icon: iconOption ? (
          <iconOption.icon className="w-5 h-5 text-gray-700" />
        ) : null,
        color: iconOption?.color || "bg-gray-100",
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

  const handleSubmit = async (values: ExpenseFormValues) => {
    if (!values.accountId || !values.categoryId)
      return alert("Select account and category!");
    setLoading(true);

    try {
      const account = accounts.find(
        (a) => a.id.toString() === values.accountId,
      );
      if (!account) throw new Error("Account not found");

      // Debit account balance
      const newBalance = account.balance - values.amount;
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
          type: "expense",
          amount: values.amount,
          date: values.date,
          notes: values.notes,
          photo_url: values.photoUrl,
        },
      ]);

      alert("Expense recorded successfully!");
      fetchAccounts();
    } catch (err) {
      console.error(err);
      alert("Failed to record expense");
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
                  className="w-full  border p-2 rounded-xl border-gray-200"
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
                  className="w-full  border p-2 rounded-xl border-gray-200"
                />
              </div>

              <div>
                <Paragraph1 className="block mb-1">Notes</Paragraph1>
                <Field
                  as="textarea"
                  name="notes"
                  className="w-full  border p-2 rounded-xl border-gray-200"
                />
              </div>

              <div>
                <Paragraph1 className="block mb-1">Attach Photo URL</Paragraph1>
                <Field
                  type="text"
                  name="photoUrl"
                  placeholder="https://..."
                  className="w-full  border p-2 rounded-xl border-gray-200"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white p-2 rounded"
                disabled={loading}
              >
                {loading ? "Saving..." : "Add Expense"}
              </button>
            </Form>
          </>
        )}
      </Formik>
    </div>
  );
}
