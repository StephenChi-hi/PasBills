"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Formik, Form, Field } from "formik";
import { supabase } from "@/util/supabase/client";
import { Paragraph1 } from "@/common/ui/Text";
import { format } from "date-fns";
import SelectionModal from "./SelectionModal";
import { Wallet } from "lucide-react";

interface Account {
  id: string;
  name: string;
}

interface BillFormValues {
  name: string;
  amount: number;
  accountId: string;
  dueDate: string;
  frequency: string;
}

const BillTab = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  useEffect(() => {
    fetchAccounts();
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

  const initialValues: BillFormValues = {
    name: "",
    amount: 0,
    accountId: "",
    dueDate: format(new Date(), "yyyy-MM-dd"),
    frequency: "monthly",
  };

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
    if (!values.name || !values.accountId)
      return alert("Fill all required fields");

    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      await supabase.from("Bill").insert([
        {
          user_id: userData.user.id,
          account_id: values.accountId,
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
                <Paragraph1 className="block mb-1">Pay from account</Paragraph1>
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(true)}
                  className="w-full border p-2 rounded-xl border-gray-200 text-sm flex items-center justify-between"
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
                          Select account
                        </Paragraph1>
                      );
                    })()}
                  </div>
                </button>
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

            <SelectionModal
              title="Select account"
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
};

export default BillTab;
