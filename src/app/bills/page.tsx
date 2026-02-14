"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/util/supabase/client";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import { format } from "date-fns";
import {
  Plus,
  CalendarClock,
  Repeat,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface Bill {
  id: string;
  name: string;
  amount: number;
  due_date: string;
  frequency: string;
  status: string;
}

const BillsPage: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) return;

    const { data, error } = await supabase
      .from("Bill")
      .select("id, name, amount, due_date, frequency, status")
      .eq("user_id", userData.user.id)
      .order("next_due_date", { ascending: true });

    if (!error && data) setBills(data as unknown as Bill[]);
  };

  const totalUpcoming = bills
    .filter((b) => b.status !== "paid")
    .reduce((sum, b) => sum + (b.amount || 0), 0);

  return (
    <main className="w-full py-6 space-y-6">
      <section className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <Paragraph1 className="text-xs text-gray-500 mb-1">
            Upcoming Bills
          </Paragraph1>
          <Paragraph2 className="text-2xl font-bold text-gray-900">
            ₦{totalUpcoming.toLocaleString()}
          </Paragraph2>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold">
          <Plus className="w-4 h-4" />
          Add Bill
        </button>
      </section>

      <section className="space-y-3">
        {bills.length === 0 && !loading && (
          <div className="text-center text-xs text-gray-500 py-10">
            No bills yet. Use "Add Bill" to set up recurring payments.
          </div>
        )}

        {bills.map((bill) => {
          const isPaid = bill.status === "paid";
          const isOverdue = bill.status === "overdue";

          return (
            <div
              key={bill.id}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  {bill.frequency === "once" ? (
                    <CalendarClock className="w-5 h-5 text-blue-500" />
                  ) : (
                    <Repeat className="w-5 h-5 text-blue-500" />
                  )}
                </div>
                <div>
                  <Paragraph1 className="text-sm font-semibold text-gray-900">
                    {bill.name}
                  </Paragraph1>
                  <Paragraph1 className="text-[11px] text-gray-500">
                    Due {format(new Date(bill.due_date), "d MMM, yyyy")} •{" "}
                    {bill.frequency}
                  </Paragraph1>
                </div>
              </div>

              <div className="text-right">
                <Paragraph1 className="text-sm font-bold text-gray-900 mb-1">
                  ₦{bill.amount.toLocaleString()}
                </Paragraph1>
                <div className="flex items-center justify-end gap-1 text-[11px]">
                  {isPaid && (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-600 font-semibold">
                        Paid
                      </span>
                    </>
                  )}
                  {isOverdue && (
                    <>
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <span className="text-red-500 font-semibold">
                        Overdue
                      </span>
                    </>
                  )}
                  {!isPaid && !isOverdue && (
                    <span className="text-orange-500 font-semibold">
                      Upcoming
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
};

export default BillsPage;
