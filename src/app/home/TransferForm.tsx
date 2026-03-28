"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Formik, Form, Field } from "formik";
import { supabase } from "@/util/supabase/client";
import { Paragraph1 } from "@/common/ui/Text";
import { format } from "date-fns";
import AccountDropdown from "./AccountDropdown";
import { Wallet } from "lucide-react";

interface Account {
  id: string;
  name: string;
  balance: number;
}

interface TransferFormValues {
  amount: number;
  fromAccountId: string;
  toAccountId: string;
  date: string;
  notes: string;
  photoUrl: string;
}

export default function TransferForm() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) return console.error(userError);

    const { data, error } = await supabase
      .from("Account")
      .select("*")
      .eq("user_id", userData?.user?.id);
    if (error) console.error(error);
    else setAccounts(data as Account[]);
  };

  const initialValues: TransferFormValues = {
    amount: 0,
    fromAccountId: "",
    toAccountId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    notes: "",
    photoUrl: "",
  };

  const accountOptions = useMemo(
    () =>
      accounts.map((acc) => ({
        id: acc.id,
        name: `${acc.name} (Balance: ₦${acc.balance.toLocaleString()})`,
        icon: <Wallet className="w-5 h-5 text-gray-700" />,
      })),
    [accounts],
  );

  const handleSubmit = async (values: TransferFormValues) => {
    if (!values.fromAccountId || !values.toAccountId)
      return alert("Select both accounts!");
    if (values.fromAccountId === values.toAccountId)
      return alert("From and To accounts cannot be the same!");
    setLoading(true);

    try {
      const fromAccount = accounts.find(
        (a) => a.id.toString() === values.fromAccountId,
      );
      const toAccount = accounts.find(
        (a) => a.id.toString() === values.toAccountId,
      );
      if (!fromAccount || !toAccount) throw new Error("Account not found");

      // Debit from source
      await supabase
        .from("Account")
        .update({ balance: fromAccount.balance - values.amount })
        .eq("id", fromAccount.id);

      // Credit to destination
      await supabase
        .from("Account")
        .update({ balance: toAccount.balance + values.amount })
        .eq("id", toAccount.id);

      // Record transaction
      const { data: userData } = await supabase.auth.getUser();
      await supabase.from("Transaction").insert([
        {
          user_id: userData?.user?.id,
          account_id: fromAccount.id,
          transfer_to_account_id: toAccount.id,
          type: "transfer",
          amount: values.amount,
          date: values.date,
          notes: values.notes,
          photo_url: values.photoUrl,
        },
      ]);

      alert("Transfer recorded successfully!");
      fetchAccounts();
    } catch (err) {
      console.error(err);
      alert("Failed to record transfer");
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
                <Paragraph1 className="block mb-1">From Account</Paragraph1>
                <AccountDropdown
                  selected={
                    accountOptions.find((a) => a.id === values.fromAccountId) ||
                    null
                  }
                  accounts={accountOptions}
                  placeholder="Select Source Account"
                  onSelect={(acc) => {
                    setFieldValue("fromAccountId", acc.id);
                  }}
                />
              </div>

              <div>
                <Paragraph1 className="block mb-1">To Account</Paragraph1>
                <AccountDropdown
                  selected={
                    accountOptions.find((a) => a.id === values.toAccountId) ||
                    null
                  }
                  accounts={accountOptions}
                  placeholder="Select Destination Account"
                  onSelect={(acc) => {
                    setFieldValue("toAccountId", acc.id);
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
                className="w-full bg-purple-600 text-white p-2 rounded"
                disabled={loading}
              >
                {loading ? "Saving..." : "Add Transfer"}
              </button>
            </Form>
          </>
        )}
      </Formik>
    </div>
  );
}
