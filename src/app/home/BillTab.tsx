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
}

interface Category {
  id: string;
  name: string;
  icon_key?: string;
}

interface BillFormValues {
  name: string;
  amount: number;
  categoryId: string;
  accountId: string;
  dueDate: string;
  frequency: string;
}

const BillTab = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
    fetchCategories();
  }, []);

  const fetchAccounts = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) return;

    const { data, error } = await supabase
      .from("Account")
      .select("id, name")
      .eq("user_id", userData.user.id);

    if (!error && data) setAccounts(data as unknown as Account[]);
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

      const iconIdMap: { [key: string]: string } = {
        "Food & Drinks": "icon_3",
        Groceries: "icon_2",
        "Dining Out": "icon_4",
        Shopping: "icon_2",
        Transport: "icon_5",
        Fuel: "icon_6",
        "Housing / Rent": "icon_7",
        "Home Utilities": "icon_8",
        "Internet & Phone": "icon_9",
        Subscriptions: "icon_10",
        "Health & Medical": "icon_11",
        "Gifts & Donations": "icon_12",
        Education: "icon_13",
        "Kids & Childcare": "icon_14",
        "Personal Care & Beauty": "icon_15",
        Entertainment: "icon_16",
        "Movies & Shows": "icon_17",
        Travel: "icon_18",
        "Car Maintenance": "icon_19",
        "Parking & Tolls": "icon_20",
        Insurance: "icon_21",
        "Credit Card Payment": "icon_22",
        "Loan Repayment": "icon_22",
        "Business Expenses": "icon_24",
        "Office & Work": "icon_24",
        Pets: "icon_26",
        "Gym & Fitness": "icon_27",
        "Streaming Services": "icon_17",
        "Market & Foodstuff": "icon_2",
        Miscellaneous: "icon_30",
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

  const initialValues: BillFormValues = {
    name: "",
    amount: 0,
    categoryId: "",
    accountId: "",
    dueDate: format(new Date(), "yyyy-MM-dd"),
    frequency: "monthly",
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
        name: acc.name,
        icon: <Wallet className="w-5 h-5 text-gray-700" />,
      })),
    [accounts],
  );

  const handleSubmit = async (values: BillFormValues) => {
    if (!values.name || !values.accountId || !values.categoryId)
      return alert("Fill all required fields");

    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      await supabase.from("Bill").insert([
        {
          user_id: userData.user.id,
          account_id: values.accountId,
          category_id: values.categoryId,
          name: values.name,
          amount: values.amount,
          due_date: values.dueDate,
          frequency: values.frequency,
          is_recurring: values.frequency !== "once",
          status: "upcoming",
        },
      ]);

      alert("Bill saved");
    } catch (e) {
      console.error(e);
      alert("Failed to save bill");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {({ values, setFieldValue }) => (
          <>
            <Form className="space-y-4">
              <div>
                <Paragraph1 className="block mb-1">Bill name</Paragraph1>
                <Field
                  name="name"
                  className="w-full border p-2 rounded-xl border-gray-200 text-sm"
                  placeholder="e.g. Rent, Netflix"
                />
              </div>

              <div>
                <Paragraph1 className="block mb-1">Amount</Paragraph1>
                <Field
                  type="number"
                  name="amount"
                  className="w-full border p-2 rounded-xl border-gray-200 text-sm"
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
                <Paragraph1 className="block mb-1">Pay from account</Paragraph1>
                <AccountDropdown
                  selected={
                    accountOptions.find((a) => a.id === values.accountId) ||
                    null
                  }
                  accounts={accountOptions}
                  placeholder="Select account"
                  onSelect={(acc) => {
                    setFieldValue("accountId", acc.id);
                  }}
                />
              </div>

              <div>
                <Paragraph1 className="block mb-1">First due date</Paragraph1>
                <Field
                  type="date"
                  name="dueDate"
                  className="w-full border p-2 rounded-xl border-gray-200 text-sm"
                />
              </div>

              <div>
                <Paragraph1 className="block mb-1">Frequency</Paragraph1>
                <Field
                  as="select"
                  name="frequency"
                  className="w-full border p-2 rounded-xl border-gray-200 text-sm"
                >
                  <option value="once">Once</option>
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="yearly">Yearly</option>
                </Field>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white p-2 rounded-md text-sm font-semibold"
              >
                {loading ? "Saving..." : "Save Bill"}
              </button>
            </Form>
          </>
        )}
      </Formik>
    </div>
  );
};

export default BillTab;
