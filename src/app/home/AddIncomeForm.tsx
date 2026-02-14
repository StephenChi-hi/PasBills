"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Formik, Form, Field } from "formik";
import { supabase } from "@/util/supabase/client";
import { Paragraph1 } from "@/common/ui/Text";
import { format } from "date-fns";
import CategoryModal from "./CategoryModal";
import SelectionModal from "./SelectionModal";
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
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

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
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="w-full border p-3 rounded-xl border-gray-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {(() => {
                      const selected = categoryOptions.find(
                        (c) => c.id === values.categoryId,
                      );
                      if (selected) {
                        return (
                          <>
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                              {selected.icon}
                            </div>
                            <Paragraph1 className="text-sm font-medium">
                              {selected.name}
                            </Paragraph1>
                          </>
                        );
                      }
                      return (
                        <Paragraph1 className="text-sm text-gray-400">
                          Select Category
                        </Paragraph1>
                      );
                    })()}
                  </div>
                </button>
              </div>

              <div>
                <Paragraph1 className="block mb-1">Account</Paragraph1>
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(true)}
                  className="w-full border p-3 rounded-xl border-gray-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {(() => {
                      const selected = accountOptions.find(
                        (a) => a.id === values.accountId,
                      );
                      if (selected) {
                        return (
                          <>
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                              {selected.icon}
                            </div>
                            <Paragraph1 className="text-sm font-medium">
                              {selected.name}
                            </Paragraph1>
                          </>
                        );
                      }
                      return (
                        <Paragraph1 className="text-sm text-gray-400">
                          Select Account
                        </Paragraph1>
                      );
                    })()}
                  </div>
                </button>
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

            <CategoryModal
              isOpen={isCategoryModalOpen}
              onClose={() => setIsCategoryModalOpen(false)}
              allCategories={categoryOptions}
              recentCategories={categoryOptions.slice(0, 6)}
              onSelect={(cat) => {
                setFieldValue("categoryId", cat.id);
              }}
              onCreateNew={async (name) => {
                const { data: userData, error: userError } =
                  await supabase.auth.getUser();
                if (userError || !userData?.user) {
                  console.error(userError);
                  return;
                }

                const userId = userData.user.id;
                const now = new Date().toISOString();

                const { data, error } = await supabase
                  .from("Category")
                  .insert({
                    user_id: userId,
                    kind: "income",
                    name,
                    icon_key: name,
                    updated_at: now,
                  })
                  .select("id, name")
                  .single();

                if (error || !data) {
                  console.error(error);
                  return;
                }

                await fetchCategories();
                setFieldValue("categoryId", data.id);
              }}
            />

            <SelectionModal
              title="Select Account"
              isOpen={isAccountModalOpen}
              onClose={() => setIsAccountModalOpen(false)}
              options={accountOptions}
              onSelect={(option) => {
                setFieldValue("accountId", option.id);
              }}
            />
          </>
        )}
      </Formik>
    </div>
  );
}
